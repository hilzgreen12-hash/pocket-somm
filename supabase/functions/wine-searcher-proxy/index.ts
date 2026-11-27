// Wine-Searcher price/score proxy.
//
// Holds the secret API key server-side (never in the mobile bundle), calls
// Wine-Searcher, parses its XML response, and caches the result in
// `pricing_cache` so repeat lookups for the same wine are instant and don't
// burn API calls. Falls back to a clearly-flagged "unavailable" payload on any
// error so the client can quietly drop back to the Claude estimate.
//
// Real response shape (flat XML), confirmed from a live sample:
//   <return-code>0</return-code>          0 = hit, non-zero = no match
//   <wine-name-id>10</wine-name-id>        stable Wine-Searcher wine id
//   <price-average>3754.06</price-average>
//   <price-min>2889.29</price-min>
//   <price-max>4888.33</price-max>
//   <list-currency-code>USD</list-currency-code>
//   <ws-score>94</ws-score>                aggregated critic score 0–100
//   <region>Pomerol</region>
//   <grape>Merlot</grape>

import { createClient } from 'npm:@supabase/supabase-js';
import { requireSignedIn } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';
import { getUsdRate } from '../_shared/fx.ts';

const WINE_SEARCHER_API_KEY = Deno.env.get('WINE_SEARCHER_API_KEY')!;
// Full request URL template, overridable via secret so the exact endpoint can
// be corrected without a redeploy. {KEY} {NAME} {VINTAGE} {CURRENCY} are
// substituted (already URL-encoded where needed). Default matches the live
// test endpoint. NOTE: this endpoint takes no currency param — the response's
// <list-currency-code> reports the currency the account returns prices in.
const WINE_SEARCHER_URL =
  Deno.env.get('WINE_SEARCHER_URL') ??
  'https://api.wine-searcher.com/x?api_key={KEY}&winename={NAME}&vintage={VINTAGE}';
const CACHE_TTL_DAYS = 30;

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Pull the text content of the first <tag>…</tag>. Returns null when absent
// or empty so callers can distinguish "missing" from "0".
function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`, 'i'));
  const v = m?.[1]?.trim();
  return v ? v : null;
}
function num(xml: string, name: string): number | null {
  const v = tag(xml, name);
  if (v === null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// --- Currency conversion -----------------------------------------------------
// Wine-Searcher's account returns prices in USD; they're converted to the
// user's currency with the shared daily rates (_shared/fx.ts). pricing_cache
// always stores the native USD value, so a single WS fetch serves every
// currency. With no rate at all, prices pass through as USD rather than fail.

// Convert a native-USD value to the target currency (2dp). Accepts numeric or
// numeric-string (pricing_cache numerics can arrive as strings).
function convert(value: number | string | null, rate: number): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * rate * 100) / 100;
}

const UNAVAILABLE = {
  matched: false,
  source: 'unavailable' as const,
  averageMarketPrice: null,
  minPrice: null,
  maxPrice: null,
  criticScore: null,
  currency: 'GBP',
  region: null,
  grape: null,
  wsWineId: null,
  wsWineName: null,
};

// Build the Wine-Searcher request URL. vintageValue === null queries across ALL
// vintages: per the Wine-Searcher API, "any vintage" is the 2-character code
// `NV` — NOT an omitted vintage param. DROPPING the param (the old behaviour)
// made WS return a no-match, so the exact-miss -> all-vintage-average broaden
// silently produced nothing; sending `vintage=NV` returns the real aggregate.
function buildWsUrl(name: string, vintageValue: string | null, cur: string): string {
  return WINE_SEARCHER_URL
    .replace('{KEY}', WINE_SEARCHER_API_KEY)
    .replace('{NAME}', encodeURIComponent(name))
    .replace('{VINTAGE}', encodeURIComponent(vintageValue ?? 'NV'))
    .replace('{CURRENCY}', encodeURIComponent(cur));
}

// One Wine-Searcher lookup. Returns parsed (native-USD) pricing on a hit
// (return-code 0), or null on any miss/suspension so the caller can broaden the
// query or fall back to the Claude estimate. Logs the return code so misses are
// diagnosable (vintage miss vs name miss) from the function logs.
async function lookupWineSearcher(name: string, vintageValue: string | null, cur: string, userId: string) {
  const url = buildWsUrl(name, vintageValue, cur);
  await logApiCall(userId);
  // Retry TRANSIENT failures — timeout, network drop, upstream 5xx, or
  // return-code 7 ("API Access Suspended", a rate-limit/outage). These must NOT
  // be mistaken for "this wine has no price": a false miss here skips the
  // all-vintage average in the caller and blanks the price. A genuine no-match
  // (return-code non-zero and not 7) returns null straight away — no retry.
  // SECURITY: buildWsUrl inlines WINE_SEARCHER_API_KEY into the URL, and Deno
  // embeds the full request URL in transport-level fetch errors — so we NEVER
  // log or re-throw the raw error, only a sanitised reason with no URL.
  const MAX_ATTEMPTS = 2;
  let transient = 'request failed';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) await new Promise((r) => setTimeout(r, 400));
    let res: Response;
    try {
      // Without a timeout an unresponsive upstream blocks until the platform
      // wall-clock kill.
      res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    } catch (err) {
      transient = err instanceof Error && err.name === 'TimeoutError' ? 'timed out' : 'request failed';
      continue; // network / timeout — retry
    }
    if (res.status >= 500) { transient = `returned ${res.status}`; continue; } // upstream 5xx — retry
    if (!res.ok) throw new Error(`Wine-Searcher returned ${res.status}`); // 4xx — permanent
    const xml = await res.text();
    const returnCode = tag(xml, 'return-code');
    console.log(`[wine-searcher-proxy] name="${name}" vintage=${vintageValue ?? 'ALL'} return-code=${returnCode} attempt=${attempt}`);
    if (returnCode === '0') {
      return {
        averageMarketPrice: num(xml, 'price-average'),
        minPrice: num(xml, 'price-min'),
        maxPrice: num(xml, 'price-max'),
        criticScore: num(xml, 'ws-score'),
        currency: tag(xml, 'list-currency-code') ?? cur,
        region: tag(xml, 'region'),
        grape: tag(xml, 'grape'),
        wsWineId: tag(xml, 'wine-name-id'),
        // Canonical wine name — best-effort: the confirmed sample only documented
        // <wine-name-id>, so this is null when the tag is absent. The id is the
        // anchor; the name is only for display.
        wineName: tag(xml, 'wine-name'),
      };
    }
    // Suspended / daily limit reached: retrying the same minute can't succeed and
    // would spend nothing but time — report it as "down" straight away.
    if (returnCode === '7') throw new Error('Wine-Searcher API access suspended');
    return null; // genuine no-match
  }
  // Every attempt failed transiently. Signal it (throw, don't return null) so
  // the caller can still broaden to the all-vintage query rather than caching a
  // false miss.
  throw new Error(`Wine-Searcher ${transient}`);
}

// One cache entry per wine however the name is written (case, accents, spaces).
function cacheName(name: string): string {
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
}

// Wine-Searcher matches loosely; a misread label can come back as a DIFFERENT
// wine. Accept a match only when its name shares a distinctive word with the
// query (generic words like "Château" or "Estate" don't count). No returned
// name → accept, as before.
const GENERIC_WORDS = new Set(['chateau', 'domaine', 'domaines', 'estate', 'estates', 'winery', 'wines', 'wine', 'vineyards', 'vineyard', 'cellars', 'tenuta', 'bodega', 'bodegas', 'cantina', 'weingut', 'maison', 'quinta', 'casa', 'clos', 'cuvee', 'reserve', 'grand', 'blanc', 'rouge', 'rose', 'brut', 'cru', 'classe', 'premier']);
function distinctiveWords(t: string | null | undefined): string[] {
  return cacheName(t ?? '').split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w));
}
function sameWine(query: string, wsName: string | null | undefined): boolean {
  if (!wsName) return true;
  const ws = new Set(distinctiveWords(wsName));
  const own = distinctiveWords(query);
  return own.length === 0 || own.some((w) => ws.has(w));
}

// --- One name per wine --------------------------------------------------------
// The same wine reaches us written several ways — "François Mitjavile Roc de
// Cambes" from the catalogue, "Francois et Emilie Mitjavile Roc de Cambes" from
// a label, "Roc de Cambes Roc de Cambes" from a list — and each spelling used to
// cost its own Wine-Searcher lookup and keep its own price. Vinster's catalogue
// holds one agreed producer + name per wine, so a query that is clearly that
// wine is looked up, and saved, under the catalogue's name.

const wordsOf = (t: string) => cacheName(t).split(/[^a-z0-9]+/).filter(Boolean);

// Same word, allowing one slip in a long one ("Mitjavile" / "Mitjaville").
function closeWord(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.min(a.length, b.length) < 6 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
  }
  return edits + (a.length - i) + (b.length - j) <= 1;
}

// The catalogue's producer + name joined the way the app builds a query
// (wineQueryName): the producer is left off when the name already starts with it.
function catalogueQuery(producer: string, wine: string): string {
  // Without an aside in brackets or a second name after a slash ("Famille
  // Perrin (Perrin & Fils)" → "Famille Perrin"), as the app does: Wine-Searcher
  // matches neither.
  const p = producer.replace(/\([^)]*\)/g, ' ').split(/\s+\/\s+/)[0].replace(/\s{2,}/g, ' ').trim();
  const n = wine.trim();
  if (!p) return n;
  if (!n) return p;
  const pl = p.toLowerCase(), nl = n.toLowerCase();
  return nl === pl || nl.startsWith(pl + ' ') ? n : `${p} ${n}`;
}

// The catalogue's name for this query, or null when there's no single clear
// match (then the query is used as written, as before). A catalogue wine
// matches when the query ends with its wine name and the words before it are
// its producer written another way: sharing a distinctive word, the estate's
// own name repeated, or nothing at all.
async function canonicalQuery(query: string): Promise<string | null> {
  const q = wordsOf(query);
  // Search on a few of the query's distinctive words, so one misspelt word
  // ("Mitjaville") can't hide the wine. `display` has a trigram index, so this
  // takes about a millisecond; an accented word ("Pérignon") may not match
  // through it, which only means the query is used as written.
  const probes = [...new Set(distinctiveWords(query))].sort((a, b) => b.length - a.length).slice(0, 3);
  if (probes.length === 0 || q.length === 0) return null;
  const { data, error } = await supabase
    .from('wines_catalog')
    .select('producer, wine_name')
    .or(probes.map((w) => `display.ilike.%${w}%`).join(','))
    .limit(300);
  if (error || !data) return null;
  const found = new Set<string>();
  for (const row of data as { producer: string | null; wine_name: string | null }[]) {
    const producer = row.producer ?? '', wine = row.wine_name ?? '';
    const canon = catalogueQuery(producer, wine);
    const c = wordsOf(canon);
    if (c.join(' ') === q.join(' ')) return canon; // already the catalogue's spelling
    const w = wordsOf(wine);
    // A generic wine name ("Grand Vin", "Brut Rosé") can't tell producers apart.
    if (w.length === 0 || distinctiveWords(wine).length === 0 || q.length < w.length) continue;
    if (q.slice(q.length - w.length).join(' ') !== w.join(' ')) continue;
    const rest = q.slice(0, q.length - w.length);
    const restDistinct = rest.filter((x) => x.length >= 4 && !GENERIC_WORDS.has(x));
    const producerDistinct = distinctiveWords(producer);
    const sameProducer = rest.length === 0
      || rest.join(' ') === w.join(' ')
      || restDistinct.some((x) => producerDistinct.some((y) => closeWord(x, y)));
    if (sameProducer) found.add(canon);
  }
  // Two different catalogue wines fit: too unsure to rename.
  return found.size === 1 ? [...found][0] : null;
}

// The Wine-Searcher plan allows 500 API calls a day for the whole app. Each
// real call is logged (one request can make two: exact vintage, then all
// vintages), and new lookups stop a little short of the cap so a request that
// has started can always finish.
const APP_DAILY_CALLS = 480;
const API_LOG_NAME = 'wine-searcher-api';

async function logApiCall(userId: string): Promise<void> {
  const { error } = await supabase.from('function_call_log').insert({ user_id: userId, function_name: API_LOG_NAME });
  if (error) console.error('[wine-searcher-proxy] API call not logged:', error.message);
}

// Fails open, like the per-user limit: a count that can't be read never blocks.
async function appBudgetLeft(): Promise<boolean> {
  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count, error } = await supabase.from('function_call_log')
    .select('id', { count: 'exact', head: true })
    .eq('function_name', API_LOG_NAME).gte('called_at', since);
  if (error) {
    console.error('[wine-searcher-proxy] app-wide count failed (failing open):', error.message);
    return true;
  }
  if ((count ?? 0) >= APP_DAILY_CALLS) {
    console.warn(`[wine-searcher-proxy] app-wide daily budget reached (${count})`);
    return false;
  }
  return true;
}

// How long "no listing for this wine" is remembered (a hit keeps CACHE_TTL_DAYS).
const MISS_TTL_DAYS = 7;

Deno.serve(async (req) => {
  try {
    const auth = await requireSignedIn(req);
    if (auth instanceof Response) return auth;

    // exactOnly: just this vintage — no all-vintage broadening (the per-vintage
    // comparison table only uses exact rows, so the broaden was wasted credits).
    const { wineName: rawWineName, vintage, currency, exactOnly } = await req.json().catch(() => ({}));

    if (!rawWineName) {
      return new Response(JSON.stringify({ error: 'wineName required' }), { status: 400 });
    }

    // The WS API matches names FAR more strictly than the website, so scrub the
    // query: drop any vintage embedded in the name (it's passed separately — a
    // stray year is a common strict-miss), and collapse whitespace. Sending
    // "Stella di Campalto Brunello di Montalcino Rosa 2016" + vintage=2016 double-
    // counts the year and misses; "…Rosa" + vintage=2016 matches.
    const wineName = String(rawWineName).replace(/\b(?:19|20)\d{2}\b/g, ' ').replace(/\s{2,}/g, ' ').trim();

    const cur = (currency ?? 'GBP').toString().toUpperCase();
    const vintageParam = vintage ?? 'NV';
    // The catalogue's spelling of this wine, when the query is clearly it — so
    // every spelling shares one lookup and one saved price. Fetched alongside
    // the exchange rate, so it adds no waiting of its own.
    const [canonical, usdRate] = await Promise.all([
      canonicalQuery(wineName).catch(() => null),
      getUsdRate(supabase, cur),
    ]);
    const lookupName = canonical ?? wineName;
    // This endpoint returns one fixed currency per account (no currency
    // param), so the same wine+vintage is a single cache entry.
    const wineKey = `${cacheName(lookupName)}_${vintageParam}`;
    // The query as written, and rows saved before keys were normalised: read as
    // fallbacks so prices already saved under them are still used.
    const asWrittenKey = `${cacheName(wineName)}_${vintageParam}`;
    const legacyKey = `${wineName}_${vintageParam}`;

    // USD→user-currency rate, applied to the (USD) prices on the way out.
    const fxRate = usdRate ?? 1;

    // 1) Cache hit within TTL → serve immediately.
    const keys = [...new Set([wineKey, asWrittenKey, legacyKey])];
    const { data: rows } = await supabase
      .from('pricing_cache')
      .select('*')
      .in('wine_key', keys);
    // The catalogue spelling's row first; else the freshest row for a price
    // (not a remembered miss) under another spelling.
    const isPriced = (r: { price_scope: string | null }) => r.price_scope !== 'miss' && r.price_scope !== 'miss-exact';
    const own = rows?.find((r) => r.wine_key === wineKey) ?? null;
    const freshestPriced = [...(rows ?? [])].filter(isPriced)
      .sort((a, b) => String(b.fetched_at).localeCompare(String(a.fetched_at)))[0] ?? null;
    const cached = (own && isPriced(own) ? own : freshestPriced ?? own) ?? rows?.[0] ?? null;

    if (cached) {
      const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 86_400_000;
      // 'miss' = nothing at all; 'miss-exact' = nothing for this exact vintage
      // (an exactOnly lookup) — a normal lookup still tries all vintages then.
      const isMiss = cached.price_scope === 'miss' || cached.price_scope === 'miss-exact';
      const missApplies = cached.price_scope === 'miss' || (cached.price_scope === 'miss-exact' && !!exactOnly);
      // A remembered miss: no lookup spent re-confirming it for a week.
      if (missApplies && ageDays < MISS_TTL_DAYS) {
        return new Response(JSON.stringify(UNAVAILABLE), { headers: { 'Content-Type': 'application/json' } });
      }
      if (!isMiss && ageDays < CACHE_TTL_DAYS) {
        const allVintage = cached.price_scope === 'all-vintage';
        return new Response(
          JSON.stringify({
            matched: cached.market_price_avg != null || cached.critic_score != null || cached.ws_wine_id != null,
            // Cached values are native USD — convert to the requested currency.
            averageMarketPrice: convert(cached.market_price_avg, fxRate),
            minPrice: convert(cached.market_price_min, fxRate),
            maxPrice: convert(cached.market_price_max, fxRate),
            // A score from the all-vintage fallback isn't this vintage's score.
            criticScore: allVintage ? null : cached.critic_score,
            allVintageScore: allVintage ? cached.critic_score : null,
            currency: cur,
            // Carry the anchor identity through cache hits too.
            wsWineId: cached.ws_wine_id ?? null,
            wsWineName: cached.ws_wine_name ?? null,
            // Whether the cached figure is exact-vintage or an all-vintage
            // fallback. Legacy rows (pre-migration 082) are null → treat as
            // 'vintage', the historic default.
            priceScope: cached.price_scope ?? 'vintage',
            source: 'wine-searcher',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2) Call Wine-Searcher. Try the exact vintage first; if that misses and we
    // have a real vintage, retry across ALL vintages. Wine-Searcher's API often
    // has no row for one specific vintage of a niche wine even though the wine
    // (and its all-vintage average price + aggregate score) exists — the API
    // matches far more strictly than the website's fuzzy search. The all-vintage
    // figure is a better answer than a blank, and still anchors the critic score.
    const hasRealVintage = vintageParam !== 'NV';

    // Saved answers above are free; a real lookup counts towards the usage limit,
    // which stops one account using up the app's daily lookups. Over the limit,
    // the app sees the usual "Wine-Searcher unavailable" answer. The vintage
    // comparison table (exactOnly, up to 16 lookups a wine) stops earlier, so the
    // last of the allowance is always kept for a wine's own price.
    const [hourly, daily] = exactOnly ? [80, 150] : [100, 200];
    if (await checkRateLimit(auth.userId, 'wine-searcher-proxy', hourly, daily) || !(await appBudgetLeft())) {
      return new Response(JSON.stringify({ ...UNAVAILABLE, down: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Exact vintage, then (on a miss or a vintage with no price) the all-vintage
    // average, for one spelling of the wine.
    const lookUp = async (name: string) => {
      let result: Awaited<ReturnType<typeof lookupWineSearcher>> = null;
      let priceScope: 'vintage' | 'all-vintage' = 'vintage';
      // Set when a lookup failed transiently (timeout / 5xx / suspension or
      // daily limit) — so a blank answer can say "down", not "no such wine".
      let down = false;
      // A transient throw on the exact vintage must NOT stop us broadening to
      // the all-vintage average — catch it and fall through to that query.
      try {
        result = await lookupWineSearcher(name, String(vintageParam), cur, auth.userId);
      } catch (e) {
        console.error('[wine-searcher-proxy] exact-vintage lookup failed transiently:', e instanceof Error ? e.message : 'error');
        down = true;
      }
      // Broaden to the all-vintage average when the exact vintage EITHER didn't
      // match OR matched but carries no market price (some vintages list a score
      // but no live price). Keep the exact match's score/anchor when it had them.
      let allVintageScore: number | null = null;
      if (hasRealVintage && !exactOnly && (!result || result.averageMarketPrice == null)) {
        try {
          const allV = await lookupWineSearcher(name, null, cur, auth.userId);
          if (allV && (allV.averageMarketPrice != null || !result)) {
            allVintageScore = allV.criticScore;
            result = result
              ? { ...allV, criticScore: result.criticScore, wsWineId: result.wsWineId ?? allV.wsWineId, wineName: result.wineName ?? allV.wineName }
              : { ...allV, criticScore: null };
            priceScope = 'all-vintage';
          }
        } catch (e) {
          console.error('[wine-searcher-proxy] all-vintage lookup failed transiently:', e instanceof Error ? e.message : 'error');
          down = true;
        }
      }
      // A "match" that names a different wine is no match at all.
      if (result && !sameWine(name, result.wineName)) {
        console.log(`[wine-searcher-proxy] rejected mismatch: query="${name}" ws="${result.wineName}"`);
        result = null;
        allVintageScore = null;
      }
      return { result, priceScope, allVintageScore, down };
    };

    // The catalogue's spelling first. Should Wine-Searcher not know it by that
    // name, the name as written is tried before giving up.
    let attempt = await lookUp(lookupName);
    if (!attempt.result && !attempt.down && lookupName !== wineName) {
      console.log(`[wine-searcher-proxy] catalogue name missed, trying as written: "${wineName}"`);
      attempt = await lookUp(wineName);
    }
    const { result, priceScope, allVintageScore, down } = attempt;

    // Genuine no-match (or both queries down after retries) → the client falls
    // back to a labelled Vinster estimate, so a price is still shown. A genuine
    // miss is remembered (price_scope 'miss') so it isn't re-paid for a week.
    if (!result) {
      if (!down) {
        await supabase.from('pricing_cache').upsert({
          wine_key: wineKey, market_price_avg: null, market_price_min: null, market_price_max: null,
          critic_score: null, currency: cur, price_scope: exactOnly && hasRealVintage ? 'miss-exact' : 'miss', fetched_at: new Date().toISOString(),
        });
      }
      return new Response(JSON.stringify(down ? { ...UNAVAILABLE, down: true } : UNAVAILABLE), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3) Cache native USD so one fetch serves every currency. An all-vintage
    // result is cached under the requested vintage key — for a niche wine that's
    // the figure we want to keep showing for this bottle. Surface upsert errors
    // so a misconfigured RLS / key collision doesn't silently force every call
    // to re-hit the upstream API.
    const { error: cacheErr } = await supabase.from('pricing_cache').upsert({
      wine_key: wineKey,
      market_price_avg: result.averageMarketPrice,
      market_price_min: result.minPrice,
      market_price_max: result.maxPrice,
      // all-vintage rows carry the all-vintage score; a cache hit returns it as
      // allVintageScore, never as this vintage's score.
      critic_score: priceScope === 'all-vintage' ? (result.criticScore ?? allVintageScore) : result.criticScore,
      currency: result.currency,
      // Whether this figure is exact-vintage or the all-vintage fallback, so a
      // cache hit can label it the same way the fresh response does.
      price_scope: priceScope,
      // Only write the anchor when this fetch actually returned one — a matched
      // re-fetch that omits <wine-name-id> must NOT null out a previously cached id.
      ...(result.wsWineId ? { ws_wine_id: result.wsWineId, ws_wine_name: result.wineName } : {}),
      fetched_at: new Date().toISOString(),
    });
    if (cacheErr) {
      console.error('[wine-searcher-proxy] pricing_cache upsert failed:', cacheErr);
    }

    // 3b) Persist the STABLE facts permanently (region / grape / critic score),
    // split from the 30-day price cache above so this match's lasting value
    // survives price expiry — every WS credit spent leaves something behind. Any
    // failure here (e.g. table not yet migrated) is swallowed: enrichment must
    // NEVER affect the price response.
    if (result.region || result.grape || result.criticScore != null) {
      try {
        // Under the catalogue's spelling and the spelling the app asked with,
        // which is the key the app reads these facts back by.
        const fact = {
          region: result.region ?? null,
          grape: result.grape ?? null,
          critic_score: result.criticScore ?? null,
          score_as_of: new Date().toISOString().slice(0, 10),
          verified_at: new Date().toISOString(),
        };
        const { error: factsErr } = await supabase.from('wine_facts').upsert(
          [...new Set([wineKey, asWrittenKey])].map((k) => ({ wine_key: k, ...fact })),
          { onConflict: 'wine_key' },
        );
        if (factsErr) console.error('[wine-searcher-proxy] wine_facts upsert skipped:', factsErr.message);
      } catch (e) {
        console.error('[wine-searcher-proxy] wine_facts upsert threw:', e instanceof Error ? e.message : 'error');
      }
    }

    // pricing_cache (above) holds native USD; the response converts to the
    // user's currency. fxRate is USD→cur, applied to the USD prices.
    return new Response(JSON.stringify({
      matched: true,
      source: 'wine-searcher',
      averageMarketPrice: convert(result.averageMarketPrice, fxRate),
      minPrice: convert(result.minPrice, fxRate),
      maxPrice: convert(result.maxPrice, fxRate),
      criticScore: result.criticScore,
      allVintageScore,
      currency: cur,
      region: result.region,
      grape: result.grape,
      wsWineId: result.wsWineId,
      wsWineName: result.wineName,
      priceScope,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Wine-Searcher proxy error:', err);
    // 200 with an "unavailable" payload (not 5xx) so the client treats it as a
    // clean miss and falls back to the Claude estimate without surfacing an error.
    return new Response(JSON.stringify({ ...UNAVAILABLE, down: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
