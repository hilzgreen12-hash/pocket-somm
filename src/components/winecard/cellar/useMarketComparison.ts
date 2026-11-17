import { useEffect, useRef, useState } from 'react';
import { useCellar } from '../../../hooks/useCellar';
import { fetchVintageComparison, isWineSearcherUnavailable, type VintageComparisonRow } from '../../../services/pricing';
import { generateMarketVintage, generateRarity, generateVintageVerdict, type VintageVerdictAI } from '../../../api/wineExtras';
import { wineQueryName, wineQueryAltName } from '../../../utils/wineIdentity';
import { vintageVerdict } from '../../../utils/wineCardInsights';
import { effectiveMaturity } from '../../../utils/maturity';
import { formatCurrency } from '../../../constants/currency';
import { showAlert } from '../../AppAlert';
import type { CellarWine, WineMarketVintageNote } from '../../../types/wine';

const NO_RARITY = { level: null, label: '', text: '' };

// A saved table and a verdict belong together only when written for the same rows.
const tableKey = (wineId: string, rows: { vintage: number; price: number | null }[]) =>
  `${wineId}:${rows.map((r) => `${r.vintage}-${r.price}`).join('|')}`;

// Market tab: the per-vintage Wine-Searcher table (vintage · score · price), a
// written market & vintage note when there are too few vintages to compare,
// Vinster's rarity assessment and Vinster's verdict. Generated the first time
// the tab opens, saved on the wine (market_vintage_note) so it reopens
// instantly; Refresh regenerates. View-only members see what's saved.
export function useMarketComparison(wine: CellarWine, opts: { open: boolean; canEdit: boolean; currency: string }) {
  const { updateWine } = useCellar();
  const { open, canEdit, currency } = opts;
  const [rows, setRows] = useState<VintageComparisonRow[] | null>(null);
  const [note, setNote] = useState<WineMarketVintageNote | null>(null);
  // Vinster's recognition check said it doesn't know this wine: an honest line, no note.
  const [unknown, setUnknown] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [verdict, setVerdict] = useState<VintageVerdictAI | null>(null);
  const [verdictLoading, setVerdictLoading] = useState(false);
  // The latest wine row: a verdict lands seconds later, maybe after a Refresh
  // saved a new table, so it merges into what's current, not a snapshot.
  const latestRef = useRef(wine);
  latestRef.current = wine;
  // A verdict that arrived before its table was first saved.
  const pendingVerdictRef = useRef<{ key: string; res: VintageVerdictAI } | null>(null);
  const loadedRef = useRef(false);
  const verdictKeyRef = useRef<string | null>(null);

  const saveNote = (next: WineMarketVintageNote) =>
    updateWine.mutateAsync({ id: wine.id, updates: { market_vintage_note: next } });

  async function generate() {
    if (generating || !canEdit) return;
    setGenerating(true);
    try {
      const scanned = parseInt(wine.vintage ?? '', 10);
      // Rarity runs alongside the vintage table; both are saved together.
      const rarityP = generateRarity(wine).then((r) => r ?? NO_RARITY).catch(() => undefined);
      const fetched = await fetchVintageComparison(
        wineQueryName(wine.producer, wine.wine_name),
        currency,
        Number.isFinite(scanned) ? scanned : null,
        wineQueryAltName(wine.producer, wine.wine_name, wine.region),
      );
      setRows(fetched);
      // Fewer than two vintages with a price and a score → add Vinster's written
      // market & vintage note rather than a dead end.
      let written: WineMarketVintageNote | null = null;
      let notKnown = false;
      if (vintageVerdict(fetched, wine.vintage, String).total < 2) {
        try {
          written = await generateMarketVintage(wine, currency);
          notKnown = written === null;
          setNote(written);
          setUnknown(notKnown);
        } catch { /* the table alone still shows */ }
      }
      try {
        const rarity = await rarityP;
        const pending = pendingVerdictRef.current;
        pendingVerdictRef.current = null;
        await saveNote({
          ...(written ?? {}),
          rows: fetched,
          unknown: notKnown,
          currency,
          at: new Date().toISOString(),
          ...(rarity !== undefined ? { rarity } : {}),
          ...(pending && pending.key === tableKey(wine.id, fetched) ? { verdictData: pending.res } : {}),
        });
      } catch { /* the live table still shows */ }
    } catch (e) {
      if (isWineSearcherUnavailable(e)) showAlert({ title: "Wine-Searcher isn't responding", body: "Vinster couldn't reach Wine-Searcher just now (it may have hit its daily limit). Please try again later." });
      else showAlert({ title: 'Could not generate', body: 'Please try again in a moment.' });
    } finally {
      setGenerating(false);
    }
  }

  // First open of the tab: show what's saved, else generate.
  useEffect(() => {
    if (!open || loadedRef.current || wine.archived_at) return;
    loadedRef.current = true;
    const saved = wine.market_vintage_note;
    if (saved?.rows) {
      setRows(saved.rows);
      setNote(saved.vintage || saved.market ? { vintage: saved.vintage, market: saved.market } : null);
      setUnknown(!!saved.unknown);
      // Saved before rarity existed → add it once, quietly.
      if (saved.rarity === undefined && canEdit) {
        void generateRarity(wine)
          .then((r) => saveNote({ ...saved, rarity: r ?? NO_RARITY }))
          .catch(() => {});
      }
    } else if (canEdit) {
      void generate();
    }
    // Runs once per card; the card remounts for a different wine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Vinster's verdict prose, once a comparable table is in: from what's saved
  // when it was written for this table, else generated and saved onto it.
  useEffect(() => {
    if (!open || !rows || rows.length < 2) return;
    const key = tableKey(wine.id, rows);
    if (verdictKeyRef.current === key) return;
    verdictKeyRef.current = key;
    const saved = wine.market_vintage_note;
    if (saved?.verdictData && saved.rows && tableKey(wine.id, saved.rows) === key) { setVerdict(saved.verdictData); return; }
    if (!canEdit) return;
    const v = vintageVerdict(rows, wine.vintage, (n) => formatCurrency(n, currency, { decimals: 0 }));
    setVerdict(null);
    setVerdictLoading(true);
    generateVintageVerdict(wine, {
      rows, currency, qualityRank: v.qualityRank, valueRank: v.valueRank, total: v.total, bestValueVintage: v.bestValueVintage,
      window: { from: wine.drinking_window_from, to: wine.drinking_window_to, status: effectiveMaturity(wine) },
      rarity: saved?.rarity?.label || null,
    })
      .then((res) => {
        if (!res) return;
        setVerdict(res);
        const now = latestRef.current.market_vintage_note;
        // Save only onto the table it was written for (a newer table gets its own).
        if (now?.rows && tableKey(wine.id, now.rows) === key) void saveNote({ ...now, verdictData: res }).catch(() => {});
        else if (!now) pendingVerdictRef.current = { key, res };
      })
      .catch(() => { verdictKeyRef.current = null; })
      .finally(() => setVerdictLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rows]);

  return { rows, note, unknown, generating, verdict, verdictLoading, generate };
}

export type MarketComparison = ReturnType<typeof useMarketComparison>;
