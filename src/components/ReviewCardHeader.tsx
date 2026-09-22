import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WineIdentityHeader } from './WineIdentityHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shared header for every review INPUT/EDIT screen, laid out exactly like the
// cellar wine card: the label thumbnail (in its cream frame) on the LEFT and the
// wine identity (title / region / grape) on the RIGHT. The "Reviewed <date> ·
// <location>" line is NOT here — it sits below the header's separator via the
// separate <ReviewedStamp/> export. The thumbnail is passed in so each screen
// keeps its own photo-add behaviour; it's wrapped in a cream frame here so it
// matches the cellar card and never reads as a raw "cut-out" image.
export function ReviewCardHeader({
  thumbnail, producer, wineName, vintage, region, grape,
}: {
  thumbnail: ReactNode;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  grape?: string | null;
}) {
  return (
    <View style={styles.row}>
      {thumbnail ? <View style={styles.thumbFrame}>{thumbnail}</View> : null}
      <View style={styles.textCol}>
        <WineIdentityHeader
          producer={producer}
          wineName={wineName}
          vintage={vintage != null ? String(vintage) : null}
          region={region}
          grape={grape}
          align="left"
          size="lg"
        />
      </View>
    </View>
  );
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

// "Reviewed <date> · <location>" — rendered BELOW the header separator, above the
// review inputs. Font sized to match the input fields. Updates live from the
// date/location fields below.
export function ReviewedStamp({ dateIso, location }: { dateIso?: string | null; location?: string | null }) {
  const dateStr = fmtDate(dateIso);
  const text = [dateStr ? `Reviewed ${dateStr}` : '', (location ?? '').trim()].filter(Boolean).join(' · ');
  if (!text) return null;
  return <Text style={styles.stamp}>{text}</Text>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  textCol: { flex: 1 },
  // Cream frame around the label photo — matches LabelThumb's frame and the
  // cellar wine card, so the thumbnail reads as a framed picture, not a cut-out.
  thumbFrame: { backgroundColor: colors.cream, padding: 4, borderRadius: 8 },
  stamp: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
});
