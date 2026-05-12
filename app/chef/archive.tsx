import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { useChefArchiveCollections } from '../../src/hooks/useChefArchiveCollections';
import { useLabelStore } from '../../src/stores/labelStore';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { showAlert } from '../../src/components/AppAlert';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { ChefLabelSession } from '../../src/api/chef';
import type { ChefArchiveCollection } from '../../src/api/chefArchiveCollections';

const FILTER_ALL = 'ALL';
const FILTER_FAVOURITES = 'FAVOURITES';

type UnifiedItem = { type: 'label'; key: string; saved_at: string; is_starred: boolean; session: ChefLabelSession };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChefArchiveScreen() {
  const { filter: initialFilter } = useLocalSearchParams<{ filter?: string }>();
  const { session } = useAuth();
  const { sessions: labelSessions, isLoading: labelLoading } = useChefLabelHistory();
  const { collections, membershipMap, create, rename, remove, addItem, removeItem, toggleStar } = useChefArchiveCollections();

  const { setWineDetailsConfirmed, setPairings, setFilters } = useLabelStore();

  const [filter, setFilter] = useState<string>(initialFilter === 'favourites' ? FILTER_FAVOURITES : FILTER_ALL);
  const [folderDropdownOpen, setFolderDropdownOpen] = useState(false);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [manageFolder, setManageFolder] = useState<ChefArchiveCollection | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [assigning, setAssigning] = useState<UnifiedItem | null>(null);

  // Recipe-only feed sorted newest-first. Wine pairings (find-a-pairing
  // searches) are intentionally not archived — only recipe sets generated
  // from a label scan land here.
  const allItems: UnifiedItem[] = useMemo(() => {
    const items: UnifiedItem[] = labelSessions.map((s): UnifiedItem => ({
      type: 'label',
      key: `label:${s.id}`,
      saved_at: s.saved_at,
      is_starred: !!s.is_starred,
      session: s,
    }));
    items.sort((a, b) => (a.saved_at < b.saved_at ? 1 : -1));
    return items;
  }, [labelSessions]);

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
    const s = item.session;
    setWineDetailsConfirmed(s.wine);
    setPairings(s.pairings);
    setFilters(s.filters ?? null);
    router.push({ pathname: '/chef/results', params: { fromHistory: 'true', savedAt: s.saved_at, city: s.city ?? '' } });
  }

  function itemTitle(item: UnifiedItem): string {
    return wineHeaderLine(item.session.wine.producer, item.session.wine.wineName, item.session.wine.vintage);
  }

  function itemSubtitle(item: UnifiedItem): string {
    return item.session.pairings.map((p) => p.dishName).join(' · ');
  }

  const isLoading = labelLoading;

  // Current folder label for the filter chip — Full Cellar List style:
  // single chip showing the active selection. Tap opens a dropdown modal.
  const folderLabel = (() => {
    if (filter === FILTER_ALL) return 'All';
    if (filter === FILTER_FAVOURITES) return '★ Favourites';
    return collections.find((c) => c.id === filter)?.name ?? 'All';
  })();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{filter === FILTER_FAVOURITES ? 'Your Favourite Recipes' : 'Recipe Archive'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Summary + single folder filter chip — mirrors Full Cellar List
          style instead of the old multi-chip horizontal strip. */}
      {session && (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {filteredItems.length} {filteredItems.length === 1 ? 'recipe' : 'recipes'}
              {favouritesCount > 0 ? ` · ${favouritesCount} favourite${favouritesCount === 1 ? '' : 's'}` : ''}
            </Text>
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterChip} onPress={() => setFolderDropdownOpen(true)}>
              <Text style={styles.filterChipLabel}>Folder</Text>
              <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{folderLabel}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Save your recipes and wine pairings to your account — sign in to keep them."
        />
      ) : isLoading ? null : filteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{filter === FILTER_ALL ? 'No Recipe Archive Yet' : 'Nothing here'}</Text>
          <Text style={styles.emptyBody}>
            {filter === FILTER_ALL
              ? 'After scanning a wine label, save the chef-inspired recipes to your archive to keep them here.'
              : filter === FILTER_FAVOURITES
                ? 'Tap the ★ on any recipe card to add it to your Favourites.'
                : 'No recipes in this folder yet. From the All tab, open any recipe and add it to a folder.'}
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

      {/* Folder filter dropdown — mirrors Full Cellar List's dropdown
          pattern: tap the chip, pick a value, close. Long-press a folder
          row to manage (rename / delete). */}
      <Modal visible={folderDropdownOpen} transparent animationType="fade" onRequestClose={() => setFolderDropdownOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFolderDropdownOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Folder</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              <TouchableOpacity
                style={[styles.modalOption, filter === FILTER_ALL && styles.modalOptionActive]}
                onPress={() => { setFilter(FILTER_ALL); setFolderDropdownOpen(false); }}
              >
                <Text style={[styles.modalOptionText, filter === FILTER_ALL && styles.modalOptionTextActive]}>
                  All ({allItems.length})
                </Text>
                {filter === FILTER_ALL && <Text style={styles.modalOptionCheck}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalOption, filter === FILTER_FAVOURITES && styles.modalOptionActive]}
                onPress={() => { setFilter(FILTER_FAVOURITES); setFolderDropdownOpen(false); }}
              >
                <Text style={[styles.modalOptionText, filter === FILTER_FAVOURITES && styles.modalOptionTextActive]}>
                  ★ Favourites ({favouritesCount})
                </Text>
                {filter === FILTER_FAVOURITES && <Text style={styles.modalOptionCheck}>✓</Text>}
              </TouchableOpacity>
              {collections.map((c) => {
                const active = filter === c.id;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.modalOption, active && styles.modalOptionActive]}
                    onPress={() => { setFilter(c.id); setFolderDropdownOpen(false); }}
                    onLongPress={() => { setFolderDropdownOpen(false); setManageFolder(c); setRenameDraft(c.name); }}
                  >
                    <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                      {c.name} ({c.item_count})
                    </Text>
                    {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[styles.modalOption, styles.modalOptionNewFolder]}
                onPress={() => { setFolderDropdownOpen(false); gatedAction(() => setNewFolderOpen(true)); }}
              >
                <Text style={styles.modalOptionNewText}>+ Create new folder</Text>
              </TouchableOpacity>
            </ScrollView>
            {collections.length > 0 && (
              <Text style={styles.manageHint}>Long-press a folder to rename or delete.</Text>
            )}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setFolderDropdownOpen(false)}>
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  // Filter UI mirrors Full Cellar List: small summary row, then a single
  // chip per filter dimension. Tap to open a dropdown modal. Compact and
  // sits flush against the header rather than a chunky multi-chip strip.
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, flexDirection: 'row', gap: spacing.sm },
  filterChip: { width: 160, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalOptionNewFolder: { borderBottomWidth: 0, paddingTop: spacing.md },
  modalOptionNewText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  manageHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingTop: spacing.xs, paddingBottom: 4 },
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
  modalDanger: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  modalDangerText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold },
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
