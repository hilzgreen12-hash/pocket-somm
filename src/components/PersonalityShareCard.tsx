import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, share } from '../constants/theme';
import { personalityBlurb } from '../utils/personalityText';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing personality sketches — 1080 wide and as tall
// as the sketch needs (a fixed height clipped longer ones). Rendered
// off-screen by the personality screen, captured at its natural size
// with react-native-view-shot, and dropped into the native share sheet.

interface Props {
  title: string | null;
  body: string;
  category: 'wine' | 'recipe' | 'alter-ego';
}

export const PersonalityShareCard = forwardRef<View, Props>(({ title, body, category }, ref) => {
  const heading = category === 'wine' ? 'My Wine Personality' : category === 'recipe' ? 'My Foodie Personality' : 'My Vinster Alter-Ego';
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>VINSTER</Text>
          <Text style={styles.brandTagline}>Real Wine Experience, AI Delivered</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.subhead}>{heading}</Text>

        <Text style={styles.blurb}>{personalityBlurb(category)}</Text>

        {title ? <Text style={styles.title}>{title}</Text> : null}

        <Text style={styles.body}>{body}</Text>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>{VINSTER_GET_LABEL}</Text>
          <Text style={styles.footerCta}>{VINSTER_TAGLINE}</Text>
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
    backgroundColor: share.bg,
    padding: 28,
  },
  inner: {
    borderWidth: 4,
    borderColor: share.brand,
    borderRadius: 36,
    paddingHorizontal: PADDING,
    paddingVertical: PADDING - 16,
    backgroundColor: share.bg,
  },
  topRow: {
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 64,
    color: share.ink,
    letterSpacing: 12,
  },
  brandTagline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 29,
    color: share.inkMuted,
    marginTop: 6,
    letterSpacing: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: share.brandDim,
    marginVertical: 36,
  },
  subhead: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: share.gold,
    textTransform: 'uppercase',
    letterSpacing: 6,
    textAlign: 'center',
    marginBottom: 24,
  },
  blurb: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 30,
    color: share.ink,
    lineHeight: 42,
    textAlign: 'center',
    marginBottom: 36,
  },
  title: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 80,
    color: share.brand,
    letterSpacing: 1,
    lineHeight: 90,
    textAlign: 'center',
    marginBottom: 40,
  },
  body: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 36,
    color: share.ink,
    lineHeight: 56,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerLine: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 26,
    color: share.brand,
    letterSpacing: 4,
  },
  footerCta: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 24,
    color: share.inkMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  footerUrl: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: share.ink,
    marginTop: 8,
    letterSpacing: 0.5,
  },
});
