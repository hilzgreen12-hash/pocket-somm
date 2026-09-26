import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineCardThumb } from './WineCardThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// One example card in an empty-carousel preview. 'label' cards pull a web label
// photo for the wine identity; 'icon' cards (a restaurant) show a glyph;
// 'winelist' draws a faux menu. Every card carries a scrim overlay making clear
// it's a placeholder.
export type PlaceholderCard =
  | { kind: 'label'; producer: string; wineName: string; title: string; stamp: string; overlay: string }
  | { kind: 'icon'; icon: keyof typeof Ionicons.glyphMap; title: string; stamp: string; overlay: string }
  | { kind: 'winelist'; title: string; stamp: string; overlay: string };

// A code-drawn "wine list" thumbnail (no image asset needed) — a heading plus a
// few real menu entries with prices, so the wine-list scan placeholder reads as a
// menu rather than a lone glyph.
const WINE_LIST_ENTRIES: [string, string][] = [
  ['Chablis 1er Cru', '48'],
  ['Barolo, Piedmont', '72'],
  ['Sancerre, Loire', '39'],
  ['Rioja Reserva', '55'],
];

function WineListMock() {
  return (
    <View style={styles.listMock}>
      <Text style={styles.listMockHead}>WINE LIST</Text>
      {WINE_LIST_ENTRIES.map(([name, price], i) => (
        <View key={i} style={styles.listMockRow}>
          <Text style={styles.listMockName} numberOfLines={1}>{name}</Text>
          <Text style={styles.listMockPrice}>{`£${price}`}</Text>
        </View>
      ))}
    </View>
  );
}

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
          <WineCardThumb producer={card.producer} wineName={card.wineName} fallbackText={card.title} resizeMode="contain" />
        ) : card.kind === 'winelist' ? (
          <WineListMock />
        ) : (
          <View style={styles.iconThumb}><Ionicons name={card.icon} size={40} color={colors.gold} style={styles.icon} /></View>
        )}
        <View style={styles.overlay} pointerEvents="none">
          <Text style={styles.overlayText}>{card.overlay}</Text>
        </View>
      </View>
      <Text style={styles.cardName} numberOfLines={2}>{card.title}</Text>
      <Text style={styles.cardStamp} numberOfLines={1}>{card.stamp}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumbWrap: { width: 220, height: 165 },
  iconThumb: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  icon: { opacity: 0.5 },
  // Faux wine-list "menu" tile for the wine-list scan placeholder.
  listMock: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, paddingHorizontal: spacing.lg, justifyContent: 'center', gap: 9 },
  listMockHead: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.gold, letterSpacing: 1.2, textAlign: 'center', marginBottom: 4, opacity: 0.85 },
  listMockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  listMockName: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 12, color: 'rgba(224,184,74,0.85)' },
  listMockPrice: { fontFamily: fonts.bodySemibold, fontSize: 12, color: 'rgba(224,184,74,0.85)' },
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: 'rgba(18,11,10,0.38)', alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: 'rgba(255,255,255,0.82)', textAlign: 'center', lineHeight: 18 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
