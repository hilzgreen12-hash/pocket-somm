import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { getWineIntelligence, generatePairings } from '../../src/api/label';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import type { WineDetailsComplete } from '../../src/types/wine';

export default function LabelConfirmScreen() {
  useKeepAwake();
  const { wineDetails, setWineDetailsConfirmed, setIntelligence, setPairings, setError } = useLabelStore();
  const { preferences } = usePreferences();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [vintage, setVintage] = useState(wineDetails?.vintage ?? '');
  const [style, setStyle] = useState(wineDetails?.style ?? '');
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    if (!producer.trim() || !region.trim()) {
      Alert.alert('Missing details', 'Producer and region are required.');
      return;
    }
    if (!vintage.trim()) {
      Alert.alert('Missing vintage', 'Please enter a vintage year or NV.');
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim(),
      style: style.trim() || null,
    };

    setLoading(true);
    setWineDetailsConfirmed(confirmed);

    try {
      const intel = await getWineIntelligence(confirmed, preferences?.defaultCurrency ?? 'GBP');
      setIntelligence(intel);
      router.replace('/label/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wine details');
      Alert.alert('Error', 'Could not load wine details. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>Check the details we extracted and correct anything that looks wrong.</Text>

      <Text style={styles.label}>Producer</Text>
      <TextInput
        style={styles.input}
        value={producer}
        onChangeText={setProducer}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={wineName}
        onChangeText={setWineName}
        placeholder="e.g. Reserve, Cuvée Prestige"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={styles.input}
        value={vintage}
        onChangeText={setVintage}
        placeholder="e.g. 2019 or NV"
        placeholderTextColor={colors.textMuted}
        keyboardType="default"
        maxLength={4}
      />

      <Text style={styles.label}>Style</Text>
      <TextInput
        style={styles.input}
        value={style}
        onChangeText={setStyle}
        placeholder="e.g. Red, White, Rosé, Sparkling, Fortified"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading wine details…' : 'Confirm'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Scan Again</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 60 },
  heading: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
  backButton: { alignItems: 'center', marginTop: spacing.lg },
  backText: {
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
  },
});
