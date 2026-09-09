import { View, ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useChefArchiveCollections } from '../hooks/useChefArchiveCollections';
import { useChefLabelHistory } from '../hooks/useChefHistory';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Your Cookbook, surfaced on the Pair tab: the archive page's header + stats bar
// are copied here verbatim, but the folders render as boxes (like the Cellar /
// Review carousels) rather than the chips used on the Cookbook page itself.
// Tapping any box drills into /chef/archive, where the format switches back to
// that page's own layout.
function recipeLabel(n: number): string {
  return `${n} ${n === 1 ? 'Recipe' : 'Recipes'}`;
}

export function CookbookFoldersCarousel() {
  const { collections } = useChefArchiveCollections();
  const { sessions } = useChefLabelHistory();
  const recipeCount = sessions.length;
  const favouritesCount = sessions.filter((s) => !!s.is_starred).length;

  return (
    <View>
      {/* Header + stats bar — copied from the Your Cookbook landing page. The
          title is a white bubble that links into the cookbook — larger than the
          pairing bubbles above it (same 22px title font). */}
      <Text style={styles.cookbookTitle}>Your Cookbook</Text>
      <Text style={styles.blurb}>Recipes you generate can be saved and organised here. Create folders and record your pairing notes.</Text>
      <View style={styles.summaryRow}>
        <TouchableOpacity onPress={() => router.push('/chef/archive' as any)} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={styles.viewLink}>View Your Cookbook →</Text>
        </TouchableOpacity>
        <Text style={styles.summaryText}>
          {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'} · {collections.length} {collections.length === 1 ? 'Folder' : 'Folders'}
        </Text>
      </View>
      <Text style={styles.filterHint}>Listed by recently added · Swipe to add and view folders →</Text>

      {/* Folders as boxes — mirrors the Cellar storage / Review carousels. */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        <TouchableOpacity style={styles.card} onPress={() => router.push('/chef/archive?filter=favourites' as any)} activeOpacity={0.8}>
          <Text style={styles.cardType}>Cookbook</Text>
          <Text style={styles.cardName} numberOfLines={2}>★ Favourites</Text>
          <Text style={styles.cardCount}>{recipeLabel(favouritesCount)}</Text>
        </TouchableOpacity>
        {collections.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => router.push(`/chef/archive?filter=${c.id}` as any)} activeOpacity={0.8}>
            <Text style={styles.cardType}>Your Folder</Text>
            <Text style={styles.cardName} numberOfLines={2}>{c.name}</Text>
            <Text style={styles.cardCount}>{recipeLabel(c.item_count)}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cardAdd} onPress={() => router.push('/chef/archive?addFolder=1' as any)} activeOpacity={0.8}>
          <Text style={styles.cardAddText}>+ Add folder</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header + stats — copied from app/chef/archive.tsx so the two read alike.
  // Title now sits in a white bubble (matching the pairing bubbles' white
  // border + radius, just larger given the 22px title font) instead of an
  // underlined link.
  // "Your Cookbook" plain title (terracotta), the blurb, then a "View Your
  // Cookbook →" link line, then the stats bar and carousel.
  cookbookTitle: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  blurb: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.textMuted, lineHeight: 22, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  viewLink: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.gold, letterSpacing: 0.3 },
  // Stats bar — the "View Your Cookbook" link sits above the recipe · folder
  // count (mirrors Your Cellar Archive), between full-width gold rules.
  // No top rule; a single faded-yellow separator line below (not a boxed bar).
  summaryRow: { marginVertical: spacing.sm, paddingVertical: spacing.sm, alignItems: 'center', gap: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.divider },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },

  // Box tiles — matched to the Cellar storage carousel (HomeStorageSection).
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.md },
  // Sage-green cards with a black outline; dark-green eyebrow + count, black name.
  card: { width: 152, height: 108, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite, padding: spacing.md, justifyContent: 'space-between' },
  cardType: { fontSize: 11, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardName: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardCount: { fontSize: 13, fontFamily: fonts.headingRegular, color: colors.textMuted },
  cardAdd: { width: 152, height: 108, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardAddText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
});
