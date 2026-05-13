import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { colors, spacing } from '../../src/constants/theme';

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian'];
const ALLERGY_OPTIONS = ['Nut Free', 'Dairy Free', 'Gluten Free'];

const REGIONAL_CUISINES = [
  'Italian', 'French', 'Spanish', 'Greek', 'Mediterranean',
  'Mexican', 'Tex-Mex', 'Cajun & Creole', 'American Comfort', 'Caribbean',
  'Brazilian', 'Argentinian', 'Chinese', 'Japanese', 'Korean',
  'Thai', 'Vietnamese', 'Indian', 'Middle Eastern', 'Moroccan',
];

const NUTRITIONAL_OPTIONS = ['Low Calorie', 'High Protein', 'Low Salt', 'High Fibre'];

export default function RecipeProfileScreen() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = onboarding === '1';
  const { preferences, updatePreferences, isSaving } = usePreferences();
  const [concernsDraft, setConcernsDraft] = useState(preferences?.specificConcerns ?? '');
  const [dietaryOpen, setDietaryOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [cuisineOpen, setCuisineOpen] = useState(false);
  const [nutritionalOpen, setNutritionalOpen] = useState(false);
  const [concernsOpen, setConcernsOpen] = useState(false);
  const [concernsSaved, setConcernsSaved] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSavePreferences() {
    // All chip pickers commit inline; commit any pending concerns draft
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
  const cuisine = preferences?.regionalPreferences ?? [];
  const nutritional = preferences?.nutritionalPreferences ?? [];

  function summary(values: string[], noneLabel: string) {
    if (values.length === 0) return noneLabel;
    if (values.length <= 3) return values.join(', ');
    return `${values.length} selected`;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileIntro}>
          <Text style={styles.profileHeading}>Recipe Preferences</Text>
          <Text style={styles.profileBody}>Set your recipe preferences so Vinster can generate the best recipe and food pairing recommendations for you — over time your food choices will inform our guidance.</Text>
          <Text style={styles.autosaveHint}>Your changes save as you make them.</Text>
        </View>

        {/* Hard rules first */}

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setDietaryOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Dietary Needs</Text>
              {!dietaryOpen && (
                <Text style={styles.selectionSummary}>{summary(dietary, 'None')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{dietaryOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {dietaryOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={DIETARY_OPTIONS}
                selected={dietary}
                onChange={(v) => updatePreferences({ dietaryNeeds: v })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setAllergyOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Allergy Risk</Text>
              {!allergyOpen && (
                <Text style={styles.selectionSummary}>{summary(allergy, 'None')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{allergyOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {allergyOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={ALLERGY_OPTIONS}
                selected={allergy}
                onChange={(v) => updatePreferences({ allergyRisks: v })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setConcernsOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Specific Concerns</Text>
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
                placeholder="Type any specific concerns…"
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

        <View style={styles.softDivider}>
          <Text style={styles.softHeading}>Soft Preferences</Text>
          <Text style={styles.softSubheading}>Vinster will lean toward these but not enforce them strictly.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setCuisineOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Regional Preferences</Text>
              {!cuisineOpen && (
                <Text style={styles.selectionSummary}>{summary(cuisine, 'I like them all')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{cuisineOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {cuisineOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Pick up to 5 cuisines you enjoy.</Text>
              <ChipPicker
                options={REGIONAL_CUISINES}
                selected={cuisine}
                onChange={(v) => updatePreferences({ regionalPreferences: v })}
                max={5}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setNutritionalOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Nutritional Preferences</Text>
              {!nutritionalOpen && (
                <Text style={styles.selectionSummary}>{summary(nutritional, 'No preference')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{nutritionalOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {nutritionalOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={NUTRITIONAL_OPTIONS}
                selected={nutritional}
                onChange={(v) => updatePreferences({ nutritionalPreferences: v })}
              />
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
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  profileIntro: { marginBottom: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  profileHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 32, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xs, textAlign: 'center' },
  profileBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  autosaveHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, opacity: 0.85 },
  section: { marginBottom: spacing.sm },
  // Matches app/(tabs)/scan.tsx and app/profile/wine.tsx for cross-screen
  // preference UI consistency.
  accordionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 4 },
  accordionLeft: { flex: 1, alignItems: 'center' },
  chevron: { fontSize: 14, color: '#FFFFFF', marginLeft: spacing.sm },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  selectionSummary: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  pickerWrap: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  pickerHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  skipLink: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  skipLinkText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  concernsInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top' },
  concernsSaveBtn: { alignSelf: 'flex-end', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  concernsSaveBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold, letterSpacing: 0.3 },
  softDivider: { paddingVertical: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  softHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase' },
  softSubheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});
