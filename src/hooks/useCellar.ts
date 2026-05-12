import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getCellarWines, getWishListWines, addCellarWine, updateCellarWine, deleteCellarWine, archiveCellarWine, getArchivedWines, shareCellar, getCellarShares, removeCellarShare } from '../api/cellar';
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
    mutationFn: (id: string) => archiveCellarWine(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
      // Archiving a wine that was on the wishlist (is_wishlist=true) sets
      // archived_at but leaves the wishlist row visible until the next
      // cache GC. Invalidate the wishlist query so it disappears immediately.
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
    },
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

export function useWishList() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: wines = [], isLoading } = useQuery({
    queryKey: ['wishlist', userId],
    queryFn: () => getWishListWines(userId),
    enabled: !!userId,
  });

  const addWine = useMutation({
    mutationFn: (wine: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'>) =>
      addCellarWine({ ...wine, is_wishlist: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', userId] }),
  });

  const updateWine = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CellarWine> }) =>
      updateCellarWine(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', userId] }),
  });

  const deleteWine = useMutation({
    mutationFn: (id: string) => deleteCellarWine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wishlist', userId] }),
  });

  const moveTocellar = useMutation({
    mutationFn: (id: string) => updateCellarWine(id, { is_wishlist: false }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist', userId] });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
    },
  });

  return { wines, isLoading, addWine, updateWine, deleteWine, moveTocellar };
}

export function useArchive() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: wines = [], isLoading } = useQuery({
    queryKey: ['cellar-archive', userId],
    queryFn: () => getArchivedWines(userId),
    enabled: !!userId,
  });

  const updateNote = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      updateCellarWine(id, { user_notes: note || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
      // Editing a note on a wine that's still racked needs rack-slots to
      // pick up the new note text — the live cellar/[wineId] edit path
      // already invalidates this for the same reason.
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
    },
  });

  const deleteWine = useMutation({
    mutationFn: (id: string) => deleteCellarWine(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cellar-archive', userId] }),
  });

  return { wines, isLoading, updateNote, deleteWine };
}
