import type { SupabaseClient } from 'npm:@supabase/supabase-js';

// Reads the signed-in user's own data (through RLS, filtered to rows they own)
// and boils it down IN CODE to a compact summary of counts, tallies, averages
// and a few short quotes. Only this summary goes to the model — never raw rows —
// so every observation it writes has to trace back to a number or a quote here.

// Below this many meaningful data points Vinster says it needs more before
// observing anything (see signalOf).
export const MIN_SIGNAL = 5;

// Enough for a very large imported cellar without an unbounded read.
const CELLAR_PAGE = 1000;
const CELLAR_MAX_PAGES = 10;

type Row = Record<string, any>;

export interface TasteData {
  preferences: Row | null;
  cellar: Row[];
  chosen: Row[];
  visits: Row[];
  lineups: Row[];
  recipesFromWine: Row[];
  winesForDish: Row[];
  cooked: Row[];
}

// ---- Reading -------------------------------------------------------------------

const PREFERENCE_COLUMNS = 'default_wine_types, style_preferences, default_budget, default_currency, favourite_regions, favourite_grapes, disliked_regions, disliked_grapes, dietary_needs, allergy_risks, specific_concerns, regional_preferences, nutritional_preferences';

export async function gatherTasteData(db: SupabaseClient, uid: string): Promise<TasteData> {
  const [preferences, cellar, chosen, visits, lineups, recipesFromWine, winesForDish, cooked] = await Promise.all([
    db.from('profiles').select(PREFERENCE_COLUMNS).eq('user_id', uid).maybeSingle().then(({ data }) => data as Row | null),
    readCellar(db, uid),
    rows('chosen_wines', db.from('chosen_wines')
      .select('wine_name, producer, region, grape, style, vintage, menu_price, currency, user_score, tasting_note, restaurant_name, city, is_favourite')
      .eq('user_id', uid).order('chosen_at', { ascending: false }).limit(1000)),
    rows('scan_sessions', db.from('scan_sessions')
      .select('restaurant_name, city, restaurant_note, rating_overall, rating_food, rating_wine_list, rating_service, rating_value, rating_atmosphere')
      .eq('user_id', uid).order('captured_at', { ascending: false }).limit(1000)),
    rows('lineup_archives', db.from('lineup_archives').select('wines, city, venue')
      .eq('user_id', uid).order('archived_at', { ascending: false }).limit(300)),
    rows('chef_label_sessions', db.from('chef_label_sessions').select('wine, pairings, is_starred')
      .eq('user_id', uid).order('saved_at', { ascending: false }).limit(150)),
    rows('chef_pairing_sessions', db.from('chef_pairing_sessions').select('dish, mode, general_result, is_starred')
      .eq('user_id', uid).order('saved_at', { ascending: false }).limit(150)),
    rows('chosen_recipes', db.from('chosen_recipes').select('dish_name, chef_inspiration, user_score')
      .eq('user_id', uid).order('chosen_at', { ascending: false }).limit(300)),
  ]);
  return { preferences, cellar, chosen, visits, lineups, recipesFromWine, winesForDish, cooked };
}

// A source that fails to load is logged and left out rather than failing the
// whole refresh — the summary then simply says less.
async function rows(source: string, query: PromiseLike<{ data: unknown; error: { message: string } | null }>): Promise<Row[]> {
  const { data, error } = await query;
  if (error) console.error(`[observations] could not read ${source}:`, error.message);
  return (data as Row[] | null) ?? [];
}

// The user's OWN cellar rows (not a household cellar shared with them), active
// and archived, paged past PostgREST's 1000-row cap.
async function readCellar(db: SupabaseClient, uid: string): Promise<Row[]> {
  const all: Row[] = [];
  for (let page = 0; page < CELLAR_MAX_PAGES; page++) {
    const batch = await rows('cellar_wines', db.from('cellar_wines')
      .select('producer, wine_name, region, grape_variety, style, vintage, quantity, purchase_price, purchase_price_currency, purchase_price_estimated, bottle_size_ml, review_entries, review_score, archived_at, is_favourite, is_spirit')
      .eq('user_id', uid).order('id').range(page * CELLAR_PAGE, (page + 1) * CELLAR_PAGE - 1));
    all.push(...batch);
    if (batch.length < CELLAR_PAGE) break;
  }
  return all;
}

// A cheap fingerprint of the user's data — counts per source plus a hash of
// their saved preferences — so `get` can tell whether anything has changed since
// the last refresh without reading every row.
export async function dataSignature(db: SupabaseClient, uid: string): Promise<string> {
  const count = async (table: string, filter?: (q: any) => any) => {
    let q = db.from(table).select('user_id', { count: 'exact', head: true }).eq('user_id', uid);
    if (filter) q = filter(q);
    const { count: n } = await q;
    return n ?? 0;
  };
  const [active, archived, reviewed, chosen, scored, visits, lineups, fromWine, forDish, cooked, prefs] = await Promise.all([
    count('cellar_wines', (q) => q.is('archived_at', null)),
    count('cellar_wines', (q) => q.not('archived_at', 'is', null)),
    count('cellar_wines', (q) => q.not('review_score', 'is', null)),
    count('chosen_wines'),
    count('chosen_wines', (q) => q.not('user_score', 'is', null)),
    count('scan_sessions', (q) => q.not('rating_overall', 'is', null)),
    count('lineup_archives'),
    count('chef_label_sessions'),
    count('chef_pairing_sessions'),
    count('chosen_recipes'),
    db.from('profiles').select(PREFERENCE_COLUMNS).eq('user_id', uid).maybeSingle().then(({ data }) => data),
  ]);
  return `c${active}/${archived}/${reviewed} w${chosen}/${scored} r${visits} l${lineups} p${fromWine}/${forDish}/${cooked} h${hash(JSON.stringify(prefs ?? {}))}`;
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// ---- Summarising ---------------------------------------------------------------

// A case-insensitive tally that remembers the first spelling it saw.
class Tally {
  private counts = new Map<string, { label: string; n: number }>();
  add(value: unknown, weight = 1) {
    const label = clean(value);
    if (!label) return;
    const key = label.toLowerCase();
    const entry = this.counts.get(key) ?? { label, n: 0 };
    entry.n += weight;
    this.counts.set(key, entry);
  }
  top(limit: number): string[] {
    return [...this.counts.values()].sort((a, b) => b.n - a.n).slice(0, limit).map((e) => `${e.label} (${e.n})`);
  }
  get size() { return this.counts.size; }
}

// Average score per region / grape / style — only where there are two or more.
class ScoreBook {
  private scores = new Map<string, { label: string; all: number[] }>();
  add(value: unknown, score: number) {
    const label = clean(value);
    if (!label) return;
    const key = label.toLowerCase();
    const entry = this.scores.get(key) ?? { label, all: [] };
    entry.all.push(score);
    this.scores.set(key, entry);
  }
  summary(limit: number): string[] {
    return [...this.scores.values()].filter((e) => e.all.length >= 2)
      .sort((a, b) => b.all.length - a.all.length).slice(0, limit)
      .map((e) => `${e.label}: avg ${Math.round(mean(e.all))} over ${e.all.length}`);
  }
}

function clean(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

// "Cabernet Sauvignon, Merlot" counts towards both grapes.
function grapesOf(value: unknown): string[] {
  return clean(value).split(/\s*(?:[,/&+;]|\band\b)\s*/i).filter((g) => g.length > 1);
}

function mean(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function quantile(sorted: number[], q: number): number {
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

function snippet(value: unknown, max = 140): string {
  const s = clean(value);
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function wineLabel(w: Row): string {
  return [w.producer, w.wine_name, w.vintage].map(clean).filter(Boolean).join(' ') || 'Unnamed wine';
}

// Prices in the user's most-used currency only — mixing currencies would make
// the bands meaningless. Values are per 75cl.
function priceBand(prices: { amount: number; currency: string }[]): string | null {
  const byCurrency = new Map<string, number[]>();
  for (const p of prices) byCurrency.set(p.currency, [...(byCurrency.get(p.currency) ?? []), p.amount]);
  const [currency, amounts] = [...byCurrency.entries()].sort((a, b) => b[1].length - a[1].length)[0] ?? [];
  if (!currency || !amounts || amounts.length < 3) return null;
  const sorted = [...amounts].sort((a, b) => a - b);
  const r = (n: number) => Math.round(n);
  return `${currency}: median ${r(quantile(sorted, 0.5))}, middle half ${r(quantile(sorted, 0.25))}–${r(quantile(sorted, 0.75))}, range ${r(sorted[0])}–${r(sorted[sorted.length - 1])} (from ${amounts.length} prices)`;
}

function scoreOf(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 && n <= 100 ? n : null;
}

function ratingOf(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= 1 && n <= 5 ? n : null;
}

interface ScoredWine { label: string; region: string; grape: string; style: string; score: number; note: string }

export interface TasteSummary {
  // Meaningful data points across sources, for the MIN_SIGNAL gate.
  signal: number;
  // The compact, model-ready summary.
  text: string;
}

export function summariseTasteData(d: TasteData): TasteSummary {
  const sections: string[] = [];
  const line = (label: string, value: string | number | null | undefined | string[]) => {
    if (Array.isArray(value)) return value.length ? `- ${label}: ${value.join('; ')}` : '';
    return value === null || value === undefined || value === '' ? '' : `- ${label}: ${value}`;
  };
  const section = (title: string, lines: string[]) => {
    const kept = lines.filter(Boolean);
    if (kept.length) sections.push(`${title}\n${kept.join('\n')}`);
  };

  // Stated preferences — what they SAID, as opposed to what they did.
  const p = d.preferences ?? {};
  const list = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === 'string' && x.trim()) : []);
  section('STATED PREFERENCES (their settings — not evidence of behaviour)', [
    line('Wine types', list(p.default_wine_types)),
    line('Styles', list(p.style_preferences)),
    line('Usual budget', p.default_budget ? `${p.default_currency ?? 'GBP'} ${p.default_budget}` : null),
    line('Favourite regions', list(p.favourite_regions)),
    line('Favourite grapes', list(p.favourite_grapes)),
    line('Regions to avoid', list(p.disliked_regions)),
    line('Grapes to avoid', list(p.disliked_grapes)),
    line('Dietary', [...list(p.dietary_needs), ...list(p.allergy_risks)]),
    line('Cuisines they like', list(p.regional_preferences)),
    line('Nutrition', list(p.nutritional_preferences)),
    line('Specific concerns', snippet(p.specific_concerns, 200)),
  ]);

  // Every scored wine across the cellar's review history and restaurant /
  // manual reviews — the strongest signal of what they actually enjoy.
  const scored: ScoredWine[] = [];
  const notes: string[] = [];
  let reviewCount = 0;

  // Cellar.
  const wines = d.cellar.filter((w) => !w.is_spirit);
  const active = wines.filter((w) => !w.archived_at);
  const archived = wines.filter((w) => w.archived_at);
  const regionsHeld = new Tally(), grapesHeld = new Tally(), stylesHeld = new Tally(), producersHeld = new Tally();
  const regionsDrunk = new Tally(), stylesDrunk = new Tally();
  const vintages: number[] = [];
  const cellarPrices: { amount: number; currency: string }[] = [];
  let bottles = 0, largeFormats = 0;
  for (const w of active) {
    const qty = Math.max(1, Number(w.quantity) || 1);
    bottles += qty;
    regionsHeld.add(w.region, qty);
    grapesOf(w.grape_variety).forEach((g) => grapesHeld.add(g, qty));
    stylesHeld.add(w.style, qty);
    producersHeld.add(w.producer, qty);
    const v = Number(w.vintage);
    if (Number.isInteger(v) && v > 1900) vintages.push(v);
    if ((Number(w.bottle_size_ml) || 750) > 750) largeFormats += qty;
  }
  for (const w of archived) {
    regionsDrunk.add(w.region);
    stylesDrunk.add(w.style);
  }
  for (const w of wines) {
    // Only prices the user entered themselves — an auto-estimate isn't a choice.
    const price = Number(w.purchase_price);
    if (price > 0 && !w.purchase_price_estimated && w.purchase_price_currency) {
      cellarPrices.push({ amount: price * 750 / (Number(w.bottle_size_ml) || 750), currency: String(w.purchase_price_currency).toUpperCase() });
    }
    const entries: Row[] = Array.isArray(w.review_entries) && w.review_entries.length
      ? w.review_entries
      : w.review_score != null ? [{ score: w.review_score }] : [];
    for (const e of entries) {
      const score = scoreOf(e.score);
      const note = snippet(e.note);
      if (score == null && !note) continue;
      reviewCount++;
      if (score != null) scored.push({ label: wineLabel(w), region: clean(w.region), grape: clean(w.grape_variety), style: clean(w.style), score, note });
      if (note) notes.push(`${wineLabel(w)}${score != null ? ` (${score})` : ''}: "${note}"`);
    }
  }
  const sortedVintages = [...vintages].sort((a, b) => a - b);
  section('CELLAR (their own bottles; archived = drunk or gone)', [
    line('Wines held', active.length ? `${active.length} wines, ${bottles} bottles` : null),
    line('Top regions held (bottles)', regionsHeld.top(8)),
    line('Top grapes held (bottles)', grapesHeld.top(8)),
    line('Styles held (bottles)', stylesHeld.top(6)),
    line('Most-held producers (bottles)', producersHeld.size > 3 ? producersHeld.top(6) : []),
    line('Vintages held', sortedVintages.length >= 3 ? `${sortedVintages[0]}–${sortedVintages[sortedVintages.length - 1]}, median ${quantile(sortedVintages, 0.5)}` : null),
    line('Large-format bottles', largeFormats || null),
    line('Favourites', active.filter((w) => w.is_favourite).slice(0, 8).map(wineLabel)),
    line('Archived (drunk) wines', archived.length || null),
    line('Regions drunk most', archived.length >= 3 ? regionsDrunk.top(6) : []),
    line('Styles drunk most', archived.length >= 3 ? stylesDrunk.top(5) : []),
    line('Spirits held', d.cellar.length - wines.length || null),
    line('What they paid per bottle (prices they entered)', priceBand(cellarPrices)),
  ]);

  // Wines chosen at restaurants and manual reviews.
  const chosenRegions = new Tally(), chosenGrapes = new Tally(), chosenStyles = new Tally();
  const menuPrices: { amount: number; currency: string }[] = [];
  let unreviewedChoices = 0;
  for (const c of d.chosen) {
    chosenRegions.add(c.region);
    grapesOf(c.grape).forEach((g) => chosenGrapes.add(g));
    chosenStyles.add(c.style);
    const price = Number(c.menu_price);
    if (price > 0 && c.currency) menuPrices.push({ amount: price, currency: String(c.currency).toUpperCase() });
    const score = scoreOf(c.user_score);
    const note = snippet(c.tasting_note);
    if (score == null && !note) { unreviewedChoices++; continue; }
    reviewCount++;
    const where = clean(c.restaurant_name) ? ` at ${clean(c.restaurant_name)}` : '';
    if (score != null) scored.push({ label: `${wineLabel(c)}${where}`, region: clean(c.region), grape: clean(c.grape), style: clean(c.style), score, note });
    if (note) notes.push(`${wineLabel(c)}${where}${score != null ? ` (${score})` : ''}: "${note}"`);
  }
  section('WINES CHOSEN OR REVIEWED AWAY FROM THE CELLAR (restaurant picks and manual reviews)', [
    line('Wines chosen', d.chosen.length || null),
    line('Regions chosen', chosenRegions.top(6)),
    line('Grapes chosen', chosenGrapes.top(6)),
    line('Styles chosen', chosenStyles.top(5)),
    line('Restaurant list prices paid', priceBand(menuPrices)),
  ]);

  // How they score.
  if (scored.length) {
    const sortedScores = scored.map((s) => s.score).sort((a, b) => a - b);
    const bands = { '95+': 0, '90–94': 0, '85–89': 0, 'under 85': 0 };
    for (const s of sortedScores) bands[s >= 95 ? '95+' : s >= 90 ? '90–94' : s >= 85 ? '85–89' : 'under 85']++;
    const byRegion = new ScoreBook(), byGrape = new ScoreBook(), byStyle = new ScoreBook();
    for (const s of scored) {
      byRegion.add(s.region, s.score);
      grapesOf(s.grape).forEach((g) => byGrape.add(g, s.score));
      byStyle.add(s.style, s.score);
    }
    // Highest = at or above their own median; lowest = below it, so the two
    // lists never overlap however few wines they've scored.
    const median = quantile(sortedScores, 0.5);
    const best = [...scored].sort((a, b) => b.score - a.score);
    section('HOW THEY SCORE (their own scores out of 100)', [
      line('Scored wines', `${scored.length}, average ${Math.round(mean(sortedScores))}, median ${median}, range ${sortedScores[0]}–${sortedScores[sortedScores.length - 1]}`),
      line('Spread', Object.entries(bands).filter(([, n]) => n).map(([band, n]) => `${band}: ${n}`)),
      line('Average by region', byRegion.summary(6)),
      line('Average by grape', byGrape.summary(6)),
      line('Average by style', byStyle.summary(5)),
      line('Highest scored', best.filter((s) => s.score >= median).slice(0, 8).map((s) => `${s.label} — ${s.score}`)),
      line('Lowest scored', best.filter((s) => s.score < median).slice(-3).reverse().map((s) => `${s.label} — ${s.score}`)),
    ]);
  }
  section('IN THEIR OWN WORDS (recent tasting notes, verbatim)', notes.slice(0, 12).map((n) => `- ${n}`));

  // Restaurant visits they reviewed.
  const reviewedVisits = d.visits.filter((v) => ratingOf(v.rating_overall) != null || ratingOf(v.rating_food) != null || clean(v.restaurant_note));
  if (reviewedVisits.length) {
    const cities = new Tally();
    const dims: Record<string, number[]> = { overall: [], food: [], 'wine list': [], service: [], value: [], atmosphere: [] };
    for (const v of reviewedVisits) {
      cities.add(v.city);
      const pairs: [string, unknown][] = [['overall', v.rating_overall], ['food', v.rating_food], ['wine list', v.rating_wine_list], ['service', v.rating_service], ['value', v.rating_value], ['atmosphere', v.rating_atmosphere]];
      for (const [k, val] of pairs) { const r = ratingOf(val); if (r != null) dims[k].push(r); }
    }
    const named = (v: Row) => `${clean(v.restaurant_name) || 'Unnamed'}${clean(v.city) ? ` (${clean(v.city)})` : ''}`;
    section('RESTAURANTS THEY REVIEWED (ratings out of 5)', [
      line('Visits reviewed', reviewedVisits.length),
      line('Cities', cities.top(6)),
      line('Average ratings', Object.entries(dims).filter(([, xs]) => xs.length).map(([k, xs]) => `${k} ${mean(xs).toFixed(1)} (${xs.length})`)),
      line('Rated highest', reviewedVisits.filter((v) => (ratingOf(v.rating_overall) ?? 0) >= 4).slice(0, 5).map((v) => `${named(v)} — ${v.rating_overall}`)),
      line('Rated lowest', reviewedVisits.filter((v) => (ratingOf(v.rating_overall) ?? 5) <= 2).slice(0, 3).map((v) => `${named(v)} — ${v.rating_overall}`)),
      line('Their notes', reviewedVisits.filter((v) => clean(v.restaurant_note)).slice(0, 6).map((v) => `${named(v)}: "${snippet(v.restaurant_note, 120)}"`)),
    ]);
  }

  // Lineups — bottles opened together.
  if (d.lineups.length) {
    const lineupRegions = new Tally(), lineupStyles = new Tally(), venues = new Tally();
    let lineupBottles = 0;
    for (const l of d.lineups) {
      venues.add(l.venue ?? l.city);
      for (const w of Array.isArray(l.wines) ? l.wines : []) {
        const n = Math.max(1, Number(w.count) || 1);
        lineupBottles += n;
        lineupRegions.add(w.region, n);
        lineupStyles.add(w.style, n);
      }
    }
    section('LINEUPS (bottles opened together at a dinner or tasting)', [
      line('Lineups', `${d.lineups.length}, ${lineupBottles} bottles`),
      line('Regions', lineupRegions.top(6)),
      line('Styles', lineupStyles.top(5)),
      line('Where', venues.top(4)),
    ]);
  }

  // Pairings: recipes found for a wine, wines found for a dish, recipes cooked.
  const pairingCount = d.recipesFromWine.length + d.winesForDish.length + d.cooked.length;
  if (pairingCount) {
    const cuisines = new Tally(), pairedStyles = new Tally(), suggestedStyles = new Tally();
    const savedDishes: string[] = [];
    for (const s of d.recipesFromWine) {
      pairedStyles.add(s.wine?.style);
      for (const r of Array.isArray(s.pairings) ? s.pairings : []) {
        cuisines.add(r.chefCountry);
        if (r.dishName) savedDishes.push(`${s.is_starred ? '★ ' : ''}${clean(r.dishName)}`);
      }
    }
    for (const s of d.winesForDish) {
      for (const g of Array.isArray(s.general_result) ? s.general_result : []) suggestedStyles.add(g.wineStyle);
    }
    const cookedScores = d.cooked.map((c) => scoreOf(c.user_score)).filter((n): n is number => n != null);
    section('PAIRINGS AND COOKING', [
      line('Recipes found for a wine', d.recipesFromWine.length || null),
      line('Wine styles they found recipes for', pairedStyles.top(5)),
      line('Cuisines of those recipes', cuisines.top(6)),
      line('Dishes saved (★ = starred)', savedDishes.sort((a, b) => Number(b.startsWith('★')) - Number(a.startsWith('★'))).slice(0, 8)),
      line('Dishes they looked for a wine for', d.winesForDish.slice(0, 10).map((s) => clean(s.dish)).filter(Boolean)),
      line('Wine styles suggested for those dishes', suggestedStyles.top(5)),
      line('Recipes cooked', d.cooked.length ? `${d.cooked.length}${cookedScores.length ? `, average score ${Math.round(mean(cookedScores))}` : ''}` : null),
      line('Cooked', d.cooked.slice(0, 8).map((c) => `${clean(c.dish_name)}${scoreOf(c.user_score) != null ? ` (${c.user_score})` : ''}`)),
    ]);
  }

  const signal = reviewCount + reviewedVisits.length + unreviewedChoices + d.lineups.length + pairingCount + Math.floor(wines.length / 3);
  return { signal, text: sections.join('\n\n') };
}
