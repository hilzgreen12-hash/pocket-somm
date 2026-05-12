import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useLabelStore } from '../../src/stores/labelStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

const DIETARY_OPTIONS = ['None', 'Vegetarian', 'Vegan', 'Pescatarian'];
const ALLERGY_OPTIONS = ['None', 'Nut Free', 'Dairy Free', 'Gluten Free'];
const DIFFICULTY_OPTIONS = ['Any', 'Super Simple', 'Easy to Moderate', 'Challenging', 'Very Technical'];

const TIME_OPTIONS: { value: string; label: string; sub?: string }[] = [
  { value: 'any',        label: 'Any' },
  { value: 'under_30',   label: 'Time is of the Essence', sub: 'Under 30 minutes' },
  { value: 'under_1h',   label: 'Easy Breezy',            sub: 'Under 1 hour' },
  { value: 'all_day',    label: "I've got all day",        sub: 'Up to 3 hours' },
  { value: 'low_slow',   label: 'Low & Slow',             sub: '3 hours plus' },
];

type DropdownField = 'dietary' | 'allergy' | 'difficulty' | 'time' | null;

export default function ReviewRequirementsScreen() {
  useKeepAwake();
  const { from, wineId } = useLocalSearchParams<{ from?: string; wineId?: string }>();
  // When the user arrived from the cellar wine card, thread the source
  // through to /chef/results so its Back button can route home properly.
  const resultsQuery = from === 'cellar' && wineId ? `?from=cellar&wineId=${wineId}` : '';
  const { wineDetailsConfirmed, setPairings, setError, setFilters } = useLabelStore();
  const { preferences } = usePreferences();

  const [dietary, setDietary] = useState<string>('None');
  const [allergy, setAllergy] = useState<string>('None');
  const [specificConcerns, setSpecificConcerns] = useState('');
  const [difficulty, setDifficulty] = useState<string>('Any');
  const [timeChoice, setTimeChoice] = useState<string>('any');
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);

  const timeBlock = TIME_OPTIONS.find((t) => t.value === timeChoice) ?? TIME_OPTIONS[0];
  const timeDisplay = timeBlock.sub ? `${timeBlock.label} · ${timeBlock.sub}` : timeBlock.label;

  async function handleContinue() {
    if (!wineDetailsConfirmed) {
      showAlert({ title: 'Missing wine details', body: 'Please confirm the wine first.' });
      router.replace('/chef/confirm');
      return;
    }
    setLoading(true);
    try {
      // Combine profile preferences with the per-pairing additions chosen
      // here. Profile values stay the baseline; this screen adds extras for
      // THIS recipe only. "None" / "Any" act as no-op selections.
      const profileDietary = preferences?.dietaryNeeds ?? [];
      const profileAllergies = preferences?.allergyRisks ?? [];
      const dietaryAdds = dietary !== 'None' ? [dietary] : [];
      const allergyAdds = allergy !== 'None' ? [allergy] : [];
      const mergedDietary = Array.from(new Set([...profileDietary, ...dietaryAdds]));
      const mergedAllergies = Array.from(new Set([...profileAllergies, ...allergyAdds]));
      const mergedConcerns = [
        preferences?.specificConcerns?.trim() || '',
        specificConcerns.trim(),
      ].filter(Boolean).join('. ');

      const timeLabel = timeChoice !== 'any' && timeBlock.sub
        ? `${timeBlock.label} (${timeBlock.sub})`
        : null;

      const filters = {
        dietary: (mergedDietary[0] ?? null) as any,
        allergens: mergedAllergies as any,
        customAllergen: '',
        dietaryNote: null,
        difficulty: difficulty !== 'Any' ? difficulty : null,
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
      router.replace(`/chef/results${resultsQuery}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      showAlert({ title: 'Error', body: 'Could not generate pairings. Please try again.' });
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

  function dropdownConfig(field: DropdownField): { title: string; options: { value: string; label: string; sub?: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'dietary') {
      return {
        title: 'Dietary Concerns',
        options: DIETARY_OPTIONS.map((o) => ({ value: o, label: o })),
        selected: dietary,
        onSelect: setDietary,
      };
    }
    if (field === 'allergy') {
      return {
        title: 'Allergies',
        options: ALLERGY_OPTIONS.map((o) => ({ value: o, label: o })),
        selected: allergy,
        onSelect: setAllergy,
      };
    }
    if (field === 'difficulty') {
      return {
        title: 'Recipe Difficulty',
        options: DIFFICULTY_OPTIONS.map((o) => ({ value: o, label: o })),
        selected: difficulty,
        onSelect: setDifficulty,
      };
    }
    if (field === 'time') {
      return {
        title: 'Time Consideration',
        options: TIME_OPTIONS,
        selected: timeChoice,
        onSelect: setTimeChoice,
      };
    }
    return null;
  }

  const activeDropdown = dropdownConfig(openDropdown);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Review Recipe Requirements</Text>
      <Text style={styles.subheading}>
        Vinster will use your profile preferences to guide its recipe recommendations. Input any dietary restrictions or allergies to consider for this particular recipe below.
      </Text>

      <Text style={styles.label}>Dietary Concerns</Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('dietary')}>
        <Text style={styles.selectValue}>{dietary}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Allergies</Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('allergy')}>
        <Text style={styles.selectValue}>{allergy}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

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
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('difficulty')}>
        <Text style={styles.selectValue}>{difficulty}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Time Consideration</Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('time')}>
        <Text style={styles.selectValue}>{timeDisplay}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.continueButton, loading && styles.buttonDisabled]} onPress={handleContinue} disabled={loading}>
        <Text style={styles.continueButtonText}>{loading ? 'Crafting pairings…' : 'Get Pairings'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.modalTitle}>{activeDropdown.title}</Text>
                <ScrollView style={{ maxHeight: 360 }}>
                  {activeDropdown.options.map((opt) => {
                    const active = activeDropdown.selected === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, active && styles.modalOptionActive]}
                        onPress={() => {
                          activeDropdown.onSelect(opt.value);
                          setOpenDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                          {opt.sub ? <Text style={[styles.modalOptionSub, active && styles.modalOptionSubActive]}>{opt.sub}</Text> : null}
                        </View>
                        {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  heading: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xs },
  subheading: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  label: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top', marginBottom: spacing.lg },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, backgroundColor: colors.surface, marginBottom: spacing.lg },
  selectValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text, flex: 1 },
  selectArrow: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
  continueButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  back: { alignItems: 'center', paddingVertical: spacing.lg },
  backText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionSub: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginTop: 2 },
  modalOptionSubActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
});
