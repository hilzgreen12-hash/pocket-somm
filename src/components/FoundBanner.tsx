import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { router, usePathname } from 'expo-router';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Small, non-blocking banner shown over a storage screen after Quick Command's
// "Find a bottle" lands there: "Found 3 bottles of Château Rieussec" + Done.
// The highlighted bottles stay visible behind it; Done clears the highlight and
// leaves the user on the location screen. Hides itself if the user navigates away.

type Banner = { text: string; pathname: string } | null;
let banner: Banner = null;
const listeners = new Set<() => void>();
const set = (b: Banner) => { banner = b; listeners.forEach((fn) => fn()); };

export function showFoundBanner(text: string, pathname: string) { set({ text, pathname }); }
export function hideFoundBanner() { set(null); }

export function FoundBannerHost() {
  const b = useSyncExternalStore((fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => banner, () => banner);
  const pathname = usePathname();
  const fade = useRef(new Animated.Value(0)).current;
  const [shown, setShown] = useState<Banner>(null);

  // Show once the target screen is in front; drop it if the user leaves it.
  useEffect(() => {
    if (b && pathname === b.pathname) {
      setShown(b);
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else if (b && shown && pathname !== b.pathname) {
      hideFoundBanner();
    } else if (!b) {
      setShown(null);
      fade.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b, pathname]);

  if (!shown) return null;

  function done() {
    hideFoundBanner();
    // Clear the highlight on the storage screen (rack / bin / alt cellar).
    router.setParams({ highlight: undefined } as any);
  }

  return (
    <Animated.View style={[styles.wrap, { opacity: fade }]} pointerEvents="box-none">
      <View style={styles.card} accessibilityLiveRegion="polite">
        <Text style={styles.text} numberOfLines={3}>{shown.text}</Text>
        <TouchableOpacity style={styles.btn} onPress={done} activeOpacity={0.8} accessibilityRole="button">
          <Text style={styles.btnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold, borderRadius: 14,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  text: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, lineHeight: 21 },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 8, paddingHorizontal: spacing.lg },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
