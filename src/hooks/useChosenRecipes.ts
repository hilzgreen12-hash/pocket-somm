import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  deleteChosenRecipe,
  fetchChosenRecipes,
  saveChosenRecipe,
  updateChosenRecipe,
  type SaveChosenRecipeInput,
  type UpdateChosenRecipeInput,
} from '../api/chosenRecipes';

export function useChosenRecipes() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: chosenRecipes = [], isLoading } = useQuery({
    queryKey: ['chosen-recipes', userId],
    queryFn: () => fetchChosenRecipes(userId),
    enabled: !!userId,
  });

  const save = useMutation({
    mutationFn: (input: SaveChosenRecipeInput) => {
      if (!userId) throw new Error('Sign in required');
      return saveChosenRecipe(userId, input);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chosen-recipes', userId] }),
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateChosenRecipeInput }) =>
      updateChosenRecipe(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chosen-recipes', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChosenRecipe(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chosen-recipes', userId] }),
  });

  return { chosenRecipes, isLoading, save, update, remove };
}
