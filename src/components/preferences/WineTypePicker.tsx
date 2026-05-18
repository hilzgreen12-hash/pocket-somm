import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import type { WineType } from '../../types/preferences';

// Re-export so the existing import sites on scan.tsx etc. keep compiling
// without changes — the canonical definition now lives in
// src/types/preferences.ts so the picker can't drift from the rest of the
// app.
export type { WineType };

const WINE_TYPES: { id: WineType; label: string }[] = [
  { id: 'white',           label: 'White' },
  { id: 'red',             label: 'Red' },
  { id: 'rose',            label: 'Rosé' },
  { id: 'sparkling',       label: 'Sparkling' },
  { id: 'orange',          label: 'Orange' },
  { id: 'sweet-fortified', label: 'Sweet & Fortified' },
];

interface Props {
  selected: WineType[];
  onChange: (types: WineType[]) => void;
  max?: number;
}

// Bubble-chip picker mirroring the look of ChipPicker (used on the
// About You → Wine Preferences screen) — easier to read than a stacked
// list, and "Any" sits at the start as a one-tap clear.
export function WineTypePicker({ selected, onChange, max = WINE_TYPES.length }: Props) {
  const anyActive = selected.length === 0;

  function toggle(id: WineType) {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.chip, anyActive && styles.chipActive]}
        onPress={() => onChange([])}
        activeOpacity={0.6}
      >
        <Text style={[styles.chipText, anyActive && styles.chipTextActive]}>Any</Text>
      </TouchableOpacity>
      {WINE_TYPES.map((type) => {
        const active = selected.includes(type.id);
        return (
          <TouchableOpacity
            key={type.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => toggle(type.id)}
            activeOpacity={0.6}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '22',
  },
  chipText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.gold,
  },
});
