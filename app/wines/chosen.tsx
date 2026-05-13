import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useCellar } from '../../src/hooks/useCellar';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { AddChosenWineModal } from '../../src/components/AddChosenWineModal';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { ChosenWine, CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function locationLine(wine: ChosenWine): string {
  const parts = [wine.restaurant_name, wine.city].filter(Boolean);
  return parts.join(', ');
}

function formatListPrice(wine: ChosenWine): string | null {
  if (wine.menu_price == null) return null;
  const cur = (wine.currency ?? 'GBP').toUpperCase();
  const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
  const sym = map[cur] ?? `${cur} `;
  return `${sym}${wine.menu_price}`;
}

type ReviewItem =
  | { source: 'restaurant'; date: string; score: number | null; wine: ChosenWine }
  | { source: 'cellar';     date: string; score: number | null; wine: CellarWine };

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading } = useChosenWines();
  const { wines: cellarWines } = useCellar();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'city' | 'score'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'cellar' | 'restaurant'>('all');

  // Cellar wines that have ANY user-supplied review content count as a
  // "cellar review".
  const cellarReviews = cellarWines.filter((w) =>
    (w.user_notes && w.user_notes.trim().length > 0) ||
    w.review_score != null ||
    (w.review_location && w.review_location.trim().length > 0) ||
    !!w.review_date
  );

  const items: ReviewItem[] = [
    ...chosenWines.map((w): ReviewItem => ({ source: 'restaurant', date: w.chosen_at, score: w.user_score, wine: w })),
    ...cellarReviews.map((w): ReviewItem => ({ source: 'cellar', date: w.review_date ?? w.created_at, score: w.review_score, wine: w })),
  ];

  const filtered = filterBy === 'all' ? items : items.filter((i) => i.source === filterBy);

  // For city sort we read off the chosen_wines.city for restaurant
  // reviews; cellar reviews keep the location they were drunk at in the
  // free-text review_location. Rows with no city sort to the bottom.
  function cityFor(item: ReviewItem): string {
    if (item.source === 'restaurant') return (item.wine as ChosenWine).city?.trim() ?? '';
    return (item.wine as CellarWine).review_location?.trim() ?? '';
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'score') {
      const ar = a.score ?? -1;
      const br = b.score ?? -1;
      if (ar !== br) return br - ar;
    } else if (sortBy === 'city') {
      const ac = cityFor(a).toLowerCase();
      const bc = cityFor(b).toLowerCase();
      const aEmpty = ac.length === 0;
      const bEmpty = bc.length === 0;
      if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
      const cmp = ac.localeCompare(bc);
      if (cmp !== 0) return cmp;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const hasAnything = items.length > 0;

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        wine={editingWine}
        visible={!!editingWine}
        onClose={() => setEditingWine(null)}
        onSaved={() => setEditingWine(null)}
      />

      <AddChosenWineModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => setAddOpen(false)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Reviews</Text>
        <TouchableOpacity
          onPress={() => setAddOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? null : !hasAnything ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you choose a wine from a Vinster recommendation, tap "Review This Wine" to record it here — or tap + Add at the top to enter a wine by hand. Notes you save on cellar wines also appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'date' && styles.sortChipActive]}
              onPress={() => setSortBy('date')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'date' && styles.sortChipTextActive]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'city' && styles.sortChipActive]}
              onPress={() => setSortBy('city')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'city' && styles.sortChipTextActive]}>City</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
              onPress={() => setSortBy('score')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>Top rated</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Show:</Text>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'all' && styles.sortChipActive]}
              onPress={() => setFilterBy('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'all' && styles.sortChipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'cellar' && styles.sortChipActive]}
              onPress={() => setFilterBy('cellar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'cellar' && styles.sortChipTextActive]}>Cellar wines</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'restaurant' && styles.sortChipActive]}
              onPress={() => setFilterBy('restaurant')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'restaurant' && styles.sortChipTextActive]}>Restaurant wines</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyBody}>No reviews match this filter.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              const w = item.wine;
              const onPress = item.source === 'restaurant'
                ? () => setEditingWine(item.wine as ChosenWine)
                : () => router.push(`/cellar/${(item.wine as CellarWine).id}?from=reviews` as any);
              const locText = item.source === 'restaurant'
                ? locationLine(item.wine as ChosenWine)
                : (item.wine as CellarWine).review_location ?? '';
              return (
                <TouchableOpacity
                  key={`${item.source}-${w.id}`}
                  style={styles.cardCompact}
                  onPress={onPress}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardCompactRow}>
                    <Text style={styles.wineNameCompact} numberOfLines={2}>
                      {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    <View style={styles.scoreCluster}>
                      {item.source === 'restaurant' && (item.wine as ChosenWine).is_favourite ? (
                        <Text style={styles.favouriteStar}>★</Text>
                      ) : null}
                      {item.score != null && (
                        <Text style={styles.scoreCompact}>{item.score}</Text>
                      )}
                    </View>
                  </View>
                  {w.region ? <Text style={styles.regionText} numberOfLines={1}>{w.region}</Text> : null}
                  <View style={styles.cardCompactMetaRow}>
                    <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    {locText ? <Text style={styles.metaText} numberOfLines={1}> · {locText}</Text> : null}
                    {item.source === 'restaurant' && formatListPrice(item.wine as ChosenWine) ? (
                      <Text style={styles.metaText}> · {formatListPrice(item.wine as ChosenWine)}</Text>
                    ) : null}
                    <Text style={styles.metaText}> · {item.source === 'restaurant' ? 'Restaurant' : 'Cellar'}</Text>
                  </View>
                  <View style={styles.saveToCommunityRow}>
                    <Text style={styles.saveToCommunityText}>
                      Save to Community <Text style={styles.comingSoonInline}>(coming soon)</Text>
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  addLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.5, width: 50, textAlign: 'right' },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  wineNameCompact: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  scoreCompact: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  scoreCluster: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  favouriteStar: { fontSize: 18, color: colors.gold },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  emptyFilter: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  sortLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: spacing.xs },
  sortChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, paddingVertical: 4, paddingHorizontal: spacing.md },
  sortChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  sortChipText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  sortChipTextActive: { color: colors.gold },
  saveToCommunityRow: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    alignItems: 'center',
  },
  saveToCommunityText: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: 'rgba(212,176,96,0.45)',
    letterSpacing: 0.3,
  },
  comingSoonInline: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.textMuted,
    textTransform: 'lowercase',
    letterSpacing: 0.5,
  },
});
