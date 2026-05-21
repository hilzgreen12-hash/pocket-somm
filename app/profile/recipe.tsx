import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Split lists kept separate so each selection is routed to its own
// profile column (dietary_needs / allergy_risks) — the UI shows them as
// a single combined picker, but downstream consumers still read the two
// fields independently.
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian'];
const ALLERGEN_OPTIONS = ['Nut Free', 'Dairy Free', 'Gluten Free'];
const DIETARY_AND_ALLERGEN_OPTIONS = [...DIETARY_OPTIONS, ...ALLERGEN_OPTIONS];

export default function RecipeProfileScreen() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = onboarding === '1';
  const { preferences, updatePreferences, isSaving } = usePreferences();
  const [concernsDraft, setConcernsDraft] = useState(preferences?.specificConcerns ?? '');
  const [dietaryOpen, setDietaryOpen] = useState(false);
  const [concernsOpen, setConcernsOpen] = useState(false);
  const [concernsSaved, setConcernsSaved] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSavePreferences() {
    // The chip picker commits inline; commit any pending concerns draft
    // before flashing the confirmation so the bottom Save button covers
    // everything the user might have changed. Skip the flash if a save
    // is still in flight — usePreferences.onError alerts on real failures.
    commitConcernsIfChanged();
    if (isSaving) return;
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  // Refs so the unmount cleanup can diff the latest draft against the
  // last-saved value. TextInput's onBlur doesn't fire reliably on Android
  // when the screen unmounts while the input still has focus.
  const draftRef = useRef(concernsDraft);
  const savedRef = useRef(preferences?.specificConcerns ?? '');

  useEffect(() => {
    setConcernsDraft(preferences?.specificConcerns ?? '');
    savedRef.current = preferences?.specificConcerns ?? '';
  }, [preferences?.specificConcerns]);

  useEffect(() => {
    draftRef.current = concernsDraft;
  }, [concernsDraft]);

  useEffect(() => {
    return () => {
      const trimmed = draftRef.current.trim();
      if (trimmed !== savedRef.current) {
        updatePreferences({ specificConcerns: trimmed });
      }
    };
  }, [updatePreferences]);

  function commitConcernsIfChanged() {
    const trimmed = concernsDraft.trim();
    if (trimmed !== (preferences?.specificConcerns ?? '')) {
      updatePreferences({ specificConcerns: trimmed });
    }
  }

  function handleSaveConcerns() {
    commitConcernsIfChanged();
    setConcernsSaved(true);
    setTimeout(() => setConcernsSaved(false), 2000);
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  const dietary = preferences?.dietaryNeeds ?? [];
  const allergy = preferences?.allergyRisks ?? [];
  const dietaryAndAllergens = [...dietary, ...allergy];

  function summary(values: string[], noneLabel: string) {
    if (values.length === 0) return noneLabel;
    if (values.length <= 3) return values.join(', ');
    return `${values.length} selected`;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileIntro}>
          <Text style={styles.profileHeading}>Recipe Requirements</Text>
          <Text style={styles.profileBody}>Tell Vinster about any dietary needs, allergens or specific requirements — these are hard rules it will always respect when generating recipes and pairings.</Text>
          <Text style={styles.autosaveHint}>Your changes save as you make them.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setDietaryOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Dietary Needs & Allergens</Text>
              {!dietaryOpen && (
                <Text style={styles.selectionSummary}>{summary(dietaryAndAllergens, 'None')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{dietaryOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {dietaryOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Vinster will never include these in a recipe or pairing.</Text>
              <ChipPicker
                options={DIETARY_AND_ALLERGEN_OPTIONS}
                selected={dietaryAndAllergens}
                onChange={(v) => updatePreferences({
                  dietaryNeeds: v.filter((x) => DIETARY_OPTIONS.includes(x)),
                  allergyRisks: v.filter((x) => ALLERGEN_OPTIONS.includes(x)),
                })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setConcernsOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Specific Requirements</Text>
              {!concernsOpen && (
                <Text style={styles.selectionSummary} numberOfLines={2}>
                  {(preferences?.specificConcerns ?? '').trim() || 'None'}
                </Text>
              )}
            </View>
            <Text style={styles.chevron}>{concernsOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {concernsOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Anything else Vinster must avoid (e.g. raw fish, very spicy food, soft food only). Treated as a hard rule.</Text>
              <TextInput
                style={styles.concernsInput}
                value={concernsDraft}
                onChangeText={setConcernsDraft}
                onBlur={commitConcernsIfChanged}
                placeholder="Type any specific requirements…"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.concernsSaveBtn}
                onPress={handleSaveConcerns}
                activeOpacity={0.7}
              >
                <Text style={styles.concernsSaveBtnText}>{concernsSaved ? 'Saved ✓' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {isOnboarding ? (
          <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => { commitConcernsIfChanged(); router.replace('/(tabs)/scan'); }}
            >
              <Text style={styles.saveButtonText}>Finish</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipLink}
              onPress={() => router.replace('/(tabs)/scan')}
            >
              <Text style={styles.skipLinkText}>Not now</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.saveButton} onPress={handleSavePreferences} activeOpacity={0.7}>
            <Text style={styles.saveButtonText}>{isSaving ? 'SAVING…' : savedFlash ? 'SAVED ✓' : 'SAVE PREFERENCES'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  backRow: { paddingTop: 70, paddingBottom: spacing.md },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  profileIntro: { marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  profileHeading: { fontFamily: fonts.headingSemibold, fontSize: 32, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xs, textAlign: 'center' },
  profileBody: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  autosaveHint: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, opacity: 0.85 },
  section: { marginBottom: spacing.sm },
  // Matches app/(tabs)/scan.tsx and app/profile/wine.tsx for cross-screen
  // preference UI consistency.
  accordionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 4 },
  accordionLeft: { flex: 1, alignItems: 'center' },
  chevron: { fontSize: 16, color: '#FFFFFF', marginLeft: spacing.sm },
  question: { fontFamily: fonts.bodySemibold, fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
  selectionSummary: { fontFamily: fonts.bodyMedium, fontSize: 16, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  pickerWrap: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  pickerHint: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  skipLink: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  skipLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  concernsInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top' },
  concernsSaveBtn: { alignSelf: 'flex-end', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  concernsSaveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.3 },
});
