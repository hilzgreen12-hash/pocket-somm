import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getRacks, createRack, deleteRack, renameRack, wipeRackContents, getRackSlots, assignSlot, clearSlot, type LargeFormatRowSpec } from '../api/racks';

export function useRacks() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: racks = [], isLoading } = useQuery({
    queryKey: ['racks', userId],
    queryFn: () => getRacks(userId),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: ({ name, rows, cols, storageType, largeFormat }: { name: string; rows: number; cols: number; storageType?: 'rack' | 'fridge'; largeFormat?: LargeFormatRowSpec | null }) =>
      createRack(userId, name, rows, cols, storageType, largeFormat),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['racks', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRack(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['racks', userId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    },
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameRack(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['racks', userId] }),
  });

  const wipe = useMutation({
    mutationFn: (id: string) => wipeRackContents(id),
    onSuccess: (_data, rackId) => {
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    },
  });

  return { racks, isLoading, create, remove, rename, wipe };
}

export function useRack(rackId: string) {
  const qc = useQueryClient();

  const { data: slots = [], isLoading } = useQuery({
    queryKey: ['rack-slots', rackId],
    queryFn: () => getRackSlots(rackId),
    enabled: !!rackId,
  });

  const assign = useMutation({
    mutationFn: ({ row, col, wineId }: { row: number; col: number; wineId: string }) =>
      assignSlot(rackId, row, col, wineId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rack-slots', rackId] }),
  });

  const clear = useMutation({
    mutationFn: ({ row, col }: { row: number; col: number }) =>
      clearSlot(rackId, row, col),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rack-slots', rackId] }),
  });

  return { slots, isLoading, assign, clear };
}
