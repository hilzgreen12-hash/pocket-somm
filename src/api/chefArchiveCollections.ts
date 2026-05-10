import { supabase } from './supabase';

export interface ChefArchiveCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  item_count: number;
}

export interface ChefArchiveItemRef {
  collection_id: string;
  label_session_id: string | null;
  pairing_session_id: string | null;
}

export async function listChefArchiveCollections(userId: string): Promise<ChefArchiveCollection[]> {
  const { data: rows, error } = await supabase
    .from('chef_archive_collections')
    .select('id, user_id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const collections = (rows ?? []) as Omit<ChefArchiveCollection, 'item_count'>[];
  if (collections.length === 0) return [];

  const ids = collections.map((c) => c.id);
  const { data: items, error: itemsErr } = await supabase
    .from('chef_archive_collection_items')
    .select('collection_id')
    .in('collection_id', ids);
  if (itemsErr) throw itemsErr;

  const counts: Record<string, number> = {};
  for (const item of items ?? []) {
    counts[item.collection_id] = (counts[item.collection_id] ?? 0) + 1;
  }

  return collections.map((c) => ({ ...c, item_count: counts[c.id] ?? 0 }));
}

export async function createChefArchiveCollection(userId: string, name: string): Promise<ChefArchiveCollection> {
  const { data, error } = await supabase
    .from('chef_archive_collections')
    .insert({ user_id: userId, name })
    .select('id, user_id, name, created_at')
    .single();
  if (error) throw error;
  return { ...(data as Omit<ChefArchiveCollection, 'item_count'>), item_count: 0 };
}

export async function renameChefArchiveCollection(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('chef_archive_collections').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteChefArchiveCollection(id: string): Promise<void> {
  const { error } = await supabase.from('chef_archive_collections').delete().eq('id', id);
  if (error) throw error;
}

export async function addChefItemToCollection(
  collectionId: string,
  itemType: 'label' | 'pairing',
  itemId: string,
): Promise<void> {
  const row =
    itemType === 'label'
      ? { collection_id: collectionId, label_session_id: itemId, pairing_session_id: null }
      : { collection_id: collectionId, label_session_id: null, pairing_session_id: itemId };
  const { error } = await supabase.from('chef_archive_collection_items').upsert(row, {
    onConflict:
      itemType === 'label' ? 'collection_id,label_session_id' : 'collection_id,pairing_session_id',
  });
  if (error) throw error;
}

export async function removeChefItemFromCollection(
  collectionId: string,
  itemType: 'label' | 'pairing',
  itemId: string,
): Promise<void> {
  const filter =
    itemType === 'label'
      ? { label_session_id: itemId }
      : { pairing_session_id: itemId };
  const { error } = await supabase
    .from('chef_archive_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .match(filter);
  if (error) throw error;
}

// One round-trip fetch of every membership so the UI can quickly map
// session_id → folder_ids and filter the unified feed.
export async function listAllChefArchiveMemberships(userId: string): Promise<ChefArchiveItemRef[]> {
  const { data, error } = await supabase
    .from('chef_archive_collection_items')
    .select('collection_id, label_session_id, pairing_session_id, chef_archive_collections!inner(user_id)')
    .eq('chef_archive_collections.user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    collection_id: row.collection_id,
    label_session_id: row.label_session_id,
    pairing_session_id: row.pairing_session_id,
  }));
}

// Starring — toggles is_starred on either session table.
export async function setLabelSessionStarred(id: string, starred: boolean): Promise<void> {
  const { error } = await supabase
    .from('chef_label_sessions')
    .update({ is_starred: starred })
    .eq('id', id);
  if (error) throw error;
}

export async function setPairingSessionStarred(id: string, starred: boolean): Promise<void> {
  const { error } = await supabase
    .from('chef_pairing_sessions')
    .update({ is_starred: starred })
    .eq('id', id);
  if (error) throw error;
}
