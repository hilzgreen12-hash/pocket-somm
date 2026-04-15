import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { spacing } from '../../constants/theme';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

const MAX = 500;

export function BudgetSlider({ value, onChange }: Props) {
  const current = value ?? 20;
  const atMax = current >= MAX;

  return (
    <View>
      <Text style={styles.value}>
        {atMax ? 'No limit' : `Up to £${current}`}
      </Text>
      <Slider
        minimumValue={20}
        maximumValue={MAX}
        step={5}
        value={current}
        onValueChange={(v) => onChange(v >= MAX ? null : v)}
        minimumTrackTintColor="rgba(255,255,255,0.80)"
        maximumTrackTintColor="rgba(255,255,255,0.20)"
        thumbTintColor="#FFFFFF"
      />
      <View style={styles.labels}>
        <Text style={styles.label}>£20</Text>
        <Text style={styles.label}>No limit</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
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
