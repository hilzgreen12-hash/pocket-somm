import { View, Text, Image, StyleSheet } from 'react-native';
import { WineCardThumb } from './WineCardThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Generic, faded stock imagery for empty-state tiles that aren't about a single
// wine label — a restaurant interior (dined-out / wine-list cards) and a bottle
// lineup. We NEVER show a plain brown tile with an icon in a carousel; every
// placeholder is an image under the "appears here" scrim.
export const RESTAURANT_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=440&q=55';
export const LINEUP_IMG = 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad03?auto=format&fit=crop&w=440&q=55';

// One example card in an empty-carousel preview. 'label' cards pull a web label
// photo for the wine identity; 'image' cards show a faded generic photo (a
// restaurant or a bottle lineup). Every card carries a scrim overlay making
// clear it's a placeholder.
export type PlaceholderCard =
  | { kind: 'label'; producer: string; wineName: string; title: string; stamp: string; overlay: string }
  | { kind: 'image'; uri: string; title: string; stamp: string; overlay: string };

// A single example/placeholder card in the real card shape (thumbnail + name +
// date · location stamp), scrimmed with a "your [scan/review] replaces this
// content" note so it never reads as real data. Carousels render their real cards
// first, then pad with these — so a real item replaces the FIRST placeholder,
// leaving the later placeholders intact until the carousel fills up.
export function PlaceholderCardView({ card }: { card: PlaceholderCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        {card.kind === 'label' ? (
          // Faded real label (fetched for the named wine) so empty tiles still
          // look like the cards they'll become, under the "appears here" overlay.
          <View style={styles.fadedImg}>
            <WineCardThumb producer={card.producer} wineName={card.wineName} fallbackText={card.title} resizeMode="contain" />
          </View>
        ) : (
          // Faded generic photo (restaurant / bottle lineup).
          <Image source={{ uri: card.uri }} style={styles.genericImg} resizeMode="cover" />
        )}
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText} allowFontScaling={false}>{card.overlay}</Text>
        </View>
      </View>
      <Text style={styles.cardName} numberOfLines={2} allowFontScaling={false}>{card.title}</Text>
      <Text style={styles.cardStamp} numberOfLines={1} allowFontScaling={false}>{card.stamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumbWrap: { width: 220, height: 165, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface },
  fadedImg: { width: 220, height: 165, opacity: 0.45 },
  genericImg: { width: 220, height: 165, opacity: 0.5 },
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: 'rgba(18,11,10,0.42)', alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 18 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  // Date · location sits gold beneath the (white) title — matches the real cards.
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
});
