import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { colors, spacing } from '../../src/constants/theme';

const RANK_LABELS = ['1st choice', '2nd choice', '3rd choice'];

function CellarResults({ recommendations, wines }: { recommendations: CellarRecommendation[]; wines: ReturnType<typeof useCellar>['wines'] }) {
  return (
    <>
      {recommendations.map((rec) => {
        const wine = wines.find((w) => w.id === rec.cellarWineId);
        const subtitleParts = [wine?.vintage, wine?.region].filter(Boolean);
        const subtitle = subtitleParts.length > 0 ? `From your cellar · ${subtitleParts.join(' · ')}` : 'From your cellar';
        return (
          <View key={rec.cellarWineId} style={styles.card}>
            <Text style={styles.cardWine}>{rec.wineName}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
            <Text style={styles.cardBody}>{rec.rationale}</Text>

            <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Serving tip</Text>
            <Text style={styles.cardItem}>{rec.servingTip}</Text>

            <TouchableOpacity
              onPress={() => router.push(`/cellar/${rec.cellarWineId}`)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardLink}>Select This Wine</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}

function GeneralResults({ results, summary }: { results: GeneralRecommendation[]; summary: string | null }) {
  return (
    <>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {results.map((result, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardWine}>{result.wineStyle}</Text>
          <Text style={styles.cardSubtitle}>{RANK_LABELS[i] ?? `Choice ${i + 1}`} · {result.region}</Text>
          <Text style={styles.cardBody}>{result.whyItWorks}</Text>

          <Text style={[styles.cardSection, { marginTop: spacing.md }]}>What to look for</Text>
          <Text style={styles.cardItem}>{result.characteristics}</Text>

          <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Price guide</Text>
          <Text style={styles.cardItem}>{result.priceGuide}</Text>

          {result.examples && result.examples.length > 0 && (
            <>
              <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Examples to look for</Text>
              {result.examples.map((ex, j) => (
                <Text key={j} style={styles.cardItem}>· {ex}</Text>
              ))}
            </>
          )}
        </View>
      ))}
    </>
  );
}

export default function PairingResultsScreen() {
  const { fromHistory, savedAt, city } = useLocalSearchParams<{ fromHistory?: string; savedAt?: string; city?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { dish, mode, cellarResult, generalResult, generalSummary, reset } = useFoodPairingStore();
  const { wines } = useCellar();
  const { save: savePairingSession } = useChefPairingHistory();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>(isFromHistory ? 'saved' : 'idle');
  const [renderedAt] = useState(() => new Date().toISOString());

  const stampDateSource = savedAt || renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampLocation = (city ?? '').trim() || null;

  function handleBack() {
    reset();
    router.back();
  }

  async function handleSaveToArchive() {
    if (saveState !== 'idle' || !dish) return;
    setSaveState('saving');
    try {
      await savePairingSession.mutateAsync({
        dish,
        mode,
        cellarResult: mode === 'cellar' ? (cellarResult ?? null) : null,
        generalResult: mode === 'general' ? (generalResult ?? null) : null,
        generalSummary: mode === 'general' ? (generalSummary ?? null) : null,
      });
      setSaveState('saved');
    } catch (err) {
      setSaveState('idle');
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity onPress={handleBack} style={styles.backRow}>
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      {(stampDate || stampLocation) && (
        <View style={styles.stampRow}>
          {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
          {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerLine}>Your Pairing</Text>
        <Text style={styles.dish}>{dish}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{mode === 'cellar' ? 'From Your Cellar' : 'Style Recommendations'}</Text>
        {mode === 'cellar' && cellarResult && (
          <CellarResults recommendations={cellarResult} wines={wines} />
        )}
        {mode === 'general' && generalResult && (
          <GeneralResults results={generalResult} summary={generalSummary} />
        )}
      </View>

      {!isFromHistory && (
        <TouchableOpacity
          style={[styles.saveButton, saveState !== 'idle' && styles.saveButtonDone]}
          onPress={handleSaveToArchive}
          disabled={saveState !== 'idle'}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saveState === 'saved' ? 'Saved ✓' : saveState === 'saving' ? 'Saving…' : 'Save to Archive'}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  backLink: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  stampRow: { alignItems: 'center', gap: 2, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  stampDate: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.5 },
  dish: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: spacing.xs },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  summary: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  cardWine: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardSubtitle: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: 2 },
  cardBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  cardSection: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  cardItem: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 20, marginBottom: 4 },
  cardLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.sm },
  saveButton: { marginHorizontal: spacing.xl, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  saveButtonDone: { backgroundColor: 'rgba(212,176,96,0.10)' },
  saveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
});
