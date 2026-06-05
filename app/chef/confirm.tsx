import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineDetailsComplete } from '../../src/types/wine';

export default function ChefConfirmScreen() {
  useKeepAwake();
  const { wineDetails, filters, setWineDetailsConfirmed, setPairings, setError } = useLabelStore();

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

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim() || 'NV',
      style: style.trim() || null,
    };

    setWineDetailsConfirmed(confirmed);

    // The recipe requirements were captured before scanning (Chef tab flow),
    // so generate the pairings now and go straight to the results. If we
    // somehow arrived without requirements, fall back to collecting them.
    if (!filters) {
      router.push('/chef/review-requirements');
      return;
    }

    setLoading(true);
    try {
      const pairings = await generatePairings(confirmed, filters as any);
      setPairings(pairings);
      router.replace('/chef/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      showAlert({ title: 'Error', body: 'Could not generate pairings. Please try again.' });
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="Vinster is selecting three chef-inspired dishes to complement your wine"
        durationMs={65000}
      />
    );
  }

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} bottomOffset={24}>
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>Check the details we've extracted and correct anything that looks wrong.</Text>

      <Text style={styles.label}>Producer</Text>
      <TextInput style={styles.input} value={producer} onChangeText={setProducer}
        placeholder="e.g. Château Margaux" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Region</Text>
      <TextInput style={styles.input} value={region} onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Style</Text>
      <TextInput style={styles.input} value={style} onChangeText={setStyle}
        placeholder="e.g. Red, White, Rosé, Sparkling, Fortified" placeholderTextColor={colors.textMuted}
        autoCapitalize="words" />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <TextInput style={styles.input} value={wineName} onChangeText={setWineName}
        placeholder="e.g. Reserve, Cuvée Prestige" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Vintage (optional)</Text>
      <TextInput style={styles.input} value={vintage} onChangeText={setVintage}
        placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted}
        keyboardType="default" maxLength={4} />

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Text style={styles.confirmButtonText}>Confirm Wine</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.scanAgain} onPress={() => router.replace('/chef/camera')}>
        <Text style={styles.scanAgainText}>Scan again</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  heading: { fontSize: 32, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xs },
  subheading: { fontSize: 16, fontFamily: fonts.headingItalic, color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 22, textAlign: 'center' },
  label: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  confirmButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  scanAgain: { alignItems: 'center', paddingVertical: spacing.lg },
  // Underlined "Scan again" inline link — treat as a subtle text link.
  scanAgainText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
});
