import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { colors, spacing } from '../../src/constants/theme';
import type { WineDetailsComplete, Pairing } from '../../src/types/wine';

interface ChefHistoryItem {
  id: string;
  timestamp: string;
  wine: WineDetailsComplete;
  pairings: Pairing[];
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function LabelArchiveScreen() {
  const [history, setHistory] = useState<ChefHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { setWineDetailsConfirmed, setPairings } = useLabelStore();

  useEffect(() => {
    AsyncStorage.getItem('vinster_chef_history')
      .then((raw) => setHistory(raw ? JSON.parse(raw) : []))
      .finally(() => setLoading(false));
  }, []);

  function handleView(item: ChefHistoryItem) {
    setWineDetailsConfirmed(item.wine);
    setPairings(item.pairings);
    router.push('/chef/results');
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

      {loading ? null : history.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archive yet</Text>
          <Text style={styles.emptyBody}>
            Your recipe pairings will appear here automatically after each label scan.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {history.map((item) => {
            const wineLine = [item.wine.producer, item.wine.wineName].filter(Boolean).join(' — ');
            const detailLine = [item.wine.region, item.wine.vintage, item.wine.style].filter(Boolean).join(' · ');
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
                <Text style={styles.cardWine}>{wineLine}</Text>
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
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardWine: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardDetail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  cardPairings: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.xs },
  viewButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  viewButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
