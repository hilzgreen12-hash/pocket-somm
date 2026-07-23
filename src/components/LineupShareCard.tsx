import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing an archived night's lineup: the photo + a date (and
// location, once lineups record one) stamp + the user's memory note. Rendered
// off-screen and captured as a PNG, matching the other Vinster share surfaces.
// `onImageReady` fires once the remote photo has loaded so the caller knows it's
// safe to snapshot.

interface Props {
  imageUrl: string;
  date: string;                 // pre-formatted, e.g. "24 June 2026"
  location?: string | null;     // optional — not stored on lineups yet
  note?: string | null;
  onImageReady?: () => void;
}

export const LineupShareCard = forwardRef<View, Props>(
  ({ imageUrl, date, location, note, onImageReady }, ref) => {
    const stamp = [date, location].filter((s) => s && String(s).trim().length > 0).join(' · ');
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Your AI Sommelier</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>Our Lineup</Text>
          {stamp ? <Text style={styles.stamp}>{stamp}</Text> : null}

          <View style={styles.photoWrap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.photo}
              resizeMode="cover"
              onLoad={onImageReady}
              onError={onImageReady}
            />
          </View>

          {note && note.trim() ? <Text style={styles.note} numberOfLines={8}>“{note.trim()}”</Text> : null}

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
  card: { width: CARD_WIDTH, backgroundColor: colors.background, padding: 28 },
  inner: {
    borderWidth: 4,
    borderColor: colors.gold,
    borderRadius: 36,
    paddingHorizontal: 64,
    paddingVertical: 64,
    backgroundColor: colors.background,
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 72, color: '#FFFFFF', letterSpacing: 14 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: 'rgba(255,255,255,0.70)', marginTop: 8, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: 32 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 38, color: colors.gold, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center' },
  stamp: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 10 },
  photoWrap: {
    marginTop: 32,
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  photo: { width: '100%', height: 660 },
  note: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: '#FFFFFF', lineHeight: 44, marginTop: 32, textAlign: 'center' },
  footer: { alignItems: 'center', marginTop: 40 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
});
