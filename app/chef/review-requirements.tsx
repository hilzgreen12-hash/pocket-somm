import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { SearchProgress } from '../../src/components/SearchProgress';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { useLabelStore } from '../../src/stores/labelStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian'];
const ALLERGY_OPTIONS = ['Nut Free', 'Dairy Free', 'Gluten Free'];
const DIFFICULTY_OPTIONS = ['Super Simple', 'Easy to Moderate', 'Challenging', 'Very Technical'];

const TIME_OPTIONS = [
  { value: 'under_30',   label: 'Time is of the Essence', sub: 'Under 30 minutes' },
  { value: 'under_1h',   label: 'Easy Breezy',            sub: 'Under 1 hour' },
  { value: 'all_day',    label: "I've got all day",        sub: 'Up to 3 hours' },
  { value: 'low_slow',   label: 'Low & Slow',             sub: '3 hours plus' },
];

export default function ReviewRequirementsScreen() {
  useKeepAwake();
  const { wineDetailsConfirmed, setPairings, setError, setFilters } = useLabelStore();
  const { preferences } = usePreferences();

  const [dietary, setDietary] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [specificConcerns, setSpecificConcerns] = useState('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [timeChoice, setTimeChoice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!wineDetailsConfirmed) {
      Alert.alert('Missing wine details', 'Please confirm the wine first.');
      router.replace('/chef/confirm');
      return;
    }
    setLoading(true);
    try {
      // Combine profile preferences with the per-pairing additions chosen
      // here. Profile values stay the baseline; this screen adds extras for
      // THIS recipe only.
      const profileDietary = preferences?.dietaryNeeds ?? [];
      const profileAllergies = preferences?.allergyRisks ?? [];
      const mergedDietary = Array.from(new Set([...profileDietary, ...dietary]));
      const mergedAllergies = Array.from(new Set([...profileAllergies, ...allergies]));
      const mergedConcerns = [
        preferences?.specificConcerns?.trim() || '',
        specificConcerns.trim(),
      ].filter(Boolean).join('. ');

      const timeBlock = TIME_OPTIONS.find((t) => t.value === timeChoice);
      const timeLabel = timeBlock ? `${timeBlock.label} (${timeBlock.sub})` : null;

      const filters = {
        dietary: (mergedDietary[0] ?? null) as any,
        allergens: mergedAllergies as any,
        customAllergen: '',
        dietaryNote: null,
        difficulty: difficulty || null,
        timeConsideration: timeLabel,
        specificConcerns: mergedConcerns || null,
        regionalPreferences: preferences?.regionalPreferences ?? [],
        nutritionalPreferences: preferences?.nutritionalPreferences ?? [],
      };
      const pairings = await generatePairings(wineDetailsConfirmed, filters);
      setPairings(pairings);
      setFilters(filters as unknown as Record<string, unknown>);
      // The user is offered a "Save to Archive" button on the results screen;
      // we no longer persist eagerly here.
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
      <Text style={styles.heading}>Review Recipe Requirements</Text>
      <Text style={styles.subheading}>
        Vinster will use your profile preferences to guide its recipe recommendations. Input any dietary restrictions or allergies to consider for this particular recipe below.
      </Text>

      <Text style={styles.label}>Dietary Concerns</Text>
      <View style={styles.chipWrap}>
        <ChipPicker
          options={DIETARY_OPTIONS}
          selected={dietary}
          onChange={setDietary}
        />
      </View>

      <Text style={styles.label}>Allergies</Text>
      <View style={styles.chipWrap}>
        <ChipPicker
          options={ALLERGY_OPTIONS}
          selected={allergies}
          onChange={setAllergies}
        />
      </View>

      <Text style={styles.label}>Specific Concerns</Text>
      <TextInput
        style={styles.input}
        value={specificConcerns}
        onChangeText={setSpecificConcerns}
        placeholder="e.g. no raw fish, soft food only, low spice"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Recipe Difficulty</Text>
      <View style={styles.optionGrid}>
        {DIFFICULTY_OPTIONS.map((opt) => {
          const active = difficulty === opt;
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.optionBtn, active && styles.optionBtnActive]}
              onPress={() => setDifficulty(active ? null : opt)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionBtnText, active && styles.optionBtnTextActive]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.label}>Time Consideration</Text>
      <View style={styles.timeList}>
        {TIME_OPTIONS.map((opt) => {
          const active = timeChoice === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.timeRow, active && styles.timeRowActive]}
              onPress={() => setTimeChoice(active ? null : opt.value)}
              activeOpacity={0.7}
            >
              <View style={styles.timeRowMain}>
                <Text style={[styles.timeRowLabel, active && styles.timeRowLabelActive]}>{opt.label}</Text>
                <Text style={[styles.timeRowSub, active && styles.timeRowSubActive]}>{opt.sub}</Text>
              </View>
              {active && <Text style={styles.timeCheck}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[styles.continueButton, loading && styles.buttonDisabled]} onPress={handleContinue} disabled={loading}>
        <Text style={styles.continueButtonText}>{loading ? 'Crafting pairings…' : 'Get Pairings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  heading: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xs },
  subheading: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  label: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  chipWrap: { marginBottom: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.lg },
  optionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.lg },
  optionBtn: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 20, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  optionBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  optionBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.textMuted },
  optionBtnTextActive: { color: colors.gold },
  timeList: { gap: spacing.xs, marginBottom: spacing.lg },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  timeRowActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  timeRowMain: { flex: 1 },
  timeRowLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.text },
  timeRowLabelActive: { color: colors.gold },
  timeRowSub: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginTop: 2 },
  timeRowSubActive: { color: colors.gold },
  timeCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  continueButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  back: { alignItems: 'center', paddingVertical: spacing.lg },
  backText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, textDecorationLine: 'underline' },
});
