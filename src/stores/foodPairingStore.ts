import { create } from 'zustand';

export interface CellarRecommendation {
  cellarWineId: string;
  wineName: string;
  rationale: string;
  servingTip: string;
}

export interface PriceBandExample {
  priceBand: 1 | 2 | 3;
  region: string;
}

export interface GeneralRecommendation {
  wineStyle: string;
  region: string;
  whyItWorks: string;
  characteristics: string;
  // priceGuide is legacy (pre-2026-05-12). Archived pairings may still have
  // it; current pairings express price as per-example priceBand instead.
  priceGuide?: string;
  // Current shape: a single budget-appropriate "where to look" region, since
  // all three recommendations are now targeted at the user's stated budget
  // rather than spanning price tiers. Optional because legacy archived
  // pairings instead carried `examples` (price-band suggestions).
  whereToLook?: string;
  // Legacy (pre-2026-06-02): three price-band buying suggestions. Older
  // archived pairings may still be plain string[]. The pairing-results
  // renderer handles both, falling back to whereToLook for current pairings.
  examples?: PriceBandExample[] | string[];
}

interface FoodPairingStore {
  dish: string;
  mode: 'cellar' | 'general';
  // The cooking brief's structured parameters, kept so the results screen can
  // re-run the pairing (e.g. the "show me all my cellar wines" link) without
  // sending the user back to the form.
  stylePreference: string | null;
  budget: number | null;
  cellarResult: CellarRecommendation[] | null;
  generalResult: GeneralRecommendation[] | null;
  generalSummary: string | null;
  setDish: (dish: string) => void;
  setMode: (mode: 'cellar' | 'general') => void;
  setStylePreference: (s: string | null) => void;
  setBudget: (b: number | null) => void;
  setCellarResult: (r: CellarRecommendation[]) => void;
  setGeneralResult: (r: GeneralRecommendation[], summary?: string) => void;
  reset: () => void;
}

export const useFoodPairingStore = create<FoodPairingStore>((set) => ({
  dish: '',
  mode: 'cellar',
  stylePreference: null,
  budget: null,
  cellarResult: null,
  generalResult: null,
  generalSummary: null,
  setDish: (dish) => set({ dish }),
  setMode: (mode) => set({ mode }),
  setStylePreference: (stylePreference) => set({ stylePreference }),
  setBudget: (budget) => set({ budget }),
  setCellarResult: (r) => set({ cellarResult: r }),
  setGeneralResult: (r, summary) => set({ generalResult: r, generalSummary: summary ?? null }),
  reset: () => set({ dish: '', mode: 'cellar', stylePreference: null, budget: null, cellarResult: null, generalResult: null, generalSummary: null }),
}));
