import * as Application from 'expo-application';
import { supabase } from './supabase';

// Record a wine that none of Vinster's checks recognised (catalogue,
// Wine-Searcher, Vinster's knowledge, the web check), so the owner can see
// gaps in recognition as they happen (migration 152). Best-effort: never
// delays or breaks the card.
export function recordLookupMiss(wine: { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null }, wineSearcherDown: boolean): void {
  void (async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) return;
      await supabase.from('wine_lookup_misses').insert({
        user_id: userId,
        producer: (wine.producer ?? '').trim() || null,
        wine_name: (wine.wineName ?? '').trim() || null,
        vintage: wine.vintage != null ? String(wine.vintage).trim() || null : null,
        region: (wine.region ?? '').trim() || null,
        wine_searcher_down: wineSearcherDown,
        app_version: Application.nativeApplicationVersion ?? null,
      });
    } catch { /* best-effort */ }
  })();
}
