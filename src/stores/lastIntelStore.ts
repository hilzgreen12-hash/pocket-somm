import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WineDetailsComplete, WineIntelligence } from '../types/wine';
import { useLabelStore } from './labelStore';

// A recently-generated Wine Intel result, kept for the Discover tab's "Recent
// Scans" carousel. imageUri is the label photo captured at scan time (null for
// searched/typed wines); ts drives recency ordering.
export interface RecentIntel {
  key: string;
  wine: WineDetailsComplete;
  intel: WineIntelligence;
  imageUri: string | null;
  ts: number;
}

const RECENT_MAX = 12;

function recentKey(w: WineDetailsComplete): string {
  return [w.producer, w.wineName, w.vintage].map((s) => (s ?? '').trim().toLowerCase()).join('|');
}

// The most recently generated Wine Intel result, persisted to device storage so
// the "View last result" link survives an app restart, plus a short RECENT list
// (last 12) powering the Discover tab's Recent Scans carousel. Kept SEPARATE from
// the transient labelStore (scratch space for the active scan). Not sensitive —
// a wine's public intel — so plain AsyncStorage is fine.
interface LastIntelState {
  wine: WineDetailsComplete | null;
  intel: WineIntelligence | null;
  recent: RecentIntel[];
  setLast: (wine: WineDetailsComplete, intel: WineIntelligence) => void;
  clear: () => void;
}

export const useLastIntelStore = create<LastIntelState>()(
  persist(
    (set) => ({
      wine: null,
      intel: null,
      recent: [],
      // Records the single "last" result AND prepends to the recent list. All
      // intel-generation paths funnel through here, so the carousel stays fed
      // without instrumenting each call site. The label photo is snapshotted
      // from the active scan in labelStore (null for searched/typed wines).
      setLast: (wine, intel) => set((state) => {
        let imageUri: string | null = null;
        try { imageUri = useLabelStore.getState().imageUri ?? null; } catch { imageUri = null; }
        const key = recentKey(wine);
        const item: RecentIntel = { key, wine, intel, imageUri, ts: Date.now() };
        const recent = [item, ...state.recent.filter((r) => r.key !== key)].slice(0, RECENT_MAX);
        return { wine, intel, recent };
      }),
      clear: () => set({ wine: null, intel: null, recent: [] }),
    }),
    {
      name: 'vinster-last-intel',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
