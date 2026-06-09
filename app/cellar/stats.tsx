import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { repairRackedWines, updateCellarWine } from '../../src/api/cellar';
import { getWineIntelligence } from '../../src/api/label';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import { formatCurrency } from '../../src/constants/currency';
import { inferWineStyle, type WineStyle } from '../../src/utils/wineStyle';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import type { CellarWine } from '../../src/types/wine';

const CONCURRENCY = 3;

function fmtMultiCurrency(totals: Record<string, number>): string {
  return Object.entries(totals)
    .map(([code, amt]) => formatCurrency(amt, code, { decimals: 0 }))
    .join(' · ');
}

function groupBy<T, K extends string>(items: T[], key: (t: T) => K | null): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    if (k == null) continue;
    const list = out.get(k) ?? [];
    list.push(item);
    out.set(k, list);
  }
  return out;
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

export default function CellarStatsScreen() {
  const { session } = useAuth();
  const { wines, isLoading } = useCellar();
  const { preferences } = usePreferences();
  const qc = useQueryClient();

  const [calculating, setCalculating] = useState(false);
  const [calcProgress, setCalcProgress] = useState({ done: 0, total: 0 });

  // Heal any wines stuck with stale flags but still assigned to a rack.
  useEffect(() => {
    if (!session?.user.id) return;
    repairRackedWines(session.user.id).then((fixed) => {
      if (fixed > 0) {
        qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
        qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      }
    });
  }, [session?.user.id]);

  const totalWines = wines.length;
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  // Multi-currency totals so wines with different currencies don't merge.
  const purchaseByCurrency: Record<string, number> = {};
  const valueByCurrency: Record<string, number> = {};
  for (const w of wines) {
    if (w.purchase_price != null) {
      const code = (w.purchase_price_currency ?? 'GBP').toUpperCase();
      purchaseByCurrency[code] = (purchaseByCurrency[code] ?? 0) + Number(w.purchase_price) * w.quantity;
    }
    if (w.estimated_value != null) {
      const code = (w.estimated_value_currency ?? 'GBP').toUpperCase();
      valueByCurrency[code] = (valueByCurrency[code] ?? 0) + Number(w.estimated_value) * w.quantity;
    }
  }
  const purchaseTotal = fmtMultiCurrency(purchaseByCurrency);
  const valueTotal = fmtMultiCurrency(valueByCurrency);

  const winesWithEstimate = wines.filter((w) => w.estimated_value != null);
  const winesNeedingEstimate = wines.filter((w) => w.estimated_value == null);
  // Split the unvalued wines: "not yet valued" (never attempted) vs
  // "unvaluable" (Vinster tried — estimated_value_at is stamped — but had no
  // market data, so the value came back null). Without this split, wines
  // Vinster can't value keep showing as "added since your last valuation"
  // even after an update, which reads like the update did nothing.
  const winesNotYetValued = winesNeedingEstimate.filter((w) => !w.estimated_value_at);
  const winesUnvaluable = winesNeedingEstimate.filter((w) => !!w.estimated_value_at);
  const lastEstimateAt = useMemo(() => {
    let latest: string | null = null;
    for (const w of wines) {
      if (w.estimated_value_at && (!latest || w.estimated_value_at > latest)) {
        latest = w.estimated_value_at;
      }
    }
    return latest;
  }, [wines]);
  const lastEstimateDate = lastEstimateAt
    ? new Date(lastEstimateAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // Top 3 regions by bottle count
  const regionCounts: Record<string, number> = {};
  for (const w of wines) {
    if (!w.region) continue;
    const key = w.region.trim();
    if (!key) continue;
    regionCounts[key] = (regionCounts[key] ?? 0) + (w.quantity ?? 0);
  }
  const topRegions = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Style breakdown — uses explicit style column if present, falls back to a
  // grape/region heuristic. Wines that can't be classified bucket as "Other".
  const styleBuckets: Record<'Red' | 'White' | 'Sparkling' | 'Other', number> = {
    Red: 0, White: 0, Sparkling: 0, Other: 0,
  };
  for (const w of wines) {
    const style = inferWineStyle({ style: (w as any).style, region: w.region, grape_variety: w.grape_variety });
    if (style === 'Red') styleBuckets.Red += w.quantity;
    else if (style === 'White') styleBuckets.White += w.quantity;
    else if (style === 'Sparkling') styleBuckets.Sparkling += w.quantity;
    else styleBuckets.Other += w.quantity;
  }

  // Condition breakdown — four buckets matching the rack drinking-window
  // statuses: Peak / Approaching / Too Young / Declining.
  const sumByStatus = (status: string) =>
    wines.filter((w) => w.drinking_window_status === status).reduce((s, w) => s + w.quantity, 0);
  const peakCount = sumByStatus('peak');
  const approachingCount = sumByStatus('approaching');
  const tooYoungCount = sumByStatus('too_young');
  const decliningCount = sumByStatus('declining');

  async function processBatch(items: CellarWine[]) {
    const currency = preferences?.defaultCurrency ?? 'GBP';
    let done = 0;
    setCalcProgress({ done: 0, total: items.length });

    // Simple concurrency-bounded loop so we don't fire 30 requests at once
    let cursor = 0;
    async function worker() {
      while (cursor < items.length) {
        const myIdx = cursor++;
        const w = items[myIdx];
        try {
          const intel = await getWineIntelligence({
            producer: w.producer ?? '',
            region: w.region ?? '',
            wineName: w.wine_name || null,
            vintage: w.vintage || 'NV',
          } as any, currency);
          await updateCellarWine(w.id, {
            estimated_value: intel.estimatedValue,
            estimated_value_currency: currency,
            estimated_value_at: new Date().toISOString(),
          });
        } catch {
          // Skip this wine on error — partial progress is better than failing the lot
        } finally {
          done += 1;
          setCalcProgress({ done, total: items.length });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => worker()));
    qc.invalidateQueries({ queryKey: ['cellar'] });
  }

  async function handleCalculate() {
    const targets = winesNeedingEstimate.length > 0 ? winesNeedingEstimate : wines;
    if (targets.length === 0) return;
    setCalculating(true);
    try {
      await processBatch(targets);
    } catch {
      showAlert({ title: 'Could not finish', body: 'Some wines could not be valued. Please try again.' });
    } finally {
      setCalculating(false);
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (calculating) {
    const pctVal = calcProgress.total === 0 ? 0 : Math.round((calcProgress.done / calcProgress.total) * 100);
    return (
      <View style={styles.center}>
        <Text style={styles.calcTitle}>Valuing your cellar…</Text>
        <Text style={styles.calcSubtitle}>This can take up to a minute.</Text>
        <Text style={styles.calcPercent}>{pctVal}%</Text>
        <Text style={styles.calcCount}>{calcProgress.done} of {calcProgress.total}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar Statistics</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your stats"
          body="Cellar statistics live with your account — sign in to see them."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>

          {wines.length === 0 && (
            <View style={styles.emptyBanner}>
              <Text style={styles.emptyBannerTitle}>Your cellar is empty</Text>
              <Text style={styles.emptyBannerBody}>
                Add wines to your cellar and these stats will fill in automatically. The fields below show you what's tracked.
              </Text>
            </View>
          )}

          {/* Top quick numbers */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalWines}</Text>
              <Text style={styles.statLabel}>Wines</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalBottles}</Text>
              <Text style={styles.statLabel}>Bottles</Text>
            </View>
          </View>

          {/* Value block */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cellar Value</Text>

            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Total Purchase Value</Text>
              <Text style={[styles.valueAmount, !purchaseTotal && styles.valueAmountMuted]}>
                {purchaseTotal || '—'}
              </Text>
            </View>
            {!purchaseTotal && (
              <Text style={styles.valueHint}>
                Add a purchase price to individual wines from their wine card to see this total.
              </Text>
            )}

            <View style={styles.valueDivider} />

            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Total Estimated Current Value</Text>
              <Text style={[styles.valueAmount, !valueTotal && styles.valueAmountMuted]}>
                {valueTotal || '—'}
              </Text>
            </View>

            {wines.length === 0 ? null : (
              <View style={styles.estimateMetaStack}>
                {lastEstimateDate && winesWithEstimate.length > 0 ? (
                  <Text style={styles.lastEstimate}>Last estimate: {lastEstimateDate}</Text>
                ) : null}

                {winesWithEstimate.length === 0 && winesNotYetValued.length > 0 ? (
                  <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.8}>
                    <Text style={styles.calcBtnText}>Calculate</Text>
                  </TouchableOpacity>
                ) : winesNotYetValued.length > 0 ? (
                  <>
                    <Text style={styles.estimateUpdateNote}>
                      You've added {winesNotYetValued.length} wine{winesNotYetValued.length === 1 ? '' : 's'} since your last valuation
                    </Text>
                    <TouchableOpacity onPress={handleCalculate} activeOpacity={0.7}>
                      <Text style={styles.recalcLink}>
                        Add {winesNotYetValued.length} wine{winesNotYetValued.length === 1 ? '' : 's'} to total cellar value
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : winesWithEstimate.length > 0 ? (
                  <TouchableOpacity onPress={handleCalculate} activeOpacity={0.7}>
                    <Text style={styles.recalcLink}>Recalculate</Text>
                  </TouchableOpacity>
                ) : null}

                {/* Make it explicit when wines were valued but came back blank
                    so the count doesn't read as a failed update. */}
                {winesUnvaluable.length > 0 ? (
                  <Text style={styles.unvaluableNote}>
                    {winesUnvaluable.length} wine{winesUnvaluable.length === 1 ? '' : 's'} couldn't be valued — Vinster doesn't have enough market data for {winesUnvaluable.length === 1 ? 'it' : 'them'} yet.
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condition</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Peak</Text>
              <Text style={styles.breakdownCount}>{peakCount}</Text>
              <Text style={styles.breakdownPct}>{pct(peakCount, totalBottles)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Approaching</Text>
              <Text style={styles.breakdownCount}>{approachingCount}</Text>
              <Text style={styles.breakdownPct}>{pct(approachingCount, totalBottles)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Too Young</Text>
              <Text style={styles.breakdownCount}>{tooYoungCount}</Text>
              <Text style={styles.breakdownPct}>{pct(tooYoungCount, totalBottles)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Declining</Text>
              <Text style={styles.breakdownCount}>{decliningCount}</Text>
              <Text style={styles.breakdownPct}>{pct(decliningCount, totalBottles)}</Text>
            </View>
          </View>

          {/* Most Represented Regions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Most Represented Regions</Text>
            {topRegions.length === 0 ? (
              <Text style={styles.muted}>No region data yet.</Text>
            ) : (
              topRegions.map(([region, count], i) => (
                <View key={region} style={styles.breakdownRow}>
                  <Text style={styles.breakdownRank}>{i + 1}.</Text>
                  <Text style={styles.breakdownLabel}>{region}</Text>
                  <Text style={styles.breakdownPct}>{pct(count, totalBottles)}</Text>
                </View>
              ))
            )}
          </View>

          {/* Style Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Style</Text>
            {(['Red', 'White', 'Sparkling', 'Other'] as const).map((bucket) => (
              <View key={bucket} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>{bucket}</Text>
                <Text style={styles.breakdownCount}>{styleBuckets[bucket]}</Text>
                <Text style={styles.breakdownPct}>{pct(styleBuckets[bucket], totalBottles)}</Text>
              </View>
            ))}
            {styleBuckets.Other > 0 && (
              <Text style={styles.muted}>
                "Other" includes rosé, fortified, and wines without enough info to classify.
              </Text>
            )}
          </View>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  // Cormorant — page header
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  // Cormorant — empty-state header
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Inter — empty body
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  emptyBanner: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
  // Cormorant — empty banner title (header)
  emptyBannerTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.text },
  // Inter — empty banner body
  emptyBannerBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 20 },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg },
  // Inter — stat value read-out
  statValue: { fontSize: 32, fontFamily: fonts.bodyBold, color: colors.gold, marginBottom: 2 },
  // Inter — stat label
  statLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  section: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Cormorant — section header
  sectionTitle: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  // Inter — form label
  valueLabel: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, flexShrink: 1 },
  // Inter — form value read-out
  valueAmount: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.text, marginLeft: spacing.md },
  // Inter — muted variant of value
  valueAmountMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  // Inter — hint
  valueHint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 17, marginTop: 4 },
  valueDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  calcBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  // Cormorant — button text
  calcBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  estimateMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  estimateMetaStack: { marginTop: spacing.sm, gap: 4 },
  // Inter — note
  estimateUpdateNote: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 18 },
  // Inter — subtle small info
  lastEstimate: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  // Cormorant — inline action link reads as a button
  recalcLink: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold },
  unvaluableNote: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 18, marginTop: spacing.xs },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  // Inter — list rank
  breakdownRank: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, width: 24 },
  // Inter — breakdown label
  breakdownLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  // Inter — count value
  breakdownCount: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, width: 50, textAlign: 'right' },
  // Inter — percentage value
  breakdownPct: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold, width: 60, textAlign: 'right' },
  // Inter — muted hint
  muted: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 17, marginTop: spacing.xs },
  // Cormorant — processing screen title
  calcTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  // Inter — processing subtitle (body)
  calcSubtitle: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  // Inter — large stat value read-out
  calcPercent: { fontFamily: fonts.bodyBold, fontSize: 56, color: colors.gold, marginBottom: spacing.xs },
  // Inter — small caption
  calcCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
});
