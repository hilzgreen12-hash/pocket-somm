import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import { formatCurrency } from '../../src/constants/currency';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function hasReviewData(w: CellarWine): boolean {
  return !!(w.user_notes?.trim() || w.review_score != null || w.review_location?.trim() || w.review_date);
}

function ReviewCard({ wine, onPress }: { wine: CellarWine; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardTopRow}>
        <Text style={styles.wineName} numberOfLines={2}>
          {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
        </Text>
        {wine.review_score != null && (
          <Text style={styles.score}>{wine.review_score}</Text>
        )}
      </View>
      {wine.region ? <Text style={styles.regionText} numberOfLines={1}>{wine.region}</Text> : null}
      <View style={styles.metaRow}>
        {wine.review_date ? <Text style={styles.metaText}>{formatDate(wine.review_date)}</Text> : null}
        {wine.review_date && wine.review_location ? <Text style={styles.metaText}> · </Text> : null}
        {wine.review_location ? <Text style={styles.metaText} numberOfLines={1}>{wine.review_location}</Text> : null}
        {wine.purchase_price != null ? (
          <Text style={styles.metaText} numberOfLines={1}>
            {(wine.review_date || wine.review_location) ? ' · ' : ''}Paid {formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 0 })}
          </Text>
        ) : null}
      </View>
      {wine.user_notes ? (
        <Text style={styles.noteText} numberOfLines={3}>{wine.user_notes}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function CellarNotesScreen() {
  const { wines, isLoading } = useCellar();
  const [query, setQuery] = useState('');

  const reviewed = useMemo(() => wines.filter(hasReviewData), [wines]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return reviewed;
    const numeric = Number(q);
    return reviewed.filter((w) => {
      if (w.wine_name?.toLowerCase().includes(q)) return true;
      if (w.producer?.toLowerCase().includes(q)) return true;
      if (w.review_location?.toLowerCase().includes(q)) return true;
      if (Number.isFinite(numeric) && w.review_score != null && Math.abs(w.review_score - numeric) <= 2) return true;
      return false;
    });
  }, [reviewed, query]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar Wine Notes</Text>
        <View style={{ width: 40 }} />
      </View>

      {reviewed.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyBody}>
            Open any wine in your cellar to add a personal review — your note, score (out of 100), where and when you drank it. Reviewed wines will appear here.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Search by wine, restaurant, or score…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              clearButtonMode="while-editing"
              returnKeyType="search"
            />
          </View>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No reviews match "{query}".</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingTop: spacing.sm }}>
              {filtered.map((wine) => (
                <ReviewCard
                  key={wine.id}
                  wine={wine}
                  onPress={() => router.push(`/cellar/${wine.id}`)}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  searchRow: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardTopRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  wineName: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  score: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: 2 },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  noteText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20, marginTop: 4 },
});
