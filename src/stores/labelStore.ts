import { create } from 'zustand';
import type { WineDetails, WineDetailsComplete, WineIntelligence, Pairing } from '../types/wine';

interface LabelState {
  imageUri: string | null;
  imageBase64: string | null;
  wineDetails: WineDetails | null;
  wineDetailsConfirmed: WineDetailsComplete | null;
  intelligence: WineIntelligence | null;
  pairings: Pairing[];
  stage: 'idle' | 'scanning' | 'confirming' | 'loading' | 'done' | 'error';
  error: string | null;

  setImage: (uri: string, base64: string) => void;
  setWineDetails: (details: WineDetails) => void;
  setWineDetailsConfirmed: (details: WineDetailsComplete) => void;
  setIntelligence: (intel: WineIntelligence) => void;
  setPairings: (pairings: Pairing[]) => void;
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
  stage: 'idle',
  error: null,

  setImage: (uri, base64) => set({ imageUri: uri, imageBase64: base64, stage: 'scanning' }),
  setWineDetails: (details) => set({ wineDetails: details, stage: 'confirming' }),
  setWineDetailsConfirmed: (details) => set({ wineDetailsConfirmed: details, stage: 'loading' }),
  setIntelligence: (intel) => set({ intelligence: intel }),
  setPairings: (pairings) => set({ pairings, stage: 'done' }),
  setStage: (stage) => set({ stage }),
  setError: (message) => set({ error: message, stage: 'error' }),
  reset: () => set({
    imageUri: null, imageBase64: null, wineDetails: null, wineDetailsConfirmed: null,
    intelligence: null, pairings: [], stage: 'idle', error: null,
  }),
}));
