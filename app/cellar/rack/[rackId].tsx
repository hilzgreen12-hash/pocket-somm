import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, ActivityIndicator, Modal, Animated } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useLocalSearchParams, router, useNavigation, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '../../../src/components/AppAlert';
import { useAuth } from '../../../src/hooks/useAuth';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useCellar, invalidateCellarViews } from '../../../src/hooks/useCellar';
import { useCellarContext } from '../../../src/hooks/useCellarContext';
import { useStorageLocationNav } from '../../../src/hooks/useStorageLocationNav';
import { useRackStore } from '../../../src/stores/rackStore';
import { useLineupStore } from '../../../src/stores/lineupStore';
import { useLabelStore } from '../../../src/stores/labelStore';
import { VIEW_ONLY_MESSAGE } from '../../../src/api/cellarContext';
import { clearSlotOfWine, moveRackSlot, removeSlotsForWine, type SlotPos } from '../../../src/api/racks';
import { deleteCellarWine, getCellarWineById, updateCellarWine } from '../../../src/api/cellar';
import { fetchStorageLocations } from '../../../src/api/storageLocations';
import { addLocationPlacement, fetchPlacementsForWine, placedCount, releaseBottlesFromPlacements } from '../../../src/api/placements';
import { getBins } from '../../../src/api/bins';
import { archiveBottles } from '../../../src/services/archiveNight';
import { readLabelFromLibrary } from '../../../src/services/labelRead';
import {
  rackRoomFor, confirmRackRoom, warnIfSizeMismatch, moveRackBottlesToLocation, moveRackBottlesToBin,
} from '../../../src/services/rackMoves';
import { todayYmd } from '../../../src/utils/reviewDate';
import { confirmWineDelete, reviewsOn } from '../../../src/utils/confirmWineDelete';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { slotKey } from '../../../src/utils/rackSlots';
import { CellarWinePicker } from '../../../src/components/CellarWinePicker';
import { ArchiveNoteModal } from '../../../src/components/ArchiveNoteModal';
import { CellarCommandModal } from '../../../src/components/CellarCommandModal';
import { RackGrid, rackLayout } from '../../../src/components/rack/RackGrid';
import { RackFilters, useRackFilters, type RackWine } from '../../../src/components/rack/RackFilters';
import { RackEditSheet } from '../../../src/components/rack/RackEditSheet';
import { RackModeBar } from '../../../src/components/rack/RackModeBar';
import { AwaitingChecklist } from '../../../src/components/rack/AwaitingChecklist';
import { useRackZoom } from '../../../src/components/rack/useRackZoom';
import { useRackPlacement, type MoveIntoRackPrompt } from '../../../src/components/rack/useRackPlacement';
import { CountModal, type CountPrompt } from '../../../src/components/rack/modals/CountModal';
import { PlaceCountModal } from '../../../src/components/rack/modals/PlaceCountModal';
import { SlotChooserModal } from '../../../src/components/rack/modals/SlotChooserModal';
import { DestinationPickerModal, type Destination } from '../../../src/components/rack/modals/DestinationPickerModal';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { RackSlot, CellarWine } from '../../../src/types/wine';

const errorBody = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');
const wineLabel = (w: CellarWine) => wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name;
const bottles = (n: number) => `${n} bottle${n === 1 ? '' : 's'}`;

export default function RackGridScreen() {
  const params = useLocalSearchParams<{
    rackId: string; highlight?: string; lineup?: string; placed?: string;
    placeWine?: string; placeLimit?: string; fromRack?: string; addMoreWine?: string;
  }>();
  const { rackId } = params;
  const navigation = useNavigation();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { width } = useWindowDimensions();
  const canEdit = useCellarContext().role !== 'view';
  const { slots, isLoading: slotsLoading } = useRack(rackId);
  const { racks, isLoading: racksLoading } = useRacks();
  const { wines } = useCellar();
  const rack = racks.find((r) => r.id === rackId);
  const noun = rack?.storage_type === 'fridge' ? 'fridge' : 'rack';

  const { pendingSlot, setPendingSlot, pendingSlots, setPendingSlots, pendingWineId, setPendingWineId, setPendingAddMode, pendingMove: moving, setPendingMove } = useRackStore();
  // Back on the rack means any scan / upload / manual add started from an empty
  // slot has ended (placed or abandoned): drop its target slot(s), so a later
  // add can't be filed into them.
  useFocusEffect(useCallback(() => {
    useRackStore.getState().setPendingSlot(null);
    useRackStore.getState().setPendingSlots(null);
  }, []));

  const { data: locations = [] } = useQuery({
    queryKey: ['storage-locations', session?.user.id],
    queryFn: () => fetchStorageLocations(session!.user.id),
    enabled: !!session?.user.id,
  });
  const { data: bins = [] } = useQuery({
    queryKey: ['bins', session?.user.id],
    queryFn: () => getBins(session!.user.id),
    enabled: !!session?.user.id,
  });

  // A quiet confirmation line that fades after a few seconds.
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(null), 3000);
    return () => clearTimeout(t);
  }, [savedMsg]);
  // Arrived from placing a wine into a slot (?placed=1).
  useEffect(() => { if (params.placed) setSavedMsg('Added to your cellar'); }, [params.placed]);

  const slotMap = useMemo(() => {
    const map: Record<string, RackSlot> = {};
    for (const s of slots) map[slotKey(s.row_index, s.col_index)] = s;
    return map;
  }, [slots]);

  // The wines in this rack with their bottle counts (each slot is one bottle),
  // most recently added first like every other list.
  const winesInRack = useMemo<RackWine[]>(() => {
    const byWine = new Map<string, RackWine>();
    for (const s of slots) {
      if (!s.cellar_wine_id || !s.wine) continue;
      const entry = byWine.get(s.cellar_wine_id);
      if (entry) entry.count += 1; else byWine.set(s.cellar_wine_id, { wine: s.wine, count: 1 });
    }
    return [...byWine.values()].sort((a, b) => new Date(b.wine.created_at).getTime() - new Date(a.wine.created_at).getTime());
  }, [slots]);
  const bottlesHere = (wineId: string) => winesInRack.find((w) => w.wine.id === wineId)?.count ?? 0;
  const rackBottleCount = winesInRack.reduce((n, w) => n + w.count, 0);
  const hereWineIds = useMemo(() => winesInRack.map((w) => w.wine.id), [winesInRack]);

  const filters = useRackFilters(rackId, winesInRack, params.highlight ?? null);
  const placement = useRackPlacement({
    rack, rackId, slotMap, wines, racks, locations, notify: setSavedMsg,
    params: { placeWine: params.placeWine, placeLimit: params.placeLimit, fromRack: params.fromRack, addMoreWine: params.addMoreWine },
  });
  const zoom = useRackZoom();

  const [voiceOpen, setVoiceOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [slotChooserOpen, setSlotChooserOpen] = useState(false);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [slotUploading, setSlotUploading] = useState(false);
  // A just-added wine (pendingWineId) is placed from this tapped slot.
  const [placingAt, setPlacingAt] = useState<SlotPos | null>(null);
  const [placingBusy, setPlacingBusy] = useState(false);
  const [destPicker, setDestPicker] = useState<{ mode: 'move' | 'addMore'; wineId: string; wineName: string; row: number; col: number } | null>(null);
  const [countPrompt, setCountPrompt] = useState<CountPrompt | null>(null);
  const [countBusy, setCountBusy] = useState(false);
  // "Archive" → the shared ArchiveNoteModal; `slot` is the bottle tapped.
  const [archiveTarget, setArchiveTarget] = useState<{ wineId: string; wineName: string; qty: number; slot?: SlotPos } | null>(null);
  const [archiving, setArchiving] = useState(false);

  // ?lineup=1 (Add a Lineup from the Cellar List) goes straight to the scanner.
  const lineupHandled = useRef(false);
  useEffect(() => {
    if (params.lineup === '1' && rack && canEdit && !lineupHandled.current) {
      lineupHandled.current = true;
      startLineup();
    }
  }, [params.lineup, rack, canEdit]);

  // Add a Lineup: scan up to 6 bottles, confirm the list, then come back here
  // and tap a slot for each one.
  function startLineup() {
    useLineupStore.getState().start(rackId);
    router.push('/cellar/scan-lineup');
  }

  // A bottle picked up on this rack that is no longer in its slot (moved or
  // archived elsewhere) can't be dropped — let go of it.
  useEffect(() => {
    if (!moving || moving.sourceRackId !== rackId || slotsLoading) return;
    if (slotMap[slotKey(moving.row, moving.col)]?.cellar_wine_id !== moving.wineId) {
      setPendingMove(null);
      setSavedMsg('That bottle has moved — long-press it again to move it');
    }
  }, [moving, slotMap, slotsLoading, rackId, setPendingMove]);

  // ---- Navigation ----

  // Swipe between ALL home storage (racks → bins → Alt Cellars) in the
  // carousel's order — at rest only, so a zoomed grid can pan. The ‹ › arrows
  // are the fallback for wide racks whose sideways scroll competes with it.
  const storageNav = useStorageLocationNav();
  const prevRack = storageNav.prev(rackId);
  const nextRack = storageNav.next(rackId);
  const swipeGesture = useMemo(
    () => Gesture.Pan()
      .enabled(!zoom.isZoomed)
      .activeOffsetX([-30, 30])
      .failOffsetY([-30, 30])
      .runOnJS(true)
      .onEnd((e) => {
        if (e.translationX < -80 && nextRack) router.replace(nextRack.route);
        else if (e.translationX > 80 && prevRack) router.replace(prevRack.route);
      }),
    [prevRack?.id, nextRack?.id, zoom.isZoomed],
  );

  // A rack is reached either from Cellar → Racks (a Racks page below us, maybe
  // with scanner screens in between) or directly from a wine card / the cellar
  // list (no Racks page at all). dismissTo('/cellar/racks') suits the first, but
  // in the second it PUSHES a Racks page whose Back returns here — a loop. And
  // repeated add/archive cycles can stack identical copies of this screen, so a
  // single back() would only reveal another copy. So: collapse onto Racks when
  // it exists, else pop every stacked copy of this screen at once.
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

  // ---- Slot taps ----

  // Slot callbacks stay stable (the slots are memoised) and run the latest handlers.
  const slotHandlers = useRef({ press: (_r: number, _c: number) => {}, longPress: (_r: number, _c: number) => {} });
  const onSlotPress = useCallback((r: number, c: number) => slotHandlers.current.press(r, c), []);
  const onSlotLongPress = useCallback((r: number, c: number) => slotHandlers.current.longPress(r, c), []);

  function openSlot(row: number, col: number) {
    if (!rack) return;
    const key = slotKey(row, col);
    const wine = slotMap[key]?.cellar_wine_id ? slotMap[key].wine : null;
    if (!canEdit) {
      if (wine) openReadOnlyMenu(wine, row, col);
      return;
    }
    const { mode } = placement;
    if (mode.kind === 'placeExisting') { placement.togglePlaceExisting(row, col); return; }
    if (mode.kind !== 'idle') { placement.toggleSelected(row, col); return; }
    if (moving) {
      // Tapping the source slot again puts the bottle back down.
      if (moving.sourceRackId === rackId && moving.row === row && moving.col === col) setPendingMove(null);
      else void handleDrop(row, col);
      return;
    }
    // A filled slot opens its menu as usual — even while bottles await a slot.
    if (wine) { openSlotMenu(wine, row, col); return; }
    if (placement.isTaken(key)) return; // a placement is landing there
    if (placement.awaitingBottles > 0) { void placement.placeAwaitingAt(row, col); return; }
    if (pendingWineId) { setPlacingAt({ row, col }); return; }
    // Empty slot, nothing pending — ask how to fill it. pendingSlot lets the
    // scan / upload / manual flows place into this slot.
    setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols, largeFormatCols: rack.large_format_cols, largeFormatBottleSizeMl: rack.large_format_bottle_size_ml });
    setPendingSlots(null);
    setSlotChooserOpen(true);
  }

  // Long-press: a filled slot picks the bottle up to move it (the next slot
  // tapped, here or on another rack, is where it goes); an empty slot starts a
  // multi-slot selection for one new wine.
  function onLongPressSlot(row: number, col: number) {
    if (!canEdit || moving || placement.mode.kind !== 'idle') return;
    const slot = slotMap[slotKey(row, col)];
    if (slot?.cellar_wine_id) {
      setPendingMove({ sourceRackId: rackId, row, col, wineId: slot.cellar_wine_id, wineName: slot.wine?.wine_name ?? 'this wine' });
      return;
    }
    if (placement.awaitingBottles > 0 || placement.isTaken(slotKey(row, col))) return;
    placement.startMultiSelect(row, col);
  }

  slotHandlers.current = { press: openSlot, longPress: onLongPressSlot };

  // "Confirm Slots & Add Image": the chosen slots drive the add-a-wine flows.
  function addWineToSelection() {
    if (!rack) return;
    const chosen = placement.takeSelection();
    if (chosen.length === 0) return;
    const first = chosen[0];
    setPendingSlot({ rackId, row: first.row, col: first.col, rows: rack.rows, cols: rack.cols, largeFormatCols: rack.large_format_cols, largeFormatBottleSizeMl: rack.large_format_bottle_size_ml });
    setPendingSlots(chosen);
    setSlotChooserOpen(true);
  }

  function clearPendingSlots() {
    setPendingSlot(null);
    setPendingSlots(null);
  }

  // Upload a label screenshot for the tapped slot(s): read the same way as the
  // Cellar List's Upload Label, and only go on to Confirm with a usable label.
  async function uploadForSlot() {
    const slot = pendingSlot;
    const chosen = pendingSlots;
    const read = await readLabelFromLibrary({
      setReading: setSlotUploading,
      enterManually: { text: 'Enter Manually', onPress: () => {
        setPendingSlot(slot);
        setPendingSlots(chosen);
        router.push('/label/confirm?manual=1&context=place');
      } },
    });
    if (read === 'label') router.push('/label/confirm?context=place');
    else if (read === 'list') router.push('/scan/wine-list?shared=1');
    else clearPendingSlots();
  }

  // "Select from Cellar List" for the tapped slot(s).
  async function placeFromCellarList(wine: CellarWine) {
    setCellarPickerOpen(false);
    const targets = pendingSlots?.length ? pendingSlots : pendingSlot ? [{ row: pendingSlot.row, col: pendingSlot.col }] : [];
    clearPendingSlots();
    const prompt = await placement.placeFromCellarList(wine, targets);
    if (prompt) askMoveIntoRack(prompt);
  }

  function askMoveIntoRack(prompt: MoveIntoRackPrompt) {
    if (prompt.max <= 1) {
      showAlert({
        title: 'Move this wine?',
        body: `${prompt.wine.wine_name} is in ${prompt.where}. Move it to this ${noun}?`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: `Move from ${prompt.where}`, onPress: () => void placement.moveIntoRack(prompt, 1) },
        ],
      });
      return;
    }
    setCountPrompt({
      title: `Move to this ${noun}`,
      body: `You have ${bottles(prompt.max)} of ${prompt.wine.wine_name} in ${prompt.where}. How many are we moving? They fill free slots from the tapped position.`,
      max: prompt.max,
      confirmText: () => 'Move',
      onConfirm: (n) => { setCountPrompt(null); void placement.moveIntoRack(prompt, n); },
    });
  }

  async function placeNewWine(count: number, orientation: 'Vertical' | 'Horizontal') {
    if (!placingAt || !pendingWineId) return;
    setPlacingBusy(true);
    const done = await placement.placeNewWine(placingAt, pendingWineId, count, orientation);
    setPlacingBusy(false);
    if (done) setPlacingAt(null);
  }

  // ---- Moving a picked-up bottle ----

  // Drop the picked-up bottle here: into an empty slot, or swap with the bottle
  // in a filled one. One transaction (move_rack_slot), refused if either slot
  // changed since the screen last showed it.
  async function handleDrop(toRow: number, toCol: number) {
    if (!moving || !rack) return;
    const m = moving;
    const toKey = slotKey(toRow, toCol);
    if (placement.isTaken(toKey) && !slotMap[toKey]?.cellar_wine_id) return; // a placement is landing there
    const target = slotMap[toKey]?.cellar_wine_id ? slotMap[toKey] : null;
    const sourceRack = racks.find((r) => r.id === m.sourceRackId) ?? rack;
    const movingWine = wines.find((w) => w.id === m.wineId);
    const targetWine = target?.wine ?? null;
    if (movingWine && !(await warnIfSizeMismatch(movingWine, rack, [toRow]))) return;
    if (targetWine && !(await warnIfSizeMismatch(targetWine, sourceRack, [m.row]))) return;
    setPendingMove(null);

    // Same-rack moves show at once (the header count reads the same cache, so it
    // moves too); a cross-rack move spans two caches, so it waits for the refetch.
    if (m.sourceRackId === rackId) {
      const srcWine = slotMap[slotKey(m.row, m.col)]?.wine ?? null;
      qc.setQueryData<RackSlot[]>(['rack-slots', rackId], (old = []) => {
        const arr = old.map((s) => ({ ...s }));
        const src = arr.find((s) => s.row_index === m.row && s.col_index === m.col);
        const dst = arr.find((s) => s.row_index === toRow && s.col_index === toCol);
        if (!src) return arr;
        if (dst && target) {
          Object.assign(src, { cellar_wine_id: target.cellar_wine_id, wine: targetWine });
          Object.assign(dst, { cellar_wine_id: m.wineId, wine: srcWine });
          return arr;
        }
        return [...arr.filter((s) => s !== src), { ...src, row_index: toRow, col_index: toCol }];
      });
    }
    try {
      await moveRackSlot(m.wineId, { rackId: m.sourceRackId, row: m.row, col: m.col }, { rackId, row: toRow, col: toCol }, target?.cellar_wine_id ?? null);
      setSavedMsg(m.sourceRackId !== rackId ? `Moved to this ${noun}` : 'Bottle moved');
    } catch (err) {
      showAlert({ title: 'Move failed', body: errorBody(err) });
    } finally {
      invalidateCellarViews(qc);
    }
  }

  // Bottles leaving this rack for another place: ask how many when more than
  // one of the wine is here.
  function chooseHowManyToMove(wineId: string, wineName: string, run: (n: number) => void) {
    const here = bottlesHere(wineId);
    if (here <= 1) { run(1); return; }
    setCountPrompt({
      title: 'How many bottles?',
      body: `You have ${bottles(here)} of ${wineName} in this ${noun}. How many would you like to move?`,
      max: here,
      confirmText: () => 'Move Bottles',
      onConfirm: (n) => { setCountPrompt(null); run(n); },
    });
  }

  async function runMove(work: () => Promise<void>) {
    try { await work(); }
    catch (err) { showAlert({ title: 'Could not move', body: errorBody(err) }); }
    finally { await placement.refreshViews(); }
  }

  // Another rack: nothing is freed here yet. The target opens in select-slots
  // mode, and the bottles move only when the user confirms the slots there.
  async function moveToAnotherRack(wineId: string, target: { id: string; name: string }, n: number) {
    const wine = wines.find((w) => w.id === wineId);
    try {
      const room = await rackRoomFor(target.id, wine?.bottle_size_ml ?? 750);
      const fits = await confirmRackRoom(room, n, `stay in ${rack?.name ?? `this ${noun}`}`);
      if (fits > 0) router.push(`/cellar/rack/${target.id}?placeWine=${wineId}&placeLimit=${fits}&fromRack=${rackId}`);
    } catch (err) {
      showAlert({ title: 'Could not move', body: errorBody(err) });
    }
  }

  // Your Full Cellar List: the bottles leave their slots but stay in the
  // cellar. Taking every one of the wine's bottles out asks first.
  function unplace(wineId: string, wineName: string, n: number) {
    const run = () => runMove(async () => {
      const freed = await removeSlotsForWine(wineId, n, rackId);
      setSavedMsg(freed === 1 ? `${wineName} moved to your Full Cellar List` : `${freed} bottles of ${wineName} moved to your Full Cellar List`);
    });
    if (n < bottlesHere(wineId)) { void run(); return; }
    showAlert({
      title: `Unplace ${n === 1 ? 'this bottle' : `all ${n} bottles`}?`,
      body: `${wineName} will leave this ${noun} and stay in Your Cellar List, not yet placed.`,
      buttons: [
        { text: 'Unplace', style: 'destructive', onPress: () => void run() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function onPickDestination(dest: Destination) {
    const d = destPicker;
    if (!d) return;
    setDestPicker(null);
    const { wineId, wineName } = d;
    if (d.mode === 'move') {
      if (dest.kind === 'thisRack') setPendingMove({ sourceRackId: rackId, row: d.row, col: d.col, wineId, wineName });
      else if (dest.kind === 'rack') chooseHowManyToMove(wineId, wineName, (n) => void moveToAnotherRack(wineId, dest, n));
      else if (dest.kind === 'bin') chooseHowManyToMove(wineId, wineName, (n) => void runMove(async () => {
        await moveRackBottlesToBin(wineId, rackId, n, dest.id);
        router.push(`/cellar/bin/${dest.id}?highlight=${wineId}`);
      }));
      else if (dest.kind === 'location') chooseHowManyToMove(wineId, wineName, (n) => void runMove(async () => {
        const moved = await moveRackBottlesToLocation(wineId, rackId, n, dest.id);
        setSavedMsg(`${moved === 1 ? 'Bottle' : bottles(moved)} moved to ${dest.name}`);
      }));
      else chooseHowManyToMove(wineId, wineName, (n) => unplace(wineId, wineName, n));
      return;
    }
    if (dest.kind === 'thisRack') { placement.startAddMore(wineId, wineName); return; }
    if (dest.kind === 'rack') { router.push(`/cellar/rack/${dest.id}?addMoreWine=${wineId}`); return; }
    const destName = dest.kind === 'cellarList' ? 'your Full Cellar List' : dest.name;
    setCountPrompt({
      title: 'Add More Bottles',
      body: `How many bottles of ${wineName} to add to ${destName}?`,
      max: 999,
      initial: 1,
      confirmText: () => 'Add Bottles',
      onConfirm: (n) => void addMoreTo(wineId, dest, destName, n),
    });
  }

  // New bottles of a wine into an alt cellar (placed there), a bin (flagged to
  // place there) or Your Full Cellar List (loose).
  async function addMoreTo(wineId: string, dest: Exclude<Destination, { kind: 'thisRack' | 'rack' }>, destName: string, n: number) {
    setCountBusy(true);
    try {
      const fresh = await getCellarWineById(wineId);
      if (!fresh) throw new Error('This wine is no longer in your cellar.');
      await updateCellarWine(wineId, {
        quantity: (fresh.quantity ?? 0) + n,
        ...(dest.kind === 'bin' ? { awaiting_placement: true, awaiting_placement_unit_id: dest.id } : {}),
      });
      if (dest.kind === 'location') await addLocationPlacement(wineId, dest.id, null, n);
      setCountPrompt(null);
      if (dest.kind === 'bin') router.push(`/cellar/bin/${dest.id}`);
      else setSavedMsg(`${bottles(n)} added to ${destName}`);
    } catch (err) {
      showAlert({ title: 'Could not add bottles', body: errorBody(err) });
    } finally {
      setCountBusy(false);
      invalidateCellarViews(qc);
    }
  }

  // ---- Slot and list menus ----

  function viewWine(wineId: string, at?: SlotPos) {
    router.push(at
      ? `/cellar/${wineId}?from=rack&fromRackId=${rackId}&fromRow=${at.row}&fromCol=${at.col}`
      : `/cellar/${wineId}?from=rack`);
  }

  function openReadOnlyMenu(wine: CellarWine, row?: number, col?: number) {
    showAlert({
      title: wineLabel(wine),
      buttons: [
        { text: 'View Wine Intel', onPress: () => viewWine(wine.id, row != null && col != null ? { row, col } : undefined) },
        { text: 'Highlight All Bottles', onPress: () => filters.highlightWine(wine.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // A tap on a filled slot: identity actions, then placement, then archive/delete.
  function openSlotMenu(wine: CellarWine, row: number, col: number) {
    const title = wineLabel(wine);
    showAlert({
      title,
      buttons: [
        { separator: true, text: '' },
        { text: 'View Wine Intel', onPress: () => viewWine(wine.id, { row, col }) },
        { text: 'Edit Wine', onPress: () => router.push(`/cellar/edit-wine/${wine.id}`) },
        { text: 'Highlight All Bottles', onPress: () => filters.highlightWine(wine.id) },
        { separator: true, text: '' },
        { text: 'Add More Bottles', onPress: () => setDestPicker({ mode: 'addMore', wineId: wine.id, wineName: title, row, col }) },
        { text: 'Move to Another Location', onPress: () => setDestPicker({ mode: 'move', wineId: wine.id, wineName: title, row, col }) },
        { separator: true, text: '' },
        { text: 'Archive or Delete Bottles', onPress: () => promptArchiveOrDelete(wine, { row, col }) },
        { separator: true, text: '' },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Long-press on a wine in the list: the slot menu's verbs (not a straight
  // delete, which a mis-hold used to fire).
  function openWineListMenu(wine: CellarWine) {
    if (!canEdit) { openReadOnlyMenu(wine); return; }
    showAlert({
      title: wineLabel(wine),
      body: 'What would you like to do?',
      buttons: [
        { text: 'View Wine Intel', onPress: () => viewWine(wine.id) },
        { text: 'Edit Wine', onPress: () => router.push(`/cellar/edit-wine/${wine.id}`) },
        { text: 'Highlight All Bottles', onPress: () => filters.highlightWine(wine.id) },
        { text: 'Archive Wine', onPress: () => setArchiveTarget({ wineId: wine.id, wineName: wineLabel(wine), qty: wine.quantity ?? 1 }) },
        { text: 'Delete Wine (Permanent)', style: 'destructive', onPress: () => openDeleteFlow(wine) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // ---- Archive and delete ----

  function promptArchiveOrDelete(wine: CellarWine, slot?: SlotPos) {
    showAlert({
      title: wineLabel(wine),
      body: 'Archive keeps this wine in your records (Cellar Archive). Delete removes it permanently and cannot be undone.',
      buttons: [
        // Both ask HOW MANY bottles rather than acting on the whole listing.
        { text: 'Archive', onPress: () => setArchiveTarget({ wineId: wine.id, wineName: wineLabel(wine), qty: wine.quantity ?? 1, slot }) },
        { text: 'Delete (permanent)', style: 'destructive', onPress: () => openDeleteFlow(wine, slot) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Free `count` of a wine's slots in THIS rack, the tapped slot first — so an
  // archive or delete from a slot removes THAT bottle.
  async function freeSlotsHere(wineId: string, count: number, slot?: SlotPos): Promise<number> {
    if (count <= 0) return 0;
    let freed = 0;
    if (slot && slotMap[slotKey(slot.row, slot.col)]?.cellar_wine_id === wineId && await clearSlotOfWine(rackId, slot.row, slot.col, wineId)) freed = 1;
    if (count > freed) freed += await removeSlotsForWine(wineId, count - freed, rackId);
    return freed;
  }

  // Take the bottles off the grid at once (tapped slot first); the refetch puts
  // back any that didn't go.
  function dropFromGrid(wineId: string, count: number, slot?: SlotPos) {
    qc.setQueryData<RackSlot[]>(['rack-slots', rackId], (old = []) => {
      let left = count;
      const tapped = slot ? old.find((s) => s.cellar_wine_id === wineId && s.row_index === slot.row && s.col_index === slot.col) : undefined;
      if (tapped) left--;
      return old.filter((s) => {
        if (s === tapped) return false;
        if (left > 0 && s.cellar_wine_id === wineId) { left--; return false; }
        return true;
      });
    });
  }

  // Archive `count` bottles, dated and noted. This rack's bottles leave first
  // (freed up front), so archiveBottles counts them as loose and only takes any
  // shortfall from elsewhere.
  async function archive(count: number, note: string, date: string) {
    const target = archiveTarget;
    if (!target || archiving) return;
    setArchiving(true);
    dropFromGrid(target.wineId, count, target.slot);
    try {
      await freeSlotsHere(target.wineId, count, target.slot);
      const { archived, archivedWineId } = await archiveBottles(target.wineId, count, date, { note: note || undefined });
      if (archived === 0) throw new Error('This wine is no longer in your cellar. Pull to refresh and try again.');
      setArchiveTarget(null);
      setSavedMsg(archivedWineId === target.wineId ? 'Wine archived' : `${archived} bottle${archived === 1 ? '' : 's'} archived`);
    } catch (err) {
      showAlert({ title: 'Could not archive', body: errorBody(err) });
    } finally {
      invalidateCellarViews(qc);
      setArchiving(false);
    }
  }

  // A delete issued here touches only this rack's bottles when the wine also
  // lives in another unit; when this is its only home it can delete the wine.
  function openDeleteFlow(wine: CellarWine, slot?: SlotPos) {
    const total = wine.quantity ?? 1;
    const here = bottlesHere(wine.id);
    const spans = here > 0 && here < total;
    const deletable = spans ? here : total;
    if (deletable > 1) {
      setCountPrompt({
        title: 'Delete bottles',
        body: `How many of your ${deletable} bottles of ${wine.wine_name} to permanently remove? This can't be undone.`,
        max: deletable,
        initial: 1,
        confirmText: (n) => `Delete ${n}`,
        onConfirm: (n) => void deleteBottles(wine, n, slot),
        secondary: { text: `Delete all ${deletable}`, onPress: () => void deleteBottles(wine, deletable, slot) },
      });
    } else if (spans) {
      confirmDeleteOneHere(wine, slot);
    } else {
      confirmDeleteWine(wine);
    }
  }

  function confirmDeleteOneHere(wine: CellarWine, slot?: SlotPos) {
    const others = (wine.quantity ?? 1) - 1;
    showAlert({
      title: 'Delete this bottle?',
      body: `Remove one bottle of ${wine.wine_name} from here. Your other bottle${others === 1 ? '' : 's'} in another storage unit stay put. This can't be undone.`,
      buttons: [
        { text: 'Delete permanently', style: 'destructive', onPress: () => void deleteBottles(wine, 1, slot) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Permanently remove `count` bottles issued from this rack. Free the slots
  // FIRST, then lower the quantity — the DB trim trigger cuts alt-cellar
  // placements whenever the quantity drops below the placed total. Deleting
  // the wine's last bottles deletes the wine (and its reviews), so that goes
  // through the shared confirmation instead.
  async function deleteBottles(wine: CellarWine, count: number, slot?: SlotPos) {
    const fresh = await getCellarWineById(wine.id).catch(() => null);
    const total = fresh?.quantity ?? wine.quantity ?? 1;
    if (total - count <= 0) {
      setCountPrompt(null);
      confirmDeleteWine(fresh ?? wine);
      return;
    }
    setCountBusy(true);
    dropFromGrid(wine.id, count, slot);
    try {
      await freeSlotsHere(wine.id, count, slot);
      // A count beyond this rack's bottles (with too few loose) frees the rest elsewhere.
      const overflow = placedCount(await fetchPlacementsForWine(wine.id)) - (total - count);
      if (overflow > 0) await releaseBottlesFromPlacements(wine.id, overflow);
      await updateCellarWine(wine.id, { quantity: total - count });
      setCountPrompt(null);
      setSavedMsg(`${bottles(count)} deleted`);
    } catch (err) {
      showAlert({ title: 'Could not delete', body: errorBody(err) });
    } finally {
      setCountBusy(false);
      invalidateCellarViews(qc);
    }
  }

  function confirmDeleteWine(wine: CellarWine) {
    const qty = wine.quantity ?? 1;
    confirmWineDelete({
      title: qty > 1 ? `Delete all ${qty} bottles?` : undefined,
      lead: qty > 1 ? `Permanently remove all ${qty} bottles of ${wine.wine_name} from your cellar.` : undefined,
      reviewsLost: reviewsOn([wine]),
      deleteText: 'Delete permanently',
      onDelete: async () => {
        try {
          // Deleting the row also deletes its rack slots and placements (cascade).
          await deleteCellarWine(wine.id);
          // Prune from the cache at once so the deleted wine can't linger (and
          // falsely match a fresh add) if the refetch is slow.
          if (session?.user.id) {
            qc.setQueryData<CellarWine[]>(['cellar', session.user.id], (old) => (old ?? []).filter((w) => w.id !== wine.id));
          }
        } catch (err) {
          showAlert({ title: 'Could not delete', body: errorBody(err) });
        } finally {
          invalidateCellarViews(qc);
        }
      },
      onArchive: async () => {
        try {
          await archiveBottles(wine.id, Infinity, todayYmd(), { fromUnit: { kind: 'rack', id: rackId } });
          setSavedMsg('Wine archived');
        } catch (err) {
          showAlert({ title: 'Could not archive', body: errorBody(err) });
        } finally {
          invalidateCellarViews(qc);
        }
      },
    });
  }

  // ---- Render ----

  if (!rack) {
    return (
      <View style={styles.center}>
        {racksLoading || slotsLoading ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <>
            <Text style={styles.missing}>This {noun} no longer exists</Text>
            <TouchableOpacity onPress={handleBack} style={styles.missingBack} activeOpacity={0.8}>
              <Text style={styles.missingBackText}>Back</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  }

  const totalSlots = rack.rows * rack.cols + Math.max(0, rack.large_format_cols ?? 0);
  const layout = rackLayout(rack, width);
  const movingKey = moving && moving.sourceRackId === rackId ? slotKey(moving.row, moving.col) : null;
  const grid = (
    <RackGrid
      rows={layout.rows}
      slotMap={slotMap}
      optimisticSlots={placement.optimistic}
      highlightedIds={filters.highlightedIds}
      movingKey={movingKey}
      selected={placement.selected}
      onPress={onSlotPress}
      onLongPress={onSlotLongPress}
    />
  );
  const pendingWine = pendingWineId ? wines.find((w) => w.id === pendingWineId) : undefined;
  const { mode } = placement;

  return (
    <GestureDetector gesture={swipeGesture}>
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleNav}>
          <TouchableOpacity onPress={() => prevRack && router.replace(prevRack.route)} disabled={!prevRack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 6 }} accessibilityLabel="Previous storage location">
            <Text style={[styles.navArrow, !prevRack && styles.navArrowDisabled]}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{rack.name}</Text>
          <TouchableOpacity onPress={() => nextRack && router.replace(nextRack.route)} disabled={!nextRack} hitSlop={{ top: 12, bottom: 12, left: 6, right: 12 }} accessibilityLabel="Next storage location">
            <Text style={[styles.navArrow, !nextRack && styles.navArrowDisabled]}>›</Text>
          </TouchableOpacity>
        </View>
        {canEdit ? (
          <TouchableOpacity onPress={() => setEditOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
            <Text style={styles.headerEdit}>Edit</Text>
          </TouchableOpacity>
        ) : <View style={styles.headerSpacer} />}
      </View>

      {canEdit && (
        <TouchableOpacity onPress={() => setVoiceOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} style={styles.voiceBubble}>
          <Text style={styles.voiceBubbleText}>Quick Command</Text>
        </TouchableOpacity>
      )}
      <View style={styles.headerDivider} />

      {/* Static header: the slot-choosing bar replaces the hints while it's up,
          so it never covers the grid; only the filters and grid scroll. */}
      {mode.kind !== 'idle' ? (
        <RackModeBar
          mode={mode}
          selectedCount={placement.selected.size}
          onCancel={mode.kind === 'placeExisting' ? placement.cancelPlaceExisting : placement.exitMode}
          onConfirm={mode.kind === 'placeExisting' ? placement.confirmPlaceExisting : mode.kind === 'addMore' ? placement.saveAddMore : addWineToSelection}
        />
      ) : canEdit ? (
        <View style={styles.hintBlock}>
          <Text style={styles.hint}>•  Short Press a slot: Add a bottle</Text>
          <Text style={styles.hint}>•  Short Press a thumbnail: Wine Intel & Edit</Text>
          <Text style={styles.hint}>•  Long Press a slot: Add same-wine multiples</Text>
          <Text style={styles.hint}>•  Long Press a thumbnail: Move to another slot</Text>
          <Text style={styles.hint}>•  Add A Lineup (up to 6 bottles): <Text style={styles.hintLink} onPress={startLineup}>Scan</Text></Text>
        </View>
      ) : (
        <Text style={styles.viewOnly}>{VIEW_ONLY_MESSAGE}</Text>
      )}

      <Text style={styles.summary}>
        {winesInRack.length} {winesInRack.length === 1 ? 'Wine' : 'Wines'} · {rackBottleCount} {rackBottleCount === 1 ? 'Bottle' : 'Bottles'} · {totalSlots} {totalSlots === 1 ? 'Slot' : 'Slots'}
      </Text>

      {canEdit && placement.awaitingBottles > 0 && (
        <AwaitingChecklist
          wines={placement.checklist}
          rowOf={placement.checklistRow}
          activeId={placement.activeAwaitingId}
          onSelect={placement.setActiveAwaitingId}
          onTakeOut={placement.takeBackOut}
          onLeaveRest={() => void placement.leaveRestUnplaced()}
        />
      )}

      <KeyboardAwareScrollView contentContainerStyle={styles.scroll} bottomOffset={24} scrollEnabled={!zoom.isZoomed}>
        {winesInRack.length > 0 && (
          <RackFilters filters={filters} winesInRack={winesInRack} wines={wines} canEdit={canEdit} onWineLongPress={openWineListMenu} onNotify={setSavedMsg} />
        )}

        {moving && (
          <View style={styles.movingBanner}>
            <Text style={styles.movingBannerText} numberOfLines={2}>
              {`Moving ${moving.wineName} — tap a slot to drop it (tap a filled slot to swap), or open the storage location you'd like to move it to.`}
            </Text>
            <TouchableOpacity onPress={() => setPendingMove(null)}>
              <Text style={styles.movingCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingWineId && canEdit && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>
              Tap an empty slot to place {pendingWine ? [pendingWine.producer, pendingWine.wine_name, pendingWine.vintage].filter(Boolean).join(' · ') : 'this wine'}
            </Text>
            {/* Placing is optional: the wine stays in the cellar, unplaced. */}
            <TouchableOpacity onPress={() => { setPendingWineId(null); setPendingAddMode(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.bannerCancel}>Not now — leave it in my cellar</Text>
            </TouchableOpacity>
          </View>
        )}
        {savedMsg && (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{savedMsg} ✓</Text>
          </View>
        )}

        {/* The cream viewport the grid zooms and pans inside. A rack wider than
            the screen scrolls sideways at rest. */}
        <View style={styles.rackViewport} onLayout={zoom.inline.onViewportLayout}>
          <ScrollView
            horizontal
            scrollEnabled={layout.overflows && !zoom.isZoomed}
            showsHorizontalScrollIndicator={layout.overflows}
            contentContainerStyle={styles.rackScroll}
          >
            <GestureDetector gesture={zoom.inline.gesture}>
              <Animated.View style={[styles.rackCanvas, { transform: zoom.inline.transform }]} onLayout={zoom.inline.onContentLayout}>
                {!zoom.fullScreen.visible && grid}
              </Animated.View>
            </GestureDetector>
          </ScrollView>
        </View>
      </KeyboardAwareScrollView>

      <SlotChooserModal
        visible={slotChooserOpen}
        slotCount={pendingSlots?.length ?? 1}
        onScan={() => { setSlotChooserOpen(false); router.push('/label/camera?context=place'); }}
        onPickFromCellar={() => { setSlotChooserOpen(false); setCellarPickerOpen(true); }}
        onUpload={() => { setSlotChooserOpen(false); void uploadForSlot(); }}
        onManual={() => { setSlotChooserOpen(false); useLabelStore.getState().reset(); router.push('/label/confirm?manual=1&context=place'); }}
        onClose={() => { setSlotChooserOpen(false); clearPendingSlots(); }}
      />

      <CellarWinePicker
        visible={cellarPickerOpen}
        allowPlaced
        onClose={() => { setCellarPickerOpen(false); clearPendingSlots(); }}
        onSelect={(w) => void placeFromCellarList(w)}
      />

      <DestinationPickerModal
        mode={destPicker?.mode ?? null}
        wineName={destPicker?.wineName ?? ''}
        rackId={rackId}
        racks={racks}
        bins={bins}
        locations={locations}
        onPick={onPickDestination}
        onClose={() => setDestPicker(null)}
      />

      <CountModal prompt={countPrompt} busy={countBusy} onClose={() => setCountPrompt(null)} />

      <PlaceCountModal visible={placingAt !== null} placing={placingBusy} onPlace={(n, o) => void placeNewWine(n, o)} onClose={() => setPlacingAt(null)} />

      {/* Shown while an uploaded label is read. */}
      <Modal visible={slotUploading} transparent animationType="fade">
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.uploadingText}>Reading the label…</Text>
        </View>
      </Modal>

      {canEdit && (
        <CellarCommandModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} locationName={rack.name} scope={{ kind: 'rack', id: rackId }} hereWineIds={hereWineIds} />
      )}

      <ArchiveNoteModal
        visible={!!archiveTarget}
        title="Archive wine?"
        body={archiveTarget ? `Move ${archiveTarget.wineName} to your archive.` : ''}
        busy={archiving}
        maxCount={archiveTarget?.qty ?? 1}
        onConfirm={archive}
        onClose={() => setArchiveTarget(null)}
      />

      <RackEditSheet rack={rack} slots={slots} visible={editOpen} onClose={() => setEditOpen(false)} onDeleted={() => router.back()} />

      {/* Full-screen zoom, promoted into from a firm pinch on the inline grid;
          pinch back in to close. */}
      <Modal visible={zoom.fullScreen.visible} animationType="fade" onRequestClose={zoom.fullScreen.close}>
        {/* GestureHandlerRootView is REQUIRED: gesture-handler gestures don't
            fire inside a RN <Modal> (a separate native hierarchy the app-root
            provider doesn't cover) — without it the overlay froze. */}
        <GestureHandlerRootView style={styles.fsContainer}>
          <GestureDetector gesture={zoom.fullScreen.gesture}>
            <View style={styles.fsGestureArea}>
              <Animated.View style={[styles.rackCanvas, { transform: zoom.fullScreen.transform }]} onLayout={zoom.fullScreen.onContentLayout}>
                {zoom.fullScreen.visible && grid}
              </Animated.View>
            </View>
          </GestureDetector>
          <Text style={styles.fsHint}>Pinch in to close</Text>
        </GestureHandlerRootView>
      </Modal>
    </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md, padding: spacing.xl },
  missing: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center' },
  missingBack: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  missingBackText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 50 },
  // Centred nav cluster: ‹ rack name › — gold arrows hop between storage units.
  titleNav: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  title: { flexShrink: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, textAlign: 'center', letterSpacing: 1 },
  navArrow: { fontSize: 26, fontFamily: fonts.headingSemibold, color: colors.gold, paddingHorizontal: 2 },
  navArrowDisabled: { color: 'rgba(224,184,74,0.25)' },
  // Fixed width balances the back arrow so the title stays centred.
  headerEdit: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.gold, textAlign: 'right', width: 50 },
  headerSpacer: { width: 50 },
  voiceBubble: { alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 8, paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  headerDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  hintBlock: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: 4 },
  hint: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'left', lineHeight: 20 },
  hintLink: { fontFamily: fonts.headingSemibold, color: colors.gold, textDecorationLine: 'underline' },
  viewOnly: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  // Gold tally between full-width rules.
  summary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingVertical: spacing.sm, marginTop: spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider },
  scroll: { paddingTop: spacing.md, paddingBottom: 60 },
  movingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)' },
  movingBannerText: { flex: 1, fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 18 },
  movingCancel: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textDecorationLine: 'underline' },
  banner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  bannerText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  bannerCancel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginTop: spacing.xs, textDecorationLine: 'underline' },
  // Clipped cream viewport the grid scales/pans inside. Its margin + padding
  // (spacing.md each) are GRID_INSET in RackGrid, so the grid fits the width at
  // rest; overflow:hidden turns it into a pan window once zoomed.
  rackViewport: { marginHorizontal: spacing.md, marginVertical: spacing.sm, padding: spacing.md, backgroundColor: colors.creamDim, borderRadius: 14, overflow: 'hidden' },
  rackScroll: { flexGrow: 1, justifyContent: 'center' },
  rackCanvas: { alignItems: 'center' },
  uploadingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  uploadingText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: '#FFFFFF' },
  fsContainer: { flex: 1, backgroundColor: colors.background },
  fsGestureArea: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  fsHint: { position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', color: colors.textMuted, fontSize: 13, fontFamily: fonts.bodyRegular },
});
