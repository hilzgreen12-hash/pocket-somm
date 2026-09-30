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
