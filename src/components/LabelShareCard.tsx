import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing a wine LABEL out of Your Label Library. Same
// gold-on-terracotta frame, fonts and footer as WineReviewShareCard so every
// Vinster share reads as one family — but the hero is the label photo itself,
// with the wine name, a date/location stamp and the user's optional note.
// Rendered off-screen by labels.tsx, captured with react-native-view-shot.

interface Props {
  imageUrl: string | null;   // signed URL for the label photo
  wineName: string;          // pre-built "Producer · Wine · Vintage"
  stamp: string | null;      // pre-formatted "13 July 2026 · Soho"
  note: string | null;       // the user's optional note
}

export const LabelShareCard = forwardRef<View, Props>(({ imageUrl, wineName, stamp, note }, ref) => {
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>VINSTER</Text>
          <Text style={styles.brandTagline}>Your AI Sommelier</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subhead}>Wine Label</Text>

        <View style={styles.imageFrame}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.imageFallback}>
              <Text style={styles.imageFallbackText} numberOfLines={4}>{wineName}</Text>
            </View>
          )}
        </View>

        <Text style={styles.wineName} numberOfLines={3}>{wineName}</Text>
        {stamp ? <Text style={styles.stamp} numberOfLines={2}>{stamp}</Text> : null}
        {note && note.trim() ? <Text style={styles.note} numberOfLines={8}>“{note.trim()}”</Text> : null}

        <View style={styles.footer}>
          <Text style={styles.footerLine}>{VINSTER_GET_LABEL}</Text>
          <Text style={styles.footerCta}>{VINSTER_TAGLINE}</Text>
        </View>
      </View>
    </View>
  );
});

const CARD_WIDTH = 1080;

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: colors.background, padding: 28 },
  inner: {
    borderWidth: 4,
    borderColor: colors.gold,
    borderRadius: 36,
    paddingHorizontal: 72,
    paddingVertical: 72,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  topRow: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 72, color: '#FFFFFF', letterSpacing: 14 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: 'rgba(255,255,255,0.70)', marginTop: 8, letterSpacing: 1.5 },
  divider: { height: 1, alignSelf: 'stretch', backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: 36 },
  subhead: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, color: colors.gold, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 28 },
  // Cream mat around the label photo — mirrors LabelThumb's framed look.
  imageFrame: { backgroundColor: colors.cream, borderRadius: 20, padding: 20 },
  image: { width: 560, height: 720, borderRadius: 8 },
  imageFallback: { width: 560, height: 720, borderRadius: 8, backgroundColor: colors.creamDim, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  imageFallbackText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 36, color: colors.surface, textAlign: 'center' },
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 46, color: '#FFFFFF', lineHeight: 54, textAlign: 'center', marginTop: 40 },
  stamp: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 16 },
  note: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: '#FFFFFF', lineHeight: 42, textAlign: 'center', marginTop: 28 },
  footer: { alignItems: 'center', marginTop: 48 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
});
