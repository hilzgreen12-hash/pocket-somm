import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../../src/hooks/useRacks';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { getSlotAssignments } from '../../src/api/racks';
import { rackHomeToBlurb } from '../../src/utils/rackBlurb';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { colors, spacing } from '../../src/constants/theme';
import type { WineRack, CellarWine } from '../../src/types/wine';

function bottleLabel(n: number) {
  if (n === 0) return 'Empty';
  return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

function RackRow({ rack, wines }: { rack: WineRack; wines: CellarWine[] }) {
  const isFridge = rack.storage_type === 'fridge';
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const blurb = rackHomeToBlurb(rack.id, wines);

  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/cellar/rack/${rack.id}`)}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName}>{rack.name}</Text>
        <Text style={styles.rowDetail}>
          {isFridge ? 'Wine Fridge' : 'Wine Rack'} · {rack.rows} vertical · {rack.cols} horizontal · {rack.rows * rack.cols} slots
        </Text>
        <Text style={styles.rowBottles}>{bottleLabel(totalBottles)}</Text>
        <View style={styles.homeToRow}>
          <Text style={styles.homeToLabel}>Home to</Text>
          <Text style={styles.homeToBlurb}>{blurb}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function RacksScreen() {
  const { session } = useAuth();
  const { racks, isLoading } = useRacks();
  const { wines } = useCellar();
  const { setPendingStorageType } = useRackStore();
  const [typeModalOpen, setTypeModalOpen] = useState(false);

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });

  // Build rack_id → list of wines map
  const winesByRack: Record<string, CellarWine[]> = {};
  for (const slot of slotAssignments) {
    const wine = wines.find((w) => w.id === slot.cellar_wine_id);
    if (!wine) continue;
    const list = winesByRack[slot.rack_id] ?? [];
    list.push(wine);
    winesByRack[slot.rack_id] = list;
  }

  function handleAddType(type: 'rack' | 'fridge') {
    setPendingStorageType(type);
    setTypeModalOpen(false);
    router.push('/cellar/rack/camera');
  }

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
        <Text style={styles.title}>My Storage</Text>
        <TouchableOpacity onPress={() => setTypeModalOpen(true)}>
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your storage"
          body="Build virtual wine racks that mirror your home storage — sign in to keep them."
        />
      ) : racks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No storage yet</Text>
          <Text style={styles.emptyBody}>Photograph your wine rack or wine cooler and Vinster will build a virtual grid so you can track exactly where each bottle lives.</Text>
          <Text style={styles.emptyNote}>Vinster maps your storage as a rectangular grid — non-rectangular or alternative-shaped racks will need to be approximated to a grid layout.</Text>
          <TouchableOpacity style={styles.emptyButtonGold} onPress={() => handleAddType('rack')}>
            <Text style={styles.emptyButtonGoldText}>Add Wine Rack</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.emptyButtonGold, { marginTop: spacing.sm }]} onPress={() => handleAddType('fridge')}>
            <Text style={styles.emptyButtonGoldText}>Add Wine Cooler</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={racks}
          keyExtractor={(r) => r.id}
          renderItem={({ item }) => (
            <RackRow rack={item} wines={winesByRack[item.id] ?? []} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 80 }}
        />
      )}

      <Modal visible={typeModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>What are you adding?</Text>
            <Text style={styles.modalBody}>Photograph your storage and Vinster will map the grid for you.</Text>

            <TouchableOpacity style={styles.typeButton} onPress={() => handleAddType('rack')}>
              <Text style={styles.typeButtonText}>Wine Rack</Text>
              <Text style={styles.typeButtonSub}>A freestanding or wall-mounted bottle rack</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.typeButton, { marginTop: spacing.sm }]} onPress={() => handleAddType('fridge')}>
              <Text style={styles.typeButtonText}>Wine Fridge</Text>
              <Text style={styles.typeButtonSub}>A temperature-controlled wine fridge or cooler</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setTypeModalOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  addLink: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  rowMain: { flex: 1 },
  rowName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.3 },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 4 },
  rowBottles: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.xs },
  homeToRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs, gap: 6 },
  homeToLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  homeToBlurb: { flex: 1, fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 19 },
  arrow: { fontSize: 20, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginLeft: spacing.md },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  emptyNote: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: spacing.xl },
  emptyButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  emptyButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  emptyButtonGold: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  emptyButtonGoldText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  modalBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.lg },
  typeButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md },
  typeButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17, color: '#FFFFFF' },
  typeButtonSub: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 13, color: colors.textMuted, marginTop: 2 },
  cancelButton: { alignItems: 'center', marginTop: spacing.lg },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
});
