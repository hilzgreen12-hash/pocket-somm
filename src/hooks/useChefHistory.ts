import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
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

// Best-effort city resolution from GPS. Returns null if permission isn't
// granted or anything fails — saves should never block on location.
async function captureCity(): Promise<string | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
    return geo?.city ?? geo?.subregion ?? geo?.region ?? null;
  } catch {
    return null;
  }
}

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
    mutationFn: async (input: {
      wine: WineDetailsComplete;
      filters: Record<string, unknown> | null;
      pairings: Pairing[];
    }) => {
      if (!userId) throw new Error('Sign in required');
      const city = await captureCity();
      return insertChefLabelSession({ userId, ...input, city });
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
    mutationFn: async (input: {
      dish: string;
      mode: 'cellar' | 'general';
      cellarResult: CellarRecommendation[] | null;
      generalResult: GeneralRecommendation[] | null;
      generalSummary: string | null;
    }) => {
      if (!userId) throw new Error('Sign in required');
      const city = await captureCity();
      return insertChefPairingSession({ userId, ...input, city });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-pairing-sessions', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChefPairingSession(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-pairing-sessions', userId] }),
  });

  return { sessions, isLoading, save, remove };
}
