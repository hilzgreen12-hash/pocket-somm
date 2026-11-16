import { create } from 'zustand';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

interface ScanPreferences {
  wineTypes: string[];
  styleProfiles: string[];
  budget: number | null;
  // Optional MINIMUM budget per bottle (null = no minimum). Pairs with `budget`
  // (the maximum) to form a price range.
  budgetMin: number | null;
  foodPairing: string;
  // Free-text "preferred country of origin" for the wine picks — a soft
  // preference (weights, never excludes). Empty string = no preference.
  preferredCountry: string;
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
  // Find Online: the restaurant's list on the web instead of a photo. The
  // restaurant and town the user searched carry through to the results page.
  // url: a web page or PDF link; fileUri: a PDF shared straight into Vinster.
  onlineSource: { url: string; restaurant: string; city: string | null; title?: string; domain?: string; fileUri?: string } | null;
  extractedWines: ExtractedWine[] | null;
  recommendation: RecommendationResponse | null;
  error: string | null;
  preferences: ScanPreferences;
  needsReset: boolean;
  // Set by Try Again on the scan error screen: Home opens "How should Vinster
  // read the list?" when it next comes into view, to start again from scratch.
  restartListChoice: boolean;
  setRestartListChoice: (v: boolean) => void;
  // Camera pages already taken in a multi-page capture ("Add Another Page");
  // the current page is imageUri until the user is done.
  cameraPages: string[];
  addCameraPage: (uri: string) => void;
  clearCameraPages: () => void;

  setImage: (uri: string, source?: 'camera' | 'upload') => void;
  setImageUris: (uris: string[], source?: 'camera' | 'upload') => void;
  setOnlineSource: (src: { url: string; restaurant: string; city: string | null; title?: string; domain?: string; fileUri?: string }) => void;
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
  budgetMin: null,
  foodPairing: '',
  preferredCountry: '',
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
  onlineSource: null,
  extractedWines: null,
  recommendation: null,
  error: null,
  preferences: DEFAULT_PREFERENCES,
  needsReset: false,
  restartListChoice: false,
  setRestartListChoice: (v) => set({ restartListChoice: v }),
  cameraPages: [],
  addCameraPage: (uri) => set((s) => ({ cameraPages: [...s.cameraPages, uri] })),
  clearCameraPages: () => set({ cameraPages: [] }),

  setImage: (uri, source = 'camera') => set({ imageUri: uri, imageUris: null, imageSource: source, onlineSource: null, extractedWines: null, recommendation: null, error: null }),
  setImageUris: (uris, source = 'camera') => set({ imageUris: uris, imageUri: null, imageSource: source, onlineSource: null, extractedWines: null, recommendation: null, error: null }),
  setOnlineSource: (src) => set({ onlineSource: src, imageUri: null, imageUris: null, extractedWines: null, recommendation: null, error: null }),
  setExtractedWines: (wines) => set({ extractedWines: wines }),
  setRecommendation: (rec) => set({ recommendation: rec }),
  setError: (message) => set({ error: message }),
  setPreferences: (prefs) => set((s) => ({ preferences: { ...s.preferences, ...prefs } })),
  clearNeedsReset: () => set({ needsReset: false }),
  reset: () => set({ imageUri: null, imageUris: null, imageSource: 'camera', onlineSource: null, cameraPages: [], extractedWines: null, recommendation: null, error: null, preferences: DEFAULT_PREFERENCES, needsReset: true }),
}));
