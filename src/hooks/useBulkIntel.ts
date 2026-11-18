import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { usePreferences } from './usePreferences';
import { useCellarContext } from './useCellarContext';
import { showAlert } from '../components/AppAlert';
import { BULK_BATCH_SIZE, isBulkEligible, loadTriedWines, updateCellarIntelBatch } from '../services/bulkIntel';
import type { CellarWine } from '../types/wine';

const NO_TRIED = new Map<string, number>();

// A screen's bulk critic-score + value run (see services/bulkIntel): which wines
// may be in one, the confirm-then-run of the next bunch of 25, its progress and
// its Stop. Leaving the screen stops the run; wines already done stay saved.
// `onFinished` refreshes the screen's data when a run ends or is stopped.
export function useBulkIntel(onFinished: () => void, opts?: { findLabels?: boolean }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { role } = useCellarContext();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const canRun = !!userId && role !== 'view';

  const triedQuery = useQuery({
    queryKey: ['bulk-intel-tried', userId],
    queryFn: () => loadTriedWines(userId!),
    enabled: !!userId,
  });
  const tried = triedQuery.data ?? NO_TRIED;

  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Set until a run's in-flight wines have settled — including after Stop — so
  // a quick second press can't pay for the same wines twice.
  const inFlightRef = useRef(false);
  useEffect(() => () => abortRef.current?.abort(), []);

  const eligible = useCallback(
    (wines: CellarWine[]) => (canRun ? wines.filter((w) => isBulkEligible(w, tried)) : []),
    [canRun, tried],
  );

  async function run(batch: CellarWine[]) {
    if (!userId) return;
    const controller = new AbortController();
    abortRef.current = controller;
    inFlightRef.current = true;
    setProgress({ done: 0, total: batch.length });
    try {
      await updateCellarIntelBatch(batch, {
        userId,
        currency: preferences?.defaultCurrency ?? 'GBP',
        findLabels: opts?.findLabels,
        onProgress: (done, total) => { if (!controller.signal.aborted) setProgress({ done, total }); },
        signal: controller.signal,
      });
    } catch {
      showAlert({ title: 'Could not finish', body: 'Some wines could not be updated. Please try again.' });
    } finally {
      inFlightRef.current = false;
      if (abortRef.current === controller) abortRef.current = null;
      setProgress(null);
      void qc.invalidateQueries({ queryKey: ['bulk-intel-tried', userId] });
      onFinished();
    }
  }

  // Confirm, then update the next bunch of `targets`. `action` names the
  // button pressed, for "press it again for the next bunch".
  function start(targets: CellarWine[], what: 'values' | 'intel', action: string) {
    if (!canRun || inFlightRef.current || targets.length === 0) return;
    const batch = targets.slice(0, BULK_BATCH_SIZE);
    const n = batch.length;
    showAlert({
      title: `Update ${what} for ${n} ${n === 1 ? 'wine' : 'wines'}?`,
      body: `Vinster updates your wines in bunches of ${BULK_BATCH_SIZE} at a time, which it completes with ease.${
        targets.length > n ? ` This will do the next ${n} of ${targets.length} — press "${action}" again for each further bunch.` : ''
      }`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Go', onPress: () => void run(batch) },
      ],
    });
  }

  // "Save Progress and Exit Update": no further wines start; each wine already
  // updated is saved. The run's own finish refreshes the screen.
  function stop() {
    abortRef.current?.abort();
    setProgress(null);
  }

  return { canRun, eligible, progress, start, stop };
}
