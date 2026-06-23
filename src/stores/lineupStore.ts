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
  // Placement target when the lineup is launched from a rack/fridge: where the
  // first bottle goes, and which way the rest run from it. null startSlot = the
  // non-rack "Scan a Lineup" flow (per-wine onboarding).
  startSlot: { row: number; col: number } | null;
  orientation: 'Vertical' | 'Horizontal';
  // Begin a fresh lineup session, recording where it was launched from.
  start: (originRackId: string | null) => void;
  setLineup: (wines: DetectedBottle[], imageUri: string | null) => void;
  setPlacement: (startSlot: { row: number; col: number } | null, orientation: 'Vertical' | 'Horizontal') => void;
  // Patch a single detected bottle (used by the rack-lineup edit modal).
  updateBottle: (index: number, patch: Partial<DetectedBottle>) => void;
  clear: () => void;
}

export const useLineupStore = create<LineupState>((set) => ({
  wines: [],
  imageUri: null,
  originRackId: null,
  startSlot: null,
  orientation: 'Vertical',
  start: (originRackId) => set({ wines: [], imageUri: null, originRackId, startSlot: null, orientation: 'Vertical' }),
  setLineup: (wines, imageUri) => set({ wines, imageUri }),
  setPlacement: (startSlot, orientation) => set({ startSlot, orientation }),
  updateBottle: (index, patch) => set((s) => ({ wines: s.wines.map((b, i) => (i === index ? { ...b, ...patch } : b)) })),
  clear: () => set({ wines: [], imageUri: null, originRackId: null, startSlot: null, orientation: 'Vertical' }),
}));
