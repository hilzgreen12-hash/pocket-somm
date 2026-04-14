import { z } from 'zod';
import { callRecommend } from '../api/claude';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

interface RecommendInput {
  wines: ExtractedWine[];
  wineType: string;
  styleProfiles: string[];
  budget: number | null;
  foodPairing: string;
}

const VintageAssessmentSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.enum(['Exceptional', 'Excellent', 'Good', 'Average', 'Challenging', 'Poor']),
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
  fitScore: z.number().min(0).max(100),
  valueScore: z.number().min(0).max(100),
});

const RecommendationResponseSchema = z.object({
  wines: z.array(WineRecommendationSchema).max(3),
  summary: z.string(),
});

export async function recommendWines(input: RecommendInput): Promise<RecommendationResponse> {
  const raw = await callRecommend(input);
  const parsed = RecommendationResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error('Could not parse recommendation response.');
  }
  return parsed.data;
}
