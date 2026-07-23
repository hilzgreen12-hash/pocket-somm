import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useRacks } from '../hooks/useRacks';
import { getSlotAssignments } from '../api/racks';
import { wineHeaderLine } from '../utils/wineHeader';
import { LabelThumb } from './LabelThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

// Picker for dropping an EXISTING cellar wine into a rack slot. Lists only
// UNPLACED wines (not already in any rack), with a search box.
export function CellarWinePicker({
  visible,
  onClose,
  onSelect,
  // When true, list EVERY cellar wine (placed or not) so the caller can offer to
  // MOVE a placed bottle. Default false = only unplaced (drop into a rack slot).
  allowPlaced = false,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (wine: CellarWine) => void;
  allowPlaced?: boolean;
}) {
  const { wines } = useCellar();
  const { racks } = useRacks();
  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: visible && rackIds.length > 0,
  });
  const [query, setQuery] = useState('');

  const unplaced = useMemo(() => {
    const placed = new Set(slotAssignments.map((s) => s.cellar_wine_id));
    const q = query.trim().toLowerCase();
    return wines
      .filter((w) => allowPlaced || !placed.has(w.id))
      .filter((w) => !q || `${w.producer ?? ''} ${w.wine_name} ${w.vintage ?? ''}`.toLowerCase().includes(q));
  }, [wines, slotAssignments, query, allowPlaced]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Select from Cellar List</Text>
          <Text style={styles.subtitle}>{allowPlaced ? 'Pick a wine — already-placed bottles can be moved here.' : 'Unplaced wines — pick one to drop into this slot.'}</Text>
          <TextInput
            style={styles.search}
            placeholder="Search your cellar…"
            placeholderTextColor={colors.textSubtle}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
          />
          {unplaced.length === 0 ? (
            <Text style={styles.empty}>
              {wines.length === 0
                ? 'Your cellar is empty — add a wine first.'
                : allowPlaced ? 'No wines match your search.' : 'Every cellar wine is already placed in a rack.'}
            </Text>
          ) : (
            <FlatList
              data={unplaced}
              keyExtractor={(w) => w.id}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.row} onPress={() => onSelect(item)} activeOpacity={0.7}>
                  <LabelThumb path={item.label_image_path} fallbackText={item.wine_name} style={styles.thumb} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName} numberOfLines={2}>
                      {wineHeaderLine(item.producer, item.wine_name, item.vintage)}
                    </Text>
                    {item.region ? <Text style={styles.rowMeta} numberOfLines={1}>{item.region}</Text> : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: spacing.xl, paddingBottom: spacing.xxl, maxHeight: '80%' },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center' },
  subtitle: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  search: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  list: { flexGrow: 0 },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  thumb: { width: 34, height: 44 },
  rowName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  cancel: { alignItems: 'center', paddingTop: spacing.lg },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
