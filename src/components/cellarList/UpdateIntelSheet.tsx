import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import type { CellarWine } from '../../types/wine';
import { wineHeaderLine } from '../../utils/wineHeader';
import { tidyWineRegion } from '../../utils/regionFormat';
import { BULK_BATCH_SIZE } from '../../services/bulkIntel';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Your Full Cellar List → "View and update": the wines missing intel, each with its
// region, to tick and update — or Update All, which takes the next bunch.
// One run updates at most BULK_BATCH_SIZE wines, so ticking stops there.
export function UpdateIntelSheet({ visible, wines, onClose, onUpdate }: {
  visible: boolean;
  wines: CellarWine[];
  onClose: () => void;
  onUpdate: (wines: CellarWine[]) => void;
}) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  useEffect(() => { if (visible) setPicked(new Set()); }, [visible]);

  const full = picked.size >= BULK_BATCH_SIZE;
  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < BULK_BATCH_SIZE) next.add(id);
      return next;
    });
  }
  function updateAll() {
    onClose();
    onUpdate(wines.slice(0, BULK_BATCH_SIZE));
  }
  function updatePicked() {
    const chosen = wines.filter((w) => picked.has(w.id));
    if (!chosen.length) return;
    onClose();
    onUpdate(chosen);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.close} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wines Missing Intel</Text>

          <TouchableOpacity style={styles.allBtn} onPress={updateAll} activeOpacity={0.85}>
            <Text style={styles.allBtnText}>Update All</Text>
          </TouchableOpacity>
          <Text style={styles.blurb}>Vinster will update {BULK_BATCH_SIZE} wines at a time</Text>

          <Text style={styles.pickHint}>
            {picked.size ? `${picked.size} selected${full ? ` · up to ${BULK_BATCH_SIZE} at a time` : ''}` : 'Or tick the wines to update'}
          </Text>
          <FlatList
            style={styles.list}
            data={wines}
            keyExtractor={(w) => w.id}
            extraData={picked}
            initialNumToRender={15}
            renderItem={({ item: w }) => {
              const on = picked.has(w.id);
              const region = tidyWineRegion(w.region);
              return (
                <TouchableOpacity style={styles.row} onPress={() => toggle(w.id)} activeOpacity={0.7} disabled={!on && full}>
                  <Text style={[styles.box, on && styles.boxOn, !on && full && { opacity: 0.35 }]}>{on ? '☑' : '☐'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name || 'Wine'}</Text>
                    {region ? <Text style={styles.region} numberOfLines={1}>{region}</Text> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity style={[styles.updateBtn, !picked.size && { opacity: 0.5 }]} onPress={updatePicked} disabled={!picked.size} activeOpacity={0.85}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg, width: '100%', maxWidth: 440, maxHeight: '85%' },
  close: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  allBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%' },
  allBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  blurb: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
  pickHint: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: spacing.md, marginBottom: spacing.xs },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  box: { fontSize: 20, color: colors.textMuted },
  boxOn: { color: colors.gold },
  name: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  region: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 1 },
  updateBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.sm, alignItems: 'center', width: '100%', marginTop: spacing.md },
  updateBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
