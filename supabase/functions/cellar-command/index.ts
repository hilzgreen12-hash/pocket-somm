import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// A voice command is a cheap, fast parse — generous limits, mostly a guard
// against a stuck client looping.
const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

interface CmdWine {
  id: string;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  quantity?: number | null;
  storageLocationName?: string | null;
}
interface CmdLocation { id: string; name: string; isExternal?: boolean }
// Racks, fridges and bins — the placement units a bottle can be moved into
// (all wine_racks rows). Distinct from Alt Cellars (CmdLocation).
interface CmdUnit { id: string; name: string; type?: string }

function wineLine(w: CmdWine, i: number): string {
  const bits = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ');
  const extra = [
    w.region ? `region: ${w.region}` : null,
    w.quantity != null ? `${w.quantity} in cellar` : null,
    w.storageLocationName ? `currently in: ${w.storageLocationName}` : null,
  ].filter(Boolean).join('; ');
  return `${i + 1}. [id: ${w.id}] ${bits}${extra ? ` (${extra})` : ''}`;
}

// The action is chosen by the user in the app BEFORE dictating, so we only ask
// the model to resolve the specifics (which wine / where / how many) against the
// real cellar. Keeping the verb out of the model's hands makes this reliable.
function buildPrompt(action: string, transcript: string, wines: CmdWine[], locations: CmdLocation[], units: CmdUnit[]): string {
  const wineBlock = wines.length
    ? wines.map(wineLine).join('\n')
    : '(the cellar is empty)';
  const locBlock = locations.length
    ? locations.map((l) => `- [id: ${l.id}] ${l.name}${l.isExternal ? ' (offsite)' : ''}`).join('\n')
    : '(none)';
  const unitBlock = units.length
    ? units.map((u) => `- [id: ${u.id}] ${u.name} (${u.type ?? 'rack'})`).join('\n')
    : '(none)';

  const common = `You resolve a spoken cellar command into a structured action.

The user has already chosen the action: "${action}".
Their spoken words: "${transcript}"

Their cellar wines:
${wineBlock}

Their storage locations (Alt Cellars):
${locBlock}

Their placement units (racks, fridges, bins):
${unitBlock}

Match the spoken wine to ONE wine id from the list above. The words come from phone speech-to-text, which OFTEN MANGLES unfamiliar producer, region and cuvée names — so match PHONETICALLY, by how the words SOUND when read aloud, NOT by exact spelling. Examples of the kind of mangling to see through: "tallo bo" or "tolo boot" → "Tollot-Beaut"; "the produttori" → "Produttori del Barolo"; "gevray shamber tan" → "Gevrey-Chambertin"; "shato nerf do pap" → "Châteauneuf-du-Pape"; "veev cliko" → "Veuve Clicquot"; "kissler" → "Kistler". Use producer, wine name, region AND any spoken vintage year together to narrow it. Partial names are fine ("the Barolo", "the '20 Chablis"). Only put ids in "candidates" (needs "wine") when two or more wines are GENUINELY as close as each other by sound; only set needs "wine" with EMPTY candidates when the cellar is empty or nothing is even remotely close.`;

  let task = '';
  if (action === 'move') {
    task = `The wine being moved is one they already OWN, so it IS in the list above — prefer the single closest-sounding match for "wineId" and make your best guess rather than giving up (the message lets them confirm).
Match the DESTINATION the user named to ONE place — either a storage location (Alt Cellar) OR a placement unit (rack / fridge / bin). Set "locationId" when it is a storage location, or "unitId" when it is a rack/fridge/bin — never both. A source they mention ("from the small rack") is context only; resolve the DESTINATION ("to my wine fridge"). If no destination clearly matches either list, set needs to "location".
Also parse how many bottles to move from the words ("3 bottles", "a bottle", "all of them") — null means all bottles of that wine.
Return JSON:
{"wineId": "<id or null>", "locationId": "<id or null>", "unitId": "<id or null>", "quantity": <integer or null>, "add": null, "candidates": ["<id>", ...], "needs": "wine" | "location" | null, "message": "<one short sentence describing what you understood, e.g. 'Move 3 bottles of Château d'Yquem to your wine fridge.'>"}`;
  } else if (action === 'archive') {
    task = `The user has chosen to ARCHIVE a wine they already OWN, so the wine IS in the list above — PREFER the single closest-sounding match and make your best guess rather than giving up (the message you return lets them confirm before anything happens). Parse how many bottles to archive from the words ("two bottles", "a bottle", "all of them"). Use null to mean all bottles of that wine.
Return JSON:
{"wineId": "<id or null>", "locationId": null, "quantity": <integer or null>, "add": null, "candidates": ["<id>", ...], "needs": "wine" | null, "message": "<one short sentence, e.g. 'Archive 2 bottles of Chablis 2021.'>"}`;
  } else {
    // add
    task = `The wine is NEW (not necessarily in the cellar). Extract its identity and quantity from the words. Optionally match a destination storage location id if one was named.
Return JSON:
{"wineId": null, "locationId": "<id or null>", "quantity": <integer or null>, "add": {"producer": "<or null>", "wineName": "<or null>", "vintage": "<year string or null>", "region": "<or null>"}, "candidates": [], "needs": "wine" | null, "message": "<one short sentence, e.g. 'Add 6 bottles of Produttori del Barolo 2019.'>"}
Set needs to "wine" only if you cannot make out any wine name at all.`;
  }

  return `${common}\n\n${task}\n\nReturn raw JSON only. No markdown, no explanation.`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'cellar-command', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { action, transcript, wines, locations, units } = await req.json();

    if (typeof transcript !== 'string' || !transcript.trim()) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }
    if (action !== 'move' && action !== 'archive' && action !== 'add') {
      return new Response(JSON.stringify({ error: 'invalid action' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(action, transcript, wines ?? [], locations ?? [], units ?? []);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify({ action, ...parsed }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('cellar-command error:', message);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
