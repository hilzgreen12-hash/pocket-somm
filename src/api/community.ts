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
