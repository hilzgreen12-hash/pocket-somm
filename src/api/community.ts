import { supabase } from './supabase';
import type { CommunityPost, CommunityComment } from '../types/wine';

export async function getPosts(): Promise<CommunityPost[]> {
  const { data: session } = await supabase.auth.getSession();
  const userId = session.session?.user.id;

  const { data, error } = await supabase
    .from('community_posts')
    .select(`
      *,
      like_count:community_likes(count),
      comment_count:community_comments(count)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const posts = (data ?? []).map((p) => ({
    ...p,
    like_count: p.like_count?.[0]?.count ?? 0,
    comment_count: p.comment_count?.[0]?.count ?? 0,
    user_has_liked: false,
  }));

  if (userId && posts.length > 0) {
    const postIds = posts.map((p) => p.id);
    const { data: likes } = await supabase
      .from('community_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds);

    const likedIds = new Set((likes ?? []).map((l) => l.post_id));
    posts.forEach((p) => { p.user_has_liked = likedIds.has(p.id); });
  }

  return posts;
}

export async function createPost(post: {
  user_id: string;
  display_name: string;
  avatar: string | null;
  content: string;
  wine_name?: string;
  wine_producer?: string;
  wine_vintage?: string;
  cellar_wine_id?: string;
}): Promise<CommunityPost> {
  const { data, error } = await supabase
    .from('community_posts')
    .insert(post)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('community_posts').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleLike(postId: string, userId: string, hasLiked: boolean): Promise<void> {
  if (hasLiked) {
    await supabase.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId);
  } else {
    await supabase.from('community_likes').insert({ post_id: postId, user_id: userId });
  }
}

export async function getComments(postId: string): Promise<CommunityComment[]> {
  const { data, error } = await supabase
    .from('community_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addComment(comment: {
  post_id: string;
  user_id: string;
  display_name: string;
  avatar: string | null;
  content: string;
}): Promise<CommunityComment> {
  const { data, error } = await supabase
    .from('community_comments')
    .insert(comment)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ----- Community Reviews (wine / recipe / restaurant) -----

export type CommunityCategory = 'wine' | 'recipe' | 'restaurant';

export interface CommunityReview {
  id: string;
  user_id: string;
  display_name: string | null;
  category: CommunityCategory;
  source_table: string | null;
  source_id: string | null;
  title: string;
  subtitle: string | null;
  rating: number | null;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CommunityReviewInput {
  category: CommunityCategory;
  source_table?: string | null;
  source_id?: string | null;
  title: string;
  subtitle?: string | null;
  rating?: number | null;
  body?: string | null;
  metadata?: Record<string, unknown>;
}

export async function listCommunityReviews(category: CommunityCategory, limit = 50): Promise<CommunityReview[]> {
  const { data, error } = await supabase
    .from('community_reviews')
    .select('*')
    .eq('category', category)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CommunityReview[];
}

export async function searchCommunityReviews(category: CommunityCategory, query: string, limit = 50): Promise<CommunityReview[]> {
  const term = query.trim();
  if (!term) return listCommunityReviews(category, limit);
  const safe = term.replace(/[%,]/g, '');
  const { data, error } = await supabase
    .from('community_reviews')
    .select('*')
    .eq('category', category)
    .or(`title.ilike.%${safe}%,subtitle.ilike.%${safe}%,body.ilike.%${safe}%`)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as CommunityReview[];
}

export async function listMyCommunityUploads(category: CommunityCategory): Promise<CommunityReview[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from('community_reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('category', category)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CommunityReview[];
}

export async function publishCommunityReview(input: CommunityReviewInput, displayName: string | null): Promise<CommunityReview> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sign in required to publish');
  const { data, error } = await supabase
    .from('community_reviews')
    .insert({
      user_id: user.id,
      display_name: displayName,
      category: input.category,
      source_table: input.source_table ?? null,
      source_id: input.source_id ?? null,
      title: input.title,
      subtitle: input.subtitle ?? null,
      rating: input.rating ?? null,
      body: input.body ?? null,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();
  if (error) throw error;
  return data as CommunityReview;
}

export async function unpublishCommunityReview(id: string): Promise<void> {
  const { error } = await supabase.from('community_reviews').delete().eq('id', id);
  if (error) throw error;
}
