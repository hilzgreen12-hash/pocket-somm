import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { useAuth } from './useAuth';
import { useCellar } from './useCellar';
import { useChosenWines } from './useChosenWines';
import { useScanHistory } from './useScanHistory';
import { useChefLabelHistory, useChefPairingHistory } from './useChefHistory';

export type PersonalityCategory = 'wine' | 'recipe';

// How many app-opens to stay quiet for after the first sketch before
// nudging the user about the second one — keeps the two prompts spaced out.
const SECOND_SKETCH_SKIPS = 2;
const SKIP_KEY = 'vinster_personality_second_prompt_skips';

// Bumped at most once per app session (module re-evaluated on cold start),
// so the spacing counter advances once per "use", not once per render.
let bumpedSpacingThisSession = false;

// Decides whether the home screen should nudge the user to generate a
// personality sketch, and which one. Returns null when there's nothing to
// prompt. Mirrors the activity gate in app/profile/personality.tsx.
export function usePersonalityPrompt(): PersonalityCategory | null {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { archive } = useScanHistory();
  const { sessions: chefLabelSessions } = useChefLabelHistory();
  const { sessions: chefPairingSessions } = useChefPairingHistory();

  // Which sketches the user has already generated.
  const { data: generated } = useQuery({
    queryKey: ['personality-generated', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_wine_personality, last_recipe_personality')
        .eq('user_id', userId!)
        .maybeSingle();
      return {
        wine: !!data?.last_wine_personality,
        recipe: !!data?.last_recipe_personality,
      };
    },
  });

  const [category, setCategory] = useState<PersonalityCategory | null>(null);

  useEffect(() => {
    if (!userId || !generated) return;
    let cancelled = false;

    (async () => {
      // Activity gates — same thresholds as the personality screen. Wine
      // needs real engagement before a sketch reads as personal: a started
      // cellar (6+ distinct wines) OR three separate List searches where a
      // bottle was actually picked.
      const distinctCellarWines = (wines ?? []).length;
      const listPickSessions = new Set(
        (chosenWines ?? [])
          .filter((cw) => cw.source !== 'other' && cw.scan_session_id)
          .map((cw) => cw.scan_session_id)
      ).size;
      const wineReady = distinctCellarWines >= 6 || listPickSessions >= 3;

      const restaurantSignals = (archive ?? []).filter((a) =>
        (a.restaurantName && a.restaurantName.trim()) ||
        a.ratingOverall != null || a.ratingFood != null ||
        (a.restaurantNote && a.restaurantNote.trim())
      ).length;
      const chefSignals = (chefLabelSessions?.length ?? 0) + (chefPairingSessions?.length ?? 0);
      const foodieReady = restaurantSignals + chefSignals >= 2;

      const winePending = wineReady && !generated.wine;
      const foodiePending = foodieReady && !generated.recipe;

      if (!winePending && !foodiePending) {
        if (!cancelled) setCategory(null);
        return;
      }

      // One sketch already exists — space the second nudge out by a couple
      // of app-opens rather than offering it back-to-back.
      if (generated.wine || generated.recipe) {
        let skips = parseInt((await AsyncStorage.getItem(SKIP_KEY)) ?? '0', 10) || 0;
        if (!bumpedSpacingThisSession) {
          bumpedSpacingThisSession = true;
          skips += 1;
          await AsyncStorage.setItem(SKIP_KEY, String(skips));
        }
        if (cancelled) return;
        setCategory(skips > SECOND_SKETCH_SKIPS ? (winePending ? 'wine' : 'recipe') : null);
        return;
      }

      // Neither generated yet. Single pending → prompt that. Both pending →
      // prompt the area the user engages with most; ties go to wine.
      if (winePending && !foodiePending) { if (!cancelled) setCategory('wine'); return; }
      if (foodiePending && !winePending) { if (!cancelled) setCategory('recipe'); return; }

      const chefEngagement = (chefLabelSessions?.length ?? 0) + (chefPairingSessions?.length ?? 0);
      const cellarEngagement = (wines?.length ?? 0) + (archive?.length ?? 0);
      if (!cancelled) setCategory(chefEngagement > cellarEngagement ? 'recipe' : 'wine');
    })();

    return () => { cancelled = true; };
  }, [userId, generated, wines, chosenWines, archive, chefLabelSessions, chefPairingSessions]);

  return category;
}
