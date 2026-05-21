import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "Vinster's Note" heading + a tappable "(what's this)" explainer.
// Shared by the Wine Intel results screen and the cellar wine card so
// the label and the explainer copy live in one place.
const EXPLAINER =
  "Vinster's notes aren't lifted from any single review. Hundreds of sources from across the web are sifted — critics, producers, tasting databases — distilled, and curated into one clear, reliable insight.";

export function VinstersNoteHeading() {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>Vinster's Note</Text>
      <TouchableOpacity
        onPress={() => showAlert({ title: "Vinster's Note", body: EXPLAINER })}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.whatsThis}>(what's this)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, marginBottom: spacing.sm },
  title: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  whatsThis: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, textDecorationLine: 'underline' },
});
