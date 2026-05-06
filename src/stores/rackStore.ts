import { create } from 'zustand';

export interface PendingSlot {
  rackId: string;
  row: number;
  col: number;
  rows: number;
  cols: number;
}

interface RackStore {
  imageUri: string | null;
  detectedRows: number;
  detectedCols: number;
  pendingSlot: PendingSlot | null;
  pendingWineId: string | null;
  pendingStorageType: 'rack' | 'fridge';
  setImage: (uri: string) => void;
  setDetected: (rows: number, cols: number) => void;
  setPendingSlot: (slot: PendingSlot | null) => void;
  setPendingWineId: (id: string | null) => void;
  setPendingStorageType: (type: 'rack' | 'fridge') => void;
  reset: () => void;
}

export const useRackStore = create<RackStore>((set) => ({
  imageUri: null,
  detectedRows: 4,
  detectedCols: 6,
  pendingSlot: null,
  pendingWineId: null,
  pendingStorageType: 'rack',
  setImage: (uri) => set({ imageUri: uri }),
  setDetected: (rows, cols) => set({ detectedRows: rows, detectedCols: cols }),
  setPendingSlot: (slot) => set({ pendingSlot: slot }),
  setPendingWineId: (id) => set({ pendingWineId: id }),
  setPendingStorageType: (type) => set({ pendingStorageType: type }),
  reset: () => set({ imageUri: null, detectedRows: 4, detectedCols: 6, pendingSlot: null, pendingWineId: null, pendingStorageType: 'rack' }),
}));
