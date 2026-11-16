import { useEffect, useMemo, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useScanStore } from '../../src/stores/scanStore';
import { colors, spacing, typography } from '../../src/constants/theme';

// Pages per camera scan (each becomes up to a few tiles; scan-start caps images).
const MAX_PAGES = 4;

export default function PreviewScreen() {
  const { imageUri, imageSource, cameraPages, addCameraPage, setImageUris, clearCameraPages } = useScanStore();
  const fromCamera = imageSource === 'camera';
  const pageNumber = cameraPages.length + 1;

  // Pinch-to-zoom + pan so the user can actually read the uploaded wine list
  // and confirm it captured correctly. Mirrors the rack full-screen zoom.
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const base = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const cur = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Guards against the retake handler and this safety-net effect BOTH firing a
  // navigation when imageUri clears — the double navigation was surfacing the
  // error screen instead of cleanly returning. Pop back to whatever pushed the
  // preview (the camera, or the Wine List page for an upload); a cross-group
  // router.replace from this pushed screen was what crashed into the
  // ErrorBoundary.
  const leaving = useRef(false);
  function leaveCleanly() {
    leaving.current = true;
    if (router.canGoBack()) router.back();
    else router.dismissTo('/scan/wine-list');
  }
  useEffect(() => {
    if (!imageUri && !leaving.current) leaveCleanly();
  }, [imageUri]);

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
    // Just discard the photo and pop back — keep the user's wine preferences
    // (a full reset() here wiped them). The stale image is harmless; the next
    // capture/upload overwrites it.
    leaveCleanly();
  }

  // One tap only — a double tap used to start two (paid) scans.
  const confirmed = useRef(false);
  function handleConfirm() {
    if (confirmed.current || !imageUri) return;
    confirmed.current = true;
    leaving.current = true;
    // Several camera pages → send them all as one list.
    if (cameraPages.length) {
      setImageUris([...cameraPages, imageUri], 'camera');
      clearCameraPages();
    }
    router.push('/scan/extracting');
  }

  // Keep this page and go back to the camera for the next section of the list.
  function handleAddPage() {
    if (!imageUri || confirmed.current) return;
    addCameraPage(imageUri);
    leaving.current = true;
    if (router.canGoBack()) router.back();
  }

  // After every hook (an early return above them broke React's hook order and
  // could crash this screen when Try Again cleared the photo).
  if (!imageUri) return null;

  return (
    <GestureHandlerRootView style={styles.container}>
      <Text style={styles.header}>{fromCamera && cameraPages.length ? `Page ${pageNumber} — does this look clear?` : 'Does this look clear?'}</Text>
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
          <Text style={styles.confirmText}>{cameraPages.length ? `Read ${pageNumber} Pages` : 'Use This Photo'}</Text>
        </TouchableOpacity>
      </View>
      {/* A list longer than one photo: take it a section at a time. */}
      {fromCamera && pageNumber < MAX_PAGES ? (
        <TouchableOpacity onPress={handleAddPage} style={styles.addPage} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.addPageText}>+ Add Another Page</Text>
        </TouchableOpacity>
      ) : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  addPage: { alignSelf: 'center', marginTop: spacing.md },
  addPageText: { fontSize: 15, fontWeight: '600', color: colors.gold, textDecorationLine: 'underline' },
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
