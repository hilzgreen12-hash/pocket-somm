import { updateCellarWine } from '../api/cellar';
import { fetchPricing, valueWine } from './pricing';
import { wineQueryName } from '../utils/wineIdentity';
import type { CellarWine, WineDetailsComplete } from '../types/wine';

// When a wine is added without a purchase price, Vinster fills one in with the
// market value on the day it was added (marked as an estimate, dated the day it
// was cellared). It stays until the user edits it.
//   'full'   — Wine-Searcher first, then Vinster's own estimate on a miss
//              (single adds: scan, search, manual).
//   'market' — Wine-Searcher only (multi-wine adds, so a long list doesn't fire
//              a Vinster estimate per bottle).
export type PurchaseEstimateMode = 'full' | 'market' | 'none';

export function addedDate(w: Pick<CellarWine, 'date_received' | 'created_at'>): string {
  return w.date_received ?? w.created_at;
}

export async function estimatePurchasePriceOnAdd(saved: CellarWine, currency: string, mode: PurchaseEstimateMode): Promise<boolean> {
  if (mode === 'none' || saved.is_wishlist || saved.archived_at) return false;
  if (saved.purchase_price != null) return false;
  const at = addedDate(saved);

  // Intel came with the add → its market value is that day's value.
  if (saved.estimated_value != null) {
    await updateCellarWine(saved.id, {
      purchase_price: Number(saved.estimated_value),
      purchase_price_currency: saved.estimated_value_currency ?? currency,
      purchase_price_estimated: true,
      purchase_price_at: at,
    } as Partial<CellarWine>);
    return true;
  }

  const vintage = saved.vintage && saved.vintage !== 'NV' ? Number(saved.vintage) : null;
  const name = wineQueryName(saved.producer, saved.wine_name) || saved.wine_name || '';
  let value: number | null = null;
  let valueCurrency = currency;
  let source: 'wine-searcher' | 'vinster' = 'wine-searcher';

  const p = await fetchPricing(name, Number.isFinite(vintage) ? vintage : null, currency);
  if (p.source === 'wine-searcher' && p.matched !== false && p.averageMarketPrice != null) {
    value = p.averageMarketPrice;
    valueCurrency = p.currency ?? currency;
  } else if (mode === 'full') {
    try {
      const v = await valueWine({
        producer: saved.producer ?? '', wineName: saved.wine_name, region: saved.region ?? '',
        vintage: saved.vintage ?? '', grape: saved.grape_variety ?? null,
      } as unknown as WineDetailsComplete, currency);
      if (v.estimatedValue != null) { value = v.estimatedValue; valueCurrency = v.currency ?? currency; source = v.valueSource; }
    } catch { /* unknown wine: leave the price blank */ }
  }
  if (value == null) return false;

  await updateCellarWine(saved.id, {
    purchase_price: value,
    purchase_price_currency: valueCurrency,
    purchase_price_estimated: true,
    purchase_price_at: at,
    // Seed the card's market value too when it has none, from the same lookup.
    estimated_value: value,
    estimated_value_currency: valueCurrency,
    estimated_value_source: source,
    estimated_value_at: new Date().toISOString(),
  } as Partial<CellarWine>);
  return true;
}
