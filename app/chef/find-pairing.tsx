import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { MicButton } from '../../src/components/MicButton';
import { SearchProgress } from '../../src/components/SearchProgress';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useAuth } from '../../src/hooks/useAuth';
import { findFoodWinePairing, scanRecipe, prepareImageBase64 } from '../../src/api/label';
import * as ImagePicker from 'expo-image-picker';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function FindPairingScreen() {
  useKeepAwake();
  const { session } = useAuth();
  const { wines } = useCellar();
  const { preferences: savedPreferences } = usePreferences();
  const { setCellarResult, setGeneralResult, setDish, setMode, setStylePreference: storeStyle, setBudget: storeBudget } = useFoodPairingStore();

  const [dish, setDishLocal] = useState('');
  // Multi-select preference bubbles (mirror the You → Your Preferences page):
  // pick none = any, or one+ regions / styles. Region allows custom entries.
  const [regionPrefs, setRegionPrefs] = useState<string[]>([]);
  const [stylePrefs, setStylePrefs] = useState<string[]>([]);
  // Accordions (collapsed by default) — mirror the You → Your Preferences page.
  const [regionOpen, setRegionOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [budget, setBudget] = useState<number | null>(savedPreferences?.defaultBudget ?? null);
  const [mode, setModeLocal] = useState<'cellar' | 'general'>('cellar');
  const [loading, setLoading] = useState(false);
  // Uploaded recipe — when set, the button shows the title and the summary
  // folds into the brief Vinster pairs against.
  const [recipeTitle, setRecipeTitle] = useState<string | null>(null);
  const [recipeBrief, setRecipeBrief] = useState<string | null>(null);
  const [recipeLoading, setRecipeLoading] = useState(false);

  function handleUploadRecipe() {
    showAlert({
      title: 'Upload a Recipe',
      body: 'Scan a recipe or upload a screenshot, and Vinster will base its wine on the dish.',
      buttons: [
        { text: 'Scan a Recipe', onPress: () => pickRecipe('camera') },
        { text: 'Upload a Screenshot', onPress: () => pickRecipe('library') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function pickRecipe(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      setRecipeLoading(true);
      const base64 = await prepareImageBase64(result.assets[0].uri);
      const recipe = await scanRecipe(base64);
      if (!recipe.dishName) {
        showAlert({ title: 'No recipe found', body: "Vinster couldn't read a recipe from that image. Try a clearer screenshot or photo." });
        return;
      }
      setRecipeTitle(recipe.dishName);
      setRecipeBrief(recipe.summary ?? null);
      setDishLocal(recipe.dishName);
    } catch (err) {
      showAlert({ title: 'Could not read the recipe', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setRecipeLoading(false);
    }
  }

  // Jump to the wine-preferences editor and back. Pushed (not replaced) so the
  // editor's Back returns here with this form's state intact.
  function handleOpenPreferences() {
    if (!session) { setSignInPromptVisible(true); return; }
    router.push('/profile/wine');
  }

  const STYLE_CHOICES = ['White', 'Red', 'Rosé', 'Sparkling', 'Fortified'];
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
    // Fold the optional regional preference into the brief the AI sees, but
    // keep the displayed/stored dish clean so the results heading stays tidy.
    const regionNote = regionPrefs.join(', ').trim();
    const styleStr = stylePrefs.length ? stylePrefs.join(', ') : null;
    // Fold an uploaded recipe's summary into the brief so Vinster pairs to the
    // actual dish, not just its name.
    const recipeNote = recipeBrief?.trim() ? `\n\nFrom the uploaded recipe: ${recipeBrief.trim()}` : '';
    const aiDish = (regionNote
      ? `${cleanDish}\n\nPreferred wine region or style: ${regionNote}.`
      : cleanDish) + recipeNote;
    setDish(cleanDish);
    setMode(mode);
    storeStyle(styleStr);
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
        aiDish,
        mode,
        mode === 'cellar' ? cellarSummary : undefined,
        undefined,
        savedPreferences ? (savedPreferences as unknown as Record<string, unknown>) : null,
        styleStr,
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
      {/* Cellar-style header bar — Back / title / spacer. */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Wine Pairing</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.divider} />

      {/* What are you cooking — centred label with the mic + bin centred
          beneath it, then the input. The "strong flavours" guidance lives in
          the input's placeholder rather than as a separate helper line. */}
      <Text style={[styles.fieldLabel, styles.centredLabel]}>What are you cooking?</Text>
      <View style={styles.micRowCentred}>
        <MicButton value={dish} onChangeText={setDishLocal} onClear={() => setDishLocal('')} />
      </View>
      <TextInput
        style={styles.inputLeft}
        value={dish}
        onChangeText={setDishLocal}
        placeholder="e.g. Roast leg of lamb with sweet potato. Include any strong flavours or ingredients that will help guide your pairing."
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Upload a Recipe — scan/photo/screenshot a recipe and Vinster pairs to
          it. Once read, the button becomes the recipe's title. */}
      <TouchableOpacity style={styles.recipeUploadBtn} onPress={handleUploadRecipe} disabled={recipeLoading} activeOpacity={0.85}>
        <Text style={styles.recipeUploadBtnText} numberOfLines={1}>
          {recipeLoading ? 'Reading recipe…' : (recipeTitle ?? 'Upload a Recipe')}
        </Text>
      </TouchableOpacity>

      {/* Regional + Style preference — collapsible accordions that mirror the
          You → Your Preferences "Regional/Varietal Dislikes" exactly: a header
          with a selection summary, expanding to multi-select bubbles. */}
      <TouchableOpacity style={styles.styleAccordion} onPress={() => setRegionOpen((v) => !v)} activeOpacity={0.7}>
        <View style={styles.styleAccordionLeft}>
          <Text style={styles.styleQuestion}>Regional Preference</Text>
          {!regionOpen && (
            <Text style={[styles.styleAccordionSummary, regionPrefs.length > 0 && styles.styleAccordionSummaryActive]}>
              {regionPrefs.length > 0 ? `${regionPrefs.length} selected` : 'Any'}
            </Text>
          )}
        </View>
        <Text style={styles.styleAccordionChevron}>{regionOpen ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {regionOpen && (
        <View style={styles.pickerWrap}>
          <ChipPicker options={WINE_REGIONS} selected={regionPrefs} onChange={setRegionPrefs} allowCustom />
        </View>
      )}

      <TouchableOpacity style={styles.styleAccordion} onPress={() => setStyleOpen((v) => !v)} activeOpacity={0.7}>
        <View style={styles.styleAccordionLeft}>
          <Text style={styles.styleQuestion}>Wine Style Preference</Text>
          {!styleOpen && (
            <Text style={[styles.styleAccordionSummary, stylePrefs.length > 0 && styles.styleAccordionSummaryActive]}>
              {stylePrefs.length > 0 ? `${stylePrefs.length} selected` : 'Any'}
            </Text>
          )}
        </View>
        <Text style={styles.styleAccordionChevron}>{styleOpen ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {styleOpen && (
        <View style={styles.pickerWrap}>
          <ChipPicker options={STYLE_CHOICES} selected={stylePrefs} onChange={setStylePrefs} />
        </View>
      )}

      {/* Budget? Baller — inline header via the slider's label prop, mirroring List. */}
      <View style={styles.budgetBlock}>
        <BudgetSlider value={budget} onChange={setBudget} currency={savedPreferences?.defaultCurrency} label="Budget?" compact />
      </View>

      {/* Rule between the budget slider and the From My Cellar / Suggest a
          Style / Find Pairing buttons. */}
      <View style={styles.divider} />

      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'cellar' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('cellar')}
        >
          <Text style={[styles.toggleText, mode === 'cellar' && styles.toggleTextActive]}>From My Cellar</Text>
          <Text style={[styles.toggleSub, mode === 'cellar' && styles.toggleSubActive]}>{wines.length} {wines.length === 1 ? 'bottle' : 'bottles'}</Text>
        </TouchableOpacity>

        <View style={styles.toggleDivider} />

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
  content: { padding: spacing.xl, paddingTop: 112, paddingBottom: 60 },
  backRow: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  // Cellar-style header bar.
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  blurb: { fontSize: 16, fontFamily: fonts.headingItalic, color: colors.textMuted, lineHeight: 22, textAlign: 'center', marginBottom: spacing.sm },
  // Inline preferences link — inherits the blurb's font/size, gold + underline.
  blurbLink: { color: colors.gold, textDecorationLine: 'underline' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  fieldLabelCaps: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  // Mixed-case form label (no caps) + centred variant for the cooking /
  // regional inputs, matching the rest of the app's input labels.
  fieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted, letterSpacing: 0.3, marginBottom: spacing.xs },
  centredLabel: { textAlign: 'center', alignSelf: 'stretch' },
  // Label above each preference bubble group.
  chipFieldLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  // Expanded accordion body holding the bubbles.
  pickerWrap: { marginTop: spacing.xs, marginBottom: spacing.lg, paddingHorizontal: spacing.xs },
  // Upload a Recipe — mirrors the Chef tab buttonFull (white border, rounded 14).
  recipeUploadBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  recipeUploadBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  micRowCentred: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm },
  regionInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.xl, width: '100%', textAlign: 'center' },
  helper: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.sm },
  micRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm },
  // "What are you cooking?" caps label with the mic + bin on the same line.
  cookingHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  cookingLabel: { marginBottom: 0, flexShrink: 1 },
  styleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: spacing.lg },
  rowLabel: { marginBottom: 0, flexShrink: 1 },
  // Wine Style row — mirrors the Recipe Requirements accordion input rows.
  styleAccordion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.lg },
  styleAccordionLeft: { flex: 1, alignItems: 'center' },
  styleQuestion: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  styleAccordionSummary: { fontFamily: fonts.bodyMedium, fontSize: 14, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  // Gold once a region (named or confirmed custom) is chosen.
  styleAccordionSummaryActive: { color: colors.gold },
  // 'Other' custom-region input row + Confirm button (input hides on confirm).
  regionOtherRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xl },
  regionOtherInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  regionOtherConfirm: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  regionOtherConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  styleAccordionChevron: { fontSize: 14, color: '#FFFFFF', marginLeft: spacing.sm },
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
  inputLeft: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 90, marginBottom: spacing.xl, width: '100%', textAlign: 'left' },
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
  toggleRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm, marginBottom: spacing.sm, width: '100%' },
  toggleBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  // Thin vertical rule between the From My Cellar / Suggest a Style buttons.
  toggleDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  toggleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.08)' },
  toggleText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  toggleTextActive: { color: colors.gold },
  toggleSub: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  toggleSubActive: { color: colors.gold },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl, width: '100%', justifyContent: 'center' },
  styleBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  styleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  styleBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  styleBtnTextActive: { color: colors.gold },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%' },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15 },
});
