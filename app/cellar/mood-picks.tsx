import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { PairMasthead } from '../../src/components/PairMasthead';
import { WineIdentityHeader } from '../../src/components/WineIdentityHeader';
import { useMoodPicksStore, type MoodPickView } from '../../src/stores/moodPicksStore';
import { currencySymbol } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const WINDOW_LABEL: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching',
  peak: 'At Peak',
  declining: 'Declining',
};

function windowValue(w: MoodPickView['wine']): string {
  const from = w.drinking_window_from;
  const to = w.drinking_window_to;
  if (from && to) return `${from}–${to}`;
  if (to) return `to ${to}`;
  if (from) return `from ${from}`;
  return '—';
}

function PickCard({ pick }: { pick: MoodPickView }) {
  const w = pick.wine;
  const score = w.critic_score != null ? String(w.critic_score) : '—';
  const value = w.estimated_value != null
    ? `${currencySymbol(w.estimated_value_currency ?? 'GBP')}${Math.round(w.estimated_value)}`
    : '—';
  const winLabel = WINDOW_LABEL[w.drinking_window_status] ?? '';

  return (
    <View style={styles.card}>
      <Text style={styles.rank}>{pick.rank}</Text>
      <WineIdentityHeader
        producer={w.producer}
        wineName={w.wine_name}
        vintage={w.vintage}
        region={w.region}
        grape={w.grape_variety}
        align="center"
        size="md"
      />

      {/* Score · Est. Value · Drinking Window — mirrors the Wine Intel stat bar. */}
      <View style={styles.statBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{score}</Text>
          <Text style={styles.statLabel}>Vinster Score</Text>
        </View>
        <Text style={styles.statSep}>•</Text>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>Est. Value</Text>
        </View>
        <Text style={styles.statSep}>•</Text>
        <View style={styles.stat}>
          <Text style={styles.statWindow}>{windowValue(w)}</Text>
          <Text style={styles.statLabel}>{winLabel || 'Drinking Window'}</Text>
        </View>
      </View>

      <Text style={styles.why}><Text style={styles.whyLabel}>Why tonight: </Text>{pick.why}</Text>

      {w.insider_note?.trim() ? (
        <>
          <Text style={styles.sectionLabel}>The Inside Line</Text>
          <Text style={styles.body}>{w.insider_note.trim()}</Text>
        </>
      ) : null}

      {w.tasting_notes?.trim() ? (
        <>
          <Text style={styles.sectionLabel}>Tasting Note</Text>
          <Text style={styles.tastingNote}>{w.tasting_notes.trim()}</Text>
        </>
      ) : null}

      <TouchableOpacity onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.7} style={styles.findRow}>
        <Text style={styles.findLink}>Find it in your cellar →</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function MoodPicksScreen() {
  const { mood, picks } = useMoodPicksStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80, paddingTop: 56 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backLink}>←</Text>
      </TouchableOpacity>

      <PairMasthead
        eyebrow="Tonight's Cellar Picks"
        sub="Chosen for your mood, from your cellar"
        title={mood ? `“${mood}”` : 'Your Cellar Picks'}
      />

      {picks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Vinster couldn't find a match this time. Try describing your mood — the weather, the meal, the wine style you fancy.</Text>
        </View>
      ) : (
        <View style={styles.section}>
          {picks.map((p, i) => <PickCard key={p.wine.id + i} pick={p} />)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backLink: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, padding: spacing.md, marginBottom: spacing.md },
  rank: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center', marginBottom: spacing.sm },
  // Stat bar — faded top/bottom rules + dot separators, per the Wine Intel card.
  statBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderTopWidth: 1, borderBottomWidth: 1, borderTopColor: colors.divider, borderBottomColor: colors.divider, paddingVertical: spacing.sm, marginVertical: spacing.md },
  stat: { flex: 1, alignItems: 'center' },
  statSep: { fontSize: 22, color: colors.gold, opacity: 0.6 },
  statValue: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  statWindow: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, paddingTop: 4 },
  statLabel: { fontFamily: fonts.bodyRegular, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2, textAlign: 'center' },
  why: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: spacing.xs },
  whyLabel: { fontFamily: fonts.bodyItalic, color: colors.gold },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 2, textTransform: 'uppercase', marginTop: spacing.md, marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
  tastingNote: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  findRow: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  findLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  empty: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, alignItems: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
