import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { extractWineList } from '../../src/services/ocr';
import { recommendWines } from '../../src/services/recommender';
import { colors, spacing } from '../../src/constants/theme';

type Stage = 'reading' | 'recommending' | 'error';

export default function ExtractingScreen() {
  const { imageUri, preferences, setExtractedWines, setRecommendation, setError } = useScanStore();
  const [stage, setStage] = useState<Stage>('reading');
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    if (!imageUri) {
      router.replace('/(tabs)/scan');
      return;
    }
    run();
  }, []);

  async function run() {
    try {
      // Step 1: OCR
      setStage('reading');
      const wines = await extractWineList(imageUri!);

      if (!wines.length) {
        setErrorDetail('No wines were detected in the photo. Try a clearer shot with better lighting, and make sure the full list is in frame.');
        setStage('error');
        return;
      }

      setExtractedWines(wines);

      // Step 2: Recommend
      setStage('recommending');
      const recommendation = await recommendWines({
        wines,
        wineType: preferences.wineType,
        styleProfiles: preferences.styleProfiles,
        budget: preferences.budget,
        foodPairing: preferences.foodPairing,
      });
      setRecommendation(recommendation);
      router.replace('/scan/results');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorDetail(message);
      setError(message);
      setStage('error');
    }
  }

  if (stage === 'error') {
    return (
      <ScrollView contentContainerStyle={styles.errorContainer}>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorBody}>{errorDetail}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.replace('/(tabs)/scan')}>
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.burgundy} />
      <Text style={styles.title}>
        {stage === 'reading' ? 'Reading wine list…' : 'Finding your best match…'}
      </Text>
      <Text style={styles.body}>
        {stage === 'reading'
          ? 'Claude is identifying the wines on your list'
          : 'Scoring by critic rating, vintage quality and value'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  body: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  errorBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  retryButton: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
