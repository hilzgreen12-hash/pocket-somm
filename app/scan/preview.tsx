import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function PreviewScreen() {
  const { imageUri, reset } = useScanStore();

  // Pinch-to-zoom + pan so the user can actually read the uploaded wine list
  // and confirm it captured correctly. Mirrors the rack full-screen zoom.
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const base = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const cur = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!imageUri) router.replace('/(tabs)/scan');
  }, [imageUri]);

  if (!imageUri) return null;

  function clampPan(nx: number, ny: number, s: number) {
    const maxX = Math.max(0, (box.w * s - box.w) / 2);
    const maxY = Math.max(0, (box.h * s - box.h) / 2);
    return { tx: Math.min(maxX, Math.max(-maxX, nx)), ty: Math.min(maxY, Math.max(-maxY, ny)) };
  }

  function applyScale(s: number) {
    const clamped = Math.min(5, Math.max(1, s));
    cur.scale = clamped;
    scale.setValue(clamped);
    const c = clampPan(cur.tx, cur.ty, clamped);
    cur.tx = c.tx; cur.ty = c.ty;
    tx.setValue(c.tx); ty.setValue(c.ty);
  }

  const zoomGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => applyScale(base.scale * e.scale))
      .onEnd(() => {
        base.scale = cur.scale; base.tx = cur.tx; base.ty = cur.ty;
        if (cur.scale <= 1.02) { cur.tx = 0; cur.ty = 0; base.tx = 0; base.ty = 0; tx.setValue(0); ty.setValue(0); }
      });
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clampPan(base.tx + e.translationX, base.ty + e.translationY, cur.scale);
        cur.tx = c.tx; cur.ty = c.ty;
        tx.setValue(c.tx); ty.setValue(c.ty);
      })
      .onEnd(() => { base.tx = cur.tx; base.ty = cur.ty; });
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .runOnJS(true)
      .onEnd(() => {
        if (cur.scale > 1.02) {
          // reset
          base.scale = 1; base.tx = 0; base.ty = 0;
          cur.scale = 1; cur.tx = 0; cur.ty = 0;
          scale.setValue(1); tx.setValue(0); ty.setValue(0);
        } else {
          base.scale = 2.5;
          applyScale(2.5);
        }
      });
    return Gesture.Simultaneous(doubleTap, pinch, pan);
  }, [box.w, box.h]);

  function handleRetake() {
    reset();
    router.replace('/(tabs)/scan');
  }

  function handleConfirm() {
    router.push('/scan/extracting');
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.header}>Does this look clear?</Text>
      <Text style={styles.subheader}>Pinch to zoom (or double-tap) and check the wine list text is readable</Text>

      <GestureDetector gesture={zoomGesture}>
        <View
          style={styles.imageBox}
          onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        >
          <Animated.Image
            source={{ uri: imageUri }}
            style={[styles.image, { transform: [{ translateX: tx }, { translateY: ty }, { scale }] }]}
            resizeMode="contain"
          />
        </View>
      </GestureDetector>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
          <Text style={styles.retakeText}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Use This Photo</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    paddingTop: 60,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subheader: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  // The image now grows to fill the space between the header and the action
  // buttons (was a fixed 3:4 box), so it's far larger before any zoom.
  imageBox: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  retakeButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  retakeText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 16,
  },
  confirmButton: {
    flex: 2,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
