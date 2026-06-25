import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  visible: boolean;
  initialName: string;
  title?: string;
  saving?: boolean;
  onSave: (name: string) => void;
  onClose: () => void;
}

// Small shared rename sheet — a single name field + Save. Used by the rack and
// cellar-list filter long-press menus so renaming feels identical in both.
export function RenameModal({ visible, initialName, title = 'Rename', saving, onSave, onClose }: Props) {
  const [name, setName] = useState(initialName);
  useEffect(() => { if (visible) setName(initialName); }, [visible, initialName]);
  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor={colors.textMuted}
            autoFocus
            selectTextOnFocus
          />
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            disabled={!canSave}
            onPress={() => onSave(name.trim())}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%', maxWidth: 420 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
