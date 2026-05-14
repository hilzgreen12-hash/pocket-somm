import { ReactNode, useMemo } from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router, useSegments } from 'expo-router';

// Tab order matches the bottom tab bar left-to-right. Swipe left = next tab,
// swipe right = previous tab. Wrap each tab screen's root in this view to
// enable carousel-style navigation between the main tabs.
const TAB_ORDER = ['scan', 'chef', 'cellar', 'community'] as const;

// Tunables — set to feel firm enough that small finger drags don't trigger.
const ACTIVATE_OFFSET = 30;   // px horizontal before the gesture takes over
const FAIL_OFFSET_Y = 30;     // px vertical before the gesture gives up (lets ScrollView win)
const COMMIT_DISTANCE = 80;   // px translation required to actually switch tab

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
          if (e.translationX < -COMMIT_DISTANCE && idx < TAB_ORDER.length - 1) {
            router.replace(`/(tabs)/${TAB_ORDER[idx + 1]}` as any);
          } else if (e.translationX > COMMIT_DISTANCE && idx > 0) {
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
