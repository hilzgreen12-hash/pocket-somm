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
  topScoringMode: boolean;
  profileWineTypes: string[];
  profileStyleProfiles: string[];
}

interface ScanState {
  imageUri: string | null;
  imageUris: string[] | null;
  // How the list image reached us: a live camera photo, or an uploaded
  // screenshot / gallery image. Drives OCR pre-processing — screenshots are
  // already clean digital images, so they keep more detail (see ocr.ts).
  imageSource: 'camera' | 'upload';
  extractedWines: ExtractedWine[] | null;
  recommendation: RecommendationResponse | null;
  error: string | null;
  preferences: ScanPreferences;
  needsReset: boolean;

  setImage: (uri: string, source?: 'camera' | 'upload') => void;
  setImageUris: (uris: string[], source?: 'camera' | 'upload') => void;
  setExtractedWines: (wines: ExtractedWine[]) => void;
  setRecommendation: (rec: RecommendationResponse) => void;
  setError: (message: string) => void;
  setPreferences: (prefs: Partial<ScanPreferences>) => void;
  clearNeedsReset: () => void;
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
  topScoringMode: false,
  profileWineTypes: [],
  profileStyleProfiles: [],
};

export const useScanStore = create<ScanState>((set) => ({
  imageUri: null,
  imageUris: null,
  imageSource: 'camera',
  extractedWines: null,
  recommendation: null,
  error: null,
  preferences: DEFAULT_PREFERENCES,
  needsReset: false,

  setImage: (uri, source = 'camera') => set({ imageUri: uri, imageUris: null, imageSource: source, extractedWines: null, recommendation: null, error: null }),
  setImageUris: (uris, source = 'camera') => set({ imageUris: uris, imageUri: null, imageSource: source, extractedWines: null, recommendation: null, error: null }),
  setExtractedWines: (wines) => set({ extractedWines: wines }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setError: (message) => set({ error: message }),
  setPreferences: (prefs) => set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
  clearNeedsReset: () => set({ needsReset: false }),
  reset: () => set({ imageUri: null, imageUris: null, imageSource: 'camera', extractedWines: null, recommendation: null, error: null, preferences: DEFAULT_PREFERENCES, needsReset: true }),
}));
