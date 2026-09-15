import { supabase } from './supabase';

export type LibraryScope = 'label' | 'lineup' | 'wine-review' | 'restaurant-review';

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

  // Page past the ~1000-row cap: a big "Import" folder can hold thousands of
  // items, and a single request would silently return only the first 1000.
  const links: { filter_id: string; item_id: string }[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error: linkErr } = await supabase
      .from('library_filter_items')
      .select('filter_id, item_id')
      .in('filter_id', ids)
      .range(from, from + PAGE - 1);
    if (linkErr) throw new Error(linkErr.message);
    const batch = data ?? [];
    links.push(...batch);
    if (batch.length < PAGE) break;
  }

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
  // Same as setCustomFilterWines: a silently failed delete turns the insert
  // below into a composite-primary-key collision (058_library_filters.sql:16)
  // rather than a replace.
  const { error: deleteError } = await supabase.from('library_filter_items').delete().eq('filter_id', filterId);
  if (deleteError) throw new Error(deleteError.message);
  if (itemIds.length === 0) return;
  // Chunked so a large "Import" folder (thousands of items) stays under the
  // request payload limit.
  const CHUNK = 1000;
  for (let i = 0; i < itemIds.length; i += CHUNK) {
    const rows = itemIds.slice(i, i + CHUNK).map((item_id) => ({ filter_id: filterId, item_id }));
    const { error } = await supabase.from('library_filter_items').insert(rows);
    if (error) throw new Error(error.message);
  }
}

export async function renameLibraryFilter(filterId: string, name: string): Promise<void> {
  const { error } = await supabase.from('library_filters').update({ name: name.trim() }).eq('id', filterId);
  if (error) throw new Error(error.message);
}

export async function deleteLibraryFilter(filterId: string): Promise<void> {
  const { error } = await supabase.from('library_filters').delete().eq('id', filterId);
  if (error) throw new Error(error.message);
}
