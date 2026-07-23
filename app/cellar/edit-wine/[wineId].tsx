import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar, useWishList } from '../../../src/hooks/useCellar';
import { updateCellarWine } from '../../../src/api/cellar';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Quick "Confirm Wine Details" edit for an EXISTING cellar wine — the same
// producer/name/vintage/style fields as the scan-flow confirm screen, but it
// updates the wine in place (and everywhere it's placed: rack slot, bin cell,
// location list, Full Cellar List) rather than creating a new one.
export default function EditWineScreen() {
  const { wineId } = useLocalSearchParams<{ wineId: string }>();
  const qc = useQueryClient();
  const { wines } = useCellar();
  const { wines: wishlist } = useWishList();
  const wine = wines.find((w) => w.id === wineId) ?? wishlist.find((w) => w.id === wineId) ?? null;

  const [producer, setProducer] = useState('');
  const [region, setRegion] = useState('');
  const [wineName, setWineName] = useState('');
  const [vintage, setVintage] = useState('');
  const [style, setStyle] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (wine && !loaded) {
      setProducer(wine.producer ?? '');
      setRegion(wine.region ?? '');
      setWineName(wine.wine_name ?? '');
      setVintage(wine.vintage ?? '');
      setStyle(wine.style ?? '');
      setLoaded(true);
    }
  }, [wine, loaded]);

  async function handleSave() {
    if (!wine || saving) return;
    if (!wineName.trim() && !producer.trim()) {
      showAlert({ title: 'Name needed', body: 'Add a wine name or producer.' });
      return;
    }
    setSaving(true);
    try {
      await updateCellarWine(wine.id, {
        producer: producer.trim() || null,
        region: region.trim() || null,
        wine_name: wineName.trim() || producer.trim(),
        vintage: vintage.trim() || null,
        style: style.trim() || null,
      });
      // The wine's identity shows in every surface it's placed in — refresh them all.
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['wishlist'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['bin-cells'] });
      qc.invalidateQueries({ queryKey: ['bins'] });
      qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Wine Details</Text>
        <View style={{ width: 40 }} />
      </View>

      {!wine ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>
          <Text style={styles.subheading}>Amend the wine's details, then save.</Text>

          <Text style={styles.label}>Producer</Text>
          <TextInput style={styles.input} value={producer} onChangeText={setProducer} placeholder="e.g. Château Margaux" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Region</Text>
          <TextInput style={styles.input} value={region} onChangeText={setRegion} placeholder="e.g. Margaux, Bordeaux" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Wine Name (optional)</Text>
          <TextInput style={styles.input} value={wineName} onChangeText={setWineName} placeholder="e.g. Reserve, Cuvée Prestige" placeholderTextColor={colors.textMuted} />

          <Text style={styles.label}>Vintage</Text>
          <TextInput style={styles.input} value={vintage} onChangeText={(t) => setVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />

          <Text style={styles.label}>Style</Text>
          <TextInput style={styles.input} value={style} onChangeText={setStyle} placeholder="e.g. Red, White, Rosé, Sparkling, Fortified" placeholderTextColor={colors.textMuted} autoCapitalize="words" />

          <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.buttonText}>Save Changes</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  content: { padding: spacing.xl, paddingBottom: 60 },
  subheading: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg, lineHeight: 21 },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
