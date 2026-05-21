import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STYLE_PROFILES } from '../../constants/styleProfiles';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { WineType } from '../../types/preferences';

const MAX = 5;

interface Props {
  selected: string[];
  onChange: (profiles: string[]) => void;
  // When provided AND non-empty, restricts the visible styles to those
  // whose applicableTypes intersect the selected wine types. Empty (or
  // omitted) shows all styles — matches the "Any wine type" case.
  wineTypes?: WineType[];
}

// Full-width chip picker — each style sits in its own bubble with the
// label and description stacked inside. Active state is the same gold
// border + gold-tinted fill used on the wine-type picker, so the two
// selectors feel like one family. Tick removed; the bubble is its own
// indicator.
//
// Type-aware filter: when `wineTypes` carries selections, styles that
// don't apply to any of them are hidden. The picker also prunes the
// caller's selection back through onChange when a previously-picked
// style is no longer visible — without this, a stale "Crisp Whites"
// would silently bias recommendations after the user switched to Red.
export function StylePicker({ selected, onChange, wineTypes }: Props) {
  const [local, setLocal] = useState(selected);

  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  // Visible styles for the current wine-type selection. With no wine
  // types picked (Any), every style is shown — preserves the previous
  // unfiltered behaviour for users who don't care about type.
  const visibleProfiles = useMemo(() => {
    const types = wineTypes ?? [];
    if (types.length === 0) return STYLE_PROFILES;
    return STYLE_PROFILES.filter((p) => p.applicableTypes.some((t) => types.includes(t)));
  }, [wineTypes]);

  // Prune the user's selection whenever the visible set shrinks past
  // something they had picked. Fires only when there's a real drift so
  // we don't churn parent state on every render.
  useEffect(() => {
    const visibleIds = new Set(visibleProfiles.map((p) => p.id));
    const pruned = local.filter((id) => visibleIds.has(id));
    if (pruned.length !== local.length) {
      setLocal(pruned);
      onChange(pruned);
    }
    // onChange is referentially unstable in some parents — depending
    // on it would loop. Visible set is the only trigger we care about.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleProfiles]);

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
      {visibleProfiles.map((profile) => {
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
    fontFamily: fonts.bodySemibold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  labelActive: {
    color: colors.gold,
  },
  description: {
    fontFamily: fonts.bodyRegular,
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
