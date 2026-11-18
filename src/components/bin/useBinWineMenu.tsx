import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCellarViews } from '../../hooks/useCellar';
import { deleteCellarWine, getCellarWineById, updateCellarWine } from '../../api/cellar';
import { releaseFromBinCell } from '../../api/placements';
import { archiveBottles } from '../../services/archiveNight';
import { releaseLeavingBottles } from '../../services/moveBottles';
import { ArchiveBottlesSheet } from '../winecard/cellar/ArchiveBottlesSheet';
import { showAlert } from '../AppAlert';
import { bottleSizeLabel } from '../BottleSizePicker';
import { confirmWineDelete, reviewsOn } from '../../utils/confirmWineDelete';
import { todayYmd } from '../../utils/reviewDate';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { CellarWine } from '../../types/wine';
import type { BinEntry } from '../../hooks/useBinFilters';

const wineTitle = (w: CellarWine) => [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ');

// The long-press menu for a wine in a bin's list — the same verbs as a rack
// slot, scoped to the cell the bottles are in — plus the pop-ups it opens
// (how many to delete, the archive sheet). Render `sheets` once in the screen.
export function useBinWineMenu({ binId, binName, entries, canEdit, onHighlight, onStartMove }: {
  binId: string;
  binName: string;
  entries: BinEntry[];
  canEdit: boolean;
  onHighlight: (wineId: string) => void;
  onStartMove: (wine: CellarWine, cellId: string, qty: number) => void;
}) {
  const qc = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<{ wine: CellarWine; cellId: string; qty: number } | null>(null);
  const [deleteCount, setDeleteCount] = useState('1');
  const [archiveTarget, setArchiveTarget] = useState<{ wine: CellarWine; cellId: string } | null>(null);
  const [archiving, setArchiving] = useState(false);
  const fromBin = { kind: 'bin' as const, id: binId };
  const fail = (title: string, err: unknown) => showAlert({ title, body: err instanceof Error ? err.message : 'Please try again.' });

  // "Highlight All Bottles": light up every cell holding the wine and say where
  // they are, e.g. "2x75cl in D2B".
  function showWineCells(w: CellarWine) {
    const mine = entries.filter((e) => e.wine.id === w.id);
    const total = mine.reduce((s, e) => s + (e.wine.bin_cell_quantity ?? 0), 0);
    onHighlight(w.id);
    showAlert({
      title: wineTitle(w),
      body: [
        `${total} bottle${total === 1 ? '' : 's'} in ${binName}`,
        ...mine.map((e) => `${e.wine.bin_cell_quantity ?? 0}x${bottleSizeLabel(e.wine.bottle_size_ml ?? 750)} in ${e.label ?? 'a diamond'}`),
      ].join('\n'),
      buttons: [{ text: 'OK', style: 'cancel' }],
    });
  }

  function open(w: CellarWine, cellId: string) {
    if (!canEdit) {
      showAlert({
        title: wineTitle(w),
        buttons: [
          { text: 'View Wine Intel', onPress: () => router.push(`/cellar/${w.id}` as any) },
          { text: 'Highlight All Bottles', onPress: () => showWineCells(w) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    const cellQty = Math.max(1, w.bin_cell_quantity ?? 1);
    showAlert({
      title: wineTitle(w),
      body: 'What would you like to do?',
      buttons: [
        { text: 'View Wine Intel', onPress: () => router.push(`/cellar/${w.id}` as any) },
        { text: 'Edit Wine', onPress: () => router.push(`/cellar/edit-wine/${w.id}` as any) },
        { text: 'Highlight All Bottles', onPress: () => showWineCells(w) },
        { text: 'Move to Another Diamond', onPress: () => onStartMove(w, cellId, cellQty) },
        { text: 'Archive Wine', onPress: () => setArchiveTarget({ wine: w, cellId }) },
        { text: 'Delete Wine (Permanent)', style: 'destructive', onPress: () => {
            if (cellQty > 1) { setDeleteCount('1'); setDeleteTarget({ wine: w, cellId, qty: cellQty }); return; }
            deleteFromCell(w, cellId, 1);
          } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Permanently delete `n` bottles, this cell's first. The wine's last bottles
  // take the wine — and its reviews — with them, so that always goes through
  // the shared confirmation, which offers Archive instead. Fewer go straight
  // away once the how-many pop-up (which says it can't be undone) was used.
  function deleteFromCell(w: CellarWine, cellId: string, n: number, warned = false) {
    const whole = n >= (w.quantity ?? 1);
    if (warned && !whole) { void runDelete(w.id, cellId, n); return; }
    confirmWineDelete({
      lead: whole ? undefined : `Permanently remove ${n === 1 ? 'this bottle' : `${n} bottles`} from your cellar.`,
      reviewsLost: whole ? reviewsOn([w]) : 0,
      deleteText: 'Delete',
      onDelete: () => void runDelete(w.id, cellId, n),
      onArchive: () => void archive(w.id, Infinity, todayYmd()),
    });
  }

  async function runDelete(wineId: string, cellId: string, n: number) {
    try {
      const fresh = await getCellarWineById(wineId);
      if (!fresh || fresh.archived_at) throw new Error('This wine is no longer in your cellar. Pull to refresh and try again.');
      if (n >= fresh.quantity) await deleteCellarWine(wineId); // its placements cascade
      else {
        // This cell's bottles leave first; releaseLeavingBottles takes any
        // shortfall from loose bottles or other storage before the count drops.
        await releaseFromBinCell(wineId, cellId, n);
        await releaseLeavingBottles(wineId, fresh.quantity, n);
        await updateCellarWine(wineId, { quantity: fresh.quantity - n });
      }
    } catch (err) {
      fail('Could not delete', err);
    } finally {
      invalidateCellarViews(qc);
    }
  }

  // Archive bottles of a wine, this bin's first.
  async function archive(wineId: string, count: number, date: string, note?: string) {
    setArchiving(true);
    try {
      const { archived } = await archiveBottles(wineId, count, date, { fromUnit: fromBin, note });
      if (archived === 0) throw new Error('This wine is no longer in your cellar. Pull to refresh and try again.');
      setArchiveTarget(null);
    } catch (err) {
      fail('Could not archive', err);
    } finally {
      invalidateCellarViews(qc);
      setArchiving(false);
    }
  }

  const chosenCount = (max: number) => Math.max(1, Math.min(max, parseInt(deleteCount, 10) || 1));
  const sheets = (
    <>
      <Modal visible={deleteTarget !== null} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.title}>Delete how many?</Text>
            <Text style={styles.body}>{deleteTarget?.qty} bottles of {deleteTarget?.wine.wine_name} are filed here. How many would you like to permanently delete? This can't be undone.</Text>
            <TextInput
              style={styles.input}
              value={deleteCount}
              onChangeText={(t) => setDeleteCount(t.replace(/[^0-9]/g, '').slice(0, 3))}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
              autoFocus
              selectTextOnFocus
            />
            <TouchableOpacity style={styles.btn} onPress={() => { const t = deleteTarget; if (!t) return; setDeleteTarget(null); deleteFromCell(t.wine, t.cellId, chosenCount(t.qty), true); }}>
              <Text style={styles.btnText}>Delete Bottles</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.allBtn} onPress={() => { const t = deleteTarget; if (!t) return; setDeleteTarget(null); deleteFromCell(t.wine, t.cellId, t.qty, true); }}>
              <Text style={styles.allText}>Delete all {deleteTarget?.qty}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancel} onPress={() => setDeleteTarget(null)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {archiveTarget ? (
        <ArchiveBottlesSheet
          visible
          wine={archiveTarget.wine}
          initialCount={1}
          working={archiving}
          onArchive={({ count, date, note }) => void archive(archiveTarget.wine.id, count, date, note || undefined)}
          onDelete={(count) => {
            const { wine, cellId } = archiveTarget;
            setArchiveTarget(null);
            deleteFromCell(wine, cellId, count);
          }}
          onClose={() => setArchiveTarget(null)}
        />
      ) : null}
    </>
  );

  return { open, sheets };
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  body: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', marginBottom: spacing.md },
  btn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: '#1A1A1A' },
  allBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  allText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text },
  cancel: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
