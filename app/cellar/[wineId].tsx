import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, Keyboard, ActivityIndicator, Share } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { showAlert } from '../../src/components/AppAlert';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useCellar, useArchive, useWishList } from '../../src/hooks/useCellar';
import { WineReviewShareCard } from '../../src/components/WineReviewShareCard';
import { WineIntelShareCard } from '../../src/components/WineIntelShareCard';
import { NoIntelPrompt } from '../../src/components/NoIntelPrompt';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { COMMUNITY_ENABLED } from '../../src/constants/features';
import { useAuth } from '../../src/hooks/useAuth';
import { useRacks } from '../../src/hooks/useRacks';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { generatePairings } from '../../src/api/label';
import { valueWine } from '../../src/services/pricing';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine } from '../../src/api/racks';
import { addCellarWine, addCellarWineRemoval, listCellarWineRemovals } from '../../src/api/cellar';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../../src/services/reviewSync';
import { publishCommunityReview } from '../../src/api/community';
import { supabase } from '../../src/api/supabase';
import * as ImagePicker from 'expo-image-picker';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { LabelThumb } from '../../src/components/LabelThumb';
import { bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { fetchCellarLocations, addWinesToFilter, removeWineFromFilter } from '../../src/api/customFilters';
import { fetchStorageLocations, assignWineToStorageLocation } from '../../src/api/storageLocations';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { EditCellarReviewModal } from '../../src/components/EditCellarReviewModal';
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
  // Declining reads in the same gold as the other maturity levels — never red.
  declining: colors.gold,
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
  // A single listing's bottles can span several racks, so tally a per-rack
  // count and surface one "N bottles in <rack>" link for each.
  const wineRackCounts = slotAssignments.reduce<Record<string, number>>((acc, s) => {
    if (s.cellar_wine_id === wineId) acc[s.rack_id] = (acc[s.rack_id] ?? 0) + 1;
    return acc;
  }, {});
  const wineRacks = Object.entries(wineRackCounts).flatMap(([rackId, count]) => {
    const rack = racks.find((r) => r.id === rackId);
    return rack ? [{ rack, count }] : [];
  });

  // Cellar-wide Location filters — offered as add destinations and as the
  // "remove from which location?" choices.
  const { data: locations = [] } = useQuery({
    queryKey: ['cellar-locations', session?.user.id],
    queryFn: () => fetchCellarLocations(session!.user.id),
    enabled: !!session?.user.id,
  });
  // Cellar List "Location" filters this wine is filed under. Without this the
  // card only checked rack placement, so a wine filed ONLY in a Location kept
  // showing "Add to Location" as if it had none.
  const wineLocations = locations.filter((l) => l.wineIds?.includes(wineId ?? ''));

  // Other Home Storage (storage_locations) — also valid "Add to
  // Location" destinations. A wine filed here lives via
  // cellar_wines.storage_location_id (the shed, under the bed…).
  const { data: storageLocations = [] } = useQuery({
    queryKey: ['storage-locations', session?.user.id],
    queryFn: () => fetchStorageLocations(session!.user.id),
    enabled: !!session?.user.id,
  });
  const wineStorageLocation = storageLocations.find((l) => l.id === wine?.storage_location_id) ?? null;
  // The location whose membership a pending add/remove applies to.
  const [pendingLocationId, setPendingLocationId] = useState<string | null>(null);
  const [removeLocationId, setRemoveLocationId] = useState<string | null>(null);

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
  const [regionDraft, setRegionDraft] = useState('');
  const [vintageDraft, setVintageDraft] = useState('');
  const [grapeDraft, setGrapeDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Auto-generate intel the first time an un-enriched wine card is opened — e.g.
  // a wine added straight into a rack with no critic score / value / grape yet.
  // Fires once per wine; the user can still re-run via the Generate buttons.
  const autoGenRef = useRef<string | null>(null);
  // True while a first-open auto-generation is running — drives the full-screen
  // "generating" tracker so the card only ever appears finished.
  const [autoGenerating, setAutoGenerating] = useState(false);
  // True only when a first-open auto-generation genuinely produced NO intel —
  // so the "couldn't generate" prompt fires for a real miss, not the brief
  // window while the cache refetches the freshly-generated values.
  const [autoGenFailed, setAutoGenFailed] = useState(false);
  useEffect(() => {
    if (!wine || isWishlist || isArchived || refreshingValue) return;
    const ungenerated = wine.critic_score == null && wine.estimated_value == null && !wine.grape_variety;
    if (ungenerated && autoGenRef.current !== wine.id) {
      autoGenRef.current = wine.id;
      setAutoGenerating(true);
      handleRefreshEstimate()
        .then((produced) => setAutoGenFailed(!produced))
        .finally(() => setAutoGenerating(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wine?.id, wine?.critic_score, wine?.estimated_value, wine?.grape_variety, isWishlist, isArchived]);

  // After an auto-generate attempt, if Vinster still couldn't produce any intel
  // (no critic score and no value), it's almost always because the wine name is
  // misspelt or the producer/name are in the wrong fields — so prompt the user
  // to check and edit. Dismissible; resets per wine.
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  useEffect(() => { setNoIntelDismissed(false); setAutoGenFailed(false); }, [wine?.id]);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  // The review is now edited only through the canonical EditCellarReviewModal,
  // never inline on the card. This opens it.
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
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

  // Same off-screen-capture pattern for the top-right "Share" on the wine
  // card itself — shares Vinster's intelligence (scores, value, tasting note).
  const intelShareRef = useRef<View>(null);
  const [sharingIntel, setSharingIntel] = useState(false);
  const [intelSharePayload, setIntelSharePayload] = useState<React.ComponentProps<typeof WineIntelShareCard> | null>(null);

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

  // Long-press on the thumbnail → change or remove. The label library is fed
  // only by actual label scans now (the Scan Archive), so cellar wines no
  // longer copy themselves into it — that was the duplication we removed.
  function handlePhotoMenu() {
    showAlert({
      title: 'Label photo',
      body: 'Change this label photo, or remove it.',
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
    setRegionDraft(wine.region ?? '');
    setVintageDraft(wine.vintage ?? '');
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
          region: regionDraft.trim() || null,
          vintage: vintageDraft.trim() || null,
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

  // First open of an un-enriched wine: keep the card hidden behind the List-style
  // generating tracker until Vinster's intel is in, so the user only ever sees
  // the finished card — never it assembling. (Shown from load → through gen;
  // hides once enriched, or if generation fails.)
  const ungeneratedNow = wine.critic_score == null && wine.estimated_value == null && !wine.grape_variety;
  if (!isWishlist && !isArchived && (autoGenerating || (ungeneratedNow && autoGenRef.current !== wine.id))) {
    return (
      <SearchProgress
        title="Vinster is generating Wine Intel"
        subtitle="You'll have it in just a moment"
        body="Vinster is pulling together critic scores, market value, the drinking window and a tasting note for this wine."
        durationMs={25000}
      />
    );
  }

  // Send the wine to a rack grid for visual placement (existing flow).
  function placeInRack(rackId: string) {
    setPendingWineId(wine!.id);
    setPendingAddMode(true);
    router.push(`/cellar/rack/${rackId}` as any);
  }

  // File the (unplaced) wine under a cellar-wide bespoke Location filter — an
  // instant tag, no physical placement.
  async function addWineToLocationFilter(locationId: string) {
    try {
      await addWinesToFilter(locationId, [wine!.id]);
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      showAlert({ title: 'Added to location', body: `Filed under ${locations.find((l) => l.id === locationId)?.name ?? 'the location'}.` });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // File the (unplaced) wine into an Other Home Storage location — the same
  // cellar_wines.storage_location_id assignment the location screen uses.
  async function fileInStorageLocation(locationId: string) {
    try {
      await assignWineToStorageLocation(wine!.id, locationId);
      qc.invalidateQueries({ queryKey: ['storage-locations'] });
      qc.invalidateQueries({ queryKey: ['storage-location-wines', locationId] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      showAlert({ title: 'Added to location', body: `Now living in ${storageLocations.find((l) => l.id === locationId)?.name ?? 'the location'}.` });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // "Add to Location" on an unplaced wine — place it in a live rack/fridge, file
  // it into an Other Home Storage location, or tag it under a Cellar List location.
  function handleAddToLocation() {
    const buttons = [
      ...racks.map((r) => ({ text: r.name, onPress: () => placeInRack(r.id) })),
      ...storageLocations.map((l) => ({ text: `${l.name} (home storage)`, onPress: () => fileInStorageLocation(l.id) })),
      ...locations.map((l) => ({ text: `${l.name} (location)`, onPress: () => addWineToLocationFilter(l.id) })),
    ];
    if (buttons.length === 0) {
      showAlert({ title: 'No locations yet', body: 'Create a rack, fridge, a home storage location, or a Cellar List location first, then you can add wines to it.' });
      return;
    }
    showAlert({
      title: 'Add to Location',
      body: 'Place it in a rack/fridge, a home storage location, or file it under a Cellar List location:',
      buttons: [
        ...buttons,
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  // Add to the Cellar List with no specific folder — just bump the count.
  // Deliberately does NOT tag the wine into any bespoke Location folder, so a
  // same-wine bottle already filed in a folder keeps its membership untouched.
  function startAddToCellarList() {
    setPendingLocationId(null);
    setAddBottlesCount('1');
    setAddBottlesOpen(true);
  }

  function handleAddBottlesEntry() {
    // "+ Add bottles" → choose a destination first: a live rack/fridge for
    // visual placement, or the Cellar List for a plain count bump. We do NOT
    // list bespoke Location folders here — folders are managed in the Cellar
    // List itself, and offering them here filed bottles into the wrong place.
    const dests: { text: string; onPress: () => void }[] = [
      ...racks.map((r) => ({ text: r.name, onPress: () => placeInRack(r.id) })),
      { text: 'Cellar List', onPress: startAddToCellarList },
    ];
    if (dests.length === 1) {
      // Only the Cellar List option (no racks/fridges yet) — skip the prompt.
      dests[0].onPress();
      return;
    }
    showAlert({
      title: 'Add to',
      body: 'Where are these bottles going?',
      buttons: [
        ...dests,
        { text: 'Cancel', style: 'cancel' as const, onPress: () => { setPendingWineId(null); setPendingAddMode(false); setPendingLocationId(null); } },
      ],
    });
  }

  // "- Remove bottles" → if the wine is filed under more than one location, ask
  // which one first; then the existing Archive/Delete popup runs.
  function handleRemoveBottlesEntry() {
    const inLocs = locations.filter((l) => l.wineIds.includes(wine!.id));
    if (inLocs.length > 1) {
      showAlert({
        title: 'Remove from which location?',
        body: 'This wine is filed under more than one location.',
        buttons: [
          ...inLocs.map((l) => ({ text: l.name, onPress: () => { setRemoveLocationId(l.id); setArchiveModalOpen(true); } })),
          { text: 'Cancel', style: 'cancel' as const },
        ],
      });
    } else {
      setRemoveLocationId(inLocs[0]?.id ?? null);
      setArchiveModalOpen(true);
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
      // Removal was scoped to a location → untag the wine from it. Single-row
      // delete (not a full set-replace), so other members are never touched.
      if (removeLocationId) {
        await removeWineFromFilter(removeLocationId, wine!.id);
        qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
        setRemoveLocationId(null);
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
      // If the user picked a Location for this add, file the wine under it.
      // Incremental insert (ignores duplicates) — never rewrites the set from a
      // cached list, so a stale cache can't drop the location's other wines.
      if (pendingLocationId) {
        await addWinesToFilter(pendingLocationId, [wine!.id]);
        qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      }
      setAddBottlesOpen(false);
      setAddBottlesCount('1');
      setPendingLocationId(null);
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

  // The Your Review chevron just expands/collapses the read-only note now —
  // editing happens in EditCellarReviewModal, so there's no save-on-collapse
  // (which previously saved date-stamp-only reviews). Personal Notes still
  // uses the inline auto-save pattern below.
  function toggleReview() {
    setReviewExpanded((v) => !v);
  }
  // Personal Notes is display-only on the card now — the chevron just
  // expands/collapses. Editing happens in the canonical review form.
  function toggleNote() {
    setEditingNote((v) => !v);
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
      // The FK cascade drops the wine from every location's membership; refresh
      // the Location lists so those counts update without a manual reload.
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
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

  async function handleRefreshEstimate(): Promise<boolean> {
    if (!wine) return false;
    setRefreshingValue(true);
    const currency = preferences?.defaultCurrency ?? 'GBP';
    try {
      // valueWine() tries Wine-Searcher first (real market price + ws-score as
      // the critic-score anchor), falling back to the Claude estimate when
      // there's no match. The critic score is always a Vinster score, anchored
      // to Wine-Searcher's when available.
      const v = await valueWine({
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        wineName: wine.wine_name || null,
        vintage: wine.vintage || 'NV',
      } as any, currency);
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          estimated_value: v.estimatedValue,
          estimated_value_currency: v.currency,
          estimated_value_at: new Date().toISOString(),
          estimated_value_source: v.valueSource,
          // Keep the (WS-anchored) critic score fresh on refresh too.
          critic_score: v.criticScore,
          critic_score_note: v.criticScoreNote,
          // valueWine() also returns Vinster's tasting note + drinking window
          // (+ grape). Persist them so imported/bare wines gain a Vinster's
          // Review and drinking window from the same Generate action — these
          // were previously discarded, leaving the note permanently blank.
          tasting_notes: v.tastingNotes ?? wine.tasting_notes ?? null,
          drinking_window_from: v.drinkingWindowFrom ?? wine.drinking_window_from ?? null,
          drinking_window_to: v.drinkingWindowTo ?? wine.drinking_window_to ?? null,
          drinking_window_status: v.drinkingWindowStatus ?? wine.drinking_window_status ?? 'unknown',
          // Only fill grape if we don't already have one (don't clobber a user edit).
          grape_variety: wine.grape_variety ?? v.grapeVariety ?? null,
          // Seed an estimated purchase price from the market value when the user
          // hasn't entered one — never clobber a real price they've recorded.
          purchase_price: wine.purchase_price ?? v.estimatedValue ?? null,
          purchase_price_currency: wine.purchase_price != null ? wine.purchase_price_currency : (v.currency ?? null),
        },
      });
      // Whether intel actually came back — used to decide if the "couldn't
      // generate" prompt is warranted (vs a false flash while the cache
      // refetches the freshly-saved values).
      return v.criticScore != null || v.estimatedValue != null;
    } catch {
      showAlert({ title: 'Could not refresh', body: 'Vinster couldn\'t generate an estimate right now. Please try again.' });
      return false;
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
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
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

  async function handleShareIntel() {
    if (!wine || sharingIntel) return;
    const headerLine = (() => {
      const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
      return sameName
        ? [wine.producer, wine.vintage].filter(Boolean).join(' ')
        : [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
    })();
    // Only share an unambiguous year range — skip the bare "Unknown" status.
    const drinkingWindow = wine.drinking_window_from && wine.drinking_window_to
      ? `${wine.drinking_window_from}–${wine.drinking_window_to}`
      : null;
    const estimatedValue = wine.estimated_value != null
      ? formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })
      : null;
    setIntelSharePayload({
      producer: wine.producer,
      wineName: wine.wine_name,
      vintage: wine.vintage,
      region: wine.region,
      grape: wine.grape_variety,
      criticScore: wine.critic_score,
      drinkingWindow,
      estimatedValue,
      tastingNote: wine.tasting_notes,
    });
    setSharingIntel(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 250));
      if (intelShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(intelShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const lines: string[] = [];
      if (wine.critic_score != null) lines.push(`Critic score: ${wine.critic_score} pts`);
      if (drinkingWindow) lines.push(`Drinking window: ${drinkingWindow}`);
      if (estimatedValue) lines.push(`Estimated value: ${estimatedValue}`);
      const note = (wine.tasting_notes ?? '').trim();
      const noteFormatted = note ? `\n\n${note}` : '';
      const statsFormatted = lines.length ? `\n${lines.join('\n')}` : '';
      await Share.share({
        message: `${headerLine}${statsFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: headerLine,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingIntel(false);
      setIntelSharePayload(null);
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
  const archivedMatches = archivedWines.filter(matchesIdentity);
  const bottlesInArchive = archivedMatches.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  // Most-recent archive date + bottle size among the matching archived bottles,
  // for the "Bottles in My Archive" stat (e.g. "1x75cl, 24/06/26").
  const lastArchivedAt = archivedMatches.reduce<string | null>((latest, w) => {
    if (!w.archived_at) return latest;
    return !latest || new Date(w.archived_at).getTime() > new Date(latest).getTime() ? w.archived_at : latest;
  }, null);
  const archiveBottleMl = archivedMatches.find((w) => w.bottle_size_ml)?.bottle_size_ml ?? wine.bottle_size_ml ?? 750;

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
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        {/* Card-type label — sits centred between Back and the star
            so it reads as a chip / breadcrumb identifying which kind
            of card the user is looking at. */}
        <Text style={styles.cardTypeLabel}>
          {isWishlist ? 'Wish List Wine' : isArchived ? 'Archived Wine' : 'Wine Card'}
        </Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            onPress={handleShareIntel}
            disabled={sharingIntel}
            hitSlop={{ top: 10, bottom: 6, left: 12, right: 12 }}
          >
            <Text style={[styles.topBarShareText, sharingIntel && { color: colors.textMuted }]}>
              {sharingIntel ? 'Preparing…' : 'Share'}
            </Text>
          </TouchableOpacity>
          {!isArchived ? (
            <TouchableOpacity onPress={handleToggleFavourite} hitSlop={{ top: 6, bottom: 10, left: 12, right: 12 }}>
              <Text style={[styles.favouriteStar, wine.is_favourite && styles.favouriteStarActive]}>
                {wine.is_favourite ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Date cellared — sits just below the 'Wine Card' chip, with a gap before
          the wine name. Same muted style as before. */}
      {(() => {
        const added = wine.date_received ?? wine.created_at;
        if (!added) return null;
        const cellaredLabel = `Cellared ${new Date(added).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        return <Text style={styles.addedDateTop}>{cellaredLabel}</Text>;
      })()}

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
            {/* Bottle format shown only when non-standard (750ml is the default
                and mentioning it everywhere is noise) — e.g. a magnum reads
                "150cl" so the format is recorded on the card, not just the list. */}
            {wine.bottle_size_ml && wine.bottle_size_ml !== 750 ? (
              <Text style={styles.bottleFormat}>{bottleSizeLabel(wine.bottle_size_ml)} bottle</Text>
            ) : null}
            <View style={styles.editRow}>
              <TouchableOpacity onPress={openTitleEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                <Text style={styles.editTitleLink}>Edit</Text>
              </TouchableOpacity>
            </View>
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
            {/* Label photo — add / change / remove without leaving the Edit sheet.
                Closes this modal first so the picker/menu isn't stacked behind it. */}
            <Text style={styles.fieldLabel}>Label photo</Text>
            <View style={styles.editPhotoRow}>
              <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.editThumb} />
              <TouchableOpacity
                onPress={() => { setTitleEditOpen(false); void handleAddPhoto(); }}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.editPhotoLink}>{wine.label_image_path ? 'Change label photo' : '+ Add label photo'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Producer</Text>
            <TextInput style={styles.input} value={producerDraft} onChangeText={setProducerDraft} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Wine name</Text>
            <TextInput style={styles.input} value={wineNameDraft} onChangeText={setWineNameDraft} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Region</Text>
            <TextInput style={styles.input} value={regionDraft} onChangeText={setRegionDraft} placeholder="Region" placeholderTextColor={colors.textMuted} />
            <Text style={styles.fieldLabel}>Vintage</Text>
            <TextInput style={styles.input} value={vintageDraft} onChangeText={setVintageDraft} placeholder="Vintage (e.g. 2019 or NV)" placeholderTextColor={colors.textMuted} maxLength={7} />
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

      {/* Couldn't-generate-intel prompt. Shows after a failed auto-generate
          (no critic score and no value) — usually a misspelt or wrongly-split
          name. Offers a jump straight into the Edit sheet. */}
      <NoIntelPrompt
        visible={
          !!wine && !isWishlist && !isArchived && !autoGenerating && !refreshingValue &&
          autoGenRef.current === wine.id && autoGenFailed && wine.critic_score == null && wine.estimated_value == null &&
          !noIntelDismissed
        }
        onDismiss={() => setNoIntelDismissed(true)}
        onEdit={() => { setNoIntelDismissed(true); openTitleEdit(); }}
        editLabel="Edit Wine"
      />

      {/* Compact stats grid — score / window / bottle counts only. The
          Purchase and Estimated values are pulled out into full-width rows
          below so each has room to breathe and a clearer call to action. */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Avg Critic Score</Text>
          {wine.critic_score != null ? (
            <Text style={styles.statValue}>{wine.critic_score}</Text>
          ) : refreshingValue ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>Generating…</Text>
          ) : (
            <TouchableOpacity onPress={handleRefreshEstimate} disabled={refreshingValue} activeOpacity={0.7}>
              <Text style={styles.statAction}>+ Generate</Text>
            </TouchableOpacity>
          )}
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
                <Text style={styles.statSub}>
                  {wine.estimated_value_source === 'wine-searcher' ? 'Wine-Searcher · ' : ''}
                  {new Date(wine.estimated_value_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
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
          <Text style={styles.statValue}>{bottlesInCellar}x{bottleSizeLabel(wine.bottle_size_ml ?? 750)}</Text>
          {wineRacks.map(({ rack, count }) => (
            <TouchableOpacity key={rack.id} onPress={() => router.push(`/cellar/rack/${rack.id}?highlight=${wine.id}`)}>
              <Text style={styles.statAction}>{count} bottle{count === 1 ? '' : 's'} in {rack.name} →</Text>
            </TouchableOpacity>
          ))}
          {wineLocations.map((l) => (
            <Text key={l.id} style={styles.statAction}>In {l.name}</Text>
          ))}
          {wineStorageLocation && (
            <TouchableOpacity onPress={() => router.push(`/cellar/storage-location/${wineStorageLocation.id}` as any)}>
              <Text style={styles.statAction}>In {wineStorageLocation.name} →</Text>
            </TouchableOpacity>
          )}
          {wineRacks.length === 0 && wineLocations.length === 0 && !wineStorageLocation && !isArchived && !isWishlist && (
            <TouchableOpacity onPress={handleAddToLocation}>
              <Text style={styles.statAction}>Add to Location</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Archive</Text>
          {bottlesInArchive === 0 ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>{bottleLabel(0)}</Text>
          ) : (
            <Text style={styles.statValue}>
              {bottlesInArchive}x{bottleSizeLabel(archiveBottleMl)}
              {lastArchivedAt ? `, ${new Date(lastArchivedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}` : ''}
            </Text>
          )}
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

        {(wine.review_score != null || wine.review_note || wine.review_location || wine.review_date || wine.user_drinking_window) ? (
          <View style={styles.reviewQuickStats}>
            <View style={styles.reviewQuickCell}>
              <Text style={styles.reviewQuickLabel}>Score</Text>
              <Text style={[styles.reviewQuickValue, wine.review_score == null && styles.reviewQuickValueMuted]}>
                {wine.review_score != null ? `${wine.review_score}/100` : '—'}
              </Text>
            </View>
            <View style={styles.reviewQuickCell}>
              <Text style={styles.reviewQuickLabel}>Drinking Window</Text>
              <Text style={[styles.reviewQuickValue, !wine.user_drinking_window && styles.reviewQuickValueMuted]} numberOfLines={1}>
                {wine.user_drinking_window || '—'}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setReviewModalOpen(true)} activeOpacity={0.7}>
            <Text style={styles.addReviewLink}>+ Add Review</Text>
          </TouchableOpacity>
        )}

        {reviewExpanded && (wine.review_score != null || wine.review_note || wine.review_location || wine.review_date || wine.user_drinking_window) ? (
          <>
            {wine.review_note ? (
              <Text style={styles.reviewNoteBody}>“{wine.review_note}”</Text>
            ) : null}

            {/* Share-to-community + share-outside-the-app — disabled until a
                written review exists. Editing opens the canonical review form. */}
            <View style={styles.reviewShareRow}>
              <TouchableOpacity
                style={[styles.reviewShareBtn, (!COMMUNITY_ENABLED || postingReview || reviewPosted || !wine.review_note) && styles.buttonDisabled]}
                onPress={handlePostToCommunity}
                disabled={!COMMUNITY_ENABLED || postingReview || reviewPosted || !wine.review_note}
                activeOpacity={0.7}
              >
                <Text style={styles.reviewShareBtnText}>
                  {!COMMUNITY_ENABLED ? 'Share to Community' : reviewPosted ? '✓ Posted' : postingReview ? 'Posting…' : 'Share to Community'}
                </Text>
                {!COMMUNITY_ENABLED ? <Text style={styles.reviewShareBtnSub}>(coming soon)</Text> : null}
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
            <TouchableOpacity onPress={() => setReviewModalOpen(true)} activeOpacity={0.7}>
              <Text style={styles.editReviewLink}>Edit Review</Text>
            </TouchableOpacity>
          </>
        ) : null}
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
        {wine.user_notes ? (
          editingNote ? (
            <>
              <Text style={styles.noteText}>{wine.user_notes}</Text>
              <TouchableOpacity onPress={() => setReviewModalOpen(true)} activeOpacity={0.7}>
                <Text style={styles.editReviewLink}>Edit Personal Note</Text>
              </TouchableOpacity>
            </>
          ) : null
        ) : (
          <TouchableOpacity onPress={() => setReviewModalOpen(true)} activeOpacity={0.7}>
            <Text style={styles.addReviewLink}>+ Add Personal Note</Text>
          </TouchableOpacity>
        )}
      </View>
      )}

      {/* Vinster's Review — Vinster's AI tasting note, collapsed behind a
          chevron toggle. Sits last of the three review blocks (after Your
          Review and Personal Notes). The "(what's this)" link surfaces a
          short explainer. Hidden for wishlist wines: their stored note is
          the user's own, and Vinster's AI review only exists in the cellar. */}
      {!isWishlist ? (
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
            wine.tasting_notes ? (
              <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
            ) : refreshingValue ? (
              <Text style={[styles.tastingNotes, { fontStyle: 'italic' }]}>Generating Vinster's review…</Text>
            ) : (
              // No AI note yet (e.g. an imported wine) — offer to generate it.
              <TouchableOpacity style={styles.generateNoteBtn} onPress={handleRefreshEstimate} activeOpacity={0.7}>
                <Text style={styles.generateNoteBtnText}>Generate</Text>
              </TouchableOpacity>
            )
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
            style={[styles.chefBtn, (!COMMUNITY_ENABLED || postingReview || reviewPosted) && styles.chefBtnDisabled]}
            onPress={handlePostToCommunity}
            disabled={!COMMUNITY_ENABLED || postingReview || reviewPosted}
            activeOpacity={0.7}
          >
            <Text style={styles.chefBtnText}>
              {!COMMUNITY_ENABLED ? 'Post Review To Community (coming soon)' : reviewPosted ? '✓ Posted to Community' : postingReview ? 'Posting…' : 'Post Review To Community'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
            <Text style={styles.chefBtnText}>Find me a recipe for this wine</Text>
          </TouchableOpacity>
        )
      )}

      {/* Dive Deeper — opens the Vinster "Wine Knowledge" page (producer /
          region / vintage / grape profiles). Available for wishlist wines too. */}
      {!isArchived && (
        <TouchableOpacity
          style={[styles.chefBtn, { marginTop: spacing.md }]}
          onPress={() => router.push(`/cellar/wine-knowledge/${wine.id}`)}
        >
          <Text style={styles.chefBtnText}>Dive Deeper into this wine</Text>
        </TouchableOpacity>
      )}

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
            {pendingLocationId ? (
              <Text style={styles.addToLocationNote}>Filing under {locations.find((l) => l.id === pendingLocationId)?.name ?? 'location'}</Text>
            ) : null}

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

            <TouchableOpacity onPress={() => { setAddBottlesOpen(false); setPendingLocationId(null); }} style={styles.archiveModalCancel} disabled={addingBottles}>
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

      {/* Off-screen share card for the top-right "Share" on the wine card. */}
      {intelSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineIntelShareCard ref={intelShareRef} {...intelSharePayload} />
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

      {/* Canonical review form — the single place a cellar wine's review is
          edited (same component Your Wine Reviews opens). Reached via 'Add
          Review' / 'Edit Review' on the card. */}
      <EditCellarReviewModal
        wine={wine}
        visible={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSaved={() => qc.invalidateQueries({ queryKey: ['cellar'] })}
      />
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
  // Back / Share share one Cormorant face, regular weight, first-letter cap —
  // level with the bold WINE CARD title between them.
  backText: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.gold },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  // Cormorant — card-type header title, bold + uppercase.
  cardTypeLabel: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md,
  },
  topBarActions: { flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  topBarShareText: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.gold },
  editPhotoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  editThumb: { width: 44, height: 56 },
  editPhotoLink: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold },
  favouriteStar: { fontSize: 28, color: 'rgba(255,255,255,0.55)', lineHeight: 28 },
  favouriteStarActive: { color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerTextCol: { flex: 1 },
  addedDate: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Date added, centred under the 'Cellar Wine' chip with a gap before the name.
  addedDateTop: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  // Grape (left) + Added (right) on one line; Edit on its own line below.
  grapeRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 2 },
  editRow: { alignItems: 'flex-end', marginTop: 2 },
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
  grape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold },
  // Non-standard bottle format line under the grape (e.g. "150cl bottle").
  bottleFormat: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 2 },
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
  reviewSubsection: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  reviewSubTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  // Vinster's Review is gold (title + chevron); "what's this" sits close beside.
  vinsterHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  vinsterReviewTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: '#FFFFFF' },
  // Full-width separator between card sections.
  cardDivider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.md },
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
  // "Generate" button shown inside Vinster's Review when there's no note yet.
  generateNoteBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  generateNoteBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
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
  archiveAccessBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.md },
  // Cormorant — button text
  archiveAccessBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  archiveModalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border },
  // Cormorant — archive modal title
  archiveModalTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: 2 },
  // Inter — wine sub-line in modal
  archiveModalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  addToLocationNote: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: -spacing.sm, marginBottom: spacing.lg },
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
  // Gold "+ Add Review" link (no review yet) + "Edit Review" link (review exists).
  addReviewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginTop: spacing.sm },
  editReviewLink: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, textDecorationLine: 'underline', marginTop: spacing.sm, textAlign: 'center' },
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
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cormorant — share button text
  reviewShareBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 14,
    color: colors.gold,
    textAlign: 'center',
  },
  // Small "(coming soon)" sub-line under the Share to Community label.
  reviewShareBtnSub: {
    fontFamily: fonts.bodyRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  // Hides the off-screen branded share card while it's mounted for
  // capture by react-native-view-shot.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
