import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/constants/theme';

export default function WelcomeProfile() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.15);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.brand}>Vinster</Text>
      <Text style={styles.tagline}>Your personal sommelier</Text>

      <View style={styles.divider} />

      <Text style={styles.body}>
        Vinster uses AI to recommend wines from restaurant lists, suggest food and wine pairings, and inspire you with recipes — all tailored to your tastes.
      </Text>

      <Text style={styles.body}>
        To get started, we'd like to set up your wine profile. This tells Vinster your preferences — the types of wine you enjoy, your favourite regions and grapes, styles you like, and your usual budget.
      </Text>

      <Text style={styles.body}>
        Your profile is used as the default guide for every recommendation Vinster makes for you. You can update it at any time from your Profile tab.
      </Text>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/onboarding')}>
        <Text style={styles.buttonText}>Set Up My Wine Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(tabs)/scan')}>
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  brand: {
    fontSize: 52,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: colors.gold,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginVertical: spacing.lg,
  },
  body: {
    fontSize: 17,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    color: '#FFFFFF',
    lineHeight: 26,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.gold,
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 17,
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  skipText: {
    fontFamily: 'CormorantGaramond_400Regular',
    color: '#FFFFFF',
    fontSize: 14,
  },
});
