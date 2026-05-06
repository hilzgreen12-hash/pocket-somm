import { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, useWindowDimensions, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useRack, useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { useAuth } from '../../../src/hooks/useAuth';
import { clearWineFromRacks, removeSlotsForWine } from '../../../src/api/racks';
import { colors, spacing } from '../../../src/constants/theme';
import type { RackSlot, CellarWine } from '../../../src/types/wine';
import * as ScreenOrientation from 'expo-screen-orientation';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

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
  const { session } = useAuth();
  const { slots, isLoading, assign, clear } = useRack(rackId);
  const { racks } = useRacks();
  const { wines, updateWine } = useCellar();
  const { width } = useWindowDimensions();
  const qc = useQueryClient();

  const { setPendingSlot, pendingWineId, setPendingWineId } = useRackStore();
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userNote, setUserNote] = useState('');
  const [highlightedWineId, setHighlightedWineId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [removeCount, setRemoveCount] = useState('1');
  const [removeDate, setRemoveDate] = useState(todayISO());
  const [removing, setRemoving] = useState(false);
  const [rackRemovalMsg, setRackRemovalMsg] = useState<string | null>(null);
  const [noteSavedMsg, setNoteSavedMsg] = useState<string | null>(null);

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
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (wine) {
      setUserNote(wine.user_notes ?? '');
      setRemoveCount('1');
      setRemoveDate(todayISO());
      setRackRemovalMsg(null);
      setNoteSavedMsg(null);
      setSelected({ row, col });
      setPickerOpen(true);
    } else if (pendingWineId) {
      assign.mutate({ row, col, wineId: pendingWineId });
      setPendingWineId(null);
    } else {
      setPendingSlot({ rackId, row, col, rows: rack.rows, cols: rack.cols });
      router.push('/label/camera');
    }
  }

  const selectedSlot = selected ? slotMap[`${selected.row},${selected.col}`] : null;
  const assignedWine = selectedSlot?.wine as CellarWine | null | undefined;

  function handleSaveNote() {
    if (!selected || !assignedWine) return;
    // Optimistic: surface confirmation instantly so the user doesn't wait
    // on the network round-trip. The mutation runs in the background and
    // surfaces an Alert only if it actually fails.
    setNoteSavedMsg('Note saved to your cellar');
    setTimeout(() => setNoteSavedMsg(null), 2500);
    updateWine.mutate(
      { id: assignedWine.id, updates: { user_notes: userNote.trim() || null } },
      {
        onSuccess: () => qc.invalidateQueries({ queryKey: ['rack-slots', rackId] }),
        onError: () => {
          setNoteSavedMsg(null);
          Alert.alert('Could not save', 'Your note didn\'t save. Please try again.');
        },
      }
    );
  }

  function handleClear() {
    if (!selected) return;
    clear.mutate({ row: selected.row, col: selected.col });
    setPickerOpen(false);
    setSelected(null);
  }

  async function handleRemoveBottlesFromSlot() {
    if (!assignedWine) return;
    const count = parseInt(removeCount) || 0;
    if (count < 1) {
      Alert.alert('Invalid', 'Enter at least 1 bottle to remove.');
      return;
    }
    if (count > assignedWine.quantity) {
      Alert.alert('Invalid', `You only have ${assignedWine.quantity} bottle${assignedWine.quantity === 1 ? '' : 's'}.`);
      return;
    }

    const newQuantity = assignedWine.quantity - count;
    const removalNote = `${removeDate}: removed ${count} bottle${count === 1 ? '' : 's'}`;
    const updatedNotes = assignedWine.user_notes ? `${assignedWine.user_notes}\n${removalNote}` : removalNote;

    setRemoving(true);
    try {
      if (newQuantity === 0) {
        await updateWine.mutateAsync({
          id: assignedWine.id,
          updates: {
            quantity: 0,
            archived_at: `${removeDate}T12:00:00.000Z`,
            user_notes: updatedNotes,
          },
        });
        await clearWineFromRacks(assignedWine.id);
        if (session?.user.id) {
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
        setPickerOpen(false);
        setSelected(null);
        Alert.alert('Removed from cellar', 'This wine has also been removed from your live cellar rack.');
      } else {
        await updateWine.mutateAsync({
          id: assignedWine.id,
          updates: { quantity: newQuantity, user_notes: updatedNotes },
        });
        const slotsRemoved = await removeSlotsForWine(assignedWine.id, count);
        qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
        if (slotsRemoved > 0) {
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          setRackRemovalMsg(
            `${slotsRemoved} bottle${slotsRemoved === 1 ? '' : 's'} also removed from your live cellar rack.`
          );
        } else {
          setRackRemovalMsg(null);
        }
        setRemoveCount('1');
      }
    } catch {
      Alert.alert('Error', 'Could not record removal. Please try again.');
    } finally {
      setRemoving(false);
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
                      ]}
                      onPress={() => openSlot(row, col)}
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
            <Text style={styles.wineListHint}>Tap a wine to highlight its position</Text>

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
                    <Text style={[styles.wineRowName, active && styles.wineRowNameActive]}>
                      {wine.vintage ? `${wine.vintage} ` : ''}{wine.wine_name}
                    </Text>
                    <Text style={styles.wineRowDetail}>
                      {[wine.producer, wine.region].filter(Boolean).join(' · ')}
                    </Text>
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

      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 40 }}>
            {assignedWine && (
              <>
                <Text style={styles.modalTitle}>{assignedWine.wine_name}</Text>
                {assignedWine.producer && <Text style={styles.modalProducer}>{assignedWine.producer}</Text>}
                <Text style={styles.modalSub}>
                  {[assignedWine.region, assignedWine.vintage].filter(Boolean).join(' · ')}
                </Text>

                {assignedWine.critic_score !== null && (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Critic Score</Text>
                    <Text style={styles.scoreValue}>{assignedWine.critic_score}</Text>
                  </View>
                )}

                {(assignedWine.drinking_window_from || assignedWine.drinking_window_to) && (
                  <View style={styles.scoreRow}>
                    <Text style={styles.scoreLabel}>Drinking Window</Text>
                    <Text style={styles.scoreValue}>
                      {assignedWine.drinking_window_from}–{assignedWine.drinking_window_to}
                    </Text>
                  </View>
                )}

                {assignedWine.tasting_notes && (
                  <Text style={styles.tastingNotes}>{assignedWine.tasting_notes}</Text>
                )}

                <Text style={styles.noteLabel}>Your Note</Text>
                <TextInput
                  style={styles.noteInput}
                  value={userNote}
                  onChangeText={setUserNote}
                  placeholder="Add a personal note…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />

                <TouchableOpacity style={styles.saveNoteButton} onPress={handleSaveNote}>
                  <Text style={styles.saveNoteText}>Save Note</Text>
                </TouchableOpacity>

                {noteSavedMsg && (
                  <View style={styles.savedBanner}>
                    <Text style={styles.savedBannerText}>{noteSavedMsg}</Text>
                  </View>
                )}

                <Text style={styles.removeHeading}>Remove Bottles</Text>
                <Text style={styles.fieldLabel}>Number of bottles to remove</Text>
                <TextInput
                  style={styles.modalInput}
                  value={removeCount}
                  onChangeText={setRemoveCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.fieldLabel}>Date removed</Text>
                <TextInput
                  style={styles.modalInput}
                  value={removeDate}
                  onChangeText={setRemoveDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity
                  style={[styles.saveNoteButton, removing && { opacity: 0.6 }]}
                  onPress={handleRemoveBottlesFromSlot}
                  disabled={removing}
                >
                  <Text style={styles.saveNoteText}>{removing ? 'Removing…' : 'Remove from Cellar'}</Text>
                </TouchableOpacity>
                {rackRemovalMsg && (
                  <Text style={styles.rackRemovalMsg}>{rackRemovalMsg}</Text>
                )}

                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearButtonText}>Clear this slot only</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={() => { setPickerOpen(false); setSelected(null); }}>
              <Text style={styles.cancelText}>Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
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
  savedBanner: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, backgroundColor: 'rgba(212,176,96,0.10)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginTop: spacing.sm, alignItems: 'center' },
  savedBannerText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, letterSpacing: 0.3 },
});
