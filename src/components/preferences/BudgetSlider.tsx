import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, type LayoutChangeEvent } from 'react-native';
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

// Minimum runs on the SAME scale as the maximum. Index 0 (the far-left stop)
// means "no minimum"; anything above raises the floor. Baller (null) is never a
// minimum, so the min thumb tops out one stop below the max thumb.
function minValueToIndex(value: number | null): number {
  if (value == null) return 0;
  return valueToIndex(value);
}

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  // Optional MINIMUM budget. When onMinChange is provided, the SAME slider gains
  // a second dot for the minimum so a range can be set on one scale. minValue
  // null = no minimum.
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

const THUMB = 24;

// Two-thumb range track (min + max on one scale), built on PanResponder since
// @react-native-community/slider is single-thumb. Only used in range mode.
function RangeTrack({ minIndex, maxIndex, setMinIndex, setMaxIndex, commitMin, commitMax, compact }: {
  minIndex: number; maxIndex: number;
  setMinIndex: (i: number) => void; setMaxIndex: (i: number) => void;
  commitMin: (i: number) => void; commitMax: (i: number) => void;
  compact?: boolean;
}) {
  const [width, setWidth] = useState(0);
  // Refs so the (once-created) PanResponders read live geometry + indices.
  const wRef = useRef(0); wRef.current = width;
  const minRef = useRef(minIndex); minRef.current = minIndex;
  const maxRef = useRef(maxIndex); maxRef.current = maxIndex;
  const startRef = useRef(0);

  const usable = Math.max(1, width - THUMB);
  const xFor = (i: number) => (i / MAX_INDEX) * usable;
  const idxFromDx = (start: number, dx: number) => {
    const stepW = Math.max(1, wRef.current - THUMB) / MAX_INDEX;
    return Math.round(start + dx / stepW);
  };

  const minPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = minRef.current; },
    onPanResponderMove: (_e, g) => {
      // Min can't pass the max thumb, and never reaches Baller (MAX_INDEX).
      const idx = Math.max(0, Math.min(maxRef.current, MAX_INDEX - 1, idxFromDx(startRef.current, g.dx)));
      setMinIndex(idx);
    },
    onPanResponderRelease: () => commitMin(minRef.current),
    onPanResponderTerminate: () => commitMin(minRef.current),
  })).current;

  const maxPan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { startRef.current = maxRef.current; },
    onPanResponderMove: (_e, g) => {
      const idx = Math.max(minRef.current, Math.min(MAX_INDEX, idxFromDx(startRef.current, g.dx)));
      setMaxIndex(idx);
    },
    onPanResponderRelease: () => commitMax(maxRef.current),
    onPanResponderTerminate: () => commitMax(maxRef.current),
  })).current;

  const H = compact ? 32 : 40;
  const thumbTop = (H - THUMB) / 2;

  return (
    <View
      style={{ height: H, justifyContent: 'center' }}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
    >
      {/* Background rail */}
      <View style={styles.rail} />
      {/* Active range fill between the two dots */}
      <View style={[styles.railFill, { left: xFor(minIndex) + THUMB / 2, width: Math.max(0, xFor(maxIndex) - xFor(minIndex)) }]} />
      {/* Min dot */}
      <View {...minPan.panHandlers} style={[styles.thumb, { left: xFor(minIndex), top: thumbTop }]} />
      {/* Max dot */}
      <View {...maxPan.panHandlers} style={[styles.thumb, { left: xFor(maxIndex), top: thumbTop }]} />
    </View>
  );
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
  // Index 0 on the shared scale = "no minimum".
  const minCurrent = localMinIndex === 0 ? null : VALUES[localMinIndex];
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
        <RangeTrack
          minIndex={localMinIndex}
          maxIndex={localIndex}
          setMinIndex={setLocalMinIndex}
          setMaxIndex={setLocalIndex}
          commitMin={(i) => onMinChange?.(i === 0 ? null : VALUES[i])}
          commitMax={(i) => onChange(VALUES[i])}
          compact={compact}
        />
      ) : (
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
      )}
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
  // Custom two-thumb range track.
  rail: { position: 'absolute', left: THUMB / 2, right: THUMB / 2, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.20)' },
  railFill: { position: 'absolute', height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.80)' },
  thumb: { position: 'absolute', width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 3 },
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
