import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { getBins, getBinCells, deleteBin } from '../../../src/api/bins';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';
import type { BinCell } from '../../../src/types/wine';

// One diamond/triangle tile in the grid. Tap to drill into its wine list.
function CellTile({ cell, position }: { cell: BinCell; position: number }) {
  const count = cell.bottleCount ?? 0;
  const full = count >= cell.capacity;
  return (
    <TouchableOpacity
      style={[styles.cell, full && styles.cellFull]}
      onPress={() => router.push(`/cellar/bin/cell/${cell.id}` as any)}
      activeOpacity={0.85}
    >
      <Text style={styles.cellKind}>{cell.kind === 'triangle' ? '◢ Triangle' : '◆ Diamond'} {position}</Text>
      <Text style={[styles.cellCount, full && styles.cellCountFull]}>{count}/{cell.capacity}</Text>
    </TouchableOpacity>
  );
}

export default function BinDetailScreen() {
  const { binId } = useLocalSearchParams<{ binId: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: bins = [] } = useQuery({
    queryKey: ['bins', userId],
    queryFn: () => getBins(userId!),
    enabled: !!userId,
  });
  const bin = bins.find((b) => b.id === binId);

  const { data: cells = [], isLoading } = useQuery({
    queryKey: ['bin-cells', binId],
    queryFn: () => getBinCells(binId!),
    enabled: !!binId,
  });

  const across = bin?.diamonds_across ?? 1;
  const totalBottles = cells.reduce((sum, c) => sum + (c.bottleCount ?? 0), 0);
  const totalCapacity = cells.reduce((sum, c) => sum + c.capacity, 0);

  function handleDelete() {
    if (!binId) return;
    showAlert({
      title: bin?.name ?? 'Delete bin',
      body: 'Permanently remove this bin? Wines stay in your cellar — they\'re just no longer filed in it.',
      buttons: [
        {
          text: 'Delete bin',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBin(binId);
              qc.invalidateQueries({ queryKey: ['bins'] });
              qc.invalidateQueries({ queryKey: ['cellar'] });
              router.back();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onLongPress={handleDelete} delayLongPress={400} activeOpacity={1} style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{bin?.name ?? 'Bin'}</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }}>
          <Text style={styles.summary}>{totalBottles}/{totalCapacity} bottles · tap a diamond to see or add its wines</Text>

          <View style={[styles.grid, { maxWidth: across * 116 }]}>
            {cells.map((c, i) => (
              <CellTile key={c.id} cell={c} position={i + 1} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  titleWrap: { flex: 1 },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  summary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'center', marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, alignSelf: 'center' },
  cell: { width: 100, height: 84, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 6 },
  cellFull: { borderColor: colors.gold },
  cellKind: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  cellCount: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, marginTop: 4 },
  cellCountFull: { color: colors.gold },
});
