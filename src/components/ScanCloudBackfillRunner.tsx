import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useLastIntelStore } from '../stores/lastIntelStore';
import { fetchLabels, createLabel } from '../api/labels';

// One-time migration: label scans used to live ONLY in device storage
// (lastIntelStore.recent), so they didn't survive a reinstall or cross to another
// device. Now scans are cloud-backed in the `labels` table. On first launch after
// the update we upload any local recent scans (and their photos) that aren't in
// the cloud yet, so a user's existing on-device scans transfer too. Best-effort,
// runs once per install.
const DONE_KEY = 'vinster-scan-backfill-v1';

const norm = (s: unknown): string => (s ?? '').toString().trim().toLowerCase();
const key = (p: unknown, w: unknown, v: unknown): string => [p, w, v].map(norm).join('|');

export function ScanCloudBackfillRunner() {
  const { session } = useAuth();
  const ranRef = useRef(false);

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId || ranRef.current) return;
    ranRef.current = true;
    (async () => {
      try {
        if (await AsyncStorage.getItem(DONE_KEY)) return;
        const recent = useLastIntelStore.getState().recent;
        if (!recent.length) { await AsyncStorage.setItem(DONE_KEY, '1'); return; }
        const existing = await fetchLabels(userId);
        const have = new Set(existing.map((l) => key(l.producer, l.wine_name, l.vintage)));
        for (const r of recent) {
          const k = key(r.wine.producer, r.wine.wineName, r.wine.vintage);
          if (have.has(k)) continue;
          try {
            await createLabel(userId, {
              imageUri: r.imageUri ?? null,
              producer: r.wine.producer,
              wineName: r.wine.wineName,
              vintage: r.wine.vintage,
              region: r.wine.region,
              intel: r.intel,
            });
            have.add(k);
          } catch { /* skip this one, keep going */ }
        }
        await AsyncStorage.setItem(DONE_KEY, '1');
      } catch { /* leave the flag unset so it retries next launch */ }
    })();
  }, [session]);

  return null;
}
