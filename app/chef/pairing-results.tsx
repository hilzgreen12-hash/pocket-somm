import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { useCellar } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';

function CellarResults({ recommendations, wines }: { recommendations: CellarRecommendation[]; wines: ReturnType<typeof useCellar>['wines'] }) {
  return (
    <>
      {recommendations.map((rec) => {
        const wine = wines.find((w) => w.id === rec.cellarWineId);
        return (
          <View key={rec.cellarWineId} style={styles.card}>
            <Text style={styles.cardWine}>{rec.wineName}</Text>
            {wine?.vintage ? <Text style={styles.cardMeta}>{wine.vintage}{wine.region ? ` · ${wine.region}` : ''}</Text> : null}
            <Text style={styles.cardRationale}>{rec.rationale}</Text>
            <View style={styles.tipRow}>
              <Text style={styles.tipLabel}>Serving tip</Text>
              <Text style={styles.tipText}>{rec.servingTip}</Text>
            </View>
          </View>
        );
      })}
    </>
  );
}

const RANK_LABELS = ['1st Choice', '2nd Choice', '3rd Choice'];

function GeneralResults({ results, summary }: { results: GeneralRecommendation[]; summary: string | null }) {
  return (
    <>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {results.map((result, i) => (
        <View key={i} style={[styles.card, i === 0 && styles.cardTop]}>
          <View style={styles.rankRow}>
            <Text style={[styles.rankBadge, i === 0 && styles.rankBadgeTop]}>{RANK_LABELS[i]}</Text>
          </View>
          <Text style={styles.cardWine}>{result.wineStyle}</Text>
          <Text style={styles.cardMeta}>{result.region}</Text>
          <Text style={styles.cardRationale}>{result.whyItWorks}</Text>

          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>What to look for</Text>
            <Text style={styles.detailText}>{result.characteristics}</Text>
          </View>

          <View style={styles.detailBlock}>
            <Text style={styles.detailLabel}>Price guide</Text>
            <Text style={styles.detailText}>{result.priceGuide}</Text>
          </View>

          {result.examples && result.examples.length > 0 && (
            <View style={styles.detailBlock}>
              <Text style={styles.detailLabel}>Examples to look for</Text>
              {result.examples.map((ex, j) => (
                <Text key={j} style={styles.exampleItem}>· {ex}</Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </>
  );
}

export default function PairingResultsScreen() {
  const { dish, mode, cellarResult, generalResult, generalSummary, reset } = useFoodPairingStore();
  const { wines } = useCellar();

  function handleBack() {
    reset();
    router.back();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={handleBack}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Your Pairing</Text>
      <Text style={styles.dish}>{dish}</Text>

      {mode === 'cellar' && cellarResult && (
        <CellarResults recommendations={cellarResult} wines={wines} />
      )}
      {mode === 'general' && generalResult && (
        <GeneralResults results={generalResult} summary={generalSummary} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60 },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xl },
  heading: { fontSize: 30, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  dish: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginBottom: spacing.xl },
  summary: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22, marginBottom: spacing.lg },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.lg, marginBottom: spacing.lg, backgroundColor: colors.surface },
  cardTop: { borderColor: colors.gold },
  rankRow: { marginBottom: spacing.xs },
  rankBadge: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  rankBadgeTop: { color: colors.gold },
  cardWine: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  cardMeta: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginBottom: spacing.sm },
  cardRationale: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 24, marginBottom: spacing.md },
  tipRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  tipLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  tipText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
  detailBlock: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.sm },
  detailLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  detailText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 22 },
  exampleItem: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
});
