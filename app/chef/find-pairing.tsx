import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { findFoodWinePairing } from '../../src/api/label';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { colors, spacing } from '../../src/constants/theme';

export default function FindPairingScreen() {
  useKeepAwake();
  const { wines } = useCellar();
  const { setCellarResult, setGeneralResult, setDish, setMode } = useFoodPairingStore();

  const [dish, setDishLocal] = useState('');
  const [flavours, setFlavours] = useState('');
  const [mode, setModeLocal] = useState<'cellar' | 'general'>('cellar');
  const [loading, setLoading] = useState(false);

  async function handleFind() {
    if (!dish.trim()) {
      Alert.alert('What are you cooking?', 'Please describe your dish first.');
      return;
    }
    if (mode === 'cellar' && wines.length === 0) {
      Alert.alert('Empty cellar', 'Your cellar is empty. Switch to "Suggest a Style" to get a general recommendation.');
      return;
    }

    setLoading(true);
    const fullDish = flavours.trim() ? `${dish.trim()}. Key flavours/ingredients: ${flavours.trim()}` : dish.trim();
    setDish(fullDish);
    setMode(mode);

    try {
      const cellarSummary = wines.map((w) => ({
        id: w.id,
        wine_name: w.wine_name,
        producer: w.producer,
        region: w.region,
        vintage: w.vintage,
        grape_variety: w.grape_variety,
        drinking_window_status: w.drinking_window_status,
      }));

      const result = await findFoodWinePairing(fullDish, mode, mode === 'cellar' ? cellarSummary : undefined) as any;

      if (mode === 'cellar') {
        setCellarResult(result.recommendations as CellarRecommendation[]);
      } else {
        setGeneralResult(result as GeneralRecommendation);
      }
      router.push('/chef/pairing-results');
    } catch {
      Alert.alert('Error', 'Could not find a pairing. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SearchProgress
        title="Finding your perfect pairing…"
        subtitle="Vinster needs up to a minute for your result"
        body={mode === 'cellar'
          ? 'Our sommelier is searching your cellar for the ideal match'
          : 'Our sommelier is selecting the perfect wine style for your dish'}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Find a Wine Pairing</Text>
      <Text style={styles.subheading}>Tell us what you're cooking and we'll find the perfect wine.</Text>

      <Text style={styles.label}>What are you cooking?</Text>
      <TextInput
        style={styles.input}
        value={dish}
        onChangeText={setDishLocal}
        placeholder="e.g. Roast leg of lamb with rosemary and garlic"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Any strong flavours or ingredients?</Text>
      <TextInput
        style={styles.input}
        value={flavours}
        onChangeText={setFlavours}
        placeholder="e.g. Truffle, anchovies, chilli, lemon"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Where should Vinster look?</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'cellar' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('cellar')}
        >
          <Text style={[styles.toggleText, mode === 'cellar' && styles.toggleTextActive]}>From My Cellar</Text>
          {wines.length > 0 && <Text style={[styles.toggleSub, mode === 'cellar' && styles.toggleSubActive]}>{wines.length} bottles</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'general' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('general')}
        >
          <Text style={[styles.toggleText, mode === 'general' && styles.toggleTextActive]}>Suggest a Style</Text>
          <Text style={[styles.toggleSub, mode === 'general' && styles.toggleSubActive]}>To go and buy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleFind}>
        <Text style={styles.buttonText}>Find Pairing</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  loadingBrand: { fontSize: 36, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xxl },
  loadingTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  loadingTiming: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  loadingBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  loadingStay: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textAlign: 'center', opacity: 0.8 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60, alignItems: 'center' },
  backRow: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  heading: { fontSize: 30, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  subheading: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl, textAlign: 'center' },
  label: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 17, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 90, marginBottom: spacing.xl, width: '100%', textAlign: 'center' },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, width: '100%' },
  toggleBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  toggleBtnActive: { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.08)' },
  toggleText: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  toggleTextActive: { color: '#FFFFFF' },
  toggleSub: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  toggleSubActive: { color: colors.burgundy },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
});
