import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../src/hooks/useAuth';
import { useCellarContext } from '../../../../src/hooks/useCellarContext';
import { invalidateCellarViews } from '../../../../src/hooks/useCellar';
import { useRacks } from '../../../../src/hooks/useRacks';
import { VIEW_ONLY_MESSAGE } from '../../../../src/api/cellarContext';
import { getBins, getBinCell } from '../../../../src/api/bins';
import { getCellarWineById, updateCellarWine } from '../../../../src/api/cellar';
import { addBinPlacement, releaseFromBinCell, removeWineFromBinCell, fetchPlacementsForWine, placedCount, type CellarPlacement } from '../../../../src/api/placements';
import { fetchStorageLocations } from '../../../../src/api/storageLocations';
import { uploadLabelImage } from '../../../../src/api/labelPhotos';
import { archiveBottles } from '../../../../src/services/archiveNight';
import { readLabelFromLibrary } from '../../../../src/services/labelRead';
import { warnIfSizeMismatch } from '../../../../src/services/rackMoves';
import { binCellNoun, confirmCellCapacity, moveBottlesToBinCell, setCellBottleSize } from '../../../../src/services/binMoves';
import { useRackStore } from '../../../../src/stores/rackStore';
import { useLabelStore } from '../../../../src/stores/labelStore';
import { binCellLabel } from '../../../../src/utils/binGeometry';
import { ensureMediaPermission } from '../../../../src/utils/mediaPermissions';
import { launchImageLibrary } from '../../../../src/utils/imagePicker';
import { todayYmd } from '../../../../src/utils/reviewDate';
import { BottleSizePicker, bottleSizeCl } from '../../../../src/components/BottleSizePicker';
import { CellarWinePicker } from '../../../../src/components/CellarWinePicker';
import { LabelThumb } from '../../../../src/components/LabelThumb';
import { LabelPhotoViewer } from '../../../../src/components/LabelPhotoViewer';
import { WineIdentityHeader } from '../../../../src/components/WineIdentityHeader';
import { WineSearchModal } from '../../../../src/components/WineSearchModal';
import { showAlert } from '../../../../src/components/AppAlert';
import { colors, spacing } from '../../../../src/constants/theme';
import { fonts } from '../../../../src/constants/fonts';
import type { CellarWine } from '../../../../src/types/wine';

// Editing a wine already in this cell. `quantity` is the bottles in this cell.
type Draft = {
  id: string;
  producer: string;
  wineName: string;
  region: string;
  vintage: string;
  bottleSizeMl: number;
  quantity: number;
};

const wineTitle = (w: CellarWine) => [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ');

export default function BinCellScreen() {
  const { cellId, add } = useLocalSearchParams<{ cellId: string; add?: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const canEdit = useCellarContext().role !== 'view';
  const [chooserOpen, setChooserOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [wineSearchOpen, setWineSearchOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewerWine, setViewerWine] = useState<CellarWine | null>(null);
  const [moveModal, setMoveModal] = useState<{ wine: CellarWine; where: string; max: number } | null>(null);
  const [moveQty, setMoveQty] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['bin-cell', cellId],
    queryFn: () => getBinCell(cellId!),
    enabled: !!cellId,
  });
  const cell = data?.cell;
  const wines = data?.wines ?? [];
  const { setPendingBinCell } = useRackStore();

  // The bin's geometry gives this cell its grid reference (D2B / HD3C).
  const { data: bins = [] } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const bin = cell ? bins.find((b) => b.id === cell.bin_id) : undefined;
  const cellRef = bin && cell ? binCellLabel(bin.diamonds_across ?? 1, bin.diamonds_down ?? 1, cell.kind, cell.idx) : null;
  const noun = binCellNoun(cell?.kind ?? 'diamond');
  const kindLabel = cell?.kind === 'triangle' ? 'Half Diamond' : 'Diamond';
  const capacity = cell?.capacity ?? 0;
  const bottleCount = wines.reduce((s, w) => s + (w.bin_cell_quantity ?? 0), 0);

  // Where a wine's other bottles are, to name in "Select from Cellar List".
  const { racks } = useRacks();
  const { data: allLocations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });

  // Open the add chooser on arrival at an empty cell (or via ?add=1) — once,
  // so cancelling doesn't reopen it, and only after the cell has loaded.
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (!canEdit || autoOpenedRef.current || isLoading || !data) return;
    if (add === '1' || (data.wines?.length ?? 0) === 0) {
      autoOpenedRef.current = true;
      setChooserOpen(true);
    }
  }, [add, data, isLoading, canEdit]);

  const fail = (title: string, err: unknown) => showAlert({ title, body: err instanceof Error ? err.message : 'Please try again.' });

  // New bottles go through the shared Confirm screen (context=place-bin), which
  // collects the quantity and format and files them into this cell.
  function placeHere() {
    if (cell && cellId) setPendingBinCell({ binId: cell.bin_id, cellId });
  }
  function scanLabelHere() {
    setChooserOpen(false);
    placeHere();
    router.push('/label/camera?context=place-bin' as any);
  }
  function enterManually() {
    placeHere();
    useLabelStore.getState().reset();
    router.push('/label/confirm?context=place-bin&manual=1' as any);
  }
  // Read the photo the way the label camera does: a wine list can be read as
  // one, and a photo that isn't a readable label says so.
  async function uploadLabelHere() {
    setChooserOpen(false);
    placeHere();
    const read = await readLabelFromLibrary({ setReading: setScanning, enterManually: { text: 'Enter Manually', onPress: enterManually } });
    if (read === 'label') router.push('/label/confirm?context=place-bin' as any);
    else {
      setPendingBinCell(null);
      if (read === 'list') router.push('/scan/wine-list?shared=1' as any);
    }
  }
  // Catalog Search → the place-bin Confirm screen, pre-filled. A fresh label
  // store, so a photo from an earlier scan can't come along with it.
  function searchSelected(r: { producer: string; wineName: string | null; region: string | null; style: string | null; vintage: string | null }) {
    setWineSearchOpen(false);
    placeHere();
    const label = useLabelStore.getState();
    label.reset();
    label.setWineDetails({ producer: r.producer, region: r.region ?? '', wineName: r.wineName, vintage: r.vintage ?? '', style: r.style ?? null } as any);
    router.push('/label/confirm?context=place-bin' as any);
  }

  // Where a wine's bottles outside this cell are, e.g. "Large Rack and Your
  // Cellar List" — loose bottles count as being in Your Full Cellar List.
  function describeWhere(w: CellarWine, placements: CellarPlacement[]): string {
    const names: string[] = [];
    const add = (name: string) => { if (!names.includes(name)) names.push(name); };
    for (const p of placements) {
      if (p.kind === 'bin' && p.bin_cell_id === cellId) continue;
      if (p.kind === 'rack') add(racks.find((r) => r.id === p.rack_id)?.name ?? 'a rack');
      else if (p.kind === 'bin') add('another bin cell');
      else {
        const loc = allLocations.find((l) => l.id === p.storage_location_id);
        add(loc ? `${loc.name}${loc.is_external ? ' (external)' : ''}` : 'an alt cellar');
      }
    }
    if ((w.quantity ?? 0) > placedCount(placements)) add('Your Full Cellar List');
    return names.length <= 1 ? (names[0] ?? 'Your Full Cellar List') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }

  // "Select from Cellar List": bring bottles of a wine already in the cellar
  // into this cell. What's already here is read from its placements.
  async function addFromCellar(wine: CellarWine) {
    setPickerOpen(false);
    let placements: CellarPlacement[];
    try {
      placements = await fetchPlacementsForWine(wine.id);
    } catch (err) {
      fail('Could not move', err);
      return;
    }
    const here = placedCount(placements.filter((p) => p.kind === 'bin' && p.bin_cell_id === cellId));
    const movable = (wine.quantity ?? 0) - here;
    if (movable <= 0) {
      showAlert({ title: 'Already here', body: `${wineTitle(wine)} is already in this ${noun}.` });
      return;
    }
    // Only loose bottles to bring in: file them all here.
    if (placements.every((p) => p.kind === 'bin' && p.bin_cell_id === cellId)) { void executeMove(wine, movable); return; }
    const where = describeWhere(wine, placements);
    if (movable === 1) {
      showAlert({
        title: 'Move this wine?',
        body: `${wineTitle(wine)} is in ${where}. Move it here?`,
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Move here', onPress: () => void executeMove(wine, 1) },
        ],
      });
      return;
    }
    setMoveQty(String(movable));
    setMoveModal({ wine, where, max: movable });
  }

  async function executeMove(wine: CellarWine, count: number) {
    if (!cell || !cellId) return;
    try {
      if (!(await confirmCellCapacity(cell, bottleCount + count, 'Place'))) return;
      if (!(await warnIfSizeMismatch(wine, { large_format_bottle_size_ml: null }, [0]))) return;
      const moved = await moveBottlesToBinCell(wine.id, cellId, count);
      setMoveModal(null);
      if (moved === 0) showAlert({ title: 'Nothing moved', body: `Every bottle of ${wineTitle(wine)} is already here. Pull to refresh.` });
    } catch (err) {
      fail('Could not move', err);
    } finally {
      invalidateCellarViews(qc);
    }
  }

  // Long-press a label → view or change its photo (as on the wine card).
  function openImageMenu(w: CellarWine) {
    showAlert({
      title: [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ') || w.wine_name || 'This wine',
      buttons: [
        ...(w.label_image_path ? [{ text: 'View Image', onPress: () => setViewerWine(w) }] : []),
        ...(canEdit ? [{ text: 'Change Image', onPress: () => void changeWinePhoto(w) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  async function changeWinePhoto(w: CellarWine) {
    if (!userId) return;
    if (!(await ensureMediaPermission('library'))) return;
    try {
      const res = await launchImageLibrary({ mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      const path = await uploadLabelImage(userId, res.assets[0].uri, w.id);
      await updateCellarWine(w.id, { label_image_path: path });
      invalidateCellarViews(qc);
    } catch (err) {
      fail('Could not update photo', err);
    }
  }

  function openEdit(w: CellarWine) {
    setDraft({
      id: w.id,
      producer: w.producer ?? '',
      wineName: w.wine_name ?? '',
      region: w.region ?? '',
      vintage: w.vintage ?? '',
      bottleSizeMl: w.bottle_size_ml ?? 750,
      quantity: w.bin_cell_quantity ?? 1,
    });
  }

  async function saveDraft() {
    if (!draft || !userId || !cellId || !cell || saving) return;
    const name = draft.wineName.trim() || draft.producer.trim();
    if (!name) { showAlert({ title: 'Name needed', body: 'Add a wine name or producer.' }); return; }
    const row = wines.find((w) => w.id === draft.id);
    if (!row) return;
    const qty = Math.max(1, draft.quantity);
    const others = bottleCount - (row.bin_cell_quantity ?? 0);
    if (!(await confirmCellCapacity(cell, others + qty, 'Save'))) return;

    const delta = qty - (row.bin_cell_quantity ?? 0);
    // Bottles only leave the cellar by being archived or deleted — that dates
    // them and keeps their history straight — so a lower count asks which.
    let leaveAs: 'archive' | 'delete' | null = null;
    if (delta < 0) {
      const n = -delta;
      leaveAs = await new Promise<'archive' | 'delete' | null>((resolve) => {
        showAlert({
          title: 'Archive or delete?',
          body: `${n} ${n === 1 ? 'bottle leaves' : 'bottles leave'} this ${noun}. Archive ${n === 1 ? 'it' : 'them'} (dated today, with your history), or delete ${n === 1 ? 'it' : 'them'} from your records?`,
          buttons: [
            { text: 'Archive', onPress: () => resolve('archive') },
            { text: 'Delete (permanent)', style: 'destructive', onPress: () => resolve('delete') },
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
          ],
        });
      });
      if (!leaveAs) return;
    }

    setSaving(true);
    try {
      await updateCellarWine(draft.id, {
        producer: draft.producer.trim() || null,
        wine_name: name,
        region: draft.region.trim() || null,
        vintage: draft.vintage.trim() || null,
        ...(delta > 0 ? { quantity: row.quantity + delta } : {}),
      });
      if (delta > 0) await addBinPlacement(draft.id, cellId, delta);
      else if (delta < 0) {
        // This cell's bottles are freed first, so the archive or delete takes
        // them (as loose bottles) rather than ones stored elsewhere.
        await releaseFromBinCell(draft.id, cellId, -delta);
        if (leaveAs === 'archive') await archiveBottles(draft.id, -delta, todayYmd());
        else {
          const fresh = await getCellarWineById(draft.id);
          if (fresh && !fresh.archived_at) await updateCellarWine(draft.id, { quantity: Math.max(0, fresh.quantity + delta) });
        }
      }
      // Size last, on the bottles now in the cell: a wine also stored elsewhere
      // splits off a line for them rather than resizing every bottle.
      if (draft.bottleSizeMl !== (row.bottle_size_ml ?? 750)
        && (await setCellBottleSize(userId, draft.id, cellId, draft.bottleSizeMl)) === 'split') {
        showAlert({
          title: 'Bottle size changed',
          body: `The bottles in this ${noun} are now their own line in Your Full Cellar List. This wine's other bottles keep their size.`,
        });
      }
      setDraft(null);
    } catch (err) {
      fail('Could not save', err);
    } finally {
      invalidateCellarViews(qc);
      setSaving(false);
    }
  }

  function removeRow(w: CellarWine) {
    if (!cellId) return;
    showAlert({
      title: 'Remove from bin',
      body: `Take ${w.bin_cell_quantity ?? 1} × ${w.wine_name} out of this ${noun}? The bottles stay in your cellar.`,
      buttons: [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try { await removeWineFromBinCell(w.id, cellId); setDraft(null); }
            catch (err) { fail('Could not remove', err); }
            finally { invalidateCellarViews(qc); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const draftRow = draft ? wines.find((w) => w.id === draft.id) : undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{cellRef ? `${kindLabel} ${cellRef}` : kindLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}>
          <Text style={styles.summary}>{bottleCount} {bottleCount === 1 ? 'Bottle' : 'Bottles'} · {wines.length} {wines.length === 1 ? 'Wine' : 'Wines'} · {capacity} {capacity === 1 ? 'Slot' : 'Slots'}</Text>
          {!canEdit && <Text style={styles.viewOnly}>{VIEW_ONLY_MESSAGE}</Text>}

          {wines.length === 0 ? (
            <Text style={styles.empty}>No wines in this {noun} yet.</Text>
          ) : (
            wines.map((w) => (
              <View key={w.bin_placement_id ?? w.id} style={styles.row}>
                {/* Long-press the label to view or change the photo. */}
                <TouchableOpacity onPress={() => router.push(`/cellar/${w.id}` as any)} onLongPress={() => openImageMenu(w)} delayLongPress={350} activeOpacity={0.8}>
                  <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} size="thumb" style={styles.rowThumb} radius={4} frame={3} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.rowMain} onPress={() => router.push(`/cellar/${w.id}` as any)} onLongPress={canEdit ? () => openEdit(w) : undefined} delayLongPress={400} activeOpacity={0.7}>
                  <WineIdentityHeader producer={w.producer} wineName={w.wine_name} vintage={w.vintage} region={w.region} grape={w.grape_variety} size="sm" align="left" />
                  <Text style={styles.rowFormat}>{w.bin_cell_quantity ?? 0}×{bottleSizeCl(w.bottle_size_ml ?? 750)}cl</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          {canEdit && (
            <TouchableOpacity style={styles.addBtn} onPress={() => setChooserOpen(true)} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>+ Add wine</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <Modal visible={draft !== null} transparent animationType="fade" onRequestClose={() => setDraft(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Edit wine</Text>

            <TextInput style={styles.input} value={draft?.wineName} onChangeText={(t) => setDraft((d) => d && ({ ...d, wineName: t }))} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
            <TextInput style={styles.input} value={draft?.producer} onChangeText={(t) => setDraft((d) => d && ({ ...d, producer: t }))} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { flex: 1 }]} value={draft?.region} onChangeText={(t) => setDraft((d) => d && ({ ...d, region: t }))} placeholder="Region" placeholderTextColor={colors.textMuted} />
              <TextInput style={[styles.input, { width: 96 }]} value={draft?.vintage} onChangeText={(t) => setDraft((d) => d && ({ ...d, vintage: t }))} placeholder="Vintage" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
            </View>

            <Text style={styles.sheetLabel}>Format</Text>
            {draft ? <BottleSizePicker value={draft.bottleSizeMl} onChange={(ml) => setDraft((d) => d && ({ ...d, bottleSizeMl: ml }))} /> : null}

            <Text style={styles.sheetLabel}>Quantity</Text>
            <TextInput
              style={[styles.input, { width: 120 }]}
              value={draft?.quantity ? String(draft.quantity) : ''}
              onChangeText={(t) => setDraft((d) => d && ({ ...d, quantity: parseInt(t.replace(/[^0-9]/g, ''), 10) || 0 }))}
              keyboardType="number-pad"
              placeholder="e.g. 6"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={saveDraft} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
            {draftRow ? (
              <TouchableOpacity style={styles.removeBtn} onPress={() => removeRow(draftRow)}>
                <Text style={styles.removeBtnText}>Remove from bin</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDraft(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add-a-wine chooser — the same options as a rack/fridge slot. */}
      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a wine to this {noun}</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={scanLabelHere} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Scan a Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); setPickerOpen(true); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Select from Cellar List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => void uploadLabelHere()} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Upload a Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); setWineSearchOpen(true); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Search a Wine</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserCancel} onPress={() => setChooserOpen(false)}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <WineSearchModal visible={wineSearchOpen} onClose={() => setWineSearchOpen(false)} onSelect={searchSelected} />

      {/* "Reading the label…" while an uploaded photo is read. */}
      <Modal visible={scanning} transparent animationType="fade">
        <View style={styles.scanningOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.scanningText}>Reading the label…</Text>
        </View>
      </Modal>

      <CellarWinePicker visible={pickerOpen} allowPlaced onClose={() => setPickerOpen(false)} onSelect={(w) => void addFromCellar(w)} />

      <LabelPhotoViewer visible={viewerWine !== null} path={viewerWine?.label_image_path} fallbackText={viewerWine?.wine_name} onClose={() => setViewerWine(null)} />

      {/* How many of the wine's bottles (those not already here) to move in. */}
      <Modal visible={moveModal !== null} transparent animationType="fade" onRequestClose={() => setMoveModal(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Move to this {noun}</Text>
            <Text style={[styles.sheetLabel, { textAlign: 'center', textTransform: 'none', letterSpacing: 0 }]}>
              {moveModal?.max} bottles of {moveModal ? wineTitle(moveModal.wine) : ''} aren't in this {noun} yet — they're in {moveModal?.where}. How many are we moving?
            </Text>
            <TextInput
              style={styles.input}
              value={moveQty}
              onChangeText={(t) => setMoveQty(t.replace(/[^0-9]/g, '').slice(0, 4))}
              keyboardType="number-pad"
              placeholder="Number of bottles"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={() => { const n = parseInt(moveQty, 10); if (moveModal && Number.isFinite(n) && n > 0) void executeMove(moveModal.wine, Math.min(n, moveModal.max)); }} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Move</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setMoveModal(null)}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // paddingTop 70 matches the "My Wine Bin" header height — the diamond header
  // was sitting too high at 54.
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  // Stats bar — gold rule top and bottom (matches the other cellar stats bars).
  summary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider, marginBottom: spacing.lg },
  viewOnly: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  empty: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowThumb: { width: 40, height: 52 },

  rowMain: { flex: 1 },

  rowFormat: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 4, letterSpacing: 0.3 },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  addBtnText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  scanningOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  scanningText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.cream, letterSpacing: 0.3 },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  chooserTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  chooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  sheetLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  removeBtn: { alignItems: 'center', paddingTop: spacing.md },
  removeBtnText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md },
  cancelBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
