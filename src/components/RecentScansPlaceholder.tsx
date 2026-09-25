import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WineCardThumb } from './WineCardThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// New-user preview for an empty "Your Recent Scans" carousel: three example cards
// in the real card shape (thumbnail + name + date · location stamp), each with a
// scrim overlay making clear it's a placeholder that the user's own scans replace.
// The two wine labels pull a web label photo (WineCardThumb); the wine-list card
// shows a list glyph.
type Card =
  | { kind: 'label'; producer: string; wineName: string; title: string; stamp: string; overlay: string }
  | { kind: 'list'; title: string; stamp: string; overlay: string };

const CARDS: Card[] = [
  { kind: 'label', producer: 'Domaine de la Romanée-Conti', wineName: 'La Romanée-Conti', title: 'La Romanée-Conti 2002', stamp: '01 Jan 2030 · At Home', overlay: 'Your first scan replaces this content' },
  { kind: 'list', title: 'Wine list', stamp: '20 Dec 2029 · La Steakhouse', overlay: 'Your second scan replaces this content' },
  { kind: 'label', producer: 'Kistler', wineName: 'Cuvée Cathleen Chardonnay', title: 'Kistler Cuvée Cathleen Chardonnay 2020', stamp: '18 Dec 2029', overlay: 'Your third scan replaces this content' },
];

export function RecentScansPlaceholder() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {CARDS.map((c, i) => (
        <View key={i} style={styles.card}>
          <View style={styles.thumbWrap}>
            {c.kind === 'label' ? (
              <WineCardThumb producer={c.producer} wineName={c.wineName} fallbackText={c.title} />
            ) : (
              <View style={styles.listThumb}><Ionicons name="list-outline" size={40} color={colors.gold} style={styles.listIcon} /></View>
            )}
            <View style={styles.overlay} pointerEvents="none">
              <Text style={styles.overlayText}>{c.overlay}</Text>
            </View>
          </View>
          <Text style={styles.cardName} numberOfLines={2}>{c.title}</Text>
          <Text style={styles.cardStamp} numberOfLines={1}>{c.stamp}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumbWrap: { width: 220, height: 165 },
  listThumb: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  listIcon: { opacity: 0.5 },
  // Scrim over the thumbnail carrying the "your scan replaces this" note.
  overlay: { ...StyleSheet.absoluteFillObject, borderRadius: 12, backgroundColor: 'rgba(18,11,10,0.6)', alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  overlayText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', lineHeight: 18 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, marginTop: 3 },
});
