import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import type { HomeDestination } from '../../services/moveBottles';
import type { StorageLocation, WineRack } from '../../types/wine';
import { colors, spacing } from '../../constants/theme';
import { fontsSpectral as fonts } from '../../constants/fonts';

interface Props {
  visible: boolean;
  subtitle: string;
  // Bottles that can move; above 1 the user picks how many. Omitted for a bulk
  // move, which always takes every bottle.
  maxBottles?: number;
  racks: WineRack[];                 // racks and fridges
  bins: WineRack[];
  storageLocations: StorageLocation[];
  onPick: (dest: HomeDestination, count: number) => void;
  onClose: () => void;
}

// Where bottles can go in Home Storage: Your Cellar List, a rack or fridge, a
// bin, or a home alt cellar. External cellars are never offered — storage only
// ever moves external → home.
export function MoveHomeModal({ visible, subtitle, maxBottles, racks, bins, storageLocations, onPick, onClose }: Props) {
  const [count, setCount] = useState(maxBottles ?? 1);
  useEffect(() => { if (visible) setCount(maxBottles ?? 1); }, [visible, maxBottles]);

  const dests: { dest: Exclude<HomeDestination, { kind: 'list' }>; type: string }[] = [
    ...racks.map((r) => ({ dest: { kind: 'rack' as const, id: r.id, name: r.name }, type: r.storage_type === 'fridge' ? 'Fridge' : 'Rack' })),
    ...bins.map((b) => ({ dest: { kind: 'bin' as const, id: b.id, name: b.name }, type: 'Bin' })),
    ...storageLocations.filter((l) => !l.is_external)
      .map((l) => ({ dest: { kind: 'location' as const, id: l.id, name: l.name }, type: 'Alt Cellar' })),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Move to Home Storage</Text>
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
          {maxBottles != null && maxBottles > 1 && (
            <View style={styles.stepper}>
              <TouchableOpacity onPress={() => setCount((c) => Math.max(1, c - 1))} style={styles.stepBtn} accessibilityLabel="Fewer bottles">
                <Text style={styles.stepText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.count}>{count} of {maxBottles} bottles</Text>
              <TouchableOpacity onPress={() => setCount((c) => Math.min(maxBottles, c + 1))} style={styles.stepBtn} accessibilityLabel="More bottles">
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
          <ScrollView style={{ maxHeight: 340 }}>
            <TouchableOpacity style={styles.row} onPress={() => onPick({ kind: 'list' }, count)}>
              <Text style={styles.name}>Your Cellar List</Text>
              <Text style={styles.type}>Unplaced</Text>
            </TouchableOpacity>
            {dests.map(({ dest, type }) => (
              <TouchableOpacity key={dest.id} style={styles.row} onPress={() => onPick(dest, count)}>
                <Text style={styles.name} numberOfLines={1}>{dest.name}</Text>
                <Text style={styles.type}>{type}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  subtitle: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg, marginVertical: spacing.md },
  stepBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: fonts.bodySemibold, fontSize: 20, color: colors.gold },
  count: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  type: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6 },
  cancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
