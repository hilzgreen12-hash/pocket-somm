import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { ShareCardHeader } from './ShareCardHeader';

// Branded card for sharing a restaurant visit out of Your Restaurants
// Reviews. Mirrors WineListShareCard / WineReviewShareCard so the share
// surfaces feel like one family. Order: venue stamp, the visit's photo, the
// note, compact star ratings, then the wines. `onImageReady` fires once the
// photo has loaded (or failed) so the caller snapshots only after it's drawn.

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
  ratingGlassware: number | null;
  ratingValue: number | null;
  note: string | null;
  wines: WineRow[];                           // wines chosen on this visit
  imageUri?: string | null;                   // resolved local uri for the venue photo
  onImageReady?: () => void;
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
  ({ restaurantName, city, date, ratingOverall, ratingFood, ratingService, ratingWineList, ratingAtmosphere, ratingGlassware, ratingValue, note, wines, imageUri, onImageReady }, ref) => {
    const stampLocation = [restaurantName, city].filter(Boolean).join(' · ');
    const hasAnyRating = ratingOverall != null || ratingFood != null || ratingService != null || ratingWineList != null || ratingAtmosphere != null || ratingGlassware != null || ratingValue != null;

    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <ShareCardHeader title="My Restaurant Review" />

          <View style={styles.stamp}>
            <Text style={styles.stampName} numberOfLines={2}>{stampLocation}</Text>
            {date ? <Text style={styles.stampDate}>{date}</Text> : null}
          </View>

          {imageUri ? (
            <View style={styles.photoFrame}>
              <Image source={{ uri: imageUri }} style={styles.photo} resizeMode="cover" onLoad={onImageReady} onError={onImageReady} />
            </View>
          ) : null}

          {note && note.trim() ? (
            <Text style={styles.noteBody} numberOfLines={8}>“{note.trim()}”</Text>
          ) : null}

          {hasAnyRating ? (
            <View style={styles.ratingsBlock}>
              <StarRow label="Overall"   value={ratingOverall} />
              <StarRow label="Food"      value={ratingFood} />
              <StarRow label="Wine list" value={ratingWineList} />
              <StarRow label="Service"   value={ratingService} />
              <StarRow label="Atmosphere" value={ratingAtmosphere} />
              <StarRow label="Glassware" value={ratingGlassware} />
              <StarRow label="Value"     value={ratingValue} />
            </View>
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
  stamp: { alignItems: 'center', marginBottom: 32, gap: 8 },
  photoFrame: { width: '100%', height: 480, borderRadius: 22, borderWidth: 2, borderColor: share.brand, overflow: 'hidden', marginBottom: 28, backgroundColor: 'rgba(127,79,76,0.06)' },
  photo: { width: '100%', height: '100%' },
  stampName: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 44, color: share.ink, textAlign: 'center', lineHeight: 52 },
  stampDate: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: share.brand, textTransform: 'uppercase', letterSpacing: 2.5 },
  // Compact two-column ratings — secondary to the note, so kept small.
  ratingsBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    borderWidth: 1,
    borderColor: share.brandDim,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 20,
    marginBottom: 32,
  },
  ratingRow: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: share.ink, textTransform: 'uppercase', letterSpacing: 2 },
  ratingStars: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: share.gold, letterSpacing: 2 },
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
});
