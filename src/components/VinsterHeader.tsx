import { TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

// The Vinster wine-ring mark, centred at the top of every tab page. Tapping
// it opens the full About Vinster screen — this replaces the old "About
// Vinster" footer link. Drop one in as the first element of each tab's scroll
// content.
// `blank`: no mark, just the room it takes — the mark shows on Home only, and
// the other tabs keep the same space so every tab title sits at one height.
export function VinsterHeader({ blank = false }: { blank?: boolean } = {}) {
  if (blank) return <View style={styles.blank} />;
  return (
    <TouchableOpacity
      onPress={() => router.push('/about')}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="About Vinster"
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={styles.wrap}
    >
      <Image source={require('../../assets/vinster-mark.png')} style={styles.mark} resizeMode="contain" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Sits top-left of each tab page. The negative bottom margin lets the tab
  // title pull up alongside it so the mark costs almost no vertical space —
  // it was previously a centred row above the title, pushing content down
  // (and clipping the List page's bottom buttons).
  wrap: { alignSelf: 'flex-start', marginBottom: -34 },
  mark: { width: 52, height: 52 },
  // The mark's height less its negative margin: what it adds above the title.
  blank: { height: 52 - 34 },
});
