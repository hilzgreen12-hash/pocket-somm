import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';

export default function CommunityTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function gated(route: string) {
    const proceed = () => router.push(route as any);
    if (session) {
      proceed();
      return;
    }
    pendingActionRef.current = proceed;
    setSignInPromptVisible(true);
  }

  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
    pendingActionRef.current = null;
  }

  function continueWithoutAccount() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <Text style={styles.title}>Community</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine and restaurant reviews while connecting with friends, old and new.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.button} onPress={() => gated('/community/profile')}>
          <Text style={styles.buttonText}>Your Community Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => gated('/community/wine')}>
          <Text style={styles.buttonText}>Wine Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => gated('/community/restaurant')}>
          <Text style={styles.buttonText}>Restaurant Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonDisabled}>
          <Text style={styles.buttonTextDisabled}>Your Connections <Text style={styles.comingSoonInline}>(Coming Soon)</Text></Text>
        </TouchableOpacity>
      </View>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />
    </ScrollView>
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  buttonDisabled: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  comingSoonInline: { fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textSubtle },
});
