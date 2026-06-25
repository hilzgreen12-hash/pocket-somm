import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shared "couldn't generate intel" prompt. Shown when Vinster produces no
// critic score and no value for a wine — almost always a misspelt name or the
// producer/name in the wrong order. Used by both the saved wine card and the
// Cellar → Generate Wine Intel view so the guidance is identical everywhere.

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onEdit: () => void;
  // Label for the primary action (e.g. "Edit Wine" on the card, "Check details"
  // on the Generate Wine Intel view).
  editLabel?: string;
}

export function NoIntelPrompt({ visible, onDismiss, onEdit, editLabel = 'Edit Wine' }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Couldn’t generate intel</Text>
          <Text style={styles.body}>
            Vinster was unable to generate intel for this wine. Please make sure the wine is spelled
            correctly and input in the correct format:
          </Text>
          <Text style={styles.format}>Producer - Wine Name - Vintage</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onDismiss}>
              <Text style={styles.cancel}>Dismiss</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
              <Text style={styles.editText}>{editLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', gap: spacing.sm },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  format: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, textAlign: 'center', marginVertical: spacing.xs },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  cancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  editBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  editText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
