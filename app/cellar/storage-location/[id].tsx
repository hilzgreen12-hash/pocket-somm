import { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStorageLocation, fetchStorageLocationWines, deleteStorageLocation, renameStorageLocation, assignWineToStorageLocation, assignWineToCase, fetchStorageLocationCases, updateStorageCase, deleteStorageCase, deleteEmptyCasesForLocation, caseKindLabel, setStorageLocationPhoto } from '../../../src/api/storageLocations';
import type { StorageCase, CellarWine } from '../../../src/types/wine';
import { archiveCellarWine, deleteCellarWine, updateCellarWine } from '../../../src/api/cellar';
import { clearWineFromRacks } from '../../../src/api/racks';
import { prepareImageBase64, scanLabel } from '../../../src/api/label';
import { uploadLocationPhoto } from '../../../src/api/labelPhotos';
import { useLabelStore } from '../../../src/stores/labelStore';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useLabelImageUrl } from '../../../src/hooks/useLabelImageUrl';
import { useAuth } from '../../../src/hooks/useAuth';
import { useLocationFilters } from '../../../src/hooks/useLocationFilters';
import { useRackStore } from '../../../src/stores/rackStore';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { showAlert } from '../../../src/components/AppAlert';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { MicButton } from '../../../src/components/MicButton';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Search terms that map free text onto a drinking-window status (mirrors the
// rack screen), so a search for "peak" or "young" filters by maturity too.
const STATUS_SEARCH: { status: string; terms: string[] }[] = [
  { status: 'too_young', terms: ['too young', 'young', 'hold'] },
  { status: 'approaching', terms: ['approaching', 'approach'] },
  { status: 'peak', terms: ['peak', 'drinking now', 'drink now', 'ready', 'drinking'] },
  { status: 'declining', terms: ['declining', 'decline', 'fading', 'past peak'] },
];
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Early but Approachable' },
  { value: 'peak', label: 'Sweet Spot' },
  { value: 'declining', label: 'In Decline' },
];

// Packaging filter — loose bottles vs. the case packaging kinds (migration 073).
const PACKAGING_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Packaging' },
  { value: 'loose', label: 'Loose Bottles' },
  { value: 'mixed', label: 'Mixed Cases' },
  { value: 'non_owc', label: 'Complete Cases' },
  { value: 'owc', label: 'OWC' },
];

// The "List" chip is a view-mode picker. The default is the flat full list (in
// the order wines were added); the grouped-by-case and cases-summary views are
// the alternates.
const LIST_VIEW_OPTIONS: { value: 'bottles' | 'default' | 'cases'; label: string }[] = [
  { value: 'bottles', label: 'Full List' },
  { value: 'default', label: 'Grouped by Case' },
  { value: 'cases', label: 'Cases List' },
];

function bottleLabel(n: number) {
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

export default function StorageLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const navigation = useNavigation();
  const { setPendingStorageLocationId, setPendingCaseId } = useRackStore();
  const { setImage, setWineDetails } = useLabelStore();
  const [search, setSearch] = useState('');
  const [maturity, setMaturity] = useState('');
  const [maturityOpen, setMaturityOpen] = useState(false);
  const [packaging, setPackaging] = useState('');
  const [packagingOpen, setPackagingOpen] = useState(false);
  const [listView, setListView] = useState<'default' | 'bottles' | 'cases'>('bottles');
  const [listOpen, setListOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  // Bespoke "+ Add" filters, scoped to this location (migration 075).
  const { customFilters, create: createFilter, setWines: setFilterWines, rename: renameFilter, remove: removeFilter } = useLocationFilters(id);
  const [activeCustomFilterId, setActiveCustomFilterId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilterId, setEditingFilterId] = useState<string | null>(null);
  const [filterName, setFilterName] = useState('');
  const [selectedWineIds, setSelectedWineIds] = useState<Set<string>>(new Set());
  const [savingFilter, setSavingFilter] = useState(false);
  // Multi-select — long-press a wine to select, then bulk archive / delete /
  // remove-from-location. Mirrors the Full Cellar List select-mode.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const { data: location, isLoading } = useQuery({
    queryKey: ['storage-location', id],
    queryFn: () => fetchStorageLocation(id!),
    enabled: !!id,
  });
  const { data: wines = [] } = useQuery({
    queryKey: ['storage-location-wines', id],
    queryFn: () => fetchStorageLocationWines(id!),
    enabled: !!id,
  });
  const { data: cases = [] } = useQuery({
    queryKey: ['storage-location-cases', id],
    queryFn: () => fetchStorageLocationCases(id!),
    enabled: !!id,
  });
  // Sweep any orphaned empty cases left over from earlier deletions (their old
  // names were lingering in the add-a-wine flow) when the location opens.
  useEffect(() => {
    if (!id) return;
    deleteEmptyCasesForLocation(id)
      .then(() => qc.invalidateQueries({ queryKey: ['storage-location-cases', id] }))
      .catch(() => {});
  }, [id]);
  const photoUrl = useLabelImageUrl(location?.photo_path ?? null);

  // wine → its case's packaging kind, for the Cases filter.
  const caseKindById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of cases) m[c.id] = c.kind;
    return m;
  }, [cases]);

  const activeFilterWineIds = useMemo(() => {
    if (!activeCustomFilterId) return null;
    const f = customFilters.find((cf) => cf.id === activeCustomFilterId);
    return new Set(f?.wineIds ?? []);
  }, [activeCustomFilterId, customFilters]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wines.filter((w) => {
      if (maturity && w.drinking_window_status !== maturity) return false;
      // Packaging filter: "loose" keeps only un-cased bottles; a case kind keeps
      // only wines boxed in a case of that kind.
      if (packaging === 'loose') { if (w.case_id) return false; }
      else if (packaging) { if (!w.case_id || caseKindById[w.case_id] !== packaging) return false; }
      if (activeFilterWineIds && !activeFilterWineIds.has(w.id)) return false;
      if (q) {
        const hay = [w.producer, w.wine_name, w.region, w.vintage].filter(Boolean).join(' ').toLowerCase();
        const statusTerms = STATUS_SEARCH.find((s) => s.status === w.drinking_window_status)?.terms ?? [];
        if (!hay.includes(q) && !statusTerms.some((t) => t.includes(q))) return false;
      }
      return true;
    });
  }, [wines, search, maturity, packaging, caseKindById, activeFilterWineIds]);

  // Stats bar figures — cases, loose (un-cased) bottles, and the grand total.
  const caseCount = cases.length;
  const looseBottles = wines.filter((w) => !w.case_id).reduce((s, w) => s + (w.quantity ?? 0), 0);
  const totalBottles = wines.reduce((s, w) => s + (w.quantity ?? 0), 0);

  // All add paths file the saved wine into THIS location (context=add-location,
  // pendingStorageLocationId set). A "case" is just a wine with a higher quantity.
  // caseId non-null routes the add into an existing case (the mixed-case loop);
  // a normal add clears it so no stale case is inherited.
  function handleScan(caseId: string | null = null) {
    if (!id) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    router.push('/label/camera?context=add-location' as any);
  }
  function handleManual(caseId: string | null = null) {
    if (!id) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    useLabelStore.getState().reset();
    router.push('/label/confirm?manual=1&context=add-location' as any);
  }
  async function handleUpload(caseId: string | null = null) {
    if (!id) return;
    if (!(await ensureMediaPermission('library'))) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    setUploading(true);
    try {
      const uri = res.assets[0].uri;
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm?context=add-location' as any);
    } catch (err) {
      showAlert({ title: 'Could not read label', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  // Back navigation. The add-a-wine flow (camera → confirm → results) ends in a
  // router.replace back to this same location route, landing a second copy of
  // this screen on top of the original. dismissTo('/cellar/racks') collapses
  // both onto the Home Storage overview in one tap — but only when a racks
  // route actually exists below us; otherwise (reached directly from a wine
  // card) plain back(), mirroring the rack screen's handleBack.
  function handleBack() {
    const state = navigation.getState?.();
    const hasRacks = state?.routes?.some((r) => r.name === 'cellar/racks') ?? false;
    if (hasRacks) router.dismissTo('/cellar/racks');
    else if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/cellar');
  }

  // "+ Add Wine" header link → the same chooser the rack/bin flows use.
  function openAddWine() {
    showAlert({
      title: 'Add a wine to this location',
      buttons: [
        { text: 'Scan a Label', onPress: () => handleScan() },
        { text: 'Upload Photo', onPress: () => handleUpload() },
        { text: 'Manual Input', onPress: () => handleManual() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // "Edit Image" header link → retake or re-pick the location's portrait photo.
  async function pickAndSetImage(fromCamera: boolean) {
    if (!id || !userId) return;
    if (!(await ensureMediaPermission(fromCamera ? 'camera' : 'library'))) return;
    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditingImage(true);
    try {
      const path = await uploadLocationPhoto(userId, res.assets[0].uri, id);
      await setStorageLocationPhoto(id, path);
      qc.invalidateQueries({ queryKey: ['storage-location', id] });
      qc.invalidateQueries({ queryKey: ['storage-locations'] });
    } catch (err) {
      showAlert({ title: 'Could not update photo', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setEditingImage(false);
    }
  }
  function handleEditImage() {
    showAlert({
      title: 'Location photo',
      buttons: [
        { text: 'Take Photo', onPress: () => pickAndSetImage(true) },
        { text: 'Choose from Library', onPress: () => pickAndSetImage(false) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // ---- Bespoke filters ----
  function applyCustomFilter(filterId: string) {
    setActiveCustomFilterId((prev) => (prev === filterId ? null : filterId));
  }
  function openCreateFilter() {
    setEditingFilterId(null);
    setFilterName('');
    setSelectedWineIds(new Set());
    setFilterModalOpen(true);
  }
  function openEditFilter(f: { id: string; name: string; wineIds: string[] }) {
    setEditingFilterId(f.id);
    setFilterName(f.name);
    setSelectedWineIds(new Set(f.wineIds));
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: { id: string; name: string; wineIds: string[] }) {
    showAlert({
      title: f.name,
      body: 'Rename this filter or change the wines it holds, or delete it. Your wines stay in the location either way.',
      buttons: [
        { text: 'Rename / Add / Remove Wines', onPress: () => openEditFilter(f) },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomFilterId === f.id) setActiveCustomFilterId(null); removeFilter.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function toggleWineInSelection(wineId: string) {
    setSelectedWineIds((prev) => { const next = new Set(prev); next.has(wineId) ? next.delete(wineId) : next.add(wineId); return next; });
  }
  async function saveFilter() {
    const name = filterName.trim();
    if (!name) { showAlert({ title: 'Name needed', body: 'Give your filter a name first.' }); return; }
    const here = new Set(wines.map((w) => w.id));
    const wineIds = Array.from(selectedWineIds).filter((wid) => here.has(wid));
    setSavingFilter(true);
    try {
      if (editingFilterId) {
        await renameFilter.mutateAsync({ filterId: editingFilterId, name });
        await setFilterWines.mutateAsync({ filterId: editingFilterId, wineIds });
      } else {
        await createFilter.mutateAsync({ name, wineIds });
      }
      setFilterModalOpen(false);
      setEditingFilterId(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }

  function handleLongPressHeader() {
    if (!location) return;
    showAlert({
      title: location.name,
      body: 'Manage this storage location.',
      buttons: [
        {
          text: 'Rename location',
          onPress: () => { setRenameVal(location.name); setRenaming(true); },
        },
        {
          text: 'Delete location',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStorageLocation(location.id);
              // Every other mutation here invalidates; this one didn't, leaving
              // the deleted card + its bottle count on Home Storage and the
              // wines under a stale sloc: filter (S1).
              qc.invalidateQueries({ queryKey: ['storage-locations'] });
              qc.invalidateQueries({ queryKey: ['storage-location', id] });
              qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
              qc.invalidateQueries({ queryKey: ['storage-location-cases', id] });
              qc.invalidateQueries({ queryKey: ['cellar'] });
              router.back();
            }
            catch (err) { showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function enterSelect(wineId: string) { setSelectMode(true); setSelectedIds(new Set([wineId])); }
  function toggleSelected(wineId: string) {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(wineId) ? next.delete(wineId) : next.add(wineId); return next; });
  }
  function exitSelect() { setSelectMode(false); setSelectedIds(new Set()); }

  function invalidateAfterBulk() {
    qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
    qc.invalidateQueries({ queryKey: ['storage-location', id] });
    qc.invalidateQueries({ queryKey: ['storage-locations'] });
    qc.invalidateQueries({ queryKey: ['cellar'] });
    qc.invalidateQueries({ queryKey: ['cellar-archive'] });
    qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    qc.invalidateQueries({ queryKey: ['rack-slots'] });
  }

  // Run a per-wine action across the selection, tolerating a mid-way failure:
  // successfully-processed wines drop out of the selection so a retry only
  // touches the remainder.
  async function runBulk(verb: string, action: (wineId: string) => Promise<void>) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBusy(true);
    const done: string[] = [];
    try {
      for (const wid of ids) { await action(wid); done.push(wid); }
      // A case that just lost its last wine shouldn't linger as a nameless
      // orphan — clean it up before refreshing.
      await deleteEmptyCasesForLocation(id).catch(() => {});
      invalidateAfterBulk();
      qc.invalidateQueries({ queryKey: ['storage-location-cases', id] });
      exitSelect();
    } catch (err) {
      invalidateAfterBulk();
      if (done.length) setSelectedIds((prev) => { const next = new Set(prev); done.forEach((wid) => next.delete(wid)); return next; });
      showAlert({
        title: done.length ? `${verb} some, then hit a snag` : `Could not ${verb.toLowerCase()}`,
        body: `${done.length ? `${done.length} of ${ids.length} done. The rest are still selected — try again. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
      });
    } finally { setBusy(false); }
  }

  function confirmArchiveSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Archive ${n} wine${n === 1 ? '' : 's'}?`,
      body: 'They move to Your Archive and leave this location. Your reviews and history stay.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive Wines', onPress: () => runBulk('Archived', async (wid) => { await clearWineFromRacks(wid); await assignWineToCase(wid, null); await archiveCellarWine(wid); }) },
      ],
    });
  }
  function confirmDeleteSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Delete ${n} wine${n === 1 ? '' : 's'}?`,
      body: "Permanently remove them from your records. This can't be undone.",
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete (permanent)', style: 'destructive', onPress: () => runBulk('Deleted', async (wid) => { await clearWineFromRacks(wid); await deleteCellarWine(wid); }) },
      ],
    });
  }
  function confirmRemoveSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Remove ${n} wine${n === 1 ? '' : 's'} from ${location?.name ?? 'this location'}?`,
      body: 'They stay in your cellar as loose bottles — this only takes them out of this location.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        // Clear case_id too — otherwise a removed wine keeps a stale pointer to
        // a case still living in the old location (D3).
        { text: 'Remove from location', onPress: () => runBulk('Removed', async (wid) => { await assignWineToCase(wid, null); await assignWineToStorageLocation(wid, null); }) },
      ],
    });
  }

  // Per-wine action runner (single wine) — same invalidation + empty-case
  // cleanup as runBulk.
  async function runSingle(verb: string, wid: string, action: (id: string) => Promise<void>) {
    setBusy(true);
    try {
      await action(wid);
      await deleteEmptyCasesForLocation(id).catch(() => {});
      invalidateAfterBulk();
      qc.invalidateQueries({ queryKey: ['storage-location-cases', id] });
    } catch (err) {
      showAlert({ title: `Could not ${verb.toLowerCase()}`, body: err instanceof Error ? err.message : 'Please try again.' });
    } finally { setBusy(false); }
  }

  // Long-press a wine → a per-wine action pop-up (replaces the select-mode dark
  // bar), for consistency with the rack/fridge grids.
  function openWineActions(w: CellarWine) {
    showAlert({
      title: wineHeaderLine(w.producer, w.wine_name, w.vintage),
      buttons: [
        { text: 'Remove from Location', onPress: () => showAlert({
          title: `Remove from ${location?.name ?? 'this location'}?`,
          body: 'It stays in your cellar as a loose bottle — this only takes it out of this location.',
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', onPress: () => runSingle('Removed', w.id, async (wid) => { await assignWineToCase(wid, null); await assignWineToStorageLocation(wid, null); }) },
          ],
        }) },
        { text: 'Edit Wine Details', onPress: () => router.push(`/cellar/edit-wine/${w.id}` as any) },
        { text: 'Archive', onPress: () => showAlert({
          title: 'Archive this wine?',
          body: 'It moves to Your Archive and leaves this location. Your reviews and history stay.',
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Archive', onPress: () => runSingle('Archived', w.id, async (wid) => { await clearWineFromRacks(wid); await assignWineToCase(wid, null); await archiveCellarWine(wid); }) },
          ],
        }) },
        { text: 'Delete', style: 'destructive', onPress: () => showAlert({
          title: 'Delete this wine?',
          body: "Permanently remove it from your records. This can't be undone.",
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete (permanent)', style: 'destructive', onPress: () => runSingle('Deleted', w.id, async (wid) => { await clearWineFromRacks(wid); await deleteCellarWine(wid); }) },
          ],
        }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Rename this location (U1 — renameStorageLocation had no caller/UI).
  const [renaming, setRenaming] = useState(false);
  const [renameVal, setRenameVal] = useState('');
  async function saveRename() {
    if (!location || !renameVal.trim()) { setRenaming(false); return; }
    try {
      await renameStorageLocation(location.id, renameVal);
      qc.invalidateQueries({ queryKey: ['storage-location', id] });
      qc.invalidateQueries({ queryKey: ['storage-locations'] });
      setRenaming(false);
    } catch (err) { showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' }); }
  }

  // ---- Cases ----
  const [caseEdit, setCaseEdit] = useState<StorageCase | null>(null);
  const [caseEditName, setCaseEditName] = useState('');
  const [caseEditNote, setCaseEditNote] = useState('');

  function invalidateCases() {
    qc.invalidateQueries({ queryKey: ['storage-location-cases', id] });
    qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
  }
  // Quick "how many bottles are you adding" flow for a single-wine case.
  const [addBottlesCase, setAddBottlesCase] = useState<StorageCase | null>(null);
  const [addBottlesQty, setAddBottlesQty] = useState(1);

  function openAddToCase(c: StorageCase) {
    const buttons: { text: string; style?: 'cancel'; onPress?: () => void }[] = [];
    const caseWine = wines.find((w) => w.case_id === c.id);
    // A complete case (OWC / non-OWC) is ONE wine. Once it holds that wine, the
    // only valid add is more bottles of the same wine — offering Scan/Upload/
    // Manual here would file a *different* bottle under the same case_id and
    // corrupt it. Only a mixed case (or a not-yet-populated complete case) may
    // take a fresh scan.
    if (c.kind !== 'mixed' && caseWine) {
      showAlert({
        title: `Add to ${c.name}`,
        body: `This is a complete case of ${caseWine.wine_name}. Add more bottles of it?`,
        buttons: [
          { text: 'Add more bottles', onPress: () => { setAddBottlesQty(1); setAddBottlesCase(c); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    buttons.push(
      { text: 'Scan a Label', onPress: () => handleScan(c.id) },
      { text: 'Upload Photo', onPress: () => handleUpload(c.id) },
      { text: 'Manual Input', onPress: () => handleManual(c.id) },
      { text: 'Cancel', style: 'cancel' },
    );
    showAlert({
      title: `Add a wine to ${c.name}`,
      body: c.kind === 'mixed' ? 'Add another wine to this mixed case.' : 'Add the wine for this case.',
      buttons,
    });
  }

  async function confirmAddBottles() {
    const c = addBottlesCase;
    if (!c) return;
    const target = wines.find((w) => w.case_id === c.id);
    if (!target) {
      setAddBottlesCase(null);
      showAlert({ title: 'No wine yet', body: 'This case has no wine to add to — scan or add one first.' });
      return;
    }
    try {
      await updateCellarWine(target.id, { quantity: (target.quantity ?? 0) + addBottlesQty });
      qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setAddBottlesCase(null);
    } catch (err) {
      showAlert({ title: 'Could not add', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  function confirmDissolveCase(c: StorageCase) {
    showAlert({
      title: `Dissolve ${c.name}?`,
      body: 'The bottles stay in this location as loose wines — this only removes the case grouping.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dissolve', style: 'destructive', onPress: async () => {
          try { await deleteStorageCase(c.id); invalidateCases(); }
          catch (err) { showAlert({ title: 'Could not dissolve', body: err instanceof Error ? err.message : 'Please try again.' }); }
        } },
      ],
    });
  }
  function openCaseMenu(c: StorageCase) {
    showAlert({
      title: c.name,
      body: c.note || 'Manage this case.',
      buttons: [
        { text: 'Add a wine to this case', onPress: () => openAddToCase(c) },
        { text: 'Edit name & note', onPress: () => { setCaseEditName(c.name); setCaseEditNote(c.note ?? ''); setCaseEdit(c); } },
        { text: 'Dissolve case', style: 'destructive', onPress: () => confirmDissolveCase(c) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveCaseEdit() {
    if (!caseEdit) return;
    try {
      await updateStorageCase(caseEdit.id, { name: caseEditName, note: caseEditNote });
      invalidateCases();
      setCaseEdit(null);
    } catch (err) { showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' }); }
  }

  // Wines split into their cases + the loose remainder (search/maturity applied).
  // Render EVERY case, even one with zero (matching) wines — otherwise an
  // emptied case vanishes with no route left to its Dissolve menu (D1), and a
  // search that excludes a case's wines hides its "+ Add" (U2).
  // "Loose" packaging hides case groups entirely; a case kind keeps only that
  // kind. Case groups are built from `filtered` so maturity/search/bespoke
  // filters compose into the grouped + cases views too.
  const caseGroups = (packaging === 'loose' ? [] : cases
    .filter((c) => !packaging || c.kind === packaging)
    .map((c) => ({ box: c, wines: filtered.filter((w) => w.case_id === c.id) })));
  const looseFiltered = filtered.filter((w) => !w.case_id);

  const renderWine = (w: CellarWine) => {
    const isSelected = selectedIds.has(w.id);
    return (
      <TouchableOpacity
        key={w.id}
        style={[styles.wineRow, isSelected && styles.wineRowSelected]}
        onPress={() => { if (selectMode) toggleSelected(w.id); else router.push(`/cellar/${w.id}` as any); }}
        onLongPress={() => openWineActions(w)}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        {selectMode ? (
          <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>{isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}</View>
        ) : null}
        <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.thumb} />
        <View style={styles.wineMain}>
          <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
          <View style={styles.wineMetaRow}>
            {w.region ? <Text style={styles.wineMeta} numberOfLines={1}>{w.region}</Text> : null}
            {w.region ? <Text style={styles.wineMetaDot}>·</Text> : null}
            <Text style={styles.wineMeta}>{bottleLabel(w.quantity ?? 0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  }
  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyBody}>This location no longer exists.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onLongPress={handleLongPressHeader} delayLongPress={400} activeOpacity={1}>
          <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={openAddWine} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.headerLink}>+ Add Wine</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleEditImage} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={styles.headerLink}>Edit Image</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: selectMode ? 170 : 90 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.areaPhoto} resizeMode="contain" />
        ) : null}

        {/* Stats bar — no fixed slot capacity here, so cases / loose / total. */}
        <Text style={styles.statsBar}>
          {caseCount} {caseCount === 1 ? 'Case' : 'Cases'} · {looseBottles} Loose {looseBottles === 1 ? 'Bottle' : 'Bottles'} · {totalBottles} Total {totalBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>

        {/* Filter row — List (default full list), Packaging, Maturity, saved
            filters, then + Add, mirroring the rack/fridge affordance. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={[styles.filterChip, listView !== 'bottles' && styles.filterChipActive]}
            onPress={() => { setListOpen((v) => !v); setMaturityOpen(false); setPackagingOpen(false); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, listView !== 'bottles' && styles.filterChipTextActive]}>
              {LIST_VIEW_OPTIONS.find((o) => o.value === listView)?.label ?? 'List'} {listOpen ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, packaging ? styles.filterChipActive : null]}
            onPress={() => { setPackagingOpen((v) => !v); setMaturityOpen(false); setListOpen(false); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, packaging ? styles.filterChipTextActive : null]}>
              {packaging ? (PACKAGING_OPTIONS.find((o) => o.value === packaging)?.label ?? 'Packaging') : 'Packaging'} {packagingOpen ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterChip, maturity ? styles.filterChipActive : null]}
            onPress={() => { setMaturityOpen((v) => !v); setPackagingOpen(false); setListOpen(false); }}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, maturity ? styles.filterChipTextActive : null]}>
              {maturity ? (MATURITY_OPTIONS.find((o) => o.value === maturity)?.label ?? 'Maturity') : 'Maturity'} {maturityOpen ? '▴' : '▾'}
            </Text>
          </TouchableOpacity>
          {customFilters.map((f) => {
            const active = activeCustomFilterId === f.id;
            return (
              <TouchableOpacity key={f.id} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => applyCustomFilter(f.id)} onLongPress={() => openFilterOptions(f)} delayLongPress={400} activeOpacity={0.7}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.filterChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
            <Text style={styles.filterChipAddText}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>

        {listOpen ? (
          <View style={styles.maturityDropdown}>
            {LIST_VIEW_OPTIONS.map((o) => {
              const active = listView === o.value;
              return (
                <TouchableOpacity key={o.value} style={[styles.maturityOption, active && styles.maturityOptionActive]} onPress={() => { setListView(o.value); setListOpen(false); }} activeOpacity={0.7}>
                  <Text style={[styles.maturityOptionText, active && styles.maturityOptionTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {packagingOpen ? (
          <View style={styles.maturityDropdown}>
            {PACKAGING_OPTIONS.map((o) => {
              const active = packaging === o.value;
              return (
                <TouchableOpacity key={o.value || 'all'} style={[styles.maturityOption, active && styles.maturityOptionActive]} onPress={() => { setPackaging(o.value); setPackagingOpen(false); }} activeOpacity={0.7}>
                  <Text style={[styles.maturityOptionText, active && styles.maturityOptionTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {maturityOpen ? (
          <View style={styles.maturityDropdown}>
            {MATURITY_OPTIONS.map((o) => {
              const active = maturity === o.value;
              return (
                <TouchableOpacity key={o.value || 'all'} style={[styles.maturityOption, active && styles.maturityOptionActive]} onPress={() => { setMaturity(o.value); setMaturityOpen(false); }} activeOpacity={0.7}>
                  <Text style={[styles.maturityOptionText, active && styles.maturityOptionTextActive]}>{o.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search producer, wine, region, maturity…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {listView === 'bottles' ? (
          filtered.length === 0 ? (
            <Text style={styles.emptyList}>{wines.length === 0 ? 'No wines here yet — photograph a wine label to start filling it.' : 'No wines match your filters.'}</Text>
          ) : (
            <View style={styles.listSection}>{filtered.map(renderWine)}</View>
          )
        ) : listView === 'cases' ? (
          caseGroups.length === 0 ? (
            <Text style={styles.emptyList}>No cases here yet.</Text>
          ) : (
            <View style={styles.listSection}>
              {caseGroups.map((g) => {
                const count = g.wines.reduce((s, w) => s + (w.quantity ?? 0), 0);
                return (
                  <TouchableOpacity key={g.box.id} style={styles.caseListRow} onPress={() => openAddToCase(g.box)} onLongPress={() => openCaseMenu(g.box)} delayLongPress={350} activeOpacity={0.7}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.caseName} numberOfLines={1}>{g.box.name}</Text>
                      <Text style={styles.caseListMeta} numberOfLines={1}>{caseKindLabel(g.box.kind)} · {location.name} · {count} {count === 1 ? 'bottle' : 'bottles'}</Text>
                    </View>
                    <Text style={styles.caseAdd}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )
        ) : filtered.length === 0 && caseGroups.length === 0 ? (
          <Text style={styles.emptyList}>{wines.length === 0 ? 'No wines here yet — photograph a wine label to start filling it.' : 'No wines match your search.'}</Text>
        ) : (
          <View style={styles.listSection}>
            {caseGroups.map((g) => (
              <View key={g.box.id} style={styles.caseGroup}>
                <TouchableOpacity
                  style={styles.caseHeader}
                  onPress={() => { if (!selectMode) openAddToCase(g.box); }}
                  onLongPress={() => { if (!selectMode) openCaseMenu(g.box); }}
                  delayLongPress={350}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.caseTitleRow}>
                      <Text style={styles.caseName} numberOfLines={1}>{g.box.name}</Text>
                      <View style={styles.caseChip}><Text style={styles.caseChipText}>{caseKindLabel(g.box.kind)}</Text></View>
                    </View>
                    {g.box.note ? <Text style={styles.caseNoteText} numberOfLines={2}>{g.box.note}</Text> : null}
                  </View>
                  {!selectMode ? <Text style={styles.caseAdd}>+ Add</Text> : null}
                </TouchableOpacity>
                {g.wines.map(renderWine)}
              </View>
            ))}
            {looseFiltered.length > 0 ? (
              <>
                {caseGroups.length > 0 ? <Text style={styles.looseHeader}>Loose bottles</Text> : null}
                {looseFiltered.map(renderWine)}
              </>
            ) : null}
          </View>
        )}
      </KeyboardAwareScrollView>

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
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmArchiveSelected}>
              <Text style={styles.selectActionText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmRemoveSelected}>
              <Text style={styles.selectActionText}>Remove from Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmDeleteSelected}>
              <Text style={styles.selectActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit a case's name + note */}
      <Modal visible={addBottlesCase !== null} transparent animationType="fade" onRequestClose={() => setAddBottlesCase(null)}>
        <View style={styles.caseModalOverlay}>
          <View style={styles.caseModalSheet}>
            <Text style={styles.caseModalTitle}>Add bottles</Text>
            <Text style={[styles.caseModalLabel, { textAlign: 'center' }]}>How many bottles are you adding{addBottlesCase ? ` to ${addBottlesCase.name}` : ''}?</Text>
            <View style={styles.addQtyRow}>
              <TouchableOpacity style={styles.addQtyBtn} onPress={() => setAddBottlesQty((q) => Math.max(1, q - 1))} activeOpacity={0.7}><Text style={styles.addQtyBtnText}>−</Text></TouchableOpacity>
              <Text style={styles.addQtyValue}>{addBottlesQty}</Text>
              <TouchableOpacity style={styles.addQtyBtn} onPress={() => setAddBottlesQty((q) => q + 1)} activeOpacity={0.7}><Text style={styles.addQtyBtnText}>+</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.caseModalSave} onPress={confirmAddBottles} activeOpacity={0.85}>
              <Text style={styles.caseModalSaveText}>✓  Add {addBottlesQty} bottle{addBottlesQty === 1 ? '' : 's'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.caseModalCancel} onPress={() => setAddBottlesCase(null)}><Text style={styles.caseModalCancelText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={renaming} transparent animationType="fade" onRequestClose={() => setRenaming(false)}>
        <View style={styles.caseModalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.caseModalScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.caseModalSheet}>
              <Text style={styles.caseModalTitle}>Rename location</Text>
              <Text style={styles.caseModalLabel}>Name</Text>
              <TextInput style={styles.caseModalInput} value={renameVal} onChangeText={setRenameVal} placeholder="Location name" placeholderTextColor={colors.textSubtle} />
              <TouchableOpacity style={styles.caseModalSave} onPress={saveRename} activeOpacity={0.85}>
                <Text style={styles.caseModalSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.caseModalCancel} onPress={() => setRenaming(false)}>
                <Text style={styles.caseModalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <Modal visible={caseEdit !== null} transparent animationType="fade" onRequestClose={() => setCaseEdit(null)}>
        <View style={styles.caseModalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.caseModalScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.caseModalSheet}>
              <Text style={styles.caseModalTitle}>Edit case</Text>
              <Text style={styles.caseModalLabel}>Name</Text>
              <TextInput style={styles.caseModalInput} value={caseEditName} onChangeText={setCaseEditName} placeholder="Case name" placeholderTextColor={colors.textSubtle} />
              <Text style={styles.caseModalLabel}>Note</Text>
              <View style={styles.caseModalNoteRow}>
                <TextInput style={[styles.caseModalInput, styles.caseModalNoteInput]} value={caseEditNote} onChangeText={setCaseEditNote} placeholder="Ie. in the back next to the Petrus" placeholderTextColor={colors.textSubtle} multiline />
                <MicButton value={caseEditNote} onChangeText={setCaseEditNote} onClear={() => setCaseEditNote('')} />
              </View>
              <TouchableOpacity style={styles.caseModalSave} onPress={saveCaseEdit} activeOpacity={0.85}>
                <Text style={styles.caseModalSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.caseModalCancel} onPress={() => setCaseEdit(null)}>
                <Text style={styles.caseModalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* Bespoke-filter builder — name it, tick the wines it holds. */}
      <Modal visible={filterModalOpen} transparent animationType="fade" onRequestClose={() => setFilterModalOpen(false)}>
        <View style={styles.caseModalOverlay}>
          <View style={styles.caseModalSheet}>
            <Text style={styles.caseModalTitle}>{editingFilterId ? 'Edit Filter' : 'New Filter'}</Text>
            <TextInput style={styles.caseModalInput} value={filterName} onChangeText={setFilterName} placeholder="Filter name (e.g. Drink First)" placeholderTextColor={colors.textSubtle} />
            <Text style={[styles.caseModalLabel, { marginTop: spacing.md }]}>Wines in this filter</Text>
            <ScrollView style={{ maxHeight: 280 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
              {wines.length === 0 ? (
                <Text style={styles.emptyList}>No wines in this location yet.</Text>
              ) : wines.map((w) => {
                const on = selectedWineIds.has(w.id);
                return (
                  <TouchableOpacity key={w.id} style={styles.pickRow} onPress={() => toggleWineInSelection(w.id)} activeOpacity={0.7}>
                    <View style={[styles.pickCheckbox, on && styles.pickCheckboxOn]}>{on ? <Text style={styles.pickCheckboxTick}>✓</Text> : null}</View>
                    <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.caseModalSave, savingFilter && { opacity: 0.5 }]} onPress={saveFilter} disabled={savingFilter} activeOpacity={0.85}>
              {savingFilter ? <ActivityIndicator color={colors.surface} /> : <Text style={styles.caseModalSaveText}>{editingFilterId ? 'Save Filter' : 'Create Filter'}</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.caseModalCancel} onPress={() => setFilterModalOpen(false)}>
              <Text style={styles.caseModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {(uploading || editingImage) && (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadingText}>{editingImage ? 'Updating photo…' : 'Reading the label…'}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  headerActions: { alignItems: 'flex-end', gap: 4 },
  headerLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold },
  areaPhoto: { width: '100%', height: 360, backgroundColor: colors.surface },
  statsBar: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', paddingTop: spacing.lg, paddingBottom: spacing.md, paddingHorizontal: spacing.xl },
  filterChipAdd: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md },
  filterChipAddText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickCheckbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  pickCheckboxOn: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.16)' },
  pickCheckboxTick: { fontSize: 13, color: colors.gold, fontFamily: fonts.bodySemibold },
  addSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnSecondary: { borderColor: '#FFFFFF' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  addBtnTextSecondary: { color: '#FFFFFF' },
  listHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
  maturityRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  maturityChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: spacing.md },
  maturityChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  maturityChipText: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  maturityChipTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  // Filter chips + Maturity dropdown — matched to the rack/fridge screens so the
  // Other Home Storage filters read the same (was a lighter, muted pill before).
  filterRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm },
  filterChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  filterChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  filterChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  filterChipTextActive: { color: colors.gold },
  maturityDropdown: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  maturityOption: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  maturityOptionActive: { backgroundColor: 'rgba(212,176,96,0.12)' },
  maturityOptionText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  maturityOptionTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  listSection: { paddingHorizontal: spacing.xl },
  emptyList: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, lineHeight: 20 },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowSelected: { backgroundColor: 'rgba(224,184,74,0.16)' },
  caseGroup: { marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(224,184,74,0.30)', borderRadius: 12, overflow: 'hidden' },
  caseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(224,184,74,0.10)' },
  caseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  caseName: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  caseChip: { borderWidth: 1, borderColor: colors.gold, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  caseChipText: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.gold, letterSpacing: 0.3 },
  caseNoteText: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  caseAdd: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  looseHeader: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.sm, marginBottom: spacing.xs },
  caseListRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  caseListMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 3 },
  caseModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center' },
  caseModalScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  caseModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  caseModalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  caseModalLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  caseModalInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  caseModalNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  caseModalNoteInput: { flex: 1, minHeight: 44, textAlignVertical: 'top' },
  caseModalSave: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  caseModalSaveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.surface },
  addQtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, marginTop: spacing.md },
  addQtyBtn: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  addQtyBtnText: { fontSize: 26, fontFamily: fonts.bodyRegular, color: colors.gold },
  addQtyValue: { fontSize: 28, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 48, textAlign: 'center' },
  caseModalCancel: { alignItems: 'center', paddingTop: spacing.md },
  caseModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.gold },
  checkboxTick: { fontSize: 13, color: colors.surface, fontFamily: fonts.headingBold },
  selectBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.sm },
  selectBarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  selectBarCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  selectBarCancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold },
  selectBarActions: { flexDirection: 'row', gap: spacing.sm },
  selectAction: { flex: 1, borderWidth: 1, borderColor: 'rgba(244,235,224,0.30)', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  selectActionDisabled: { opacity: 0.4 },
  selectActionText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.cream, textAlign: 'center', letterSpacing: 0.3 },
  thumb: { width: 34, height: 44 },
  wineMain: { flex: 1 },
  wineName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  wineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  wineMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, flexShrink: 1 },
  wineMetaDot: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  uploadingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
