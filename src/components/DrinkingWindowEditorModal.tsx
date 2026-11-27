import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { updateCellarWine } from '../api/cellar';
import { bottleSizeCl } from './BottleSizePicker';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

// Cellar Statistics → Drinking Window → "View Wines to Update": the wines with
// no drinking window yet, each with a From–To pair to fill in — the same sheet
// as Total Purchase / Current Value's "View Wines to Update".
export function DrinkingWindowEditorModal({ visible, wines, altAction, onClose, onSaved }: {
  visible: boolean;
  wines: CellarWine[];
  // "Auto Update All": let Vinster work the windows out instead.
  altAction?: { label: string; onPress: () => void };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Record<string, { from: string; to: string }>>({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (!visible) setValues({}); }, [visible]);

  // A wine here may already have one year (or both, with a legacy status):
  // the fields start with what it has, so only the missing year needs typing.
  const had = (n: number | null | undefined) => (n != null ? String(n) : '');
  const shown = (w: CellarWine, key: 'from' | 'to') =>
    values[w.id]?.[key] ?? had(key === 'from' ? w.drinking_window_from : w.drinking_window_to);
  const set = (w: CellarWine, key: 'from' | 'to', t: string) =>
    setValues((v) => ({
      ...v,
      [w.id]: {
        from: v[w.id]?.from ?? had(w.drinking_window_from),
        to: v[w.id]?.to ?? had(w.drinking_window_to),
        [key]: t.replace(/[^0-9]/g, '').slice(0, 4),
      },
    }));

  const year = (t: string | undefined) => (t && /^\d{4}$/.test(t) ? Number(t) : null);
  const toSave = Object.entries(values)
    .map(([id, v]) => ({ id, from: year(v.from), to: year(v.to) }))
    .filter((e) => e.from != null && e.to != null && e.from >= 1900 && e.to <= 2200 && e.from <= e.to);
  const half = Object.values(values).some((v) => (v.from || v.to) && !(year(v.from) && year(v.to)));

  async function handleSave() {
    if (saving) return;
    if (toSave.length === 0) {
      if (half) showAlert({ title: 'Add both years', body: 'Enter the first and last year to drink each wine, e.g. 2026 – 2035.' });
      else onClose();
      return;
    }
    setSaving(true);
    let anySaved = false;
    try {
      for (const e of toSave) {
        await updateCellarWine(e.id, { drinking_window_from: e.from, drinking_window_to: e.to });
        anySaved = true;
      }
      setValues({});
      onSaved();
    } catch (err) {
      if (anySaved) onSaved();
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function close() { setValues({}); onClose(); }

  const renderRow = ({ item: w }: { item: CellarWine }) => (
    <View style={styles.row}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName} numberOfLines={2}>{[w.producer, w.wine_name].filter(Boolean).join(' ') || w.wine_name}</Text>
        <Text style={styles.rowMeta} numberOfLines={1}>
          {[w.vintage, w.region].filter(Boolean).join(' · ')}  ·  {bottleSizeCl(w.bottle_size_ml ?? 750)}cl
        </Text>
      </View>
      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          value={shown(w, 'from')}
          onChangeText={(t) => set(w, 'from', t)}
          placeholder="From"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Text style={styles.dash}>–</Text>
        <TextInput
          style={styles.input}
          value={shown(w, 'to')}
          onChangeText={(t) => set(w, 'to', t)}
          placeholder="To"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
        />
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Drinking Windows</Text>
          <Text style={styles.subtitle}>Enter the first and last year to drink each wine — this places it in your Drinking Window.</Text>
          {altAction ? (
            <TouchableOpacity onPress={altAction.onPress} activeOpacity={0.7} style={styles.altLinkWrap}>
              <Text style={styles.altLink}>{altAction.label}</Text>
            </TouchableOpacity>
          ) : null}
          <FlatList
            style={styles.list}
            data={wines}
            keyExtractor={(w) => w.id}
            renderItem={renderRow}
            extraData={values}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: spacing.md }}
          />
          <TouchableOpacity style={[styles.saveBtn, (saving || toSave.length === 0) && { opacity: 0.5 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>Save Updates</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelBtn, saving && { opacity: 0.5 }]} onPress={close} disabled={saving}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Same look as WineValueEditorModal.
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg, maxHeight: '86%' },
  title: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.sm, lineHeight: 20 },
  altLinkWrap: { alignItems: 'center', marginBottom: spacing.md },
  altLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1, minWidth: 0 },
  rowName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  rowMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  inputWrap: { width: 140, flexShrink: 0, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.sm, backgroundColor: colors.surface },
  input: { flex: 1, minWidth: 0, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm, textAlign: 'center' },
  dash: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'transparent', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
