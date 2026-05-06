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

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading } = useChosenWines();
  const { wines: cellarWines } = useCellar();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);

  const cellarNotes = cellarWines.filter((w) => w.user_notes && w.user_notes.trim().length > 0);
  const hasAnything = chosenWines.length > 0 || cellarNotes.length > 0;

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
          {chosenWines.length > 0 && (
            <Text style={styles.sectionHeading}>From restaurants</Text>
          )}
          {chosenWines.map((wine) => (
            <TouchableOpacity key={wine.id} style={styles.cardCompact} onPress={() => setEditingWine(wine)} activeOpacity={0.7}>
              <View style={styles.cardCompactRow}>
                <Text style={styles.wineNameCompact} numberOfLines={1}>
                  {wine.vintage ? `${wine.vintage} ` : ''}{wine.wine_name}
                </Text>
                {wine.user_score != null && (
                  <Text style={styles.scoreCompact}>{wine.user_score}</Text>
                )}
              </View>
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

          {cellarNotes.map((wine) => (
            <TouchableOpacity key={wine.id} style={styles.cardCompact} onPress={() => router.push(`/cellar/${wine.id}`)} activeOpacity={0.7}>
              <View style={styles.cardCompactRow}>
                <Text style={styles.wineNameCompact} numberOfLines={1}>
                  {wine.vintage ? `${wine.vintage} ` : ''}{wine.wine_name}
                </Text>
              </View>
              <View style={styles.cardCompactMetaRow}>
                <Text style={styles.metaText}>{formatDate(wine.created_at)}</Text>
                {wine.producer ? (
                  <Text style={styles.metaText} numberOfLines={1}> · {wine.producer}</Text>
                ) : null}
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
  wineNameCompact: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  scoreCompact: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  sectionHeading: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xs },
});
