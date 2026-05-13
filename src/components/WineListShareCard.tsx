import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import type { WineRecommendation } from '../types/wine';

// Branded 4:5 portrait card (1080×1350) for sharing wine recommendations
// from the List flow. Rendered off-screen by the results screen, captured
// with react-native-view-shot, and dropped into the native share sheet so
// users can post to WhatsApp / Instagram etc. to show friends what
// Vinster picked for them.

interface Props {
  wines: WineRecommendation[];
  date: string | null;
  restaurant: string | null;
  city: string | null;
}

const RANK_LABELS = ['TOP PICK', 'SECOND CHOICE', 'THIRD CHOICE'];

function wineLine(w: WineRecommendation): string {
  const vintage = w.vintage ? `${w.vintage} ` : '';
  return `${vintage}${w.name}`;
}

function detailLine(w: WineRecommendation): string {
  const parts = [w.producer, w.region, w.grape].filter(Boolean);
  return parts.join(' · ');
}

export const WineListShareCard = forwardRef<View, Props>(({ wines, date, restaurant, city }, ref) => {
  const stampLocation = [restaurant, city].filter(Boolean).join(' · ');

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>VINSTER</Text>
          <Text style={styles.brandTagline}>Your AI Sommelier</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subhead}>Vinster Recommends</Text>

        {(date || stampLocation) ? (
          <View style={styles.stamp}>
            {date ? <Text style={styles.stampDate}>{date}</Text> : null}
            {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
          </View>
        ) : null}

        <View style={styles.wines}>
          {wines.slice(0, 3).map((w, i) => (
            <View key={i} style={styles.wineRow}>
              <View style={styles.rankRow}>
                <Text style={styles.rankLabel}>{RANK_LABELS[i] ?? `#${i + 1}`}</Text>
                {w.criticScore > 0 ? (
                  <Text style={styles.scoreText}>{w.criticScore} <Text style={styles.scoreUnit}>pts</Text></Text>
                ) : null}
              </View>
              <Text style={styles.wineName} numberOfLines={2}>{wineLine(w)}</Text>
              <Text style={styles.wineDetail} numberOfLines={2}>{detailLine(w)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>DOWNLOAD VINSTER</Text>
          <Text style={styles.footerCta}>Your pocket sommelier</Text>
        </View>
      </View>
    </View>
  );
});

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1350;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.background,
    padding: 28,
  },
  inner: {
    flex: 1,
    borderWidth: 4,
    borderColor: colors.gold,
    borderRadius: 36,
    paddingHorizontal: 72,
    paddingVertical: 64,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 64, color: '#FFFFFF', letterSpacing: 12 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 29, color: 'rgba(255,255,255,0.70)', marginTop: 6, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: 28 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: colors.gold, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 20 },
  stamp: { alignItems: 'center', marginBottom: 28 },
  stampDate: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: colors.gold, textTransform: 'uppercase', letterSpacing: 2.5 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  wines: { flex: 1, gap: 28, justifyContent: 'center' },
  wineRow: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 22,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  rankRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 },
  rankLabel: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.gold, textTransform: 'uppercase', letterSpacing: 3 },
  scoreText: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 30, color: '#FFFFFF' },
  scoreUnit: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: 'rgba(255,255,255,0.75)' },
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 30, color: '#FFFFFF', lineHeight: 36, marginBottom: 6 },
  wineDetail: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 22, color: 'rgba(255,255,255,0.85)', lineHeight: 28 },
  footer: { alignItems: 'center', marginTop: 24 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 24, color: 'rgba(255,255,255,0.70)', marginTop: 6 },
});
