import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { usePreferences } from '../../src/hooks/usePreferences';
import { WineTypePicker, WineType } from '../../src/components/preferences/WineTypePicker';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { FoodPairingInput } from '../../src/components/preferences/FoodPairingInput';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ScanTab() {
  const { setPreferences } = useScanStore();
  const { preferences: savedPreferences } = usePreferences();

  const [wineType, setWineType] = useState<WineType>('any');
  const [styleProfiles, setStyleProfiles] = useState<string[]>(
    savedPreferences?.styleProfiles ?? []
  );
  const [budget, setBudget] = useState<number | null>(null);
  const [foodPairing, setFoodPairing] = useState('');

  function handleScan() {
    setPreferences({ wineType, styleProfiles, budget, foodPairing });
    router.push('/scan/camera');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.heading}>Pocket Som</Text>
      <Text style={styles.subheading}>Set your preferences, then scan the wine list</Text>

      <View style={styles.section}>
        <Text style={styles.label}>What are you drinking?</Text>
        <WineTypePicker selected={wineType} onChange={setWineType} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Style</Text>
        <Text style={styles.hint}>Optional — refine further by style</Text>
        <StylePicker selected={styleProfiles} onChange={setStyleProfiles} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Max Budget (per bottle)</Text>
        <BudgetSlider value={budget} onChange={setBudget} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Food Pairing</Text>
        <Text style={styles.hint}>Optional — what are you eating?</Text>
        <FoodPairingInput value={foodPairing} onChange={setFoodPairing} />
      </View>

      <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
        <Text style={styles.scanButtonText}>Scan Wine List</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.burgundy,
    marginBottom: spacing.xs,
  },
  subheading: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  scanButton: {
    backgroundColor: colors.burgundy,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
});
