import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { ChefLabelSession } from '../../src/api/chef';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LabelArchiveScreen() {
  const { sessions, isLoading } = useChefLabelHistory();
  const { setWineDetailsConfirmed, setPairings, setFilters } = useLabelStore();

  function handleView(item: ChefLabelSession) {
    setWineDetailsConfirmed(item.wine);
    setPairings(item.pairings);
    setFilters(item.filters ?? null);
    router.push({ pathname: '/chef/results', params: { fromHistory: 'true' } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recipe Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? null : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archive yet</Text>
          <Text style={styles.emptyBody}>
            After each label scan, tap Save to Archive on the results page to keep that pairing here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {sessions.map((item) => {
            const headerLine = wineHeaderLine(item.wine.producer, item.wine.wineName, item.wine.vintage);
            const detailLine = [item.wine.region, item.wine.style].filter(Boolean).join(' · ');
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardDate}>{formatDate(item.saved_at)}</Text>
                <Text style={styles.cardWine}>{headerLine}</Text>
                {detailLine ? <Text style={styles.cardDetail}>{detailLine}</Text> : null}
                <Text style={styles.cardPairings}>
                  {item.pairings.map((p) => p.dishName).join(' · ')}
                </Text>
                <TouchableOpacity style={styles.viewButton} onPress={() => handleView(item)}>
                  <Text style={styles.viewButtonText}>View Results</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  cardWine: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardDetail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  cardPairings: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.xs },
  viewButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  viewButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
