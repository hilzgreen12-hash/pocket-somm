import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { HelpButton } from '../../src/components/HelpButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { FoodPairingInput } from '../../src/components/preferences/FoodPairingInput';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const LIST_HELP = `Point your camera at any wine list — or upload a screenshot — and Vinster reads every bottle on the page.

It weighs each one against your preferences — wine type, style, what you're eating, your budget — and against its own criteria of critic score, value compared to market, vintage quality, and readiness for drinking, before handing you its top three.

Record and/or review the bottle you ordered, as well as the restaurant you enjoyed it in, which all quietly helps Vinster know you better. Share results with friends and the community.`;

export default function WineListScreen() {
  const { session } = useAuth();
  const { setPreferences, setImage, setImageUris, needsReset, clearNeedsReset } = useScanStore();
  const { preferences: savedPreferences, prefsLoading } = usePreferences();

  // Restore the inputs from the last search when it FAILED, so a retry doesn't
  // force the user to re-enter everything (they're saved to the store on scan).
  // A successful result's Back calls reset() — clearing preferences + flagging
  // needsReset — so after success there's nothing to restore and the form
  // resets instead (handled by the needsReset effect below).
  const restored = useRef(useScanStore.getState().preferences).current;
  const isRestoring = useRef(
    !useScanStore.getState().needsReset && (
      restored.wineTypes.length > 0 || restored.styleProfiles.length > 0 ||
      !!restored.foodPairing || restored.budget != null || restored.topScoringMode
    )
  ).current;

  const [wineTypes, setWineTypes] = useState<WineType[]>(isRestoring ? (restored.wineTypes as WineType[]) : []);
  const [styleProfiles, setStyleProfiles] = useState<string[]>(isRestoring ? restored.styleProfiles : []);
  const [budget, setBudget] = useState<number | null>(isRestoring ? restored.budget : (savedPreferences?.defaultBudget ?? null));
  const [foodPairing, setFoodPairing] = useState(isRestoring ? restored.foodPairing : '');
  const [wineTypeOpen, setWineTypeOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [topScoringMode, setTopScoringMode] = useState(isRestoring ? restored.topScoringMode : false);

  function toggleSection(section: 'wineType' | 'style') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'wineType') setWineTypeOpen((v) => !v);
    else setStyleOpen((v) => !v);
  }

  const WINE_TYPE_LABELS: Record<string, string> = {
    red: 'Red', white: 'White', rose: 'Rosé', sparkling: 'Sparkling',
    natural: 'Natural / Low Intervention', 'sweet-fortified': 'Sweet & Fortified',
  };

  const wineTypeLabel = wineTypes.length > 0
    ? wineTypes.map((t) => WINE_TYPE_LABELS[t]).join(', ')
    : 'Any';

  const styleLabel = styleProfiles.length
    ? styleProfiles.length === 1
      ? styleProfiles[0].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : `${styleProfiles.length} styles selected`
    : 'Any';

  const [isUploading, setIsUploading] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [signInPromptShown, setSignInPromptShown] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const lastSyncedBudgetRef = useRef<number | null | undefined>(undefined);

  useFocusEffect(useCallback(() => {
    // Show the welcome popup every time the page gains focus, until the
    // user explicitly opts out via "Don't show this again". A simple
    // dismiss closes for the visit only — the popup reappears on the
    // next focus.
    AsyncStorage.getItem('vinster_list_intro_dismissed').then((value) => {
      if (value !== 'true') setIntroVisible(true);
    }).catch(() => { /* AsyncStorage unavailable — skip the intro */ });
  }, []));

  function dismissIntro() {
    setIntroVisible(false);
  }

  async function dontShowIntroAgain() {
    try {
      await AsyncStorage.setItem('vinster_list_intro_dismissed', 'true');
    } catch { /* AsyncStorage unavailable — fall back to in-session dismiss */ }
    setIntroVisible(false);
  }

  // Sync the budget to the profile default any time the profile default
  // changes (first load, profile edit, account switch). Tracking the
  // last-synced value avoids clobbering an in-progress local override.
  useEffect(() => {
    // Don't clobber a restored failed-search budget with the profile default.
    if (isRestoring) return;
    const profileBudget = savedPreferences?.defaultBudget ?? null;
    if (profileBudget !== lastSyncedBudgetRef.current) {
      setBudget(profileBudget);
      lastSyncedBudgetRef.current = profileBudget;
    }
  }, [savedPreferences?.defaultBudget]);

  useEffect(() => {
    if (needsReset) {
      setWineTypes([]);
      setStyleProfiles([]);
      setBudget(savedPreferences?.defaultBudget ?? null);
      setFoodPairing('');
      setTopScoringMode(false);
      clearNeedsReset();
    }
  }, [needsReset]);

  function buildPreferences() {
    return {
      wineTypes,
      styleProfiles,
      budget,
      foodPairing,
      favouriteRegions: savedPreferences?.favouriteRegions ?? [],
      favouriteGrapes: savedPreferences?.favouriteGrapes ?? [],
      dislikedRegions: savedPreferences?.dislikedRegions ?? [],
      dislikedGrapes: savedPreferences?.dislikedGrapes ?? [],
      topScoringMode,
      profileWineTypes: savedPreferences?.wineTypes ?? [],
      profileStyleProfiles: savedPreferences?.styleProfiles ?? [],
    };
  }

  function maybeShowSignInPrompt(proceed: () => void): boolean {
    if (!session && !signInPromptShown) {
      setSignInPromptShown(true);
      pendingActionRef.current = proceed;
      setSignInPromptVisible(true);
      return true;
    }
    return false;
  }

  // Dismissing the prompt (tap X or outside) is treated as "ignore the
  // message and carry on" — the action the user originally tapped still
  // runs. Sign In / Create Account are the only paths that interrupt.
  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  function continueWithoutAccount() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  function handleScan() {
    const go = () => { setPreferences(buildPreferences()); router.push('/scan/camera'); };
    if (maybeShowSignInPrompt(go)) return;
    go();
  }

  async function handleScreenshot() {
    if (isUploading) return;
    const go = async () => {
      if (!(await ensureMediaPermission('library'))) return;
      setIsUploading(true);
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: true,
          quality: 1,
        });
        if (!result.canceled && result.assets.length > 0) {
          setPreferences(buildPreferences());
          if (result.assets.length === 1) {
            setImage(result.assets[0].uri);
            router.push('/scan/preview');
          } else {
            setImageUris(result.assets.map((a) => a.uri));
            router.push('/scan/extracting');
          }
        }
      } catch (err) {
        console.error('[Scan] Image picker failed:', err);
        showAlert({ title: 'Upload failed', body: 'Could not open the photo library. Please try again.' });
      } finally {
        setIsUploading(false);
      }
    };
    if (maybeShowSignInPrompt(go)) return;
    await go();
  }

  return (
    <View style={styles.container}>
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20, paddingTop: 56 }}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.appName}>Scan</Text>
        </View>
        <Text style={styles.subtitle}>Input a wine list alongside your preferences to generate three recommendations.</Text>
        <HelpButton label="More About Scan" title="How Scan works" body={LIST_HELP} />
      </View>

      <View style={styles.body}>

        {/* Wine type accordion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('wineType')} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>What wine style would you like?</Text>
              {!wineTypeOpen && <Text style={[styles.selectionSummary, styles.selectionSummaryActive]}>{wineTypeLabel}</Text>}
            </View>
            <Text style={styles.chevron}>{wineTypeOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {wineTypeOpen && (
            <View style={styles.pickerWrap}>
              <WineTypePicker selected={wineTypes} onChange={(types) => { setWineTypes(types); setStyleProfiles([]); }} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('style')} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>Let's refine that further</Text>
              {!styleOpen && <Text style={[styles.selectionSummary, styles.selectionSummaryActive]}>{styleLabel}</Text>}
            </View>
            <Text style={styles.chevron}>{styleOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {styleOpen && (
            <View style={styles.pickerWrap}>
              <StylePicker selected={styleProfiles} onChange={setStyleProfiles} wineTypes={wineTypes} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.bubbleWrap}>
            <Text style={styles.question}>What are you dining on? (optional)</Text>
            <FoodPairingInput value={foodPairing} onChange={setFoodPairing} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.bubbleWrap}>
            {prefsLoading
              ? <View style={{ height: 60 }} />
              : <BudgetSlider value={budget} onChange={setBudget} currency={savedPreferences?.defaultCurrency} label="Budget?" />}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.accordionRow, topScoringMode && styles.accordionRowActive]}
          onPress={() => setTopScoringMode((v) => !v)}
          activeOpacity={0.7}
        >
          <View style={styles.accordionLeft}>
            <Text style={[styles.question, topScoringMode && styles.questionActive]}>Top Scoring Wines</Text>
            <Text style={styles.selectionSummary}>Ignore all preferences — show the 3 highest-rated wines on the list</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={handleScan}>
            <Text style={styles.buttonHalfText}>Scan Wine List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonHalf, isUploading && { opacity: 0.5 }]} onPress={handleScreenshot} disabled={isUploading}>
            <Text style={styles.buttonHalfText}>{isUploading ? 'Opening…' : 'Upload Wine List'}</Text>
          </TouchableOpacity>
        </View>

      </View>

      <Modal
        visible={introVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissIntro}
      >
        <TouchableOpacity style={styles.introOverlay} activeOpacity={1} onPress={dismissIntro}>
          <TouchableOpacity activeOpacity={1} style={styles.introSheet} onPress={() => {}}>
            <Text style={styles.introTitle}>Welcome to Scan</Text>
            <Text style={styles.introBody}>
              Scan a wine list or upload screenshots. Vinster works best with <Text style={styles.introBodyEmph}>around 80 wines or fewer per session</Text> — bigger lists may not process at all, so focus your photos on the section you care about (reds, by the glass, under £100…) and keep them clear and well-lit.
            </Text>

            <TouchableOpacity style={styles.introPrimaryBtn} onPress={dismissIntro} activeOpacity={0.8}>
              <Text style={styles.introPrimaryBtnText}>Got it</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.introDismissBtn} onPress={dontShowIntroAgain} activeOpacity={0.7}>
              <Text style={styles.introDismissText}>Don't show this again</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />

    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Back arrow — this screen is pushed from the Scan hub, so it needs its own
  // return control (the tab version had none). The header/blurb below are the
  // original List-page header, kept unchanged.
  topBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xs,
  },
  backArrow: {
    fontSize: 22,
    fontFamily: fonts.bodyRegular,
    color: colors.gold,
    width: 40,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  // The big "Scan" title — header.
  appName: {
    fontFamily: fonts.headingSemibold,
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  // Italic blurb directly under the title — kept Cormorant per spec.
  subtitle: {
    fontFamily: fonts.headingRegular,
    fontSize: 19,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 26,
  },
  body: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.sm,
  },
  accordionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: 4,
  },
  accordionRowActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212,176,96,0.08)',
  },
  accordionLeft: {
    flex: 1,
    alignItems: 'center',
  },
  chevron: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  question: {
    fontFamily: fonts.headingSemibold,
    fontSize: 17,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  questionActive: {
    color: colors.gold,
  },
  selectionSummary: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
  },
  selectionSummaryActive: {
    color: colors.gold,
  },
  bubbleWrap: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  pickerWrap: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  buttonHalfText: {
    fontFamily: fonts.headingSemibold,
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  introOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  introSheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.gold,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    width: '100%',
    maxWidth: 420,
  },
  introTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 26,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  introBody: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 23,
    marginBottom: spacing.sm,
  },
  introBodyEmph: {
    fontFamily: fonts.bodyBold,
    fontStyle: 'normal',
    color: colors.gold,
  },
  introPrimaryBtn: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  introPrimaryBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  introDismissBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginTop: 4,
  },
  introDismissText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
