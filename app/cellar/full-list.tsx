import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { getSlotAssignments } from '../../src/api/racks';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { inferWineStyle } from '../../src/utils/wineStyle';
import { inferCountry } from '../../src/utils/wineCountry';
import { formatCurrency } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

type SortMode = 'recent' | 'score' | 'value';

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'recent', label: 'Recently added' },
  { value: 'score',  label: 'Score: high to low' },
  { value: 'value',  label: 'Estimated value: high to low' },
];

const COLOUR_OPTIONS = ['All', 'Red', 'White', 'Sparkling', 'Other'];

type FilterField = 'rack' | 'country' | 'colour' | 'sort' | null;

export default function FullCellarListScreen() {
  const { session } = useAuth();
  const { wines, isLoading } = useCellar();
  const { racks } = useRacks();

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });

  const wineToRackId: Record<string, string> = {};
  for (const slot of slotAssignments) wineToRackId[slot.cellar_wine_id] = slot.rack_id;

  const [rackFilter, setRackFilter] = useState<string>('All');           // 'All' | rackId | 'Unassigned'
  const [countryFilter, setCountryFilter] = useState<string>('All');     // 'All' | country canonical
  const [colourFilter, setColourFilter] = useState<string>('All');       // 'All' | 'Red' | 'White' | 'Sparkling' | 'Other'
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);

  // Compute available filter options from the actual cellar
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const w of wines) {
      const c = inferCountry(w.region);
      if (c) set.add(c);
    }
    return ['All', ...Array.from(set).sort()];
  }, [wines]);

  const wineStyle = (w: CellarWine): 'Red' | 'White' | 'Sparkling' | 'Other' => {
    const s = inferWineStyle({ style: (w as any).style, region: w.region, grape_variety: w.grape_variety });
    if (s === 'Red') return 'Red';
    if (s === 'White') return 'White';
    if (s === 'Sparkling') return 'Sparkling';
    return 'Other';
  };

  // Apply filters
  const filtered = wines.filter((w) => {
    if (rackFilter !== 'All') {
      if (rackFilter === 'Unassigned') {
        if (wineToRackId[w.id]) return false;
      } else if (wineToRackId[w.id] !== rackFilter) {
        return false;
      }
    }
    if (countryFilter !== 'All' && inferCountry(w.region) !== countryFilter) return false;
    if (colourFilter !== 'All' && wineStyle(w) !== colourFilter) return false;
    return true;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === 'score') {
      return (b.critic_score ?? -1) - (a.critic_score ?? -1);
    }
    if (sortMode === 'value') {
      return Number(b.estimated_value ?? 0) - Number(a.estimated_value ?? 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalBottles = filtered.reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  const rackOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: 'All', label: 'All racks' }];
    for (const r of racks) opts.push({ value: r.id, label: r.name });
    opts.push({ value: 'Unassigned', label: 'Not in a rack' });
    return opts;
  }, [racks]);

  const rackLabel = rackOptions.find((o) => o.value === rackFilter)?.label ?? 'All racks';
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Recently added';

  function dropdownConfig(field: FilterField): { title: string; options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void } | null {
    if (field === 'rack') {
      return { title: 'Filter by rack', options: rackOptions, selected: rackFilter, onSelect: setRackFilter };
    }
    if (field === 'country') {
      return {
        title: 'Filter by country',
        options: availableCountries.map((c) => ({ value: c, label: c === 'All' ? 'All countries' : c })),
        selected: countryFilter,
        onSelect: setCountryFilter,
      };
    }
    if (field === 'colour') {
      return {
        title: 'Filter by colour',
        options: COLOUR_OPTIONS.map((c) => ({ value: c, label: c === 'All' ? 'All colours' : c })),
        selected: colourFilter,
        onSelect: setColourFilter,
      };
    }
    if (field === 'sort') {
      return {
        title: 'Sort',
        options: SORT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
        selected: sortMode,
        onSelect: (v) => setSortMode(v as SortMode),
      };
    }
    return null;
  }

  const activeDropdown = dropdownConfig(openDropdown);

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
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Full Cellar List</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your cellar"
          body="Track every bottle in your collection — sign in to see your full cellar list."
        />
      ) : (
        <>

      {/* Summary row */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {filtered.length} {filtered.length === 1 ? 'wine' : 'wines'} · {totalBottles} {totalBottles === 1 ? 'bottle' : 'bottles'}
        </Text>
      </View>

      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('rack')}>
          <Text style={styles.filterChipLabel}>Rack</Text>
          <Text style={styles.filterChipValue}>{rackLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('country')}>
          <Text style={styles.filterChipLabel}>Country</Text>
          <Text style={styles.filterChipValue}>{countryFilter === 'All' ? 'All' : countryFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('colour')}>
          <Text style={styles.filterChipLabel}>Colour</Text>
          <Text style={styles.filterChipValue}>{colourFilter === 'All' ? 'All' : colourFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, styles.sortChip]} onPress={() => setOpenDropdown('sort')}>
          <Text style={styles.filterChipLabel}>Sort</Text>
          <Text style={styles.filterChipValue}>{sortLabel}</Text>
        </TouchableOpacity>
      </ScrollView>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No wines match</Text>
          <Text style={styles.emptyBody}>Try clearing some filters to see more of your cellar.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {sorted.map((w) => {
            const headerLine = wineHeaderLine(w.producer, w.wine_name, w.vintage);
            const subParts = [w.region, w.grape_variety].filter(Boolean);
            const valueText = w.estimated_value != null
              ? formatCurrency(Number(w.estimated_value), w.estimated_value_currency, { decimals: 0 })
              : null;
            return (
              <TouchableOpacity
                key={w.id}
                style={styles.row}
                onPress={() => router.push(`/cellar/${w.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>{headerLine}</Text>
                  {subParts.length > 0 && <Text style={styles.rowDetail} numberOfLines={1}>{subParts.join(' · ')}</Text>}
                </View>
                <View style={styles.rowRight}>
                  {w.critic_score != null && <Text style={styles.rowScore}>{w.critic_score} pts</Text>}
                  {valueText && <Text style={styles.rowValue}>{valueText}</Text>}
                  <Text style={styles.rowQty}>{w.quantity} btl</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
        </>
      )}

      <Modal visible={!!activeDropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {activeDropdown && (
              <>
                <Text style={styles.modalTitle}>{activeDropdown.title}</Text>
                <ScrollView style={{ maxHeight: 400 }}>
                  {activeDropdown.options.map((opt) => {
                    const active = activeDropdown.selected === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[styles.modalOption, active && styles.modalOptionActive]}
                        onPress={() => {
                          activeDropdown.onSelect(opt.value);
                          setOpenDropdown(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                        {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 0.8 },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.xs },
  filterChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, marginRight: spacing.xs, alignItems: 'flex-start' },
  sortChip: { borderColor: colors.gold },
  filterChipLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipValue: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.text, marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1, marginRight: spacing.md },
  rowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  rowScore: { fontSize: 13, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  rowValue: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowQty: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
});
