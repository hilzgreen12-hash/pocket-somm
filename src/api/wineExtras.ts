import { invokeResilient } from './invokeResilient';
import type { CellarWine, WineServingSuggestion, WineMarketVintageNote } from '../types/wine';

// Identity payload shared by the two on-demand wine-card generators.
function identity(w: CellarWine) {
  return {
    producer: w.producer ?? '',
    wineName: w.wine_name ?? '',
    region: w.region ?? '',
    vintage: w.vintage ?? '',
    grape: w.grape_variety ?? '',
    style: w.style ?? '',
  };
}

// Generate "how to serve this wine" on demand (temperature / decant / glassware
// + a wine to enjoy before and after). Caller caches the result on the wine.
// decantTime: the user's own words for how long they have (Ask Vinster), so
// the decanting advice fits.
export async function generateServingSuggestion(w: CellarWine, decantTime?: string): Promise<WineServingSuggestion> {
  const data = await invokeResilient('wine-serving-suggestion', { ...identity(w), ...(decantTime ? { decantTime } : {}) }) as WineServingSuggestion & { error?: string };
  if (data?.error) throw new Error(data.error);
  return data;
}

// Serve tab → "Classic Pairing Ingredients": three proteins, three herbs &
// spices and three vegetables that pair classically with this wine.
export type PairingIngredient = { name: string; type: 'protein' | 'herb' | 'vegetable' };
export async function generatePairingIngredients(w: CellarWine): Promise<PairingIngredient[]> {
  const data = await invokeResilient('wine-serving-suggestion', { ...identity(w), mode: 'ingredients' }) as { ingredients?: PairingIngredient[]; error?: string };
  if (data?.error) throw new Error(data.error);
  return (data?.ingredients ?? []).slice(0, 9);
}

// "Wider market" for the Serve tab: three styles to buy for before/after this
// wine (each with a reason and price range), when the cellar has nothing fit.
type MarketStyle = { style: string; reason: string; priceRange: string };
export async function suggestMarketStyles(w: CellarWine, slot: 'before' | 'after', suggested: string, currency: string): Promise<MarketStyle[]> {
  const data = await invokeResilient('wine-serving-suggestion', { ...identity(w), mode: 'market', slot, suggested, currency }) as { styles?: MarketStyle[]; error?: string };
  if (data?.error) throw new Error(data.error);
  return data?.styles ?? [];
}

// Vinster's Verdict for the vintage table: a considered judgement (age, drinking
// window, rarity, recommendation) that doesn't restate the ranks shown above it.
export async function generateVintageVerdict(w: CellarWine, input: {
  rows: { vintage: number; score: number | null; price: number | null }[];
  currency: string;
  qualityRank: number | null;
  valueRank: number | null;
  total: number;
  bestValueVintage: number | null;
  window?: { from?: number | string | null; to?: number | string | null; status?: string | null } | null;
  rarity?: string | null;
  // 'range' = no single vintage chosen (Home → Compare Vintages → Dive Deeper).
  scope?: 'range';
}): Promise<VintageVerdictAI | null> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), mode: 'verdict', ...input }) as VintageVerdictAI & { error?: string };
  if (data?.error) throw new Error(data.error);
  if (!data?.verdict && !data?.drinkNow && !data?.layDown) return null;
  return { verdict: data.verdict ?? null, drinkNow: data.drinkNow ?? null, layDown: data.layDown ?? null };
}
type VintagePick = { vintages: number[]; reason: string };
export type VintageVerdictAI = { verdict: string | null; drinkNow: VintagePick | null; layDown: VintagePick | null };

// Generate Vinster's Market & Vintage Comparison on demand. Returns null when
// the server's recognition gate says the model doesn't genuinely know this wine
// (identified !== true / no text) — the caller shows an honest line instead.
export async function generateMarketVintage(w: CellarWine, currency?: string | null): Promise<WineMarketVintageNote | null> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), currency: currency ?? 'GBP' }) as
    { vintage?: string | null; market?: string | null; identified?: boolean; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified === false || (!data?.vintage && !data?.market)) return null;
  return { vintage: data.vintage ?? undefined, market: data.market ?? undefined };
}

// Vinster's rarity assessment (wine card Market tab). Null when the recognition
// gate says Vinster doesn't genuinely know this wine.
type WineRarity = { level: number; label: string; text: string };
export async function generateRarity(w: CellarWine): Promise<WineRarity | null> {
  const data = await invokeResilient('wine-market-vintage', { ...identity(w), mode: 'rarity' }) as
    { identified?: boolean; level?: number | null; label?: string | null; text?: string | null; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified !== true || !data.level || !data.text) return null;
  return { level: data.level, label: data.label ?? '', text: data.text };
}

// What ONE bottle of this wine is worth in a size other than 75cl (Vinster's
// estimate, with the 75cl price as its reference — formats aren't priced by
// volume). Null when Vinster doesn't know the wine or couldn't price it.
export type FormatValue = { value: number; low: number | null; high: number | null; confidence: 'high' | 'medium' | 'low' };
export async function estimateFormatValue(
  wine: { producer?: string | null; wineName?: string | null; region?: string | null; vintage?: string | null; grape?: string | null },
  bottleSizeMl: number,
  reference: { value: number; low: number | null; high: number | null; source: string } | null,
  currency: string,
): Promise<FormatValue | null> {
  const data = await invokeResilient('wine-market-vintage', {
    producer: wine.producer ?? '', wineName: wine.wineName ?? '', region: wine.region ?? '',
    vintage: wine.vintage ?? '', grape: wine.grape ?? '',
    mode: 'format-value', bottleSizeMl, reference, currency,
  }) as { identified?: boolean; estimatedValue?: number | null; low?: number | null; high?: number | null; confidence?: FormatValue['confidence'] | null; error?: string };
  if (data?.error) throw new Error(data.error);
  if (data?.identified !== true || !data.estimatedValue) return null;
  return { value: data.estimatedValue, low: data.low ?? null, high: data.high ?? null, confidence: data.confidence ?? 'low' };
}
