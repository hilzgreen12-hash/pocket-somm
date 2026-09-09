import Anthropic from 'npm:@anthropic-ai/sdk';
import { checkRateLimit } from '../_shared/rateLimit.ts';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// A mood pick is a cheap, fast reasoning task — generous limits, mostly a guard
// against a stuck client looping.
const HOURLY_LIMIT = 60;
const DAILY_LIMIT = 300;

interface CmdWine {
  id: string;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  style?: string | null;
  criticScore?: number | null;
  drinkingWindowStatus?: string | null;
}

function wineLine(w: CmdWine, i: number): string {
  const bits = [w.producer, w.wineName, w.vintage].filter(Boolean).join(' ');
  const extra = [
    w.region ? w.region : null,
    w.style ? w.style : null,
    w.criticScore != null ? `score ${w.criticScore}` : null,
    w.drinkingWindowStatus ? `window: ${w.drinkingWindowStatus}` : null,
  ].filter(Boolean).join('; ');
  return `${i + 1}. [id: ${w.id}] ${bits}${extra ? ` (${extra})` : ''}`;
}

function buildPrompt(transcript: string, wines: CmdWine[]): string {
  const wineBlock = wines.length ? wines.map(wineLine).join('\n') : '(the cellar is empty)';
  return `You are a warm, knowledgeable sommelier helping someone choose a bottle from THEIR OWN cellar based on their mood tonight.

Their spoken mood / request: "${transcript}"

Their cellar (choose ONLY from these — use the exact ids):
${wineBlock}

Choose the THREE bottles from the list that best suit their mood tonight, ranked best-first. For each, write a warm, specific one-to-two sentence justification that ties THIS wine to what they described (weather, food, occasion, the style of wine they want). Do not invent wines or ids. If the cellar has fewer than three suitable wines, return as many as genuinely fit (1 or 2).

Return ONLY raw JSON, no markdown:
{"picks": [{"id": "<id from the list>", "rank": "<a short evocative label, e.g. 'Vinster's First Choice', 'Also Perfect', 'If You're Feeling Bold'>", "why": "<1-2 sentence justification tied to their mood>"}]}`;
}

Deno.serve(async (req) => {
  try {
    const limited = await checkRateLimit(req, 'cellar-recommend', HOURLY_LIMIT, DAILY_LIMIT);
    if (limited) return limited;

    const { transcript, wines } = await req.json();
    if (typeof transcript !== 'string' || !transcript.trim()) {
      return new Response(JSON.stringify({ error: 'transcript required' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = buildPrompt(transcript, (wines ?? []) as CmdWine[]);

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content.find((b) => b.type === 'text')?.text ?? '';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);

    const parsed = JSON.parse(match[0]);
    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('cellar-recommend error:', message);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
