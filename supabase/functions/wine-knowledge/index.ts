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

Return ONLY a valid JSON object with exactly this structure. Alongside each prose profile is a compact "stats" object of specific facts for a stats bar — keep each stat to a few words, and use null for any single fact you are not genuinely confident about (a null is far better than a fabricated figure):
{
  "producerProfile": <2-4 elegant, informative sentences on the producer: their history, philosophy, reputation and signature style. CRITICAL: only state the producer's SCALE or production size when genuinely confident. If unsure of size, describe style and reputation WITHOUT guessing scale. Never invent facts, awards, or figures.>,
  "producerStats": {
    "founded": <the year (or approximate era, e.g. "circa 1980") the producer/estate was founded, as a short string; null if unknown>,
    "annualBottles": <a ROUNDED estimate of annual production in bottles, as a short string like "~120,000" or "Est. 500,000"; null if you have no reasonable basis>,
    "hectares": <a ROUNDED estimate of vineyard area under vine, as a short string like "~45 ha" or "Est. 200 ha"; null if unknown>
  },
  "regionProfile": <2-4 sentences on the region/appellation: where it is, its climate and soils, and the characteristic style of wines made there.>,
  "regionStats": {
    "climate": <climate type in 1-3 words, e.g. "Continental", "Maritime", "Warm Mediterranean"; null if unknown>,
    "soil": <dominant soil type(s) in a few words, e.g. "Limestone & clay", "Galestro schist"; null if unknown>,
    "altitude": <typical vineyard altitude range, e.g. "150-350m", "Up to 500m"; null if unknown>
  },
  "vintageProfile": <2-4 sentences on this vintage in THIS region specifically. If not confident about this exact vintage, speak generally and note data is limited — do NOT fabricate weather or quality claims.>,
  "vintageStats": {
    "comparableVintages": <two to four comparable vintage years for this region, comma-separated, e.g. "2010, 2016, 2019"; null if unsure>,
    "describedAs": <a two or three word summary of this vintage's character, e.g. "Structured & age-worthy", "Ripe and generous"; null if unsure>
  },
  "grapeProfile": <2-4 sentences on the grape variety or blend: typical flavours, aromatics, structure, and how it expresses in this region.>,
  "grapeStats": {
    "characteristics": <the grape's typical characteristics in a few words, e.g. "Bold, tannic, dark fruit"; null if unknown>,
    "grownIn": <the top three countries this grape is grown in, comma-separated, most significant first, e.g. "France, USA, Chile"; null if unknown>
  }
}

Write the prose in an elegant, knowledgeable sommelier voice. Be accurate and honest; it is far better to leave a stat null or stay general than to invent specifics. Return only the raw JSON — no markdown, no explanation.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1600,
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
    // Logged above with full detail. The client gets a generic message:
    // raw exception text can carry Anthropic SDK request/response detail or
    // echo back model output on a JSON parse failure.
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
