import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { showAlert } from '../../../src/components/AppAlert';
import { router } from 'expo-router';
import { useRackStore } from '../../../src/stores/rackStore';
import { useRacks } from '../../../src/hooks/useRacks';
import { colors, spacing } from '../../../src/constants/theme';

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.counterRow}>
      <Text style={styles.counterLabel}>{label}</Text>
      <View style={styles.counterControls}>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.max(1, value - 1))}>
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{value}</Text>
        <TouchableOpacity style={styles.counterBtn} onPress={() => onChange(Math.min(30, value + 1))}>
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RackDetectScreen() {
  const { detectedRows, detectedCols, pendingStorageType, imageUri, reset } = useRackStore();
  // Came in via the camera flow? Back button reads "Retake". Came in via
  // the manual layout chooser? There's nothing to retake — show "Back".
  const cameFromCamera = !!imageUri;
  const isFridge = pendingStorageType === 'fridge';
  const [rows, setRows] = useState(detectedRows);
  const [cols, setCols] = useState(detectedCols);
  const [name, setName] = useState(isFridge ? 'My Wine Fridge' : 'My Wine Rack');
  const [saving, setSaving] = useState(false);
  const { create } = useRacks();

  async function handleSave() {
    if (!name.trim()) {
      showAlert({ title: 'Name required', body: `Please give your ${isFridge ? 'fridge' : 'rack'} a name.` });
      return;
    }
    setSaving(true);
    try {
      const rack = await create.mutateAsync({ name: name.trim(), rows, cols, storageType: pendingStorageType });
      reset();
      router.replace(`/cellar/rack/${rack.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showAlert({ title: `Error saving ${isFridge ? 'fridge' : 'rack'}`, body: msg });
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={styles.loadingText}>{isFridge ? 'Building your fridge…' : 'Building your rack…'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {cameFromCamera ? (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Retake</Text>
          </TouchableOpacity>
        ) : (
          // Manual layout flow — no photograph to retake, and the user
          // came in via a chooser modal so a Back affordance here is just
          // noise. Spacer keeps the title centred.
          <View style={{ width: 60 }} />
        )}
        <Text style={styles.title}>{isFridge ? 'Confirm Fridge' : 'Confirm Rack'}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.intro}>
          {cameFromCamera
            ? `We detected the dimensions below. Adjust if needed, then give your ${isFridge ? 'fridge' : 'rack'} a name.`
            : `Set your dimensions then give your ${isFridge ? 'fridge' : 'rack'} a name.`}
        </Text>

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{rows} × {cols}</Text>
          <Text style={styles.previewSub}>{rows * cols} bottle slots</Text>
        </View>

        <Counter label="Vertical" value={rows} onChange={setRows} />
        <View style={styles.divider} />
        <Counter label="Horizontal" value={cols} onChange={setCols} />

        <Text style={styles.fieldLabel}>{isFridge ? 'Fridge' : 'Rack'} Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={isFridge ? 'e.g. Kitchen Wine Fridge' : 'e.g. Dining Room Rack'}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isFridge ? 'Save Fridge' : 'Save Rack'}</Text>
        </TouchableOpacity>
        {/* Cancel bails out of the whole creation flow. router.navigate
            pops to the existing /cellar/racks instance so the camera (if
            the user came through it) is dropped off the back stack — they
            don't reappear on the camera on the next back gesture. */}
        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => { reset(); router.navigate('/cellar/racks'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.lg },
  loadingText: { fontSize: 19, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 60 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  body: { flex: 1, padding: spacing.xl },
  intro: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl },
  preview: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
  previewLabel: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, letterSpacing: 1 },
  previewSub: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.xs },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  counterLabel: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  counterBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { fontSize: 22, color: colors.text, fontFamily: 'CormorantGaramond_400Regular' },
  counterValue: { fontSize: 24, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, minWidth: 40, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  fieldLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  footer: { padding: spacing.xl, paddingBottom: 48 },
  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  saveButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  cancelLink: { alignItems: 'center', paddingVertical: spacing.md },
  cancelLinkText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
