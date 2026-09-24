import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PairMasthead } from '../../src/components/PairMasthead';
import { useConsultStore } from '../../src/stores/consultStore';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Sommelier Consult — the answer to a "help me choose between these wines for
// this dish" voice request from the Discover tab. Reads useConsultStore.
export default function ConsultScreen() {
  const { question, advice } = useConsultStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80, paddingTop: 56 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backLink}>←</Text>
      </TouchableOpacity>

      <PairMasthead
        eyebrow="Sommelier Consult"
        sub="Vinster's pick for the moment"
        title={question ? `“${question}”` : 'Sommelier Consult'}
      />

      {advice ? (
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.adviceLabel}>Vinster's Advice</Text>
            <Text style={styles.advice}>{advice}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Ask Vinster to help you choose — name the wines you're deciding between and what you're eating.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backLink: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, padding: spacing.lg },
  adviceLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  advice: { fontFamily: fonts.headingRegular, fontSize: 18, color: colors.text, lineHeight: 27 },
  empty: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  emptyText: { fontFamily: fonts.headingRegular, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23 },
});
