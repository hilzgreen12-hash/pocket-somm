import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router, useLocalSearchParams } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../../src/constants/grapeVarieties';
import { STYLE_PROFILES } from '../../src/constants/styleProfiles';
import { colors, spacing } from '../../src/constants/theme';

const WINE_TYPE_LABELS: Record<string, string> = {
  red: 'Red', white: 'White', rose: 'Rosé', sparkling: 'Sparkling',
};

export default function WineProfileScreen() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const isOnboarding = onboarding === '1';
  const { preferences, updatePreferences } = usePreferences();
  const [colourOpen, setColourOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [regionalDislikesOpen, setRegionalDislikesOpen] = useState(false);
  const [varietalDislikesOpen, setVarietalDislikesOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function handleSavePreferences() {
    // Every control on this screen already commits inline as the user
    // edits — and a real failure surfaces via usePreferences.onError.
    // The Save Preferences button gives users an explicit "I'm done"
    // moment with a clear confirmation flash.
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  const wineTypes = (preferences?.wineTypes ?? []) as WineType[];
  const wineTypeSummary = wineTypes.length > 0
    ? wineTypes.map((t) => WINE_TYPE_LABELS[t]).join(', ')
    : 'I like them all';

  const styleProfiles = preferences?.styleProfiles ?? [];
  const styleSummary = styleProfiles.length > 0
    ? styleProfiles.map((id) => STYLE_PROFILES.find((s) => s.id === id)?.label ?? id).join(', ')
    : 'I like them all';

  const favRegions = preferences?.favouriteRegions ?? [];
  const favGrapes = preferences?.favouriteGrapes ?? [];
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
          <Text style={styles.profileBody}>Set your wine preferences so Vinster can generate the best recommendations for you — over time your wine choices will inform our guidance, making our suggestions even more tailored.</Text>
          <Text style={styles.autosaveHint}>Your changes save as you make them.</Text>
        </View>

        {/* Hard rules first — what Vinster will never recommend */}

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
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.bubbleWrap}>
            <Text style={styles.question}>Default Budget</Text>
            <BudgetSlider
              value={preferences?.defaultBudget ?? null}
              onChange={(budget) => updatePreferences({ defaultBudget: budget })}
              currency={preferences?.defaultCurrency}
            />
          </View>
        </View>

        <View style={styles.softDivider}>
          <Text style={styles.softHeading}>Soft Preferences</Text>
          <Text style={styles.softSubheading}>Vinster will lean toward these but not enforce them strictly. You can override these per-search.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setColourOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Colour Preference</Text>
              {!colourOpen && (
                <Text style={styles.selectionSummary}>{wineTypeSummary}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{colourOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {colourOpen && (
            <View style={styles.pickerWrap}>
              <WineTypePicker
                selected={wineTypes}
                onChange={(v) => updatePreferences({ wineTypes: v })}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setRegionalOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Regional Preference</Text>
              {!regionalOpen && (
                <Text style={styles.selectionSummary}>{summary(favRegions, 'I like them all')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{regionalOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {regionalOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Select up to 5.</Text>
              <ChipPicker
                options={WINE_REGIONS}
                selected={favRegions}
                onChange={(v) => updatePreferences({ favouriteRegions: v })}
                max={5}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setVarietalOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Varietal Preferences</Text>
              {!varietalOpen && (
                <Text style={styles.selectionSummary}>{summary(favGrapes, 'I like them all')}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{varietalOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {varietalOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.pickerHint}>Select up to 5.</Text>
              <ChipPicker
                options={GRAPE_VARIETIES}
                selected={favGrapes}
                onChange={(v) => updatePreferences({ favouriteGrapes: v })}
                max={5}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setStyleOpen)} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Style Preference</Text>
              {!styleOpen && (
                <Text style={styles.selectionSummary}>{styleSummary}</Text>
              )}
            </View>
            <Text style={styles.chevron}>{styleOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {styleOpen && (
            <View style={styles.pickerWrap}>
              <StylePicker
                selected={styleProfiles}
                onChange={(profiles) => updatePreferences({ styleProfiles: profiles })}
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
            <Text style={styles.saveButtonText}>{savedFlash ? 'SAVED ✓' : 'SAVE PREFERENCES'}</Text>
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
  profileBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, lineHeight: 22, textAlign: 'center' },
  autosaveHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: spacing.sm, opacity: 0.85 },
  section: { marginBottom: spacing.sm },
  // Accordion styling intentionally mirrors app/(tabs)/scan.tsx so the
  // profile preferences screen looks and behaves the same way as the per-
  // search preferences on the List tab.
  accordionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 4 },
  accordionLeft: { flex: 1, alignItems: 'center' },
  chevron: { fontSize: 14, color: '#FFFFFF', marginLeft: spacing.sm },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  selectionSummary: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  pickerWrap: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  pickerHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  bubbleWrap: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, alignItems: 'center' },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  skipLink: { alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.lg },
  skipLinkText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  softDivider: { paddingVertical: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  softHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase' },
  softSubheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});
