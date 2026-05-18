import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

// Standard bottle sizes offered as quick chips. ml is the canonical
// storage unit (no decimals, no locale dependency); labels use cl / L for
// the user-facing language Vinster has settled on elsewhere.
export const COMMON_BOTTLE_SIZES: { ml: number; label: string }[] = [
  { ml: 375,  label: '37.5cl' },
  { ml: 500,  label: '50cl' },
  { ml: 750,  label: '75cl' },
  { ml: 1000, label: '1L' },
  { ml: 1500, label: '1.5L (Magnum)' },
  { ml: 3000, label: '3L (Jeroboam)' },
];

// User-facing label for any ml value — used on the cellar list etc. so
// non-standard sizes render with the same wording the picker uses.
export function bottleSizeLabel(ml: number): string {
  const exact = COMMON_BOTTLE_SIZES.find((s) => s.ml === ml);
  if (exact) return exact.label;
  if (ml >= 1000) return `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`;
  return `${(ml / 10).toFixed(ml % 10 === 0 ? 0 : 1)}cl`;
}

interface Props {
  value: number; // ml
  onChange: (ml: number) => void;
}

export function BottleSizePicker({ value, onChange }: Props) {
  // "Other" lets the user enter an unusual size in cl. We treat any value
  // not in COMMON_BOTTLE_SIZES as custom so a wine scanned at e.g. 620ml
  // still shows the input pre-populated with the right cl.
  const isCustom = !COMMON_BOTTLE_SIZES.some((s) => s.ml === value);
  const [customCl, setCustomCl] = useState(isCustom ? String(Math.round(value / 10)) : '');
  const [customOpen, setCustomOpen] = useState(isCustom);

  function selectSize(ml: number) {
    setCustomOpen(false);
    onChange(ml);
  }

  function openCustom() {
    setCustomOpen(true);
    // If switching to custom from a standard size, seed the input with the
    // current value so the user can adjust rather than start from scratch.
    if (!isCustom && !customCl) {
      setCustomCl(String(Math.round(value / 10)));
    }
  }

  function onCustomChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setCustomCl(cleaned);
    const cl = parseInt(cleaned, 10);
    if (!Number.isNaN(cl) && cl > 0) {
      onChange(cl * 10);
    }
  }

  return (
    <View>
      <View style={styles.wrap}>
        {COMMON_BOTTLE_SIZES.map((size) => {
          const active = !customOpen && value === size.ml;
          return (
            <TouchableOpacity
              key={size.ml}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectSize(size.ml)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{size.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={[styles.chip, customOpen && styles.chipActive]}
          onPress={openCustom}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, customOpen && styles.chipTextActive]}>Other</Text>
        </TouchableOpacity>
      </View>

      {customOpen && (
        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            value={customCl}
            onChangeText={onCustomChange}
            placeholder="e.g. 62"
            placeholderTextColor={colors.textMuted}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Text style={styles.customSuffix}>cl</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
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
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  customInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  customSuffix: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
