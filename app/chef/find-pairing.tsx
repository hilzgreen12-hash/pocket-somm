import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { MicButton } from '../../src/components/MicButton';
import { PairVoiceModal } from '../../src/components/PairVoiceModal';
import { SearchProgress } from '../../src/components/SearchProgress';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useHomeCellarWines } from '../../src/hooks/useHomeCellarWines';
import { usePreferences } from '../../src/hooks/usePreferences';
import { findFoodWinePairing } from '../../src/api/label';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { WINE_REGIONS } from '../../src/constants/wineRegions';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function FindPairingScreen() {
  useKeepAwake();
  // Pairings only ever recommend bottles kept at home, never external storage.
  const { wines, allWines, ready: homeReady } = useHomeCellarWines();
  const { preferences: savedPreferences } = usePreferences();
  const { setCellarResult, setGeneralResult, setDish, setMode, setStylePreference: storeStyle, setBudget: storeBudget, generalResult, cellarResult } = useFoodPairingStore();
  const { sessions: pairingSessions, save: savePairing } = useChefPairingHistory();

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
  // Quick Command — the "Find a wine for my dish" conversation instead of the form.
  const [askOpen, setAskOpen] = useState(false);

  // "View Last Result" — reopen the current in-memory pairing if there is one,
  // otherwise the most recent saved pairing. Mirrors the Pair tab's long-press.
  function handleViewLastResult() {
    if (generalResult || cellarResult) {
      router.push('/chef/pairing-results');
      return;
    }
    const last = pairingSessions[0];
    if (!last) {
      showAlert({ title: 'No previous search', body: 'Once you save a wine pairing to your archive, you can come back here to revisit it.' });
      return;
    }
    setDish(last.dish);
    setMode(last.mode);
    if (last.mode === 'cellar') setCellarResult(last.cellar_result ?? []);
    else setGeneralResult(last.general_result ?? [], last.general_summary ?? undefined);
    router.push({
      pathname: '/chef/pairing-results',
      params: { fromHistory: 'true', savedAt: last.saved_at, city: last.city ?? '' },
    });
  }

  const STYLE_CHOICES = ['White', 'Red', 'Rosé', 'Sparkling', 'Fortified'];

  // Seed the budget from the user's saved default once preferences load
  // (they arrive async, so the initial useState above often sees null).
  const budgetSeededRef = useRef(false);
  useEffect(() => {
    if (!budgetSeededRef.current && savedPreferences?.defaultBudget != null) {
      setBudget(savedPreferences.defaultBudget);
      budgetSeededRef.current = true;
    }
  }, [savedPreferences?.defaultBudget]);

  async function handleFind() {
    if (!dish.trim()) {
      showAlert({ title: 'What are you cooking?', body: 'Please describe your dish first.' });
      return;
    }
    if (mode === 'cellar' && !homeReady) {
      showAlert({ title: 'One moment', body: 'Vinster is still checking which bottles you have at home. Please try again.' });
      return;
    }
    if (mode === 'cellar' && wines.length === 0) {
      showAlert(allWines.length > 0
        ? { title: 'Nothing at home', body: 'All your bottles are in external storage. Switch to "Suggest a Style" to get a general recommendation.' }
        : { title: 'Empty cellar', body: 'Your cellar is empty. Switch to "Suggest a Style" to get a general recommendation.' });
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
    const aiDish = regionNote
      ? `${cleanDish}\n\nPreferred wine region or style: ${regionNote}.`
      : cleanDish;
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

      // Silently record this pairing to the user's OWN private history (RLS-scoped,
      // never shared) so it can power Cellar Insights (e.g. most-paired dishes) —
      // no archive UI. Fire-and-forget: never block or error the pairing itself.
      savePairing.mutate({
        dish: cleanDish,
        mode,
        cellarResult: mode === 'cellar' ? (result.recommendations as CellarRecommendation[]) : null,
        generalResult: mode === 'general' ? (result.recommendations as GeneralRecommendation[]) : null,
        generalSummary: mode === 'general' ? (result.summary ?? null) : null,
      });

      router.push('/chef/pairing-results');
    } catch (err) {
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
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Find a Wine Pairing</Text>
        <View style={{ width: 44 }} />
      </View>

      <TouchableOpacity style={styles.askBtn} onPress={() => setAskOpen(true)} activeOpacity={0.8} accessibilityRole="button">
        <Text style={styles.askBtnText}>Quick Command</Text>
      </TouchableOpacity>
      <PairVoiceModal visible={askOpen} onClose={() => setAskOpen(false)} startWith="wineForDish" />

      <View style={styles.divider} />

      {/* What are you cooking — left-aligned, with the mic + bin beside it. */}
      <View style={styles.cookingHeaderRow}>
        <Text style={styles.cookingLabel}>What are you cooking?</Text>
        <MicButton value={dish} onChangeText={setDishLocal} onClear={() => setDishLocal('')} domain="food" serverCorrect />
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

      <View style={styles.divider} />

      {/* Regional + Style preference — collapsible accordions that mirror the
          You → Your Preferences "Regional/Varietal Dislikes" exactly: a header
          with a selection summary, expanding to multi-select bubbles. */}
      <TouchableOpacity style={styles.styleAccordion} onPress={() => setRegionOpen((v) => !v)} activeOpacity={0.7}>
        <View style={styles.styleAccordionLeft}>
          <Text style={styles.styleQuestion}>Regional Preference</Text>
          {!regionOpen && (
            <Text style={[styles.styleAccordionSummary, regionPrefs.length > 0 && styles.styleAccordionSummaryActive]} numberOfLines={1}>
              {regionPrefs.length === 1 ? regionPrefs[0] : regionPrefs.length > 1 ? `${regionPrefs.length} selected` : 'Any'}
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
            <Text style={[styles.styleAccordionSummary, stylePrefs.length > 0 && styles.styleAccordionSummaryActive]} numberOfLines={1}>
              {stylePrefs.length === 1 ? stylePrefs[0] : stylePrefs.length > 1 ? `${stylePrefs.length} selected` : 'Any'}
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
          <Text style={[styles.toggleSub, mode === 'cellar' && styles.toggleSubActive]}>{wines.length} {wines.length === 1 ? 'Wine' : 'Wines'}</Text>
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

      <TouchableOpacity style={styles.button} onPress={handleFind}>
        <Text style={styles.buttonText}>Find Pairing</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.lastResultBtn} onPress={handleViewLastResult}>
        <Text style={styles.lastResultBtnText}>View Last Result</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  askBtn: { alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xs },
  askBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },

  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingTop: 112, paddingBottom: 60 },

  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, width: 44 },
  // Cellar-style header bar.
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  // "What are you cooking?" left-aligned, with the mic/bin pushed to the right.
  cookingLabel: { fontFamily: fonts.headingRegular, fontSize: 19, color: colors.text },
  cookingHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },

  // Expanded accordion body holding the bubbles.
  pickerWrap: { marginTop: spacing.sm, marginBottom: spacing.sm },

  // Wine Style row — mirrors the Recipe Requirements accordion input rows.
  styleAccordion: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingVertical: 8 },
  styleAccordionLeft: { flex: 1, alignItems: 'flex-start' },
  styleQuestion: { fontFamily: fonts.headingRegular, fontSize: 18, color: '#FFFFFF' },
  styleAccordionSummary: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 1 },
  // Gold once a region (named or confirmed custom) is chosen.
  styleAccordionSummaryActive: { color: colors.gold },

  styleAccordionChevron: { fontSize: 14, color: '#FFFFFF', marginLeft: spacing.sm },

  inputLeft: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 12, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 84, marginBottom: spacing.sm, width: '100%', textAlign: 'left' },

  budgetBlock: { width: '100%', marginTop: spacing.md, marginBottom: spacing.sm },

  toggleRow: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.sm, marginBottom: spacing.sm, width: '100%' },
  toggleBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  // Thin vertical rule between the From My Cellar / Suggest a Style buttons.
  toggleDivider: { width: 1, alignSelf: 'stretch', backgroundColor: colors.border },
  toggleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.08)' },
  toggleText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  toggleTextActive: { color: colors.gold },
  toggleSub: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  toggleSubActive: { color: colors.gold },

  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
  // White "View Last Result" bubble beneath Find Pairing — same footprint as the
  // Find Pairing button, white outline + text.
  lastResultBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%', marginTop: spacing.sm },
  lastResultBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
});
