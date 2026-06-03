import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors, spacing } from '../src/constants/theme';
import { fonts } from '../src/constants/fonts';

export default function WelcomeScreen() {
  const { session } = useAuth();

  // Top-level guard rather than useEffect — if a session installs while
  // the welcome screen is rendering (cold-start email-confirm flows),
  // we want to swap immediately rather than render-then-effect, which
  // briefly flashed the welcome content. /index handles the post-login
  // routing (tour → wine prefs → recipe prefs → list).
  if (session) return <Redirect href="/" />;

  // Minimal landing: just the logo, the one-line tagline, and the
  // create/sign-in prompt. The feature overview that used to live here is
  // now the onboarding carousel a new user sees right after confirming
  // their email — no need to say it twice.
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Image source={require('../assets/vinster-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.tagline}>Your AI Sommelier</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.secondaryText}>Create Account</Text>
          <Text style={styles.secondaryNote}>Save & learn your preferences so your results become more personal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: 60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    width: 250,
    height: 210,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontFamily: fonts.headingItalic,
    fontSize: 22,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  actions: {
    gap: spacing.sm,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  secondaryText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 18,
    color: colors.gold,
  },
  secondaryNote: {
    fontFamily: fonts.bodyItalic,
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  linkButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.textMuted,
  },
});
