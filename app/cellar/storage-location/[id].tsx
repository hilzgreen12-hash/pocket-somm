import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator, FlatList, type ListRenderItem } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { renameStorageLocation, createStorageCase, updateStorageCase, deleteStorageCase, setStorageLocationPhoto, setStorageLocationExternal } from '../../../src/api/storageLocations';
import { fetchPlacementsForWine, moveBottlesToLocation, placedCount, type CellarPlacement, type LocationWineRow } from '../../../src/api/placements';
import { getCellarWineById, updateCellarWine } from '../../../src/api/cellar';
import { VIEW_ONLY_MESSAGE } from '../../../src/api/cellarContext';
import { uploadLocationPhoto } from '../../../src/api/labelPhotos';
import { useAuth } from '../../../src/hooks/useAuth';
import { useCellarContext } from '../../../src/hooks/useCellarContext';
import { invalidateCellarViews } from '../../../src/hooks/useCellar';
import { useAltCellarData, type AltCellarItem } from '../../../src/hooks/useAltCellarData';
import { useStorageLocationNav } from '../../../src/hooks/useStorageLocationNav';
import { useLabelImageUrl } from '../../../src/hooks/useLabelImageUrl';
import { useRackStore } from '../../../src/stores/rackStore';
import { useLabelStore } from '../../../src/stores/labelStore';
import { readLabelFromLibrary } from '../../../src/services/labelRead';
import {
  archiveFromAltCellar, deleteRowBottles, fileRowIntoCase, moveRowBottlesIntoCase, moveRowToAltCellar,
  moveRowToCellarList, releaseRowForRack,
} from '../../../src/services/altCellarMoves';
import { confirmDeleteAltCellar } from '../../../src/components/altCellar/confirmDeleteAltCellar';
import { AltCellarWineRow, altCellarCaseStyles } from '../../../src/components/altCellar/AltCellarWineRow';
import { AltCellarFilters } from '../../../src/components/altCellar/AltCellarFilters';
import { CaseFormModal } from '../../../src/components/altCellar/CaseFormModal';
import { CountPromptModal } from '../../../src/components/altCellar/CountPromptModal';
import { RenameModal } from '../../../src/components/RenameModal';
import { WineSearchModal } from '../../../src/components/WineSearchModal';
import { CellarWinePicker } from '../../../src/components/CellarWinePicker';
import { PackagingPrompt, fileLocationBottlesIntoCase } from '../../../src/components/PackagingPrompt';
import { CellarCommandModal } from '../../../src/components/CellarCommandModal';
import { ArchiveBottlesSheet } from '../../../src/components/winecard/cellar/ArchiveBottlesSheet';
import { showAlert } from '../../../src/components/AppAlert';
import { bottleSizeCl } from '../../../src/components/BottleSizePicker';
import { MessageScreen } from '../../../src/components/MessageScreen';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { launchCamera, launchImageLibrary } from '../../../src/utils/imagePicker';
import { confirmWineDelete, reviewsOn } from '../../../src/utils/confirmWineDelete';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { todayYmd } from '../../../src/utils/reviewDate';
import type { CellarWine, StorageCase } from '../../../src/types/wine';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

const bottles = (n: number) => `${n} bottle${n === 1 ? '' : 's'}`;
const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');

// "a, b and c"
function listNames(names: string[]): string {
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

export default function StorageLocationScreen() {
  const { id, highlight, placeWine } = useLocalSearchParams<{ id: string; highlight?: string; placeWine?: string }>();
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const navigation = useNavigation();
  // View-only members of a shared cellar can look, but not change anything.
  const canEdit = useCellarContext().role !== 'view';
  const { setPendingStorageLocationId, setPendingCaseId, setPendingWineId, setPendingAddMode } = useRackStore();
  const data = useAltCellarData(id, userId, highlight);
  const { location, isLoading, rows, cases, racks, allLocations, filters, items, awaiting } = data;
  const photoUrl = useLabelImageUrl(location?.photo_path ?? null);

  // Header ‹ › hop across ALL home storage in the "Your Wines at Home" order.
  const storageNav = useStorageLocationNav();
  const prevLoc = storageNav.prev(id);
  const nextLoc = storageNav.next(id);

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{ done: number; total: number } | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [caseForm, setCaseForm] = useState<{ edit?: StorageCase } | null>(null);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [wineSearchOpen, setWineSearchOpen] = useState(false);
  const wineSearchCaseRef = useRef<string | null>(null);
  // "Select from Cellar List" with several bottles to bring: how many?
  const [moveModal, setMoveModal] = useState<{ wine: CellarWine; body: string; max: number } | null>(null);
  // Bottles that just landed here, for "How is this wine packaged?".
  const [packaging, setPackaging] = useState<{ wineId: string; count: number | null } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LocationWineRow | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<LocationWineRow | null>(null);

  const here = location?.name ?? 'this cellar';

  // Every write refreshes every view of the cellar; a failure says what went
  // wrong. Resolves to the write's result, or null when it failed.
  async function runWrite<T>(verb: string, write: () => Promise<T>): Promise<{ value: T } | null> {
    setBusy(true);
    try {
      return { value: await write() };
    } catch (err) {
      showAlert({ title: `Could not ${verb}`, body: errorText(err) });
      return null;
    } finally {
      setBusy(false);
      invalidateCellarViews(qc);
    }
  }

  // ---- Bringing an existing cellar wine here ("Select from Cellar List") ----

  // Where a wine's bottles are outside this cellar, from its placements, plus
  // Your Full Cellar List for its unplaced ones.
  function describeElsewhere(placements: CellarPlacement[], loose: number): string[] {
    const names: string[] = [];
    for (const p of placements) {
      const name = p.kind === 'rack' ? racks.find((r) => r.id === p.rack_id)?.name ?? 'a rack'
        : p.kind === 'bin' ? 'a wine bin'
        : allLocations.find((l) => l.id === p.storage_location_id)?.name ?? 'another location';
      if (!names.includes(name)) names.push(name);
    }
    if (loose > 0) names.push('Your Full Cellar List');
    return names;
  }

  // moveBottlesToLocation frees the bottles from wherever they are and lands
  // them on this wine's line here (merging into a matching line if there is
  // one), then asks how they're packaged.
  async function executeMove(w: CellarWine, count: number) {
    if (!id) return;
    const landed = await runWrite('move', () => moveBottlesToLocation(w, id, count));
    setMoveModal(null);
    if (landed) setPackaging({ wineId: landed.value, count });
  }

  async function onPickCellarWine(w: CellarWine) {
    setCellarPickerOpen(false);
    if (!id) return;
    const header = wineHeaderLine(w.producer, w.wine_name, w.vintage);
    let placements: CellarPlacement[];
    try {
      placements = await fetchPlacementsForWine(w.id);
    } catch (err) {
      showAlert({ title: 'Could not move', body: errorText(err) });
      return;
    }
    const isHere = (p: CellarPlacement) => p.kind === 'location' && p.storage_location_id === id;
    const total = w.quantity ?? 1;
    const movable = Math.max(0, total - placedCount(placements.filter(isHere)));
    if (movable <= 0) {
      showAlert({ title: 'Already here', body: `${header} is already in this location.` });
      return;
    }
    const others = placements.filter((p) => !isHere(p) && (p.quantity ?? 0) > 0);
    // Only unplaced bottles: nothing to move them from, so just file them here.
    if (others.length === 0) { void executeMove(w, movable); return; }
    const where = listNames(describeElsewhere(others, Math.max(0, total - placedCount(placements))));
    if (movable === 1) {
      showAlert({
        title: 'Move this wine?',
        body: `${header} is in ${where}. Move it here?`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: `Move from ${where}`, onPress: () => void executeMove(w, 1) },
        ],
      });
      return;
    }
    setMoveModal({ wine: w, max: movable, body: `${movable} bottles of ${header} aren't here yet — in ${where}. How many are we moving?` });
  }

  // ---- Bottles waiting to be placed ----

  // File a waiting wine into a case here, or leave it loose (an alt cellar
  // needs no exact spot).
  async function placeAwaiting(row: LocationWineRow, caseId: string | null) {
    await runWrite('place', async () => {
      if (caseId && id) await fileLocationBottlesIntoCase({ wineId: row.id, locationId: id, caseId, placementId: row.placement_id, count: row.quantity });
      await updateCellarWine(row.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
    });
  }
  function openPlaceAwaiting(row: LocationWineRow) {
    const label = wineHeaderLine(row.producer, row.wine_name, row.vintage) || (row.wine_name ?? 'This wine');
    showAlert({
      title: 'Where should this go?',
      body: `${label} is here awaiting placement. File it into a case, or leave it loose in ${here}.`,
      buttons: [
        ...cases.map((c) => ({ text: `Into ${c.name}`, onPress: () => void placeAwaiting(row, c.id) })),
        { text: 'Leave loose', onPress: () => void placeAwaiting(row, null) },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // Arriving from Quick Command "Confirm & Place Wine" (?placeWine=<id>): the
  // same case-or-loose prompt a manual add uses, once the wine's row is here.
  const placeWineHandled = useRef<string | null>(null);
  useEffect(() => {
    if (!canEdit || !placeWine || placeWineHandled.current === placeWine) return;
    const row = awaiting.find((r) => r.id === placeWine);
    if (!row) return;
    placeWineHandled.current = placeWine;
    if (cases.length === 0) void placeAwaiting(row, null); // nowhere to file it → loose
    else openPlaceAwaiting(row);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, placeWine, awaiting.map((r) => r.placement_id).join(','), cases.length]);

  // ---- Adding a new wine ----

  // Every add files the saved wine into THIS cellar (context=add-location),
  // into a case when `caseId` is given.
  function setPending(caseId: string | null) {
    setPendingStorageLocationId(id ?? null);
    setPendingCaseId(caseId);
  }
  function clearPending() {
    setPendingStorageLocationId(null);
    setPendingCaseId(null);
  }
  function handleScan(caseId: string | null = null) {
    if (!id) return;
    setPending(caseId);
    router.push('/label/camera?context=add-location' as any);
  }
  function handleSearch(caseId: string | null = null) {
    wineSearchCaseRef.current = caseId;
    setWineSearchOpen(true);
  }
  // A fresh label store, so a previous scan's photo can't ride along.
  function handleSearchSelect(r: { producer: string; wineName: string | null; region: string | null; style: string | null; vintage: string | null }) {
    setWineSearchOpen(false);
    if (!id) return;
    setPending(wineSearchCaseRef.current);
    const label = useLabelStore.getState();
    label.reset();
    label.setWineDetails({ producer: r.producer, region: r.region ?? '', wineName: r.wineName, vintage: r.vintage ?? '', style: r.style ?? null } as any);
    router.push('/label/confirm?context=add-location' as any);
  }
  // Read the photo the way the label camera does: a wine list can be read as
  // one, and a photo that isn't a readable label says so.
  async function handleUpload(caseId: string | null = null) {
    if (!id) return;
    setPending(caseId);
    const read = await readLabelFromLibrary({
      setReading: setUploading,
      enterManually: { text: 'Enter Manually', onPress: () => {
        setPending(caseId);
        useLabelStore.getState().reset();
        router.push('/label/confirm?context=add-location&manual=1' as any);
      } },
    });
    if (read === 'label') { router.push('/label/confirm?context=add-location' as any); return; }
    clearPending();
    if (read === 'list') router.push('/scan/wine-list?shared=1' as any);
  }

  function openAddWine() {
    showAlert({
      title: 'Add a wine to this location',
      buttons: [
        { text: 'Scan a Label', onPress: () => handleScan() },
        { text: 'Upload a Label', onPress: () => void handleUpload() },
        // Bottles never move from home into External Storage.
        ...(location?.is_external ? [] : [{ text: 'Select from Cellar List', onPress: () => setCellarPickerOpen(true) }]),
        { text: 'Search a Wine', onPress: () => handleSearch() },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // Back. Each wine added through the label flow lands a fresh copy of this
  // screen on the stack (results → router.replace here), so a single back()
  // would only reveal the copy beneath. Collapse onto the Racks page when one
  // is below; otherwise pop every stacked copy at once, or leave for the
  // Cellar tab when there's nothing else. Mirrors the rack screen.
  function handleBack() {
    const routes = navigation.getState?.()?.routes ?? [];
    if (routes.some((r) => r.name === 'cellar/racks')) {
      router.dismissTo('/cellar/racks');
      return;
    }
    const topName = routes.length ? routes[routes.length - 1].name : undefined;
    let sameTop = 0;
    for (let i = routes.length - 1; i >= 0 && routes[i].name === topName; i--) sameTop++;
    if (sameTop >= routes.length || !router.canGoBack()) router.replace('/(tabs)/cellar');
    else router.dismiss(sameTop);
  }

  // ---- The cellar itself: photo, name, home/external, delete ----

  async function pickAndSetImage(fromCamera: boolean) {
    if (!id || !userId) return;
    if (!(await ensureMediaPermission(fromCamera ? 'camera' : 'library'))) return;
    const res = fromCamera
      ? await launchCamera({ mediaTypes: ['images'], quality: 1 })
      : await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditingImage(true);
    try {
      const path = await uploadLocationPhoto(userId, res.assets[0].uri, id);
      await setStorageLocationPhoto(id, path);
    } catch (err) {
      showAlert({ title: 'Could not update photo', body: errorText(err) });
    } finally {
      setEditingImage(false);
      invalidateCellarViews(qc);
    }
  }
  function handleEditImage() {
    showAlert({
      title: 'Location photo',
      buttons: [
        { text: 'Take Photo', onPress: () => void pickAndSetImage(true) },
        { text: 'Choose from Library', onPress: () => void pickAndSetImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // A deliberate relabel, so it says what it means for the bottles first —
  // External Storage is one-way: bottles only ever move from it to home.
  function confirmToggleExternal() {
    if (!location) return;
    const n = data.bottlesHere;
    const toExternal = !location.is_external;
    const what = n === 0 ? 'this cellar' : bottles(n);
    showAlert({
      title: toExternal ? 'Make this External Storage?' : 'Make this home storage?',
      body: toExternal
        ? `This makes ${what} External Storage. Bottles can only move from External to home afterwards.`
        : `This makes ${what} part of your home storage. ${n === 1 ? 'It' : 'They'}'ll count in Your Wines At Home.`,
      buttons: [
        { text: toExternal ? 'Mark as external' : 'Mark as at home', onPress: () => void runWrite('update', () => setStorageLocationExternal(location.id, toExternal)) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function handleLongPressHeader() {
    if (!location) return;
    showAlert({
      title: location.name,
      body: 'Manage this storage location.',
      buttons: [
        { text: 'Rename location', onPress: () => setRenaming(true) },
        { text: location.is_external ? 'Mark as at home' : 'Mark as external', onPress: confirmToggleExternal },
        { text: 'Delete location', style: 'destructive', onPress: () => void confirmDeleteAltCellar(location, { qc, onDeleted: () => router.back(), onProgress: setDeleteProgress }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function saveRename(name: string) {
    if (!location) return;
    if (await runWrite('rename', () => renameStorageLocation(location.id, name))) setRenaming(false);
  }

  // ---- A wine's actions (long-press a row) ----

  // "Highlight All Bottles": narrow the list to this wine and say where its
  // bottles sit here, e.g. "2x75cl in Mixed Case", "6x75cl Loose".
  function showWineHere(row: LocationWineRow) {
    const byCase = new Map<string | null, number>();
    for (const r of rows.filter((x) => x.id === row.id)) byCase.set(r.case_id ?? null, (byCase.get(r.case_id ?? null) ?? 0) + (r.quantity ?? 0));
    const total = [...byCase.values()].reduce((s, n) => s + n, 0);
    const size = `${bottleSizeCl(row.bottle_size_ml ?? 750)}cl`;
    const lines = [...byCase.entries()]
      .filter(([, n]) => n > 0)
      .sort(([a], [b]) => (a === null ? 1 : 0) - (b === null ? 1 : 0)) // cases first, loose last
      .map(([caseId, n]) => (caseId ? `${n}x${size} in ${cases.find((c) => c.id === caseId)?.name ?? 'a case'}` : `${n}x${size} Loose`));
    filters.setHighlightOnly(row.id);
    showAlert({
      title: wineHeaderLine(row.producer, row.wine_name, row.vintage),
      body: [`${bottles(total)} in ${here}`, ...lines].join('\n'),
      buttons: [{ text: 'OK', style: 'cancel' }],
    });
  }

  function openWineActions(row: LocationWineRow) {
    const title = wineHeaderLine(row.producer, row.wine_name, row.vintage);
    if (!canEdit) {
      showAlert({
        title,
        buttons: [
          { text: 'View Wine Intel', onPress: () => router.push(`/cellar/${row.id}` as any) },
          { text: 'Highlight All Bottles', onPress: () => showWineHere(row) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    const qty = row.quantity ?? 1;
    showAlert({
      title,
      body: [(row.region ?? '').trim(), `${qty} x ${bottleSizeCl(row.bottle_size_ml ?? 750)}cl in ${here}`].filter(Boolean).join('\n'),
      buttons: [
        { text: 'Move Bottles', onPress: () => openMoveBottlesMenu(row) },
        { text: 'Edit Wine Details', onPress: () => router.push(`/cellar/edit-wine/${row.id}` as any) },
        { text: 'Highlight All Bottles', onPress: () => showWineHere(row) },
        { text: 'Archive Wine', onPress: () => setArchiveTarget(row) },
        { text: 'Delete Wine', style: 'destructive', onPress: () => (qty > 1 ? setDeleteTarget(row) : void deleteHere(row, 1)) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Permanently delete `n` of a row's bottles. When they're the wine's last
  // bottles the wine goes, with its reviews, so that always asks first (and
  // offers Archive instead). Fewer go straight away once the how-many modal
  // has warned it can't be undone.
  async function deleteHere(row: LocationWineRow, n: number, warned = false) {
    if (!id) return;
    const real = await getCellarWineById(row.id).catch(() => null);
    const whole = n >= (real?.quantity ?? row.quantity ?? 1);
    const run = () => runWrite('delete', () => deleteRowBottles(row, id, n));
    if (warned && !whole) { void run(); return; }
    confirmWineDelete({
      lead: whole ? undefined : `Permanently remove ${n === 1 ? 'this bottle' : `${n} bottles`} from your cellar.`,
      reviewsLost: whole ? reviewsOn([real ?? row]) : 0,
      onDelete: () => void run(),
      onArchive: () => void runWrite('archive', () => archiveFromAltCellar(row.id, id, Infinity, todayYmd())),
    });
  }

  function openMoveBottlesMenu(row: LocationWineRow) {
    showAlert({
      title: wineHeaderLine(row.producer, row.wine_name, row.vintage),
      buttons: [
        { text: 'Add/Move to Case', onPress: () => openMoveToCase(row) },
        { text: 'Remove from Case', onPress: () => removeFromCase(row) },
        { text: 'Move Storage Locations', onPress: () => openMoveWine(row) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function openMoveToCase(row: LocationWineRow) {
    const targets = cases.filter((c) => c.id !== row.case_id);
    if (targets.length === 0) {
      showAlert({ title: cases.length === 0 ? 'No cases yet' : 'Already filed', body: cases.length === 0 ? 'Create a case first from the case carousel (+ Add Case).' : 'This wine is already in your only case.' });
      return;
    }
    showAlert({
      title: 'Add / move to case',
      buttons: [
        ...targets.map((c) => ({ text: c.name, onPress: () => void runWrite('update', () => fileRowIntoCase(row, id!, c.id)) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  function removeFromCase(row: LocationWineRow) {
    if (!row.case_id) {
      showAlert({ title: 'Not in a case', body: `${wineHeaderLine(row.producer, row.wine_name, row.vintage) || 'This wine'} is loose in ${here} — it isn't in a case.` });
      return;
    }
    void runWrite('update', () => fileRowIntoCase(row, id!, null));
  }

  // "Move Storage Locations": how many of this row's bottles (skipped for one),
  // then where.
  function openMoveWine(row: LocationWineRow) {
    const total = row.quantity ?? 1;
    if (total <= 1) { promptMoveDestination(row, 1); return; }
    const cap = Math.min(total, 12);
    showAlert({
      title: wineHeaderLine(row.producer, row.wine_name, row.vintage),
      body: `How many of your ${total} bottles would you like to move?`,
      buttons: [
        ...Array.from({ length: cap }, (_, i) => i + 1).map((n) => ({
          text: n === total ? `All ${n}` : bottles(n),
          onPress: () => promptMoveDestination(row, n),
        })),
        ...(total > cap ? [{ text: `All ${total}`, onPress: () => promptMoveDestination(row, total) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  function promptMoveDestination(row: LocationWineRow, count: number) {
    const noun = count === (row.quantity ?? 1) ? 'this wine' : bottles(count);
    showAlert({
      title: wineHeaderLine(row.producer, row.wine_name, row.vintage),
      body: `Where would you like to move ${noun}?`,
      buttons: [
        { text: 'Move to Cellar List', onPress: () => showAlert({
          title: `Move out of ${here}?`,
          body: `${count === 1 ? 'It goes' : 'They go'} back to your Full Cellar List as loose bottles. Nothing else changes.`,
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Move to Cellar List', onPress: () => void runWrite('move', () => moveRowToCellarList(row, id!, count)) },
          ],
        }) },
        { text: 'Move to Different Location', onPress: () => openMoveToDifferentLocation(row, count) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Another place at home: a rack or fridge (whose own screen slots the
  // bottles) or another home alt cellar. Never External Storage — bottles
  // only ever move from it to home.
  function openMoveToDifferentLocation(row: LocationWineRow, count: number) {
    const otherCellars = allLocations.filter((l) => l.id !== id && !l.is_external);
    if (racks.length === 0 && otherCellars.length === 0) {
      showAlert({ title: 'No other locations', body: 'You have no other racks, fridges or home storage locations to move this into yet.' });
      return;
    }
    showAlert({
      title: 'Move to which location?',
      buttons: [
        ...racks.map((r) => ({
          text: `${r.name} (${r.storage_type === 'fridge' ? 'fridge' : 'rack'})`,
          onPress: () => void moveToRack(row, r.id, count),
        })),
        ...otherCellars.map((l) => ({
          text: `${l.name} (home storage)`,
          onPress: () => void runWrite('move', () => moveRowToAltCellar(row, id!, l.id, count)),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  // The bottles leave here first, loose on the same line, then the rack's
  // "place unplaced bottles" mode slots them (capped at what was freed). Any
  // the user doesn't place stay loose in the Full Cellar List.
  async function moveToRack(row: LocationWineRow, rackId: string, count: number) {
    const freed = await runWrite('move', () => releaseRowForRack(row, id!, count));
    if (!freed) return;
    setPendingWineId(null);
    setPendingAddMode(false);
    router.push(`/cellar/rack/${rackId}?placeWine=${row.id}&placeLimit=${freed.value}` as any);
  }

  // ---- Cases ----

  // Long-press a case (its chip, or its header in the grouped view).
  function openCaseMenu(c: StorageCase) {
    showAlert({
      title: c.name,
      body: c.note || undefined,
      buttons: [
        { text: 'Add Wines', onPress: () => openAddToCase(c) },
        { text: 'Rename Case', onPress: () => setCaseForm({ edit: c }) },
        { text: 'Delete Case (contents land as loose bottles)', style: 'destructive', onPress: () => confirmDissolveCase(c) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function confirmDissolveCase(c: StorageCase) {
    showAlert({
      title: `Dissolve ${c.name}?`,
      body: 'The bottles stay in this location as loose wines — this only removes the case grouping.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dissolve', style: 'destructive', onPress: () => void runWrite('dissolve', () => deleteStorageCase(c.id)) },
      ],
    });
  }
  async function saveCaseForm(name: string, note: string) {
    if (!userId || !id || !caseForm) return;
    if (!name.trim()) { showAlert({ title: 'Name the case', body: 'Give this case a name so you can find it.' }); return; }
    const edit = caseForm.edit;
    const saved = await runWrite(edit ? 'save' : 'create case', async () => {
      if (edit) await updateStorageCase(edit.id, { name, note });
      else await createStorageCase(userId, { storageLocationId: id, name, note });
    });
    if (saved) setCaseForm(null);
  }

  // A case is just a named box: a wine already here can be filed in, or a new
  // bottle added straight into it.
  function openAddToCase(c: StorageCase) {
    showAlert({
      title: `Add a wine to ${c.name}`,
      buttons: [
        { text: 'Select Wine From This Cellar', onPress: () => openAddExistingToCase(c) },
        { text: 'Scan a Label', onPress: () => handleScan(c.id) },
        { text: 'Upload a Label', onPress: () => void handleUpload(c.id) },
        { text: 'Search a Wine', onPress: () => handleSearch(c.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function openAddExistingToCase(c: StorageCase) {
    const candidates = rows.filter((r) => r.case_id !== c.id);
    if (candidates.length === 0) {
      showAlert({ title: 'Nothing to add', body: `Every wine in ${here} is already in ${c.name}.` });
      return;
    }
    const cap = 12;
    showAlert({
      title: `Add to ${c.name}`,
      body: candidates.length > cap ? `Choose a wine already in this cellar (showing the first ${cap}).` : 'Choose a wine already in this cellar to file into the case.',
      buttons: [
        ...candidates.slice(0, cap).map((r) => ({
          text: wineHeaderLine(r.producer, r.wine_name, r.vintage) || (r.wine_name ?? 'Wine'),
          onPress: () => promptCaseMoveQty(r, c),
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  function promptCaseMoveQty(row: LocationWineRow, c: StorageCase) {
    const max = row.quantity ?? 1;
    if (max <= 1) { void moveIntoCase(row, c, 1); return; }
    showAlert({
      title: `How many bottles of ${row.wine_name} to add to ${c.name}?`,
      buttons: [
        ...Array.from({ length: Math.min(max, 12) }, (_, i) => ({ text: bottles(i + 1), onPress: () => void moveIntoCase(row, c, i + 1) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  async function moveIntoCase(row: LocationWineRow, c: StorageCase, n: number) {
    const from = row.case_id ? cases.find((x) => x.id === row.case_id)?.name ?? 'another case' : 'loose bottles';
    if (await runWrite('move', () => moveRowBottlesIntoCase(row, id!, c.id, n))) {
      showAlert({ title: 'Moved', body: `${bottles(n)} of ${row.wine_name} moved from ${from} to ${c.name}.` });
    }
  }

  // ---- The list ----

  // Stable handlers (reading the latest state through refs), so the memoised
  // rows don't all re-render whenever the screen does.
  const actionsRef = useRef({ openWineActions, openCaseMenu });
  actionsRef.current = { openWineActions, openCaseMenu };
  const onRowPress = useCallback((row: LocationWineRow) => router.push(`/cellar/${row.id}` as any), []);
  const onRowLongPress = useCallback((row: LocationWineRow) => actionsRef.current.openWineActions(row), []);
  const renderItem = useCallback<ListRenderItem<AltCellarItem>>(({ item }) => {
    if (item.type === 'wine') return <AltCellarWineRow row={item.row} inCase={item.inCase} onPress={onRowPress} onLongPress={onRowLongPress} />;
    if (item.type === 'case') {
      return (
        <TouchableOpacity
          style={altCellarCaseStyles.header}
          onLongPress={canEdit ? () => actionsRef.current.openCaseMenu(item.box) : undefined}
          delayLongPress={350}
          activeOpacity={0.75}
        >
          <Text style={altCellarCaseStyles.name} numberOfLines={1}>{item.box.name}</Text>
          {item.box.note ? <Text style={altCellarCaseStyles.note} numberOfLines={2}>{item.box.note}</Text> : null}
        </TouchableOpacity>
      );
    }
    return <Text style={item.type === 'heading' ? styles.looseHeader : styles.emptyList}>{item.text}</Text>;
  }, [onRowPress, onRowLongPress, canEdit]);
  // Keeps the search box above the keyboard, as the old scroll view did.
  const renderScroll = useCallback((props: object) => <KeyboardAwareScrollView {...props} bottomOffset={24} />, []);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  }
  if (!location) {
    return (
      <MessageScreen
        title="Location not found"
        body="This location no longer exists."
        onBack={() => router.back()}
      />
    );
  }

  const listHeader = (
    <>
      {photoUrl ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: photoUrl }} style={styles.areaPhoto} resizeMode="cover" />
          {canEdit ? (
            <TouchableOpacity style={styles.photoEditBadge} onPress={handleEditImage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Change photo">
              <Ionicons name="camera" size={18} color={colors.gold} />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : canEdit ? (
        <TouchableOpacity style={styles.photoAdd} onPress={handleEditImage} activeOpacity={0.8}>
          <Ionicons name="camera-outline" size={26} color={colors.gold} />
          <Text style={styles.photoAddText}>Add a photo</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.statsBar}>
        <Text style={styles.statsBarText}>
          {cases.length} {cases.length === 1 ? 'Case' : 'Cases'} · {data.looseBottles} Loose {data.looseBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>
        {canEdit ? (
          <TouchableOpacity onPress={openAddWine} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} activeOpacity={0.7}>
            <Text style={styles.addWineText}>+ Add Wine</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {!canEdit ? <Text style={styles.viewOnly}>{VIEW_ONLY_MESSAGE}</Text> : null}

      {/* Bottles moved here (e.g. by Quick Command) and not yet filed. */}
      {canEdit && data.awaitingBottles > 0 ? (
        <View style={styles.awaitingBlock}>
          <Text style={styles.awaitingBanner}>{data.awaitingBottles} {data.awaitingBottles === 1 ? 'Bottle' : 'Bottles'} moved here — awaiting placement</Text>
          {awaiting.map((r) => (
            <TouchableOpacity key={r.placement_id} style={styles.awaitingRow} onPress={() => openPlaceAwaiting(r)} activeOpacity={0.7}>
              <Text style={styles.awaitingWine} numberOfLines={2}>{wineHeaderLine(r.producer, r.wine_name, r.vintage) || r.wine_name}</Text>
              <Text style={styles.awaitingHint}>View storage options to place →</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <AltCellarFilters
        filters={filters}
        rows={rows}
        cases={cases}
        onCaseLongPress={canEdit ? openCaseMenu : undefined}
        onAddCase={canEdit ? () => setCaseForm({}) : undefined}
      />
    </>
  );

  const listEmpty = rows.length === 0 ? (
    <View style={styles.emptyWinesBlock}>
      <Text style={styles.emptyWinesTitle}>No Wines Here Yet</Text>
      {canEdit ? (
        <TouchableOpacity onPress={openAddWine} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 12, right: 12 }}>
          <Text style={styles.emptyWinesAdd}>+ Add Wine</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  ) : (
    <Text style={styles.emptyList}>No wines match your filters.</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerSide} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleNav}>
          <TouchableOpacity onPress={() => prevLoc && router.replace(prevLoc.route as any)} disabled={!prevLoc} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }} accessibilityLabel="Previous storage location">
            <Text style={[styles.navArrow, !prevLoc && styles.navArrowDisabled]}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexShrink: 1 }} onLongPress={canEdit ? handleLongPressHeader : undefined} delayLongPress={400} activeOpacity={1}>
            <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nextLoc && router.replace(nextLoc.route as any)} disabled={!nextLoc} hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }} accessibilityLabel="Next storage location">
            <Text style={[styles.navArrow, !nextLoc && styles.navArrowDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
        {/* Matches the back button's width so the title is truly centred. */}
        <View style={styles.headerSide} />
      </View>

      {canEdit ? (
        <TouchableOpacity onPress={() => setVoiceOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} style={styles.voiceBubble}>
          <Text style={styles.voiceBubbleText}>Quick Command</Text>
        </TouchableOpacity>
      ) : null}
      <View style={styles.headerDivider} />

      <FlatList
        data={items}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        renderScrollComponent={renderScroll}
        contentContainerStyle={{ paddingBottom: 90 }}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={12}
        windowSize={7}
      />

      <RenameModal visible={renaming} initialName={location.name} title="Rename location" saving={busy} onSave={(name) => void saveRename(name)} onClose={() => setRenaming(false)} />

      <CaseFormModal
        visible={caseForm !== null}
        title={caseForm?.edit ? 'Edit case' : 'Create New Case'}
        saveText={caseForm?.edit ? 'Save' : 'Create Case'}
        initial={caseForm?.edit ? { name: caseForm.edit.name, note: caseForm.edit.note } : undefined}
        onSave={(name, note) => void saveCaseForm(name, note)}
        onClose={() => setCaseForm(null)}
      />

      <CellarWinePicker visible={cellarPickerOpen} allowPlaced onClose={() => setCellarPickerOpen(false)} onSelect={onPickCellarWine} />

      <WineSearchModal visible={wineSearchOpen} onClose={() => setWineSearchOpen(false)} onSelect={handleSearchSelect} />

      <CountPromptModal
        visible={deleteTarget !== null}
        title="Delete how many?"
        body={`You have ${bottles(deleteTarget?.quantity ?? 0)} of ${deleteTarget?.wine_name ?? 'this wine'} here. How many to permanently delete? This can't be undone.`}
        max={deleteTarget?.quantity ?? 1}
        initial={1}
        confirmText="Delete Bottles"
        all={`Delete all ${deleteTarget?.quantity ?? ''}`}
        onConfirm={(n) => { const row = deleteTarget; setDeleteTarget(null); if (row) void deleteHere(row, n, true); }}
        onClose={() => setDeleteTarget(null)}
      />

      <CountPromptModal
        visible={moveModal !== null}
        title={`Move to ${here}`}
        body={moveModal?.body ?? ''}
        max={moveModal?.max ?? 1}
        initial={moveModal?.max ?? 1}
        confirmText="Move"
        onConfirm={(n) => { if (moveModal) void executeMove(moveModal.wine, n); }}
        onClose={() => setMoveModal(null)}
      />

      {archiveTarget ? (
        <ArchiveBottlesSheet
          visible
          wine={archiveTarget}
          initialCount={1}
          working={busy}
          onArchive={({ count, date, note }) => {
            const row = archiveTarget;
            setArchiveTarget(null);
            void runWrite('archive', () => archiveFromAltCellar(row.id, id!, count, date, note || undefined));
          }}
          onDelete={(count) => {
            const row = archiveTarget;
            setArchiveTarget(null);
            void deleteHere(row, count);
          }}
          onClose={() => setArchiveTarget(null)}
        />
      ) : null}

      <CellarCommandModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} locationName={location.name} scope={id ? { kind: 'location', id } : undefined} hereWineIds={Array.from(new Set(rows.map((r) => r.id)))} />

      {/* "How is this wine packaged?" — for the bottles that just moved in. */}
      <PackagingPrompt
        visible={packaging !== null}
        wineId={packaging?.wineId ?? null}
        locationId={id}
        count={packaging?.count ?? null}
        userId={userId ?? ''}
        onClose={() => setPackaging(null)}
        onDone={() => invalidateCellarViews(qc)}
      />

      {uploading || editingImage || deleteProgress ? (
        <View style={styles.overlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.overlayText}>
            {deleteProgress ? `Deleting… ${deleteProgress.done} of ${deleteProgress.total}` : editingImage ? 'Updating photo…' : 'Reading the label…'}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Quick Command sits between the title and the divider, as on the Cellar tab.
  voiceBubble: { alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 8, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  headerDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  headerSide: { width: 44, justifyContent: 'center' },
  // Matches the rack / fridge headers (size, weight, spacing) + carousel arrows.
  title: { flexShrink: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  titleNav: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  navArrow: { fontSize: 26, fontFamily: fonts.headingSemibold, color: colors.gold, paddingHorizontal: 2 },
  navArrowDisabled: { color: 'rgba(224,184,74,0.25)' },

  photoWrap: { alignSelf: 'center', width: '72%', marginVertical: spacing.md },
  areaPhoto: { width: '100%', aspectRatio: 4 / 3, borderRadius: 14, backgroundColor: colors.surface },
  photoEditBadge: { position: 'absolute', top: 8, right: 8, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  photoAdd: { alignSelf: 'center', width: '72%', aspectRatio: 4 / 3, borderRadius: 14, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginVertical: spacing.md },
  photoAddText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },

  // Counts + "+ Add Wine" in one bar, gold rules above and below.
  statsBar: { paddingVertical: spacing.sm, marginBottom: spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider, alignItems: 'center', gap: spacing.xs },
  statsBarText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center' },
  addWineText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6 },
  viewOnly: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md },

  awaitingBlock: { marginBottom: spacing.lg },
  awaitingBanner: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textAlign: 'center', paddingTop: spacing.sm, paddingHorizontal: spacing.xl },
  awaitingRow: { marginHorizontal: spacing.xl, marginTop: spacing.sm, padding: spacing.md, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  awaitingWine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  awaitingHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  emptyList: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, lineHeight: 20 },
  emptyWinesBlock: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.sm },
  emptyWinesTitle: { fontSize: 16, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyWinesAdd: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5 },
  looseHeader: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
