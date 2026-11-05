import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Which cellar the signed-in user is working in. Everyone has their own; a user
// who has accepted invites to shared cellars can switch between "My Cellar" and
// each shared one (Cellar tab switcher). While a shared cellar is selected,
// every cellar read/insert uses its OWNER's user_id (migration 123 grants the
// member access). Reviews, wishlists, scans and the taste profile stay personal
// and keep using the user's own id. The choice is remembered per user.

export type CellarRole = 'owner' | 'edit' | 'view';
export type SharedCellar = { ownerId: string; ownerName: string | null; role: 'view' | 'edit' };
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

export function canEditCellar(): boolean { return ctx.role !== 'view'; }

// Thrown by cellar write paths for view-only members, so the usual
// "Could not …" alerts explain why nothing changed.
export const VIEW_ONLY_MESSAGE = 'You have view-only access to this shared cellar.';
export function assertCanEditCellar(): void {
  if (!canEditCellar()) throw new Error(VIEW_ONLY_MESSAGE);
}

function apply(next: Ctx) {
  const sig = (c: Ctx) => `${c.userId}|${c.ownerId}|${c.role}|${c.shared.map((s) => `${s.ownerId}:${s.role}`).join(',')}`;
  const changed = sig(ctx) !== sig(next);
  ctx = next;
  if (changed) listeners.forEach((fn) => fn());
  return changed;
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
  let shared: SharedCellar[] = [];
  try {
    const { data } = await supabase
      .from('cellar_members')
      .select('owner_id, role, owner_name')
      .eq('member_id', userId)
      .eq('status', 'accepted')
      .order('accepted_at');
    shared = ((data ?? []) as { owner_id: string; role: 'view' | 'edit'; owner_name: string | null }[])
      .map((m) => ({ ownerId: m.owner_id, ownerName: m.owner_name, role: m.role }));
  } catch {
    // Table missing (migration not applied yet) or offline — own cellar only.
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
