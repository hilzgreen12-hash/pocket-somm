import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { ShareCardHeader } from './ShareCardHeader';

// Branded card for sharing a recipe pairing — the image that goes with the
// message (the full recipe travels as a PDF link). "The Vinster Kitchen" /
// "Recipe Pairings", then the dish, its chef inspiration, timings and the wine
// it's paired with. Same frame and type as the lineup share card; captured
// off-screen as a PNG.

interface Props {
  dishName: string;
  chef?: string | null;
  servings?: number | null;
  prepTime?: string | null;
  cookTime?: string | null;
  wineLine?: string | null;
  pairingNotes?: string | null;
  // The sharer's own pairing note, added just before sharing.
  userNote?: string | null;
}

export const RecipeShareCard = forwardRef<View, Props>(
  ({ dishName, chef, servings, prepTime, cookTime, wineLine, pairingNotes, userNote }, ref) => {
    const timings = [
      servings ? `Serves ${servings}` : '',
      prepTime?.trim() ? `Prep ${prepTime.trim()}` : '',
      cookTime?.trim() ? `Cook ${cookTime.trim()}` : '',
    ].filter(Boolean).join('  ·  ');
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <ShareCardHeader title="The Vinster Kitchen" />
          <Text style={styles.sub}>Recipe Pairings</Text>

          <Text style={styles.dish}>{dishName}</Text>
          {chef?.trim() ? <Text style={styles.chef}>Inspired by {chef.trim()}</Text> : null}
          {timings ? <Text style={styles.timings}>{timings}</Text> : null}

          {wineLine?.trim() ? (
            <View style={styles.wineBlock}>
              <Text style={styles.wineLabel}>Paired With</Text>
              <Text style={styles.wine}>{wineLine.trim()}</Text>
            </View>
          ) : null}

          {pairingNotes?.trim() ? <Text style={styles.notes} numberOfLines={7}>“{pairingNotes.trim()}”</Text> : null}

          {userNote?.trim() ? (
            <View style={styles.userNoteBlock}>
              <Text style={styles.wineLabel}>Pairing Note</Text>
              <Text style={styles.userNote} numberOfLines={8}>{userNote.trim()}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

const CARD_WIDTH = 1080;

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, backgroundColor: share.bg, padding: 28 },
  inner: { borderWidth: 4, borderColor: share.brand, borderRadius: 36, paddingHorizontal: 64, paddingVertical: 64, backgroundColor: share.bg },
  sub: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 34, color: share.ink, textAlign: 'center', marginTop: -6 },
  dish: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 58, lineHeight: 68, color: share.ink, textAlign: 'center', marginTop: 48 },
  chef: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.brand, textAlign: 'center', marginTop: 14 },
  timings: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: share.brand, textTransform: 'uppercase', letterSpacing: 2.5, textAlign: 'center', marginTop: 18 },
  wineBlock: { marginTop: 44, borderTopWidth: 2, borderBottomWidth: 2, borderColor: share.brand, paddingVertical: 28, gap: 8 },
  wineLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: share.brand, textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center' },
  wine: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 38, lineHeight: 48, color: share.ink, textAlign: 'center' },
  userNoteBlock: { marginTop: 40, borderTopWidth: 2, borderColor: share.brand, paddingTop: 28, gap: 10 },
  userNote: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 34, lineHeight: 46, color: share.ink, textAlign: 'center' },
  notes: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.ink, lineHeight: 44, marginTop: 36, textAlign: 'center' },
});
