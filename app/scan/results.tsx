import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { WineRecommendationCard } from '../../src/components/results/WineRecommendationCard';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ResultsScreen() {
  const { recommendation, reset } = useScanStore();

  if (!recommendation) {
    router.replace('/(tabs)/scan');
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <Text style={styles.heading}>Our Recommendation</Text>

      {recommendation.wines.map((wine, i) => (
        <WineRecommendationCard
          key={wine.name}
          wine={wine}
          rank={i + 1}
        />
      ))}

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
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  newScanButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.burgundy,
    alignItems: 'center',
  },
  newScanText: {
    color: colors.burgundy,
    fontWeight: '600',
    fontSize: 16,
  },
});
