import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// "Dive Deeper" wine knowledge — four short, elegant profiles (producer,
// region, vintage, grape) for a single wine. Distinct from wine-intelligence
// (scores / value / drinking window): this is editorial background prose.
Deno.serve(async (req) => {
  try {
    const { producer, region, wineName, vintage, grape } = await req.json();

    const vintageStr = !vintage || vintage === 'NV' ? 'Non-Vintage' : vintage;
    const grapeStr = grape ? `\n- Grape(s): ${grape}` : '';

    const prompt = `You are a Master Sommelier and wine educator with deep, accurate knowledge of producers, regions, vintages, and grape varieties.

Provide background knowledge on this wine:
- Producer: ${producer}
- Region: ${region}
- Wine Name: ${wineName || producer}
- Vintage: ${vintageStr}${grapeStr}

Return ONLY a valid JSON object with exactly this structure:
{
  "producerProfile": <2-4 elegant, informative sentences on the producer: their history, philosophy, reputation and signature style. CRITICAL: only state the producer's SCALE or production size (e.g. "small artisanal grower", "large négociant", "boutique estate") when you are genuinely confident it is accurate. If you are not sure of their size, describe their style and reputation WITHOUT guessing scale. Never invent facts, awards, or figures.>,
  "regionProfile": <2-4 sentences on the region/appellation: where it is, its climate and soils, and the characteristic style of wines made there that makes them distinctive.>,
  "vintageProfile": <2-4 sentences on this vintage in THIS region specifically: growing-season conditions and the overall character/quality of the wines. If you are not confident about this exact vintage in this region, speak more generally about how vintage variation affects the region and note that specific data for this vintage is limited — do NOT fabricate weather or quality claims.>,
  "grapeProfile": <2-4 sentences on the grape variety or blend: its typical flavours, aromatics and structure, and how it tends to express itself in this region.>
}

Write in an elegant, knowledgeable sommelier voice. Be accurate and honest; it is far better to stay general than to invent specifics. Return only the raw JSON — no markdown, no explanation.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.type === 'text' ? response.content[0].text : '';
    const match = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim().match(/\{[\s\S]*\}/);
    if (!match) throw new Error(`No JSON found: ${text.slice(0, 200)}`);
    const parsed = JSON.parse(match[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('wine-knowledge error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
});
