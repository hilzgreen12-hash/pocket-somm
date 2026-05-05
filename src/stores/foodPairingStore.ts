import { create } from 'zustand';

export interface CellarRecommendation {
  cellarWineId: string;
  wineName: string;
  rationale: string;
  servingTip: string;
}

export interface GeneralRecommendation {
  wineStyle: string;
  region: string;
  whyItWorks: string;
  characteristics: string;
  priceGuide: string;
  examples: string[];
}

interface FoodPairingStore {
  dish: string;
  mode: 'cellar' | 'general';
  cellarResult: CellarRecommendation[] | null;
  generalResult: GeneralRecommendation[] | null;
  generalSummary: string | null;
  setDish: (dish: string) => void;
  setMode: (mode: 'cellar' | 'general') => void;
  setCellarResult: (r: CellarRecommendation[]) => void;
  setGeneralResult: (r: GeneralRecommendation[], summary?: string) => void;
  reset: () => void;
}

export const useFoodPairingStore = create<FoodPairingStore>((set) => ({
  dish: '',
  mode: 'cellar',
  cellarResult: null,
  generalResult: null,
  generalSummary: null,
  setDish: (dish) => set({ dish }),
  setMode: (mode) => set({ mode }),
  setCellarResult: (r) => set({ cellarResult: r }),
  setGeneralResult: (r, summary) => set({ generalResult: r, generalSummary: summary ?? null }),
  reset: () => set({ dish: '', mode: 'cellar', cellarResult: null, generalResult: null, generalSummary: null }),
}));
