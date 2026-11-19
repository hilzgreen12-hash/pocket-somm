import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, type ListRenderItem } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCellar, useArchive, invalidateCellarViews } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useCellarContext } from '../../src/hooks/useCellarContext';
import {
  useCellarListFilters, locationOptions, PRICE_SORT_OPTIONS, SCORE_SORT_OPTIONS, COLOUR_OPTIONS, MATURITY_OPTIONS,
  type SortMode, type CellarListRowData,
} from '../../src/hooks/useCellarListFilters';
import { useBulkIntel } from '../../src/hooks/useBulkIntel';
import { archiveBottles } from '../../src/services/archiveNight';
import { moveExternalBottlesHome, moveWholeWineHome, type HomeDestination } from '../../src/services/moveBottles';
import { rackRoomFor, confirmRackRoom } from '../../src/services/rackMoves';
import { backfillMissingMaturities } from '../../src/services/maturityBackfill';
import { deleteCellarWine } from '../../src/api/cellar';
import { getBins, getBinOfCell } from '../../src/api/bins';
import { fetchCellarLocations, createCellarLocation, setCustomFilterWines, renameCustomFilter, deleteCustomFilter, type CustomFilter } from '../../src/api/customFilters';
import { fetchStorageLocations } from '../../src/api/storageLocations';
import {
  fetchPlacementsForWines, reconcileQuantityBelowPlacements,
  deleteLocationKeepWines, deleteLocationAndWines, type CellarPlacement,
} from '../../src/api/placements';
import { todayYmd } from '../../src/utils/reviewDate';
import { confirmWineDelete, reviewsOn } from '../../src/utils/confirmWineDelete';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveNoteModal } from '../../src/components/ArchiveNoteModal';
import { useReturnToCellar } from '../../src/components/winecard/cellar/useReturnToCellar';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { BulkIntelProgress } from '../../src/components/BulkIntelProgress';
import { RenameModal } from '../../src/components/RenameModal';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import { CellarListRow } from '../../src/components/cellarList/CellarListRow';
import { MoveHomeModal } from '../../src/components/cellarList/MoveHomeModal';
import { AddWineChooser } from '../../src/components/cellarList/AddWineChooser';
import { FilterSheet, type FilterSheetOption } from '../../src/components/cellarList/FilterSheet';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import type { CellarWine, StorageLocation, WineRack } from '../../src/types/wine';

// Your Cellar List — and, opened with ?archived=1, Your Cellar Archive (the
// archived wines, one line per wine). ?add=1 opens the Add Wine chooser;
// ?region= pre-filters to a region group (from Cellar Insights' Most Collected).

type Sheet = 'location' | 'country' | 'colour' | 'maturity' | 'price' | 'score' | null;

const NEW_LOCATION = 'new_location';

// Stable empty defaults, so the memoised filters don't recompute while a query loads.
const NO_PLACEMENTS: CellarPlacement[] = [];
const NO_STORAGE: StorageLocation[] = [];
const NO_CUSTOM: CustomFilter[] = [];
const NO_BINS: WineRack[] = [];
const NO_CELLS = new Map<string, string>();

// The two self-heal scans below read the whole cellar, so each runs once per
// app session per cellar rather than on every visit.
const healedThisSession = new Set<string>();
function firstTimeThisSession(key: string): boolean {
  if (healedThisSession.has(key)) return false;
  healedThisSession.add(key);
  return true;
}

const winesLabel = (n: number) => `${n} ${n === 1 ? 'wine' : 'wines'}`;
const bottlesLabel = (n: number) => `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');

type MoveHomeTarget =
  | { kind: 'one'; wine: CellarWine; externalPls: CellarPlacement[]; max: number }
  | { kind: 'selected' };

type LocationPicker = { mode: 'new' } | { mode: 'edit'; location: CustomFilter };

export default function CellarListScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { role, ownerId } = useCellarContext();
  const canEdit = role !== 'view';
  const cellarId = ownerId ?? userId;
  const { archived, added, add, region, wine } = useLocalSearchParams<{ archived?: string; added?: string; add?: string; region?: string; wine?: string }>();
  const isArchiveView = archived === '1';

  const { wines, isLoading, isError } = useCellar();
  const archive = useArchive({ enabled: isArchiveView });
  const { racks } = useRacks();

  // ---- Storage data: placements, alt cellars, bins, custom Locations ----

  const allWineIds = useMemo(() => wines.map((w) => w.id), [wines]);
  const placementsQuery = useQuery({
    queryKey: ['placements-list', allWineIds],
    queryFn: () => fetchPlacementsForWines(allWineIds),
    enabled: allWineIds.length > 0 && !isArchiveView,
  });
  const allPlacements = placementsQuery.data ?? NO_PLACEMENTS;
  const placementsByWine = useMemo(() => {
    const m = new Map<string, CellarPlacement[]>();
    for (const p of allPlacements) {
      const list = m.get(p.cellar_wine_id);
      if (list) list.push(p); else m.set(p.cellar_wine_id, [p]);
    }
    return m;
  }, [allPlacements]);

  const storageQuery = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const storageLocations = storageQuery.data ?? NO_STORAGE;
  const externalLocIds = useMemo(
    () => new Set(storageLocations.filter((s) => s.is_external).map((s) => s.id)),
    [storageLocations],
  );
  const externalPlacementsOf = useCallback(
    (w: CellarWine) => (placementsByWine.get(w.id) ?? [])
      .filter((p) => p.kind === 'location' && externalLocIds.has(p.storage_location_id ?? '')),
    [placementsByWine, externalLocIds],
  );

  const { data: bins = NO_BINS } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const binIds = useMemo(() => bins.map((b) => b.id), [bins]);
  const { data: binOfCell = NO_CELLS } = useQuery({
    queryKey: ['bin-cells', 'owners', binIds],
    queryFn: () => getBinOfCell(binIds),
    enabled: binIds.length > 0,
  });

  // Custom "Locations": tags the user puts on wines (custom_filters with no rack).
  const { data: customLocations = NO_CUSTOM } = useQuery({
    queryKey: ['cellar-locations', userId],
    queryFn: () => fetchCellarLocations(userId!),
    enabled: !!userId,
  });
  const refetchCustomLocations = () => qc.invalidateQueries({ queryKey: ['cellar-locations', userId] });
  // After any change to the cellar's wines: every cellar view, plus the custom
  // Locations (a deleted wine leaves them).
  function refreshAll() {
    invalidateCellarViews(qc);
    refetchCustomLocations();
  }

  const filters = useCellarListFilters({
    wines: isArchiveView ? archive.wines : wines,
    isArchiveView,
    placementsByWine,
    externalLocIds,
    binOfCell,
    customLocations,
    initialRegion: region ? String(region) : null,
    initialWineId: wine ? String(wine) : null,
  });

  // ---- Background upkeep (editors only) ----

  // Heal any wine whose quantity drifted BELOW its rack-slot bottles (an
  // impossible state, e.g. after an over-counted archive).
  useEffect(() => {
    if (!userId || !canEdit || wines.length === 0 || !firstTimeThisSession(`quantity:${cellarId}`)) return;
    reconcileQuantityBelowPlacements(userId)
      .then((healed) => { if (healed > 0) invalidateCellarViews(qc); })
      .catch(() => { /* best-effort heal */ });
  }, [userId, cellarId, canEdit, wines.length, qc]);

  // Drinking windows for wines that have none, quietly in the background, so the
  // Maturity filter doesn't drop them. Wines held only in External Storage stay
  // on-demand (as do imports — see maturityBackfill).
  const storageKnown = placementsQuery.isSuccess && storageQuery.isSuccess;
  useEffect(() => {
    if (!userId || !canEdit || isArchiveView || !storageKnown) return;
    const externalOnly = (w: CellarWine) => {
      const external = externalPlacementsOf(w).reduce((n, p) => n + (p.quantity ?? 0), 0);
      return external > 0 && external >= (w.quantity ?? 0);
    };
    void backfillMissingMaturities(userId, wines.filter((w) => !externalOnly(w)), () => qc.invalidateQueries({ queryKey: ['cellar', userId] }));
  }, [userId, canEdit, isArchiveView, storageKnown, wines, externalPlacementsOf, qc]);

  // ---- Arrival: "added" toast, ?add=1 ----

  // Brief "Added" toast after an add flow lands here; each add returns with a
  // fresh `added` value.
  const [showAddedToast, setShowAddedToast] = useState(false);
  const lastAddedRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!added || added === lastAddedRef.current) return;
    lastAddedRef.current = added;
    setShowAddedToast(true);
    const t = setTimeout(() => setShowAddedToast(false), 2600);
    return () => clearTimeout(t);
  }, [added]);

  const [addWineOpen, setAddWineOpen] = useState(false);
  const addParamHandledRef = useRef(false);
  useEffect(() => {
    if (add !== '1' || isArchiveView || !canEdit || addParamHandledRef.current) return;
    addParamHandledRef.current = true;
    setAddWineOpen(true);
  }, [add, isArchiveView, canEdit]);

  // ---- One wine: the long-press pop-up and its actions ----

  const [busy, setBusy] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<CellarWine | null>(null);
  const returnToCellar = useReturnToCellar();
  const [moveHome, setMoveHome] = useState<MoveHomeTarget | null>(null);

  function openWineActions(w: CellarWine) {
    const externalPls = externalPlacementsOf(w);
    const live = !isArchiveView;
    const buttons = [
      ...(canEdit ? [{ text: 'Edit Label or Wine Info', onPress: () => router.push(`/cellar/edit-wine/${w.id}`) }] : []),
      // Only for bottles held in an external cellar — they can come home, never go back.
      ...(canEdit && externalPls.length > 0 ? [{ text: 'Move to Home Storage', onPress: () => startMoveOneHome(w, externalPls) }] : []),
      ...(live ? [{ text: 'View Location', onPress: () => viewWineLocation(w) }] : []),
      ...(canEdit && live ? [
        { text: 'Select', onPress: () => startSelect(w) },
        { text: 'Archive Wine', onPress: () => setArchiveTarget(w) },
      ] : []),
      ...(canEdit && !live ? [{ text: 'Return to Cellar', onPress: () => returnToCellar.start(archiveRowsOf(w)) }] : []),
      ...(canEdit ? [{ text: 'Delete Wine', style: 'destructive' as const, onPress: () => confirmDelete(w) }] : []),
    ];
    if (buttons.length === 0) return;
    showAlert({
      title: wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name,
      buttons: [...buttons, { text: 'Cancel', style: 'cancel' }],
    });
  }

  // Jump to where the wine's bottles are: one place goes straight there, several
  // offer a choice, none says they're loose.
  function viewWineLocation(w: CellarWine) {
    const dests = new Map<string, string>();   // route → label (one entry per place)
    let unresolvedBin = false;
    for (const p of placementsByWine.get(w.id) ?? []) {
      if (p.kind === 'rack' && p.rack_id) {
        dests.set(`/cellar/rack/${p.rack_id}?highlight=${w.id}`, racks.find((r) => r.id === p.rack_id)?.name ?? 'Rack');
      } else if (p.kind === 'bin') {
        const binId = binOfCell.get(p.bin_cell_id ?? '');
        if (binId) dests.set(`/cellar/bin/${binId}?highlight=${w.id}`, bins.find((b) => b.id === binId)?.name ?? 'Bin');
        else unresolvedBin = true;
      } else if (p.kind === 'location' && p.storage_location_id) {
        const l = storageLocations.find((s) => s.id === p.storage_location_id);
        dests.set(`/cellar/storage-location/${p.storage_location_id}?highlight=${w.id}`, `${l?.name ?? 'Alt Cellar'}${l?.is_external ? ' (external)' : ''}`);
      }
    }
    const places = [...dests];
    if (places.length === 0) {
      showAlert(unresolvedBin
        ? { title: 'Stored in a bin', body: 'This wine is filed in a storage bin — open it from Your Wines At Home on the Cellar tab.' }
        : { title: 'No home-storage location', body: 'This wine has no placement yet — its bottles are loose in Your Cellar List.' });
      return;
    }
    if (places.length === 1) { router.push(places[0][0]); return; }
    showAlert({
      title: 'View location',
      buttons: [...places.map(([route, label]) => ({ text: label, onPress: () => router.push(route) })), { text: 'Cancel', style: 'cancel' }],
    });
  }

  // Archive from the list, as the wine card does: the bottles leave storage
  // (from the location being filtered on first) and the note becomes the
  // archived bottles' Archive Note.
  async function handleArchiveConfirm(count: number, note: string, date: string) {
    const w = archiveTarget;
    if (!w) return;
    setBusy(true);
    try {
      const { archived } = await archiveBottles(w.id, count, date, { fromUnit: filters.unitFilter ?? undefined, note: note || undefined });
      if (archived === 0) throw new Error('That wine is no longer in your cellar. Pull to refresh and try again.');
      setArchiveTarget(null);
    } catch (err) {
      showAlert({ title: 'Could not archive', body: errorText(err) });
    } finally {
      refreshAll();
      setBusy(false);
    }
  }

  // In the archive one line stands for every archived entry of the wine
  // (newest first).
  function archiveRowsOf(w: CellarWine): CellarWine[] {
    const ids = filters.groupIds.get(w.id) ?? [w.id];
    return ids.map((id) => archive.wines.find((a) => a.id === id)).filter((a): a is CellarWine => !!a);
  }

  function confirmDelete(w: CellarWine) {
    const rows = isArchiveView ? archiveRowsOf(w) : [w];
    const ids = rows.map((r) => r.id);
    confirmWineDelete({
      reviewsLost: reviewsOn(rows),
      onDelete: async () => {
        setBusy(true);
        // Deleting the row also deletes its rack slots and placements (cascade).
        try { for (const id of ids) await deleteCellarWine(id); }
        catch (err) { showAlert({ title: 'Could not delete', body: errorText(err) }); }
        finally { refreshAll(); setBusy(false); }
      },
      onArchive: isArchiveView ? undefined : async () => {
        setBusy(true);
        try { await archiveBottles(w.id, Infinity, todayYmd()); }
        catch (err) { showAlert({ title: 'Could not archive', body: errorText(err) }); }
        finally { refreshAll(); setBusy(false); }
      },
    });
  }

  function startMoveOneHome(w: CellarWine, externalPls: CellarPlacement[]) {
    const max = externalPls.reduce((n, p) => n + (p.quantity ?? 0), 0);
    if (max > 0) setMoveHome({ kind: 'one', wine: w, externalPls, max });
  }

  async function moveOneHome(target: Extract<MoveHomeTarget, { kind: 'one' }>, dest: HomeDestination, count: number) {
    const w = target.wine;
    try {
      // A rack or fridge only takes as many as it has free slots for.
      const sending = dest.kind === 'rack'
        ? await confirmRackRoom(await rackRoomFor(dest.id, w.bottle_size_ml ?? 750), count, 'stay in external storage')
        : count;
      if (sending === 0) return;
      const moved = await moveExternalBottlesHome(w.id, sending, target.externalPls, dest);
      if (moved === 0) throw new Error('Those bottles are no longer in external storage. Pull to refresh and try again.');
      refreshAll();
      if (dest.kind === 'rack') router.push(`/cellar/rack/${dest.id}?placeWine=${w.id}&placeLimit=${moved}`);
      else if (dest.kind === 'bin') router.push(`/cellar/bin/${dest.id}`);
      else showAlert({ title: 'Moved home', body: `${bottlesLabel(moved)} of ${w.wine_name} moved out of external storage to ${dest.kind === 'location' ? dest.name : 'Your Cellar List'}.` });
    } catch (err) {
      refreshAll();
      showAlert({ title: 'Could not move', body: errorText(err) });
    }
  }

  // ---- Select mode: archive or move several wines at once (live list only) ----

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set());

  function startSelect(w: CellarWine) {
    setSelectedIds(new Set([w.id]));
    setSelectMode(true);
  }
  function exitSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }
  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // A bulk action only ever touches what's on screen: when filters or search
  // hide a selected wine, it drops out of the selection.
  useEffect(() => {
    if (!selectMode) return;
    const visible = new Set(filters.rows.map((r) => r.wine.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [filters.rows, selectMode]);

  // Runs `act` on each wine in turn. On a failure the wines already done leave
  // the selection, so trying again only runs the rest.
  async function runOnSelected(ids: string[], act: (id: string) => Promise<unknown>, verb: string, past: string): Promise<boolean> {
    setBusy(true);
    const done = new Set<string>();
    try {
      for (const id of ids) { await act(id); done.add(id); }
      exitSelect();
      return true;
    } catch (err) {
      setSelectedIds((prev) => new Set([...prev].filter((id) => !done.has(id))));
      showAlert(done.size
        ? { title: `Some ${past}, then hit a snag`, body: `${done.size} of ${ids.length} ${past}. The rest are still selected — try again. ${errorText(err)}` }
        : { title: `Could not ${verb}`, body: errorText(err) });
      return false;
    } finally {
      refreshAll();
      setBusy(false);
    }
  }

  function confirmArchiveSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    showAlert({
      title: `Archive ${winesLabel(ids.length)}?`,
      body: 'Every bottle of each moves to Your Cellar Archive, dated today, and leaves wherever it was stored. Your reviews and history stay.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        // Infinity = every bottle, at the wine's latest count.
        { text: 'Archive', onPress: () => void runOnSelected(ids, (id) => archiveBottles(id, Infinity, todayYmd()), 'archive', 'archived') },
      ],
    });
  }

  async function moveSelectedHome(dest: HomeDestination) {
    const ids = [...selectedIds];
    if (dest.kind === 'rack' && !(await confirmRackRoomForWines(ids, dest))) return;
    if (!(await runOnSelected(ids, (id) => moveWholeWineHome(id, dest), 'move', 'moved'))) return;
    if (dest.kind === 'rack') router.push(`/cellar/rack/${dest.id}`);
    else if (dest.kind === 'bin') router.push(`/cellar/bin/${dest.id}`);
    else showAlert({ title: 'Moved', body: `${winesLabel(ids.length)} moved to ${dest.kind === 'location' ? dest.name : 'Your Cellar List, unplaced'}.` });
  }

  // Every bottle of the chosen wines goes to wait for a slot in the rack. When
  // they won't all fit, say how many will (the rest stay in Your Cellar List,
  // unplaced) and let the user back out. Resolves true to go ahead.
  async function confirmRackRoomForWines(ids: string[], dest: { id: string; name: string }): Promise<boolean> {
    const bySize = new Map<number, number>();
    for (const id of ids) {
      const w = wines.find((x) => x.id === id);
      if (w) bySize.set(w.bottle_size_ml ?? 750, (bySize.get(w.bottle_size_ml ?? 750) ?? 0) + (w.quantity ?? 1));
    }
    let fit = 0;
    let total = 0;
    try {
      for (const [size, n] of bySize) {
        fit += Math.min(n, (await rackRoomFor(dest.id, size)).free);
        total += n;
      }
    } catch (err) {
      showAlert({ title: 'Could not move', body: errorText(err) });
      return false;
    }
    if (fit >= total) return true;
    return new Promise((resolve) => {
      showAlert({
        title: 'Not enough room',
        body: fit > 0
          ? `Only ${fit} of ${total} will fit in ${dest.name} — the rest stay in Your Cellar List.`
          : `There's no free slot in ${dest.name} for these bottles. Nothing has been moved.`,
        dismissable: false,
        buttons: fit > 0
          ? [{ text: 'Move', onPress: () => resolve(true) }, { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) }]
          : [{ text: 'OK', style: 'cancel', onPress: () => resolve(false) }],
      });
    });
  }

  function onMoveHomePick(dest: HomeDestination, count: number) {
    const target = moveHome;
    setMoveHome(null);
    if (target?.kind === 'one') void moveOneHome(target, dest, count);
    else if (target?.kind === 'selected') void moveSelectedHome(dest);
  }

  // ---- List rows ----

  // Rows are memoised, so they get stable callbacks that run the latest handlers.
  const rowHandlers = useRef({ press: (_w: CellarWine) => {}, longPress: (_w: CellarWine) => {} });
  useEffect(() => {
    rowHandlers.current = {
      press: (w) => (selectMode ? toggleSelected(w.id) : router.push(`/cellar/${w.id}`)),
      longPress: (w) => (selectMode ? toggleSelected(w.id) : openWineActions(w)),
    };
  });
  const onRowPress = useCallback((w: CellarWine) => rowHandlers.current.press(w), []);
  const onRowLongPress = useCallback((w: CellarWine) => rowHandlers.current.longPress(w), []);

  const showYourScore = filters.sort === 'your_desc' || filters.sort === 'your_asc';
  const renderRow = useCallback<ListRenderItem<CellarListRowData>>(({ item }) => (
    <CellarListRow
      wine={item.wine}
      bottles={item.bottles}
      showYourScore={showYourScore}
      showArchivedDate={isArchiveView}
      selectMode={selectMode}
      selected={selectedIds.has(item.wine.id)}
      onPress={onRowPress}
      onLongPress={onRowLongPress}
    />
  ), [showYourScore, isArchiveView, selectMode, selectedIds, onRowPress, onRowLongPress]);

  // ---- Location filter: custom Locations and alt cellars ----

  const [renameLoc, setRenameLoc] = useState<{ id: string; name: string } | null>(null);
  const [locationPicker, setLocationPicker] = useState<LocationPicker | null>(null);
  const [busyLoc, setBusyLoc] = useState(false);
  // Deleting a location's wines (a big import can be ~1000 rows, deleted one by
  // one) shows a real percentage so it never looks frozen.
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState({ done: 0, total: 0 });

  const locOptions = useMemo<FilterSheetOption[]>(() => {
    const opts: FilterSheetOption[] = locationOptions({ customLocations, racks, bins, storageLocations })
      .map((o) => ({ ...o, manageable: canEdit && (o.value.startsWith('loc:') || o.value.startsWith('sloc:')) }));
    // "+ New Location" follows the custom Locations it creates.
    if (canEdit) opts.splice(1 + customLocations.length, 0, { value: NEW_LOCATION, label: '+ New Location', action: true });
    return opts;
  }, [customLocations, racks, bins, storageLocations, canEdit]);

  function manageLocation(opt: FilterSheetOption) {
    if (opt.value.startsWith('loc:')) openCustomLocationOptions(opt.value.slice(4), opt.label);
    else if (opt.value.startsWith('sloc:')) openStorageLocationOptions(opt.value.slice(5), opt.label);
  }

  function openCustomLocationOptions(id: string, name: string) {
    const location = customLocations.find((l) => l.id === id);
    showAlert({
      title: name,
      body: 'Add or remove the wines in this location, rename it, or delete it. Your wines stay in your cellar either way.',
      buttons: [
        { text: 'Add/Remove Wines', onPress: () => { if (location) setLocationPicker({ mode: 'edit', location }); } },
        { text: 'Rename Filter', onPress: () => setRenameLoc({ id, name }) },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteCustomLocation(id, name) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmDeleteCustomLocation(id: string, name: string) {
    showAlert({
      title: `Delete "${name}"?`,
      body: 'This removes the location. Your wines stay in your cellar.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomFilter(id);
              if (filters.location === `loc:${id}`) filters.setLocation('All');
              refetchCustomLocations();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: errorText(err) });
            }
          },
        },
      ],
    });
  }

  async function saveLocationRename(name: string) {
    if (!renameLoc) return;
    setBusyLoc(true);
    try {
      await renameCustomFilter(renameLoc.id, name);
      refetchCustomLocations();
      setRenameLoc(null);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: errorText(err) });
    } finally {
      setBusyLoc(false);
    }
  }

  // The picker is authoritative over the location's FULL set of wines, so an
  // edit replaces the set.
  async function saveLocationPicker(name: string, ids: string[]) {
    if (!locationPicker || !userId) return;
    setBusyLoc(true);
    try {
      if (locationPicker.mode === 'new') {
        await createCellarLocation(userId, name, ids);
      } else {
        await renameCustomFilter(locationPicker.location.id, name);
        await setCustomFilterWines(locationPicker.location.id, ids);
      }
      refetchCustomLocations();
      setLocationPicker(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: errorText(err) });
    } finally {
      setBusyLoc(false);
    }
  }

  const locationPickerItems = useMemo(
    () => (locationPicker ? wines.map((w) => ({ id: w.id, label: wineHeaderLine(w.producer, w.wine_name, w.vintage), sublabel: w.region ?? undefined })) : []),
    [locationPicker, wines],
  );

  // Long-press an alt cellar (e.g. an import's folder) to delete it, keeping its
  // wines (unplaced) or deleting them too — used to wipe and redo a bad import.
  function openStorageLocationOptions(id: string, name: string) {
    showAlert({
      title: name,
      body: 'Delete this location. Choose whether to keep the wines in your cellar (moved to Unplaced Bottles) or delete them too.',
      buttons: [
        { text: 'Delete location &\nmove wines to Unplaced Bottles', onPress: () => confirmDeleteStorageKeepWines(id, name) },
        { text: 'Delete location & wines', style: 'destructive', onPress: () => confirmDeleteStorageAndWines(id, name) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function afterStorageLocationDeleted(id: string) {
    if (filters.location === `sloc:${id}`) filters.setLocation('All');
    refreshAll();
  }

  function confirmDeleteStorageKeepWines(id: string, name: string) {
    showAlert({
      title: `Delete "${name}"?`,
      body: 'The location is removed and its wines move to Unplaced Bottles. Your wines stay in your cellar.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete location',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLocationKeepWines(id);
              afterStorageLocationDeleted(id);
            } catch (err) {
              showAlert({ title: 'Could not delete', body: errorText(err) });
            }
          },
        },
      ],
    });
  }

  function confirmDeleteStorageAndWines(id: string, name: string) {
    showAlert({
      title: `Delete "${name}" and its wines?`,
      body: 'This permanently deletes the location AND every bottle filed only in it. Wines that also live elsewhere keep their other bottles. This cannot be undone.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete location & wines',
          style: 'destructive',
          onPress: async () => {
            setDeleteProgress({ done: 0, total: 0 });
            setDeleting(true);
            try {
              const { deletedWines } = await deleteLocationAndWines(id, (done, total) => setDeleteProgress({ done, total }));
              afterStorageLocationDeleted(id);
              showAlert({ title: 'Location deleted', body: `"${name}" and ${winesLabel(deletedWines)} removed.` });
            } catch (err) {
              refreshAll();
              showAlert({ title: 'Could not delete', body: errorText(err) });
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    });
  }

  // ---- "Update all": critic scores and values for wines missing them ----

  // Imported wines and wines a recent run couldn't value are left out (see
  // services/bulkIntel); the photo-less get a label photo found while we're here.
  const bulkIntel = useBulkIntel(refreshAll, { findLabels: true });
  const { eligible: bulkEligible } = bulkIntel;
  const intelTargets = useMemo(
    () => (isArchiveView ? [] : bulkEligible(filters.missingIntel)),
    [isArchiveView, bulkEligible, filters.missingIntel],
  );

  // ---- Filter chips and their pop-ups ----

  const [openSheet, setOpenSheet] = useState<Sheet>(null);
  const priceActive = PRICE_SORT_OPTIONS.some((o) => o.value === filters.sort);
  const scoreActive = SCORE_SORT_OPTIONS.some((o) => o.value === filters.sort);
  const sortLabel = [...PRICE_SORT_OPTIONS, ...SCORE_SORT_OPTIONS].find((o) => o.value === filters.sort)?.label ?? 'Recently Added';
  const locationLabel = filters.location === 'All' ? 'All'
    // The "View All" options read as their group's name on the chip.
    : filters.location === 'home' ? 'All Wines At Home'
    : filters.location === 'external' ? 'All Wines Stored Externally'
    : locOptions.find((o) => o.value === filters.location)?.label ?? 'All';
  const maturityLabel = MATURITY_OPTIONS.find((o) => o.value === filters.maturity && o.value !== 'All')?.label ?? 'All';

  function sheetFor(field: Sheet): { title: string; options: FilterSheetOption[]; selected: string; onSelect: (v: string) => void } | null {
    const sortReset = { value: 'recent', label: 'Recently added (default)' };
    const setSort = (v: string) => filters.setSort(v as SortMode);
    switch (field) {
      case 'location':
        return {
          title: 'Filter by location',
          options: locOptions,
          selected: filters.location,
          onSelect: (v) => (v === NEW_LOCATION ? setLocationPicker({ mode: 'new' }) : filters.setLocation(v)),
        };
      case 'country':
        return { title: 'Filter by country', options: filters.countries.map((c) => ({ value: c, label: c === 'All' ? 'All countries' : c })), selected: filters.country, onSelect: filters.setCountry };
      case 'colour':
        return { title: 'Filter by colour', options: COLOUR_OPTIONS.map((c) => ({ value: c, label: c === 'All' ? 'All colours' : c })), selected: filters.colour, onSelect: filters.setColour };
      case 'maturity':
        return { title: 'Filter by maturity', options: MATURITY_OPTIONS, selected: filters.maturity, onSelect: filters.setMaturity };
      case 'price':
        return { title: 'Sort by Value', options: [sortReset, ...PRICE_SORT_OPTIONS], selected: filters.sort, onSelect: setSort };
      case 'score':
        return { title: 'Sort by Score', options: [sortReset, ...SCORE_SORT_OPTIONS], selected: filters.sort, onSelect: setSort };
      default:
        return null;
    }
  }
  const sheet = sheetFor(openSheet);
  const chipMarker = (field: Sheet) => (openSheet === field ? '▴' : '▾');

  // ---- Render ----

  const listLoading = isArchiveView ? archive.isLoading : isLoading;
  const listError = isArchiveView ? archive.isError : isError;
  const sourceEmpty = (isArchiveView ? archive.wines : wines).length === 0;

  if (listLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Back">
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>{isArchiveView ? 'Your Cellar Archive' : 'Your Cellar List'}</Text>

      {showAddedToast && (
        <View style={styles.addedToast} pointerEvents="none">
          <Text style={styles.addedToastText}>Added to Your Cellar List ✓</Text>
        </View>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your cellar"
          body={`Track every bottle in your collection — sign in to see ${isArchiveView ? 'Your Cellar Archive' : 'Your Cellar List'}.`}
        />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {winesLabel(filters.rows.length)} · {bottlesLabel(filters.totalBottles)}
            </Text>
            {intelTargets.length > 0 ? (
              <TouchableOpacity onPress={() => bulkIntel.start(intelTargets, 'intel', 'Update all')} activeOpacity={0.7} style={styles.missingIntelBtn}>
                <Text style={styles.missingIntelText}>
                  {winesLabel(intelTargets.length)} missing intel · <Text style={styles.missingIntelLink}>Update all</Text>
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.filterHint}>Listed by {sortLabel} · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            {/* A Region chip leads when the list was opened from Most Collected —
                tap it to clear the region. Location and Maturity are live-list only. */}
            {filters.onlyWineId ? (
              <FilterChip label="Showing" value="This wine" active marker="✕" onPress={() => filters.setOnlyWineId(null)} accessibilityLabel="Show all wines" />
            ) : null}
            {filters.region ? (
              <FilterChip label="Region" value={filters.region} active marker="✕" onPress={() => filters.setRegion(null)} accessibilityLabel={`Clear the ${filters.region} filter`} />
            ) : null}
            {!isArchiveView && (
              <FilterChip label="Location" value={locationLabel} active={filters.location !== 'All'} marker={chipMarker('location')} onPress={() => setOpenSheet('location')} />
            )}
            {!isArchiveView && (
              <FilterChip label="Maturity" value={maturityLabel} active={filters.maturity !== 'All'} marker={chipMarker('maturity')} onPress={() => setOpenSheet('maturity')} />
            )}
            <FilterChip label="Score" value={scoreActive ? sortLabel : 'Any'} active={scoreActive} marker={chipMarker('score')} onPress={() => setOpenSheet('score')} />
            <FilterChip label="Value" value={priceActive ? sortLabel : 'Any'} active={priceActive} marker={chipMarker('price')} onPress={() => setOpenSheet('price')} />
            <FilterChip label="Country" value={filters.country} active={filters.country !== 'All'} marker={chipMarker('country')} onPress={() => setOpenSheet('country')} />
            <FilterChip label="Colour" value={filters.colour} active={filters.colour !== 'All'} marker={chipMarker('colour')} onPress={() => setOpenSheet('colour')} />
          </ScrollView>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={filters.search}
              onChangeText={filters.setSearch}
              placeholder="Search producer, wine, region, vintage…"
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {filters.search.length > 0 && (
              <TouchableOpacity onPress={() => filters.setSearch('')} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.searchClearText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {filters.rows.length === 0 ? (
            <View style={styles.empty}>
              {listError ? (
                // Distinct from the empty state on purpose: the list is [] on a
                // failed fetch too, and an "empty" cellar reads as data loss.
                <>
                  <Text style={styles.emptyTitle}>Couldn&apos;t load {isArchiveView ? 'Your Cellar Archive' : 'your cellar'}</Text>
                  <Text style={styles.emptyBody}>Check your connection and try again. Your wines are safe.</Text>
                  <TouchableOpacity style={styles.retryBtn} onPress={() => qc.invalidateQueries({ queryKey: [isArchiveView ? 'cellar-archive' : 'cellar', userId] })} activeOpacity={0.85}>
                    <Text style={styles.retryBtnText}>Try again</Text>
                  </TouchableOpacity>
                </>
              ) : sourceEmpty ? (
                isArchiveView ? (
                  <>
                    <Text style={styles.emptyTitle}>Your Cellar Archive is empty</Text>
                    <Text style={styles.emptyBody}>Wines you archive from Your Cellar List land here.</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.emptyTitle}>Your cellar is empty</Text>
                    <Text style={styles.emptyBody}>Add wines to your cellar to generate your list.</Text>
                  </>
                )
              ) : (
                <>
                  <Text style={styles.emptyTitle}>No wines match</Text>
                  <Text style={styles.emptyBody}>Try clearing some filters to see more of your cellar.</Text>
                </>
              )}
            </View>
          ) : (
            <FlatList
              style={styles.list}
              data={filters.rows}
              keyExtractor={(r) => r.wine.id}
              renderItem={renderRow}
              contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: selectMode ? 150 : 60 }}
              initialNumToRender={12}
              windowSize={7}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </>
      )}

      {selectMode && (
        <View style={styles.selectBar}>
          <View style={styles.selectBarTop}>
            <Text style={styles.selectBarCount}>{busy ? 'Working…' : `${selectedIds.size} selected`}</Text>
            <TouchableOpacity onPress={exitSelect} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.selectBarCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectBarActions}>
            {[
              { label: 'Archive', onPress: confirmArchiveSelected },
              { label: 'Move', onPress: () => setMoveHome({ kind: 'selected' }) },
            ].map((a) => {
              const disabled = selectedIds.size === 0 || busy;
              return (
                <TouchableOpacity key={a.label} style={[styles.selectAction, disabled && styles.selectActionDisabled]} disabled={disabled} onPress={a.onPress}>
                  <Text style={styles.selectActionText}>{a.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      <BulkIntelProgress progress={bulkIntel.progress} title="Updating wine intel…" onStop={bulkIntel.stop} />

      {/* Deleting a location's wines. Back is blocked mid-delete. */}
      <Modal visible={deleting} animationType="fade" onRequestClose={() => {}}>
        <View style={styles.deleteProgressWrap}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.deleteProgressTitle}>Deleting these wines…</Text>
          <Text style={styles.deleteProgressCount}>
            {deleteProgress.total > 0
              ? `${deleteProgress.done} of ${deleteProgress.total} · ${Math.round((deleteProgress.done / deleteProgress.total) * 100)}%`
              : 'Preparing…'}
          </Text>
          <View style={styles.deleteProgressTrack}>
            <View style={[styles.deleteProgressFill, { width: `${deleteProgress.total > 0 ? Math.round((deleteProgress.done / deleteProgress.total) * 100) : 0}%` }]} />
          </View>
          <Text style={styles.deleteProgressHint}>This can take a moment for a large import — please keep Vinster open.</Text>
        </View>
      </Modal>

      <FilterSheet
        visible={!!sheet}
        title={sheet?.title ?? ''}
        hint={openSheet === 'location' && canEdit && (customLocations.length > 0 || storageLocations.length > 0) ? 'Long-press a location to manage or delete it' : undefined}
        options={sheet?.options ?? []}
        selected={sheet?.selected ?? ''}
        onSelect={(v) => sheet?.onSelect(v)}
        onLongPress={manageLocation}
        onClose={() => setOpenSheet(null)}
      />

      <RenameModal
        visible={!!renameLoc}
        initialName={renameLoc?.name ?? ''}
        title="Rename location"
        saving={busyLoc}
        onSave={saveLocationRename}
        onClose={() => setRenameLoc(null)}
      />

      {/* Create a custom Location, or add/remove the wines in one. */}
      <LibraryFilterModal
        visible={!!locationPicker}
        title={locationPicker?.mode === 'edit' ? 'Edit location' : 'New location'}
        itemNoun="wines"
        nounLabel="location"
        items={locationPickerItems}
        initialName={locationPicker?.mode === 'edit' ? locationPicker.location.name : ''}
        initialSelected={locationPicker?.mode === 'edit' ? locationPicker.location.wineIds : []}
        saving={busyLoc}
        onSave={saveLocationPicker}
        onClose={() => setLocationPicker(null)}
      />

      <AddWineChooser visible={addWineOpen} racks={racks} onClose={() => setAddWineOpen(false)} />

      <MoveHomeModal
        visible={!!moveHome}
        subtitle={moveHome?.kind === 'one'
          ? wineHeaderLine(moveHome.wine.producer, moveHome.wine.wine_name, moveHome.wine.vintage) || moveHome.wine.wine_name
          : `Every bottle of ${winesLabel(selectedIds.size)}`}
        maxBottles={moveHome?.kind === 'one' ? moveHome.max : undefined}
        racks={racks}
        bins={bins}
        storageLocations={storageLocations}
        onPick={onMoveHomePick}
        onClose={() => setMoveHome(null)}
      />

      <ArchiveNoteModal
        visible={!!archiveTarget}
        title="Archive this wine?"
        body="It moves to Your Cellar Archive and leaves any rack or location it was placed in. Your reviews and history stay."
        busy={busy}
        maxCount={archiveTarget?.quantity ?? 1}
        onConfirm={handleArchiveConfirm}
        onClose={() => setArchiveTarget(null)}
      />
    </View>
  );
}

function FilterChip({ label, value, active, marker, onPress, accessibilityLabel }: {
  label: string; value: string; active: boolean; marker: string; onPress: () => void; accessibilityLabel?: string;
}) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.chipActive]} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      <View style={styles.chipHeadingRow}>
        <Text style={[styles.chipLabel, active && styles.chipTextOn]}>{label}</Text>
        <Text style={styles.chipMarker}>{marker}</Text>
      </View>
      <Text style={[styles.chipValue, active && styles.chipTextOn]} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row' },
  back: { width: 40, fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  addedToast: { marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, backgroundColor: 'rgba(224,184,74,0.14)', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  addedToastText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.3 },

  // Summary bar: counts, then the "missing intel" link.
  summaryRow: { marginVertical: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  missingIntelBtn: { marginTop: 4 },
  missingIntelText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center' },
  missingIntelLink: { fontFamily: fonts.headingSemibold, color: colors.gold },

  // Filter chips: a label with an open/closed marker over the current value;
  // a gold outline and text when the filter is on.
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  chip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  chipActive: { borderColor: colors.gold },
  chipTextOn: { color: colors.gold },
  chipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  chipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  chipMarker: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  chipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },

  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  searchClearText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted },

  list: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  retryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },

  // Select mode's bar, floating at the bottom.
  selectBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.sm },
  selectBarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  selectBarCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  selectBarCancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold },
  selectBarActions: { flexDirection: 'row', gap: spacing.sm },
  selectAction: { flex: 1, borderWidth: 1, borderColor: 'rgba(244,235,224,0.30)', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  selectActionDisabled: { opacity: 0.4 },
  selectActionText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.cream, textAlign: 'center', letterSpacing: 0.3 },

  deleteProgressWrap: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  deleteProgressTitle: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4 },
  deleteProgressCount: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
  deleteProgressTrack: { width: '100%', maxWidth: 340, height: 8, borderRadius: 4, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  deleteProgressFill: { height: '100%', backgroundColor: colors.gold },
  deleteProgressHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
});
