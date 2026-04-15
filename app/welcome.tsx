import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../src/constants/theme';

export default function WelcomeScreen() {
  async function handleGuest() {
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/(tabs)/scan');
  }

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Pocket Somm</Text>
        <Text style={styles.tagline}>Your personal sommelier,{'\n'}wherever you dine</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleGuest}>
          <Text style={styles.primaryText}>Start Scanning</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.secondaryText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.linkText}>Sign In</Text>
        </TouchableOpacity>

        <Text style={styles.accountNote}>
          An account will save & learn your preferences so your results become more personal
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    justifyContent: 'space-between',
    paddingTop: 120,
    paddingBottom: 60,
  },
  hero: {
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 52,
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.lg,
  },
  tagline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 20,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 30,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: colors.text,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 18,
    color: colors.background,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  secondaryText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  linkButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  linkText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 16,
    color: colors.textMuted,
  },
  accountNote: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 13,
    color: colors.textSubtle,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
