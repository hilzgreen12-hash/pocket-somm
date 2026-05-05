import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface Props {
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  activeColor?: string;
  max?: number;
  listMode?: boolean;
  allOptionLabel?: string;
}

export function ChipPicker({ options, selected, onChange, activeColor = colors.gold, max, listMode, allOptionLabel }: Props) {
  const [local, setLocal] = useState(selected);

  // Sync from parent when Supabase returns updated data
  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  function toggle(value: string) {
    if (local.includes(value)) {
      const next = local.filter((s) => s !== value);
      setLocal(next);
      onChange(next);
    } else if (!max || local.length < max) {
      const next = [...local, value];
      setLocal(next);
      onChange(next);
    }
  }

  function selectAll() {
    setLocal([]);
    onChange([]);
  }

  return (
    <View style={listMode ? styles.list : styles.wrap}>
      {allOptionLabel && listMode && (
        <TouchableOpacity
          style={[styles.listItem, local.length === 0 && { backgroundColor: activeColor + '22' }]}
          onPress={selectAll}
          activeOpacity={0.6}
        >
          <Text style={[styles.chipText, local.length === 0 && { color: activeColor, fontWeight: '600' }]}>
            {allOptionLabel}
          </Text>
          {local.length === 0 && (
            <Text style={[styles.checkmark, { color: activeColor }]}>✓</Text>
          )}
        </TouchableOpacity>
      )}
      {options.map((option) => {
        const active = local.includes(option);
        const atMax = !!max && local.length >= max && !active;
        return (
          <TouchableOpacity
            key={option}
            style={[
              listMode ? styles.listItem : styles.chip,
              active && { backgroundColor: activeColor + '22', borderColor: activeColor },
              atMax && { opacity: 0.35 },
            ]}
            onPress={() => toggle(option)}
            activeOpacity={0.6}
            disabled={atMax}
          >
            <Text style={[styles.chipText, active && { color: activeColor, fontWeight: '600' }]}>
              {option}
            </Text>
            {listMode && active && (
              <Text style={[styles.checkmark, { color: activeColor }]}>✓</Text>
            )}
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
  list: {
    flexDirection: 'column',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.textMuted,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
  },
});
