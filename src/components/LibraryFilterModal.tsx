import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { foldAccents } from '../utils/wineIdentity';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

interface FilterItem {
  id: string;
  label: string;
  sublabel?: string;
  // Extra words the search also matches but doesn't show (region, grape,
  // where it was recorded, venue…).
  searchText?: string;
}

interface Props {
  visible: boolean;
  title: string;          // e.g. "New filter" / "Edit filter"
  itemNoun: string;       // e.g. "labels" / "lineups"
  // What the bespoke grouping is called in this context — "filter" (default) or
  // "folder" (Your Wine Reviews). Used in the placeholder / hint / save button.
  nounLabel?: string;
  items: FilterItem[];
  initialName?: string;
  initialSelected?: string[];
  saving?: boolean;
  onSave: (name: string, ids: string[]) => void;
  onClose: () => void;
  // Shows the search box whatever the list length, with this placeholder.
  searchPlaceholder?: string;
}

// Shared create/edit sheet for a bespoke library filter: name it, tick the
// items that belong to it. Used by the Label + Lineup libraries.
export function LibraryFilterModal({ visible, title, itemNoun, nounLabel = 'filter', items, initialName, initialSelected, saving, onSave, onClose, searchPlaceholder }: Props) {
  const [name, setName] = useState(initialName ?? '');
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected ?? []));
  const [search, setSearch] = useState('');

  // Reset only as the sheet opens (visible false → true): a background sync
  // changing initialSelected while it's open mustn't wipe the name or ticks.
  const wasVisibleRef = useRef(false);
  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setName(initialName ?? '');
      setSelected(new Set(initialSelected ?? []));
      setSearch('');
    }
    wasVisibleRef.current = visible;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // A long list (a big imported review history) gets a search box.
  const searchable = items.length > 20 || !!searchPlaceholder;
  const shown = useMemo(() => {
    const words = foldAccents(search.trim()).split(/\s+/).filter(Boolean);
    if (!words.length) return items;
    return items.filter((it) => {
      const hay = foldAccents(`${it.label} ${it.sublabel ?? ''} ${it.searchText ?? ''}`);
      return words.every((w) => hay.includes(w));
    });
  }, [items, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Select / clear everything the search is showing, in one tap.
  const allShownOn = shown.length > 0 && shown.every((it) => selected.has(it.id));
  function toggleAllShown() {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const it of shown) { if (allShownOn) next.delete(it.id); else next.add(it.id); }
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
            placeholder={`${nounLabel[0].toUpperCase()}${nounLabel.slice(1)} name (e.g. Special Occasions)`}
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.pickHint}>Choose {itemNoun} to add to this {nounLabel}</Text>
          {searchable ? (
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={searchPlaceholder ?? 'Search'}
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
            />
          ) : null}
          {shown.length > 1 ? (
            <TouchableOpacity style={styles.selectAllRow} onPress={toggleAllShown} activeOpacity={0.7}>
              <Text style={[styles.checkbox, allShownOn && styles.checkboxOn]}>{allShownOn ? '☑' : '☐'}</Text>
              <Text style={styles.selectAllText}>
                {allShownOn ? 'Clear all' : search.trim() ? `Select all ${shown.length} found` : `Select all ${shown.length}`}
              </Text>
              <Text style={styles.selectedCount}>{selected.size} selected</Text>
            </TouchableOpacity>
          ) : null}
          {items.length === 0 ? (
            <Text style={styles.empty}>Nothing to add yet.</Text>
          ) : (
            <FlatList
              style={styles.list}
              data={shown}
              keyExtractor={(it) => it.id}
              extraData={selected}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={15}
              maxToRenderPerBatch={20}
              windowSize={7}
              renderItem={({ item: it }) => {
                const on = selected.has(it.id);
                return (
                  <TouchableOpacity style={styles.itemRow} onPress={() => toggle(it.id)} activeOpacity={0.7}>
                    <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.itemText}>
                      <Text style={styles.itemLabel} numberOfLines={1}>{it.label}</Text>
                      {it.sublabel ? <Text style={styles.itemSub} numberOfLines={1}>{it.sublabel}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          <TouchableOpacity style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} disabled={!canSave} onPress={() => onSave(name.trim(), Array.from(selected))} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : `Save ${nounLabel}`}</Text>
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
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs, marginBottom: spacing.xs },
  selectAllText: { flex: 1, fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold },
  selectedCount: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
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
