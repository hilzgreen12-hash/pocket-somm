import { create } from 'zustand';
import type { CellarWine } from '../types/wine';

// A resolved mood pick — the full cellar wine (for its stored intel + placement)
// joined with Vinster's rank label and justification.
export interface MoodPickView {
  wine: CellarWine;
  rank: string;
  why: string;
}

interface MoodPicksState {
  mood: string;
  picks: MoodPickView[];
  set: (mood: string, picks: MoodPickView[]) => void;
  clear: () => void;
}

// Carries the mood-recommendation result from the Voice Command modal to the
// Tonight's Cellar Picks results screen (too large for route params).
export const useMoodPicksStore = create<MoodPicksState>((set) => ({
  mood: '',
  picks: [],
  set: (mood, picks) => set({ mood, picks }),
  clear: () => set({ mood: '', picks: [] }),
}));
