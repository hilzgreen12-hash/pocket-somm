import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchStorageLocation, fetchStorageLocationCases, fetchStorageLocations } from '../api/storageLocations';
import { fetchLocationPlacementRows, type LocationWineRow } from '../api/placements';
import { useRacks } from './useRacks';
import { effectiveMaturity } from '../utils/maturity';
import { foldAccents, matchesWineSearch } from '../utils/wineIdentity';
import type { StorageCase } from '../types/wine';

// Search terms that map free text onto a drinking-window status (mirrors the
// rack screen), so a search for "peak" or "young" filters by maturity too.
const STATUS_SEARCH: { status: string; terms: string[] }[] = [
  { status: 'too_young', terms: ['too young', 'young', 'hold'] },
  { status: 'approaching', terms: ['approaching', 'approach'] },
  { status: 'peak', terms: ['peak', 'drinking now', 'drink now', 'ready', 'drinking'] },
  { status: 'declining', terms: ['declining', 'decline', 'fading', 'past peak'] },
];

// One line of the alt cellar's list. The grouped view lays each case out as a
// header followed by its wines (`inCase`, the last one closing the box), then
// the loose bottles.
export type AltCellarItem =
  | { type: 'wine'; key: string; row: LocationWineRow; inCase?: { last: boolean } }
  | { type: 'case'; key: string; box: StorageCase }
  | { type: 'heading'; key: string; text: string }
  | { type: 'note'; key: string; text: string };

export type AltCellarView = 'all' | 'loose' | 'grouped';

// Everything the alt-cellar screen shows: the cellar, its rows (one per
// placement: a wine's bottles here, loose or in one case), its cases, the
// other storage a wine can move to, and the filtered list. `highlight` (from
// Quick Command "Find a bottle") narrows the list to one wine.
export function useAltCellarData(id: string | undefined, userId: string | undefined, highlight: string | undefined) {
  const { data: location, isLoading } = useQuery({
    queryKey: ['storage-location', id],
    queryFn: () => fetchStorageLocation(id!),
    enabled: !!id,
  });
  const { data: rows = [] } = useQuery({
    queryKey: ['storage-location-wines', id],
    queryFn: () => fetchLocationPlacementRows(id!),
    enabled: !!id,
  });
  const { data: cases = [] } = useQuery({
    queryKey: ['storage-location-cases', id],
    queryFn: () => fetchStorageLocationCases(id!),
    enabled: !!id,
  });
  const { racks } = useRacks();
  const { data: allLocations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });

  const [search, setSearch] = useState('');
  const [maturity, setMaturity] = useState('');
  const [view, setView] = useState<AltCellarView>('all');
  const [caseFilter, setCaseFilter] = useState('');
  const [highlightOnly, setHighlightOnly] = useState<string | null>(highlight ?? null);
  useEffect(() => { setHighlightOnly(highlight ?? null); }, [id, highlight]);

  // Worked out once per row, not on every filter pass.
  const maturityOf = useMemo(() => new Map(rows.map((r) => [r.placement_id, effectiveMaturity(r)])), [rows]);

  const filtered = useMemo(() => {
    const q = foldAccents(search.trim());
    return rows.filter((r) => {
      const status = maturityOf.get(r.placement_id);
      if (maturity && status !== maturity) return false;
      if (view === 'loose' && r.case_id) return false;
      if (highlightOnly && r.id !== highlightOnly) return false;
      if (caseFilter && r.case_id !== caseFilter) return false;
      if (q) {
        const statusTerms = STATUS_SEARCH.find((s) => s.status === status)?.terms ?? [];
        if (!matchesWineSearch([r.producer, r.wine_name, r.region, r.vintage], q) && !statusTerms.some((t) => t.includes(q))) return false;
      }
      return true;
    });
  }, [rows, maturityOf, search, maturity, view, caseFilter, highlightOnly]);

  const items = useMemo((): AltCellarItem[] => {
    const wine = (row: LocationWineRow, inCase?: { last: boolean }): AltCellarItem => ({ type: 'wine', key: row.placement_id, row, inCase });
    if (view !== 'grouped' || filtered.length === 0) return filtered.map((r) => wine(r));
    const out: AltCellarItem[] = [];
    for (const box of cases) {
      const inBox = filtered.filter((r) => r.case_id === box.id);
      if (inBox.length === 0) continue;
      out.push({ type: 'case', key: `case-${box.id}`, box });
      inBox.forEach((r, i) => out.push(wine(r, { last: i === inBox.length - 1 })));
    }
    const loose = filtered.filter((r) => !r.case_id);
    if (out.length === 0) out.push({ type: 'note', key: 'no-cases', text: 'No wines have been placed in cases yet.' });
    else if (loose.length > 0) out.push({ type: 'heading', key: 'loose', text: 'Loose bottles' });
    return [...out, ...loose.map((r) => wine(r))];
  }, [view, filtered, cases]);

  const bottlesHere = rows.reduce((n, r) => n + (r.quantity ?? 0), 0);
  const looseBottles = rows.reduce((n, r) => n + (r.case_id ? 0 : r.quantity ?? 0), 0);

  // Bottles moved here (e.g. by Quick Command) and not yet filed: those waiting
  // in THIS cellar (or anywhere) — not ones waiting for a rack, fridge or bin.
  const awaiting = rows.filter((r) => r.awaiting_placement && (!r.awaiting_placement_unit_id || r.awaiting_placement_unit_id === id));
  const awaitingBottles = awaiting.reduce((n, r) => n + (r.quantity ?? 0), 0);

  return {
    location, isLoading, rows, cases, racks, allLocations,
    filters: { search, setSearch, maturity, setMaturity, view, setView, caseFilter, setCaseFilter, highlightOnly, setHighlightOnly },
    filtered, items, bottlesHere, looseBottles, awaiting, awaitingBottles,
  };
}
