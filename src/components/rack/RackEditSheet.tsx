import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useRacks } from '../../hooks/useRacks';
import { showAlert } from '../AppAlert';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import { sheet } from './styles';
import type { RackSlot, WineRack } from '../../types/wine';

const errorBody = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');

// Stepper for the resize view — the same 1…30 range as building a rack.
function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.max(1, value - 1))}>
          <Text style={styles.counterBtnText} allowFontScaling={false}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.min(30, value + 1))}>
          <Text style={styles.counterBtnText} allowFontScaling={false}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// "Edit" on a rack or fridge: rename, resize, wipe its contents, or delete it.
// Wiping, shrinking and deleting only unplace bottles — the wines stay in the
// cellar.
export function RackEditSheet({ rack, slots, visible, onClose, onDeleted }: {
  rack: WineRack;
  slots: RackSlot[];
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const { remove, rename, wipe, resize } = useRacks();
  const [view, setView] = useState<'actions' | 'rename' | 'resize'>('actions');
  const [name, setName] = useState(rack.name);
  const [rows, setRows] = useState(rack.rows);
  const [cols, setCols] = useState(rack.cols);
  const noun = rack.storage_type === 'fridge' ? 'fridge' : 'rack';
  const Noun = rack.storage_type === 'fridge' ? 'Fridge' : 'Rack';

  // Always reopen on the action list.
  useEffect(() => { if (visible) setView('actions'); }, [visible]);

  function saveName() {
    const trimmed = name.trim();
    if (!trimmed) return;
    rename.mutate({ id: rack.id, name: trimmed }, {
      onSuccess: onClose,
      onError: (err) => showAlert({ title: 'Could not rename', body: errorBody(err) }),
    });
  }

  // Growing is unconditional; shrinking past placed bottles asks first.
  function saveSize() {
    if (rows === rack.rows && cols === rack.cols) { setView('actions'); return; }
    const run = () => resize.mutate({ id: rack.id, rows, cols }, {
      onSuccess: onClose,
      onError: (err) => showAlert({ title: 'Could not resize', body: errorBody(err) }),
    });
    // Standard slots outside the new grid; the large-format band (row -1) has
    // its own width and is always kept.
    const n = slots.filter((s) => s.row_index >= 0 && s.cellar_wine_id && (s.row_index >= rows || s.col_index >= cols)).length;
    if (n === 0) { run(); return; }
    showAlert({
      title: `Remove ${n} ${n === 1 ? 'bottle' : 'bottles'} from ${n === 1 ? 'its slot' : 'their slots'}?`,
      body: `Shrinking to ${rows} × ${cols} unmaps ${n === 1 ? 'a bottle that sits' : `${n} bottles that sit`} outside the new grid. ${n === 1 ? 'It stays' : 'They stay'} in your cellar — just no longer placed in this ${noun}.`,
      buttons: [
        { text: 'Resize & unassign', style: 'destructive', onPress: run },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmWipe() {
    showAlert({
      title: `Wipe ${noun} contents?`,
      body: `This empties every slot in this ${noun}. The wines stay in your cellar — they're just unassigned from this ${noun}.`,
      buttons: [
        { text: `Wipe ${noun}`, style: 'destructive', onPress: () => wipe.mutate(rack.id, {
            onSuccess: onClose,
            onError: (err) => showAlert({ title: 'Could not wipe', body: errorBody(err) }),
          }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmDelete() {
    showAlert({
      title: `Delete this ${noun}?`,
      body: `Permanently remove "${rack.name}". The wines stay in your cellar — they're just no longer mapped to a ${noun}.`,
      buttons: [
        { text: `Delete ${noun}`, style: 'destructive', onPress: () => remove.mutate(rack.id, {
            onSuccess: () => { onClose(); onDeleted(); },
            onError: (err) => showAlert({ title: 'Could not delete', body: errorBody(err) }),
          }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={sheet.overlay}>
        <View style={sheet.sheet}>
          <Text style={sheet.title}>{rack.storage_type === 'fridge' ? 'Edit Wine Fridge' : 'Edit Wine Rack'}</Text>
          {view === 'rename' ? (
            <>
              <Text style={sheet.fieldLabel}>Rack name</Text>
              <TextInput style={sheet.textInput} value={name} onChangeText={setName} placeholder="Rack name" placeholderTextColor={colors.textMuted} autoFocus />
              <TouchableOpacity style={sheet.confirmBtn} onPress={saveName} disabled={rename.isPending}>
                <Text style={sheet.confirmText}>{rename.isPending ? 'Saving…' : 'Save name'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setView('actions')} style={sheet.cancel}>
                <Text style={sheet.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : view === 'resize' ? (
            <>
              <View style={styles.preview}>
                <Text style={styles.previewLabel}>{rows} × {cols}</Text>
                <Text style={styles.previewSub}>{rows * cols} bottle slots</Text>
              </View>
              <Counter label="Vertical (rows)" value={rows} onChange={setRows} />
              <View style={styles.divider} />
              <Counter label="Horizontal (columns)" value={cols} onChange={setCols} />
              <TouchableOpacity style={sheet.confirmBtn} onPress={saveSize} disabled={resize.isPending}>
                <Text style={sheet.confirmText}>{resize.isPending ? 'Saving…' : 'Save size'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setView('actions')} style={sheet.cancel}>
                <Text style={sheet.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.action} onPress={() => { setName(rack.name); setView('rename'); }} activeOpacity={0.7}>
                <Text style={styles.actionText}>Rename {Noun}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={() => { setRows(rack.rows); setCols(rack.cols); setView('resize'); }} activeOpacity={0.7}>
                <Text style={styles.actionText}>Resize {Noun}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={confirmWipe} activeOpacity={0.7}>
                <Text style={styles.actionText}>Wipe {Noun} Contents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.action} onPress={confirmDelete} activeOpacity={0.7}>
                <Text style={styles.actionText}>Delete {Noun}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={sheet.cancel}>
                <Text style={sheet.cancelText}>Close</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  action: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  // Cormorant — button text
  actionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Resize view — preview stat + stepper rows, mirroring the create flow.
  preview: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md },
  previewLabel: { fontSize: 32, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 1 },
  previewSub: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  counterLabel: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  counterBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 22, color: colors.text, fontFamily: fonts.headingRegular },
  counterValue: { fontSize: 24, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 40, textAlign: 'center' },
});
