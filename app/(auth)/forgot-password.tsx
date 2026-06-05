import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    // redirectTo lands the user on our reset-password screen after the
    // recovery link is verified. The _layout deep-link handler detects
    // type=recovery and routes there (rather than home) so the user can
    // set a new password. This URL MUST be in the Supabase Redirect URLs
    // allow-list, or Supabase falls back to the Site URL.
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/auth/reset-password'),
    });
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Email sent</Text>
        <Text style={styles.subtitle}>Check your inbox for a password reset link. It may take a minute to arrive.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={[styles.container, { flex: undefined, flexGrow: 1 }]} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending…' : 'Send Reset Link'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back to Sign In</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 28, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 24 },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'transparent' },
  errorText: { fontFamily: fonts.bodyItalic, color: colors.gold, fontSize: 16, textAlign: 'center', marginBottom: spacing.sm },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  backButton: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  backText: { fontFamily: fonts.bodyRegular, color: colors.textMuted, fontSize: 14 },
});
