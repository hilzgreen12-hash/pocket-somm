import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
// The gesture library's ScrollView: once a tile is picked up (the pan becomes
// active) it cancels the carousel's own scrolling, so the two never fight for
// the finger (the old RN ScrollView let a sideways drag scroll AND drag — stuck).
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// A horizontal carousel of equal-width tiles the user can reorder: hold the grip
// in a tile's top-right corner, then drag left/right. Near the screen edges the
// carousel auto-scrolls. Same feel as ReorderableSections (Home carousels).

export type ReorderableTile = { key: string; node: ReactNode; label?: string };

type Props = {
  items: ReorderableTile[];
  itemWidth: number;
  gap: number;
  onReorder: (keys: string[]) => void;
  // Rendered after the tiles (e.g. a "+ Add" tile); not draggable.
  trailing?: ReactNode;
  // Rendered before the tiles (e.g. a fixed "Favourites" tile); not draggable.
  leading?: ReactNode;
  // Hold anywhere on a tile to pick it up (instead of a corner grip). A hold
  // released WITHOUT moving calls onHold (e.g. to open the tile's menu).
  holdToDrag?: boolean;
  onHold?: (key: string) => void;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

const EDGE = 70;
const MAX_STEP = 14;

export function ReorderableRow({ items, itemWidth, gap, onReorder, trailing, leading, holdToDrag, onHold, style, contentContainerStyle }: Props) {
  const { width: winW } = useWindowDimensions();
  const step = itemWidth + gap;
  const keys = items.map((i) => i.key);
  const keysRef = useRef(keys);
  keysRef.current = keys;

  const offsets = useRef<Record<string, Animated.Value>>({});
  const offsetOf = (k: string) => (offsets.current[k] ??= new Animated.Value(0));
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [scrollLocked, setScrollLocked] = useState(false);

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollX = useRef(0);
  const viewW = useRef(0);
  const contentW = useRef(0);
  const raf = useRef<number | null>(null);
  const drag = useRef<{ key: string; start: string[]; next: string[]; translation: number; absX: number; startX: number } | null>(null);
  const live = useRef({ onReorder, step, winW, onHold });
  live.current = { onReorder, step, winW, onHold };

  function apply() {
    const d = drag.current;
    if (!d) return;
    const st = live.current.step;
    const dx = d.translation + (scrollX.current - d.startX);
    offsetOf(d.key).setValue(dx);
    const from = d.start.indexOf(d.key);
    const to = Math.max(0, Math.min(d.start.length - 1, from + Math.round(dx / st)));
    const others = d.start.filter((k) => k !== d.key);
    const next = [...others.slice(0, to), d.key, ...others.slice(to)];
    if (next.join('|') === d.next.join('|')) return;
    d.next = next;
    for (const k of others) {
      const shift = (next.indexOf(k) - d.start.indexOf(k)) * st;
      Animated.timing(offsetOf(k), { toValue: shift, duration: 140, useNativeDriver: false }).start();
    }
    void Haptics.selectionAsync().catch(() => {});
  }

  function tick() {
    raf.current = null;
    const d = drag.current;
    if (!d || !scrollRef.current) return;
    const w = live.current.winW;
    let v = 0;
    if (d.absX < EDGE) v = -MAX_STEP * Math.min(1, (EDGE - d.absX) / EDGE);
    else if (d.absX > w - EDGE) v = MAX_STEP * Math.min(1, (d.absX - (w - EDGE)) / EDGE);
    if (v === 0) return;
    const max = Math.max(0, contentW.current - viewW.current);
    const nx = Math.max(0, Math.min(max, scrollX.current + v));
    if (nx === scrollX.current) return;
    scrollRef.current.scrollTo({ x: nx, animated: false });
    scrollX.current = nx;
    apply();
    raf.current = requestAnimationFrame(tick);
  }

  function finish(key: string) {
    const d = drag.current;
    if (!d || d.key !== key) return;
    drag.current = null;
    if (raf.current != null) { cancelAnimationFrame(raf.current); raf.current = null; }
    const st = live.current.step;
    const target = (d.next.indexOf(key) - d.start.indexOf(key)) * st;
    // JS-driven (not the native driver) so a neighbour's slide can't finish
    // after the reset below and leave a tile stuck out of place.
    Animated.timing(offsetOf(key), { toValue: target, duration: 120, useNativeDriver: false }).start(() => {
      setActiveKey(null);
      setScrollLocked(false);
      if (d.next.join('|') !== d.start.join('|')) {
        resetOnRedraw.current = true; // cleared in the redraw frame (below)
        live.current.onReorder(d.next);
        setTimeout(() => { if (resetOnRedraw.current) clearOffsets(); }, 250);
      } else {
        clearOffsets();
      }
    });
  }

  // Stop every running slide and put every tile back to zero offset.
  function clearOffsets() {
    for (const v of Object.values(offsets.current)) { v.stopAnimation(); v.setValue(0); }
    resetOnRedraw.current = false;
  }

  // Clear the drag offsets in the same frame the reordered row is drawn — no
  // flash back to the old slot.
  const resetOnRedraw = useRef(false);
  useLayoutEffect(() => {
    if (resetOnRedraw.current) clearOffsets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join('|')]);

  // Hold-to-drag tiles: a hold released WITHOUT dragging opens the tile's menu.
  // The drag (Pan) only switches on once the finger MOVES after the hold, so a
  // still hold never reaches it — a separate LongPress detects that instead.
  const draggedRef = useRef(false);
  const gestures = useMemo(() => {
    const m: Record<string, ReturnType<typeof Gesture.Pan> | ReturnType<typeof Gesture.Simultaneous>> = {};
    for (const key of keys) {
      const pan = Gesture.Pan()
        .runOnJS(true)
        .activateAfterLongPress(holdToDrag ? 300 : 150)
        .onStart((e) => {
          draggedRef.current = true;
          drag.current = { key, start: [...keysRef.current], next: [...keysRef.current], translation: 0, absX: e.absoluteX, startX: scrollX.current };
          setActiveKey(key);
          setScrollLocked(true);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        })
        .onUpdate((e) => {
          const d = drag.current;
          if (!d || d.key !== key) return;
          d.translation = e.translationX;
          d.absX = e.absoluteX;
          apply();
          if (raf.current == null) raf.current = requestAnimationFrame(tick);
        })
        .onFinalize(() => finish(key));
      if (!holdToDrag) { m[key] = pan; continue; }
      const hold = Gesture.LongPress()
        .runOnJS(true)
        .minDuration(400)
        .maxDistance(10)
        .onBegin(() => { draggedRef.current = false; })
        .onStart(() => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}); })
        .onEnd((_e, success) => {
          if (success && !draggedRef.current) live.current.onHold?.(key);
        });
      m[key] = Gesture.Simultaneous(hold, pan);
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys.join('|'), holdToDrag]);

  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); }, []);

  // Screen readers: move a tile left/right without dragging.
  function moveBy(key: string, delta: number) {
    const i = keys.indexOf(key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= keys.length) return;
    const next = [...keys];
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
  }

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEnabled={!scrollLocked}
      scrollEventThrottle={16}
      onScroll={(e) => { scrollX.current = e.nativeEvent.contentOffset.x; }}
      onLayout={(e) => { viewW.current = e.nativeEvent.layout.width; }}
      onContentSizeChange={(w) => { contentW.current = w; }}
      style={style}
      contentContainerStyle={contentContainerStyle}
    >
      {leading}
      {items.map((it) => {
        const lifted = activeKey === it.key;
        return (
          <Animated.View
            key={it.key}
            style={[
              { width: itemWidth, transform: [{ translateX: offsetOf(it.key) }, { scale: lifted ? 1.04 : 1 }] },
              lifted && { zIndex: 10, elevation: 10, opacity: 0.95 },
            ]}
          >
            {holdToDrag ? (
              <GestureDetector gesture={gestures[it.key]}>
                <View
                  collapsable={false}
                  accessible
                  accessibilityHint="Hold to open options, or hold and drag to move"
                  accessibilityActions={[{ name: 'increment', label: 'Move right' }, { name: 'decrement', label: 'Move left' }]}
                  onAccessibilityAction={(e) => moveBy(it.key, e.nativeEvent.actionName === 'increment' ? 1 : -1)}
                >
                  {it.node}
                </View>
              </GestureDetector>
            ) : it.node}
            {holdToDrag ? null : (
            <GestureDetector gesture={gestures[it.key]}>
              <View
                style={styles.grip}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={`Reorder ${it.label ?? 'tile'}`}
                accessibilityHint="Hold and drag to move this tile left or right"
                accessibilityActions={[{ name: 'increment', label: 'Move right' }, { name: 'decrement', label: 'Move left' }]}
                onAccessibilityAction={(e) => moveBy(it.key, e.nativeEvent.actionName === 'increment' ? 1 : -1)}
              >
                <MaterialCommunityIcons name="drag" size={18} color="rgba(255,255,255,0.75)" allowFontScaling={false} style={styles.gripIcon} />
              </View>
            </GestureDetector>
            )}
          </Animated.View>
        );
      })}
      {trailing}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Top-right corner of the tile (the type label sits top-left).
  grip: { position: 'absolute', top: 2, right: 2, width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  gripIcon: { textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 3 },
});
