import { useEffect, useMemo, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useCustomFilters } from '../../hooks/useCustomFilters';
import { foldAccents, matchesWineSearch } from '../../utils/wineIdentity';
import { wineHeaderLine } from '../../utils/wineHeader';
import { wineDrinkingStage, DRINKING_STAGE_OPTIONS, STAGE_SEARCH_TERMS } from '../../utils/maturity';
import { WineIdentityHeader } from '../WineIdentityHeader';
import { RenameModal } from '../RenameModal';
import { showAlert } from '../AppAlert';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import type { CellarWine } from '../../types/wine';

export type RackWine = { wine: CellarWine; count: number };

// Words a user might type for each drinking-window status, so the rack search
// can find "drinking now" or "declining" bottles as well as names and regions.
// (Shared with every maturity search: utils/maturity STAGE_SEARCH_TERMS.)

// The drinking-window stages for the Maturity filter chip.
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...DRINKING_STAGE_OPTIONS,
];

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Search the rack's wines. Status words count only as whole terms ("young",
// "drinking now" — never "drink" inside "drinking"); any other words must ALSO
// match the wine's details. A wine whose own name holds the words ("Young
// Vines") still matches on its name.
export function searchRackWines(wines: RackWine[], query: string): RackWine[] {
  const q = foldAccents(query.trim());
  if (!q) return wines;
  const statuses = new Set<string>();
  let rest = ` ${q} `;
  for (const { term, stages } of STAGE_SEARCH_TERMS) {
    const re = new RegExp(`\\s${escapeRe(term)}(?=\\s)`, 'g');
    if (re.test(rest)) { stages.forEach((st) => statuses.add(st)); rest = rest.replace(re, ' '); }
  }
  const fields = (w: CellarWine) => [w.producer, w.wine_name, w.region, w.grape_variety, w.vintage];
  return wines.filter(({ wine }) =>
    matchesWineSearch(fields(wine), q)
    || (statuses.size > 0 && statuses.has(wineDrinkingStage(wine)) && matchesWineSearch(fields(wine), rest)));
}

// Which bottles the rack grid lights up: search matches, a maturity, a saved
// filter, or one wine (from the list, a deep link or "Highlight All Bottles").
// One at a time — choosing one clears the others.
export function useRackFilters(rackId: string, winesInRack: RackWine[], initialHighlight: string | null) {
  // The rack's saved (custom) filters.
  const saved = useCustomFilters(rackId);
  const [searchQuery, setSearchQuery] = useState('');
  const [maturity, setMaturity] = useState('');
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(initialHighlight);
  const [listOpen, setListOpen] = useState(false);
  const [maturityOpen, setMaturityOpen] = useState(false);

  // A different rack (swipe) or deep link starts clean, lighting up the bottle
  // the user came to find, if any.
  useEffect(() => {
    setSearchQuery(''); setMaturity(''); setActiveFilterId(null);
    setListOpen(false); setMaturityOpen(false);
    setHighlightedWineId(initialHighlight);
  }, [rackId, initialHighlight]);

  const filteredWines = useMemo(() => searchRackWines(winesInRack, searchQuery), [winesInRack, searchQuery]);

  const highlightedIds = useMemo<ReadonlySet<string>>(() => {
    if (searchQuery.trim()) return new Set(filteredWines.map(({ wine }) => wine.id));
    if (maturity) return new Set(winesInRack.filter(({ wine }) => wineDrinkingStage(wine) === maturity).map(({ wine }) => wine.id));
    if (activeFilterId) return new Set(saved.customFilters.find((f) => f.id === activeFilterId)?.wineIds ?? []);
    return highlightedWineId ? new Set([highlightedWineId]) : new Set<string>();
  }, [searchQuery, filteredWines, maturity, winesInRack, activeFilterId, saved.customFilters, highlightedWineId]);

  function only(next: { search?: string; maturity?: string; filterId?: string | null; wineId?: string | null }) {
    setSearchQuery(next.search ?? '');
    setMaturity(next.maturity ?? '');
    setActiveFilterId(next.filterId ?? null);
    setHighlightedWineId(next.wineId ?? null);
    setMaturityOpen(false);
  }

  return {
    saved, searchQuery, maturity, activeFilterId, highlightedWineId, listOpen, maturityOpen,
    filteredWines, highlightedIds,
    setListOpen, setMaturityOpen,
    search: (text: string) => only({ search: text }),
    selectMaturity: (value: string) => only({ maturity: value }),
    toggleFilter: (id: string) => only({ filterId: activeFilterId === id ? null : id }),
    highlightWine: (id: string) => { only({ wineId: id }); setListOpen(false); },
    clearHighlight: () => only({}),
  };
}

type Filters = ReturnType<typeof useRackFilters>;
type SavedFilter = { id: string; name: string; wineIds: string[] };

// The filter carousel (List / Maturity / saved filters / + Add), the search bar
// and the rack's wine list, plus the saved-filter editor.
export function RackFilters({ filters: f, winesInRack, wines, canEdit, onWineLongPress, onNotify }: {
  filters: Filters;
  winesInRack: RackWine[];
  wines: CellarWine[];
  canEdit: boolean;
  onWineLongPress: (wine: CellarWine) => void;
  onNotify: (msg: string) => void;
}) {
  const { customFilters, create, setWines, rename, remove } = f.saved;
  // The saved-filter editor: null = closed, id null = a new filter.
  const [editor, setEditor] = useState<{ id: string | null; name: string; picked: Set<string>; initial: ReadonlySet<string> } | null>(null);
  const [saving, setSaving] = useState(false);
  const [renameTarget, setRenameTarget] = useState<SavedFilter | null>(null);
  const [renaming, setRenaming] = useState(false);

  // Editor order: wines already in the filter when it opened come first, so
  // rows don't jump as the user ticks.
  const pickerWines = useMemo(() => {
    if (!editor) return [];
    return [...winesInRack].sort((a, b) => Number(editor.initial.has(b.wine.id)) - Number(editor.initial.has(a.wine.id)));
  }, [winesInRack, editor?.initial]);

  async function saveEditor() {
    if (!editor) return;
    const name = editor.name.trim();
    if (!name) { onNotify('Name your filter first'); return; }
    // A rack's filter holds only wines from this rack (an empty one is fine —
    // name it now, fill it later).
    const here = new Set(winesInRack.map(({ wine }) => wine.id));
    const wineIds = [...editor.picked].filter((id) => here.has(id));
    setSaving(true);
    try {
      if (editor.id) {
        await rename.mutateAsync({ filterId: editor.id, name });
        await setWines.mutateAsync({ filterId: editor.id, wineIds });
      } else {
        await create.mutateAsync({ name, wineIds });
      }
      setEditor(null);
      onNotify(`"${name}" filter ${editor.id ? 'updated' : 'created'}`);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function saveRename(name: string) {
    if (!renameTarget) return;
    setRenaming(true);
    try {
      await rename.mutateAsync({ filterId: renameTarget.id, name });
      setRenameTarget(null);
      onNotify(`"${name}" filter renamed`);
    } catch (err) {
      showAlert({ title: 'Could not rename', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setRenaming(false);
    }
  }

  function openFilterOptions(filter: SavedFilter) {
    showAlert({
      title: filter.name,
      body: 'Rename this filter, add or remove the wines it holds, or delete it. Your wines stay in the cellar either way.',
      buttons: [
        { text: 'Add/Remove Wines', onPress: () => setEditor({ id: filter.id, name: filter.name, picked: new Set(filter.wineIds), initial: new Set(filter.wineIds) }) },
        { text: 'Rename Filter', onPress: () => setRenameTarget(filter) },
        { text: 'Delete', style: 'destructive', onPress: () => {
            if (f.activeFilterId === filter.id) f.toggleFilter(filter.id);
            remove.mutate(filter.id);
          } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const highlightedWine = f.highlightedWineId ? wines.find((w) => w.id === f.highlightedWineId) : undefined;
  const highlightedCount = f.highlightedWineId ? (winesInRack.find(({ wine }) => wine.id === f.highlightedWineId)?.count ?? 0) : 0;
  const maturityLabel = MATURITY_OPTIONS.find((o) => o.value === f.maturity)?.label;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={[styles.chip, f.listOpen && styles.chipActive]} onPress={() => { f.setListOpen(!f.listOpen); f.setMaturityOpen(false); }} activeOpacity={0.7}>
          <Text style={[styles.chipText, f.listOpen && styles.chipTextActive]} allowFontScaling={false}>List {f.listOpen ? '▴' : '▾'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.chip, !!f.maturity && styles.chipActive]} onPress={() => { f.setMaturityOpen(!f.maturityOpen); f.setListOpen(false); }} activeOpacity={0.7}>
          <Text style={[styles.chipText, !!f.maturity && styles.chipTextActive]} allowFontScaling={false}>{f.maturity ? (maturityLabel ?? 'Maturity') : 'Maturity'} ▾</Text>
        </TouchableOpacity>
        {customFilters.map((cf) => {
          const active = f.activeFilterId === cf.id;
          return (
            <TouchableOpacity
              key={cf.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => f.toggleFilter(cf.id)}
              onLongPress={canEdit ? () => openFilterOptions(cf) : undefined}
              delayLongPress={400}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1} allowFontScaling={false}>{cf.name}</Text>
            </TouchableOpacity>
          );
        })}
        {canEdit && (
          <TouchableOpacity style={styles.chipAdd} onPress={() => setEditor({ id: null, name: '', picked: new Set(), initial: new Set() })} activeOpacity={0.7}>
            <Text style={styles.chipAddText} allowFontScaling={false}>+ Add</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {f.maturityOpen && (
        <View style={styles.dropdown}>
          {MATURITY_OPTIONS.map((o) => {
            const active = f.maturity === o.value;
            return (
              <TouchableOpacity key={o.value || 'all'} style={[styles.option, active && styles.optionActive]} onPress={() => f.selectMaturity(o.value)} activeOpacity={0.7}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* A maturity with no matches says so — an unlit grid reads as broken. */}
      {!!f.maturity && f.highlightedIds.size === 0 && (
        <Text style={styles.noMatch}>No Matches — no bottles here are {maturityLabel ?? 'that maturity'}.</Text>
      )}

      {highlightedCount > 0 && (
        <View style={styles.highlightNote}>
          <Text style={styles.highlightNoteText} numberOfLines={2}>
            {highlightedCount} bottle{highlightedCount === 1 ? '' : 's'} of {highlightedWine ? (wineHeaderLine(highlightedWine.producer, highlightedWine.wine_name, highlightedWine.vintage) || highlightedWine.wine_name) : 'this wine'} highlighted
          </Text>
          <TouchableOpacity onPress={f.clearHighlight} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.highlightNoteClear}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={f.searchQuery}
          onChangeText={f.search}
          placeholder="Search producer, wine, region, vintage…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {f.searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => f.search('')} style={styles.searchClear}>
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {f.listOpen && (
        <View style={styles.list}>
          {f.filteredWines.length === 0 ? (
            <Text style={styles.empty}>No wines match "{f.searchQuery}"</Text>
          ) : (
            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
              {f.filteredWines.map(({ wine, count }) => {
                const active = f.highlightedWineId === wine.id;
                return (
                  <TouchableOpacity
                    key={wine.id}
                    style={[styles.wineRow, active && styles.wineRowActive]}
                    // Tapping the highlighted wine clears it (the list stays open
                    // so the change is visible); a new one lights up and the list
                    // closes so the grid is unobstructed.
                    onPress={() => (active ? f.clearHighlight() : f.highlightWine(wine.id))}
                    onLongPress={() => onWineLongPress(wine)}
                    delayLongPress={400}
                  >
                    <View style={styles.wineRowMain}>
                      <WineIdentityHeader producer={wine.producer} wineName={wine.wine_name} vintage={wine.vintage} region={wine.region} grape={wine.grape_variety} size="sm" align="left" numberOfLinesName={2} />
                    </View>
                    <Text style={[styles.wineRowCount, active && styles.wineRowCountActive]}>{count} {count === 1 ? 'bottle' : 'bottles'}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Saved-filter editor — name it, then tick the wines it holds. */}
      <Modal visible={!!editor} transparent animationType="fade" onRequestClose={() => setEditor(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{editor?.id ? 'Edit custom filter' : 'New custom filter'}</Text>
            <TextInput
              style={styles.nameInput}
              value={editor?.name ?? ''}
              onChangeText={(name) => setEditor((e) => (e ? { ...e, name } : e))}
              placeholder="Filter name (e.g. Christmas Wines)"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.pickHint}>Choose wines from this location for the filter (optional) — {editor?.picked.size ?? 0} selected</Text>
            <ScrollView style={{ maxHeight: 320 }} keyboardShouldPersistTaps="handled">
              {pickerWines.length === 0 ? (
                <Text style={styles.empty}>No wines placed here yet — you can name the filter now and add wines later.</Text>
              ) : pickerWines.map(({ wine: w }) => {
                const checked = !!editor?.picked.has(w.id);
                return (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.pickRow}
                    onPress={() => setEditor((e) => {
                      if (!e) return e;
                      const picked = new Set(e.picked);
                      if (picked.has(w.id)) picked.delete(w.id); else picked.add(w.id);
                      return { ...e, picked };
                    })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.checkbox, checked && styles.checkboxOn]}>{checked ? '☑' : '☐'}</Text>
                    <Text style={styles.pickName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditor(null)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={saveEditor} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving…' : editor?.id ? 'Save Changes' : 'Save Filter'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <RenameModal
        visible={!!renameTarget}
        initialName={renameTarget?.name ?? ''}
        title="Rename filter"
        saving={renaming}
        onSave={saveRename}
        onClose={() => setRenameTarget(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  chipScroll: { flexGrow: 0, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  chipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.gold },
  chipAdd: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md },
  chipAddText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  dropdown: { marginHorizontal: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: 'rgba(212,176,96,0.12)' },
  optionText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  optionTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  noMatch: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  highlightNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  highlightNoteText: { flex: 1, fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.text },
  highlightNoteClear: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, paddingHorizontal: spacing.md },
  // Inter — form input
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  searchClear: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  searchClearText: { fontSize: 13, color: colors.textMuted },
  list: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  empty: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  wineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { borderBottomColor: colors.gold },
  wineRowMain: { flex: 1 },
  wineRowCount: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  wineRowCountActive: { color: colors.gold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  nameInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  pickHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  checkbox: { fontSize: 20, color: colors.textMuted },
  checkboxOn: { color: colors.gold },
  pickName: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  modalActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  modalCancel: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
