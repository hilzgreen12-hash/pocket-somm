import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  visible: boolean;
  title: string;
  body: string;
  busy?: boolean;
  confirmLabel?: string;
  // Total bottles the user owns of this wine (across the WHOLE cellar). When > 1
  // the modal asks how many to archive via a manual number field — no option
  // buttons. Omit / 1 → archives the single bottle.
  maxCount?: number;
  onConfirm: (count: number, note: string, date: string) => void;
  onClose: () => void;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Shared archive confirmation — consistent across every archive flow (wine card,
// Full Cellar List, rack). When the user owns more than one bottle it asks how
// many to archive (manual input), plus an optional 50-char removal note (where /
// with whom you drank it), and Save / Cancel.
export function ArchiveNoteModal({ visible, title, body, busy, confirmLabel = 'Save', maxCount = 1, onConfirm, onClose }: Props) {
  const asksCount = maxCount > 1;
  const [count, setCount] = useState('1');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayISO);
  useEffect(() => { if (visible) { setCount('1'); setNote(''); setDate(todayISO()); } }, [visible]);

  function confirm() {
    const n = asksCount ? Math.max(1, Math.min(parseInt(count, 10) || 1, maxCount)) : 1;
    onConfirm(n, note.trim(), date.trim() || todayISO());
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>

          {asksCount ? (
            <>
              <Text style={styles.label}>How many of your {maxCount} bottles?</Text>
              <TextInput
                style={styles.input}
                value={count}
                onChangeText={(t) => setCount(t.replace(/[^0-9]/g, '').slice(0, 3))}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={colors.textMuted}
                selectTextOnFocus
              />
            </>
          ) : null}

          <Text style={styles.label}>Date removed</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={(t) => setDate(t.replace(/[^0-9-]/g, '').slice(0, 10))}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.textMuted}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Text style={styles.label}>Note (optional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={(t) => setNote(t.slice(0, 50))}
            placeholder="e.g. dinner with the Smiths"
            placeholderTextColor={colors.textMuted}
            maxLength={50}
          />
          <Text style={styles.hint}>{note.length}/50 — where or with whom you drank it.</Text>

          <TouchableOpacity style={[styles.confirmBtn, busy && styles.disabled]} onPress={confirm} disabled={busy} activeOpacity={0.85}>
            {busy ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.confirmText}>{confirmLabel}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={busy}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 440 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.md },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  hint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  confirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  confirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  disabled: { opacity: 0.5 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
