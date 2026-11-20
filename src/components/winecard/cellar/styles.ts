import { StyleSheet } from 'react-native';
import { colors, spacing } from '../../../constants/theme';
import { fonts } from '../../../constants/fonts';

// The cellar wine card's own styles. Its shared visual language (tabs, facts
// bar, cards, rows, tables) is `wc` in ../wcStyles, as on the Wine Intel screen.
export const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },

  // "Wine has been removed from your records", shown briefly after a delete.
  toastOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  toastSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  toastTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, lineHeight: 28 },

  // "/75cl" after a value: same size and font as the figure, in white.
  per75: { color: colors.text },
  factsHint: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginTop: 8 },
  statValueMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  // "Generate" inside a section that has nothing yet.
  generateBtn: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.xs, paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  generateBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },

  // The Inside Line and the producer range.
  insiderTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  insiderBody: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 23 },
  diveDeeperLink: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: spacing.sm },
  rangeHint: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.sm },
  rangeLoadingText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rangeRowThis: { backgroundColor: 'rgba(212,176,96,0.10)', borderRadius: 8, paddingHorizontal: spacing.sm, borderBottomColor: 'transparent' },
  rangeRowMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.xs },
  rangeMarker: { fontSize: 14, color: colors.gold, width: 14, textAlign: 'center' },
  rangeMarkerHidden: { opacity: 0 },
  rangeName: { flex: 1, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  rangeNameThis: { fontFamily: fonts.bodySemibold, color: colors.gold },
  rangeRight: { alignItems: 'flex-end' },
  rangeBand: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted, letterSpacing: 1 },
  rangeBandThis: { color: colors.gold },
  rangeTier: { fontSize: 10, fontFamily: fonts.bodyRegular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  rangeSummary: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 21, marginTop: spacing.md },

  // Market tab.
  statAction: { fontSize: 12, fontFamily: fonts.headingSemibold, color: colors.gold, marginTop: 4 },
  statCancel: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  statInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginTop: 2 },
  statActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  estimateUpdateLink: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  vintageFootnote: { fontSize: 11, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  verdictPoint: { fontFamily: fonts.bodyRegular, fontSize: 14.5, color: colors.text, lineHeight: 22 },
  verdictPointGold: { fontFamily: fonts.bodySemibold, color: colors.gold },
  // The written market & vintage note: one soft bubble, titles in gold.
  servingBubble: { backgroundColor: 'rgba(224,184,74,0.06)', borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.lg },
  servingLine: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 22, marginBottom: spacing.md },
  servingTitle: { fontFamily: fonts.bodySemibold, color: colors.gold },
  marketMissingNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.md },

  // Cellar tab: the commands under Bottles in My Cellar, a point larger than
  // other actions, below a rule separating them from the locations.
  cellarCommand: { fontSize: 14.5, marginTop: 6 },
  cellarCommandRule: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 6, marginBottom: 2 },
  // The recommended temperature, stacked under its label (a row runs off narrow screens).
  tempBar: { flexDirection: 'column', alignItems: 'flex-start', gap: 2 },

  // An archived wine's card: one page under a large "Archived Wine" heading
  // (the tab pages' title family) and a short faded-gold rule.
  archivedHeading: { fontSize: 32, fontFamily: fonts.headingBold, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center', marginTop: spacing.lg },
  archivedRule: { width: 120, height: 1, backgroundColor: colors.gold, opacity: 0.6, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },

  // Buttons at the foot of the card.
  exportBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.md },
  exportBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  archivedDeleteBtn: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  chefBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  buttonDisabled: { opacity: 0.6 },

  // Archive or Delete — a bottom sheet.
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border },
  bottomSheetTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, marginBottom: 2 },
  bottomSheetWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  fieldLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  noteHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: -2, marginBottom: spacing.sm },
  sheetBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  sheetBtnSecond: { marginTop: spacing.sm },
  sheetBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  sheetCancel: { alignItems: 'center', marginTop: spacing.md },
  sheetCancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },

  // Centred sheets: destination pickers, "How many bottles?", the archive-entry note.
  cnOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  cnSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  cnHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cnCloseText: { fontFamily: fonts.bodyRegular, fontSize: 20, color: colors.textMuted },
  cnTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  cnBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.md },
  cnWineLine: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cnInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface, minHeight: 52, textAlignVertical: 'top' },
  cnCount: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, textAlign: 'right', marginTop: 4 },
  cnSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  cnSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  cnCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  // White, not red: cancelling or deleting a short note isn't worth an alarm colour.
  cnDeleteText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#FFFFFF' },
  destRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 48, borderBottomWidth: 1, borderBottomColor: colors.border },
  destName: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  destType: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted },

  // "Confirm this wine" grape prompt — mirrors the scan flow's confirm popup.
  candOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  candSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%', maxWidth: 440 },
  candTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  candBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  candRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  candCheck: { fontSize: 24, color: colors.textMuted, width: 28, textAlign: 'center' },
  candCheckOn: { color: colors.gold },
  candRowText: { flex: 1 },
  candItemName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  candItemMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  candConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  candConfirmBtnDisabled: { opacity: 0.4 },
  candConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },

  // Off-screen while the Export Wine Intel card is captured.
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
