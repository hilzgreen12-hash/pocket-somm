import { create } from 'zustand';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'any';

export interface ScanPreferences {
  wineType: WineType;
  styleProfiles: string[];
  budget: number | null;
  foodPairing: string;
}

interface ScanState {
  imageUri: string | null;
  extractedWines: ExtractedWine[] | null;
  recommendation: RecommendationResponse | null;
  error: string | null;
  preferences: ScanPreferences;

  setImage: (uri: string) => void;
  setExtractedWines: (wines: ExtractedWine[]) => void;
  setRecommendation: (rec: RecommendationResponse) => void;
  setError: (message: string) => void;
  setPreferences: (prefs: ScanPreferences) => void;
  reset: () => void;
}

const DEFAULT_PREFERENCES: ScanPreferences = {
  wineType: 'any',
  styleProfiles: [],
  budget: null,
  foodPairing: '',
};

export const useScanStore = create<ScanState>((set) => ({
  imageUri: null,
  extractedWines: null,
  recommendation: null,
  error: null,
  preferences: DEFAULT_PREFERENCES,

  setImage: (uri) => set({ imageUri: uri, extractedWines: null, recommendation: null, error: null }),
  setExtractedWines: (wines) => set({ extractedWines: wines }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setError: (message) => set({ error: message }),
  setPreferences: (prefs) => set({ preferences: prefs }),
  reset: () => set({ imageUri: null, extractedWines: null, recommendation: null, error: null, preferences: DEFAULT_PREFERENCES }),
}));
