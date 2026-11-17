import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { wc } from '../wcStyles';
import { s } from './styles';
import { PairingIngredientsCard } from '../PairingIngredientsCard';
import { GenerateRecipesCard, ServingGlance, ComplementaryPairings, CellarPickRow } from '../ServeSections';
import { useHomeCellarWines } from '../../../hooks/useHomeCellarWines';
import { pickFromCellar } from '../../../utils/wineCardInsights';
import { colors } from '../../../constants/theme';
import type { CellarWine } from '../../../types/wine';
import type { Serving } from './useServing';

export function ServeTab({ wine, serving, canEdit, onFindPairings }: {
  wine: CellarWine;
  serving: Serving;
  canEdit: boolean;
  onFindPairings: () => void;
}) {
  // Before/after picks come only from bottles kept at home.
  const { wines: homeWines } = useHomeCellarWines();
  const suggestion = wine.serving_suggestion ?? null;
  const picks = useMemo(() => ({
    before: pickFromCellar(suggestion?.aperitif?.style, homeWines, wine.id),
    after: pickFromCellar(suggestion?.digestif?.style, homeWines, wine.id),
  }), [suggestion, homeWines, wine.id]);

  return (
    <>
      <GenerateRecipesCard onPress={onFindPairings} />

      {suggestion ? (
        <>
          <ServingGlance serving={suggestion} />
          <PairingIngredientsCard ingredients={serving.ingredients ?? suggestion.pairingIngredients ?? null} loading={serving.ingredientsLoading} />
          <ComplementaryPairings
            serving={suggestion}
            renderPick={(slot) => (
              <CellarPickRow
                found={slot === 'before' ? picks.before : picks.after}
                onOpen={(id) => router.push(`/cellar/${id}`)}
                onMarket={() => router.push({
                  pathname: '/cellar/serve-market',
                  params: { wineId: wine.id, slot, suggested: (slot === 'before' ? suggestion.aperitif?.style : suggestion.digestif?.style) ?? '' },
                })}
              />
            )}
          />
          {canEdit ? (
            <TouchableOpacity onPress={() => void serving.generate()} disabled={serving.generating} activeOpacity={0.7}>
              <Text style={wc.Regen}>{serving.generating ? 'Regenerating…' : 'Regenerate serving suggestions'}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      ) : (
        <>
          {serving.generating ? (
            <View style={s.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Generating serving suggestions…</Text></View>
          ) : canEdit ? (
            <TouchableOpacity style={s.generateBtn} onPress={() => void serving.generate()} activeOpacity={0.7}>
              <Text style={s.generateBtnText}>Generate Serving Suggestions</Text>
            </TouchableOpacity>
          ) : null}
          <PairingIngredientsCard ingredients={serving.ingredients} loading={serving.ingredientsLoading} />
        </>
      )}
    </>
  );
}
