// A cellar wine's estimated_value is always the market price of a 75cl bottle —
// that's what Wine-Searcher and Vinster price — and is shown as "£XX/75cl".
// What a bottle the user owns is worth comes from its size: a magnum counts as
// two 75cl bottles, a half as half of one.

import type { CellarWine } from '../types/wine';

const STANDARD_ML = 750;

// How many 75cl bottles a bottle of this size holds (1 for unknown sizes).
export function bottlesOf75(ml: number | null | undefined): number {
  return ml && ml > 0 ? ml / STANDARD_ML : 1;
}

// The estimated worth of ONE of this wine's bottles, at its own size.
export function bottleValue(w: Pick<CellarWine, 'estimated_value' | 'bottle_size_ml'>): number | null {
  return w.estimated_value != null ? Number(w.estimated_value) * bottlesOf75(w.bottle_size_ml) : null;
}

// The estimated worth of all the bottles held of this wine.
export function holdingValue(w: Pick<CellarWine, 'estimated_value' | 'bottle_size_ml' | 'quantity'>): number | null {
  const v = bottleValue(w);
  return v != null ? v * (w.quantity ?? 0) : null;
}

// A price for a bottle of this size, from a 75cl price (rounded to whole units).
export function priceForSize(per75: number, ml: number | null | undefined): number {
  return Math.round(per75 * bottlesOf75(ml));
}

// A 75cl price from the price of a bottle of this size.
export function per75From(bottlePrice: number, ml: number | null | undefined): number {
  return bottlePrice / bottlesOf75(ml);
}

export const PER_75CL = '/75cl';
