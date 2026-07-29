import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';

// The Vinster Journal — an owner-authored blog. Only the Vinster account writes
// posts (enforced by RLS); everyone reads published ones.
export const VINSTER_OWNER_EMAIL = 'hilary@vinsterapp.com';

export function isVinsterOwner(session: Session | null | undefined): boolean {
  return (session?.user.email ?? '').toLowerCase() === VINSTER_OWNER_EMAIL;
}

export interface BlogPost {
  id: string;
  user_id: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostInput {
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  tags: string[];
  is_published: boolean;
}

// Published posts, newest first. The owner additionally sees their own drafts
// (RLS lets them read unpublished rows), so drafts sort in by created_at.
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('blog_posts').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as BlogPost) ?? null;
}

export async function createBlogPost(userId: string, input: BlogPostInput): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      user_id: userId,
      ...normalize(input),
      published_at: input.is_published ? new Date().toISOString() : null,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function updateBlogPost(id: string, input: BlogPostInput, wasPublished: boolean): Promise<BlogPost> {
  const { data, error } = await supabase
    .from('blog_posts')
    .update({
      ...normalize(input),
      updated_at: new Date().toISOString(),
      // Stamp published_at the first time it goes live; keep the original date on re-edits.
      ...(input.is_published && !wasPublished ? { published_at: new Date().toISOString() } : {}),
      ...(!input.is_published ? { published_at: null } : {}),
    })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as BlogPost;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const { error } = await supabase.from('blog_posts').delete().eq('id', id);
  if (error) throw error;
}

function normalize(input: BlogPostInput) {
  return {
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() || null,
    body: input.body.trim(),
    cover_image_url: input.cover_image_url?.trim() || null,
    tags: input.tags.map((t) => t.trim()).filter(Boolean),
    is_published: input.is_published,
  };
}
