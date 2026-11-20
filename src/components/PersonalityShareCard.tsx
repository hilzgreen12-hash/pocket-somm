import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { personalityBlurb } from '../utils/personalityText';
import { ShareCardHeader } from './ShareCardHeader';

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
        <ShareCardHeader title={heading} />

        <Text style={styles.blurb}>{personalityBlurb(category)}</Text>

        {title ? <Text style={styles.title}>{title}</Text> : null}

        <Text style={styles.body}>{body}</Text>
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
  blurb: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 30,
    color: share.ink,
    lineHeight: 42,
    textAlign: 'center',
    marginTop: 8,
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
});
