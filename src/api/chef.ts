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
}

export async function listChefLabelSessions(userId: string): Promise<ChefLabelSession[]> {
  const { data, error } = await supabase
    .from('chef_label_sessions')
    .select('id, saved_at, wine, filters, pairings, city')
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChefLabelSession[];
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
    .select('id, saved_at, wine, filters, pairings, city')
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
    .select('id, saved_at, dish, mode, cellar_result, general_result, general_summary, city')
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
    .select('id, saved_at, dish, mode, cellar_result, general_result, general_summary, city')
    .single();
  if (error) throw error;
  return data as ChefPairingSession;
}

export async function deleteChefPairingSession(id: string): Promise<void> {
  const { error } = await supabase.from('chef_pairing_sessions').delete().eq('id', id);
  if (error) throw error;
}
