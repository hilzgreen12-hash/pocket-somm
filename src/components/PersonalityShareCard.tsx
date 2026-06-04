import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { personalityBlurb } from '../utils/personalityText';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing personality sketches — 1080 wide and as tall
// as the sketch needs (a fixed height clipped longer ones). Rendered
// off-screen by the personality screen, captured at its natural size
// with react-native-view-shot, and dropped into the native share sheet.

interface Props {
  title: string | null;
  body: string;
  category: 'wine' | 'recipe';
}

export const PersonalityShareCard = forwardRef<View, Props>(({ title, body, category }, ref) => {
  const heading = category === 'wine' ? 'My Wine Personality' : 'My Foodie Personality';
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>VINSTER</Text>
          <Text style={styles.brandTagline}>Your AI Sommelier</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subhead}>{heading}</Text>

        <Text style={styles.blurb}>{personalityBlurb(category)}</Text>

        {title ? <Text style={styles.title}>{title}</Text> : null}

        <Text style={styles.body}>{body}</Text>

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
const PADDING = 90;

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
    paddingHorizontal: PADDING,
    paddingVertical: PADDING - 16,
    backgroundColor: colors.background,
  },
  topRow: {
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 64,
    color: '#FFFFFF',
    letterSpacing: 12,
  },
  brandTagline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 29,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 6,
    letterSpacing: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(224,184,74,0.55)',
    marginVertical: 36,
  },
  subhead: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: 'rgba(224,184,74,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 24,
  },
  blurb: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 30,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: 36,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 80,
    color: colors.gold,
    letterSpacing: 1,
    lineHeight: 90,
    textAlign: 'center',
    marginBottom: 40,
  },
  body: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 36,
    color: '#FFFFFF',
    lineHeight: 56,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerLine: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 26,
    color: colors.gold,
    letterSpacing: 4,
  },
  footerCta: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 24,
    color: 'rgba(255,255,255,0.70)',
    marginTop: 8,
    textAlign: 'center',
  },
  footerUrl: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
