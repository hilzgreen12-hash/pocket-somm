import { useMemo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { showAlert } from '../../AppAlert';
import { wc } from '../wcStyles';
import { s } from './styles';
import { fmtDay } from './format';
import { hasRealInsiderNote } from '../../../constants/insiderNote';
import { formatCurrency, currencySymbol } from '../../../constants/currency';
import { colors, spacing } from '../../../constants/theme';
import { perBottle } from '../../../utils/bottleValue';
import { effectiveMaturity } from '../../../utils/maturity';
import { byRecency, isSomeoneElsesBottle, visibleEntries } from '../../../utils/cellarReview';
import { findExistingReview } from '../../../utils/reviewDedup';
import { useChosenWines } from '../../../hooks/useChosenWines';
import { reviewPlaceLabel } from '../../../utils/reviewPlace';
import { sameWineIdentity } from '../../../utils/wineMatch';
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
// wine's review also confirms it was saved to Your Wine Reviews. `reviewRow`:
// the bottle line whose reviews to open, when it isn't the card's own (an
// archived bottle's reviews live on its cellar line).
export function reviewHrefs(wine: CellarWine, reviewRow: CellarWine = wine) {
  const title = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ') || wine.wine_name || 'this wine';
  const back = `&backTo=${encodeURIComponent(`/cellar/${wine.id}`)}${wine.archived_at ? `&savedToast=${encodeURIComponent(title)}` : ''}`;
  return {
    open: `/wines/chosen?openCellarReview=${reviewRow.id}${back}`,
    write: `/wines/chosen?openCellarReviewInput=${reviewRow.id}${back}`,
    edit: `/wines/chosen?openCellarReviewEdit=${reviewRow.id}${back}`,
  };
}

// A new review of this wine in the user's own Wine Reviews (for a bottle in
// someone else's shared cellar), returning to the card.
function ownReviewHref(wine: CellarWine): string {
  const qs = new URLSearchParams({ seedAdd: '1', backTo: `/cellar/${wine.id}` });
  if (wine.producer) qs.set('sp', wine.producer);
  if (wine.wine_name) qs.set('sw', wine.wine_name);
  if (wine.vintage) qs.set('sv', wine.vintage);
  if (wine.region) qs.set('sr', wine.region);
  if (wine.grape_variety) qs.set('sg', wine.grape_variety);
  return `/wines/chosen?${qs.toString()}`;
}

// Overview's facts bar: bottles (an archived wine: its archived bottles),
// critic score, value, drinking window. Each explains itself (or opens what it
// summarises) when tapped.
export function OverviewFacts({ wine, data, intel, canEdit, onBottles, onWindow }: {
  wine: CellarWine;
  data: WineCardData;
  intel: WineIntel;
  canEdit: boolean;
  // A live wine's bottle count opens its Cellar tab.
  onBottles?: () => void;
  onWindow: () => void;
}) {
  const isArchived = !!wine.archived_at;
  const bottles = isArchived ? data.inArchive : data.inCellar;
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
        <TouchableOpacity style={wc.Fact} onPress={onBottles} disabled={!onBottles} activeOpacity={0.7}>
          <Text style={wc.FactLabel}>{isArchived ? 'Archived' : 'Bottles'}</Text>
          {bottles.mixed ? (
            <>
              <Text style={wc.FactValue}>{bottles.total}</Text>
              <Text style={wc.FactSub}>mixed sizes</Text>
            </>
          ) : <Text style={wc.FactValue}>{bottles.label}</Text>}
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
            <Text style={wc.FactLabel}>Value</Text><Text style={wc.FactValue}>{formatCurrency(ev, wine.estimated_value_currency, { decimals: 0 })}<Text style={s.per75}>{perBottle(wine.bottle_size_ml)}</Text></Text>
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

export function OverviewTab({ wine, data, intel, range, canEdit, currency, onRangeWine, afterHistory }: {
  wine: CellarWine;
  data: WineCardData;
  intel: WineIntel;
  range: ProducerRangeState;
  canEdit: boolean;
  currency: string;
  onRangeWine: (name: string, tier: string | null) => void;
  // Shown straight after the history (an archived wine's Bottles in My Archive).
  afterHistory?: ReactNode;
}) {
  const isArchived = !!wine.archived_at;
  // An archived bottle starts with no reviews of its own (they stay on its
  // cellar line), so its card gathers the wine's reviews from every line of it
  // — this bottle, the live line and the other archived bottles — and remembers
  // which line holds the latest, for "View Review Card".
  const reviewSources = useMemo(() => {
    if (!isArchived) return [wine];
    const seen = new Set<string>();
    return [wine, ...data.cellarRows, ...data.archiveLine].filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  }, [isArchived, wine, data.cellarRows, data.archiveLine]);
  const { reviews, rowOfEntry } = useMemo(() => {
    const rowOf = new Map<string, CellarWine>();
    for (const row of reviewSources) for (const e of visibleEntries(row)) if (!rowOf.has(e.id)) rowOf.set(e.id, row);
    // One copy of each entry (older archive copies can carry the live line's).
    const seen = new Set<string>();
    const unique = reviewSources.flatMap((row) => visibleEntries(row)).filter((e) => (seen.has(e.id) ? false : (seen.add(e.id), true)));
    return { reviews: byRecency(unique), rowOfEntry: rowOf };
  }, [reviewSources]);
  // In someone else's shared cellar the owner's reviews stay hidden; the
  // member's own review of the wine lives in their Wine Reviews.
  const othersBottle = isSomeoneElsesBottle(wine);
  const { chosenWines } = useChosenWines();
  const myReview = useMemo(() => (othersBottle
    ? findExistingReview(chosenWines, { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage })
    : null), [othersBottle, chosenWines, wine]);
  const latest = reviews[0] ?? null;
  // Reviews open on the line that holds them: the latest review's line, else the
  // live cellar line (where a new review of an archived bottle belongs).
  const reviewRow = (latest ? rowOfEntry.get(latest.id) : undefined) ?? (isArchived ? data.cellarRows[0] : undefined) ?? wine;
  const hrefs = reviewHrefs(wine, reviewRow);
  const placeOf = (r: { location: string | null }) => reviewPlaceLabel(r.location);

  // "Your History With This Wine", in the Wine Intel screen's order: when
  // bottles came and went, where they are now, and where the wine was drunk.
  // Plain statements, except lines that open what they describe.
  const history = useMemo(() => {
    const lines: HistoryLine[] = [];
    const b = (n: number) => `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
    const cap = (t: string) => `${t.charAt(0).toUpperCase()}${t.slice(1)}`;
    const your = (name: string) => (/^(your|my|the)\b/i.test(name) ? name : `your ${name}`);
    const newestFirst = (x: string, y: string) => new Date(y).getTime() - new Date(x).getTime();

    // 1. Each day bottles were added to the cellar, then each archive entry,
    //    newest first. An archive copy keeps the received date of the line it
    //    came from, so archived bottles count towards the day they were added.
    const addedByDay = new Map<string, number>();
    for (const w of [...data.cellarRows, ...data.archiveEntries]) {
      const day = (w.date_received ?? w.created_at)?.slice(0, 10);
      if (!day || !(w.quantity > 0)) continue;
      addedByDay.set(day, (addedByDay.get(day) ?? 0) + w.quantity);
    }
    for (const day of Array.from(addedByDay.keys()).sort(newestFirst)) {
      const n = addedByDay.get(day)!;
      lines.push({ key: `added-${day}`, text: `${n} ${n === 1 ? 'Bottle' : 'Bottles'} added to your cellar on ${fmtDay(day)}` });
    }
    // archiveEntries is already newest first. An entry opens its own card,
    // except the one this card already shows.
    for (const a of data.archiveEntries.filter((x) => x.quantity > 0)) {
      lines.push({
        key: `archived-${a.id}`,
        text: `${a.quantity} ${a.quantity === 1 ? 'Bottle' : 'Bottles'} added to your archive on ${fmtDay(a.archived_at)}`,
        ...(a.id === wine.id ? {} : { link: 'View', onPress: () => router.push(`/cellar/${a.id}`) }),
      });
    }

    // 2. Where the bottles are now, one line per rack, fridge, bin or alt
    //    cellar, each opening that storage with the wine highlighted; bottles
    //    held externally or not filed anywhere open the Full Cellar List
    //    filtered to this wine. Placements are this row's own, so an archived
    //    card (whose row holds none) skips this.
    if (!isArchived) {
      const listHref = `/cellar/list?wine=${wine.id}`;
      // Keyed by destination, so a place holding several cases is one line.
      const places = new Map<string, { n: number; place: string; href: string | null }>();
      for (const e of data.entries) {
        if (e.quantity <= 0) continue;
        const key = e.href ?? e.key;
        const prev = places.get(key);
        if (prev) prev.n += e.quantity;
        else places.set(key, { n: e.quantity, place: e.isExternal ? `in your external cellar, ${e.label}` : `in ${your(e.label)}`, href: e.href ?? (e.isExternal ? listHref : null) });
      }
      for (const [key, { n, place, href }] of places) {
        lines.push({ key, text: `${cap(b(n))} ${place}`, ...(href ? { link: 'View', onPress: () => router.push(href) } : {}) });
      }
      if (data.unplaced > 0) {
        lines.push({ key: 'loose', text: `${cap(b(data.unplaced))} in Your Cellar List`, link: 'View', onPress: () => router.push(listHref) });
      }
    }

    // 3. Each time the user drank the wine at a restaurant, newest first,
    //    opening that visit's restaurant review. (Chosen wines are always the
    //    viewer's own, so this holds in a shared cellar too.)
    const visits = chosenWines
      .filter((c) => !!c.restaurant_name?.trim() && sameWineIdentity(wine, { producer: c.producer, wine_name: c.wine_name, vintage: c.vintage }))
      .sort((x, y) => newestFirst(x.chosen_at, y.chosen_at));
    for (const c of visits) {
      const where = `${c.restaurant_name!.trim()}${c.city?.trim() ? ` in ${c.city.trim()}` : ''}`;
      lines.push({
        key: `drank-${c.id}`,
        text: `You drank this wine at ${where}`,
        link: 'View',
        onPress: () => router.push(c.scan_session_id
          ? `/restaurants/reviews?openSession=${c.scan_session_id}`
          : `/wines/chosen?openReview=${c.id}&backTo=${encodeURIComponent(`/cellar/${wine.id}`)}`),
      });
    }
    return lines;
  }, [data, wine, isArchived, chosenWines]);

  const inside = hasRealInsiderNote(wine.insider_note) ? wine.insider_note!.trim() : null;
  // Dive Deeper generates and saves a profile, so a view-only member only gets
  // it once one exists.
  const showDiveDeeper = !isArchived && (canEdit || !!wine.wine_knowledge);

  return (
    <>
      {history.length ? (
        <View style={wc.History}>
          <Text style={wc.HistoryTitle}>Your History With This Wine</Text>
          {history.map((l, i) => (
            <TouchableOpacity key={l.key} style={[wc.HistoryRow, i === history.length - 1 && wc.RowLast]} onPress={l.onPress} disabled={!l.onPress} activeOpacity={0.7}>
              <Text style={wc.HistoryText}>{l.text}</Text>
              {l.link ? <Text style={wc.Link}>{l.link} ›</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      {afterHistory}

      {othersBottle ? (
        <View style={wc.Card}>
          <Text style={wc.H2}>Your Reviews</Text>
          <Text style={wc.Small}>Your reviews of this wine are kept in your own Wine Reviews.</Text>
          <TouchableOpacity
            onPress={() => router.push((myReview ? `/wines/chosen?openReview=${myReview.id}&backTo=${encodeURIComponent(`/cellar/${wine.id}`)}` : ownReviewHref(wine)))}
            activeOpacity={0.7}
          >
            <Text style={[wc.Link, { marginTop: 6 }]}>{myReview ? 'View your review ›' : 'Add your review ›'}</Text>
          </TouchableOpacity>
        </View>
      ) : isArchived && (latest || canEdit) ? (
        // Archived bottle: the latest review of the wine, and one way into its
        // review card (history, and adding a review).
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
            </>
          ) : null}
          <TouchableOpacity onPress={() => router.push(latest ? hrefs.open : hrefs.write)} activeOpacity={0.7}>
            <Text style={[wc.Link, latest ? null : { marginTop: 2 }]}>View Review Card ›</Text>
          </TouchableOpacity>
        </View>
      ) : latest || canEdit ? (
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

