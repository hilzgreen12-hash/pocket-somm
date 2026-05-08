import { supabase } from './supabase';

export interface RecipeCollection {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  recipe_count: number;
}

export async function listRecipeCollections(userId: string): Promise<RecipeCollection[]> {
  // Fetch collections plus a count of how many recipes are in each. Two
  // round-trips kept simple for now; could be folded into a view if perf
  // ever matters.
  const { data: rows, error } = await supabase
    .from('recipe_collections')
    .select('id, user_id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;

  const collections = (rows ?? []) as Omit<RecipeCollection, 'recipe_count'>[];
  if (collections.length === 0) return [];

  const ids = collections.map((c) => c.id);
  const { data: items, error: itemsErr } = await supabase
    .from('recipe_collection_items')
    .select('collection_id')
    .in('collection_id', ids);
  if (itemsErr) throw itemsErr;

  const counts: Record<string, number> = {};
  for (const item of items ?? []) {
    counts[item.collection_id] = (counts[item.collection_id] ?? 0) + 1;
  }

  return collections.map((c) => ({ ...c, recipe_count: counts[c.id] ?? 0 }));
}

export async function createRecipeCollection(userId: string, name: string): Promise<RecipeCollection> {
  const { data, error } = await supabase
    .from('recipe_collections')
    .insert({ user_id: userId, name })
    .select('id, user_id, name, created_at')
    .single();
  if (error) throw error;
  return { ...(data as Omit<RecipeCollection, 'recipe_count'>), recipe_count: 0 };
}

export async function renameRecipeCollection(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('recipe_collections').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteRecipeCollection(id: string): Promise<void> {
  const { error } = await supabase.from('recipe_collections').delete().eq('id', id);
  if (error) throw error;
}

export async function listCollectionIdsForRecipe(recipeId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('recipe_collection_items')
    .select('collection_id')
    .eq('chosen_recipe_id', recipeId);
  if (error) throw error;
  return (data ?? []).map((row) => row.collection_id as string);
}

export async function listRecipeIdsInCollection(collectionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('recipe_collection_items')
    .select('chosen_recipe_id')
    .eq('collection_id', collectionId);
  if (error) throw error;
  return (data ?? []).map((row) => row.chosen_recipe_id as string);
}

export async function addRecipeToCollection(collectionId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('recipe_collection_items')
    .upsert({ collection_id: collectionId, chosen_recipe_id: recipeId }, { onConflict: 'collection_id,chosen_recipe_id' });
  if (error) throw error;
}

export async function removeRecipeFromCollection(collectionId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from('recipe_collection_items')
    .delete()
    .eq('collection_id', collectionId)
    .eq('chosen_recipe_id', recipeId);
  if (error) throw error;
}

// One round-trip fetch of every (recipe_id, collection_id) tuple so the UI
// can display folder badges per recipe and filter the list quickly.
export async function listAllMemberships(userId: string): Promise<{ recipe_id: string; collection_id: string }[]> {
  const { data, error } = await supabase
    .from('recipe_collection_items')
    .select('chosen_recipe_id, collection_id, recipe_collections!inner(user_id)')
    .eq('recipe_collections.user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    recipe_id: row.chosen_recipe_id,
    collection_id: row.collection_id,
  }));
}
