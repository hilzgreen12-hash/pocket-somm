import { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WineIdentityHeader } from './WineIdentityHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shared header for every review INPUT/EDIT screen, laid out exactly like the
// cellar wine card: a centred "Reviewed <date> · <location>" stamp on top (the
// review equivalent of the card's "Cellared <date>"), then the label thumbnail
// on the left and the wine identity (title / region / grape) on the right.
// The thumbnail is passed in so each screen keeps its own photo-add behaviour.
function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export function ReviewCardHeader({
  thumbnail, producer, wineName, vintage, region, grape, dateIso, location,
}: {
  thumbnail: ReactNode;
  producer?: string | null;
  wineName?: string | null;
  vintage?: string | number | null;
  region?: string | null;
  grape?: string | null;
  dateIso?: string | null;
  location?: string | null;
}) {
  const dateStr = fmtDate(dateIso);
  // "Reviewed <date> · <location>" — either part may be absent early on; the
  // stamp updates live as the user fills the date/location fields below.
  const stamp = [dateStr ? `Reviewed ${dateStr}` : '', (location ?? '').trim()].filter(Boolean).join(' · ');
  return (
    <View>
      {stamp ? <Text style={styles.stamp}>{stamp}</Text> : null}
      <View style={styles.row}>
        {thumbnail}
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
    </View>
  );
}

const styles = StyleSheet.create({
  stamp: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  textCol: { flex: 1 },
});
