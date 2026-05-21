import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Lands here after a Supabase magic-link / verification deep link is opened.
// _layout.tsx owns ALL token redemption via its global Linking handler — this
// screen used to ALSO call verifyOtp, which raced the global handler: a token
// can only be redeemed once, so the loser saw "Token has expired or is
// invalid" for a fraction of a second before the session-check fallback
// rescued it. The screen is now passive: poll for a session and route home,
// otherwise show the error state.
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ error?: string; error_description?: string }>();
  const [status, setStatus] = useState<'verifying' | 'ok' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (params.error_description) {
        if (!cancelled) {
          setErrorMessage(String(params.error_description));
          setStatus('error');
        }
        return;
      }
      // Poll for a session — _layout's handler may already be mid-flight.
      // Three quick checks at 200ms intervals is enough in practice.
      for (let i = 0; i < 3; i++) {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session) {
          setStatus('ok');
          setTimeout(() => router.replace('/'), 600);
          return;
        }
        await new Promise((r) => setTimeout(r, 200));
      }
      if (!cancelled) {
        setErrorMessage('Verification link could not be redeemed. Please request a fresh one.');
        setStatus('error');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.body}>Verifying…</Text>
        </>
      )}
      {status === 'ok' && (
        <>
          <Text style={styles.heading}>You're all set</Text>
          <Text style={styles.body}>Taking you to Vinster…</Text>
        </>
      )}
      {status === 'error' && (
        <>
          <Text style={styles.heading}>Couldn't verify</Text>
          <Text style={styles.body}>{errorMessage ?? 'Please request a fresh link from the sign-in screen.'}</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.replace('/(auth)/sign-in')}>
            <Text style={styles.buttonText}>Back to sign in</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
  body: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
