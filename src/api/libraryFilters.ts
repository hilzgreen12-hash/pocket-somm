import { supabase } from './supabase';

export type LibraryScope = 'label' | 'lineup';

export interface LibraryFilter {
  id: string;
  name: string;
  itemIds: string[];
}

// User-created filters for a library (Label or Lineup). Two cheap selects +
// an in-memory join — mirrors the rack custom_filters API.
export async function fetchLibraryFilters(userId: string, scope: LibraryScope): Promise<LibraryFilter[]> {
  const { data: filters, error } = await supabase
    .from('library_filters')
    .select('id, name')
    .eq('user_id', userId)
    .eq('scope', scope)
    .order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  const ids = (filters ?? []).map((f) => f.id);
  if (ids.length === 0) return [];

  const { data: links, error: linkErr } = await supabase
    .from('library_filter_items')
    .select('filter_id, item_id')
    .in('filter_id', ids);
  if (linkErr) throw new Error(linkErr.message);

  const byFilter = new Map<string, string[]>();
  for (const l of links ?? []) {
    const arr = byFilter.get(l.filter_id) ?? [];
    arr.push(l.item_id);
    byFilter.set(l.filter_id, arr);
  }
  return (filters ?? []).map((f) => ({ id: f.id, name: f.name, itemIds: byFilter.get(f.id) ?? [] }));
}

export async function createLibraryFilter(userId: string, scope: LibraryScope, name: string, itemIds: string[]): Promise<void> {
  const { data, error } = await supabase
    .from('library_filters')
    .insert({ user_id: userId, scope, name: name.trim() })
    .select('id')
    .single();
  if (error) throw new Error(error.message);
  await setLibraryFilterItems(data.id, itemIds);
}

export async function setLibraryFilterItems(filterId: string, itemIds: string[]): Promise<void> {
  await supabase.from('library_filter_items').delete().eq('filter_id', filterId);
  if (itemIds.length === 0) return;
  const rows = itemIds.map((item_id) => ({ filter_id: filterId, item_id }));
  const { error } = await supabase.from('library_filter_items').insert(rows);
  if (error) throw new Error(error.message);
}

export async function renameLibraryFilter(filterId: string, name: string): Promise<void> {
  const { error } = await supabase.from('library_filters').update({ name: name.trim() }).eq('id', filterId);
  if (error) throw new Error(error.message);
}

export async function deleteLibraryFilter(filterId: string): Promise<void> {
  const { error } = await supabase.from('library_filters').delete().eq('id', filterId);
  if (error) throw new Error(error.message);
}
