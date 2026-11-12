import { create } from 'zustand';
import type { CompareWineInput } from '../api/compareWines';

// The wines picked in Home's Compare Wines pop-up, handed to the /compare screen.
interface CompareState {
  wines: CompareWineInput[];
  setWines: (wines: CompareWineInput[]) => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  wines: [],
  setWines: (wines) => set({ wines }),
}));
