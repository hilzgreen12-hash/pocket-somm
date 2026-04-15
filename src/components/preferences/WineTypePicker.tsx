import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

export type WineType = 'red' | 'white' | 'rose' | 'sparkling' | 'any';

const WINE_TYPES: { id: WineType; label: string }[] = [
  { id: 'red',       label: 'Red' },
  { id: 'white',     label: 'White' },
  { id: 'rose',      label: 'Rosé' },
  { id: 'sparkling', label: 'Sparkling' },
  { id: 'any',       label: 'No preference' },
];

interface Props {
  selected: WineType;
  onChange: (type: WineType) => void;
}

export function WineTypePicker({ selected, onChange }: Props) {
  return (
    <View>
      {WINE_TYPES.map((type) => {
        const active = selected === type.id;
        return (
          <TouchableOpacity
            key={type.id}
            style={styles.row}
            onPress={() => onChange(type.id)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 10,
  },
  label: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: 'rgba(255,255,255,0.40)',
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
