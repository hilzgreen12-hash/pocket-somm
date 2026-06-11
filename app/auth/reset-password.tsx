import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Reached after a Supabase password-recovery deep link is opened. The
// global handler in _layout.tsx redeems the recovery token first, which
// leaves a short-lived recovery session in place — that session is what
// authorises updateUser({ password }) here. We confirm the session
// exists on mount; if the link was stale or already used there won't be
// one, so we steer the user back to request a fresh link.
export default function ResetPasswordScreen() {
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // _layout's handler may still be installing the session — poll
      // briefly rather than failing on the first empty read.
      for (let i = 0; i < 5; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          setHasSession(true);
          setChecking(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!cancelled) {
        setHasSession(false);
        setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function handleUpdate() {
    setError('');
    // Trim passwords — keyboards/autofill can inject a leading or trailing
    // space (a stray leading space here was a real "passwords do not match"
    // false negative). Sign-in/sign-up trim identically so the set password
    // always matches what's entered at sign-in.
    const trimmedPassword = password.trim();
    const trimmedConfirm = confirmPassword.trim();
    if (trimmedPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (trimmedPassword !== trimmedConfirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password: trimmedPassword });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
    }
  }

  if (checking) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>Verifying your reset link…</Text>
      </View>
    );
  }

  if (!hasSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Link expired</Text>
        <Text style={styles.subtitle}>This reset link is no longer valid. Please request a fresh one.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/forgot-password')}>
          <Text style={styles.buttonText}>Request new link</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (done) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Password updated</Text>
        <Text style={styles.subtitle}>You're all set. Let's get you back into Vinster.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/')}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView contentContainerStyle={[styles.container, { flex: undefined, flexGrow: 1 }]} bottomOffset={24} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Set a new password</Text>
      <Text style={styles.subtitle}>Choose a new password for your account.</Text>

      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder="New password"
          placeholderTextColor="rgba(255,255,255,0.35)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          autoComplete="password-new"
          textContentType="newPassword"
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
          <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Confirm new password"
        placeholderTextColor="rgba(255,255,255,0.35)"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="password-new"
        textContentType="newPassword"
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating…' : 'Update Password'}</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', backgroundColor: colors.background },
  title: { fontSize: 28, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs, textAlign: 'center' },
  subtitle: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xxl, lineHeight: 24 },
  input: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'transparent' },
  passwordRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8, backgroundColor: 'transparent', marginBottom: spacing.md },
  passwordInput: { flex: 1, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text },
  eyeButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  eyeText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.textMuted },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  errorText: { fontFamily: fonts.bodyItalic, color: colors.gold, fontSize: 16, textAlign: 'center', marginBottom: spacing.sm },
});
