import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { colors, spacing } from '../../src/constants/theme';
import type { WineDetailsComplete } from '../../src/types/wine';

export default function ChefConfirmScreen() {
  useKeepAwake();
  const { wineDetails, setWineDetailsConfirmed } = useLabelStore();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [vintage, setVintage] = useState(wineDetails?.vintage ?? '');
  const [style, setStyle] = useState(wineDetails?.style ?? '');

  function handleConfirm() {
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
    router.push('/chef/review-requirements');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  heading: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xs },
  subheading: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 22, textAlign: 'center' },
  label: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  confirmButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  scanAgain: { alignItems: 'center', paddingVertical: spacing.lg },
  scanAgainText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, textDecorationLine: 'underline' },
});
