import { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { FeedCard } from '../../src/components/community/CommunityCards';
import { FEED_KEY, searchFeed } from '../../src/api/community';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Search the Community: wines, restaurants, words in reviews and members' names.
export default function CommunitySearchScreen() {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');

  // Search once typing pauses.
  useEffect(() => {
    const t = setTimeout(() => setTerm(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: [FEED_KEY, 'search', term],
    enabled: term.length >= 2,
    queryFn: () => searchFeed(term),
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search the Community</Text>
        <View style={{ width: 40 }} />
      </View>
      <TextInput
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Wines, restaurants or members"
        placeholderTextColor={colors.textMuted}
        autoFocus
        autoCorrect={false}
        returnKeyType="search"
      />
      {isFetching ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.lg }} /> : null}
      <FlatList
        data={term.length >= 2 ? results : []}
        keyExtractor={(i) => i.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <FeedCard item={item} onPress={() => router.push(`/community/post/${item.id}` as any)} />}
        ListEmptyComponent={term.length >= 2 && !isFetching ? <Text style={styles.empty}>Nothing found for “{term}”.</Text> : null}
        contentContainerStyle={{ paddingBottom: 80 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { flex: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.6, textAlign: 'center' },
  input: { marginHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  empty: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', padding: spacing.xl },
});
