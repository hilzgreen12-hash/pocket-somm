import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from 'react-native';

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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

export default function ScanTab() {
  const { session } = useAuth();
  const { setPreferences, setImage, setImageUris } = useScanStore();
  const { preferences: savedPreferences } = usePreferences();

  const [wineTypes, setWineTypes] = useState<WineType[]>(
    savedPreferences?.wineTypes ?? []
  );
  const [styleProfiles, setStyleProfiles] = useState<string[]>(
    savedPreferences?.styleProfiles ?? []
  );
  const [budget, setBudget] = useState<number | null>(
    savedPreferences?.defaultBudget ?? null
  );
  const [foodPairing, setFoodPairing] = useState('');
  const [wineTypeOpen, setWineTypeOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

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
    : 'e.g. Red Wine';

  const styleLabel = styleProfiles.length
    ? styleProfiles.length === 1
      ? styleProfiles[0].replace(/-/g, ' ')
      : `${styleProfiles.length} styles selected`
    : 'e.g. Burgundy';

  // Sync defaults from profile once loaded (React Query is async)
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  useEffect(() => {
    if (savedPreferences && !prefsLoaded) {
      setWineTypes(savedPreferences.wineTypes ?? []);
      setStyleProfiles(savedPreferences.styleProfiles ?? []);
      setBudget(savedPreferences.defaultBudget ?? null);
      setPrefsLoaded(true);
    }
  }, [savedPreferences]);

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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>

      <View style={styles.header}>
        <Text style={styles.appName}>Pocket Somm</Text>
      </View>

      <View style={styles.body}>

        {/* Wine type accordion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('wineType')} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>What are you drinking?</Text>
          </TouchableOpacity>
          {!wineTypeOpen && (
            <Text style={styles.selectionSummary}>{wineTypeLabel}</Text>
          )}
          {wineTypeOpen && (
            <View style={styles.pickerWrap}>
              <WineTypePicker selected={wineTypes} onChange={setWineTypes} />
            </View>
          )}
        </View>

        {/* Style accordion */}
        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggleSection('style')} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>What wine style are you vibing?</Text>
          </TouchableOpacity>
          {!styleOpen && (
            <Text style={styles.selectionSummary}>{styleLabel}</Text>
          )}
          {styleOpen && (
            <View style={styles.pickerWrap}>
              <StylePicker selected={styleProfiles} onChange={setStyleProfiles} />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Budget?</Text>
          <BudgetSlider value={budget} onChange={setBudget} />
        </View>

        <View style={styles.section}>
          <Text style={styles.question}>Broadly or specifically, what are you dining on?</Text>
          <FoodPairingInput value={foodPairing} onChange={setFoodPairing} />
        </View>

        <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
          <Text style={styles.scanButtonText}>Scan Wine List</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.uploadButton} onPress={handleScreenshot}>
          <Text style={styles.uploadButtonText}>Upload Screenshot / Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.accountButton} onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.accountButtonText}>
            {session ? 'Account' : 'Sign In / Create Account'}
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 96,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 42,
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  body: {
    paddingHorizontal: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  questionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  question: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  selectionSummary: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
    marginBottom: spacing.sm,
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
  accountButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  accountButtonText: {
    fontFamily: 'CormorantGaramond_400Regular',
    color: 'rgba(255,255,255,0.40)',
    fontSize: 20,
  },
});
