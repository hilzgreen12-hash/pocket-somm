import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors, spacing } from '../../constants/theme';

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
}

export function BudgetSlider({ value, onChange }: Props) {
  const unknown = value === null;

  return (
    <View>
      <View style={styles.header}>
        <Text style={styles.value}>
          {unknown ? 'No limit' : `Up to £${value}`}
        </Text>
        <TouchableOpacity
          style={[styles.unknownBtn, unknown && styles.unknownBtnActive]}
          onPress={() => onChange(unknown ? 100 : null)}
        >
          <Text style={[styles.unknownText, unknown && styles.unknownTextActive]}>
            I don't know
          </Text>
        </TouchableOpacity>
      </View>

      {!unknown && (
        <>
          <Slider
            minimumValue={20}
            maximumValue={500}
            step={5}
            value={value ?? 100}
            onValueChange={(v) => onChange(v)}
            minimumTrackTintColor={colors.burgundy}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.burgundy}
          />
          <View style={styles.labels}>
            <Text style={styles.label}>£20</Text>
            <Text style={styles.label}>£500+</Text>
          </View>
        </>
      )}

      {unknown && (
        <Text style={styles.unknownHint}>
          We'll recommend the best value wine regardless of price
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.burgundy,
  },
  unknownBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unknownBtnActive: {
    borderColor: colors.burgundy,
    backgroundColor: colors.burgundy + '12',
  },
  unknownText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  unknownTextActive: {
    color: colors.burgundy,
    fontWeight: '600',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
  },
  unknownHint: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
});
