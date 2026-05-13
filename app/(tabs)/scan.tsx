import { useState, useEffect, useRef, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, useWindowDimensions } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabFooter } from '../../src/components/TabFooter';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import AsyncStorage from '@react-native-async-storage/async-storage';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { FoodPairingInput } from '../../src/components/preferences/FoodPairingInput';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const { setPreferences, setImage, setImageUris, needsReset, clearNeedsReset, setExtractedWines, setRecommendation } = useScanStore();
  const { preferences: savedPreferences, prefsLoading } = usePreferences();

  const [wineTypes, setWineTypes] = useState<WineType[]>([]);
  const [styleProfiles, setStyleProfiles] = useState<string[]>([]);
  const [budget, setBudget] = useState<number | null>(
    savedPreferences?.defaultBudget ?? null
  );
  const [foodPairing, setFoodPairing] = useState('');
  const [wineTypeOpen, setWineTypeOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [topScoringMode, setTopScoringMode] = useState(false);

  function toggleSection(section: 'wineType' | 'style') {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'wineType') setWineTypeOpen((v) => !v);
    else setStyleOpen((v) => !v);
  }

  const WINE_TYPE_LABELS: Record<string, string> = {
    red: 'Red', white: 'White', rose: 'Rosé', sparkling: 'Sparkling',
  };

  const wineTypeLabel = wineTypes.length > 0
    ? wineTypes.map((t) => WINE_TYPE_LABELS[t]).join(', ')
    : 'Any';

  const styleLabel = styleProfiles.length
    ? styleProfiles.length === 1
      ? styleProfiles[0].replace(/-/g, ' ')
      : `${styleProfiles.length} styles selected`
    : 'Any';

  const [isUploading, setIsUploading] = useState(false);
  const [hasLastSearch, setHasLastSearch] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [signInPromptShown, setSignInPromptShown] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const lastSyncedBudgetRef = useRef<number | null | undefined>(undefined);

  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem('vinster_scan_history').then((raw) => {
      try { setHasLastSearch(!!(raw && JSON.parse(raw).length)); } catch { /* ignore */ }
    });
  }, []));

  // Sync the scan tab's budget to the profile default any time the
  // profile default changes (first load, profile edit, account switch).
  // Tracking the last-synced value avoids clobbering an in-progress
  // local override on every render.
  useEffect(() => {
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

  async function handleViewLastSearch() {
    try {
      const raw = await AsyncStorage.getItem('vinster_scan_history');
      const items = raw ? JSON.parse(raw) : [];
      if (!items.length) {
        showAlert({
          title: 'No previous search',
          body: 'Once you scan a wine list, you can come back here to revisit it.',
        });
        return;
      }
      const last = items[0];
      setExtractedWines(last.extractedWines);
      setRecommendation(last.recommendation);
      const params = new URLSearchParams({ fromHistory: 'true' });
      if (last.savedAt) params.set('date', last.savedAt);
      if (last.restaurantName) params.set('restaurant', last.restaurantName);
      if (last.city) params.set('city', last.city);
      // Pass the scan_sessions id through if the autoSave already
      // promoted this cached scan to the cloud. Lets the results
      // screen target the right row when the user edits the
      // restaurant name on a re-opened result.
      if (last.sessionId) params.set('sessionId', last.sessionId);
      router.push(`/scan/results?${params.toString()}`);
    } catch {
      showAlert({
        title: 'No previous search',
        body: 'Once you scan a wine list, you can come back here to revisit it.',
      });
    }
  }

  function handleScan() {
    const go = () => { setPreferences(buildPreferences()); router.push('/scan/camera'); };
    if (maybeShowSignInPrompt(go)) return;
    go();
  }

  async function handleScreenshot() {
    if (isUploading) return;
    const go = async () => {
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
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <View style={styles.header}>
        <Text style={styles.appName}>List</Text>
        <Text style={styles.subtitle}>Set your preferences below, then scan or update a wine list to generate recommendations. Any pre-set dislikes in your profile remain hard rules which you can edit any time.</Text>
      </View>

      <View style={styles.body}>

        {/* Wine type accordion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('wineType')} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>What are you drinking?</Text>
              {!wineTypeOpen && <Text style={styles.selectionSummary}>{wineTypeLabel}</Text>}
            </View>
            <Text style={styles.chevron}>{wineTypeOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {wineTypeOpen && (
            <View style={styles.pickerWrap}>
              <WineTypePicker selected={wineTypes} onChange={setWineTypes} />
            </View>
          )}
        </View>

        {/* Style accordion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('style')} activeOpacity={0.7} style={styles.accordionRow}>
            <View style={styles.accordionLeft}>
              <Text style={styles.question}>What style are you vibing?</Text>
              {!styleOpen && <Text style={styles.selectionSummary}>{styleLabel}</Text>}
            </View>
            <Text style={styles.chevron}>{styleOpen ? '▴' : '▾'}</Text>
          </TouchableOpacity>
          {styleOpen && (
            <View style={styles.pickerWrap}>
              <StylePicker selected={styleProfiles} onChange={setStyleProfiles} />
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
            <Text style={styles.question}>Budget?</Text>
            {prefsLoading
              ? <View style={{ height: 60 }} />
              : <BudgetSlider value={budget} onChange={setBudget} currency={savedPreferences?.defaultCurrency} />}
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

        <TouchableOpacity style={styles.lastResultButton} onPress={handleViewLastSearch}>
          <Text style={styles.lastResultText}>View Last Result</Text>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={handleScan}>
            <Text style={styles.buttonHalfText}>Scan Wine List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.buttonHalf, isUploading && { opacity: 0.5 }]} onPress={handleScreenshot} disabled={isUploading}>
            <Text style={styles.buttonHalfText}>{isUploading ? 'Opening…' : 'Upload Screenshot / Photo'}</Text>
          </TouchableOpacity>
        </View>

      </View>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />

    </ScrollView>
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  brandName: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 23,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  appName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  goldDivider: {
    height: 1,
    backgroundColor: colors.gold,
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  body: {
    paddingHorizontal: spacing.xl,
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
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: spacing.sm,
  },
  question: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  questionActive: {
    color: colors.gold,
  },
  selectionSummary: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
    textAlign: 'center',
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
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  buttonHalfText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.gold,
    fontSize: 14,
    textAlign: 'center',
  },
  lastResultButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  lastResultText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
  },
  profileNote: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 17,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 24,
  },
});
