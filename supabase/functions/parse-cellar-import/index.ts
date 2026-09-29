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

const SYSTEM = `You are a meticulous wine-cellar data extractor. You are given ONE cellar/merchant/broker list — EITHER the raw rows of a spreadsheet export (tab-separated, one row per line) OR a storage invoice / annual reserves statement as a PDF document. Extract every real wine holding as structured JSON.

The lists vary enormously — read them intelligently:
- The header row (or invoice column layout) is often NOT at the very top (there may be titles, logos, addresses, account numbers, or blank rows above it). Find the real columns.
- Ignore anything that isn't a wine holding: titles, section labels ("Bordeaux", "Red wines"), addresses, account details, subtotals/totals/VAT/carriage lines, page headers/footers, and blank rows.
- On an invoice/statement each line item is usually one holding; a value may embed the format, e.g. "Château Providence, Pomerol, 2008, 6x75cl".

QUANTITY — the crux. Work out how many INDIVIDUAL BOTTLES each holding is:
- If a column gives bottles directly (e.g. "Quantity in Bottles", "Btls.", or a plain "Quantity"/"Qty" that is not labelled as cases), use it AS BOTTLES — that IS totalBottles.
- CRITICAL — DO NOT DOUBLE-COUNT. A pack/format like "6x75cl" describes the BOTTLE SIZE and how a full case is composed; it is NOT a multiplier to apply to a quantity column. NEVER multiply a bottle quantity by the pack size. Example: a row "Quantity: 7" with format "6x75cl" is 7 BOTTLES of 750ml (bottleSizeMl 750, totalBottles 7) — it is NOT 7 cases (42). Only multiply when the count column is EXPLICITLY cases/units.
- Only when the count EXPLICITLY refers to CASES/UNITS (column labelled "Cases", "Cs", "Units", "OWC", or the value plainly means cases) AND a pack is given, then totalBottles = cases × bottlesPerCase.
- Some rows give BOTH cases and loose bottles (e.g. a "Cs." column AND a "Btls." column): totalBottles = cases × bottlesPerCase + looseBottles.
- If unsure whether a number is bottles or cases, treat it as BOTTLES — under-counting a case is far less harmful than multiplying a bottle count into a huge phantom holding.
- Formats: "6x75cl" = a case of 6 bottles, each 750ml (so bottleSizeMl 750; "6" is the case composition, use it for bottlesPerCase ONLY when the row is genuinely counted in cases). "1x150cl" = 1 × 1500ml (magnum); "24x37.5cl" = 24 × 375ml. cl→ml is ×10. "75 cl" = 750ml. Treat X/x the same.

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
- purchasePricePerBottle: number in the row's currency, or null. The price/value column may be labelled many ways — "price", "purchase price", "cost", "unit cost", "purchase value", "stock value", "value", "valuation", "book value". Treat any of these as the holding's price. Work out PER BOTTLE: if the figure is per case, divide by bottlesPerCase; if it's a TOTAL holding value (i.e. the value of all the bottles on that row), divide by totalBottles. Only leave null when the row genuinely has no price/value figure at all.
- currency: 3-letter code if determinable (GBP/USD/EUR…), else null.
- notes: a tasting note from the row if present, else null.

Return ONLY a JSON object: {"wines": [ ... ]}. No markdown, no commentary.`;

Deno.serve(async (req) => {
  try {
    const { text, pdfBase64, source } = await req.json().catch(() => ({}));
    const hint = typeof source === 'string' && source ? source : 'unknown';

    // Two inputs: a PDF invoice/statement (sent as a document block Claude reads
    // directly) or decoded spreadsheet rows as text.
    let content: unknown;
    if (typeof pdfBase64 === 'string' && pdfBase64) {
      content = [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 } },
        { type: 'text', text: `Source hint: ${hint}\n\nExtract every wine holding from this document.` },
      ];
    } else {
      const body = typeof text === 'string' ? text : '';
      if (!body.trim()) return json({ wines: [] }, 200);
      // Guard against a runaway payload — cap the characters we forward.
      content = `Source hint: ${hint}\n\nList rows:\n${body.length > 120000 ? body.slice(0, 120000) : body}`;
    }

    const resp = await client.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 16000,
      system: SYSTEM,
      messages: [{ role: 'user', content: content as any }],
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
      // null when the file gave no bottle size — the client defaults to 750ml and
      // flags it, rather than silently assuming a format.
      const bottleSizeMl = sizeNum && sizeNum >= 50 && sizeNum <= 30000 ? sizeNum : null;
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
