import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getCellarWines, addCellarWine, updateCellarWine, deleteCellarWine, shareCellar, getCellarShares, removeCellarShare } from '../api/cellar';
import type { CellarWine } from '../types/wine';

export function useCellar() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: wines = [], isLoading } = useQuery({
    queryKey: ['cellar', userId],
    queryFn: () => getCellarWines(userId),
    enabled: !!userId,
  });

  const { data: shares = [] } = useQuery({
    queryKey: ['cellar-shares', userId],
    queryFn: () => getCellarShares(userId),
    enabled: !!userId,
  });

  const addWine = useMutation({
    mutationFn: (wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>) => addCellarWine(wine),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar', userId] }),
  });

  const updateWine = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CellarWine> }) => updateCellarWine(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar', userId] }),
  });

  const deleteWine = useMutation({
    mutationFn: (id: string) => deleteCellarWine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar', userId] }),
  });

  const share = useMutation({
    mutationFn: (email: string) => shareCellar(userId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar-shares', userId] }),
  });

  const removeShare = useMutation({
    mutationFn: (email: string) => removeCellarShare(userId, email),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar-shares', userId] }),
  });

  return { wines, isLoading, shares, addWine, updateWine, deleteWine, share, removeShare };
}
