import { create } from 'zustand';

export interface ImportedWine {
  wine_name: string;
  producer: string;
  region: string;
  vintage: string | null;
  quantity: number;
  purchase_price?: number | null;
  currency?: string | null;
}

interface CellarImportStore {
  wines: ImportedWine[];
  setWines: (wines: ImportedWine[]) => void;
  removeWine: (index: number) => void;
  reset: () => void;
}

export const useCellarImportStore = create<CellarImportStore>((set) => ({
  wines: [],
  setWines: (wines) => set({ wines }),
  removeWine: (index) => set((s) => ({ wines: s.wines.filter((_, i) => i !== index) })),
  reset: () => set({ wines: [] }),
}));
