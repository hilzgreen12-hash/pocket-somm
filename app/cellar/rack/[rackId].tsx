import { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, useWindowDimensions, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRack } from '../../../src/hooks/useRacks';
import { useRacks } from '../../../src/hooks/useRacks';
import { useRackStore } from '../../../src/stores/rackStore';
import { useCellar } from '../../../src/hooks/useCellar';
import { colors, spacing } from '../../../src/constants/theme';
import type { RackSlot, CellarWine } from '../../../src/types/wine';

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
  const { slots, isLoading, assign, clear } = useRack(rackId);
  const { racks } = useRacks();
  const { wines } = useCellar();
  const { width } = useWindowDimensions();

  const { setPendingSlot, pendingWineId, setPendingWineId } = useRackStore();
  const { updateWine } = useCellar();
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [userNote, setUserNote] = useState('');

  const rack = racks.find((r) => r.id === rackId);

  const slotMap = useMemo(() => {
    const map: Record<string, RackSlot> = {};
    slots.forEach((s) => { map[`${s.row_index},${s.col_index}`] = s; });
    return map;
  }, [slots]);

  const PADDING = spacing.xl * 2;
  const GAP = 4;
  const cols = rack?.cols ?? 1;
  const slotSize = Math.max(36, Math.floor((width - PADDING - GAP * (cols - 1)) / cols));

  function openSlot(row: number, col: number) {
    const slot = slotMap[`${row},${col}`];
    const wine = slot?.wine as CellarWine | null | undefined;
    if (wine) {
      setUserNote(wine.user_notes ?? '');
      setSelected({ row, col });
      setPickerOpen(true);
    } else if (pendingWineId) {
      assign.mutate({ row, col, wineId: pendingWineId });
      setPendingWineId(null);
    } else {
      setPendingSlot({ rackId, row, col });
      router.push('/label/camera');
    }
  }

  function handleSaveNote() {
    if (!selected || !assignedWine) return;
    updateWine.mutate({ id: assignedWine.id, updates: { user_notes: userNote.trim() || null } });
    setPickerOpen(false);
    setSelected(null);
  }

  function handleClear() {
    if (!selected) return;
    clear.mutate({ row: selected.row, col: selected.col });
    setPickerOpen(false);
    setSelected(null);
  }

  if (isLoading || !rack) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  const selectedSlot = selected ? slotMap[`${selected.row},${selected.col}`] : null;
  const assignedWine = selectedSlot?.wine as CellarWine | null | undefined;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{rack.name}</Text>
        <Text style={styles.dims}>{rack.rows}×{rack.cols}</Text>
      </View>

      <View style={styles.legend}>
        {Object.entries({ peak: 'Peak', approaching: 'Approaching', too_young: 'Too Young', declining: 'Declining' }).map(([k, v]) => (
          <View key={k} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[k] }]} />
            <Text style={styles.legendText}>{v}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={[styles.grid, { padding: spacing.xl }]}>
        {Array.from({ length: rack.rows }, (_, row) => (
          <View key={row} style={[styles.gridRow, { gap: GAP, marginBottom: GAP }]}>
            {Array.from({ length: rack.cols }, (_, col) => {
              const slot = slotMap[`${row},${col}`];
              const wine = slot?.wine as CellarWine | null | undefined;
              const status = wine?.drinking_window_status ?? null;
              return (
                <TouchableOpacity
                  key={col}
                  style={[
                    styles.slot,
                    { width: slotSize, height: slotSize },
                    wine ? { backgroundColor: STATUS_COLORS[status ?? 'unknown'] + '33', borderColor: STATUS_COLORS[status ?? 'unknown'] } : styles.slotEmpty,
                  ]}
                  onPress={() => openSlot(row, col)}
                >
                  {wine ? (
                    <Text style={styles.slotText} numberOfLines={2}>
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

                <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                  <Text style={styles.clearButtonText}>Remove from slot</Text>
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
  dims: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 50, textAlign: 'right' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  grid: {},
  gridRow: { flexDirection: 'row' },
  slot: { borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  slotEmpty: { borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'transparent' },
  slotText: { fontSize: 8, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'center', lineHeight: 10 },
  slotPlus: { fontSize: 14, color: 'rgba(255,255,255,0.20)', fontFamily: 'CormorantGaramond_400Regular' },
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
  saveNoteButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveNoteText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  clearButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  clearButtonText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  cancelButton: { alignItems: 'center', marginTop: spacing.sm },
  cancelText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },

});
