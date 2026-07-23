import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { useChefArchiveCollections } from '../../src/hooks/useChefArchiveCollections';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { showAlert } from '../../src/components/AppAlert';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
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
  const { sessions: labelSessions, isLoading: labelLoading, remove: removeLabel } = useChefLabelHistory();
  const { collections, membershipMap, create, rename, remove, addItem, removeItem, toggleStar } = useChefArchiveCollections();

  const [filter, setFilter] = useState<string>(initialFilter === 'favourites' ? FILTER_FAVOURITES : FILTER_ALL);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  // Remembered when the user taps "+ Create new folder" from inside the
  // Add to Folder modal — once the folder is created we add this recipe
  // to it automatically, so the user doesn't have to find it again.
  const [pendingAssignAfterCreate, setPendingAssignAfterCreate] = useState<UnifiedItem | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  // Synchronous guard: the keyboard's return key (onSubmitEditing) and the
  // modal's "Create" button both call handleCreateFolder — without this,
  // doing both before the await resolves would create two folders.
  const creatingFolderRef = useRef(false);
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

  async function handleCreateFolder() {
    const trimmed = newFolderName.trim();
    if (!trimmed || creatingFolderRef.current) return;
    creatingFolderRef.current = true;
    try {
      const newFolder = await create.mutateAsync(trimmed);
      setNewFolderOpen(false);
      setNewFolderName('');
      // If the user came here from the Add to Folder modal, auto-add the
      // recipe to the freshly created folder so the action they started
      // actually finishes.
      if (pendingAssignAfterCreate && newFolder?.id) {
        try {
          await addItem.mutateAsync({
            collectionId: newFolder.id,
            itemType: pendingAssignAfterCreate.type,
            itemId: pendingAssignAfterCreate.session.id,
          });
        } catch (err) {
          showAlert({ title: 'Folder created — could not add recipe', body: err instanceof Error ? err.message : 'Please try again.' });
        }
        setPendingAssignAfterCreate(null);
      }
    } catch (err) {
      showAlert({ title: 'Could not create', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      creatingFolderRef.current = false;
    }
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

  // Add-only assignment. Folder removal is intentionally not available
  // from this modal — to remove a recipe from a folder the user
  // long-presses the card and taps Remove from Folder, which lifts the
  // recipe out of every folder it's in.
  function handleAddToFolder(collectionId: string) {
    if (!assigning) return;
    const itemType = assigning.type;
    const itemId = assigning.session.id;
    const isMember = membershipMap.get(assigning.key)?.has(collectionId) ?? false;
    if (isMember) return;
    addItem.mutate(
      { collectionId, itemType, itemId },
      {
        onError: (err) =>
          showAlert({ title: 'Could not add', body: err instanceof Error ? err.message : 'Please try again.' }),
      },
    );
  }

  function handleRemoveFromAllFolders(item: UnifiedItem) {
    const memberIds = Array.from(membershipMap.get(item.key) ?? []);
    if (memberIds.length === 0) {
      showAlert({ title: 'Already in All', body: 'This recipe isn\'t in any folder — you\'ll find it in the All tab.' });
      return;
    }
    for (const collectionId of memberIds) {
      removeItem.mutate(
        { collectionId, itemType: item.type, itemId: item.session.id },
        {
          onError: (err) => showAlert({ title: 'Could not remove from folder', body: err instanceof Error ? err.message : 'Please try again.' }),
        },
      );
    }
  }

  function handleLongPressItem(item: UnifiedItem) {
    showAlert({
      title: 'Move Recipe',
      body: itemRecipeName(item),
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove from Folder',
          onPress: () => handleRemoveFromAllFolders(item),
        },
        {
          text: 'Delete from Cookbook',
          style: 'destructive',
          onPress: () => {
            removeLabel.mutate(item.session.id, {
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }

  function handleViewItem(item: UnifiedItem) {
    const s = item.session;
    // Don't write to the label store here — the results screen reads a
    // history view straight from the chef_label_session row by id.
    // Writing the store used to clobber an un-saved fresh result still
    // sitting on the nav stack.
    router.push({
      pathname: '/chef/results',
      params: {
        fromHistory: 'true',
        sessionId: s.id,
        savedAt: s.saved_at,
        city: s.city ?? '',
      },
    });
  }

  // Recipe name comes from the first (and currently only) pairing on
  // the session. Sessions are saved one-pairing-at-a-time, so this is
  // effectively the dish name the user saved.
  function itemRecipeName(item: UnifiedItem): string {
    return item.session.pairings[0]?.dishName ?? 'Recipe';
  }

  function itemWineHeader(item: UnifiedItem): string {
    return wineHeaderLine(item.session.wine.producer, item.session.wine.wineName, item.session.wine.vintage);
  }

  const isLoading = labelLoading;

  const isAllOrFav = filter === FILTER_ALL || filter === FILTER_FAVOURITES;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Cookbook</Text>
        {session ? (
          <TouchableOpacity
            onPress={() => setNewFolderOpen(true)}
            hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
          >
            <Text style={styles.addFolderHeader}>+ Add Folder</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 90 }} />
        )}
      </View>

      {/* Folder carousel — segmented All/Favourites chip first, user
          folders after. Long-press a user folder to rename or delete. */}
      {session && (
        <View style={styles.foldersSection}>
          <Text style={styles.foldersHeading}>Folders</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.folderCarousel}
          >
            <View style={[styles.segmentedChip, isAllOrFav && styles.segmentedChipActive]}>
              <TouchableOpacity
                style={[styles.segmentedHalf, filter === FILTER_ALL && styles.segmentedHalfActive]}
                onPress={() => setFilter(FILTER_ALL)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentedHalfText, filter === FILTER_ALL && styles.segmentedHalfTextActive]}>
                  All ({allItems.length})
                </Text>
              </TouchableOpacity>
              <View style={styles.segmentedDivider} />
              <TouchableOpacity
                style={[styles.segmentedHalf, filter === FILTER_FAVOURITES && styles.segmentedHalfActive]}
                onPress={() => setFilter(FILTER_FAVOURITES)}
                activeOpacity={0.7}
              >
                <Text style={[styles.segmentedHalfText, filter === FILTER_FAVOURITES && styles.segmentedHalfTextActive]}>
                  ★ Favourites ({favouritesCount})
                </Text>
              </TouchableOpacity>
            </View>

            {collections.map((c) => {
              const active = filter === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.folderChip, active && styles.folderChipActive]}
                  onPress={() => setFilter(c.id)}
                  onLongPress={() => { setManageFolder(c); setRenameDraft(c.name); }}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.folderChipText, active && styles.folderChipTextActive]} numberOfLines={1}>
                    {c.name} ({c.item_count})
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {collections.length > 0 && (
            <Text style={styles.folderHint}>Long-press a folder to rename or delete.</Text>
          )}
        </View>
      )}

      {session && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>
            {filteredItems.length} {filteredItems.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Save your recipes and wine pairings to your account — sign in to keep them."
        />
      ) : isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{filter === FILTER_ALL ? 'Your Cookbook is Empty' : 'Nothing here'}</Text>
          <Text style={styles.emptyBody}>
            {filter === FILTER_ALL
              ? 'Generate recipes to pair with your wines through Chef and save them here for future reference and share them with friends.'
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
              <TouchableOpacity
                key={item.key}
                style={styles.card}
                activeOpacity={0.7}
                onPress={() => handleViewItem(item)}
                onLongPress={() => handleLongPressItem(item)}
                delayLongPress={400}
              >
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

                <Text style={styles.cardTitle}>{itemRecipeName(item)}</Text>
                {itemWineHeader(item) ? <Text style={styles.cardSubtitle}>{itemWineHeader(item)}</Text> : null}

                {memberFolderNames.length > 0 ? (
                  <View style={styles.folderBadgeRow}>
                    {memberFolderNames.map((name) => (
                      <View key={name} style={styles.folderBadge}>
                        <Text style={styles.folderBadgeText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* "+ Add to folder" sits at the bottom of the card; the
                    inner Touchable claims the press so the outer card's
                    onPress (open recipe) doesn't fire when this is tapped. */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => setAssigning(item)}
                    onLongPress={() => setAssigning(item)}
                    delayLongPress={400}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.assignLink}>+ Add to folder</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* New folder modal */}
      <Modal
        visible={newFolderOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { setNewFolderOpen(false); setPendingAssignAfterCreate(null); }}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => { setNewFolderOpen(false); setPendingAssignAfterCreate(null); }}
        >
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
            <TouchableOpacity
              style={[styles.modalConfirm, create.isPending && { opacity: 0.6 }]}
              onPress={handleCreateFolder}
              disabled={create.isPending}
            >
              <Text style={styles.modalConfirmText}>{create.isPending ? 'Creating…' : 'Create'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => { setNewFolderOpen(false); setPendingAssignAfterCreate(null); }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manage folder modal (rename / delete) */}
      <Modal visible={!!manageFolder} transparent animationType="fade" onRequestClose={() => setManageFolder(null)}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
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
        </KeyboardAvoidingView>
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
                      onPress={() => handleAddToFolder(c.id)}
                      disabled={isMember}
                    >
                      <Text style={[styles.assignRowText, isMember && styles.assignRowTextActive]}>{c.name}</Text>
                      {isMember && <Text style={styles.assignCheck}>Already added</Text>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => {
                // Carry the recipe-being-assigned forward so the
                // post-create flow can auto-add it once the new folder
                // exists. Without this the user creates the folder and
                // the recipe they started with stays unfiled.
                if (assigning) setPendingAssignAfterCreate(assigning);
                setAssigning(null);
                setNewFolderOpen(true);
              }}
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
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  // Inline "+ New folder" call-to-action in the header — treated as a button.
  addFolderHeader: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.5 },
  // Folders section — horizontal carousel of folder chips. The first
  // chip is a segmented All / Favourites toggle; user folders trail to
  // the right. Long-press a user folder to rename or delete.
  foldersSection: { paddingTop: spacing.md, paddingBottom: spacing.xs },
  foldersHeading: { fontFamily: fonts.headingBold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2, paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  folderCarousel: { paddingHorizontal: spacing.xl, paddingVertical: spacing.xs, gap: spacing.sm },
  segmentedChip: { flexDirection: 'row', borderWidth: 1, borderColor: colors.gold, borderRadius: 14, overflow: 'hidden' },
  segmentedChipActive: { backgroundColor: 'rgba(212,176,96,0.06)' },
  segmentedHalf: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, justifyContent: 'center' },
  segmentedHalfActive: { backgroundColor: 'rgba(212,176,96,0.18)' },
  segmentedHalfText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  segmentedHalfTextActive: { color: colors.gold },
  segmentedDivider: { width: 1, backgroundColor: colors.gold, opacity: 0.45 },
  folderChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, justifyContent: 'center', maxWidth: 220 },
  folderChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.18)' },
  folderChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, letterSpacing: 0.3 },
  folderChipTextActive: { color: colors.gold },
  folderHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center', paddingTop: spacing.xs, paddingHorizontal: spacing.xl },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border, marginTop: spacing.xs },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xs },
  typePill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 10, borderWidth: 1 },
  typePillRecipe: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  typePillPairing: { borderColor: colors.borderLight, backgroundColor: 'rgba(255,255,255,0.06)' },
  // Small "RECIPE" / "PAIRING" type pill on each card — treat as a meta/badge label.
  typePillText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.text, textTransform: 'uppercase', letterSpacing: 0.6 },
  cardDate: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  starBtn: { padding: 4 },
  starText: { fontSize: 22, color: colors.textMuted },
  starTextActive: { color: colors.gold },
  cardTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.text },
  cardSubtitle: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 20 },
  folderBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.xs },
  folderBadge: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: 'rgba(212,176,96,0.10)' },
  folderBadgeText: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold },
  cardActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  assignLink: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold },
  viewBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 6 },
  viewBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  modalConfirm: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  modalConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  modalDanger: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  modalDangerText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  modalCancel: { alignItems: 'center', paddingTop: spacing.sm },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // "+ New folder" inline link inside the assign modal — treat as a button.
  modalNewFolderText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  assignEmpty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  assignRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  assignRowActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  // Folder option row inside the assign modal — treat as modal/dropdown entry.
  assignRowText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  assignRowTextActive: { color: colors.gold },
  assignCheck: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, letterSpacing: 0.3 },
});
