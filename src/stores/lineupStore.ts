import { create } from 'zustand';
import type { DetectedBottle } from '../api/label';

// Holds the in-progress "Scan a Lineup" onboarding so the lineup list survives
// the round-trip through the single-wine flow (Confirm → Wine Intel → Add to
// Cellar) for each bottle. The list screen reads from here; "added" status is
// re-derived from the live cellar on focus.
interface LineupState {
  wines: DetectedBottle[];
  imageUri: string | null;
  // When a lineup is launched from a specific rack/fridge, finishing it returns
  // there (rather than the Cellar tab). null when started from Add a Wine.
  originRackId: string | null;
  // Begin a fresh lineup session, recording where it was launched from.
  start: (originRackId: string | null) => void;
  setLineup: (wines: DetectedBottle[], imageUri: string | null) => void;
  clear: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  wines: [],
  imageUri: null,
  originRackId: null,
  start: (originRackId) => set({ wines: [], imageUri: null, originRackId }),
  setLineup: (wines, imageUri) => set({ wines, imageUri }),
  clear: () => set({ wines: [], imageUri: null, originRackId: null }),
}));
