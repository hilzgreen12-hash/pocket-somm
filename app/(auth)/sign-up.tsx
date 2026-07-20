import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '../../src/api/supabase';
import { signInWithGoogle, isGoogleSignInCancelled } from '../../src/services/googleAuth';
import { signInWithApple, isAppleAuthAvailable, isAppleSignInCancelled } from '../../src/services/appleAuth';
import { SOCIAL_SIGN_IN_ENABLED } from '../../src/constants/features';
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

  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => { isAppleAuthAvailable().then(setAppleAvailable); }, []);

  async function handleApple() {
    setError('');
    setLoading(true);
    try {
      await signInWithApple();
      router.replace('/');
    } catch (e) {
      if (!isAppleSignInCancelled(e)) setError(e instanceof Error ? e.message : 'Could not sign in with Apple.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      router.replace('/');
    } catch (e) {
      if (!isGoogleSignInCancelled(e)) setError(e instanceof Error ? e.message : 'Could not sign in with Google.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp() {
    setError('');
    // Trim passwords — keyboards/autofill can inject a leading or trailing
    // space. Sign-in and reset trim identically so a stray space can never
    // lock a user out or cause a false "passwords do not match".
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (!displayName.trim()) { setError('Please enter your name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (trimmedPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (trimmedPassword !== trimmedConfirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    let data;
    let signUpError;
    try {
      // Guarded for the same reason as sign-in: the Create Account button is
      // disabled={loading}, so a throw would strand the user on a dead button.
      ({ data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: trimmedPassword,
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
      }));
    } catch {
      setLoading(false);
      setError('Could not reach the server. Please check your connection and try again.');
      return;
    }
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    // Supabase obfuscates a signup for an ALREADY-registered email (an
    // anti-account-enumeration safeguard): it returns no error but a user with
    // an empty `identities` array and no confirmation email. Detect that and
    // tell the user to log in, rather than leaving them waiting for a
    // confirmation email that will never arrive.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setError('An account with this email already exists. Please log in instead — or tap "Forgot password?" if you\'ve forgotten it.');
      return;
    }
    setConfirmed(true);
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
    <KeyboardAwareScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" bottomOffset={24}>
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
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="password-new"
        textContentType="newPassword"
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm password"
        placeholderTextColor={colors.textMuted}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="password-new"
        textContentType="newPassword"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
      </TouchableOpacity>

      {SOCIAL_SIGN_IN_ENABLED && (
        <>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogle} disabled={loading} activeOpacity={0.85}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && appleAvailable ? (
            <TouchableOpacity style={styles.appleButton} onPress={handleApple} activeOpacity={0.85}>
              <Text style={styles.googleText}>Continue with Apple</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  orText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, marginTop: spacing.xs },
  googleG: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.gold },
  googleText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  appleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, marginTop: spacing.sm },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
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
