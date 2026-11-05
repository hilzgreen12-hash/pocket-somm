import { useMemo, useCallback, useSyncExternalStore } from 'react';
import { useCellar } from './useCellar';
import { buildProducerIndex, fuzzyCorrectProducers } from '../utils/fuzzyWineCorrect';
import { correctWineNamesBySound, buildSoundNameIndex, europeanSoundIndex } from '../utils/soundAlike';

// Returns a function that snaps misheard producer names in a dictated (FINAL)
// transcript to the closest real producer in the user's cellar. Built from the
// live cellar, so it covers every producer the user owns — the long tail a
// hand-written dictionary can't — and updates automatically as the cellar changes.
// Cheap to call (runs once per finished utterance); no-ops when the cellar is empty.
export function useDictationCorrect(): (text: string) => string {
  const { wines } = useCellar();
  const index = useMemo(
    () => buildProducerIndex(wines.map((w) => w.producer)),
    [wines],
  );
  return useCallback((text: string) => fuzzyCorrectProducers(text, index), [index]);
}

// Words to bias the phone's speech recogniser towards before it even hears the
// user — producer and cuvée names from their cellar (iOS contextualStrings /
// Android EXTRA_BIASING_STRINGS). Capped so the hint list stays light.
// Names to put FIRST in the recogniser hints — e.g. the wines in the storage
// location Quick Command was opened from. Set on open, cleared on close.
let priorityHints: string[] = [];
const hintListeners = new Set<() => void>();
export function setPriorityDictationHints(names: string[]) {
  priorityHints = names;
  hintListeners.forEach((fn) => fn());
}
const subscribeHints = (fn: () => void) => { hintListeners.add(fn); return () => { hintListeners.delete(fn); }; };

// Snap misheard wine names to the user's own wines BY SOUND ("chateau rear
// sack" → "Château Rieussec"). Covers what spelling-based matching misses.
export function useSoundCorrect(): (text: string) => string {
  const { wines } = useCellar();
  const index = useMemo(() => buildSoundNameIndex(wines.flatMap((w) => [w.producer, w.wine_name]).filter(Boolean) as string[]), [wines]);
  // The user's own wines first, then the general European list (Burgundy,
  // Germany, Spain, Italy) for names they don't own yet.
  return useCallback((text: string) => correctWineNamesBySound(correctWineNamesBySound(text, index), europeanSoundIndex()), [index]);
}

export function useDictationHints(): string[] {
  const { wines } = useCellar();
  const first = useSyncExternalStore(subscribeHints, () => priorityHints, () => priorityHints);
  return useMemo(() => {
    const seen = new Set<string>();
    for (const t0 of first) {
      const t = (t0 ?? '').trim();
      if (t && t.length <= 60) seen.add(t);
      if (seen.size >= 100) return Array.from(seen);
    }
    for (const w of wines) {
      for (const v of [w.producer, w.wine_name]) {
        const t = (v ?? '').trim();
        if (t && t.length <= 60) seen.add(t);
        if (seen.size >= 100) return Array.from(seen);
      }
    }
    return Array.from(seen);
  }, [wines, first]);
}
