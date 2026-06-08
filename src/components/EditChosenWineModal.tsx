import { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { patchChosenWine } from '../api/chosenWines';
import { addCellarWine } from '../api/cellar';
import { getWineIntelligence } from '../api/label';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { formatCurrency } from '../constants/currency';
import { showAlert } from './AppAlert';
import { MicButton, appendDictation } from './MicButton';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved }: Props) {
  const { update, remove } = useChosenWines();
  const { session } = useAuth();
  const qc = useQueryClient();

  const [userScore, setUserScore] = useState<number | null>(null);
  const [tastingNote, setTastingNote] = useState('');      // Your Review
  const [personalNotes, setPersonalNotes] = useState('');  // Personal Notes (other_observations)
  const [purchasePrice, setPurchasePrice] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [estimatedValueAt, setEstimatedValueAt] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [vinsterNotesOpen, setVinsterNotesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [removeWishlistOpen, setRemoveWishlistOpen] = useState(false);
  const shareCardRef = useRef<View>(null);

  const currency = (wine?.currency ?? 'GBP').toUpperCase();

  useEffect(() => {
    if (visible && wine) {
      setUserScore(wine.user_score ?? null);
      setTastingNote(wine.tasting_note ?? '');
      setPersonalNotes(wine.other_observations ?? '');
      setPurchasePrice(wine.purchase_price != null ? String(wine.purchase_price) : '');
      setEstimatedValue(wine.estimated_value ?? null);
      setEstimatedValueAt(wine.estimated_value_at ?? null);
      setWishlist(!!wine.wishlist);
      setVinsterNotesOpen(false);
      setRemoveWishlistOpen(false);
      // Auto-fill the estimated value once (no "Generate" button) — mirrors
      // the cellar flow where every wine carries an estimate. Only fires
      // when we don't already have one.
      if (wine.estimated_value == null) void fetchEstimate(wine, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, wine?.id]);

  async function fetchEstimate(w: ChosenWine, announce: boolean) {
    if (estimating) return;
    setEstimating(true);
    try {
      const intel = await getWineIntelligence({
        producer: w.producer ?? '',
        region: w.region ?? '',
        wineName: w.wine_name || null,
        vintage: w.vintage != null ? String(w.vintage) : 'NV',
        style: null,
      } as any, currency);
      const at = new Date().toISOString();
      setEstimatedValue(intel.estimatedValue ?? null);
      setEstimatedValueAt(at);
      await patchChosenWine(w.id, {
        estimated_value: intel.estimatedValue ?? null,
        estimated_value_currency: currency,
        estimated_value_at: intel.estimatedValue != null ? at : null,
      });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
    } catch (err) {
      if (announce) showAlert({ title: 'Could not estimate', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setEstimating(false);
    }
  }

  async function persist() {
    if (!wine) return;
    const parsed = purchasePrice.trim() ? parseFloat(purchasePrice.trim()) : NaN;
    const validPrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    await update.mutateAsync({
      id: wine.id,
      input: {
        // Where/when fields aren't edited on this card any more — pass the
        // wine's existing values straight through so they're preserved.
        restaurantName: wine.restaurant_name ?? '',
        city: wine.city ?? '',
        tastingNote,
        otherObservations: personalNotes,
        userScore,
        listPrice: wine.menu_price,
        isFavourite: wine.is_favourite,
        purchasePrice: validPrice,
        purchasePriceCurrency: validPrice != null ? currency : null,
        wishlist,
        producer: wine.producer,
        wineName: wine.wine_name,
        vintage: wine.vintage,
      },
    });
  }

  async function handleSave() {
    if (!wine) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  // ---- Wish list ----------------------------------------------------------
  async function setWishlistFlag(next: boolean) {
    if (!wine) return;
    setWishlist(next);
    try {
      await patchChosenWine(wine.id, { wishlist: next });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
    } catch (err) {
      setWishlist(!next);
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function handleWishlistButton() {
    if (!wine) return;
    if (!wishlist) {
      void setWishlistFlag(true);
    } else {
      setRemoveWishlistOpen(true);
    }
  }

  async function handleAddToCellar() {
    if (!wine || !session?.user.id) return;
    setRemoveWishlistOpen(false);
    try {
      const parsed = purchasePrice.trim() ? parseFloat(purchasePrice.trim()) : NaN;
      const validPrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
      // Construct a cellar bottle from the review. Cast to satisfy the strict
      // Omit<CellarWine> shape — the DB fills defaults for unspecified columns.
      await addCellarWine({
        user_id: session.user.id,
        wine_name: wine.wine_name,
        producer: wine.producer,
        region: wine.region,
        vintage: wine.vintage != null ? String(wine.vintage) : null,
        quantity: 1,
        date_received: new Date().toISOString().split('T')[0],
        critic_score: wine.critic_score,
        grape_variety: wine.grape ?? null,
        tasting_notes: wine.rationale ?? null,
        user_notes: personalNotes.trim() || null,
        purchase_price: validPrice,
        purchase_price_currency: validPrice != null ? currency : null,
        estimated_value: estimatedValue,
        estimated_value_currency: estimatedValue != null ? currency : null,
        estimated_value_at: estimatedValueAt,
        is_wishlist: false,
      } as any);
      await setWishlistFlag(false);
      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      showAlert({ title: 'Added to your cellar', body: `${wine.wine_name} is now in your cellar.` });
    } catch (err) {
      showAlert({ title: 'Could not add to cellar', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // ---- Sharing ------------------------------------------------------------
  async function handleShareToCommunity() {
    if (!wine || posting) return;
    if (!session?.user.id) { showAlert({ title: 'Sign in required', body: 'You need an account to share to the community.' }); return; }
    Keyboard.dismiss();
    setPosting(true);
    try {
      await persist();
      const title = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' · ').trim() || wine.wine_name || 'Wine review';
      await publishCommunityReview(
        {
          category: 'wine', source_table: 'chosen_wines', source_id: wine.id,
          title, subtitle: wine.region || null, rating: userScore,
          body: tastingNote.trim() || personalNotes.trim() || null,
          metadata: { producer: wine.producer ?? null, region: wine.region ?? null, vintage: wine.vintage ?? null, critic_score: wine.critic_score ?? null },
        },
        (session.user.email ?? '').split('@')[0] || null,
      );
      showAlert({ title: 'Shared to community', body: 'Your wine review now appears in the Vinster community feed.' });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const already = detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('unique');
      showAlert({ title: already ? 'Already shared' : 'Could not share', body: already ? "You've already shared this review." : detail });
    } finally {
      setPosting(false);
    }
  }

  async function handleShare() {
    if (!wine || sharing) return;
    Keyboard.dismiss();
    setSharing(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my wine review', UTI: 'public.png' });
        return;
      }
      const header = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
      const scoreText = userScore != null ? `\nMy score: ${userScore}/100` : '';
      const noteFormatted = tastingNote.trim() ? `\n\n"${tastingNote.trim()}"` : '';
      await Share.share({ message: `${header}${scoreText}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`, title: header });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  function handleDelete() {
    if (!wine) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    showAlert({
      title: 'Delete review?',
      body: `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete review', style: 'destructive', onPress: () => {
            remove.mutate(wine.id, {
              onSuccess: () => { onSaved(); onClose(); },
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          } },
      ],
    });
  }

  if (!wine) return null;

  // Header mirrors the cellar card: producer · wine name · vintage, then
  // region, then grape.
  const headerLine = (() => {
    const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
    const parts = sameName ? [wine.producer, wine.vintage] : [wine.producer, wine.wine_name, wine.vintage];
    return parts.filter(Boolean).join(' · ');
  })();
  const drinkingRange = wine.drinking_window?.from && wine.drinking_window?.to ? `${wine.drinking_window.from}–${wine.drinking_window.to}` : null;
  const drinkingStatus = wine.drinking_window?.status ?? null;
  const hasVinsterNotes = wine.critic_score != null || !!wine.rationale || !!wine.vintage_assessment || !!wine.drinking_window || !!wine.rarity_assessment;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            {/* Header — same shape as the cellar wine card. No favourite star. */}
            <View style={styles.header}>
              <Text style={styles.headerLine}>{headerLine}</Text>
              {wine.region ? <Text style={styles.region}>{wine.region}</Text> : null}
              {wine.grape ? <Text style={styles.grape}>{wine.grape}</Text> : null}
            </View>

            <View style={styles.divider} />

            {/* Score | Drinking Window */}
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Your Score</Text>
                <TextInput
                  style={styles.statInput}
                  value={userScore != null ? String(userScore) : ''}
                  onChangeText={(t) => {
                    if (t === '') { setUserScore(null); return; }
                    const n = parseInt(t, 10);
                    if (!isNaN(n)) setUserScore(Math.min(100, Math.max(1, n)));
                  }}
                  keyboardType="number-pad"
                  placeholder="e.g. 92"
                  placeholderTextColor={colors.textMuted}
                  maxLength={3}
                />
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Drinking Window</Text>
                {drinkingStatus ? (
                  <>
                    <Text style={styles.statValue}>{drinkingStatus}</Text>
                    {drinkingRange ? <Text style={styles.statSub}>{drinkingRange}</Text> : null}
                  </>
                ) : (
                  <Text style={[styles.statValue, styles.statMuted]}>—</Text>
                )}
              </View>
            </View>

            {/* Purchase Price | Estimated Value */}
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Purchase Price</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.priceCurrency}>{formatCurrency(0, currency, { decimals: 0 }).replace(/[\d.,\s]/g, '') || currency}</Text>
                  <TextInput
                    style={styles.priceInput}
                    value={purchasePrice}
                    onChangeText={(t) => setPurchasePrice(t.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Estimated Value</Text>
                {estimating ? (
                  <Text style={[styles.statValue, styles.statMuted]}>Estimating…</Text>
                ) : estimatedValue != null ? (
                  <>
                    <TouchableOpacity onPress={() => fetchEstimate(wine, true)} activeOpacity={0.7}>
                      <Text style={[styles.statValue, styles.estimatedValueGold]}>
                        {formatCurrency(estimatedValue, currency, { decimals: 0 })}
                        <Text style={styles.estimateUpdateLink}> (update)</Text>
                      </Text>
                    </TouchableOpacity>
                    {estimatedValueAt ? (
                      <Text style={styles.statSub}>{new Date(estimatedValueAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    ) : null}
                  </>
                ) : (
                  <TouchableOpacity onPress={() => fetchEstimate(wine, true)} activeOpacity={0.7}>
                    <Text style={styles.estimateUpdateLink}>(estimate)</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Your Review */}
            <View style={styles.dictateRow}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <MicButton onResult={(t) => setTastingNote((prev) => appendDictation(prev, t))} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={tastingNote}
              onChangeText={setTastingNote}
              placeholder="What you thought of the wine — taste, occasion, anything worth sharing."
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />

            <View style={styles.shareRow}>
              <TouchableOpacity style={[styles.shareBtn, posting && styles.btnDisabled]} onPress={handleShareToCommunity} disabled={posting} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>{posting ? 'Sharing…' : 'Share to Community'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareBtn, sharing && styles.btnDisabled]} onPress={handleShare} disabled={sharing} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>{sharing ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
            </View>

            {/* Personal Notes — no divider above (per spec). */}
            <View style={styles.dictateRow}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              <MicButton onResult={(t) => setPersonalNotes((prev) => appendDictation(prev, t))} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={personalNotes}
              onChangeText={setPersonalNotes}
              placeholder="Add a personal note about this wine…"
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={3} textAlignVertical="top"
            />

            {/* Vinster's Review — mirrors the cellar card's collapsible note. */}
            {hasVinsterNotes ? (
              <View style={styles.vinsterWrap}>
                <View style={styles.vinsterHeader}>
                  <TouchableOpacity onPress={() => setVinsterNotesOpen((v) => !v)} activeOpacity={0.7} style={styles.vinsterToggle}>
                    <Text style={styles.vinsterToggleText}>Vinster's Review {vinsterNotesOpen ? '▴' : '▾'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => showAlert({ title: "Vinster's Review", body: "Vinster's notes aren't lifted from any single review — hundreds of sources are sifted, distilled, and curated into one clear insight." })} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                    <Text style={styles.whatsThisLink}>(what's this)</Text>
                  </TouchableOpacity>
                </View>
                {vinsterNotesOpen ? (
                  <View style={styles.vinsterBlock}>
                    {wine.critic_score != null ? (
                      <Text style={styles.vinsterFieldBody}><Text style={styles.vinsterLabel}>Critic Score · </Text>{wine.critic_score} pts</Text>
                    ) : null}
                    {wine.vintage_assessment ? (
                      <Text style={styles.vinsterFieldBody}><Text style={styles.vinsterLabel}>Vintage · </Text>{wine.vintage_assessment.label}. {wine.vintage_assessment.notes}</Text>
                    ) : null}
                    {wine.rarity_assessment ? (
                      <Text style={styles.vinsterFieldBody}><Text style={styles.vinsterLabel}>Rarity · </Text>{wine.rarity_assessment.label}. {wine.rarity_assessment.notes}</Text>
                    ) : null}
                    {wine.rationale ? (
                      <Text style={styles.vinsterFieldBody}><Text style={styles.vinsterLabel}>Sommelier's Note · </Text>{wine.rationale}</Text>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Add to / In Wish List */}
            <TouchableOpacity style={styles.wishlistBtn} onPress={handleWishlistButton} activeOpacity={0.8}>
              <Text style={styles.wishlistBtnText}>{wishlist ? 'In Your Wish List — Remove' : 'Add to Wish List'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || update.isPending}>
              <Text style={styles.saveButtonText}>{saving || update.isPending ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={remove.isPending}>
              <Text style={styles.deleteText}>{remove.isPending ? 'Deleting…' : 'Delete this review'}</Text>
            </TouchableOpacity>

          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Remove-from-wishlist choice */}
      <Modal visible={removeWishlistOpen} transparent animationType="fade" onRequestClose={() => setRemoveWishlistOpen(false)}>
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={() => setRemoveWishlistOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Remove from Wish List</Text>
            <Text style={styles.confirmBody}>Have you bought this wine, or are you just removing it from your wish list?</Text>
            <TouchableOpacity style={styles.confirmButton} onPress={handleAddToCellar}>
              <Text style={styles.confirmButtonText}>Add to Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={() => { setRemoveWishlistOpen(false); void setWishlistFlag(false); }}>
              <Text style={styles.confirmButtonText}>Remove from Wish List, Keep the Review</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setRemoveWishlistOpen(false)}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {sharing && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard
            ref={shareCardRef}
            producer={wine.producer}
            wineName={wine.wine_name}
            vintage={wine.vintage}
            region={wine.region}
            userScore={userScore}
            criticScore={wine.critic_score}
            tastingNote={tastingNote}
            otherObservations={personalNotes || null}
            date={wine.chosen_at ? new Date(wine.chosen_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
            location={wine.restaurant_name ?? null}
            isFavourite={wine.is_favourite}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 56, paddingBottom: 60 },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginBottom: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.sm },
  headerLine: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  region: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  grape: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  statCell: { width: '50%', paddingVertical: spacing.sm, paddingRight: spacing.sm },
  statLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  statValue: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, lineHeight: 20 },
  statMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  statSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  estimatedValueGold: { color: colors.gold },
  estimateUpdateLink: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  statInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, backgroundColor: colors.surface },
  priceCurrency: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted, marginRight: 4 },
  priceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.xs },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  // Section title + dictation mic on one line.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  personalNotesHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm, marginTop: -spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  noteInput: { minHeight: 90 },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shareBtn: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  shareBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  btnDisabled: { opacity: 0.5 },
  vinsterWrap: { marginBottom: spacing.md },
  vinsterHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  vinsterToggle: { paddingVertical: 6 },
  vinsterToggleText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2 },
  whatsThisLink: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  vinsterBlock: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, gap: spacing.sm, backgroundColor: 'rgba(212,176,96,0.06)' },
  vinsterLabel: { fontFamily: fonts.bodyBold, color: colors.gold },
  vinsterFieldBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 21 },
  wishlistBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  wishlistBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  deleteText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  confirmBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  confirmButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.xs },
  confirmCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
