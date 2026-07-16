import { useState, useEffect, useRef } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share, Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { uploadLabelImage } from '../api/labelPhotos';
import { LabelThumb } from './LabelThumb';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { patchChosenWine, clearChosenReview } from '../api/chosenWines';
import { addCellarWine } from '../api/cellar';
import { generateWineIntel } from '../services/pricing';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { formatCurrency } from '../constants/currency';
import { showAlert } from './AppAlert';
import { useLabelStore } from '../stores/labelStore';
import { WineReviewFields } from './WineReviewFields';
import { splitLocationString, clearReviewOnCellar } from '../services/reviewSync';
import { isoToYmd, ymdToIso } from '../utils/reviewDate';
import { captureCity } from '../utils/captureCity';
import { normaliseCity } from '../utils/city';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Open straight onto the "Edit wine" identity sheet (producer/name/style/…)
  // rather than the review view. Used by the "Edit Wine" menu action.
  initialIdentityEdit?: boolean;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved, initialIdentityEdit = false }: Props) {
  const { update, remove } = useChosenWines();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { setWineDetails } = useLabelStore();

  const [userScore, setUserScore] = useState<number | null>(null);
  const [tastingNote, setTastingNote] = useState('');      // Your Review
  const [personalNotes, setPersonalNotes] = useState('');  // Personal Notes (other_observations)
  const [purchasePrice, setPurchasePrice] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [estimatedValueAt, setEstimatedValueAt] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [wishlist, setWishlist] = useState(false);
  const [vinsterNotesOpen, setVinsterNotesOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const [removeWishlistOpen, setRemoveWishlistOpen] = useState(false);
  // Edit-identity sheet (name / vintage / region + thumbnail).
  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRestaurant, setEditRestaurant] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const shareCardRef = useRef<View>(null);

  const currency = (wine?.currency ?? 'GBP').toUpperCase();

  useEffect(() => {
    if (visible && wine) {
      setUserScore(wine.user_score ?? null);
      setTastingNote(wine.tasting_note ?? '');
      setPersonalNotes(wine.other_observations ?? '');
      setPurchasePrice(wine.purchase_price != null ? String(wine.purchase_price) : '');
      setLocCity(wine.city ?? '');
      setLocName(wine.restaurant_name ?? '');
      // Prefill the city from GPS when the review has none yet.
      if (!wine.city) captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
      setDrinkingWindow(wine.user_drinking_window ?? '');
      setEstimatedValue(wine.estimated_value ?? null);
      setEstimatedValueAt(wine.estimated_value_at ?? null);
      setWishlist(!!wine.wishlist);
      setVinsterNotesOpen(false);
      setRemoveWishlistOpen(false);
      // "Edit Wine" entry point opens straight onto the identity sheet.
      if (initialIdentityEdit) openIdentityEdit();
      else setIdentityEditOpen(false);
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
      const intel = await generateWineIntel({
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
        // generateWineIntel is Wine-Searcher-first, so intel.criticScore is the
        // real WS aggregated score when WS has one. Persist it too — otherwise
        // the review's critic score stays null even though we just fetched a
        // real one. Only overwrite when we actually got a score.
        ...(intel.criticScore != null
          ? { critic_score: intel.criticScore, critic_score_note: intel.criticScoreNote ?? null }
          : {}),
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
        restaurantName: locName.trim(),
        city: locCity.trim(),
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
    // user_drinking_window isn't part of the structured update input.
    await patchChosenWine(wine.id, { user_drinking_window: drinkingWindow.trim() || null });
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

  // Walk the wine through the full Add to Cellar flow (Wine Intel card →
  // Add to Cellar form) without re-scanning — we already know the bottle
  // from the review, so pre-fill the label store and drop the user on the
  // Confirm screen, which flows straight to the Wine Intel card.
  function handleAddToCellarFlow() {
    if (!wine) return;
    setWineDetails({
      producer: wine.producer,
      region: wine.region,
      wineName: wine.wine_name,
      vintage: wine.vintage != null ? String(wine.vintage) : null,
      style: null,
      bottleSizeMl: null,
    });
    onClose();
    router.push('/label/confirm');
  }

  // Open the Vinster Wine Knowledge (Dive Deeper) page for this reviewed wine.
  // The review may not be in the cellar, so pass the wine fields as params —
  // the Wine Knowledge screen falls back to them when there's no cellar row.
  function handleDiveDeeper() {
    if (!wine) return;
    onClose();
    router.push({
      pathname: '/cellar/wine-knowledge/[wineId]',
      params: {
        wineId: wine.id,
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        wineName: wine.wine_name ?? '',
        vintage: wine.vintage != null ? String(wine.vintage) : '',
        grape: wine.grape ?? '',
      },
    } as any);
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
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
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
    // A restaurant bottle pick (linked to a scan session) should return to
    // "awaiting review" — clear the review content but keep the pick. A
    // standalone review has no such home, so it's removed outright.
    const isBottlePick = !!wine.scan_session_id;
    showAlert({
      title: 'Delete review?',
      body: isBottlePick
        ? `${label}\n\nThis clears your review — the bottle stays in Your Restaurants, awaiting your review.`
        : `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete review', style: 'destructive', onPress: () => { void doDelete(isBottlePick); } },
      ],
    });
  }

  async function doDelete(isBottlePick: boolean) {
    if (!wine) return;
    try {
      if (isBottlePick) {
        await clearChosenReview(wine.id);
      } else {
        await remove.mutateAsync(wine.id);
      }
      // Also clear the same review off the matching cellar wine card (the
      // review is shared between the two surfaces).
      if (session?.user.id) {
        try {
          await clearReviewOnCellar(session.user.id, { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage });
          qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        } catch { /* non-fatal */ }
      }
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
      onSaved(); onClose();
    } catch (err) {
      showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Edit the wine's identity (name / vintage / region) and its label photo.
  function openIdentityEdit() {
    if (!wine) return;
    setEditProducer(wine.producer ?? '');
    setEditName(wine.wine_name ?? '');
    setEditVintage(wine.vintage != null ? String(wine.vintage) : '');
    setEditRegion(wine.region ?? '');
    setEditStyle(wine.style ?? '');
    setEditDate(isoToYmd(wine.chosen_at));
    setEditRestaurant(wine.restaurant_name ?? '');
    setEditCity(wine.city ?? '');
    setEditImageUri(null);
    setIdentityEditOpen(true);
  }

  async function pickIdentityPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditImageUri(res.assets[0].uri);
  }

  async function saveIdentity() {
    if (!wine || !session?.user.id) return;
    if (!editName.trim()) { showAlert({ title: 'Wine name needed', body: 'Add at least the wine name.' }); return; }
    setSavingIdentity(true);
    try {
      const vt = editVintage.trim();
      // Non-numeric (e.g. "NV") → null, which renders as "NV" across the app.
      const vintageNum = vt && Number.isFinite(Number(vt)) ? Math.trunc(Number(vt)) : null;
      // Only write chosen_at when the date was actually changed, so an
      // unrelated edit doesn't normalise its time of day to noon.
      const chosenIso = editDate !== isoToYmd(wine.chosen_at) ? ymdToIso(editDate) : null;
      let labelPath: string | undefined;
      if (editImageUri) labelPath = await uploadLabelImage(session.user.id, editImageUri, wine.id);
      await patchChosenWine(wine.id, {
        producer: editProducer.trim() || null,
        wine_name: editName.trim(),
        region: editRegion.trim() || null,
        style: editStyle.trim() || null,
        vintage: vintageNum,
        restaurant_name: editRestaurant.trim() || null,
        city: editCity.trim() || null,
        ...(chosenIso ? { chosen_at: chosenIso } : {}),
        ...(labelPath ? { label_image_path: labelPath } : {}),
      });
      // Keep the (hidden) location state in step so a later "Save Review"
      // writes the edited restaurant/city, not the pre-edit values.
      setLocName(editRestaurant.trim());
      setLocCity(editCity.trim());
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      setIdentityEditOpen(false);
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingIdentity(false);
    }
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

            {/* Top row: back (left) · Share (right) — Share matches the rest of
                the app, sharing the same wine card as everywhere else. */}
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 8, bottom: 6, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Text style={[styles.topShareText, sharing && styles.btnDisabled]}>{sharing ? 'Preparing…' : 'Share'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openIdentityEdit} hitSlop={{ top: 6, bottom: 8, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Text style={styles.topEditText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Header — mirrors the cellar wine card: label thumbnail on the
                left (when the wine has a scanned/uploaded photo) with the
                identity beside it. No favourite star. */}
            <View style={[styles.header, wine.label_image_path ? styles.headerWithThumb : null]}>
              {wine.label_image_path ? (
                <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.headerThumb} radius={5} frame={0} />
              ) : null}
              <View style={wine.label_image_path ? styles.headerTextCol : undefined}>
                <Text style={[styles.headerLine, wine.label_image_path ? styles.headerLineLeft : null]}>{headerLine}</Text>
                {(wine.region || wine.grape) ? (
                  <Text style={[styles.region, wine.label_image_path ? styles.regionLeft : null]}>{[wine.region, wine.grape].filter(Boolean).join(' · ')}</Text>
                ) : null}
                {/* Date · where you drank it — a clean header stamp (kept out of
                    the free-text notes below). */}
                {(() => {
                  const loc = [wine.restaurant_name, normaliseCity(wine.city)].filter(Boolean).join(', ');
                  const dateStr = wine.chosen_at
                    ? new Date(wine.chosen_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '';
                  const stamp = [dateStr, loc].filter(Boolean).join(' · ');
                  return stamp ? <Text style={[styles.stampLine, wine.label_image_path ? styles.stampLineLeft : null]}>{stamp}</Text> : null;
                })()}
              </View>
            </View>

            <View style={styles.divider} />

            {/* Vinster's Review — collapsed reference, above the input. */}
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
                    {/* Learn more — sits at the foot of Vinster's Review note. */}
                    <TouchableOpacity onPress={handleDiveDeeper} activeOpacity={0.7} style={styles.diveDeeperLink}>
                      <Text style={styles.diveDeeperLinkText}>Dive Deeper into this wine</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            <WineReviewFields
              score={userScore}
              onScore={setUserScore}
              pricePaid={purchasePrice}
              onPricePaid={setPurchasePrice}
              currency={currency}
              estimatedValue={estimatedValue}
              estimatedValueAt={estimatedValueAt}
              estimating={estimating}
              onEstimate={() => fetchEstimate(wine, true)}
              review={tastingNote}
              onReview={setTastingNote}
              personalNotes={personalNotes}
              onPersonalNotes={setPersonalNotes}
              city={locCity}
              onCity={setLocCity}
              locationName={locName}
              onLocationName={setLocName}
              showLocation={false}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={setDrinkingWindow}
              wishlistActive={wishlist}
              onWishlist={handleWishlistButton}
              onAddToCellar={handleAddToCellarFlow}
              saving={saving || update.isPending}
              onSave={handleSave}
              saveLabel="Save Review"
              goldSave
              onDelete={handleDelete}
              deleteLabel={remove.isPending ? 'Deleting…' : 'Delete this review'}
            />

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

      {/* Edit the wine's identity + label photo */}
      <Modal visible={identityEditOpen} transparent animationType="fade" onRequestClose={() => setIdentityEditOpen(false)}>
        <View style={styles.confirmOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.editScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.editSheet}>
              <Text style={styles.confirmTitle}>Edit wine</Text>

              <Text style={styles.editLabel}>Producer</Text>
              <TextInput style={styles.editInput} value={editProducer} onChangeText={setEditProducer} placeholder="Producer" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Wine name</Text>
              <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder="Wine name" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Vintage</Text>
              <TextInput style={styles.editInput} value={editVintage} onChangeText={(t) => setEditVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textSubtle} autoCapitalize="characters" maxLength={7} />

              <Text style={styles.editLabel}>Region</Text>
              <TextInput style={styles.editInput} value={editRegion} onChangeText={setEditRegion} placeholder="Region" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Style</Text>
              <TextInput style={styles.editInput} value={editStyle} onChangeText={setEditStyle} placeholder="e.g. Red, White, Rosé, Sparkling" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Restaurant / place</Text>
              <TextInput style={styles.editInput} value={editRestaurant} onChangeText={setEditRestaurant} placeholder="Where you drank it" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>City</Text>
              <TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} placeholder="City" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Date</Text>
              <TextInput style={styles.editInput} value={editDate} onChangeText={(t) => setEditDate(t.replace(/[^0-9-]/g, '').slice(0, 10))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSubtle} keyboardType="numbers-and-punctuation" maxLength={10} />

              <Text style={styles.editLabel}>Photo</Text>
              <View style={styles.editThumbRow}>
                {editImageUri ? (
                  <Image source={{ uri: editImageUri }} style={styles.editThumb} />
                ) : (
                  <LabelThumb path={wine.label_image_path ?? null} fallbackText={wine.wine_name} style={styles.editThumb} radius={6} frame={0} />
                )}
                <View style={styles.editPhotoBtns}>
                  <TouchableOpacity style={styles.editPhotoBtn} onPress={() => pickIdentityPhoto('camera')}>
                    <Text style={styles.editPhotoBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editPhotoBtn} onPress={() => pickIdentityPhoto('library')}>
                    <Text style={styles.editPhotoBtnText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={[styles.confirmButton, savingIdentity && styles.btnDisabled]} onPress={saveIdentity} disabled={savingIdentity}>
                <Text style={styles.confirmButtonText}>{savingIdentity ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setIdentityEditOpen(false)} disabled={savingIdentity}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
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
  // Gold text link below the buttons (Dive Deeper → Wine Knowledge).
  diveDeeperLink: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  diveDeeperLinkText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topShareText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  header: { alignItems: 'center', marginBottom: spacing.sm },
  // With a label photo the header becomes a row: thumbnail left, text right.
  headerWithThumb: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerThumb: { width: 52, height: 68 },
  headerTextCol: { flex: 1 },
  headerLineLeft: { textAlign: 'left' },
  regionLeft: { textAlign: 'left' },
  stampLineLeft: { textAlign: 'left' },
  headerLine: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  region: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: 2 },
  // Date · location stamp beneath region/grape — the "where & when" of the review.
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 5, letterSpacing: 0.3 },
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
  topRight: { alignItems: 'flex-end', gap: 2 },
  topEditText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  editScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  editSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  editLabel: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.sm },
  editInput: { backgroundColor: colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  editThumbRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  editThumb: { width: 72, height: 96 },
  editPhotoBtns: { flex: 1, gap: spacing.sm },
  editPhotoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  editPhotoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
});
