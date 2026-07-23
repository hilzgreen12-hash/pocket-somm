import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../../src/hooks/useAuth';
import { getBinCell, removeWineFromCell } from '../../../../src/api/bins';
import { addCellarWine, updateCellarWine } from '../../../../src/api/cellar';
import { clearWineFromRacks } from '../../../../src/api/racks';
import { prepareImageBase64, scanLabel } from '../../../../src/api/label';
import { ensureMediaPermission } from '../../../../src/utils/mediaPermissions';
import { BottleSizePicker, bottleSizeCl } from '../../../../src/components/BottleSizePicker';
import { CellarWinePicker } from '../../../../src/components/CellarWinePicker';
import { showAlert } from '../../../../src/components/AppAlert';
import { colors, spacing } from '../../../../src/constants/theme';
import { fonts } from '../../../../src/constants/fonts';
import type { CellarWine } from '../../../../src/types/wine';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

type Draft = {
  id: string | null; // existing cellar_wine id when editing, null when adding
  producer: string;
  wineName: string;
  region: string;
  vintage: string;
  bottleSizeMl: number;
  quantity: number;
};

const EMPTY_DRAFT: Draft = { id: null, producer: '', wineName: '', region: '', vintage: '', bottleSizeMl: 750, quantity: 1 };

export default function BinCellScreen() {
  const { cellId, add } = useLocalSearchParams<{ cellId: string; add?: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const [chooserOpen, setChooserOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  // Arrived via a tap on the diamond/triangle (?add=1) → open the add chooser
  // straight away, mirroring tapping an empty rack slot.
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (add === '1' && !autoOpenedRef.current) { autoOpenedRef.current = true; setChooserOpen(true); }
  }, [add]);

  const { data, isLoading } = useQuery({
    queryKey: ['bin-cell', cellId],
    queryFn: () => getBinCell(cellId!),
    enabled: !!cellId,
  });
  const cell = data?.cell;
  const wines = data?.wines ?? [];

  const [draft, setDraft] = useState<Draft | null>(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);

  const count = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const capacity = cell?.capacity ?? 0;

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['bin-cell', cellId] });
    if (cell) qc.invalidateQueries({ queryKey: ['bin-cells', cell.bin_id] });
    qc.invalidateQueries({ queryKey: ['bins'] }); // list + ['bins','counts'] tally
    qc.invalidateQueries({ queryKey: ['cellar'] });
  }

  function openAdd() { setDraft({ ...EMPTY_DRAFT }); }
  function openEdit(w: CellarWine) {
    setDraft({
      id: w.id,
      producer: w.producer ?? '',
      wineName: w.wine_name ?? '',
      region: w.region ?? '',
      vintage: w.vintage ?? '',
      bottleSizeMl: w.bottle_size_ml ?? 750,
      quantity: w.quantity ?? 1,
    });
  }

  // Re-scan a label to fill the draft, mirroring the lineup edit sheet.
  async function handleScan() {
    if (!(await ensureMediaPermission('camera'))) return;
    try {
      const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      setScanning(true);
      try {
        const base64 = await prepareImageBase64(res.assets[0].uri);
        const details = await scanLabel(base64);
        setDraft((d) => d && ({
          ...d,
          producer: details.producer ?? d.producer,
          wineName: details.wineName ?? d.wineName,
          region: details.region ?? d.region,
          vintage: details.vintage ?? d.vintage,
        }));
      } catch {
        showAlert({ title: 'Could not read label', body: 'Enter the details by hand instead.' });
      } finally {
        setScanning(false);
      }
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Upload a label from the library to fill the draft (mirrors handleScan).
  async function handleUpload() {
    if (!(await ensureMediaPermission('library'))) return;
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      setScanning(true);
      try {
        const base64 = await prepareImageBase64(res.assets[0].uri);
        const details = await scanLabel(base64);
        setDraft((d) => d && ({
          ...d,
          producer: details.producer ?? d.producer,
          wineName: details.wineName ?? d.wineName,
          region: details.region ?? d.region,
          vintage: details.vintage ?? d.vintage,
        }));
      } catch {
        showAlert({ title: 'Could not read label', body: 'Enter the details by hand instead.' });
      } finally {
        setScanning(false);
      }
    } catch (err) {
      showAlert({ title: 'Could not open library', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // "Select from Cellar List" — file an existing cellar wine into this cell.
  async function addFromCellar(wine: CellarWine) {
    setPickerOpen(false);
    if (!cellId) return;
    try {
      await clearWineFromRacks(wine.id);
      await updateCellarWine(wine.id, { bin_cell_id: cellId, storage_location_id: null, case_id: null });
      invalidate();
    } catch (err) {
      showAlert({ title: 'Could not add', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function saveDraft() {
    if (!draft || !userId || !cellId || saving) return;
    const name = draft.wineName.trim() || draft.producer.trim();
    if (!name) { showAlert({ title: 'Name needed', body: 'Add a wine name or producer.' }); return; }
    const qty = Math.max(1, draft.quantity);

    // Soft over-capacity warning (like the rack placement mismatch) — save either
    // way, since real diamonds get over-stuffed.
    const others = wines.filter((w) => w.id !== draft.id).reduce((s, w) => s + (w.quantity ?? 0), 0);
    if (cell && others + qty > cell.capacity) {
      const proceed = await new Promise<boolean>((resolve) => {
        showAlert({
          title: 'Over capacity',
          body: `This ${cell.kind} holds ${cell.capacity}. That would put ${others + qty} bottles in it. Save anyway?`,
          buttons: [
            { text: 'Save anyway', onPress: () => resolve(true) },
            { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
          ],
        });
      });
      if (!proceed) return;
    }

    setSaving(true);
    try {
      if (draft.id) {
        await updateCellarWine(draft.id, {
          producer: draft.producer.trim() || null,
          wine_name: name,
          region: draft.region.trim() || null,
          vintage: draft.vintage.trim() || null,
          bottle_size_ml: draft.bottleSizeMl,
          quantity: qty,
        });
      } else {
        // Merge into an existing row of the same wine + format already in this
        // cell, so "12 x Diamond Creek" stays one line (mirrors lineup batching,
        // extended to include format so sizes never merge).
        const existing = wines.find((w) =>
          norm(w.producer) === norm(draft.producer) &&
          norm(w.wine_name) === norm(name) &&
          (w.vintage ?? '').trim() === draft.vintage.trim() &&
          (w.bottle_size_ml ?? 750) === draft.bottleSizeMl
        );
        if (existing) {
          await updateCellarWine(existing.id, { quantity: (existing.quantity ?? 0) + qty });
        } else {
          await addCellarWine({
            user_id: userId,
            wine_name: name,
            producer: draft.producer.trim() || null,
            region: draft.region.trim() || null,
            vintage: draft.vintage.trim() || null,
            quantity: qty,
            storage_location: null,
            date_received: new Date().toISOString().split('T')[0],
            critic_score: null,
            critic_score_note: null,
            drinking_window_from: null,
            drinking_window_to: null,
            drinking_window_status: 'unknown',
            tasting_notes: null,
            grape_variety: null,
            label_image_path: null,
            user_notes: null,
            is_wishlist: false,
            estimated_value: null,
            estimated_value_currency: null,
            estimated_value_at: null,
            estimated_value_source: null,
            purchase_price: null,
            purchase_price_currency: null,
            bottle_size_ml: draft.bottleSizeMl,
            bin_cell_id: cellId,
          } as any);
        }
      }
      invalidate();
      setDraft(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function removeRow(w: CellarWine) {
    showAlert({
      title: 'Remove from bin',
      body: `Take ${w.quantity ?? 1} × ${w.wine_name} out of this diamond? The bottles stay in your cellar.`,
      buttons: [
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try { await removeWineFromCell(w.id); invalidate(); setDraft(null); }
            catch (err) { showAlert({ title: 'Could not remove', body: err instanceof Error ? err.message : 'Please try again.' }); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const kindLabel = cell ? (cell.kind === 'triangle' ? 'Triangle' : 'Diamond') : 'Diamond';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{kindLabel}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 100 }}>
          <Text style={styles.summary}>{count}/{capacity} bottles</Text>

          {wines.length === 0 ? (
            <Text style={styles.empty}>No wines in this {kindLabel.toLowerCase()} yet.</Text>
          ) : (
            wines.map((w) => (
              <TouchableOpacity key={w.id} style={styles.row} onPress={() => openEdit(w)} activeOpacity={0.7}>
                <Text style={styles.rowQty}>{w.quantity ?? 1}×</Text>
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>{w.wine_name}</Text>
                  {(w.producer || w.vintage) ? (
                    <Text style={styles.rowMeta} numberOfLines={1}>{[w.producer, w.vintage].filter(Boolean).join(' · ')}</Text>
                  ) : null}
                </View>
                <Text style={styles.rowFormat}>{bottleSizeCl(w.bottle_size_ml ?? 750)}cl</Text>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity style={styles.addBtn} onPress={() => setChooserOpen(true)} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add wine</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <Modal visible={draft !== null} transparent animationType="fade" onRequestClose={() => setDraft(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{draft?.id ? 'Edit wine' : 'Add wine'}</Text>

            <TouchableOpacity style={styles.scanBtn} onPress={handleScan} activeOpacity={0.8} disabled={scanning}>
              {scanning ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.scanBtnText}>Scan label to fill</Text>}
            </TouchableOpacity>

            <TextInput style={styles.input} value={draft?.wineName} onChangeText={(t) => setDraft((d) => d && ({ ...d, wineName: t }))} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
            <TextInput style={styles.input} value={draft?.producer} onChangeText={(t) => setDraft((d) => d && ({ ...d, producer: t }))} placeholder="Producer" placeholderTextColor={colors.textMuted} />
            <View style={styles.inputRow}>
              <TextInput style={[styles.input, { flex: 1 }]} value={draft?.region} onChangeText={(t) => setDraft((d) => d && ({ ...d, region: t }))} placeholder="Region" placeholderTextColor={colors.textMuted} />
              <TextInput style={[styles.input, { width: 96 }]} value={draft?.vintage} onChangeText={(t) => setDraft((d) => d && ({ ...d, vintage: t }))} placeholder="Vintage" placeholderTextColor={colors.textMuted} keyboardType="number-pad" />
            </View>

            <Text style={styles.sheetLabel}>Format</Text>
            {draft ? <BottleSizePicker value={draft.bottleSizeMl} onChange={(ml) => setDraft((d) => d && ({ ...d, bottleSizeMl: ml }))} /> : null}

            <Text style={styles.sheetLabel}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDraft((d) => d && ({ ...d, quantity: Math.max(1, d.quantity - 1) }))}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
              <Text style={styles.qtyValue}>{draft?.quantity ?? 1}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDraft((d) => d && ({ ...d, quantity: d.quantity + 1 }))}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={saveDraft} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>{draft?.id ? 'Save' : 'Add to bin'}</Text>}
            </TouchableOpacity>
            {draft?.id ? (
              <TouchableOpacity style={styles.removeBtn} onPress={() => draft && removeRow(wines.find((w) => w.id === draft.id)!)}>
                <Text style={styles.removeBtnText}>Remove from bin</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setDraft(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add-a-wine chooser — same four options as a rack/fridge slot. */}
      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a wine to this {kindLabel.toLowerCase()}</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); setDraft({ ...EMPTY_DRAFT }); void handleScan(); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Scan a Label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); setPickerOpen(true); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Select from Cellar List</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); setDraft({ ...EMPTY_DRAFT }); void handleUpload(); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={() => { setChooserOpen(false); openAdd(); }} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserCancel} onPress={() => setChooserOpen(false)}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <CellarWinePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={addFromCellar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  summary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginBottom: spacing.lg },
  empty: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowQty: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.gold, minWidth: 34 },
  rowMain: { flex: 1 },
  rowName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  rowMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  rowFormat: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  addBtnText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
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
  scanBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  scanBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  stepBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  qtyValue: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, minWidth: 32, textAlign: 'center' },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  removeBtn: { alignItems: 'center', paddingTop: spacing.md },
  removeBtnText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#c0392b', textDecorationLine: 'underline' },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md },
  cancelBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
