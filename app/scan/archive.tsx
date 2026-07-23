import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Image, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { router } from 'expo-router';
import { useLabels } from '../../src/hooks/useLabels';
import { useCellar } from '../../src/hooks/useCellar';
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
import type { CellarWine, LibraryLabel, WineDetailsComplete, WineIntelligence } from '../../src/types/wine';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

// How many label tiles per row. "single" = one large label per row.
type ViewMode = 'thumbnails' | 'enlarge';
const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'thumbnails', label: 'Thumbnails' },
  { value: 'enlarge', label: 'Enlarge' },
];
const VIEW_COLS: Record<ViewMode, number> = { thumbnails: 2, enlarge: 1 };

type DateSort = 'desc' | 'asc';
const DATE_OPTIONS: { value: DateSort; label: string }[] = [
  { value: 'desc', label: 'Descending (newest first)' },
  { value: 'asc', label: 'Ascending (oldest first)' },
];

type FilterField = 'view' | 'date' | null;

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
  const { labels, isLoading, remove, setFavourite, create } = useLabels();
  const { wines: cellarWines, addWine } = useCellar();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const { width } = useWindowDimensions();

  const [viewMode, setViewMode] = useState<ViewMode>('thumbnails');
  const [dateSort, setDateSort] = useState<DateSort>('desc');
  const [favOnly, setFavOnly] = useState(false);
  const [expandedLabel, setExpandedLabel] = useState<LibraryLabel | null>(null);
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [addOpen, setAddOpen] = useState(false);
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

  const shown = useMemo(() => {
    const base = favOnly ? labels.filter((l) => l.is_favourite) : labels;
    return [...base].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      return dateSort === 'asc' ? ta - tb : tb - ta;
    });
  }, [labels, dateSort, favOnly]);

  // Cellar wines that have a label photo — the pool for "Select from Cellar".
  const cellarWithPhotos = useMemo(() => cellarWines.filter((w) => w.label_image_path), [cellarWines]);

  async function toggleFav(label: LibraryLabel) {
    try {
      await setFavourite.mutateAsync({ id: label.id, value: !label.is_favourite });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
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
        const match = await findMatchingChosenWine(userId, { producer: label.producer, wineName: label.wine_name ?? '', vintage: label.vintage });
        existingId = match?.id ?? null;
      }
    } catch { /* fall back to Create a Review */ }
    showAlert({
      title: header,
      body: formatStamp(label),
      buttons: [
        { text: 'View Wine Intel', onPress: () => void handleViewIntel(label) },
        { text: 'Add/Edit/View Review', onPress: () => goToReview(existingId, label) },
        { text: 'Add to Full Cellar List', onPress: () => void addLabelToCellar(label) },
        { text: 'Share Thumbnail', onPress: () => { setShareNote(''); setShareLabel(label); } },
        { text: 'Delete from Library', style: 'destructive', onPress: () => confirmRemove(label) },
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

  function goToReview(existingId: string | null, label: LibraryLabel) {
    if (existingId) { router.push(`/wines/chosen?openReview=${existingId}`); return; }
    const q = [
      'seedAdd=1',
      `sp=${encodeURIComponent(label.producer ?? '')}`,
      `sw=${encodeURIComponent(label.wine_name ?? '')}`,
      `sv=${encodeURIComponent(label.vintage != null ? String(label.vintage) : '')}`,
      `sr=${encodeURIComponent(label.region ?? '')}`,
      `slp=${encodeURIComponent(label.label_image_path ?? '')}`,
    ].join('&');
    router.push(`/wines/chosen?${q}`);
  }

  async function handleViewIntel(label: LibraryLabel) {
    const details = detailsFromLabel(label);
    const ls = useLabelStore.getState();
    if (label.intel) {
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(label.intel);
      useLastIntelStore.getState().setLast(details, label.intel);
      router.push(`/label/results?context=intel&backTo=${encodeURIComponent('/scan/archive')}`);
      return;
    }
    // No snapshot (review / older label) — regenerate on demand.
    setGeneratingIntel(true);
    try {
      const intel = await generateWineIntel(details, currency);
      ls.setWineDetailsConfirmed(details);
      ls.setIntelligence(intel);
      useLastIntelStore.getState().setLast(details, intel);
      router.push(`/label/results?context=intel&backTo=${encodeURIComponent('/scan/archive')}`);
    } catch (err) {
      showAlert({ title: 'Could not load intel', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setGeneratingIntel(false);
    }
  }

  function confirmRemove(label: LibraryLabel) {
    const header = wineHeaderLine(label.producer, label.wine_name, label.vintage) || (label.wine_name ?? 'this label');
    showAlert({
      title: 'Delete from Library',
      body: `${header}\n\nDelete just this label, or also its wine review?`,
      buttons: [
        {
          text: 'Delete All Records',
          style: 'destructive',
          onPress: () => showAlert({
            title: 'Delete all records?',
            body: 'This removes the label from your Library AND deletes its matching wine review. This can\'t be undone.',
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete All', style: 'destructive', onPress: () => void deleteAllRecords(label) },
            ],
          }),
        },
        { text: 'Delete from Library (keep reviews, etc)', onPress: () => remove.mutate(label.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // "Delete All Records" — remove the library label AND its matching wine review
  // (chosen_wines, matched by identity). Cellar bottles / wish-list entries are
  // physical inventory managed elsewhere, so they're intentionally left alone.
  async function deleteAllRecords(label: LibraryLabel) {
    try {
      if (userId) {
        const match = await findMatchingChosenWine(userId, { producer: label.producer, wineName: label.wine_name ?? '', vintage: label.vintage });
        if (match?.id) await deleteChosenWine(match.id);
      }
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

  const cols = VIEW_COLS[viewMode];
  const gap = spacing.sm;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;
  const tileHeight = tileWidth * 1.3;

  const viewLabel = VIEW_OPTIONS.find((o) => o.value === viewMode)?.label ?? 'Thumbnails';
  const dateLabel = dateSort === 'asc' ? 'Ascending' : 'Descending';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'view') return { title: 'View', options: VIEW_OPTIONS, selected: viewMode, onSelect: (v) => setViewMode(v as ViewMode) };
    if (field === 'date') return { title: 'Date', options: DATE_OPTIONS, selected: dateSort, onSelect: (v) => setDateSort(v as DateSort) };
    return null;
  }
  const activeDropdown = dropdownConfig(openDropdown);

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
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Label Scan Library</Text>
        <TouchableOpacity onPress={() => setAddOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {labels.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan a wine label — or tap + Add — and it's saved here, date and location stamped.</Text>
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
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('view')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>View</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'view' ? '▴' : '▾'}</Text>
              </View>
              <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{viewLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('date')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Date</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'date' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, dateSort === 'asc' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{dateLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip} onPress={() => setFavOnly((v) => !v)}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
              </View>
              <Text style={[styles.filterChipValue, favOnly && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{favOnly ? '★ Only' : 'All'}</Text>
            </TouchableOpacity>
          </ScrollView>

          <ScrollView style={styles.listScroll} contentContainerStyle={styles.grid}>
              {shown.map((label) => (
                <TouchableOpacity
                  key={label.id}
                  style={[styles.tile, { width: tileWidth, marginRight: gap, marginBottom: gap }]}
                  onPress={() => setExpandedLabel(label)}
                  onLongPress={() => onTapLabel(label)}
                  delayLongPress={300}
                  activeOpacity={0.7}
                >
                  <View style={{ width: tileWidth, height: tileHeight }}>
                    <LabelThumb
                      path={label.label_image_path}
                      fallbackText={label.wine_name}
                      style={{ width: tileWidth, height: tileHeight }}
                    />
                    {/* Favourite star — top-right of every thumbnail. */}
                    <TouchableOpacity
                      style={styles.favStar}
                      onPress={() => toggleFav(label)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.favStarText, label.is_favourite && styles.favStarActive]}>{label.is_favourite ? '★' : '☆'}</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.caption} numberOfLines={2}>
                    {wineHeaderLine(label.producer, label.wine_name, label.vintage) || label.wine_name || label.producer || 'Wine label'}
                  </Text>
                  <Text style={styles.captionDate}>{new Date(label.created_at).toLocaleDateString('en-GB')}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
        </>
      )}

      {/* View / Favourites dropdown */}
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
  filterChip: { width: 150, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  listScroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  caption: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text, marginTop: spacing.xs, alignSelf: 'stretch' },
  captionDate: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 1, alignSelf: 'stretch' },
  expandOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  expandImage: { width: '100%', height: '78%' },
  expandCaptionWrap: { position: 'absolute', bottom: 48, left: spacing.xl, right: spacing.xl, alignItems: 'center' },
  expandCaption: { fontSize: 17, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textAlign: 'center' },
  expandDate: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold, textAlign: 'center', marginTop: 4 },
  favStar: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  favStarText: { fontSize: 24, color: '#FFFFFF', lineHeight: 26 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
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
