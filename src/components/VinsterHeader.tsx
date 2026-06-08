import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { spacing } from '../constants/theme';

// The Vinster wine-ring mark, centred at the top of every tab page. Tapping
// it opens the full About Vinster screen — this replaces the old "About
// Vinster" footer link. Drop one in as the first element of each tab's scroll
// content.
export function VinsterHeader() {
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
  wrap: { alignSelf: 'flex-start', marginBottom: -54 },
  mark: { width: 72, height: 72 },
});
