import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing a wine's "Dive Deeper" knowledge — the four
// Vinster profiles (producer / region / vintage / grape) — out of the Wine
// Knowledge page. Mirrors WineReviewShareCard's gold-on-terracotta frame and
// fonts so all Vinster shares read as one family. This card is necessarily
// tall (four prose sections); it's rendered off-screen and captured as a PNG.

interface Props {
  headerLine: string;               // pre-built "Producer · Name · Region · Vintage"
  grape?: string | null;
  producerProfile?: string | null;
  regionProfile?: string | null;
  vintageProfile?: string | null;
  grapeProfile?: string | null;
}

export const WineKnowledgeShareCard = forwardRef<View, Props>(
  ({ headerLine, grape, producerProfile, regionProfile, vintageProfile, grapeProfile }, ref) => {
    const sections: { label: string; body: string | null | undefined }[] = [
      { label: 'Producer Profile', body: producerProfile },
      { label: 'Region Profile', body: regionProfile },
      { label: 'Vintage Profile', body: vintageProfile },
      { label: 'Grape Variety', body: grapeProfile },
    ];

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Your AI Sommelier</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>Wine Knowledge</Text>

          <Text style={styles.wineName} numberOfLines={4}>{headerLine}</Text>
          {grape ? <Text style={styles.grapeLine} numberOfLines={2}>{grape}</Text> : null}

          <View style={styles.shortDivider} />

          {sections.map((s) =>
            s.body && s.body.trim() ? (
              <View key={s.label} style={styles.section}>
                <Text style={styles.sectionLabel}>{s.label}</Text>
                <Text style={styles.body}>{s.body.trim()}</Text>
              </View>
            ) : null,
          )}

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
  wineName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', lineHeight: 52, textAlign: 'center' },
  grapeLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 30, color: colors.gold, lineHeight: 38, textAlign: 'center', marginTop: 6 },
  shortDivider: { width: 80, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', alignSelf: 'center', marginVertical: 40 },
  section: { marginBottom: 36 },
  sectionLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: colors.gold, textTransform: 'uppercase', letterSpacing: 5, marginBottom: 12 },
  body: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, color: 'rgba(255,255,255,0.92)', lineHeight: 42 },
  footer: { alignItems: 'center', marginTop: 12 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
});
