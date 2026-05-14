import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../../src/hooks/useRacks';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { getSlotAssignments } from '../../src/api/racks';
import { rackHomeToBlurb } from '../../src/utils/rackBlurb';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { colors, spacing } from '../../src/constants/theme';
import type { WineRack, CellarWine } from '../../src/types/wine';

function bottleLabel(n: number) {
  if (n === 0) return 'Empty';
  return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

function RackRow({ rack, wines, onLongPress }: { rack: WineRack; wines: CellarWine[]; onLongPress: () => void }) {
  const isFridge = rack.storage_type === 'fridge';
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const blurb = rackHomeToBlurb(rack.id, wines);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/cellar/rack/${rack.id}`)}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
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
  const { racks, isLoading, remove: removeRack } = useRacks();
  const { wines } = useCellar();
  const { setPendingStorageType } = useRackStore();

  function handleLongPressRack(rack: WineRack) {
    showAlert({
      title: rack.name,
      body: `Permanently remove this ${rack.storage_type === 'fridge' ? 'fridge' : 'rack'}? Wines stay in your cellar — they're just no longer mapped to it.`,
      buttons: [
        {
          text: 'Delete rack',
          style: 'destructive',
          onPress: () => {
            removeRack.mutate(rack.id, {
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
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

  // Build rack_id → list of wines map
  const winesByRack: Record<string, CellarWine[]> = {};
  for (const slot of slotAssignments) {
    const wine = wines.find((w) => w.id === slot.cellar_wine_id);
    if (!wine) continue;
    const list = winesByRack[slot.rack_id] ?? [];
    list.push(wine);
    winesByRack[slot.rack_id] = list;
  }

  // useCellar returns wines newest-first, so the three most recent
  // additions are just the head of the list — they update and roll off
  // automatically as the cellar query refreshes.
  const recentAdditions = wines.slice(0, 3);

  function handleAddType(type: 'rack' | 'fridge') {
    setPendingStorageType(type);
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
        <Text style={styles.title}>Your Wines</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your wines"
          body="Build virtual wine racks that mirror your home storage — sign in to keep them."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.subHeader}>Your Storage</Text>

          {racks.map((rack) => (
            <RackRow
              key={rack.id}
              rack={rack}
              wines={winesByRack[rack.id] ?? []}
              onLongPress={() => handleLongPressRack(rack)}
            />
          ))}

          <View style={styles.storageInfo}>
            <Text style={styles.storageBlurb}>
              Photograph your wine rack or wine fridge and Vinster will build a virtual grid so you can track exactly where each bottle lives.
            </Text>
            <Text style={styles.storageNote}>
              Vinster maps your storage as a rectangular grid, alternative shaped racks will be approximated to fit the layout.
            </Text>
            <TouchableOpacity style={styles.addButton} onPress={() => handleAddType('rack')}>
              <Text style={styles.addButtonText}>Add Wine Rack</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addButton, { marginTop: spacing.sm }]} onPress={() => handleAddType('fridge')}>
              <Text style={styles.addButtonText}>Add Wine Fridge</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.subHeader}>Cellar List</Text>

          <View style={styles.cellarListSection}>
            <TouchableOpacity style={styles.fullListButton} onPress={() => router.push('/cellar/list')}>
              <Text style={styles.fullListButtonText}>Full Cellar List</Text>
            </TouchableOpacity>

            {recentAdditions.length > 0 && (
              <>
                <Text style={styles.recentLabel}>Recently added</Text>
                {recentAdditions.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.recentRow}
                    onPress={() => router.push(`/cellar/${w.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recentName} numberOfLines={1}>
                      {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    {w.region ? <Text style={styles.recentDetail} numberOfLines={1}>{w.region}</Text> : null}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  title: { flex: 1, fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subHeader: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.3, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1 },
  rowName: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.3 },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 4 },
  rowBottles: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.xs },
  homeToRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs, gap: 6 },
  homeToLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  homeToBlurb: { flex: 1, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 19 },
  arrow: { fontSize: 20, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginLeft: spacing.md },
  storageInfo: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  storageBlurb: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  storageNote: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginBottom: spacing.lg },
  addButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  addButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  cellarListSection: { paddingHorizontal: spacing.xl },
  fullListButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  fullListButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  recentLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.lg, marginBottom: spacing.xs },
  recentRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  recentName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  recentDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
});
