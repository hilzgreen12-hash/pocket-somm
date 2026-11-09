import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import type { PairingIngredient } from '../../api/wineExtras';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Serve tab → "Classic Pairing Ingredients": up to six, grouped as Proteins,
// Herbs & Spices and Vegetables (wine card and Wine Intel).
const GROUPS: { type: PairingIngredient['type']; label: string }[] = [
  { type: 'protein', label: 'Proteins' },
  { type: 'herb', label: 'Herbs & Spices' },
  { type: 'vegetable', label: 'Vegetables' },
];

export function PairingIngredientsCard({ ingredients, loading }: { ingredients: PairingIngredient[] | null; loading: boolean }) {
  if (!loading && !ingredients?.length) return null;
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Classic Pairing Ingredients</Text>
      {loading && !ingredients?.length ? (
        <View style={styles.loading}><ActivityIndicator color={colors.gold} /><Text style={styles.small}>Finding classic pairings…</Text></View>
      ) : (
        <View style={styles.cols}>
          {GROUPS.map((g) => {
            const items = (ingredients ?? []).filter((i) => i.type === g.type);
            if (!items.length) return null;
            return (
              <View key={g.type} style={styles.col}>
                <Text style={styles.label}>{g.label}</Text>
                {items.map((i) => <Text key={i.name} style={styles.item}>{i.name}</Text>)}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md, gap: 8 },
  title: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  cols: { flexDirection: 'row', gap: spacing.sm },
  col: { flex: 1, gap: 3 },
  label: { fontFamily: fonts.bodyRegular, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)', marginBottom: 2 },
  item: { fontFamily: fonts.bodySemibold, fontSize: 14.5, lineHeight: 20, color: colors.gold },
  loading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  small: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
});
