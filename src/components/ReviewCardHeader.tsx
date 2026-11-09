import { ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { DateInput } from './DateInput';
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
  thumbnail, producer, wineName, vintage, region, grape, onPressTitle,
}: {
  thumbnail: ReactNode;
  // When set, the wine identity is tappable (no visible edit affordance) —
  // used on a first review so the user can fix the name or add a vintage.
  onPressTitle?: () => void;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  grape?: string | null;
}) {
  return (
    <View style={styles.row}>
      {thumbnail ? <View style={styles.thumbFrame}>{thumbnail}</View> : null}
      {onPressTitle ? (
        <TouchableOpacity style={styles.textCol} onPress={onPressTitle} activeOpacity={0.7} accessibilityRole="button" accessibilityLabel="Edit wine details">
          <WineIdentityHeader
            producer={producer}
            wineName={wineName}
            vintage={vintage != null ? String(vintage) : null}
            region={region}
            grape={grape}
            align="left"
            size="lg"
          />
        </TouchableOpacity>
      ) : (
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
      )}
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

// The line under the wine header on the review input screens: date · city ·
// venue, each editable in place (replaces "Reviewed <date> · <location>" plus the
// separate Date and Location fields).
export function ReviewedLineEditable({ date, onDate, city, onCity, venue, onVenue, currency }: {
  date: string; onDate: (iso: string) => void;
  city: string; onCity: (v: string) => void;
  venue: string; onVenue: (v: string) => void;
  currency?: string | null;
}) {
  return (
    <View style={styles.editLine}>
      <DateInput style={[styles.editField, styles.editDate]} valueIso={date} onChangeIso={onDate} currency={currency ?? undefined} placeholderTextColor={colors.textMuted} />
      <Text style={styles.editDot}>·</Text>
      <TextInput style={styles.editField} value={city} onChangeText={onCity} placeholder="City" placeholderTextColor={colors.textMuted} />
      <Text style={styles.editDot}>·</Text>
      <TextInput style={[styles.editField, styles.editVenue]} value={venue} onChangeText={onVenue} placeholder="Venue" placeholderTextColor={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  textCol: { flex: 1 },
  // Cream frame around the label photo — matches LabelThumb's frame and the
  // cellar wine card, so the thumbnail reads as a framed picture, not a cut-out.
  thumbFrame: { backgroundColor: colors.cream, padding: 4, borderRadius: 8 },
  stamp: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  editLine: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 6, rowGap: 4, marginBottom: spacing.md },
  editField: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, textAlign: 'center', minWidth: 64, paddingVertical: 3, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: 'rgba(224,184,74,0.5)' },
  editDate: { minWidth: 92 },
  editVenue: { minWidth: 96 },
  editDot: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted },
});
