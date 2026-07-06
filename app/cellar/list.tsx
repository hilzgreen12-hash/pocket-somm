import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useLabelStore } from '../../src/stores/labelStore';
import { useLineupStore } from '../../src/stores/lineupStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks } from '../../src/api/racks';
import { archiveCellarWine, deleteCellarWine } from '../../src/api/cellar';
import { fetchCellarLocations, createCellarLocation, addWinesToFilter, setCustomFilterWines, renameCustomFilter, deleteCustomFilter, type CustomFilter } from '../../src/api/customFilters';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { LabelThumb } from '../../src/components/LabelThumb';
import { RenameModal } from '../../src/components/RenameModal';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import { CellarListShareCard } from '../../src/components/CellarListShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { inferWineStyle } from '../../src/utils/wineStyle';
import { effectiveMaturity } from '../../src/utils/maturity';
import { backfillMissingMaturities } from '../../src/services/maturityBackfill';
import { inferCountry } from '../../src/utils/wineCountry';
import { formatCurrency } from '../../src/constants/currency';
import { bottleSizeCl, bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import type { CellarWine } from '../../src/types/wine';

type SortMode =
  | 'recent'
  | 'est_desc' | 'est_asc'
  | 'purch_desc' | 'purch_asc'
  | 'critic_desc' | 'critic_asc'
  | 'your_desc' | 'your_asc';

// The list defaults to most-recently-added (handled implicitly); the Price
// and Score chips each offer the four directional sorts plus a reset.
const PRICE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'est_desc',   label: 'Estimated Value Descending' },
  { value: 'est_asc',    label: 'Estimated Value Ascending' },
  { value: 'purch_desc', label: 'Purchase Price Descending' },
  { value: 'purch_asc',  label: 'Purchase Price Ascending' },
];

const SCORE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'critic_desc', label: 'Critic Score Descending' },
  { value: 'critic_asc',  label: 'Critic Score Ascending' },
  { value: 'your_desc',   label: 'Your Score Descending' },
  { value: 'your_asc',    label: 'Your Score Ascending' },
];

const PRICE_SORTS: SortMode[] = ['est_desc', 'est_asc', 'purch_desc', 'purch_asc'];
const SCORE_SORTS: SortMode[] = ['critic_desc', 'critic_asc', 'your_desc', 'your_asc'];

const COLOUR_OPTIONS = ['All', 'Red', 'White', 'Sparkling', 'Other'];

// Maturity (drinking-window) filter. Values match the stored
// `drinking_window_status` that the racks colour-code and Quick Cellar
// Stats buckets by. Ordered youngest → oldest so the dropdown reads
// as a natural maturity progression.
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All maturities' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Approaching' },
  { value: 'peak', label: 'Peak' },
  { value: 'declining', label: 'Declining' },
];

type FilterField = 'location' | 'country' | 'colour' | 'maturity' | 'price' | 'score' | 'favourite' | null;

type FavouriteFilter = 'all' | 'favourites';
const FAVOURITE_OPTIONS: { value: FavouriteFilter; label: string }[] = [
  { value: 'all', label: 'All wines' },
  { value: 'favourites', label: 'Favourites only' },
];

// Live cellar vs archived. Archived wines are viewed ONLY in the dedicated
// Cellar Archive (this same screen opened with ?archived=1); the Full Cellar
// List always hides them. There is no user-facing chip — the value is fixed by
// the route (see isArchiveView below).
type ArchivedFilter = 'hide' | 'include' | 'only';

export default function FullCellarListScreen() {
  const { session } = useAuth();
  const { wines, isLoading } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { racks } = useRacks();
  const qc = useQueryClient();

  const userId = session?.user.id;

  // One-time, gentle backfill so wines added before entry-time maturity
  // generation (and never opened) still get a drinking window — otherwise the
  // maturity filter silently drops them. Runs sequentially, paced, capped.
  useEffect(() => {
    if (!userId || wines.length === 0) return;
    void backfillMissingMaturities(wines, () => qc.invalidateQueries({ queryKey: ['cellar', userId] }));
  }, [userId, wines.length, qc]);

  // Cellar-wide "Location" filters (custom_filters with rack_id NULL).
  const { data: locations = [] } = useQuery({
    queryKey: ['cellar-locations', userId],
    queryFn: () => fetchCellarLocations(userId!),
    enabled: !!userId,
  });
  function refetchLocations() { qc.invalidateQueries({ queryKey: ['cellar-locations', userId] }); }

  // Long-press a bespoke Location chip in the filter → manage it, mirroring the
  // rack filter menu: Add/Remove Wines · Rename Filter · Delete.
  const [renameLoc, setRenameLoc] = useState<{ id: string; name: string } | null>(null);
  const [locEditTarget, setLocEditTarget] = useState<CustomFilter | null>(null);
  const [busyLoc, setBusyLoc] = useState(false);

  function openLocationOptions(id: string, name: string) {
    const loc = locations.find((l) => l.id === id);
    showAlert({
      title: name,
      body: 'Add or remove the wines in this location, rename it, or delete it. Your wines stay in your cellar either way.',
      buttons: [
        { text: 'Add/Remove Wines', onPress: () => { if (loc) setLocEditTarget(loc); } },
        { text: 'Rename Filter', onPress: () => setRenameLoc({ id, name }) },
        { text: 'Delete', style: 'destructive', onPress: () => confirmDeleteLocation(id, name) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmDeleteLocation(id: string, name: string) {
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
              if (locationFilter === `loc:${id}`) setLocationFilter('All');
              refetchLocations();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
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
      refetchLocations();
      setRenameLoc(null);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBusyLoc(false);
    }
  }

  async function saveLocationEdit(name: string, ids: string[]) {
    if (!locEditTarget) return;
    setBusyLoc(true);
    try {
      // The picker is authoritative over the FULL set, so a full replace is
      // correct here (same as the rack's edit-filter modal).
      await renameCustomFilter(locEditTarget.id, name);
      await setCustomFilterWines(locEditTarget.id, ids);
      refetchLocations();
      setLocEditTarget(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBusyLoc(false);
    }
  }

  // ---- Multi-select mode (long-press) ----
  // Long-pressing a wine tints it gold and enters selection mode, where the
  // user picks any number of wines and acts on them in bulk (archive, delete,
  // add to a Location filter) — replacing the old single-wine delete popup.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  function enterSelect(wineId: string) {
    setSelectMode(true);
    setSelectedIds(new Set([wineId]));
  }
  function toggleSelected(wineId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(wineId) ? next.delete(wineId) : next.add(wineId);
      return next;
    });
  }
  function exitSelect() {
    setSelectMode(false);
    setSelectedIds(new Set());
  }

  function invalidateCellar() {
    qc.invalidateQueries({ queryKey: ['cellar'] });
    qc.invalidateQueries({ queryKey: ['cellar-archive'] });
    qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    qc.invalidateQueries({ queryKey: ['rack-slots'] });
    qc.invalidateQueries({ queryKey: ['cellar-locations', userId] });
  }

  function confirmArchiveSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    showAlert({
      title: `Archive ${ids.length} wine${ids.length === 1 ? '' : 's'}?`,
      body: 'They move to Your Archive and leave any racks they were placed in. Your reviews and history stay.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive Wines',
          onPress: async () => {
            setBusy(true);
            const done: string[] = [];
            try {
              for (const id of ids) { await clearWineFromRacks(id); await archiveCellarWine(id); done.push(id); }
              invalidateCellar();
              exitSelect();
            } catch (err) {
              // Drop the wines already archived from the selection so a retry
              // only runs the remainder, and tell the user how far it got.
              invalidateCellar();
              if (done.length) setSelectedIds((prev) => { const next = new Set(prev); done.forEach((id) => next.delete(id)); return next; });
              showAlert({
                title: done.length ? 'Archived some, then hit a snag' : 'Could not archive',
                body: `${done.length ? `${done.length} of ${ids.length} archived. The rest are still selected — tap Archive Wines to retry. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
              });
            } finally { setBusy(false); }
          },
        },
      ],
    });
  }

  function confirmDeleteSelected() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    showAlert({
      title: `Delete ${ids.length} wine${ids.length === 1 ? '' : 's'}?`,
      body: "Permanently remove them from your records. This can't be undone.",
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete (permanent)',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            const done: string[] = [];
            try {
              for (const id of ids) { await clearWineFromRacks(id); await deleteCellarWine(id); done.push(id); }
              invalidateCellar();
              exitSelect();
            } catch (err) {
              // Drop the wines already deleted from the selection so a retry
              // only runs the remainder.
              invalidateCellar();
              if (done.length) setSelectedIds((prev) => { const next = new Set(prev); done.forEach((id) => next.delete(id)); return next; });
              showAlert({
                title: done.length ? 'Deleted some, then hit a snag' : 'Could not delete',
                body: `${done.length ? `${done.length} of ${ids.length} deleted. The rest are still selected — tap Delete to retry. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
              });
            } finally { setBusy(false); }
          },
        },
      ],
    });
  }

  // ---- Location create / add-to modal ----
  // stage 'choose' = pick an existing location (or go to naming) for the
  // selected wines; stage 'name' = type a name for a brand-new location.
  const [locModal, setLocModal] = useState<{ open: boolean; stage: 'choose' | 'name'; wineIds: string[] }>({ open: false, stage: 'choose', wineIds: [] });
  const [locNameDraft, setLocNameDraft] = useState('');

  function openAddLocationFromFilter() {
    // From the filter dropdown: create a brand-new (initially empty) location.
    setLocNameDraft('');
    setLocModal({ open: true, stage: 'name', wineIds: [] });
  }
  // "Add to Location" on the multi-select bar — adds the selected wines to a
  // cellar-wide bespoke Location (created in the Full Cellar List). Rack/fridge
  // filters are scoped to their rack and are added from within the rack itself.
  function openAddSelectedToLocation() {
    if (selectedIds.size === 0) return;
    setLocNameDraft('');
    setLocModal({ open: true, stage: 'choose', wineIds: [...selectedIds] });
  }

  // "Add a Lineup" from the Cellar List — a lineup is placed into a rack, so we
  // pick which rack first (racks only for now), then hand off to the rack's
  // slot/orientation setup via ?lineup=1.
  function startLineup() {
    setAddWineOpen(false);
    const lineupRacks = racks.filter((r) => r.storage_type === 'rack');
    if (lineupRacks.length === 0) {
      showAlert({ title: 'No racks yet', body: 'Create a wine rack first, then you can add a lineup straight into it.' });
      return;
    }
    if (lineupRacks.length === 1) {
      router.push(`/cellar/rack/${lineupRacks[0].id}?lineup=1` as any);
      return;
    }
    showAlert({
      title: 'Add a Lineup',
      body: 'Which rack?',
      buttons: [
        ...lineupRacks.map((r) => ({ text: r.name, onPress: () => router.push(`/cellar/rack/${r.id}?lineup=1` as any) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  function closeLocModal() { setLocModal({ open: false, stage: 'choose', wineIds: [] }); }

  async function addWinesToExistingLocation(loc: CustomFilter) {
    setBusy(true);
    try {
      // Incremental insert (ignores duplicates) — never rewrites the whole set
      // from a cached list, so a stale cache can't drop other members.
      await addWinesToFilter(loc.id, locModal.wineIds);
      refetchLocations();
      closeLocModal();
      exitSelect();
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally { setBusy(false); }
  }

  async function saveNewLocation() {
    const name = locNameDraft.trim();
    if (!name || !userId) return;
    setBusy(true);
    try {
      await createCellarLocation(userId, name, locModal.wineIds);
      refetchLocations();
      closeLocModal();
      exitSelect();
    } catch (err) {
      showAlert({ title: 'Could not create location', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally { setBusy(false); }
  }

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });

  const wineToRackId: Record<string, string> = {};
  for (const slot of slotAssignments) wineToRackId[slot.cellar_wine_id] = slot.rack_id;

  // 'All' | rackId | 'loc:'+locationId | 'Unassigned'
  const [locationFilter, setLocationFilter] = useState<string>('All');
  const [countryFilter, setCountryFilter] = useState<string>('All');     // 'All' | country canonical
  const [colourFilter, setColourFilter] = useState<string>('All');       // 'All' | 'Red' | 'White' | 'Sparkling' | 'Other'
  const [maturityFilter, setMaturityFilter] = useState<string>('All');   // 'All' | 'too_young' | 'approaching' | 'peak' | 'declining'
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [favouriteFilter, setFavouriteFilter] = useState<FavouriteFilter>('all');
  // "View Your Archive" reuses this screen via ?archived=1 — it locks the list
  // to archived wines only and hides the Archived filter chip so nothing
  // outside the archive can ever show.
  const { archived } = useLocalSearchParams<{ archived?: string }>();
  const isArchiveView = archived === '1';
  const [archivedFilter, setArchivedFilter] = useState<ArchivedFilter>(isArchiveView ? 'only' : 'hide');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [search, setSearch] = useState('');

  // Share the current (filtered) list as a branded PNG. Same off-screen-capture
  // pattern the wine card uses.
  const shareListRef = useRef<View>(null);
  const [sharingList, setSharingList] = useState(false);
  const [listSharePayload, setListSharePayload] = useState<React.ComponentProps<typeof CellarListShareCard> | null>(null);
  // Add-wine chooser + scan overlay. Mirrors the Cellar tab's
  // "Add Wine / Generate Wine Intel" flow so the user can kick the
  // same scan / upload / manual entry path from this screen without
  // having to bounce back to the tab landing page.
  const [addWineOpen, setAddWineOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const { setImage, setWineDetails, setError, reset: resetLabelStore } = useLabelStore();

  async function handleUpload() {
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
    router.push('/label/confirm');
  }

  // Compute available filter options from the actual cellar
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const w of wines) {
      const c = inferCountry(w.region);
      if (c) set.add(c);
    }
    return ['All', ...Array.from(set).sort()];
  }, [wines]);

  const wineStyle = (w: CellarWine): 'Red' | 'White' | 'Sparkling' | 'Other' => {
    const s = inferWineStyle({ style: (w as any).style, region: w.region, grape_variety: w.grape_variety });
    if (s === 'Red') return 'Red';
    if (s === 'White') return 'White';
    if (s === 'Sparkling') return 'Sparkling';
    return 'Other';
  };

  // Apply filters. The search query is applied last so the chips still
  // own their truth — typing a query just narrows whatever filters are on.
  const q = search.trim().toLowerCase();
  // Archived view swaps the source list; the other filters still apply.
  const baseWines = archivedFilter === 'only'
    ? archivedWines
    : archivedFilter === 'include'
      ? [...wines, ...archivedWines]
      : wines;
  const filtered = baseWines.filter((w) => {
    if (locationFilter !== 'All') {
      if (locationFilter === 'Unassigned') {
        if (wineToRackId[w.id]) return false;
      } else if (locationFilter.startsWith('loc:')) {
        const loc = locations.find((l) => l.id === locationFilter.slice(4));
        if (!loc || !loc.wineIds.includes(w.id)) return false;
      } else if (wineToRackId[w.id] !== locationFilter) {
        return false;
      }
    }
    if (countryFilter !== 'All' && inferCountry(w.region) !== countryFilter) return false;
    if (colourFilter !== 'All' && wineStyle(w) !== colourFilter) return false;
    if (maturityFilter !== 'All' && effectiveMaturity(w) !== maturityFilter) return false;
    if (favouriteFilter === 'favourites' && !w.is_favourite) return false;
    if (q) {
      const hay = [w.producer, w.wine_name, w.region, w.grape_variety, w.vintage]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort. Default ('recent') is newest-added first; the Price/Score chips
  // override with directional sorts. Nulls sort to the bottom either way.
  const sorted = [...filtered].sort((a, b) => {
    switch (sortMode) {
      case 'est_desc':   return Number(b.estimated_value ?? -1) - Number(a.estimated_value ?? -1);
      case 'est_asc':    return Number(a.estimated_value ?? Infinity) - Number(b.estimated_value ?? Infinity);
      case 'purch_desc': return Number(b.purchase_price ?? -1) - Number(a.purchase_price ?? -1);
      case 'purch_asc':  return Number(a.purchase_price ?? Infinity) - Number(b.purchase_price ?? Infinity);
      case 'critic_desc': return (b.critic_score ?? -1) - (a.critic_score ?? -1);
      case 'critic_asc':  return (a.critic_score ?? Infinity) - (b.critic_score ?? Infinity);
      case 'your_desc':   return (b.review_score ?? -1) - (a.review_score ?? -1);
      case 'your_asc':    return (a.review_score ?? Infinity) - (b.review_score ?? Infinity);
      default:            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalBottles = filtered.reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  async function handleShareList() {
    if (sharingList || sorted.length === 0) return;
    const items = sorted.map((w) => ({
      producer: w.producer,
      wineName: w.wine_name,
      region: w.region,
      vintage: w.vintage,
      quantity: w.quantity ?? 1,
      format: bottleSizeLabel(w.bottle_size_ml ?? 750),
    }));
    // Summarise the active filters for the card header (the simple chips only).
    const bits: string[] = [];
    if (countryFilter !== 'All') bits.push(countryFilter);
    if (colourFilter !== 'All') bits.push(colourFilter);
    if (maturityFilter !== 'All') bits.push(MATURITY_OPTIONS.find((m) => m.value === maturityFilter)?.label ?? maturityFilter);
    if (favouriteFilter === 'favourites') bits.push('Favourites');
    const filterSummary = bits.length ? bits.join(' · ') : null;
    const title = isArchiveView ? 'My Archive' : 'My Cellar';

    setListSharePayload({ title, items, wineCount: filtered.length, bottleCount: totalBottles, filterSummary });
    setSharingList(true);
    try {
      // One paint to let the off-screen card mount with the new props.
      await new Promise((r) => setTimeout(r, 300));
      if (shareListRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareListRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my cellar list', UTI: 'public.png' });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const lines = items.map((w) => {
        const identity = [wineHeaderLine(w.producer, w.wineName, null), w.region, w.vintage]
          .filter((p) => p && String(p).trim().length > 0)
          .join(' · ');
        return `• ${identity} — ${w.quantity} × ${w.format}`;
      });
      await Share.share({
        message: `${title} (${filtered.length} ${filtered.length === 1 ? 'wine' : 'wines'} · ${totalBottles} ${totalBottles === 1 ? 'bottle' : 'bottles'})\n\n${lines.join('\n')}${VINSTER_TEXT_SHARE_FOOTER}`,
        title,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingList(false);
      setListSharePayload(null);
    }
  }

  // Keep multi-select honest: when the filters/search change, drop any selected
  // wines that are no longer visible so a bulk action can only ever touch what's
  // on screen (previously the selection silently survived filter changes).
  useEffect(() => {
    if (!selectMode) return;
    setSelectedIds((prev) => {
      const visible = new Set(filtered.map((w) => w.id));
      const next = new Set([...prev].filter((id) => visible.has(id)));
      return next.size === prev.size ? prev : next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationFilter, countryFilter, colourFilter, maturityFilter, favouriteFilter, archivedFilter, search, selectMode]);

  // Location dropdown: All · each rack/fridge · each custom location · Not in a
  // rack · "+ Add Location" (an action, handled specially in onSelect).
  const locationOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: 'All', label: 'All locations' }];
    for (const r of racks) opts.push({ value: r.id, label: r.name });
    for (const l of locations) opts.push({ value: `loc:${l.id}`, label: l.name });
    opts.push({ value: 'Unassigned', label: 'Not in a rack' });
    opts.push({ value: '__add__', label: '＋ Add Location' });
    return opts;
  }, [racks, locations]);

  const locationLabel = locationFilter === 'All'
    ? 'All'
    : (locationOptions.find((o) => o.value === locationFilter)?.label ?? 'All');
  const priceActive = PRICE_SORTS.includes(sortMode);
  const scoreActive = SCORE_SORTS.includes(sortMode);
  const priceLabel = priceActive ? (PRICE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Any') : 'Any';
  const scoreLabel = scoreActive ? (SCORE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Any') : 'Any';
  const favouriteLabel = FAVOURITE_OPTIONS.find((o) => o.value === favouriteFilter)?.label ?? 'All wines';
  const maturityLabel = maturityFilter === 'All' ? 'All' : (MATURITY_OPTIONS.find((o) => o.value === maturityFilter)?.label ?? 'All');
  // Current ordering, shown in the hint above the filters. Dynamic so it stays
  // accurate when the user switches to a Price/Score sort.
  const sortLabel = sortMode === 'recent'
    ? 'Recently Added'
    : (PRICE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label
        ?? SCORE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label
        ?? 'Recently Added');

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'location') {
      return {
        title: 'Filter by location',
        options: locationOptions,
        selected: locationFilter,
        onSelect: (v) => { if (v === '__add__') openAddLocationFromFilter(); else setLocationFilter(v); },
      };
    }
    if (field === 'country') {
      return {
        title: 'Filter by country',
        options: availableCountries.map((c) => ({ value: c, label: c === 'All' ? 'All countries' : c })),
        selected: countryFilter,
        onSelect: setCountryFilter,
      };
    }
    if (field === 'colour') {
      return {
        title: 'Filter by colour',
        options: COLOUR_OPTIONS.map((c) => ({ value: c, label: c === 'All' ? 'All colours' : c })),
        selected: colourFilter,
        onSelect: setColourFilter,
      };
    }
    if (field === 'maturity') {
      return {
        title: 'Filter by maturity',
        options: MATURITY_OPTIONS,
        selected: maturityFilter,
        onSelect: setMaturityFilter,
      };
    }
    if (field === 'price') {
      return {
        title: 'Sort by Price',
        options: [{ value: 'recent', label: 'Recently added (default)' }, ...PRICE_SORT_OPTIONS],
        selected: sortMode,
        onSelect: (v) => setSortMode(v as SortMode),
      };
    }
    if (field === 'score') {
      return {
        title: 'Sort by Score',
        options: [{ value: 'recent', label: 'Recently added (default)' }, ...SCORE_SORT_OPTIONS],
        selected: sortMode,
        onSelect: (v) => setSortMode(v as SortMode),
      };
    }
    if (field === 'favourite') {
      return {
        title: 'Favourites',
        options: FAVOURITE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        selected: favouriteFilter,
        onSelect: (v) => setFavouriteFilter(v as FavouriteFilter),
      };
    }
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
        <Text style={styles.title}>{isArchiveView ? 'Your Archive' : 'Full Cellar List'}</Text>
        <View style={styles.headerActions}>
          {!isArchiveView ? (
            <TouchableOpacity
              onPress={() => setAddWineOpen(true)}
              hitSlop={{ top: 10, bottom: 6, left: 8, right: 8 }}
            >
              <Text style={styles.addLink}>+ Add</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={handleShareList}
            disabled={sharingList || sorted.length === 0}
            hitSlop={{ top: 6, bottom: 10, left: 8, right: 8 }}
          >
            <Text style={[styles.shareLink, (sharingList || sorted.length === 0) && { color: colors.textMuted }]}>
              {sharingList ? 'Preparing…' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Off-screen branded share card, mounted only while a share is in flight. */}
      {listSharePayload && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <CellarListShareCard ref={shareListRef} {...listSharePayload} />
        </View>
      )}

      {session && !isArchiveView && (
        <Text style={styles.listHint}>Long hold a wine in your list to move or edit it</Text>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your cellar"
          body="Track every bottle in your collection — sign in to see your full cellar list."
        />
      ) : (
        <>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {filtered.length} {filtered.length === 1 ? 'wine' : 'wines'} · {totalBottles} {totalBottles === 1 ? 'bottle' : 'bottles'}
        </Text>
      </View>

      {/* Filter row — Sort first so the most common interaction (changing
          order) is closest to the user's thumb. Rack / Country / Colour
          follow in descending likelihood of use. */}
      <Text style={styles.filterHint}>Listed by {sortLabel} · Swipe to see all filters →</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {/* Location filtering is a Full Cellar List affordance — the Archive
            has no racks/locations to filter by, so hide the chip there. */}
        {!isArchiveView && (
          <TouchableOpacity style={[styles.filterChip, locationFilter !== 'All' && styles.sortChip]} onPress={() => setOpenDropdown('location')}>
            <View style={styles.filterChipHeadingRow}>
              <Text style={styles.filterChipLabel}>Location</Text>
              <Text style={styles.filterChipChevron}>{openDropdown === 'location' ? '▴' : '▾'}</Text>
            </View>
            <Text style={[styles.filterChipValue, locationFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{locationLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.filterChip, priceActive && styles.sortChip]} onPress={() => setOpenDropdown('price')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Price</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'price' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, priceActive && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{priceLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, scoreActive && styles.sortChip]} onPress={() => setOpenDropdown('score')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Score</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'score' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, scoreActive && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{scoreLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, favouriteFilter !== 'all' && styles.sortChip]} onPress={() => setOpenDropdown('favourite')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Favourites</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'favourite' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, favouriteFilter !== 'all' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{favouriteLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, countryFilter !== 'All' && styles.sortChip]} onPress={() => setOpenDropdown('country')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Country</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'country' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, countryFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{countryFilter === 'All' ? 'All' : countryFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, colourFilter !== 'All' && styles.sortChip]} onPress={() => setOpenDropdown('colour')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Colour</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'colour' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, colourFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{colourFilter === 'All' ? 'All' : colourFilter}</Text>
        </TouchableOpacity>
        {/* Maturity (drinking readiness) is irrelevant once bottles are
            archived, so the Archive view hides this chip. */}
        {!isArchiveView && (
          <TouchableOpacity style={[styles.filterChip, maturityFilter !== 'All' && styles.sortChip]} onPress={() => setOpenDropdown('maturity')}>
            <View style={styles.filterChipHeadingRow}>
              <Text style={styles.filterChipLabel}>Maturity</Text>
              <Text style={styles.filterChipChevron}>{openDropdown === 'maturity' ? '▴' : '▾'}</Text>
            </View>
            <Text style={[styles.filterChipValue, maturityFilter !== 'All' && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{maturityLabel}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Search sits below the filter chips and narrows whatever the chips
          already filter — handy when there are dozens of wines in the
          selected rack / colour / country. */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search producer, wine, region, vintage…"
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

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          {wines.length === 0 ? (
            <>
              <Text style={styles.emptyTitle}>Your cellar is empty</Text>
              <Text style={styles.emptyBody}>Add wines to your cellar to generate your list.</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>No wines match</Text>
              <Text style={styles.emptyBody}>Try clearing some filters to see more of your cellar.</Text>
            </>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: selectMode ? 150 : 60 }}
        >
          {sorted.map((w) => {
            const headerLine = wineHeaderLine(w.producer, w.wine_name, w.vintage);
            // Bottle size now rides on the quantity line as "qty x format"
            // (e.g. 1x150), so it no longer needs appending to the region line.
            const subParts = [w.region, w.grape_variety].filter(Boolean);
            const valueText = w.estimated_value != null
              ? formatCurrency(Number(w.estimated_value), w.estimated_value_currency, { decimals: 0 })
              : null;
            const isSelected = selectedIds.has(w.id);
            return (
              <TouchableOpacity
                key={w.id}
                style={[styles.row, isSelected && styles.rowSelected]}
                onPress={() => { if (selectMode) toggleSelected(w.id); else router.push(`/cellar/${w.id}`); }}
                onLongPress={() => { if (!selectMode) enterSelect(w.id); }}
                delayLongPress={350}
                activeOpacity={0.7}
              >
                <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.rowThumb} />
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {w.is_favourite ? <Text style={styles.rowStar}>★ </Text> : null}
                    {headerLine}
                  </Text>
                  {subParts.length > 0 && <Text style={styles.rowDetail} numberOfLines={1}>{subParts.join(' · ')}</Text>}
                </View>
                <View style={styles.rowRight}>
                  {w.critic_score != null && <Text style={styles.rowScore}>{w.critic_score} pts</Text>}
                  {valueText && <Text style={styles.rowValue}>{valueText}</Text>}
                  <Text style={styles.rowQty}>{w.quantity}x{bottleSizeCl(w.bottle_size_ml ?? 750)}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
        </>
      )}

      {/* Multi-select action bar — floats at the bottom while selecting. */}
      {selectMode && (
        <View style={styles.selectBar}>
          <View style={styles.selectBarTop}>
            <Text style={styles.selectBarCount}>{selectedIds.size} selected</Text>
            <TouchableOpacity onPress={exitSelect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.selectBarCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectBarActions}>
            <TouchableOpacity
              style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]}
              disabled={selectedIds.size === 0 || busy}
              onPress={confirmArchiveSelected}
            >
              <Text style={styles.selectActionText}>Archive Wines</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]}
              disabled={selectedIds.size === 0 || busy}
              onPress={confirmDeleteSelected}
            >
              <Text style={styles.selectActionText}>Delete (permanent)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]}
              disabled={selectedIds.size === 0 || busy}
              onPress={openAddSelectedToLocation}
            >
              <Text style={styles.selectActionText}>Add to Location</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Create / pick a Location for selected wines (or a fresh empty one
          from the filter's "+ Add Location"). */}
      <Modal visible={locModal.open} transparent animationType="fade" onRequestClose={closeLocModal}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={closeLocModal}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {locModal.stage === 'choose' ? (
              <>
                <Text style={styles.modalTitle}>
                  Add {locModal.wineIds.length} wine{locModal.wineIds.length === 1 ? '' : 's'} to a location
                </Text>
                <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
                  <TouchableOpacity
                    style={styles.modalOption}
                    onPress={() => { setLocNameDraft(''); setLocModal((m) => ({ ...m, stage: 'name' })); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.gold }]}>＋ New location…</Text>
                  </TouchableOpacity>
                  {locations.length === 0 ? (
                    <Text style={styles.locEmpty}>No locations yet — create one above.</Text>
                  ) : locations.map((l) => (
                    <TouchableOpacity key={l.id} style={styles.modalOption} disabled={busy} onPress={() => addWinesToExistingLocation(l)} activeOpacity={0.7}>
                      <Text style={styles.modalOptionText} numberOfLines={1}>{l.name}</Text>
                      <Text style={styles.locCount}>{l.wineIds.length}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={closeLocModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Name your location</Text>
                <TextInput
                  style={styles.locNameInput}
                  value={locNameDraft}
                  onChangeText={setLocNameDraft}
                  placeholder="e.g. Eton Park, LCB"
                  placeholderTextColor={colors.textMuted}
                  autoFocus
                  maxLength={40}
                  returnKeyType="done"
                  onSubmitEditing={saveNewLocation}
                />
                <TouchableOpacity
                  style={[styles.addBtn, (!locNameDraft.trim() || busy) && { opacity: 0.5 }]}
                  disabled={!locNameDraft.trim() || busy}
                  onPress={saveNewLocation}
                >
                  <Text style={styles.addBtnText}>
                    {busy ? 'Saving…' : locModal.wineIds.length ? `Create & add ${locModal.wineIds.length}` : 'Create location'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalCancel} onPress={closeLocModal}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.modalTitle}>{activeDropdown.title}</Text>
                {openDropdown === 'location' && locations.length > 0 ? (
                  <Text style={styles.locationHint}>Long-press a location to rename or delete it</Text>
                ) : null}
                <ScrollView style={{ maxHeight: 400 }}>
                  {activeDropdown.options.map((opt) => {
                    const active = activeDropdown.selected === opt.value;
                    // Bespoke locations (loc:…) can be managed via long-press.
                    const isLocation = openDropdown === 'location' && opt.value.startsWith('loc:');
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, active && styles.modalOptionActive]}
                        onPress={() => {
                          activeDropdown.onSelect(opt.value);
                          setOpenDropdown(null);
                        }}
                        onLongPress={isLocation ? () => { setOpenDropdown(null); openLocationOptions(opt.value.slice(4), opt.label); } : undefined}
                        delayLongPress={400}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                        {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Rename a bespoke Location. */}
      <RenameModal
        visible={!!renameLoc}
        initialName={renameLoc?.name ?? ''}
        title="Rename location"
        saving={busyLoc}
        onSave={saveLocationRename}
        onClose={() => setRenameLoc(null)}
      />

      {/* Add/Remove the wines in a Location — the same picker the rack uses. */}
      <LibraryFilterModal
        visible={!!locEditTarget}
        title="Edit location"
        itemNoun="wines"
        items={wines.map((w) => ({
          id: w.id,
          label: wineHeaderLine(w.producer, w.wine_name, w.vintage),
          sublabel: w.region ?? undefined,
        }))}
        initialName={locEditTarget?.name}
        initialSelected={locEditTarget?.wineIds}
        saving={busyLoc}
        onSave={saveLocationEdit}
        onClose={() => setLocEditTarget(null)}
      />

      {/* Add-wine chooser — Scan / Upload / Manual. Same three-way
          flow as the Cellar tab's "Add Wine / Generate Wine Intel"
          button so the user lands on the same /label/* downstream
          screens regardless of which surface they triggered it from. */}
      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a wine</Text>
            <Text style={styles.addBody}>Scan the label or upload a photo and Vinster will pull in the details — or enter them yourself.</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera'); }}
            >
              <Text style={styles.addBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: spacing.sm }]}
              onPress={startLineup}
            >
              <Text style={styles.addBtnText}>Add a Lineup (up to 8 bottles)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUpload(); }}
            >
              <Text style={styles.addBtnText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: spacing.sm }]}
              onPress={() => {
                setAddWineOpen(false);
                // Clear any prior scan so Confirm Wine Details opens
                // blank for the user to fill in by hand.
                resetLabelStore();
                router.push('/label/confirm?manual=1');
              }}
            >
              <Text style={styles.addBtnText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddWineOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Scanning overlay — sits on top of the screen while OCR runs
          so the user has a visual cue between the picker dismiss and
          the confirm screen mounting (the round-trip can take 5–15s). */}
      {scanningLabel && (
        <View style={styles.scanningOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.scanningText}>Reading the label…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  // Inter — back/nav link (gold, to match the rest of the app)
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  // Add + Share stacked at the top-right of the header.
  headerActions: { alignItems: 'flex-end', gap: 6 },
  // Cormorant — add link reads as a button
  // Add / Share match Back exactly (same Spectral face + size), stacked at the
  // top-right so Add sits in line with Back and the title.
  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right' },
  shareLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right' },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
  // Inter — body in modal
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  // Inter — body (processing status)
  scanningText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
  // Cormorant — page header
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — summary read-out
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Inter — hint
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  // Interaction hint shown under the Full Cellar List header.
  listHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center' },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  listScroll: { flex: 1 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  sortChip: { borderColor: colors.gold },
  // Inter — chip label
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Inter — chip value read-out
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  // Heading row inside a filter chip — label on the left, a small up/down
  // chevron on the right that flips when this chip's dropdown is open, so
  // users can see the chip is a selectable filter.
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  // Inter — form input
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  // Inter — clear glyph
  searchClearText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  // Cormorant — empty-state header
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Inter — empty body
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Gold tinge on a row picked in multi-select mode.
  rowSelected: { backgroundColor: 'rgba(212,176,96,0.18)' },
  // Floating bulk-action bar shown while selecting.
  selectBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.lg, gap: spacing.sm },
  selectBarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  selectBarCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  selectBarCancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  selectBarActions: { flexDirection: 'row', gap: spacing.sm },
  // Elegant, uniform action buttons — soft cream outline + cream text, no gold
  // and no separate destructive colour (Delete reads the same as the rest).
  selectAction: { flex: 1, borderWidth: 1, borderColor: 'rgba(244,235,224,0.30)', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  selectActionDisabled: { opacity: 0.4 },
  selectActionText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.cream, textAlign: 'center', letterSpacing: 0.3 },
  locEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  locCount: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  locNameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  rowThumb: { width: 38, height: 48, marginRight: spacing.md },
  rowMain: { flex: 1, marginRight: spacing.md },
  // Inter — wine card name
  rowName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  rowStar: { color: colors.gold, fontSize: 16 },
  // Inter — wine detail caption
  rowDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  // Inter — score value
  rowScore: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.gold },
  // Inter — value read-out
  rowValue: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.text },
  // Inter — quantity caption
  rowQty: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  // Cormorant — modal pop-up title
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  locationHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: -spacing.sm, marginBottom: spacing.sm },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  // Cormorant — option button text
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  // Inter — check glyph
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Inter — cancel link (not a button)
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
