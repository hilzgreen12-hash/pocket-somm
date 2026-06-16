import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../../src/constants/grapeVarieties';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function WineProfileScreen() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = onboarding === '1';
  const { preferences, updatePreferences, isSaving } = usePreferences();
  const [regionalDislikesOpen, setRegionalDislikesOpen] = useState(false);
  const [varietalDislikesOpen, setVarietalDislikesOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSavePreferences() {
    // Every control on this screen commits inline as the user edits, so
    // the Save button is a confirmation moment rather than a real save.
    // Don't flash "SAVED ✓" while a mutation is still in flight —
    // usePreferences.onError surfaces a failure alert if one lands.
    if (isSaving) return;
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  const disRegions = preferences?.dislikedRegions ?? [];
  const disGrapes = preferences?.dislikedGrapes ?? [];

  function summary(values: string[], noneLabel: string) {
    return values.length > 0 ? `${values.length} selected` : noneLabel;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop: isOnboarding ? 70 : 0 }}>
        {!isOnboarding && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
            <Text style={styles.back}>Back</Text>
          </TouchableOpacity>
        )}

        <View style={styles.profileIntro}>
          <Text style={styles.profileHeading}>Wine Preferences</Text>
          <Text style={styles.profileBody}>Tell Vinster which regions and grapes to rule out — these are hard rules it will never recommend. Everything else you can fine-tune per search.</Text>
          <Text style={styles.autosaveHint}>Your changes save as you make them.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setRegionalDislikesOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Regional Dislikes</Text>
              {!regionalDislikesOpen && (
                <Text style={styles.selectionSummary}>{summary(disRegions, 'None')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{regionalDislikesOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {regionalDislikesOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Select up to 5 — Vinster will never recommend these.</Text>
              <ChipPicker
                options={WINE_REGIONS}
                selected={disRegions}
                onChange={(v) => updatePreferences({ dislikedRegions: v })}
                max={5}
                allowCustom
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setVarietalDislikesOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Varietal Dislikes</Text>
              {!varietalDislikesOpen && (
                <Text style={styles.selectionSummary}>{summary(disGrapes, 'None')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{varietalDislikesOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {varietalDislikesOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Select up to 5 — Vinster will never recommend these.</Text>
              <ChipPicker
                options={GRAPE_VARIETIES}
                selected={disGrapes}
                onChange={(v) => updatePreferences({ dislikedGrapes: v })}
                max={5}
                allowCustom
              />
            </View>
          )}
        </View>

        {isOnboarding ? (
          <>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => router.replace('/profile/recipe?onboarding=1')}
            >
              <Text style={styles.saveButtonText}>Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipLink}
              onPress={() => router.replace('/profile/recipe?onboarding=1')}
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
  profileHeading: { fontFamily: fonts.headingSemibold, fontSize: 26, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xs, textAlign: 'center' },
  profileBody: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, lineHeight: 21, textAlign: 'center' },
  autosaveHint: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, opacity: 0.85 },
  section: { marginBottom: spacing.sm },
  // Accordion styling intentionally mirrors app/(tabs)/scan.tsx so the
  // profile preferences screen looks and behaves the same way as the per-
  // search preferences on the List tab.
  accordionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 4 },
  accordionLeft: { flex: 1, alignItems: 'center' },
  chevron: { fontSize: 16, color: '#FFFFFF', marginLeft: spacing.sm },
  question: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  selectionSummary: { fontFamily: fonts.bodyMedium, fontSize: 14, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  pickerWrap: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  pickerHint: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  skipLink: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  skipLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
