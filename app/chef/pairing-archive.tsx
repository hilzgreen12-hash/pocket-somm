import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { colors, spacing } from '../../src/constants/theme';
import type { ChefPairingSession } from '../../src/api/chef';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PairingArchiveScreen() {
  const { session } = useAuth();
  const { sessions, isLoading } = useChefPairingHistory();
  const { setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();

  function handleView(item: ChefPairingSession) {
    setDish(item.dish);
    setMode(item.mode);
    if (item.mode === 'cellar') setCellarResult(item.cellar_result ?? []);
    else setGeneralResult(item.general_result ?? [], item.general_summary ?? undefined);
    router.push({
      pathname: '/chef/pairing-results',
      params: {
        fromHistory: 'true',
        savedAt: item.saved_at,
        city: item.city ?? '',
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wine Pairing Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Save dish-to-wine pairings to your archive — sign in to keep them across sessions."
        />
      ) : isLoading ? null : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archive yet</Text>
          <Text style={styles.emptyBody}>
            After Vinster suggests a wine for your dish, tap Save to Archive on the results page to keep that pairing here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {sessions.map((item) => {
            const summary = item.mode === 'cellar'
              ? (item.cellar_result ?? []).map((r) => r.wineName).join(' · ')
              : (item.general_result ?? []).map((r) => r.wineStyle).join(' · ');
            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.cardDate}>{formatDate(item.saved_at)}</Text>
                <Text style={styles.cardDish}>{item.dish}</Text>
                <Text style={styles.cardMode}>{item.mode === 'cellar' ? 'From your cellar' : 'Style recommendations'}</Text>
                {summary ? <Text style={styles.cardWines}>{summary}</Text> : null}
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
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  cardDish: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardMode: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  cardWines: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.xs },
  viewButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.sm, alignItems: 'center' },
  viewButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
});
