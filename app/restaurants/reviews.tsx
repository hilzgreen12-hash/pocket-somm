import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { StarRating } from '../../src/components/StarRating';
import { colors, spacing } from '../../src/constants/theme';
import type { ScanArchiveItem } from '../../src/hooks/useScanHistory';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RestaurantReviewsScreen() {
  const { archive, archiveLoading } = useScanHistory();
  const { session } = useAuth();
  const [editing, setEditing] = useState<ScanArchiveItem | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  const reviewed = archive.filter((a) => (a.restaurantName && a.restaurantName.trim()) || (a.restaurantNote && a.restaurantNote.trim()));

  const sorted = [...reviewed].sort((a, b) => {
    if (sortBy === 'score') {
      // Highest overall first; nulls fall to the bottom; ties break by date (newest first).
      const ar = a.ratingOverall ?? -1;
      const br = b.ratingOverall ?? -1;
      if (ar !== br) return br - ar;
    }
    return new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime();
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Restaurant Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to view your reviews</Text>
          <Text style={styles.emptyBody}>Restaurant reviews are saved with your account.</Text>
        </View>
      ) : archiveLoading ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : reviewed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyBody}>From any wine list scan in Your Archive, tap "Review Restaurant" to capture the name, food, and atmosphere — your reviews will appear here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'date' && styles.sortChipActive]}
              onPress={() => setSortBy('date')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'date' && styles.sortChipTextActive]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
              onPress={() => setSortBy('score')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>Top rated</Text>
            </TouchableOpacity>
          </View>
          {sorted.map((item) => {
            const hasAnyRating = item.ratingFood != null || item.ratingService != null || item.ratingWineList != null || item.ratingOverall != null;
            return (
              <TouchableOpacity key={item.id} style={styles.cardCompact} onPress={() => setEditing(item)} activeOpacity={0.7}>
                <View style={styles.cardCompactRow}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {item.restaurantName || 'Unnamed restaurant'}
                  </Text>
                  {item.ratingOverall != null && (
                    <StarRating value={item.ratingOverall} size={14} readonly />
                  )}
                </View>
                <View style={styles.cardCompactMetaRow}>
                  <Text style={styles.metaText}>{formatDate(item.capturedAt)}</Text>
                  {item.city ? (
                    <Text style={styles.metaText} numberOfLines={1}> · {item.city}</Text>
                  ) : null}
                </View>
                {hasAnyRating && (
                  <View style={styles.ratingGrid}>
                    {item.ratingFood != null && (
                      <View style={styles.ratingCell}>
                        <Text style={styles.ratingCellLabel}>Food</Text>
                        <StarRating value={item.ratingFood} size={11} readonly />
                      </View>
                    )}
                    {item.ratingService != null && (
                      <View style={styles.ratingCell}>
                        <Text style={styles.ratingCellLabel}>Service</Text>
                        <StarRating value={item.ratingService} size={11} readonly />
                      </View>
                    )}
                    {item.ratingWineList != null && (
                      <View style={styles.ratingCell}>
                        <Text style={styles.ratingCellLabel}>Wine list</Text>
                        <StarRating value={item.ratingWineList} size={11} readonly />
                      </View>
                    )}
                  </View>
                )}
                {item.restaurantNote ? (
                  <Text style={styles.notePreview} numberOfLines={2}>{item.restaurantNote}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {editing && (
        <RestaurantReviewModal
          visible
          sessionId={editing.id}
          initialName={editing.restaurantName}
          initialNote={editing.restaurantNote}
          initialRatings={{
            food: editing.ratingFood,
            service: editing.ratingService,
            wineList: editing.ratingWineList,
            overall: editing.ratingOverall,
          }}
          onClose={() => setEditing(null)}
          onSaved={() => setEditing(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  restaurantName: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  notePreview: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  ratingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.xs },
  ratingCell: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingCellLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4 },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  sortLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: spacing.xs },
  sortChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, paddingVertical: 4, paddingHorizontal: spacing.md },
  sortChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  sortChipText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  sortChipTextActive: { color: colors.gold },
});
