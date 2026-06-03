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
  wrap: { alignItems: 'center', alignSelf: 'center', marginBottom: spacing.xs },
  mark: { width: 48, height: 48 },
});
