import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fontsSpectral as fonts } from '../constants/fonts';

// The full-screen percentage "calculator" used while Vinster values / updates a
// batch of wines — a big % with an "N of M" count. Shared by Cellar Stats and
// the Full Cellar List so both flows look identical.
export function IntelProgress({
  done, total,
  title = 'Updating wine intel…',
  subtitle = 'This can take up to a minute.',
}: { done: number; total: number; title?: string; subtitle?: string }) {
  const pctVal = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <View style={styles.center}>
      <Text style={styles.calcTitle}>{title}</Text>
      <Text style={styles.calcSubtitle}>{subtitle}</Text>
      <Text style={styles.calcPercent}>{pctVal}%</Text>
      <Text style={styles.calcCount}>{done} of {total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  calcTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  calcSubtitle: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  calcPercent: { fontFamily: fonts.bodyBold, fontSize: 56, color: colors.gold, marginBottom: spacing.xs },
  calcCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
});
