import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, share } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';
import { wineHeaderLine } from '../utils/wineHeader';

// Branded card for sharing a cellar list (whatever the Full Cellar List is
// currently showing, after filters). Each line reads:
//   Producer · Wine Name · Appellation · Vintage        Qty × Format
// Mirrors WineListShareCard's gold-on-terracotta frame so every Vinster share
// reads as one family. Rendered off-screen and captured as a PNG. Values arrive
// pre-formatted (the format string e.g. "750ml") so the card stays
// presentational.

export interface CellarListLine {
  producer: string | null;
  wineName: string | null;
  region: string | null;     // shown as the appellation, when present
  vintage: string | null;
  quantity: number;
  format: string;            // e.g. "750ml", "Magnum"
}

interface Props {
  title: string;             // "My Cellar" / "My Archive"
  items: CellarListLine[];
  wineCount: number;
  bottleCount: number;
  filterSummary?: string | null;
}

export const CellarListShareCard = forwardRef<View, Props>(
  ({ title, items, wineCount, bottleCount, filterSummary }, ref) => {
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Real Wine Experience, AI Delivered</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>{title}</Text>
          <Text style={styles.countLine}>
            {wineCount} {wineCount === 1 ? 'wine' : 'wines'} · {bottleCount} {bottleCount === 1 ? 'bottle' : 'bottles'}
          </Text>
          {filterSummary ? <Text style={styles.filterLine}>{filterSummary}</Text> : null}

          <View style={styles.list}>
            {items.map((w, i) => {
              const identity = [wineHeaderLine(w.producer, w.wineName, null), w.region, w.vintage]
                .filter((p) => p && String(p).trim().length > 0)
                .join(' · ');
              return (
                <View key={`${i}-${identity}`} style={styles.row}>
                  <Text style={styles.rowName} numberOfLines={2}>{identity}</Text>
                  <Text style={styles.rowQty}>{w.quantity} × {w.format}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerLine}>{VINSTER_GET_LABEL}</Text>
            <Text style={styles.footerCta}>{VINSTER_TAGLINE}</Text>
          </View>
        </View>
      </View>
    );
  },
);

const CARD_WIDTH = 1080;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: share.bg,
    padding: 28,
  },
  inner: {
    borderWidth: 4,
    borderColor: share.brand,
    borderRadius: 36,
    paddingHorizontal: 64,
    paddingVertical: 64,
    backgroundColor: share.bg,
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 72, color: share.brand, letterSpacing: 14 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.inkMuted, marginTop: 8, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: share.brandDim, marginVertical: 32 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 38, color: share.brand, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center' },
  countLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: share.ink, textAlign: 'center', marginTop: 10 },
  filterLine: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: share.gold, textAlign: 'center', marginTop: 6, textTransform: 'uppercase', letterSpacing: 2 },
  list: {
    borderWidth: 2,
    borderColor: share.brand,
    borderRadius: 22,
    marginTop: 32,
    paddingVertical: 8,
    backgroundColor: 'rgba(127,79,76,0.06)',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 28, gap: 20 },
  rowName: { flex: 1, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: share.ink, lineHeight: 36 },
  rowQty: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: share.brand },
  footer: { alignItems: 'center', marginTop: 36 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: share.brand, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.inkMuted, marginTop: 8, textAlign: 'center' },
});
