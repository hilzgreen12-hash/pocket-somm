import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCellar } from '../../../hooks/useCellar';
import { usePreferences } from '../../../hooks/usePreferences';
import { valueWine, forBottleSize, isWineNotFound } from '../../../services/pricing';
import { hasRealInsiderNote } from '../../../constants/insiderNote';
import { showAlert } from '../../AppAlert';
import { valueAndScorePatch } from '../../../services/bulkIntel';
import type { CellarWine, GrapeVariant } from '../../../types/wine';

// What the card's derived state is keyed on: the wine's identity, not just its
// row id — an edit that changes the producer, name or vintage makes it a
// different wine, so nothing worked out for the old one may carry over.
export function wineCardKey(w: Pick<CellarWine, 'id' | 'producer' | 'wine_name' | 'vintage' | 'region'>): string {
  return [w.id, w.producer, w.wine_name, w.vintage, w.region].map((p) => (p ?? '').trim().toLowerCase()).join('|');
}

// A wine with nothing yet — opened for the first time, it waits behind the
// "generating" tracker so the card only ever appears finished.
function isBare(w: CellarWine): boolean {
  return w.critic_score == null && w.estimated_value == null && !w.grape_variety;
}

// The key intel a card should never make the user ask for: the critic score,
// the market value and a real Inside Line.
function missingKeyIntel(w: CellarWine): boolean {
  return w.critic_score == null || w.estimated_value == null || !hasRealInsiderNote(w.insider_note);
}

// The card looks intel up by itself at most once every 30 days per wine, so a
// wine Vinster can't find doesn't spend a paid lookup on every open. Refresh /
// Generate work at any time.
const AUTO_LOOKUP_EVERY_MS = 30 * 24 * 60 * 60 * 1000;
const autoLookupKey = (wineId: string) => `vinster_intel_auto_${wineId}`;

async function autoLookupDue(wineId: string): Promise<boolean> {
  try {
    const last = Number(await AsyncStorage.getItem(autoLookupKey(wineId)));
    return !last || Date.now() - last >= AUTO_LOOKUP_EVERY_MS;
  } catch {
    return true;
  }
}

// Why a refresh left the stored value alone although it found an estimate.
function keptValueCopy(source: string | null): string {
  if (source === 'user') return "Wine-Searcher has no price for this wine, so the value you entered is kept rather than replaced with Vinster's estimate.";
  if (source === 'imported') return "Wine-Searcher has no price for this wine, so the value your import carried is kept rather than replaced with Vinster's estimate.";
  return "Wine-Searcher has no new price for this wine, so its last Wine-Searcher value is kept rather than replaced with Vinster's estimate.";
}

type RefreshOptions = {
  // A picked grape variant (the "Confirm this wine" prompt) pins the lookup.
  wineNameForQuery?: string;
  style?: string | null;
  grape?: string | null;
  // Generate even though the wine is ambiguous ("let Vinster choose").
  force?: boolean;
  // Started by the card itself on open, not by a tap.
  automatic?: boolean;
};

// Vinster's intel for a cellar wine (critic score, value, tasting note, drinking
// window, Inside Line): generated automatically on open when key intel is
// missing, and on demand from the card's Generate / update buttons. Lives in the
// card's gate (app/cellar/[wineId].tsx) because the gate shows the full-screen
// tracker while a bare wine generates. View-only members never generate.
export function useWineIntel(wine: CellarWine | undefined, canEdit: boolean) {
  const { updateWine } = useCellar();
  const { preferences } = usePreferences();
  const [refreshing, setRefreshing] = useState(false);
  const [autoGenerating, setAutoGenerating] = useState(false);
  // The wine whose automatic lookup was decided (run, or skipped as too recent).
  const [autoDecided, setAutoDecided] = useState<string | null>(null);
  // An automatic lookup on a bare wine came back with nothing at all.
  const [autoFailed, setAutoFailed] = useState(false);
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  const [grapeVariants, setGrapeVariants] = useState<GrapeVariant[] | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);

  const key = wine ? wineCardKey(wine) : null;
  const wantsAuto = !!wine && canEdit && !wine.archived_at && missingKeyIntel(wine);
  const autoTriedRef = useRef<string | null>(null);

  useEffect(() => {
    setAutoFailed(false);
    setNoIntelDismissed(false);
  }, [key]);

  useEffect(() => {
    if (!wine || !key || !wantsAuto || autoTriedRef.current === key) return;
    autoTriedRef.current = key;
    const bare = isBare(wine);
    void (async () => {
      const due = await autoLookupDue(wine.id);
      if (due) {
        AsyncStorage.setItem(autoLookupKey(wine.id), String(Date.now())).catch(() => {});
        if (bare) setAutoGenerating(true);
      }
      setAutoDecided(key);
      if (!due) return;
      try {
        const produced = await refresh({ automatic: true });
        // 'ambiguous' → the confirm prompt is open; the card fills once a variant is picked.
        if (produced !== 'ambiguous' && bare) setAutoFailed(!produced);
      } finally {
        setAutoGenerating(false);
      }
    })();
    // refresh reads the wine of this render; re-running per field change isn't wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, wantsAuto]);

  async function refresh(opts: RefreshOptions = {}): Promise<boolean | 'ambiguous'> {
    if (!wine) return false;
    setRefreshing(true);
    // A grape is pinned when the user just picked a variant or the wine already
    // carries one — either way it's trusted and the ambiguity check is skipped.
    const pinnedGrape = opts.grape ?? wine.grape_variety ?? null;
    try {
      // Wine-Searcher first (market price, and its score anchors Vinster's),
      // falling back to Vinster's own estimate when there's no match.
      const currency = preferences?.defaultCurrency ?? 'GBP';
      const asked = {
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        wineName: opts.wineNameForQuery ?? (wine.wine_name || null),
        vintage: wine.vintage || 'NV',
        style: opts.style ?? wine.style ?? null,
        grape: pinnedGrape,
      };
      const priced75 = await valueWine(asked, currency);

      // The same name is made as more than one wine and nothing says which:
      // ask rather than commit a guessed card.
      if (!opts.force && priced75.grapeAmbiguous && !pinnedGrape && priced75.grapeOptions.length >= 2) {
        setGrapeVariants(priced75.grapeOptions);
        setSelectedVariant(null);
        return 'ambiguous';
      }
      // A magnum, half or large format is valued as that format.
      const v = await forBottleSize(priced75, asked, wine.bottle_size_ml, currency);

      // The shared keep rule (bulkIntel): a stored value survives a lookup with
      // none, a Wine-Searcher outage, or — when it's a Wine-Searcher, user or
      // imported value — anything but a new Wine-Searcher price.
      const { keepValue, patch } = valueAndScorePatch(wine, v);
      // Kept only because it's protected — the lookup did bring an estimate.
      const keptProtected = keepValue && !v.wsUnavailable && v.estimatedValue != null;
      // The value the card shows after this — what a missing purchase price is
      // seeded from (never a stand-in made while Wine-Searcher was down).
      const shownValue = keepValue ? Number(wine.estimated_value) : v.wsUnavailable ? null : v.estimatedValue;

      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          ...patch,
          ...(v.wsWineId ? { ws_wine_id: v.wsWineId, ws_wine_name: v.wsWineName ?? null } : {}),
          tasting_notes: v.tastingNotes ?? wine.tasting_notes ?? null,
          insider_note: v.insiderNote ?? wine.insider_note ?? null,
          drinking_window_from: v.drinkingWindowFrom ?? wine.drinking_window_from ?? null,
          drinking_window_to: v.drinkingWindowTo ?? wine.drinking_window_to ?? null,
          drinking_window_status: v.drinkingWindowStatus ?? wine.drinking_window_status ?? 'unknown',
          grape_variety: pinnedGrape ?? v.grapeVariety ?? null,
          ...(opts.style ? { style: opts.style } : {}),
          // A seeded price is Vinster's estimate, dated the day the wine was cellared.
          ...(wine.purchase_price == null && shownValue != null ? {
            purchase_price: shownValue,
            purchase_price_currency: keepValue ? wine.estimated_value_currency : v.currency,
            purchase_price_estimated: true,
            purchase_price_at: wine.date_received ?? wine.created_at,
          } : {}),
        },
      });
      if (v.wsUnavailable) {
        showAlert({
          title: "Wine-Searcher couldn't be checked",
          body: keepValue
            ? "Wine-Searcher couldn't be checked just now, so this wine's value hasn't been changed. Please try again in a little while."
            : "Wine-Searcher couldn't be checked just now, so this value is Vinster's own estimate. Try again in a little while for the live Wine-Searcher price.",
        });
      } else if (keptProtected && !opts.automatic) {
        showAlert({ title: 'Value kept', body: keptValueCopy(wine.estimated_value_source) });
      }
      return v.criticScore != null || v.estimatedValue != null;
    } catch (e) {
      if (isWineNotFound(e)) showAlert({ title: "Vinster couldn't find this wine", body: "Vinster doesn't recognise this wine and Wine-Searcher has no listing for it, so no estimate is shown. Check the producer, wine name and vintage." });
      else showAlert({ title: 'Could not refresh', body: "Vinster couldn't generate an estimate right now. Please try again." });
      return false;
    } finally {
      setRefreshing(false);
    }
  }

  // Regenerate behind the full-screen tracker, so the card reappears finished.
  async function regenerateBehindTracker(opts: RefreshOptions) {
    setGrapeVariants(null);
    setAutoGenerating(true);
    try {
      await refresh(opts);
    } finally {
      setAutoGenerating(false);
    }
  }

  const bareAndWaiting = !!wine && wantsAuto && isBare(wine) && autoDecided !== key;
  return {
    refreshing,
    refresh,
    // The full-screen "generating Wine Intel" tracker: while a bare wine
    // generates, and while the card decides whether it should.
    showTracker: !!wine && !wine.archived_at && (autoGenerating || bareAndWaiting),
    // Nothing came back for a bare wine — usually a misspelt or mis-split name.
    noIntelVisible: !!wine && !wine.archived_at && !autoGenerating && !refreshing && autoFailed
      && wine.critic_score == null && wine.estimated_value == null && !noIntelDismissed,
    dismissNoIntel: () => setNoIntelDismissed(true),
    grape: {
      variants: grapeVariants,
      selected: selectedVariant,
      select: setSelectedVariant,
      confirm: () => {
        const opt = selectedVariant != null ? grapeVariants?.[selectedVariant] : undefined;
        if (!wine || !opt) return;
        void regenerateBehindTracker({
          wineNameForQuery: [wine.wine_name, opt.grape].filter(Boolean).join(' '),
          style: opt.style,
          grape: opt.grape,
        });
      },
      // "Not sure — let Vinster choose": the user always gets a card.
      letVinsterChoose: () => void regenerateBehindTracker({ force: true }),
      close: () => setGrapeVariants(null),
    },
  };
}

export type WineIntel = ReturnType<typeof useWineIntel>;
