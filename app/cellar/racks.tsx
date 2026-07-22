import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { getRackBottleCounts } from '../../src/api/racks';
import { getBins, getBinBottleCounts } from '../../src/api/bins';
import { fetchStorageLocations } from '../../src/api/storageLocations';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineRack } from '../../src/types/wine';

function bottleLabel(n: number) {
  if (n === 0) return 'Empty';
  return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

// A compact carousel card for a rack/fridge. `count` is the number of occupied
// slots (one placed slot = one bottle). Tap → rack detail; long-press → the
// delete prompt.
function RackCard({ rack, count, onLongPress }: { rack: WineRack; count: number; onLongPress: () => void }) {
  const totalBottles = count;
  return (
    <TouchableOpacity
      style={styles.storageCard}
      onPress={() => router.push(`/cellar/rack/${rack.id}`)}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      <Text style={styles.storageCardType}>{rack.storage_type === 'fridge' ? 'Fridge' : 'Rack'}</Text>
      <Text style={styles.storageCardName} numberOfLines={2}>{rack.name}</Text>
      <Text style={styles.storageCardCount}>{bottleLabel(totalBottles)}</Text>
    </TouchableOpacity>
  );
}

export default function RacksScreen() {
  const { session } = useAuth();
  const { racks, isLoading, remove: removeRack } = useRacks();
  const { setPendingStorageType, reset: resetRackStore, setPendingWineId, setPendingAddMode } = useRackStore();
  const userId = session?.user.id;
  // Home storage locations (non-grid, photo-a-space) — shown in the Other Home
  // Storage Locations carousel.
  const { data: storageLocations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  // Bins (diamond, count-based) — top-level furniture shown in the same
  // "Racks, Fridges & Bins" carousel as racks/fridges.
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
  // null = chooser closed; 'rack' / 'fridge' = open, asking how to build
  // that storage type (photograph vs manual layout).
  const [chooser, setChooser] = useState<'rack' | 'fridge' | null>(null);

  function handleLongPressRack(rack: WineRack) {
    showAlert({
      title: rack.name,
      body: `Permanently remove this ${rack.storage_type === 'fridge' ? 'fridge' : 'rack'}? Wines stay in your cellar — they're just no longer mapped to it.`,
      buttons: [
        {
          text: `Delete ${rack.storage_type === 'fridge' ? 'fridge' : 'rack'}`,
          style: 'destructive',
          onPress: () => {
            removeRack.mutate(rack.id, {
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const rackIds = racks.map((r) => r.id);
  // Per-rack bottle counts, computed server-side in a single query. Keyed under
  // the shared 'slot-assignments' prefix so every existing rack mutation across
  // the app (which invalidates ['slot-assignments']) refreshes these counts too.
  // The old approach joined two client caches (slot-assignments × cellar wines)
  // and rendered 0 until BOTH had loaded — the cold-start "counts show 0" bug.
  const { data: rackCounts = {} } = useQuery({
    queryKey: ['slot-assignments', 'counts', rackIds],
    queryFn: () => getRackBottleCounts(rackIds),
    enabled: rackIds.length > 0,
  });

  // Whole-screen tally, mirroring the Full Cellar List summary ("X wines · X
  // bottles"): every bottle across every home storage container — racks,
  // fridges (one placed slot = one bottle) and other locations (summed
  // quantities) — and how many containers there are in total.
  const rackBottles = Object.values(rackCounts).reduce((sum: number, n: number) => sum + n, 0);
  const binBottles = Object.values(binCounts).reduce((sum: number, n: number) => sum + n, 0);
  const locationBottles = storageLocations.reduce((sum, l) => sum + (l.wineCount ?? 0), 0);
  const totalBottles = rackBottles + binBottles + locationBottles;
  const totalLocations = racks.length + bins.length + storageLocations.length;

  // Open the photograph-or-manual chooser for the requested storage type.
  function handleAddType(type: 'rack' | 'fridge') {
    setChooser(type);
  }

  // The "+ Add" tile in the Wine Racks & Fridges carousel — first asks which
  // kind, then hands off to the existing photograph/manual chooser.
  function handleAddStoragePrompt() {
    showAlert({
      title: 'Add storage',
      body: 'What would you like to add?',
      buttons: [
        { text: 'Add a Wine Rack', onPress: () => handleAddType('rack') },
        { text: 'Add a Wine Fridge', onPress: () => handleAddType('fridge') },
        { text: 'Add a Wine Bin', onPress: () => router.push('/cellar/bin/new' as any) },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // The "+ Add" tile in the Other Home Storage carousel. Grid = yes →
  // treat it like a rack and reuse the rack build flow. Grid = no → the bespoke
  // photo-a-space flow (built separately).
  function handleAddLocationPrompt() {
    showAlert({
      title: 'New location',
      body: "Does this location have a horizontal & vertical grid layout you'd like to replicate?",
      buttons: [
        { text: 'Yes', onPress: () => handleAddType('rack') },
        { text: 'No', onPress: () => router.push('/cellar/storage-location/new' as any) },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // Clear any stale "place this wine" intent left over from an earlier,
  // abandoned add flow. Creating a rack here is a fresh start — the new
  // rack should open empty, not demanding the user place a wine they chose
  // not to place earlier. (The legitimate "create a rack to hold this
  // scanned wine" flow sets pendingWineId and goes straight to the camera
  // from the scan results, bypassing this screen, so it's unaffected.)
  function clearStalePendingWine() {
    setPendingWineId(null);
    setPendingAddMode(false);
  }

  // "Photograph your rack/fridge" — the existing camera-then-detect flow.
  function handleChoosePhotograph() {
    if (!chooser) return;
    clearStalePendingWine();
    setPendingStorageType(chooser);
    setChooser(null);
    router.push('/cellar/rack/camera');
  }

  // "Manually Select Layout" — skip the camera and drop the user straight
  // onto the Confirm Rack / Confirm Fridge page with default 4×6 dims that
  // they can tweak before saving. Reset first so any stale image / dims
  // from a previous photograph attempt don't bleed through.
  function handleChooseManual() {
    if (!chooser) return;
    clearStalePendingWine();
    resetRackStore();
    setPendingStorageType(chooser);
    setChooser(null);
    router.push('/cellar/rack/detect');
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Home Wine Storage</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your wines"
          body="Build virtual wine racks that mirror your home storage — sign in to keep them."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.pageIntroLead}>Replicate your home storage in Vinster.</Text>
          <Text style={styles.pageIntro}>
            Whether you've got organised storage solutions or cases under the stairs Vinster will help you keep track of what's where.
          </Text>

          {totalLocations > 0 && (
            <Text style={styles.homeSummary}>
              {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalLocations} {totalLocations === 1 ? 'Location' : 'Locations'}
            </Text>
          )}

          <View style={styles.divider} />

          {/* Wine Racks & Fridges — a horizontal carousel of racks/fridges with
              a permanent "+ Add" tile at the end. */}
          <Text style={styles.blockHeader}>Racks, Fridges & Bins</Text>
          <Text style={styles.blockBlurb}>
            Add a wine rack or fridge by photographing or manually inputting it's layout. Once you have your grid set up you can input individual wines, multiples of the same wine, or lineups of up to 6 bottles at a time.
          </Text>
          {racks.length > 0 && <Text style={styles.swipeHint}>Swipe to see all, and add more →</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {racks.map((rack) => (
              <RackCard
                key={rack.id}
                rack={rack}
                count={rackCounts[rack.id] ?? 0}
                onLongPress={() => handleLongPressRack(rack)}
              />
            ))}
            {bins.map((bin) => (
              <TouchableOpacity
                key={bin.id}
                style={styles.storageCard}
                onPress={() => router.push(`/cellar/bin/${bin.id}` as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.storageCardType}>Bin</Text>
                <Text style={styles.storageCardName} numberOfLines={2}>{bin.name}</Text>
                <Text style={styles.storageCardCount}>{bottleLabel(binCounts[bin.id] ?? 0)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addTile} onPress={handleAddStoragePrompt} activeOpacity={0.85}>
              <Text style={styles.addTilePlus}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.divider} />

          {/* Other Home Storage — the user's own free-form home
              places (shed, under the bed…). A distinct concept from the Cellar
              List "Locations" filter, so those are NOT shown here. */}
          <Text style={styles.blockHeader}>Other Home Storage</Text>
          <Text style={styles.blockBlurb}>
            Add bespoke locations: In the shed, under the bed…
          </Text>
          {storageLocations.length > 0 && <Text style={styles.swipeHint}>Swipe to see all, and add more →</Text>}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
            {storageLocations.map((loc) => (
              <TouchableOpacity
                key={loc.id}
                style={styles.storageCard}
                onPress={() => router.push(`/cellar/storage-location/${loc.id}` as any)}
                activeOpacity={0.85}
              >
                <Text style={styles.storageCardType}>Location</Text>
                <Text style={styles.storageCardName} numberOfLines={2}>{loc.name}</Text>
                <Text style={styles.storageCardCount}>{bottleLabel(loc.wineCount ?? 0)}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.addTile} onPress={handleAddLocationPrompt} activeOpacity={0.85}>
              <Text style={styles.addTilePlus}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </ScrollView>
      )}

      {/* Photograph / manual chooser for Add Wine Rack & Add Wine Fridge.
          The photograph path runs the camera + auto-detect flow; the
          manual path skips the camera and drops the user straight on the
          Confirm Rack/Fridge page so they can set dimensions by hand. */}
      <Modal visible={chooser !== null} transparent animationType="fade" onRequestClose={() => setChooser(null)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooser(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>
              {chooser === 'fridge' ? 'Add Wine Fridge' : 'Add Wine Rack'}
            </Text>
            <Text style={styles.chooserBody}>
              How would you like to build it?
            </Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChoosePhotograph} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>
                {chooser === 'fridge' ? 'Photograph your fridge' : 'Photograph your rack'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, styles.chooserBtnSecondary]} onPress={handleChooseManual} activeOpacity={0.8}>
              <Text style={[styles.chooserBtnText, styles.chooserBtnTextSecondary]}>Manually Select Layout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooser(null)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Cormorant — page header
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  // Cormorant — section header
  subHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  // Two-line page intro beneath the header: a lead line then the detail.
  pageIntroLead: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 22, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  pageIntro: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 22, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: 6, paddingBottom: spacing.md },
  // Gold whole-screen tally under the blurb — same treatment as the Full
  // Cellar List summary ("X wines · X bottles").
  homeSummary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.xs },
  // Left-aligned section subheader (Wine Racks & Fridges / Other Locations).
  blockHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: 4 },
  blockBlurb: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 20, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  // "Swipe to see all →" — matches the Full Cellar List filter hint.
  swipeHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  // Horizontal carousel of storage cards.
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  storageCard: { width: 152, height: 108, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: spacing.md, justifyContent: 'space-between', backgroundColor: colors.surface },
  storageCardType: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  storageCardName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.4 },
  storageCardCount: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // The permanent "+ Add" tile (dashed gold) at the end of each carousel.
  addTile: { width: 152, height: 108, borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addTilePlus: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1 },
  // Rack / fridge name — all-caps gold, matching the "Bottle Picks Awaiting
  // Review" section-header look, kept at the existing 18pt title size.
  rowName: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  rowMetaLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: spacing.sm },
  // Inter — meta value
  rowBottles: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold },
  // Inter — meta caption
  rowCreated: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  homeToRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs, gap: 6 },
  // Inter — meta label
  homeToLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — body blurb
  homeToBlurb: { flex: 1, fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 19 },
  arrow: { fontSize: 20, fontFamily: fonts.bodyRegular, color: colors.gold, marginLeft: spacing.md },
  // White side-by-side Add Wine Rack / Add Wine Fridge buttons. Sized
  // a touch tighter than the old stacked yellow pair so two read
  // comfortably across the screen width.
  addButtonRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  // White side-by-side Add a Wine Rack / Add a Wine Fridge buttons.
  addButtonGold: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  addButtonGoldText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  // New-user intro blurb, shown when no racks exist yet.
  introBlurb: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.sm },
  cellarListSection: { paddingHorizontal: spacing.xl },
  fullListButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Cormorant — button text
  fullListButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Inter — meta label
  recentLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.lg, marginBottom: spacing.xs },
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentThumb: { width: 34, height: 44 },
  recentMain: { flex: 1 },
  // Inter — wine card name
  recentName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  // Inter — wine detail caption
  recentDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  // "Recently Added" meta line: date · bottles · rack
  recentMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  recentMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, flexShrink: 1 },
  recentMetaDot: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  addToLocationLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline', marginTop: 4 },
  // Photograph / manual chooser overlay
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Cormorant — chooser pop-up title
  chooserTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — chooser pop-up body
  chooserBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnSecondary: { borderColor: '#FFFFFF' },
  // Cormorant — chooser button text
  chooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooserBtnTextSecondary: { color: '#FFFFFF' },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  // Inter — cancel link inside modal (not a button)
  chooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
