import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { createBin, binDiamondCount, binTriangleCount, binTotalCapacity } from '../../../src/api/bins';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Size a diamond bin by PULLING its corner — the same inverse-crop gesture as
// racks/fridges. Pulling adds whole DIAMONDS (an across × down grid). The bin is
// a rectangular FRAME packed with a real interlocking diamond tessellation; the
// frame clips the boundary diamonds into the half-cubby TRIANGLES that fill the
// gaps between the diamond angles and the straight frame. Starts at 2×2.

const MIN = 1;
const MAX = 10;
const DRAG_PER_CELL = 52;   // finger travel (px) that adds/removes one diamond
const CANVAS_H = 360;
const MAX_CELL = 64;
const HANDLE = 44;
const SQRT2 = Math.SQRT2;

export default function BinResizeScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const [across, setAcross] = useState(2);
  const [down, setDown] = useState(2);
  const [capacity, setCapacity] = useState(20);
  const [name, setName] = useState('My Wine Bin');
  const [saving, setSaving] = useState(false);
  const [vpw, setVpw] = useState(0);

  const handleTX = useRef(new Animated.Value(0)).current;
  const handleTY = useRef(new Animated.Value(0)).current;
  const base = useRef({ across: 2, down: 2 }).current;

  const diamonds = binDiamondCount(across, down);
  const triangles = binTriangleCount(across, down);
  const total = binTotalCapacity(across, down, capacity);

  // The frame is `across` diamonds wide and `down` diamonds tall. Auto-fit so
  // the whole frame stays on screen (adding diamonds zooms it out).
  const d = Math.min(MAX_CELL, vpw > 0 ? vpw / across : MAX_CELL, CANVAS_H / down);
  const W = across * d;
  const H = down * d;
  const originLeft = (vpw - W) / 2;
  const originTop = (CANVAS_H - H) / 2;
  const sd = d / SQRT2; // rotated-square side so its diagonal == one cell (d)

  // Interlocking diamond tessellation: centres on a checkerboard half-grid
  // (i+j even). Rendered slightly past the frame; the frame's overflow:hidden
  // clips the boundary diamonds into the edge-filling triangles.
  const centres: { x: number; y: number }[] = [];
  for (let jj = -1; jj <= down * 2 + 1; jj++) {
    const y = (jj * d) / 2;
    const offset = Math.abs(jj) % 2 === 0 ? 0 : d / 2;
    for (let x = offset - d; x <= W + d + 0.5; x += d) {
      centres.push({ x, y });
    }
  }

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => { base.across = across; base.down = down; })
    .onUpdate((e) => {
      handleTX.setValue(e.translationX);
      handleTY.setValue(e.translationY);
      const na = Math.min(MAX, Math.max(MIN, base.across + Math.round(e.translationX / DRAG_PER_CELL)));
      const nd = Math.min(MAX, Math.max(MIN, base.down + Math.round(e.translationY / DRAG_PER_CELL)));
      if (na !== across) setAcross(na);
      if (nd !== down) setDown(nd);
    })
    .onEnd(() => {
      Animated.spring(handleTX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
      Animated.spring(handleTY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    });

  async function handleSave() {
    if (saving) return;
    if (!userId) { showAlert({ title: 'Sign in needed', body: 'Sign in to create a bin.' }); return; }
    if (!name.trim()) { showAlert({ title: 'Name needed', body: 'Give this bin a name.' }); return; }
    setSaving(true);
    try {
      const bin = await createBin(userId, name.trim(), across, down, capacity);
      qc.invalidateQueries({ queryKey: ['bins'] });
      router.replace(`/cellar/bin/${bin.id}` as any);
    } catch (err) {
      showAlert({ title: 'Could not create bin', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
        <Text style={styles.loadingText}>Building your bin…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Size Your Bin</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <Text style={styles.intro}>Drag the handle out from the centre to size your bin — pull right/down to add diamonds, in toward the centre to remove. The edge triangles fill in against the frame. Lift and pull again for larger sizes.</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{diamonds} {diamonds === 1 ? 'diamond' : 'diamonds'} · {triangles} triangles</Text>
          <Text style={styles.badgeSub}>{total} bottle capacity</Text>
        </View>

        <GestureHandlerRootView style={{ height: CANVAS_H }}>
          <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
            {/* The cubic frame, packed with an interlocking diamond tessellation.
                overflow:hidden clips the boundary diamonds into the triangles
                that fill the gaps between the diamonds and the frame. */}
            {W > 0 && H > 0 ? (
              <View style={[styles.frame, { left: originLeft, top: originTop, width: W, height: H }]}>
                {centres.map((c, i) => (
                  <View
                    key={i}
                    style={{
                      position: 'absolute',
                      left: c.x - sd / 2,
                      top: c.y - sd / 2,
                      width: sd,
                      height: sd,
                      transform: [{ rotate: '45deg' }],
                      borderWidth: 1.25,
                      borderColor: colors.gold,
                      backgroundColor: colors.surfaceElevated,
                    }}
                  />
                ))}
              </View>
            ) : null}

            <GestureDetector gesture={pan}>
              <Animated.View
                style={[
                  styles.handle,
                  { left: originLeft + W / 2 - HANDLE / 2, top: originTop + H / 2 - HANDLE / 2, transform: [{ translateX: handleTX }, { translateY: handleTY }] },
                ]}
              />
            </GestureDetector>
          </View>
        </GestureHandlerRootView>

        <View style={styles.capRow}>
          <Text style={styles.capLabel}>Bottles per full diamond</Text>
          <View style={styles.stepper}>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setCapacity((v) => Math.max(2, v - 1))}><Text style={styles.stepBtnText}>−</Text></TouchableOpacity>
            <Text style={styles.stepVal}>{capacity}</Text>
            <TouchableOpacity style={styles.stepBtn} onPress={() => setCapacity((v) => Math.min(60, v + 1))}><Text style={styles.stepBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Bin name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. The cellar wall"
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Create Bin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.lg },
  loadingText: { fontSize: 19, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  intro: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 21, textAlign: 'center', marginBottom: spacing.lg },
  badge: { alignItems: 'center', marginBottom: spacing.md },
  badgeText: { fontSize: 20, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 0.4 },
  badgeSub: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  canvas: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  // The bin's cubic frame — diamonds are clipped to it, forming the edge triangles.
  frame: { position: 'absolute', overflow: 'hidden', borderWidth: 2, borderColor: colors.gold, borderRadius: 3, backgroundColor: colors.surface },
  handle: { position: 'absolute', width: HANDLE, height: HANDLE, borderRadius: HANDLE / 2, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  capRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg },
  capLabel: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, flex: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stepBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 20, fontFamily: fonts.bodyRegular, color: colors.text },
  stepVal: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 30, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 17 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
