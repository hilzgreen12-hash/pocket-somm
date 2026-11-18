import { useEffect, useMemo, useState } from 'react';
import { useCustomFilters } from './useCustomFilters';
import { showAlert } from '../components/AppAlert';
import { foldAccents, matchesWineSearch } from '../utils/wineIdentity';
import type { CellarWine } from '../types/wine';

// One wine in one cell of a bin (a wine can sit in several cells).
export type BinEntry = { wine: CellarWine; cellId: string; label: string | null };

// What a bin screen highlights: search matches, a saved filter's wines, or one
// wine picked from the list (or arrived at via Quick Command "Find a bottle").
// Saved filters live in custom_filters scoped to the bin's id, as for racks.
export function useBinFilters(binId: string, entries: BinEntry[], highlight?: string) {
  const { customFilters, create, setWines, rename, remove } = useCustomFilters(binId);
  const [searchQuery, setSearchQuery] = useState('');
  const [listOpen, setListOpen] = useState(false);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  useEffect(() => { setHighlightedWineId(highlight ?? null); }, [binId, highlight]);

  const q = foldAccents(searchQuery.trim());
  const filteredEntries = useMemo(() => (q
    ? entries.filter(({ wine }) => matchesWineSearch([wine.producer, wine.wine_name, wine.region, wine.grape_variety, wine.vintage], q))
    : entries), [entries, q]);

  const highlightedCellIds = useMemo(() => {
    const cellsOf = (keep: (e: BinEntry) => boolean) => new Set(entries.filter(keep).map((e) => e.cellId));
    if (q) return new Set(filteredEntries.map((e) => e.cellId));
    if (activeFilterId) {
      const ids = new Set(customFilters.find((f) => f.id === activeFilterId)?.wineIds ?? []);
      return cellsOf((e) => ids.has(e.wine.id));
    }
    if (highlightedWineId) return cellsOf((e) => e.wine.id === highlightedWineId);
    return new Set<string>();
  }, [q, filteredEntries, activeFilterId, customFilters, highlightedWineId, entries]);

  function search(text: string) {
    setSearchQuery(text);
    setActiveFilterId(null);
    setHighlightedWineId(null);
  }
  // Light up every cell holding this wine (null clears it).
  function highlightWine(wineId: string | null) {
    setActiveFilterId(null);
    setSearchQuery('');
    setHighlightedWineId(wineId);
  }
  function toggleFilter(id: string) {
    setActiveFilterId((prev) => (prev === id ? null : id));
    setHighlightedWineId(null);
    setSearchQuery('');
  }

  // The filter builder: name it and tick the wines it holds.
  const [editor, setEditor] = useState<{ id: string | null; name: string; wineIds: Set<string> } | null>(null);
  const [saving, setSaving] = useState(false);
  const openNewFilter = () => setEditor({ id: null, name: '', wineIds: new Set() });
  function openFilterOptions(f: { id: string; name: string; wineIds: string[] }) {
    showAlert({
      title: f.name,
      body: 'Rename this filter or change the wines it holds, or delete it. Your wines stay in the cellar either way.',
      buttons: [
        { text: 'Rename / Add / Remove Wines', onPress: () => setEditor({ id: f.id, name: f.name, wineIds: new Set(f.wineIds) }) },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeFilterId === f.id) setActiveFilterId(null); remove.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function toggleEditorWine(id: string) {
    setEditor((e) => {
      if (!e) return e;
      const wineIds = new Set(e.wineIds);
      if (wineIds.has(id)) wineIds.delete(id); else wineIds.add(id);
      return { ...e, wineIds };
    });
  }
  async function saveFilter() {
    if (!editor) return;
    const name = editor.name.trim();
    if (!name) { showAlert({ title: 'Name needed', body: 'Give your filter a name first.' }); return; }
    const inBin = new Set(entries.map((e) => e.wine.id));
    const wineIds = [...editor.wineIds].filter((id) => inBin.has(id));
    setSaving(true);
    try {
      if (editor.id) {
        await rename.mutateAsync({ filterId: editor.id, name });
        await setWines.mutateAsync({ filterId: editor.id, wineIds });
      } else {
        await create.mutateAsync({ name, wineIds });
      }
      setEditor(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return {
    customFilters, searchQuery, search, listOpen, setListOpen, activeFilterId, toggleFilter,
    highlightedWineId, highlightWine, filteredEntries, highlightedCellIds,
    showList: listOpen || q.length > 0,
    editor, setEditor, saving, openNewFilter, openFilterOptions, toggleEditorWine, saveFilter,
  };
}
