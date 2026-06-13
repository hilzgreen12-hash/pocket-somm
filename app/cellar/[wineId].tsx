import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Keyboard, ActivityIndicator, Share } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { showAlert } from '../../src/components/AppAlert';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useCellar, useArchive, useWishList } from '../../src/hooks/useCellar';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { useAuth } from '../../src/hooks/useAuth';
import { useRacks } from '../../src/hooks/useRacks';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { generatePairings, getWineIntelligence } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine } from '../../src/api/racks';
import { addCellarWine, addCellarWineRemoval, listCellarWineRemovals } from '../../src/api/cellar';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../../src/services/reviewSync';
import { publishCommunityReview } from '../../src/api/community';
import { supabase } from '../../src/api/supabase';
import * as ImagePicker from 'expo-image-picker';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { LabelThumb } from '../../src/components/LabelThumb';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { MicButton } from '../../src/components/MicButton';
import { SearchProgress } from '../../src/components/SearchProgress';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { formatCurrency } from '../../src/constants/currency';
import type { WineDetailsComplete, CellarWine } from '../../src/types/wine';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

const STATUS_COLORS: Record<string, string> = {
  too_young: colors.warning,
  approaching: colors.gold,
  peak: colors.gold,
  declining: colors.error,
  unknown: colors.textMuted,
};

const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching Peak',
  peak: 'Peak Now',
  declining: 'Declining',
  unknown: 'Unknown',
};

// Read-only summary row on the wine card. Bottle count and date only —
// the note-editing affordance lives in the archive folder so this card
// stays focused on the live cellar view.
function RemovalRow({ removal }: { removal: { id: string; removed_at: string; count: number; note: string | null } }) {
  const dateLabel = new Date(removal.removed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <View style={styles.removalRow}>
      <View style={styles.removalHeader}>
        <Text style={styles.removalCount}>{removal.count} {removal.count === 1 ? 'bottle' : 'bottles'}</Text>
        <Text style={styles.removalDate}>{dateLabel}</Text>
      </View>
      {removal.note ? <Text style={styles.removalNoteText}>{removal.note}</Text> : null}
    </View>
  );
}

export default function CellarWineDetail() {
  useKeepAwake();
  const { wineId, from } = useLocalSearchParams<{ wineId: string; from?: string }>();
  // When the user came in by tapping a slot on a rack grid, the
  // "In {rack name} →" affordance on the Bottles stat would just point
  // them back to where they came from — hide it in that case. The link
  // stays visible when entering via Full Cellar List, where it acts as a
  // legitimate shortcut to the rack.
  const cameFromRack = from === 'rack';
  // Coming in via Profile → Wine Reviews — the chef-pairing button on
  // this card is swapped for a Post Review to Community CTA so the user
  // can share what they just wrote with other Vinster users.
  const cameFromReviews = from === 'reviews';
  // Coming in from the Wish List screen — surfaces an Add to Cellar
  // affordance and hides cellar-only actions (Add bottles, Archive,
  // Removal History) that don't make sense for a wine the user
  // hasn't bought yet.
  const cameFromWishlist = from === 'wishlist';
  const { session } = useAuth();
  const { wines, updateWine, isLoading: cellarLoading } = useCellar();
  const { wines: wishlistWines, isLoading: wishlistLoading, deleteWine: deleteWishlistWine } = useWishList();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed, setPairings, setFilters, setError } = useLabelStore();
  const { setPendingWineId, setPendingAddMode } = useRackStore();
  const qc = useQueryClient();
  const { wines: archivedWines, isLoading: archiveLoading } = useArchive();
  // Unified lookup — the card now serves cellar, wishlist and archive
  // rows out of the same screen. Mode flags below drive the
  // affordance differences.
  const wine = wines.find((w) => w.id === wineId)
    ?? wishlistWines.find((w) => w.id === wineId)
    ?? archivedWines.find((w) => w.id === wineId);
  const isArchived = !!wine?.archived_at;
  const isWishlist = !!wine?.is_wishlist;

  const { data: removals = [] } = useQuery({
    queryKey: ['cellar-removals', wineId],
    queryFn: () => listCellarWineRemovals(wineId!),
    enabled: !!wineId,
  });

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });
  const wineSlot = slotAssignments.find((s) => s.cellar_wine_id === wineId);
  const wineRack = wineSlot ? racks.find((r) => r.id === wineSlot.rack_id) ?? null : null;

  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(wine?.user_notes ?? '');
  const [savingNote, setSavingNote] = useState(false);

  const [removeCount, setRemoveCount] = useState('1');
  const [removeDate, setRemoveDate] = useState(todayISO());
  const [removing, setRemoving] = useState(false);
  const [rackRemovalMsg, setRackRemovalMsg] = useState<string | null>(null);
  const [removeStep, setRemoveStep] = useState<'idle' | 'confirm' | 'success'>('idle');
  // True for the brief window between deletion and auto-navigation. Used to
  // suppress the "Wine not found" fallback (the cellar query has already
  // refetched without this wine) so the auto-dismissing success toast can
  // render on top of an otherwise-empty screen.
  const [justDeleted, setJustDeleted] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [addBottlesOpen, setAddBottlesOpen] = useState(false);
  const [addBottlesCount, setAddBottlesCount] = useState('1');
  const [addingBottles, setAddingBottles] = useState(false);

  const [findingPairings, setFindingPairings] = useState(false);
  const [postingReview, setPostingReview] = useState(false);
  const [reviewPosted, setReviewPosted] = useState(false);

  const [editingPrice, setEditingPrice] = useState(false);
  const [purchasePriceDraft, setPurchasePriceDraft] = useState(wine?.purchase_price != null ? String(wine.purchase_price) : '');
  const [savingPrice, setSavingPrice] = useState(false);
  const [refreshingValue, setRefreshingValue] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [titleEditOpen, setTitleEditOpen] = useState(false);
  const [producerDraft, setProducerDraft] = useState('');
  const [wineNameDraft, setWineNameDraft] = useState('');
  const [grapeDraft, setGrapeDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [reviewScoreDraft, setReviewScoreDraft] = useState(wine?.review_score != null ? String(wine.review_score) : '');
  const [reviewLocationDraft, setReviewLocationDraft] = useState(wine?.review_location ?? '');
  // "When did you drink it?" defaults to today if the wine hasn't been
  // reviewed yet — users adding a review immediately after drinking would
  // otherwise have to type the date out every time.
  const [reviewDateDraft, setReviewDateDraft] = useState(wine?.review_date ?? todayISO());
  // The user's WRITTEN review text — sharable to community + outside
  // the app. Distinct from Personal Notes (user_notes), which stays
  // private. Backed by the new review_note column (migration 043).
  const [reviewNoteDraft, setReviewNoteDraft] = useState(wine?.review_note ?? '');
  const [savingReview, setSavingReview] = useState(false);

  // Vinster's Note — collapsed by default now (was always visible).
  // The "(what's this)" link surfaces a short explanation modal so a
  // user encountering the field for the first time knows what it is.
  const [vinstersNoteOpen, setVinstersNoteOpen] = useState(false);
  const [whatsThisOpen, setWhatsThisOpen] = useState(false);

  // Off-screen share card for "Share outside the app" — captured to
  // PNG and handed to the native share sheet. Same pattern Wine
  // Reviews uses.
  const reviewShareRef = useRef<View>(null);
  const [sharingOutside, setSharingOutside] = useState(false);
  const [reviewSharePayload, setReviewSharePayload] = useState<React.ComponentProps<typeof WineReviewShareCard> | null>(null);

  // Add or replace this wine's framed label photo. Take a fresh photo or
  // pick one from the library, then upload + persist the path. Best-effort
  // with surfaced errors; this is how photo-less / manually-added wines get
  // their label thumbnail (the scan flow fills it automatically).
  async function handleAddPhoto() {
    if (!session?.user.id || !wine) return;
    const pick = async (fromCamera: boolean) => {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Permission needed', body: fromCamera ? 'Allow camera access to photograph your label.' : 'Allow photo access to choose a label.' });
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      setUploadingPhoto(true);
      try {
        const path = await uploadLabelImage(session.user.id, result.assets[0].uri, wine.id);
        await updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: path } });
        qc.invalidateQueries({ queryKey: ['cellar'] });
        qc.invalidateQueries({ queryKey: ['cellar-archive'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        // Bust the cached signed URL for this path so a replaced photo shows
        // immediately rather than the previous image (the path is reused per
        // wine id, so without this the cached URL/bitmap would persist).
        qc.invalidateQueries({ queryKey: ['label-url', path] });
      } catch (err) {
        showAlert({ title: 'Could not save photo', body: err instanceof Error ? err.message : 'Please try again.' });
      } finally {
        setUploadingPhoto(false);
      }
    };
    showAlert({
      title: wine.label_image_path ? 'Change label photo' : 'Add a label photo',
      body: 'Take a photo of the bottle label, or choose one from your library.',
      buttons: [
        { text: 'Take Photo', onPress: () => pick(true) },
        { text: 'Choose from Library', onPress: () => pick(false) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Long-press on the thumbnail → change or remove the label photo.
  function handlePhotoMenu() {
    showAlert({
      title: 'Label photo',
      body: 'Change or remove this label photo.',
      buttons: [
        { text: 'Change photo', onPress: () => void handleAddPhoto() },
        { text: 'Delete photo', style: 'destructive', onPress: () => void handleDeletePhoto() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function handleDeletePhoto() {
    if (!wine) return;
    try {
      await updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: null } });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
    } catch (err) {
      showAlert({ title: 'Could not remove photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Edit the wine's title identity — name + grape variety (not the date).
  function openTitleEdit() {
    if (!wine) return;
    setProducerDraft(wine.producer ?? '');
    setWineNameDraft(wine.wine_name ?? '');
    setGrapeDraft(wine.grape_variety ?? '');
    setTitleEditOpen(true);
  }

  async function handleSaveTitle() {
    if (!wine) return;
    Keyboard.dismiss();
    setSavingTitle(true);
    try {
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          producer: producerDraft.trim() || null,
          wine_name: wineNameDraft.trim() || wine.wine_name,
          grape_variety: grapeDraft.trim() || null,
        },
      });
      setTitleEditOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingTitle(false);
    }
  }

  // Brief "Wine removed from your records" toast — shown for ~1.4s after
  // a permanent delete, then the auto-dismiss timer navigates back. The
  // user just confirmed deletion, so the underlying wine row is gone and
  // we render this on top of an empty screen rather than the wine card.
  if (justDeleted) {
    return (
      <View style={styles.removeModalOverlay}>
        <View style={styles.removeModalSheet}>
          <Text style={styles.removeModalTitle}>Wine has been removed from your records</Text>
        </View>
      </View>
    );
  }

  // While the cellar query is in flight, show a spinner instead of the
  // "Wine not found" fallback — otherwise the user sees a flash of that
  // message right after a wine is added (the navigation lands before the
  // cellar refetch resolves).
  if (!wine && (cellarLoading || archiveLoading || wishlistLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Wine not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleAddBottlesEntry() {
    // When the wine is already placed in a rack, route the user through
    // the rack grid so they can choose a starting slot + orientation and
    // place the new bottles visually. When the wine has no rack yet, fall
    // back to the simple inline modal (just bumps the quantity) — the
    // user can place those bottles later by picking a rack first.
    if (wineRack) {
      setPendingWineId(wine!.id);
      setPendingAddMode(true);
      router.push(`/cellar/rack/${wineRack.id}` as any);
      return;
    }
    setAddBottlesCount('1');
    setAddBottlesOpen(true);
  }

  // Place an as-yet-unracked wine into a fridge/rack. Stash it as the
  // pending wine, then send the user to a rack grid (straight there if they
  // have just one) to tap a slot — or to the racks list to pick/create one.
  function handleAddToRack() {
    setPendingWineId(wine!.id);
    if (racks.length === 1) {
      router.push(`/cellar/rack/${racks[0].id}` as any);
    } else {
      router.push('/cellar/racks');
    }
  }

  async function handleSaveNote() {
    Keyboard.dismiss();
    setSavingNote(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { user_notes: noteText.trim() || null },
      });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setEditingNote(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    } finally {
      setSavingNote(false);
    }
  }

  async function handleArchiveWine() {
    const count = parseInt(removeCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to archive.' });
      return;
    }
    if (count > wine!.quantity) {
      showAlert({ title: 'Invalid', body: `You only have ${wine!.quantity} bottle${wine!.quantity === 1 ? '' : 's'}.` });
      return;
    }

    const newQuantity = wine!.quantity - count;

    setRemoving(true);
    try {
      // Log the structured removal event regardless of partial vs full —
      // these power the Removal History block on the wine card and the
      // Cellar Archive view.
      await addCellarWineRemoval({
        cellarWineId: wine!.id,
        removedAt: removeDate,
        count,
      });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wine!.id] });

      if (newQuantity === 0) {
        // Archive the row with the actual number removed in this event so the
        // "Bottles in My Archive" stat on the wine card sums correctly.
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: {
            quantity: count,
            archived_at: `${removeDate}T12:00:00.000Z`,
          },
        });
        await clearWineFromRacks(wine!.id);
        if (session?.user.id) {
          // Drop the archived wine from the live cellar cache straight away —
          // it no longer belongs in the Cellar List, and leaving it there
          // would let a fresh add falsely match it as a duplicate if the
          // refetch lags or fails.
          qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
            (old ?? []).filter((w) => w.id !== wine!.id));
          qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        showAlert({
          title: 'Wine Archived',
          body: 'Removed from Cellar List and racks.',
          buttons: [{ text: 'OK', onPress: () => router.back() }],
        });
      } else {
        // Partial removal — decrement the live cellar row and clone an
        // archive row carrying the bottles removed in this event. Without
        // the clone, the "Bottles in My Archive" stat (which sums archived
        // matching rows) wouldn't reflect the bottles the user just pulled.
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: { quantity: newQuantity },
        });
        const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = wine!;
        await addCellarWine({
          ...rest,
          quantity: count,
          archived_at: `${removeDate}T12:00:00.000Z`,
          is_wishlist: false,
        });
        if (session?.user.id) {
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        const slotsRemoved = await removeSlotsForWine(wine!.id, count);
        if (slotsRemoved > 0) {
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          qc.invalidateQueries({ queryKey: ['rack-slots'] });
          setRackRemovalMsg(
            `${slotsRemoved} bottle${slotsRemoved === 1 ? '' : 's'} also removed from your live cellar rack.`
          );
        } else {
          setRackRemovalMsg(null);
        }
        setRemoveCount('1');
      }
    } catch {
      showAlert({ title: 'Error', body: 'Could not record removal. Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleAddBottles() {
    const count = parseInt(addBottlesCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to add.' });
      return;
    }
    setAddingBottles(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { quantity: wine!.quantity + count },
      });
      setAddBottlesOpen(false);
      setAddBottlesCount('1');
    } catch {
      showAlert({ title: 'Error', body: 'Could not add bottles. Please try again.' });
    } finally {
      setAddingBottles(false);
    }
  }

  async function handleSavePrice() {
    Keyboard.dismiss();
    const trimmed = purchasePriceDraft.trim();
    const parsed = trimmed ? Number(trimmed) : null;
    if (trimmed && (parsed === null || Number.isNaN(parsed) || parsed < 0)) {
      showAlert({ title: 'Invalid', body: 'Enter a positive number for the purchase price.' });
      return;
    }
    setSavingPrice(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: {
          purchase_price: parsed,
          // Stamp the user's current currency only on first entry; preserve
          // existing currency on subsequent edits so historical prices stay
          // in their original currency.
          ...(wine!.purchase_price_currency ? {} : { purchase_price_currency: preferences?.defaultCurrency ?? 'GBP' }),
        },
      });
      setEditingPrice(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save purchase price.' });
    } finally {
      setSavingPrice(false);
    }
  }

  async function handleSaveReview() {
    Keyboard.dismiss();
    const scoreTrim = reviewScoreDraft.trim();
    const locationTrim = reviewLocationDraft.trim();
    const dateTrim = reviewDateDraft.trim();
    const priceTrim = purchasePriceDraft.trim();
    const parsedPrice = priceTrim ? parseFloat(priceTrim) : NaN;
    const priceValue = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : null;
    const priceCurrency = wine!.purchase_price_currency ?? preferences?.defaultCurrency ?? 'GBP';
    let parsedScore: number | null = null;
    if (scoreTrim) {
      const n = Number(scoreTrim);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        showAlert({ title: 'Invalid score', body: 'Enter a score between 0 and 100.' });
        return;
      }
      parsedScore = Math.round(n);
    }
    setSavingReview(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: {
          review_score: parsedScore,
          review_location: locationTrim || null,
          review_date: dateTrim || null,
          // Review prose lives in review_note (migration 043) so it
          // can be split cleanly from Personal Notes (user_notes).
          review_note: reviewNoteDraft.trim() || null,
          purchase_price: priceValue,
          purchase_price_currency: priceValue != null ? priceCurrency : null,
        },
      });
      // Mirror the review edit onto every matching record so reviews,
      // wishlist entries and any other cellar rows for the same wine
      // stay in lock-step. Best-effort — sync failures don't undo the
      // primary cellar update.
      if (session?.user.id && wine) {
        const { restaurantName, city } = splitLocationString(locationTrim);
        const identity = { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage };
        const fields = { userScore: parsedScore, restaurantName, city, reviewDate: dateTrim || undefined };
        try {
          // Update a matching chosen_wines review if one exists, but DON'T
          // create one: a cellar wine's review already surfaces in Your Wine
          // Reviews as a 'cellar' item, so spawning a chosen_wines row here
          // produced a duplicate (a score-only twin of the real review).
          await syncEditToChosen(session.user.id, identity, fields, { createIfMissing: false, region: wine.region });
          await syncReviewToCellar(session.user.id, identity, fields, { excludeCellarWineId: wine.id });
          qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          qc.invalidateQueries({ queryKey: ['wishlist', session.user.id] });
          qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
        } catch (err) {
          console.warn('[wine-detail review sync] failed:', err);
        }
      }
      setReviewExpanded(false);
    } catch {
      showAlert({ title: 'Could not save review', body: 'Please try again.' });
    } finally {
      setSavingReview(false);
    }
  }

  // Tapping the "Your Review" / "Personal Notes" header expands the inputs;
  // tapping it again auto-saves and collapses (no Save/Cancel buttons).
  function toggleReview() {
    if (reviewExpanded) void handleSaveReview();
    else setReviewExpanded(true);
  }
  function toggleNote() {
    if (editingNote) void handleSaveNote();
    else setEditingNote(true);
  }

  async function handleRemoveWine() {
    // Hard delete: removes the wine record entirely from cellar_wines and
    // clears any rack slots referencing it. Triggered after the user has
    // confirmed in the styled confirm modal.
    if (!wine) return;
    setRemoving(true);
    try {
      await clearWineFromRacks(wine.id);
      const { error } = await supabase.from('cellar_wines').delete().eq('id', wine.id);
      if (error) throw error;
      // Prune the deleted wine from the cached cellar list synchronously, so
      // its "memory" is gone immediately and the duplicate-detection on a
      // fresh add can never match it — even if the background refetch below
      // is slow or fails on a flaky connection (which previously left the
      // stale row in cache for up to gcTime and triggered a false
      // "already in your cellar" prompt).
      if (session?.user.id) {
        qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) =>
          (old ?? []).filter((w) => w.id !== wine.id));
      }
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setRemoveStep('idle');
      // Flip the just-deleted flag BEFORE the cellar refetch can land — the
      // dedicated render block at the top of the component renders the
      // toast and suppresses the "Wine not found" fallback. Auto-dismiss
      // after a beat, then navigate back to wherever the user came from.
      setJustDeleted(true);
      setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/cellar');
      }, 1400);
    } catch {
      setRemoveStep('idle');
      showAlert({ title: 'Could not remove', body: 'Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleRefreshEstimate() {
    if (!wine) return;
    setRefreshingValue(true);
    const currency = preferences?.defaultCurrency ?? 'GBP';
    try {
      const intel = await getWineIntelligence({
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        wineName: wine.wine_name || null,
        vintage: wine.vintage || 'NV',
      } as any, currency);
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          estimated_value: intel.estimatedValue,
          estimated_value_currency: currency,
          estimated_value_at: new Date().toISOString(),
        },
      });
    } catch {
      showAlert({ title: 'Could not refresh', body: 'Vinster couldn\'t generate an estimate right now. Please try again.' });
    } finally {
      setRefreshingValue(false);
    }
  }

  async function handlePostToCommunity() {
    if (!wine || postingReview || reviewPosted) return;
    if (!session?.user.id) {
      showAlert({ title: 'Sign in required', body: 'You need an account to post a review to the community.' });
      return;
    }
    const titleParts = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean);
    const title = titleParts.join(' · ').trim() || wine.wine_name || 'Wine review';
    const subtitleParts = [wine.region, wine.grape_variety].filter(Boolean);
    const subtitle = subtitleParts.join(' · ') || null;
    // Prefer the new review_note column for the post body; fall back
    // to user_notes for legacy rows where the user wrote everything
    // into "Additional Notes" before the split (migration 043).
    const body = (wine.review_note ?? '').trim() || (wine.user_notes ?? '').trim() || null;
    showAlert({
      title: 'Share with the community?',
      body: `Post your review of ${title} to the Vinster community feed. Other users will be able to read your notes and rating.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Post',
          onPress: async () => {
            setPostingReview(true);
            try {
              const displayName = (session.user.email ?? '').split('@')[0] || null;
              await publishCommunityReview(
                {
                  category: 'wine',
                  source_table: 'cellar_wines',
                  source_id: wine.id,
                  title,
                  subtitle,
                  rating: wine.review_score,
                  body,
                  metadata: {
                    producer: wine.producer ?? null,
                    region: wine.region ?? null,
                    vintage: wine.vintage ?? null,
                    grape_variety: wine.grape_variety ?? null,
                    critic_score: wine.critic_score ?? null,
                    review_date: wine.review_date ?? null,
                  },
                },
                displayName,
              );
              setReviewPosted(true);
              showAlert({ title: 'Posted to community', body: 'Thanks for sharing your review — it now appears in the Vinster community feed.' });
            } catch (err) {
              const detail = err instanceof Error ? err.message : String(err);
              const alreadyPosted = detail.toLowerCase().includes('community_reviews_source_unique') || detail.toLowerCase().includes('duplicate');
              if (alreadyPosted) {
                setReviewPosted(true);
                showAlert({ title: 'Already shared', body: 'You\'ve already posted a review of this wine to the community.' });
              } else {
                showAlert({ title: 'Could not post', body: detail });
              }
            } finally {
              setPostingReview(false);
            }
          },
        },
      ],
    });
  }

  // Share the review as a branded PNG card via the native share sheet
  // (WhatsApp, Messages, Instagram, etc.). Mirrors the Wine Reviews
  // share flow so all three Vinster review surfaces use the same card.
  async function handleShareReviewOutside() {
    if (!wine || sharingOutside) return;
    const headerLine = (() => {
      const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
      return sameName
        ? [wine.producer, wine.vintage].filter(Boolean).join(' ')
        : [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
    })();
    setReviewSharePayload({
      producer: wine.producer,
      wineName: wine.wine_name,
      vintage: wine.vintage,
      region: wine.region,
      userScore: wine.review_score,
      criticScore: wine.critic_score,
      tastingNote: wine.review_note ?? wine.user_notes ?? '',
      otherObservations: null,
      date: wine.review_date ? new Date(wine.review_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null,
      location: wine.review_location ?? null,
      isFavourite: wine.is_favourite,
    });
    setSharingOutside(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (reviewShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(reviewShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share my wine review',
          UTI: 'public.png',
        });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const note = (wine.review_note ?? '').trim();
      const noteFormatted = note ? `\n\n"${note}"` : '';
      const scoreText = wine.review_score != null ? `\nMy score: ${wine.review_score}/100` : '';
      const locFormatted = wine.review_location ? `\nWhere: ${wine.review_location}` : '';
      await Share.share({
        message: `${headerLine}${scoreText}${locFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: headerLine,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingOutside(false);
      setReviewSharePayload(null);
    }
  }

  function handleFindPairings() {
    if (!wine) return;
    // Route through the same per-search preferences screen that the Chef
    // tab uses (dietary / allergy / difficulty / time / specific concerns),
    // rather than generating pairings inline from profile preferences only.
    // The screen reads wineDetailsConfirmed from the label store, so we set
    // it here. from=cellar lets the results screen know to route Back to
    // the wine card on tap rather than to the Chef tab.
    const confirmed: WineDetailsComplete = {
      producer: wine.producer || '',
      region: wine.region || '',
      wineName: wine.wine_name || null,
      vintage: wine.vintage || 'NV',
      style: null,
    };
    setWineDetailsConfirmed(confirmed);
    router.push(`/chef/review-requirements?from=cellar&wineId=${wine.id}`);
  }

  if (findingPairings) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="Vinster is selecting three chef-inspired dishes to complement your wine"
        durationMs={60000}
      />
    );
  }

  // Drinking-window status. 'unknown' is no longer a valid state — Vinster
  // always estimates a window — so when a legacy row still carries 'unknown'
  // (or a blank status) but has from/to years, derive the real status from
  // the current year rather than showing "Unknown" beside a date range.
  const rawWindowStatus = wine.drinking_window_status;
  const effectiveWindowStatus = (() => {
    if (rawWindowStatus && rawWindowStatus !== 'unknown' && STATUS_LABELS[rawWindowStatus]) return rawWindowStatus;
    const from = wine.drinking_window_from;
    const to = wine.drinking_window_to;
    if (from || to) {
      const yr = new Date().getFullYear();
      if (from && yr < from) return 'too_young';
      if (to && yr > to) return 'declining';
      if (from && to) {
        const span = to - from;
        return span > 0 && yr <= from + Math.ceil(span / 3) ? 'approaching' : 'peak';
      }
      return 'peak';
    }
    return rawWindowStatus;
  })();
  const windowColor = STATUS_COLORS[effectiveWindowStatus] ?? colors.textMuted;
  const windowLabel = STATUS_LABELS[effectiveWindowStatus] ?? 'Unknown';

  // Count bottles across all rows (cellar + archive) that match this wine's
  // identity. Producer + wine name + vintage normalised so 'NV' / null /
  // case differences don't fragment the count.
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const matchesIdentity = (w: typeof wine) =>
    norm(w.producer) === norm(wine.producer) &&
    norm(w.wine_name) === norm(wine.wine_name) &&
    norm(w.vintage) === norm(wine.vintage);
  const bottlesInCellar = wines.filter(matchesIdentity).reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const bottlesInArchive = archivedWines.filter(matchesIdentity).reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  function bottleLabel(n: number) {
    return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
  }

  async function handleToggleFavourite() {
    if (!wine) return;
    try {
      await updateWine.mutateAsync({
        id: wine.id,
        updates: { is_favourite: !wine.is_favourite },
      });
    } catch {
      showAlert({ title: 'Could not update', body: 'Please try again.' });
    }
  }

  // Wishlist-only delete. Confirms first, then removes the wishlist row
  // and routes back to the Wish List. Reuses the justDeleted toast +
  // auto-navigate pattern used by the cellar hard-delete above.
  function handleDeleteFromWishlist() {
    if (!wine) return;
    showAlert({
      title: 'Remove from wish list?',
      body: 'This will remove the wine from your wish list. You can add it again any time.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await deleteWishlistWine.mutateAsync(wine.id);
              setJustDeleted(true);
              setTimeout(() => {
                if (router.canGoBack()) router.back();
                else router.replace('/cellar/wishlist');
              }, 1400);
            } catch {
              showAlert({ title: 'Could not remove', body: 'Please try again.' });
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    });
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 80 }}
      keyboardShouldPersistTaps="always"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {/* Card-type label — sits centred between Back and the star
            so it reads as a chip / breadcrumb identifying which kind
            of card the user is looking at. */}
        <Text style={styles.cardTypeLabel}>
          {isWishlist ? 'Wish List Wine' : isArchived ? 'Archived Wine' : 'Cellar Wine'}
        </Text>
        {!isArchived ? (
          <TouchableOpacity onPress={handleToggleFavourite} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={[styles.favouriteStar, wine.is_favourite && styles.favouriteStarActive]}>
              {wine.is_favourite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>
        ) : (
          // Spacer so the label stays centred when the favourite star
          // doesn't render (archived wines).
          <View style={{ width: 28 }} />
        )}
      </View>

      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Thumbnail to the left of the name. Tap to view; long-press an
              existing photo to change or delete it (no separate button). */}
          <TouchableOpacity
            onPress={() => (wine.label_image_path ? setPhotoViewerOpen(true) : handleAddPhoto())}
            onLongPress={() => (wine.label_image_path ? handlePhotoMenu() : handleAddPhoto())}
            delayLongPress={350}
            activeOpacity={0.85}
          >
            <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.detailThumb} />
          </TouchableOpacity>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerLine}>
              {(() => {
                const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
                const parts = sameName
                  ? [wine.producer, wine.region, wine.vintage]
                  : [wine.producer, wine.wine_name, wine.region, wine.vintage];
                return parts.filter(Boolean).join(' · ');
              })()}
            </Text>
            {wine.grape_variety ? <Text style={styles.grape}>{wine.grape_variety}</Text> : null}
            {(() => {
              const added = wine.date_received ?? wine.created_at;
              const addedLabel = added ? `Added ${new Date(added).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : null;
              return (
                <View style={styles.dateRow}>
                  {addedLabel ? <Text style={styles.addedDate}>{addedLabel}</Text> : <View />}
                  <TouchableOpacity onPress={openTitleEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                    <Text style={styles.editTitleLink}>Edit</Text>
                  </TouchableOpacity>
                </View>
              );
            })()}
          </View>
        </View>
        {uploadingPhoto ? <Text style={styles.photoSaving}>Saving photo…</Text> : null}
      </View>

      <LabelPhotoViewer
        visible={photoViewerOpen}
        path={wine.label_image_path}
        fallbackText={wine.wine_name}
        onClose={() => setPhotoViewerOpen(false)}
      />

      {/* Edit the title — name + grape variety. */}
      <Modal visible={titleEditOpen} transparent animationType="fade" onRequestClose={() => setTitleEditOpen(false)}>
        <KeyboardAvoidingView behavior="padding" style={styles.titleEditOverlay}>
          <View style={styles.titleEditSheet}>
            <Text style={styles.titleEditHeading}>Edit wine</Text>
            <Text style={styles.fieldLabel}>Producer</Text>
            <TextInput style={styles.input} value={producerDraft} onChangeText={setProducerDraft} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Wine name</Text>
            <TextInput style={styles.input} value={wineNameDraft} onChangeText={setWineNameDraft} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Grape variety</Text>
            <TextInput style={styles.input} value={grapeDraft} onChangeText={setGrapeDraft} placeholder="Grape variety" placeholderTextColor={colors.textMuted} />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => setTitleEditOpen(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveTitle} disabled={savingTitle}>
                <Text style={styles.saveBtnText}>{savingTitle ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Compact stats grid — score / window / bottle counts only. The
          Purchase and Estimated values are pulled out into full-width rows
          below so each has room to breathe and a clearer call to action. */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Avg Critic Score</Text>
          <Text style={styles.statValue}>{wine.critic_score != null ? wine.critic_score : '—'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Drinking Window</Text>
          <Text style={[styles.statValue, { color: windowColor }]}>{windowLabel}</Text>
          {wine.drinking_window_from && wine.drinking_window_to && (
            <Text style={styles.statSub}>{wine.drinking_window_from}–{wine.drinking_window_to}</Text>
          )}
        </View>

        {!isWishlist && (
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Purchase Price</Text>
          {editingPrice ? (
            <>
              <TextInput
                style={styles.statInput}
                value={purchasePriceDraft}
                onChangeText={setPurchasePriceDraft}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.statActions}>
                <TouchableOpacity onPress={() => { setEditingPrice(false); setPurchasePriceDraft(wine.purchase_price != null ? String(wine.purchase_price) : ''); }}>
                  <Text style={styles.statCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePrice} disabled={savingPrice}>
                  <Text style={[styles.statAction, savingPrice && { opacity: 0.5 }]}>{savingPrice ? '…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity onPress={() => setEditingPrice(true)} activeOpacity={0.7}>
              {wine.purchase_price != null ? (
                <>
                  <Text style={styles.statValue}>{formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 0 })}</Text>
                  {wine.estimated_value != null && Number(wine.purchase_price) === Number(wine.estimated_value) ? (
                    <Text style={styles.priceEstimatedNote}>Estimated upon entry, update</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.statAction}>+ Add Price</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        )}
        <TouchableOpacity
          style={styles.statCell}
          onPress={handleRefreshEstimate}
          activeOpacity={refreshingValue ? 1 : 0.7}
          disabled={refreshingValue}
        >
          <Text style={styles.statLabel}>Estimated Value</Text>
          {refreshingValue ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>Estimating…</Text>
          ) : wine.estimated_value != null ? (
            <>
              <Text style={[styles.statValue, styles.estimatedValueGold]}>
                {formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}
                <Text style={styles.estimateUpdateLink}> (update)</Text>
              </Text>
              {wine.estimated_value_at ? (
                <Text style={styles.statSub}>{new Date(wine.estimated_value_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              ) : null}
            </>
          ) : (
            <Text style={styles.statAction}>+ Generate</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* When no critic score is available, surface Vinster's brief
          explanation so the dash doesn't feel like an error. */}
      {wine.critic_score == null && wine.critic_score_note ? (
        <View style={styles.scoreNoteBlock}>
          <Text style={styles.scoreNoteLabel}>Why no critic score?</Text>
          <Text style={styles.scoreNoteText}>{wine.critic_score_note}</Text>
        </View>
      ) : null}

      {/* Bottles grid moved ABOVE the chef button so the user can see
          at a glance whether they own (or have owned) the wine before
          deciding whether to pair a meal to it. Hidden for wishlist
          wines — bottle counts don't apply to a wine not yet bought. */}
      {!isWishlist && (
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Cellar</Text>
          <Text style={styles.statValue}>{bottleLabel(bottlesInCellar)}</Text>
          {wineRack && !cameFromRack && (
            <TouchableOpacity onPress={() => router.push(`/cellar/rack/${wineRack.id}?highlight=${wine.id}`)}>
              <Text style={styles.statAction}>In {wineRack.name} →</Text>
            </TouchableOpacity>
          )}
          {!isArchived && !isWishlist && (
            <TouchableOpacity onPress={() => handleAddBottlesEntry()}>
              <Text style={styles.statAction}>+ Add bottles</Text>
            </TouchableOpacity>
          )}
          {!isArchived && !isWishlist && wine.quantity > 0 && (
            <TouchableOpacity onPress={() => setArchiveModalOpen(true)}>
              <Text style={styles.statAction}>- Remove bottles</Text>
            </TouchableOpacity>
          )}
          {!isArchived && !isWishlist && !wineRack && (
            <TouchableOpacity onPress={handleAddToRack}>
              <Text style={styles.statAction}>+ Add to Fridge/Rack</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Archive</Text>
          <Text style={[styles.statValue, bottlesInArchive === 0 && styles.statValueMuted]}>{bottleLabel(bottlesInArchive)}</Text>
        </View>
      </View>
      )}

      {!isArchived && rackRemovalMsg && (
        <Text style={[styles.rackRemovalMsg, { marginHorizontal: spacing.xl }]}>{rackRemovalMsg}</Text>
      )}

      {/* Reviews — Vinster's AI note, the user's review, and private notes,
          grouped under one header with consistent sub-titles and no internal
          dividers. The Chef button now sits lower, above Archive/Delete. */}
      <View style={styles.cardDivider} />
      <Text style={styles.reviewsHeader}>Reviews</Text>

      <View style={styles.reviewSubsection}>
        {/* Your Review — a chevron header (like Vinster's Review). Expand to
            edit; tap the header again to auto-save and collapse. */}
        <View style={styles.vinsterHeaderRow}>
          <TouchableOpacity onPress={toggleReview} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
            <Text style={styles.vinsterReviewTitle}>Your Review</Text>
            <Ionicons name={reviewExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color={colors.gold} />
          </TouchableOpacity>
        </View>

        {!reviewExpanded && (wine.review_score != null || wine.review_location || wine.review_date) ? (
          <View style={styles.reviewQuickStats}>
            <View style={styles.reviewQuickCell}>
              <Text style={styles.reviewQuickLabel}>Score</Text>
              <Text style={[styles.reviewQuickValue, wine.review_score == null && styles.reviewQuickValueMuted]}>
                {wine.review_score != null ? `${wine.review_score}/100` : '—'}
              </Text>
            </View>
            <View style={styles.reviewQuickCell}>
              <Text style={styles.reviewQuickLabel}>Discovered at</Text>
              <Text style={[styles.reviewQuickValue, !wine.review_location && styles.reviewQuickValueMuted]} numberOfLines={1}>
                {wine.review_location || '—'}
              </Text>
            </View>
            <View style={styles.reviewQuickCell}>
              <Text style={styles.reviewQuickLabel}>When</Text>
              <Text style={[styles.reviewQuickValue, !wine.review_date && styles.reviewQuickValueMuted]} numberOfLines={1}>
                {wine.review_date || '—'}
              </Text>
            </View>
          </View>
        ) : null}

        {reviewExpanded ? (
          <>
            {/* Discovered at → Your Review → Your Score → Price Paid, matching
                the shared review input. Auto-saves when collapsed. */}
            <Text style={styles.fieldLabel}>Discovered at</Text>
            <TextInput
              style={styles.input}
              value={reviewLocationDraft}
              onChangeText={setReviewLocationDraft}
              placeholder="Restaurant, home, friend's place…"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.dictateRow}>
              <Text style={styles.fieldLabel}>Your review</Text>
              <MicButton value={reviewNoteDraft} onChangeText={setReviewNoteDraft} onClear={() => setReviewNoteDraft('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={reviewNoteDraft}
              onChangeText={setReviewNoteDraft}
              placeholder="What you thought of the wine — taste, occasion, anything that's worth sharing."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.fieldLabel}>Your Score (0–100)</Text>
            <TextInput
              style={styles.input}
              value={reviewScoreDraft}
              onChangeText={setReviewScoreDraft}
              keyboardType="number-pad"
              placeholder="e.g. 92"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
            <Text style={styles.fieldLabel}>Price Paid (optional)</Text>
            <View style={styles.reviewPriceRow}>
              <Text style={styles.reviewPriceCurrency}>{formatCurrency(0, wine.purchase_price_currency ?? 'GBP', { decimals: 0 }).replace(/[\d.,\s]/g, '') || (wine.purchase_price_currency ?? 'GBP')}</Text>
              <TextInput
                style={styles.reviewPriceInput}
                value={purchasePriceDraft}
                onChangeText={(t) => setPurchasePriceDraft(t.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            <View style={styles.noteActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveReview} disabled={savingReview}>
                <Text style={styles.saveBtnText}>{savingReview ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {wine.review_note ? (
              <Text style={styles.reviewNoteBody}>“{wine.review_note}”</Text>
            ) : null}

            {/* Share-to-community + share-outside-the-app actions sit
                under the review so the user can post or send their
                review without leaving the card. Disabled until a
                review has been written. */}
            <View style={styles.reviewShareRow}>
              <TouchableOpacity
                style={[styles.reviewShareBtn, (postingReview || reviewPosted || !wine.review_note) && styles.buttonDisabled]}
                onPress={handlePostToCommunity}
                disabled={postingReview || reviewPosted || !wine.review_note}
                activeOpacity={0.7}
              >
                <Text style={styles.reviewShareBtnText}>
                  {reviewPosted ? '✓ Posted' : postingReview ? 'Posting…' : 'Share to Community'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewShareBtn, sharingOutside && styles.buttonDisabled]}
                onPress={handleShareReviewOutside}
                disabled={sharingOutside}
                activeOpacity={0.7}
              >
                <Text style={styles.reviewShareBtnText}>
                  {sharingOutside ? 'Preparing…' : 'Share'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {!isWishlist && (
      <View style={styles.reviewSubsection}>
        {/* Personal Notes — same chevron + auto-save-on-collapse pattern. */}
        <View style={styles.vinsterHeaderRow}>
          <TouchableOpacity onPress={toggleNote} activeOpacity={0.7} style={styles.vinsterReviewToggle}>
            <Text style={styles.vinsterReviewTitle}>Personal Notes</Text>
            <Ionicons name={editingNote ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color={colors.gold} />
          </TouchableOpacity>
        </View>
        {editingNote ? (
          <>
            <View style={styles.dictateRow}>
              <Text style={styles.fieldLabel}>Note</Text>
              <MicButton value={noteText} onChangeText={setNoteText} onClear={() => setNoteText('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a personal note about this wine…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.noteActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveNote} disabled={savingNote}>
                <Text style={styles.saveBtnText}>{savingNote ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : wine.user_notes ? (
          <Text style={styles.noteText}>{wine.user_notes}</Text>
        ) : null}
      </View>
      )}

      {/* Vinster's Review — Vinster's AI tasting note, collapsed behind a
          chevron toggle. Sits last of the three review blocks (after Your
          Review and Personal Notes). The "(what's this)" link surfaces a
          short explainer. Hidden for wishlist wines: their stored note is
          the user's own, and Vinster's AI review only exists in the cellar. */}
      {!isWishlist && wine.tasting_notes ? (
        <View style={styles.reviewSubsection}>
          <View style={styles.vinsterHeaderRow}>
            <TouchableOpacity
              onPress={() => setVinstersNoteOpen((v) => !v)}
              activeOpacity={0.7}
              style={styles.vinsterReviewToggle}
            >
              <Text style={styles.vinsterReviewTitle}>Vinster's Review</Text>
              <Ionicons
                name={vinstersNoteOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={16}
                color={colors.gold}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setWhatsThisOpen(true)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.whatsThisLink}>what's this</Text>
            </TouchableOpacity>
          </View>
          {vinstersNoteOpen ? (
            <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
          ) : null}
        </View>
      ) : null}

      {!isWishlist && <View style={styles.cardDivider} />}

      {isWishlist && (
        <TouchableOpacity
          style={[styles.chefBtn, { borderColor: colors.gold }]}
          onPress={() => router.push('/cellar/wishlist')}
          activeOpacity={0.7}
        >
          <Text style={[styles.chefBtnText, { color: colors.gold }]}>Add to Cellar</Text>
        </TouchableOpacity>
      )}

      {isWishlist && (
        <TouchableOpacity
          style={[styles.chefBtn, { borderColor: colors.gold }]}
          onPress={handleDeleteFromWishlist}
          disabled={removing}
          activeOpacity={0.7}
        >
          <Text style={[styles.chefBtnText, { color: colors.gold }]}>Delete from Wish List</Text>
        </TouchableOpacity>
      )}

      {/* Chef pairing CTA — moved down to sit just above Archive/Delete.
          Wishlist wines hide it (no bottle yet); the reviews-flow variant
          posts the review to the community instead. */}
      {!isArchived && (
        isWishlist ? null : cameFromReviews ? (
          <TouchableOpacity
            style={[styles.chefBtn, (postingReview || reviewPosted) && styles.chefBtnDisabled]}
            onPress={handlePostToCommunity}
            disabled={postingReview || reviewPosted}
            activeOpacity={0.7}
          >
            <Text style={styles.chefBtnText}>
              {reviewPosted ? '✓ Posted to Community' : postingReview ? 'Posting…' : 'Post Review To Community'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
            <Text style={styles.chefBtnText}>Chef, find me a recipe for this wine</Text>
          </TouchableOpacity>
        )
      )}

      {!isArchived && <View style={styles.cardDivider} />}

      {!isArchived && !isWishlist && (
        <TouchableOpacity style={styles.archiveAccessBtn} onPress={() => setArchiveModalOpen(true)}>
          <Text style={styles.archiveAccessBtnText}>Archive or Delete Wine</Text>
        </TouchableOpacity>
      )}

      {!isWishlist && removals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{isArchived ? 'Archived' : 'Removal History'}</Text>
            {isArchived && wine.archived_at && (
              <Text style={styles.archivedAt}>{new Date(wine.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            )}
          </View>
          {removals.map((ev) => (
            <RemovalRow key={ev.id} removal={ev} />
          ))}
          {!isArchived && (
            <Text style={styles.removalArchiveHint}>Edit your removal history in your archive folder.</Text>
          )}
        </View>
      )}

      {isArchived && (
        <TouchableOpacity
          style={[styles.removeWineBtn, styles.archivedDeleteBtn, removing && styles.buttonDisabled]}
          onPress={() => setRemoveStep('confirm')}
          disabled={removing}
        >
          <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={addBottlesOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !addingBottles && setAddBottlesOpen(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Add bottles</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

            <Text style={styles.fieldLabel}>How many bottles to add?</Text>
            <TextInput
              style={styles.input}
              value={addBottlesCount}
              onChangeText={setAddBottlesCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              selectTextOnFocus
            />

            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: colors.gold }, addingBottles && styles.buttonDisabled]}
              onPress={handleAddBottles}
              disabled={addingBottles}
            >
              <Text style={[styles.removeBtnText, { color: colors.gold }]}>
                {addingBottles ? 'Adding…' : 'Add to Cellar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAddBottlesOpen(false)} style={styles.archiveModalCancel} disabled={addingBottles}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={archiveModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !removing && setArchiveModalOpen(false)}
      >
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Archive or Delete Wine</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

            {wine.quantity > 1 && (
              <>
                <Text style={styles.fieldLabel}>How many of your {wine.quantity} bottles?</Text>
                <TextInput
                  style={styles.input}
                  value={removeCount}
                  onChangeText={setRemoveCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Date removed</Text>
            <TextInput
              style={styles.input}
              value={removeDate}
              onChangeText={setRemoveDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.removeBtn, removing && styles.buttonDisabled]}
              onPress={async () => {
                await handleArchiveWine();
                setArchiveModalOpen(false);
              }}
              disabled={removing}
            >
              <Text style={styles.removeBtnText}>{removing ? 'Working…' : 'Archive Wine'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeWineBtn, removing && styles.buttonDisabled]}
              onPress={() => { setArchiveModalOpen(false); setRemoveStep('confirm'); }}
              disabled={removing}
            >
              <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setArchiveModalOpen(false)} style={styles.archiveModalCancel} disabled={removing}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* "(what's this)" explainer for Vinster's Note — a short
          definition of the AI tasting line so first-time users know
          what they're looking at. */}
      <Modal visible={whatsThisOpen} transparent animationType="fade" onRequestClose={() => setWhatsThisOpen(false)}>
        <TouchableOpacity style={styles.removeModalOverlay} activeOpacity={1} onPress={() => setWhatsThisOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.removeModalSheet} onPress={() => {}}>
            <Text style={styles.removeModalTitle}>What is Vinster's Note?</Text>
            <Text style={styles.removeModalBody}>
              Vinster digs deeply into the online world for critic scores and reviews, vintage information, market values, and overall producer quality to generate information on this wine and use it for the basis of its wine note, which covers the classics — fruit, acidity, tannin, body, and finish. Your own thoughts can be recorded in "Your Review" and "Personal Notes" on the wine card.
            </Text>
            <TouchableOpacity style={styles.removeModalConfirmBtn} onPress={() => setWhatsThisOpen(false)}>
              <Text style={styles.removeModalConfirmText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Off-screen share card for the Share button on Your Review.
          Mounted only while a share is in flight. */}
      {reviewSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard ref={reviewShareRef} {...reviewSharePayload} />
        </View>
      )}

      <Modal
        visible={removeStep !== 'idle'}
        transparent
        animationType="fade"
        onRequestClose={() => removeStep === 'success' ? null : setRemoveStep('idle')}
      >
        <View style={styles.removeModalOverlay}>
          <View style={styles.removeModalSheet}>
            {removeStep === 'confirm' ? (
              <>
                <Text style={styles.removeModalTitle}>Remove this wine?</Text>
                <Text style={styles.removeModalBody}>
                  This will permanently delete {wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''} from your record. This can't be undone.
                </Text>
                <TouchableOpacity
                  style={[styles.removeModalConfirmBtn, removing && styles.buttonDisabled]}
                  onPress={handleRemoveWine}
                  disabled={removing}
                >
                  <Text style={styles.removeModalConfirmText}>{removing ? 'Removing…' : 'Remove permanently'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRemoveStep('idle')} style={styles.removeModalCancel}>
                  <Text style={styles.removeModalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  // Inter — error body
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  // Cormorant — action link reads as a button
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  backRow: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  // Inter — back/nav link
  backText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  // Cormorant — card-type header label
  cardTypeLabel: {
    fontFamily: fonts.headingSemibold,
    fontSize: 12,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  favouriteStar: { fontSize: 28, color: 'rgba(255,255,255,0.55)', lineHeight: 28 },
  favouriteStarActive: { color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerTextCol: { flex: 1 },
  addedDate: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  // Subtle gold "Edit" link on the date line — opens the title editor.
  editTitleLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline' },
  titleEditOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  titleEditSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  titleEditHeading: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  photoSaving: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: spacing.sm },
  detailThumb: { width: 60, height: 76 },
  // Inter — wine card name (card content, not a page header)
  headerLine: { fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text, lineHeight: 28 },
  // Inter — region caption
  region: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4 },
  // Inter — grape caption
  grape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: 2 },
  tastingBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — info label
  infoLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — info value read-out
  infoValue: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, textAlign: 'right' },
  // Inter — small caption sub
  infoSub: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Reviews group — one header over Vinster's / Your Review / Personal Notes,
  // each a borderless subsection so they read as one consistent block.
  reviewsHeader: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, marginBottom: spacing.xs },
  reviewPriceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.md },
  reviewPriceCurrency: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.textMuted, marginRight: 4 },
  reviewPriceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  autoSaveHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, marginBottom: spacing.sm },
  reviewSubsection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  reviewSubTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  // Vinster's Review is gold (title + chevron); "what's this" sits close beside.
  vinsterHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  vinsterReviewTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: '#FFFFFF' },
  // Full-width separator between card sections.
  cardDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  // Field label + dictation mic on one row.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, marginBottom: 6 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  // Cormorant — section header
  sectionTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  // "Your Review" gets a larger subheader treatment vs other section titles.
  reviewSectionTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text },
  // A line above the Your Review block on wishlist cards (sits between the
  // Estimated Value stats and the review section).
  reviewDivider: { height: 1, backgroundColor: colors.border, marginTop: spacing.sm },
  // Cormorant — edit link reads as a button
  editLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  // Inter — tasting notes body
  tastingNotes: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22 },
  // Vinster's Review toggle — mirrors the List results "Sommelier Note":
  // gold uppercase label + chevron, centred, with the "(what's this)"
  // explainer link beside it.
  vinsterReviewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  vinsterReviewToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  vinsterReviewToggleText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2 },
  // (toggle label intentionally Cormorant, matching the List Sommelier Note toggle)
  // Inter — form label
  fieldLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — form input
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  buttonDisabled: { opacity: 0.6 },
  // Inter — cancel link inside modal (not a button)
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  // Inter — note body
  noteText: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 22 },
  noteInput: { minHeight: 90, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  // Cormorant — button text
  saveBtnText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  removeBlock: { paddingTop: spacing.sm },
  removeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  // Cormorant — button text
  removeBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  removeWineBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  // Cormorant — button text
  removeWineBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  archivedDeleteBtn: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  // Inter — subtle small info (archived date)
  archivedAt: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 0.5 },
  removalRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  removalHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  // Inter — subtle removal count read-out
  removalCount: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  // Inter — removal date caption
  removalDate: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  // Inter — removal note body
  removalNoteText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 20, marginBottom: 4 },
  // Inter — subtle hint
  removalArchiveHint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  removeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  removeModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Cormorant — remove modal title
  removeModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm, lineHeight: 28 },
  // Inter — remove modal body
  removeModalBody: { fontFamily: fonts.bodyItalic, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  removeModalConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  // Cormorant — modal confirm button text
  removeModalConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  removeModalCancel: { alignItems: 'center', paddingVertical: spacing.sm },
  // Inter — cancel link (not a button)
  removeModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  removeModalOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — modal OK button text
  removeModalOkText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Inter — caption status
  rackRemovalMsg: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  chefBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnDisabled: { opacity: 0.6 },
  // Cormorant — button text
  chefBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  archiveAccessBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.md },
  // Cormorant — button text
  archiveAccessBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  archiveModalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border },
  // Cormorant — archive modal title
  archiveModalTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: 2 },
  // Inter — wine sub-line in modal
  archiveModalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  archiveModalCancel: { alignItems: 'center', marginTop: spacing.md },
  // Inter — cancel link (not a button)
  archiveModalCancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  // Full-width "label left, value/action right" rows used for Purchase
  // and Estimated value — these get their own single-line treatment so the
  // CTAs are scannable instead of cramped into the 50%-wide grid.
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  // Inter — value label
  valueLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — value read-out
  valueText: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text, flexShrink: 1, textAlign: 'right' },
  // Inter — muted variant
  valueTextMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  // Cormorant — action link reads as a button
  valueAction: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  valueEditBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, justifyContent: 'flex-end' },
  // Inter — form input
  valueInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minWidth: 80, maxWidth: 120, textAlign: 'right' },
  // Inter — subtle cancel
  valueCancel: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Cormorant — save button text
  valueSave: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold },
  scoreNoteBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  // Inter — note label
  scoreNoteLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  // Inter — note body
  scoreNoteText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 18 },
  statCell: {
    width: '50%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  // Inter — stat label
  statLabel: {
    fontSize: 11,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Inter — stat value read-out
  statValue: {
    fontSize: 16,
    fontFamily: fonts.bodySemibold,
    color: colors.text,
    lineHeight: 20,
  },
  // Inter — muted variant
  statValueMuted: {
    color: colors.textMuted,
    fontFamily: fonts.bodyItalic,
  },
  // Estimated Value shown in gold with an inline "(update)" link.
  estimatedValueGold: {
    color: colors.gold,
  },
  // Gold note under an auto-estimated purchase price, prompting an update.
  priceEstimatedNote: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.gold,
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  estimateUpdateLink: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.gold,
    textDecorationLine: 'underline',
  },
  // Inter — small caption sub
  statSub: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    marginTop: 2,
  },
  // Cormorant — action link reads as a button
  statAction: {
    fontSize: 12,
    fontFamily: fonts.headingSemibold,
    color: colors.gold,
    marginTop: 4,
  },
  // Inter — subtle cancel
  statCancel: {
    fontSize: 12,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
  },
  // Inter — form input
  statInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  statActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  // Inter — subtle "(what's this)" inline link
  whatsThisLink: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
    marginLeft: spacing.sm,
  },
  // Inter — personal notes hint
  personalNotesHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  // Your Review quick-stats row — Score / Where / When at a glance.
  reviewQuickStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  reviewQuickCell: {
    flex: 1,
  },
  // Inter — quick stat label
  reviewQuickLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  // Inter — quick stat value read-out
  reviewQuickValue: {
    fontFamily: fonts.bodySemibold,
    fontSize: 15,
    color: colors.text,
  },
  // Inter — muted variant
  reviewQuickValueMuted: {
    color: colors.textMuted,
    fontFamily: fonts.bodyItalic,
  },
  // Inter — user written review body
  reviewNoteBody: {
    fontFamily: fonts.bodyItalic,
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  // Share-to-community + Share buttons under Your Review.
  reviewShareRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  reviewShareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  // Cormorant — share button text
  reviewShareBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 14,
    color: colors.gold,
  },
  // Hides the off-screen branded share card while it's mounted for
  // capture by react-native-view-shot.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
