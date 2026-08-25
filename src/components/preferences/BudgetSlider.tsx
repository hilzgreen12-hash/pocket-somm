import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import { currencySymbol } from '../../constants/currency';

// Non-linear stops so the lower end (where most users sit) has finer
// resolution and the high end stays manageable. Last stop is null = Baller.
const VALUES: (number | null)[] = [
  // £20–£150 in £10 steps
  ...Array.from({ length: 14 }, (_, i) => 20 + i * 10),    // 20,30,...,150
  // £170–£450 in £20 steps
  ...Array.from({ length: 15 }, (_, i) => 170 + i * 20),   // 170,190,...,450
  // £500–£950 in £50 steps
  ...Array.from({ length: 10 }, (_, i) => 500 + i * 50),   // 500,550,...,950
  // Baller
  null,
];

const MAX_INDEX = VALUES.length - 1;

// Minimum-budget stops: "No minimum" (null) first, then every numeric stop
// from the max scale (no "Baller" — a minimum of Baller makes no sense).
const MIN_VALUES: (number | null)[] = [null, ...VALUES.filter((v): v is number => v !== null)];
const MIN_MAX_INDEX = MIN_VALUES.length - 1;

function valueToIndex(value: number | null): number {
  if (value === null) return MAX_INDEX;
  let closest = 0;
  let diff = Infinity;
  VALUES.forEach((v, i) => {
    if (v !== null) {
      const d = Math.abs(v - value);
      if (d < diff) { diff = d; closest = i; }
    }
  });
  return closest;
}

function minValueToIndex(value: number | null): number {
  if (value == null) return 0; // No minimum
  let closest = 0;
  let diff = Infinity;
  MIN_VALUES.forEach((v, i) => {
    if (v !== null) {
      const d = Math.abs(v - value);
      if (d < diff) { diff = d; closest = i; }
    }
  });
  return closest;
}

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  // Optional MINIMUM budget. When onMinChange is provided, a second "minimum"
  // slider renders and the header shows a range. minValue null = no minimum.
  minValue?: number | null;
  onMinChange?: (value: number | null) => void;
  currency?: string;
  // Optional prefix shown before the value on the same line, e.g. "Budget?"
  // so the header reads "Budget? £200." / "Budget? Baller."
  label?: string;
  // Tighter type + track for screens that need a smaller footprint
  // (e.g. Find a Wine Pairing). Default keeps the full-size layout.
  compact?: boolean;
}

export function BudgetSlider({ value, onChange, minValue, onMinChange, currency, label, compact }: Props) {
  // Track index locally during drag so the slider doesn't fight the
  // controlled `value` prop (each parent update would otherwise force the
  // thumb back and break the gesture). Commit upstream on release.
  const [localIndex, setLocalIndex] = useState(() => valueToIndex(value));
  const [localMinIndex, setLocalMinIndex] = useState(() => minValueToIndex(minValue ?? null));

  useEffect(() => { setLocalIndex(valueToIndex(value)); }, [value]);
  useEffect(() => { setLocalMinIndex(minValueToIndex(minValue ?? null)); }, [minValue]);

  const current = VALUES[localIndex];
  const atMax = current === null;
  const minCurrent = MIN_VALUES[localMinIndex];
  const sym = currencySymbol(currency);
  const rangeMode = !!onMinChange;

  const maxText = atMax ? 'Baller' : `${sym}${current}`;
  // Header: single mode → "£200." ; range mode → "Up to £200." / "£50 – £200."
  const headerValue = !rangeMode
    ? `${maxText}.`
    : minCurrent == null
      ? `Up to ${maxText}.`
      : `${sym}${minCurrent} – ${maxText}.`;

  return (
    <View style={{ width: '100%' }}>
      <Text style={[styles.value, compact && styles.valueCompact]}>
        {label ? `${label}  ` : ''}
        {/* The budget value is always an active selection (Baller is the
            default), so it reads gold from the start. */}
        <Text style={styles.valueConfirmed}>{headerValue}</Text>
      </Text>

      {rangeMode ? (
        <>
          <Text style={[styles.rangeLabel, compact && styles.labelCompact]}>Minimum</Text>
          <Slider
            style={compact ? styles.sliderCompact : undefined}
            minimumValue={0}
            maximumValue={MIN_MAX_INDEX}
            step={1}
            value={localMinIndex}
            onValueChange={(i) => setLocalMinIndex(Math.round(i))}
            onSlidingComplete={(i) => onMinChange?.(MIN_VALUES[Math.round(i)])}
            minimumTrackTintColor="rgba(255,255,255,0.80)"
            maximumTrackTintColor="rgba(255,255,255,0.20)"
            thumbTintColor="#FFFFFF"
          />
          <View style={styles.labels}>
            <Text style={[styles.label, compact && styles.labelCompact]}>No min</Text>
            <Text style={[styles.label, compact && styles.labelCompact]}>{sym}950</Text>
          </View>
          <Text style={[styles.rangeLabel, compact && styles.labelCompact, { marginTop: spacing.sm }]}>Maximum</Text>
        </>
      ) : null}

      <Slider
        style={compact ? styles.sliderCompact : undefined}
        minimumValue={0}
        maximumValue={MAX_INDEX}
        step={1}
        value={localIndex}
        onValueChange={(i) => setLocalIndex(Math.round(i))}
        onSlidingComplete={(i) => onChange(VALUES[Math.round(i)])}
        minimumTrackTintColor="rgba(255,255,255,0.80)"
        maximumTrackTintColor="rgba(255,255,255,0.20)"
        thumbTintColor="#FFFFFF"
      />
      <View style={styles.labels}>
        <Text style={[styles.label, compact && styles.labelCompact]}>{sym}20</Text>
        <Text style={[styles.label, compact && styles.labelCompact]}>Baller</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontFamily: fonts.headingSemibold,
    fontSize: 17,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  valueConfirmed: {
    color: colors.gold,
  },
  // Compact variant — smaller value text + shorter native track.
  valueCompact: {
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  sliderCompact: {
    height: 28,
  },
  // "Minimum" / "Maximum" sub-labels in range mode.
  rangeLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  label: {
    fontFamily: fonts.bodySemibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  labelCompact: {
    fontSize: 12,
  },
});
