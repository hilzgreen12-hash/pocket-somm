import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STYLE_PROFILES } from '../../constants/styleProfiles';
import { colors, spacing } from '../../constants/theme';

const MAX = 5;

interface Props {
  selected: string[];
  onChange: (profiles: string[]) => void;
}

// Full-width chip picker — each style sits in its own bubble with the
// label and description stacked inside. Active state is the same gold
// border + gold-tinted fill used on the wine-type picker, so the two
// selectors feel like one family. Tick removed; the bubble is its own
// indicator.
export function StylePicker({ selected, onChange }: Props) {
  const [local, setLocal] = useState(selected);

  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  const anyActive = local.length === 0;

  function selectAny() {
    setLocal([]);
    onChange([]);
  }

  function toggle(id: string) {
    if (local.includes(id)) {
      const next = local.filter((s) => s !== id);
      setLocal(next);
      onChange(next);
    } else if (local.length < MAX) {
      const next = [...local, id];
      setLocal(next);
      onChange(next);
    }
  }

  return (
    <View>
      <TouchableOpacity
        style={[styles.chip, anyActive && styles.chipActive]}
        onPress={selectAny}
        activeOpacity={0.7}
      >
        <Text style={[styles.label, anyActive && styles.labelActive]}>Any</Text>
      </TouchableOpacity>
      {STYLE_PROFILES.map((profile) => {
        const active = local.includes(profile.id);
        const atMax = local.length >= MAX && !active;
        return (
          <TouchableOpacity
            key={profile.id}
            style={[styles.chip, active && styles.chipActive, atMax && { opacity: 0.35 }]}
            onPress={() => toggle(profile.id)}
            activeOpacity={0.7}
            disabled={atMax}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {profile.label}
            </Text>
            <Text style={[styles.description, active && styles.descriptionActive]}>
              {profile.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Bubble matches WineTypePicker's chip styling, just full-width so it
  // can carry label + description on two lines.
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.sm,
  },
  chipActive: {
    borderColor: colors.gold,
    backgroundColor: colors.gold + '22',
  },
  label: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 17,
    color: '#FFFFFF',
  },
  labelActive: {
    color: colors.gold,
  },
  description: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    lineHeight: 19,
  },
  descriptionActive: {
    color: colors.gold,
    opacity: 0.85,
  },
});
