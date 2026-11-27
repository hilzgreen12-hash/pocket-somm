import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "INPUT YOUR WINE INSTEAD ▾" — sits under the "Search your wine" bar on every
// search/manual-input screen. The manual fields stay folded away until it's
// tapped, so the search comes first.
export function ManualInputToggle({ open, onToggle, label = 'Input Your Wine Instead' }: {
  open: boolean;
  onToggle: () => void;
  label?: string;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onToggle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8 }}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
    >
      <Text style={styles.label}>{label}</Text>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={colors.gold} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Same gold capitals as WineSearchInput's "Search your wine" label.
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md, marginBottom: spacing.xs, alignSelf: 'flex-start' },
  label: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
});
