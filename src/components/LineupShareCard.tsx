import { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { share } from '../constants/theme';
import { ShareCardHeader } from './ShareCardHeader';

// Branded card for sharing an archived night's lineup: the photo + the user's
// memory note under the lineup's title, its venue · city and its date. Rendered off-screen and
// captured as a PNG, matching the other Vinster share surfaces. `onImageReady`
// fires once the remote photo has loaded so the caller knows it's safe to
// snapshot.

interface Props {
  imageUrl: string;
  name?: string | null;         // the user's name for this lineup
  venue?: string | null;
  city?: string | null;
  date: string;                 // pre-formatted, e.g. "24 June 2026"
  note?: string | null;
  // The lineup's bottles, listed beneath the note.
  wines?: { producer: string | null; wine_name: string; vintage: string | number | null; count: number; region?: string | null }[];
  onImageReady?: () => void;
}

// "Louis Roederer · Cristal 2012" — the producer is left out when the wine's
// name already says it ("Château Plince").
function wineLine(w: { producer: string | null; wine_name: string; vintage: string | number | null }): string {
  const producer = w.producer?.trim() || '';
  const name = w.wine_name?.trim() || '';
  const repeats = !!producer && name.toLowerCase().startsWith(producer.toLowerCase());
  const label = [repeats ? '' : producer, name].filter(Boolean).join(' · ');
  return w.vintage ? `${label} ${w.vintage}` : label;
}

export const LineupShareCard = forwardRef<View, Props>(
  ({ imageUrl, name, venue, city, date, note, wines = [], onImageReady }, ref) => {
    const venueName = venue?.trim() || '';
    const lineupName = name?.trim() || '';
    // Three lines: the lineup's own title, then where (venue · city), then when.
    // With no title the venue leads instead, so it isn't repeated beneath.
    const title = lineupName || venueName || 'Your Lineup';
    const place = [lineupName ? venueName : '', city?.trim()].filter(Boolean).join(' · ');
    return (
      <View ref={ref} collapsable={false} style={styles.card}>
        <View style={styles.inner}>
          <ShareCardHeader title={title} />
          {place ? <Text style={styles.place}>{place}</Text> : null}
          {date ? <Text style={styles.date}>{date}</Text> : null}

          <View style={styles.photoWrap}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.photo}
              resizeMode="cover"
              onLoad={onImageReady}
              onError={onImageReady}
            />
          </View>

          {note && note.trim() ? <Text style={styles.note} numberOfLines={8}>“{note.trim()}”</Text> : null}

          {wines.length > 0 ? (
            <View style={styles.winesBlock}>
              <Text style={styles.winesLabel}>The Lineup</Text>
              {wines.slice(0, 10).map((w, i) => (
                <Text key={i} style={styles.wineLine} numberOfLines={2}>
                  {w.count > 1 ? `${w.count}× ` : ''}{wineLine(w)}
                  {/* Where it's from, when the lineup knows ("Pomerol, Bordeaux"). */}
                  {w.region?.trim() ? <Text style={styles.wineRegion}>{`  ${w.region.trim()}`}</Text> : null}
                </Text>
              ))}
              {wines.length > 10 ? <Text style={styles.wineMore}>+ {wines.length - 10} more</Text> : null}
            </View>
          ) : null}
        </View>
      </View>
    );
  },
);

const CARD_WIDTH = 1080;

const styles = StyleSheet.create({
  winesBlock: { marginTop: 36, gap: 8 },
  winesLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 28, color: share.brand, textTransform: 'uppercase', letterSpacing: 4, textAlign: 'center', marginBottom: 6 },
  wineLine: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 30, lineHeight: 38, color: share.ink, textAlign: 'center' },
  wineRegion: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.brand },
  wineMore: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 26, color: share.inkMuted, textAlign: 'center' },
  card: { width: CARD_WIDTH, backgroundColor: share.bg, padding: 28 },
  inner: {
    borderWidth: 4,
    borderColor: share.brand,
    borderRadius: 36,
    paddingHorizontal: 64,
    paddingVertical: 64,
    backgroundColor: share.bg,
  },
  place: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 34, color: share.ink, textAlign: 'center', marginTop: -4 },
  date: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 24, color: share.brand, textTransform: 'uppercase', letterSpacing: 2.5, textAlign: 'center', marginTop: 6 },
  photoWrap: {
    marginTop: 24,
    borderWidth: 2,
    borderColor: share.brand,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: share.bg,
  },
  photo: { width: '100%', height: 660 },
  note: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 32, color: share.ink, lineHeight: 44, marginTop: 32, textAlign: 'center' },
});
