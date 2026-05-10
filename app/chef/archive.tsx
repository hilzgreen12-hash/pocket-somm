import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useChefLabelHistory, useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { useChefArchiveCollections } from '../../src/hooks/useChefArchiveCollections';
import { useLabelStore } from '../../src/stores/labelStore';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { showAlert } from '../../src/components/AppAlert';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { ChefLabelSession, ChefPairingSession } from '../../src/api/chef';
import type { ChefArchiveCollection } from '../../src/api/chefArchiveCollections';

const FILTER_ALL = 'ALL';
const FILTER_FAVOURITES = 'FAVOURITES';

type UnifiedItem =
  | { type: 'label'; key: string; saved_at: string; is_starred: boolean; session: ChefLabelSession }
  | { type: 'pairing'; key: string; saved_at: string; is_starred: boolean; session: ChefPairingSession };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FolderChip({ label, count, active, onPress, onLongPress, accent }: {
  label: string;
  count?: number;
  active: boolean;
  onPress: () => void;
  onLongPress?: () => void;
  accent?: 'gold' | 'star';
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, accent === 'star' && styles.chipStar]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {accent === 'star' ? '★ ' : ''}{label}{count != null ? ` (${count})` : ''}
      </Text>
    </TouchableOpacity>
  );
}

export default function ChefArchiveScreen() {
  const { session } = useAuth();
  const { sessions: labelSessions, isLoading: labelLoading } = useChefLabelHistory();
  const { sessions: pairingSessions, isLoading: pairingLoading } = useChefPairingHistory();
  const { collections, membershipMap, create, rename, remove, addItem, removeItem, toggleStar } = useChefArchiveCollections();

  const { setWineDetailsConfirmed, setPairings, setFilters } = useLabelStore();
  const { setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();

  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [manageFolder, setManageFolder] = useState<ChefArchiveCollection | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [assigning, setAssigning] = useState<UnifiedItem | null>(null);

  // Unified feed sorted newest-first.
  const allItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = [
      ...labelSessions.map((s): UnifiedItem => ({ type: 'label', key: `label:${s.id}`, saved_at: s.saved_at, is_starred: !!s.is_starred, session: s })),
      ...pairingSessions.map((s): UnifiedItem => ({ type: 'pairing', key: `pairing:${s.id}`, saved_at: s.saved_at, is_starred: !!s.is_starred, session: s })),
    ];
    items.sort((a, b) => (a.saved_at < b.saved_at ? 1 : -1));
    return items;
  }, [labelSessions, pairingSessions]);

  const favouritesCount = allItems.filter((i) => i.is_starred).length;

  const filteredItems = useMemo(() => {
    if (filter === FILTER_ALL) return allItems;
    if (filter === FILTER_FAVOURITES) return allItems.filter((i) => i.is_starred);
    return allItems.filter((i) => membershipMap.get(i.key)?.has(filter));
  }, [filter, allItems, membershipMap]);

  function gatedAction(fn: () => void) {
    if (!session) {
      router.push('/(auth)/sign-in');
      return;
    }
    fn();
  }

  function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    create.mutate(trimmed, {
      onSuccess: () => {
        setNewFolderOpen(false);
        setNewFolderName('');
      },
      onError: (err) => showAlert({ title: 'Could not create', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function handleRenameFolder() {
    if (!manageFolder) return;
    const trimmed = renameDraft.trim();
    if (!trimmed) return;
    rename.mutate({ id: manageFolder.id, name: trimmed }, {
      onSuccess: () => setManageFolder(null),
      onError: (err) => showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function handleDeleteFolder() {
    if (!manageFolder) return;
    remove.mutate(manageFolder.id, {
      onSuccess: () => {
        if (filter === manageFolder.id) setFilter(FILTER_ALL);
        setManageFolder(null);
      },
      onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function toggleAssign(collectionId: string) {
    if (!assigning) return;
    const itemType = assigning.type;
    const itemId = assigning.session.id;
    const isMember = membershipMap.get(assigning.key)?.has(collectionId) ?? false;
    if (isMember) {
      removeItem.mutate({ collectionId, itemType, itemId });
    } else {
      addItem.mutate({ collectionId, itemType, itemId });
    }
  }

  function handleViewItem(item: UnifiedItem) {
    if (item.type === 'label') {
      const s = item.session;
      setWineDetailsConfirmed(s.wine);
      setPairings(s.pairings);
      setFilters(s.filters ?? null);
      router.push({ pathname: '/chef/results', params: { fromHistory: 'true', savedAt: s.saved_at, city: s.city ?? '' } });
    } else {
      const s = item.session;
      setDish(s.dish);
      setMode(s.mode);
      if (s.mode === 'cellar') setCellarResult(s.cellar_result ?? []);
      else setGeneralResult(s.general_result ?? [], s.general_summary ?? undefined);
      router.push({ pathname: '/chef/pairing-results', params: { fromHistory: 'true', savedAt: s.saved_at, city: s.city ?? '' } });
    }
  }

  function itemTitle(item: UnifiedItem): string {
    if (item.type === 'label') {
      return wineHeaderLine(item.session.wine.producer, item.session.wine.wineName, item.session.wine.vintage);
    }
    return item.session.dish;
  }

  function itemSubtitle(item: UnifiedItem): string {
    if (item.type === 'label') {
      return item.session.pairings.map((p) => p.dishName).join(' · ');
    }
    if (item.session.mode === 'cellar' && item.session.cellar_result?.length) {
      return `From your cellar — ${item.session.cellar_result.length} suggestion${item.session.cellar_result.length === 1 ? '' : 's'}`;
    }
    if (item.session.mode === 'general' && item.session.general_result?.length) {
      return `Style suggestions — ${item.session.general_result.length}`;
    }
    return '';
  }

  const isLoading = labelLoading || pairingLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Chef Archive</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Folder strip */}
      {session && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderStrip}>
          <FolderChip label="All" count={allItems.length} active={filter === FILTER_ALL} onPress={() => setFilter(FILTER_ALL)} />
          <FolderChip label="Favourites" count={favouritesCount} active={filter === FILTER_FAVOURITES} onPress={() => setFilter(FILTER_FAVOURITES)} accent="star" />
          {collections.map((c) => (
            <FolderChip
              key={c.id}
              label={c.name}
              count={c.item_count}
              active={filter === c.id}
              onPress={() => setFilter(c.id)}
              onLongPress={() => { setManageFolder(c); setRenameDraft(c.name); }}
            />
          ))}
          <TouchableOpacity style={styles.newFolderChip} onPress={() => gatedAction(() => setNewFolderOpen(true))}>
            <Text style={styles.newFolderChipText}>+ New folder</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Save your recipes and wine pairings to your account — sign in to keep them."
        />
      ) : isLoading ? null : filteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{filter === FILTER_ALL ? 'No Archive Yet' : 'Nothing here'}</Text>
          <Text style={styles.emptyBody}>
            {filter === FILTER_ALL
              ? 'After each search, save your results to archive to keep track of your recipes and wine pairings.'
              : filter === FILTER_FAVOURITES
                ? 'Tap the ★ on any archive card to add it to your Favourites.'
                : 'No items in this folder yet. From the All tab, open any item and add it to a folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {filteredItems.map((item) => {
            const memberCollectionIds = Array.from(membershipMap.get(item.key) ?? []);
            const memberFolderNames = memberCollectionIds
              .map((id) => collections.find((c) => c.id === id)?.name)
              .filter(Boolean) as string[];
            return (
              <View key={item.key} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.typePill, item.type === 'label' ? styles.typePillRecipe : styles.typePillPairing]}>
                    <Text style={styles.typePillText}>{item.type === 'label' ? 'Recipe' : 'Pairing'}</Text>
                  </View>
                  <Text style={styles.cardDate}>{formatDate(item.saved_at)}</Text>
                  <TouchableOpacity
                    style={styles.starBtn}
                    onPress={() => toggleStar.mutate({ itemType: item.type, itemId: item.session.id, starred: !item.is_starred })}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[styles.starText, item.is_starred && styles.starTextActive]}>{item.is_starred ? '★' : '☆'}</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardTitle}>{itemTitle(item)}</Text>
                {itemSubtitle(item) ? <Text style={styles.cardSubtitle}>{itemSubtitle(item)}</Text> : null}

                {memberFolderNames.length > 0 ? (
                  <View style={styles.folderBadgeRow}>
                    {memberFolderNames.map((name) => (
                      <View key={name} style={styles.folderBadge}>
                        <Text style={styles.folderBadgeText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => setAssigning(item)}>
                    <Text style={styles.assignLink}>{memberFolderNames.length > 0 ? 'Edit folders' : '+ Add to folder'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewItem(item)}>
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* New folder modal */}
      <Modal visible={newFolderOpen} transparent animationType="fade" onRequestClose={() => setNewFolderOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setNewFolderOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>New folder</Text>
            <TextInput
              style={styles.modalInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="e.g. Sunday roasts"
              placeholderTextColor={colors.textMuted}
              autoFocus
              onSubmitEditing={handleCreateFolder}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.modalConfirm} onPress={handleCreateFolder}>
              <Text style={styles.modalConfirmText}>Create</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setNewFolderOpen(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Manage folder modal (rename / delete) */}
      <Modal visible={!!manageFolder} transparent animationType="fade" onRequestClose={() => setManageFolder(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setManageFolder(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Manage folder</Text>
            <TextInput
              style={styles.modalInput}
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={styles.modalConfirm} onPress={handleRenameFolder}>
              <Text style={styles.modalConfirmText}>Rename</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalDanger} onPress={handleDeleteFolder}>
              <Text style={styles.modalDangerText}>Delete folder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setManageFolder(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Add to folder modal */}
      <Modal visible={!!assigning} transparent animationType="fade" onRequestClose={() => setAssigning(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAssigning(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to folder</Text>
            {collections.length === 0 ? (
              <Text style={styles.assignEmpty}>You don't have any folders yet. Create one first.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 320 }}>
                {collections.map((c) => {
                  const isMember = !!(assigning && membershipMap.get(assigning.key)?.has(c.id));
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.assignRow, isMember && styles.assignRowActive]}
                      onPress={() => toggleAssign(c.id)}
                    >
                      <Text style={[styles.assignRowText, isMember && styles.assignRowTextActive]}>{c.name}</Text>
                      {isMember && <Text style={styles.assignCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => { setAssigning(null); setNewFolderOpen(true); }}
            >
              <Text style={styles.modalNewFolderText}>+ Create new folder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setAssigning(null)}>
              <Text style={styles.modalCancelText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  folderStrip: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.xs },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.xs },
  chipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.15)' },
  chipStar: { borderColor: 'rgba(212,176,96,0.5)' },
  chipText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.textMuted },
  chipTextActive: { color: colors.gold },
  newFolderChip: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: 6 },
  newFolderChipText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  typePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  typePillRecipe: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  typePillPairing: { borderColor: colors.borderLight, backgroundColor: 'rgba(255,255,255,0.06)' },
  typePillText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardDate: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  starBtn: { padding: 4 },
  starText: { fontSize: 22, color: colors.textMuted },
  starTextActive: { color: colors.gold },
  cardTitle: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardSubtitle: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20 },
  folderBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  folderBadge: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: 'rgba(212,176,96,0.10)' },
  folderBadgeText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.gold },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  assignLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  viewBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 6 },
  viewBtnText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  modalConfirm: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  modalConfirmText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  modalDanger: { borderWidth: 1, borderColor: colors.error, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  modalDangerText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.error },
  modalCancel: { alignItems: 'center', paddingTop: spacing.sm },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  modalNewFolderText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold },
  assignEmpty: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  assignRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  assignRowActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  assignRowText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.text },
  assignRowTextActive: { color: colors.gold },
  assignCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold },
});
