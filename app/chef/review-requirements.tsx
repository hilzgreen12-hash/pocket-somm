import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import * as ImagePicker from 'expo-image-picker';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useLabelStore } from '../../src/stores/labelStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useCellar } from '../../src/hooks/useCellar';
import { generatePairings, prepareImageBase64, scanLabel } from '../../src/api/label';
import type { CellarWine } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const DIETARY_OPTIONS = ['None', 'Vegetarian', 'Vegan', 'Pescatarian', 'Other'];
const ALLERGY_OPTIONS = ['None', 'Nut Free', 'Dairy Free', 'Gluten Free', 'Other'];
const DIFFICULTY_OPTIONS = ['Any', 'Super Simple', 'Easy to Moderate', 'Challenging', 'Very Technical'];

const TIME_OPTIONS: { value: string; label: string; sub?: string }[] = [
  { value: 'any',        label: 'Any' },
  { value: 'under_30',   label: 'Time is of the Essence', sub: 'Under 30 minutes' },
  { value: 'under_1h',   label: 'Easy Breezy',            sub: 'Under 1 hour' },
  { value: 'all_day',    label: "I've got all day",        sub: 'Up to 3 hours' },
  { value: 'low_slow',   label: 'Low & Slow',             sub: '3 hours plus' },
];

type DropdownField = 'dietary' | 'allergy' | 'difficulty' | 'time' | 'people' | null;

export default function ReviewRequirementsScreen() {
  useKeepAwake();
  const { from, wineId } = useLocalSearchParams<{ from?: string; wineId?: string }>();
  // Two entry modes:
  //  - from === 'cellar': the bottle is already known (came from a cellar
  //    wine card). We generate pairings immediately ("Get Pairings").
  //  - otherwise (Chef tab "Find Me a Recipe"): no bottle yet. We capture the
  //    requirements here, then scan/upload the label; pairings are generated
  //    after the wine is confirmed.
  const isFromCellar = from === 'cellar';
  // When the user arrived from the cellar wine card, thread the source
  // through to /chef/results so its Back button can route home properly.
  const resultsQuery = isFromCellar && wineId ? `?from=cellar&wineId=${wineId}` : '';
  const { wineDetailsConfirmed, setPairings, setError, setFilters, setImage, setWineDetails, setWineDetailsConfirmed } = useLabelStore();
  const { preferences } = usePreferences();
  const { wines } = useCellar();

  const [dietary, setDietary] = useState<string>('None');
  const [allergy, setAllergy] = useState<string>('None');
  // Free-text entries revealed when "Other" is chosen in either dropdown.
  const [customDietary, setCustomDietary] = useState('');
  const [customAllergy, setCustomAllergy] = useState('');
  const [specificConcerns, setSpecificConcerns] = useState('');
  const [difficulty, setDifficulty] = useState<string>('Any');
  const [timeChoice, setTimeChoice] = useState<string>('any');
  const [people, setPeople] = useState<string>('2');
  const [loading, setLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownField>(null);
  // Holds the picked screenshot while it's being read (Mode B upload).
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);

  const timeBlock = TIME_OPTIONS.find((t) => t.value === timeChoice) ?? TIME_OPTIONS[0];
  const timeDisplay = timeBlock.sub ? `${timeBlock.label} · ${timeBlock.sub}` : timeBlock.label;

  // Combine profile preferences with the per-pairing additions chosen here.
  // Profile values stay the baseline; this screen adds extras for THIS recipe
  // only. "None" / "Any" act as no-op selections.
  function buildFilters() {
    const profileDietary = preferences?.dietaryNeeds ?? [];
    const profileAllergies = preferences?.allergyRisks ?? [];
    const dietaryAdds = dietary === 'Other'
      ? (customDietary.trim() ? [customDietary.trim()] : [])
      : dietary !== 'None' ? [dietary] : [];
    const allergyAdds = allergy === 'Other'
      ? (customAllergy.trim() ? [customAllergy.trim()] : [])
      : allergy !== 'None' ? [allergy] : [];
    const mergedDietary = Array.from(new Set([...profileDietary, ...dietaryAdds]));
    const mergedAllergies = Array.from(new Set([...profileAllergies, ...allergyAdds]));
    const mergedConcerns = [
      preferences?.specificConcerns?.trim() || '',
      specificConcerns.trim(),
    ].filter(Boolean).join('. ');

    const timeLabel = timeChoice !== 'any' && timeBlock.sub
      ? `${timeBlock.label} (${timeBlock.sub})`
      : null;

    return {
      dietary: (mergedDietary[0] ?? null) as any,
      allergens: mergedAllergies as any,
      customAllergen: '',
      dietaryNote: null,
      difficulty: difficulty !== 'Any' ? difficulty : null,
      timeConsideration: timeLabel,
      specificConcerns: mergedConcerns || null,
      regionalPreferences: preferences?.regionalPreferences ?? [],
      nutritionalPreferences: preferences?.nutritionalPreferences ?? [],
      servings: parseInt(people, 10) || null,
    };
  }

  // Mode A (from a cellar wine) — the bottle is already known, so generate now.
  async function handleContinue() {
    if (!wineDetailsConfirmed) {
      showAlert({ title: 'Missing wine details', body: 'Please confirm the wine first.' });
      router.replace('/chef/confirm');
      return;
    }
    setLoading(true);
    try {
      const filters = buildFilters();
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

  // Mode B (from the Chef tab) — stash the requirements, then capture the wine
  // label. Pairings are generated once the wine is confirmed (chef/confirm).
  function handleScan() {
    setFilters(buildFilters() as unknown as Record<string, unknown>);
    router.push('/chef/camera');
  }

  async function handleUpload() {
    setFilters(buildFilters() as unknown as Record<string, unknown>);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    // Show the picked photo + a "Reading the label…" overlay during the
    // base64-prepare + Claude scan call, mirroring the camera flow.
    setUploadingImage(uri);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/chef/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/chef/confirm');
    } finally {
      setUploadingImage(null);
    }
  }

  // Mode B alternative — pick a wine already in the cellar, skip scanning,
  // and generate pairings straight away (reuses the Mode A generate path).
  async function handleSelectCellarWine(cw: CellarWine) {
    setCellarPickerOpen(false);
    setLoading(true);
    try {
      const filters = buildFilters();
      const wineDetails = {
        producer: cw.producer ?? '',
        region: cw.region ?? '',
        wineName: cw.wine_name || null,
        vintage: cw.vintage != null ? String(cw.vintage) : 'NV',
        style: null,
      };
      const pairings = await generatePairings(wineDetails as any, filters);
      setWineDetailsConfirmed(wineDetails);
      setPairings(pairings);
      setFilters(filters as unknown as Record<string, unknown>);
      router.replace('/chef/results');
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
        body="Vinster is selecting three chef-inspired dishes to complement your wine"
        durationMs={65000}
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
    if (field === 'people') {
      return {
        title: 'How many people are you cooking for?',
        options: Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
        selected: people,
        onSelect: setPeople,
      };
    }
    return null;
  }

  const activeDropdown = dropdownConfig(openDropdown);

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} bottomOffset={24}>
      {/* Standard header bar (matches Find a Wine Pairing): Back / 20pt
          centred title / spacer, with the blurb beneath at 16pt italic. */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backTopText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe Requirements</Text>
        <View style={{ width: 44 }} />
      </View>
      <Text style={styles.subheading}>
        Vinster will use your profile preferences to guide its recipe recommendations. Input any dietary restrictions or allergies to consider for this particular recipe below.
      </Text>

      <Text style={styles.label}>Dietary Concerns <Text style={styles.labelHint}>(additional to your settings)</Text></Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('dietary')}>
        <Text style={styles.selectValue}>{dietary}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>
      {dietary === 'Other' ? (
        <TextInput
          style={styles.customInput}
          value={customDietary}
          onChangeText={setCustomDietary}
          placeholder="Type your dietary need"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="sentences"
        />
      ) : null}

      <Text style={styles.label}>Allergies <Text style={styles.labelHint}>(additional to your settings)</Text></Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('allergy')}>
        <Text style={styles.selectValue}>{allergy}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>
      {allergy === 'Other' ? (
        <TextInput
          style={styles.customInput}
          value={customAllergy}
          onChangeText={setCustomAllergy}
          placeholder="Type your allergy"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="sentences"
        />
      ) : null}

      <Text style={styles.label}>Specific Requirements</Text>
      <TextInput
        style={styles.input}
        value={specificConcerns}
        onChangeText={setSpecificConcerns}
        placeholder="e.g. High Protein, Low Calorie, Spring Vibes, No Anchovies"
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

      <Text style={styles.label}>How many people are you cooking for?</Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpenDropdown('people')}>
        <Text style={styles.selectValue}>{people}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      {isFromCellar ? (
        <TouchableOpacity style={[styles.continueButton, loading && styles.buttonDisabled]} onPress={handleContinue} disabled={loading}>
          <Text style={styles.continueButtonText}>{loading ? 'Crafting pairings…' : 'Get Pairings'}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.scanRow}>
            <TouchableOpacity style={[styles.continueButton, styles.halfButton]} onPress={handleScan}>
              <Text style={styles.continueButtonText}>Scan a Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.continueButton, styles.halfButton]} onPress={handleUpload}>
              <Text style={styles.continueButtonText}>Upload Wine Label</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.continueButton, { marginTop: spacing.sm }]} onPress={() => setCellarPickerOpen(true)}>
            <Text style={styles.continueButtonText}>Select From Your Cellar</Text>
          </TouchableOpacity>
        </>
      )}

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

      {/* Upload-in-progress overlay (Mode B) — shows the picked screenshot
          with a spinner while it's being read. */}
      <Modal visible={!!uploadingImage} transparent animationType="fade">
        <View style={styles.uploadOverlay}>
          {uploadingImage ? (
            <Image source={{ uri: uploadingImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : null}
          <View style={styles.uploadScrim} />
          <View style={styles.uploadStatus}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.uploadStatusText}>Reading the label…</Text>
          </View>
        </View>
      </Modal>

      {/* Select a wine from the cellar — picks a known bottle and generates
          pairings straight away, no scanning. */}
      <Modal visible={cellarPickerOpen} transparent animationType="fade" onRequestClose={() => setCellarPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCellarPickerOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select a wine from your cellar</Text>
            {wines.length === 0 ? (
              <Text style={styles.pickerEmpty}>Your cellar is empty — add wines to your cellar first, or scan/upload a label above.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {wines.map((cw) => (
                  <TouchableOpacity key={cw.id} style={styles.pickerRow} onPress={() => handleSelectCellarWine(cw)} activeOpacity={0.7}>
                    <Text style={styles.pickerWine} numberOfLines={2}>{[cw.producer, cw.wine_name, cw.vintage].filter(Boolean).join(' · ')}</Text>
                    {cw.region ? <Text style={styles.pickerRegion} numberOfLines={1}>{cw.region}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setCellarPickerOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 80, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  heading: { fontSize: 32, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.xs },
  subheading: { fontSize: 16, fontFamily: fonts.headingItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  label: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Lower-case parenthetical beside the Dietary/Allergies labels.
  labelHint: { textTransform: 'none', fontFamily: fonts.bodyItalic, fontSize: 11, letterSpacing: 0, color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 72, textAlignVertical: 'top', marginBottom: spacing.lg },
  // Free-text box shown when "Other" is picked in the Dietary/Allergies dropdowns.
  customInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginTop: -spacing.sm, marginBottom: spacing.lg },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.lg },
  selectValue: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, flex: 1 },
  selectArrow: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
  continueButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.sm, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  continueButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15 },
  back: { alignItems: 'center', paddingVertical: spacing.lg },
  backText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
  // Top-left Back, matching the rest of the app.
  backTop: { alignSelf: 'flex-start', marginBottom: spacing.md },
  backTopText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 16 },
  scanRow: { flexDirection: 'row', gap: spacing.sm },
  halfButton: { flex: 1 },
  pickerEmpty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 21, paddingVertical: spacing.md },
  pickerRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerWine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickerRegion: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionSub: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, marginTop: 2 },
  modalOptionSubActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  uploadOverlay: { flex: 1, backgroundColor: '#000' },
  uploadScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  uploadStatus: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  uploadStatusText: { fontFamily: fonts.bodySemibold, fontSize: 18, color: '#FFFFFF', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, textAlign: 'center' },
});
