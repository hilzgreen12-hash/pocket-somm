import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  deleteChefLabelSession,
  deleteChefPairingSession,
  insertChefLabelSession,
  insertChefPairingSession,
  listChefLabelSessions,
  listChefPairingSessions,
} from '../api/chef';
import type { CellarRecommendation, GeneralRecommendation } from '../stores/foodPairingStore';
import type { Pairing, WineDetailsComplete } from '../types/wine';

export function useChefLabelHistory() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['chef-label-sessions', userId],
    queryFn: () => listChefLabelSessions(userId),
    enabled: !!userId,
  });

  const save = useMutation({
    mutationFn: (input: {
      wine: WineDetailsComplete;
      filters: Record<string, unknown> | null;
      pairings: Pairing[];
    }) => {
      if (!userId) throw new Error('Sign in required');
      return insertChefLabelSession({ userId, ...input });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-label-sessions', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChefLabelSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-label-sessions', userId] }),
  });

  return { sessions, isLoading, save, remove };
}

export function useChefPairingHistory() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['chef-pairing-sessions', userId],
    queryFn: () => listChefPairingSessions(userId),
    enabled: !!userId,
  });

  const save = useMutation({
    mutationFn: (input: {
      dish: string;
      mode: 'cellar' | 'general';
      cellarResult: CellarRecommendation[] | null;
      generalResult: GeneralRecommendation[] | null;
      generalSummary: string | null;
    }) => {
      if (!userId) throw new Error('Sign in required');
      return insertChefPairingSession({ userId, ...input });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-pairing-sessions', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChefPairingSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-pairing-sessions', userId] }),
  });

  return { sessions, isLoading, save, remove };
}
