import { create } from 'zustand';

export interface PendingSlot {
  rackId: string;
  row: number;
  col: number;
  rows: number;
  cols: number;
  // Width of the rack's optional large-format row, when one exists. The
  // placement routines need this to clamp multi-bottle placements that
  // start at row_index = -1 to a single horizontal band — otherwise a
  // magnum can spill into the standard grid below.
  largeFormatCols?: number | null;
}

interface RackStore {
  imageUri: string | null;
  detectedRows: number;
  detectedCols: number;
  pendingSlot: PendingSlot | null;
  pendingWineId: string | null;
  pendingStorageType: 'rack' | 'fridge';
  // True when the user entered the rack placement flow via "+ Add bottles"
  // on the wine card. The placement modal uses this to INCREMENT the
  // wine's quantity rather than overwrite it (the default behaviour for
  // brand-new wines being placed for the first time), and to dismiss two
  // screens after confirm so the user returns to where they came from
  // rather than the wine card.
  pendingAddMode: boolean;
  setImage: (uri: string) => void;
  setDetected: (rows: number, cols: number) => void;
  setPendingSlot: (slot: PendingSlot | null) => void;
  setPendingWineId: (id: string | null) => void;
  setPendingStorageType: (type: 'rack' | 'fridge') => void;
  setPendingAddMode: (v: boolean) => void;
  reset: () => void;
}

export const useRackStore = create<RackStore>((set) => ({
  imageUri: null,
  detectedRows: 4,
  detectedCols: 6,
  pendingSlot: null,
  pendingWineId: null,
  pendingStorageType: 'rack',
  pendingAddMode: false,
  setImage: (uri) => set({ imageUri: uri }),
  setDetected: (rows, cols) => set({ detectedRows: rows, detectedCols: cols }),
  setPendingSlot: (slot) => set({ pendingSlot: slot }),
  setPendingWineId: (id) => set({ pendingWineId: id }),
  setPendingStorageType: (type) => set({ pendingStorageType: type }),
  setPendingAddMode: (v) => set({ pendingAddMode: v }),
  // Resets only the rack-detection transients (image, rows, cols). pendingSlot,
  // pendingWineId and pendingStorageType are cross-flow signals that should
  // persist until their consumer clears them — clearing them here breaks the
  // "Add wine → Create new rack → place on grid" flow because rack-creation
  // would wipe out the wine the user just saved.
  reset: () => set({ imageUri: null, detectedRows: 4, detectedCols: 6 }),
}));
