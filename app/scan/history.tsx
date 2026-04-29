import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useScanStore } from '../../src/stores/scanStore';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ScanHistoryScreen() {
  const { history, saveToAccount } = useScanHistory();
  const { setExtractedWines, setRecommendation } = useScanStore();
  const { session } = useAuth();

  function handleView(item: typeof history[0]) {
    setExtractedWines(item.extractedWines);
    setRecommendation(item.recommendation);
    router.push('/scan/results');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Previous Scans</Text>
        <View style={{ width: 40 }} />
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptyBody}>Your last 3 wine list scans will appear here automatically.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {history.map((item, i) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{formatDate(item.savedAt)}</Text>
                {item.savedToAccount && (
                  <Text style={styles.savedBadge}>Saved</Text>
                )}
              </View>

              <Text style={styles.cardWines}>
                {item.extractedWines.length} wines scanned
              </Text>

              <Text style={styles.cardRecs}>
                Top pick: {item.recommendation.wines[0]?.name ?? '—'}{item.recommendation.wines[0]?.vintage ? ` ${item.recommendation.wines[0].vintage}` : ''}
              </Text>

              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.viewButton} onPress={() => handleView(item)}>
                  <Text style={styles.viewButtonText}>View Results</Text>
                </TouchableOpacity>

                {session && !item.savedToAccount && (
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => saveToAccount.mutate(item)}
                    disabled={saveToAccount.isPending}
                  >
                    <Text style={styles.saveButtonText}>
                      {saveToAccount.isPending ? 'Saving…' : 'Save to Account'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  savedBadge: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardWines: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xs },
  cardRecs: { fontSize: 17, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, marginBottom: spacing.md },
  cardActions: { flexDirection: 'row', gap: spacing.sm },
  viewButton: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  viewButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
  saveButton: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  saveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
