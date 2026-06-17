import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { getWineIntelligence, generatePairings } from '../../src/api/label';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineDetailsComplete } from '../../src/types/wine';

export default function LabelConfirmScreen() {
  useKeepAwake();
  const { context, manual } = useLocalSearchParams<{ context?: string; manual?: string }>();
  // Forward any context (wishlist / reviews / …) so /label/results knows
  // which flow we're in for back routing and which action set to show.
  const contextQuery = context ? `?context=${context}` : '';
  // Reached straight from Cellar → Add Wine → Manual Input: no scan
  // happened, so the form opens blank and there's nothing to "scan again".
  const isManual = manual === '1';
  // Reached from Scan a Lineup — Back returns to the lineup list to continue
  // onboarding the remaining bottles.
  const isLineup = context === 'lineup';
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
      showAlert({ title: 'Missing details', body: 'Producer and region are required.' });
      return;
    }
    if (!vintage.trim()) {
      showAlert({ title: 'Missing vintage', body: 'Please enter a vintage year or NV.' });
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim(),
      style: style.trim() || null,
      // Pass any bottle size the scanner read off the label straight
      // through to /label/results so the Add modal can pre-populate the
      // picker. The user can still adjust it on that screen.
      bottleSizeMl: wineDetails?.bottleSizeMl ?? null,
    };

    setLoading(true);
    setWineDetailsConfirmed(confirmed);

    try {
      const intel = await getWineIntelligence(confirmed, preferences?.defaultCurrency ?? 'GBP');
      setIntelligence(intel);
      router.replace(`/label/results${contextQuery}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wine details');
      showAlert({ title: 'Error', body: 'Could not load wine details. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>
        {isManual
          ? "Enter the wine's details below."
          : 'Check the details we extracted and correct anything that looks wrong.'}
      </Text>

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

      {isLineup ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/cellar/scan-lineup')}>
          <Text style={styles.backText}>Back to Lineup</Text>
        </TouchableOpacity>
      ) : isManual ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace(`/label/camera${contextQuery}`)}>
          <Text style={styles.backText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 130, paddingBottom: 60 },
  heading: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    fontFamily: fonts.headingRegular,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Form field label — body.
  label: {
    fontSize: 13,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Form input — body.
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
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
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
  backButton: { alignItems: 'center', marginTop: spacing.lg },
  // Back/nav link — body.
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
  },
});
