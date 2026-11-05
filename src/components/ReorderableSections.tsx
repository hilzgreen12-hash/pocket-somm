import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { View, Text, Animated, StyleSheet, useWindowDimensions, type ScrollView, type NativeSyntheticEvent, type NativeScrollEvent, type LayoutChangeEvent, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../constants/theme';

// A vertical stack of titled sections the user can reorder by holding the grip
// beside a title and dragging. JS-thread Animated (like CoteDorMap) — there are
// only a handful of sections, so no worklets needed.

export type ReorderableSection = { key: string; title: string; content: ReactNode };

// The page ScrollView, so a drag near the screen's top/bottom edge can scroll it.
// Spread `scrollProps` onto that ScrollView and pass `host` to ReorderableSections.
export type AutoScrollHost = {
  ref: React.RefObject<ScrollView | null>;
  y: React.MutableRefObject<number>;
  maxY: () => number;
};
export function useAutoScrollHost() {
  const ref = useRef<ScrollView | null>(null);
  const y = useRef(0);
  const viewH = useRef(0);
  const contentH = useRef(0);
  const host = useMemo<AutoScrollHost>(() => ({ ref, y, maxY: () => Math.max(0, contentH.current - viewH.current) }), []);
  const scrollProps = {
    ref,
    scrollEventThrottle: 16,
    onScroll: (e: NativeSyntheticEvent<NativeScrollEvent>) => { y.current = e.nativeEvent.contentOffset.y; },
    onLayout: (e: LayoutChangeEvent) => { viewH.current = e.nativeEvent.layout.height; },
    onContentSizeChange: (_w: number, h: number) => { contentH.current = h; },
  };
  return { host, scrollProps };
}

// How close (px) to the top/bottom of the screen a drag starts scrolling, and
// the fastest it scrolls per frame (right at the edge).
const EDGE = 110;
const MAX_STEP = 16;

type Props = {
  sections: ReorderableSection[];
  order: string[];
  onReorder: (order: string[]) => void;
  // Lets the parent lock its ScrollView while a section is being dragged.
  onDragActive?: (active: boolean) => void;
  headerStyle: StyleProp<TextStyle>;
  separatorStyle: StyleProp<ViewStyle>;
  // Background painted behind the lifted section so it covers its neighbours.
  liftedBackground?: string;
  // Optional: scroll the page when a drag nears the top/bottom of the screen.
  autoScroll?: AutoScrollHost;
};

export function ReorderableSections({ sections, order, onReorder, onDragActive, headerStyle, separatorStyle, liftedBackground = colors.background, autoScroll }: Props) {
  const { height: winH } = useWindowDimensions();
  const live = useRef({ autoScroll, winH });
  live.current = { autoScroll, winH };
  const byKey = useMemo(() => new Map(sections.map((s) => [s.key, s])), [sections]);
  const keys = order.filter((k) => byKey.has(k));

  const heights = useRef<Record<string, number>>({});
  const offsets = useRef<Record<string, Animated.Value>>({});
  const offsetOf = (k: string) => (offsets.current[k] ??= new Animated.Value(0));
  const [activeKey, setActiveKey] = useState<string | null>(null);

  // Live copies for the gesture callbacks (created once per key).
  const keysRef = useRef(keys);
  keysRef.current = keys;
  // translation = finger movement; scrolled = how far auto-scroll has moved the
  // page since the drag began (the lifted section must follow both).
  const drag = useRef<{ key: string; start: string[]; next: string[]; translation: number; absY: number; scrolled: number; startY: number } | null>(null);
  const raf = useRef<number | null>(null);

  const topsFor = (list: string[]) => {
    const tops: Record<string, number> = {};
    let y = 0;
    for (const k of list) { tops[k] = y; y += heights.current[k] ?? 0; }
    return tops;
  };

  function onUpdate(key: string, translation: number, absY: number) {
    const d = drag.current;
    if (!d || d.key !== key) return;
    d.translation = translation;
    d.absY = absY;
    applyDrag(key);
    if (raf.current == null) raf.current = requestAnimationFrame(autoScrollTick);
  }

  // Each frame while the finger sits in an edge zone, scroll the page and move
  // the lifted section by the same amount so it stays under the finger.
  function autoScrollTick() {
    raf.current = null;
    const d = drag.current;
    const host = live.current.autoScroll;
    if (!d || !host?.ref.current) return;
    const h = live.current.winH;
    let step = 0;
    if (d.absY < EDGE) step = -MAX_STEP * Math.min(1, (EDGE - d.absY) / EDGE);
    else if (d.absY > h - EDGE) step = MAX_STEP * Math.min(1, (d.absY - (h - EDGE)) / EDGE);
    if (step === 0) return;
    const nextY = Math.max(0, Math.min(host.maxY(), host.y.current + step));
    if (nextY === host.y.current) return;
    host.ref.current.scrollTo({ y: nextY, animated: false });
    host.y.current = nextY;
    d.scrolled = nextY - d.startY;
    applyDrag(d.key);
    raf.current = requestAnimationFrame(autoScrollTick);
  }

  function applyDrag(key: string) {
    const d = drag.current;
    if (!d || d.key !== key) return;
    const dy = d.translation + d.scrolled;
    offsetOf(key).setValue(dy);
    const oldTops = topsFor(d.start);
    const center = oldTops[key] + (heights.current[key] ?? 0) / 2 + dy;
    const others = d.start.filter((k) => k !== key);
    let t = 0;
    for (const k of others) if (oldTops[k] + (heights.current[k] ?? 0) / 2 < center) t++;
    const next = [...others.slice(0, t), key, ...others.slice(t)];
    if (next.join('|') === d.next.join('|')) return;
    d.next = next;
    const newTops = topsFor(next);
    for (const k of others) {
      Animated.timing(offsetOf(k), { toValue: newTops[k] - oldTops[k], duration: 150, useNativeDriver: true }).start();
    }
    void Haptics.selectionAsync().catch(() => {});
  }

  function finish(key: string) {
    const d = drag.current;
    if (!d || d.key !== key) return;
    drag.current = null;
    if (raf.current != null) { cancelAnimationFrame(raf.current); raf.current = null; }
    const oldTops = topsFor(d.start);
    const newTops = topsFor(d.next);
    Animated.timing(offsetOf(key), { toValue: newTops[key] - oldTops[key], duration: 120, useNativeDriver: true }).start(() => {
      for (const k of d.start) offsetOf(k).setValue(0);
      setActiveKey(null);
      onDragActive?.(false);
      if (d.next.join('|') !== d.start.join('|')) onReorder(d.next);
    });
  }

  // One pan per section key. Hold briefly, then drag — so a normal swipe on the
  // grip still scrolls the page.
  const gestures = useMemo(() => {
    const m: Record<string, ReturnType<typeof Gesture.Pan>> = {};
    for (const s of sections) {
      const key = s.key;
      m[key] = Gesture.Pan()
        .runOnJS(true)
        .activateAfterLongPress(150)
        .onStart(() => {
          drag.current = { key, start: [...keysRef.current], next: [...keysRef.current], translation: 0, absY: 0, scrolled: 0, startY: live.current.autoScroll?.y.current ?? 0 };
          setActiveKey(key);
          onDragActive?.(true);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
        })
        .onUpdate((e) => onUpdate(key, e.translationY, e.absoluteY))
        .onFinalize(() => finish(key));
    }
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections.map((s) => s.key).join('|')]);

  // Screen readers: move a section up/down without dragging.
  function moveBy(key: string, delta: number) {
    const i = keys.indexOf(key);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= keys.length) return;
    const next = [...keys];
    [next[i], next[j]] = [next[j], next[i]];
    onReorder(next);
  }

  useEffect(() => () => { if (raf.current != null) cancelAnimationFrame(raf.current); onDragActive?.(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View>
      {keys.map((key, i) => {
        const s = byKey.get(key)!;
        const lifted = activeKey === key;
        return (
          <Animated.View
            key={key}
            onLayout={(e) => { heights.current[key] = e.nativeEvent.layout.height; }}
            style={[
              { transform: [{ translateY: offsetOf(key) }] },
              lifted && { zIndex: 10, elevation: 10, backgroundColor: liftedBackground, opacity: 0.94 },
            ]}
          >
            {i > 0 && <View style={separatorStyle} />}
            <View style={styles.headerRow}>
              <GestureDetector gesture={gestures[key]}>
                <View
                  style={styles.grip}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible
                  accessibilityRole="adjustable"
                  accessibilityLabel={`Reorder ${s.title}`}
                  accessibilityHint="Hold and drag to move this section up or down"
                  accessibilityActions={[{ name: 'increment', label: 'Move down' }, { name: 'decrement', label: 'Move up' }]}
                  onAccessibilityAction={(e) => moveBy(key, e.nativeEvent.actionName === 'increment' ? 1 : -1)}
                >
                  <MaterialCommunityIcons name="drag" size={22} color={lifted ? colors.gold : 'rgba(255,255,255,0.55)'} allowFontScaling={false} />
                </View>
              </GestureDetector>
              <Text style={[headerStyle, styles.headerText]}>{s.title}</Text>
            </View>
            {s.content}
          </Animated.View>
        );
      })}
    </View>
  );
}

// Merge a saved order with the current section keys: keep saved positions for
// keys that still exist, then append any new sections in their default order.
export function mergeSectionOrder(saved: string[] | null | undefined, defaults: string[]): string[] {
  const known = new Set(defaults);
  const kept = (saved ?? []).filter((k, i, a) => known.has(k) && a.indexOf(k) === i);
  return [...kept, ...defaults.filter((k) => !kept.includes(k))];
}

const styles = StyleSheet.create({
  // Title stays centred; the grip sits at the left indent.
  headerRow: { justifyContent: 'center' },
  headerText: { paddingHorizontal: 32 },
  // bottom matches the title's marginBottom so the grip centres on the text.
  grip: { position: 'absolute', left: 0, top: 0, bottom: spacing.md, width: 28, justifyContent: 'center', zIndex: 2 },
});
