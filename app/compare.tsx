import { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useCompareStore } from '../src/stores/compareStore';
import { runComparison, compareMode, type Comparison, type CompareWineInput } from '../src/api/compareWines';
import { usePreferences } from '../src/hooks/usePreferences';
import { useChosenWines } from '../src/hooks/useChosenWines';
import { SearchProgress } from '../src/components/SearchProgress';
import { isNetworkError } from '../src/api/invokeResilient';
import { wineHeaderLine } from '../src/utils/wineHeader';
import { wineNameKey } from '../src/utils/wineIdentity';
import { tidyWineRegion } from '../src/utils/regionFormat';
import { formatCurrency, currencySymbol } from '../src/constants/currency';
import { colors, spacing } from '../src/constants/theme';
import { fonts } from '../src/constants/fonts';

// Compare Wines or Vintages — results. The wines come from Home's Compare
// Wines pop-up (compareStore). Shows the Vintage & Market Comparison table,
// drink now / lay down / best value, the market (and, for different wines,
// region & grape) comparison, the Inside Line, then a detailed card per wine.

const STATUS: Record<string, string> = { too_young: 'Too Young', approaching: 'Approaching', peak: 'Peak Now', declining: 'Declining' };

export default function CompareScreen() {
  useKeepAwake();
  const wines = useCompareStore((s) => s.wines);
  const { preferences } = usePreferences();
  const { chosenWines } = useChosenWines();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const mode = compareMode(wines);
  const [data, setData] = useState<Comparison | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (wines.length < 2) { router.back(); return; }
    let active = true;
    setData(null);
    setError(null);
    runComparison(wines, currency)
      .then((d) => { if (active) setData(d); })
      .catch((e) => {
        if (!active) return;
        setError(isNetworkError(e)
          ? "Vinster couldn't reach the internet. Find better reception and try again."
          : e instanceof Error ? e.message : "Vinster couldn't compare these wines just now. Please try again.");
      });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // The user's own most recent review of each wine + vintage, if any.
  const myReviews = useMemo(() => wines.map((w) => {
    const key = wineNameKey(w.producer, w.wineName);
    const mine = chosenWines.filter((c) => !c.wishlist && wineNameKey(c.producer, c.wine_name) === key
      && String(c.vintage ?? 'NV').trim().toUpperCase() === w.vintage.toUpperCase()
      && (!!(c.tasting_note && c.tasting_note.trim()) || c.user_score != null));
    if (!mine.length) return null;
    return [...mine].sort((a, b) => new Date(b.reviewed_at ?? b.chosen_at).getTime() - new Date(a.reviewed_at ?? a.chosen_at).getTime())[0];
  }), [wines, chosenWines]);

  const shortName = (w: CompareWineInput) => mode === 'vintages' ? w.vintage : wineHeaderLine(w.producer, w.wineName, w.vintage);

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorTitle}>Please try again!</Text>
        <Text style={styles.errorBody}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => setAttempt((n) => n + 1)}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={styles.link}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <SearchProgress
        title={mode === 'vintages' ? 'Comparing your vintages…' : 'Comparing your wines…'}
        subtitle="Vinster needs up to a minute for your comparison"
        body="Vinster is weighing critic scores, market prices, drinking windows and the character of each vintage side by side."
        durationMs={60000}
      />
    );
  }

  const sym = currencySymbol(data.currency);
  const price = (i: number) => data.market[i]?.price ?? data.wines[i]?.estimatedValue ?? null;
  const score = (i: number) => data.wines[i]?.criticScore ?? data.market[i]?.score ?? null;
  const ppt = (i: number) => { const p = price(i); const s = score(i); return p != null && s ? p / s : null; };
  const topScore = Math.max(...wines.map((_, i) => score(i) ?? -1));
  const pptVals = wines.map((_, i) => ppt(i)).filter((v): v is number => v != null);
  const bestPpt = pptVals.length > 1 ? Math.min(...pptVals) : null;
  const anyEstimate = wines.some((_, i) => data.market[i]?.price == null && data.wines[i]?.estimatedValue != null);
  const label = (n: number | undefined) => (n ? shortName(wines[n - 1]) : '');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingTop: 56, paddingBottom: 60 }}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{mode === 'vintages' ? 'Compare Vintages' : 'Compare Wines'}</Text>
          {mode === 'vintages' ? (
            <Text style={styles.subtitle}>{wineHeaderLine(wines[0].producer, wines[0].wineName, null)}</Text>
          ) : null}
        </View>

        <View style={styles.body}>
          {/* Vintage & Market Comparison */}
          <Text style={styles.section}>Vintage & Market Comparison</Text>
          <View style={styles.table}>
            <View style={[styles.tr, styles.trHead]}>
              <Text style={[styles.td, styles.tdWine, styles.th]}>{mode === 'vintages' ? 'Vintage' : 'Wine'}</Text>
              <Text style={[styles.td, styles.th]}>Score</Text>
              <Text style={[styles.td, styles.th]}>Price</Text>
              <Text style={[styles.td, styles.th]}>{sym} / pt</Text>
              <Text style={[styles.td, styles.tdWindow, styles.th]}>Window</Text>
            </View>
            {wines.map((w, i) => {
              const r = data.wines[i];
              const s = score(i);
              const p = price(i);
              const v = ppt(i);
              return (
                <View key={i} style={styles.tr}>
                  <Text style={[styles.td, styles.tdWine]} numberOfLines={3}>{shortName(w)}</Text>
                  <Text style={[styles.td, s != null && s === topScore && styles.gold]}>{s ?? '—'}</Text>
                  <Text style={styles.td}>{p != null ? `${formatCurrency(p, data.currency, { decimals: 0 })}${data.market[i]?.price == null ? '*' : ''}` : '—'}</Text>
                  <Text style={[styles.td, v != null && v === bestPpt && styles.gold]}>{v != null ? `${sym}${v.toFixed(2)}` : '—'}</Text>
                  <Text style={[styles.td, styles.tdWindow]}>{r?.drinkingWindowFrom && r?.drinkingWindowTo ? `${r.drinkingWindowFrom}–${r.drinkingWindowTo}` : '—'}{r?.drinkingWindowStatus ? `\n${STATUS[r.drinkingWindowStatus] ?? ''}` : ''}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.note}>Score: Vinster's consensus critic score. Price: Wine-Searcher average market price{anyEstimate ? '; * marks Vinster’s estimate where Wine-Searcher had no price' : ''}.</Text>

          {/* The calls */}
          <View style={styles.box}>
            {data.drinkNow ? <Pick title="Best to Drink Now" name={label(data.drinkNow.wine)} reason={data.drinkNow.reason} /> : null}
            {data.layDown ? <Pick title="Best to Lay Down" name={label(data.layDown.wine)} reason={data.layDown.reason} /> : null}
            {data.bestValue ? <Pick title="Best Value" name={label(data.bestValue.wine)} reason={data.bestValue.reason} /> : null}
            {data.marketComparison ? (
              <>
                <Text style={styles.boxTitle}>Market Comparison</Text>
                <Text style={styles.text}>{data.marketComparison}</Text>
              </>
            ) : null}
          </View>

          {data.regionGrapeComparison ? (
            <>
              <Text style={styles.section}>Regions & Grapes</Text>
              <Text style={styles.text}>{data.regionGrapeComparison}</Text>
            </>
          ) : null}

          {data.insideLine ? (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Vinster's Inside Line</Text>
              <Text style={styles.text}>{data.insideLine}</Text>
            </View>
          ) : null}

          {/* One card per wine */}
          {wines.map((w, i) => {
            const r = data.wines[i];
            const mine = myReviews[i];
            return (
              <View key={i} style={styles.card}>
                <Text style={styles.cardTitle}>{wineHeaderLine(w.producer, w.wineName, w.vintage)}</Text>
                {tidyWineRegion(w.region) || w.grape ? <Text style={styles.cardMeta}>{[tidyWineRegion(w.region), w.grape].filter(Boolean).join(' · ')}</Text> : null}
                {!r?.identified ? (
                  <Text style={[styles.text, { marginTop: spacing.sm }]}>Vinster couldn't confidently identify this wine, so it has left it out of the comparison rather than guess.</Text>
                ) : (
                  <>
                    <View style={styles.stats}>
                      <Stat label="Critic Score" value={score(i) != null ? String(score(i)) : '—'} />
                      <Stat label="Drinking Window" value={r.drinkingWindowFrom && r.drinkingWindowTo ? `${r.drinkingWindowFrom}–${r.drinkingWindowTo}` : '—'} sub={r.drinkingWindowStatus ? STATUS[r.drinkingWindowStatus] : undefined} />
                      <Stat label="Market Price" value={price(i) != null ? formatCurrency(price(i)!, data.currency, { decimals: 0 }) : '—'} sub={data.market[i]?.price == null && price(i) != null ? 'Vinster estimate' : undefined} />
                    </View>
                    {r.reviews ? <Para title="Reviews" text={r.reviews} /> : null}
                    {r.vintageReport ? <Para title={`The ${w.vintage} Vintage`} text={r.vintageReport} /> : null}
                    {r.styleImpact ? <Para title="Impact on Style" text={r.styleImpact} /> : null}
                    {r.regionNote ? <Para title="Region" text={r.regionNote} /> : null}
                    {r.grapeNote ? <Para title="Grape" text={r.grapeNote} /> : null}
                  </>
                )}
                {mine ? (
                  <TouchableOpacity onPress={() => router.push(`/wines/chosen?openReview=${mine.id}` as any)} activeOpacity={0.7}>
                    <Text style={styles.mine}>
                      Your review{mine.user_score != null ? ` · ${mine.user_score} pts` : ''} · <Text style={styles.link}>View</Text>
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}

          {data.verdict ? (
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Vinster's Verdict</Text>
              <Text style={styles.text}>{data.verdict}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

function Pick({ title, name, reason }: { title: string; name: string; reason: string }) {
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Text style={styles.boxTitle}>{title}</Text>
      <Text style={styles.pickName}>{name}</Text>
      {reason ? <Text style={styles.text}>{reason}</Text> : null}
    </View>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );
}

function Para({ title, text }: { title: string; text: string }) {
  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={styles.paraTitle}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  topBar: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backArrow: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignItems: 'center' },
  title: { fontFamily: fonts.headingSemibold, fontSize: 38, color: '#FFFFFF', textAlign: 'center' },
  subtitle: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.gold, textAlign: 'center', marginTop: spacing.xs },
  body: { paddingHorizontal: spacing.xl },
  section: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.text, marginTop: spacing.lg, marginBottom: spacing.sm, textAlign: 'center' },
  table: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  tr: { flexDirection: 'row', alignItems: 'center', minHeight: 46, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)', gap: 4 },
  trHead: { minHeight: 30, borderBottomColor: 'rgba(255,255,255,0.15)' },
  td: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.text },
  tdWine: { flex: 1.6, fontFamily: fonts.bodySemibold },
  tdWindow: { flex: 1.3 },
  th: { fontFamily: fonts.bodySemibold, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  gold: { color: colors.gold, fontFamily: fonts.bodySemibold },
  note: { fontFamily: fonts.bodyItalic, fontSize: 12.5, lineHeight: 18, color: colors.textMuted, marginTop: spacing.sm },
  box: { marginTop: spacing.lg, padding: spacing.md, borderRadius: 12, backgroundColor: 'rgba(224,184,74,0.08)', borderWidth: 1, borderColor: 'rgba(224,184,74,0.35)' },
  boxTitle: { fontFamily: fonts.bodySemibold, fontSize: 12.5, letterSpacing: 1.2, textTransform: 'uppercase', color: colors.gold, marginBottom: 4 },
  pickName: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.text, marginBottom: 2 },
  text: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 22, color: colors.text },
  card: { marginTop: spacing.lg, padding: spacing.md, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface },
  cardTitle: { fontFamily: fonts.headingSemibold, fontSize: 19, color: colors.text },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, marginTop: 2 },
  stats: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  statLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  statValue: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text, marginTop: 2 },
  statSub: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, marginTop: 1 },
  paraTitle: { fontFamily: fonts.bodySemibold, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: colors.gold, marginBottom: 3 },
  mine: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: colors.text, marginTop: spacing.md },
  link: { fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline' },
  errorTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  errorBody: { fontSize: 17, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  buttonText: { color: '#fff', fontFamily: fonts.headingSemibold, fontSize: 16 },
});
