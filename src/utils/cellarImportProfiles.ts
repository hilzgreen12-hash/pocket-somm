import type { CellarImportWine } from '../api/label';

// Deterministic profiles for known merchant exports. When a sheet's header
// matches a profile's fingerprint, we map it exactly in code — instant, free,
// and 100% accurate, with that merchant's own case rules baked in. Anything
// unrecognized falls through to the Claude parser. Adding a new merchant is a
// small, self-contained function below + an entry in PROFILES.

type Cols = Record<string, number>;
const N = (s: unknown): string => (s ?? '').toString().trim().toLowerCase();

// Find the header row (not always row 0) by requiring every fingerprint column
// to be present, and return a name→index map for it.
function headerMatch(rows: string[][], required: string[]): { idx: number; cols: Cols } | null {
  const want = required.map(N);
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const cells = rows[i].map(N);
    if (want.every((req) => cells.includes(req))) {
      const cols: Cols = {};
      rows[i].forEach((c, j) => { const k = N(c); if (!(k in cols)) cols[k] = j; });
      return { idx: i, cols };
    }
  }
  return null;
}
function ci(cols: Cols, ...names: string[]): number {
  for (const n of names) { const i = cols[N(n)]; if (i != null) return i; }
  return -1;
}
function get(row: string[], i: number): string { return i >= 0 && i < row.length ? (row[i] ?? '').toString().trim() : ''; }
function intOf(s: string): number | null { const n = parseInt(String(s).replace(/[^0-9]/g, ''), 10); return Number.isFinite(n) ? n : null; }
function numOf(s: string): number | null { const n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return Number.isFinite(n) ? n : null; }
function yr(s: string): string | null { const m = String(s).match(/(?:19|20)\d{2}/); return m ? m[0] : null; }
function yrTo(s: string): string | null { const m = String(s).match(/(?:19|20)\d{2}\D+((?:19|20)\d{2})/); return m ? m[1] : null; }
function stripLeadingVintage(name: string): string { return name.replace(/^\s*(?:19|20)\d{2}\s+/, '').trim(); }

function volToMl(s: string): number {
  const t = N(s);
  if (/magnum/.test(t)) return 1500;
  if (/jeroboam/.test(t)) return 3000;
  if (/methuselah/.test(t)) return 6000;
  if (/half/.test(t)) return 375;
  let m = t.match(/([\d.]+)\s*cl/); if (m) return Math.round(parseFloat(m[1]) * 10);
  m = t.match(/([\d.]+)\s*ml/); if (m) return Math.round(parseFloat(m[1]));
  m = t.match(/([\d.]+)\s*l\b/); if (m) return Math.round(parseFloat(m[1]) * 1000);
  return 750;
}
// Parse a pack descriptor into bottles-per-case + per-bottle size. Handles
// "6x75cl" / "12X75cl" / "1x150cl" / "24x37.5cl" and "Case, 6 Bottles" / "Bottle".
function parsePack(s: string): { bottlesPerCase: number; bottleSizeMl: number } {
  const t = N(s);
  let m = t.match(/(\d+)\s*[x×]\s*([\d.]+\s*(?:cl|ml|l))/);
  if (m) return { bottlesPerCase: parseInt(m[1], 10) || 1, bottleSizeMl: volToMl(m[2]) };
  m = t.match(/case[,\s]+(\d+)\s*bottle/);
  if (m) return { bottlesPerCase: parseInt(m[1], 10) || 1, bottleSizeMl: volToMl(t) };
  return { bottlesPerCase: 1, bottleSizeMl: volToMl(t) };
}
function colourOf(s: string): CellarImportWine['colour'] {
  const t = N(s);
  if (/ros[eé]/.test(t)) return 'Rosé';
  if (/spark|champ/.test(t)) return 'Sparkling';
  if (/fort|port|sherry|madeira/.test(t)) return 'Fortified';
  if (/white|blanc/.test(t)) return 'White';
  if (/red|rouge|rosso/.test(t)) return 'Red';
  return null;
}

function mkWine(p: Partial<CellarImportWine>): CellarImportWine {
  return {
    producer: null, wineName: null, vintage: null, region: null, country: null, colour: null,
    bottleSizeMl: 750, totalBottles: 1, packaging: 'loose', bottlesPerCase: null, cases: null, looseBottles: null,
    drinkingWindowFrom: null, drinkingWindowTo: null, purchasePricePerBottle: null, currency: 'GBP', notes: null,
    ...p,
  };
}

// Berry Bros & Rudd — "My Cellar View". Count is already in bottles; Case Size
// gives bottles-per-case; rich extras (region/colour/drinking window/price).
function parseBerryBros(rows: string[][]): CellarImportWine[] | null {
  const h = headerMatch(rows, ['parent id', 'quantity in bottles']);
  if (!h) return null;
  const { idx, cols } = h;
  const c = {
    desc: ci(cols, 'description'), vint: ci(cols, 'vintage'), region: ci(cols, 'region'), country: ci(cols, 'country'),
    colour: ci(cols, 'colour'), vol: ci(cols, 'bottle volume'), qty: ci(cols, 'quantity in bottles'), size: ci(cols, 'case size'),
    dwf: ci(cols, 'drinking window (from)'), dwt: ci(cols, 'drinking window (to)'), price: ci(cols, 'purchase price per case'),
  };
  const out: CellarImportWine[] = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i]; const desc = get(r, c.desc); const total = intOf(get(r, c.qty));
    if (!desc || !total) continue;
    const per = intOf(get(r, c.size));
    const cased = !!per && per > 1;
    const perCase = numOf(get(r, c.price));
    out.push(mkWine({
      producer: desc, vintage: yr(get(r, c.vint)), region: get(r, c.region) || null, country: get(r, c.country) || null,
      colour: colourOf(get(r, c.colour)), bottleSizeMl: volToMl(get(r, c.vol)), totalBottles: total,
      packaging: cased ? 'owc' : 'loose', bottlesPerCase: cased ? per : null,
      cases: cased ? Math.floor(total / (per as number)) : null, looseBottles: cased ? total % (per as number) : null,
      drinkingWindowFrom: yr(get(r, c.dwf)), drinkingWindowTo: yr(get(r, c.dwt)),
      purchasePricePerBottle: perCase && per ? +(perCase / per).toFixed(2) : null,
    }));
  }
  return out.length ? out : null;
}

// Justerini & Brooks — personal cellar. Format ("12x75cl") + separate Cs.
// (full cases) and Btls. (loose) columns.
function parseJB(rows: string[][]): CellarImportWine[] | null {
  const h = headerMatch(rows, ['description', 'format', 'cs.', 'btls.']);
  if (!h) return null;
  const { idx, cols } = h;
  const c = {
    region: ci(cols, 'region'), vint: ci(cols, 'vint.', 'vintage'), desc: ci(cols, 'description'),
    format: ci(cols, 'format'), cs: ci(cols, 'cs.'), btls: ci(cols, 'btls.'),
  };
  const out: CellarImportWine[] = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i]; const desc = get(r, c.desc); if (!desc) continue;
    const pack = parsePack(get(r, c.format));
    const cs = intOf(get(r, c.cs)) ?? 0; const btls = intOf(get(r, c.btls)) ?? 0;
    const total = cs * pack.bottlesPerCase + btls;
    if (total < 1) continue;
    out.push(mkWine({
      producer: desc, vintage: yr(get(r, c.vint)), region: get(r, c.region) || null, bottleSizeMl: pack.bottleSizeMl,
      totalBottles: total, packaging: cs > 0 ? 'owc' : 'loose', bottlesPerCase: cs > 0 ? pack.bottlesPerCase : null,
      cases: cs > 0 ? cs : null, looseBottles: btls || null,
    }));
  }
  return out.length ? out : null;
}

// Lay & Wheeler — reserves/broking list. Quantity × Size, where Size is
// "Bottle" / "Case, N Bottles". Region+country in Heading, colour in Subheading.
function parseLayWheeler(rows: string[][]): CellarImportWine[] | null {
  const h = headerMatch(rows, ['wine name', 'size', 'on broking']);
  if (!h) return null;
  const { idx, cols } = h;
  const c = {
    heading: ci(cols, 'heading'), sub: ci(cols, 'subheading'), vint: ci(cols, 'vintage'), name: ci(cols, 'wine name'),
    qty: ci(cols, 'quantity'), size: ci(cols, 'size'), drink: ci(cols, 'drink dates'), pv: ci(cols, 'purchase value'), notes: ci(cols, 'notes'),
  };
  const out: CellarImportWine[] = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i]; const name0 = get(r, c.name); if (!name0) continue;
    const qty = intOf(get(r, c.qty)) ?? 1;
    const pack = parsePack(get(r, c.size));
    const cased = /case/.test(N(get(r, c.size))) || pack.bottlesPerCase > 1;
    const total = qty * pack.bottlesPerCase;
    if (total < 1) continue;
    const heading = get(r, c.heading);
    const [country, region] = heading.includes(' - ') ? heading.split(' - ').map((s) => s.trim()) : [null, heading || null];
    const pv = numOf(get(r, c.pv));
    out.push(mkWine({
      producer: stripLeadingVintage(name0), vintage: yr(get(r, c.vint)) || yr(name0), region: region || null, country: country || null,
      colour: colourOf(get(r, c.sub)), bottleSizeMl: pack.bottleSizeMl, totalBottles: total,
      packaging: cased ? 'owc' : 'loose', bottlesPerCase: cased ? pack.bottlesPerCase : null, cases: cased ? qty : null,
      drinkingWindowFrom: yr(get(r, c.drink)), drinkingWindowTo: yrTo(get(r, c.drink)),
      purchasePricePerBottle: pv && total ? +(pv / total).toFixed(2) : null, notes: get(r, c.notes) || null,
    }));
  }
  return out.length ? out : null;
}

// Corney & Barrow — "No bottles" is total bottles, "Pack size" is
// bottles-per-case; full multiples become OWC cases, a remainder is loose.
function parseCorneyBarrow(rows: string[][]): CellarImportWine[] | null {
  const h = headerMatch(rows, ['no bottles', 'pack size', 'account code']);
  if (!h) return null;
  const { idx, cols } = h;
  const c = {
    name: ci(cols, 'wine name'), vint: ci(cols, 'vintage display', 'vintage'), type: ci(cols, 'type'), size: ci(cols, 'bottle size'),
    bottles: ci(cols, 'no bottles'), pack: ci(cols, 'pack size'), country: ci(cols, 'country'), region: ci(cols, 'region'), sub: ci(cols, 'sub region'),
    price: ci(cols, 'purchase cost per case'), dwf: ci(cols, 'drink from'), dwt: ci(cols, 'drink to'), note: ci(cols, 'tasting note'),
  };
  const out: CellarImportWine[] = [];
  for (let i = idx + 1; i < rows.length; i++) {
    const r = rows[i]; const name = get(r, c.name); const total = intOf(get(r, c.bottles));
    if (!name || !total) continue;
    const pk = intOf(get(r, c.pack)) ?? 1;
    const cases = pk > 1 ? Math.floor(total / pk) : 0;
    const loose = pk > 1 ? total % pk : total;
    const region = [get(r, c.sub), get(r, c.region)].filter(Boolean).join(', ');
    const perCase = numOf(get(r, c.price));
    out.push(mkWine({
      producer: name, vintage: yr(get(r, c.vint)), region: region || null, country: get(r, c.country) || null,
      colour: colourOf(get(r, c.type)), bottleSizeMl: volToMl(get(r, c.size)), totalBottles: total,
      packaging: cases > 0 ? 'owc' : 'loose', bottlesPerCase: cases > 0 ? pk : null, cases: cases > 0 ? cases : null, looseBottles: loose || null,
      drinkingWindowFrom: yr(get(r, c.dwf)), drinkingWindowTo: yr(get(r, c.dwt)),
      purchasePricePerBottle: perCase && pk ? +(perCase / pk).toFixed(2) : null, notes: get(r, c.note) || null,
    }));
  }
  return out.length ? out : null;
}

const PROFILES: { source: string; parse: (rows: string[][]) => CellarImportWine[] | null }[] = [
  { source: 'Justerini & Brooks', parse: parseJB },
  { source: 'Berry Bros & Rudd', parse: parseBerryBros },
  { source: 'Lay & Wheeler', parse: parseLayWheeler },
  { source: 'Corney & Barrow', parse: parseCorneyBarrow },
];

// Try every known-merchant profile against a sheet. Returns the matched source
// + wines, or null to signal "unknown — hand it to Claude".
export function parseKnownSource(rows: string[][]): { source: string; wines: CellarImportWine[] } | null {
  for (const p of PROFILES) {
    const wines = p.parse(rows);
    if (wines && wines.length) return { source: p.source, wines };
  }
  return null;
}
