import { supabase } from './supabase';
import { invokeResilient } from './invokeResilient';
import { selectAllPages } from './paging';

// The Vinster Community (migrations 146–147). Anything other members can read
// (usernames, photos, shared reviews, comments) goes through the `community`
// edge function, which checks it first; reads come straight from the
// database, whose rules hide held or blocked content.

export type CommunityCategory = 'wine' | 'recipe' | 'restaurant';
export type ShareStatus = 'pending' | 'visible' | 'held' | 'removed';

export interface CommunityMember {
  user_id: string;
  username: string;
  avatar_path: string | null;
  alter_ego_personality: string | null;
  discoverable_by_email: boolean;
  guidelines_accepted_at: string | null;
}

export interface CommunityReview {
  id: string;
  user_id: string;
  category: CommunityCategory;
  source_table: string | null;
  source_id: string | null;
  title: string;
  subtitle: string | null;
  rating: number | null;
  body: string | null;
  metadata: Record<string, unknown>;
  image_path: string | null;
  status: ShareStatus;
  created_at: string;
  username?: string | null;
}

export interface ShareInput {
  category: 'wine' | 'restaurant';
  sourceTable: 'chosen_wines' | 'cellar_wines' | 'scan_sessions';
  sourceId: string;
  title: string;
  subtitle?: string | null;
  rating?: number | null;
  body?: string | null;
  metadata?: Record<string, unknown>;
  /** The review's label photo in the user's private wine-labels bucket. */
  labelImagePath?: string | null;
}

export interface BulkShare {
  id: string;
  total: number;
  processed: number;
  held: number;
  status: 'running' | 'done' | 'failed';
}

const community = (action: string, body: Record<string, unknown> = {}, timeoutMs = 45000) =>
  invokeResilient('community', { action, ...body }, { timeoutMs, retries: 1 });

// Public URL of a Community photo (member photo or shared label photo).
export function communityImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  return supabase.storage.from('community').getPublicUrl(path).data.publicUrl;
}

// ----- Membership -----

// The signed-in user's Community profile; a member once they've accepted the
// guidelines (guidelines_accepted_at set).
export async function getMyMembership(userId: string): Promise<CommunityMember | null> {
  const { data, error } = await supabase
    .from('community_profiles')
    .select('user_id, username, avatar_path, alter_ego_personality, discoverable_by_email, guidelines_accepted_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as CommunityMember | null) ?? null;
}

// The member's Community email (private to them; may differ from the email
// they sign in with). null when none has been set.
// `exists` is false only when the member has never saved a Community email
// row (first time); a row with a null email means they cleared it on purpose.
// Throws on a failed read so callers can tell "none" from "couldn't load".
export async function getMyCommunityEmail(userId: string): Promise<{ exists: boolean; email: string | null }> {
  const { data, error } = await supabase.from('community_contact').select('email').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return { exists: !!data, email: (data?.email as string | null) ?? null };
}

export const isMember = (m: CommunityMember | null | undefined) => !!m?.guidelines_accepted_at;

// Join, or update membership. Throws with the server's message (e.g. the
// username is taken) for the screen to show.
export async function joinCommunity(input: {
  username: string; email?: string | null; discoverableByEmail: boolean; showPersonality: boolean;
}): Promise<CommunityMember> {
  const res = await community('join', input) as { profile: CommunityMember };
  return res.profile;
}

export async function setCommunityPhoto(imageBase64: string, mediaType: string): Promise<string> {
  const res = await community('avatar', { imageBase64, mediaType }, 60000) as { avatarPath: string };
  return res.avatarPath;
}

export async function removeCommunityPhoto(): Promise<void> {
  await community('avatar', { remove: true });
}

// ----- Sharing -----

// Share one review (or update it if already shared). 'held' means the check
// wasn't sure and it's waiting for Vinster to look at it.
export async function shareReview(input: ShareInput): Promise<{ id: string; status: ShareStatus }> {
  return await community('share', { ...input }, 60000) as { id: string; status: ShareStatus };
}

export async function unshareReview(id: string): Promise<void> {
  await community('unshare', { id });
}

const BULK_CHUNK = 200;

// Share many reviews at once (text only). Sent in chunks under one bulk
// share; the reviews are checked in the background — follow progress with
// getBulkShare. Returns the bulk share's id.
export async function shareReviewsInBulk(
  items: Omit<ShareInput, 'labelImagePath'>[],
  onSent?: (sent: number) => void,
): Promise<string> {
  let bulkId: string | null = null;
  for (let i = 0; i < items.length; i += BULK_CHUNK) {
    const res = await community('share_bulk', { items: items.slice(i, i + BULK_CHUNK), bulkId }) as { bulkId: string };
    bulkId = res.bulkId;
    onSent?.(Math.min(i + BULK_CHUNK, items.length));
  }
  if (!bulkId) throw new Error('Nothing to share.');
  return bulkId;
}

export async function getBulkShare(id: string): Promise<BulkShare | null> {
  const { data, error } = await supabase
    .from('community_bulk_shares').select('id, total, processed, held, status').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as BulkShare | null) ?? null;
}

export async function resumeBulkShare(id: string): Promise<void> {
  await community('bulk_resume', { bulkId: id });
}

export interface MyShare { id: string; status: ShareStatus; entryId: string | null }

// The user's own shared reviews, keyed "<source_table>:<source_id>", so review
// screens can show "Shared" against each one. entryId: which tasting of a
// cellar bottle is the shared one.
export async function getMyShares(userId: string): Promise<Map<string, MyShare>> {
  // Paged: a single select stops at 1,000 rows, which left later shares
  // without their Shared badge.
  const data = await selectAllPages<{ id: string; status: string; source_table: string; source_id: string; metadata: unknown }>((from, to) => supabase
    .from('community_reviews')
    .select('id, status, source_table, source_id, metadata')
    .eq('user_id', userId)
    .order('id')
    .range(from, to));
  return new Map(data.map((r) => [
    `${r.source_table}:${r.source_id}`,
    { id: r.id as string, status: r.status as ShareStatus, entryId: (r.metadata as { entryId?: string } | null)?.entryId ?? null },
  ]));
}

export const MY_SHARES_KEY = 'community-my-shares';
export const MY_MEMBERSHIP_KEY = 'community-membership';

// ----- The feed -----

export interface FeedItem extends CommunityReview {
  avatar_path: string | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
  bulk_share_id: string | null;
}

// A carousel or list tile: one shared review, or a member's bulk share
// collapsed into one tile so it can't flood the feed.
export type FeedTile =
  | { kind: 'review'; item: FeedItem }
  | { kind: 'bulk'; bulkId: string; username: string | null; avatarPath: string | null; count: number; latest: FeedItem };

export async function listFeed(opts: {
  category?: 'wine' | 'restaurant'; bulkId?: string; userId?: string; limit?: number; before?: string;
} = {}): Promise<FeedItem[]> {
  let q = supabase.from('community_feed').select('*').eq('status', 'visible')
    .order('created_at', { ascending: false }).limit(opts.limit ?? 30);
  if (opts.category) q = q.eq('category', opts.category);
  if (opts.bulkId) q = q.eq('bulk_share_id', opts.bulkId);
  if (opts.userId) q = q.eq('user_id', opts.userId);
  if (opts.before) q = q.lt('created_at', opts.before);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as FeedItem[];
}

// Collapse each bulk share in a page of the feed into a single tile (with its
// full count), keeping the feed's order.
export async function toTiles(items: FeedItem[]): Promise<FeedTile[]> {
  const bulkIds = [...new Set(items.map((i) => i.bulk_share_id).filter((x): x is string => !!x))];
  const counts = new Map<string, number>();
  await Promise.all(bulkIds.map(async (id) => {
    const { count } = await supabase.from('community_reviews').select('id', { count: 'exact', head: true })
      .eq('bulk_share_id', id).eq('status', 'visible');
    counts.set(id, count ?? 0);
  }));
  const tiles: FeedTile[] = [];
  const seen = new Set<string>();
  for (const item of items) {
    const id = item.bulk_share_id;
    if (!id || (counts.get(id) ?? 0) < 2) { tiles.push({ kind: 'review', item }); continue; }
    if (seen.has(id)) continue;
    seen.add(id);
    tiles.push({ kind: 'bulk', bulkId: id, username: item.username ?? null, avatarPath: item.avatar_path, count: counts.get(id)!, latest: item });
  }
  return tiles;
}

export async function getFeedItem(id: string): Promise<FeedItem | null> {
  const { data, error } = await supabase.from('community_feed').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as FeedItem | null) ?? null;
}

export async function searchFeed(query: string, limit = 40): Promise<FeedItem[]> {
  const safe = query.trim().replace(/[%,()]/g, '');
  if (!safe) return [];
  const { data, error } = await supabase.from('community_feed').select('*').eq('status', 'visible')
    .or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%,body.ilike.%${safe}%,username.ilike.%${safe}%`)
    .order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return (data ?? []) as FeedItem[];
}

// ----- Cheers, comments, reports -----

export async function setCheer(reviewId: string, userId: string, on: boolean): Promise<void> {
  const { error } = on
    ? await supabase.from('community_review_likes').insert({ review_id: reviewId, user_id: userId })
    : await supabase.from('community_review_likes').delete().eq('review_id', reviewId).eq('user_id', userId);
  // Already cheered (a double tap) is fine.
  if (error && error.code !== '23505') throw error;
}

export interface CommunityComment {
  id: string; review_id: string; user_id: string; body: string; status: ShareStatus; created_at: string;
  username: string | null; avatar_path: string | null;
}

export async function listComments(reviewId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase.from('community_review_comments')
    .select('id, review_id, user_id, body, status, created_at').eq('review_id', reviewId).order('created_at');
  if (error) throw error;
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: people } = ids.length
    ? await supabase.from('community_profiles').select('user_id, username, avatar_path').in('user_id', ids)
    : { data: [] as { user_id: string; username: string; avatar_path: string | null }[] };
  const byId = new Map((people ?? []).map((p) => [p.user_id, p]));
  return rows.map((r) => ({
    ...(r as Omit<CommunityComment, 'username' | 'avatar_path'>),
    username: byId.get(r.user_id as string)?.username ?? null,
    avatar_path: byId.get(r.user_id as string)?.avatar_path ?? null,
  }));
}

// Comments are checked before they show; 'held' means waiting for Vinster.
export async function addComment(reviewId: string, body: string): Promise<{ id: string; status: ShareStatus }> {
  return await community('comment', { reviewId, body }) as { id: string; status: ShareStatus };
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await supabase.from('community_review_comments').delete().eq('id', id);
  if (error) throw error;
}

export async function report(reporterId: string, targetType: 'review' | 'comment' | 'profile', targetId: string, reason: string | null): Promise<void> {
  const { error } = await supabase.from('community_reports')
    .insert({ reporter_id: reporterId, target_type: targetType, target_id: targetId, reason });
  // Already reported by this member: nothing more to do.
  if (error && error.code !== '23505') throw error;
}

// ----- Your Community profile -----

export async function getMyStats(userId: string): Promise<{ shared: number; followers: number; following: number }> {
  const count = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0;
  const [shared, followers, following] = await Promise.all([
    count(supabase.from('community_reviews').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'visible')),
    count(supabase.from('community_follows').select('follower_id', { count: 'exact', head: true }).eq('followee_id', userId)),
    count(supabase.from('community_follows').select('followee_id', { count: 'exact', head: true }).eq('follower_id', userId)),
  ]);
  return { shared, followers, following };
}

export const FEED_KEY = 'community-feed';
