import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { signInWithGoogle, isGoogleSignInCancelled } from '../../src/services/googleAuth';
import { signInWithApple, isAppleAuthAvailable, isAppleSignInCancelled } from '../../src/services/appleAuth';
import { colors, typography, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  async function handleSignIn() {
    setError('');
    const trimmedEmail = email.trim();
    // Trim the password too — keyboards/autofill sometimes inject a leading or
    // trailing space. Sign-up and reset trim the same way, so a stray space can
    // never cause a mismatch between what's set and what's entered here.
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password: trimmedPassword });
    setLoading(false);
    if (signInError) {
      if (signInError.message.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email address before signing in. Check your inbox.');
      } else {
        setError(signInError.message);
      }
    } else {
      // Route via index.tsx so users with no profile yet land on the
      // welcome/onboarding flow rather than dropping straight into scan.
      router.replace('/');
    }
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={styles.container} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Vinster</Text>
      <Text style={styles.subtitle}>Your personal AI sommelier</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.35)"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="password"
          textContentType="password"
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
          <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
      </TouchableOpacity>

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
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={8}
          style={styles.appleButton}
          onPress={handleApple}
        />
      ) : null}

      <TouchableOpacity style={styles.guestButton} onPress={() => router.replace('/(tabs)/scan')}>
        <Text style={styles.guestText}>Continue without account</Text>
      </TouchableOpacity>

      <Link href="/(auth)/forgot-password" style={styles.link}>
        Forgot your password?
      </Link>

      <Link href="/(auth)/sign-up" style={styles.link}>
        Don't have an account? Sign up
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
    fontSize: 32,
    fontFamily: fonts.headingBold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontFamily: fonts.headingRegular,
    color: colors.textMuted,
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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginBottom: spacing.md,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  // Show/Hide toggle inside the password row — acts as a button label.
  eyeText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 13,
    color: colors.textMuted,
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
  orRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  orText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 8,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  googleG: { fontFamily: fonts.headingBold, fontSize: 17, color: '#FFFFFF' },
  googleText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
  appleButton: { height: 50, marginTop: spacing.sm },
  guestButton: {
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  // "Continue without account" — button label.
  guestText: {
    fontFamily: fonts.headingRegular,
    color: colors.textMuted,
    fontSize: 14,
  },
  // Forgot password / sign-up navigation links — button-like.
  link: {
    fontFamily: fonts.headingRegular,
    textAlign: 'center',
    color: '#FFFFFF',
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
