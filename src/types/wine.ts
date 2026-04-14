export interface ExtractedWine {
  name: string;
  producer: string;
  region: string;
  appellation?: string;
  grape?: string;
  vintage: number | null;
  menuPrice: number | null;
  currency: string;
}

export interface VintageAssessment {
  score: number;        // 0–100
  label: string;        // e.g. "Exceptional", "Challenging", "Good"
  notes: string;        // e.g. "2014 was an outstanding year for white Burgundy"
}

export interface WineRecommendation {
  name: string;
  producer: string;
  region: string;
  appellation?: string;
  grape?: string;
  vintage: number | null;
  menuPrice: number | null;
  currency: string;
  rationale: string;
  criticScore: number;
  vintageAssessment: VintageAssessment;
  fitScore: number;     // 0–100, match to user preferences
  valueScore: number;   // 0–100, value for money vs market price
}

export interface RecommendationResponse {
  wines: WineRecommendation[];
  summary: string;
}

export interface PricingData {
  averageMarketPrice: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: string;
  criticScore: number | null;
  source: 'wine-searcher' | 'unavailable';
}
