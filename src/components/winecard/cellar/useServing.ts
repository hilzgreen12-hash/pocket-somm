import { useEffect, useRef, useState } from 'react';
import { useCellar } from '../../../hooks/useCellar';
import { generateServingSuggestion, generatePairingIngredients, type PairingIngredient } from '../../../api/wineExtras';
import { showAlert } from '../../AppAlert';
import type { CellarWine, WineServingSuggestion } from '../../../types/wine';

// Pairing-ingredient lists at this version are current: three per group, food only.
const INGREDIENTS_VERSION = 2;

// Serve tab: serving suggestions (temperature, decanting, glass, before/after
// wines) and the classic pairing ingredients, saved together on
// serving_suggestion. Both generate the first time the tab opens — never as part
// of the card's automatic intel — and reopen from what's saved. View-only
// members see what's saved.
export function useServing(wine: CellarWine, opts: { open: boolean; canEdit: boolean }) {
  const { updateWine } = useCellar();
  const { open, canEdit } = opts;
  const [generating, setGenerating] = useState(false);
  const [ingredients, setIngredients] = useState<PairingIngredient[] | null>(null);
  const [ingredientsLoading, setIngredientsLoading] = useState(false);
  // Ingredients found this visit, kept until there's a serving suggestion to save them on.
  const foundRef = useRef<PairingIngredient[] | null>(null);
  const fetchedRef = useRef(false);
  const servingRequestedRef = useRef(false);
  const latestRef = useRef(wine);
  latestRef.current = wine;

  const saveServing = (serving: WineServingSuggestion) =>
    updateWine.mutateAsync({ id: wine.id, updates: { serving_suggestion: serving } });

  async function generate() {
    if (generating || !canEdit) return;
    setGenerating(true);
    try {
      const data = await generateServingSuggestion(wine);
      // Keep the pairing ingredients already found for this wine.
      const prev = latestRef.current.serving_suggestion;
      const keep = prev?.pairingIngredients ?? foundRef.current ?? undefined;
      const keepV = prev?.pairingIngredients ? prev.pairingIngredientsV : (foundRef.current ? INGREDIENTS_VERSION : undefined);
      await saveServing({ ...data, ...(keep ? { pairingIngredients: keep, ...(keepV ? { pairingIngredientsV: keepV } : {}) } : {}) });
    } catch {
      showAlert({ title: 'Could not generate', body: 'Please try again in a moment.' });
    } finally {
      setGenerating(false);
    }
  }

  // First open: generate serving suggestions if there are none.
  useEffect(() => {
    if (!open || servingRequestedRef.current || wine.archived_at) return;
    servingRequestedRef.current = true;
    if (!wine.serving_suggestion && canEdit) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Pairing ingredients: from what's saved when current; otherwise fetched once
  // and saved into serving_suggestion as soon as there is one.
  const hasServing = !!wine.serving_suggestion;
  useEffect(() => {
    if (!open) return;
    const saved = wine.serving_suggestion?.pairingIngredients;
    if (saved?.length && wine.serving_suggestion?.pairingIngredientsV === INGREDIENTS_VERSION) {
      foundRef.current = saved;
      setIngredients(saved);
      return;
    }
    // An older list shows while a fresh one is fetched to replace it.
    if (saved?.length && !fetchedRef.current) setIngredients(saved);
    if (!canEdit) return;
    // Found earlier this visit, before the serving advice was saved: save them now.
    if (foundRef.current?.length && fetchedRef.current) {
      if (wine.serving_suggestion) void saveServing({ ...wine.serving_suggestion, pairingIngredients: foundRef.current, pairingIngredientsV: INGREDIENTS_VERSION }).catch(() => {});
      return;
    }
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    setIngredientsLoading(true);
    generatePairingIngredients(wine)
      .then((list) => {
        if (!list.length) return;
        foundRef.current = list;
        setIngredients(list);
        const now = latestRef.current.serving_suggestion;
        if (now) void saveServing({ ...now, pairingIngredients: list, pairingIngredientsV: INGREDIENTS_VERSION }).catch(() => {});
      })
      .catch(() => { fetchedRef.current = false; })
      .finally(() => setIngredientsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasServing]);

  return { generating, generate, ingredients, ingredientsLoading };
}

export type Serving = ReturnType<typeof useServing>;
