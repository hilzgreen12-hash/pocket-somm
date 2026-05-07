import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChosenRecipes } from '../../src/hooks/useChosenRecipes';
import { colors, spacing } from '../../src/constants/theme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChosenRecipesScreen() {
  const { chosenRecipes, isLoading } = useChosenRecipes();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Recipe Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? null : chosenRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyBody}>
            Tap Review Recipe on any chef pairing to log your cooking notes and score here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {chosenRecipes.map((r) => {
            const winePairing = r.wine_pairing;
            const wineLine = winePairing
              ? [winePairing.producer, winePairing.wineName, winePairing.vintage].filter(Boolean).join(' · ')
              : null;
            const locationLine = [r.cooked_at_location, r.city].filter(Boolean).join(' · ');
            return (
              <View key={r.id} style={styles.card}>
                <Text style={styles.cardDate}>{formatDate(r.chosen_at)}</Text>
                <Text style={styles.cardDish}>{r.dish_name}</Text>
                {r.chef_inspiration ? (
                  <Text style={styles.cardChef}>Inspired by {r.chef_inspiration}</Text>
                ) : null}
                {wineLine ? (
                  <Text style={styles.cardWine}>Paired with {wineLine}</Text>
                ) : null}
                {locationLine ? (
                  <Text style={styles.cardLocation}>{locationLine}</Text>
                ) : null}
                {r.user_score != null ? (
                  <Text style={styles.cardScore}>Your score: {r.user_score}/100</Text>
                ) : null}
                {r.cooking_note ? (
                  <Text style={styles.cardNote}>{r.cooking_note}</Text>
                ) : null}
                {r.other_observations ? (
                  <Text style={styles.cardNote}>{r.other_observations}</Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  cardDish: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardChef: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  cardWine: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text },
  cardLocation: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  cardScore: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.xs },
  cardNote: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20, marginTop: spacing.xs },
});
