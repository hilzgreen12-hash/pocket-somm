import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'vinster_city_history';
const MAX_HISTORY = 30;

// Tracks the cities the user has typed into city fields. Suggestions in the
// CityAutocomplete prefer history over the bundled list — the cities a user
// actually drinks in are far more useful than top-N world cities.

export function useCityHistory() {
  const [history, setHistory] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) setHistory(parsed.filter((s): s is string => typeof s === 'string'));
          } catch { /* swallow malformed history */ }
        }
        setHydrated(true);
      })
      .catch(() => setHydrated(true));
    return () => { cancelled = true; };
  }, []);

  // Move-to-front + de-dupe + cap. Trims and ignores empty strings.
  async function recordCity(city: string) {
    const trimmed = city.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }

  return { history, hydrated, recordCity };
}
