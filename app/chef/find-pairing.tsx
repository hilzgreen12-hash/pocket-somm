import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { MicButton } from '../../src/components/MicButton';
import { SearchProgress } from '../../src/components/SearchProgress';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useAuth } from '../../src/hooks/useAuth';
import { findFoodWinePairing } from '../../src/api/label';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function FindPairingScreen() {
  useKeepAwake();
  const { session } = useAuth();
  const { wines } = useCellar();
  const { preferences: savedPreferences } = usePreferences();
  const { setCellarResult, setGeneralResult, setDish, setMode, setStylePreference: storeStyle, setBudget: storeBudget } = useFoodPairingStore();

  const [dish, setDishLocal] = useState('');
  const [stylePreference, setStylePreference] = useState<string | null>(null);
  const [budget, setBudget] = useState<number | null>(savedPreferences?.defaultBudget ?? null);
  const [mode, setModeLocal] = useState<'cellar' | 'general'>('cellar');
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Jump to the wine-preferences editor and back. Pushed (not replaced) so the
  // editor's Back returns here with this form's state intact.
  function handleOpenPreferences() {
    if (!session) { setSignInPromptVisible(true); return; }
    router.push('/profile/wine');
  }

  const STYLE_OPTIONS = ['Any', 'White', 'Red', 'Rosé', 'Sparkling', 'Fortified'];
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [signInPromptShown, setSignInPromptShown] = useState(false);
  const pendingFindRef = useRef(false);

  // Seed the budget from the user's saved default once preferences load
  // (they arrive async, so the initial useState above often sees null).
  const budgetSeededRef = useRef(false);
  useEffect(() => {
    if (!budgetSeededRef.current && savedPreferences?.defaultBudget != null) {
      setBudget(savedPreferences.defaultBudget);
      budgetSeededRef.current = true;
    }
  }, [savedPreferences?.defaultBudget]);

  async function handleFind(skipPrompt = false) {
    if (!dish.trim()) {
      showAlert({ title: 'What are you cooking?', body: 'Please describe your dish first.' });
      return;
    }
    if (mode === 'cellar' && wines.length === 0) {
      showAlert({ title: 'Empty cellar', body: 'Your cellar is empty. Switch to "Suggest a Style" to get a general recommendation.' });
      return;
    }

    if (!session && !signInPromptShown && !skipPrompt) {
      setSignInPromptShown(true);
      pendingFindRef.current = true;
      setSignInPromptVisible(true);
      return;
    }

    setLoading(true);
    // Keep the displayed/stored dish as the user's clean cooking brief; the
    // style preference and budget travel as structured params so the results
    // heading stays tidy and the cellar re-query can reuse them.
    const cleanDish = dish.trim();
    setDish(cleanDish);
    setMode(mode);
    storeStyle(stylePreference);
    storeBudget(budget);

    try {
      const cellarSummary = wines.map((w) => ({
        id: w.id,
        wine_name: w.wine_name,
        producer: w.producer,
        region: w.region,
        vintage: w.vintage,
        grape_variety: w.grape_variety,
        drinking_window_status: w.drinking_window_status,
        purchase_price: w.purchase_price ?? null,
        purchase_price_currency: w.purchase_price_currency ?? null,
      }));

      const result = await findFoodWinePairing(
        cleanDish,
        mode,
        mode === 'cellar' ? cellarSummary : undefined,
        undefined,
        savedPreferences ? (savedPreferences as unknown as Record<string, unknown>) : null,
        stylePreference,
        budget,
      ) as any;

      if (mode === 'cellar') {
        setCellarResult(result.recommendations as CellarRecommendation[]);
      } else {
        setGeneralResult(result.recommendations as GeneralRecommendation[], result.summary);
      }

      router.push('/chef/pairing-results');
    } catch {
      showAlert({ title: 'Error', body: 'Could not find a pairing. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SearchProgress
        title="Finding your perfect pairing…"
        subtitle="Vinster needs up to a minute for your result"
        body={mode === 'cellar'
          ? 'Our sommelier is searching your cellar for the ideal match'
          : 'Our sommelier is selecting the perfect wine style for your dish'}
        durationMs={60000}
      />
    );
  }

  return (
    <KeyboardAwareScrollView style={styles.container} contentContainerStyle={styles.content} bottomOffset={24}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Find a Wine Pairing</Text>
      <Text style={styles.subheading}>
        Tell us what you're cooking and we'll find the perfect wine. Vinster will use your settings under{' '}
        <Text style={styles.preferencesInline} onPress={handleOpenPreferences}>About You - Your Wine Preferences</Text>
        {' '}to guide its results.
      </Text>

      <View style={styles.fieldHeaderRow}>
        <Text style={styles.leftLabel}>What are you cooking?</Text>
        <MicButton value={dish} onChangeText={setDishLocal} onClear={() => setDishLocal('')} />
      </View>
      <Text style={styles.helperLeft}>Include any strong flavours or ingredients that will help guide your pairing.</Text>
      <TextInput
        style={styles.inputLeft}
        value={dish}
        onChangeText={setDishLocal}
        placeholder="e.g. Roast leg of lamb with rosemary and garlic"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.leftLabel}>Any specific wine style preference?</Text>
      <TouchableOpacity style={styles.dropdownChip} onPress={() => setStyleDropdownOpen(true)} activeOpacity={0.7}>
        <Text style={styles.dropdownChipText}>{stylePreference ?? 'Any'}</Text>
        <Text style={styles.dropdownChevron}>▾</Text>
      </TouchableOpacity>

      <View style={styles.budgetBlock}>
        <Text style={styles.label}>Budget?</Text>
        <BudgetSlider value={budget} onChange={setBudget} currency={savedPreferences?.defaultCurrency} />
      </View>

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'cellar' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('cellar')}
        >
          <Text style={[styles.toggleText, mode === 'cellar' && styles.toggleTextActive]}>From My Cellar</Text>
          {wines.length > 0 && <Text style={[styles.toggleSub, mode === 'cellar' && styles.toggleSubActive]}>{wines.length} bottles</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'general' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('general')}
        >
          <Text style={[styles.toggleText, mode === 'general' && styles.toggleTextActive]}>Suggest a Style</Text>
          <Text style={[styles.toggleSub, mode === 'general' && styles.toggleSubActive]}>To go and buy</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => handleFind()}>
        <Text style={styles.buttonText}>Find Pairing</Text>
      </TouchableOpacity>

      <Modal visible={styleDropdownOpen} transparent animationType="fade" onRequestClose={() => setStyleDropdownOpen(false)}>
        <TouchableOpacity style={styles.dropdownOverlay} activeOpacity={1} onPress={() => setStyleDropdownOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.dropdownSheet} onPress={() => {}}>
            <Text style={styles.dropdownTitle}>Wine style</Text>
            {STYLE_OPTIONS.map((s) => {
              const val = s === 'Any' ? null : s;
              const active = stylePreference === val;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.dropdownOption, active && styles.dropdownOptionActive]}
                  onPress={() => { setStylePreference(val); setStyleDropdownOpen(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>{s}</Text>
                  {active && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => { setSignInPromptVisible(false); pendingFindRef.current = false; }}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => { setSignInPromptVisible(false); handleFind(true); }}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  // Brand wordmark shown on the loading splash — keep editorial Cormorant.
  loadingBrand: { fontSize: 36, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xxl },
  loadingTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  loadingTiming: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  loadingBody: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  loadingStay: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textAlign: 'center', opacity: 0.8 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60, alignItems: 'center' },
  backRow: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  heading: { fontSize: 30, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  subheading: { fontSize: 17, fontFamily: fonts.headingItalic, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl, textAlign: 'center' },
  profileNote: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  profileNoteLink: { fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline' },
  // "Update your preferences here." — a quiet link tucked just beneath the
  // blurb (negative top margin pulls it up close), not a prominent button.
  preferencesLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center', marginTop: -spacing.md, marginBottom: spacing.xl },
  // Inline link inside the blurb — taps through to the wine-preferences editor.
  preferencesInline: { fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline' },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, textAlign: 'center' },
  // Left-aligned field label (mixed case) for the cooking + style inputs.
  leftLabel: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.text, alignSelf: 'flex-start', marginBottom: spacing.xs },
  fieldHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  helperLeft: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'left', alignSelf: 'flex-start', lineHeight: 19, marginBottom: spacing.sm },
  inputLeft: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 17, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 90, marginBottom: spacing.xl, width: '100%', textAlign: 'left' },
  dropdownChip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'flex-start', minWidth: 160, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.xl },
  dropdownChipText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  dropdownChevron: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginLeft: spacing.md },
  dropdownOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  dropdownSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  dropdownTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  dropdownOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  dropdownOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  dropdownOptionText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  dropdownOptionTextActive: { color: colors.gold },
  dropdownCheck: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold },
  // Lower-case helper line beneath "What are you cooking?".
  helperText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: spacing.md },
  budgetBlock: { width: '100%', marginBottom: spacing.xl },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 17, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 90, marginBottom: spacing.xl, width: '100%', textAlign: 'center' },
  difficultyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl, width: '100%' },
  difficultyBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', width: '48.5%' },
  difficultyBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  difficultyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.textMuted },
  difficultyBtnTextActive: { color: colors.gold },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, width: '100%' },
  toggleBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  toggleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.08)' },
  toggleText: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  toggleTextActive: { color: colors.gold },
  toggleSub: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  toggleSubActive: { color: colors.gold },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl, width: '100%', justifyContent: 'center' },
  styleBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  styleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  styleBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  styleBtnTextActive: { color: colors.gold },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 17 },
});
