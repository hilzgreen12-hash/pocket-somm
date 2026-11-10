import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FAVOURITES_ID, getFavouritesCover, setFavouritesCover } from '../api/cookbookFavouritesCover';
import { useChefArchiveCollections } from '../hooks/useChefArchiveCollections';
import { useAuth } from '../hooks/useAuth';
import { useLabelImageUrl } from '../hooks/useLabelImageUrl';
import { ReorderableRow } from './ReorderableRow';
import { showAlert } from './AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { uploadCookbookPhoto } from '../api/labelPhotos';
import { setChefCollectionImage, reorderChefCollections, type ChefArchiveCollection } from '../api/chefArchiveCollections';
import { useChefLabelHistory } from '../hooks/useChefHistory';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Your Cookbook, surfaced on the Pair tab: the archive page's header + stats bar
// are copied here verbatim, but the folders render as boxes (like the Cellar /
// Review carousels) rather than the chips used on the Cookbook page itself.
// Tapping any box drills into /chef/archive, where the format switches back to
// that page's own layout.
// Stand-in cover for Favourite Recipes until the user adds their own image
// (free Unsplash kitchen photo, bundled with the app).
const KITCHEN_IMG = require('../../assets/images/kitchen-favourites.jpg');

function recipeLabel(n: number): string {
  return `${n} ${n === 1 ? 'Recipe' : 'Recipes'}`;
}

// A folder's cover photo, faded under a scrim so the name stays readable.
function FolderBg({ path }: { path?: string | null }) {
  const uri = useLabelImageUrl(path ?? null);
  if (!uri) return null;
  return (
    <>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
    </>
  );
}

const TILE_W = HOME_TILE.w;

// "+ Add Image" under a tile's name (gold, not capitals) — opens Take / Upload.
// Reads "Change Image" once the tile has one.
function AddImageLink({ has, onPress }: { has: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} style={{ alignSelf: 'flex-start', marginTop: 4 }} accessibilityRole="button">
      <Text style={styles.addImage}>{has ? 'Change Image' : '+ Add Image'}</Text>
    </TouchableOpacity>
  );
}

export function CookbookFoldersCarousel() {
  const { collections, rename } = useChefArchiveCollections();
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const qc = useQueryClient();
  const [renaming, setRenaming] = useState<ChefArchiveCollection | null>(null);
  const [renameVal, setRenameVal] = useState('');
  // Favourites' cover lives on the device (it isn't a real folder).
  const { data: favCover = null } = useQuery({
    queryKey: ['cookbook-favourites-cover', userId],
    enabled: !!userId,
    queryFn: () => getFavouritesCover(userId),
  });
  const favouritesTile = { id: FAVOURITES_ID, name: 'Favourite Recipes', image_path: favCover } as unknown as ChefArchiveCollection;

  // Drag to reorder (hold a folder, then drag). Saved to the account.
  async function saveOrder(ids: string[]) {
    qc.setQueryData<ChefArchiveCollection[]>(['chef-archive-collections', userId], (old) =>
      old ? ids.map((id) => old.find((c) => c.id === id)).filter(Boolean) as ChefArchiveCollection[] : old);
    try { await reorderChefCollections(ids); }
    catch (err) { showAlert({ title: 'Could not save the order', body: err instanceof Error ? err.message : 'Please try again.' }); }
    qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] });
  }

  // Hold (without dragging) → Rename Folder / Add Image.
  function openFolderMenu(c: ChefArchiveCollection) {
    showAlert({
      title: c.name,
      buttons: [
        { text: 'Rename Folder', onPress: () => { setRenameVal(c.name); setRenaming(c); } },
        { text: c.image_path ? 'Change Image' : 'Add Image', onPress: () => setTimeout(() => openImageMenu(c), 350) },
        ...(c.image_path ? [{ text: 'Remove Image', style: 'destructive' as const, onPress: () => void setImage(c, null) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  function openImageMenu(c: ChefArchiveCollection) {
    showAlert({
      title: c.image_path ? 'Change Image' : 'Add Image',
      buttons: [
        // AppAlert fires as it dismisses; the picker can't open mid-dismiss on iOS.
        { text: 'Take a Photo', onPress: () => setTimeout(() => void pickImage(c, 'camera'), 350) },
        { text: 'Upload a Photo', onPress: () => setTimeout(() => void pickImage(c, 'library'), 350) },
        ...(c.image_path ? [{ text: 'Remove Image', style: 'destructive' as const, onPress: () => void setImage(c, null) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  async function pickImage(c: ChefArchiveCollection, source: 'camera' | 'library') {
    try {
      if (!userId) return;
      if (!(await ensureMediaPermission(source))) return;
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets[0]) return;
      const path = await uploadCookbookPhoto(userId, res.assets[0].uri, c.id);
      await setImage(c, path);
    } catch (err) {
      showAlert({ title: 'Could not add that photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function setImage(c: ChefArchiveCollection, path: string | null) {
    try {
      if (c.id === FAVOURITES_ID) {
        await setFavouritesCover(userId, path);
        qc.invalidateQueries({ queryKey: ['cookbook-favourites-cover', userId] });
        return;
      }
      await setChefCollectionImage(c.id, path);
      qc.invalidateQueries({ queryKey: ['chef-archive-collections', userId] });
    } catch (err) {
      showAlert({ title: 'Could not update the image', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function saveRename() {
    const c = renaming;
    const name = renameVal.trim();
    if (!c || !name) { setRenaming(null); return; }
    try { await rename.mutateAsync({ id: c.id, name }); setRenaming(null); }
    catch (err) { showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' }); }
  }

  const { sessions } = useChefLabelHistory();
  const recipeCount = sessions.length;
  const favouritesCount = sessions.filter((s) => !!s.is_starred).length;

  return (
    <View>
      {/* Header + stats bar — copied from the Your Cookbook landing page. The
          title is a white bubble that links into the cookbook — larger than the
          pairing bubbles above it (same 22px title font). */}
      <Text style={styles.cookbookTitle}>Your Cookbook</Text>
      <Text style={styles.blurb}>Recipes you generate can be saved and organised here. Create folders and record your pairing notes.</Text>
      <TouchableOpacity style={styles.summaryRow} onPress={() => router.push('/chef/archive' as any)} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.summaryText}>
          {recipeCount} {recipeCount === 1 ? 'Recipe' : 'Recipes'} · {collections.length} {collections.length === 1 ? 'Folder' : 'Folders'} · View All →
        </Text>
      </TouchableOpacity>
      <View style={styles.statsSep} />

      {/* Folders as boxes. Tap to open; hold for Rename / Add Image; hold and
          drag to reorder. Favourites stays first. */}
      <ReorderableRow
        contentContainerStyle={styles.carousel}
        itemWidth={TILE_W}
        gap={spacing.sm}
        holdToDrag
        onHold={(id) => { const c = collections.find((x) => x.id === id); if (c) openFolderMenu(c); }}
        onReorder={(ids) => void saveOrder(ids)}
        leading={
          <View style={styles.tileWrap}>
            <TouchableOpacity style={styles.card} onPress={() => router.push('/chef/archive?filter=favourites' as any)} activeOpacity={0.8}>
              {/* Kitchen photo always underneath, so the tile is never blank (a saved
                  cover that is missing or slow to load just leaves it showing). */}
              <Image source={KITCHEN_IMG} style={StyleSheet.absoluteFill} resizeMode="cover" />
              {favCover ? <FolderBg path={favCover} /> : null}
              <View style={styles.nameWrap} pointerEvents="none">
                <View style={styles.nameBand}><Text style={styles.cardName} numberOfLines={2}>★ Favourite Recipes</Text></View>
              </View>
            </TouchableOpacity>
            <Text style={styles.cardMeta} numberOfLines={1}>Cookbook · {recipeLabel(favouritesCount)}</Text>
            <AddImageLink has={!!favCover} onPress={() => openImageMenu(favouritesTile)} />
          </View>
        }
        items={collections.map((c) => ({
          key: c.id,
          label: c.name,
          // onLongPress no-op: a hold opens the folder menu (ReorderableRow), so
          // the release mustn't also open the folder.
          node: (
            <View style={styles.tileWrap}>
              <TouchableOpacity style={styles.card} onPress={() => router.push(`/chef/archive?filter=${c.id}` as any)} onLongPress={() => {}} delayLongPress={350} activeOpacity={0.8}>
                <FolderBg path={c.image_path} />
                <View style={styles.nameWrap} pointerEvents="none">
                  <View style={styles.nameBand}><Text style={styles.cardName} numberOfLines={2}>{c.name}</Text></View>
                </View>
              </TouchableOpacity>
              <Text style={styles.cardMeta} numberOfLines={1}>Your Folder · {recipeLabel(c.item_count)}</Text>
              <AddImageLink has={!!c.image_path} onPress={() => openImageMenu(c)} />
            </View>
          ),
        }))}
        trailing={
          <TouchableOpacity style={styles.cardAdd} onPress={() => router.push('/chef/archive?addFolder=1' as any)} activeOpacity={0.8}>
            <Text style={styles.cardAddText}>+ Add folder</Text>
          </TouchableOpacity>
        }
      />

      {/* Rename Folder */}
      <Modal visible={!!renaming} transparent animationType="fade" onRequestClose={() => setRenaming(null)}>
        <KeyboardAvoidingView style={styles.renameOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.renameSheet}>
            <Text style={styles.renameTitle}>Rename Folder</Text>
            <TextInput style={styles.renameInput} value={renameVal} onChangeText={setRenameVal} autoFocus maxLength={40} returnKeyType="done" onSubmitEditing={() => void saveRename()} placeholder="Folder name" placeholderTextColor={colors.textMuted} />
            <View style={styles.renameRow}>
              <TouchableOpacity style={styles.renameBtn} onPress={() => setRenaming(null)} activeOpacity={0.7}><Text style={styles.renameBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.renameBtn, styles.renameBtnPrimary, !renameVal.trim() && { opacity: 0.5 }]} onPress={() => void saveRename()} disabled={!renameVal.trim()} activeOpacity={0.85}><Text style={[styles.renameBtnText, { color: colors.gold }]}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <Text style={styles.filterHint}>Hold a folder to drag and reorder it</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header + stats — copied from app/chef/archive.tsx so the two read alike.
  // Title now sits in a white bubble (matching the pairing bubbles' white
  // border + radius, just larger given the 22px title font) instead of an
  // underlined link.
  // "Your Cookbook" plain title (terracotta), the blurb, then a "View Your
  // Cookbook →" link line, then the stats bar and carousel.
  cookbookTitle: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.sm },
  blurb: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.textMuted, lineHeight: 24, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  // The text sizes the wrap; the arrow is absolute (left: 100%) so it doesn't
  // count toward the centred width.
  viewLinkWrap: { alignItems: 'center', justifyContent: 'center' },
  viewLink: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  viewLinkArrow: { position: 'absolute', left: '100%', marginLeft: 6, fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.gold },
  // Stats bar — the "View Your Cookbook" link sits above the recipe · folder
  // count (mirrors Your Cellar Archive), between full-width gold rules.
  // No top rule; a single faded-yellow separator line below (not a boxed bar).
  summaryRow: { marginTop: spacing.sm, paddingVertical: spacing.xs, alignItems: 'center' },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  // Separator bar between the stats line and the folders carousel.
  // Spacing only — no full-width rule above the carousel.
  statsSep: { marginTop: spacing.sm, marginBottom: spacing.xs },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },

  // Same small tile as every carousel in the app (HOME_TILE).
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingVertical: spacing.md },
  // Sage-green cards with a black outline; dark-green eyebrow + count, black name.
  tileWrap: { width: HOME_TILE.w },
  card: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite, overflow: 'hidden' },
  // Folder name on its own dark band over a bright photo (as on Home's tiles).
  nameWrap: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  nameBand: { backgroundColor: colors.titleBand, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  // "Cookbook / Your Folder · X Recipes", white, beneath the tile.
  cardMeta: { fontSize: 12, fontFamily: fonts.bodySemibold, color: '#FFFFFF', marginTop: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  cardName: { fontSize: 19, fontFamily: fonts.headingSemibold, color: colors.gold, lineHeight: 24, textAlign: 'center' },
  addImage: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  cardAdd: { width: HOME_TILE.w, height: HOME_TILE.h, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardAddText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  renameOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  renameSheet: { width: '100%', maxWidth: 400, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg, gap: spacing.md },
  renameTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  renameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, backgroundColor: colors.surface },
  renameRow: { flexDirection: 'row', gap: spacing.sm },
  renameBtn: { flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  renameBtnPrimary: { borderColor: colors.gold },
  renameBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
});
