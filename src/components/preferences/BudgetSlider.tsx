import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { spacing } from '../../constants/theme';
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

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  currency?: string;
  // Optional prefix shown before the value on the same line, e.g. "Budget?"
  // so the header reads "Budget? £200." / "Budget? Baller."
  label?: string;
}

export function BudgetSlider({ value, onChange, currency, label }: Props) {
  // Track index locally during drag so the slider doesn't fight the
  // controlled `value` prop (each parent update would otherwise force the
  // thumb back and break the gesture). Commit upstream on release.
  const [localIndex, setLocalIndex] = useState(() => valueToIndex(value));

  useEffect(() => {
    setLocalIndex(valueToIndex(value));
  }, [value]);

  const current = VALUES[localIndex];
  const atMax = current === null;
  const sym = currencySymbol(currency);

  return (
    <View style={{ width: '100%' }}>
      <Text style={styles.value}>
        {label ? `${label} ` : ''}{atMax ? 'Baller' : `${sym}${current}`}.
      </Text>
      <Slider
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
        <Text style={styles.label}>{sym}20</Text>
        <Text style={styles.label}>Baller</Text>
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
});
