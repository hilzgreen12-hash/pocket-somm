import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../hooks/useRacks';
import { useAuth } from '../hooks/useAuth';
import { useRackStore } from '../stores/rackStore';
import { getRackBottleCounts, getSlotAssignments } from '../api/racks';
import { getBins, getBinBottleCounts, deleteBin, getBinCells } from '../api/bins';
import { fetchStorageLocations, deleteStorageLocation, fetchStorageLocationWines } from '../api/storageLocations';
import { deleteCellarWine } from '../api/cellar';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { fontsSpectral } from '../constants/fonts';
import type { WineRack } from '../types/wine';

function bottleLabel(n: number) {
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

// The five empty-state templates shown when a user has no storage yet — four
// named types plus the "+ Add" tile (rendered separately). Tapping one starts
// that type's add flow, where the user names it.
const TEMPLATES: { type: string; name: string; kind: 'rack' | 'fridge' | 'bin' | 'location' }[] = [
  { type: 'Rack', name: 'Wine Rack', kind: 'rack' },
  { type: 'Fridge', name: 'Wine Fridge', kind: 'fridge' },
  { type: 'Bin', name: 'Wine Bin', kind: 'bin' },
  { type: 'Alt Cellar', name: 'Alt Cellar', kind: 'location' },
];

// "Your Wines At Home" — the home-storage section embedded in the Cellar tab
// (replaces the standalone Home Wine Storage page). One unified carousel across
// racks, fridges, bins and Alt Cellars; when empty it shows setup templates.
export function HomeStorageSection({ requireAuth }: { requireAuth: (action: () => void) => void }) {
  const { session } = useAuth();
  const { racks, isLoading, isError, remove: removeRack } = useRacks();
  const qc = useQueryClient();
  const { setPendingStorageType, reset: resetRackStore, setPendingWineId, setPendingAddMode } = useRackStore();
  const userId = session?.user.id;

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

  const rackBottles = Object.values(rackCounts).reduce((sum: number, n: number) => sum + n, 0);
  const binBottles = Object.values(binCounts).reduce((sum: number, n: number) => sum + n, 0);
  const locationBottles = storageLocations.reduce((sum, l) => sum + (l.wineCount ?? 0), 0);
  const totalBottles = rackBottles + binBottles + locationBottles;
  const totalLocations = racks.length + bins.length + storageLocations.length;
  const hasStorage = totalLocations > 0;

  // ---- Add flows (verbatim from the old racks page) ------------------------
  function clearStalePendingWine() {
    setPendingWineId(null);
    setPendingAddMode(false);
  }
  function addRackOrFridge(type: 'rack' | 'fridge') {
    clearStalePendingWine();
    resetRackStore();
    setPendingStorageType(type);
    router.push('/cellar/rack/resize' as any);
  }
  function addByKind(kind: 'rack' | 'fridge' | 'bin' | 'location') {
    if (kind === 'rack' || kind === 'fridge') return addRackOrFridge(kind);
    if (kind === 'bin') return router.push('/cellar/bin/resize' as any);
    return router.push('/cellar/storage-location/new' as any);
  }
  // Top-level + carousel "+ Add" — offers every storage kind in one prompt.
  function handleAddAnyStorage() {
    showAlert({
      title: 'Add storage',
      body: 'Which type of home storage would you like to add?',
      buttons: [
        { text: 'Add a Wine Rack', onPress: () => addRackOrFridge('rack') },
        { text: 'Add a Wine Fridge', onPress: () => addRackOrFridge('fridge') },
        { text: 'Add a Wine Bin (diamond shaped)', onPress: () => router.push('/cellar/bin/resize' as any) },
        { text: 'Add an Alt Cellar', onPress: () => router.push('/cellar/storage-location/new' as any) },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // ---- Long-press delete flows (verbatim) ----------------------------------
  function handleLongPressRack(rack: WineRack) {
    const noun = rack.storage_type === 'fridge' ? 'Fridge' : 'Rack';
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: rack.name,
      buttons: [
        { text: `Delete ${noun}`, style: 'destructive', onPress: () => { removeRack.mutate(rack.id, { onError }); } },
        {
          text: `Delete ${noun} & Contents`,
          style: 'destructive',
          onPress: async () => {
            try {
              const slots = await getSlotAssignments([rack.id]);
              const wineIds = Array.from(new Set(slots.map((s) => s.cellar_wine_id)));
              for (const id of wineIds) await deleteCellarWine(id);
              await new Promise<void>((resolve, reject) => removeRack.mutate(rack.id, { onSuccess: () => resolve(), onError: reject }));
              qc.invalidateQueries({ queryKey: ['cellar'] });
            } catch (err) { onError(err); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function handleLongPressBin(bin: WineRack) {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ['bins', userId] });
      qc.invalidateQueries({ queryKey: ['bins', 'counts'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
    };
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: bin.name,
      buttons: [
        { text: 'Delete Bin', style: 'destructive', onPress: async () => { try { await deleteBin(bin.id); invalidate(); } catch (err) { onError(err); } } },
        {
          text: 'Delete Bin & Contents',
          style: 'destructive',
          onPress: async () => {
            try {
              const cells = await getBinCells(bin.id);
              const wineIds = Array.from(new Set(cells.flatMap((c) => (c.wines ?? []).map((w) => w.id))));
              for (const id of wineIds) await deleteCellarWine(id);
              await deleteBin(bin.id);
              invalidate();
            } catch (err) { onError(err); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function handleLongPressLocation(loc: { id: string; name: string }) {
    const invalidate = () => {
      qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
    };
    const onError = (err: unknown) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    showAlert({
      title: loc.name,
      buttons: [
        { text: 'Delete Alt Cellar', style: 'destructive', onPress: async () => { try { await deleteStorageLocation(loc.id); invalidate(); } catch (err) { onError(err); } } },
        {
          text: 'Delete Alt Cellar & Contents',
          style: 'destructive',
          onPress: async () => {
            try {
              const wines = await fetchStorageLocationWines(loc.id);
              for (const w of wines) await deleteCellarWine(w.id);
              await deleteStorageLocation(loc.id);
              invalidate();
            } catch (err) { onError(err); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <View>
      <Text style={styles.sectionHeader}>Your Wines At Home</Text>
      <Text style={styles.intro}>
        Replicate your home wine storage in Vinster. Add a Fridge, Rack, Bin or Alternative location (In the shed, under the bed…) and populate it with thumbnails of your wines.
      </Text>

      {hasStorage && (
        <Text style={styles.stats}>
          {totalBottles} {totalBottles === 1 ? 'Bottle' : 'Bottles'} · {totalLocations} {totalLocations === 1 ? 'Location' : 'Locations'}
        </Text>
      )}

      <TouchableOpacity onPress={() => requireAuth(handleAddAnyStorage)} activeOpacity={0.7} style={styles.addRow}>
        <Text style={styles.addLink}>+ Add Storage Location</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>
      ) : session && isError ? (
        <Text style={styles.error}>Couldn't load your storage — pull to refresh. Your wines are safe.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carouselScroll} contentContainerStyle={styles.carousel}>
          {hasStorage ? (
            <>
              {racks.map((rack) => (
                <TouchableOpacity
                  key={rack.id}
                  style={styles.storageCard}
                  onPress={() => router.push(`/cellar/rack/${rack.id}` as any)}
                  onLongPress={() => handleLongPressRack(rack)}
                  delayLongPress={400}
                  activeOpacity={0.85}
                >
                  <Text style={styles.storageCardType}>{rack.storage_type === 'fridge' ? 'Fridge' : 'Rack'}</Text>
                  <Text style={styles.storageCardName} numberOfLines={2}>{rack.name}</Text>
                  <Text style={styles.storageCardCount}>{bottleLabel(rackCounts[rack.id] ?? 0)}</Text>
                </TouchableOpacity>
              ))}
              {bins.map((bin) => (
                <TouchableOpacity
                  key={bin.id}
                  style={styles.storageCard}
                  onPress={() => router.push(`/cellar/bin/${bin.id}` as any)}
                  onLongPress={() => handleLongPressBin(bin)}
                  delayLongPress={400}
                  activeOpacity={0.85}
                >
                  <Text style={styles.storageCardType}>Bin</Text>
                  <Text style={styles.storageCardName} numberOfLines={2}>{bin.name}</Text>
                  <Text style={styles.storageCardCount}>{bottleLabel(binCounts[bin.id] ?? 0)}</Text>
                </TouchableOpacity>
              ))}
              {storageLocations.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.storageCard}
                  onPress={() => router.push(`/cellar/storage-location/${loc.id}` as any)}
                  onLongPress={() => handleLongPressLocation(loc)}
                  delayLongPress={400}
                  activeOpacity={0.85}
                >
                  <Text style={styles.storageCardType}>Alt Cellar</Text>
                  <Text style={styles.storageCardName} numberOfLines={2}>{loc.name}</Text>
                  <Text style={styles.storageCardCount}>{bottleLabel(loc.wineCount ?? 0)}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            // No storage yet — four setup templates the user can name.
            TEMPLATES.map((t) => (
              <TouchableOpacity
                key={t.kind}
                style={styles.storageCard}
                onPress={() => requireAuth(() => addByKind(t.kind))}
                activeOpacity={0.85}
              >
                <Text style={styles.storageCardType}>{t.type}</Text>
                <Text style={styles.storageCardName} numberOfLines={2}>{t.name}</Text>
                <Text style={styles.storageCardCount}>Tap to set up</Text>
              </TouchableOpacity>
            ))
          )}
          <TouchableOpacity style={styles.addTile} onPress={() => requireAuth(handleAddAnyStorage)} activeOpacity={0.85}>
            <Text style={styles.addTilePlus}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches "Vinster's Review of You" on the Review tab.
  sectionHeader: { fontFamily: fontsSpectral.headingSemibold, fontSize: 20, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Elegant Cormorant, matching the Cellar header/blurb above.
  intro: { fontSize: 17, fontFamily: fontsSpectral.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  stats: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', marginBottom: spacing.xs },
  addRow: { alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.xs },
  addLink: { fontSize: 16, fontFamily: fontsSpectral.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  error: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  // Extra breathing room between "+ Add Storage Location" and the carousel.
  carouselScroll: { marginTop: spacing.xl },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  storageCard: { width: 152, height: 108, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, justifyContent: 'space-between', backgroundColor: colors.surface },
  storageCardType: { fontSize: 11, fontFamily: fontsSpectral.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  storageCardName: { fontSize: 16, fontFamily: fontsSpectral.headingSemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.4 },
  storageCardCount: { fontSize: 13, fontFamily: fontsSpectral.headingRegular, color: colors.textMuted },
  addTile: { width: 152, height: 108, borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  addTilePlus: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5 },
});
