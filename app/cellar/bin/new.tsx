import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { createBin, buildBinCells, binTotalCapacity } from '../../../src/api/bins';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Create a wine bin: a grid of diamonds. Interior cells are full diamonds; the
// ones on the edge of the unit are triangles holding half. We ask for the
// arrangement (diamonds across × down, like a rack's rows/cols) and the
// per-full-diamond bottle capacity, then compute the whole unit's capacity.
function Stepper({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <View style={styles.stepperRow}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.stepValue}>{value}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))} activeOpacity={0.7}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NewBinScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;
  const [name, setName] = useState('');
  const [across, setAcross] = useState(3);
  const [down, setDown] = useState(2);
  const [capacity, setCapacity] = useState(20);
  const [saving, setSaving] = useState(false);

  const cells = buildBinCells(across, down, capacity);
  const diamonds = cells.filter((c) => c.kind === 'diamond').length;
  const triangles = cells.filter((c) => c.kind === 'triangle').length;
  const total = binTotalCapacity(across, down, capacity);

  async function handleSave() {
    if (saving) return;
    if (!userId) { showAlert({ title: 'Sign in needed', body: 'Sign in to create a bin.' }); return; }
    if (!name.trim()) { showAlert({ title: 'Name needed', body: 'Give this bin a name — e.g. "The cellar wall".' }); return; }
    setSaving(true);
    try {
      const bin = await createBin(userId, name.trim(), across, down, capacity);
      qc.invalidateQueries({ queryKey: ['bins', userId] });
      router.replace(`/cellar/bin/${bin.id}` as any);
    } catch (err) {
      showAlert({ title: 'Could not create bin', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Bin</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 80 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <Text style={styles.notice}>
          A bin is a grid of diamonds. The ones on the edge of the unit are triangles that hold half a full diamond.
        </Text>

        <Text style={styles.fieldLabel}>Bin name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. The cellar wall, Diamond bin…"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.fieldLabel}>Arrangement</Text>
        <Stepper label="Diamonds across" value={across} min={1} max={12} onChange={setAcross} />
        <Stepper label="Diamonds down" value={down} min={1} max={12} onChange={setDown} />

        <Text style={styles.fieldLabel}>Bottles per full diamond</Text>
        <Stepper label="Capacity" value={capacity} min={2} max={60} onChange={setCapacity} />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLine}>{diamonds} full {diamonds === 1 ? 'diamond' : 'diamonds'} · {triangles} edge {triangles === 1 ? 'triangle' : 'triangles'}</Text>
          <Text style={styles.summaryTotal}>{total} {total === 1 ? 'bottle' : 'bottles'} total capacity</Text>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
          {saving ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.saveBtnText}>Create Bin</Text>}
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  notice: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  stepperLabel: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: { width: 38, height: 38, borderRadius: 10, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  stepValue: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text, minWidth: 32, textAlign: 'center' },
  summaryBox: { marginTop: spacing.xl, padding: spacing.lg, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center' },
  summaryLine: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  summaryTotal: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 4 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  btnDisabled: { opacity: 0.5 },
});
