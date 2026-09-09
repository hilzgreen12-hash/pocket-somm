import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Branded launch/loading screen shown while the app resolves auth + routing.
// A slow or offline start now shows the Vinster mark and, after a few seconds,
// a gentle connection hint — instead of a blank screen.
export function LoadingScreen() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.mark}>Vinster</Text>
      <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.lg }} />
      {slow ? (
        <Text style={styles.hint}>
          Taking longer than usual — check your connection. Your saved data is still here.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  mark: { fontFamily: fonts.headingBold, fontSize: 40, color: colors.gold, letterSpacing: 1.5 },
  hint: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: spacing.xl, paddingHorizontal: spacing.lg },
});
