import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { requireSignedIn } from '../_shared/auth.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// A voice command is a cheap, fast parse — generous limits, mostly a guard
// against a stuck client looping.
const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;
// The app sends a shortlist of likely wines (about 50), never a whole cellar.
// Older builds sent everything; past this many the rest is ignored, so a large
// imported cellar can't blow up the prompt.
const MAX_WINES = 300;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

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

function placesBlock(locations: CmdLocation[], units: CmdUnit[]): string {
  const locBlock = locations.length
    ? locations.map((l) => `- [id: ${l.id}] ${l.name}${l.isExternal ? ' (offsite)' : ''}`).join('\n')
    : '(none)';
  const unitBlock = units.length
    ? units.map((u) => `- [id: ${u.id}] ${u.name} (${u.type ?? 'rack'})`).join('\n')
    : '(none)';
  return `Their storage locations (Alt Cellars):
${locBlock}

Their placement units (racks, fridges, bins):
${unitBlock}`;
}

// The app works out the verb from the words before calling, so the model only
// resolves the specifics: which wine (from a shortlist of the user's own
// bottles), where, and how many. Keeping the verb out of the model's hands keeps
// this reliable. 'delete' arrives as 'archive' (same wine + count, no place).
function buildPrompt(action: string, transcript: string, wines: CmdWine[], locations: CmdLocation[], units: CmdUnit[]): string {
  if (action === 'add') {
    return `You read a spoken instruction to ADD new bottles to someone's wine cellar.

Their spoken words: "${transcript}"

${placesBlock(locations, units)}

The words come from phone speech-to-text, which often mangles producer, region and cuvée names — write them the way the wine trade spells them ("shato nerf do pap" → "Châteauneuf-du-Pape"). Extract the wine's identity and how many bottles ("six bottles", "a case of 12", "a bottle" = 1). If they named where the bottles go, match it to ONE place above: "locationId" for an Alt Cellar, or "unitId" for a rack / fridge / bin — never both.
Return JSON:
{"locationId": "<id or null>", "unitId": "<id or null>", "quantity": <integer or null>, "add": {"producer": "<or null>", "wineName": "<or null>", "vintage": "<year string or null>", "region": "<or null>"}, "needs": "wine" | null, "message": "<one short sentence, e.g. 'Add 6 bottles of Produttori del Barolo 2019 to the wine fridge.'>"}
Set needs to "wine" only if you cannot make out any wine name at all.

Return raw JSON only. No markdown, no explanation.`;
  }

  const wineBlock = wines.length ? wines.map(wineLine).join('\n') : '(no wines)';
  const common = `You resolve a spoken cellar command into a structured action.

The action: "${action}".
Their spoken words: "${transcript}"

The wines in their cellar that could be the one meant (a shortlist chosen by sound):
${wineBlock}

${placesBlock(locations, units)}

Match the spoken wine to ONE wine id from the list above. The words come from phone speech-to-text, which OFTEN MANGLES unfamiliar producer, region and cuvée names — so match PHONETICALLY, by how the words SOUND when read aloud, NOT by exact spelling. Examples of the kind of mangling to see through: "tallo bo" or "tolo boot" → "Tollot-Beaut"; "the produttori" → "Produttori del Barolo"; "gevray shamber tan" → "Gevrey-Chambertin"; "shato nerf do pap" → "Châteauneuf-du-Pape"; "veev cliko" → "Veuve Clicquot"; "kissler" → "Kistler". Use producer, wine name, region AND any spoken vintage year together to narrow it. Partial names are fine ("the Barolo", "the '20 Chablis"). Only put ids in "candidates" (needs "wine") when two or more wines are GENUINELY as close as each other by sound; only set needs "wine" with EMPTY candidates when nothing in the list is even remotely close.`;

  const task = action === 'move'
    ? `The wine being moved is one they already OWN — prefer the single closest-sounding match for "wineId" and make your best guess rather than giving up (the message lets them confirm).
Match the DESTINATION the user named to ONE place — either a storage location (Alt Cellar) OR a placement unit (rack / fridge / bin). Set "locationId" when it is a storage location, or "unitId" when it is a rack/fridge/bin — never both. A source they mention ("from the small rack") is context only; resolve the DESTINATION ("to my wine fridge"). If no destination clearly matches either list, set needs to "location".
Also parse how many bottles to move from the words ("3 bottles", "a bottle", "all of them") — null means all bottles of that wine.
Return JSON:
{"wineId": "<id or null>", "locationId": "<id or null>", "unitId": "<id or null>", "quantity": <integer or null>, "candidates": ["<id>", ...], "needs": "wine" | "location" | null, "message": "<one short sentence describing what you understood, e.g. 'Move 3 bottles of Château d'Yquem to your wine fridge.'>"}`
    : `The bottles are leaving the cellar (the user archived, drank, opened or removed them), so the wine is one they already OWN — PREFER the single closest-sounding match and make your best guess rather than giving up (the message you return lets them confirm before anything happens). Parse how many bottles from the words ("two bottles", "a bottle", "all of them"). Use null to mean all bottles of that wine.
Return JSON:
{"wineId": "<id or null>", "quantity": <integer or null>, "candidates": ["<id>", ...], "needs": "wine" | null, "message": "<one short sentence, e.g. 'Archive 2 bottles of Chablis 2021.'>"}`;

  return `${common}\n\n${task}\n\nReturn raw JSON only. No markdown, no explanation.`;
}

Deno.serve(async (req) => {
  try {
    // Quick Command changes a cellar, so it needs an account.
    const auth = await requireSignedIn(req);
    if (auth instanceof Response) return auth;

    const limited = await checkRateLimit(auth.userId, 'cellar-command', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { action, transcript, wines, locations, units } = await req.json();

    if (typeof transcript !== 'string' || !transcript.trim()) return json({ error: 'transcript required' }, 400);
    if (action !== 'move' && action !== 'archive' && action !== 'add') return json({ error: 'invalid action' }, 400);

    const list: CmdWine[] = Array.isArray(wines) ? wines.slice(0, MAX_WINES) : [];
    const prompt = buildPrompt(action, transcript, list, locations ?? [], units ?? []);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    return json({ action, ...JSON.parse(match[0]) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('cellar-command error:', message);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
