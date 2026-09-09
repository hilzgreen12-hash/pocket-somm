import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Linking } from 'react-native';
import { router } from 'expo-router';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpTitle } from '../../src/components/HelpTitle';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { JournalCarousel } from '../../src/components/JournalCarousel';

const COMMUNITY_HELP = `Share is where Vinster users will share wine reviews, restaurant finds and personality sketches with friends and the wider community.

It's not live yet. We're building it carefully so it stays warm and high-signal rather than noisy.

In the meantime, anything you share — your reviews, your wine and foodie personalities — is being saved, and will surface here when it opens up.`;
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

export default function CommunityTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
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

      <VinsterHeader />

      <View style={styles.titleRow}>
        <HelpTitle label="Share" title="How Share works" body={COMMUNITY_HELP} textStyle={styles.title} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine and restaurant reviews while connecting with friends, old and new.</Text>
      </View>

      <View style={styles.divider} />

      {/* The Journal — Vinster's own blog; public to read. Header + blurb, then a
          3-box carousel of entries (mirrors "Vinster's Review of You"). */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>The Journal</Text>
        <Text style={styles.journalBlurb}>
          Thoughts and musings on wine, food, and the places and people who share our passion. Written by you. Submit entries to{' '}
          <Text style={styles.journalEmail} onPress={() => Linking.openURL('mailto:tellme@vinsterapp.com')}>tellme@vinsterapp.com</Text>
        </Text>
      </View>
      <JournalCarousel />

      <View style={styles.divider} />

      {/* Other Features Arriving Soon — the community-sharing features, shown
          faded as unbuilt (Wine / Restaurant community feeds, Connections). */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Other Features Arriving Soon</Text>
        <TouchableOpacity style={[styles.button, styles.buttonSoon]} disabled activeOpacity={1}>
          <Text style={styles.buttonText}>Wine Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSoon]} disabled activeOpacity={1}>
          <Text style={styles.buttonText}>Restaurant Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonSoon]} disabled activeOpacity={1}>
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
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Big "Community" tab title — header.
  title: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Italic blurb below the tab title — kept Cormorant per spec.
  sectionDesc: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs },
  // Section headers ("The Journal", "Other Features Arriving Soon") — match the
  // 22pt white headers on the other tabs (Your Wines At Home, Review of You).
  sectionHeader: { fontSize: 22, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  journalBlurb: { fontSize: 15, fontFamily: fonts.headingItalic, color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 21 },
  journalEmail: { color: colors.gold, textDecorationLine: 'underline' },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  // Button label — Cormorant.
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  // "Arriving soon" bubbles are faded to read as unbuilt.
  buttonSoon: { opacity: 0.5 },
});
