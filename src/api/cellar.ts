import { supabase } from './supabase';
import type { CellarWine } from '../types/wine';

export async function getCellarWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getWishListWines(userId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', userId)
    .eq('is_wishlist', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSharedCellarWines(ownerId: string): Promise<CellarWine[]> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .select('*')
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function addCellarWine(wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>): Promise<CellarWine> {
  const { data, error } = await supabase
    .from('cellar_wines')
    .insert(wine)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCellarWine(id: string, updates: Partial<CellarWine>): Promise<void> {
  const { error } = await supabase
    .from('cellar_wines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteCellarWine(id: string): Promise<void> {
  const { error } = await supabase.from('cellar_wines').delete().eq('id', id);
  if (error) throw error;
}

export async function shareCellar(ownerId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_shares')
    .insert({ owner_id: ownerId, shared_with_email: email });
  if (error) throw error;
}

export async function getCellarShares(ownerId: string): Promise<{ shared_with_email: string; shared_with_id: string | null }[]> {
  const { data, error } = await supabase
    .from('cellar_shares')
    .select('shared_with_email, shared_with_id')
    .eq('owner_id', ownerId);
  if (error) throw error;
  return data ?? [];
}

export async function getSharedWithMe(): Promise<{ owner_id: string; owner_email?: string }[]> {
  const { data, error } = await supabase
    .from('cellar_shares')
    .select('owner_id');
  if (error) throw error;
  return data ?? [];
}

export async function removeCellarShare(ownerId: string, email: string): Promise<void> {
  const { error } = await supabase
    .from('cellar_shares')
    .delete()
    .eq('owner_id', ownerId)
    .eq('shared_with_email', email);
  if (error) throw error;
}
