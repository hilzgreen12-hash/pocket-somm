import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
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
    <View style={styles.container}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 28, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 24 },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: 'transparent' },
  errorText: { fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.error, fontSize: 14, textAlign: 'center', marginBottom: spacing.sm },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  backButton: { padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  backText: { fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, fontSize: 14 },
});
