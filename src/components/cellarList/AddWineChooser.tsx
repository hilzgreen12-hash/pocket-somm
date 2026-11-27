import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useLabelStore } from '../../stores/labelStore';
import { readLabelFromLibrary } from '../../services/labelRead';
import { showAlert } from '../AppAlert';
import type { WineRack } from '../../types/wine';
import { colors, spacing } from '../../constants/theme';
import { fontsSpectral as fonts } from '../../constants/fonts';

interface Props {
  visible: boolean;
  racks: WineRack[];   // for "Add a Lineup"
  onClose: () => void;
  // Where a cancelled search / scan / upload returns to — the screen this
  // chooser was opened from (the Cellar tab or Your Full Cellar List).
  backTo?: string;
}

// Add Wine to Your Cellar: Scan / Upload a label, Add a Lineup, Search/Manual
// Input, or Import a cellar document. Every source lands on the same /label/*
// screens, which return to Your Full Cellar List.
export function AddWineChooser({ visible, racks, onClose, backTo = '/cellar/list' }: Props) {
  const BACK_TO = encodeURIComponent(backTo);
  const [readingLabel, setReadingLabel] = useState(false);
  const resetLabelStore = useLabelStore((s) => s.reset);

  // A blank Confirm form that returns here when cancelled.
  function startManualAdd() {
    resetLabelStore();
    router.push(`/label/confirm?manual=1&backTo=${BACK_TO}`);
  }

  // Read the photo the same way the label camera does — a wine list can be read
  // as one, and a photo that isn't a readable label says so (with the option to
  // type the wine in) instead of opening a blank form.
  async function uploadLabel() {
    const read = await readLabelFromLibrary({
      setReading: setReadingLabel,
      enterManually: { text: 'Enter Manually', onPress: startManualAdd },
    });
    if (read === 'list') router.push('/scan/wine-list?shared=1');
    else if (read === 'label') router.push(`/label/confirm?via=upload&backTo=${BACK_TO}`);
  }

  // A lineup is placed straight into a rack or fridge grid, so pick which one
  // first, then hand off to its slot setup via ?lineup=1.
  function startLineup() {
    const grids = racks.filter((r) => r.storage_type === 'rack' || r.storage_type === 'fridge');
    if (grids.length === 0) {
      showAlert({ title: 'No racks or fridges yet', body: 'Create a wine rack or fridge first, then you can add a lineup straight into it.' });
      return;
    }
    if (grids.length === 1) {
      router.push(`/cellar/rack/${grids[0].id}?lineup=1`);
      return;
    }
    showAlert({
      title: 'Add a Lineup',
      body: "Add up to 6 bottles at a time straight into a wine rack or fridge — select which one you're adding this lineup to below.",
      buttons: [
        ...grids.map((r) => ({ text: r.name, onPress: () => router.push(`/cellar/rack/${r.id}?lineup=1`) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  // The same source chooser as the Cellar tab's "Import Cellar" button.
  function startImport() {
    showAlert({
      title: 'Import Cellar Document',
      body: 'Bring in an existing cellar list.',
      buttons: [
        { text: 'Scan Photo', onPress: () => router.push('/cellar/import-cellar?source=camera') },
        { text: 'Upload Screenshot', onPress: () => router.push('/cellar/import-cellar?source=library') },
        { text: 'Upload File', onPress: () => router.push('/cellar/import-cellar?source=file') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const choices: { label: string; run: () => void }[] = [
    { label: 'Scan Label', run: () => router.push(`/label/camera?backTo=${BACK_TO}`) },
    { label: 'Upload Label', run: () => void uploadLabel() },
    { label: 'Add a Lineup (up to 6 bottles)', run: startLineup },
    { label: 'Search/Manual Input', run: startManualAdd },
    { label: 'Import Cellar Doc', run: startImport },
  ];

  return (
    <>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>Add Wine to Your Cellar</Text>
            <Text style={styles.body}>Scan or Upload a Label or Lineup, or manually input the details.</Text>
            {choices.map((c, i) => (
              <TouchableOpacity key={c.label} style={[styles.btn, i > 0 && { marginTop: spacing.sm }]} onPress={() => { onClose(); c.run(); }}>
                <Text style={styles.btnText}>{c.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={onClose} style={styles.cancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Shown while an uploaded label is read (5–15s) — a cue between the
          picker closing and the Confirm screen opening. */}
      {readingLabel && (
        <View style={styles.readingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.readingText}>Reading the label…</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  body: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  readingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  readingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
