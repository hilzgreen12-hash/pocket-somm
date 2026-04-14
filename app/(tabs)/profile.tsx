import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { StylePicker } from '../../src/components/preferences/StylePicker';
import { BudgetSlider } from '../../src/components/preferences/BudgetSlider';
import { supabase } from '../../src/api/supabase';
import { colors, spacing, typography } from '../../src/constants/theme';

export default function ProfileTab() {
  const { session } = useAuth();
  const { preferences, updatePreferences } = usePreferences();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  if (!session) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>Your Profile</Text>
        <Text style={styles.guestBody}>Sign in to save your taste preferences and scan history.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Text style={styles.heading}>Profile</Text>
      <Text style={styles.email}>{session.user.email}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Style Preferences</Text>
        <Text style={styles.sectionBody}>These pre-fill each scan. You can change them per scan.</Text>
        <StylePicker
          selected={preferences?.styleProfiles ?? []}
          onChange={(profiles) => updatePreferences({ styleProfiles: profiles })}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Default Budget</Text>
        <BudgetSlider
          value={preferences?.defaultBudget ?? 100}
          onChange={(budget) => updatePreferences({ defaultBudget: budget })}
        />
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() =>
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
          ])
        }
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  sectionBody: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  signOutButton: {
    marginTop: spacing.lg,
    padding: spacing.md,
    alignItems: 'center',
  },
  signOutText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '500',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  guestBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
