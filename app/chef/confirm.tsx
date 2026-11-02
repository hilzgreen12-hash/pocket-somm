import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, View, Image } from 'react-native';
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
  const { wineDetails, imageUri, filters, setWineDetailsConfirmed, setPairings, setError } = useLabelStore();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [grape, setGrape] = useState(wineDetails?.grape ?? '');
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
      // Carried in the pairing payload. NB the generate-pairings prompt lists
      // producer/region/name/vintage/colour but not the grape yet, so today the
      // variety only reaches Claude by inference — adding it to that prompt is
      // a one-line edge-function change.
      grape: grape.trim() || null,
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
    <View style={styles.container}>
      {/* The shared confirm/edit header bar — same arrow, same centred title as
          the scan-flow Confirm and the Edit Wine Details screen. */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/chef/camera')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Wine Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        {/* The label just scanned, framed in the cream mat the cellar
            thumbnails use — easier to check the fields against the bottle. */}
        {imageUri ? (
          <View style={styles.thumbBlock}>
            <View style={styles.thumbFrame}>
              <Image source={{ uri: imageUri }} style={styles.thumbImg} resizeMode="cover" />
            </View>
          </View>
        ) : null}

        <Text style={styles.label}>Producer</Text>
        <TextInput style={styles.input} value={producer} onChangeText={setProducer}
          placeholder="e.g. Château Margaux" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Region</Text>
        <TextInput style={styles.input} value={region} onChangeText={setRegion}
          placeholder="e.g. Margaux, Bordeaux" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Wine Name (optional)</Text>
        <TextInput style={styles.input} value={wineName} onChangeText={setWineName}
          placeholder="e.g. Reserve, Cuvée Prestige" placeholderTextColor={colors.textMuted} />

        <Text style={styles.label}>Grape Variety</Text>
        <TextInput style={styles.input} value={grape} onChangeText={setGrape}
          placeholder="e.g. Albariño, Cabernet Sauvignon" placeholderTextColor={colors.textMuted}
          autoCapitalize="words" />

        <Text style={styles.label}>Vintage</Text>
        <TextInput style={styles.input} value={vintage} onChangeText={setVintage}
          placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted}
          keyboardType="default" maxLength={4} />

        <Text style={styles.label}>Style</Text>
        <TextInput style={styles.input} value={style} onChangeText={setStyle}
          placeholder="e.g. Red, White, Rosé, Sparkling, Fortified" placeholderTextColor={colors.textMuted}
          autoCapitalize="words" />

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm} activeOpacity={0.85}>
          <Text style={styles.confirmButtonText}>Confirm Wine</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.scanAgain} onPress={() => router.replace('/chef/camera')}>
          <Text style={styles.scanAgainText}>Scan again</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

// Shared with the scan-flow Confirm and the Edit Wine Details screen — the
// three wine-detail surfaces are deliberately metric-for-metric identical, so
// keep any change here in step with them.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 60 },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  thumbBlock: { alignItems: 'center', marginBottom: spacing.lg },
  thumbFrame: { backgroundColor: colors.cream, padding: 4, borderRadius: 12, overflow: 'hidden' },
  thumbImg: { width: 160, height: 210, borderRadius: 8 },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginBottom: 6, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  confirmButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 17 },
  scanAgain: { alignItems: 'center', paddingVertical: spacing.md },
  // Underlined "Scan again" inline link — treat as a subtle text link.
  scanAgainText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
});
