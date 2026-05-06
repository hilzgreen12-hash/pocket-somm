import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { spacing } from '../../constants/theme';
import { currencySymbol } from '../../constants/currency';

// Build the non-linear value array
const VALUES: (number | null)[] = [
  // £20–£150 in £10 steps
  ...Array.from({ length: 14 }, (_, i) => 20 + i * 10),   // 20,30,...,150
  // £170–£450 in £20 steps
  ...Array.from({ length: 15 }, (_, i) => 170 + i * 20),  // 170,190,...,450
  // £500–£1500 in £50 steps
  ...Array.from({ length: 21 }, (_, i) => 500 + i * 50),  // 500,550,...,1500
  // No limit
  null,
];

const MAX_INDEX = VALUES.length - 1; // 50

function valueToIndex(value: number | null): number {
  if (value === null) return MAX_INDEX;
  // Find closest index
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
}

export function BudgetSlider({ value, onChange, currency }: Props) {
  const index = valueToIndex(value);
  const current = VALUES[index];
  const atMax = current === null;
  const sym = currencySymbol(currency);

  return (
    <View style={{ width: '100%' }}>
      <Text style={styles.value}>
        {atMax ? 'No limit' : `Up to ${sym}${current}`}
      </Text>
      <Slider
        minimumValue={0}
        maximumValue={MAX_INDEX}
        step={1}
        value={index}
        onValueChange={(i) => onChange(VALUES[Math.round(i)])}
        minimumTrackTintColor="rgba(255,255,255,0.80)"
        maximumTrackTintColor="rgba(255,255,255,0.20)"
        thumbTintColor="#FFFFFF"
      />
      <View style={styles.labels}>
        <Text style={styles.label}>{sym}20</Text>
        <Text style={styles.label}>No limit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
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
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.40)',
  },
});
