import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getObservations,
  refreshObservations,
  removeObservation,
  removeToldStatement,
  tellVinster,
  type ObservationsState,
} from '../api/observations';

// Vinster's Observations for the signed-in user. Every action returns the full
// new state, which simply replaces the cached copy.
export function useObservations() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const queryClient = useQueryClient();
  const key = ['observations', userId];
  const store = (state: ObservationsState) => queryClient.setQueryData(key, state);

  const query = useQuery({
    queryKey: key,
    queryFn: getObservations,
    enabled: !!userId,
    // hasNewData is worked out on the server at read time, so always re-ask on open.
    refetchOnMount: 'always',
  });

  const refresh = useMutation({ mutationFn: refreshObservations, onSuccess: store });

  const tell = useMutation({
    mutationFn: tellVinster,
    onSuccess: ({ outcome: _outcome, ...state }) => store(state),
  });

  const remove = useMutation({
    mutationFn: (target: { id: string } | { toldId: string }) =>
      'toldId' in target ? removeToldStatement(target.toldId) : removeObservation(target.id),
    onSuccess: store,
  });

  return {
    state: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    loadError: query.error,
    reload: query.refetch,
    refresh,
    tell,
    remove,
  };
}
