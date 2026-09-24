import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../hooks/useCellar';
import { effectiveMaturity } from '../utils/maturity';
import { WineCardThumb } from './WineCardThumb';
import { wineHeaderLine } from '../utils/wineHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "Drink Soon" — active cellar bottles sitting in their peak drinking window,
// so the Discover tab nudges you toward what to open now. Tap → the wine card.
export function DrinkSoonCarousel() {
  const { wines } = useCellar();
  const peak = wines.filter((w) => effectiveMaturity(w) === 'peak');

  if (peak.length === 0) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        <View style={[styles.card, styles.emptyCard]}>
          <Text style={styles.emptyText}>Bottles from your cellar and approaching their peak will appear here as your collection grows</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {peak.map((w) => {
        const from = w.drinking_window_from;
        const to = w.drinking_window_to;
        const windowStr = from != null && to != null ? `${from}–${to}`
          : to != null ? `by ${to}`
          : from != null ? `from ${from}`
          : 'At peak';
        return (
          <TouchableOpacity key={w.id} style={styles.card} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.85}>
            <WineCardThumb path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} />
            <Text style={styles.cardName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>Drink {windowStr}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumb: { width: 220, height: 165 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  emptyCard: { height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderWhite, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 18 },
});
