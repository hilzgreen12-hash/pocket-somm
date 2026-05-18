import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpButton } from '../../src/components/HelpButton';

const COMMUNITY_HELP = `Community is where Vinster users will share wine reviews, restaurant finds and personality sketches with friends.

It's not live yet. We're building it carefully so it stays warm and high-signal rather than noisy.

In the meantime, anything you post — your reviews, your wine and foodie personalities — is being saved, and will surface here when Community opens up.`;
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

  // Dismissing the prompt (tap X / tap outside) carries on with the
  // pending action — same as scan/cellar/profile. Otherwise the user
  // taps a gated button, dismisses the prompt and nothing happens.
  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  // Sign In / Create Account leave the tab — pending action is discarded.
  function abortSignInPrompt() {
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

      <View style={styles.titleRow}>
        <Text style={styles.title}>Community</Text>
        <HelpButton title="How Community works" body={COMMUNITY_HELP} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine and restaurant reviews while connecting with friends, old and new.</Text>
        <Text style={styles.comingSoonNotice}>Coming Soon</Text>
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
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Your Connections</Text>
        </TouchableOpacity>
      </View>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { abortSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { abortSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />
    </ScrollView>
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 17, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  comingSoonNotice: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.sm },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
});
