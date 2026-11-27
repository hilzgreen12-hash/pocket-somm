import { useCallback, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, type ListRenderItem } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useCellar } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useCellarListFilters, type CellarListRowData } from '../../src/hooks/useCellarListFilters';
import { fetchPlacementsForWines, type CellarPlacement } from '../../src/api/placements';
import { getBins, getBinOfCell, getBinBottleCounts } from '../../src/api/bins';
import { getRackBottleCounts } from '../../src/api/racks';
import { fetchStorageLocations, fetchLocationBottleCounts } from '../../src/api/storageLocations';
import { CellarListRow } from '../../src/components/cellarList/CellarListRow';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { CellarWine, StorageLocation, WineRack } from '../../src/types/wine';

const NO_PLACEMENTS: CellarPlacement[] = [];
const NO_STORAGE: StorageLocation[] = [];
const NO_BINS: WineRack[] = [];
const NO_CELLS = new Map<string, string>();
const NO_CUSTOM: never[] = [];

// Your Wines At Home — every bottle kept at home (never external storage), with
// a filter row: HOME CELLAR (All or Unplaced) then each rack, fridge, bin and
// alt cellar in gold with its bottle count. Same filter logic as the Full
// Cellar List, so the counts always agree.
export default function HomeWinesScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines, isLoading } = useCellar();
  const { racks } = useRacks();

  const allWineIds = useMemo(() => wines.map((w) => w.id), [wines]);
  const { data: placements = NO_PLACEMENTS } = useQuery({
    queryKey: ['placements-list', allWineIds],
    queryFn: () => fetchPlacementsForWines(allWineIds),
    enabled: allWineIds.length > 0,
  });
  const placementsByWine = useMemo(() => {
    const m = new Map<string, CellarPlacement[]>();
    for (const p of placements) {
      const list = m.get(p.cellar_wine_id);
      if (list) list.push(p); else m.set(p.cellar_wine_id, [p]);
    }
    return m;
  }, [placements]);
  const { data: storageLocations = NO_STORAGE } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const externalLocIds = useMemo(() => new Set(storageLocations.filter((s) => s.is_external).map((s) => s.id)), [storageLocations]);
  const homeLocations = useMemo(() => storageLocations.filter((s) => !s.is_external), [storageLocations]);
  const { data: bins = NO_BINS } = useQuery({ queryKey: ['bins', userId], queryFn: () => getBins(userId!), enabled: !!userId });
  const binIds = useMemo(() => bins.map((b) => b.id), [bins]);
  const { data: binOfCell = NO_CELLS } = useQuery({
    queryKey: ['bin-cells', 'owners', binIds],
    queryFn: () => getBinOfCell(binIds),
    enabled: binIds.length > 0,
  });

  // Bottle counts per location — the same counts as the Cellar tab's tiles.
  const rackIds = racks.map((r) => r.id);
  const { data: rackCounts = {} } = useQuery({ queryKey: ['slot-assignments', 'counts', rackIds], queryFn: () => getRackBottleCounts(rackIds), enabled: rackIds.length > 0 });
  const { data: binCounts = {} } = useQuery({ queryKey: ['bins', 'counts', binIds], queryFn: () => getBinBottleCounts(binIds), enabled: binIds.length > 0 });
  const homeLocIds = homeLocations.map((l) => l.id);
  const { data: locCounts = {} } = useQuery({ queryKey: ['storage-locations', 'counts', homeLocIds], queryFn: () => fetchLocationBottleCounts(homeLocIds), enabled: homeLocIds.length > 0 });

  const filters = useCellarListFilters({
    wines,
    isArchiveView: false,
    placementsByWine,
    externalLocIds,
    binOfCell,
    customLocations: NO_CUSTOM,
    initialRegion: null,
    initialWineId: null,
  });
  // This page only ever shows home bottles: "All" here means all at home.
  const location = filters.location === 'All' ? 'home' : filters.location;
  useEffect(() => { if (filters.location === 'All') filters.setLocation('home'); }, [filters.location]); // eslint-disable-line react-hooks/exhaustive-deps

  const units = useMemo(() => [
    ...racks.map((r) => ({ key: `rack:${r.id}`, name: r.name, n: rackCounts[r.id] ?? 0 })),
    ...bins.map((b) => ({ key: `bin:${b.id}`, name: b.name, n: binCounts[b.id] ?? 0 })),
    ...homeLocations.map((l) => ({ key: `sloc:${l.id}`, name: l.name, n: locCounts[l.id] ?? 0 })),
  ], [racks, bins, homeLocations, rackCounts, binCounts, locCounts]);

  // Stats bar: every bottle at home (placed or unplaced, never external) — the
  // same count as the Cellar tab's Home Storage line (HomeStorageSection).
  const homeBottles = useMemo(() => wines.reduce((n, w) => {
    const ext = (placementsByWine.get(w.id) ?? []).filter((p) => p.kind === 'location' && externalLocIds.has(p.storage_location_id ?? '')).reduce((s, p) => s + (p.quantity ?? 0), 0);
    return n + Math.max(0, (w.quantity ?? 0) - ext);
  }, 0), [wines, placementsByWine, externalLocIds]);

  function openHomeCellarFilter() {
    showAlert({
      title: 'Home Cellar',
      buttons: [
        { text: 'All', onPress: () => filters.setLocation('home') },
        { text: 'Unplaced', onPress: () => filters.setLocation('unplaced') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const onPress = useCallback((w: CellarWine) => router.push(`/cellar/${w.id}`), []);
  const renderRow = useCallback<ListRenderItem<CellarListRowData>>(({ item }) => (
    <CellarListRow wine={item.wine} bottles={item.bottles} showYourScore={false} showArchivedDate={false} onPress={onPress} onLongPress={onPress} />
  ), [onPress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wines At Home</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {homeBottles} {homeBottles === 1 ? 'Bottle' : 'Bottles'} · {units.length} {units.length === 1 ? 'Location' : 'Locations'}
        </Text>
      </View>

      <Text style={styles.filterHint}>Listed by Recency · Swipe to view all filters →</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity style={styles.filterChip} onPress={openHomeCellarFilter} activeOpacity={0.7}>
          <View style={styles.chipHead}>
            <Text style={styles.chipLabel}>Home Cellar</Text>
            <Text style={styles.chipChevron}>▾</Text>
          </View>
          <Text style={[styles.chipValue, location === 'unplaced' && { color: colors.gold }]} numberOfLines={1}>
            {location === 'unplaced' ? 'Unplaced' : 'All'}
          </Text>
        </TouchableOpacity>
        {/* Each home storage location, in gold (all added by the user): its
            name and bottle count. Tap to see only what's in it; again to clear. */}
        {units.map((u) => {
          const active = location === u.key;
          return (
            <TouchableOpacity
              key={u.key}
              style={[styles.filterChip, styles.unitChip, active && styles.unitChipActive]}
              onPress={() => filters.setLocation(active ? 'home' : u.key)}
              activeOpacity={0.7}
            >
              <View style={styles.chipHead}>
                <Text style={[styles.chipLabel, styles.unitText]} numberOfLines={1} ellipsizeMode="tail">{u.name}</Text>
                <Text style={[styles.chipChevron, styles.unitText]}>▾</Text>
              </View>
              <Text style={[styles.chipValue, styles.unitText]} numberOfLines={1}>{`${u.n} ${u.n === 1 ? 'Bottle' : 'Bottles'}`}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={filters.search}
          onChangeText={filters.setSearch}
          placeholder="Search producer, wine, region…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : filters.rows.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>{location === 'unplaced' ? 'Every bottle at home has a place.' : 'No wines here yet.'}</Text>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={filters.rows}
          keyExtractor={(r) => r.wine.id}
          renderItem={renderRow}
          contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: 60 }}
          initialNumToRender={12}
          windowSize={7}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

// Same header, stats bar and filter tiles as the review screens.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  chipHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  chipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  chipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  chipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  unitChip: { borderColor: colors.gold },
  unitChipActive: { borderColor: colors.gold, borderWidth: 2, backgroundColor: 'rgba(224,184,74,0.12)' },
  unitText: { color: colors.gold, flexShrink: 1 },
  searchRow: { marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  searchInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
