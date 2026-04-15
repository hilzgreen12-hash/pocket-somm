import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface Props {
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  activeColor?: string;
}

export function ChipPicker({ options, selected, onChange, activeColor = colors.burgundy }: Props) {
  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((s) => s !== value)
        : [...selected, value]
    );
  }

  return (
    <View style={styles.wrap}>
      {options.map((option) => {
        const active = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.chip,
              active && { backgroundColor: activeColor + '22', borderColor: activeColor },
            ]}
            onPress={() => toggle(option)}
          >
            <Text style={[styles.chipText, active && { color: activeColor, fontWeight: '600' }]}>
              {option}
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
  chipText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
