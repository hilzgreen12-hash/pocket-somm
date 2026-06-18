import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Standard bottle sizes offered as quick chips. ml is the canonical
// storage unit (no decimals, no locale dependency); labels use cl / L for
// the user-facing language Vinster has settled on elsewhere.
export const COMMON_BOTTLE_SIZES: { ml: number; label: string }[] = [
  { ml: 375,  label: '37.5cl' },
  { ml: 750,  label: '75cl' },
  { ml: 1500, label: '150cl' },
];

// User-facing label for any ml value — used on the cellar list etc. so
// non-standard sizes render with the same wording the picker uses.
export function bottleSizeLabel(ml: number): string {
  const exact = COMMON_BOTTLE_SIZES.find((s) => s.ml === ml);
  if (exact) return exact.label;
  if (ml >= 1000) return `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`;
  return `${(ml / 10).toFixed(ml % 10 === 0 ? 0 : 1)}cl`;
}

// Bare centilitre number (no unit) for the compact "quantity x format" tag
// used on the cellar list and import review — e.g. 750 -> "75", 1500 -> "150",
// 375 -> "37.5". Renders as "2x150" alongside the quantity.
export function bottleSizeCl(ml: number): string {
  return (ml / 10).toFixed(ml % 10 === 0 ? 0 : 1);
}

// Standard rack slots are 750ml by convention — that's what a normal wine
// rack is built to hold. The large-format row (row_index = -1 in our
// schema) carries its own configured size on the rack record.
export function expectedSlotSizeMl(
  rowIndex: number,
  largeFormatBottleSizeMl: number | null | undefined,
): number {
  if (rowIndex === -1) return largeFormatBottleSizeMl ?? 1500;
  return 750;
}

export interface PlacementMismatch {
  bottleMl: number;
  slotMl: number;
  bottleLabel: string;
  slotLabel: string;
  direction: 'too-big' | 'too-small';
}

// Returns null when the wine matches the slot's expected size; otherwise
// returns a description the caller can show in a soft warning prompt.
// Bottle and slot sizes are compared by exact ml — a Magnum (1500) and a
// standard (750) are clearly different; a 75cl (750) and a standard slot
// match. Custom sizes (e.g. 500ml halves) will mismatch a 750ml slot and
// surface the warning, which is the desired behaviour.
export function detectPlacementMismatch(
  bottleSizeMl: number,
  rowIndex: number,
  largeFormatBottleSizeMl: number | null | undefined,
): PlacementMismatch | null {
  const slotMl = expectedSlotSizeMl(rowIndex, largeFormatBottleSizeMl);
  if (bottleSizeMl === slotMl) return null;
  return {
    bottleMl: bottleSizeMl,
    slotMl,
    bottleLabel: bottleSizeLabel(bottleSizeMl),
    slotLabel: bottleSizeLabel(slotMl),
    direction: bottleSizeMl > slotMl ? 'too-big' : 'too-small',
  };
}

// Warm, format-aware copy. The "too-big" case is more serious (the bottle
// physically may not fit a smaller slot in real life); "too-small" is just
// airspace and is mostly an FYI.
export function placementWarningBody(m: PlacementMismatch): string {
  if (m.direction === 'too-big') {
    return `You're placing a ${m.bottleLabel} in a slot built for ${m.slotLabel}. Most physical racks won't hold a larger bottle in a smaller slot — Vinster will save the placement either way, but you may need to adjust your real rack at home.`;
  }
  return `You're placing a ${m.bottleLabel} in a slot built for ${m.slotLabel}. The bottle will sit comfortably but with airspace around it.`;
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
    // Picker chip label — Inter
    fontFamily: fonts.bodyMedium,
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
    // Form input — Inter
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    paddingVertical: spacing.sm,
  },
  customSuffix: {
    fontSize: 16,
    // Suffix label (ml/cl) — Inter
    fontFamily: fonts.bodyMedium,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
});
