import { useEffect, useMemo, useState } from 'react';
import type { CellarWine, StorageLocation, WineRack } from '../types/wine';
import type { CellarPlacement, StorageUnitRef } from '../api/placements';
import type { CustomFilter } from '../api/customFilters';
import { foldAccents, matchesWineSearch } from '../utils/wineIdentity';
import { inferWineStyle, WINE_STYLES } from '../utils/wineStyle';
import { effectiveMaturity } from '../utils/maturity';
import { inferCountry } from '../utils/wineCountry';
import { baseRegionGroup } from '../utils/wineRegionGroup';
import { groupWinesByIdentity } from '../utils/wineMatch';
import { bottleValue } from '../utils/bottleValue';
import { visibleReviewScore } from '../utils/cellarReview';
import { isMissingIntel } from '../services/bulkIntel';

// Filtering, grouping and sorting for Your Cellar List and Your Cellar Archive
// (app/cellar/list.tsx). Every step is memoised and the search is debounced, so
// a large imported cellar (thousands of lines) stays responsive.

export type SortMode =
  | 'recent'
  | 'est_desc' | 'est_asc'
  | 'purch_desc' | 'purch_asc'
  | 'critic_desc' | 'critic_asc'
  | 'your_desc' | 'your_asc';

// The list defaults to most-recently-added; the Value and Score chips each
// offer four directional sorts plus a reset.
export const PRICE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'est_desc',   label: 'Estimated Value Descending' },
  { value: 'est_asc',    label: 'Estimated Value Ascending' },
  { value: 'purch_desc', label: 'Purchase Price Descending' },
  { value: 'purch_asc',  label: 'Purchase Price Ascending' },
];
export const SCORE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'critic_desc', label: 'Critic Score Descending' },
  { value: 'critic_asc',  label: 'Critic Score Ascending' },
  { value: 'your_desc',   label: 'Your Score Descending' },
  { value: 'your_asc',    label: 'Your Score Ascending' },
];

export const COLOUR_OPTIONS = ['All', ...WINE_STYLES, 'Other'];

// Values match the stored drinking_window_status the racks colour-code by,
// ordered youngest → oldest.
export const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'All', label: 'All maturities' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Early but Approachable' },
  { value: 'peak', label: 'Sweet Spot' },
  { value: 'declining', label: 'In Decline' },
];

// Location filter values: 'All' · 'home' · 'external' · 'unplaced' ·
// 'loc:<custom Location>' · 'sloc:<alt cellar>' · 'rack:<rack/fridge>' · 'bin:<bin>'.
export interface LocationOption {
  value: string;
  label: string;
  indent?: boolean;
  header?: boolean;     // a group title, not a choice
  disabled?: boolean;   // a placeholder line, not a choice
}

export function locationOptions(input: {
  customLocations: CustomFilter[];
  racks: WineRack[];
  bins: WineRack[];
  storageLocations: StorageLocation[];
}): LocationOption[] {
  const opts: LocationOption[] = [{ value: 'All', label: 'All locations' }];
  for (const l of input.customLocations) opts.push({ value: `loc:${l.id}`, label: l.name });
  opts.push({ value: 'home_header', label: 'All Wines At Home', header: true });
  opts.push({ value: 'home', label: 'View All', indent: true });
  for (const r of input.racks) opts.push({ value: `rack:${r.id}`, label: r.name, indent: true });
  for (const b of input.bins) opts.push({ value: `bin:${b.id}`, label: b.name, indent: true });
  for (const s of input.storageLocations) {
    if (!s.is_external) opts.push({ value: `sloc:${s.id}`, label: s.name, indent: true });
  }
  opts.push({ value: 'unplaced', label: 'Unplaced Bottles', indent: true });
  opts.push({ value: 'external_header', label: 'All Wines Stored Externally', header: true });
  const external = input.storageLocations.filter((s) => s.is_external);
  if (external.length === 0) {
    opts.push({ value: 'external_empty', label: 'Nothing here yet', indent: true, disabled: true });
  } else {
    opts.push({ value: 'external', label: 'View All', indent: true });
    for (const s of external) opts.push({ value: `sloc:${s.id}`, label: s.name, indent: true });
  }
  return opts;
}

// The storage unit a location filter points at, if it's a single one.
function unitOf(filter: string): StorageUnitRef | null {
  if (filter.startsWith('rack:')) return { kind: 'rack', id: filter.slice(5) };
  if (filter.startsWith('bin:')) return { kind: 'bin', id: filter.slice(4) };
  if (filter.startsWith('sloc:')) return { kind: 'location', id: filter.slice(5) };
  return null;
}

export function wineColour(w: CellarWine): string {
  return inferWineStyle({ style: w.style, region: w.region, grape_variety: w.grape_variety }) ?? 'Other';
}

// One line of the list: the wine, and the bottles it shows. Under a location
// filter that's only the bottles in that location; in the archive, one line
// stands for every archived entry of a wine, so it shows their total.
export interface CellarListRowData {
  wine: CellarWine;
  bottles: number;
}

const SEARCH_DEBOUNCE_MS = 200;

export function useCellarListFilters(input: {
  wines: CellarWine[];           // the live cellar, or the archived rows in the archive view
  isArchiveView: boolean;
  placementsByWine: Map<string, CellarPlacement[]>;
  externalLocIds: Set<string>;
  binOfCell: Map<string, string>;
  customLocations: CustomFilter[];
  initialRegion: string | null;
}) {
  const { wines, isArchiveView, placementsByWine, externalLocIds, binOfCell, customLocations } = input;
  const [location, setLocation] = useState('All');
  const [country, setCountry] = useState('All');
  const [colour, setColour] = useState('All');
  const [maturity, setMaturity] = useState('All');
  const [region, setRegion] = useState<string | null>(input.initialRegion);
  const [sort, setSort] = useState<SortMode>('recent');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setQuery(foldAccents(search.trim())), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const w of wines) {
      const c = inferCountry(w.region);
      if (c) set.add(c);
    }
    return ['All', ...Array.from(set).sort()];
  }, [wines]);

  // How many of a wine's bottles the location filter shows (0 = not shown).
  const bottlesInLocation = useMemo(() => {
    const tagged = location.startsWith('loc:')
      ? new Set(customLocations.find((l) => l.id === location.slice(4))?.wineIds ?? [])
      : null;
    const unit = unitOf(location);
    const sum = (pls: CellarPlacement[], keep: (p: CellarPlacement) => boolean) =>
      pls.reduce((n, p) => n + (keep(p) ? (p.quantity ?? 0) : 0), 0);
    const isExternal = (p: CellarPlacement) => p.kind === 'location' && externalLocIds.has(p.storage_location_id ?? '');
    return (w: CellarWine): number => {
      const pls = placementsByWine.get(w.id) ?? [];
      const qty = w.quantity ?? 0;
      if (location === 'All') return qty;
      // A custom Location is a tag on the wine, not a physical place.
      if (tagged) return tagged.has(w.id) ? qty : 0;
      if (location === 'home') return Math.max(0, qty - sum(pls, isExternal));
      if (location === 'external') return sum(pls, isExternal);
      if (location === 'unplaced') return Math.max(0, qty - sum(pls, () => true));
      if (unit?.kind === 'rack') return sum(pls, (p) => p.kind === 'rack' && p.rack_id === unit.id);
      if (unit?.kind === 'bin') return sum(pls, (p) => p.kind === 'bin' && binOfCell.get(p.bin_cell_id ?? '') === unit.id);
      if (unit?.kind === 'location') return sum(pls, (p) => p.kind === 'location' && p.storage_location_id === unit.id);
      return qty;
    };
  }, [location, customLocations, placementsByWine, externalLocIds, binOfCell]);

  // Filters first; the search narrows whatever the chips already show.
  const filtered = useMemo(() => {
    const out: CellarListRowData[] = [];
    for (const w of wines) {
      const bottles = bottlesInLocation(w);
      if (location !== 'All' && bottles <= 0) continue;
      if (country !== 'All' && inferCountry(w.region) !== country) continue;
      if (region && baseRegionGroup(w.region) !== region) continue;
      if (colour !== 'All' && wineColour(w) !== colour) continue;
      if (maturity !== 'All' && effectiveMaturity(w) !== maturity) continue;
      if (query && !matchesWineSearch([w.producer, w.wine_name, w.region, w.grape_variety, w.vintage], query)) continue;
      out.push({ wine: w, bottles });
    }
    return out;
  }, [wines, bottlesInLocation, location, country, region, colour, maturity, query]);

  // Your Cellar Archive: one line per wine (see archiveLines), carrying the
  // total bottles archived. `groupIds` maps each line to every archived row it
  // stands for.
  const { lines, groupIds } = useMemo(() => {
    const ids = new Map<string, string[]>();
    if (!isArchiveView) return { lines: filtered, groupIds: ids };
    const out = archiveLines(filtered.map((f) => f.wine)).map((g): CellarListRowData => {
      ids.set(g.rep.id, g.rows.map((r) => r.id));
      return { wine: g.rep, bottles: g.totalQuantity };
    });
    return { lines: out, groupIds: ids };
  }, [filtered, isArchiveView]);

  // Nulls sort to the bottom either way. "Recent" is most recently added, or in
  // the archive most recently archived (a full archive keeps the row's old
  // created_at).
  const rows = useMemo(() => {
    const recent = (w: CellarWine) => new Date((isArchiveView ? w.archived_at : null) ?? w.created_at).getTime();
    const compare = (a: CellarWine, b: CellarWine): number => {
      switch (sort) {
        case 'est_desc':    return (bottleValue(b) ?? -1) - (bottleValue(a) ?? -1);
        case 'est_asc':     return (bottleValue(a) ?? Infinity) - (bottleValue(b) ?? Infinity);
        case 'purch_desc':  return Number(b.purchase_price ?? -1) - Number(a.purchase_price ?? -1);
        case 'purch_asc':   return Number(a.purchase_price ?? Infinity) - Number(b.purchase_price ?? Infinity);
        case 'critic_desc': return (b.critic_score ?? -1) - (a.critic_score ?? -1);
        case 'critic_asc':  return (a.critic_score ?? Infinity) - (b.critic_score ?? Infinity);
        case 'your_desc':   return (visibleReviewScore(b) ?? -1) - (visibleReviewScore(a) ?? -1);
        case 'your_asc':    return (visibleReviewScore(a) ?? Infinity) - (visibleReviewScore(b) ?? Infinity);
        default:
          return (recent(b) - recent(a)) || (new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
    };
    return [...lines].sort((a, b) => compare(a.wine, b.wine));
  }, [lines, sort, isArchiveView]);

  const totalBottles = useMemo(() => rows.reduce((n, r) => n + r.bottles, 0), [rows]);
  // Matching wines with no critic score or market value yet ("Update all").
  const missingIntel = useMemo(() => filtered.map((r) => r.wine).filter(isMissingIntel), [filtered]);

  return {
    location, setLocation, country, setCountry, colour, setColour, maturity, setMaturity,
    region, setRegion, sort, setSort, search, setSearch,
    countries,
    rows,
    totalBottles,
    missingIntel,
    groupIds,
    // The single storage unit being looked at, if any — an archive started
    // here takes its bottles from there first.
    unitFilter: unitOf(location),
  };
}

// Your Cellar Archive shows one line per wine (same identity and bottle size),
// not one per archive event. A line's rep is its most recently archived entry,
// so it sorts by the wine's last trip to the archive; `rows` are every archived
// entry it stands for, newest first. The archived wine card stands for the same
// line (its delete and Return to Cellar act on these rows).
export function archiveLines(archived: CellarWine[]) {
  const archivedAt = (w: CellarWine) => new Date(w.archived_at ?? w.created_at).getTime();
  const bySize = new Map<number, CellarWine[]>();
  for (const wine of [...archived].sort((a, b) => archivedAt(b) - archivedAt(a))) {
    const ml = wine.bottle_size_ml ?? 750;
    const sameSize = bySize.get(ml);
    if (sameSize) sameSize.push(wine); else bySize.set(ml, [wine]);
  }
  return [...bySize.values()].flatMap((rows) => groupWinesByIdentity(rows));
}
