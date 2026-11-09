import { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { getRackSlots, assignSlots } from '../../api/racks';
import { getBinCells } from '../../api/bins';
import { addLocationPlacement, addBinPlacement } from '../../api/placements';
import { updateCellarWine } from '../../api/cellar';
import { showAlert } from '../AppAlert';
import type { CellarWine, WineRack, StorageLocation } from '../../types/wine';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// "Placing Wines": spread a wine's not-yet-placed bottles across home storage
// with +/- counters. Vinster picks the free slots (racks/fridges: first empty
// slots; bins: cells with room; alt cellars: no limit), then lists where they
// went with a View link to each. The sheet hides while a location is open and
// comes back on return, so the user can carry on placing or tap Done.
type Dest = { key: string; kind: 'rack' | 'bin' | 'location'; id: string; name: string; type: string; free: number | null };
type Placed = { key: string; name: string; count: number; route: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  wine: CellarWine;
  available: number;
  racks: WineRack[];
  bins: WineRack[];
  locations: StorageLocation[];
};

const cl = (ml: number | null | undefined) => Math.round((ml ?? 750) / 10);

// Free rack/fridge slots for a bottle size, in reading order.
async function freeRackSlots(rack: WineRack, sizeMl: number): Promise<{ row: number; col: number }[]> {
  const taken = new Set((await getRackSlots(rack.id)).filter((s) => s.cellar_wine_id != null).map((s) => `${s.row_index},${s.col_index}`));
  const out: { row: number; col: number }[] = [];
  const largeFits = rack.large_format_cols && rack.large_format_bottle_size_ml === sizeMl && sizeMl !== 750;
  if (largeFits) for (let c = 0; c < (rack.large_format_cols ?? 0); c++) if (!taken.has(`-1,${c}`)) out.push({ row: -1, col: c });
  for (let r = 0; r < (rack.rows ?? 0); r++) for (let c = 0; c < (rack.cols ?? 0); c++) if (!taken.has(`${r},${c}`)) out.push({ row: r, col: c });
  return out;
}

async function binRoom(binId: string): Promise<{ id: string; room: number }[]> {
  return (await getBinCells(binId)).map((c) => ({ id: c.id, room: Math.max(0, (c.capacity ?? 0) - (c.bottleCount ?? 0)) })).filter((c) => c.room > 0);
}

export function PlaceWinesSheet({ visible, onClose, wine, available, racks, bins, locations }: Props) {
  const qc = useQueryClient();
  const [focused, setFocused] = useState(true);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const [dests, setDests] = useState<Dest[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState<Placed[] | null>(null);
  const size = wine.bottle_size_ml ?? 750;

  const loadDests = useCallback(async () => {
    setDests(null);
    const home = locations.filter((l) => !l.is_external);
    const [rackFree, binFree] = await Promise.all([
      Promise.all(racks.map((r) => freeRackSlots(r, size).then((s) => s.length).catch(() => 0))),
      Promise.all(bins.map((b) => binRoom(b.id).then((cells) => cells.reduce((n, c) => n + c.room, 0)).catch(() => 0))),
    ]);
    setDests([
      ...racks.map((r, i) => ({ key: `r:${r.id}`, kind: 'rack' as const, id: r.id, name: r.name, type: r.storage_type === 'fridge' ? 'Fridge' : 'Rack', free: rackFree[i] })),
      ...bins.map((b, i) => ({ key: `b:${b.id}`, kind: 'bin' as const, id: b.id, name: b.name, type: 'Bin', free: binFree[i] })),
      ...home.map((l) => ({ key: `l:${l.id}`, kind: 'location' as const, id: l.id, name: l.name, type: 'Alt Cellar', free: null })),
    ]);
  }, [racks, bins, locations, size]);

  // Fresh counters each time the sheet opens on the list.
  useEffect(() => {
    if (!visible) { setPlaced(null); setCounts({}); return; }
    if (!placed) void loadDests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const chosen = Object.values(counts).reduce((a, b) => a + b, 0);
  const left = Math.max(0, available - chosen);

  function bump(d: Dest, by: number) {
    setCounts((c) => {
      const cur = c[d.key] ?? 0;
      const max = Math.min(d.free ?? Infinity, cur + Math.max(0, available - Object.values(c).reduce((a, b) => a + b, 0)));
      const next = Math.max(0, Math.min(max, cur + by));
      return { ...c, [d.key]: next };
    });
  }

  async function place() {
    if (!dests || chosen === 0 || placing) return;
    setPlacing(true);
    const done: Placed[] = [];
    try {
      for (const d of dests) {
        const n = counts[d.key] ?? 0;
        if (n <= 0) continue;
        if (d.kind === 'rack') {
          const rack = racks.find((r) => r.id === d.id)!;
          const slots = (await freeRackSlots(rack, size)).slice(0, n);
          await assignSlots(d.id, slots, wine.id);
          done.push({ key: d.key, name: d.name, count: slots.length, route: `/cellar/rack/${d.id}?highlight=${wine.id}` });
        } else if (d.kind === 'bin') {
          let need = n;
          for (const c of await binRoom(d.id)) {
            if (need <= 0) break;
            const take = Math.min(need, c.room);
            await addBinPlacement(wine.id, c.id, take);
            need -= take;
          }
          done.push({ key: d.key, name: d.name, count: n - need, route: `/cellar/bin/${d.id}?highlight=${wine.id}` });
        } else {
          await addLocationPlacement(wine.id, d.id, null, n);
          done.push({ key: d.key, name: d.name, count: n, route: `/cellar/storage-location/${d.id}?highlight=${wine.id}` });
        }
      }
      // All loose bottles placed → no longer awaiting a spot anywhere.
      if (chosen >= available && wine.awaiting_placement) {
        await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null } as Partial<CellarWine>);
      }
      for (const k of ['cellar', 'placements', 'placements-list', 'storage-location-wines', 'storage-locations', 'racks', 'rack-slots', 'slot-assignments', 'bins', 'bin-cells']) qc.invalidateQueries({ queryKey: [k] });
      setPlaced((prev) => [...(prev ?? []), ...done]);
      setCounts({});
    } catch (err) {
      showAlert({ title: 'Could not place wines', body: err instanceof Error ? err.message : 'Please try again.' });
      if (done.length) setPlaced((prev) => [...(prev ?? []), ...done]);
    } finally {
      setPlacing(false);
    }
  }

  function placeMore() {
    setPlaced(null);
    void loadDests();
  }

  const wineName = [wine.producer, wine.wine_name !== wine.producer ? wine.wine_name : null, wine.vintage].filter(Boolean).join(' ');

  return (
    <Modal visible={visible && focused} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Placing Wines</Text>
          <Text style={styles.wineName} numberOfLines={2}>{wineName}</Text>

          {placed ? (
            <>
              <Text style={styles.confirm}>Vinster has placed your wines, visit each location to move them into their specific slots</Text>
              <ScrollView style={{ maxHeight: 260 }}>
                {placed.map((p, i) => (
                  <View key={`${p.key}-${i}`} style={styles.row}>
                    <Text style={styles.rowName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.rowCount}>{p.count}×{cl(size)}cl</Text>
                    <TouchableOpacity onPress={() => router.push(p.route as any)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                      <Text style={styles.view}>View</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              {available > 0 ? (
                <TouchableOpacity onPress={placeMore} activeOpacity={0.7} style={{ alignSelf: 'center' }}>
                  <Text style={styles.view}>Place remaining {available}×{cl(size)}cl →</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.primary} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.primaryText}>Done</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.available}>Available to Place: <Text style={styles.availableValue}>{left}×{cl(size)}cl</Text></Text>
              {dests == null ? (
                <ActivityIndicator color={colors.gold} style={{ marginVertical: spacing.lg }} />
              ) : dests.length === 0 ? (
                <Text style={styles.empty}>You have no home storage locations yet. Add a rack, fridge, bin or alt cellar first.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 320 }}>
                  {dests.map((d) => {
                    const n = counts[d.key] ?? 0;
                    const full = d.free === 0;
                    return (
                      <View key={d.key} style={styles.row}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowName} numberOfLines={1}>{d.name}</Text>
                          <Text style={styles.rowType}>{d.type}{d.free != null ? ` · ${full ? 'Full' : `${d.free} free`}` : ''}</Text>
                        </View>
                        <View style={[styles.counter, full && { opacity: 0.35 }]}>
                          <TouchableOpacity onPress={() => bump(d, -1)} disabled={n === 0} style={styles.counterBtn} accessibilityLabel={`One fewer in ${d.name}`}>
                            <Text style={styles.counterSign}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.counterValue}>{n}</Text>
                          <TouchableOpacity onPress={() => bump(d, 1)} disabled={full || left === 0} style={styles.counterBtn} accessibilityLabel={`One more in ${d.name}`}>
                            <Text style={styles.counterSign}>+</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>
              )}
              <TouchableOpacity style={[styles.primary, (chosen === 0 || placing) && { opacity: 0.5 }]} onPress={() => void place()} disabled={chosen === 0 || placing} activeOpacity={0.85}>
                <Text style={styles.primaryText}>{placing ? 'Placing…' : chosen > 0 ? `Place ${chosen} ${chosen === 1 ? 'Bottle' : 'Bottles'}` : 'Place Wines'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={{ alignSelf: 'center' }}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.lg },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: 10 },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text },
  wineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, marginTop: -4 },
  available: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  availableValue: { fontFamily: fonts.bodySemibold, color: colors.gold },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 52, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  rowName: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, flexShrink: 1 },
  rowType: { fontFamily: fonts.bodyRegular, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  rowCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, marginLeft: 'auto' },
  counter: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(224,184,74,0.6)', borderRadius: 20 },
  counterBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  counterSign: { fontFamily: fonts.bodySemibold, fontSize: 20, color: colors.gold },
  counterValue: { minWidth: 22, textAlign: 'center', fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text },
  confirm: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 22, color: colors.text },
  view: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  primary: { marginTop: 6, backgroundColor: colors.gold, borderRadius: 24, paddingVertical: 12, alignItems: 'center' },
  primaryText: { fontFamily: fonts.headingBold, fontSize: 16, color: '#3E2120' },
  cancel: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textDecorationLine: 'underline', marginTop: 4 },
});
