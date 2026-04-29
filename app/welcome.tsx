import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../src/constants/theme';

export default function WelcomeScreen() {
  async function handleGuest() {
    await AsyncStorage.setItem('hasLaunched', 'true');
    router.replace('/(tabs)/scan');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>Vinster</Text>
        <Text style={styles.tagline}>Your personal sommelier</Text>
      </View>

      <View style={styles.heroDivider} />

      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Wine List Scanner</Text>
          <Text style={styles.featureBody}>Scan any wine list and get three personalised recommendations from your AI sommelier — matched to your taste, budget, and the food you're eating.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Label Scanner</Text>
          <Text style={styles.featureBody}>Point your camera at any bottle to identify the wine, see critic scores and drinking windows, get chef-inspired recipes to pair, and add wines to your cellar.</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.feature}>
          <Text style={styles.featureTitle}>Your Cellar</Text>
          <Text style={styles.featureBody}>Organise your wine cellar, access useful insight into your collection including drinking windows and values. View as a list or as a virtual wine rack reflecting IRL storage locations.</Text>
        </View>
      </View>

      <View style={styles.actionsDivider} />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(auth)/sign-up')}>
          <Text style={styles.secondaryText}>Create Account</Text>
          <Text style={styles.secondaryNote}>Save & learn your preferences so your results become more personal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleGuest}>
          <Text style={styles.primaryText}>Start Scanning</Text>
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
    paddingTop: 120,
    paddingBottom: 60,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  hero: {
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 52,
    color: colors.text,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 20,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 30,
  },
  actionsDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  heroDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  features: {
    gap: spacing.md,
  },
  feature: {
    gap: 6,
  },
  featureTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 17,
    color: colors.text,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  featureBody: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 21,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.md,
    alignItems: 'center',
  },
  primaryText: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    gap: 6,
  },
  secondaryText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: colors.text,
  },
  secondaryNote: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
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
});
