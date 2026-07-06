import { useState, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Share } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { showAlert } from '../../src/components/AppAlert';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { SearchProgress } from '../../src/components/SearchProgress';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation, type PriceBandExample } from '../../src/stores/foodPairingStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../../src/api/cellar';
import { findFoodWinePairing } from '../../src/api/label';
import { currencySymbol } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { CellarWine } from '../../src/types/wine';

function isPriceBandExample(ex: PriceBandExample | string): ex is PriceBandExample {
  return typeof ex === 'object' && ex !== null && 'priceBand' in ex;
}

// Capitalise the dish so the results heading reads as a proper title
// regardless of how the user typed their brief.
function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

const RANK_LABELS = ['1st choice', '2nd choice', '3rd choice'];

function CellarResults({ recommendations, wines, onSelect }: {
  recommendations: CellarRecommendation[];
  wines: ReturnType<typeof useCellar>['wines'];
  onSelect: (wine: CellarWine, recName: string) => void;
}) {
  return (
    <>
      {recommendations.map((rec) => {
        const wine = wines.find((w) => w.id === rec.cellarWineId);
        const subtitleParts = [wine?.vintage, wine?.region].filter(Boolean);
        const subtitle = subtitleParts.length > 0 ? `From your cellar · ${subtitleParts.join(' · ')}` : 'From your cellar';
        return (
          <View key={rec.cellarWineId} style={styles.card}>
            <Text style={styles.cardWine}>{rec.wineName}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
            <Text style={styles.cardBody}>{rec.rationale}</Text>

            <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Serving tip</Text>
            <Text style={styles.cardItem}>{rec.servingTip}</Text>

            <TouchableOpacity
              onPress={() => wine && onSelect(wine, rec.wineName)}
              activeOpacity={0.7}
              disabled={!wine}
            >
              <Text style={[styles.cardLink, !wine && styles.cardLinkMuted]}>
                {wine ? 'Select This Wine' : 'No longer in your cellar'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}

function GeneralResults({ results, summary, currency }: { results: GeneralRecommendation[]; summary: string | null; currency: string }) {
  const sym = currencySymbol(currency);
  return (
    <>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {results.map((result, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardWine}>{result.wineStyle}</Text>
          <Text style={styles.cardSubtitle}>{RANK_LABELS[i] ?? `Choice ${i + 1}`} · {result.region}</Text>
          <Text style={styles.cardBody}>{result.whyItWorks}</Text>

          <Text style={[styles.cardSection, { marginTop: spacing.md }]}>What to look for</Text>
          <Text style={styles.cardItem}>{result.characteristics}</Text>

          {/* Legacy archived pairings may still carry a free-text priceGuide. */}
          {result.priceGuide ? (
            <Text style={[styles.cardItem, { color: colors.gold, marginTop: spacing.xs }]}>{result.priceGuide}</Text>
          ) : null}

          {/* Current pairings carry a single budget-appropriate whereToLook.
              Older archived pairings fall back to the price-band examples. */}
          {result.whereToLook ? (
            <>
              <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Where to look</Text>
              <Text style={styles.cardItem}>{result.whereToLook}</Text>
            </>
          ) : result.examples && result.examples.length > 0 ? (
            <>
              <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Where to look for it</Text>
              {result.examples.map((ex, j) => {
                if (isPriceBandExample(ex)) {
                  const band = Math.min(3, Math.max(1, ex.priceBand));
                  return (
                    <View key={j} style={styles.bandRow}>
                      <Text style={styles.bandSymbol}>{sym.repeat(band)}</Text>
                      <Text style={styles.bandRegion}>{ex.region}</Text>
                    </View>
                  );
                }
                // Legacy archived pairings carried producer-string examples.
                return <Text key={j} style={styles.cardItem}>· {ex}</Text>;
              })}
            </>
          ) : null}
        </View>
      ))}
    </>
  );
}

export default function PairingResultsScreen() {
  const { fromHistory, savedAt, city } = useLocalSearchParams<{ fromHistory?: string; savedAt?: string; city?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { dish, mode, cellarResult, generalResult, generalSummary, stylePreference, budget, setCellarResult, setMode } = useFoodPairingStore();
  const { wines } = useCellar();
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const userCurrency = preferences?.defaultCurrency ?? 'GBP';
  const qc = useQueryClient();
  const [renderedAt] = useState(() => new Date().toISOString());
  const [requerying, setRequerying] = useState(false);
  // Share the whole results area as a high-resolution PNG so the print stays
  // crisp. captureRef renders at the device pixel ratio (no upscaling blur);
  // we capture the laid-out content view so off-screen results are included.
  const shareRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  async function handleSharePage() {
    if (sharing) return;
    setSharing(true);
    try {
      await new Promise((r) => setTimeout(r, 60)); // one paint before snapshot
      if (shareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share your wine pairing', UTI: 'public.png' });
        return;
      }
      await Share.share({ message: `My Vinster wine pairing for ${titleCase(dish)}${VINSTER_TEXT_SHARE_FOOTER}` });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  // "Show me all of the wines from my cellar that could work" — re-runs the
  // same brief against the user's cellar without sending them back to the
  // form. Reuses the stored style preference + budget.
  async function handleShowCellarOptions() {
    if (wines.length === 0) return;
    setRequerying(true);
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
        dish,
        'cellar',
        cellarSummary,
        undefined,
        preferences ? (preferences as unknown as Record<string, unknown>) : null,
        stylePreference,
        budget,
      ) as any;
      setCellarResult(result.recommendations as CellarRecommendation[]);
      setMode('cellar');
    } catch {
      showAlert({ title: 'Error', body: 'Could not search your cellar. Please try again.' });
    } finally {
      setRequerying(false);
    }
  }

  // Selection modal — opens when the user taps "Select This Wine" on a
  // cellar recommendation. Lets them archive bottles without leaving the
  // results page.
  const [selecting, setSelecting] = useState<{ wine: CellarWine; recName: string } | null>(null);
  const [bottleCount, setBottleCount] = useState('1');
  const [archiving, setArchiving] = useState(false);
  const [archivedSuccess, setArchivedSuccess] = useState<{ count: number; recName: string } | null>(null);

  const stampDateSource = savedAt || renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampLocation = (city ?? '').trim() || null;

  function handleBack() {
    // Don't reset — keep the latest search in memory so "View last result"
    // on the Chef tab can return the user to it within the same session.
    router.replace('/(tabs)/chef');
  }

  function openSelect(wine: CellarWine, recName: string) {
    setSelecting({ wine, recName });
    setBottleCount('1');
    setArchivedSuccess(null);
  }

  function closeSelect() {
    setSelecting(null);
    setBottleCount('1');
    setArchivedSuccess(null);
  }

  async function handleArchiveWine() {
    if (!selecting || !session?.user.id) return;
    const count = Math.max(1, parseInt(bottleCount, 10) || 0);
    const wine = selecting.wine;
    if (count > wine.quantity) {
      showAlert({ title: 'Not enough bottles', body: `You only have ${wine.quantity} ${wine.quantity === 1 ? 'bottle' : 'bottles'} of this wine in your cellar.` });
      return;
    }
    setArchiving(true);
    try {
      const removedAt = new Date().toISOString();
      await addCellarWineRemoval({
        cellarWineId: wine.id,
        removedAt,
        count,
        note: 'Selected for a Chef pairing',
      });

      if (count >= wine.quantity) {
        // Archive the row directly with the actual count removed so the
        // Bottles in My Archive stat sums correctly.
        await updateCellarWine(wine.id, {
          quantity: count,
          archived_at: removedAt,
        });
      } else {
        // Decrement the live row and clone an archived row carrying the
        // selected bottles so the user can edit/note them later.
        await updateCellarWine(wine.id, { quantity: wine.quantity - count });
        const { id, created_at, updated_at, ...rest } = wine;
        await addCellarWine({
          ...rest,
          quantity: count,
          archived_at: removedAt,
          is_wishlist: false,
        });
      }

      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wine.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });

      setArchivedSuccess({ count, recName: selecting.recName });
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setArchiving(false);
    }
  }

  if (requerying) {
    return (
      <SearchProgress
        title="Searching your cellar…"
        subtitle="Vinster needs up to a minute for your result"
        body="Our sommelier is searching your cellar for the ideal match"
        durationMs={60000}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity onPress={handleBack} style={styles.backRow}>
        <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      <View ref={shareRef} collapsable={false} style={styles.shareArea}>
        {(stampDate || stampLocation) && (
          <View style={styles.stampRow}>
            {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
            {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
          </View>
        )}

        <View style={styles.header}>
          <Text style={styles.headerLine}>Your Brief</Text>
          <Text style={styles.dish}>{titleCase(dish)}</Text>
          {mode === 'general' && wines.length > 0 && (
            <TouchableOpacity onPress={handleShowCellarOptions} activeOpacity={0.7}>
              <Text style={styles.cellarPromptLink}>Show me all of the wines from my cellar that could work</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{mode === 'cellar' ? 'From Your Cellar' : 'Style Recommendations'}</Text>
          {mode === 'cellar' && cellarResult && (
            <CellarResults recommendations={cellarResult} wines={wines} onSelect={openSelect} />
          )}
          {mode === 'general' && generalResult && (
            <GeneralResults results={generalResult} summary={generalSummary} currency={userCurrency} />
          )}
        </View>

        <Text style={styles.shareFooter}>Paired with Vinster</Text>
      </View>

      <TouchableOpacity style={styles.shareButton} onPress={handleSharePage} disabled={sharing} activeOpacity={0.85}>
        <Text style={styles.shareButtonText}>{sharing ? 'Preparing…' : 'Share this pairing'}</Text>
      </TouchableOpacity>


      <Modal visible={selecting !== null} transparent animationType="fade" onRequestClose={closeSelect}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selecting && archivedSuccess ? (
              <>
                <Text style={styles.successTick}>✓</Text>
                <Text style={styles.modalTitle}>This wine has been archived</Text>
                <Text style={styles.successCount}>
                  {archivedSuccess.count} {archivedSuccess.count === 1 ? 'bottle' : 'bottles'}
                </Text>
                <Text style={styles.modalBody}>
                  Your cellar and archive have been updated. You can edit this wine and add notes later from the archive.
                </Text>
                <TouchableOpacity style={styles.archiveBtn} onPress={closeSelect} activeOpacity={0.8}>
                  <Text style={styles.archiveBtnText}>Back to wine results</Text>
                </TouchableOpacity>
              </>
            ) : selecting ? (
              <>
                <Text style={styles.modalTitle}>{selecting.recName}</Text>
                <Text style={styles.modalBody}>
                  Archive this wine — you can edit it and add notes later.
                </Text>

                <Text style={styles.fieldLabel}>How many bottles?</Text>
                <TextInput
                  style={styles.input}
                  value={bottleCount}
                  onChangeText={setBottleCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  maxLength={3}
                />
                <Text style={styles.fieldHint}>
                  {selecting.wine.quantity} in cellar
                </Text>

                <TouchableOpacity
                  style={[styles.archiveBtn, archiving && styles.btnDisabled]}
                  onPress={handleArchiveWine}
                  disabled={archiving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.archiveBtnText}>{archiving ? 'Archiving…' : 'Archive Wine'}</Text>
                </TouchableOpacity>

                {/* "Back to wine results" used to sit above this — it
                    fired the same closeSelect handler, so the two prompts
                    were duplicates. Removed the upper one; the underlined
                    Cancel selection now does the same job at the size
                    "Back to wine results" used to use. */}
                <TouchableOpacity onPress={closeSelect} style={styles.cancelLink}>
                  <Text style={styles.cancelLinkText}>Cancel selection</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Opaque wrapper so the captured PNG has the page's background (not
  // transparent) and includes the full results, not just the visible part.
  shareArea: { backgroundColor: colors.background },
  shareFooter: { fontFamily: fonts.headingItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  shareButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  shareButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  backLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  stampRow: { alignItems: 'center', gap: 2, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  stampDate: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.textMuted, letterSpacing: 1, textTransform: 'uppercase' },
  // The dish text is the user's free-form brief — promote it from a
  // 15pt subline to the visual headline of the page (was previously
  // dominated by "Your Pairing" at 20pt bold). Now reads as a proper
  // headline so the user can quickly see what they asked for.
  dish: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.gold, marginTop: spacing.xs, lineHeight: 28 },
  cellarPromptLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textDecorationLine: 'underline', marginTop: spacing.md },
  successTick: { fontFamily: fonts.headingBold, fontSize: 56, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  successCount: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gold, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.sm },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.md },
  summary: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  cardWine: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.text },
  cardSubtitle: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: 2 },
  cardBody: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  cardSection: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  cardItem: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 20, marginBottom: 4 },
  bandRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: 6 },
  bandSymbol: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.gold, minWidth: 40, letterSpacing: 1 },
  bandRegion: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, lineHeight: 20 },
  cardLink: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, marginTop: spacing.sm },
  cardLinkMuted: { color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface },
  fieldHint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, textAlign: 'right' },
  archiveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  archiveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  btnDisabled: { opacity: 0.6 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text },
  cancelLink: { alignItems: 'center', paddingVertical: spacing.md },
  cancelLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
