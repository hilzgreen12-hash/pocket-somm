// A cellar wine's estimated_value is what ONE of its bottles is worth at its own
// size: a 75cl bottle's market price, or for a magnum, half bottle or large
// format, the value of that format (rarity sets those prices, so they're never
// worked out from the 75cl price). Shown as "£XX/150cl" etc.

import type { CellarWine } from '../types/wine';
import { bottleSizeCl } from '../components/BottleSizePicker';

const STANDARD_ML = 750;

// A standard 75cl bottle (an unknown size counts as one).
export function isStandardBottle(ml: number | null | undefined): boolean {
  return !ml || ml === STANDARD_ML;
}

// The estimated worth of ONE of this wine's bottles.
export function bottleValue(w: Pick<CellarWine, 'estimated_value'>): number | null {
  return w.estimated_value != null ? Number(w.estimated_value) : null;
}

// The estimated worth of all the bottles held of this wine.
export function holdingValue(w: Pick<CellarWine, 'estimated_value' | 'quantity'>): number | null {
  const v = bottleValue(w);
  return v != null ? v * (w.quantity ?? 0) : null;
}

// The size a value is for, after the figure: "/75cl", "/150cl".
export function perBottle(ml: number | null | undefined): string {
  return `/${bottleSizeCl(ml || STANDARD_ML)}cl`;
}

// A market price shown on its own (a scanned wine, not a bottle the user owns)
// is for a standard bottle.
export const PER_75CL = perBottle(STANDARD_ML);
