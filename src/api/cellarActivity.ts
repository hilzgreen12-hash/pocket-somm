import { supabase } from './supabase';

// Shared cellar activity (migration 127): changes someone the cellar is shared
// with made to the owner's cellar. Written by database triggers; the owner reads
// them and marks them seen.
export interface CellarActivity {
  id: string;
  actor_id: string;
  actor_name: string | null;
  action: 'added' | 'archived' | 'removed' | 'deleted' | 'placed' | 'edited';
  wine_id: string | null;
  wine_label: string | null;
  count: number | null;
  detail: string | null;
  created_at: string;
  seen_at: string | null;
}

const COLS = 'id, actor_id, actor_name, action, wine_id, wine_label, count, detail, created_at, seen_at';

async function myId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchUnseenCellarActivity(): Promise<CellarActivity[]> {
  const uid = await myId();
  if (!uid) return [];
  const { data, error } = await supabase.from('cellar_activity').select(COLS)
    .eq('owner_id', uid).is('seen_at', null).order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return (data ?? []) as CellarActivity[];
}

export async function fetchRecentCellarActivity(limit = 30): Promise<CellarActivity[]> {
  const uid = await myId();
  if (!uid) return [];
  const { data, error } = await supabase.from('cellar_activity').select(COLS)
    .eq('owner_id', uid).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as CellarActivity[];
}

export async function markCellarActivitySeen(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await supabase.from('cellar_activity').update({ seen_at: new Date().toISOString() }).in('id', ids);
  if (error) throw error;
}

const bottles = (n: number | null) => `${n ?? 1} ${(n ?? 1) === 1 ? 'bottle' : 'bottles'}`;

// "archived 2 bottles of Dönnhoff Riesling Kabinett 2019"
export function describeActivity(a: CellarActivity): string {
  const wine = a.wine_label || 'a wine';
  switch (a.action) {
    case 'added': return `added ${bottles(a.count)} of ${wine}`;
    case 'archived': return `archived ${bottles(a.count)} of ${wine}`;
    case 'removed': return `removed ${bottles(a.count)} of ${wine}`;
    case 'deleted': return `deleted ${wine}${a.detail ? ` ${a.detail}` : ''}`;
    case 'placed': return `placed ${bottles(a.count)} of ${wine}${a.detail ? ` in ${a.detail}` : ''}`;
    case 'edited': return `edited ${wine}`;
    default: return `changed ${wine}`;
  }
}

export function actorLabel(a: CellarActivity): string {
  const n = (a.actor_name ?? '').trim();
  if (!n) return 'Someone';
  return n.includes('@') ? n.split('@')[0] : n;
}
