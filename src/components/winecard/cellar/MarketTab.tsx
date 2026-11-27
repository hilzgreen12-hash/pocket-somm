import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import { useWc } from '../wcStyles';
import { useArchivedCard, ARCHIVED } from '../cardTheme';
import { s } from './styles';
import { fmtDay } from './format';
import { showAlert } from '../../AppAlert';
import { useCellar } from '../../../hooks/useCellar';
import { WhereToBuyCard } from '../WhereToBuyCard';
import { usePreferences } from '../../../hooks/usePreferences';
import { stampPurchasePriceDate } from '../../../api/cellar';
import { normalisePriceText } from '../../../utils/priceInput';
import { perBottle, isStandardBottle } from '../../../utils/bottleValue';
import { vintageVerdict, tooFewVintagesNote, ordinal } from '../../../utils/wineCardInsights';
import { formatCurrency, currencySymbol } from '../../../constants/currency';
import { colors } from '../../../constants/theme';
import type { CellarWine, WineMarketVintageNote } from '../../../types/wine';
import type { MarketComparison } from './useMarketComparison';
import type { WineIntel } from './useWineIntel';

// What the user paid, editable in place. An estimate is dated the day the wine
// was cellared; a price the user entered, the day they entered it.
function PurchasePriceCard({ wine, canEdit }: { wine: CellarWine; canEdit: boolean }) {
  const wc = useWc();
  const { updateWine } = useCellar();
  const { preferences } = usePreferences();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const pp = wine.purchase_price != null ? Number(wine.purchase_price) : null;
  const cellaredOn = wine.date_received ?? wine.created_at;
  const dated = wine.purchase_price_estimated ? cellaredOn : (wine.purchase_price_at ?? cellaredOn);

  function startEditing() {
    setDraft(pp != null ? String(wine.purchase_price) : '');
    setEditing(true);
  }

  async function save() {
    Keyboard.dismiss();
    const trimmed = normalisePriceText(draft);
    const parsed = trimmed ? Number(trimmed) : null;
    if (parsed != null && (Number.isNaN(parsed) || parsed < 0)) {
      showAlert({ title: 'Invalid', body: 'Enter a positive number for the purchase price.' });
      return;
    }
    setSaving(true);
    try {
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          purchase_price: parsed,
          // The user's own figure now, not Vinster's estimate.
          purchase_price_estimated: false,
          // The currency is stamped on first entry only, so a historical price
          // stays in the currency it was paid in.
          ...(wine.purchase_price_currency ? {} : { purchase_price_currency: preferences?.defaultCurrency ?? 'GBP' }),
        },
      });
      void stampPurchasePriceDate(wine.id);
      setEditing(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save purchase price.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={[wc.Card, wc.Half]}>
      <Text style={wc.Label}>Purchase Price</Text>
      {editing ? (
        <>
          <TextInput style={s.statInput} value={draft} onChangeText={setDraft} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={colors.textMuted} autoFocus />
          <View style={s.statActions}>
            <TouchableOpacity onPress={() => setEditing(false)}><Text style={s.statCancel}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity onPress={save} disabled={saving}>
              <Text style={[s.statAction, saving && { opacity: 0.5 }]}>{saving ? '…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : pp != null ? (
        <TouchableOpacity onPress={startEditing} disabled={!canEdit} activeOpacity={0.7}>
          <Text style={wc.Value}>{formatCurrency(pp, wine.purchase_price_currency, { decimals: 0 })}</Text>
          <Text style={wc.Small}>{wine.purchase_price_estimated ? 'Estimated Market Value' : 'Entered by you'}</Text>
          {wine.purchase_price_estimated && wine.estimated_value_source ? (
            <Text style={wc.Small}>{wine.estimated_value_source === 'wine-searcher' ? 'Wine-Searcher' : 'Vinster estimate'}</Text>
          ) : null}
          {dated ? <Text style={wc.Small}>{fmtDay(dated)}</Text> : null}
          {canEdit ? <Text style={wc.LinkSmall}>Edit</Text> : null}
        </TouchableOpacity>
      ) : canEdit ? (
        <TouchableOpacity onPress={startEditing} activeOpacity={0.7}><Text style={s.statAction}>+ Add Price</Text></TouchableOpacity>
      ) : (
        <Text style={[wc.Value, s.statValueMuted]}>—</Text>
      )}
    </View>
  );
}

function MarketNoteLines({ note }: { note: WineMarketVintageNote | null }) {
  return (
    <>
      {note?.vintage ? <Text style={s.servingLine}><Text style={s.servingTitle}>Vintage · </Text>{note.vintage}</Text> : null}
      {note?.market ? <Text style={s.servingLine}><Text style={s.servingTitle}>Market · </Text>{note.market}</Text> : null}
    </>
  );
}

// The per-vintage table with Vinster's verdict, or the written note when
// Wine-Searcher has too little to compare.
function VintageComparison({ wine, market, canEdit, currency }: { wine: CellarWine; market: MarketComparison; canEdit: boolean; currency: string }) {
  const wc = useWc();
  const archived = useArchivedCard();
  const fmtMoney = (n: number) => formatCurrency(n, currency, { decimals: 0 });
  const verdict = market.rows ? vintageVerdict(market.rows, wine.vintage, fmtMoney) : null;
  const refreshLink = canEdit
    ? <TouchableOpacity onPress={() => void market.generate()} activeOpacity={0.7}><Text style={s.diveDeeperLink}>Refresh →</Text></TouchableOpacity>
    : null;

  if (market.generating) {
    return (
      <View style={s.loadingRow}>
        <ActivityIndicator color={colors.gold} />
        <Text style={wc.Small}>Checking Wine-Searcher across vintages…</Text>
      </View>
    );
  }
  if (market.rows && market.rows.length > 0 && verdict) {
    const ai = market.verdict;
    return (
      <>
        {/* The table compares vintages at 75cl, whatever size this bottle is. */}
        {!isStandardBottle(wine.bottle_size_ml) ? <Text style={wc.Small}>Wine-Searcher prices below are for standard 75cl bottles.</Text> : null}
        <View style={[wc.TRow, wc.THead]}>
          <Text style={[wc.TCell, wc.TYear, wc.Label]}>Vintage</Text>
          <Text style={[wc.TCell, wc.Label]}>Score</Text>
          <Text style={[wc.TCell, wc.Label]}>Price</Text>
          <Text style={[wc.TCell, wc.Label]}>{currencySymbol(currency)} / pt</Text>
        </View>
        {verdict.rows.map((r) => {
          const mine = String(r.vintage) === String(wine.vintage ?? '').trim();
          const best = r.vintage === verdict.bestValueVintage;
          return (
            <View key={r.vintage} style={wc.TRow}>
              <Text style={[wc.TCell, wc.TYear, mine && wc.TMine]}>{r.vintage}{mine ? ' · yours' : ''}</Text>
              {r.noData ? (
                <Text style={[wc.TCell, wc.TNoData, mine && wc.TMine]}>No market data</Text>
              ) : (
                <>
                  <Text style={[wc.TCell, mine && wc.TMine]}>{r.score ?? '—'}</Text>
                  <Text style={[wc.TCell, mine && wc.TMine]}>{r.price != null ? fmtMoney(r.price) : '—'}</Text>
                  <Text style={[wc.TCell, mine && wc.TMine]}>{r.ppt != null ? `${currencySymbol(currency)}${r.ppt.toFixed(2)}` : '—'}{best ? <Text style={wc.BestStar}> ★</Text> : null}</Text>
                </>
              )}
            </View>
          );
        })}
        <Text style={[s.vintageFootnote, archived && { color: ARCHIVED.inkMuted }]}>Wine-Searcher market value and aggregate critic score, by vintage.</Text>
        {verdict.total >= 2 ? (
          <View style={wc.Verdict}>
            <Text style={s.insiderTitle}>Vinster's verdict</Text>
            <View style={{ gap: 2 }}>
              {verdict.qualityRank != null ? <Text style={s.verdictPoint}>Your Wine Quality: <Text style={s.verdictPointGold}>{ordinal(verdict.qualityRank)} of {verdict.total} vintages</Text></Text> : null}
              {verdict.valueRank != null ? <Text style={s.verdictPoint}>Your Wine Value: <Text style={s.verdictPointGold}>{ordinal(verdict.valueRank)} of {verdict.total} vintages</Text></Text> : null}
              {verdict.bestValueVintage != null ? <Text style={s.verdictPoint}>Best Value Vintage: <Text style={s.verdictPointGold}>{verdict.bestValueVintage}</Text></Text> : null}
            </View>
            {market.verdictLoading ? (
              <View style={s.loadingRow}><ActivityIndicator color={colors.gold} /><Text style={wc.Small}>Vinster is weighing up this vintage…</Text></View>
            ) : ai ? (
              <>
                {ai.verdict ? <Text style={wc.BodyText}>{ai.verdict}</Text> : null}
                {ai.drinkNow ? (
                  <View style={{ gap: 2 }}>
                    <Text style={s.verdictPoint}>Best for Drinking Now: <Text style={s.verdictPointGold}>{ai.drinkNow.vintages.join(', ')}</Text></Text>
                    {ai.drinkNow.reason ? <Text style={wc.SmallItalic}>{ai.drinkNow.reason}</Text> : null}
                  </View>
                ) : null}
                {ai.layDown ? (
                  <View style={{ gap: 2 }}>
                    <Text style={s.verdictPoint}>Best to Lay Down: <Text style={s.verdictPointGold}>{ai.layDown.vintages.join(', ')}</Text></Text>
                    {ai.layDown.reason ? <Text style={wc.SmallItalic}>{ai.layDown.reason}</Text> : null}
                  </View>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
        {refreshLink}
        {verdict.total < 2 ? (
          <>
            <Text style={wc.Small}>{tooFewVintagesNote(verdict.total, wine.vintage)}</Text>
            <MarketNoteLines note={market.note} />
          </>
        ) : null}
      </>
    );
  }
  if (market.rows && market.note) {
    return (
      <View style={s.servingBubble}>
        <Text style={s.marketMissingNote}>Wine-Searcher has no per-vintage market data for this wine, so here's Vinster's assessment:</Text>
        <MarketNoteLines note={market.note} />
        {refreshLink}
      </View>
    );
  }
  if (market.rows) {
    return (
      <>
        <Text style={wc.Small}>Wine-Searcher has no per-vintage market data for this wine.{market.unknown ? " Vinster doesn't know this wine well enough to comment." : ''}</Text>
        {refreshLink}
      </>
    );
  }
  return canEdit ? (
    <TouchableOpacity style={s.generateBtn} onPress={() => void market.generate()} activeOpacity={0.7}>
      <Text style={s.generateBtnText}>Generate</Text>
    </TouchableOpacity>
  ) : <Text style={wc.Small}>Not generated yet.</Text>;
}

export function MarketTab({ wine, market, intel, canEdit, currency }: {
  wine: CellarWine;
  market: MarketComparison;
  intel: WineIntel;
  canEdit: boolean;
  currency: string;
}) {
  const wc = useWc();
  const isArchived = !!wine.archived_at;
  const ev = wine.estimated_value != null ? Number(wine.estimated_value) : null;
  const pp = wine.purchase_price != null ? Number(wine.purchase_price) : null;
  // Both are for this bottle at its own size.
  const sameCurrency = (wine.purchase_price_currency ?? currency) === (wine.estimated_value_currency ?? currency);
  const vsMarket = pp && ev != null && sameCurrency ? { pct: Math.round(((ev - pp) / pp) * 100), diff: ev - pp } : null;
  const rarity = wine.market_vintage_note?.rarity;

  return (
    <>
      <View style={wc.TwoUp}>
        <PurchasePriceCard wine={wine} canEdit={canEdit} />
        <TouchableOpacity style={[wc.Card, wc.Half]} onPress={() => void intel.refresh()} disabled={!canEdit || intel.refreshing} activeOpacity={canEdit && !intel.refreshing ? 0.7 : 1}>
          <Text style={wc.Label}>Estimated Value</Text>
          {intel.refreshing ? (
            <Text style={[wc.Value, s.statValueMuted]}>Estimating…</Text>
          ) : ev != null ? (
            <>
              <Text style={wc.Value}>{formatCurrency(ev, wine.estimated_value_currency, { decimals: 0 })}<Text style={s.per75}>{perBottle(wine.bottle_size_ml)}</Text>{canEdit ? <Text style={s.estimateUpdateLink}> (update)</Text> : null}</Text>
              {wine.estimated_value_low != null && wine.estimated_value_high != null ? (
                <Text style={wc.Small}>Range {formatCurrency(Number(wine.estimated_value_low), wine.estimated_value_currency, { decimals: 0 })}–{formatCurrency(Number(wine.estimated_value_high), wine.estimated_value_currency, { decimals: 0 })}</Text>
              ) : null}
              {wine.estimated_value_at ? (
                <>
                  {wine.estimated_value_source === 'wine-searcher' || wine.estimated_value_source === 'vinster' ? (
                    <Text style={wc.Small}>{wine.estimated_value_source === 'vinster' ? 'Vinster estimate' : wine.estimated_value_scope === 'all-vintage' ? 'Wine-Searcher · all vintages' : 'Wine-Searcher'}</Text>
                  ) : null}
                  <Text style={wc.Small}>{fmtDay(wine.estimated_value_at)}</Text>
                </>
              ) : null}
            </>
          ) : canEdit ? (
            <Text style={s.statAction}>+ Generate</Text>
          ) : (
            <Text style={[wc.Value, s.statValueMuted]}>—</Text>
          )}
        </TouchableOpacity>
      </View>

      {vsMarket ? (
        <View style={wc.VsBar}>
          <Text style={wc.Label}>Purchase vs Market</Text>
          <Text style={wc.VsValue}>{vsMarket.pct > 0 ? '+' : ''}{vsMarket.pct}% <Text style={wc.VsDiff}>({vsMarket.diff >= 0 ? '+' : '−'}{formatCurrency(Math.abs(vsMarket.diff), wine.estimated_value_currency, { decimals: 0 })})</Text></Text>
        </View>
      ) : null}

      <WhereToBuyCard wine={wine} source="wine-card" />

      {!isArchived && (canEdit || market.rows) ? (
        <View style={wc.Card}>
          <Text style={wc.H2}>Vinster's Market & Vintage Comparison</Text>
          <VintageComparison wine={wine} market={market} canEdit={canEdit} currency={currency} />
        </View>
      ) : null}

      {/* Rarity — Vinster's assessment, generated with the vintage table. */}
      {rarity ? (
        <View style={wc.Card}>
          <View style={wc.CardHead}>
            <Text style={wc.H2}>Rarity</Text>
            <Text style={wc.SmallItalic}>Vinster's assessment</Text>
          </View>
          {rarity.level ? (
            <>
              <View style={wc.RarityRow}>
                <View style={wc.RarityMeter}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <View key={i} style={[wc.RarityStep, i <= (rarity.level ?? 0) && wc.RarityStepOn]} />
                  ))}
                </View>
                <Text style={wc.GoldValue}>{rarity.label}</Text>
              </View>
              <Text style={wc.BodyText}>{rarity.text}</Text>
            </>
          ) : (
            <Text style={wc.Small}>Vinster doesn't know this wine well enough to judge how rare it is.</Text>
          )}
        </View>
      ) : null}
    </>
  );
}
