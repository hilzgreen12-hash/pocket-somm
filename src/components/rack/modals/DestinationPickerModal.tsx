import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../../../constants/theme';
import { fonts } from '../../../constants/fonts';
import { sheet } from '../styles';
import type { WineRack, StorageLocation } from '../../../types/wine';

export type Destination =
  | { kind: 'thisRack' }
  | { kind: 'rack'; id: string; name: string }
  | { kind: 'bin'; id: string; name: string }
  | { kind: 'location'; id: string; name: string }
  | { kind: 'cellarList' };

// Where a placed wine's bottles can go ("Move to Another Location") or where
// more of them can be added ("Add More Bottles"). Racks/fridges, bins and alt
// cellars are one list; Your Full Cellar List (unplaced) is always last. Moves
// never offer an external cellar — storage only ever moves external → home —
// but new bottles may be added to one.
export function DestinationPickerModal({ mode, wineName, rackId, racks, bins, locations, onPick, onClose }: {
  mode: 'move' | 'addMore' | null;
  wineName: string;
  rackId: string;
  racks: WineRack[];
  bins: WineRack[];
  locations: StorageLocation[];
  onPick: (dest: Destination) => void;
  onClose: () => void;
}) {
  const isMove = mode === 'move';
  const row = (key: string, name: string, type: string, dest: Destination, extra?: object) => (
    <TouchableOpacity key={key} style={[styles.row, extra]} activeOpacity={0.7} onPress={() => onPick(dest)}>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.type}>{type}</Text>
    </TouchableOpacity>
  );
  return (
    <Modal visible={mode !== null} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sheet.overlay}>
        <View style={sheet.sheet}>
          <Text style={sheet.title} numberOfLines={2}>{isMove ? `Move ${wineName}` : 'Add More Bottles to'}</Text>
          {isMove ? null : <Text style={sheet.body} numberOfLines={2}>{wineName}</Text>}
          <ScrollView style={styles.list}>
            {isMove
              ? row('this', 'Another slot in this rack', 'This rack', { kind: 'thisRack' }, styles.rowGoldSep)
              : row('this', 'This Rack', 'Tap slots', { kind: 'thisRack' })}
            {racks.filter((r) => r.id !== rackId).map((r) =>
              row(r.id, r.name, r.storage_type === 'fridge' ? 'Fridge' : 'Rack', { kind: 'rack', id: r.id, name: r.name }))}
            {bins.map((b) => row(b.id, b.name, 'Bin', { kind: 'bin', id: b.id, name: b.name }))}
            {locations.filter((l) => !isMove || !l.is_external).map((l) =>
              row(l.id, l.name, 'Alt Cellar', { kind: 'location', id: l.id, name: l.name }))}
            {row('list', 'Full Cellar List (unplaced)', isMove ? 'Unplace' : 'Loose', { kind: 'cellarList' })}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={sheet.cancel}>
            <Text style={sheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: { maxHeight: 360, alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  // The single divider between "Another slot in this rack" and the first home
  // storage destination is gold, to set the in-rack option apart from the rest.
  rowGoldSep: { borderBottomColor: colors.goldDim, borderBottomWidth: 1.5 },
  name: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  type: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6 },
});
