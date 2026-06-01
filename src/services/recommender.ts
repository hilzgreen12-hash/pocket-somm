import { z } from 'zod';
import { callRecommend } from '../api/claude';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

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
  menuPrice: z.number().nullable(),
  currency: z.string(),
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
  valueNote: z.string().nullable().optional(),
  standoutNote: z.string().nullable().optional(),
});

const RecommendationResponseSchema = z.object({
  wines: z.array(WineRecommendationSchema).max(3),
  summary: z.string(),
  topScoringMode: z.boolean().optional(),
});

export async function recommendWines(input: RecommendInput): Promise<RecommendationResponse> {
  const raw = await callRecommend(input);
  const parsed = RecommendationResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Could not parse recommendation response.');
  }
  return parsed.data;
}
