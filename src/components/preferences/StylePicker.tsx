import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STYLE_PROFILES } from '../../constants/styleProfiles';
import { spacing } from '../../constants/theme';

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
    <View>
      {STYLE_PROFILES.map((profile) => {
        const active = selected.includes(profile.id);
        return (
          <TouchableOpacity
            key={profile.id}
            style={styles.row}
            onPress={() => toggle(profile.id)}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {profile.label}
            </Text>
            <Text style={styles.description}>{profile.description}</Text>
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
    marginBottom: 2,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  description: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.22)',
    lineHeight: 16,
  },
});
