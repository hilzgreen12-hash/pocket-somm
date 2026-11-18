import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Styles shared by the bin screen and its pop-ups.
export const binStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  sheetLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  emptyList: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.16)' },
  checkboxTick: { fontSize: 13, color: colors.gold, fontFamily: fonts.bodySemibold },
  wineRowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cubbyTag: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.gold, borderWidth: 1, borderColor: colors.gold, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1, overflow: 'hidden' },
  wineName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text, flexShrink: 1 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingTop: spacing.md },
  cancelBtnText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
