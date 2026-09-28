import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, share } from '../constants/theme';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE, VINSTER_APP_STORE_URL } from '../constants/share';
import { wineHeaderLine } from '../utils/wineHeader';

// Branded card for sharing a single wine review out of Your Wine
// Reviews. Mirrors WineListShareCard's frame, fonts and palette so the
// two share surfaces feel like one family. Rendered off-screen by the
// chosen.tsx screen, captured with react-native-view-shot, and passed
// to the native share sheet so users can post to WhatsApp / Instagram
// etc. — replaces the previous plain-text Share.share path.

interface Props {
  // Wine identity
  producer: string | null | undefined;
  wineName: string;
  vintage: string | number | null | undefined;
  region?: string | null;

  // Review content
  userScore: number | null;
  criticScore?: number | null;
  flavourProfile?: string | null;     // tasting one-liner (when present)
  tastingNote?: string | null;        // the user's own note
  otherObservations?: string | null;

  // Stamp
  date: string | null;                // pre-formatted "19 May 2026"
  location: string | null;            // pre-formatted "Marco's, Soho"
  isFavourite?: boolean;
}

export const WineReviewShareCard = forwardRef<View, Props>(
  ({ producer, wineName, vintage, region, userScore, criticScore, flavourProfile, tastingNote, otherObservations, date, location, isFavourite }, ref) => {
    const header = wineHeaderLine(producer, wineName, vintage);
    const stamp = [date, location].filter(Boolean).join(' · ');

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Real Wine Experience, AI Delivered</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>My Wine Review</Text>

          {stamp ? (
            <Text style={styles.stamp} numberOfLines={2}>{stamp}</Text>
          ) : null}

          <View style={styles.wineBlock}>
            <Text style={styles.wineName} numberOfLines={3}>
              {isFavourite ? <Text style={styles.favouriteStar}>★ </Text> : null}
              {header}
            </Text>
            {region ? <Text style={styles.wineDetail} numberOfLines={2}>{region}</Text> : null}

            {(userScore != null || criticScore != null) ? (
              <View style={styles.scoresRow}>
                {userScore != null ? (
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreNumber}>{userScore}<Text style={styles.scoreUnit}> /100</Text></Text>
                    <Text style={styles.scoreLabel}>My Score</Text>
                  </View>
                ) : null}
                {criticScore != null ? (
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreNumber}>{criticScore}<Text style={styles.scoreUnit}> pts</Text></Text>
                    <Text style={styles.scoreLabel}>Critic Score</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {flavourProfile ? (
              <Text style={styles.flavourLine} numberOfLines={3}>{flavourProfile}</Text>
            ) : null}

            {tastingNote && tastingNote.trim() ? (
              <Text style={styles.noteBody} numberOfLines={8}>“{tastingNote.trim()}”</Text>
            ) : null}

            {otherObservations && otherObservations.trim() ? (
              <Text style={styles.observationsBody} numberOfLines={6}>{otherObservations.trim()}</Text>
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

// Styles copied 1:1 from WineListShareCard's gold-on-terracotta frame
// so the two cards read as one family when a friend sees a Vinster
// share in a chat thread.
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
  divider: { height: 1, backgroundColor: share.brandDim, marginVertical: 36 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: share.brand, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 16 },
  stamp: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: share.ink, textAlign: 'center', marginBottom: 32 },
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
  favouriteStar: { color: share.brand },
  wineDetail: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: share.ink, lineHeight: 38 },
  scoresRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  scoreBox: { borderWidth: 1, borderColor: share.brandDim, borderRadius: 14, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'flex-start' },
  scoreNumber: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: share.gold },
  scoreUnit: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: share.gold },
  scoreLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: share.inkMuted, textTransform: 'uppercase', letterSpacing: 2, marginTop: 4 },
  flavourLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 28, color: share.brand, lineHeight: 36, marginTop: 4 },
  noteBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: share.ink, lineHeight: 40, marginTop: 4 },
  observationsBody: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 26, color: share.ink, lineHeight: 34 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: share.brand, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.inkMuted, marginTop: 8, textAlign: 'center' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: share.brand, marginTop: 8, letterSpacing: 0.5, textDecorationLine: 'underline' },
});
