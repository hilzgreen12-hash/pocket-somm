import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { showAlert } from '../../AppAlert';
import { wc } from '../wcStyles';
import { s } from './styles';
import { fmtDay } from './format';
import { hasRealInsiderNote } from '../../../constants/insiderNote';
import { formatCurrency, currencySymbol } from '../../../constants/currency';
import { colors, spacing } from '../../../constants/theme';
import { PER_75CL } from '../../../utils/bottleValue';
import { effectiveMaturity } from '../../../utils/maturity';
import { entriesOf, byRecency } from '../../../utils/cellarReview';
import { reviewPlaceLabel } from '../../../utils/reviewPlace';
import type { CellarWine } from '../../../types/wine';
import type { WineCardData } from './useWineCardData';
import type { WineIntel } from './useWineIntel';
import type { ProducerRangeState } from './useProducerRange';

// Maturity reads in gold at every level (declining included) — never red.
const STATUS_COLORS: Record<string, string> = {
  too_young: colors.warning,
  approaching: colors.gold,
  peak: colors.gold,
  declining: colors.gold,
  unknown: colors.textMuted,
};
const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching Peak',
  peak: 'Peak Now',
  declining: 'Declining',
  unknown: 'Unknown',
};

// Where the market value came from (tapped from the facts bar).
function showValueSource(wine: CellarWine) {
  const cur = wine.estimated_value_currency;
  const lo = wine.estimated_value_low != null ? Number(wine.estimated_value_low) : null;
  const hi = wine.estimated_value_high != null ? Number(wine.estimated_value_high) : null;
  const allVintage = wine.estimated_value_scope === 'all-vintage';
  let body: string;
  if (wine.estimated_value_source === 'wine-searcher') {
    body = lo != null && hi != null && lo !== hi
      ? `Wine-Searcher values range from ${formatCurrency(lo, cur, { decimals: 0 })}–${formatCurrency(hi, cur, { decimals: 0 })}${allVintage ? ', across all vintages (no price for this exact vintage).' : '.'}`
      : `Wine-Searcher's market value${allVintage ? ', averaged across all vintages (no price for this exact vintage).' : ' for this wine.'}`;
  } else {
    body = "This value is Vinster's own estimate — there's no Wine-Searcher price for this exact wine.";
  }
  if (wine.estimated_value_at) body += `\n\nLast updated ${fmtDay(wine.estimated_value_at)}.`;
  showAlert({ title: 'Where this value comes from', body });
}

// A review opened from the card returns to it when it closes; an archived
// wine's review also confirms it was saved to Your Wine Reviews.
export function reviewHrefs(wine: CellarWine) {
  const title = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ') || wine.wine_name || 'this wine';
  const back = `&backTo=${encodeURIComponent(`/cellar/${wine.id}`)}${wine.archived_at ? `&savedToast=${encodeURIComponent(title)}` : ''}`;
  return {
    open: `/wines/chosen?openCellarReview=${wine.id}${back}`,
    write: `/wines/chosen?openCellarReviewInput=${wine.id}${back}`,
    edit: `/wines/chosen?openCellarReviewEdit=${wine.id}${back}`,
  };
}

// Overview's facts bar: bottles, critic score, value, drinking window. Each
// explains itself (or opens what it summarises) when tapped.
export function OverviewFacts({ wine, data, intel, canEdit, onBottles, onWindow }: {
  wine: CellarWine;
  data: WineCardData;
  intel: WineIntel;
  canEdit: boolean;
  onBottles: () => void;
  onWindow: () => void;
}) {
  const ev = wine.estimated_value != null ? Number(wine.estimated_value) : null;
  // The single canonical maturity (maturity.ts), so the card always agrees with
  // the cellar filters. Spirits don't mature: "NA".
  const status = effectiveMaturity(wine);
  const windowColor = wine.is_spirit ? colors.textMuted : STATUS_COLORS[status] ?? colors.textMuted;
  const windowLabel = wine.is_spirit ? 'NA' : STATUS_LABELS[status] ?? 'Unknown';
  const generate = canEdit
    ? <TouchableOpacity onPress={() => void intel.refresh()}><Text style={wc.FactAction}>+ Generate</Text></TouchableOpacity>
    : <Text style={[wc.FactValue, s.statValueMuted]}>—</Text>;
  const pending = intel.refreshing ? <Text style={[wc.FactValue, s.statValueMuted]}>…</Text> : generate;
  return (
    <>
      <View style={wc.Facts}>
        <TouchableOpacity style={wc.Fact} onPress={onBottles} activeOpacity={0.7}>
          <Text style={wc.FactLabel}>Bottles</Text>
          {data.inCellar.mixed ? (
            <>
              <Text style={wc.FactValue}>{data.inCellar.total}</Text>
              <Text style={wc.FactSub}>mixed sizes</Text>
            </>
          ) : <Text style={wc.FactValue}>{data.inCellar.label}</Text>}
        </TouchableOpacity>
        {wine.critic_score != null ? (
          <TouchableOpacity style={wc.Fact} onPress={() => showAlert({ title: 'How Vinster scored this', body: wine.critic_score_note?.trim() || "Vinster's score distils critic consensus and Wine-Searcher's aggregate rating for this wine into a single 100-point mark." })} activeOpacity={0.7}>
            <Text style={wc.FactLabel}>Critic</Text><Text style={wc.FactValue}>{wine.critic_score}</Text>
          </TouchableOpacity>
        ) : (
          <View style={wc.Fact}><Text style={wc.FactLabel}>Critic</Text>{pending}</View>
        )}
        {ev != null ? (
          <TouchableOpacity style={wc.Fact} onPress={() => showValueSource(wine)} activeOpacity={0.7}>
            <Text style={wc.FactLabel}>Value</Text><Text style={[wc.FactValue, { color: colors.gold }]}>{formatCurrency(ev, wine.estimated_value_currency, { decimals: 0 })}<Text style={s.per75}>{PER_75CL}</Text></Text>
          </TouchableOpacity>
        ) : (
          <View style={wc.Fact}><Text style={wc.FactLabel}>Value</Text>{pending}</View>
        )}
        <TouchableOpacity style={[wc.Fact, wc.FactLast]} onPress={onWindow} disabled={!!wine.is_spirit} activeOpacity={0.7}>
          <Text style={wc.FactLabel}>Window</Text>
          <Text style={[wc.FactValue, { color: windowColor }]} numberOfLines={1}>{windowLabel}</Text>
          {!wine.is_spirit && wine.drinking_window_from && wine.drinking_window_to ? <Text style={wc.FactSub}>{wine.drinking_window_from}–{wine.drinking_window_to}</Text> : null}
        </TouchableOpacity>
      </View>
      <Text style={s.factsHint}>Tap any stat to see how Vinster worked it out</Text>
    </>
  );
}

type HistoryLine = { key: string; text: string; link?: string; onPress?: () => void };

export function OverviewTab({ wine, data, intel, range, canEdit, currency, onRangeWine }: {
  wine: CellarWine;
  data: WineCardData;
  intel: WineIntel;
  range: ProducerRangeState;
  canEdit: boolean;
  currency: string;
  onRangeWine: (name: string, tier: string | null) => void;
}) {
  const isArchived = !!wine.archived_at;
  const reviews = useMemo(() => byRecency(entriesOf(wine)), [wine]);
  const latest = reviews[0] ?? null;
  const hrefs = reviewHrefs(wine);
  const placeOf = (r: { location: string | null }) => reviewPlaceLabel(r.location);

  // "Your History With This Wine": bottles added, where they are (home / each
  // external cellar), what's archived, and the latest review.
  const history = useMemo(() => {
    const lines: HistoryLine[] = [];
    const b = (n: number) => `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
    const cap = (t: string) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
    const home = data.entries.filter((e) => !e.isExternal);
    const homeQty = home.reduce((n, e) => n + e.quantity, 0) + data.unplaced;
    const homePlaces = Array.from(new Set(home.map((e) => e.label)));
    const placeCount = homePlaces.length + (data.unplaced > 0 && homePlaces.length > 0 ? 1 : 0);
    const your = (name: string) => (/^(your|my|the)\b/i.test(name) ? name : `your ${name}`);
    const everAdded = data.inCellar.total + data.inArchive.total;
    const cellaredOn = wine.date_received ?? wine.created_at;
    if (everAdded > 0 && cellaredOn) {
      lines.push({ key: 'added', text: `${everAdded} ${everAdded === 1 ? 'Bottle' : 'Bottles'} added to your cellar on ${fmtDay(cellaredOn)}` });
    }
    if (homeQty > 0) {
      const where = placeCount === 1 && homePlaces.length === 1 ? ` in ${your(homePlaces[0])}`
        : placeCount > 1 ? ` across ${placeCount} home locations`
        : ' at home';
      lines.push({ key: 'home', text: `${cap(b(homeQty))}${where}` });
    }
    for (const e of data.entries.filter((x) => x.isExternal)) {
      lines.push({ key: `ext-${e.key}`, text: `${cap(b(e.quantity))} in your external cellar, ${e.label}` });
    }
    if (data.inArchive.total > 0) lines.push({ key: 'archive', text: `You have ${b(data.inArchive.total)} in your archive` });
    if (latest) {
      const place = placeOf(latest);
      const more = reviews.length - 1;
      lines.push({
        key: 'review',
        text: `Reviewed on ${fmtDay(latest.date ?? latest.savedAt)}${place ? `, at ${place}` : ''}${more > 0 ? ` (and ${more} more ${more === 1 ? 'time' : 'times'})` : ''}`,
        link: 'View review',
        onPress: () => router.push(hrefs.open),
      });
    }
    return lines;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, wine, reviews]);

  const inside = hasRealInsiderNote(wine.insider_note) ? wine.insider_note!.trim() : null;
  // Dive Deeper generates and saves a profile, so a view-only member only gets
  // it once one exists.
  const showDiveDeeper = !isArchived && (canEdit || !!wine.wine_knowledge);

  return (
    <>
      {history.length ? (
        <View style={wc.History}>
          <Text style={wc.HistoryTitle}>Your History With This Wine</Text>
          {history.map((l, i) => {
            const style = [wc.HistoryRow, i === history.length - 1 && wc.RowLast];
            // Bottle lines are plain here (the Cellar tab holds that detail); only the review links out.
            return l.onPress ? (
              <TouchableOpacity key={l.key} style={style} onPress={l.onPress} activeOpacity={0.7}>
                <Text style={wc.HistoryText}>{l.text}</Text>
                <Text style={wc.Link}>{l.link} ›</Text>
              </TouchableOpacity>
            ) : (
              <View key={l.key} style={style}><Text style={wc.HistoryText}>{l.text}</Text></View>
            );
          })}
        </View>
      ) : null}

      {latest || canEdit ? (
        <View style={wc.Card}>
          <View style={wc.CardHead}>
            <Text style={wc.H2}>Your Reviews</Text>
            {reviews.length > 0 ? <Text style={wc.Small}>{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</Text> : null}
          </View>
          {latest ? (
            <>
              <Text style={wc.Label}>Latest</Text>
              <View style={wc.ScoreRow}>
                {latest.score != null ? <Text style={wc.BigScore}>{latest.score}<Text style={wc.BigScoreOf}>/100</Text></Text> : null}
                <Text style={wc.Small}>{[fmtDay(latest.date ?? latest.savedAt), placeOf(latest)].filter(Boolean).join(' · ')}</Text>
              </View>
              {latest.note ? <Text style={wc.BodyText} numberOfLines={8}>{latest.note}</Text> : null}
              <TouchableOpacity onPress={() => router.push((canEdit ? hrefs.edit : hrefs.open))} activeOpacity={0.7}><Text style={wc.Link}>View full review ›</Text></TouchableOpacity>
              {reviews.length > 1 ? (
                <>
                  <TouchableOpacity onPress={() => router.push(hrefs.open)} activeOpacity={0.7}><Text style={[wc.Link, { marginTop: 6 }]}>View review history ›</Text></TouchableOpacity>
                  <View style={wc.List}>
                    <Text style={[wc.Label, { paddingTop: spacing.sm }]}>Earlier reviews</Text>
                    {reviews.slice(1).map((r, i, arr) => (
                      <TouchableOpacity key={r.id} style={[wc.Row, i === arr.length - 1 && wc.RowLast]} onPress={() => router.push(hrefs.open)} activeOpacity={0.7}>
                        <Text style={wc.RowText} numberOfLines={1}>{[fmtDay(r.date ?? r.savedAt), placeOf(r)].filter(Boolean).join(' · ')}</Text>
                        <View style={wc.RowRight}>{r.score != null ? <Text style={wc.RowScore}>{r.score}</Text> : null}<Text style={wc.Chevron}>›</Text></View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}
            </>
          ) : (
            <TouchableOpacity onPress={() => router.push(hrefs.write)} activeOpacity={0.7}>
              <Text style={wc.Link}>Add your review ›</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {wine.critic_score == null && wine.critic_score_note ? (
        <View style={wc.Note}><Text style={wc.Label}>Why no critic score?</Text><Text style={wc.NoteText}>{wine.critic_score_note}</Text></View>
      ) : null}

      {wine.tasting_notes || intel.refreshing || canEdit ? (
        <View style={wc.Card}>
          <Text style={wc.H2}>Vinster's Review</Text>
          {wine.tasting_notes ? (
            <Text style={wc.BodyText}>{wine.tasting_notes}</Text>
          ) : intel.refreshing ? (
            <Text style={wc.Small}>Generating Vinster's review…</Text>
          ) : (
            <TouchableOpacity style={s.generateBtn} onPress={() => void intel.refresh()} activeOpacity={0.7}>
              <Text style={s.generateBtnText}>Generate</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {inside || !isArchived ? (
        <View style={[wc.Card, wc.Inside]}>
          <Text style={s.insiderTitle}>The Inside Line</Text>
          {inside ? (
            <Text style={s.insiderBody}>{inside}</Text>
          ) : intel.refreshing ? (
            <Text style={s.insiderBody}>Generating…</Text>
          ) : canEdit ? (
            <TouchableOpacity style={s.generateBtn} onPress={() => void intel.refresh()} activeOpacity={0.7}>
              <Text style={s.generateBtnText}>Generate</Text>
            </TouchableOpacity>
          ) : null}
          {showDiveDeeper ? (
            <TouchableOpacity onPress={() => router.push(`/cellar/wine-knowledge/${wine.id}`)} activeOpacity={0.7}>
              <Text style={s.diveDeeperLink}>Dive deeper into this wine →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {range.loading || range.wines.length > 0 ? (
        <View style={wc.Card}>
          <Text style={s.insiderTitle}>The {wine.producer} Range</Text>
          {range.wines.some((rw) => !rw.isThis) ? <Text style={s.rangeHint}>Tap a wine for its inside line</Text> : null}
          {range.range ? (
            <>
              {range.wines.map((rw, i) => (
                <TouchableOpacity key={`${rw.wineName}-${i}`} style={[s.rangeRow, rw.isThis && s.rangeRowThis]} onPress={() => onRangeWine(rw.wineName, rw.tier ?? null)} activeOpacity={(rw.isThis || rw.grouped) ? 1 : 0.7} disabled={rw.isThis || rw.grouped}>
                  <View style={s.rangeRowMain}>
                    <Text style={[s.rangeMarker, !rw.isThis && s.rangeMarkerHidden]}>▸</Text>
                    <Text style={[s.rangeName, rw.isThis && s.rangeNameThis]} numberOfLines={rw.grouped ? 4 : 2}>{rw.wineName}</Text>
                  </View>
                  <View style={s.rangeRight}>
                    <Text style={[s.rangeBand, rw.isThis && s.rangeBandThis]}>{currencySymbol(currency).repeat(rw.band)}</Text>
                    {rw.tier ? <Text style={s.rangeTier}>{rw.tier}</Text> : null}
                  </View>
                </TouchableOpacity>
              ))}
              {range.range.summary ? <Text style={s.rangeSummary}>{range.range.summary}</Text> : null}
            </>
          ) : (
            <View style={s.loadingRow}>
              <ActivityIndicator color={colors.gold} />
              <Text style={s.rangeLoadingText}>Mapping the range…</Text>
            </View>
          )}
        </View>
      ) : null}
    </>
  );
}

