import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, share } from '../constants/theme';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../constants/share';

// Branded card for sharing a restaurant visit out of Your Restaurants
// Reviews. Mirrors WineListShareCard / WineReviewShareCard so the three
// share surfaces feel like one family — same gold-on-terracotta frame,
// same Cormorant Garamond hierarchy, same VINSTER footer. Replaces the
// previous plain-text Share.share path so a friend seeing the share
// gets a proper editorial card rather than an SMS-looking blob.

interface WineRow {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
  userScore: number | null;
}

interface Props {
  restaurantName: string;
  city: string | null;
  date: string | null;                        // pre-formatted "19 May 2026"
  ratingOverall: number | null;
  ratingFood: number | null;
  ratingService: number | null;
  ratingWineList: number | null;
  ratingAtmosphere: number | null;
  ratingValue: number | null;
  note: string | null;
  wines: WineRow[];                           // wines chosen on this visit
}

// Renders a five-star line for a rating that fits the brand palette.
function StarRow({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <Text style={styles.ratingStars}>
        {'★'.repeat(value)}
        <Text style={styles.ratingStarsEmpty}>{'☆'.repeat(5 - value)}</Text>
      </Text>
    </View>
  );
}

function wineRowLine(w: WineRow): string {
  const vintage = w.vintage ? `${w.vintage} ` : '';
  const parts = [w.producer, w.wineName].filter(Boolean);
  return `${vintage}${parts.join(' · ')}`;
}

export const RestaurantReviewShareCard = forwardRef<View, Props>(
  ({ restaurantName, city, date, ratingOverall, ratingFood, ratingService, ratingWineList, ratingAtmosphere, ratingValue, note, wines }, ref) => {
    const stampLocation = [restaurantName, city].filter(Boolean).join(' · ');
    const hasAnyRating = ratingOverall != null || ratingFood != null || ratingService != null || ratingWineList != null || ratingAtmosphere != null || ratingValue != null;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Real Wine Experience, AI Delivered</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subhead}>My Restaurant Review</Text>

          <View style={styles.stamp}>
            <Text style={styles.stampName} numberOfLines={2}>{stampLocation}</Text>
            {date ? <Text style={styles.stampDate}>{date}</Text> : null}
          </View>

          {hasAnyRating ? (
            <View style={styles.ratingsBlock}>
              <StarRow label="Overall"   value={ratingOverall} />
              <StarRow label="Food"      value={ratingFood} />
              <StarRow label="Wine list" value={ratingWineList} />
              <StarRow label="Service"   value={ratingService} />
              <StarRow label="Atmosphere" value={ratingAtmosphere} />
              <StarRow label="Value"     value={ratingValue} />
            </View>
          ) : null}

          {note && note.trim() ? (
            <Text style={styles.noteBody} numberOfLines={8}>“{note.trim()}”</Text>
          ) : null}

          {wines.length > 0 ? (
            <View style={styles.winesBlock}>
              <Text style={styles.winesLabel}>Wines I had</Text>
              {wines.slice(0, 4).map((w, i) => {
                const score = w.userScore != null ? `  ${w.userScore}/100` : '';
                return (
                  <Text key={i} style={styles.wineLine} numberOfLines={2}>
                    · {wineRowLine(w)}{score ? <Text style={styles.wineScore}>{score}</Text> : null}
                  </Text>
                );
              })}
              {wines.length > 4 ? (
                <Text style={styles.wineMore}>+ {wines.length - 4} more</Text>
              ) : null}
            </View>
          ) : null}

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
  stamp: { alignItems: 'center', marginBottom: 32, gap: 8 },
  stampName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: share.ink, textAlign: 'center', lineHeight: 52 },
  stampDate: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: share.brand, textTransform: 'uppercase', letterSpacing: 2.5 },
  ratingsBlock: {
    borderWidth: 2,
    borderColor: share.brand,
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 28,
    backgroundColor: 'rgba(127,79,76,0.06)',
    gap: 12,
    marginBottom: 32,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: share.ink, textTransform: 'uppercase', letterSpacing: 3 },
  ratingStars: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 38, color: share.gold, letterSpacing: 4 },
  ratingStarsEmpty: { color: 'rgba(181,133,42,0.30)' },
  noteBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.ink, lineHeight: 44, marginBottom: 32 },
  winesBlock: {
    borderWidth: 1,
    borderColor: share.brandDim,
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 10,
  },
  winesLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: share.brand, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 },
  wineLine: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 28, color: share.ink, lineHeight: 36 },
  wineScore: { fontFamily: 'CormorantGaramond_700Bold', color: share.brand },
  wineMore: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 24, color: share.inkMuted, marginTop: 4 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: share.brand, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.inkMuted, marginTop: 8, textAlign: 'center' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: share.ink, marginTop: 8, letterSpacing: 0.5 },
});
