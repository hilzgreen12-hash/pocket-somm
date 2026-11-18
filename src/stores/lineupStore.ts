import { create } from 'zustand';
import type { DetectedBottle } from '../api/label';

// Holds an in-progress "Add a Lineup" so the scanned list survives leaving the
// scanner (e.g. to re-scan one label) and coming back.
interface LineupState {
  wines: DetectedBottle[];
  imageUri: string | null;
  // The rack or fridge the lineup was started from; its bottles wait there to
  // be placed.
  originRackId: string | null;
  // Begin a fresh lineup session for a rack/fridge.
  start: (originRackId: string) => void;
  setLineup: (wines: DetectedBottle[], imageUri: string | null) => void;
  // Patch a single detected bottle (used by the lineup edit modal).
  updateBottle: (index: number, patch: Partial<DetectedBottle>) => void;
  clear: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  wines: [],
  imageUri: null,
  originRackId: null,
  start: (originRackId) => set({ wines: [], imageUri: null, originRackId }),
  setLineup: (wines, imageUri) => set({ wines, imageUri }),
  updateBottle: (index, patch) => set((s) => ({ wines: s.wines.map((b, i) => (i === index ? { ...b, ...patch } : b)) })),
  clear: () => set({ wines: [], imageUri: null, originRackId: null }),
}));
