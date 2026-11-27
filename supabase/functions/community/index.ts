import Anthropic from 'npm:@anthropic-ai/sdk';
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js';
import { encodeBase64 } from 'jsr:@std/encoding/base64';
import { requireSignedIn } from '../_shared/auth.ts';
import { checkRateLimit } from '../_shared/rateLimit.ts';

// The one door for anything other Community members can read: usernames,
// photos, shared reviews and comments. Each is checked by AI before it shows;
// anything doubtful is held for Vinster to look at instead (mig 146). Likes,
// follows, blocks and reports carry no public text, so the app writes those
// straight to the database.
//
// POST { action, ... }
//   join     { username, email?, discoverableByEmail?, showPersonality? }  become a member / update membership
//   avatar   { imageBase64, mediaType } | { remove: true }          set or remove the member photo
//   share    { category, sourceTable, sourceId, title, subtitle?, rating?, body?, metadata?, labelImagePath? }
//   unshare  { id }                                                 remove a shared review and its photo
//   comment  { reviewId, body }
//   share_bulk  { items: share fields without labelImagePath, bulkId? }  share many reviews at once (mig 147)
//   bulk_resume { bulkId }                                          finish checking a bulk share that was interrupted

const client = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });
const MODEL = 'claude-haiku-4-5-20251001';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const BUCKET = 'community';
const PRIVATE_BUCKET = 'wine-labels';
// Vinster's own account may use "Vinster" in its member name; no one else can.
const OWNER_ID = 'fd625931-49a8-4c91-9ab5-18fa14e06536';
// Reviews a member can share, and the tables they come from.
const SOURCES: Record<string, string[]> = {
  wine: ['chosen_wines', 'cellar_wines'],
  restaurant: ['scan_sessions'],
};
const MAX_IMAGE_BYTES = 4_500_000;
// Bulk shares: reviews per request, per AI check, and per member per day (a
// safety cap against a runaway app, far above any real collection).
const BULK_REQUEST_MAX = 200;
const BULK_CHECK_BATCH = 25;
const BULK_DAILY_MAX = 5000;

type Json = Record<string, unknown>;

function reply(body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}
function refuse(error: string, message: string, status = 400): Response {
  return reply({ error, message }, status);
}
const text = (v: unknown, max: number): string | null => {
  if (typeof v !== 'string') return null;
  const t = v.trim();
  return t ? t.slice(0, max) : null;
};

// ---------- AI checks ----------

const GUIDELINES = `Vinster is a wine app. Its Community is where members share wine and restaurant reviews, comment and follow each other.
ALLOW: honest opinions, including strongly negative reviews of wines, producers and restaurants; mild everyday language; wine, food, travel and photos of bottles, labels, dishes, places and people.
HOLD anything that:
- is hateful, harassing or bullying, or attacks a person for who they are
- is sexual, or shows nudity
- threatens or celebrates violence or self-harm
- shares someone's private details (phone numbers, home addresses, email addresses, ID documents)
- is spam, advertising, selling, or links pushing people elsewhere
- involves illegal drugs, or under-age drinking
- accuses a named private person of a crime or wrongdoing
- impersonates Vinster, its staff, or a well-known person`;

interface Verdict { allowed: boolean; reason: string | null }

// One check for a piece of member content: text, an image, or both.
// Throws if the check itself can't run, so callers leave the content pending
// rather than letting it through unchecked.
async function check(kind: string, content: string | null, image?: { data: string; mediaType: string }): Promise<Verdict> {
  const parts: Anthropic.ContentBlockParam[] = [];
  if (image) {
    parts.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType as 'image/jpeg', data: image.data } });
  }
  parts.push({
    type: 'text',
    text: `${GUIDELINES}

Check this ${kind}${image ? ' (and its photo)' : ''} against the guidelines.${content ? `\n\n<content>\n${content}\n</content>` : ''}

Reply with JSON only: {"allowed": true} or {"allowed": false, "reason": "<one short sentence>"}.`,
  });
  const res = await client.messages.create({ model: MODEL, max_tokens: 120, messages: [{ role: 'user', content: parts }] });
  const out = res.content.find((b) => b.type === 'text')?.text ?? '';
  const json = out.match(/\{[\s\S]*\}/)?.[0];
  if (!json) throw new Error(`unreadable verdict: ${out.slice(0, 200)}`);
  const v = JSON.parse(json) as { allowed?: boolean; reason?: string };
  return { allowed: v.allowed === true, reason: v.allowed === true ? null : (v.reason ?? 'Held for review') };
}

// Many reviews in one check. Returns a verdict per review, in order.
async function checkBatch(reviews: string[]): Promise<Verdict[]> {
  const list = reviews.map((r, i) => `<review n="${i + 1}">\n${r}\n</review>`).join('\n');
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 60 + reviews.length * 40,
    messages: [{
      role: 'user',
      content: `${GUIDELINES}

Check each of these ${reviews.length} wine or restaurant reviews against the guidelines.

${list}

Reply with JSON only: an array with one entry per review, in order, like [{"n": 1, "allowed": true}, {"n": 2, "allowed": false, "reason": "<one short sentence>"}].`,
    }],
  });
  const out = res.content.find((b) => b.type === 'text')?.text ?? '';
  const json = out.match(/\[[\s\S]*\]/)?.[0];
  if (!json) throw new Error(`unreadable batch verdict: ${out.slice(0, 200)}`);
  const verdicts = JSON.parse(json) as { n?: number; allowed?: boolean; reason?: string }[];
  // A review the model skipped is held rather than let through.
  return reviews.map((_, i) => {
    const v = verdicts.find((x) => x.n === i + 1);
    return v?.allowed === true ? { allowed: true, reason: null } : { allowed: false, reason: v?.reason ?? 'Held for review' };
  });
}

// ---------- Helpers ----------

async function isMember(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await admin.from('community_profiles').select('guidelines_accepted_at').eq('user_id', userId).maybeSingle();
  return !!data?.guidelines_accepted_at;
}

const extOf = (mediaType: string) => (mediaType === 'image/png' ? 'png' : mediaType === 'image/webp' ? 'webp' : 'jpg');
function mediaTypeOf(path: string, fallback: string): string {
  const p = path.toLowerCase();
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.webp')) return 'image/webp';
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
  return fallback.startsWith('image/') ? fallback : 'image/jpeg';
}

async function removeFiles(admin: SupabaseClient, paths: (string | null | undefined)[]) {
  const list = paths.filter((p): p is string => !!p);
  if (list.length) await admin.storage.from(BUCKET).remove(list);
}

// ---------- Actions ----------

async function join(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  const username = text(body.username, 40)?.replace(/\s+/g, ' ');
  if (!username || username.length < 3 || !/^[\p{L}\p{N} ._'-]+$/u.test(username)) {
    return refuse('invalid_username', 'Usernames are 3 to 40 letters or numbers, and may include spaces, full stops, hyphens and apostrophes.');
  }
  if (userId !== OWNER_ID && /vinster/i.test(username)) {
    return refuse('username_reserved', 'Usernames containing “Vinster” are reserved. Please choose another.');
  }
  const { data: taken } = await admin.from('community_profiles').select('user_id').ilike('username', username.replace(/[\\%_]/g, '\\$&')).neq('user_id', userId).limit(1);
  if (taken?.length) return refuse('username_taken', `“${username}” is already taken. Please choose another username.`);

  // The Community email (optional; may differ from the sign-in email). Not
  // sent = left as it is; blank = removed.
  let email: string | null | undefined;
  if (body.email !== undefined) {
    email = text(body.email, 254)?.toLowerCase() ?? null;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return refuse('invalid_email', 'Please enter a valid email address, or leave it blank.');
    }
  }

  const { data: existing } = await admin.from('community_profiles').select('username, guidelines_accepted_at').eq('user_id', userId).maybeSingle();
  if (existing?.username !== username) {
    const v = await check('username', username);
    if (!v.allowed) return refuse('username_not_allowed', 'That username can’t be used in the Community. Please choose another.');
  }

  // The personality sketch comes from the member's own saved sketch, never
  // from the request, so what's shown is what Vinster wrote.
  let alterEgo: string | null = null;
  if (body.showPersonality === true) {
    const { data: p } = await admin.from('profiles').select('last_alter_ego_personality').eq('id', userId).maybeSingle();
    alterEgo = p?.last_alter_ego_personality ?? null;
  }
  const row = {
    user_id: userId,
    username,
    discoverable_by_email: body.discoverableByEmail !== false,
    alter_ego_personality: alterEgo,
    guidelines_accepted_at: existing?.guidelines_accepted_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await admin.from('community_profiles').upsert(row, { onConflict: 'user_id' }).select().single();
  if (error) throw error;
  if (email !== undefined) {
    const { error: e2 } = await admin.from('community_contact')
      .upsert({ user_id: userId, email, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (e2) throw e2;
  }
  return reply({ profile: data });
}

async function avatar(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  if (!(await isMember(admin, userId))) return refuse('not_member', 'Join the Community first.', 403);
  const { data: current } = await admin.from('community_profiles').select('avatar_path').eq('user_id', userId).single();
  if (body.remove === true) {
    await removeFiles(admin, [current?.avatar_path]);
    await admin.from('community_profiles').update({ avatar_path: null }).eq('user_id', userId);
    return reply({ avatarPath: null });
  }
  const data = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
  const mediaType = mediaTypeOf('', String(body.mediaType ?? 'image/jpeg'));
  if (!data || data.length * 0.75 > MAX_IMAGE_BYTES) return refuse('invalid_image', 'Please choose a smaller photo.');
  const v = await check('member profile photo', null, { data, mediaType });
  if (!v.allowed) return refuse('image_not_allowed', 'That photo can’t be used in the Community. Please choose another.');
  const path = `${userId}/avatar-${Date.now()}.${extOf(mediaType)}`;
  const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
  const { error } = await admin.storage.from(BUCKET).upload(path, bytes, { contentType: mediaType, upsert: true });
  if (error) throw error;
  await admin.from('community_profiles').update({ avatar_path: path }).eq('user_id', userId);
  await removeFiles(admin, [current?.avatar_path]);
  return reply({ avatarPath: path });
}

interface ReviewFields {
  category: string; source_table: string; source_id: string;
  title: string; subtitle: string | null; rating: number | null; body: string | null; metadata: unknown;
}

// A shared review's fields from a request, or null if it can't be shared.
function reviewFields(item: Json): ReviewFields | null {
  const category = String(item.category ?? '');
  const sourceTable = String(item.sourceTable ?? '');
  const sourceId = String(item.sourceId ?? '');
  const title = text(item.title, 200);
  if (!SOURCES[category]?.includes(sourceTable) || !/^[0-9a-f-]{36}$/i.test(sourceId) || !title) return null;
  return {
    category, source_table: sourceTable, source_id: sourceId, title,
    subtitle: text(item.subtitle, 300),
    rating: typeof item.rating === 'number' && item.rating >= 0 && item.rating <= 100 ? Math.round(item.rating) : null,
    body: text(item.body, 4000),
    metadata: item.metadata && typeof item.metadata === 'object' && JSON.stringify(item.metadata).length <= 4000 ? item.metadata : {},
  };
}

// What the AI reads for a review.
const reviewText = (f: Pick<ReviewFields, 'title' | 'subtitle' | 'rating' | 'body'>) =>
  [f.title, f.subtitle, f.rating != null ? `Score: ${f.rating}/100` : null, f.body].filter(Boolean).join('\n');

async function share(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  if (!(await isMember(admin, userId))) return refuse('not_member', 'Join the Community first.', 403);
  const f = reviewFields(body);
  if (!f) return refuse('invalid_source', 'This review can’t be shared.');
  // Only the member's own reviews can be shared.
  const { data: owned } = await admin.from(f.source_table).select('id').eq('id', f.source_id).eq('user_id', userId).maybeSingle();
  if (!owned) return refuse('invalid_source', 'This review can’t be shared.');
  const { category, source_table: sourceTable, source_id: sourceId, title, subtitle, rating, metadata } = f;
  const reviewBody = f.body;

  // The label photo is copied out of the member's private photos. Anything
  // else (e.g. a Vivino image link on an imported review) is shared without it.
  const labelPath = text(body.labelImagePath, 500);
  let image: { data: string; mediaType: string; bytes: Uint8Array } | null = null;
  if (labelPath?.startsWith(`${userId}/`)) {
    const { data: blob } = await admin.storage.from(PRIVATE_BUCKET).download(labelPath);
    if (blob && blob.size <= MAX_IMAGE_BYTES) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      image = { data: encodeBase64(bytes), mediaType: mediaTypeOf(labelPath, blob.type), bytes };
    }
  }

  const { data: existing } = await admin.from('community_reviews').select('id, image_path')
    .eq('user_id', userId).eq('source_table', sourceTable).eq('source_id', sourceId).maybeSingle();
  const fields = { category, source_table: sourceTable, source_id: sourceId, title, subtitle, rating, body: reviewBody, metadata, status: 'pending', updated_at: new Date().toISOString() };
  const saved = existing
    ? await admin.from('community_reviews').update(fields).eq('id', existing.id).select('id').single()
    : await admin.from('community_reviews').insert({ ...fields, user_id: userId }).select('id').single();
  if (saved.error) throw saved.error;
  const id = saved.data.id as string;

  // Replace the shared photo with the current one (or none).
  let imagePath: string | null = null;
  if (image) {
    imagePath = `${userId}/reviews/${id}-${Date.now()}.${extOf(image.mediaType)}`;
    const { error } = await admin.storage.from(BUCKET).upload(imagePath, image.bytes, { contentType: image.mediaType, upsert: true });
    if (error) imagePath = null;
  }
  if (existing?.image_path && existing.image_path !== imagePath) await removeFiles(admin, [existing.image_path]);
  await admin.from('community_reviews').update({ image_path: imagePath }).eq('id', id);

  const verdict = await check(`${category} review`, reviewText({ title, subtitle, rating, body: reviewBody }), image ?? undefined);
  const status = verdict.allowed ? 'visible' : 'held';
  await admin.from('community_reviews').update({ status, moderation_note: verdict.reason }).eq('id', id);
  if (!verdict.allowed) console.log(`[community] held review ${id}: ${verdict.reason}`);
  return reply({ id, status });
}

// Share many of the member's own reviews in one go (text only). The reviews
// are saved hidden at once, then checked in batches in the background; the
// app follows progress on the bulk share's row. Reviews already shared are
// updated rather than duplicated.
async function shareBulk(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  if (!(await isMember(admin, userId))) return refuse('not_member', 'Join the Community first.', 403);
  const items = Array.isArray(body.items) ? (body.items as Json[]).slice(0, BULK_REQUEST_MAX) : [];
  // One entry per review: a repeated item would otherwise be inserted twice.
  const seen = new Set<string>();
  const fields = items.map(reviewFields).filter((f): f is ReviewFields => {
    if (!f) return false;
    const k = `${f.source_table}:${f.source_id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  if (!fields.length) return refuse('invalid_review', 'None of these reviews can be shared.');

  const since = new Date(Date.now() - 86_400_000).toISOString();
  const { count } = await admin.from('community_reviews').select('id', { count: 'exact', head: true })
    .eq('user_id', userId).not('bulk_share_id', 'is', null).gte('created_at', since);
  if ((count ?? 0) + fields.length > BULK_DAILY_MAX) {
    return refuse('bulk_limit', 'That’s more reviews than can be shared in one day. Please share the rest tomorrow.', 429);
  }

  // Keep only reviews the member owns.
  const owned = new Set<string>();
  for (const table of new Set(fields.map((f) => f.source_table))) {
    const ids = fields.filter((f) => f.source_table === table).map((f) => f.source_id);
    const { data } = await admin.from(table).select('id').eq('user_id', userId).in('id', ids);
    for (const r of data ?? []) owned.add(`${table}:${r.id}`);
  }
  const mine = fields.filter((f) => owned.has(`${f.source_table}:${f.source_id}`));
  if (!mine.length) return refuse('invalid_source', 'None of these reviews can be shared.');

  let bulkId = typeof body.bulkId === 'string' ? body.bulkId : null;
  if (bulkId) {
    const { data } = await admin.from('community_bulk_shares').select('id').eq('id', bulkId).eq('user_id', userId).maybeSingle();
    if (!data) bulkId = null;
  }
  if (!bulkId) {
    const { data, error } = await admin.from('community_bulk_shares').insert({ user_id: userId }).select('id').single();
    if (error) throw error;
    bulkId = data.id as string;
  }

  // Already-shared reviews are updated in place; the rest are added.
  const { data: existing } = await admin.from('community_reviews').select('id, source_table, source_id')
    .eq('user_id', userId).in('source_id', mine.map((f) => f.source_id));
  const existingId = new Map((existing ?? []).map((r) => [`${r.source_table}:${r.source_id}`, r.id as string]));
  const now = new Date().toISOString();
  const ids: string[] = [];
  const fresh = mine.filter((f) => !existingId.has(`${f.source_table}:${f.source_id}`));
  if (fresh.length) {
    const { data, error } = await admin.from('community_reviews')
      .insert(fresh.map((f) => ({ ...f, user_id: userId, status: 'pending', bulk_share_id: bulkId, updated_at: now })))
      .select('id');
    if (error) throw error;
    ids.push(...(data ?? []).map((r) => r.id as string));
  }
  for (const f of mine.filter((f) => existingId.has(`${f.source_table}:${f.source_id}`))) {
    const id = existingId.get(`${f.source_table}:${f.source_id}`)!;
    await admin.from('community_reviews').update({ ...f, status: 'pending', bulk_share_id: bulkId, updated_at: now }).eq('id', id);
    ids.push(id);
  }

  const { data: bulk } = await admin.from('community_bulk_shares').select('total').eq('id', bulkId).single();
  const total = (bulk?.total ?? 0) + ids.length;
  await admin.from('community_bulk_shares').update({ total, status: 'running', finished_at: null }).eq('id', bulkId);
  if (total > 200) console.log(`[community] flagged bulk share ${bulkId}: ${total} reviews from ${userId}`);

  // Check in the background so the member isn't kept waiting.
  // @ts-ignore EdgeRuntime is provided by Supabase's edge runtime.
  EdgeRuntime.waitUntil(checkBulk(admin, bulkId, ids));
  return reply({ bulkId, accepted: ids.length, skipped: items.length - ids.length });
}

// Check a bulk share's pending reviews in batches, then mark it done once
// nothing is left pending. A failed check leaves its reviews pending (hidden)
// for bulk_resume to pick up.
async function checkBulk(admin: SupabaseClient, bulkId: string, onlyIds?: string[]): Promise<void> {
  let query = admin.from('community_reviews').select('id, title, subtitle, rating, body').eq('bulk_share_id', bulkId).eq('status', 'pending');
  if (onlyIds) query = query.in('id', onlyIds);
  const { data: rows } = await query;
  for (let i = 0; i < (rows?.length ?? 0); i += BULK_CHECK_BATCH) {
    const batch = rows!.slice(i, i + BULK_CHECK_BATCH);
    try {
      const verdicts = await checkBatch(batch.map(reviewText));
      for (const [j, r] of batch.entries()) {
        const v = verdicts[j];
        await admin.from('community_reviews').update({ status: v.allowed ? 'visible' : 'held', moderation_note: v.reason }).eq('id', r.id);
      }
    } catch (err) {
      console.error(`[community] bulk ${bulkId} batch failed:`, err);
    }
  }
  // Progress is counted from the reviews themselves, so several requests
  // checking the same bulk share at once can't miscount it.
  const tally = async (status: string) => (await admin.from('community_reviews').select('id', { count: 'exact', head: true })
    .eq('bulk_share_id', bulkId).eq('status', status)).count ?? 0;
  const [visible, held, left] = await Promise.all([tally('visible'), tally('held'), tally('pending')]);
  await admin.from('community_bulk_shares').update({
    processed: visible + held,
    held,
    ...(left === 0 ? { status: 'done', finished_at: new Date().toISOString() } : {}),
  }).eq('id', bulkId);
}

async function bulkResume(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  const bulkId = String(body.bulkId ?? '');
  const { data } = await admin.from('community_bulk_shares').select('id').eq('id', bulkId).eq('user_id', userId).maybeSingle();
  if (!data) return refuse('not_found', 'Nothing to resume.', 404);
  // @ts-ignore EdgeRuntime is provided by Supabase's edge runtime.
  EdgeRuntime.waitUntil(checkBulk(admin, bulkId));
  return reply({ resumed: true });
}

async function unshare(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  const id = String(body.id ?? '');
  const { data } = await admin.from('community_reviews').select('image_path').eq('id', id).eq('user_id', userId).maybeSingle();
  if (!data) return reply({ removed: false });
  await admin.from('community_reviews').delete().eq('id', id).eq('user_id', userId);
  await removeFiles(admin, [data.image_path]);
  return reply({ removed: true });
}

async function comment(admin: SupabaseClient, userId: string, body: Json): Promise<Response> {
  if (!(await isMember(admin, userId))) return refuse('not_member', 'Join the Community first.', 403);
  const reviewId = String(body.reviewId ?? '');
  const words = text(body.body, 1000);
  if (!words) return refuse('invalid_comment', 'Write a comment first.');
  const { data: review } = await admin.from('community_reviews').select('user_id, status').eq('id', reviewId).maybeSingle();
  if (!review || review.status !== 'visible') return refuse('not_found', 'This review is no longer shared.', 404);
  const { data: blocked } = await admin.rpc('community_blocked_between', { a: userId, b: review.user_id });
  if (blocked) return refuse('not_found', 'This review is no longer shared.', 404);

  const { data: row, error } = await admin.from('community_review_comments')
    .insert({ review_id: reviewId, user_id: userId, body: words, status: 'pending' }).select('id').single();
  if (error) throw error;
  const verdict = await check('comment on a review', words);
  const status = verdict.allowed ? 'visible' : 'held';
  await admin.from('community_review_comments').update({ status }).eq('id', row.id);
  if (!verdict.allowed) console.log(`[community] held comment ${row.id}: ${verdict.reason}`);
  return reply({ id: row.id, status });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  const auth = await requireSignedIn(req, corsHeaders);
  if (auth instanceof Response) return auth;

  let body: Json;
  try { body = await req.json(); } catch { return refuse('bad_request', 'Invalid request.'); }
  const action = String(body.action ?? '');

  // unshare costs nothing, so it's never limited.
  if (action !== 'unshare') {
    const limited = await checkRateLimit(auth.userId, 'community', 60, 300);
    if (limited) return new Response(limited.body, { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  try {
    switch (action) {
      case 'join': return await join(admin, auth.userId, body);
      case 'avatar': return await avatar(admin, auth.userId, body);
      case 'share': return await share(admin, auth.userId, body);
      case 'unshare': return await unshare(admin, auth.userId, body);
      case 'comment': return await comment(admin, auth.userId, body);
      case 'share_bulk': return await shareBulk(admin, auth.userId, body);
      case 'bulk_resume': return await bulkResume(admin, auth.userId, body);
      default: return refuse('bad_request', 'Unknown action.');
    }
  } catch (err) {
    // A failed check leaves new content pending (not shown), never let through.
    console.error(`[community] ${action} failed:`, err);
    return refuse('failed', 'Something went wrong. Please try again.', 500);
  }
});
