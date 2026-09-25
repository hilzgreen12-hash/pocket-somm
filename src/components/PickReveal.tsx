import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Animated, type ViewStyle, type StyleProp } from 'react-native';

// Fades + rises its children in on mount after `delay` ms. Used to reveal the
// wine-list picks one-by-one so a result that actually arrives all at once still
// feels like it's "coming up" — the recommendation itself is unchanged, only its
// presentation is staggered. Pass delay={0} to show immediately (e.g. history).
export function PickReveal({ delay = 0, style, children }: { delay?: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const t = Animated.timing(anim, { toValue: 1, duration: 340, delay, useNativeDriver: true });
    t.start();
    return () => t.stop();
  }, [anim, delay]);
  return (
    <Animated.View
      style={[style, { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }]}
    >
      {children}
    </Animated.View>
  );
}
