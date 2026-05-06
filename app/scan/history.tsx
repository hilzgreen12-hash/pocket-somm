import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useScanStore } from '../../src/stores/scanStore';
import { useAuth } from '../../src/hooks/useAuth';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { colors, spacing } from '../../src/constants/theme';
import type { ScanArchiveItem } from '../../src/hooks/useScanHistory';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ScanHistoryScreen() {
  const { archive, archiveLoading } = useScanHistory();
  const { setExtractedWines, setRecommendation } = useScanStore();
  const { session } = useAuth();
  const [reviewing, setReviewing] = useState<ScanArchiveItem | null>(null);

  function handleView(item: ScanArchiveItem) {
    setExtractedWines(item.extractedWines);
    setRecommendation(item.recommendation);
    const params = new URLSearchParams({ fromHistory: 'true', sessionId: item.id });
    if (item.capturedAt) params.set('date', item.capturedAt);
    if (item.restaurantName) params.set('restaurant', item.restaurantName);
    if (item.city) params.set('city', item.city);
    router.push(`/scan/results?${params.toString()}`);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to view your archive</Text>
          <Text style={styles.emptyBody}>Your archive saves every wine list scan and recommendation automatically.</Text>
          <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : archiveLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : archive.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archive yet</Text>
          <Text style={styles.emptyBody}>Your wine list scans will appear here automatically after each search.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {archive.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardMeta}>
                <Text style={styles.cardDate}>{formatDate(item.capturedAt)}</Text>
                {item.city ? <Text style={styles.cardLocation}>{item.city}</Text> : null}
              </View>

              {item.restaurantName ? (
                <Text style={styles.cardRestaurant}>{item.restaurantName}</Text>
              ) : null}

              <Text style={styles.cardTopPick}>
                Top pick: {item.recommendation.wines[0]?.name ?? '—'}
                {item.recommendation.wines[0]?.vintage ? ` ${item.recommendation.wines[0].vintage}` : ''}
              </Text>

              <Text style={styles.cardCount}>{item.extractedWines.length} wines on list</Text>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleView(item)}>
                  <Text style={styles.actionButtonText}>View Results</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => setReviewing(item)}>
                  <Text style={styles.actionButtonText}>Review Restaurant</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {reviewing && (
        <RestaurantReviewModal
          visible
          sessionId={reviewing.id}
          initialName={reviewing.restaurantName}
          initialNote={reviewing.restaurantNote}
          initialRatings={{
            food: reviewing.ratingFood,
            service: reviewing.ratingService,
            wineList: reviewing.ratingWineList,
            overall: reviewing.ratingOverall,
          }}
          onClose={() => setReviewing(null)}
          onSaved={() => setReviewing(null)}
        />
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
  signInButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  signInButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardLocation: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  cardRestaurant: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  cardTopPick: { fontSize: 17, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardCount: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xs },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionButton: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  actionButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
});
