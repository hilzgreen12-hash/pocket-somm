import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, useWindowDimensions, ActivityIndicator } from 'react-native';
import { showAlert } from '../../../src/components/AppAlert';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { assignSlot, clearSlot } from '../../../src/api/racks';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { colors, spacing } from '../../../src/constants/theme';
import type { RackSlot, CellarWine } from '../../../src/types/wine';
import * as ScreenOrientation from 'expo-screen-orientation';

const STATUS_COLORS: Record<string, string> = {
  too_young: '#6DBF8A',
  approaching: '#5B9BD5',
  peak: colors.gold,
  declining: colors.error,
  unknown: colors.textMuted,
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

export default function RackGridScreen() {
  const { rackId } = useLocalSearchParams<{ rackId: string }>();
  const { slots, isLoading, assign } = useRack(rackId);
  const { racks } = useRacks();
  // useCellar still needed for the auto-heal that runs on mount; the hook
  // also keeps the cellar query warm so navigating to the wine detail card
  // is instant (no second fetch).
  useCellar();
  const { width } = useWindowDimensions();
  const qc = useQueryClient();

  const { setPendingSlot, pendingWineId, setPendingWineId } = useRackStore();
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [moving, setMoving] = useState<{ row: number; col: number; wineId: string; wineName: string } | null>(null);
  const [movingMsg, setMovingMsg] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  // Auto-clear the "Wine saved to rack" confirmation after a few seconds.
  useEffect(() => {
    if (!savedMsg) return;
    const t = setTimeout(() => setSavedMsg(null), 3000);
    return () => clearTimeout(t);
  }, [savedMsg]);

  // Unlock landscape for this screen; restore portrait on leave
  useEffect(() => {
    ScreenOrientation.unlockAsync().catch(() => {});
    const sub = ScreenOrientation.addOrientationChangeListener((e) => {
      const landscape = e.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
        e.orientationInfo.orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT;
      setIsLandscape(landscape);
    });
    return () => {
      ScreenOrientation.removeOrientationChangeListener(sub);
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const rack = racks.find((r) => r.id === rackId);

  const slotMap = useMemo(() => {
    const map: Record<string, RackSlot> = {};
    slots.forEach((s) => { map[`${s.row_index},${s.col_index}`] = s; });
    return map;
  }, [slots]);

  // Build unique wine list from slots, preserving slot positions for highlight
  const winesInRack = useMemo(() => {
    const map = new Map<string, { wine: CellarWine; count: number }>();
    slots.forEach((s) => {
      const wine = s.wine as CellarWine | null | undefined;
      if (wine && s.cellar_wine_id) {
        const existing = map.get(s.cellar_wine_id);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(s.cellar_wine_id, { wine, count: 1 });
        }
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.wine.wine_name.localeCompare(b.wine.wine_name)
    );
  }, [slots]);

  const PADDING = spacing.xl * 2;
  const GAP = 4;
  const cols = rack?.cols ?? 1;
  // Natural size fills the screen width; minimum 20pt so slots remain tappable.
  // For wide racks the grid scrolls horizontally — no overflow clipping.
  const naturalSlotSize = Math.floor((width - PADDING - GAP * (cols - 1)) / cols);
  const slotSize = Math.max(20, naturalSlotSize);
  const gridFitsScreen = naturalSlotSize >= 20;

  function openSlot(row: number, col: number) {
    // If we're in the middle of a move, treat this tap as the drop target.
    if (moving) {
      // Tapping the source slot itself cancels the move.
      if (moving.row === row && moving.col === col) {
        setMoving(null);
        setMovingMsg(null);
        return;
      }
      handleDrop(row, col);
      return;
    }
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (wine) {
      // Navigate to the same wine detail card that Cellar List uses, so
      // there's a single source of truth for the wine UI.
      router.push(`/cellar/${wine.id}` as any);
    } else if (pendingWineId) {
      assign.mutate(
        { row, col, wineId: pendingWineId },
        { onSuccess: () => setSavedMsg('Wine saved to rack') }
      );
      setPendingWineId(null);
    } else {
      setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols });
      router.push('/label/camera');
    }
  }

  function pickUpSlot(row: number, col: number) {
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (!wine || !slot?.cellar_wine_id) return;
    setMoving({ row, col, wineId: slot.cellar_wine_id, wineName: wine.wine_name });
    setMovingMsg(`Moving ${wine.wine_name} — tap a slot to place, or tap the source slot to cancel`);
  }

  async function handleDrop(toRow: number, toCol: number) {
    if (!moving) return;
    const sourceWine = moving.wineId;
    const destSlot = slotMap[`${toRow},${toCol}`];
    const destWine = destSlot?.cellar_wine_id ?? null;
    setMoving(null);
    setMovingMsg(null);
    try {
      if (destWine) {
        // Swap: source <- dest's wine, dest <- source's wine
        await assignSlot(rackId, moving.row, moving.col, destWine);
        await assignSlot(rackId, toRow, toCol, sourceWine);
      } else {
        // Move into empty slot: clear source, assign dest
        await assignSlot(rackId, toRow, toCol, sourceWine);
        await clearSlot(rackId, moving.row, moving.col);
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    } catch {
      showAlert({ title: 'Move failed', body: 'Could not move the wine. Please try again.' });
    }
  }

  function toggleHighlight(wineId: string) {
    setHighlightedWineId((prev) => (prev === wineId ? null : wineId));
  }

  const filteredWines = useMemo(() => {
    if (!searchQuery.trim()) return winesInRack;
    const q = searchQuery.toLowerCase();
    return winesInRack.filter(({ wine }) =>
      wine.wine_name.toLowerCase().includes(q) ||
      (wine.producer ?? '').toLowerCase().includes(q) ||
      (wine.region ?? '').toLowerCase().includes(q) ||
      (wine.vintage ?? '').toString().includes(q)
    );
  }, [winesInRack, searchQuery]);

  // Auto-highlight when search narrows to a single result; clear when search is cleared
  useEffect(() => {
    if (!searchQuery.trim()) {
      setHighlightedWineId(null);
    } else if (filteredWines.length === 1) {
      setHighlightedWineId(filteredWines[0].wine.id);
    }
  }, [filteredWines, searchQuery]);

  if (isLoading || !rack) {
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
        <Text style={styles.title} numberOfLines={1}>{rack.name}</Text>
        <TouchableOpacity
          style={styles.rotateBtn}
          onPress={() => {
            if (isLandscape) {
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
            } else {
              ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
            }
          }}
        >
          <Text style={styles.rotateBtnText}>{isLandscape ? '↺ Portrait' : '↻ Landscape'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legend}>
        {Object.entries({ peak: 'Peak', approaching: 'Approaching', too_young: 'Too Young', declining: 'Declining' }).map(([k, v]) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[k] }]} />
            <Text style={styles.legendText}>{v}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {moving && movingMsg && (
          <View style={styles.movingBanner}>
            <Text style={styles.movingBannerText} numberOfLines={2}>{movingMsg}</Text>
            <TouchableOpacity onPress={() => { setMoving(null); setMovingMsg(null); }}>
              <Text style={styles.movingCancelLink}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingWineId && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>Tap an empty slot to place this wine</Text>
          </View>
        )}
        {savedMsg && (
          <View style={styles.savedBanner}>
            <Text style={styles.savedBannerText}>{savedMsg} ✓</Text>
          </View>
        )}
        {/* Rack grid — horizontally scrollable for wide racks */}
        {!gridFitsScreen && (
          <Text style={styles.scrollHint}>← Scroll to see full rack →</Text>
        )}
        <ScrollView
          horizontal
          scrollEnabled={!gridFitsScreen}
          showsHorizontalScrollIndicator={!gridFitsScreen}
          contentContainerStyle={{ padding: spacing.xl }}
          bounces={false}
        >
          <View>
            {Array.from({ length: rack.rows }, (_, row) => (
              <View key={row} style={[styles.gridRow, { gap: GAP, marginBottom: GAP }]}>
                {Array.from({ length: rack.cols }, (_, col) => {
                  const slot = slotMap[`${row},${col}`];
                  const wine = slot?.wine as CellarWine | null | undefined;
                  const status = wine?.drinking_window_status ?? null;
                  const isHighlighted = !!highlightedWineId && wine?.id === highlightedWineId;
                  const isDimmed = !!highlightedWineId && !!wine && wine.id !== highlightedWineId;
                  const isMovingSource = !!moving && moving.row === row && moving.col === col;
                  return (
                    <TouchableOpacity
                      key={col}
                      style={[
                        styles.slot,
                        { width: slotSize, height: slotSize },
                        wine
                          ? { backgroundColor: STATUS_COLORS[status ?? 'unknown'] + '33', borderColor: STATUS_COLORS[status ?? 'unknown'] }
                          : styles.slotEmpty,
                        isHighlighted && styles.slotHighlighted,
                        isDimmed && styles.slotDimmed,
                        isMovingSource && styles.slotMovingSource,
                      ]}
                      onPress={() => openSlot(row, col)}
                      onLongPress={() => pickUpSlot(row, col)}
                      delayLongPress={400}
                    >
                      {wine ? (
                        <Text style={[styles.slotText, isHighlighted && styles.slotTextHighlighted]} numberOfLines={2}>
                          {truncate(wine.wine_name, 12)}{wine.vintage ? `\n${wine.vintage}` : ''}
                        </Text>
                      ) : (
                        <Text style={styles.slotPlus}>+</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Wine list */}
        {winesInRack.length > 0 && (
          <View style={styles.wineList}>
            <Text style={styles.wineListHeading}>Wines in this rack</Text>
            <Text style={styles.wineListHint}>Tap a wine to highlight its position. Long-press a slot in the rack to move it.</Text>

            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search wines…"
                placeholderTextColor={colors.textMuted}
                returnKeyType="search"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchClear}>
                  <Text style={styles.searchClearText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredWines.length === 0 && (
              <Text style={styles.searchNoResults}>No wines match "{searchQuery}"</Text>
            )}

            {filteredWines.map(({ wine, count }) => {
              const active = highlightedWineId === wine.id;
              return (
                <TouchableOpacity
                  key={wine.id}
                  style={[styles.wineRow, active && styles.wineRowActive]}
                  onPress={() => toggleHighlight(wine.id)}
                >
                  <View style={styles.wineRowMain}>
                    <Text style={[styles.wineRowName, active && styles.wineRowNameActive]} numberOfLines={2}>
                      {wineHeaderLine(wine.producer, wine.wine_name, wine.vintage)}
                    </Text>
                    {wine.region ? <Text style={styles.wineRowDetail}>{wine.region}</Text> : null}
                  </View>
                  <Text style={[styles.wineRowCount, active && styles.wineRowCountActive]}>
                    {count} {count === 1 ? 'bottle' : 'bottles'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 50 },
  title: { flex: 1, fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'center', letterSpacing: 1 },
  rotateBtn: { alignItems: 'flex-end', width: 80 },
  rotateBtnText: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  scrollHint: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingBottom: spacing.xs },
  slotMovingSource: { borderColor: colors.gold, borderWidth: 2, opacity: 0.4 },
  movingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs, padding: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)' },
  movingBannerText: { flex: 1, fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, lineHeight: 18 },
  movingCancelLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textDecorationLine: 'underline' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  gridRow: { flexDirection: 'row' },
  slot: { borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  slotEmpty: { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
  slotHighlighted: { borderColor: '#FFFFFF', borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.18)' },
  slotDimmed: { opacity: 0.25 },
  slotText: { fontSize: 8, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'center', lineHeight: 10 },
  slotTextHighlighted: { color: '#FFFFFF' },
  slotPlus: { fontSize: 14, color: 'rgba(255,255,255,0.20)', fontFamily: 'CormorantGaramond_400Regular' },
  wineList: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border },
  wineListHeading: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  wineListHint: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text },
  searchClear: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },
  searchClearText: { fontSize: 13, color: colors.textMuted },
  searchNoResults: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.lg },
  wineRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowActive: { borderBottomColor: colors.gold },
  wineRowMain: { flex: 1 },
  wineRowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  wineRowNameActive: { color: colors.gold },
  wineRowDetail: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  wineRowCount: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  wineRowCountActive: { color: colors.gold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  modalProducer: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: 2 },
  modalSub: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginBottom: spacing.md },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  scoreLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  scoreValue: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  tastingNotes: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, paddingVertical: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  noteLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background, minHeight: 72, marginBottom: spacing.md },
  saveNoteButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveNoteText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  clearButton: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  clearButtonText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  cancelButton: { alignItems: 'center', marginTop: spacing.sm },
  cancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  removeHeading: { fontSize: 15, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginTop: spacing.lg, marginBottom: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  fieldLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background, marginBottom: spacing.md },
  rackRemovalMsg: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  savedBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  savedBannerText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, letterSpacing: 0.3 },
  pendingBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm, alignItems: 'center' },
  pendingBannerText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, letterSpacing: 0.3 },
});
