import { supabase } from './supabase';
import { loadCellarContext } from './cellarContext';

// Shared household cellar invites (migration 123). The owner invites a Vinster
// account by email with view or edit access; the invitee sees the invite in
// the app (signed in with that email) and accepts or declines.

export type CellarMemberRole = 'view' | 'edit';
export interface CellarMember {
  id: string;
  owner_id: string;
  member_id: string | null;
  invite_email: string;
  role: CellarMemberRole;
  status: 'pending' | 'accepted';
  owner_name: string | null;
  created_at: string;
  accepted_at: string | null;
}

const COLS = 'id, owner_id, member_id, invite_email, role, status, owner_name, created_at, accepted_at';

async function me() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in required');
  return user;
}

// People I've invited to my cellar (pending + accepted).
export async function fetchMyCellarMembers(): Promise<CellarMember[]> {
  const user = await me();
  const { data, error } = await supabase.from('cellar_members').select(COLS).eq('owner_id', user.id).order('created_at');
  if (error) throw error;
  return (data ?? []) as CellarMember[];
}

export async function inviteToMyCellar(email: string, role: CellarMemberRole): Promise<void> {
  const user = await me();
  const clean = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) throw new Error('Please enter a valid email address.');
  if (clean === (user.email ?? '').toLowerCase()) throw new Error("That's your own email address.");
  const ownerName = (user.user_metadata?.display_name as string | undefined)?.trim() || user.email || null;
  const { error } = await supabase.from('cellar_members').insert({ owner_id: user.id, invite_email: clean, role, owner_name: ownerName });
  if (error) {
    if (error.code === '23505') throw new Error("You've already invited that email address.");
    throw error;
  }
}

export async function setMemberRole(id: string, role: CellarMemberRole): Promise<void> {
  const { error } = await supabase.from('cellar_members').update({ role }).eq('id', id);
  if (error) throw error;
}

// Owner removes someone (or cancels a pending invite).
export async function removeCellarMember(id: string): Promise<void> {
  const { error } = await supabase.from('cellar_members').delete().eq('id', id);
  if (error) throw error;
}

// Invites addressed to me that I haven't accepted yet, plus my accepted one.
export async function fetchInvitesForMe(): Promise<CellarMember[]> {
  const user = await me();
  const { data, error } = await supabase.from('cellar_members').select(COLS).neq('owner_id', user.id).order('created_at');
  if (error) throw error;
  return (data ?? []) as CellarMember[];
}

export async function acceptCellarInvite(id: string): Promise<void> {
  const user = await me();
  const { error } = await supabase.rpc('accept_cellar_invite', { invite_id: id });
  if (error) throw new Error(error.message);
  await loadCellarContext(user.id);
}

// Decline a pending invite, or leave a shared cellar I've joined.
export async function leaveOrDeclineCellar(id: string): Promise<void> {
  const user = await me();
  const { error } = await supabase.from('cellar_members').delete().eq('id', id);
  if (error) throw error;
  await loadCellarContext(user.id);
}
