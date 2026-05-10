import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  addChefItemToCollection,
  createChefArchiveCollection,
  deleteChefArchiveCollection,
  listAllChefArchiveMemberships,
  listChefArchiveCollections,
  removeChefItemFromCollection,
  renameChefArchiveCollection,
  setLabelSessionStarred,
  setPairingSessionStarred,
} from '../api/chefArchiveCollections';

export function useChefArchiveCollections() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['chef-archive-collections', userId],
    queryFn: () => listChefArchiveCollections(userId),
    enabled: !!userId,
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['chef-archive-memberships', userId],
    queryFn: () => listAllChefArchiveMemberships(userId),
    enabled: !!userId,
  });

  const create = useMutation({
    mutationFn: (name: string) => {
      if (!userId) throw new Error('Sign in required');
      return createChefArchiveCollection(userId, name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] }),
  });

  const rename = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameChefArchiveCollection(id, name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteChefArchiveCollection(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] });
      qc.invalidateQueries({ queryKey: ['chef-archive-memberships', userId] });
    },
  });

  const addItem = useMutation({
    mutationFn: ({
      collectionId,
      itemType,
      itemId,
    }: {
      collectionId: string;
      itemType: 'label' | 'pairing';
      itemId: string;
    }) => addChefItemToCollection(collectionId, itemType, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] });
      qc.invalidateQueries({ queryKey: ['chef-archive-memberships', userId] });
    },
  });

  const removeItem = useMutation({
    mutationFn: ({
      collectionId,
      itemType,
      itemId,
    }: {
      collectionId: string;
      itemType: 'label' | 'pairing';
      itemId: string;
    }) => removeChefItemFromCollection(collectionId, itemType, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] });
      qc.invalidateQueries({ queryKey: ['chef-archive-memberships', userId] });
    },
  });

  // Map session_id → Set of collection_ids so the UI can show folder badges
  // and filter the unified feed quickly. Keys are prefixed with type so a
  // label and pairing with colliding ids don't merge.
  const membershipMap = new Map<string, Set<string>>();
  for (const m of memberships) {
    const key = m.label_session_id ? `label:${m.label_session_id}` : `pairing:${m.pairing_session_id}`;
    const set = membershipMap.get(key) ?? new Set<string>();
    set.add(m.collection_id);
    membershipMap.set(key, set);
  }

  // Toggle starred state on a session; invalidates the chef session query
  // so the unified feed and Favourites virtual folder refresh immediately.
  const toggleStar = useMutation({
    mutationFn: ({
      itemType,
      itemId,
      starred,
    }: {
      itemType: 'label' | 'pairing';
      itemId: string;
      starred: boolean;
    }) =>
      itemType === 'label'
        ? setLabelSessionStarred(itemId, starred)
        : setPairingSessionStarred(itemId, starred),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['chef-label-sessions', userId] });
      qc.invalidateQueries({ queryKey: ['chef-pairing-sessions', userId] });
    },
  });

  return {
    collections,
    isLoading,
    memberships,
    membershipMap,
    create,
    rename,
    remove,
    addItem,
    removeItem,
    toggleStar,
  };
}
