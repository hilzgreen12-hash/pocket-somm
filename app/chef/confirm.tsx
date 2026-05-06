import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings } from '../../src/api/label';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import type { WineDetailsComplete } from '../../src/types/wine';

export default function ChefConfirmScreen() {
  useKeepAwake();
  const { wineDetails, setWineDetailsConfirmed, setPairings, setError } = useLabelStore();
  const { preferences } = usePreferences();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [vintage, setVintage] = useState(wineDetails?.vintage ?? '');
  const [style, setStyle] = useState('');
  const [dietaryNote, setDietaryNote] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const DIFFICULTY_OPTIONS = [
    'Super Simple',
    'Easy to Moderate',
    'Challenging',
    'Very Technical',
  ];

  async function handleConfirm() {
    if (!producer.trim() || !region.trim()) {
      Alert.alert('Missing details', 'Producer and region are required.');
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim() || 'NV',
      style: style.trim() || null,
    };

    setLoading(true);
    setWineDetailsConfirmed(confirmed);

    try {
      const filters = {
        dietary: (preferences?.dietaryNeeds?.[0] ?? null) as any,
        allergens: (preferences?.allergyRisks ?? []) as any,
        customAllergen: '',
        dietaryNote: dietaryNote.trim() || null,
        difficulty: difficulty || null,
        specificConcerns: preferences?.specificConcerns?.trim() || null,
        regionalPreferences: preferences?.regionalPreferences ?? [],
        nutritionalPreferences: preferences?.nutritionalPreferences ?? [],
      };
      const pairings = await generatePairings(confirmed, filters);
      setPairings(pairings);

      try {
        const raw = await AsyncStorage.getItem('vinster_chef_history');
        const history = raw ? JSON.parse(raw) : [];
        history.unshift({ id: Date.now().toString(), timestamp: new Date().toISOString(), wine: confirmed, pairings });
        await AsyncStorage.setItem('vinster_chef_history', JSON.stringify(history.slice(0, 30)));
      } catch { /* non-critical */ }

      router.replace('/chef/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      Alert.alert('Error', 'Could not generate pairings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="Our sommelier is selecting three chef-inspired dishes to complement your wine"
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>Check the details we extracted and correct anything that looks wrong.</Text>

      <Text style={styles.label}>Producer</Text>
      <TextInput style={styles.input} value={producer} onChangeText={setProducer}
        placeholder="e.g. Château Margaux" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Region</Text>
      <TextInput style={styles.input} value={region} onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Style (optional)</Text>
      <TextInput style={styles.input} value={style} onChangeText={setStyle}
        placeholder="e.g. Red, White, Rosé, Sparkling" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <TextInput style={styles.input} value={wineName} onChangeText={setWineName}
        placeholder="e.g. Reserve, Cuvée Prestige" placeholderTextColor={colors.textMuted} />

      <Text style={styles.label}>Vintage (optional)</Text>
      <TextInput style={styles.input} value={vintage} onChangeText={setVintage}
        placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted}
        keyboardType="default" maxLength={4} />

      <View style={styles.sectionDivider} />

      <Text style={styles.label}>Dietary restrictions or allergies (optional)</Text>
      <TextInput
        style={styles.input}
        value={dietaryNote}
        onChangeText={setDietaryNote}
        placeholder="e.g. Nut allergy, dairy-free, no shellfish"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Recipe difficulty</Text>
      <View style={styles.difficultyGrid}>
        {DIFFICULTY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.difficultyBtn, difficulty === opt && styles.difficultyBtnActive]}
            onPress={() => setDifficulty(difficulty === opt ? null : opt)}
          >
            <Text style={[styles.difficultyBtnText, difficulty === opt && styles.difficultyBtnTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleConfirm} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Crafting pairings…' : 'Get Pairings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Scan Again</Text>
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
  content: { padding: spacing.xl, paddingBottom: 60 },
  heading: { fontSize: 26, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  subheading: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xl, lineHeight: 20 },
  label: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  sectionDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  difficultyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  difficultyBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  difficultyBtnActive: { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.10)' },
  difficultyBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.textMuted },
  difficultyBtnTextActive: { color: '#FFFFFF' },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  backButton: { alignItems: 'center', marginTop: spacing.lg },
  backText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
});
