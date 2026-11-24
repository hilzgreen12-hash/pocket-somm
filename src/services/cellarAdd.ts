import { findCellarWineByIdentity, getCellarWineById, updateCellarWine, type NewCellarWine } from '../api/cellar';
import { uploadLabelImage } from '../api/labelPhotos';
import { findSameCellarWine } from '../utils/wineMatch';
import { normaliseVintage } from '../utils/wineIdentity';
import { isStandardBottle } from '../utils/bottleValue';
import type { CellarWine, WineDetailsComplete } from '../types/wine';

// Shared steps for adding a wine to the cellar from the label flows (the Add
// form on Wine Intel / Add Wine, a rack slot, a bin diamond): one row shape,
// one duplicate check, one rule for what a merge carries over.

// What the user paid per bottle, at the bottle's own size. `estimated` marks a
// price Vinster filled in that the user never touched.
export interface PurchaseInput {
  price: number | null;
  currency: string;
  estimated: boolean;
}

// A 75cl market price already looked up for the form, kept as the card's value
// when the bottle is a 75cl one (another size is valued as its own format).
export interface MarketValueInput {
  per75: number;
  currency: string;
  source: string;
}

export function newCellarWinePayload(args: {
  userId: string;
  wine: Pick<WineDetailsComplete, 'producer' | 'wineName' | 'region' | 'vintage' | 'style' | 'grape'>;
  quantity: number;
  bottleSizeMl: number;
  purchase?: PurchaseInput | null;
  marketValue?: MarketValueInput | null;
}): NewCellarWine {
  const { wine, purchase } = args;
  const marketValue = isStandardBottle(args.bottleSizeMl) ? args.marketValue : null;
  const producer = wine.producer.trim();
  const vintage = (wine.vintage ?? '').trim();
  const paid = purchase?.price != null ? purchase : null;
  return {
    user_id: args.userId,
    producer,
    wine_name: wine.wineName?.trim() || producer,
    region: wine.region?.trim() || null,
    // A typed "nv" or "Non-vintage" is stored as NV, so it matches on re-add.
    vintage: normaliseVintage(vintage) ?? (vintage || null),
    style: wine.style?.trim() || null,
    grape_variety: wine.grape?.trim() || null,
    quantity: Math.max(1, args.quantity),
    bottle_size_ml: args.bottleSizeMl,
    date_received: new Date().toISOString().split('T')[0],
    drinking_window_status: 'unknown',
    purchase_price: paid?.price ?? null,
    purchase_price_currency: paid?.currency ?? null,
    purchase_price_estimated: paid?.estimated ?? false,
    estimated_value: marketValue?.per75 ?? null,
    estimated_value_currency: marketValue?.currency ?? null,
    estimated_value_source: marketValue?.source ?? null,
    estimated_value_at: marketValue ? new Date().toISOString() : null,
  };
}

// The line these bottles would join: the same wine, vintage and bottle size (a
// magnum is always its own line). Read live, not from a possibly-stale cache —
// a cache hit is re-read for its current count, and a miss is checked against
// the database before a new line is created.
export async function findSameWineLive(
  userId: string,
  cached: readonly CellarWine[],
  candidate: NewCellarWine,
): Promise<CellarWine | null> {
  const sizeMl = candidate.bottle_size_ml ?? 750;
  const hit = findSameCellarWine(cached, candidate, sizeMl);
  if (hit) {
    const live = await getCellarWineById(hit.id);
    if (live && !live.archived_at) return live;
  }
  return findCellarWineByIdentity(userId, candidate, sizeMl);
}

// What a merge changes on the existing line besides its count: the price the
// user typed, when the line has no price of their own (none, or only Vinster's
// estimate). A price they entered before is kept.
export function purchaseOnMerge(existing: CellarWine, purchase?: PurchaseInput | null): Partial<CellarWine> {
  if (purchase?.price == null || purchase.estimated) return {};
  if (existing.purchase_price != null && !existing.purchase_price_estimated) return {};
  return {
    purchase_price: purchase.price,
    purchase_price_currency: purchase.currency,
    purchase_price_estimated: false,
    purchase_price_at: new Date().toISOString(),
  };
}

// Use the scanned label as the wine's photo when it has none. Best-effort: a
// failed upload never undoes the add.
export async function attachLabelIfMissing(
  userId: string,
  wine: Pick<CellarWine, 'id' | 'label_image_path'>,
  labelUri: string | null,
): Promise<void> {
  if (!labelUri || wine.label_image_path) return;
  try {
    const path = await uploadLabelImage(userId, labelUri, wine.id);
    await updateCellarWine(wine.id, { label_image_path: path });
  } catch (err) {
    console.warn('[label-photo] upload failed (non-fatal):', err);
  }
}
