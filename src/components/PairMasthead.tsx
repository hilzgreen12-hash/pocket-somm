import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Elegant editorial masthead for the Pair result screens (recipe suggestions and
// wine-pairing suggestions), mirroring the "Dive Deeper" / Wine Knowledge header:
// a spaced-caps eyebrow, an italic attribution line, a centred ◇ rule, then the
// subject (the wine, or the dish) with an optional gold meta line and a short
// note, closed by a short gold divider.
//
//   eyebrow  — what this is ("Recipe Pairings")
//   sub      — italic attribution ("from Vinster's Kitchen")
//   title    — the subject, shown in white (the wine identity, or the dish)
//   meta     — a gold detail line (region, or "Select from Cellar")
//   note     — a short white summary line (the brief)
export function PairMasthead({
  eyebrow,
  sub,
  title,
  meta,
  note,
}: {
  eyebrow: string;
  sub?: string | null;
  title: string;
  meta?: string | null;
  note?: string | null;
}) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}

      <View style={styles.ruleRow}>
        <View style={styles.rule} />
        <Text style={styles.ruleMark}>◇</Text>
        <View style={styles.rule} />
      </View>

      <Text style={styles.title}>{title}</Text>
      {meta ? <Text style={styles.meta}>{meta}</Text> : null}
      {note ? <Text style={styles.note}>{note}</Text> : null}

      <View style={styles.shortDivider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, alignItems: 'center' },
  eyebrow: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' },
  sub: { fontFamily: fonts.headingItalic, fontSize: 14, color: 'rgba(224,184,74,0.75)', textAlign: 'center', marginTop: 4 },
  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.md, marginBottom: spacing.md },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.45)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm },
  title: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', lineHeight: 32, letterSpacing: 0.3 },
  meta: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginTop: spacing.xs },
  note: { fontFamily: fonts.bodyItalic, fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, marginTop: spacing.sm },
  shortDivider: { width: 40, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', alignSelf: 'center', marginTop: spacing.lg, marginBottom: spacing.xs },
});
