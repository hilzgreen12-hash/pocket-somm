import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { FoodPairingInput } from '../../src/components/preferences/FoodPairingInput';
import { recommendWines } from '../../src/services/recommender';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function PreferencesScreen() {
  const { extractedWines, error: extractError, setRecommendation, setError } = useScanStore();
  const { preferences } = usePreferences();

  const [styleProfiles, setStyleProfiles] = useState<string[]>(preferences?.styleProfiles ?? []);
  const [budget, setBudget] = useState<number>(preferences?.defaultBudget ?? 150);
  const [foodPairing, setFoodPairing] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleGetRecommendation() {
    if (!extractedWines?.length) {
      Alert.alert('No wines found', 'We couldn\'t read any wines from your photo. Please try again.');
      return;
    }
    setLoading(true);
    try {
      const recommendation = await recommendWines({
        wines: extractedWines,
        styleProfiles,
        budget,
        foodPairing,
      });
      setRecommendation(recommendation);
      router.push('/scan/results');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Recommendation failed';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Your Preferences</Text>
      <Text style={styles.subheading}>
        {extractedWines?.length
          ? `Found ${extractedWines.length} wines. Tell us what you're looking for.`
          : extractError
          ? 'We had trouble reading the list. You can still set preferences.'
          : 'All fields are optional.'}
      </Text>

      <View style={styles.section}>
        <Text style={styles.label}>Style</Text>
        <StylePicker selected={styleProfiles} onChange={setStyleProfiles} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Max Budget (per bottle)</Text>
        <BudgetSlider value={budget} onChange={setBudget} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Food Pairing</Text>
        <FoodPairingInput value={foodPairing} onChange={setFoodPairing} />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleGetRecommendation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Finding your wine…' : 'Get Recommendation'}
        </Text>
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
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.burgundy,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
