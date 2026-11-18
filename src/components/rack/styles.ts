import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// The centred pop-up sheet every rack/fridge modal uses (how many, where to,
// edit the rack), so they all look the same.
export const sheet = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  // Cormorant — pop-up title
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — pop-up body
  body: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  // Inter — the number input
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 20, fontFamily: fonts.bodySemibold, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', width: 96, alignSelf: 'center', marginBottom: spacing.md },
  // Inter — the text input (rack name)
  textInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  // Inter — form label
  fieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  confirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  confirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  secondaryText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  cancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Inter — cancel link (not a button)
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  busy: { opacity: 0.6 },
});
