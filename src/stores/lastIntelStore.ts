import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WineDetailsComplete, WineIntelligence } from '../types/wine';

// The most recently generated Wine Intel result, persisted to device storage so
// the Cellar tab's "View last result" link survives an app restart. Kept
// SEPARATE from the transient labelStore (which is scratch space for the active
// scan and gets reset by Manual Input) so a successful result is never wiped.
// Not sensitive — a wine's public intel — so plain AsyncStorage is fine.
interface LastIntelState {
  wine: WineDetailsComplete | null;
  intel: WineIntelligence | null;
  setLast: (wine: WineDetailsComplete, intel: WineIntelligence) => void;
  clear: () => void;
}

export const useLastIntelStore = create<LastIntelState>()(
  persist(
    (set) => ({
      wine: null,
      intel: null,
      setLast: (wine, intel) => set({ wine, intel }),
      clear: () => set({ wine: null, intel: null }),
    }),
    {
      name: 'vinster-last-intel',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
