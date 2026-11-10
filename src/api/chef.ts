import { supabase } from './supabase';
import type { Pairing, WineDetailsComplete } from '../types/wine';
import type { CellarRecommendation, GeneralRecommendation } from '../stores/foodPairingStore';

export interface ChefLabelSession {
  id: string;
  saved_at: string;
  wine: WineDetailsComplete;
  filters: Record<string, unknown> | null;
  pairings: Pairing[];
  city: string | null;
  is_starred?: boolean;
  user_notes?: string | null;
  user_notes_updated_at?: string | null;
  // Migration 128: a cover image the user chose for this recipe (null = the wine's label).
  image_path?: string | null;
}

export interface ChefPairingSession {
  id: string;
  saved_at: string;
  dish: string;
  mode: 'cellar' | 'general';
  cellar_result: CellarRecommendation[] | null;
  general_result: GeneralRecommendation[] | null;
  general_summary: string | null;
  city: string | null;
  is_starred?: boolean;
}

export async function listChefLabelSessions(userId: string): Promise<ChefLabelSession[]> {
  const base = 'id, saved_at, wine, filters, pairings, city, is_starred, user_notes, user_notes_updated_at';
  // With the recipe cover image (migration 128); without it if not yet applied.
  let { data, error } = await supabase
    .from('chef_label_sessions')
    .select(`${base}, image_path`)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  if (error) {
    ({ data, error } = await supabase
      .from('chef_label_sessions')
      .select(base)
      .eq('user_id', userId)
      .order('saved_at', { ascending: false }) as any);
  }
  if (error) throw error;
  return (data ?? []) as ChefLabelSession[];
}

// Cookbook tile → "Update image" (null = back to the wine's label).
export async function setChefLabelSessionImage(id: string, imagePath: string | null): Promise<void> {
  const { error } = await supabase.from('chef_label_sessions').update({ image_path: imagePath }).eq('id', id);
  if (error) throw error;
}

// Cookbook → Edit Recipe → Rename: the recipe name is the first pairing's dish name.
export async function renameChefLabelSession(id: string, pairings: Pairing[], name: string): Promise<void> {
  const next = pairings.length ? [{ ...pairings[0], dishName: name }, ...pairings.slice(1)] : pairings;
  const { error } = await supabase.from('chef_label_sessions').update({ pairings: next }).eq('id', id);
  if (error) throw error;
}

export async function updateChefLabelSessionNotes(id: string, userNotes: string | null): Promise<void> {
  const { error } = await supabase
    .from('chef_label_sessions')
    .update({
      user_notes: userNotes,
      user_notes_updated_at: userNotes != null ? new Date().toISOString() : null,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function insertChefLabelSession(input: {
  userId: string;
  wine: WineDetailsComplete;
  filters: Record<string, unknown> | null;
  pairings: Pairing[];
  city: string | null;
}): Promise<ChefLabelSession> {
  const { data, error } = await supabase
    .from('chef_label_sessions')
    .insert({
      user_id: input.userId,
      wine: input.wine,
      filters: input.filters,
      pairings: input.pairings,
      city: input.city,
    })
    .select('id, saved_at, wine, filters, pairings, city, is_starred')
    .single();
  if (error) throw error;
  return data as ChefLabelSession;
}

export async function deleteChefLabelSession(id: string): Promise<void> {
  const { error } = await supabase.from('chef_label_sessions').delete().eq('id', id);
  if (error) throw error;
}

export async function listChefPairingSessions(userId: string): Promise<ChefPairingSession[]> {
  const { data, error } = await supabase
    .from('chef_pairing_sessions')
    .select('id, saved_at, dish, mode, cellar_result, general_result, general_summary, city, is_starred')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChefPairingSession[];
}

export async function insertChefPairingSession(input: {
  userId: string;
  dish: string;
  mode: 'cellar' | 'general';
  cellarResult: CellarRecommendation[] | null;
  generalResult: GeneralRecommendation[] | null;
  generalSummary: string | null;
  city: string | null;
}): Promise<ChefPairingSession> {
  const { data, error } = await supabase
    .from('chef_pairing_sessions')
    .insert({
      user_id: input.userId,
      dish: input.dish,
      mode: input.mode,
      cellar_result: input.cellarResult,
      general_result: input.generalResult,
      general_summary: input.generalSummary,
      city: input.city,
    })
    .select('id, saved_at, dish, mode, cellar_result, general_result, general_summary, city, is_starred')
    .single();
  if (error) throw error;
  return data as ChefPairingSession;
}

export async function deleteChefPairingSession(id: string): Promise<void> {
  const { error } = await supabase.from('chef_pairing_sessions').delete().eq('id', id);
  if (error) throw error;
}
