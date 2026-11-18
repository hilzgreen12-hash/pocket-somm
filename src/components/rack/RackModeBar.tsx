import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { wineHeaderLine } from '../../utils/wineHeader';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { PlacementMode } from './useRackPlacement';

// The bar above the grid while slots are being chosen. It sits in the static
// header, never over the grid.
export function RackModeBar({ mode, selectedCount, onCancel, onConfirm }: {
  mode: Exclude<PlacementMode, { kind: 'idle' }>;
  selectedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (mode.kind === 'multiSelect') {
    return (
      <View style={styles.bar}>
        <View style={styles.inner}>
          <Text style={styles.header}>Add Multiples of the same wine</Text>
          <Text style={styles.text}>{selectedCount} {selectedCount === 1 ? 'slot' : 'slots'} selected — tap additional slots to fill</Text>
          <TouchableOpacity style={[styles.primary, styles.primaryFull, selectedCount === 0 && styles.disabled]} onPress={onConfirm} disabled={selectedCount === 0} activeOpacity={0.8}>
            <Text style={styles.primaryText}>Confirm Slots & Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelLink} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelLinkText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  const placing = mode.kind === 'placeExisting';
  const header = placing
    ? (wineHeaderLine(mode.wine.producer, mode.wine.wine_name, mode.wine.vintage) || mode.wine.wine_name)
    : `Add more ${mode.wineName}`;
  const text = placing
    ? `${mode.limit === 1 ? 'Tap the slot you would like to place the bottle into' : 'Tap every slot you would like to place bottles into'}${selectedCount > 0 ? `  ·  ${selectedCount}/${mode.limit}` : ''}`
    : `${selectedCount} ${selectedCount === 1 ? 'bottle' : 'bottles'} · short press the empty slots to fill`;
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Text style={styles.header} numberOfLines={2}>{header}</Text>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.cancel} onPress={onCancel} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.primary, selectedCount === 0 && styles.disabled]} onPress={onConfirm} disabled={selectedCount === 0} activeOpacity={0.8}>
            <Text style={styles.primaryText}>{placing ? 'Confirm' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  inner: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.md, gap: spacing.sm, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  header: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center', letterSpacing: 0.3 },
  text: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.text, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  cancel: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  primary: { flex: 2, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  // Full-width primary button (stacked layout, not the side-by-side row).
  primaryFull: { flex: undefined, alignSelf: 'stretch' },
  primaryText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  disabled: { opacity: 0.4 },
  // Small centred "Cancel" link below the primary button.
  cancelLink: { alignItems: 'center', paddingTop: 2 },
  cancelLinkText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
});
