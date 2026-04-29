import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager, useWindowDimensions, Switch } from 'react-native';
import { TabFooter } from '../../src/components/TabFooter';

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
  const { setPreferences, setImage, setImageUris, needsReset, clearNeedsReset } = useScanStore();
  const { preferences: savedPreferences } = usePreferences();

  const [wineTypes, setWineTypes] = useState<WineType[]>(
    savedPreferences?.wineTypes ?? []
  );
  const [styleProfiles, setStyleProfiles] = useState<string[]>(
    savedPreferences?.styleProfiles ?? ['crisp-white']
  );
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

  // Sync defaults from profile once loaded (React Query is async)
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  useEffect(() => {
    if (savedPreferences && !prefsLoaded) {
      setWineTypes(savedPreferences.wineTypes ?? []);
      setStyleProfiles(savedPreferences.styleProfiles ?? ['crisp-white']);
      setBudget(savedPreferences.defaultBudget ?? null);
      setPrefsLoaded(true);
    }
  }, [savedPreferences]);

  // Re-sync to profile defaults when user starts a new search
  useEffect(() => {
    if (needsReset) {
      setWineTypes(savedPreferences?.wineTypes ?? []);
      setStyleProfiles(savedPreferences?.styleProfiles ?? ['crisp-white']);
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
    };
  }

  function handleScan() {
    setPreferences(buildPreferences());
    router.push('/scan/camera');
  }

  async function handleScreenshot() {
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
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      <View style={styles.header}>
        <Text style={styles.appName}>List</Text>
        <Text style={styles.subtitle}>Set your preferences then scan or upload a wine list to receive deep AI generated wine recommendations.</Text>
        <Text style={styles.profileNote}>Your profile settings will be used in our recommendations.</Text>
      </View>

      <View style={styles.divider} />

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

        <View style={[styles.section, { alignItems: 'center' }]}>
          <Text style={styles.question}>Budget?</Text>
          <BudgetSlider value={budget} onChange={setBudget} />
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Text style={styles.toggleLabel}>Top Scoring Wines</Text>
            <Text style={styles.toggleSub}>Ignore all preferences — show the 3 highest-rated wines on the list</Text>
          </View>
          <Switch
            value={topScoringMode}
            onValueChange={setTopScoringMode}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Text style={styles.scanButtonText}>Scan Wine List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleScreenshot}>
          <Text style={styles.uploadButtonText}>Upload Screenshot / Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/scan/history')}>
          <Text style={styles.historyButtonText}>View Previous Lists / Recco's</Text>
        </TouchableOpacity>

      </View>
      <TabFooter />
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
    fontSize: 18,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
  scanButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  scanButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    fontSize: 15,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  uploadButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    fontSize: 15,
  },
  historyButton: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  profileNote: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  toggleLeft: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  toggleSub: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
    lineHeight: 18,
  },
});
