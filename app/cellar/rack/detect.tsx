import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showAlert } from '../../../src/components/AppAlert';
import { router } from 'expo-router';
import { useRackStore } from '../../../src/stores/rackStore';
import { useRacks } from '../../../src/hooks/useRacks';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Persisted "don't show me this again" flag for the fridge depth-doubling tip.
const FRIDGE_DOUBLE_TIP_KEY = 'vinster_hide_fridge_double_tip';

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

  // Depth-doubling tip — surfaced as a popup on the Confirm Fridge screen
  // (camera-detected fridges only) because the inline note is easy to miss.
  // The inline note stays on the page regardless of whether this is dismissed.
  const [showDoubleTip, setShowDoubleTip] = useState(false);
  const [dontShowDoubleTip, setDontShowDoubleTip] = useState(false);
  useEffect(() => {
    if (!(isFridge && cameFromCamera)) return;
    let active = true;
    AsyncStorage.getItem(FRIDGE_DOUBLE_TIP_KEY)
      .then((v) => { if (active && v !== '1') setShowDoubleTip(true); })
      .catch(() => {});
    return () => { active = false; };
  }, [isFridge, cameFromCamera]);

  function dismissDoubleTip() {
    if (dontShowDoubleTip) AsyncStorage.setItem(FRIDGE_DOUBLE_TIP_KEY, '1').catch(() => {});
    setShowDoubleTip(false);
  }

  async function handleSave() {
    if (!name.trim()) {
      showAlert({ title: 'Name required', body: `Please give your ${isFridge ? 'fridge' : 'rack'} a name.` });
      return;
    }
    setSaving(true);
    try {
      const rack = await create.mutateAsync({
        name: name.trim(),
        rows,
        cols,
        storageType: pendingStorageType,
        largeFormat: null,
      });
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

      <KeyboardAwareScrollView style={styles.body} contentContainerStyle={styles.bodyContent} bottomOffset={24} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          {cameFromCamera
            ? `We detected the dimensions below. Adjust if needed, then give your ${isFridge ? 'fridge' : 'rack'} a name.`
            : `Set your dimensions then give your ${isFridge ? 'fridge' : 'rack'} a name.`}
        </Text>

        {isFridge && cameFromCamera ? (
          <Text style={styles.fridgeNote}>
            We've doubled the horizontal positions to include the bottles facing the back of your fridge, which the camera can't see. Adjust down if your fridge is single-depth.
          </Text>
        ) : null}

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{rows} × {cols}</Text>
          <Text style={styles.previewSub}>{rows * cols} bottle slots</Text>
        </View>

        <Counter label="Vertical" value={rows} onChange={setRows} />
        <View style={styles.divider} />
        <Counter label="Horizontal" value={cols} onChange={setCols} />

        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>{isFridge ? 'Fridge' : 'Rack'} Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={isFridge ? 'e.g. Kitchen Wine Fridge' : 'e.g. Dining Room Rack'}
          placeholderTextColor={colors.textMuted}
        />
      </KeyboardAwareScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isFridge ? 'Save Fridge' : 'Save Rack'}</Text>
        </TouchableOpacity>
        {/* Cancel bails out of the whole creation flow. dismissTo pops
            down to the existing /cellar/racks instance so the camera (if
            the user came through it) is dropped off the back stack —
            they don't reappear on the camera on the next back gesture.
            router.navigate would push a second racks screen onto the
            stack, which then loops the user back via the camera. */}
        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => { reset(); router.dismissTo('/cellar/racks'); }}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelLinkText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Depth-doubling tip popup — the inline note below the dimensions is
          easy to miss, so surface it once (until dismissed for good). */}
      <Modal visible={showDoubleTip} transparent animationType="fade" onRequestClose={dismissDoubleTip}>
        <View style={styles.tipOverlay}>
          <View style={styles.tipSheet}>
            <Text style={styles.tipTitle}>About your fridge size</Text>
            <Text style={styles.tipBody}>
              We've doubled the horizontal positions to include the bottles facing the back of your fridge, which the camera can't see. Adjust down if your fridge is single-depth.
            </Text>
            <TouchableOpacity style={styles.tipCheckRow} onPress={() => setDontShowDoubleTip((v) => !v)} activeOpacity={0.7}>
              <View style={[styles.tipCheckbox, dontShowDoubleTip && styles.tipCheckboxOn]}>
                {dontShowDoubleTip ? <Text style={styles.tipCheckmark}>✓</Text> : null}
              </View>
              <Text style={styles.tipCheckLabel}>Don't show me this again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipOkBtn} onPress={dismissDoubleTip} activeOpacity={0.8}>
              <Text style={styles.tipOkBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.lg },
  // Inter — body (processing status)
  loadingText: { fontSize: 19, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 60 },
  // Cormorant — page header
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  body: { flex: 1 },
  bodyContent: { padding: spacing.xl },
  // Inter — intro body
  intro: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl },
  fridgeNote: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 21, marginTop: -spacing.md, marginBottom: spacing.xl },
  preview: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl },
  // Inter — large stat value
  previewLabel: { fontSize: 32, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 1 },
  // Inter — caption
  previewSub: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.xs },
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  // Inter — form label
  counterLabel: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.text },
  counterControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  counterBtn: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  // Cormorant — button text (−/+ glyphs)
  counterBtnText: { fontSize: 22, color: colors.text, fontFamily: fonts.headingRegular },
  // Inter — counter value
  counterValue: { fontSize: 24, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 40, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border },
  largeFormatToggle: { paddingVertical: spacing.md, alignItems: 'center' },
  // Cormorant — inline action link reads as a button
  largeFormatToggleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.5 },
  largeFormatBlock: { paddingVertical: spacing.md, gap: spacing.xs },
  largeFormatHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  // Cormorant — sub-section header
  largeFormatHeading: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  // Inter — inline remove link (small underlined)
  largeFormatRemove: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  // Inter — hint
  largeFormatHint: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, lineHeight: 18, marginBottom: spacing.xs },
  // Inter — form label
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm },
  // Inter — form input
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  footer: { padding: spacing.xl, paddingBottom: 48 },
  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  // Cormorant — button text
  saveButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 17 },
  cancelLink: { alignItems: 'center', paddingVertical: spacing.md },
  // Inter — cancel link (not a button)
  cancelLinkText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  // Depth-doubling tip popup — gold-bordered sheet on a dim scrim.
  tipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  tipSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  tipTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  tipBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  tipCheckRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, paddingVertical: 4 },
  tipCheckbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 1, borderColor: colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  tipCheckboxOn: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.20)' },
  tipCheckmark: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold, lineHeight: 16 },
  tipCheckLabel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  tipOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  tipOkBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.5 },
});
