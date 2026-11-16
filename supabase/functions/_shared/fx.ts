// Currency conversion from daily ECB rates (frankfurter.dev, no key), cached in
// the fx_rates table as "1 USD = <rate> <currency>" and refreshed at most once a
// day. Shared by wine-searcher-proxy (market prices) and scan-start (budgets).
import type { SupabaseClient } from 'npm:@supabase/supabase-js';

// Every currency the ECB publishes (USD = base), so a wine list from Prague,
// Stockholm or Cape Town can still be checked against the diner's budget.
const FX_TARGETS = [
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR',
  'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR',
];
const FX_TTL_MS = 24 * 60 * 60 * 1000;

// "1 USD = <rate> <target>", or null when no rate is known (an unsupported
// currency, or the rate service down with nothing cached). Falls back to a
// stale cached rate before giving up.
export async function getUsdRate(admin: SupabaseClient, target: string): Promise<number | null> {
  const t = (target ?? 'USD').toUpperCase();
  if (t === 'USD') return 1;

  const { data: row } = await admin.from('fx_rates').select('rate, fetched_at').eq('currency', t).maybeSingle();
  if (row && Date.now() - new Date(row.fetched_at).getTime() < FX_TTL_MS) return Number(row.rate);

  try {
    const res = await fetch(`https://api.frankfurter.dev/v1/latest?from=USD&to=${FX_TARGETS.join(',')}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) {
      const rates: Record<string, unknown> = (await res.json())?.rates ?? {};
      const now = new Date().toISOString();
      const upserts = Object.entries(rates)
        .filter(([, r]) => typeof r === 'number' && Number.isFinite(r))
        .map(([currency, rate]) => ({ currency, rate, fetched_at: now }));
      upserts.push({ currency: 'USD', rate: 1, fetched_at: now });
      await admin.from('fx_rates').upsert(upserts);
      const fresh = rates[t];
      if (typeof fresh === 'number' && Number.isFinite(fresh)) return fresh;
    }
  } catch (e) {
    console.error('[fx] rate refresh failed:', e);
  }

  return row && Number.isFinite(Number(row.rate)) ? Number(row.rate) : null;
}

// Multiplier turning an amount in `from` into `to`, or null when either rate is
// unknown — callers must then leave the amount unconverted, never guess.
export async function conversionRate(admin: SupabaseClient, from: string, to: string): Promise<number | null> {
  const f = from.toUpperCase();
  const t = to.toUpperCase();
  if (f === t) return 1;
  const [fromRate, toRate] = await Promise.all([getUsdRate(admin, f), getUsdRate(admin, t)]);
  return fromRate && toRate ? toRate / fromRate : null;
}
