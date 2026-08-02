import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { WineConnections } from '../utils/wineConnections';

// "You've had this before" — shown on the Wine Intel card after a scan when the
// wine already appears in the user's reviews, restaurant records or cellar.
// Each row taps through to that record. Purely presentational; the resolver
// (findWineConnections) supplies the data and the caller supplies navigation.
export function WineConnectionsPanel({
  connections, onOpenReviews, onOpenRestaurant, onOpenCellar,
}: {
  connections: WineConnections;
  onOpenReviews?: () => void;
  onOpenRestaurant?: () => void;
  onOpenCellar?: (cellarWineId: string) => void;
}) {
  if (!connections.hasAny) return null;

  const { reviewCount, averageScore, restaurantPicks, cellarWines, vintageMismatch } = connections;
  const resto = restaurantPicks.find((p) => (p.restaurant_name ?? '').trim());
  const cellarQty = cellarWines.reduce((n, w) => n + (w.quantity ?? 1), 0);

  const Row = ({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      </View>
      {onPress ? <Text style={styles.chevron}>›</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>You've had this before</Text>

      {reviewCount > 0 ? (
        <Row
          label="Your Reviews"
          value={`${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'}${averageScore != null ? ` · ${averageScore}/100 average` : ''}`}
          onPress={onOpenReviews}
        />
      ) : null}

      {resto ? (
        <Row label="At a restaurant" value={`Had it at ${resto.restaurant_name}`} onPress={onOpenRestaurant} />
      ) : null}

      {cellarWines.length > 0 ? (
        <Row
          label="In your cellar"
          value={cellarQty > 1 ? `${cellarQty} bottles` : 'In your cellar'}
          onPress={onOpenCellar ? () => onOpenCellar(cellarWines[0].id) : undefined}
        />
      ) : null}

      {vintageMismatch ? (
        <Text style={styles.note}>Some of these are a different vintage.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  heading: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.4, marginBottom: spacing.xs, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  rowText: { flex: 1 },
  rowLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  rowValue: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, marginTop: 1 },
  chevron: { fontFamily: fonts.bodyRegular, fontSize: 22, color: colors.gold, paddingLeft: spacing.sm },
  note: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 2, marginBottom: spacing.xs },
});
