import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useCellar } from '../../src/hooks/useCellar';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { colors, spacing } from '../../src/constants/theme';
import type { ChosenWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function locationLine(wine: ChosenWine): string {
  const parts = [wine.restaurant_name, wine.city].filter(Boolean);
  return parts.join(', ');
}

function headerLine(producer: string | null | undefined, wineName: string | null | undefined, vintage: string | number | null | undefined): string {
  const sameName = (wineName ?? '').trim().toLowerCase() === (producer ?? '').trim().toLowerCase();
  const v = vintage != null ? String(vintage) : null;
  const parts = sameName ? [producer, v] : [producer, wineName, v];
  return parts.filter((p) => p && String(p).trim().length > 0).join(' · ');
}

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading } = useChosenWines();
  const { wines: cellarWines } = useCellar();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const cellarNotes = cellarWines.filter((w) => w.user_notes && w.user_notes.trim().length > 0);
  const hasAnything = chosenWines.length > 0 || cellarNotes.length > 0;

  const sortedChosen = [...chosenWines].sort((a, b) => {
    if (sortBy === 'score') {
      const ar = a.user_score ?? -1;
      const br = b.user_score ?? -1;
      if (ar !== br) return br - ar;
    }
    return new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime();
  });

  const sortedCellar = [...cellarNotes].sort((a, b) => {
    if (sortBy === 'score') {
      const ar = a.review_score ?? -1;
      const br = b.review_score ?? -1;
      if (ar !== br) return br - ar;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        wine={editingWine}
        visible={!!editingWine}
        onClose={() => setEditingWine(null)}
        onSaved={() => setEditingWine(null)}
      />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? null : !hasAnything ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you choose a wine from a Vinster recommendation, tap "Review This Wine" to record it here — with your tasting notes, score, and where you drank it. Notes you save on cellar wines also appear here.
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
              style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
              onPress={() => setSortBy('score')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>Top rated</Text>
            </TouchableOpacity>
          </View>
          {chosenWines.length > 0 && (
            <Text style={styles.sectionHeading}>From restaurants</Text>
          )}
          {sortedChosen.map((wine) => (
            <TouchableOpacity key={wine.id} style={styles.cardCompact} onPress={() => setEditingWine(wine)} activeOpacity={0.7}>
              <View style={styles.cardCompactRow}>
                <Text style={styles.wineNameCompact} numberOfLines={2}>
                  {headerLine(wine.producer, wine.wine_name, wine.vintage)}
                </Text>
                {wine.user_score != null && (
                  <Text style={styles.scoreCompact}>{wine.user_score}</Text>
                )}
              </View>
              {wine.region ? <Text style={styles.regionText} numberOfLines={1}>{wine.region}</Text> : null}
              <View style={styles.cardCompactMetaRow}>
                <Text style={styles.metaText}>{formatDate(wine.chosen_at)}</Text>
                {locationLine(wine) ? (
                  <Text style={styles.metaText} numberOfLines={1}> · {locationLine(wine)}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}

          {cellarNotes.length > 0 && (
            <Text style={styles.sectionHeading}>From your cellar</Text>
          )}

          {sortedCellar.map((wine) => (
            <TouchableOpacity key={wine.id} style={styles.cardCompact} onPress={() => router.push(`/cellar/${wine.id}`)} activeOpacity={0.7}>
              <View style={styles.cardCompactRow}>
                <Text style={styles.wineNameCompact} numberOfLines={2}>
                  {headerLine(wine.producer, wine.wine_name, wine.vintage)}
                </Text>
                {wine.review_score != null && (
                  <Text style={styles.scoreCompact}>{wine.review_score}</Text>
                )}
              </View>
              {wine.region ? <Text style={styles.regionText} numberOfLines={1}>{wine.region}</Text> : null}
              <View style={styles.cardCompactMetaRow}>
                <Text style={styles.metaText}>{formatDate(wine.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  wineNameCompact: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  scoreCompact: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  sectionHeading: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xs },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  sortLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: spacing.xs },
  sortChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, paddingVertical: 4, paddingHorizontal: spacing.md },
  sortChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  sortChipText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  sortChipTextActive: { color: colors.gold },
});
