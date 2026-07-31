import { z } from 'zod';
import { callRecommend } from '../api/claude';
import type { ExtractedWine, RecommendationResponse, WineRecommendation } from '../types/wine';

interface RecommendInput {
  wines: ExtractedWine[];
  wineTypes: string[];
  styleProfiles: string[];
  budget: number | null;
  foodPairing: string;
  favouriteRegions: string[];
  favouriteGrapes: string[];
  dislikedRegions: string[];
  dislikedGrapes: string[];
  excludeWines?: string[];
  topScoringMode?: boolean;
  profileWineTypes?: string[];
  profileStyleProfiles?: string[];
  currency?: string;
}

const VintageAssessmentSchema = z.object({
  label: z.enum(['Exceptional', 'Excellent', 'Good', 'Average', 'Challenging', 'Poor']),
  notes: z.string(),
});

const DrinkingWindowSchema = z.object({
  from: z.number().nullable(),
  to: z.number().nullable(),
  status: z.enum(['Too Young', 'Approaching', 'Peak', 'Fading', 'Past Peak']),
  notes: z.string(),
});

const RarityAssessmentSchema = z.object({
  label: z.enum(['Very Rare', 'Rare', 'Uncommon', 'Widely Available']),
  notes: z.string(),
});

const WineRecommendationSchema = z.object({
  name: z.string(),
  producer: z.string(),
  region: z.string(),
  appellation: z.string().optional(),
  grape: z.string().optional(),
  vintage: z.number().nullable(),
  // NB: price + currency are deliberately NOT read from the model. Vinster does
  // not accept a model-supplied price — the list price is real data, set from
  // the scanned menu (OCR) in recommendWines() below. Any price the model
  // returns is ignored here.
  rationale: z.string(),
  criticScore: z.number().min(0).max(100),
  vintageAssessment: VintageAssessmentSchema,
  drinkingWindow: DrinkingWindowSchema,
  rarityAssessment: RarityAssessmentSchema,
  outsidePreferences: z.string().nullable().optional(),
  topPickReasons: z.array(z.string()).nullable().optional(),
  // Labelled parameter notes (see WineRecommendation). Optional so a
  // response from the pre-upgrade edge function still validates.
  criticScoreNote: z.string().nullable().optional(),
  // valueNote is the FALLBACK value estimate, shown on the results screen only
  // when live Wine-Searcher market data isn't available for the wine. When WS
  // has data, the real WS comparison is shown instead. The menu price it
  // references is always the real one (from OCR) — only the market retail side
  // is an estimate.
  valueNote: z.string().nullable().optional(),
  standoutNote: z.string().nullable().optional(),
});

const RecommendationResponseSchema = z.object({
  // No .min(1): an empty result is a legitimate outcome (every wine filtered
  // out by budget/preferences), not a malformed response. Rejecting it here
  // would surface a generic parse error; extracting.tsx checks the length
  // instead and shows actionable copy about widening the filters.
  wines: z.array(WineRecommendationSchema).max(3),
  summary: z.string(),
  topScoringMode: z.boolean().optional(),
});

// Normalised key for matching a recommendation back to the scanned list.
const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Find the extracted (OCR'd) wine that a recommendation corresponds to, so we can
// read its real menu price. Claude echoes producer/name closely, so match on
// producer+name+vintage, loosening progressively.
function matchExtracted(rec: { producer: string; name: string; vintage: number | null }, list: ExtractedWine[]): ExtractedWine | null {
  const rp = norm(rec.producer), rn = norm(rec.name), rv = rec.vintage;
  const cands = [
    (e: ExtractedWine) => norm(e.producer) === rp && norm(e.name) === rn && e.vintage === rv,
    (e: ExtractedWine) => norm(e.producer) === rp && norm(e.name) === rn,
    (e: ExtractedWine) => norm(e.name) === rn && e.vintage === rv,
  ];
  for (const pred of cands) {
    const hits = list.filter(pred);
    if (hits.length === 1) return hits[0]; // unambiguous only
  }
  return null;
}

export async function recommendWines(input: RecommendInput): Promise<RecommendationResponse> {
  const raw = await callRecommend(input);
  const parsed = RecommendationResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Could not parse recommendation response.');
  }
  // INTEGRITY — Vinster never invents or re-states a price. The recommender's
  // job is to select and analyse REAL wines from the scanned list; the price is
  // real data, taken ONLY from the menu the diner is holding (OCR extraction).
  // So the list price is set solely from the matching scanned wine — and if a
  // pick can't be matched to a listed wine unambiguously, its price is left null
  // (unknown) rather than shown as a guess. Market comparison is done separately,
  // against live Wine-Searcher data, on the results screen.
  const scanCurrency = (input.currency || 'GBP').toUpperCase();
  const wines: WineRecommendation[] = parsed.data.wines.map((w) => {
    const match = matchExtracted(w, input.wines);
    return {
      ...w,
      menuPrice: match ? match.menuPrice : null,
      currency: match?.currency || scanCurrency,
    };
  });
  return { ...parsed.data, wines };
}
