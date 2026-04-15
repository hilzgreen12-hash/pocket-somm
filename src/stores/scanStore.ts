import { create } from 'zustand';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

export interface ScanPreferences {
  wineTypes: string[];
  styleProfiles: string[];
  budget: number | null;
  foodPairing: string;
  favouriteRegions: string[];
  favouriteGrapes: string[];
  dislikedRegions: string[];
  dislikedGrapes: string[];
}

interface ScanState {
  imageUri: string | null;
  imageUris: string[] | null;
  extractedWines: ExtractedWine[] | null;
  recommendation: RecommendationResponse | null;
  error: string | null;
  preferences: ScanPreferences;

  setImage: (uri: string) => void;
  setImageUris: (uris: string[]) => void;
  setExtractedWines: (wines: ExtractedWine[]) => void;
  setRecommendation: (rec: RecommendationResponse) => void;
  setError: (message: string) => void;
  setPreferences: (prefs: Partial<ScanPreferences>) => void;
  reset: () => void;
}

const DEFAULT_PREFERENCES: ScanPreferences = {
  wineTypes: [],
  styleProfiles: [],
  budget: null,
  foodPairing: '',
  favouriteRegions: [],
  favouriteGrapes: [],
  dislikedRegions: [],
  dislikedGrapes: [],
};

export const useScanStore = create<ScanState>((set) => ({
  imageUri: null,
  imageUris: null,
  extractedWines: null,
  recommendation: null,
  error: null,
  preferences: DEFAULT_PREFERENCES,

  setImage: (uri) => set({ imageUri: uri, imageUris: null, extractedWines: null, recommendation: null, error: null }),
  setImageUris: (uris) => set({ imageUris: uris, imageUri: null, extractedWines: null, recommendation: null, error: null }),
  setExtractedWines: (wines) => set({ extractedWines: wines }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setError: (message) => set({ error: message }),
  setPreferences: (prefs) => set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
  reset: () => set({ imageUri: null, imageUris: null, extractedWines: null, recommendation: null, error: null, preferences: DEFAULT_PREFERENCES }),
}));
