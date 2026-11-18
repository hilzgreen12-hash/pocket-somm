import { useMemo, useRef, useState } from 'react';
import { Animated, useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';

type Pan = { scale: number; tx: number; ty: number };

// Pinch-zoom for the rack grid.
//
// Inline: the grid zooms and pans inside its clipped cream viewport, like a
// photo in the phone gallery. While zoomed, the caller turns off the
// swipe-between-racks gesture and the page scroll so a one-finger drag pans the
// grid. A firm pinch (past ~1.5x) promotes into a full-screen overlay where the
// grid can reach the screen edges; pinching back to ~1x closes it. RN Animated
// on the JS thread (runOnJS) — no Reanimated. `base` is committed at gesture
// start, `cur` is live; the pan is clamped so the grid can't be dragged past its
// own edges.
export function useRackZoom() {
  const { width, height } = useWindowDimensions();

  // ---- Inline ----
  const [isZoomed, setIsZoomed] = useState(false);
  const zScale = useRef(new Animated.Value(1)).current;
  const zTx = useRef(new Animated.Value(0)).current;
  const zTy = useRef(new Animated.Value(0)).current;
  const zBase = useRef<Pan>({ scale: 1, tx: 0, ty: 0 }).current;
  const zCur = useRef<Pan>({ scale: 1, tx: 0, ty: 0 }).current;
  const viewport = useRef({ w: 0, h: 0 });
  const content = useRef({ w: 0, h: 0 });

  function clamp(tx: number, ty: number, scale: number, box: { w: number; h: number }, size: { w: number; h: number }) {
    const maxX = Math.max(0, (size.w * scale - box.w) / 2);
    const maxY = Math.max(0, (size.h * scale - box.h) / 2);
    return { tx: Math.min(maxX, Math.max(-maxX, tx)), ty: Math.min(maxY, Math.max(-maxY, ty)) };
  }

  function resetZoom() {
    Object.assign(zBase, { scale: 1, tx: 0, ty: 0 });
    Object.assign(zCur, { scale: 1, tx: 0, ty: 0 });
    Animated.parallel([
      Animated.timing(zScale, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.timing(zTx, { toValue: 0, duration: 180, useNativeDriver: false }),
      Animated.timing(zTy, { toValue: 0, duration: 180, useNativeDriver: false }),
    ]).start();
    setIsZoomed(false);
  }

  // ---- Full screen ----
  const [fullScreen, setFullScreen] = useState(false);
  const fsScale = useRef(new Animated.Value(1)).current;
  const fsTx = useRef(new Animated.Value(0)).current;
  const fsTy = useRef(new Animated.Value(0)).current;
  const fsBase = useRef<Pan>({ scale: 1, tx: 0, ty: 0 }).current;
  const fsCur = useRef<Pan>({ scale: 1, tx: 0, ty: 0 }).current;
  const fsContent = useRef({ w: 0, h: 0 });

  function setFs(p: Pan) {
    Object.assign(fsBase, p);
    Object.assign(fsCur, p);
    fsScale.setValue(p.scale); fsTx.setValue(p.tx); fsTy.setValue(p.ty);
  }

  function openFullScreen(startScale: number) {
    setFs({ scale: Math.min(5, Math.max(1.6, startScale)), tx: 0, ty: 0 });
    setFullScreen(true);
    resetZoom(); // collapse the inline rack sitting behind the overlay
  }

  function closeFullScreen() {
    setFs({ scale: 1, tx: 0, ty: 0 });
    setFullScreen(false);
  }

  // Pinch (any time) + one-finger pan (only when zoomed).
  const inlineGesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        const s = Math.min(5, Math.max(1, zBase.scale * e.scale));
        zCur.scale = s;
        zScale.setValue(s);
        // Keep the pan within the new scale's bounds (zooming out shrinks them).
        const c = clamp(zCur.tx, zCur.ty, s, viewport.current, content.current);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx); zTy.setValue(c.ty);
      })
      .onEnd(() => {
        Object.assign(zBase, zCur);
        if (zCur.scale <= 1.02) resetZoom();
        else if (zCur.scale >= 1.5) openFullScreen(zCur.scale);
        else if (!isZoomed) setIsZoomed(true);
      });
    const pan = Gesture.Pan()
      .enabled(isZoomed)
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clamp(zBase.tx + e.translationX, zBase.ty + e.translationY, zCur.scale, viewport.current, content.current);
        zCur.tx = c.tx; zCur.ty = c.ty;
        zTx.setValue(c.tx); zTy.setValue(c.ty);
      })
      .onEnd(() => { zBase.tx = zCur.tx; zBase.ty = zCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZoomed]);

  const fullScreenGesture = useMemo(() => {
    const screen = { w: width, h: height };
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        const s = Math.min(6, Math.max(1, fsBase.scale * e.scale));
        fsCur.scale = s;
        fsScale.setValue(s);
        const c = clamp(fsCur.tx, fsCur.ty, s, screen, fsContent.current);
        fsCur.tx = c.tx; fsCur.ty = c.ty;
        fsTx.setValue(c.tx); fsTy.setValue(c.ty);
      })
      .onEnd(() => {
        Object.assign(fsBase, fsCur);
        if (fsCur.scale <= 1.05) closeFullScreen();
      });
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        const c = clamp(fsBase.tx + e.translationX, fsBase.ty + e.translationY, fsCur.scale, screen, fsContent.current);
        fsCur.tx = c.tx; fsCur.ty = c.ty;
        fsTx.setValue(c.tx); fsTy.setValue(c.ty);
      })
      .onEnd(() => { fsBase.tx = fsCur.tx; fsBase.ty = fsCur.ty; });
    return Gesture.Simultaneous(pinch, pan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  const size = (ref: { current: { w: number; h: number } }) => (e: LayoutChangeEvent) => {
    ref.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height };
  };

  return {
    isZoomed,
    inline: {
      gesture: inlineGesture,
      transform: [{ translateX: zTx }, { translateY: zTy }, { scale: zScale }],
      onViewportLayout: size(viewport),
      onContentLayout: size(content),
    },
    fullScreen: {
      visible: fullScreen,
      gesture: fullScreenGesture,
      transform: [{ translateX: fsTx }, { translateY: fsTy }, { scale: fsScale }],
      onContentLayout: size(fsContent),
      close: closeFullScreen,
    },
  };
}
