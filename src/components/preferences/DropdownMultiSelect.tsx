import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface Props {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (values: string[]) => void;
  max?: number;
  noneLabel?: string;
  hint?: string;
  customAddPlaceholder?: string;
}

// Bordered row + ▾ arrow that opens an app-styled modal of checkable options.
// Mirrors the dropdown UX used on the Chef "Review Recipe Requirements"
// screen so the profile preferences feel consistent with it.

export function DropdownMultiSelect({ label, options, selected, onChange, max, noneLabel = 'None selected', hint, customAddPlaceholder }: Props) {
  const [open, setOpen] = useState(false);
  const [customDraft, setCustomDraft] = useState('');

  const summary = selected.length === 0
    ? noneLabel
    : selected.length <= 2
      ? selected.join(', ')
      : `${selected.length} selected`;

  function toggle(option: string) {
    if (selected.includes(option)) {
      onChange(selected.filter((v) => v !== option));
    } else if (!max || selected.length < max) {
      onChange([...selected, option]);
    }
  }

  function handleAddCustom() {
    const trimmed = customDraft.trim();
    if (!trimmed) return;
    if (selected.includes(trimmed)) { setCustomDraft(''); return; }
    if (max && selected.length >= max) return;
    onChange([...selected, trimmed]);
    setCustomDraft('');
  }

  // Surface user-added custom values that aren't in the canonical option list
  // so the user can see and toggle them off if needed.
  const customSelections = selected.filter((s) => !options.includes(s));
  const atMax = !!max && selected.length >= max;

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.select} activeOpacity={0.7} onPress={() => setOpen(true)}>
        <Text style={[styles.selectValue, selected.length === 0 && styles.selectValueMuted]} numberOfLines={1}>{summary}</Text>
        <Text style={styles.selectArrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>{label}</Text>
            {hint ? <Text style={styles.modalHint}>{hint}</Text> : null}

            <ScrollView style={{ maxHeight: 420 }}>
              {customSelections.map((opt) => (
                <TouchableOpacity
                  key={`custom-${opt}`}
                  style={[styles.modalOption, styles.modalOptionActive]}
                  onPress={() => toggle(opt)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalOptionText, styles.modalOptionTextActive]}>{opt}</Text>
                  <Text style={styles.modalOptionCheck}>✓</Text>
                </TouchableOpacity>
              ))}
              {options.map((opt) => {
                const active = selected.includes(opt);
                const optAtMax = !!max && selected.length >= max && !active;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.modalOption, active && styles.modalOptionActive, optAtMax && { opacity: 0.4 }]}
                    onPress={() => toggle(opt)}
                    disabled={optAtMax}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt}</Text>
                    {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {customAddPlaceholder ? (
              <View style={styles.customRow}>
                <TextInput
                  style={styles.customInput}
                  placeholder={customAddPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={customDraft}
                  onChangeText={setCustomDraft}
                  onSubmitEditing={handleAddCustom}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[styles.customAdd, (!customDraft.trim() || atMax) && { opacity: 0.35 }]}
                  onPress={handleAddCustom}
                  disabled={!customDraft.trim() || atMax}
                >
                  <Text style={styles.customAddText}>Add</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity style={styles.doneButton} onPress={() => setOpen(false)}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  select: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, backgroundColor: colors.surface, marginBottom: spacing.lg },
  selectValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text, flex: 1 },
  selectValueMuted: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' },
  selectArrow: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  modalHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  doneButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  doneButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  customInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  customAdd: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 8, paddingHorizontal: spacing.md },
  customAddText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold },
});
