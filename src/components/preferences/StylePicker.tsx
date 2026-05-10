import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STYLE_PROFILES } from '../../constants/styleProfiles';

const MAX = 5;

interface Props {
  selected: string[];
  onChange: (profiles: string[]) => void;
}

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
      <TouchableOpacity style={styles.row} onPress={selectAny} activeOpacity={0.6}>
        <View style={styles.rowInner}>
          <Text style={[styles.label, anyActive && styles.labelActive]}>Any</Text>
          {anyActive && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
      {STYLE_PROFILES.map((profile) => {
        const active = local.includes(profile.id);
        const atMax = local.length >= MAX && !active;
        return (
          <TouchableOpacity
            key={profile.id}
            style={[styles.row, atMax && { opacity: 0.35 }]}
            onPress={() => toggle(profile.id)}
            activeOpacity={0.6}
            disabled={atMax}
          >
            <View style={styles.rowInner}>
              <Text style={[styles.label, active && styles.labelActive]}>
                {profile.label}
              </Text>
              {active && <Text style={styles.checkmark}>✓</Text>}
            </View>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  rowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  labelActive: {
    color: '#FFFFFF',
  },
  checkmark: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  description: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 16,
  },
});
