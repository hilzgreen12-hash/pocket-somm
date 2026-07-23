import { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { updateCellarWine } from '../api/cellar';
import { bottleSizeCl } from './BottleSizePicker';
import { CURRENCIES } from '../constants/currency';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

function symbolFor(code: string): string {
  return CURRENCIES.find((c) => c.code === code.toUpperCase())?.symbol ?? code;
}

interface Props {
  visible: boolean;
  title: string;
  subtitle: string;
  // Which value the user is entering. Estimated value is stamped as a
  // user-supplied source; purchase price just records the price.
  field: 'estimated_value' | 'purchase_price';
  wines: CellarWine[];
  currency: string;
  onClose: () => void;
  onSaved: () => void;
}

// A list of wines (lineup-input style rows) each with a per-bottle value input,
// so the user can fill in the values Vinster couldn't find — estimated current
// value, or purchase price. Only rows with a positive number are written.
export function WineValueEditorModal({ visible, title, subtitle, field, wines, currency, onClose, onSaved }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const sym = symbolFor(currency);

  // Seed each input with the wine's CURRENT value for this field when the sheet
  // opens (empty for "missing value" wines, the existing estimate for a review),
  // so the user can double-check and adjust. Runs only on open, never mid-edit.
  const winesRef = useRef(wines); winesRef.current = wines;
  const fieldRef = useRef(field); fieldRef.current = field;
  useEffect(() => {
    if (!visible) return;
    const init: Record<string, string> = {};
    for (const w of winesRef.current) {
      const cur = fieldRef.current === 'purchase_price' ? w.purchase_price : w.estimated_value;
      if (cur != null) init[w.id] = String(cur);
    }
    setValues(init);
  }, [visible]);

  function setVal(id: string, text: string) {
    // Keep digits + a single decimal point.
    const cleaned = text.replace(/[^0-9.]/g, '').replace(/(\.\d*)\./g, '$1');
    setValues((v) => ({ ...v, [id]: cleaned }));
  }

  const parsed = Object.entries(values)
    .map(([id, s]) => ({ id, n: parseFloat(s) }))
    .filter((e) => Number.isFinite(e.n) && e.n > 0);

  async function handleSave() {
    if (saving) return;
    if (parsed.length === 0) { onClose(); return; }
    setSaving(true);
    try {
      for (const e of parsed) {
        if (field === 'estimated_value') {
          await updateCellarWine(e.id, {
            estimated_value: e.n,
            estimated_value_currency: currency,
            estimated_value_source: 'user',
            estimated_value_at: new Date().toISOString(),
          });
        } else {
          await updateCellarWine(e.id, {
            purchase_price: e.n,
            purchase_price_currency: currency,
            // The user has now confirmed/entered it — no longer an estimate.
            purchase_price_estimated: false,
          });
        }
      }
      setValues({});
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function close() { setValues({}); onClose(); }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <ScrollView style={styles.list} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: spacing.md }}>
            {wines.map((w) => (
              <View key={w.id} style={styles.row}>
                <View style={styles.rowMain}>
                  <Text style={styles.rowName} numberOfLines={1}>{[w.producer, w.wine_name].filter(Boolean).join(' ') || w.wine_name}</Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {[w.vintage, w.region].filter(Boolean).join(' · ')}
                    {(w.quantity ?? 1) > 1 ? `  ·  ×${w.quantity}` : ''}  ·  {bottleSizeCl(w.bottle_size_ml ?? 750)}cl
                  </Text>
                </View>
                <View style={styles.inputWrap}>
                  <Text style={styles.sym}>{sym}</Text>
                  <TextInput
                    style={styles.input}
                    value={values[w.id] ?? ''}
                    onChangeText={(t) => setVal(w.id, t)}
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity style={[styles.saveBtn, (saving || parsed.length === 0) && { opacity: 0.5 }]} onPress={handleSave} disabled={saving || parsed.length === 0} activeOpacity={0.85}>
            {saving ? <ActivityIndicator color={colors.background} /> : <Text style={styles.saveBtnText}>{parsed.length > 0 ? `Save ${parsed.length} ${parsed.length === 1 ? 'value' : 'values'}` : 'Enter a value to save'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={close}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderTopWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.lg, maxHeight: '86%' },
  title: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: spacing.md, lineHeight: 20 },
  list: { flexGrow: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1 },
  rowName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  rowMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.sm, backgroundColor: colors.surface, minWidth: 96 },
  sym: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginRight: 2 },
  input: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm, minWidth: 56 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.background },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
