import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

export interface FilterItem {
  id: string;
  label: string;
  sublabel?: string;
}

interface Props {
  visible: boolean;
  title: string;          // e.g. "New filter" / "Edit filter"
  itemNoun: string;       // e.g. "labels" / "lineups"
  items: FilterItem[];
  initialName?: string;
  initialSelected?: string[];
  saving?: boolean;
  onSave: (name: string, ids: string[]) => void;
  onClose: () => void;
}

// Shared create/edit sheet for a bespoke library filter: name it, tick the
// items that belong to it. Used by the Label + Lineup libraries.
export function LibraryFilterModal({ visible, title, itemNoun, items, initialName, initialSelected, saving, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected ?? []));

  useEffect(() => {
    if (visible) {
      setName(initialName ?? '');
      setSelected(new Set(initialSelected ?? []));
    }
  }, [visible, initialName, JSON.stringify(initialSelected)]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const canSave = name.trim().length > 0 && selected.size > 0 && !saving;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.nameInput}
            value={name}
            onChangeText={setName}
            placeholder="Filter name (e.g. Special Occasions)"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.pickHint}>Choose the {itemNoun} in this filter</Text>
          {items.length === 0 ? (
            <Text style={styles.empty}>Nothing to add yet.</Text>
          ) : (
            <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
              {items.map((it) => {
                const on = selected.has(it.id);
                return (
                  <TouchableOpacity key={it.id} style={styles.itemRow} onPress={() => toggle(it.id)} activeOpacity={0.7}>
                    <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.itemText}>
                      <Text style={styles.itemLabel} numberOfLines={1}>{it.label}</Text>
                      {it.sublabel ? <Text style={styles.itemSub} numberOfLines={1}>{it.sublabel}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
          <TouchableOpacity style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave} onPress={() => onSave(name.trim(), Array.from(selected))} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save filter'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%', maxHeight: '80%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  nameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  pickHint: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.xs },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, paddingVertical: spacing.md, textAlign: 'center' },
  list: { maxHeight: 320, marginBottom: spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { fontSize: 20, color: colors.textMuted },
  checkboxOn: { color: colors.gold },
  itemText: { flex: 1 },
  itemLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  itemSub: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
