import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router } from 'expo-router';
import { useChosenRecipes } from '../../src/hooks/useChosenRecipes';
import { useRecipeCollections } from '../../src/hooks/useRecipeCollections';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { colors, spacing } from '../../src/constants/theme';
import type { ChosenRecipe } from '../../src/api/chosenRecipes';
import type { RecipeCollection } from '../../src/api/recipeCollections';

const FILTER_ALL = 'ALL';
const FILTER_UNFILED = 'UNFILED';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ChosenRecipesScreen() {
  const { session } = useAuth();
  const { chosenRecipes, isLoading } = useChosenRecipes();
  const { collections, membershipMap, create, rename, remove, addItem, removeItem } = useRecipeCollections();

  const [filter, setFilter] = useState<string>(FILTER_ALL);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [manageFolder, setManageFolder] = useState<RecipeCollection | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [assigningRecipe, setAssigningRecipe] = useState<ChosenRecipe | null>(null);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);

  const filteredRecipes = useMemo(() => {
    if (filter === FILTER_ALL) return chosenRecipes;
    if (filter === FILTER_UNFILED) {
      return chosenRecipes.filter((r) => !membershipMap.has(r.id) || membershipMap.get(r.id)!.size === 0);
    }
    return chosenRecipes.filter((r) => membershipMap.get(r.id)?.has(filter));
  }, [filter, chosenRecipes, membershipMap]);

  function gatedAction(action: () => void) {
    if (!session) {
      setSignInPromptVisible(true);
      return;
    }
    action();
  }

  function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    create.mutate(name, {
      onSuccess: () => {
        setNewFolderName('');
        setNewFolderOpen(false);
      },
      onError: (err) => showAlert({ title: 'Could not create', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function handleRenameFolder() {
    if (!manageFolder) return;
    const name = renameDraft.trim();
    if (!name || name === manageFolder.name) {
      setManageFolder(null);
      return;
    }
    rename.mutate({ id: manageFolder.id, name }, {
      onSuccess: () => setManageFolder(null),
      onError: (err) => showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function handleDeleteFolder() {
    if (!manageFolder) return;
    const f = manageFolder;
    setManageFolder(null);
    if (filter === f.id) setFilter(FILTER_ALL);
    remove.mutate(f.id, {
      onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
    });
  }

  function toggleAssign(collectionId: string) {
    if (!assigningRecipe) return;
    const recipeId = assigningRecipe.id;
    const inFolder = membershipMap.get(recipeId)?.has(collectionId);
    if (inFolder) {
      removeItem.mutate({ collectionId, recipeId });
    } else {
      addItem.mutate({ collectionId, recipeId });
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Recipe Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Folder strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.folderStrip}>
        <FolderChip
          label="All"
          count={chosenRecipes.length}
          active={filter === FILTER_ALL}
          onPress={() => setFilter(FILTER_ALL)}
        />
        <FolderChip
          label="Unfiled"
          count={chosenRecipes.filter((r) => !membershipMap.get(r.id)?.size).length}
          active={filter === FILTER_UNFILED}
          onPress={() => setFilter(FILTER_UNFILED)}
        />
        {collections.map((c) => (
          <FolderChip
            key={c.id}
            label={c.name}
            count={c.recipe_count}
            active={filter === c.id}
            onPress={() => setFilter(c.id)}
            onLongPress={() => { setManageFolder(c); setRenameDraft(c.name); }}
          />
        ))}
        <TouchableOpacity style={styles.newFolderChip} onPress={() => gatedAction(() => setNewFolderOpen(true))}>
          <Text style={styles.newFolderChipText}>+ New folder</Text>
        </TouchableOpacity>
      </ScrollView>

      {!session ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to view your reviews</Text>
          <Text style={styles.emptyBody}>Your recipe reviews and folders are saved to your account.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.signInBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? null : filteredRecipes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{filter === FILTER_ALL ? 'Nothing here yet' : 'Nothing here'}</Text>
          <Text style={styles.emptyBody}>
            {filter === FILTER_ALL
              ? 'When you cook from a Vinster chef pairing, tap "Review Recipe" to record it here — with your cooking notes, score, and where you cooked it.'
              : 'No recipes in this folder yet. Tap a recipe below "All" and add it to a folder.'}
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {filteredRecipes.map((r) => {
            const winePairing = r.wine_pairing;
            const wineLine = winePairing
              ? [winePairing.producer, winePairing.wineName, winePairing.vintage].filter(Boolean).join(' · ')
              : null;
            const locationLine = [r.cooked_at_location, r.city].filter(Boolean).join(' · ');
            const memberCollectionIds = Array.from(membershipMap.get(r.id) ?? []);
            const memberFolderNames = memberCollectionIds
              .map((id) => collections.find((c) => c.id === id)?.name)
              .filter(Boolean) as string[];
            return (
              <View key={r.id} style={styles.card}>
                <Text style={styles.cardDate}>{formatDate(r.chosen_at)}</Text>
                <Text style={styles.cardDish}>{r.dish_name}</Text>
                {r.chef_inspiration ? (
                  <Text style={styles.cardChef}>Inspired by {r.chef_inspiration}</Text>
                ) : null}
                {wineLine ? (
                  <Text style={styles.cardWine}>Paired with {wineLine}</Text>
                ) : null}
                {locationLine ? (
                  <Text style={styles.cardLocation}>{locationLine}</Text>
                ) : null}
                {r.user_score != null ? (
                  <Text style={styles.cardScore}>Your score: {r.user_score}/100</Text>
                ) : null}
                {r.cooking_note ? (
                  <Text style={styles.cardNote}>{r.cooking_note}</Text>
                ) : null}
                {r.other_observations ? (
                  <Text style={styles.cardNote}>{r.other_observations}</Text>
                ) : null}

                <View style={styles.cardFooter}>
                  <View style={styles.folderBadgeRow}>
                    {memberFolderNames.map((name) => (
                      <View key={name} style={styles.folderBadge}>
                        <Text style={styles.folderBadgeText}>{name}</Text>
                      </View>
                    ))}
                  </View>
                  <TouchableOpacity onPress={() => gatedAction(() => setAssigningRecipe(r))}>
                    <Text style={styles.assignLink}>{memberFolderNames.length ? 'Edit folders' : 'Add to folder'}</Text>
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
            <Text style={styles.modalBody}>Name your folder — for example "Favourites", "Fish Recipes", "Kid Friendly".</Text>
            <TextInput
              style={styles.modalInput}
              value={newFolderName}
              onChangeText={setNewFolderName}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleCreateFolder}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleCreateFolder}>
              <Text style={styles.modalButtonText}>{create.isPending ? 'Creating…' : 'Create folder'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setNewFolderOpen(false); setNewFolderName(''); }} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Manage folder (rename / delete) */}
      <Modal visible={manageFolder !== null} transparent animationType="fade" onRequestClose={() => setManageFolder(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setManageFolder(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Manage folder</Text>
            <TextInput
              style={styles.modalInput}
              value={renameDraft}
              onChangeText={setRenameDraft}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleRenameFolder}>
              <Text style={styles.modalButtonText}>Save name</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.modalButtonDanger, { marginTop: spacing.sm }]} onPress={handleDeleteFolder}>
              <Text style={[styles.modalButtonText, styles.modalButtonTextDanger]}>Delete folder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setManageFolder(null)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Assign-to-folder modal */}
      <Modal visible={assigningRecipe !== null} transparent animationType="fade" onRequestClose={() => setAssigningRecipe(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAssigningRecipe(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to folder</Text>
            <Text style={styles.modalBody} numberOfLines={2}>{assigningRecipe?.dish_name}</Text>

            <ScrollView style={{ maxHeight: 320 }}>
              {collections.length === 0 ? (
                <Text style={styles.assignEmpty}>You don't have any folders yet. Create one first.</Text>
              ) : collections.map((c) => {
                const inFolder = !!(assigningRecipe && membershipMap.get(assigningRecipe.id)?.has(c.id));
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.assignOption, inFolder && styles.assignOptionActive]}
                    onPress={() => toggleAssign(c.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.assignOptionText, inFolder && styles.assignOptionTextActive]}>{c.name}</Text>
                    {inFolder && <Text style={styles.assignCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAssigningRecipe(null); setNewFolderOpen(true); }}
            >
              <Text style={styles.modalButtonText}>+ Create new folder</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAssigningRecipe(null)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Done</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => setSignInPromptVisible(false)}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => setSignInPromptVisible(false)}
      />
    </View>
  );
}

function FolderChip({ label, count, active, onPress, onLongPress }: { label: string; count: number; active: boolean; onPress: () => void; onLongPress?: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.folderChip, active && styles.folderChipActive]}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.folderChipLabel, active && styles.folderChipLabelActive]}>{label}</Text>
      <Text style={[styles.folderChipCount, active && styles.folderChipCountActive]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  folderStrip: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.xs, alignItems: 'center' },
  folderChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.xs },
  folderChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  folderChipLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.text },
  folderChipLabelActive: { color: colors.gold },
  folderChipCount: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 12, color: colors.textMuted },
  folderChipCountActive: { color: colors.gold },
  newFolderChip: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.borderLight, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.xs },
  newFolderChipText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  signInBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  signInBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.lg, gap: spacing.xs },
  cardDate: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, textAlign: 'center' },
  cardDish: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardChef: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  cardWine: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text },
  cardLocation: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  cardScore: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.xs },
  cardNote: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20, marginTop: spacing.xs },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm },
  folderBadgeRow: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  folderBadge: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: 2, backgroundColor: 'rgba(212,176,96,0.10)' },
  folderBadgeText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.gold },
  assignLink: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: '#FFFFFF', textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonDanger: { borderColor: colors.error },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  modalButtonTextDanger: { color: colors.error },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  assignOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  assignOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  assignOptionText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  assignOptionTextActive: { color: colors.gold },
  assignCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  assignEmpty: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.xl },
});
