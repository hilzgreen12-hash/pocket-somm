// Intelligent cellar-document import.
//
// Merchant / broker / cellar-app exports are wildly inconsistent: the count can
// mean cases or bottles, the pack can be "6x75cl" / "Case, 6 Bottles" / a plain
// "Quantity in Bottles" column, headers aren't always the first row, names come
// as one long description, and a single workbook can hold several unrelated
// lists. Rather than hand-code rules per format, we hand ONE already-decoded
// list (clean rows, encoding fixed on the client) to Claude and get back
// normalized wines with the case structure preserved.

import Anthropic from 'npm:@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

const SYSTEM = `You are a meticulous wine-cellar data extractor. You are given the raw rows of ONE cellar/merchant/broker list (tab-separated, one row per line, exactly as exported). Extract every real wine holding as structured JSON.

The lists vary enormously — read them intelligently:
- The header row is often NOT the first line (there may be titles, addresses, account numbers, or blank rows above it). Find the real column headings.
- Ignore rows that are not wine holdings: titles, section labels ("Bordeaux", "Red wines"), addresses, account details, totals/subtotals, and blank rows.
- A single value may be a description that embeds the format, e.g. "Château Providence, Pomerol, 2008, 6x75cl".

QUANTITY — the crux. Work out how many INDIVIDUAL BOTTLES each holding is:
- If a column gives bottles directly (e.g. "Quantity in Bottles", "Btls."), use it as bottles.
- If the count refers to CASES/UNITS and a pack is given ("6x75cl", "12X75cl", "Case, 6 Bottles", a "Case Size" of 6), then totalBottles = cases × bottlesPerCase.
- Some rows give BOTH cases and loose bottles (e.g. a "Cs." column AND a "Btls." column): totalBottles = cases × bottlesPerCase + looseBottles.
- Formats: "6x75cl" = 6 bottles of 750ml; "12x75cl" = 12 × 750ml; "1x150cl" = 1 × 1500ml (magnum); "24x37.5cl" = 24 × 375ml; "6x150cl" = 6 × 1500ml. cl→ml is ×10. "75 cl" = 750ml. Treat X/x the same.

PACKAGING — preserve the case structure:
- "owc" for a complete/original case of a single wine (the default when a wine is held as full cases).
- "non_owc" only if explicitly a non-OWC / loose-lidded case.
- "mixed" if explicitly a mixed case.
- "loose" if the holding is loose bottles with no case.

For each wine return these keys (use null when unknown, never invent data):
- producer: the maker/estate (split from the description when you can, e.g. "Château Ducru-Beaucaillou").
- wineName: the specific cuvée/bottling if distinct from the producer, else null.
- vintage: 4-digit string, or "NV", or null.
- region, country: when derivable from the row (e.g. "Pauillac, Bordeaux" / "France"); else null.
- colour: one of "Red","White","Rosé","Sparkling","Fortified" or null.
- bottleSizeMl: integer ml PER BOTTLE (750, 1500, 375, …).
- totalBottles: integer, the total individual bottles (computed as above).
- packaging: "owc" | "non_owc" | "mixed" | "loose".
- bottlesPerCase: integer bottles in one case, or null if loose.
- cases: integer number of full cases, or null if loose.
- looseBottles: integer loose bottles beyond full cases, or null/0.
- drinkingWindowFrom, drinkingWindowTo: 4-digit year strings, or null (parse "2016 - 2025", "Ready 2025 - 2032", etc.).
- purchasePricePerBottle: number in the row's currency, or null (if the price is per case, divide by bottlesPerCase).
- currency: 3-letter code if determinable (GBP/USD/EUR…), else null.
- notes: a tasting note from the row if present, else null.

Return ONLY a JSON object: {"wines": [ ... ]}. No markdown, no commentary.`;

Deno.serve(async (req) => {
  try {
    const { text, source } = await req.json().catch(() => ({}));
    const body = typeof text === 'string' ? text : '';
    if (!body.trim()) return json({ wines: [] }, 200);
    // Guard against a runaway payload — cap the characters we forward.
    const clipped = body.length > 120000 ? body.slice(0, 120000) : body;

    const resp = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: `Source hint: ${typeof source === 'string' && source ? source : 'unknown'}\n\nList rows:\n${clipped}`,
      }],
    });

    const raw = resp.content[0]?.type === 'text' ? resp.content[0].text : '';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return json({ wines: [] }, 200);

    let parsed: any;
    try { parsed = JSON.parse(match[0]); } catch { return json({ wines: [] }, 200); }
    const winesIn = Array.isArray(parsed?.wines) ? parsed.wines : [];

    // Normalise + sanity-clamp every field so the client can trust the shape.
    const wines = winesIn.map((w: any) => {
      const sizeNum = toInt(w?.bottleSizeMl);
      const bottleSizeMl = sizeNum && sizeNum >= 50 && sizeNum <= 30000 ? sizeNum : 750;
      const perCase = toInt(w?.bottlesPerCase);
      const cases = toInt(w?.cases);
      const loose = toInt(w?.looseBottles);
      let total = toInt(w?.totalBottles);
      // Recompute from the case parts when the model gave them but the total is
      // missing or inconsistent — the parts are the trustworthy signal.
      if (perCase && cases != null) {
        const computed = perCase * cases + (loose ?? 0);
        if (!total || total !== computed) total = computed;
      }
      if (!total || total < 1) total = 1;
      const pk = ['owc', 'non_owc', 'mixed', 'loose'].includes(w?.packaging) ? w.packaging : (perCase ? 'owc' : 'loose');
      return {
        producer: str(w?.producer),
        wineName: str(w?.wineName),
        vintage: str(w?.vintage),
        region: str(w?.region),
        country: str(w?.country),
        colour: ['Red', 'White', 'Rosé', 'Sparkling', 'Fortified'].includes(w?.colour) ? w.colour : null,
        bottleSizeMl,
        totalBottles: total,
        packaging: pk,
        bottlesPerCase: perCase ?? null,
        cases: cases ?? null,
        looseBottles: loose ?? null,
        drinkingWindowFrom: year(w?.drinkingWindowFrom),
        drinkingWindowTo: year(w?.drinkingWindowTo),
        purchasePricePerBottle: toNum(w?.purchasePricePerBottle),
        currency: typeof w?.currency === 'string' && /^[A-Za-z]{3}$/.test(w.currency) ? w.currency.toUpperCase() : null,
        notes: str(w?.notes),
      };
    }).filter((w: any) => w.producer || w.wineName);

    return json({ wines }, 200);
  } catch (err) {
    console.error('parse-cellar-import error:', err instanceof Error ? err.message : String(err));
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});

function str(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t : null;
}
function toInt(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseInt(String(v).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? Math.round(n) : null;
}
function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}
function year(v: unknown): string | null {
  const m = String(v ?? '').match(/\d{4}/);
  return m ? m[0] : null;
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } });
}
