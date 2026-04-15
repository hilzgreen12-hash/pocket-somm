import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { WineRecommendationCard } from '../../src/components/results/WineRecommendationCard';
import { colors, spacing } from '../../src/constants/theme';

export default function ResultsScreen() {
  const { recommendation, reset } = useScanStore();

  if (!recommendation) {
    router.replace('/(tabs)/scan');
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Pocket Somm recommends</Text>
        <Text style={styles.heading}>Your Wines</Text>
        {recommendation.summary ? (
          <Text style={styles.summary}>{recommendation.summary}</Text>
        ) : null}
      </View>

      <View style={styles.cards}>
        {recommendation.wines.map((wine, i) => (
          <WineRecommendationCard
            key={wine.name + i}
            wine={wine}
            rank={i + 1}
          />
        ))}
      </View>

      <TouchableOpacity
        style={styles.newScanButton}
        onPress={() => {
          reset();
          router.replace('/(tabs)/scan');
        }}
      >
        <Text style={styles.newScanText}>Scan Another List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    paddingTop: 64,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 11,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.burgundy,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  heading: {
    fontSize: 32,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: spacing.md,
  },
  summary: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
  },
  cards: {
    paddingHorizontal: spacing.md,
  },
  newScanButton: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
  },
  newScanText: {
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
  },
});
