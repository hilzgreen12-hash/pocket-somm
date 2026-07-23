import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useRackStore } from '../../../src/stores/rackStore';
import { useRacks } from '../../../src/hooks/useRacks';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Size a rack/fridge by PULLING its corner — an "inverse crop" that extends the
// grid, rather than a photo-style zoom (which would just enlarge the same
// bottles). The gesture is continuous (an Animated handle tracks the finger at
// 60fps); rows/cols only COMMIT when the pull crosses a whole-bottle threshold,
// so the grid never rebuilds mid-frame and stays smooth. The whole rack
// auto-scales to stay on screen, which reads as "zoom out as you widen".

const MIN = 1;
const MAX = 30;
const DRAG_PER_CELL = 44;   // finger travel (px) that adds/removes one bottle
const CANVAS_H = 360;       // fixed canvas height; grid fits within it
const MAX_CELL = 54;        // cap so a small 6-bottle rack doesn't render huge
const HANDLE = 44;

export default function RackResizeScreen() {
  const { pendingStorageType, reset } = useRackStore();
  const isFridge = pendingStorageType === 'fridge';
  const { create } = useRacks();

  const [rows, setRows] = useState(2);
  const [cols, setCols] = useState(3);
  const [name, setName] = useState(isFridge ? 'My Wine Fridge' : 'My Wine Rack');
  const [saving, setSaving] = useState(false);
  const [vpw, setVpw] = useState(0);

  // Continuous handle offset during a drag; springs back to the grid corner on
  // release. The grid snaps to whole bottles behind it.
  const handleTX = useRef(new Animated.Value(0)).current;
  const handleTY = useRef(new Animated.Value(0)).current;
  const base = useRef({ rows: 2, cols: 3 }).current;

  // Auto-fit: the entire rack always fits the canvas, so adding bottles zooms
  // the whole thing out.
  const cellPx = Math.min(MAX_CELL, vpw > 0 ? vpw / cols : MAX_CELL, CANVAS_H / rows);
  const gridW = cols * cellPx;
  const gridH = rows * cellPx;
  const originLeft = vpw / 2 - gridW / 2;
  const originTop = CANVAS_H / 2 - gridH / 2;

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => { base.rows = rows; base.cols = cols; })
    .onUpdate((e) => {
      handleTX.setValue(e.translationX);
      handleTY.setValue(e.translationY);
      const nc = Math.min(MAX, Math.max(MIN, base.cols + Math.round(e.translationX / DRAG_PER_CELL)));
      const nr = Math.min(MAX, Math.max(MIN, base.rows + Math.round(e.translationY / DRAG_PER_CELL)));
      if (nc !== cols) setCols(nc);
      if (nr !== rows) setRows(nr);
    })
    .onEnd(() => {
      Animated.spring(handleTX, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
      Animated.spring(handleTY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    });

  function nudge(dr: number, dc: number) {
    setRows((r) => Math.min(MAX, Math.max(MIN, r + dr)));
    setCols((c) => Math.min(MAX, Math.max(MIN, c + dc)));
  }

  async function handleSave() {
    if (!name.trim()) { showAlert({ title: 'Name required', body: `Please name your ${isFridge ? 'fridge' : 'rack'}.` }); return; }
    setSaving(true);
    try {
      const rack = await create.mutateAsync({ name: name.trim(), rows, cols, storageType: pendingStorageType, largeFormat: null });
      reset();
      router.replace(`/cellar/rack/${rack.id}`);
    } catch (err) {
      showAlert({ title: 'Error', body: err instanceof Error ? err.message : String(err) });
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
        <TouchableOpacity onPress={() => { reset(); router.back(); }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{isFridge ? 'Size Your Fridge' : 'Size Your Rack'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        <Text style={styles.intro}>Pull the corner to size your {isFridge ? 'fridge' : 'rack'} — each pull adds a row or column of bottles.{isFridge ? ' For each row create a space for bottles facing forward and backward.' : ''}</Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{rows} × {cols}</Text>
          <Text style={styles.badgeSub}>{rows * cols} bottle slots</Text>
        </View>

        <GestureHandlerRootView style={{ height: CANVAS_H }}>
          <View style={styles.canvas} onLayout={(e) => setVpw(e.nativeEvent.layout.width)}>
            {/* The grid — absolutely positioned + centred so it can grow in any
                direction from the middle. */}
            <View style={{ position: 'absolute', left: originLeft, top: originTop, width: gridW, height: gridH }}>
              {Array.from({ length: rows }).map((_, r) => (
                <View key={r} style={{ flexDirection: 'row', height: cellPx }}>
                  {Array.from({ length: cols }).map((_, c) => (
                    <View key={c} style={{ width: cellPx, height: cellPx, padding: cellPx * 0.08 }}>
                      <View style={styles.slot} />
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Corner pull handle — tracks the finger, springs back on release. */}
            <GestureDetector gesture={pan}>
              <Animated.View
                style={[
                  styles.handle,
                  {
                    left: originLeft + gridW - HANDLE / 2,
                    top: originTop + gridH - HANDLE / 2,
                    transform: [{ translateX: handleTX }, { translateY: handleTY }],
                  },
                ]}
              >
                <Text style={styles.handleGlyph}>⤡</Text>
              </Animated.View>
            </GestureDetector>
          </View>
        </GestureHandlerRootView>

        {/* Precision fallback — fine-tune without fighting the gesture. */}
        <View style={styles.nudgeRow}>
          <View style={styles.nudgeGroup}>
            <Text style={styles.nudgeLabel}>Horizontal</Text>
            <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(0, -1)}><Text style={styles.nudgeBtnText}>−</Text></TouchableOpacity>
            <Text style={styles.nudgeVal}>{cols}</Text>
            <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(0, 1)}><Text style={styles.nudgeBtnText}>+</Text></TouchableOpacity>
          </View>
          <View style={styles.nudgeGroup}>
            <Text style={styles.nudgeLabel}>Vertical</Text>
            <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(-1, 0)}><Text style={styles.nudgeBtnText}>−</Text></TouchableOpacity>
            <Text style={styles.nudgeVal}>{rows}</Text>
            <TouchableOpacity style={styles.nudgeBtn} onPress={() => nudge(1, 0)}><Text style={styles.nudgeBtnText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <Text style={styles.fieldLabel}>{isFridge ? 'Fridge' : 'Rack'} name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={isFridge ? 'e.g. Kitchen Wine Fridge' : 'e.g. Dining Room Rack'}
          placeholderTextColor={colors.textMuted}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>{isFridge ? 'Save Fridge' : 'Save Rack'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); router.back(); }}>
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
  badgeText: { fontSize: 30, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 1 },
  badgeSub: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  canvas: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  slot: { flex: 1, borderRadius: 5, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surfaceElevated },
  handle: { position: 'absolute', width: HANDLE, height: HANDLE, borderRadius: HANDLE / 2, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  handleGlyph: { fontSize: 22, color: colors.background, fontFamily: fonts.bodyBold },
  nudgeRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: spacing.lg },
  nudgeGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  nudgeLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: 4 },
  nudgeBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  nudgeBtnText: { fontSize: 20, fontFamily: fonts.bodyRegular, color: colors.text },
  nudgeVal: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.text, minWidth: 28, textAlign: 'center' },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  saveBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 17 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
