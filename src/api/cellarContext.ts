import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { showAlert } from '../components/AppAlert';

// Which cellar the signed-in user is working in. Everyone has their own; a user
// who has accepted invites to shared cellars can switch between "My Cellar" and
// each shared one (Cellar tab switcher). While a shared cellar is selected,
// every cellar read/insert uses its OWNER's user_id (migration 123 grants the
// member access). Reviews, scans and the taste profile stay personal
// and keep using the user's own id. The choice is remembered per user.

type CellarRole = 'owner' | 'edit' | 'view';
type SharedCellar = { ownerId: string; ownerName: string | null; role: 'view' | 'edit' };
type Ctx = { userId: string | null; ownerId: string | null; role: CellarRole; ownerName: string | null; shared: SharedCellar[] };

let ctx: Ctx = { userId: null, ownerId: null, role: 'owner', ownerName: null, shared: [] };
const listeners = new Set<() => void>();
const activeKey = (userId: string) => `vinster_active_cellar_${userId}`;

export function getCellarContext(): Readonly<Ctx> { return ctx; }
export function subscribeCellarContext(fn: () => void): () => void { listeners.add(fn); return () => { listeners.delete(fn); }; }

// Map the signed-in user's id to the selected cellar's owner id. Any other id
// (or "My Cellar" selected) passes through unchanged, so callers can keep
// passing session.user.id.
export function cellarOwner(userId: string): string;
export function cellarOwner(userId: string | null | undefined): string | null | undefined;
export function cellarOwner(userId: string | null | undefined) {
  if (userId && ctx.userId === userId && ctx.ownerId) return ctx.ownerId;
  return userId;
}

// "Sam's Cellar" — a shared cellar's name, from its owner's display name or email.
export function sharedCellarLabel(ownerName: string | null): string {
  const n = (ownerName ?? '').trim();
  if (!n) return 'Shared Cellar';
  const first = n.includes('@') ? n.split('@')[0] : n;
  return `${first}${/s$/i.test(first) ? "'" : "'s"} Cellar`;
}

export function canEditCellar(): boolean { return ctx.role !== 'view'; }

// Thrown by cellar write paths for view-only members, so the usual
// "Could not …" alerts explain why nothing changed.
export const VIEW_ONLY_MESSAGE = 'You have view-only access to this shared cellar.';
export function assertCanEditCellar(): void {
  if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
}

// A write that RLS refuses (view-only access, an expired session) affects no
// rows and returns no error. Write paths throw this instead, so a refused
// change never reads as success. In a shared cellar the likely cause is that
// the owner changed this member's access, so it's re-read (which tells them).
export function refusedWriteError(): Error {
  if (!canEditCellar()) return new Error(VIEW_ONLY_MESSAGE);
  if (ctx.ownerId && ctx.userId) {
    void loadCellarContext(ctx.userId);
    return new Error('That change could not be saved — your access to this shared cellar may have changed.');
  }
  return new Error('That change could not be saved — please pull to refresh (you may need to sign in again).');
}

function apply(next: Ctx) {
  const sig = (c: Ctx) => `${c.userId}|${c.ownerId}|${c.role}|${c.shared.map((s) => `${s.ownerId}:${s.role}`).join(',')}`;
  const changed = sig(ctx) !== sig(next);
  const prev = ctx;
  ctx = next;
  if (changed) {
    explainAccessChange(prev, next);
    listeners.forEach((fn) => fn());
  }
  return changed;
}

// Tell a member when the owner of the cellar they're in removed them (they're
// moved back to My Cellar) or made them view-only.
function explainAccessChange(prev: Ctx, next: Ctx) {
  if (!prev.userId || prev.userId !== next.userId || !prev.ownerId) return;
  const name = sharedCellarLabel(prev.ownerName);
  if (!next.shared.some((s) => s.ownerId === prev.ownerId)) {
    showAlert({ title: 'Cellar no longer shared', body: `You no longer have access to ${name}, so you're back in My Cellar.` });
  } else if (next.ownerId === prev.ownerId && prev.role === 'edit' && next.role === 'view') {
    showAlert({ title: 'View only', body: `${VIEW_ONLY_MESSAGE} ${name} can be browsed but not changed.` });
  }
}

function withActive(base: Omit<Ctx, 'ownerId' | 'role' | 'ownerName'>, ownerId: string | null): Ctx {
  const s = ownerId ? base.shared.find((x) => x.ownerId === ownerId) : undefined;
  return s
    ? { ...base, ownerId: s.ownerId, role: s.role, ownerName: s.ownerName }
    : { ...base, ownerId: null, role: 'owner', ownerName: null };
}

// Load (or clear) the context for a signed-in user: their shared cellars plus
// the last one they selected. Returns true when anything changed.
export async function loadCellarContext(userId: string | null): Promise<boolean> {
  if (!userId) return apply({ userId: null, ownerId: null, role: 'owner', ownerName: null, shared: [] });
  let shared: SharedCellar[];
  try {
    const { data, error } = await supabase
      .from('cellar_members')
      .select('owner_id, role, owner_name')
      .eq('member_id', userId)
      .eq('status', 'accepted')
      .order('accepted_at');
    if (error) throw error;
    shared = ((data ?? []) as { owner_id: string; role: 'view' | 'edit'; owner_name: string | null }[])
      .map((m) => ({ ownerId: m.owner_id, ownerName: m.owner_name, role: m.role }));
  } catch {
    // Offline or a failed read: keep what's loaded rather than dropping the
    // user out of a shared cellar. With nothing loaded yet, their own cellar.
    if (ctx.userId === userId) return false;
    shared = [];
  }
  let saved: string | null = null;
  try { saved = await AsyncStorage.getItem(activeKey(userId)); } catch { /* ignore */ }
  return apply(withActive({ userId, shared }, saved));
}

// Switch cellars (null = My Cellar). Every screen refetches via the listener.
export function setActiveCellar(ownerId: string | null): void {
  if (!ctx.userId) return;
  const userId = ctx.userId;
  if (ownerId) AsyncStorage.setItem(activeKey(userId), ownerId).catch(() => {});
  else AsyncStorage.removeItem(activeKey(userId)).catch(() => {});
  apply(withActive({ userId, shared: ctx.shared }, ownerId));
}
