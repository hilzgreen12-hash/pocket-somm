import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { invalidateCellarViews } from './useCellar';
import { getRacks, createRack, deleteRack, renameRack, resizeRack, wipeRackContents, getRackSlots, type LargeFormatRowSpec } from '../api/racks';

export function useRacks() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: racks = [], isLoading, isError } = useQuery({
    queryKey: ['racks', userId],
    queryFn: () => getRacks(userId),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: ({ name, rows, cols, storageType, largeFormat }: { name: string; rows: number; cols: number; storageType?: 'rack' | 'fridge'; largeFormat?: LargeFormatRowSpec | null }) =>
      createRack(userId, name, rows, cols, storageType, largeFormat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['racks', userId] }),
  });

  // Delete, wipe and resize unplace bottles, so every placement view refreshes.
  const remove = useMutation({
    mutationFn: (id: string) => deleteRack(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['racks', userId] });
      invalidateCellarViews(qc);
    },
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameRack(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['racks', userId] }),
  });

  const wipe = useMutation({
    mutationFn: (id: string) => wipeRackContents(id),
    onSettled: () => invalidateCellarViews(qc),
  });

  const resize = useMutation({
    mutationFn: ({ id, rows, cols }: { id: string; rows: number; cols: number }) => resizeRack(id, rows, cols),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['racks', userId] });
      invalidateCellarViews(qc);
    },
  });

  return { racks, isLoading, isError, create, remove, rename, wipe, resize };
}

export function useRack(rackId: string) {
  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['rack-slots', rackId],
    queryFn: () => getRackSlots(rackId),
    enabled: !!rackId,
  });
  return { slots, isLoading };
}
