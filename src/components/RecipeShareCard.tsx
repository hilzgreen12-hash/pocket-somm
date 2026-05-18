import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import type { Pairing } from '../types/wine';

// Branded card for sharing a single recipe via the native share sheet —
// 1080 wide and as tall as the recipe needs (recipes vary in length, so a
// fixed height clipped the method). Rendered off-screen by chef/results,
// captured at its natural size with react-native-view-shot, and handed to
// expo-sharing so users can email the recipe, post it to WhatsApp, etc.
//
// The bottom-right corner carries a remote QR code that points at the
// Vinster install URL — recipients can scan it to grab the app.

const INSTALL_URL = 'https://vinsterapp.com';
const QR_SIZE = 240;
const QR_URL = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_SIZE}x${QR_SIZE}&format=png&margin=0&data=${encodeURIComponent(INSTALL_URL)}`;

interface Props {
  pairing: Pairing;
  wineHeader?: string | null;
}

export const RecipeShareCard = forwardRef<View, Props>(({ pairing, wineHeader }, ref) => {
  const { recipe } = pairing;
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <View style={styles.inner}>
        <View style={styles.brandHeader}>
          <Text style={styles.brand}>VINSTER</Text>
          <Text style={styles.brandTagline}>Your AI Sommelier</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
        {wineHeader ? (
          <Text style={styles.wineHeader} numberOfLines={2}>To pair with {wineHeader}</Text>
        ) : null}

        <View style={styles.metaRow}>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>SERVES</Text>
            <Text style={styles.metaValue}>{recipe.servings}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>PREP</Text>
            <Text style={styles.metaValue}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaCell}>
            <Text style={styles.metaLabel}>COOK</Text>
            <Text style={styles.metaValue}>{recipe.cookTime}</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Ingredients</Text>
        {recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.bodyText}>· {ing}</Text>
        ))}

        <Text style={[styles.sectionHeading, { marginTop: 28 }]}>Method</Text>
        {recipe.instructions.map((step, i) => (
          <Text key={i} style={styles.bodyText}>{step}</Text>
        ))}

        <View style={styles.footer}>
          <View style={styles.footerCopy}>
            <Text style={styles.footerHeadline}>INSTALL VINSTER</Text>
            <Text style={styles.footerLine}>Scan the QR or visit</Text>
            <Text style={styles.footerUrl}>{INSTALL_URL}</Text>
            <Text style={styles.footerTagline}>Your pocket sommelier — wine, food, restaurants.</Text>
          </View>
          <View style={styles.qrWrap}>
            <Image source={{ uri: QR_URL }} style={styles.qr} />
          </View>
        </View>
      </View>
    </View>
  );
});

export const RECIPE_SHARE_QR_URL = QR_URL;
export const RECIPE_SHARE_INSTALL_URL = INSTALL_URL;

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
    paddingVertical: 60,
    backgroundColor: colors.background,
  },
  brandHeader: { alignItems: 'center', marginBottom: 18 },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 60, color: '#FFFFFF', letterSpacing: 12 },
  brandTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.75)', marginTop: 4, letterSpacing: 1.5 },
  divider: { height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginVertical: 20 },
  dishName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', lineHeight: 52, marginBottom: 4 },
  chefInspiration: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: colors.gold, marginBottom: 10 },
  wineHeader: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 22, color: 'rgba(255,255,255,0.80)', marginBottom: 18, lineHeight: 30 },
  metaRow: { flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.18)', paddingVertical: 14, marginBottom: 22 },
  metaCell: { flex: 1, alignItems: 'center' },
  metaLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold, letterSpacing: 2.5 },
  metaValue: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: '#FFFFFF', marginTop: 4 },
  sectionHeading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.gold, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 10 },
  bodyText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 22, color: '#FFFFFF', lineHeight: 32, marginBottom: 6 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(224,184,74,0.55)',
    paddingTop: 22,
    marginTop: 32,
  },
  footerCopy: { flex: 1, paddingRight: 24 },
  footerHeadline: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4, marginBottom: 4 },
  footerLine: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 20, color: 'rgba(255,255,255,0.85)' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 24, color: '#FFFFFF', marginTop: 2 },
  footerTagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: 'rgba(255,255,255,0.70)', marginTop: 8, lineHeight: 24 },
  qrWrap: {
    width: QR_SIZE,
    height: QR_SIZE,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  qr: { width: QR_SIZE - 24, height: QR_SIZE - 24 },
});
