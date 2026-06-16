import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { currencySymbol } from '../constants/currency';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';
import type { WineRecommendation } from '../types/wine';

// Branded card for sharing wine recommendations from the List flow.
// 1080 wide and as tall as the three picks need — earlier the card was
// pinned at 1080×1350 with flex justify-between, which left awkward
// empty space at the top and bottom and forced the wine text down to
// stay readable. Now the layout packs naturally so the fonts can breathe.
// Rendered off-screen by the results screen, captured with
// react-native-view-shot, and dropped into the native share sheet so
// users can post to WhatsApp / Instagram etc.

interface Props {
  wines: WineRecommendation[];
  date: string | null;
  restaurant: string | null;
  city: string | null;
  currency?: string | null;
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

export const WineListShareCard = forwardRef<View, Props>(({ wines, date, restaurant, city, currency }, ref) => {
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
                <View style={styles.scoreCol}>
                  {w.criticScore > 0 ? (
                    <Text style={styles.scoreText}>{w.criticScore} <Text style={styles.scoreUnit}>pts</Text></Text>
                  ) : null}
                  {w.menuPrice != null ? (
                    <Text style={styles.priceText}>{currencySymbol(currency)}{w.menuPrice}</Text>
                  ) : null}
                </View>
              </View>
              <Text style={styles.wineName} numberOfLines={2}>{wineLine(w)}</Text>
              <Text style={styles.wineDetail} numberOfLines={2}>{detailLine(w)}</Text>
              {/* Flavour profile — one-line tasting note in italic
                  gold so a friend reading the share knows what the
                  wine actually tastes like, not just why Vinster
                  picked it. Omitted gracefully when the field is
                  missing (older recommendations saved before this
                  prompt change). */}
              {w.flavourProfile ? (
                <Text style={styles.wineFlavour} numberOfLines={3}>{w.flavourProfile}</Text>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>{VINSTER_GET_LABEL}</Text>
          <Text style={styles.footerCta}>{VINSTER_TAGLINE}</Text>
          <Text style={styles.footerUrl}>{VINSTER_INSTALL_URL.replace(/^https?:\/\//, '')}</Text>
        </View>
      </View>
    </View>
  );
});

const CARD_WIDTH = 1080;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    padding: 28,
  },
  inner: {
    borderWidth: 4,
    borderColor: colors.gold,
    borderRadius: 36,
    paddingHorizontal: 72,
    paddingVertical: 72,
    backgroundColor: colors.background,
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 72, color: '#FFFFFF', letterSpacing: 14 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: 'rgba(255,255,255,0.70)', marginTop: 8, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: 36 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: colors.gold, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 24 },
  stamp: { alignItems: 'center', marginBottom: 36 },
  stampDate: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: colors.gold, textTransform: 'uppercase', letterSpacing: 2.5 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: 'rgba(255,255,255,0.85)', marginTop: 8 },
  // No flex / justify-center here — content sits at its natural height so
  // the card grows to fit, no empty vertical space to fill.
  wines: { gap: 32 },
  wineRow: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 32,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  rankRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  rankLabel: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, textTransform: 'uppercase', letterSpacing: 3 },
  scoreCol: { alignItems: 'flex-end' },
  scoreText: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 40, color: '#FFFFFF' },
  scoreUnit: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 26, color: 'rgba(255,255,255,0.75)' },
  priceText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', lineHeight: 52, marginBottom: 8 },
  wineDetail: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: 'rgba(255,255,255,0.85)', lineHeight: 38 },
  wineFlavour: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, color: colors.gold, lineHeight: 36, marginTop: 14 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: '#FFFFFF', marginTop: 8, letterSpacing: 0.5 },
});
