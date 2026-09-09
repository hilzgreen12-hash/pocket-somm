import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Slim banner at the very top of the app while the device is offline, so it's
// always clear WHY some things won't load. Sits in the layout flow (pushes
// content down) and renders nothing when online.
export function OfflineBanner() {
  const online = useNetworkStatus();
  const insets = useSafeAreaInsets();
  if (online) return null;
  return (
    <View style={[styles.banner, { paddingTop: insets.top + 6 }]}>
      <Text style={styles.text}>You're offline — showing your saved data. Some features need a connection.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.surfaceElevated, paddingHorizontal: spacing.md, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.divider },
  text: { fontFamily: fonts.bodySemibold, fontSize: 12.5, color: colors.gold, textAlign: 'center', letterSpacing: 0.3, lineHeight: 17 },
});
