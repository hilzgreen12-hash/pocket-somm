import { supabase } from './supabase';

// Which cellar the signed-in user is working in. Normally their own; when they
// have accepted an invite to a shared household cellar it is the OWNER's, and
// every cellar read/insert uses the owner's user_id (migration 123 grants the
// member access). Reviews, wishlists, scans and the taste profile stay personal
// and keep using the user's own id.

export type CellarRole = 'owner' | 'edit' | 'view';
type Ctx = { userId: string | null; ownerId: string | null; role: CellarRole; ownerName: string | null };

let ctx: Ctx = { userId: null, ownerId: null, role: 'owner', ownerName: null };
const listeners = new Set<() => void>();

export function getCellarContext(): Readonly<Ctx> { return ctx; }
export function subscribeCellarContext(fn: () => void): () => void { listeners.add(fn); return () => { listeners.delete(fn); }; }

// Map the signed-in user's id to the cellar owner's id. Any other id (or no
// shared cellar) passes through unchanged, so callers can keep passing
// session.user.id.
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

// Load (or clear) the context for a signed-in user. Returns true when the
// effective cellar changed, so the caller can refetch cellar data.
export async function loadCellarContext(userId: string | null): Promise<boolean> {
  const before = `${ctx.userId}|${ctx.ownerId}|${ctx.role}`;
  if (!userId) {
    ctx = { userId: null, ownerId: null, role: 'owner', ownerName: null };
  } else {
    let next: Ctx = { userId, ownerId: null, role: 'owner', ownerName: null };
    try {
      const { data } = await supabase
        .from('cellar_members')
        .select('owner_id, role, owner_name')
        .eq('member_id', userId)
        .eq('status', 'accepted')
        .maybeSingle();
      const m = data as { owner_id: string; role: 'view' | 'edit'; owner_name: string | null } | null;
      if (m?.owner_id) next = { userId, ownerId: m.owner_id, role: m.role, ownerName: m.owner_name };
    } catch {
      // Table missing (migration not applied yet) or offline — stay on own cellar.
    }
    ctx = next;
  }
  const changed = before !== `${ctx.userId}|${ctx.ownerId}|${ctx.role}`;
  if (changed) listeners.forEach((fn) => fn());
  return changed;
}
