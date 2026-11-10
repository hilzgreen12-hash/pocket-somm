import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { PairingIngredient } from '../../api/wineExtras';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Serve tab → "Classic Pairing Ingredients": three each of Proteins, Herbs &
// Spices and Vegetables, in lower case (wine card and Wine Intel). Food only —
// any drink (e.g. the wine's own grape) is dropped, including from lists saved
// before the server filtered them.
const DRINK_RE = /\b(wine|wines|champagne|cava|prosecco|cr[eé]mant|sherry|port|madeira|marsala|vermouth|cognac|brandy|armagnac|calvados|whisk(e)?y|gin|vodka|rum|tequila|liqueur|beer|ale|lager|cider|sake|pinot|noir|chardonnay|riesling|syrah|shiraz|grenache|merlot|cabernet|sauvignon|malbec|tempranillo|sangiovese|nebbiolo|barbera|zinfandel|gamay|viognier|chenin|s[eé]millon|gew[uü]rztraminer|muscat|moscato|gr[uü]ner|albari[nñ]o|mourv[eè]dre|blanc|rouge|ros[eé])\b/i;
const isDrink = (n: string) => !/vinegar/i.test(n) && DRINK_RE.test(n);
const GROUPS: { type: PairingIngredient['type']; label: string }[] = [
  { type: 'protein', label: 'Proteins' },
  { type: 'herb', label: 'Herbs & Spices' },
  { type: 'vegetable', label: 'Vegetables' },
];

export function PairingIngredientsCard({ ingredients, loading }: { ingredients: PairingIngredient[] | null; loading: boolean }) {
  if (!loading && !ingredients?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Classic Ingredients Pairings</Text>
      {loading && !ingredients?.length ? (
        <View style={styles.loading}><ActivityIndicator color={colors.gold} /><Text style={styles.small}>Finding classic pairings…</Text></View>
      ) : (
        // A vertical list: group name on the left, its three items stacked on the right.
        <View style={styles.card}>
          {GROUPS.map((g) => ({ g, items: (ingredients ?? []).filter((i) => i.type === g.type && !isDrink(i.name)).slice(0, 3) }))
            .filter((x) => x.items.length)
            .map(({ g, items }, idx, all) => (
              <View key={g.type} style={[styles.row, idx < all.length - 1 && styles.rowRule]}>
                <Text style={styles.label}>{g.label}</Text>
                <View style={styles.items}>
                  {items.map((i) => <Text key={i.name} style={styles.item}>{i.name.toLowerCase()}</Text>)}
                </View>
              </View>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: 4 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  rowRule: { borderBottomWidth: 1, borderBottomColor: colors.border },
  label: { width: 110, paddingTop: 4, fontFamily: fonts.bodyRegular, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  items: { flex: 1, gap: 6 },
  item: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  small: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
});
