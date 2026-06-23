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
// Wine-Searcher's account returns prices in USD. We convert to the user's
// selected currency using ECB rates (frankfurter.app, no key), cached in the
// fx_rates table and refreshed at most once a day. pricing_cache always stores
// the native USD value, so a single WS fetch serves every currency.
const FX_TARGETS = ['GBP', 'EUR', 'AUD', 'CAD', 'NZD', 'JPY', 'CHF', 'HKD', 'SGD']; // USD = base
const FX_TTL_MS = 24 * 60 * 60 * 1000;

// Returns "1 USD = <rate> <target>". USD → 1. Falls back to a stale cached rate,
// then to 1 (USD passthrough), so an FX outage never breaks the price path.
async function getUsdRate(target: string): Promise<number> {
  const t = (target ?? 'USD').toUpperCase();
  if (t === 'USD') return 1;

  const { data: row } = await supabase
    .from('fx_rates')
    .select('rate, fetched_at')
    .eq('currency', t)
    .single();
  if (row && Date.now() - new Date(row.fetched_at).getTime() < FX_TTL_MS) {
    return Number(row.rate);
  }

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${FX_TARGETS.join(',')}`);
    if (res.ok) {
      const body = await res.json();
      const rates = body?.rates ?? {};
      const now = new Date().toISOString();
      const upserts = Object.entries(rates)
        .filter(([, r]) => typeof r === 'number' && Number.isFinite(r))
        .map(([currency, rate]) => ({ currency, rate, fetched_at: now }));
      upserts.push({ currency: 'USD', rate: 1, fetched_at: now });
      if (upserts.length) await supabase.from('fx_rates').upsert(upserts);
      const fresh = rates[t];
      if (typeof fresh === 'number' && Number.isFinite(fresh)) return fresh;
    }
  } catch (e) {
    console.error('[wine-searcher-proxy] FX refresh failed:', e);
  }

  // Upstream FX unavailable — use the stale cached rate if we have one.
  if (row && Number.isFinite(Number(row.rate))) return Number(row.rate);
  return 1;
}

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
};

Deno.serve(async (req) => {
  try {
    const { wineName, vintage, currency } = await req.json();

    if (!wineName) {
      return new Response(JSON.stringify({ error: 'wineName required' }), { status: 400 });
    }

    const cur = (currency ?? 'GBP').toString().toUpperCase();
    const vintageParam = vintage ?? 'NV';
    // This endpoint returns one fixed currency per account (no currency
    // param), so the same wine+vintage is a single cache entry.
    const wineKey = `${wineName}_${vintageParam}`;

    // USD→user-currency rate, applied to the (USD) prices on the way out.
    const fxRate = await getUsdRate(cur);

    // 1) Cache hit within TTL → serve immediately.
    const { data: cached } = await supabase
      .from('pricing_cache')
      .select('*')
      .eq('wine_key', wineKey)
      .single();

    if (cached) {
      const ageDays = (Date.now() - new Date(cached.fetched_at).getTime()) / 86_400_000;
      if (ageDays < CACHE_TTL_DAYS) {
        return new Response(
          JSON.stringify({
            matched: cached.market_price_avg != null || cached.critic_score != null,
            // Cached values are native USD — convert to the requested currency.
            averageMarketPrice: convert(cached.market_price_avg, fxRate),
            minPrice: convert(cached.market_price_min, fxRate),
            maxPrice: convert(cached.market_price_max, fxRate),
            criticScore: cached.critic_score,
            currency: cur,
            source: 'wine-searcher',
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // 2) Call Wine-Searcher.
    const url = WINE_SEARCHER_URL
      .replace('{KEY}', WINE_SEARCHER_API_KEY)
      .replace('{NAME}', encodeURIComponent(wineName))
      .replace('{VINTAGE}', encodeURIComponent(String(vintageParam)))
      .replace('{CURRENCY}', encodeURIComponent(cur));

    const wsResponse = await fetch(url);
    if (!wsResponse.ok) {
      throw new Error(`Wine-Searcher returned ${wsResponse.status}`);
    }
    const xml = await wsResponse.text();

    // return-code 0 = hit. Anything else (e.g. 7 = "API Access Suspended", or a
    // genuine no-match) → fall back to the Claude estimate.
    const returnCode = tag(xml, 'return-code');
    if (returnCode !== '0') {
      return new Response(JSON.stringify(UNAVAILABLE), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const pricing = {
      matched: true,
      source: 'wine-searcher' as const,
      averageMarketPrice: num(xml, 'price-average'),
      minPrice: num(xml, 'price-min'),
      maxPrice: num(xml, 'price-max'),
      criticScore: num(xml, 'ws-score'),
      currency: tag(xml, 'list-currency-code') ?? cur,
      region: tag(xml, 'region'),
      grape: tag(xml, 'grape'),
      wsWineId: tag(xml, 'wine-name-id'),
    };

    // 3) Cache. Surface upsert errors so a misconfigured RLS / key collision
    // doesn't silently force every call to re-hit the upstream API.
    const { error: cacheErr } = await supabase.from('pricing_cache').upsert({
      wine_key: wineKey,
      market_price_avg: pricing.averageMarketPrice,
      market_price_min: pricing.minPrice,
      market_price_max: pricing.maxPrice,
      critic_score: pricing.criticScore,
      currency: pricing.currency,
      fetched_at: new Date().toISOString(),
    });
    if (cacheErr) {
      console.error('[wine-searcher-proxy] pricing_cache upsert failed:', cacheErr);
    }

    // pricing_cache (above) holds native USD; the response converts to the
    // user's currency. fxRate is USD→cur, applied to the USD prices.
    return new Response(JSON.stringify({
      ...pricing,
      averageMarketPrice: convert(pricing.averageMarketPrice, fxRate),
      minPrice: convert(pricing.minPrice, fxRate),
      maxPrice: convert(pricing.maxPrice, fxRate),
      currency: cur,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Wine-Searcher proxy error:', err);
    // 200 with an "unavailable" payload (not 5xx) so the client treats it as a
    // clean miss and falls back to the Claude estimate without surfacing an error.
    return new Response(JSON.stringify(UNAVAILABLE), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
