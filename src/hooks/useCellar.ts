import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { useWarmLabelThumbs } from './useLabelImageUrl';
import { getCellarWines, addCellarWine, updateCellarWine, getArchivedWines, setAutoLabelIfMissing, type NewCellarWine } from '../api/cellar';
import { fetchAutoLabelUri } from '../api/label';
import { uploadLabelImage, removeLabelImage } from '../api/labelPhotos';
import type { CellarWine } from '../types/wine';
import { estimatePurchasePriceOnAdd, type PurchaseEstimateMode } from '../services/purchaseEstimate';
import { noteHappyMoment } from '../services/ratingPrompt';

// Refresh every cached view of the cellar's bottles and where they sit: the
// lists, the archive (and Cellar Insights' month of it), placements,
// racks/fridges, bins and alt cellars (with their cases and the Cellar tab's
// tile collages). For actions that can touch any of them — every archive,
// return, move, add or delete. Prefix keys, so each screen's per-id variants
// refetch too.
const CELLAR_VIEW_KEYS = [
  'cellar', 'cellar-archive', 'insights-archived-month', 'placements', 'placements-list',
  'rack-slots', 'slot-assignments', 'awaiting-placed-elsewhere', 'bins', 'bin-cells', 'bin-cell',
  'storage-locations', 'storage-location', 'storage-location-wines', 'storage-location-cases',
  'home-storage-thumbs',
];
export function invalidateCellarViews(qc: QueryClient): void {
  for (const key of CELLAR_VIEW_KEYS) void qc.invalidateQueries({ queryKey: [key] });
}

export function useCellar() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  // isError must be surfaced: `wines` defaults to [] on a failed fetch, so a
  // consumer that only reads isLoading renders "Your cellar is empty" to a
  // user who actually has bottles — indistinguishable from data loss.
  const { data: wines = [], isLoading, isError } = useQuery({
    queryKey: ['cellar', userId],
    // Syncs the copy already held, so only changed bottles are downloaded.
    queryFn: () => getCellarWines(userId, qc.getQueryData<CellarWine[]>(['cellar', userId])),
    enabled: !!userId,
  });
  // Have the first rows' thumbnails ready before the list is opened.
  useWarmLabelThumbs(wines, (w) => w.label_image_path);

  // Adding a wine is kept deliberately FAST — no wine-intel generation here.
  // Intel (critic score, value, tasting note) is generated lazily when the user
  // opens the wine card, and maturity/drinking-window is backfilled in the
  // background from Your Full Cellar List (see services/maturityBackfill) so the
  // maturity filter still works without slowing down the add.
  const addWine = useMutation({
    // `priceEstimate`: how to fill a missing purchase price with the market
    // value on the day the wine is added (default 'full'; multi-wine adds pass
    // 'market' so a long list doesn't fire a Vinster estimate per bottle).
    // `hasOwnPhoto`: the caller is about to attach the user's own label photo,
    // so no web label is looked up (it would waste a paid search).
    mutationFn: async (input: NewCellarWine & { priceEstimate?: PurchaseEstimateMode; hasOwnPhoto?: boolean }) => {
      const { priceEstimate = 'full', hasOwnPhoto = false, ...wine } = input;
      const saved = await addCellarWine(wine);
      if (saved?.id && saved.purchase_price == null && !saved.archived_at) {
        const prefs = qc.getQueryData<{ defaultCurrency?: string | null } | null>(['preferences', userId]);
        const currency = prefs?.defaultCurrency ?? saved.estimated_value_currency ?? 'GBP';
        void estimatePurchasePriceOnAdd(saved, currency, priceEstimate)
          .then((done) => { if (done) qc.invalidateQueries({ queryKey: ['cellar', userId] }); })
          .catch(() => { /* best-effort: the card can still estimate on demand */ });
      }
      // Best-effort: give a wine added without a photo a web label so it never
      // shows as a blank tile. Fire-and-forget — never blocks the add. Stored
      // under its own name and only used while the wine still has no picture,
      // so it can't replace a photo the user attaches meanwhile.
      if (saved?.id && !hasOwnPhoto && !saved.label_image_path && saved.producer) {
        void (async () => {
          try {
            const uri = await fetchAutoLabelUri(saved.producer, saved.wine_name);
            if (!uri) return;
            const path = await uploadLabelImage(userId, uri, `${saved.id}-web`);
            if (await setAutoLabelIfMissing(saved.id, path)) qc.invalidateQueries({ queryKey: ['cellar', userId] });
            else void removeLabelImage(path);
          } catch { /* best-effort thumbnail */ }
        })();
      }
      return saved;
    },
    onSuccess: (saved) => {
      if (saved && !saved.archived_at) noteHappyMoment('cellar-add');
      return qc.invalidateQueries({ queryKey: ['cellar', userId] });
    },
  });

  const updateWine = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CellarWine> }) => {
      await updateCellarWine(id, updates);
      // Community sharing is opt-in only — reviewing a cellar wine no longer
      // auto-publishes it. The "Share to Community" button on the wine card
      // (and review modal) is the single, explicit publish path.
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      // The wine card is shared between active and archived wines and reads
      // from whichever list contains the row. Without this the archive
      // query stays stale after edits made on an archived wine (purchase
      // price, estimated value, notes, etc.) and the UI shows old values.
      qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads', userId] });
    },
  });

  return { wines, isLoading, isError, addWine, updateWine };
}

// The cellar archive. `enabled: false` skips the fetch for screens that only
// sometimes show it.
export function useArchive(opts?: { enabled?: boolean }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: wines = [], isLoading, isError } = useQuery({
    queryKey: ['cellar-archive', userId],
    queryFn: () => getArchivedWines(userId, qc.getQueryData<CellarWine[]>(['cellar-archive', userId])),
    enabled: !!userId && (opts?.enabled ?? true),
    // Always refetch on mount so a just-archived wine appears immediately
    // — invalidation alone can be skipped if the cache is still fresh.
    refetchOnMount: 'always',
  });

  return { wines, isLoading, isError };
}
