import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPosts, createPost, deletePost, toggleLike, getComments, addComment } from '../api/community';
import type { CommunityPost, CommunityComment } from '../types/wine';

export function usePosts() {
  const qc = useQueryClient();

  const { data: posts = [], isLoading, refetch } = useQuery({
    queryKey: ['community-posts'],
    queryFn: getPosts,
    staleTime: 30_000,
  });

  const create = useMutation({
    mutationFn: createPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const remove = useMutation({
    mutationFn: deletePost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  const like = useMutation({
    mutationFn: ({ postId, userId, hasLiked }: { postId: string; userId: string; hasLiked: boolean }) =>
      toggleLike(postId, userId, hasLiked),
    onMutate: async ({ postId, hasLiked }) => {
      await qc.cancelQueries({ queryKey: ['community-posts'] });
      const prev = qc.getQueryData<CommunityPost[]>(['community-posts']);
      qc.setQueryData<CommunityPost[]>(['community-posts'], (old) =>
        (old ?? []).map((p) =>
          p.id === postId
            ? { ...p, like_count: (p.like_count ?? 0) + (hasLiked ? -1 : 1), user_has_liked: !hasLiked }
            : p
        )
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['community-posts'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['community-posts'] }),
  });

  return { posts, isLoading, refetch, create, remove, like };
}

export function useComments(postId: string) {
  const qc = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId),
  });

  const add = useMutation({
    mutationFn: addComment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comments', postId] }),
  });

  return { comments, isLoading, add };
}
