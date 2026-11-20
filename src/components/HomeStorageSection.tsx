import { useState } from 'react';
import { ReorderableRow, type ReorderableTile } from './ReorderableRow';
import { useStorageOrder, storageKey } from '../hooks/useStorageOrder';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput, Image } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../hooks/useRacks';
import { useAuth } from '../hooks/useAuth';
import { useCellarContext } from '../hooks/useCellarContext';
import { invalidateCellarViews } from '../hooks/useCellar';
import { useRackStore } from '../stores/rackStore';
import { VIEW_ONLY_MESSAGE } from '../api/cellarContext';
import { getRackBottleCounts } from '../api/racks';
import { summariseRackContents, deleteRackWithContents } from '../services/rackContents';
import { getBins, getBinBottleCounts, deleteBin } from '../api/bins';
import { fetchStorageLocations, fetchLocationBottleCounts, renameStorageLocation } from '../api/storageLocations';
import { deleteLocationKeepWines, fetchLatestLocationThumbs, type LocationCollageItem } from '../api/placements';
import { summariseBinContents, deleteBinWithContents, type UnitContents } from '../services/storageContents';
import { confirmDeleteAltCellar } from './altCellar/confirmDeleteAltCellar';
import { WineCardThumb } from './WineCardThumb';
import { LabelThumb } from './LabelThumb';
import { placeholderLabelImages } from './ExamplePlaceholder';
import { showAlert } from './AppAlert';
import { HOME_TILE, colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { fontsSpectral } from '../constants/fonts';
import type { WineRack } from '../types/wine';

// Same small tile as every carousel in the app (HOME_TILE).
const TILE_W = HOME_TILE.w;
const TILE_H = HOME_TILE.h;

function bottleLabel(n: number) {
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

// The "Delete … & Contents" confirmation text for a rack, fridge or bin: what
// goes, and the reviews on wines kept nowhere else.
function contentsBody({ bottles, wines, reviewsLost }: UnitContents): string {
  const reviewLine = reviewsLost === 0 ? '' : reviewsLost === 1 ? ' Your review of one of them will be deleted too.' : ` Your ${reviewsLost} reviews of them will be deleted too.`;
  return `${bottles} ${bottles === 1 ? 'bottle' : 'bottles'} (${wines} ${wines === 1 ? 'wine' : 'wines'}) will be permanently removed from your cellar.${reviewLine} Bottles of these wines stored elsewhere stay. This can't be undone.`;
}

// A storage tile's backdrop: a collage of up to four wines held there (label
// photo, or a web-found label for a wine without one). An empty location shows
// the bundled example labels until bottles are added.
function CollageItemView({ item, w, h }: { item: LocationCollageItem; w: number; h: number }) {
  const st = { width: w, height: h };
  if (typeof item === 'string') return <LabelThumb path={item} style={st} radius={0} frame={0} />;
  return <View style={[st, { overflow: 'hidden' }]}><WineCardThumb producer={item.producer} wineName={item.wineName} fallbackText={item.wineName ?? item.producer ?? ''} style={st} /></View>;
}
function WinesCollage({ items, offset }: { items?: LocationCollageItem[]; offset: number }) {
  const p = (items ?? []).slice(0, 4);
  if (!p.length) return <CollageBg offset={offset} />;
  const W = TILE_W - 2, H = TILE_H - 2;
  return (
    <View style={styles.collageWrap} pointerEvents="none">
      {p.length === 1 ? <CollageItemView item={p[0]} w={W} h={H} />
        : p.length === 2 ? <><CollageItemView item={p[0]} w={W / 2} h={H} /><CollageItemView item={p[1]} w={W / 2} h={H} /></>
        : p.length === 3 ? (
          <>
            <CollageItemView item={p[0]} w={W / 2} h={H} />
            <View><CollageItemView item={p[1]} w={W / 2} h={H / 2} /><CollageItemView item={p[2]} w={W / 2} h={H / 2} /></View>
          </>
        ) : (
          <View style={{ width: W, height: H, flexDirection: 'row', flexWrap: 'wrap' }}>
            {p.map((it, i) => <CollageItemView key={i} item={it} w={W / 2} h={H / 2} />)}
          </View>
        )}
    </View>
  );
}

// One home-storage tile: the photo bright, then the location name (white) and
// type · bottle count (gold) beneath the tile.
function StorageTile({ bg, name, meta, onPress, onLongPress }: { bg: React.ReactNode; name: string; meta: string; onPress: () => void; onLongPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.tileWrap} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.85}>
      <View style={styles.storageCard}>
        {bg}
      </View>
      {/* Name in white, then type · count in gold, beneath the tile. */}
      <Text style={styles.storageCardName} numberOfLines={1} allowFontScaling={false}>{name}</Text>
      <Text style={styles.tileMeta} numberOfLines={1} allowFontScaling={false}>{meta}</Text>
    </TouchableOpacity>
  );
}

// Setup-template backdrop: a faded 2×2 collage of the bundled placeholder
// labels under the same scrim as a real tile, so an empty carousel never reads
// as plain brown boxes. `offset` gives each template a different set.
function CollageBg({ offset }: { offset: number }) {
  return (
    <>
      <View style={styles.collage} pointerEvents="none">
        {placeholderLabelImages(offset, 4).map((img, i) => (
          <Image key={i} source={img} style={styles.collageCell} resizeMode="cover" />
        ))}
      </View>
    </>
  );
}

// The three empty-state templates shown when a user has no storage yet (every
// empty carousel shows exactly three), then the "+ Add" tile (rendered
// separately), which also offers Alt Cellars. Tapping a template starts that
// type's add flow, where the user names it.
const TEMPLATES: { type: string; name: string; kind: 'rack' | 'fridge' | 'bin' }[] = [
  { type: 'Rack', name: 'Wine Rack', kind: 'rack' },
  { type: 'Fridge', name: 'Wine Fridge', kind: 'fridge' },
  { type: 'Bin', name: 'Wine Bin', kind: 'bin' },
];

// Shown after deleting a location but KEEPING its bottles (the plain "Delete X",
// not "& Contents"): the wines stay in the full cellar list, just unplaced.
function contentsKeptNotice() {
  showAlert({
    title: 'Location deleted',
    body: 'The contents of this location remain in your full cellar list, but are now unplaced in home storage.',
  });
}

// "Your Wines At Home" — the home-storage section embedded in the Cellar tab
// (replaces the standalone Home Wine Storage page). One unified carousel across
// racks, fridges, bins and Alt Cellars; when empty it shows setup templates.
export function HomeStorageSection({ requireAuth }: { requireAuth: (action: () => void) => void }) {
  const { session } = useAuth();
  const { racks, isLoading, isError, remove: removeRack } = useRacks();
  const qc = useQueryClient();
  const { setPendingStorageType, reset: resetRackStore, setPendingWineId, setPendingAddMode } = useRackStore();
  const userId = session?.user.id;
  // View-only members of a shared cellar can browse its storage but not add,
  // rename or delete any of it.
  const canEdit = useCellarContext().role !== 'view';
  const requireEditor = (action: () => void) => requireAuth(() => (
    canEdit ? action() : showAlert({ title: 'View only', body: VIEW_ONLY_MESSAGE })
  ));

  // Rename an Alt Cellar from its carousel long-press (showAlert has no input,
  // so the rename lives in its own small modal).
  const [renameLoc, setRenameLoc] = useState<{ id: string; name: string } | null>(null);
  const [renameVal, setRenameVal] = useState('');
  const [renaming, setRenaming] = useState(false);
  async function saveRename() {
    if (!renameLoc || !renameVal.trim() || renaming) return;
    setRenaming(true);
    try {
      await renameStorageLocation(renameLoc.id, renameVal.trim());
      invalidateCellarViews(qc);
      setRenameLoc(null);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally { setRenaming(false); }
  }

  const { data: storageLocations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const { data: bins = [] } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const binIds = bins.map((b) => b.id);
  const { data: binCounts = {} } = useQuery({
    queryKey: ['bins', 'counts', binIds],
    queryFn: () => getBinBottleCounts(binIds),
    enabled: binIds.length > 0,
  });
  const rackIds = racks.map((r) => r.id);
  const { data: rackCounts = {} } = useQuery({
    queryKey: ['slot-assignments', 'counts', rackIds],
    queryFn: () => getRackBottleCounts(rackIds),
    enabled: rackIds.length > 0,
  });

  // Home storage only — external cellars (imports filed offsite) never appear
  // here or count toward the home totals; they live in the Full Cellar List's
  // "Stored Externally" grouping, not "Your Wines At Home".
  const homeLocations = storageLocations.filter((l) => !l.is_external);
  const homeLocationIds = homeLocations.map((l) => l.id);
  const { data: locationCounts = {} } = useQuery({
    queryKey: ['storage-locations', 'counts', homeLocationIds],
    queryFn: () => fetchLocationBottleCounts(homeLocationIds),
    enabled: homeLocationIds.length > 0,
  });
  const sum = (counts: Record<string, number>) => Object.values(counts).reduce((n, c) => n + c, 0);
  const totalBottles = sum(rackCounts) + sum(binCounts) + sum(locationCounts);

  // Up to four wines per unit for the tile collages. Keyed on the bottle total
  // too, so screens that only refresh the cellar still update the tiles.
  const { data: tileThumbs } = useQuery({
    queryKey: ['home-storage-thumbs', rackIds, binIds, homeLocationIds, totalBottles],
    queryFn: () => fetchLatestLocationThumbs({ rackIds, binIds, locationIds: homeLocationIds }),
    enabled: !!userId,
  });
  const totalLocations = racks.length + bins.length + homeLocations.length;
  const hasStorage = totalLocations > 0;

  // ---- Add flows -------------------------------------------------------------
  function clearStalePendingWine() {
    setPendingWineId(null);
    setPendingAddMode(false);
  }
  function addRackOrFridge(type: 'rack' | 'fridge') {
    clearStalePendingWine();
    resetRackStore();
    setPendingStorageType(type);
    router.push('/cellar/rack/new');
  }
  function addByKind(kind: 'rack' | 'fridge' | 'bin' | 'location') {
    if (kind === 'rack' || kind === 'fridge') return addRackOrFridge(kind);
    if (kind === 'bin') return router.push('/cellar/bin/new');
    return router.push('/cellar/storage-location/new');
  }
  // Top-level + carousel "+ Add" — offers every storage kind in one prompt.
  function handleAddAnyStorage() {
    showAlert({
      title: 'Add storage',
      body: 'Which type of home storage would you like to add?',
      buttons: [
        { text: 'Add a Wine Rack', onPress: () => addRackOrFridge('rack') },
        { text: 'Add a Wine Fridge', onPress: () => addRackOrFridge('fridge') },
        { text: 'Add a Wine Bin (diamond shaped)', onPress: () => router.push('/cellar/bin/new') },
        { text: 'Add an Alt Cellar', onPress: () => router.push('/cellar/storage-location/new') },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // ---- Long-press actions (editors only) -----------------------------------
  function handleLongPressRack(rack: WineRack) {
    const noun = rack.storage_type === 'fridge' ? 'Fridge' : 'Rack';
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: rack.name,
      buttons: [
        { text: `Delete ${noun}`, style: 'destructive', onPress: () => { removeRack.mutate(rack.id, { onError, onSuccess: contentsKeptNotice }); } },
        { text: `Delete ${noun} & Contents`, style: 'destructive', onPress: () => void confirmDeleteRackContents(rack, noun) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  // "Delete Rack & Contents": count what goes first — bottles, wines and the
  // reviews on wines kept nowhere else — and say so before anything is deleted.
  async function confirmDeleteRackContents(rack: WineRack, noun: string) {
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    const refresh = () => {
      qc.invalidateQueries({ queryKey: ['racks', userId] });
      invalidateCellarViews(qc);
    };
    try {
      const contents = await summariseRackContents(rack.id);
      if (contents.bottles === 0) {
        removeRack.mutate(rack.id, { onError });
        return;
      }
      showAlert({
        title: `Delete ${rack.name} & its contents?`,
        body: contentsBody(contents),
        buttons: [
          { text: `Delete ${noun} & Contents`, style: 'destructive', onPress: async () => {
              try { await deleteRackWithContents(rack.id, contents); }
              catch (err) { onError(err); }
              finally { refresh(); }
            } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
    } catch (err) {
      onError(err);
    }
  }
  function handleLongPressBin(bin: WineRack) {
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: bin.name,
      buttons: [
        { text: 'Delete Bin', style: 'destructive', onPress: async () => {
            try { await deleteBin(bin.id); contentsKeptNotice(); }
            catch (err) { onError(err); }
            finally { invalidateCellarViews(qc); }
          } },
        { text: 'Delete Bin & Contents', style: 'destructive', onPress: () => void confirmDeleteBinContents(bin) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  // "Delete Bin & Contents": the bottles in the bin (not the wines' whole
  // quantities), counted and confirmed like a rack's.
  async function confirmDeleteBinContents(bin: WineRack) {
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    const run = async (work: () => Promise<void>) => {
      try { await work(); }
      catch (err) { onError(err); }
      finally { invalidateCellarViews(qc); }
    };
    try {
      const contents = await summariseBinContents(bin.id);
      if (contents.bottles === 0) {
        await run(() => deleteBin(bin.id));
        return;
      }
      showAlert({
        title: `Delete ${bin.name} & its contents?`,
        body: contentsBody(contents),
        buttons: [
          { text: 'Delete Bin & Contents', style: 'destructive', onPress: () => void run(() => deleteBinWithContents(bin.id, contents)) },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
    } catch (err) {
      onError(err);
    }
  }
  function handleLongPressLocation(loc: { id: string; name: string }) {
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: loc.name,
      buttons: [
        { text: 'Rename Location', onPress: () => { setRenameLoc(loc); setRenameVal(loc.name); } },
        { text: 'Delete Alt Cellar', style: 'destructive', onPress: async () => {
            try { await deleteLocationKeepWines(loc.id); contentsKeptNotice(); }
            catch (err) { onError(err); }
            finally { invalidateCellarViews(qc); }
          } },
        { text: 'Delete Alt Cellar & Contents', style: 'destructive', onPress: () => void confirmDeleteAltCellar(loc, { qc }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Every home-storage tile in the user's saved order (racks, bins, then Alt
  // Cellars by default).
  const { sort: sortStorage, save: saveOrder } = useStorageOrder();
  const orderedTiles: ReorderableTile[] = sortStorage([
    ...racks.map((rack) => ({ key: storageKey('rack', rack.id), label: rack.name, node: (
                <StorageTile
                  bg={<WinesCollage items={tileThumbs?.rack[rack.id]} offset={0} />}
                  name={rack.name}
                  meta={`${rack.storage_type === 'fridge' ? 'Fridge' : 'Rack'} · ${bottleLabel(rackCounts[rack.id] ?? 0)}`}
                  onPress={() => router.push(`/cellar/rack/${rack.id}`)}
                  onLongPress={canEdit ? () => handleLongPressRack(rack) : undefined}
                />
    ) })),
    ...bins.map((bin) => ({ key: storageKey('bin', bin.id), label: bin.name, node: (
                <StorageTile
                  bg={<WinesCollage items={tileThumbs?.bin[bin.id]} offset={4} />}
                  name={bin.name}
                  meta={`Bin · ${bottleLabel(binCounts[bin.id] ?? 0)}`}
                  onPress={() => router.push(`/cellar/bin/${bin.id}`)}
                  onLongPress={canEdit ? () => handleLongPressBin(bin) : undefined}
                />
    ) })),
    ...homeLocations.map((loc) => ({ key: storageKey('location', loc.id), label: loc.name, node: (
                <StorageTile
                  bg={<WinesCollage items={tileThumbs?.location[loc.id]} offset={8} />}
                  name={loc.name}
                  meta={`Alt Cellar · ${bottleLabel(locationCounts[loc.id] ?? 0)}`}
                  onPress={() => router.push(`/cellar/storage-location/${loc.id}`)}
                  onLongPress={canEdit ? () => handleLongPressLocation(loc) : undefined}
                />
    ) })),
  ], (t) => t.key);

  return (
    <View>
      {/* Tap the title for the how-to; the sub-header stays short. */}
      <TouchableOpacity
        onPress={() => showAlert({ title: 'Your Wines At Home', body: 'Add a Fridge, Rack, Bin or Alternative location (In the shed, under the bed…) and populate it with thumbnails of your wines.' })}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityHint="Explains Your Wines At Home"
      >
        <Text style={styles.sectionHeader}>Your Wines At Home</Text>
      </TouchableOpacity>
      <Text style={styles.intro}>Replicate your home wine storage in Vinster.</Text>

      {hasStorage && (
        <>
          {/* Stats bar — green outline + light-green fill (matches the other
              inverted pages), not bracketing rules. */}
          <Text style={styles.stats}>
            {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalLocations} {totalLocations === 1 ? 'Location' : 'Locations'}
          </Text>
        </>
      )}

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>
      ) : session && isError ? (
        <Text style={styles.error}>Couldn't load your storage — pull to refresh. Your wines are safe.</Text>
      ) : (
        hasStorage ? (
          // Hold a tile's grip (top-right) and drag to reorder; saved per device.
          <ReorderableRow
            style={styles.carouselScroll}
            contentContainerStyle={styles.carousel}
            itemWidth={TILE_W}
            gap={spacing.sm}
            onReorder={saveOrder}
            items={orderedTiles}
            trailing={
          <TouchableOpacity style={styles.addTile} onPress={() => requireEditor(handleAddAnyStorage)} activeOpacity={0.85}>
            <Text style={styles.addTilePlus} allowFontScaling={false}>+ Add</Text>
          </TouchableOpacity>
            }
          />
        ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselScroll} contentContainerStyle={styles.carousel}>
          {
            // No storage yet — three setup templates the user can name.
            TEMPLATES.map((t, i) => (
              <View key={t.kind}>
                <StorageTile
                  bg={<CollageBg offset={i * 2} />}
                  name={t.name}
                  meta={`${t.type} · Tap to set up`}
                  onPress={() => requireEditor(() => addByKind(t.kind))}
                />
              </View>
            ))
          }
          <TouchableOpacity style={styles.addTile} onPress={() => requireEditor(handleAddAnyStorage)} activeOpacity={0.85}>
            <Text style={styles.addTilePlus} allowFontScaling={false}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
        )
      )}

      <Modal visible={!!renameLoc} transparent animationType="fade" onRequestClose={() => setRenameLoc(null)}>
        <View style={styles.renameBackdrop}>
          <View style={styles.renameSheet}>
            <Text style={styles.renameTitle}>Rename Location</Text>
            <TextInput
              style={styles.renameInput}
              value={renameVal}
              onChangeText={setRenameVal}
              placeholder="e.g. The shed, Under the bed…"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.renameRow}>
              <TouchableOpacity style={styles.renameBtn} onPress={() => setRenameLoc(null)} activeOpacity={0.7}>
                <Text style={styles.renameBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.renameBtn, styles.renameBtnPrimary, (!renameVal.trim() || renaming) && styles.renameBtnDisabled]} onPress={saveRename} disabled={!renameVal.trim() || renaming} activeOpacity={0.85}>
                <Text style={[styles.renameBtnText, styles.renameBtnTextPrimary]}>{renaming ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches "Vinster's Review of You" on the Review tab.
  sectionHeader: { fontFamily: fontsSpectral.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Elegant Cormorant, matching the Cellar header/blurb above.
  intro: { fontSize: 17, fontFamily: fontsSpectral.headingRegular, color: colors.textMuted, lineHeight: 24, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  // Stats bar — green outline + light-green fill (matches the "upload instead"
  // banner and the other inverted pages).
  // Stats BAR — full-width green rule beneath only (no top rule).
  stats: { marginVertical: spacing.sm, paddingVertical: spacing.sm, fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },

  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  error: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  // The swipe hint sits directly above, so no extra top gap here.
  carouselScroll: { marginTop: 0 },
  // No bottom padding: the separator below sits 18pt under the last caption line.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Sage-green cards with a black outline; dark-green eyebrow + count, black name.
  tileWrap: { width: TILE_W },
  storageCard: { width: TILE_W, height: TILE_H, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite, overflow: 'hidden' },
  // Type · bottle count, gold, beneath the tile name.
  tileMeta: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 3 },
  collage: { position: 'absolute', left: 0, top: 0, width: TILE_W, height: TILE_H, flexDirection: 'row', flexWrap: 'wrap', opacity: 0.85 },
  collageWrap: { position: 'absolute', left: 0, top: 0, width: TILE_W - 2, height: TILE_H - 2, flexDirection: 'row', overflow: 'hidden' },
  collageCell: { width: TILE_W / 2, height: TILE_H / 2 },
  storageCardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  addTile: { width: TILE_W, height: TILE_H, borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  addTilePlus: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5 },
  // Rename-location modal.
  renameBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  renameSheet: { width: '100%', maxWidth: 400, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderWhite, padding: spacing.lg },
  renameTitle: { fontSize: 18, fontFamily: fontsSpectral.headingSemibold, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  renameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  renameRow: { flexDirection: 'row', gap: spacing.sm },
  renameBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  renameBtnPrimary: { borderColor: colors.gold },
  renameBtnDisabled: { opacity: 0.5 },
  renameBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  renameBtnTextPrimary: { color: colors.gold },
});
