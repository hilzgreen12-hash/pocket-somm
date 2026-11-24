import { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, type StyleProp, type ViewStyle } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCellar, invalidateCellarViews } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useCellarContext } from '../../src/hooks/useCellarContext';
import { useBulkIntel } from '../../src/hooks/useBulkIntel';
import { repairRackedWines } from '../../src/api/cellar';
import { isValueStale } from '../../src/services/bulkIntel';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import { formatCurrency } from '../../src/constants/currency';
import { inferWineStyle } from '../../src/utils/wineStyle';
import { effectiveMaturity } from '../../src/utils/maturity';
import { mostRepresentedRegions, classifiedRegionBottles } from '../../src/utils/wineRegionGroup';
import { bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { WineValueEditorModal } from '../../src/components/WineValueEditorModal';
import { BulkIntelProgress } from '../../src/components/BulkIntelProgress';
import { holdingValue } from '../../src/utils/bottleValue';
import type { CellarWine } from '../../src/types/wine';

// Cellar Statistics: bottle and region summary, purchase vs current value (with
// the bulk valuation and the sheets for filling in missing values), the
// drinking-window mix and the style mix.

const qty = (w: CellarWine) => w.quantity ?? 0;
const winesLabel = (n: number) => `${n} ${n === 1 ? 'wine' : 'wines'}`;
const currencyOf = (code: string | null | undefined) => (code ?? 'GBP').toUpperCase();

function fmtMultiCurrency(totals: Record<string, number>): string {
  return Object.entries(totals)
    .map(([code, amt]) => formatCurrency(amt, code, { decimals: 0 }))
    .join(' · ');
}

function pct(n: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((n / total) * 100)}%`;
}

// "23% Bordeaux · 21% Tuscany · 10% Piedmont · 46% Other Regions": the top
// regions plus everything else, so the shares always add up to 100%. "Other"
// is the remainder of the rounded figures shown, not rounded separately.
function regionShareLine(top: [string, number][], total: number): string {
  if (total === 0) return '';
  const shares = top.map(([region, count]) => ({ region, share: Math.round((count / total) * 100) }));
  const other = 100 - shares.reduce((sum, r) => sum + r.share, 0);
  const parts = shares.map((r) => `${r.share}% ${r.region}`);
  if (other > 0) parts.push(`${other}% Other Regions`);
  return parts.join('  ·  ');
}

// The four drinking-window buckets, matching the rack colour statuses.
type WindowStatus = 'too_young' | 'approaching' | 'peak' | 'declining';
const WINDOW_BUCKETS: { status: WindowStatus; label: string }[] = [
  { status: 'too_young', label: 'Too Young' },
  { status: 'approaching', label: 'Early but Approachable' },
  { status: 'peak', label: 'Sweet Spot' },
  { status: 'declining', label: 'In Decline' },
];
const isWindowStatus = (s: string): s is WindowStatus => WINDOW_BUCKETS.some((b) => b.status === s);

const STYLE_BUCKETS = ['Red', 'White', 'Rosé', 'Sparkling', 'Fortified', 'Other'] as const;
type StyleBucket = typeof STYLE_BUCKETS[number];

// ---- The value-editor sheets ----

// Which wines a sheet lists.
type EditorWines = 'noPurchase' | 'estimatedPurchase' | 'unvaluable';
type EditorMode =
  | 'addPurchasePrices'          // wines with no purchase price
  | 'purchaseFromCurrentValues'  // the same wines, pre-filled from their current value
  | 'reviewEstimatedPurchases'   // purchase prices Vinster estimated
  | 'addCurrentValues'           // wines Vinster couldn't value
  | 'addPurchaseForUnvalued';    // the same wines, entering what was paid instead
type EditorSpec = {
  field: 'purchase_price' | 'estimated_value';
  seedField?: 'estimated_value';
  saveUntouched?: boolean;
  wines: EditorWines;
  title: string;
  subtitle: string;
  // A gold prompt to switch to entering the OTHER value for the same wines.
  alt?: { label: string; mode: EditorMode };
};
const EDITORS: Record<EditorMode, EditorSpec> = {
  addPurchasePrices: {
    field: 'purchase_price', wines: 'noPurchase', title: 'Add Purchase Prices',
    subtitle: 'Enter what you paid per bottle — this adds to your Total Purchase Value.',
    alt: { label: 'Input Current Values', mode: 'purchaseFromCurrentValues' },
  },
  purchaseFromCurrentValues: {
    field: 'purchase_price', seedField: 'estimated_value', saveUntouched: true, wines: 'noPurchase', title: 'Input Current Values',
    subtitle: "Each input is pre-filled with the wine's current value — adjust to what you actually paid where you know it, then Save. This adds to your Total Purchase Value.",
    alt: { label: 'Enter purchase prices from scratch', mode: 'addPurchasePrices' },
  },
  reviewEstimatedPurchases: {
    field: 'purchase_price', wines: 'estimatedPurchase', title: 'Review Estimated Prices',
    subtitle: 'These purchase prices are Vinster estimates. Check them and enter what you actually paid per bottle where you know it.',
  },
  addCurrentValues: {
    field: 'estimated_value', wines: 'unvaluable', title: 'Update Estimated Values',
    subtitle: "Vinster couldn't find a value for these wines. Enter your own estimate for one bottle at its size — a magnum's value for a magnum, a half bottle's for a half.",
    alt: { label: 'Input Purchase Values', mode: 'addPurchaseForUnvalued' },
  },
  addPurchaseForUnvalued: {
    field: 'purchase_price', wines: 'unvaluable', title: 'Input Purchase Values',
    subtitle: 'Enter what you paid per bottle for these wines — this adds to your Total Purchase Value.',
    alt: { label: 'Input Current Values', mode: 'addCurrentValues' },
  },
};

// ---- The figures ----

// Everything the page shows that depends only on the wines, worked out in one
// pass per measure (and each wine's maturity once).
function cellarStats(wines: CellarWine[]) {
  const purchaseByCurrency: Record<string, number> = {};
  const valueByCurrency: Record<string, number> = {};
  // Change Since Purchase compares like with like: only wines with BOTH a
  // purchase price and a current value, in the same currency.
  const paired: Record<string, { paid: number; worth: number }> = {};
  let pairedWines = 0;
  let lastEstimateAt: string | null = null;
  const styleBottles = Object.fromEntries(STYLE_BUCKETS.map((b) => [b, 0])) as Record<StyleBucket, number>;
  const byWindow = Object.fromEntries(WINDOW_BUCKETS.map((b) => [b.status, [] as CellarWine[]])) as Record<WindowStatus, CellarWine[]>;
  const awaitingWindow: CellarWine[] = [];

  for (const w of wines) {
    const worth = holdingValue(w);
    if (w.purchase_price != null) {
      const code = currencyOf(w.purchase_price_currency);
      purchaseByCurrency[code] = (purchaseByCurrency[code] ?? 0) + Number(w.purchase_price) * qty(w);
    }
    if (worth != null) {
      const code = currencyOf(w.estimated_value_currency);
      valueByCurrency[code] = (valueByCurrency[code] ?? 0) + worth;
    }
    if (w.purchase_price != null && worth != null && currencyOf(w.purchase_price_currency) === currencyOf(w.estimated_value_currency)) {
      const code = currencyOf(w.purchase_price_currency);
      const p = paired[code] ?? (paired[code] = { paid: 0, worth: 0 });
      p.paid += Number(w.purchase_price) * qty(w);
      p.worth += worth;
      pairedWines++;
    }
    if (w.estimated_value_at && (!lastEstimateAt || w.estimated_value_at > lastEstimateAt)) lastEstimateAt = w.estimated_value_at;

    const style = inferWineStyle(w);
    styleBottles[style ?? 'Other'] += qty(w);

    // Counted per wine, not bottle. Spirits have no drinking window to await.
    const maturity = effectiveMaturity(w);
    if (isWindowStatus(maturity)) byWindow[maturity].push(w);
    else if (!w.is_spirit) awaitingWindow.push(w);
  }

  // Compared on whole-unit totals, as the app shows currency to zero decimals.
  const change = Object.entries(paired)
    .filter(([, p]) => Math.round(p.paid) > 0)
    .map(([code, p]) => ({ code, pct: ((Math.round(p.worth) - Math.round(p.paid)) / Math.round(p.paid)) * 100 }));

  const unvalued = wines.filter((w) => w.estimated_value == null);
  // "Not yet valued" (never attempted) vs "unvaluable" (Vinster tried — the
  // attempt is stamped — but found no value), so wines Vinster can't value
  // don't read as if the last update did nothing.
  const notYetValued = unvalued.filter((w) => !w.estimated_value_at);

  return {
    totalWines: wines.length,
    totalBottles: wines.reduce((n, w) => n + qty(w), 0),
    purchaseTotal: fmtMultiCurrency(purchaseByCurrency),
    valueTotal: fmtMultiCurrency(valueByCurrency),
    change,
    pairedWines,
    lastEstimateAt,
    notYetValued,
    importedNotYetValued: notYetValued.filter((w) => w.added_via === 'import').length,
    editorWines: {
      unvaluable: unvalued.filter((w) => !!w.estimated_value_at),
      noPurchase: wines.filter((w) => w.purchase_price == null),
      estimatedPurchase: wines.filter((w) => w.purchase_price != null && w.purchase_price_estimated),
    } satisfies Record<EditorWines, CellarWine[]>,
    // Regional shares are of bottles with a KNOWN region, so region-less wines
    // don't dilute every share.
    topRegions: mostRepresentedRegions(wines, 3),
    classifiedBottles: classifiedRegionBottles(wines),
    styleBottles,
    byWindow,
    awaitingWindow,
  };
}

const NO_WINES: CellarWine[] = [];

// The rack heal reads every rack slot, so it runs once per cellar per session.
const repairedThisSession = new Set<string>();

// ---- Small pieces ----

type MetaLink = { label: string; onPress: () => void };

// A muted note line, with gold links after it. A line with one link is
// tappable as a whole.
function MetaLine({ text, links = [], style }: { text?: string; links?: MetaLink[]; style?: StyleProp<ViewStyle> }) {
  const single = links.length === 1;
  const body = (
    <Text style={styles.metaText}>
      {text}
      {links.map((l, i) => (
        <Text key={l.label}>
          {text || i > 0 ? ' · ' : ''}
          <Text style={styles.metaLink} onPress={single ? undefined : l.onPress}>{l.label}</Text>
        </Text>
      ))}
    </Text>
  );
  return single ? (
    <TouchableOpacity style={[styles.metaRow, style]} onPress={links[0].onPress} activeOpacity={0.7}>{body}</TouchableOpacity>
  ) : (
    <View style={[styles.metaRow, style]}>{body}</View>
  );
}

function WineLine({ wine: w, last }: { wine: CellarWine; last: boolean }) {
  return (
    <TouchableOpacity style={[styles.wineRow, last && styles.wineRowLast]} onPress={() => router.push(`/cellar/${w.id}`)} activeOpacity={0.7}>
      <Text style={styles.wineName} numberOfLines={1}>{[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ')}</Text>
      <Text style={styles.wineMeta} numberOfLines={1}>
        {[w.region, `${qty(w)} × ${bottleSizeLabel(w.bottle_size_ml ?? 750)}`].filter(Boolean).join(' · ')}
      </Text>
    </TouchableOpacity>
  );
}

// The Drinking Window section is the page's list: its bucket rows, and the
// wines of whichever bucket is open, are virtualised (a large cellar can open
// thousands of them).
type WindowRow =
  | { kind: 'bucket'; key: string; status: WindowStatus; label: string; count: number }
  | { kind: 'awaiting'; key: string; count: number }
  | { kind: 'wine'; key: string; wine: CellarWine; last: boolean };

function wineRows(group: string, wines: CellarWine[]): WindowRow[] {
  return wines.map((wine, i) => ({ kind: 'wine', key: `${group}:${wine.id}`, wine, last: i === wines.length - 1 }));
}

export default function CellarStatsScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines, isLoading, isError } = useCellar();
  const { preferences } = usePreferences();
  const { role, ownerId } = useCellarContext();
  const canEdit = role !== 'view';
  const qc = useQueryClient();
  const refreshCellar = () => invalidateCellarViews(qc);
  const bulk = useBulkIntel(refreshCellar);

  const [editor, setEditor] = useState<EditorMode | null>(null);
  const [expanded, setExpanded] = useState<WindowStatus | 'awaiting' | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const cellarId = ownerId ?? userId;
    if (!userId || !cellarId || !canEdit || repairedThisSession.has(cellarId)) return;
    repairedThisSession.add(cellarId);
    void repairRackedWines(userId).then((fixed) => { if (fixed > 0) invalidateCellarViews(qc); });
  }, [userId, ownerId, canEdit, qc]);

  const stats = useMemo(() => cellarStats(wines), [wines]);

  // What each bulk valuation would update: only wines that need it, never
  // imported ones, nor those a recent run couldn't value (useBulkIntel.eligible;
  // empty for view-only members, which hides the links).
  //
  // A value is in the wrong currency when it isn't in the default currency —
  // the user's own, which is only known for their own cellar. In a shared cellar
  // the owner's currency isn't known here, so a member's run never re-values a
  // wine just for its currency (it would flip back and forth between the two).
  const defaultCurrency = currencyOf(preferences?.defaultCurrency);
  const ownCellar = role === 'owner';
  const { eligible } = bulk;
  const targets = useMemo(() => {
    const wrongCurrency = (w: CellarWine) => ownCellar && w.estimated_value != null && currencyOf(w.estimated_value_currency) !== defaultCurrency;
    const now = Date.now();
    const staleCurrency = eligible(wines.filter(wrongCurrency));
    return {
      recalculate: eligible(wines.filter((w) => !w.estimated_value_at || isValueStale(w, now) || wrongCurrency(w))),
      unvaluable: eligible(stats.editorWines.unvaluable),
      staleCurrency,
      staleCurrencyCodes: Array.from(new Set(staleCurrency.map((w) => currencyOf(w.estimated_value_currency)))),
    };
  }, [wines, stats, eligible, ownCellar, defaultCurrency]);

  const windowRows = useMemo(() => {
    const rows: WindowRow[] = [];
    for (const b of WINDOW_BUCKETS) {
      const inBucket = stats.byWindow[b.status];
      rows.push({ kind: 'bucket', key: b.status, status: b.status, label: b.label, count: inBucket.length });
      if (expanded === b.status) rows.push(...wineRows(b.status, inBucket));
    }
    if (stats.awaitingWindow.length > 0) {
      rows.push({ kind: 'awaiting', key: 'awaiting', count: stats.awaitingWindow.length });
      if (expanded === 'awaiting') rows.push(...wineRows('awaiting', stats.awaitingWindow));
    }
    return rows;
  }, [stats, expanded]);

  async function onRefresh() {
    setRefreshing(true);
    try { await qc.invalidateQueries({ queryKey: ['cellar', userId] }); }
    finally { setRefreshing(false); }
  }

  function onEditorSaved() {
    refreshCellar();
    setEditor(null);
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const { totalWines, totalBottles, topRegions, classifiedBottles, notYetValued, editorWines } = stats;
  // Wines in a drinking-window bucket — the buckets are a share of these, so
  // they read as a maturity mix rather than diluted by wines with no window yet.
  const winesWithWindow = WINDOW_BUCKETS.reduce((n, b) => n + stats.byWindow[b.status].length, 0);
  const lastEstimateDate = stats.lastEstimateAt
    ? new Date(stats.lastEstimateAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;
  const openEditor = (mode: EditorMode) => () => setEditor(mode);
  const editorSpec = editor ? EDITORS[editor] : null;

  const header = (
    <>
      {isError ? (
        // Without this the tiles below read 0 bottles / £0 on a failed fetch,
        // which looks like the cellar was wiped rather than a network problem.
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyBannerTitle}>Couldn&apos;t load your cellar</Text>
          <Text style={styles.emptyBannerBody}>
            These figures are incomplete. Check your connection and pull down to refresh — your wines are safe.
          </Text>
        </View>
      ) : totalWines === 0 ? (
        <View style={styles.emptyBanner}>
          <Text style={styles.emptyBannerTitle}>Your cellar is empty</Text>
          <Text style={styles.emptyBannerBody}>
            Add wines to your cellar and these stats will fill in automatically. The fields below show you what&apos;s tracked.
          </Text>
        </View>
      ) : null}

      {/* Top summary — the app's gold stat bar: wines · bottles, then the top
          three regions by share. */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryLine}>
          {totalWines} {totalWines === 1 ? 'Wine' : 'Wines'} · {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'}
        </Text>
        {topRegions.length > 0 ? (
          <>
            <View style={styles.summaryDivider} />
            <Text style={styles.summarySub}>
              {regionShareLine(topRegions, classifiedBottles)}
            </Text>
            {totalBottles - classifiedBottles > 0 ? (
              <Text style={styles.summaryNote}>
                Of {classifiedBottles} {classifiedBottles === 1 ? 'bottle' : 'bottles'} with a known region · {totalBottles - classifiedBottles} still unclassified
              </Text>
            ) : null}
          </>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cellar Value</Text>

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Total Purchase Value</Text>
          <Text style={[styles.valueAmount, !stats.purchaseTotal && styles.valueAmountMuted]}>{stats.purchaseTotal || '—'}</Text>
        </View>
        {editorWines.noPurchase.length > 0 ? (
          <MetaLine
            text={`${editorWines.noPurchase.length} Missing Value${editorWines.noPurchase.length === 1 ? '' : 's'}`}
            links={canEdit ? [{ label: 'View Wines to Update', onPress: openEditor('addPurchasePrices') }] : []}
          />
        ) : null}
        {editorWines.estimatedPurchase.length > 0 ? (
          <MetaLine
            text={`${editorWines.estimatedPurchase.length} Estimated value${editorWines.estimatedPurchase.length === 1 ? '' : 's'}`}
            links={canEdit ? [{ label: 'View Wines to Add Precise Purchase Value', onPress: openEditor('reviewEstimatedPurchases') }] : []}
          />
        ) : null}

        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Total Current Value</Text>
          <Text style={[styles.valueAmount, !stats.valueTotal && styles.valueAmountMuted]}>{stats.valueTotal || '—'}</Text>
        </View>
        {totalWines > 0 ? (
          <View style={styles.estimateMetaStack}>
            {notYetValued.length > 0 ? (
              <MetaLine text={`${winesLabel(notYetValued.length)} not yet valued${stats.importedNotYetValued > 0 ? ' (imported wines are valued when you open them)' : ''}`} />
            ) : null}
            {/* Wines Vinster tried but couldn't value. */}
            {editorWines.unvaluable.length > 0 ? (
              <MetaLine
                text={`${editorWines.unvaluable.length} Missing Value${editorWines.unvaluable.length === 1 ? '' : 's'}`}
                links={canEdit ? [
                  ...(targets.unvaluable.length > 0 ? [{ label: 'Auto Update All', onPress: () => bulk.start(targets.unvaluable, 'values', 'Auto Update All') }] : []),
                  { label: 'View Wines to Update', onPress: openEditor('addCurrentValues') },
                ] : []}
              />
            ) : null}
            {/* Values stored in another currency (the default was changed after
                valuing): re-value them so Total Current Value isn't mixed. */}
            {targets.staleCurrency.length > 0 ? (
              <MetaLine
                text={`${targets.staleCurrency.length} valued in ${targets.staleCurrencyCodes.length === 1 ? targets.staleCurrencyCodes[0] : 'another currency'}`}
                links={[{ label: `Refresh in ${defaultCurrency}`, onPress: () => bulk.start(targets.staleCurrency, 'values', `Refresh in ${defaultCurrency}`) }]}
              />
            ) : null}
            {lastEstimateDate || targets.recalculate.length > 0 ? (
              <MetaLine
                text={lastEstimateDate ? `Last valuation: ${lastEstimateDate}` : undefined}
                links={targets.recalculate.length > 0 ? [{
                  label: lastEstimateDate ? 'Recalculate' : 'Calculate cellar value',
                  onPress: () => bulk.start(targets.recalculate, 'values', lastEstimateDate ? 'Recalculate' : 'Calculate cellar value'),
                }] : []}
              />
            ) : null}
          </View>
        ) : null}

        {stats.change.length > 0 ? (
          <>
            <View style={styles.valueRow}>
              <Text style={styles.valueLabel}>Change Since Purchase</Text>
              <View style={styles.changeStack}>
                {stats.change.map((e) => (
                  <Text key={e.code} style={styles.changePct}>
                    {e.pct >= 0 ? '▲' : '▼'} {Math.abs(e.pct).toFixed(1)}%{stats.change.length > 1 ? ` ${e.code}` : ''}
                  </Text>
                ))}
              </View>
            </View>
            <MetaLine text={`Across the ${winesLabel(stats.pairedWines)} with both a purchase price and a current value`} />
          </>
        ) : null}
      </View>

      <View style={styles.windowHead}>
        <Text style={styles.sectionTitle}>Drinking Window</Text>
      </View>
    </>
  );

  const footer = (
    <>
      <View style={styles.windowEnd} />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Style</Text>
        {STYLE_BUCKETS.map((bucket) => (
          <View key={bucket} style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>{bucket}</Text>
            <Text style={styles.breakdownCount}>{stats.styleBottles[bucket]}</Text>
            <Text style={styles.breakdownPct}>{pct(stats.styleBottles[bucket], totalBottles)}</Text>
          </View>
        ))}
      </View>
    </>
  );

  function renderWindowRow({ item }: { item: WindowRow }) {
    if (item.kind === 'wine') {
      return <View style={styles.windowWines}><WineLine wine={item.wine} last={item.last} /></View>;
    }
    if (item.kind === 'awaiting') {
      // Opening a wine generates its intel, window included.
      return (
        <View style={styles.windowItem}>
          <MetaLine
            style={styles.awaitingRow}
            text={`${winesLabel(item.count)} awaiting a drinking window`}
            links={[{ label: canEdit ? 'View Wines to Update' : 'View Wines', onPress: () => setExpanded((e) => (e === 'awaiting' ? null : 'awaiting')) }]}
          />
        </View>
      );
    }
    const open = expanded === item.status;
    return (
      <TouchableOpacity
        style={[styles.windowItem, styles.breakdownRow]}
        onPress={() => setExpanded(open ? null : item.status)}
        disabled={item.count === 0}
        activeOpacity={0.7}
      >
        <View style={styles.conditionLabelWrap}>
          <Text style={styles.conditionLabelText}>{item.label}</Text>
          <Text style={[styles.conditionChevron, item.count === 0 && { opacity: 0.25 }]}>{open ? '⌃' : '⌄'}</Text>
        </View>
        <Text style={styles.breakdownCount}>{item.count}</Text>
        <Text style={styles.breakdownPct}>{pct(item.count, winesWithWindow)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar Statistics</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={windowRows}
        keyExtractor={(r) => r.key}
        renderItem={renderWindowRow}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
      />

      {canEdit ? (
        <WineValueEditorModal
          visible={editorSpec != null}
          field={editorSpec?.field ?? 'purchase_price'}
          seedField={editorSpec?.seedField}
          saveUntouched={editorSpec?.saveUntouched}
          title={editorSpec?.title ?? ''}
          subtitle={editorSpec?.subtitle ?? ''}
          wines={editorSpec ? editorWines[editorSpec.wines] : NO_WINES}
          altAction={editorSpec?.alt ? { label: editorSpec.alt.label, onPress: openEditor(editorSpec.alt.mode) } : undefined}
          currency={defaultCurrency}
          onClose={() => setEditor(null)}
          onSaved={onEditorSaved}
        />
      ) : null}

      <BulkIntelProgress progress={bulk.progress} title="Valuing your cellar…" onStop={bulk.stop} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },

  emptyBanner: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 },
  emptyBannerTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.text },
  emptyBannerBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 20 },

  // Left-aligned, borderless note lines under the value rows.
  metaRow: { paddingTop: 2, paddingBottom: spacing.xs, alignItems: 'flex-start' },
  metaText: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted },
  metaLink: { fontFamily: fonts.headingSemibold, color: colors.gold },
  summaryBar: { alignItems: 'center', paddingVertical: spacing.lg, gap: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  summarySub: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, letterSpacing: 0.3, textAlign: 'center' },
  summaryNote: { fontFamily: fonts.bodyRegular, fontSize: 11, color: colors.textMuted, letterSpacing: 0.2, textAlign: 'center', marginTop: 3 },
  summaryDivider: { alignSelf: 'stretch', height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: 2 },
  section: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  valueLabel: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, flexShrink: 1 },
  valueAmount: { fontSize: 17, fontFamily: fonts.bodyBold, color: colors.text, marginLeft: spacing.md },
  valueAmountMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  estimateMetaStack: { marginTop: spacing.sm, gap: 4 },
  changeStack: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'flex-end' },
  changePct: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold },

  // The Drinking Window section is split across the list's header, rows and
  // footer, so its padding and closing border are set per piece.
  windowHead: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  windowItem: { paddingHorizontal: spacing.xl },
  windowWines: { paddingLeft: spacing.xl + 18, paddingRight: spacing.xl },
  windowEnd: { paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  awaitingRow: { marginTop: spacing.sm },

  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  breakdownLabel: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  breakdownCount: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, width: 50, textAlign: 'right' },
  breakdownPct: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.gold, width: 60, textAlign: 'right' },
  // Label + chevron grouped on the left, so the chevron reads as "Too Young ⌄"
  // rather than sitting at the far right next to the percentage.
  conditionLabelWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  conditionLabelText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  conditionChevron: { fontSize: 15, color: colors.gold, marginLeft: spacing.xs },
  wineRow: { paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowLast: { marginBottom: spacing.sm },
  wineName: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  wineMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
