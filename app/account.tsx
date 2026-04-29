import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { supabase } from '../src/api/supabase';
import { colors, spacing } from '../src/constants/theme';

const PREMIUM_FEATURES = [
  'Unlimited wine list scans',
  'Full cellar management & tracking',
  'Chef recipe pairings',
  'Priority AI recommendations',
  'Exclusive vintage & critic reports',
];

export default function AccountScreen() {
  const { session } = useAuth();
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  function toggleEmailChange() {
    setEmailChangeOpen((v) => !v);
    setNewEmail('');
  }

  async function handleEmailChange() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    const redirectTo = Linking.createURL('auth/callback');
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: redirectTo },
    );
    setEmailSaving(false);
    if (error) {
      Alert.alert('Unable to update email', error.message);
    } else {
      setEmailChangeOpen(false);
      setNewEmail('');
      Alert.alert(
        'Check both inboxes',
        'Confirmation links have been sent to your current and new email address. Tap both links to complete the change.',
      );
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/(auth)/sign-in');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Account</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <Text style={styles.emailText}>{session?.user.email}</Text>
        {!emailChangeOpen ? (
          <TouchableOpacity onPress={toggleEmailChange} style={styles.changeEmailButton}>
            <Text style={styles.changeLink}>Change email address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.emailChangeWrap}>
            <TextInput
              style={styles.input}
              placeholder="New email address"
              placeholderTextColor={colors.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            <View style={styles.emailChangeRow}>
              <TouchableOpacity onPress={toggleEmailChange}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleEmailChange} disabled={emailSaving}>
                {emailSaving
                  ? <ActivityIndicator color={colors.background} size="small" />
                  : <Text style={styles.confirmButtonText}>Confirm</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan</Text>
        <View style={styles.planRow}>
          <Text style={styles.planName}>Free</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planBadgeText}>CURRENT PLAN</Text>
          </View>
        </View>
      </View>

      <View style={styles.upgradeCard}>
        <Text style={styles.upgradeHeading}>Vinster Premium</Text>
        <Text style={styles.upgradeBody}>Unlock the full Vinster experience.</Text>
        {PREMIUM_FEATURES.map((f) => (
          <Text key={f} style={styles.featureItem}>· {f}</Text>
        ))}
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={() => Alert.alert('Coming Soon', 'Premium subscriptions are coming soon. We\'ll notify you when they launch.')}
        >
          <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

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
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 80, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  backButton: { marginBottom: spacing.xl },
  backText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.textMuted },
  heading: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  emailText: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, marginBottom: spacing.sm },
  changeEmailButton: { marginTop: spacing.xs },
  changeLink: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.burgundy, textDecorationLine: 'underline' },
  emailChangeWrap: { marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  emailChangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md },
  cancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  confirmButton: { backgroundColor: colors.burgundy, borderRadius: 8, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minWidth: 80, alignItems: 'center' },
  confirmButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.background },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planName: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  planBadge: { borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  planBadgeText: { fontSize: 10, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, letterSpacing: 0.5 },
  upgradeCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  upgradeHeading: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, marginBottom: spacing.xs },
  upgradeBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.md, lineHeight: 20 },
  featureItem: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, marginBottom: spacing.xs, lineHeight: 22 },
  upgradeButton: { backgroundColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  upgradeButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.background },
  signOutButton: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  signOutText: { color: colors.error, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold' },
});
