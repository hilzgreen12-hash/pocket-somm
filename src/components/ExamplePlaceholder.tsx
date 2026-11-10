import { View, Text, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { WineCardThumb } from './WineCardThumb';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Generic, faded stock imagery for empty-state tiles that aren't about a single
// wine label — a restaurant interior (dined-out / wine-list cards). We NEVER show a plain brown tile with an icon in a carousel; every
// placeholder is an image under the "appears here" scrim.
export const RESTAURANT_IMG = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=440&q=55';

// Bundled generic wine-label images — shipped with the app so placeholder tiles
// ALWAYS show real labels (no flaky per-wine web fetch). Used for the label
// collages / single-label placeholders across the home carousels.
// Real labels photographed for Vinster (labels 10–17, added 2026-11-05), named so
// a placeholder can show the label that matches its title.
export const NAMED_LABELS = {
  denisMortet: require('../../assets/images/placeholder-labels/label-10.jpg'),      // Domaine Denis Mortet Gevrey-Chambertin Mes Cinq Terroirs
  lynchBages: require('../../assets/images/placeholder-labels/label-11.jpg'),       // Château Lynch-Bages 2010
  munjebel: require('../../assets/images/placeholder-labels/label-13.jpg'),         // Frank Cornelissen Munjebel CS 2016
  gruaudLarose: require('../../assets/images/placeholder-labels/label-14.jpg'),     // Château Gruaud-Larose 1979
  benditoDestino: require('../../assets/images/placeholder-labels/label-15.jpg'),   // Bendito Destino La Cabaña
  donnhoff: require('../../assets/images/placeholder-labels/label-16.jpg'),         // Dönnhoff Krötenpfuhl Riesling GG 2019
  rocDeCambes: require('../../assets/images/placeholder-labels/label-17.jpg'),      // Roc de Cambes 2015
  tollotBeaut: require('../../assets/images/placeholder-labels/label-9.jpg'),       // Domaine Tollot-Beaut Beaune-Grèves 1er Cru
};

// The new labels are interleaved with the originals so every offset-based
// collage / lineup / storage tile mixes old and new.
const PLACEHOLDER_LABELS: ImageSourcePropType[] = [
  require('../../assets/images/placeholder-labels/label-10.jpg'), require('../../assets/images/placeholder-labels/label-1.jpg'), require('../../assets/images/placeholder-labels/label-11.jpg'), require('../../assets/images/placeholder-labels/label-2.jpg'), require('../../assets/images/placeholder-labels/label-3.jpg'), require('../../assets/images/placeholder-labels/label-13.jpg'), require('../../assets/images/placeholder-labels/label-4.jpg'), require('../../assets/images/placeholder-labels/label-14.jpg'), require('../../assets/images/placeholder-labels/label-5.jpg'), require('../../assets/images/placeholder-labels/label-15.jpg'), require('../../assets/images/placeholder-labels/label-6.jpg'), require('../../assets/images/placeholder-labels/label-16.jpg'), require('../../assets/images/placeholder-labels/label-7.jpg'), require('../../assets/images/placeholder-labels/label-17.jpg'), require('../../assets/images/placeholder-labels/label-8.jpg'), require('../../assets/images/placeholder-labels/label-9.jpg'),
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
export function PlaceholderCardView({ card, compact = true }: { card: PlaceholderCard; compact?: boolean }) {
  // compact (default) = the app-wide small tile with a white outline.
  return (
    <View style={[styles.card, compact && { width: HOME_TILE.w }]}>
      <View style={[styles.thumbWrap, compact && styles.thumbWrapCompact]}>
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
          <View style={styles.overlayBand}>
            <Text style={styles.overlayText} allowFontScaling={false}>{card.overlay}</Text>
          </View>
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
  thumbWrapCompact: { width: HOME_TILE.w, height: HOME_TILE.h, borderWidth: 1, borderColor: colors.borderWhite },
  fadedImg: { width: '100%', height: '100%', opacity: 0.8 },
  genericImg: { width: '100%', height: '100%', opacity: 0.8 },
  collageFull: { width: '100%', height: '100%' },
  collageGrid: { width: '100%', height: '100%', flexDirection: 'row', flexWrap: 'wrap' },
  collageCell: { width: '50%', height: '50%' },
  lineupRow: { flexDirection: 'row' },
  lineupCell: { flex: 1, height: '100%' },
  // Placeholder message sits on its own dark band so the label art around it stays bright.
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  overlayBand: { backgroundColor: colors.titleBand, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 18 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3 },
});
