import { create } from 'zustand';
import type { WineDetails, WineDetailsComplete, WineIntelligence, Pairing } from '../types/wine';

interface LabelState {
  imageUri: string | null;
  imageBase64: string | null;
  wineDetails: WineDetails | null;
  wineDetailsConfirmed: WineDetailsComplete | null;
  intelligence: WineIntelligence | null;
  pairings: Pairing[];
  filters: Record<string, unknown> | null;
  stage: 'idle' | 'scanning' | 'confirming' | 'loading' | 'done' | 'error';
  error: string | null;

  setImage: (uri: string, base64: string) => void;
  setWineDetails: (details: WineDetails) => void;
  setWineDetailsConfirmed: (details: WineDetailsComplete) => void;
  setIntelligence: (intel: WineIntelligence | null) => void;
  setPairings: (pairings: Pairing[]) => void;
  setFilters: (filters: Record<string, unknown> | null) => void;
  setStage: (stage: LabelState['stage']) => void;
  setError: (message: string) => void;
  reset: () => void;
}

export const useLabelStore = create<LabelState>((set) => ({
  imageUri: null,
  imageBase64: null,
  wineDetails: null,
  wineDetailsConfirmed: null,
  intelligence: null,
  pairings: [],
  filters: null,
  stage: 'idle',
  error: null,

  // A new photo = a new scan: clear the PREVIOUS scan's identity/intel/error so
  // that if this scan's OCR fails or is slow, the Confirm screen can never fall
  // back to showing the last wine's details (the "2nd scan repeats the 1st" bug).
  setImage: (uri, base64) => set({
    imageUri: uri, imageBase64: base64,
    wineDetails: null, wineDetailsConfirmed: null, intelligence: null, error: null,
    stage: 'scanning',
  }),
  setWineDetails: (details) => set({ wineDetails: details, stage: 'confirming' }),
  setWineDetailsConfirmed: (details) => set({ wineDetailsConfirmed: details, stage: 'loading' }),
  setIntelligence: (intel) => set({ intelligence: intel }),
  setPairings: (pairings) => set({ pairings, stage: 'done' }),
  setFilters: (filters) => set({ filters }),
  setStage: (stage) => set({ stage }),
  setError: (message) => set({ error: message, stage: 'error' }),
  reset: () => set({
    imageUri: null, imageBase64: null, wineDetails: null, wineDetailsConfirmed: null,
    intelligence: null, pairings: [], filters: null, stage: 'idle', error: null,
  }),
}));
