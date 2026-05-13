// Auto-publish helpers that keep a user's community-feed entries in
// lock-step with their local reviews. Each save point in the app
// (chosen_wines insert/update, cellar review-field updates, scan_session
// restaurant review save) calls one of these.
//
// All functions:
//  - Skip silently if the source row has no real review content yet
//    (no rating, no notes). Empty drafts shouldn't pollute the feed.
//  - Use the source_table + source_id unique index for upsert, so
//    repeated saves update the same community row rather than duplicate.
//  - Are best-effort: callers swallow exceptions (community failures
//    must never block a local save).

import { upsertMyCommunityReview } from '../api/community';
import { supabase } from '../api/supabase';
import type { ChosenWine, CellarWine } from '../types/wine';

interface ScanSessionForCommunity {
  id: string;
  restaurant_name: string | null;
  restaurant_note: string | null;
  rating_food: number | null;
  rating_service: number | null;
  rating_wine_list: number | null;
  rating_overall: number | null;
}

async function getDisplayName(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('community_profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle();
  return data?.username ?? null;
}

function wineHeader(producer: string | null | undefined, name: string, vintage: number | string | null | undefined): string {
  const parts = [producer?.trim(), name.trim(), vintage != null ? String(vintage) : ''].filter(Boolean);
  return parts.join(' · ');
}

function wineSubtitle(region: string | null | undefined, appellation: string | null | undefined): string | null {
  const parts = [appellation?.trim(), region?.trim()].filter(Boolean);
  if (parts.length === 0) return null;
  return parts.join(', ');
}

export async function publishChosenWineToCommunity(wine: ChosenWine): Promise<void> {
  // Only publish once the user has added something the community would
  // actually find useful. Bare-bones inserts (no notes, no rating)
  // would just be wine identifiers with no review attached.
  const hasContent = !!(
    (wine.tasting_note && wine.tasting_note.trim()) ||
    (wine.other_observations && wine.other_observations.trim()) ||
    wine.user_score != null
  );
  if (!hasContent) return;

  const display = await getDisplayName();
  const location = [wine.restaurant_name?.trim(), wine.city?.trim()].filter(Boolean).join(', ');
  const subtitleParts = [wineSubtitle(wine.region, wine.appellation), location || null].filter(Boolean);

  await upsertMyCommunityReview(
    {
      category: 'wine',
      source_table: 'chosen_wines',
      source_id: wine.id,
      title: wineHeader(wine.producer, wine.wine_name, wine.vintage),
      subtitle: subtitleParts.join(' · ') || null,
      rating: wine.user_score,
      body: wine.tasting_note ?? null,
      metadata: {
        producer: wine.producer,
        wine_name: wine.wine_name,
        vintage: wine.vintage,
        region: wine.region,
        appellation: wine.appellation,
        restaurant_name: wine.restaurant_name,
        city: wine.city,
        other_observations: wine.other_observations,
      },
    },
    display,
  );
}

export async function publishCellarWineReviewToCommunity(wine: CellarWine): Promise<void> {
  // Cellar wines hold both AI tasting notes and the user's personal
  // review fields. Only publish when the user has supplied review
  // content of their own.
  const hasContent = !!(
    (wine.user_notes && wine.user_notes.trim()) ||
    wine.review_score != null ||
    (wine.review_location && wine.review_location.trim())
  );
  if (!hasContent) return;

  const display = await getDisplayName();
  const subtitleParts = [
    wineSubtitle(wine.region, wine.appellation),
    wine.review_location?.trim() || null,
  ].filter(Boolean);

  await upsertMyCommunityReview(
    {
      category: 'wine',
      source_table: 'cellar_wines',
      source_id: wine.id,
      title: wineHeader(wine.producer, wine.wine_name, wine.vintage),
      subtitle: subtitleParts.join(' · ') || null,
      rating: wine.review_score,
      body: wine.user_notes ?? null,
      metadata: {
        producer: wine.producer,
        wine_name: wine.wine_name,
        vintage: wine.vintage,
        region: wine.region,
        appellation: wine.appellation,
        review_location: wine.review_location,
        review_date: wine.review_date,
      },
    },
    display,
  );
}

export async function publishRestaurantSessionToCommunity(session: ScanSessionForCommunity): Promise<void> {
  const name = session.restaurant_name?.trim();
  if (!name) return;
  // Require at least one rating or a note before publishing — bare-name
  // sessions aren't a useful review.
  const hasContent = !!(
    (session.restaurant_note && session.restaurant_note.trim()) ||
    session.rating_food != null ||
    session.rating_service != null ||
    session.rating_wine_list != null ||
    session.rating_overall != null
  );
  if (!hasContent) return;

  const display = await getDisplayName();
  // Overall rating drives the top-line score; the per-axis ratings live
  // in metadata.
  await upsertMyCommunityReview(
    {
      category: 'restaurant',
      source_table: 'scan_sessions',
      source_id: session.id,
      title: name,
      subtitle: null,
      rating: session.rating_overall,
      body: session.restaurant_note ?? null,
      metadata: {
        rating_food: session.rating_food,
        rating_service: session.rating_service,
        rating_wine_list: session.rating_wine_list,
        rating_overall: session.rating_overall,
      },
    },
    display,
  );
}
