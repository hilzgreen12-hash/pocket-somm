import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "Vinster's Note" heading + a tappable "(what's this)" explainer.
// Shared by the Wine Intel results screen and the cellar wine card so
// the label and the explainer copy live in one place.
export const VINSTERS_NOTE_EXPLAINER =
  "Vinster's notes aren't lifted from any single review. Hundreds of sources from across the web are sifted — critics, producers, tasting databases — distilled, and curated into one clear, reliable insight.";

// When `onToggle` is supplied, a yellow expand/collapse chevron sits after the
// title — `expanded` picks its direction (down when reduced, up when open).
// `hideExplainerLink` drops the "(what's this)" link (used where the caller shows
// the explainer inline below the note instead).
export function VinstersNoteHeading({ expanded, onToggle, hideExplainerLink }: { expanded?: boolean; onToggle?: () => void; hideExplainerLink?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>Vinster's Tasting Note</Text>
      {onToggle ? (
        <TouchableOpacity onPress={onToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>
      ) : null}
      {!hideExplainerLink ? (
        <TouchableOpacity
          onPress={() => showAlert({ title: "Vinster's Tasting Note", body: VINSTERS_NOTE_EXPLAINER })}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.whatsThis}>(what's this)</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginBottom: spacing.sm },
  title: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  chevron: { fontSize: 15, color: colors.gold, fontFamily: fonts.bodySemibold },
  whatsThis: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, textDecorationLine: 'underline' },
});
