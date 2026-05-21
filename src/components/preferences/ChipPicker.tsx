import { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

interface Props {
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  activeColor?: string;
  max?: number;
  listMode?: boolean;
  allOptionLabel?: string;
  // When true, renders a "+ Add other" pill at the end of the grid
  // that opens an input field beneath. Submitting adds the typed
  // value to `selected` as a custom bubble (already-saved customs
  // render alongside the canonical options as selected bubbles too).
  // Used on the onboarding region/grape dislikes so users aren't
  // capped to a fixed list.
  allowCustom?: boolean;
}

export function ChipPicker({
  options,
  selected,
  onChange,
  activeColor = colors.gold,
  max,
  listMode,
  allOptionLabel,
  allowCustom,
}: Props) {
  const [local, setLocal] = useState(selected);
  const [customDraft, setCustomDraft] = useState('');
  const [inputOpen, setInputOpen] = useState(false);

  // Sync from parent when Supabase returns updated data
  useEffect(() => {
    setLocal(selected);
  }, [selected]);

  // Anything in `selected` that isn't a canonical option is treated
  // as a user-added custom value. Renders as its own selected bubble
  // alongside the canonical ones. Filters out the legacy "Other"
  // string so it doesn't appear as a bubble for users whose
  // preferences pre-date this affordance.
  const customSelected = useMemo(() => {
    const optionSet = new Set(options as readonly string[]);
    return local.filter((v) => v !== 'Other' && !optionSet.has(v));
  }, [local, options]);

  // Canonical options to render — strips the generic "Other" entry
  // when allowCustom is on (the "+ Add other" pill replaces it).
  const visibleOptions = useMemo(() => {
    if (!allowCustom) return options;
    return options.filter((o) => o !== 'Other');
  }, [options, allowCustom]);

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

  function commitCustom() {
    const v = customDraft.trim();
    if (!v) {
      setInputOpen(false);
      return;
    }
    // Dedupe against existing selections (case-insensitive) so the
    // user can't accumulate "tannat" / "Tannat" duplicates.
    const lower = v.toLowerCase();
    const already = local.some((s) => s.toLowerCase() === lower);
    if (already || (max && local.length >= max)) {
      setCustomDraft('');
      setInputOpen(false);
      return;
    }
    const next = [...local, v];
    setLocal(next);
    onChange(next);
    setCustomDraft('');
    setInputOpen(false);
  }

  function removeCustom(value: string) {
    const next = local.filter((s) => s !== value);
    setLocal(next);
    onChange(next);
  }

  const customAtMax = !!max && local.length >= max;

  return (
    <View>
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
        {visibleOptions.map((option) => {
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

        {/* User-added custom values — always shown as selected
            bubbles. Tap to remove (matches the toggle semantics of
            the canonical options). */}
        {allowCustom && customSelected.map((value) => (
          <TouchableOpacity
            key={`custom-${value}`}
            style={[styles.chip, { backgroundColor: activeColor + '22', borderColor: activeColor }]}
            onPress={() => removeCustom(value)}
            activeOpacity={0.6}
          >
            <Text style={[styles.chipText, { color: activeColor, fontWeight: '600' }]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}

        {/* "+ Add other" pill — opens the input field below. Disabled
            while the input is already open OR the max cap is hit. */}
        {allowCustom && (
          <TouchableOpacity
            style={[styles.chip, styles.addOtherChip, (inputOpen || customAtMax) && { opacity: 0.35 }]}
            onPress={() => setInputOpen(true)}
            disabled={inputOpen || customAtMax}
            activeOpacity={0.6}
          >
            <Text style={styles.addOtherText}>+ Add other</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom input field — appears beneath the grid only when
          "+ Add other" was tapped. Commits on Enter or on tapping
          the gold "Add" button. */}
      {allowCustom && inputOpen && (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={customDraft}
            onChangeText={setCustomDraft}
            placeholder="Type and add…"
            placeholderTextColor={colors.textMuted}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={commitCustom}
            blurOnSubmit
          />
          <TouchableOpacity onPress={commitCustom} style={styles.inputAddBtn} activeOpacity={0.7}>
            <Text style={styles.inputAddBtnText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setCustomDraft(''); setInputOpen(false); }}
            style={styles.inputCancelBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.inputCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
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
  // "+ Add other" pill — dashed gold border so it reads as an
  // affordance distinct from the regular options.
  addOtherChip: {
    borderStyle: 'dashed',
    borderColor: colors.gold,
    backgroundColor: 'transparent',
  },
  addOtherText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    color: colors.gold,
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
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.textMuted,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  inputAddBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  inputAddBtnText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 15,
    color: colors.gold,
  },
  inputCancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  inputCancelText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
});
