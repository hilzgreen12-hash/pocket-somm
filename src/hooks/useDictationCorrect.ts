import { useMemo, useCallback } from 'react';
import { useCellar } from './useCellar';
import { buildProducerIndex, fuzzyCorrectProducers } from '../utils/fuzzyWineCorrect';

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
export function useDictationHints(): string[] {
  const { wines } = useCellar();
  return useMemo(() => {
    const seen = new Set<string>();
    for (const w of wines) {
      for (const v of [w.producer, w.wine_name]) {
        const t = (v ?? '').trim();
        if (t && t.length <= 60) seen.add(t);
        if (seen.size >= 100) return Array.from(seen);
      }
    }
    return Array.from(seen);
  }, [wines]);
}
