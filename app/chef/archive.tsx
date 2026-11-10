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
import { setChefLabelSessionImage, renameChefLabelSession } from '../../src/api/chef';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useLabels } from '../../src/hooks/useLabels';
import { sameWineIdentity } from '../../src/utils/wineMatch';
import { wineNameKey } from '../../src/utils/wineIdentity';
import { LabelThumb } from '../../src/components/LabelThumb';
import { WineCardThumb } from '../../src/components/WineCardThumb';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { uploadCookbookPhoto } from '../../src/api/labelPhotos';
import type { ChefArchiveCollection } from '../../src/api/chefArchiveCollections';

const FILTER_ALL = 'ALL';
const FILTER_FAVOURITES = 'FAVOURITES';

type UnifiedItem = { type: 'label'; key: string; saved_at: string; is_starred: boolean; session: ChefLabelSession };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChefArchiveScreen() {
  const { filter: initialFilter, addFolder } = useLocalSearchParams<{ filter?: string; addFolder?: string }>();
  const { session } = useAuth();
  const { sessions: labelSessions, isLoading: labelLoading, remove: removeLabel } = useChefLabelHistory();
  // Recipe tile backgrounds: the recipe's chosen image, else the user's own
  // photo of the wine (cellar, archive or a label scan), else its label online.
  const qcRecipe = useQueryClient();
  const { wines: cellarWines } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { labels } = useLabels();
  const photoRows = useMemo(() => [
    ...[...cellarWines, ...archivedWines].filter((w) => w.label_image_path).map((w) => ({ producer: w.producer, wine_name: w.wine_name, path: w.label_image_path as string })),
    ...(labels as any[]).filter((l) => l.label_image_path).map((l) => ({ producer: l.producer, wine_name: l.wine_name, path: l.label_image_path as string })),
  ], [cellarWines, archivedWines, labels]);
  const photoByKey = useMemo(() => {
    const m = new Map<string, string>();
    for (const r of photoRows) { const k = wineNameKey(r.producer, r.wine_name); if (k && !m.has(k)) m.set(k, r.path); }
    return m;
  }, [photoRows]);
  // Fuzzy matches cached per recipe wine so the list doesn't rescan the cellar each render.
  const fuzzyCache = useMemo(() => new Map<string, string | null>(), [photoRows]);
  function winePhotoFor(w: { producer?: string | null; wineName?: string | null }): string | null {
    const key = wineNameKey(w.producer ?? null, w.wineName ?? null);
    const exact = photoByKey.get(key);
    if (exact) return exact;
    if (fuzzyCache.has(key)) return fuzzyCache.get(key) ?? null;
    const hit = photoRows.find((r) => sameWineIdentity(
      { producer: r.producer, wine_name: r.wine_name, vintage: null },
      { producer: w.producer ?? null, wine_name: w.wineName ?? null, vintage: null },
    ));
    fuzzyCache.set(key, hit?.path ?? null);
    return hit?.path ?? null;
  }
  // "Update image" on a recipe tile.
  function openRecipeImageMenu(item: UnifiedItem) {
    const id = item.session.id;
    const custom = !!(item.session as ChefLabelSession).image_path;
    showAlert({
      title: 'Update image',
      buttons: [
        { text: 'Take a Photo', onPress: () => setTimeout(() => void pickRecipeImage(id, 'camera'), 350) },
        { text: 'Upload a Photo', onPress: () => setTimeout(() => void pickRecipeImage(id, 'library'), 350) },
        { text: 'Find a Photo Online', onPress: () => router.push(`/chef/find-folder-photo?recipeId=${id}&name=${encodeURIComponent(itemRecipeName(item))}` as any) },
        ...(custom ? [{ text: "Use the Wine's Label", onPress: () => void saveRecipeImage(id, null) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  async function pickRecipeImage(id: string, source: 'camera' | 'library') {
    try {
      if (!session?.user.id) return;
      if (!(await ensureMediaPermission(source))) return;
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      const path = await uploadCookbookPhoto(session.user.id, res.assets[0].uri, `recipe-${id}`);
      await saveRecipeImage(id, path);
    } catch (err) {
      showAlert({ title: 'Could not add that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  async function saveRecipeImage(id: string, path: string | null) {
    try {
      await setChefLabelSessionImage(id, path);
      qcRecipe.invalidateQueries({ queryKey: ['chef-label-sessions'] });
    } catch (err) {
      showAlert({ title: 'Could not update the image', body: err instanceof Error ? /column|image_path/i.test(err.message) ? 'Recipe images need a quick database update first.' : err.message : 'Please try again.' });
    }
  }
  const { collections, membershipMap, create, rename, remove, addItem, removeItem, toggleStar } = useChefArchiveCollections();

  // A `filter` param arriving from the Pair-tab Cookbook carousel is either
  // 'favourites', a folder id, or nothing (→ All).
  const [filter, setFilter] = useState<string>(
    initialFilter === 'favourites' ? FILTER_FAVOURITES
      : initialFilter && initialFilter !== 'all' && initialFilter !== FILTER_ALL ? initialFilter
      : FILTER_ALL,
  );
  // ?addFolder=1 (the carousel's "+ Add folder") opens the create sheet on arrival.
  const [newFolderOpen, setNewFolderOpen] = useState(addFolder === '1');
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
  // Edit Recipe → Rename.
  const [renamingRecipe, setRenamingRecipe] = useState<UnifiedItem | null>(null);
  const [recipeNameDraft, setRecipeNameDraft] = useState('');
  async function saveRecipeName() {
    const item = renamingRecipe;
    const name = recipeNameDraft.trim();
    if (!item || !name) return;
    try {
      await renameChefLabelSession(item.session.id, item.session.pairings, name);
      qcRecipe.invalidateQueries({ queryKey: ['chef-label-sessions'] });
      setRenamingRecipe(null);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
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

  // Search the (folder-filtered) recipes by key ingredient, dish name, or the wine
  // they were paired with.
  const [recipeSearch, setRecipeSearch] = useState('');
  const searchedItems = useMemo(() => {
    const q = recipeSearch.trim().toLowerCase();
    if (!q) return filteredItems;
    return filteredItems.filter((item) => {
      const p = item.session.pairings?.[0];
      const dish = (p?.dishName ?? '').toLowerCase();
      const ings = (p?.recipe?.ingredients ?? []).join(' ').toLowerCase();
      const w = item.session.wine;
      const wine = [w?.producer, w?.wineName].filter(Boolean).join(' ').toLowerCase();
      return dish.includes(q) || ings.includes(q) || wine.includes(q);
    });
  }, [recipeSearch, filteredItems]);

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
      title: 'Edit Recipe',
      body: itemRecipeName(item),
      buttons: [
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
        { text: 'Rename', onPress: () => { setRenamingRecipe(item); setRecipeNameDraft(itemRecipeName(item)); } },
        // AppAlert fires as it dismisses; open the next menu after it closes.
        { text: 'Update Image', onPress: () => setTimeout(() => openRecipeImageMenu(item), 350) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function handleViewItem(item: UnifiedItem) {
    const s = item.session;
    // Straight to the full recipe card — it reads the saved session by id from
    // the same chef-label history, so no need to route via the results list.
    router.push(`/chef/recipe-full?sessionId=${encodeURIComponent(s.id)}` as any);
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

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Your Cookbook</Text>

      {/* Filter/stats bar — mirrors the Full Cellar List: instruction hint,
          stats, then the folder carousel (All, your folders, + Add folder). */}
      {session && (
        <>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {allItems.length} {allItems.length === 1 ? 'Recipe' : 'Recipes'} · {collections.length} {collections.length === 1 ? 'Folder' : 'Folders'}
            </Text>
          </View>
          <Text style={styles.filterHint}>Listed by Recently Added · Swipe to see all folders →</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.folderCarousel}
          >
            <TouchableOpacity
              style={[styles.folderChip, filter === FILTER_ALL && styles.folderChipActive]}
              onPress={() => setFilter(FILTER_ALL)}
              activeOpacity={0.7}
            >
              <Text style={[styles.folderChipText, filter === FILTER_ALL && styles.folderChipTextActive]} numberOfLines={1}>All ({allItems.length})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.folderChip, filter === FILTER_FAVOURITES && styles.folderChipActive]}
              onPress={() => setFilter(FILTER_FAVOURITES)}
              activeOpacity={0.7}
            >
              <Text style={[styles.folderChipText, filter === FILTER_FAVOURITES && styles.folderChipTextActive]} numberOfLines={1}>★ Favourites ({favouritesCount})</Text>
            </TouchableOpacity>
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
            <TouchableOpacity style={styles.folderChipAdd} onPress={() => setNewFolderOpen(true)} activeOpacity={0.7}>
              <Text style={styles.folderChipAddText}>+ Add folder</Text>
            </TouchableOpacity>
          </ScrollView>
          <TextInput
            style={styles.recipeSearch}
            value={recipeSearch}
            onChangeText={setRecipeSearch}
            placeholder="Search recipes by ingredient or wine"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </>
      )}

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Save your recipes and wine pairings to your account — sign in to keep them."
        />
      ) : isLoading ? (
        <View style={styles.empty}><ActivityIndicator size="large" color={colors.gold} /></View>
      ) : searchedItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{recipeSearch.trim() ? 'No matches' : (filter === FILTER_ALL ? 'Your Cookbook is Empty' : 'Nothing here')}</Text>
          <Text style={styles.emptyBody}>
            {recipeSearch.trim()
              ? `No recipes match "${recipeSearch.trim()}". Try an ingredient or a wine name.`
              : filter === FILTER_ALL
                ? 'Generate recipes to pair with your wines through Chef and save them here for future reference and share them with friends.'
                : filter === FILTER_FAVOURITES
                  ? 'Tap the ★ on any recipe card to add it to your Favourites.'
                  : 'No recipes in this folder yet. From the All tab, open any recipe and add it to a folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {searchedItems.map((item) => {
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
                {/* The recipe's image (or the wine's label) behind a dark fade. */}
                {(() => {
                  const w = item.session.wine;
                  const path = (item.session as ChefLabelSession).image_path || winePhotoFor(w);
                  return (
                    <View style={StyleSheet.absoluteFill} pointerEvents="none">
                      {path
                        ? <LabelThumb path={path} fallbackText="" style={styles.cardBgImage} radius={0} frame={0} />
                        : <WineCardThumb producer={w.producer} wineName={w.wineName} fallbackText="" style={styles.cardBgImage} />}
                      <View style={styles.cardBgFade} />
                    </View>
                  );
                })()}
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
                <TouchableOpacity onPress={() => openRecipeImageMenu(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={{ alignSelf: 'flex-start' }}>
                  <Text style={styles.assignLink}>Update image</Text>
                </TouchableOpacity>
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

      {/* Rename recipe */}
      <Modal visible={!!renamingRecipe} transparent animationType="fade" onRequestClose={() => setRenamingRecipe(null)}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRenamingRecipe(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Rename Recipe</Text>
            <TextInput
              style={styles.modalInput}
              value={recipeNameDraft}
              onChangeText={setRecipeNameDraft}
              placeholder="Recipe name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              maxLength={80}
              returnKeyType="done"
              onSubmitEditing={() => void saveRecipeName()}
            />
            <TouchableOpacity style={[styles.modalConfirm, !recipeNameDraft.trim() && { opacity: 0.5 }]} onPress={() => void saveRecipeName()} disabled={!recipeNameDraft.trim()}>
              <Text style={styles.modalConfirmText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setRenamingRecipe(null)}>
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
  // Header — Back on its own row, then the title on a centred line with a
  // bottom rule, mirroring the Full Cellar List.
  headerRow: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 2, flexDirection: 'row', alignItems: 'flex-start' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Filter/stats bar — copied from the Full Cellar List so the two read alike.
  listHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center' },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  recipeSearch: { marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 15 },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  folderCarousel: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  // Folder chips — same pill shape as the Cellar List's custom-filter chips.
  folderChip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm, maxWidth: 200 },
  folderChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  folderChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, letterSpacing: 0.3 },
  folderChipTextActive: { color: colors.gold },
  folderChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm },
  folderChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  // Brown bubble to match the wine + restaurant review cards (colors.surface).
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs, backgroundColor: colors.surface, overflow: 'hidden' },
  cardBgImage: { width: '100%', height: '100%' },
  // Darker fade so the recipe text stays readable over the label.
  cardBgFade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(18,11,10,0.72)' },
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
