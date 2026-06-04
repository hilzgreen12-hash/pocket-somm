import { ReactNode, useMemo } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router, useSegments } from 'expo-router';

// Tab order matches the bottom tab bar left-to-right. Swipe left = next tab,
// swipe right = previous tab. Wrap each tab screen's root in this view to
// enable carousel-style navigation between the main tabs.
const TAB_ORDER = ['scan', 'chef', 'cellar', 'community', 'you'] as const;

// Tunables — firm enough that small finger drags don't trigger, but a
// quick flick still switches tabs even when it travels a short distance.
const ACTIVATE_OFFSET = 18;   // px horizontal before the gesture takes over
const FAIL_OFFSET_Y = 28;     // px vertical before the gesture gives up (lets ScrollView win)
const COMMIT_DISTANCE = 55;   // px translation that commits a switch on release
const FLING_VELOCITY = 450;   // px/s — a fast flick commits even below COMMIT_DISTANCE

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TabSwipeView({ children, style }: Props) {
  const segments = useSegments();
  // Last segment of (tabs)/<name> is the active tab name. If we're not on
  // a tab screen, currentTab will be empty and the gesture short-circuits.
  const currentTab = segments[segments.length - 1] ?? '';

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-ACTIVATE_OFFSET, ACTIVATE_OFFSET])
        .failOffsetY([-FAIL_OFFSET_Y, FAIL_OFFSET_Y])
        .runOnJS(true)
        .onEnd((e) => {
          const idx = TAB_ORDER.indexOf(currentTab as (typeof TAB_ORDER)[number]);
          if (idx === -1) return;
          // Commit on either a long-enough drag OR a fast flick in the same
          // direction. The velocity path is what makes a quick swipe feel
          // responsive — you no longer have to drag the full COMMIT_DISTANCE.
          const goNext = e.translationX < 0 && (e.translationX < -COMMIT_DISTANCE || e.velocityX < -FLING_VELOCITY);
          const goPrev = e.translationX > 0 && (e.translationX > COMMIT_DISTANCE || e.velocityX > FLING_VELOCITY);
          if (goNext && idx < TAB_ORDER.length - 1) {
            router.replace(`/(tabs)/${TAB_ORDER[idx + 1]}` as any);
          } else if (goPrev && idx > 0) {
            router.replace(`/(tabs)/${TAB_ORDER[idx - 1]}` as any);
          }
        }),
    [currentTab],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View style={style}>{children}</View>
    </GestureDetector>
  );
}
