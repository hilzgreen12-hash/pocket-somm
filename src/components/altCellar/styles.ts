import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// The centred pop-up sheet the alt cellar's modals share (cases, how many).
export const sheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  label: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  noteInput: { flex: 1, minHeight: 44, textAlignVertical: 'top' },
  hint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: spacing.xs },
  save: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  saveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancel: { alignItems: 'center', paddingTop: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
