import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// Bulk grape-variety resolver. Given a list of wines (producer + name + region +
// vintage), returns the primary grape (or a short blend) for each, IN THE SAME
// ORDER. Used by the one-off backfill that fills grape on reviews imported with
// none (e.g. Vivino, which exports colour but not grape). Batching many wines
// per call keeps a whole-cellar backfill to a modest number of requests.
Deno.serve(async (req) => {
  try {
    const { wines } = await req.json();
    if (!Array.isArray(wines) || wines.length === 0) {
      return new Response(JSON.stringify({ grapes: [] }), { headers: { 'Content-Type': 'application/json' } });
    }
    // Hard cap per call so one request can't blow the token budget.
    const batch = wines.slice(0, 60);

    const lines = batch.map((w: any, i: number) => {
      const parts = [w?.producer, w?.wineName, w?.region, w?.vintage].map((p) => (p == null ? '' : String(p).trim())).filter(Boolean);
      return `${i + 1}. ${parts.join(' — ') || '(unknown wine)'}`;
    }).join('\n');

    const prompt = `You are a master sommelier. For EACH wine below, give its primary grape variety (or a short blend of the two or three dominant grapes, e.g. "Grenache/Syrah/Mourvèdre"). Use the appellation when it is effectively single-grape (Chablis/white Burgundy → Chardonnay; Sancerre/Pouilly-Fumé → Sauvignon Blanc; Barolo/Barbaresco → Nebbiolo; Brunello di Montalcino/Chianti → Sangiovese; Rioja red → Tempranillo; Rías Baixas → Albariño; Hermitage/Côte-Rôtie → Syrah; etc.). Use the canonical grape spelling (e.g. "Nero d'Avola", not "Nera d'Avola"). If you genuinely cannot determine the grape for a wine, use null for that entry — do NOT guess wildly.

Return ONLY a JSON array of exactly ${batch.length} items, in the SAME ORDER as the wines, each item a grape string or null. No other text, no markdown.

Wines:
${lines}

Example output for 3 wines: ["Nebbiolo", "Chardonnay", "Grenache/Syrah/Mourvèdre"]`;

    async function attempt(): Promise<(string | null)[]> {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      });
      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock?.type === 'text' ? textBlock.text : '';
      const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\[[\s\S]*\]/);
      if (!match) throw new Error(`No JSON array found: ${text.slice(0, 200)}`);
      const arr = JSON.parse(match[0]);
      if (!Array.isArray(arr)) throw new Error('Not an array');
      return arr.map((g: any) => (typeof g === 'string' && g.trim() ? g.trim() : null));
    }

    let grapes: (string | null)[] | null = null;
    let lastErr: unknown = null;
    for (let i = 1; i <= 2; i++) {
      try { grapes = await attempt(); break; }
      catch (e) { lastErr = e; console.error(`resolve-grapes attempt ${i} failed:`, e instanceof Error ? e.message : e); }
    }
    if (!grapes) throw lastErr ?? new Error('resolve-grapes: no result after retries');

    // Pad/trim so the returned length always matches the input batch length — the
    // client maps grapes[i] onto wines[i] and must never misalign.
    const out = batch.map((_: any, i: number) => grapes![i] ?? null);
    return new Response(JSON.stringify({ grapes: out }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('resolve-grapes error:', message);
    return new Response(JSON.stringify({ error: 'Could not resolve grapes.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
