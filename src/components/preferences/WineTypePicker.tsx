import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

export type WineType = 'red' | 'white' | 'rose' | 'sparkling';

const WINE_TYPES: { id: WineType; label: string }[] = [
  { id: 'red',       label: 'Red' },
  { id: 'white',     label: 'White' },
  { id: 'rose',      label: 'Rosé' },
  { id: 'sparkling', label: 'Sparkling' },
];

interface Props {
  selected: WineType[];
  onChange: (types: WineType[]) => void;
  max?: number;
}

export function WineTypePicker({ selected, onChange, max = 4 }: Props) {
  const anyActive = selected.length === 0;

  function toggle(id: WineType) {
    if (selected.includes(id)) {
      onChange(selected.filter((t) => t !== id));
    } else if (selected.length < max) {
      onChange([...selected, id]);
    }
  }

  return (
    <View>
      <TouchableOpacity style={styles.row} onPress={() => onChange([])}>
        <Text style={[styles.label, anyActive && styles.labelActive]}>Any</Text>
        {anyActive && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      {WINE_TYPES.map((type) => {
        const active = selected.includes(type.id);
        return (
          <TouchableOpacity
            key={type.id}
            style={styles.row}
            onPress={() => toggle(type.id)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {type.label}
            </Text>
            {active && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  labelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: colors.gold,
  },
});
