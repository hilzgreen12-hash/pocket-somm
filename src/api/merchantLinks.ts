import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';
import { supabase } from './supabase';
import { phoneRegion } from './accountActivity';
import { foldAccents, wineQueryName } from '../utils/wineIdentity';
import type { CellarWine } from '../types/wine';

// Wine-Searcher's own page for the wine and vintage. It picks merchants near
// the viewer by itself, so no country is passed. A plain web link — it uses
// none of the Wine-Searcher API allowance.
export function wineSearcherUrl(w: WhereToBuyWine): string {
  const name = foldAccents(wineQueryName(w.producer, w.wine_name))
    .replace(/[^a-z0-9]+/g, '+')
    .replace(/^\+|\+$/g, '');
  const vintage = /^\d{4}$/.test(String(w.vintage ?? '').trim()) ? `/${String(w.vintage).trim()}` : '';
  return `https://www.wine-searcher.com/find/${name}${vintage}`;
}

// The wine a Where to Buy tap is for: a cellar wine (its id and archived flag
// are recorded), or a scanned / searched wine on the intel card (no id).
export type WhereToBuyWine = Pick<CellarWine, 'producer' | 'wine_name' | 'vintage'> & Partial<Pick<CellarWine, 'id' | 'archived_at'>>;

// Where in the app the tap came from: a cellar wine card, the Wine Intel card
// after a label scan, upload or search, or the Where to Buy Search List.
export type WhereToBuySource = 'wine-card' | 'intel-card' | 'search-list';

// "Where to Buy": record the tap (best effort, never blocks), then open
// Wine-Searcher in the in-app browser. `onRecorded` runs once the tap is saved,
// so the Search List can refresh.
export function openWhereToBuy(w: WhereToBuyWine, userId: string | undefined, source: WhereToBuySource, onRecorded?: () => void): void {
  if (userId) {
    void supabase.from('merchant_link_taps').insert({
      user_id: userId,
      destination: 'wine-searcher',
      source,
      cellar_wine_id: w.id ?? null,
      producer: w.producer,
      wine_name: w.wine_name,
      vintage: w.vintage,
      archived: !!w.archived_at,
      country_code: phoneRegion().country_code,
    }).then(({ error }) => {
      if (error) console.warn('[where-to-buy] tap not recorded:', error.message);
      else onRecorded?.();
    });
  }
  const url = wineSearcherUrl(w);
  WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url).catch(() => {}));
}

// The Where to Buy Search List: the last wines the user tapped through, newest
// first, one entry per wine and vintage.
export const WHERE_TO_BUY_LIST_SIZE = 8;
export const WHERE_TO_BUY_RECENT_KEY = 'where-to-buy-recent';
export type WhereToBuyEntry = WhereToBuyWine & { tappedAt: string };

export async function fetchRecentWhereToBuy(userId: string): Promise<WhereToBuyEntry[]> {
  const { data, error } = await supabase.from('merchant_link_taps')
    .select('producer, wine_name, vintage, cellar_wine_id, archived, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  const seen = new Set<string>();
  const out: WhereToBuyEntry[] = [];
  for (const r of data ?? []) {
    const key = wineSearcherUrl(r);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      producer: r.producer, wine_name: r.wine_name, vintage: r.vintage,
      id: r.cellar_wine_id ?? undefined, archived_at: r.archived ? r.created_at : null,
      tappedAt: r.created_at,
    });
    if (out.length === WHERE_TO_BUY_LIST_SIZE) break;
  }
  return out;
}
