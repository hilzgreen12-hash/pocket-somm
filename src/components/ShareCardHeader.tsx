import { View, Text, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { VINSTER_TAGLINE } from '../constants/share';

// The one header every image share card opens with: a small, faded VINSTER
// wordmark + tagline, a rule, then a title saying what the card is. The card is
// about the user's wine, review or night, so the branding stays quiet and the
// title leads. Shared so it stays identical across cards. No "Get Vinster" / URL footer on the cards — a link on
// an image can't be tapped, so shareResult carries it in the message text.

export function ShareCardHeader({ title }: { title: string }) {
  return (
    <>
      <View style={styles.brandBlock}>
        <Text style={styles.brand}>VINSTER</Text>
        <Text style={styles.tagline}>{VINSTER_TAGLINE}</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.title}>{title}</Text>
    </>
  );
}

const styles = StyleSheet.create({
  brandBlock: { alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: share.brandDim, letterSpacing: 8 },
  tagline: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 19, color: share.inkMuted, marginTop: 2, letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: share.brandDim, marginTop: 22, marginBottom: 28 },
  title: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 34, lineHeight: 46, color: share.brand, textTransform: 'uppercase', letterSpacing: 6, textAlign: 'center', marginBottom: 16 },
});
