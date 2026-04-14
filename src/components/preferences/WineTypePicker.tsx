import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'any';

const WINE_TYPES: { id: WineType; label: string; emoji: string }[] = [
  { id: 'red', label: 'Red', emoji: '🍷' },
  { id: 'white', label: 'White', emoji: '🥂' },
  { id: 'rose', label: 'Rosé', emoji: '🌸' },
  { id: 'sparkling', label: 'Sparkling', emoji: '✨' },
  { id: 'any', label: 'Any', emoji: '🍾' },
];

interface Props {
  selected: WineType;
  onChange: (type: WineType) => void;
}

export function WineTypePicker({ selected, onChange }: Props) {
  return (
    <View style={styles.row}>
      {WINE_TYPES.map((type) => {
        const active = selected === type.id;
        return (
          <TouchableOpacity
            key={type.id}
            style={[styles.tile, active && styles.tileActive]}
            onPress={() => onChange(type.id)}
          >
            <Text style={styles.emoji}>{type.emoji}</Text>
            <Text style={[styles.label, active && styles.labelActive]}>{type.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  tile: {
    flex: 1,
    minWidth: 56,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tileActive: {
    borderColor: colors.burgundy,
    backgroundColor: colors.burgundy + '12',
  },
  emoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text,
  },
  labelActive: {
    color: colors.burgundy,
    fontWeight: '700',
  },
});
