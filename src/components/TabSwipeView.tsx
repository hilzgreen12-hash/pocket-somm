import { ReactNode, useMemo, useRef } from 'react';
import { View, useWindowDimensions, type ViewStyle, type StyleProp } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router, useSegments } from 'expo-router';

// Tab order matches the bottom tab bar left-to-right. Swipe left = next tab,
// swipe right = previous tab. Wrap each tab screen's root in this view to
// enable carousel-style navigation between the main tabs.
// 'index' is the Scan landing tab (route '/(tabs)'); the rest are named routes.
const TAB_ORDER = ['index', 'scan', 'chef', 'cellar', 'community', 'you'] as const;
const routeFor = (name: string) => (name === 'index' ? '/(tabs)' : `/(tabs)/${name}`);

// Tunables — firm enough that small finger drags don't trigger, but a
// quick flick still switches tabs even when it travels a short distance.
const MOVE_THRESHOLD = 14;    // px travelled before we decide horizontal vs vertical
const COMMIT_DISTANCE = 55;   // px translation that commits a switch on release
const FLING_VELOCITY = 450;   // px/s — a fast flick commits even below COMMIT_DISTANCE

// The tab-switch swipe is only allowed to START in the top third of the screen.
// Below that, the gesture fails so horizontal content (e.g. the Cellar "Your
// Wines At Home" storage carousel) scrolls normally instead of being hijacked
// into a tab change.
const SWIPE_ZONE_FRACTION = 1 / 3;

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TabSwipeView({ children, style }: Props) {
  const segments = useSegments();
  // Last segment of (tabs)/<name> is the active tab name. The Scan landing is
  // the group's index route, so its last segment is '(tabs)' → treat as 'index'.
  const raw = segments[segments.length - 1] ?? '';
  const currentTab = raw === '(tabs)' ? 'index' : raw;
  const { height } = useWindowDimensions();
  const swipeZone = height * SWIPE_ZONE_FRACTION;

  // Per-gesture start position + one-shot decision, tracked on the JS thread
  // (the gesture runs runOnJS so plain refs are safe here).
  const start = useRef({ x: 0, y: 0, absY: 0, decided: false });

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        // Manual activation lets us gate on WHERE the touch began: we only take
        // over (activate) for a horizontal drag starting in the top third;
        // everything else fails so the underlying scroll views keep the touch.
        .manualActivation(true)
        .runOnJS(true)
        .onTouchesDown((e) => {
          const t = e.changedTouches[0];
          start.current = { x: t?.x ?? 0, y: t?.y ?? 0, absY: t?.absoluteY ?? 0, decided: false };
        })
        .onTouchesMove((e, mgr) => {
          if (start.current.decided) return;
          const t = e.allTouches[0];
          if (!t) return;
          const dx = t.x - start.current.x;
          const dy = t.y - start.current.y;
          if (Math.abs(dx) < MOVE_THRESHOLD && Math.abs(dy) < MOVE_THRESHOLD) return;
          start.current.decided = true;
          // Horizontal intent that began in the top third → drive a tab switch.
          if (start.current.absY <= swipeZone && Math.abs(dx) > Math.abs(dy)) {
            mgr.activate();
          } else {
            mgr.fail();
          }
        })
        .onEnd((e) => {
          const idx = TAB_ORDER.indexOf(currentTab as (typeof TAB_ORDER)[number]);
          if (idx === -1) return;
          // Commit on either a long-enough drag OR a fast flick in the same
          // direction. The velocity path is what makes a quick swipe feel
          // responsive — you no longer have to drag the full COMMIT_DISTANCE.
          const goNext = e.translationX < 0 && (e.translationX < -COMMIT_DISTANCE || e.velocityX < -FLING_VELOCITY);
          const goPrev = e.translationX > 0 && (e.translationX > COMMIT_DISTANCE || e.velocityX > FLING_VELOCITY);
          if (goNext && idx < TAB_ORDER.length - 1) {
            router.replace(routeFor(TAB_ORDER[idx + 1]) as any);
          } else if (goPrev && idx > 0) {
            router.replace(routeFor(TAB_ORDER[idx - 1]) as any);
          }
        }),
    [currentTab, swipeZone],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={style}>{children}</View>
    </GestureDetector>
  );
}
