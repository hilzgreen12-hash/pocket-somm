import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { searchWines, scanLabel, prepareImageBase64, type WineSearchResult } from '../api/label';
import type { CompareWineInput } from '../api/compareWines';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { wineHeaderLine } from '../utils/wineHeader';
import { tidyWineRegion } from '../utils/regionFormat';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Compare Wines or Vintages — pick 2 to 4 wines. Each row is the catalogue
// search (same as Manual Input) with a camera button to scan a label instead;
// a picked wine then only needs its vintage.

const MAX_WINES = 4;

type Picked = Omit<CompareWineInput, 'vintage'>;
type Row = { query: string; picked: Picked | null; vintage: string; scanning: boolean };
const emptyRow = (): Row => ({ query: '', picked: null, vintage: '', scanning: false });

const isVintage = (v: string) => /^(19|20)\d{2}$/.test(v.trim()) || /^nv$/i.test(v.trim());

export function CompareWinesModal({ visible, onClose, onConfirm }: {
  visible: boolean;
  onClose: () => void;
  onConfirm: (wines: CompareWineInput[]) => void;
}) {
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);
  const [active, setActive] = useState<number | null>(null);
  const [results, setResults] = useState<WineSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const reqRef = useRef(0);

  // Fresh form each time it opens.
  useEffect(() => {
    if (visible) { setRows([emptyRow(), emptyRow()]); setActive(null); setResults([]); }
  }, [visible]);

  const update = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  // Typeahead for the row being typed in (debounced, from 3 characters).
  const activeQuery = active != null ? rows[active]?.query ?? '' : '';
  useEffect(() => {
    const q = activeQuery.trim();
    if (q.length < 3) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const id = ++reqRef.current;
    const t = setTimeout(async () => {
      try {
        const r = await searchWines(q);
        if (id === reqRef.current) setResults(r);
      } catch {
        if (id === reqRef.current) setResults([]);
      } finally {
        if (id === reqRef.current) setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, [activeQuery]);

  function pick(i: number, r: WineSearchResult) {
    update(i, {
      picked: { producer: r.producer, wineName: r.wineName, region: r.region, grape: r.grape },
      vintage: r.vintage ?? '',
      query: '',
    });
    setActive(null);
    setResults([]);
  }

  // Not in the catalogue — use the typed name as it is.
  function useTyped(i: number) {
    const q = rows[i].query.trim();
    if (!q) return;
    const year = q.match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
    const name = year ? q.replace(year, ' ').replace(/\s{2,}/g, ' ').trim() : q;
    update(i, { picked: { producer: name, wineName: null, region: null, grape: null }, vintage: year, query: '' });
    setActive(null);
    setResults([]);
  }

  async function scan(i: number) {
    if (rows[i].scanning) return;
    if (!(await ensureMediaPermission('camera'))) return;
    const shot = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 }).catch(() => null);
    if (!shot || shot.canceled || !shot.assets[0]) return;
    update(i, { scanning: true });
    try {
      const d = await scanLabel(await prepareImageBase64(shot.assets[0].uri));
      const producer = (d.producer ?? '').trim();
      const wineName = (d.wineName ?? '').trim() || null;
      if (!producer && !wineName) throw new Error('unread');
      update(i, {
        scanning: false,
        picked: { producer: producer || (wineName ?? ''), wineName: producer ? wineName : null, region: (d.region ?? '').trim() || null, grape: (d.grape ?? '').trim() || null },
        vintage: (d.vintage ?? '').trim(),
        query: '',
      });
    } catch {
      update(i, { scanning: false });
      showAlert({ title: "Couldn't read the label", body: 'Try a clearer, well-lit photo of the front label, or search for the wine instead.' });
    }
  }

  const ready = rows.filter((r) => r.picked && isVintage(r.vintage));
  const canConfirm = ready.length >= 2 && rows.every((r) => !r.picked || isVintage(r.vintage));

  function confirm() {
    if (!canConfirm) return;
    onConfirm(ready.map((r) => ({ ...r.picked!, vintage: /^nv$/i.test(r.vintage.trim()) ? 'NV' : r.vintage.trim() })));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.sheet}>
          <View style={styles.headRow}>
            <Text style={styles.title}>Vinster needs the details, input up to 4 wines</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {rows.map((r, i) => (
              <View key={i} style={styles.row}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Wine {i + 1}</Text>
                  {i >= 2 ? (
                    <TouchableOpacity onPress={() => { setRows((rs) => rs.filter((_, j) => j !== i)); setActive(null); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.remove}>Remove</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>

                {r.picked ? (
                  <>
                    <View style={styles.pickedBox}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pickedName} numberOfLines={2}>{wineHeaderLine(r.picked.producer, r.picked.wineName, null)}</Text>
                        {tidyWineRegion(r.picked.region) || r.picked.grape ? (
                          <Text style={styles.pickedMeta} numberOfLines={1}>{[tidyWineRegion(r.picked.region), r.picked.grape].filter(Boolean).join(' · ')}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity onPress={() => update(i, { picked: null, vintage: '' })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={`Clear wine ${i + 1}`}>
                        <Text style={styles.clear}>✕</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.vintageRow}>
                      <Text style={styles.vintageLabel}>Vintage</Text>
                      <TextInput
                        style={[styles.vintageInput, r.vintage.trim() && !isVintage(r.vintage) && { borderColor: colors.gold }]}
                        value={r.vintage}
                        onChangeText={(t) => update(i, { vintage: t.replace(/[^0-9a-zA-Z]/g, '').slice(0, 4) })}
                        placeholder="e.g. 2019 or NV"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={4}
                      />
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.searchRow}>
                      <Feather name="search" size={17} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
                      <TextInput
                        style={styles.searchInput}
                        value={r.query}
                        onChangeText={(t) => { update(i, { query: t }); setActive(i); }}
                        onFocus={() => setActive(i)}
                        placeholder="Search a wine"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="words"
                        autoCorrect={false}
                        returnKeyType="search"
                        onSubmitEditing={() => useTyped(i)}
                      />
                      {r.scanning || (active === i && loading) ? <ActivityIndicator color={colors.gold} style={{ marginLeft: spacing.sm }} /> : null}
                      <TouchableOpacity onPress={() => void scan(i)} disabled={r.scanning} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={styles.camera} accessibilityLabel={`Scan a label for wine ${i + 1}`}>
                        <Feather name="camera" size={20} color={colors.gold} />
                      </TouchableOpacity>
                    </View>
                    {active === i && r.query.trim().length >= 3 ? (
                      <View style={styles.dropdown}>
                        {results.length === 0 && loading ? <Text style={styles.dropdownEmpty}>Searching…</Text> : null}
                        {results.slice(0, 6).map((res, k) => (
                          <TouchableOpacity key={`${res.producer}-${res.wineName ?? ''}-${k}`} style={styles.option} onPress={() => pick(i, res)} activeOpacity={0.7}>
                            <Text style={styles.optionName}>{wineHeaderLine(res.producer, res.wineName, res.vintage)}</Text>
                            {tidyWineRegion(res.region) || res.grape ? (
                              <Text style={styles.optionMeta} numberOfLines={1}>{[tidyWineRegion(res.region), res.grape].filter(Boolean).join(' · ')}</Text>
                            ) : null}
                          </TouchableOpacity>
                        ))}
                        {!loading ? (
                          <TouchableOpacity style={styles.option} onPress={() => useTyped(i)} activeOpacity={0.7}>
                            <Text style={styles.optionName}>Use “{r.query.trim()}”</Text>
                            <Text style={styles.optionMetaMuted}>{results.length ? 'Not listed? Enter it yourself.' : 'No match — enter it yourself.'}</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ) : null}
                  </>
                )}
              </View>
            ))}

            {rows.length < MAX_WINES ? (
              <TouchableOpacity style={styles.add} onPress={() => setRows((rs) => [...rs, emptyRow()])} accessibilityLabel="Add another wine" activeOpacity={0.7}>
                <Feather name="plus" size={22} color={colors.gold} />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={[styles.confirm, !canConfirm && { opacity: 0.45 }]} onPress={confirm} disabled={!canConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Confirm Selection</Text>
            </TouchableOpacity>
            {!canConfirm ? <Text style={styles.hint}>Choose at least two wines, each with a vintage.</Text> : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.lg },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg, maxHeight: '88%' },
  headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  title: { flex: 1, fontFamily: fonts.headingBold, fontSize: 21, lineHeight: 26, color: colors.text },
  close: { fontSize: 20, color: colors.text },
  row: { marginBottom: spacing.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  label: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  remove: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  searchRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  searchInput: { flex: 1, paddingVertical: spacing.sm + 2, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  camera: { marginLeft: spacing.sm, paddingVertical: spacing.xs },
  dropdown: { borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface, marginTop: spacing.xs },
  dropdownEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, padding: spacing.md },
  option: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  optionName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  optionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold, marginTop: 1 },
  optionMetaMuted: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  pickedBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, backgroundColor: colors.surface },
  pickedName: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  pickedMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2 },
  clear: { fontSize: 16, color: colors.textMuted },
  vintageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  vintageLabel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  vintageInput: { width: 130, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, textAlign: 'center' },
  add: { alignSelf: 'center', width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  confirm: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  confirmText: { fontFamily: fonts.headingSemibold, color: '#FFFFFF', fontSize: 16 },
  hint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
