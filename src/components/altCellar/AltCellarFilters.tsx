import { DRINKING_STAGE_OPTIONS } from '../../utils/maturity';
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import type { useAltCellarData, AltCellarView } from '../../hooks/useAltCellarData';
import type { StorageCase } from '../../types/wine';
import type { LocationWineRow } from '../../api/placements';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  ...DRINKING_STAGE_OPTIONS,
];

const VIEW_OPTIONS: { value: AltCellarView; label: string }[] = [
  { value: 'all', label: 'All Wines' },
  { value: 'loose', label: 'Loose Bottles' },
  { value: 'grouped', label: 'Wines Grouped by Case' },
];

// The alt cellar's filter carousel — the found-wine chip (from Quick Command),
// the List view picker, Maturity, then each case as a chip and "+ Add Case" —
// with their dropdowns and the search box beneath.
export function AltCellarFilters({ filters: f, rows, cases, onCaseLongPress, onAddCase }: {
  filters: ReturnType<typeof useAltCellarData>['filters'];
  rows: LocationWineRow[];
  cases: StorageCase[];
  // Both omitted for view-only members.
  onCaseLongPress?: (c: StorageCase) => void;
  onAddCase?: () => void;
}) {
  const [listOpen, setListOpen] = useState(false);
  const [maturityOpen, setMaturityOpen] = useState(false);
  const found = f.highlightOnly ? rows.find((r) => r.id === f.highlightOnly) : undefined;

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row} keyboardShouldPersistTaps="handled">
        {f.highlightOnly ? (
          <TouchableOpacity style={[styles.chip, styles.chipActive]} onPress={() => f.setHighlightOnly(null)} activeOpacity={0.7}>
            <Text style={[styles.chipText, styles.chipTextActive]} numberOfLines={1}>
              {[found?.producer, found?.vintage].filter(Boolean).join(' ') || 'This wine'} ✕
            </Text>
          </TouchableOpacity>
        ) : null}
        {/* The List chip names the view only — a selected case shows on its own chip. */}
        <TouchableOpacity
          style={[styles.chip, f.view !== 'all' && styles.chipActive]}
          onPress={() => { setListOpen((v) => !v); setMaturityOpen(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, f.view !== 'all' && styles.chipTextActive]} allowFontScaling={false}>
            {VIEW_OPTIONS.find((o) => o.value === f.view)?.label} {listOpen ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, !!f.maturity && styles.chipActive]}
          onPress={() => { setMaturityOpen((v) => !v); setListOpen(false); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.chipText, !!f.maturity && styles.chipTextActive]} allowFontScaling={false}>
            {f.maturity ? (MATURITY_OPTIONS.find((o) => o.value === f.maturity)?.label ?? 'Maturity') : 'Maturity'} {maturityOpen ? '▴' : '▾'}
          </Text>
        </TouchableOpacity>
        {/* Tap a case to narrow the list to it (again to clear); long-press to manage it. */}
        {cases.map((c) => {
          const active = f.caseFilter === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => { f.setCaseFilter(active ? '' : c.id); f.setView('all'); }}
              onLongPress={onCaseLongPress ? () => onCaseLongPress(c) : undefined}
              delayLongPress={400}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]} numberOfLines={1} allowFontScaling={false}>{c.name}</Text>
            </TouchableOpacity>
          );
        })}
        {onAddCase ? (
          <TouchableOpacity style={styles.chipAdd} onPress={onAddCase} activeOpacity={0.7}>
            <Text style={styles.chipAddText} allowFontScaling={false}>+ Add Case</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {listOpen ? (
        <View style={styles.dropdown}>
          {VIEW_OPTIONS.map((o) => {
            const active = f.view === o.value && !f.caseFilter;
            return (
              <TouchableOpacity key={o.value} style={[styles.option, active && styles.optionActive]} onPress={() => { f.setView(o.value); f.setCaseFilter(''); setListOpen(false); }} activeOpacity={0.7}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {maturityOpen ? (
        <View style={styles.dropdown}>
          {MATURITY_OPTIONS.map((o) => {
            const active = f.maturity === o.value;
            return (
              <TouchableOpacity key={o.value || 'all'} style={[styles.option, active && styles.optionActive]} onPress={() => { f.setMaturity(o.value); setMaturityOpen(false); }} activeOpacity={0.7}>
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {/* The case chips ("folders") scroll sideways, "+ Add Case" at the end. */}
      <View style={styles.swipeHint}>
        <Text style={styles.swipeHintText}>Swipe to add and view folders</Text>
        <Text style={styles.swipeHintText}>→</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={f.search}
          onChangeText={f.setSearch}
          placeholder="Search producer, wine, region, maturity…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
        />
        {f.search.length > 0 ? (
          <TouchableOpacity onPress={() => f.setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
}

// Matched to the rack/fridge screens so the filters read the same everywhere.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.sm },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md, backgroundColor: colors.surface, maxWidth: 170 },
  chipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.12)' },
  chipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  chipTextActive: { color: colors.gold },
  chipAdd: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 18, paddingVertical: 7, paddingHorizontal: spacing.md },
  chipAddText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  dropdown: { marginHorizontal: spacing.xl, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, overflow: 'hidden' },
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionActive: { backgroundColor: 'rgba(212,176,96,0.12)' },
  optionText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  optionTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  swipeHint: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: spacing.xl, marginTop: -2, marginBottom: spacing.sm },
  swipeHintText: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, letterSpacing: 0.2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
});
