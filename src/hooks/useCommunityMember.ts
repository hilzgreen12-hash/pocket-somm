import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { COMMUNITY_ENABLED } from '../constants/features';
import { getMyMembership, getMyShares, MY_MEMBERSHIP_KEY, MY_SHARES_KEY } from '../api/community';

// The signed-in user's Community membership and which of their reviews are
// shared (keyed "<source_table>:<source_id>"). Both are off — no queries —
// while the Community is switched off.
export function useCommunityMember() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const enabled = COMMUNITY_ENABLED && !!userId;

  const { data: member = null } = useQuery({
    queryKey: [MY_MEMBERSHIP_KEY, userId],
    enabled,
    queryFn: () => getMyMembership(userId!),
  });
  const { data: shares } = useQuery({
    queryKey: [MY_SHARES_KEY, userId],
    enabled,
    queryFn: () => getMyShares(userId!),
  });

  const refreshShares = useCallback(() => {
    void qc.invalidateQueries({ queryKey: [MY_SHARES_KEY] });
  }, [qc]);
  const refreshMember = useCallback(() => {
    void qc.invalidateQueries({ queryKey: [MY_MEMBERSHIP_KEY] });
  }, [qc]);

  return { enabled: COMMUNITY_ENABLED, member, shares: shares ?? new Map(), refreshShares, refreshMember };
}
