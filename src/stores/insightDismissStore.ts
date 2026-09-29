import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tile keys the user has dismissed ("Remove from Carousel") from the home
// Cellar Insights carousel. Persisted to device storage so a dismissal sticks
// across app restarts. Keys: `bottle:<wineId>` for running-low tiles, or
// `fact:<factKey>` for the fact tiles (grape / vintage / producer). Not
// sensitive, so plain AsyncStorage is fine.
interface InsightDismissState {
  dismissed: string[];
  dismiss: (key: string) => void;
}

export const useInsightDismissStore = create<InsightDismissState>()(
  persist(
    (set) => ({
      dismissed: [],
      dismiss: (key) =>
        set((s) => (s.dismissed.includes(key) ? s : { dismissed: [...s.dismissed, key] })),
    }),
    { name: 'vinster-insight-dismissed', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
