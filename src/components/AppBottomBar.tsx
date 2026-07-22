import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Keyboard } from 'react-native';
import { router, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Order + routes match TabSwipeView / the (tabs) navigator, left-to-right.
const TABS = [
  { key: 'scan', label: 'Scan' },
  { key: 'chef', label: 'Dine' },
  { key: 'cellar', label: 'Cellar' },
  { key: 'community', label: 'Community' },
  { key: 'you', label: 'You' },
] as const;

// First route segment groups where the bar should NOT show — the pre-app
// flows (splash / auth / onboarding) and the home screen, which has its own
// hamburger menu, where a nav bar would be out of place or redundant.
const HIDDEN_FIRST = new Set([
  '(auth)', 'auth', 'onboarding', 'onboarding-tour', 'welcome', 'welcome-profile', 'age-gate', 'index', 'home',
]);

// Map a sub-page's first segment to the tab it belongs under, so the right
// destination stays highlighted while you're deep in a flow.
function sectionFor(first: string): string {
  switch (first) {
    case 'cellar': return 'cellar';
    case 'chef': return 'chef';
    case 'scan':
    case 'label': return 'scan';
    case 'community': return 'community';
    case 'profile':
    case 'wines':
    case 'recipes':
    case 'restaurants': return 'you';
    default: return '';
  }
}

// A single persistent bottom nav bar shown on every content screen — mounted
// once in the root layout as a flex sibling of the Stack, so it sits below the
// page rather than floating over it. Replaces the per-(tabs) native tab bar.
export function AppBottomBar() {
  const segments = useSegments() as string[];
  const insets = useSafeAreaInsets();

  // Hide the bar while the keyboard is up so it doesn't ride above the keys on
  // any screen where the user is typing (reviews, search, adding a wine…).
  const [keyboardUp, setKeyboardUp] = useState(false);
  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const show = Keyboard.addListener(showEvt, () => setKeyboardUp(true));
    const hide = Keyboard.addListener(hideEvt, () => setKeyboardUp(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const first = segments[0] ?? 'index';
  const last = segments[segments.length - 1] ?? '';
  // Full-screen camera / capture screens shouldn't carry the bar.
  const isCapture = last === 'camera' || last === 'detect' || last === 'preview' || last === 'extracting';
  if (keyboardUp || segments.length === 0 || HIDDEN_FIRST.has(first) || isCapture) return null;

  const active = first === '(tabs)' ? (segments[1] ?? '') : sectionFor(first);
  const bottomPad = Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 6);

  return (
    <View style={[styles.bar, { paddingBottom: bottomPad }]}>
      {TABS.map((t) => {
        const tint = t.key === active ? colors.gold : colors.textMuted;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.item}
            onPress={() => router.navigate(`/(tabs)/${t.key}` as any)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t.label}
          >
            <MaterialCommunityIcons name="bottle-wine-outline" size={20} color={tint} />
            <Text style={[styles.label, { color: tint }]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 11 },
});
