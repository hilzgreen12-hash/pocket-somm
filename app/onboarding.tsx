import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { ChipPicker } from '../src/components/preferences/ChipPicker';
import { StylePicker } from '../src/components/preferences/StylePicker';
import { BudgetSlider } from '../src/components/preferences/BudgetSlider';
import { WineTypePicker, WineType } from '../src/components/preferences/WineTypePicker';
import { usePreferences } from '../src/hooks/usePreferences';
import { WINE_REGIONS } from '../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../src/constants/grapeVarieties';
import { colors, spacing, typography } from '../src/constants/theme';

const STEPS = [
  { title: 'What do you mostly drink?', hint: 'We\'ll use this as your default — you can always change it before a scan.' },
  { title: 'How do you like your wine?', hint: 'Select any styles that appeal to you. Leave blank if you\'re open to anything.' },
  { title: 'Favourite regions', hint: 'Wines from these regions will be prioritised in your recommendations.' },
  { title: 'Favourite grapes', hint: 'Wines made from these varieties will be prioritised.' },
  { title: 'Anything to avoid?', hint: 'These will be filtered out entirely before we make recommendations.' },
  { title: 'What\'s your usual budget?', hint: 'Max price per bottle on the menu. You can override this before each scan.' },
];

export default function OnboardingScreen() {
  const { updatePreferences, isSaving } = usePreferences();

  const [step, setStep] = useState(0);
  const [wineType, setWineType] = useState<WineType>('any');
  const [styleProfiles, setStyleProfiles] = useState<string[]>([]);
  const [favouriteRegions, setFavouriteRegions] = useState<string[]>([]);
  const [favouriteGrapes, setFavouriteGrapes] = useState<string[]>([]);
  const [dislikedRegions, setDislikedRegions] = useState<string[]>([]);
  const [dislikedGrapes, setDislikedGrapes] = useState<string[]>([]);
  const [budget, setBudget] = useState<number | null>(null);

  const isLast = step === STEPS.length - 1;

  function handleNext() {
    if (isLast) {
      updatePreferences({
        wineType,
        styleProfiles,
        favouriteRegions,
        favouriteGrapes,
        dislikedRegions,
        dislikedGrapes,
        defaultBudget: budget ?? undefined,
      });
      router.replace('/(tabs)/scan');
    } else {
      setStep((s) => s + 1);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i <= step && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.stepLabel}>Step {step + 1} of {STEPS.length}</Text>
        <Text style={styles.heading}>{STEPS[step].title}</Text>
        <Text style={styles.hint}>{STEPS[step].hint}</Text>

        {step === 0 && (
          <WineTypePicker selected={wineType} onChange={setWineType} />
        )}

        {step === 1 && (
          <StylePicker selected={styleProfiles} onChange={setStyleProfiles} />
        )}

        {step === 2 && (
          <ChipPicker
            options={WINE_REGIONS}
            selected={favouriteRegions}
            onChange={setFavouriteRegions}
          />
        )}

        {step === 3 && (
          <ChipPicker
            options={GRAPE_VARIETIES}
            selected={favouriteGrapes}
            onChange={setFavouriteGrapes}
          />
        )}

        {step === 4 && (
          <>
            <Text style={styles.subLabel}>Regions to avoid</Text>
            <ChipPicker
              options={WINE_REGIONS}
              selected={dislikedRegions}
              onChange={setDislikedRegions}
              activeColor={colors.error}
            />
            <Text style={[styles.subLabel, { marginTop: spacing.lg }]}>Grapes to avoid</Text>
            <ChipPicker
              options={GRAPE_VARIETIES}
              selected={dislikedGrapes}
              onChange={setDislikedGrapes}
              activeColor={colors.error}
            />
          </>
        )}

        {step === 5 && (
          <BudgetSlider value={budget} onChange={setBudget} />
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navRow}>
        {step > 0 ? (
          <TouchableOpacity style={styles.backButton} onPress={() => setStep((s) => s - 1)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          disabled={isSaving}
        >
          {isSaving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.nextText}>{isLast ? 'Save & Start' : 'Next'}</Text>
          }
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.skipRow} onPress={() => router.replace('/(tabs)/scan')}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.burgundy,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  heading: {
    fontSize: 26,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.burgundy,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  subLabel: {
    fontSize: 15,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
  },
  nextButton: {
    backgroundColor: colors.burgundy,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 120,
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 16,
  },
  skipRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  skipText: {
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    fontSize: 14,
  },
});
