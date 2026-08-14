import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Image, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { router } from 'expo-router';
import { useLabels } from '../../src/hooks/useLabels';
import { useCellar } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { findWineConnections, type WineConnections } from '../../src/utils/wineConnections';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { findMatchingChosenWine, deleteChosenWine } from '../../src/api/chosenWines';
import { useLabelImageUrl } from '../../src/hooks/useLabelImageUrl';
import { generateWineIntel } from '../../src/services/pricing';
import { showAlert } from '../../src/components/AppAlert';
import { LabelThumb } from '../../src/components/LabelThumb';
import { LabelShareCard } from '../../src/components/LabelShareCard';
import { labelSignedUrl } from '../../src/api/labelPhotos';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { cityKey } from '../../src/utils/city';
import { foldAccents } from '../../src/utils/wineIdentity';
import type { CellarWine, LibraryLabel, WineDetailsComplete, WineIntelligence } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

// Filter chips mirror the Lineup Library exactly: Date · City · Favourites · +Add.
const FAV_OPTIONS = [
  { value: 'all', label: 'All labels' },
  { value: 'fav', label: 'Favourites only' },
];
function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

type FilterField = 'date' | 'city' | 'fav' | null;

function formatStamp(label: LibraryLabel): string {
  const date = new Date(label.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const place = [label.captured_place, label.captured_city].filter(Boolean).join(', ');
  return place ? `${date} · ${place}` : date;
}

// Build a WineDetailsComplete identity from a label row, for intel + review.
function detailsFromLabel(label: LibraryLabel): WineDetailsComplete {
  return {
    producer: label.producer ?? '',
    region: label.region ?? '',
    wineName: label.wine_name,
    vintage: label.vintage != null ? String(label.vintage) : '',
  };
}

// A cellar wine already carries generated intel in its columns — snapshot it so
// a "Select from Cellar" label can show View Wine Intel without regenerating.
function intelFromCellar(w: CellarWine): WineIntelligence {
  return {
    criticScore: w.critic_score,
    criticScoreNote: w.critic_score_note,
    drinkingWindowFrom: w.drinking_window_from,
    drinkingWindowTo: w.drinking_window_to,
    drinkingWindowStatus: (w.drinking_window_status as WineIntelligence['drinkingWindowStatus']) ?? 'unknown',
    grapeVariety: w.grape_variety,
    tastingNotes: w.tasting_notes ?? '',
    estimatedValue: w.estimated_value,
    valueSource: (w.estimated_value_source as WineIntelligence['valueSource']) ?? null,
  };
}

// Full-screen viewer for a short-tapped thumbnail — resolves the cached image
// and shows it with the name + date; tap anywhere to dismiss.
function ExpandedLabelModal({ label, onClose }: { label: LibraryLabel; onClose: () => void }) {
  const uri = useLabelImageUrl(label.label_image_path);
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.expandOverlay} activeOpacity={1} onPress={onClose}>
        {uri ? (
          <Image source={{ uri }} style={styles.expandImage} resizeMode="contain" />
        ) : (
          <ActivityIndicator color={colors.gold} />
        )}
        <View style={styles.expandCaptionWrap} pointerEvents="none">
          <Text style={styles.expandCaption} numberOfLines={2}>
            {wineHeaderLine(label.producer, label.wine_name, label.vintage) || label.wine_name || label.producer || 'Wine label'}
          </Text>
          <Text style={styles.expandDate}>{new Date(label.created_at).toLocaleDateString('en-GB')}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function MyLabelsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { labels, isLoading, remove, setFavourite, create, setLocation } = useLabels();
  const { wines: cellarWines, addWine } = useCellar();
  const { chosenWines } = useChosenWines();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const { width } = useWindowDimensions();

  const [favFilter, setFavFilter] = useState<'all' | 'fav'>('all');
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  // Tappable location editor — GPS sometimes stamps the wrong town.
  const [editingLoc, setEditingLoc] = useState<LibraryLabel | null>(null);
  const [locCityDraft, setLocCityDraft] = useState('');
  const [locPlaceDraft, setLocPlaceDraft] = useState('');
  const [expandedLabel, setExpandedLabel] = useState<LibraryLabel | null>(null);
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [addOpen, setAddOpen] = useState(false);

  // Bespoke user-created filters (the "+ Add" chip) — same system the Lineup
  // Library uses, scoped to labels.
  const { filters: customFilters, create: createFilter, setItems: setFilterItems, rename: renameFilter, remove: removeFilter } = useLibraryFilters('label');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);
  const [selectCellarOpen, setSelectCellarOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const [generatingIntel, setGeneratingIntel] = useState(false);
  // Share-thumbnail flow: the label being shared, its optional note, the
  // resolved signed URL for the off-screen branded card, and the capture ref.
  const [shareLabel, setShareLabel] = useState<LibraryLabel | null>(null);
  const [shareNote, setShareNote] = useState('');
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<View>(null);

  const { setImage, setWineDetails, setError } = useLabelStore();

  // Date (month) options — distinct months labels were scanned, newest first.
  const monthOptions = useMemo(() => {
    const seen: string[] = [];
    for (const l of labels) { const k = monthKey(l.created_at); if (!seen.includes(k)) seen.push(k); }
    return [{ value: 'All', label: 'All dates' }, ...seen.map((m) => ({ value: m, label: m }))];
  }, [labels]);

  // City options — distinct places labels were captured, de-duplicated by
  // canonical key so "Novello" and "Novello, Italy" collapse to one entry.
  const cityOptions = useMemo(() => {
    const byKey = new Map<string, string>();
    for (const l of labels) {
      const c = (l.captured_city ?? '').trim();
      if (!c) continue;
      const key = cityKey(c);
      const prev = byKey.get(key);
      if (!prev || c.length > prev.length) byKey.set(key, c);
    }
    const seen = Array.from(byKey.values()).sort((a, b) => a.localeCompare(b));
    return [{ value: 'All', label: 'All cities' }, ...seen.map((c) => ({ value: c, label: c }))];
  }, [labels]);

  // Always listed by recency; the chips filter within that order.
  const shown = useMemo(() => {
    let base = labels;
    if (favFilter === 'fav') base = base.filter((l) => l.is_favourite);
    if (cityFilter !== 'All') base = base.filter((l) => cityKey(l.captured_city) === cityKey(cityFilter));
    if (dateFilter !== 'All') base = base.filter((l) => monthKey(l.created_at) === dateFilter);
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      const ids = new Set(f?.itemIds ?? []);
      base = base.filter((l) => ids.has(l.id));
    }
    // Free-text search narrows whatever the chips already filter — matches
    // producer, wine, vintage, region and the captured venue / city.
    const q = foldAccents(search.trim());
    if (q) {
      base = base.filter((l) =>
        foldAccents([l.producer, l.wine_name, l.vintage != null ? String(l.vintage) : '', l.region, l.captured_place, l.captured_city].filter(Boolean).join(' ')).includes(q),
      );
    }
    return [...base].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [labels, favFilter, cityFilter, dateFilter, activeCustomId, customFilters, search]);

  // Bespoke-filter management — mirrors the Lineup Library.
  function applyCustom(id: string) {
    setActiveCustomId((prev) => (prev === id ? null : id));
  }
  function openCreateFilter() {
    setEditingFilter(null);
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: LibraryFilter) {
    showAlert({
      title: f.name,
      body: 'Edit this filter’s name and labels, or delete it. Your labels stay in the library either way.',
      buttons: [
        { text: 'Edit', onPress: () => { setEditingFilter(f); setFilterModalOpen(true); } },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomId === f.id) setActiveCustomId(null); removeFilter.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveFilter(name: string, ids: string[]) {
    setSavingFilter(true);
    try {
      if (editingFilter) {
        await renameFilter.mutateAsync({ filterId: editingFilter.id, name });
        await setFilterItems.mutateAsync({ filterId: editingFilter.id, itemIds: ids });
      } else {
        await createFilter.mutateAsync({ name, itemIds: ids });
      }
      setFilterModalOpen(false);
      setEditingFilter(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }
  // Items offered in the create/edit sheet — every label, by wine name + date.
  const filterItems = useMemo(() => labels.map((l) => ({
    id: l.id,
    label: wineHeaderLine(l.producer, l.wine_name, l.vintage) || l.wine_name || l.producer || 'Wine label',
    sublabel: new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  })), [labels]);

  // Where each label's wine also lives — reviews / cellar / restaurant — so the
  // tile can badge the connection and jump to it (vintage-agnostic match).
  const connByLabel = useMemo(() => {
    const m = new Map<string, WineConnections>();
    for (const l of labels) {
      m.set(l.id, findWineConnections(
        { producer: l.producer, wineName: l.wine_name, vintage: l.vintage, wsWineId: l.ws_wine_id },
        { chosenWines, cellarWines },
      ));
    }
    return m;
  }, [labels, chosenWines, cellarWines]);

  // Cellar wines that have a label photo — the pool for "Select from Cellar".
  // Web-fetched labels are excluded: they're third-party imagery kept private,
  // so they never reach the shareable Label Library.
  const cellarWithPhotos = useMemo(() => cellarWines.filter((w) => w.label_image_path && !w.label_image_fetched), [cellarWines]);

  async function toggleFav(label: LibraryLabel) {
    try {
      await setFavourite.mutateAsync({ id: label.id, value: !label.is_favourite });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function openLocationEditor(label: LibraryLabel) {
    setEditingLoc(label);
    setLocPlaceDraft((label.captured_place ?? '').trim());
    setLocCityDraft((label.captured_city ?? '').trim());
  }

  async function saveLocation() {
    if (!editingLoc) return;
    const label = editingLoc;
    setEditingLoc(null);
    try {
      await setLocation.mutateAsync({ id: label.id, place: locPlaceDraft, city: locCityDraft });
    } catch (err) {
      showAlert({ title: 'Could not update location', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // +Add · Scan Label — run the Scan Wine Label intel flow; the intel card
  // offers "Add label to Label Library?" on the result.
  function handleScan() {
    setAddOpen(false);
    router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/scan/archive')}`);
  }

  // +Add · Upload a Photo — same intel flow, seeded from a gallery image.
  async function handleUpload() {
    setAddOpen(false);
    // Defer the native picker past the modal's close animation — launching it
    // the same tick a <Modal> starts dismissing can silently swallow the picker
    // call (the "upload bounce" fixed in scan.tsx via the same deferral).
    await new Promise((r) => setTimeout(r, 350));
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setScanningLabel(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    } finally {
      setScanningLabel(false);
    }
    router.push(`/label/confirm?context=intel&backTo=${encodeURIComponent('/scan/archive')}`);
  }

  // +Add · Select from Cellar — copy an existing cellar wine's label (photo +
  // identity + its intel snapshot) into the library. References the cellar
  // photo path directly (no re-upload).
  async function addFromCellar(w: CellarWine) {
    setSelectCellarOpen(false);
    try {
      await create.mutateAsync({
        imagePath: w.label_image_path,
        producer: w.producer,
        wineName: w.wine_name,
        vintage: w.vintage,
        region: w.region,
        intel: intelFromCellar(w),
        // Carry the cellar wine's canonical anchor onto the copied label.
        wsWineId: w.ws_wine_id ?? null,
        wsWineName: w.ws_wine_name ?? null,
      });
    } catch (err) {
      showAlert({ title: 'Could not add label', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Tap a label → View Wine Intel · View/Edit-or-Create Review · Remove.
  async function onTapLabel(label: LibraryLabel) {
    const header = wineHeaderLine(label.producer, label.wine_name, label.vintage) || 'This label';
    let existingId: string | null = null;
    try {
      if (userId) {
        const match = await findMatchingChosenWine(userId, { producer: label.producer, wineName: label.wine_name ?? '', vintage: label.vintage, wsWineId: label.ws_wine_id });
        existingId = match?.id ?? null;
      }
    } catch { /* fall back to Create a Review */ }
    showAlert({
      title: header,
      body: formatStamp(label),
      buttons: [
        { text: 'View Wine Intel', onPress: () => void handleViewIntel(label) },
        { text: 'Add/View Your Review', onPress: () => goToReview(existingId, label) },
        { text: 'Delete from Library', style: 'destructive', onPress: () => confirmRemove(label, existingId) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Add this label's wine straight into the Full Cellar List, carrying its
  // photo + any intel snapshot, dated today. Confirms with the wine name + date.
  async function addLabelToCellar(label: LibraryLabel) {
    if (!userId) return;
    const today = new Date().toISOString().split('T')[0];
    const intel = label.intel;
    try {
      await addWine.mutateAsync({
        user_id: userId,
        wine_name: label.wine_name || label.producer || 'Wine',
        producer: label.producer,
        region: label.region,
        vintage: label.vintage != null ? String(label.vintage) : null,
        quantity: 1,
        storage_location: null,
        date_received: today,
        critic_score: intel?.criticScore ?? null,
        critic_score_note: intel?.criticScoreNote ?? null,
        drinking_window_from: intel?.drinkingWindowFrom ?? null,
        drinking_window_to: intel?.drinkingWindowTo ?? null,
        drinking_window_status: intel?.drinkingWindowStatus ?? 'unknown',
        tasting_notes: intel?.tastingNotes ?? null,
        grape_variety: intel?.grapeVariety ?? null,
        label_image_path: label.label_image_path,
        user_notes: null,
        ws_wine_id: label.ws_wine_id ?? null,
        ws_wine_name: label.ws_wine_name ?? null,
        estimated_value: intel?.estimatedValue ?? null,
        estimated_value_currency: intel?.estimatedValue != null ? currency : null,
        estimated_value_source: intel?.valueSource ?? null,
        bottle_size_ml: 750,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      const dateLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      showAlert({
        title: wineHeaderLine(label.producer, label.wine_name, label.vintage) || (label.wine_name ?? 'Wine'),
        body: `Added to Full Cellar List on ${dateLabel}.`,
      });
    } catch (err) {
      showAlert({ title: 'Could not add to cellar', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // "Reviewed …" tag → open the actual review, not the landing page. Prefer the
  // most-recent Your-Wine-Reviews entry (openReview matches a chosen_wines id);
  // fall back to a reviewed cellar bottle's card when the review lives there.
  function openReviewedLink(conn: WineConnections) {
    const chosen = [...conn.reviewedChosen].sort(
      (a, b) => new Date(b.chosen_at ?? 0).getTime() - new Date(a.chosen_at ?? 0).getTime(),
    )[0];
    if (chosen) { router.push(`/wines/chosen?openReview=${chosen.id}`); return; }
    const cellar = conn.reviewedCellar[0];
    if (cellar) { router.push(`/cellar/${cellar.id}` as any); return; }
    router.push('/wines/chosen');
  }

  function goToReview(existingId: string | null, label: LibraryLabel) {
    if (existingId) { router.push(`/wines/chosen?openReview=${existingId}`); return; }
    const q = [
      'seedAdd=1',
      `sp=${encodeURIComponent(label.producer ?? '')}`,
      `sw=${encodeURIComponent(label.wine_name ?? '')}`,
      `sv=${encodeURIComponent(label.vintage != null ? String(label.vintage) : '')}`,
      `sr=${encodeURIComponent(label.region ?? '')}`,
      `slp=${encodeURIComponent(label.label_image_path ?? '')}`,
      // Seed the review date with when the label was scanned, not today.
      `sd=${encodeURIComponent(label.created_at ? label.created_at.split('T')[0] : '')}`,
    ].join('&');
    router.push(`/wines/chosen?${q}`);
  }

  async function handleViewIntel(label: LibraryLabel) {
    const details = detailsFromLabel(label);
    const ls = useLabelStore.getState();
    // Carry this label's stored photo through as the Wine Intel card thumbnail.
    try { ls.setImageUri(label.label_image_path ? await labelSignedUrl(label.label_image_path) : null); }
    catch { ls.setImageUri(null); }
    if (label.intel) {
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(label.intel);
      useLastIntelStore.getState().setLast(details, label.intel);
      router.push(`/label/results?context=intel&labelId=${label.id}&backTo=${encodeURIComponent('/scan/archive')}`);
      return;
    }
    // No snapshot (review / older label) — regenerate on demand.
    setGeneratingIntel(true);
    try {
      const intel = await generateWineIntel(details, currency);
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(intel);
      useLastIntelStore.getState().setLast(details, intel);
      router.push(`/label/results?context=intel&labelId=${label.id}&backTo=${encodeURIComponent('/scan/archive')}`);
    } catch (err) {
      showAlert({ title: 'Could not load intel', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setGeneratingIntel(false);
    }
  }

  function confirmRemove(label: LibraryLabel, reviewId: string | null) {
    const header = wineHeaderLine(label.producer, label.wine_name, label.vintage) || (label.wine_name ?? 'this label');
    // No review attached → a plain confirm; there's nothing else to delete.
    if (!reviewId) {
      showAlert({
        title: 'Delete from Library?',
        body: `${header}\n\nAny reviews or bottles in your cellar/archive will stay put.`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete from Library', style: 'destructive', onPress: () => remove.mutate(label.id) },
        ],
      });
      return;
    }
    // Has a review → offer to take the review with it, or keep it.
    showAlert({
      title: 'Delete from Library',
      body: `${header}\n\nDelete just this label, or the label and its wine review?`,
      buttons: [
        {
          text: 'Delete Label & Review',
          style: 'destructive',
          onPress: () => showAlert({
            title: 'Delete label & review?',
            body: 'This removes the label from your Library AND deletes its wine review. This can\'t be undone.',
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete Both', style: 'destructive', onPress: () => void deleteLabelAndReview(label, reviewId) },
            ],
          }),
        },
        { text: 'Delete from Library (keep review)', onPress: () => remove.mutate(label.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Remove the library label AND its wine review (chosen_wines). Cellar bottles /
  // wish-list entries are physical inventory managed elsewhere, so they're left.
  async function deleteLabelAndReview(label: LibraryLabel, reviewId: string) {
    try {
      await deleteChosenWine(reviewId);
      await remove.mutateAsync(label.id);
    } catch (err) {
      showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Capture the branded LabelShareCard (with the label photo, name, stamp and
  // the user's note) and hand it to the native share sheet.
  async function doShareThumbnail() {
    const label = shareLabel;
    if (!label) return;
    setSharing(true);
    try {
      const url = await labelSignedUrl(label.label_image_path);
      // Prefetch so the remote image is cached and paints before the snapshot.
      if (url) { try { await Image.prefetch(url); } catch { /* non-fatal */ } }
      setShareImageUrl(url);
      await new Promise((r) => setTimeout(r, 450));
      if (shareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setShareLabel(null);
      setShareImageUrl(null);
    }
  }

  // Full-width row list: a thumbnail on the left, the wine name + dated links
  // across the rest of the page.
  const thumbW = 104;
  const thumbH = Math.round(thumbW * 1.3);

  const favLabel = FAV_OPTIONS.find((o) => o.value === favFilter)?.label ?? 'All labels';
  const cityLabel = cityFilter === 'All' ? 'All cities' : cityFilter;
  const dateLabel = dateFilter === 'All' ? 'All dates' : dateFilter;

  const activeDropdown: { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null =
    openDropdown === 'date'
      ? { title: 'Date', options: monthOptions, selected: dateFilter, onSelect: (v) => setDateFilter(v) }
      : openDropdown === 'city'
      ? { title: 'City', options: cityOptions, selected: cityFilter, onSelect: (v) => setCityFilter(v) }
      : openDropdown === 'fav'
      ? { title: 'Favourites', options: FAV_OPTIONS, selected: favFilter, onSelect: (v) => setFavFilter(v as 'all' | 'fav') }
      : null;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* dismissTo the scan tab (not router.back) so any residual stack —
            e.g. duplicate library entries from older sessions — collapses in a
            single press rather than needing several. */}
        <TouchableOpacity onPress={() => router.dismissTo('/(tabs)/scan')}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Label Scan Library</Text>
        <View style={{ width: 28 }} />
      </View>

      {labels.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan a wine label and it's saved here, date and location stamped.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.filterHint}>Tap a label to enlarge · Hold for intel, review & options</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterRow}
          >
            <TouchableOpacity style={[styles.filterChip, dateFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('date')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Date</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'date' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, dateFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{dateLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, cityFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('city')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>City</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'city' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, cityFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{cityLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, favFilter !== 'all' && styles.filterChipActive]} onPress={() => setOpenDropdown('fav')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'fav' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, favFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{favLabel}</Text>
            </TouchableOpacity>
            {customFilters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.customChip, activeCustomId === f.id && styles.customChipActive]}
                onPress={() => applyCustom(f.id)}
                onLongPress={() => openFilterOptions(f)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <Text style={[styles.customChipText, activeCustomId === f.id && { color: colors.gold }]} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.customChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Search sits below the chips and narrows whatever they filter —
              same pattern as the Wine Reviews page. */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search producer, wine, region, venue…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {shown.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No labels match</Text>
              <Text style={styles.emptyBody}>Try clearing the filters above.</Text>
            </View>
          ) : (
          <ScrollView style={styles.listScroll} contentContainerStyle={styles.listContent}>
              {shown.map((label) => {
                const conn = connByLabel.get(label.id);
                const cellar = conn && conn.cellarWines.length > 0 ? conn.cellarWines[0] : null;
                return (
                <TouchableOpacity
                  key={label.id}
                  style={styles.row}
                  onPress={() => setExpandedLabel(label)}
                  onLongPress={() => onTapLabel(label)}
                  delayLongPress={300}
                  activeOpacity={0.7}
                >
                  <View style={{ width: thumbW, height: thumbH }}>
                    <LabelThumb path={label.label_image_path} fallbackText={label.wine_name} style={{ width: thumbW, height: thumbH }} radius={5} />
                    {/* Favourite star — top-right of the thumbnail. */}
                    <TouchableOpacity
                      style={styles.favStar}
                      onPress={() => toggleFav(label)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.favStarText, label.is_favourite && styles.favStarActive]}>{label.is_favourite ? '★' : '☆'}</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowName} numberOfLines={3}>
                      {wineHeaderLine(label.producer, label.wine_name, label.vintage) || label.wine_name || label.producer || 'Wine label'}
                    </Text>
                    {/* Location captured at scan time — venue · city, or just the
                        city. Gold, matching the scanned-date line below it.
                        Tap to correct it (GPS can guess the wrong town). */}
                    {(() => {
                      const loc = [label.captured_place, label.captured_city].map((s) => (s ?? '').trim()).filter(Boolean).join(' · ');
                      return (
                        <TouchableOpacity onPress={() => openLocationEditor(label)} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }} activeOpacity={0.7}>
                          <Text style={loc ? styles.rowLocation : styles.rowLocationAdd} numberOfLines={1}>{loc || '+ Add location'}</Text>
                        </TouchableOpacity>
                      );
                    })()}
                    <Text style={styles.rowScanned}>Scanned: {new Date(label.created_at).toLocaleDateString('en-GB')}</Text>
                    {/* Plain info line (not a link) — review status for this wine,
                        same colour/font as the Scanned line above. */}
                    <Text style={styles.rowScanned}>
                      {conn && conn.reviewCount > 0
                        ? `${conn.reviewCount} Review${conn.reviewCount === 1 ? '' : 's'}`
                        : 'Awaiting review'}
                    </Text>
                    {/* Dated links to where this wine also lives — most recent
                        review date only; styled as links, not buttons. */}
                    {conn?.lastReviewedIso ? (
                      <TouchableOpacity onPress={() => openReviewedLink(conn)} activeOpacity={0.7} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                        <Text style={styles.rowLink}>Reviewed {new Date(conn.lastReviewedIso).toLocaleDateString('en-GB')}</Text>
                      </TouchableOpacity>
                    ) : null}
                    {cellar ? (
                      <TouchableOpacity onPress={() => router.push(`/cellar/${cellar.id}` as any)} activeOpacity={0.7} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                        <Text style={styles.rowLink}>Added to Cellar: {cellar.date_received ? new Date(cellar.date_received).toLocaleDateString('en-GB') : '—'}</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </>
      )}

      {/* Date / City / Favourites dropdown */}
      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.modalTitle}>{activeDropdown.title}</Text>
                {activeDropdown.options.map((opt) => {
                  const active = activeDropdown.selected === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.modalOption, active && styles.modalOptionActive]}
                      onPress={() => { activeDropdown.onSelect(opt.value); setOpenDropdown(null); }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                      {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Bespoke "+ Add" filter — create / edit a named filter over labels. */}
      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit filter' : 'New filter'}
        itemNoun="labels"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* +Add chooser — Scan / Upload / Select from Cellar */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a label</Text>
            <Text style={styles.addBody}>Scan or upload a wine label, or pull one in from your cellar. Each is saved with the date and place.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={handleScan} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={handleUpload} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Upload a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={() => { setAddOpen(false); setSelectCellarOpen(true); }} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Select from Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Select from Cellar — cellar wines that have a label photo */}
      <Modal visible={selectCellarOpen} transparent animationType="fade" onRequestClose={() => setSelectCellarOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectCellarOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalSheet, styles.cellarSheet]} onPress={() => {}}>
            <Text style={styles.modalTitle}>Select from Cellar</Text>
            {cellarWithPhotos.length === 0 ? (
              <Text style={styles.addBody}>None of your cellar wines have a label photo yet.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 380 }}>
                {cellarWithPhotos.map((w) => (
                  <TouchableOpacity key={w.id} style={styles.cellarRow} onPress={() => addFromCellar(w)} activeOpacity={0.7}>
                    <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.cellarThumb} radius={4} frame={3} />
                    <View style={styles.cellarRowText}>
                      <Text style={styles.cellarWineName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      {w.region ? <Text style={styles.cellarRegion} numberOfLines={1}>{w.region}</Text> : null}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setSelectCellarOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Share thumbnail — add an optional note, then share the branded card */}
      <Modal visible={!!shareLabel && !sharing} transparent animationType="fade" onRequestClose={() => setShareLabel(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShareLabel(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Share label</Text>
            <Text style={styles.addBody}>Share this label — with its name and date — as a Vinster card. Add a note if you like.</Text>
            <TextInput
              style={styles.noteInput}
              value={shareNote}
              onChangeText={setShareNote}
              placeholder="Add a note (optional)"
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <TouchableOpacity style={styles.addBtn} onPress={doShareThumbnail} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShareLabel(null)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Short-tap a thumbnail → view it full screen. */}
      {expandedLabel ? (
        <ExpandedLabelModal label={expandedLabel} onClose={() => setExpandedLabel(null)} />
      ) : null}

      {/* Edit the captured location — GPS can stamp the wrong town. */}
      <Modal visible={!!editingLoc} transparent animationType="fade" onRequestClose={() => setEditingLoc(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setEditingLoc(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.locEditSheet} onPress={() => {}}>
            <Text style={styles.locEditTitle}>Edit location</Text>
            <Text style={styles.locEditLabel}>Restaurant or venue (optional)</Text>
            <TextInput
              style={styles.locEditInput}
              value={locPlaceDraft}
              onChangeText={setLocPlaceDraft}
              placeholder="e.g. The Clove Club"
              placeholderTextColor={colors.textMuted}
              returnKeyType="next"
            />
            <Text style={styles.locEditLabel}>City</Text>
            <TextInput
              style={styles.locEditInput}
              value={locCityDraft}
              onChangeText={setLocCityDraft}
              placeholder="e.g. London"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={() => { void saveLocation(); }}
            />
            <TouchableOpacity style={styles.locEditSave} onPress={() => { void saveLocation(); }} activeOpacity={0.85}>
              <Text style={styles.locEditSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditingLoc(null)} style={styles.locEditCancel} activeOpacity={0.7}>
              <Text style={styles.locEditCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Off-screen branded card, mounted only while a share is in flight. */}
      {sharing && shareLabel ? (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <LabelShareCard
            ref={shareRef}
            imageUrl={shareImageUrl}
            wineName={wineHeaderLine(shareLabel.producer, shareLabel.wine_name, shareLabel.vintage) || (shareLabel.wine_name ?? 'Wine label')}
            stamp={formatStamp(shareLabel)}
            note={shareNote}
          />
        </View>
      ) : null}

      {(scanningLabel || generatingIntel || sharing) && (
        <View style={styles.scanningOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.scanningText}>{scanningLabel ? 'Reading the label…' : sharing ? 'Preparing your card…' : 'Loading wine intel…'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right', minWidth: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  // Share-note input + the off-screen (position-only, no opacity) card wrapper.
  noteInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, padding: spacing.md, minHeight: 90, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)', textAlignVertical: 'top', marginBottom: spacing.md },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0 },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 112, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipActive: { borderColor: colors.gold },
  customChip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, maxWidth: 160 },
  customChipActive: { borderColor: colors.gold },
  customChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  customChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md },
  customChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  listScroll: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowBody: { flex: 1 },
  rowName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 21 },
  rowLocation: { fontSize: 12.5, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 4 },
  rowLocationAdd: { fontSize: 12.5, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 4, textDecorationLine: 'underline' },
  rowScanned: { fontSize: 12.5, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 4 },
  rowLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, textDecorationLine: 'underline', marginTop: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  searchClearText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  expandOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  expandImage: { width: '100%', height: '78%' },
  expandCaptionWrap: { position: 'absolute', bottom: 48, left: spacing.xl, right: spacing.xl, alignItems: 'center' },
  expandCaption: { fontSize: 17, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textAlign: 'center' },
  expandDate: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold, textAlign: 'center', marginTop: 4 },
  favStar: { position: 'absolute', top: spacing.xs, right: spacing.xs, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 20, color: '#FFFFFF', lineHeight: 22 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  locEditSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  locEditTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  locEditLabel: { fontSize: 12.5, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: spacing.sm },
  locEditInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  locEditSave: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  locEditSaveText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.background },
  locEditCancel: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  locEditCancelText: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  cellarSheet: { maxHeight: '80%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Select-from-Cellar rows.
  cellarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cellarThumb: { width: 40, height: 52 },
  cellarRowText: { flex: 1 },
  cellarWineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  cellarRegion: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  scanningText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
