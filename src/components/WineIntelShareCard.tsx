import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';
import { wineHeaderLine } from '../utils/wineHeader';

// Branded card for sharing a wine's Vinster "intelligence" — critic score,
// drinking window, estimated value and Vinster's tasting note — out of the
// cellar wine card. Mirrors WineReviewShareCard's gold-on-terracotta frame,
// fonts and palette so every Vinster share reads as one family. Rendered
// off-screen, captured with react-native-view-shot and handed to the native
// share sheet. All values arrive pre-formatted (e.g. "£45", "2024–2032") so
// this card stays presentational.

interface Props {
  // Wine identity
  producer: string | null | undefined;
  wineName: string | null | undefined;
  vintage: string | number | null | undefined;
  region?: string | null;
  grape?: string | null;

  // Intelligence
  criticScore?: number | null;
  drinkingWindow?: string | null;   // pre-formatted "2024–2032" or a status label
  estimatedValue?: string | null;   // pre-formatted "£45"
  tastingNote?: string | null;      // Vinster's AI tasting note
}

export const WineIntelShareCard = forwardRef<View, Props>(
  ({ producer, wineName, vintage, region, grape, criticScore, drinkingWindow, estimatedValue, tastingNote }, ref) => {
    const header = wineHeaderLine(producer, wineName, vintage);
    const hasStats = criticScore != null || !!drinkingWindow || !!estimatedValue;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Your AI Sommelier</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>Wine Intelligence</Text>

          <View style={styles.wineBlock}>
            <Text style={styles.wineName} numberOfLines={3}>{header}</Text>
            {region ? <Text style={styles.wineDetail} numberOfLines={2}>{region}</Text> : null}
            {grape ? <Text style={styles.grapeLine} numberOfLines={2}>{grape}</Text> : null}

            {hasStats ? (
              <View style={styles.statsRow}>
                {criticScore != null ? (
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{criticScore}<Text style={styles.statUnit}> pts</Text></Text>
                    <Text style={styles.statLabel}>Critic Score</Text>
                  </View>
                ) : null}
                {drinkingWindow ? (
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{drinkingWindow}</Text>
                    <Text style={styles.statLabel}>Drinking Window</Text>
                  </View>
                ) : null}
                {estimatedValue ? (
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>{estimatedValue}</Text>
                    <Text style={styles.statLabel}>Estimated Value</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {tastingNote && tastingNote.trim() ? (
              <Text style={styles.noteBody} numberOfLines={10}>{tastingNote.trim()}</Text>
            ) : null}
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

// Styles mirror WineReviewShareCard 1:1 so the share surfaces feel identical.
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
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: colors.gold, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 16 },
  wineBlock: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 36,
    backgroundColor: 'rgba(0,0,0,0.12)',
    gap: 16,
  },
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', lineHeight: 52 },
  wineDetail: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: 'rgba(255,255,255,0.85)', lineHeight: 38 },
  grapeLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, color: colors.gold, lineHeight: 36 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 8 },
  statBox: { borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)', borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'flex-start' },
  statValue: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 40, color: colors.gold },
  statUnit: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: 'rgba(224,184,74,0.85)' },
  statLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  noteBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: '#FFFFFF', lineHeight: 40, marginTop: 4 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
});
