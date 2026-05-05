import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, useWindowDimensions, Modal } from 'react-native';
import { TabFooter } from '../../src/components/TabFooter';
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
  const { preferences: savedPreferences } = usePreferences();

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

  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [signInPromptShown, setSignInPromptShown] = useState(false);

  useEffect(() => {
    if (savedPreferences && !prefsLoaded) {
      setBudget(savedPreferences.defaultBudget ?? null);
      setPrefsLoaded(true);
    }
  }, [savedPreferences]);

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

  function maybeShowSignInPrompt(): boolean {
    if (!session && !signInPromptShown) {
      setSignInPromptShown(true);
      setSignInPromptVisible(true);
      return true;
    }
    return false;
  }

  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
  }

  async function handleViewLastSearch() {
    try {
      const raw = await AsyncStorage.getItem('vinster_scan_history');
      if (!raw) return;
      const items = JSON.parse(raw);
      if (!items.length) return;
      const last = items[0];
      setExtractedWines(last.extractedWines);
      setRecommendation(last.recommendation);
      router.push('/scan/results?fromHistory=true');
    } catch { /* no history available */ }
  }

  function handleScan() {
    if (maybeShowSignInPrompt()) return;
    setPreferences(buildPreferences());
    router.push('/scan/camera');
  }

  async function handleScreenshot() {
    if (isUploading) return;
    if (maybeShowSignInPrompt()) return;
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
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      <View style={styles.header}>
        <Text style={styles.appName}>List</Text>
        <Text style={styles.subtitle}>Set your preferences then scan or upload a wine list to receive tailored wine recommendations.</Text>
        <Text style={styles.profileNote}>Your selections below will override your wine profile preferences while your profile dislikes remain hard rules.</Text>
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
            <BudgetSlider value={budget} onChange={setBudget} />
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
            <Text style={styles.buttonHalfText}>{isUploading ? 'Opening…' : 'Upload Screenshot / Photo'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.archiveRow}>
          <TouchableOpacity style={styles.archiveButton} onPress={() => router.push('/scan/history')}>
            <Text style={styles.archiveButtonText}>View Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.archiveButton} onPress={handleViewLastSearch}>
            <Text style={styles.archiveButtonText}>View Last Search</Text>
          </TouchableOpacity>
        </View>

      </View>
      <TabFooter />

      <Modal
        visible={signInPromptVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissSignInPrompt}
      >
        <TouchableOpacity style={styles.promptOverlay} activeOpacity={1} onPress={dismissSignInPrompt}>
          <TouchableOpacity style={styles.promptSheet} activeOpacity={1} onPress={() => {}}>
            <TouchableOpacity style={styles.promptClose} onPress={dismissSignInPrompt}>
              <Text style={styles.promptCloseText}>✕</Text>
            </TouchableOpacity>

            <Text style={styles.promptHeading}>Get more from Vinster</Text>
            <Text style={styles.promptBody}>
              Sign in to your account for advanced results tailoring and to archive and manage your results.
            </Text>

            <TouchableOpacity
              style={styles.promptSignIn}
              onPress={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
            >
              <Text style={styles.promptSignInText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
            >
              <Text style={styles.promptCreate}>Not registered? Create Account</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
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
    fontSize: 22,
    color: 'rgba(255,255,255,0.50)',
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
    fontSize: 16,
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
    color: 'rgba(255,255,255,0.45)',
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
    color: 'rgba(255,255,255,0.40)',
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
  archiveRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  archiveButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  archiveButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.gold,
    fontSize: 14,
    textAlign: 'center',
  },
  profileNote: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 24,
  },
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  promptSheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
  },
  promptClose: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: spacing.sm,
  },
  promptCloseText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  promptHeading: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  promptBody: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  promptSignIn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  promptSignInText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
  promptCreate: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: spacing.sm,
  },
});
