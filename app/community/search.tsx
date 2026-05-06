import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { searchCommunityReviews, type CommunityCategory } from '../../src/api/community';
import { ReviewCard } from './view';
import { colors, spacing } from '../../src/constants/theme';

const HEADINGS: Record<string, string> = {
  wine: 'Search Wine Reviews',
  recipe: 'Search Recipe Reviews',
  restaurant: 'Search Restaurant Reviews',
};

export default function CommunitySearchScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = (category ?? 'wine').toLowerCase() as CommunityCategory;
  const heading = HEADINGS[key] ?? 'Search Reviews';

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ['community-search', key, debounced],
    queryFn: () => searchCommunityReviews(key, debounced, 50),
    enabled: debounced.trim().length > 0,
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{heading}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder={key === 'wine' ? 'Search by wine, producer, or note…' : key === 'restaurant' ? 'Search by restaurant or city…' : 'Search by recipe or ingredient…'}
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {!debounced.trim() ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Start typing to search</Text>
          <Text style={styles.emptyBody}>Find reviews by wine name, producer, ingredient, restaurant, or anything in the body of a review.</Text>
        </View>
      ) : isFetching ? (
        <View style={styles.empty}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptyBody}>Try a different word — search looks across titles, subtitles, and review bodies.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingTop: spacing.md }}>
          {results.map((r) => <ReviewCard key={r.id} review={r} />)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  headerTitle: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  searchRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
