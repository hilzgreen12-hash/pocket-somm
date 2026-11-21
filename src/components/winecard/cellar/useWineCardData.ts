import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { useCellar, useArchive } from '../../../hooks/useCellar';
import { archiveLines } from '../../../hooks/useCellarListFilters';
import { useRacks } from '../../../hooks/useRacks';
import { getSlotAssignments } from '../../../api/racks';
import { getBins, getBinOfCell } from '../../../api/bins';
import { fetchPlacementsForWine, placedCount, type CellarPlacement, type StorageUnitRef } from '../../../api/placements';
import { fetchCellarLocations, type CustomFilter } from '../../../api/customFilters';
import { fetchStorageLocations, fetchStorageCasesByIds } from '../../../api/storageLocations';
import { wineNameKey } from '../../../utils/wineIdentity';
import { sameWineIdentity } from '../../../utils/wineMatch';
import { bottleSizeCl } from '../../BottleSizePicker';
import type { CellarWine, StorageCase, StorageLocation, WineRack } from '../../../types/wine';

// One place some of this wine's bottles sit, for the Cellar tab and the history.
// Home places link to their screen; external cellars aren't browsable.
export type CellarEntry = {
  key: string;
  label: string;
  quantity: number;
  caseName: string | null;
  isExternal: boolean;
  href: string | null;
};

// A place bottles can be archived from when the wine is split across several.
export type ArchiveSource = { label: string; count: number; unit: StorageUnitRef | null };

// Where bottles can be moved to from the card.
export type MoveDestination = { kind: 'rack' | 'bin' | 'location' | 'list'; id: string | null; name: string };

// "3×75cl", or for a mix of sizes "2×75cl + 1×150cl" — a mix is never labelled
// as one size.
export type BottleTally = { total: number; label: string; mixed: boolean };
function tally(rows: Pick<CellarWine, 'quantity' | 'bottle_size_ml'>[], fallbackMl: number | null): BottleTally {
  const bySize = new Map<number, number>();
  for (const r of rows) {
    const ml = r.bottle_size_ml ?? 750;
    bySize.set(ml, (bySize.get(ml) ?? 0) + (r.quantity ?? 0));
  }
  const sizes = [...bySize.entries()].filter(([, n]) => n > 0).sort(([a], [b]) => a - b);
  const total = sizes.reduce((n, [, q]) => n + q, 0);
  const label = sizes.length
    ? sizes.map(([ml, n]) => `${n}×${bottleSizeCl(ml)}cl`).join(' + ')
    : `0×${bottleSizeCl(fallbackMl ?? 750)}cl`;
  return { total, label, mixed: sizes.length > 1 };
}

const NO_BINS: WineRack[] = [];
const NO_PLACEMENTS: CellarPlacement[] = [];
const NO_FILTERS: CustomFilter[] = [];
const NO_LOCATIONS: StorageLocation[] = [];
const NO_CASES: StorageCase[] = [];

// Everything the card knows about where this wine's bottles are — racks, bins,
// alt cellars, loose — and the other cellar/archive rows of the same wine.
export function useWineCardData(wine: CellarWine) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { racks, isLoading: racksLoading } = useRacks();
  const isArchived = !!wine.archived_at;

  const { data: bins = NO_BINS } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const binIds = useMemo(() => bins.map((b) => b.id), [bins]);
  const { data: binOfCell } = useQuery({
    queryKey: ['bin-cells', 'owners', binIds],
    queryFn: () => getBinOfCell(binIds),
    enabled: binIds.length > 0,
  });
  const rackIds = useMemo(() => racks.map((r) => r.id), [racks]);
  const { data: slotAssignments } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });
  // Bottles covered by no placement are loose (in Your Cellar List, unplaced).
  const { data: placements = NO_PLACEMENTS } = useQuery({
    queryKey: ['placements', wine.id],
    queryFn: () => fetchPlacementsForWine(wine.id),
  });
  // Cellar-wide Location filters (tags, not physical storage).
  const { data: locations = NO_FILTERS, isLoading: locationsLoading } = useQuery({
    queryKey: ['cellar-locations', userId],
    queryFn: () => fetchCellarLocations(userId!),
    enabled: !!userId,
  });
  // Alt cellars, home and external.
  const { data: storageLocations = NO_LOCATIONS, isLoading: storageLocationsLoading } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  const caseIds = useMemo(() => Array.from(new Set(placements
    .filter((p) => p.kind === 'location' && p.case_id)
    .map((p) => p.case_id as string))), [placements]);
  const { data: cases = NO_CASES } = useQuery({
    queryKey: ['placement-cases', caseIds],
    queryFn: () => fetchStorageCasesByIds(caseIds),
    enabled: caseIds.length > 0,
  });

  const externalIds = useMemo(
    () => new Set(storageLocations.filter((l) => l.is_external).map((l) => l.id)),
    [storageLocations],
  );

  const where = useMemo(() => {
    const binOf = (p: CellarPlacement) => (p.bin_cell_id ? binOfCell?.get(p.bin_cell_id) ?? null : null);
    const rackCount = new Map<string, number>();
    for (const s of slotAssignments ?? []) {
      if (s.cellar_wine_id === wine.id) rackCount.set(s.rack_id, (rackCount.get(s.rack_id) ?? 0) + 1);
    }
    const entries: CellarEntry[] = [];
    for (const [rackId, count] of rackCount) {
      const rack = racks.find((r) => r.id === rackId);
      if (rack) entries.push({ key: `rack-${rackId}`, label: rack.name, quantity: count, caseName: null, isExternal: false, href: `/cellar/rack/${rackId}?highlight=${wine.id}` });
    }
    for (const p of placements) {
      if (p.kind === 'location') {
        const loc = storageLocations.find((l) => l.id === p.storage_location_id);
        entries.push({
          key: p.id,
          label: loc?.name ?? 'A location',
          quantity: p.quantity ?? 0,
          caseName: cases.find((c) => c.id === p.case_id)?.name ?? null,
          isExternal: !!loc?.is_external,
          href: loc?.is_external ? null : `/cellar/storage-location/${p.storage_location_id}?highlight=${wine.id}`,
        });
      } else if (p.kind === 'bin') {
        const bin = bins.find((b) => b.id === binOf(p));
        entries.push({ key: p.id, label: bin?.name ?? 'Wine bin', quantity: p.quantity ?? 0, caseName: null, isExternal: false, href: bin ? `/cellar/bin/${bin.id}?highlight=${wine.id}` : null });
      }
    }
    // An archived row's quantity is bottles drunk, never loose cellar stock.
    const unplaced = isArchived ? 0 : Math.max(0, (wine.quantity ?? 0) - placedCount(placements));
    const external = placements.reduce((n, p) => n + (p.kind === 'location' && p.storage_location_id && externalIds.has(p.storage_location_id) ? (p.quantity ?? 0) : 0), 0);

    // Bottles already in a destination, so a move never "moves" them there again.
    const inDest = (d: MoveDestination): number => {
      if (d.kind === 'list') return unplaced;
      if (d.kind === 'rack') return rackCount.get(d.id ?? '') ?? 0;
      return placedCount(placements.filter((p) => (d.kind === 'bin'
        ? p.kind === 'bin' && binOf(p) === d.id
        : p.kind === 'location' && p.storage_location_id === d.id)));
    };
    const homeBottles = Math.max(0, (wine.quantity ?? 0) - external);

    // Each rack, alt cellar and bin is its own archive source; loose bottles one more.
    const sourceCounts = new Map<string, ArchiveSource>();
    let unknownBin = 0; // bin bottles whose bin hasn't loaded yet
    const addSource = (unit: StorageUnitRef, label: string, n: number) => {
      const k = `${unit.kind}-${unit.id}`;
      const prev = sourceCounts.get(k);
      sourceCounts.set(k, { unit, label, count: (prev?.count ?? 0) + n });
    };
    for (const p of placements) {
      if (p.kind === 'rack' && p.rack_id) addSource({ kind: 'rack', id: p.rack_id }, racks.find((r) => r.id === p.rack_id)?.name ?? 'a rack', p.quantity ?? 1);
      if (p.kind === 'location' && p.storage_location_id) addSource({ kind: 'location', id: p.storage_location_id }, storageLocations.find((l) => l.id === p.storage_location_id)?.name ?? 'a home storage location', p.quantity ?? 0);
      if (p.kind === 'bin') {
        const binId = binOf(p);
        if (binId) addSource({ kind: 'bin', id: binId }, bins.find((b) => b.id === binId)?.name ?? 'a wine bin', p.quantity ?? 0);
        else unknownBin += p.quantity ?? 0;
      }
    }
    const archiveSources: ArchiveSource[] = [...sourceCounts.values()].filter((b) => b.count > 0);
    if (unknownBin > 0) archiveSources.push({ label: 'a wine bin', count: unknownBin, unit: null });
    if (unplaced > 0) archiveSources.push({ label: 'Not yet placed (loose)', count: unplaced, unit: null });

    return {
      entries,
      unplaced,
      archiveSources,
      // Home bottles (external stock only ever moves home from the cellar list).
      homeBottles,
      movableTo: (d: MoveDestination) => Math.max(0, homeBottles - inDest(d)),
    };
  }, [wine.id, wine.quantity, isArchived, placements, slotAssignments, racks, bins, binOfCell, storageLocations, externalIds, cases]);

  // The same wine and vintage across the cellar and the archive — matched on the
  // identity key, or the looser word-subset rule, so a bottle stored under a
  // slightly different name-split still counts.
  const history = useMemo(() => {
    const vintage = (w: CellarWine) => (w.vintage ?? '').trim().toLowerCase();
    const key = wineNameKey(wine.producer, wine.wine_name);
    const same = (w: CellarWine) =>
      (wineNameKey(w.producer, w.wine_name) === key && vintage(w) === vintage(wine)) || sameWineIdentity(wine, w);
    const cellarMatches = wines.filter(same);
    const newestFirst = (a: CellarWine, b: CellarWine) => new Date(b.archived_at!).getTime() - new Date(a.archived_at!).getTime();
    // An archived wine: every entry of its line in Your Cellar Archive (same
    // wine and bottle size), newest first — what its delete and Return to
    // Cellar act on.
    const archiveLine = isArchived
      ? archiveLines(archivedWines).find((g) => g.rows.some((r) => r.id === wine.id))?.rows ?? [wine]
      : [];
    // What the archive card counts and lists: on an archived wine its line, so
    // the count matches what Return to Cellar / Delete act on; on a live wine
    // the wine's whole archive history.
    const archived = (isArchived ? archiveLine : archivedWines.filter(same)).filter((a) => a.archived_at).sort(newestFirst);
    return {
      // This wine's live cellar rows (for an archived wine, the line it came from).
      cellarRows: cellarMatches,
      // A live wine's bottles: this line only — the one its Move / Archive /
      // Delete act on (another size is its own line, with its own card).
      inCellar: tally([wine], wine.bottle_size_ml),
      inArchive: tally(archived, wine.bottle_size_ml),
      archiveEntries: archived,
      archiveLine,
    };
  }, [wines, archivedWines, wine, isArchived]);

  return {
    racks,
    bins,
    locations,
    storageLocations,
    homeLocations: useMemo(() => storageLocations.filter((l) => !l.is_external), [storageLocations]),
    externalIds,
    placements,
    // Destinations still loading (the place chooser waits for them).
    destinationsLoading: racksLoading || locationsLoading || storageLocationsLoading,
    ...where,
    ...history,
  };
}

export type WineCardData = ReturnType<typeof useWineCardData>;
