import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { STYLE_PROFILES } from '../../constants/styleProfiles';
import { colors, spacing } from '../../constants/theme';

interface Props {
  selected: string[];
  onChange: (profiles: string[]) => void;
}

export function StylePicker({ selected, onChange }: Props) {
  function toggle(id: string) {
    onChange(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]
    );
  }

  return (
    <View style={styles.wrap}>
      {STYLE_PROFILES.map((profile) => {
        const active = selected.includes(profile.id);
        return (
          <TouchableOpacity
            key={profile.id}
            style={[styles.chip, active && styles.chipActive]}
            onPress={() => toggle(profile.id)}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{profile.label}</Text>
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.burgundy,
    borderColor: colors.burgundy,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
