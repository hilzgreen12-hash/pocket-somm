import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useScanHistory } from '../../src/hooks/useScanHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { colors, spacing } from '../../src/constants/theme';
import type { ScanArchiveItem } from '../../src/hooks/useScanHistory';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RestaurantReviewsScreen() {
  const { archive, archiveLoading } = useScanHistory();
  const { session } = useAuth();
  const [editing, setEditing] = useState<ScanArchiveItem | null>(null);

  const reviewed = archive.filter((a) => (a.restaurantName && a.restaurantName.trim()) || (a.restaurantNote && a.restaurantNote.trim()));

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
          {reviewed.map((item) => (
            <TouchableOpacity key={item.id} style={styles.cardCompact} onPress={() => setEditing(item)} activeOpacity={0.7}>
              <View style={styles.cardCompactRow}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {item.restaurantName || 'Unnamed restaurant'}
                </Text>
              </View>
              <View style={styles.cardCompactMetaRow}>
                <Text style={styles.metaText}>{formatDate(item.capturedAt)}</Text>
                {item.city ? (
                  <Text style={styles.metaText} numberOfLines={1}> · {item.city}</Text>
                ) : null}
              </View>
              {item.restaurantNote ? (
                <Text style={styles.notePreview} numberOfLines={2}>{item.restaurantNote}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {editing && (
        <RestaurantReviewModal
          visible
          sessionId={editing.id}
          initialName={editing.restaurantName}
          initialNote={editing.restaurantNote}
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
});
