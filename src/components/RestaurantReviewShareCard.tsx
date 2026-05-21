import { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
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
  ({ restaurantName, city, date, ratingOverall, ratingFood, ratingService, ratingWineList, note, wines }, ref) => {
    const stampLocation = [restaurantName, city].filter(Boolean).join(' · ');
    const hasAnyRating = ratingOverall != null || ratingFood != null || ratingService != null || ratingWineList != null;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <View style={styles.topRow}>
            <Text style={styles.brand}>VINSTER</Text>
            <Text style={styles.brandTagline}>Your AI Sommelier</Text>
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
              <StarRow label="Service"   value={ratingService} />
              <StarRow label="Wine list" value={ratingWineList} />
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
            <Text style={styles.footerUrl}>{VINSTER_INSTALL_URL.replace(/^https?:\/\//, '')}</Text>
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
  stamp: { alignItems: 'center', marginBottom: 32, gap: 8 },
  stampName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: '#FFFFFF', textAlign: 'center', lineHeight: 52 },
  stampDate: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: colors.gold, textTransform: 'uppercase', letterSpacing: 2.5 },
  ratingsBlock: {
    borderWidth: 2,
    borderColor: colors.gold,
    borderRadius: 22,
    paddingHorizontal: 36,
    paddingVertical: 28,
    backgroundColor: 'rgba(0,0,0,0.12)',
    gap: 12,
    marginBottom: 32,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 30, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 3 },
  ratingStars: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 38, color: colors.gold, letterSpacing: 4 },
  ratingStarsEmpty: { color: 'rgba(224,184,74,0.35)' },
  noteBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: '#FFFFFF', lineHeight: 44, marginBottom: 32 },
  winesBlock: {
    borderWidth: 1,
    borderColor: 'rgba(224,184,74,0.55)',
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 24,
    gap: 10,
  },
  winesLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 22, color: colors.gold, textTransform: 'uppercase', letterSpacing: 3, marginBottom: 4 },
  wineLine: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 28, color: '#FFFFFF', lineHeight: 36 },
  wineScore: { fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  wineMore: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 24, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  footer: { alignItems: 'center', marginTop: 44 },
  footerLine: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.gold, letterSpacing: 4 },
  footerCta: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: 'rgba(255,255,255,0.70)', marginTop: 8, textAlign: 'center' },
  footerUrl: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: '#FFFFFF', marginTop: 8, letterSpacing: 0.5 },
});
