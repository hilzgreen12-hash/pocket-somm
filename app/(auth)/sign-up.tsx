import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/api/supabase';
import { colors, typography, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function SignUp() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  async function handleSignUp() {
    setError('');
    if (!displayName.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
        // Where Supabase sends the user after they tap the confirmation
        // link. createURL resolves to the right scheme per build —
        // vinster://auth/callback in a standalone/dev-client build,
        // exp://…/--/auth/callback in Expo Go. The _layout deep-link
        // handler installs the session from the returned tokens. This
        // URL MUST be in the Supabase Redirect URLs allow-list, or
        // Supabase ignores it and falls back to the Site URL.
        emailRedirectTo: Linking.createURL('/auth/callback'),
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setConfirmed(true);
    }
  }

  if (confirmed) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>We've sent a confirmation link to {email}. Tap it to confirm and we'll bring you straight back into Vinster.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Save your preferences and allow Vinster to learn from your selections. Your personal AI sommelier awaits.</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={colors.textMuted}
        value={displayName}
        onChangeText={setDisplayName}
        autoCapitalize="words"
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.headingRegular,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: 'transparent',
  },
  button: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: colors.gold,
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
  skipLink: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.lg,
  },
  // Underlined skip link — button-style navigation.
  skipLinkText: {
    color: '#FFFFFF',
    fontFamily: fonts.headingItalic,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  // "Already have an account?" navigation link — button-like.
  link: {
    fontFamily: fonts.headingRegular,
    textAlign: 'center',
    color: colors.text,
    marginTop: spacing.lg,
    fontSize: 14,
  },
  // Form-level error message — body/helper text.
  errorText: {
    fontFamily: fonts.bodyItalic,
    color: colors.gold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
