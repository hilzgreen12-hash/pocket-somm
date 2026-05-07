import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';

// Lands here after a Supabase magic-link / verification deep link is opened.
// _layout.tsx already exchanges the token in its global Linking handler, so by
// the time we render the token has usually been redeemed; this screen acts as
// a friendly landing pad and a fallback verifyOtp call in case the global
// handler missed it.
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ token_hash?: string; type?: string; error?: string; error_description?: string }>();
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
      if (params.token_hash && params.type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: params.token_hash, type: params.type as any });
        if (cancelled) return;
        if (error) {
          // The global handler in _layout.tsx may have already redeemed it —
          // a "Token has expired or is invalid" error here is therefore not
          // necessarily fatal. Check whether we have a session before failing.
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            setStatus('ok');
            setTimeout(() => router.replace('/'), 600);
            return;
          }
          setErrorMessage(error.message);
          setStatus('error');
          return;
        }
      }
      // Either we just verified, or the token was already redeemed by _layout.
      if (!cancelled) {
        setStatus('ok');
        setTimeout(() => router.replace('/'), 600);
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
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 26, color: colors.text, textAlign: 'center' },
  body: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  buttonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
});
