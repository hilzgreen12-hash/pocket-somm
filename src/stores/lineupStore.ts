import { create } from 'zustand';
import type { DetectedBottle } from '../api/label';

// Holds the in-progress "Scan a Lineup" onboarding so the lineup list survives
// the round-trip through the single-wine flow (Confirm → Wine Intel → Add to
// Cellar) for each bottle. The list screen reads from here; "added" status is
// re-derived from the live cellar on focus.
interface LineupState {
  wines: DetectedBottle[];
  imageUri: string | null;
  setLineup: (wines: DetectedBottle[], imageUri: string | null) => void;
  clear: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  wines: [],
  imageUri: null,
  setLineup: (wines, imageUri) => set({ wines, imageUri }),
  clear: () => set({ wines: [], imageUri: null }),
}));
