import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { TabFooter } from '../../src/components/TabFooter';
import { colors, spacing } from '../../src/constants/theme';

export default function ProfileTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();

  if (!session) {
    return (
      <View style={[styles.guestContainer, { paddingTop }]}>
        <View style={styles.guestHero}>
          <Text style={styles.guestTitle}>Your Profile</Text>
          <Text style={styles.guestBody}>Set and review your profile settings. These will be the parameters that Vinster uses when making its wine list recommendations and recipe pairings for you.</Text>
        </View>
        <View style={styles.guestActions}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.guestSecondary} onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.guestSecondaryText}>Create Account</Text>
          </TouchableOpacity>
          <TabFooter />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop }]}>
      <View style={styles.hero}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Set and review your profile settings. These will be the parameters that Vinster uses when making its wine list recommendations and recipe pairings for you.</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.whiteBubble} onPress={() => router.push('/profile/wine')}>
          <Text style={styles.whiteBubbleText}>Wine Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.whiteBubble} onPress={() => router.push('/profile/recipe')}>
          <Text style={styles.whiteBubbleText}>Recipe Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.whiteBubble} onPress={() => router.push('/wines/chosen')}>
          <Text style={styles.whiteBubbleText}>Your Chosen Wines</Text>
        </TouchableOpacity>
      </View>

      <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl },
  hero: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5 },
  subtitle: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  actions: { gap: spacing.sm },
  whiteBubble: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  whiteBubbleText: { fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', fontSize: 17 },
  guestContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: 60, backgroundColor: colors.background },
  guestHero: { alignItems: 'center' },
  guestTitle: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.sm, textAlign: 'center' },
  guestBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  guestActions: { width: '100%', gap: spacing.sm },
  guestSecondary: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  guestSecondaryText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
});
