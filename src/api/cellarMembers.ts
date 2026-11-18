import { supabase } from './supabase';
import { getCellarContext, loadCellarContext, setActiveCellar } from './cellarContext';

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

// RLS turns a change to someone else's row (or one already gone) into a
// silent no-op, so each write checks a row was actually changed.
const NOT_CHANGED = 'That change could not be saved — please go back and try again.';

export async function setMemberRole(id: string, role: CellarMemberRole): Promise<void> {
  const { data, error } = await supabase.from('cellar_members').update({ role }).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error(NOT_CHANGED);
}

// Owner removes someone (or cancels a pending invite).
export async function removeCellarMember(id: string): Promise<void> {
  const { data, error } = await supabase.from('cellar_members').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error(NOT_CHANGED);
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

// Decline a pending invite, or leave a shared cellar I've joined (moving back
// to My Cellar first if it's the one open, so leaving isn't reported as access
// being taken away).
export async function leaveOrDeclineCellar(invite: CellarMember): Promise<void> {
  const user = await me();
  const { data, error } = await supabase.from('cellar_members').delete().eq('id', invite.id).select('id');
  if (error) throw error;
  if (!data?.length) throw new Error(NOT_CHANGED);
  if (getCellarContext().ownerId === invite.owner_id) setActiveCellar(null);
  await loadCellarContext(user.id);
}
