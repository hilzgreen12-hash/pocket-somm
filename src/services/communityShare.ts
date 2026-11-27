// Sharing reviews to the Vinster Community: turns a wine review, a cellar
// tasting or a restaurant visit into a Community post, and runs the
// join → confirm → share → result flow around it.
//
// Only the review itself is shared — the tasting note, score, date, place and
// label photo. Private notes (other_observations, personal notes, cellar
// notes) never leave the user's account, and a label found online ("Find
// label online") isn't shared as it's someone else's photo.

import { router } from 'expo-router';
import { showAlert } from '../components/AppAlert';
import { shareReview, shareReviewsInBulk, unshareReview, type ShareInput, type CommunityMember } from '../api/community';
import { supabase } from '../api/supabase';
import { selectAllPages } from '../api/paging';
import { entriesOf } from '../utils/cellarReview';
import type { CellarWine, ChosenWine, ReviewEntry } from '../types/wine';

const join = (...parts: (string | number | null | undefined)[]) =>
  parts.map((p) => (p == null ? '' : String(p).trim())).filter(Boolean);

const wineTitle = (producer: string | null, name: string | null, vintage: string | number | null) =>
  join(producer, name, vintage).join(' ');

// Only the user's own uploaded photos (wine-labels/<userId>/...), never a web link.
const ownPhoto = (path: string | null | undefined) => (path && !/^https?:/i.test(path) ? path : null);

// A wine review (one dated chosen_wines entry). Null when there's nothing to
// share — no tasting note and no score.
export function chosenShare(row: ChosenWine): ShareInput | null {
  const note = row.tasting_note?.trim() || null;
  if (!note && row.user_score == null) return null;
  return {
    category: 'wine',
    sourceTable: 'chosen_wines',
    sourceId: row.id,
    title: wineTitle(row.producer, row.wine_name, row.vintage),
    subtitle: join(row.appellation || row.region, row.grape).join(' · ') || null,
    rating: row.user_score,
    body: note,
    metadata: {
      producer: row.producer, wine_name: row.wine_name, vintage: row.vintage,
      region: row.region, appellation: row.appellation, grape: row.grape,
      date: row.reviewed_at ?? row.chosen_at, place: join(row.restaurant_name, row.city).join(', ') || null,
    },
    labelImagePath: ownPhoto(row.label_image_path),
  };
}

// A cellar bottle's tasting entry. A bottle is shared once: sharing another of
// its entries replaces the earlier share (metadata.entryId says which).
export function cellarShare(wine: CellarWine, entry: ReviewEntry): ShareInput | null {
  const note = entry.note?.trim() || null;
  if (!note && entry.score == null) return null;
  return {
    category: 'wine',
    sourceTable: 'cellar_wines',
    sourceId: wine.id,
    title: wineTitle(wine.producer, wine.wine_name, wine.vintage),
    subtitle: join(wine.region, wine.grape_variety).join(' · ') || null,
    rating: entry.score,
    body: note,
    metadata: {
      entryId: entry.id, producer: wine.producer, wine_name: wine.wine_name, vintage: wine.vintage,
      region: wine.region, grape: wine.grape_variety, date: entry.date ?? entry.savedAt, place: entry.location,
    },
    labelImagePath: wine.label_image_fetched ? null : ownPhoto(wine.label_image_path),
  };
}

export interface RestaurantVisit {
  id: string;
  restaurantName: string | null;
  city: string | null;
  capturedAt: string | null;
  note: string | null;
  ratings: { overall: number | null; food: number | null; service: number | null; wineList: number | null; value: number | null; atmosphere: number | null; glassware: number | null };
  photoPath: string | null;
  wines: string[];
}

// A restaurant review. Restaurants are rated in stars (1–5), kept in metadata
// rather than the 0–100 wine score.
export function restaurantShare(v: RestaurantVisit): ShareInput | null {
  const note = v.note?.trim() || null;
  if (!v.restaurantName?.trim() || (!note && v.ratings.overall == null)) return null;
  return {
    category: 'restaurant',
    sourceTable: 'scan_sessions',
    sourceId: v.id,
    title: v.restaurantName.trim(),
    subtitle: v.city?.trim() || null,
    rating: null,
    body: note,
    metadata: { stars: v.ratings, date: v.capturedAt, wines: v.wines.slice(0, 12) },
    labelImagePath: ownPhoto(v.photoPath),
  };
}

// ----- The flow -----

// Run `then` once the user is a Community member — straight away if they are,
// otherwise after the joining screen (which calls runAfterJoin on success).
let afterJoin: (() => void) | null = null;
export function runAfterJoin() {
  const next = afterJoin;
  afterJoin = null;
  next?.();
}
export function withMembership(member: CommunityMember | null | undefined, then: () => void) {
  if (member?.guidelines_accepted_at) { then(); return; }
  afterJoin = then;
  router.push('/community/join' as any);
}

// Confirm, share, and say how it went — for a member. onDone runs after a
// successful share (to refresh the "Shared" markers).
export function confirmShare(input: ShareInput, onDone: () => void) {
  showAlert({
    title: 'Share to Community',
    body: `${input.title}\n\nYour review${input.labelImagePath ? ', score and photo' : ' and score'} will be visible to Vinster members. Your private notes are never shared.`,
    buttons: [
      { text: 'Share', onPress: () => void doShare(input, onDone) },
      { text: 'Cancel', style: 'cancel' },
    ],
  });
}

// The same, joining first if the user isn't a member yet.
export function confirmAndShare(input: ShareInput, member: CommunityMember | null | undefined, onDone: () => void) {
  withMembership(member, () => confirmShare(input, onDone));
}

async function doShare(input: ShareInput, onDone: () => void) {
  try {
    const { status } = await shareReview(input);
    onDone();
    showAlert(status === 'visible'
      ? { title: 'Shared', body: 'Your review is now in the Community.' }
      : { title: 'Almost There', body: 'Vinster is taking a quick look at this review before it appears in the Community.' });
  } catch (err) {
    showAlert({ title: 'Could Not Share', body: err instanceof Error ? err.message : 'Please try again.' });
  }
}

export function confirmAndUnshare(shareId: string, title: string, onDone: () => void) {
  showAlert({
    title: 'Remove From Community',
    body: `${title}\n\nThis review will no longer be visible to other members. It stays in your own reviews.`,
    buttons: [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try { await unshareReview(shareId); onDone(); }
          catch (err) { showAlert({ title: 'Could Not Remove', body: err instanceof Error ? err.message : 'Please try again.' }); }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ],
  });
}

// ----- Keeping shares in step with edits -----

// After a shared review is edited, share it again so the Community shows the
// new version (re-checked like any share). Reads the saved row fresh; quiet —
// a failure leaves the earlier shared version up. If the shared tasting is
// gone, or now has nothing to share, the share comes down.
export async function resyncShare(sourceTable: 'chosen_wines' | 'cellar_wines' | 'scan_sessions', sourceId: string) {
  try {
    const { data: share } = await supabase.from('community_reviews')
      .select('id, metadata').eq('source_table', sourceTable).eq('source_id', sourceId).maybeSingle();
    if (!share) return;
    let input: ShareInput | null = null;
    if (sourceTable === 'chosen_wines') {
      const { data } = await supabase.from('chosen_wines').select('*').eq('id', sourceId).maybeSingle();
      if (data) input = chosenShare(data as ChosenWine);
    } else if (sourceTable === 'cellar_wines') {
      const { data } = await supabase.from('cellar_wines').select('*').eq('id', sourceId).maybeSingle();
      const entryId = (share.metadata as { entryId?: string } | null)?.entryId;
      const entry = data ? entriesOf(data as CellarWine).find((x) => x.id === entryId) : undefined;
      if (data && entry) input = cellarShare(data as CellarWine, entry);
    }
    if (input) await shareReview(input);
    else if (sourceTable !== 'scan_sessions') await unshareReview(share.id as string);
  } catch { /* best-effort: the earlier shared version stays up */ }
}

// ----- Sharing many reviews at once -----

// Share a batch of the user's wine reviews (e.g. a Vivino import) to the
// Community in one go: confirm, then send them as a bulk share, checked in the
// background. Reviews with nothing to share (no note, no score) are left out,
// and bulk shares go up without photos.
export function confirmBulkShare(reviewIds: string[], member: CommunityMember | null | undefined, onDone: () => void) {
  withMembership(member, () => {
    showAlert({
      title: 'Share to Community',
      body: `Share ${reviewIds.length} review${reviewIds.length === 1 ? '' : 's'} with Vinster members? Your tasting notes and scores will be visible to them. Your private notes are never shared.`,
      buttons: [
        { text: 'Share All', onPress: () => void doBulkShare(reviewIds, onDone) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  });
}

async function doBulkShare(reviewIds: string[], onDone: () => void) {
  try {
    const rows: ChosenWine[] = [];
    for (let i = 0; i < reviewIds.length; i += 200) {
      const { data, error } = await supabase.from('chosen_wines').select('*').in('id', reviewIds.slice(i, i + 200));
      if (error) throw error;
      rows.push(...(data as ChosenWine[]));
    }
    const items = rows.map(chosenShare).filter((x): x is ShareInput => !!x)
      .map(({ labelImagePath: _photo, ...item }) => item);
    if (!items.length) {
      showAlert({ title: 'Nothing to Share', body: 'None of these reviews has a tasting note or a score yet.' });
      return;
    }
    await shareReviewsInBulk(items);
    onDone();
    showAlert({
      title: 'Sharing Your Reviews',
      body: `${items.length} review${items.length === 1 ? ' is' : 's are'} on the way to the Community. They’ll appear over the next few minutes as Vinster checks them.`,
    });
  } catch (err) {
    showAlert({ title: 'Could Not Share', body: err instanceof Error ? err.message : 'Please try again.' });
  }
}

// "Share All My Wine Reviews": every wine review with a note or score that
// isn't shared yet, as one bulk share.
export async function confirmShareAll(userId: string, member: CommunityMember | null | undefined, alreadyShared: Set<string>, onDone: () => void) {
  try {
    // Paged: a single select stops at 1,000 rows.
    const data = await selectAllPages<{ id: string }>((from, to) => supabase.from('chosen_wines').select('id')
      .eq('user_id', userId).or('tasting_note.not.is.null,user_score.not.is.null')
      .order('id').range(from, to));
    const ids = data.map((r) => r.id as string).filter((id) => !alreadyShared.has(`chosen_wines:${id}`));
    if (!ids.length) {
      showAlert({ title: 'All Shared', body: 'Every wine review with a note or score is already in the Community.' });
      return;
    }
    confirmBulkShare(ids, member, onDone);
  } catch (err) {
    showAlert({ title: 'Could Not Share', body: err instanceof Error ? err.message : 'Please try again.' });
  }
}
