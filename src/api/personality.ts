import { supabase } from './supabase';

export interface PersonalitySketch {
  id: string;
  user_id: string;
  category: 'wine' | 'recipe';
  text: string;
  created_at: string;
}

export async function listPersonalitySketches(userId: string, category: 'wine' | 'recipe'): Promise<PersonalitySketch[]> {
  const { data, error } = await supabase
    .from('personality_sketches')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PersonalitySketch[];
}

export async function insertPersonalitySketch(input: { userId: string; category: 'wine' | 'recipe'; text: string }): Promise<void> {
  const { error } = await supabase.from('personality_sketches').insert({
    user_id: input.userId,
    category: input.category,
    text: input.text,
  });
  if (error) throw error;
}

export async function deletePersonalitySketch(id: string): Promise<void> {
  const { error } = await supabase.from('personality_sketches').delete().eq('id', id);
  if (error) throw error;
}
