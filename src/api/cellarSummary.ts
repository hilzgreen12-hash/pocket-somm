import { supabase } from './supabase';

// "4 Locations · 190 Wines" for one cellar (the user's own or one shared with
// them), for the Cellar tab's Select A Cellar list. Locations: racks, fridges,
// bins and home storage locations (external cellars aren't at home). Wines:
// bottles not archived. Counts only — nothing is downloaded.
export async function fetchCellarSummary(ownerId: string): Promise<{ locations: number; wines: number }> {
  const [racks, locations, bottles] = await Promise.all([
    supabase.from('wine_racks').select('id', { count: 'exact', head: true }).eq('user_id', ownerId),
    supabase.from('storage_locations').select('id', { count: 'exact', head: true }).eq('user_id', ownerId).eq('is_external', false),
    countBottles(ownerId),
  ]);
  return { locations: (racks.count ?? 0) + (locations.count ?? 0), wines: bottles };
}

// Bottles across every line, a page at a time: the server returns at most 1,000
// rows per request and an imported cellar can hold thousands of lines.
async function countBottles(ownerId: string): Promise<number> {
  const PAGE = 1000;
  let total = 0;
  for (let from = 0; from < 50000; from += PAGE) {
    const { data, error } = await supabase.from('cellar_wines').select('quantity')
      .eq('user_id', ownerId).is('archived_at', null).order('id').range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as { quantity: number | null }[];
    total += rows.reduce((n, w) => n + (w.quantity ?? 0), 0);
    if (rows.length < PAGE) break;
  }
  return total;
}
