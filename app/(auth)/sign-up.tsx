import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { supabase } from '../../src/api/supabase';
import { colors, typography, spacing } from '../../src/constants/theme';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert('Check your email', 'We sent you a confirmation link.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/sign-in') },
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Save your preferences and scan history</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
      </TouchableOpacity>

      <Link href="/(auth)/sign-in" style={styles.link}>
        Already have an account? Sign in
      </Link>
    </View>
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
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.burgundy,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
  link: {
    fontFamily: 'CormorantGaramond_400Regular',
    textAlign: 'center',
    color: colors.burgundy,
    marginTop: spacing.lg,
    fontSize: 14,
  },
});
