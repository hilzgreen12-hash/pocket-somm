import { Modal, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useUpdatePrompt } from '../hooks/useUpdatePrompt';
import { storeUrl } from '../constants/appStore';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Soft "a new version is available" prompt shown once per new store release.
// Dismissible ("Later") — never a hard gate. Mounted globally in the root layout.
export function UpdatePromptModal() {
  const { show, latest, dismiss } = useUpdatePrompt();

  function openStore() {
    Linking.openURL(storeUrl()).catch(() => {});
    dismiss();
  }

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={dismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>A new version of Vinster is available</Text>
          <Text style={styles.body}>
            {latest ? `Update to version ${latest} for the latest features and fixes.` : 'Update for the latest features and fixes.'}
          </Text>
          <TouchableOpacity style={styles.updateBtn} onPress={openStore} activeOpacity={0.85}>
            <Text style={styles.updateText}>Update</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterBtn} onPress={dismiss} activeOpacity={0.7}>
            <Text style={styles.laterText}>Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { width: '100%', maxWidth: 400, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.sm },
  body: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 21, marginBottom: spacing.lg },
  updateBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', backgroundColor: colors.surface },
  updateText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  laterBtn: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xs },
  laterText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted, letterSpacing: 0.3 },
});
