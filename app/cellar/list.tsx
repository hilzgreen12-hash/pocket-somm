import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks } from '../../src/api/racks';
import { supabase } from '../../src/api/supabase';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { inferWineStyle } from '../../src/utils/wineStyle';
import { inferCountry } from '../../src/utils/wineCountry';
import { formatCurrency } from '../../src/constants/currency';
import { bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';
import type { CellarWine } from '../../src/types/wine';

type SortMode =
  | 'recent'
  | 'est_desc' | 'est_asc'
  | 'purch_desc' | 'purch_asc'
  | 'critic_desc' | 'critic_asc'
  | 'your_desc' | 'your_asc';

// The list defaults to most-recently-added (handled implicitly); the Price
// and Score chips each offer the four directional sorts plus a reset.
const PRICE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'est_desc',   label: 'Estimated Price Descending' },
  { value: 'est_asc',    label: 'Estimated Price Ascending' },
  { value: 'purch_desc', label: 'Purchase Price Descending' },
  { value: 'purch_asc',  label: 'Purchase Price Ascending' },
];

const SCORE_SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'critic_desc', label: 'Critic Score Descending' },
  { value: 'critic_asc',  label: 'Critic Score Ascending' },
  { value: 'your_desc',   label: 'Your Score Descending' },
  { value: 'your_asc',    label: 'Your Score Ascending' },
];

const PRICE_SORTS: SortMode[] = ['est_desc', 'est_asc', 'purch_desc', 'purch_asc'];
const SCORE_SORTS: SortMode[] = ['critic_desc', 'critic_asc', 'your_desc', 'your_asc'];

const COLOUR_OPTIONS = ['All', 'Red', 'White', 'Sparkling', 'Other'];

type FilterField = 'rack' | 'country' | 'colour' | 'price' | 'score' | 'favourite' | null;

type FavouriteFilter = 'all' | 'favourites';
const FAVOURITE_OPTIONS: { value: FavouriteFilter; label: string }[] = [
  { value: 'all', label: 'All wines' },
  { value: 'favourites', label: 'Favourites only' },
];

// Archived view — last chip on the filter carousel. Swaps the list source
// from live cellar wines to archived ones (replaces the old Cellar tab
// "Archived Wines" button).
type ArchivedFilter = 'hide' | 'include' | 'only';

export default function FullCellarListScreen() {
  const { session } = useAuth();
  const { wines, isLoading } = useCellar();
  const { wines: archivedWines } = useArchive();
  const { racks } = useRacks();
  const qc = useQueryClient();

  function handleLongPressWine(wine: CellarWine) {
    showAlert({
      title: wine.wine_name + (wine.vintage ? ` ${wine.vintage}` : ''),
      body: 'Permanently remove this wine from your records? This can\'t be undone.',
      buttons: [
        {
          text: 'Delete wine',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearWineFromRacks(wine.id);
              const { error } = await supabase.from('cellar_wines').delete().eq('id', wine.id);
              if (error) throw error;
              qc.invalidateQueries({ queryKey: ['cellar'] });
              qc.invalidateQueries({ queryKey: ['cellar-archive'] });
              qc.invalidateQueries({ queryKey: ['slot-assignments'] });
              qc.invalidateQueries({ queryKey: ['rack-slots'] });
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

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
  const [favouriteFilter, setFavouriteFilter] = useState<FavouriteFilter>('all');
  const [archivedFilter, setArchivedFilter] = useState<ArchivedFilter>('hide');
  const [openDropdown, setOpenDropdown] = useState<FilterField>(null);
  const [search, setSearch] = useState('');
  // Add-wine chooser + scan overlay. Mirrors the Cellar tab's
  // "Add Wine / Generate Wine Intel" flow so the user can kick the
  // same scan / upload / manual entry path from this screen without
  // having to bounce back to the tab landing page.
  const [addWineOpen, setAddWineOpen] = useState(false);
  const [scanningLabel, setScanningLabel] = useState(false);
  const { setImage, setWineDetails, setError, reset: resetLabelStore } = useLabelStore();

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setScanningLabel(true);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    } finally {
      setScanningLabel(false);
    }
    router.push('/label/confirm');
  }

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

  // Apply filters. The search query is applied last so the chips still
  // own their truth — typing a query just narrows whatever filters are on.
  const q = search.trim().toLowerCase();
  // Archived view swaps the source list; the other filters still apply.
  const baseWines = archivedFilter === 'only'
    ? archivedWines
    : archivedFilter === 'include'
      ? [...wines, ...archivedWines]
      : wines;
  const filtered = baseWines.filter((w) => {
    if (rackFilter !== 'All') {
      if (rackFilter === 'Unassigned') {
        if (wineToRackId[w.id]) return false;
      } else if (wineToRackId[w.id] !== rackFilter) {
        return false;
      }
    }
    if (countryFilter !== 'All' && inferCountry(w.region) !== countryFilter) return false;
    if (colourFilter !== 'All' && wineStyle(w) !== colourFilter) return false;
    if (favouriteFilter === 'favourites' && !w.is_favourite) return false;
    if (q) {
      const hay = [w.producer, w.wine_name, w.region, w.grape_variety, w.vintage]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort. Default ('recent') is newest-added first; the Price/Score chips
  // override with directional sorts. Nulls sort to the bottom either way.
  const sorted = [...filtered].sort((a, b) => {
    switch (sortMode) {
      case 'est_desc':   return Number(b.estimated_value ?? -1) - Number(a.estimated_value ?? -1);
      case 'est_asc':    return Number(a.estimated_value ?? Infinity) - Number(b.estimated_value ?? Infinity);
      case 'purch_desc': return Number(b.purchase_price ?? -1) - Number(a.purchase_price ?? -1);
      case 'purch_asc':  return Number(a.purchase_price ?? Infinity) - Number(b.purchase_price ?? Infinity);
      case 'critic_desc': return (b.critic_score ?? -1) - (a.critic_score ?? -1);
      case 'critic_asc':  return (a.critic_score ?? Infinity) - (b.critic_score ?? Infinity);
      case 'your_desc':   return (b.review_score ?? -1) - (a.review_score ?? -1);
      case 'your_asc':    return (a.review_score ?? Infinity) - (b.review_score ?? Infinity);
      default:            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalBottles = filtered.reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  const rackOptions = useMemo(() => {
    const opts: { value: string; label: string }[] = [{ value: 'All', label: 'All racks' }];
    for (const r of racks) opts.push({ value: r.id, label: r.name });
    opts.push({ value: 'Unassigned', label: 'Not in a rack' });
    return opts;
  }, [racks]);

  const rackLabel = rackOptions.find((o) => o.value === rackFilter)?.label ?? 'All racks';
  const priceActive = PRICE_SORTS.includes(sortMode);
  const scoreActive = SCORE_SORTS.includes(sortMode);
  const priceLabel = priceActive ? (PRICE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Any') : 'Any';
  const scoreLabel = scoreActive ? (SCORE_SORT_OPTIONS.find((o) => o.value === sortMode)?.label ?? 'Any') : 'Any';
  const favouriteLabel = FAVOURITE_OPTIONS.find((o) => o.value === favouriteFilter)?.label ?? 'All wines';

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
    if (field === 'price') {
      return {
        title: 'Sort by Price',
        options: [{ value: 'recent', label: 'Recently added (default)' }, ...PRICE_SORT_OPTIONS],
        selected: sortMode,
        onSelect: (v) => setSortMode(v as SortMode),
      };
    }
    if (field === 'score') {
      return {
        title: 'Sort by Score',
        options: [{ value: 'recent', label: 'Recently added (default)' }, ...SCORE_SORT_OPTIONS],
        selected: sortMode,
        onSelect: (v) => setSortMode(v as SortMode),
      };
    }
    if (field === 'favourite') {
      return {
        title: 'Favourites',
        options: FAVOURITE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
        selected: favouriteFilter,
        onSelect: (v) => setFavouriteFilter(v as FavouriteFilter),
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
        <TouchableOpacity
          onPress={() => setAddWineOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
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

      {/* Filter row — Sort first so the most common interaction (changing
          order) is closest to the user's thumb. Rack / Country / Colour
          follow in descending likelihood of use. */}
      <Text style={styles.filterHint}>Swipe to see all filters →</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        <TouchableOpacity style={[styles.filterChip, priceActive && styles.sortChip]} onPress={() => setOpenDropdown('price')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Price</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'price' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, priceActive && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{priceLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, scoreActive && styles.sortChip]} onPress={() => setOpenDropdown('score')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Score</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'score' ? '▴' : '▾'}</Text>
          </View>
          <Text style={[styles.filterChipValue, scoreActive && { color: colors.gold }]} numberOfLines={1} ellipsizeMode="tail">{scoreLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('favourite')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Favourites</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'favourite' ? '▴' : '▾'}</Text>
          </View>
          <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{favouriteLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('rack')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Rack</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'rack' ? '▴' : '▾'}</Text>
          </View>
          <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{rackLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('country')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Country</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'country' ? '▴' : '▾'}</Text>
          </View>
          <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{countryFilter === 'All' ? 'All' : countryFilter}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip} onPress={() => setOpenDropdown('colour')}>
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Colour</Text>
            <Text style={styles.filterChipChevron}>{openDropdown === 'colour' ? '▴' : '▾'}</Text>
          </View>
          <Text style={styles.filterChipValue} numberOfLines={1} ellipsizeMode="tail">{colourFilter === 'All' ? 'All' : colourFilter}</Text>
        </TouchableOpacity>
        {/* Archived view toggle — replaces the old Cellar-tab Archived Wines
            button. Tap to swap the list between live and archived wines. */}
        <TouchableOpacity
          style={styles.filterChip}
          onPress={() => setArchivedFilter((f) => (f === 'hide' ? 'include' : f === 'include' ? 'only' : 'hide'))}
        >
          <View style={styles.filterChipHeadingRow}>
            <Text style={styles.filterChipLabel}>Archived</Text>
          </View>
          <Text
            style={[styles.filterChipValue, archivedFilter !== 'hide' && { color: colors.gold }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {archivedFilter === 'only' ? 'Only Archived' : archivedFilter === 'include' ? 'Include' : 'Hide'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Search sits below the filter chips and narrows whatever the chips
          already filter — handy when there are dozens of wines in the
          selected rack / colour / country. */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search producer, wine, region…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.searchClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          {wines.length === 0 ? (
            <>
              <Text style={styles.emptyTitle}>Your cellar is empty</Text>
              <Text style={styles.emptyBody}>Add wines to your cellar to generate your list.</Text>
            </>
          ) : (
            <>
              <Text style={styles.emptyTitle}>No wines match</Text>
              <Text style={styles.emptyBody}>Try clearing some filters to see more of your cellar.</Text>
            </>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={{ paddingTop: spacing.xs, paddingBottom: 60 }}
        >
          {sorted.map((w) => {
            const headerLine = wineHeaderLine(w.producer, w.wine_name, w.vintage);
            // Bottle size appended to the region line only when it's
            // non-standard — 750ml is the default, mentioning it on every
            // row is noise. A magnum stands out by being labelled.
            const subParts = [w.region, w.grape_variety].filter(Boolean);
            if (w.bottle_size_ml && w.bottle_size_ml !== 750) {
              subParts.push(bottleSizeLabel(w.bottle_size_ml));
            }
            const valueText = w.estimated_value != null
              ? formatCurrency(Number(w.estimated_value), w.estimated_value_currency, { decimals: 0 })
              : null;
            return (
              <TouchableOpacity
                key={w.id}
                style={styles.row}
                onPress={() => router.push(`/cellar/${w.id}`)}
                onLongPress={() => handleLongPressWine(w)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {w.is_favourite ? <Text style={styles.rowStar}>★ </Text> : null}
                    {headerLine}
                  </Text>
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

      {/* Add-wine chooser — Scan / Upload / Manual. Same three-way
          flow as the Cellar tab's "Add Wine / Generate Wine Intel"
          button so the user lands on the same /label/* downstream
          screens regardless of which surface they triggered it from. */}
      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a wine</Text>
            <Text style={styles.addBody}>Scan the label or upload a photo and Vinster will pull in the details — or enter them yourself.</Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera'); }}
            >
              <Text style={styles.addBtnText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUpload(); }}
            >
              <Text style={styles.addBtnText}>Upload A Wine Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { marginTop: spacing.sm }]}
              onPress={() => {
                setAddWineOpen(false);
                // Clear any prior scan so Confirm Wine Details opens
                // blank for the user to fill in by hand.
                resetLabelStore();
                router.push('/label/confirm?manual=1');
              }}
            >
              <Text style={styles.addBtnText}>Manual Input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddWineOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Scanning overlay — sits on top of the screen while OCR runs
          so the user has a visual cue between the picker dismiss and
          the confirm screen mounting (the round-trip can take 5–15s). */}
      {scanningLabel && (
        <View style={styles.scanningOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.scanningText}>Reading the label…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  // Cormorant — add link reads as a button
  addLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.5, width: 50, textAlign: 'right' },
  // Inter — body in modal
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  scanningOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  // Inter — body (processing status)
  scanningText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
  // Cormorant — page header
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  summaryRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — summary read-out
  summaryText: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Inter — hint
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  listScroll: { flex: 1 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 120, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  sortChip: { borderColor: colors.gold },
  // Inter — chip label
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Inter — chip value read-out
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  // Heading row inside a filter chip — label on the left, a small up/down
  // chevron on the right that flips when this chip's dropdown is open, so
  // users can see the chip is a selectable filter.
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.xs, marginBottom: spacing.sm },
  // Inter — form input
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { paddingHorizontal: spacing.sm, paddingVertical: 4 },
  // Inter — clear glyph
  searchClearText: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  // Cormorant — empty-state header
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Inter — empty body
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1, marginRight: spacing.md },
  // Inter — wine card name
  rowName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  rowStar: { color: colors.gold, fontSize: 16 },
  // Inter — wine detail caption
  rowDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 2 },
  // Inter — score value
  rowScore: { fontSize: 13, fontFamily: fonts.bodyBold, color: colors.gold },
  // Inter — value read-out
  rowValue: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.text },
  // Inter — quantity caption
  rowQty: { fontSize: 11, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  // Cormorant — modal pop-up title
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  // Cormorant — option button text
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  // Inter — check glyph
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Inter — cancel link (not a button)
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
