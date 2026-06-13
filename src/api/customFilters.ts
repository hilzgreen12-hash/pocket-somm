import { supabase } from './supabase';

export interface CustomFilter {
  id: string;
  name: string;
  wineIds: string[];
}

// The user's custom filters for a SINGLE rack, with the cellar-wine ids that
// belong to each. Filters are scoped per-rack (see migration 051), so a filter
// created on one rack no longer shows on the others. Two cheap selects + an
// in-memory join (filter counts are small).
export async function fetchCustomFilters(userId: string, rackId: string): Promise<CustomFilter[]> {
  const { data: filters, error } = await supabase
    .from('custom_filters')
    .select('id, name')
    .eq('user_id', userId)
    .eq('rack_id', rackId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const ids = (filters ?? []).map((f) => f.id);
  if (ids.length === 0) return [];

  const { data: links, error: linkErr } = await supabase
    .from('custom_filter_wines')
    .select('filter_id, cellar_wine_id')
    .in('filter_id', ids);
  if (linkErr) throw new Error(linkErr.message);

  const byFilter = new Map<string, string[]>();
  for (const l of links ?? []) {
    const arr = byFilter.get(l.filter_id) ?? [];
    arr.push(l.cellar_wine_id);
    byFilter.set(l.filter_id, arr);
  }
  return (filters ?? []).map((f) => ({ id: f.id, name: f.name, wineIds: byFilter.get(f.id) ?? [] }));
}

export async function createCustomFilter(userId: string, name: string, wineIds: string[], rackId: string): Promise<void> {
  const { data, error } = await supabase
    .from('custom_filters')
    .insert({ user_id: userId, name: name.trim(), rack_id: rackId })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  await setCustomFilterWines(data.id, wineIds);
}

// Replace the wines on a filter (clears then inserts) — used by create + edit.
export async function setCustomFilterWines(filterId: string, wineIds: string[]): Promise<void> {
  await supabase.from('custom_filter_wines').delete().eq('filter_id', filterId);
  if (wineIds.length === 0) return;
  const rows = wineIds.map((cellar_wine_id) => ({ filter_id: filterId, cellar_wine_id }));
  const { error } = await supabase.from('custom_filter_wines').insert(rows);
  if (error) throw new Error(error.message);
}

export async function renameCustomFilter(filterId: string, name: string): Promise<void> {
  const { error } = await supabase.from('custom_filters').update({ name: name.trim() }).eq('id', filterId);
  if (error) throw new Error(error.message);
}

export async function deleteCustomFilter(filterId: string): Promise<void> {
  const { error } = await supabase.from('custom_filters').delete().eq('id', filterId);
  if (error) throw new Error(error.message);
}
