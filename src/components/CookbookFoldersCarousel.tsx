import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChefArchiveCollections } from '../hooks/useChefArchiveCollections';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// The Cookbook's folder filters, surfaced on the Pair tab as a carousel of
// shortcuts into Your Cookbook — All, ★ Favourites, the user's folders, and a
// dashed "+ Add folder" tile. Styled like the Cellar / Review carousels.
export function CookbookFoldersCarousel() {
  const { collections } = useChefArchiveCollections();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      <TouchableOpacity style={styles.chip} onPress={() => router.push('/chef/archive' as any)} activeOpacity={0.7}>
        <Text style={styles.chipText}>All</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.chip} onPress={() => router.push('/chef/archive?filter=favourites' as any)} activeOpacity={0.7}>
        <Text style={styles.chipText}>★ Favourites</Text>
      </TouchableOpacity>
      {collections.map((c) => (
        <TouchableOpacity key={c.id} style={styles.chip} onPress={() => router.push(`/chef/archive?filter=${c.id}` as any)} activeOpacity={0.7}>
          <Text style={styles.chipText} numberOfLines={1}>{c.name} ({c.item_count})</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={styles.chipAdd} onPress={() => router.push('/chef/archive?addFolder=1' as any)} activeOpacity={0.7}>
        <Text style={styles.chipAddText}>+ Add folder</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.sm },
  chip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, maxWidth: 220 },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, letterSpacing: 0.3 },
  chipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md },
  chipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
});
