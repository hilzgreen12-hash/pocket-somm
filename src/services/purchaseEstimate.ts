import { updateCellarWine } from '../api/cellar';
import { fetchPricing, valueWine } from './pricing';
import { wineQueryName } from '../utils/wineIdentity';
import type { CellarWine, WineDetailsComplete } from '../types/wine';
import { isStandardBottle } from '../utils/bottleValue';

// When a wine is added without a purchase price, Vinster fills one in with the
// market value on the day it was added (marked as an estimate, dated the day it
// was cellared). It stays until the user edits it.
//   'full'   — Wine-Searcher first, then Vinster's own estimate on a miss
//              (single adds: scan, search, manual).
//   'market' — Wine-Searcher only (multi-wine adds, so a long list doesn't fire
//              a Vinster estimate per bottle).
export type PurchaseEstimateMode = 'full' | 'market' | 'none';

function addedDate(w: Pick<CellarWine, 'date_received' | 'created_at'>): string {
  return w.date_received ?? w.created_at;
}

// The market price of a 75cl bottle of this wine: Wine-Searcher first, then
// (mode 'full') Vinster's own estimate. Null when neither has one. Used to fill
// a missing purchase price, and to pre-fill the price on the add forms.
export async function marketValuePer75(
  wine: Pick<CellarWine, 'producer' | 'wine_name' | 'region' | 'vintage' | 'grape_variety'>,
  currency: string,
  mode: 'full' | 'market',
): Promise<{ value: number; currency: string; source: 'wine-searcher' | 'vinster' } | null> {
  const vintage = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;
  const name = wineQueryName(wine.producer, wine.wine_name) || wine.wine_name || '';
  if (!name) return null;
  const p = await fetchPricing(name, Number.isFinite(vintage) ? vintage : null, currency);
  if (p.source === 'wine-searcher' && p.matched !== false && p.averageMarketPrice != null) {
    return { value: p.averageMarketPrice, currency: p.currency ?? currency, source: 'wine-searcher' };
  }
  if (mode !== 'full') return null;
  try {
    const v = await valueWine({
      producer: wine.producer ?? '', wineName: wine.wine_name, region: wine.region ?? '',
      vintage: wine.vintage ?? '', grape: wine.grape_variety ?? null,
    } as unknown as WineDetailsComplete, currency);
    if (v.estimatedValue != null) return { value: v.estimatedValue, currency: v.currency ?? currency, source: v.valueSource };
  } catch { /* unknown wine: no estimate */ }
  return null;
}

export async function estimatePurchasePriceOnAdd(saved: CellarWine, currency: string, mode: PurchaseEstimateMode): Promise<boolean> {
  if (mode === 'none' || saved.archived_at) return false;
  if (saved.purchase_price != null) return false;
  const at = addedDate(saved);

  // Intel came with the add → its value (for this bottle, at its size) is that
  // day's value.
  if (saved.estimated_value != null) {
    await updateCellarWine(saved.id, {
      purchase_price: Number(saved.estimated_value),
      purchase_price_currency: saved.estimated_value_currency ?? currency,
      purchase_price_estimated: true,
      purchase_price_at: at,
    } as Partial<CellarWine>);
    return true;
  }

  // The market lookup prices a 75cl bottle, so it only stands in for a 75cl
  // one; another size gets its estimate when its wine card values it.
  if (!isStandardBottle(saved.bottle_size_ml)) return false;
  const market = await marketValuePer75(saved, currency, mode);
  if (!market) return false;

  await updateCellarWine(saved.id, {
    purchase_price: market.value,
    purchase_price_currency: market.currency,
    purchase_price_estimated: true,
    purchase_price_at: at,
    // Seed the card's market value too when it has none, from the same lookup.
    estimated_value: market.value,
    estimated_value_currency: market.currency,
    estimated_value_source: market.source,
    estimated_value_at: new Date().toISOString(),
  } as Partial<CellarWine>);
  return true;
}
