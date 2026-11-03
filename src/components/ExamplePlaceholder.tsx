import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { WineCardThumb } from './WineCardThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Generic, faded stock imagery for empty-state tiles that aren't about a single
// wine label — a restaurant interior (dined-out / wine-list cards). We NEVER show a plain brown tile with an icon in a carousel; every
// placeholder is an image under the "appears here" scrim.
export const RESTAURANT_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=440&q=55';

// Bundled generic wine-label images — shipped with the app so placeholder tiles
// ALWAYS show real labels (no flaky per-wine web fetch). Used for the label
// collages / single-label placeholders across the home carousels.
const PLACEHOLDER_LABELS: ImageSourcePropType[] = [
  require('../../assets/images/placeholder-labels/label-1.jpg'),
  require('../../assets/images/placeholder-labels/label-2.jpg'),
  require('../../assets/images/placeholder-labels/label-3.jpg'),
  require('../../assets/images/placeholder-labels/label-4.jpg'),
  require('../../assets/images/placeholder-labels/label-5.jpg'),
  require('../../assets/images/placeholder-labels/label-6.jpg'),
  require('../../assets/images/placeholder-labels/label-7.jpg'),
  require('../../assets/images/placeholder-labels/label-8.jpg'),
  require('../../assets/images/placeholder-labels/label-9.jpg'),
];

// Pick `n` bundled label images starting at `offset` (wraps) — lets each tile
// show a different-looking set of labels.
export function placeholderLabelImages(offset: number, n: number): ImageSourcePropType[] {
  return Array.from({ length: n }, (_, i) => PLACEHOLDER_LABELS[(offset + i) % PLACEHOLDER_LABELS.length]);
}

// One example card in an empty-carousel preview. 'label' cards pull a web label
// photo for the wine identity; 'image' cards show a faded generic photo (a
// restaurant or a bottle lineup); 'labelCollage' cards show 1–4 BUNDLED wine
// labels. Every card carries a scrim overlay making clear it's a placeholder.
export type PlaceholderCard =
  | { kind: 'label'; producer: string; wineName: string; title: string; stamp: string; overlay: string }
  | { kind: 'image'; uri: string; title: string; stamp: string; overlay: string }
  | { kind: 'labelCollage'; images: ImageSourcePropType[]; title: string; stamp: string; overlay: string }
  // Bundled labels side by side in one row — reads as a bottle lineup.
  | { kind: 'labelLineup'; images: ImageSourcePropType[]; title: string; stamp: string; overlay: string };

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
          <View style={styles.fadedImg}>
            <WineCardThumb producer={card.producer} wineName={card.wineName} fallbackText={card.title} resizeMode="contain" />
          </View>
        ) : card.kind === 'labelCollage' ? (
          // Bundled wine labels — one fills the tile, or 2–4 as a grid.
          <View style={styles.fadedImg}>
            {card.images.length <= 1 ? (
              <Image source={card.images[0]} style={styles.collageFull} resizeMode="cover" />
            ) : (
              <View style={styles.collageGrid}>
                {card.images.slice(0, 4).map((img, i) => (
                  <Image key={i} source={img} style={styles.collageCell} resizeMode="cover" />
                ))}
              </View>
            )}
          </View>
        ) : card.kind === 'labelLineup' ? (
          <View style={[styles.fadedImg, styles.lineupRow]}>
            {card.images.map((img, i) => (
              <Image key={i} source={img} style={styles.lineupCell} resizeMode="cover" />
            ))}
          </View>
        ) : (
          // Faded generic photo (restaurant).
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
  collageFull: { width: 220, height: 165 },
  collageGrid: { width: 220, height: 165, flexDirection: 'row', flexWrap: 'wrap' },
  collageCell: { width: 110, height: 82.5 },
  lineupRow: { flexDirection: 'row' },
  lineupCell: { flex: 1, height: 165 },
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: 'rgba(18,11,10,0.42)', alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 18 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
});
