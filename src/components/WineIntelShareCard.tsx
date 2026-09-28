import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE, VINSTER_APP_STORE_URL } from '../constants/share';
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

  // Label photo — a resolved local uri (caller pre-resolves the stored path so the
  // off-screen capture includes it). Omitted → the card renders without a photo.
  imageUri?: string | null;
}

export const WineIntelShareCard = forwardRef<View, Props>(
  ({ producer, wineName, vintage, region, grape, criticScore, drinkingWindow, estimatedValue, tastingNote, imageUri }, ref) => {
    const header = wineHeaderLine(producer, wineName, vintage);
    const hasStats = criticScore != null || !!drinkingWindow || !!estimatedValue;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Real Wine Experience, AI Delivered</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>Wine Intelligence</Text>

          {imageUri ? (
            <View style={styles.photoFrame}>
              <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" />
            </View>
          ) : null}

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
            <Text style={styles.footerUrl}>{VINSTER_APP_STORE_URL.replace(/^https?:\/\//, '')}</Text>
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
    backgroundColor: share.bg,
    padding: 28,
  },
  inner: {
    borderWidth: 4,
    borderColor: share.brand,
    borderRadius: 36,
    paddingHorizontal: 72,
    paddingVertical: 72,
    backgroundColor: share.bg,
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 72, color: share.brand, letterSpacing: 14 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.inkMuted, marginTop: 8, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: share.rule, marginVertical: 36 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: share.brand, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 16 },
  photoFrame: { alignSelf: 'center', width: 520, height: 560, borderRadius: 22, borderWidth: 2, borderColor: share.brand, overflow: 'hidden', marginBottom: 28, backgroundColor: 'rgba(127,79,76,0.06)' },
  photo: { width: '100%', height: '100%' },
  wineBlock: {
    borderWidth: 2,
    borderColor: share.brand,
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 36,
    backgroundColor: 'rgba(127,79,76,0.06)',
    gap: 16,
  },
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: share.ink, lineHeight: 52 },
  wineDetail: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: share.ink, lineHeight: 38 },
  grapeLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, color: share.brand, lineHeight: 36 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 24, marginTop: 8 },
  statBox: { borderWidth: 1, borderColor: share.brandDim, borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'flex-start' },
  statValue: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 40, color: share.gold },
  statUnit: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: share.gold },
  statLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: share.inkMuted, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  noteBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: share.ink, lineHeight: 40, marginTop: 4 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: share.brand, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.inkMuted, marginTop: 8, textAlign: 'center' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: share.brand, marginTop: 8, letterSpacing: 0.5, textDecorationLine: 'underline' },
});
