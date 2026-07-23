import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { repairRackedWines, updateCellarWine } from '../../src/api/cellar';
import { generateWineIntel } from '../../src/services/pricing';
import { isMissingIntel } from '../../src/services/bulkIntel';
import { IntelProgress } from '../../src/components/IntelProgress';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import { formatCurrency } from '../../src/constants/currency';
import { inferWineStyle, type WineStyle } from '../../src/utils/wineStyle';
import { topRegionsAdaptive } from '../../src/utils/wineRegionGroup';
import { bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { WineValueEditorModal } from '../../src/components/WineValueEditorModal';
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
  const { wines, isLoading, isError } = useCellar();
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
  // Wines with no purchase price recorded — the user can fill these in to grow
  // Total Purchase Value and the change comparison below.
  const winesNoPurchase = wines.filter((w) => w.purchase_price == null);
  // Wines whose purchase price is an auto-estimate the user hasn't confirmed.
  const winesEstimatedPurchase = wines.filter((w) => w.purchase_price != null && w.purchase_price_estimated);

  // % change from purchase to estimated current value, on the wines that have
  // BOTH (and in the same currency, so the comparison is like-for-like).
  let matchedCount = 0;
  const matchedByCode: Record<string, { p: number; v: number }> = {};
  for (const w of wines) {
    if (w.purchase_price == null || w.estimated_value == null) continue;
    const pc = (w.purchase_price_currency ?? 'GBP').toUpperCase();
    const vc = (w.estimated_value_currency ?? 'GBP').toUpperCase();
    if (pc !== vc) continue;
    matchedCount += 1;
    const b = matchedByCode[pc] ?? { p: 0, v: 0 };
    b.p += Number(w.purchase_price) * w.quantity;
    b.v += Number(w.estimated_value) * w.quantity;
    matchedByCode[pc] = b;
  }
  // Compare the WHOLE-unit rounded totals (the app displays currency to zero
  // decimals). Otherwise a stored estimate of e.g. 100.10 against a purchase of
  // 100 — which read as identical on screen — shows a phantom 0.1% change.
  const changeEntries = Object.entries(matchedByCode)
    .map(([code, b]) => ({ code, p: Math.round(b.p), v: Math.round(b.v) }))
    .filter((e) => e.p > 0)
    .map((e) => ({ code: e.code, pct: ((e.v - e.p) / e.p) * 100 }));
  // The change is computed ONLY on wines that have both a purchase price and a
  // current value IN THE SAME CURRENCY. If some wines are missing one value, or
  // have both but in mismatched currencies (so they're excluded from the %),
  // the headline totals cover a different set than the %, so we caption the
  // basis to keep it honest.
  const bothValuesCount = wines.filter((w) => w.purchase_price != null && w.estimated_value != null).length;
  const changePartial = changeEntries.length > 0 && (winesNoPurchase.length > 0 || winesNeedingEstimate.length > 0 || matchedCount < bothValuesCount);

  // Which value-editor sheet is open (user fills in what Vinster couldn't find).
  const [valueEditor, setValueEditor] = useState<'estimate' | 'purchase' | 'purchase-estimated' | null>(null);
  // Which Condition bucket is expanded to show its wines.
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);
  const editorCurrency = preferences?.defaultCurrency ?? 'GBP';
  function onEditorSaved() {
    if (session?.user.id) qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
    setValueEditor(null);
  }
  // "Missing intel" = never valued (no critic score / pricing downloaded yet).
  const winesMissingIntel = wines.filter(isMissingIntel);
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
  // Countries by default; France/Italy split into headline regions; and any
  // area the collector has real depth in is broken down further (see util).
  const topRegions = topRegionsAdaptive(wines, 3);

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
          const intel = await generateWineIntel({
            producer: w.producer ?? '',
            region: w.region ?? '',
            wineName: w.wine_name || null,
            vintage: w.vintage || 'NV',
          } as any, currency);
          await updateCellarWine(w.id, {
            estimated_value: intel.estimatedValue,
            estimated_value_currency: currency,
            estimated_value_at: new Date().toISOString(),
            // Persist where the value came from + the WS-anchored critic score
            // so the card reflects the real Wine-Searcher data, not just a price.
            estimated_value_source: intel.valueSource ?? 'vinster',
            critic_score: intel.criticScore,
            critic_score_note: intel.criticScoreNote ?? null,
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

  // "Update all" on the missing-intel line — refresh critic score + pricing for
  // every wine that has never been valued (no Vinster review generated).
  async function handleUpdateMissingIntel() {
    if (winesMissingIntel.length === 0) return;
    setCalculating(true);
    try {
      await processBatch(winesMissingIntel);
    } catch {
      showAlert({ title: 'Could not finish', body: 'Some wines could not be updated. Please try again.' });
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
    return <IntelProgress done={calcProgress.done} total={calcProgress.total} title="Valuing your cellar…" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
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

          {isError ? (
            // Without this the tiles below read 0 bottles / £0 on a failed
            // fetch, which looks like the cellar was wiped rather than a
            // network problem.
            <View style={styles.emptyBanner}>
              <Text style={styles.emptyBannerTitle}>Couldn&apos;t load your cellar</Text>
              <Text style={styles.emptyBannerBody}>
                These figures are incomplete. Check your connection and pull down to refresh — your wines are safe.
              </Text>
            </View>
          ) : wines.length === 0 && (
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

          {/* "Wines missing intel" lives on the Full Cellar List only — not here. */}

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
            {winesNoPurchase.length > 0 ? (
              <TouchableOpacity style={styles.missingValueRow} onPress={() => setValueEditor('purchase')} activeOpacity={0.7}>
                <Text style={styles.missingValueText}>
                  {winesNoPurchase.length} Missing Value{winesNoPurchase.length === 1 ? '' : 's'} · <Text style={styles.missingIntelLink}>View Wines to Update</Text>
                </Text>
              </TouchableOpacity>
            ) : null}
            {winesEstimatedPurchase.length > 0 ? (
              <TouchableOpacity style={styles.missingValueRow} onPress={() => setValueEditor('purchase-estimated')} activeOpacity={0.7}>
                <Text style={styles.missingValueText}>
                  {winesEstimatedPurchase.length} Estimated value{winesEstimatedPurchase.length === 1 ? '' : 's'} · <Text style={styles.missingIntelLink}>View Wines to Add Precise Purchase Value</Text>
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Total Estimated Current Value</Text>
              <Text style={[styles.valueAmount, !valueTotal && styles.valueAmountMuted]}>
                {valueTotal || '—'}
              </Text>
            </View>

            {wines.length === 0 ? null : (
              <View style={styles.estimateMetaStack}>
                {/* Wines Vinster couldn't value — left-indented directly under
                    Total Estimated Current Value. */}
                {winesUnvaluable.length > 0 ? (
                  <TouchableOpacity style={styles.missingValueRow} onPress={() => setValueEditor('estimate')} activeOpacity={0.7}>
                    <Text style={styles.missingValueText}>
                      {winesUnvaluable.length} Missing Value{winesUnvaluable.length === 1 ? '' : 's'} · <Text style={styles.missingIntelLink}>View Wines to Update</Text>
                    </Text>
                  </TouchableOpacity>
                ) : null}

                {/* Last estimate date + Recalculate on ONE left-indented line. */}
                {winesWithEstimate.length > 0 ? (
                  <TouchableOpacity style={styles.missingValueRow} onPress={handleCalculate} activeOpacity={0.7}>
                    <Text style={styles.missingValueText}>
                      {lastEstimateDate ? `Last estimate: ${lastEstimateDate} · ` : ''}<Text style={styles.missingIntelLink}>Recalculate</Text>
                    </Text>
                  </TouchableOpacity>
                ) : winesNotYetValued.length > 0 ? (
                  <TouchableOpacity style={styles.missingValueRow} onPress={handleCalculate} activeOpacity={0.7}>
                    <Text style={styles.missingValueText}><Text style={styles.missingIntelLink}>Calculate cellar value</Text></Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}

            {changeEntries.length > 0 ? (
              <View style={styles.valueRow}>
                <Text style={styles.valueLabel}>Change Since Purchase</Text>
                <View style={styles.changeStack}>
                  {changeEntries.map((e) => (
                    <Text key={e.code} style={[styles.changePct, { color: colors.gold }]}>
                      {e.pct >= 0 ? '▲' : '▼'} {Math.abs(e.pct).toFixed(1)}%{changeEntries.length > 1 ? ` ${e.code}` : ''}
                    </Text>
                  ))}
                </View>
              </View>
            ) : null}
          </View>

          {/* Condition */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Condition</Text>
            {([
              { status: 'too_young', label: 'Too Young', count: tooYoungCount },
              { status: 'approaching', label: 'Early but Approachable', count: approachingCount },
              { status: 'peak', label: 'Sweet Spot', count: peakCount },
              { status: 'declining', label: 'In Decline', count: decliningCount },
            ] as const).map((c) => {
              const expanded = expandedCondition === c.status;
              return (
                <View key={c.status}>
                  <TouchableOpacity
                    style={styles.breakdownRow}
                    onPress={() => setExpandedCondition(expanded ? null : c.status)}
                    disabled={c.count === 0}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.breakdownLabel}>{c.label}</Text>
                    <Text style={styles.breakdownCount}>{c.count}</Text>
                    <Text style={styles.breakdownPct}>{pct(c.count, totalBottles)}</Text>
                    <Text style={[styles.conditionChevron, c.count === 0 && { opacity: 0.25 }]}>{expanded ? '⌃' : '⌄'}</Text>
                  </TouchableOpacity>
                  {expanded ? (
                    <View style={styles.conditionWines}>
                      {wines.filter((w) => w.drinking_window_status === c.status).map((w) => (
                        <TouchableOpacity key={w.id} style={styles.conditionWineRow} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.7}>
                          <Text style={styles.conditionWineName} numberOfLines={1}>{[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ')}</Text>
                          <Text style={styles.conditionWineMeta} numberOfLines={1}>
                            {[w.region, `${w.quantity ?? 1} × ${bottleSizeLabel(w.bottle_size_ml ?? 750)}`].filter(Boolean).join(' · ')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
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
          </View>

        </ScrollView>
      )}

      <WineValueEditorModal
        visible={valueEditor !== null}
        field={valueEditor === 'purchase' || valueEditor === 'purchase-estimated' ? 'purchase_price' : 'estimated_value'}
        title={valueEditor === 'purchase' ? 'Add Purchase Prices' : valueEditor === 'purchase-estimated' ? 'Review Estimated Prices' : 'Update Estimated Values'}
        subtitle={valueEditor === 'purchase'
          ? 'Enter what you paid per bottle — this adds to your Total Purchase Value.'
          : valueEditor === 'purchase-estimated'
            ? 'These purchase prices are Vinster estimates. Check them and enter what you actually paid per bottle where you know it.'
            : "Enter your own estimated value per bottle for the wines Vinster couldn't price."}
        wines={valueEditor === 'purchase' ? winesNoPurchase : valueEditor === 'purchase-estimated' ? winesEstimatedPurchase : winesUnvaluable}
        currency={editorCurrency}
        onClose={() => setValueEditor(null)}
        onSaved={onEditorSaved}
      />
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
  missingIntelRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  missingIntelText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  // Left-aligned, borderless variant — sits directly under Total Purchase Value.
  missingValueRow: { paddingHorizontal: spacing.xl, paddingTop: 2, paddingBottom: spacing.xs, alignItems: 'flex-start' },
  missingValueText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted },
  missingIntelLink: { fontFamily: fonts.headingSemibold, color: colors.gold },
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
  changeStack: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'flex-end' },
  changePct: { fontSize: 15, fontFamily: fonts.bodySemibold },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  // Inter — list rank
  breakdownRank: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, width: 24 },
  // Inter — breakdown label
  breakdownLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  // Inter — count value
  breakdownCount: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, width: 50, textAlign: 'right' },
  // Inter — percentage value
  breakdownPct: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold, width: 60, textAlign: 'right' },
  conditionChevron: { fontSize: 15, color: colors.gold, width: 20, textAlign: 'right', marginLeft: spacing.sm },
  conditionWines: { paddingLeft: 18, paddingBottom: spacing.sm },
  conditionWineRow: { paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  conditionWineName: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  conditionWineMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
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
