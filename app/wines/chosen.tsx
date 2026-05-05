import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { colors, spacing } from '../../src/constants/theme';
import type { ChosenWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function locationLine(wine: ChosenWine): string {
  const parts = [wine.restaurant_name, wine.address, wine.city].filter(Boolean);
  return parts.join(', ');
}

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading } = useChosenWines();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Chosen Wines</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? null : chosenWines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you order a wine from a Vinster recommendation, tap "I ordered this" to record it here — with your tasting notes, score, and where you drank it.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {chosenWines.map((wine) => (
            <View key={wine.id} style={styles.card}>

              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.wineName}>
                    {wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}
                  </Text>
                  <Text style={styles.wineProducer}>
                    {wine.producer}{wine.region ? ` · ${wine.region}` : ''}
                    {wine.grape ? ` · ${wine.grape}` : ''}
                  </Text>
                </View>
                {wine.user_score != null && (
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreValue}>{wine.user_score}</Text>
                    <Text style={styles.scoreMax}>/100</Text>
                  </View>
                )}
              </View>

              {locationLine(wine) ? (
                <Text style={styles.location}>{locationLine(wine)}</Text>
              ) : null}
              <Text style={styles.date}>{formatDate(wine.chosen_at)}</Text>

              {wine.tasting_note ? (
                <View style={styles.noteBlock}>
                  <Text style={styles.noteLabel}>Tasting note</Text>
                  <Text style={styles.noteText}>{wine.tasting_note}</Text>
                </View>
              ) : null}

              {wine.critic_score ? (
                <Text style={styles.criticScore}>Critic score: {wine.critic_score} pts</Text>
              ) : null}

              {wine.drinking_window?.status ? (
                <Text style={styles.drinkingStatus}>
                  Drinking window: {wine.drinking_window.status}
                  {wine.drinking_window.from && wine.drinking_window.to
                    ? ` (${wine.drinking_window.from}–${wine.drinking_window.to})`
                    : ''}
                </Text>
              ) : null}

              {wine.vintage_assessment?.label ? (
                <Text style={styles.vintage}>
                  Vintage: {wine.vintage_assessment.label} — {wine.vintage_assessment.notes}
                </Text>
              ) : null}

            </View>
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
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.lg,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.xs },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  wineProducer: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline', marginLeft: spacing.sm },
  scoreValue: { fontSize: 28, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  scoreMax: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginLeft: 1 },
  location: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, marginTop: spacing.xs },
  date: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2, marginBottom: spacing.sm },
  noteBlock: { borderLeftWidth: 2, borderLeftColor: colors.gold, paddingLeft: spacing.sm, marginVertical: spacing.sm },
  noteLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22 },
  criticScore: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 4 },
  drinkingStatus: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  vintage: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2, lineHeight: 18 },
});
