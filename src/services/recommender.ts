import { z } from 'zod';
import { callRecommend } from '../api/claude';
import { wineNameKey } from '../utils/wineIdentity';
import type { ExtractedWine, RecommendationResponse, WineRecommendation } from '../types/wine';

interface RecommendInput {
  wines: ExtractedWine[];
  wineTypes: string[];
  styleProfiles: string[];
  budget: number | null;
  budgetMin?: number | null;
  foodPairing: string;
  preferredCountry?: string;
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
  appellation: z.string().nullish().transform((v) => v ?? undefined),
  grape: z.string().nullish().transform((v) => v ?? undefined),
  vintage: z.number().nullable(),
  // NB: price + currency are deliberately NOT read from the model. Vinster does
  // not accept a model-supplied price — the list price is real data, set from
  // the scanned menu (OCR) in recommendWines() below. Any price the model
  // returns is ignored here.
  // rationale ("Vinster's Review") is no longer generated up front — it's
  // fetched on demand when the diner expands the chevron (see vinster-review
  // edge fn), so the main 3-wine call stays light. Optional for back-compat
  // with older cached scans that still carry it.
  rationale: z.string().nullish(),
  // null = Vinster has no critic data for this wine (never invented) — read as 0,
  // which the results screen shows as "no score".
  criticScore: z.number().min(0).max(100).nullable().transform((v) => v ?? 0),
  vintageAssessment: VintageAssessmentSchema,
  drinkingWindow: DrinkingWindowSchema,
  rarityAssessment: RarityAssessmentSchema,
  outsidePreferences: z.string().nullable().optional(),
  topPickReasons: z.array(z.string()).nullable().optional(),
  // Labelled parameter notes (see WineRecommendation). Optional so a
  // response from the pre-upgrade edge function still validates.
  criticScoreNote: z.string().nullable().optional(),
  // Vinster's own holistic score for the pick (drives the headline number) and a
  // one-line tasting note. Unlisted fields are stripped by zod, so both must be
  // named here or they never reach the results screen.
  vinsterScore: z.number().min(0).max(100).nullish(),
  flavourProfile: z.string().nullish(),
  // valueNote is the FALLBACK value estimate, shown on the results screen only
  // when live Wine-Searcher market data isn't available for the wine. When WS
  // has data, the real WS comparison is shown instead. The menu price it
  // references is always the real one (from OCR) — only the market retail side
  // is an estimate.
  valueNote: z.string().nullable().optional(),
  standoutNote: z.string().nullable().optional(),
  // Set only when an already-seen wine is deliberately re-recommended on an
  // "alternative list" — the explicit "Vinster is recommending this again…" note.
  repeatNote: z.string().nullable().optional(),
});

// Put a raw pick into the accepted shape before checking it — the same rules
// scan-start applies on the server, so the alternative-picks path (which calls
// recommend directly) is just as forgiving: missing labels get a neutral value,
// empty optional text is dropped, a missing score becomes 0 ("no score").
const VINTAGE_LABELS = ['Exceptional', 'Excellent', 'Good', 'Average', 'Challenging', 'Poor'];
const WINDOW_STATUSES = ['Too Young', 'Approaching', 'Peak', 'Fading', 'Past Peak'];
const RARITY_LABELS = ['Very Rare', 'Rare', 'Uncommon', 'Widely Available'];
function tidyPick(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const w = raw as Record<string, any>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
  const text = (v: unknown) => (typeof v === 'string' ? v : '');
  const va = w.vintageAssessment ?? {};
  const dw = w.drinkingWindow ?? {};
  const ra = w.rarityAssessment ?? {};
  const score = num(w.criticScore);
  return {
    ...w,
    name: text(w.name), producer: text(w.producer), region: text(w.region),
    vintage: num(w.vintage),
    criticScore: score != null && score >= 0 && score <= 100 ? score : 0,
    vintageAssessment: { label: VINTAGE_LABELS.includes(va.label) ? va.label : 'Good', notes: text(va.notes) },
    drinkingWindow: { from: num(dw.from), to: num(dw.to), status: WINDOW_STATUSES.includes(dw.status) ? dw.status : 'Peak', notes: text(dw.notes) },
    rarityAssessment: { label: RARITY_LABELS.includes(ra.label) ? ra.label : 'Widely Available', notes: text(ra.notes) },
  };
}

const RecommendationResponseSchema = z.object({
  // No .min(1): an empty result is a legitimate outcome (every wine filtered
  // out by budget/preferences), not a malformed response. Rejecting it here
  // would surface a generic parse error; extracting.tsx checks the length
  // instead and shows actionable copy about widening the filters.
  // Each pick is checked on its own (finalizeRecommendation), so one odd pick
  // can't throw away the others.
  wines: z.array(z.unknown()).max(3),
  summary: z.string().nullish().transform((v) => v ?? ''),
  topScoringMode: z.boolean().optional(),
});

// Normalised key for matching a recommendation back to the scanned list.
const norm = (s: string | null | undefined) => (s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Find the extracted (OCR'd) wine that a recommendation corresponds to, so we can
// read its real menu price. Uses the app's tolerant `wineNameKey` (accent-,
// article- and word-order-insensitive, strips embedded vintages) so an accented
// French name the model echoes as "Château" still matches OCR's "Chateau" — the
// old exact-`norm` compare turned "château" into "ch teau" and lost the price on
// 2 of 3 picks. Progressive tiers, unambiguous-only so we never attach a wrong
// price: full identity + vintage → full identity → name + vintage → name.
// A grape or blend as an order-free key: "Sauvignon Blanc - Assyrtiko" and
// "Assyrtiko/Sauvignon Blanc" are the same blend.
const grapeKey = (g: string | null | undefined) =>
  (g ?? '').split(/[\/,&+–-]|\band\b/).map(norm).filter(Boolean).sort().join('|');

// One row from several matches, only when it's clear which: a single hit; or,
// for a wine listed more than once (by the glass and by the bottle), the single
// full-bottle row; or rows that all carry the same price; or — for two wines
// sharing a name, like an estate's white and red both listed as "Alpha Estate" —
// the single row with the pick's grape. Otherwise none: the price is left
// unknown rather than guessed.
function unambiguous(hits: ExtractedWine[], grape?: string | null): ExtractedWine | null {
  if (hits.length === 1) return hits[0];
  if (hits.length === 0) return null;
  const bottles = hits.filter((e) => !e.format || e.format === 'bottle');
  if (bottles.length === 1) return bottles[0];
  if (bottles.length > 1 && new Set(bottles.map((e) => e.menuPrice)).size === 1) return bottles[0];
  const g = grapeKey(grape);
  if (g && bottles.length > 1) {
    const sameGrape = bottles.filter((e) => grapeKey(e.grape) === g);
    if (sameGrape.length === 1) return sameGrape[0];
  }
  return null;
}

function matchExtracted(rec: { producer: string; name: string; vintage: number | null; grape?: string | null }, list: ExtractedWine[]): ExtractedWine | null {
  const rKey = wineNameKey(rec.producer, rec.name);
  const rNameKey = wineNameKey(null, rec.name);
  const rv = rec.vintage;
  if (!rKey) return null;
  const cands: Array<(e: ExtractedWine) => boolean> = [
    (e) => wineNameKey(e.producer, e.name) === rKey && e.vintage === rv,
    (e) => wineNameKey(e.producer, e.name) === rKey,
    (e) => !!rNameKey && wineNameKey(null, e.name) === rNameKey && e.vintage === rv,
    (e) => !!rNameKey && wineNameKey(null, e.name) === rNameKey,
  ];
  for (const pred of cands) {
    const hit = unambiguous(list.filter(pred), rec.grape);
    if (hit) return hit;
  }
  // Final safe fallback: token-SUBSET match. The model sometimes restates a pick's
  // name more (or less) fully than OCR read it — e.g. it echoes the full
  // "Producer, Vineyard, Cuvée" while the menu row was terser, so the exact key
  // differs and the price is lost even though it's clearly the same wine. Match
  // when one identity's meaningful tokens are a subset of the other's, requiring a
  // UNIQUE hit AND the SAME vintage — so a terser, cheaper generic row of a
  // different wine (e.g. a village bottling that's a subset of a 1er-Cru pick)
  // can't lend its price to the pick.
  const rTok = new Set(rKey.split(' ').filter((t) => t.length >= 3));
  if (rTok.size >= 2) {
    const subset = (a: Set<string>, b: Set<string>) => { for (const t of a) if (!b.has(t)) return false; return true; };
    const subsetHits = list.filter((e) => {
      if (e.vintage !== rv) return false; // same vintage only — guards against generic same-producer rows
      const eTok = new Set(wineNameKey(e.producer, e.name).split(' ').filter((t) => t.length >= 3));
      if (eTok.size < 2) return false;
      return rTok.size <= eTok.size ? subset(rTok, eTok) : subset(eTok, rTok);
    });
    if (subsetHits.length === 1) return subsetHits[0]; // unique same-vintage subset only
  }
  return null;
}

export async function recommendWines(input: RecommendInput): Promise<RecommendationResponse> {
  const raw = await callRecommend(input);
  return finalizeRecommendation(raw, { wines: input.wines, currency: input.currency, excludeWines: input.excludeWines });
}

// Validate + post-process a raw recommend response. Extracted so the async scan
// path (scan_jobs, where recommend runs server-side) applies the SAME mapping as
// the inline path — most importantly injecting the real menu price from the OCR
// list, since the model never outputs prices.
export function finalizeRecommendation(
  raw: unknown,
  input: { wines: ExtractedWine[]; currency?: string; excludeWines?: string[] },
): RecommendationResponse {
  const parsedTop = RecommendationResponseSchema.safeParse(raw);
  if (!parsedTop.success) {
    throw new Error('Could not parse recommendation response.');
  }
  // Keep every pick that's well-formed; drop (not fail on) any that isn't.
  const goodWines = parsedTop.data.wines
    .map((w) => WineRecommendationSchema.safeParse(tidyPick(w)))
    .filter((r): r is z.ZodSafeParseSuccess<z.infer<typeof WineRecommendationSchema>> => r.success)
    .map((r) => r.data);
  const parsed = { data: { ...parsedTop.data, wines: goodWines } };
  // INTEGRITY — Vinster never invents or re-states a price. The recommender's
  // job is to select and analyse REAL wines from the scanned list; the price is
  // real data, taken ONLY from the menu the diner is holding (OCR extraction).
  // So the list price is set solely from the matching scanned wine — and if a
  // pick can't be matched to a listed wine unambiguously, its price is left null
  // (unknown) rather than shown as a guess. Market comparison is done separately,
  // against live Wine-Searcher data, on the results screen.
  const scanCurrency = (input.currency || 'GBP').toUpperCase();

  // repeatNote guard. The model sometimes tags a NEW pick as a re-recommendation
  // (it can confuse two similar wines — e.g. two different Trebbiano d'Abruzzo).
  // A repeatNote is only legitimate when the wine really is one of the already-
  // seen wines, so only honour it when the pick's distinguishing words all appear
  // in one of the excludeWines entries; otherwise strip it.
  const tokens = (s: string) =>
    new Set(norm(s).split(' ').filter((t) => t.length >= 3));
  const excludeTokenSets = (input.excludeWines ?? []).map((e) => tokens(e));
  const isAlreadySeen = (w: { producer: string; name: string; vintage: number | null }) => {
    const wTokens = tokens(`${w.producer ?? ''} ${w.name ?? ''}`);
    if (wTokens.size === 0) return false;
    return excludeTokenSets.some((seen) => {
      for (const t of wTokens) if (!seen.has(t)) return false;
      return true;
    });
  };

  const wines: WineRecommendation[] = parsed.data.wines.map((w) => {
    const match = matchExtracted(w, input.wines);
    // Drop a repeatNote the guard can't confirm is a genuine re-recommendation.
    const repeatNote = w.repeatNote && isAlreadySeen(w) ? w.repeatNote : null;
    return {
      ...w,
      // Coerce a bogus vintage (0, or an implausible year) to null so the card
      // header doesn't render "Producer · Wine · 0". Real NV wines are already null.
      vintage: typeof w.vintage === 'number' && w.vintage > 1900 ? w.vintage : null,
      repeatNote,
      menuPrice: match ? match.menuPrice : null,
      currency: match?.currency || scanCurrency,
      format: match?.format ?? null,
    };
  });
  return { ...parsed.data, wines };
}
