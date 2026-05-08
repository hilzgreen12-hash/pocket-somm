import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  addRecipeToCollection,
  createRecipeCollection,
  deleteRecipeCollection,
  listAllMemberships,
  listRecipeCollections,
  removeRecipeFromCollection,
  renameRecipeCollection,
} from '../api/recipeCollections';

export function useRecipeCollections() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['recipe-collections', userId],
    queryFn: () => listRecipeCollections(userId),
    enabled: !!userId,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['recipe-collection-memberships', userId],
    queryFn: () => listAllMemberships(userId),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: (name: string) => {
      if (!userId) throw new Error('Sign in required');
      return createRecipeCollection(userId, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipe-collections', userId] }),
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameRecipeCollection(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recipe-collections', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRecipeCollection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe-collections', userId] });
      qc.invalidateQueries({ queryKey: ['recipe-collection-memberships', userId] });
    },
  });

  const addItem = useMutation({
    mutationFn: ({ collectionId, recipeId }: { collectionId: string; recipeId: string }) =>
      addRecipeToCollection(collectionId, recipeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe-collections', userId] });
      qc.invalidateQueries({ queryKey: ['recipe-collection-memberships', userId] });
    },
  });

  const removeItem = useMutation({
    mutationFn: ({ collectionId, recipeId }: { collectionId: string; recipeId: string }) =>
      removeRecipeFromCollection(collectionId, recipeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipe-collections', userId] });
      qc.invalidateQueries({ queryKey: ['recipe-collection-memberships', userId] });
    },
  });

  // Helper: build a Map from recipe_id → Set of collection_ids
  const membershipMap = new Map<string, Set<string>>();
  for (const m of memberships) {
    const set = membershipMap.get(m.recipe_id) ?? new Set<string>();
    set.add(m.collection_id);
    membershipMap.set(m.recipe_id, set);
  }

  return { collections, isLoading, memberships, membershipMap, create, rename, remove, addItem, removeItem };
}
