import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpButton } from '../../src/components/HelpButton';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Your wine and restaurant reviews live here, alongside your Label Library of every bottle you've scanned.

And "Vinster's Review of You" — witty Wine and Foodie personality sketches Vinster draws from how you drink, cook and rate. Share them with friends or the community, and watch them evolve.`;

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();

  const [sketchInfoOpen, setSketchInfoOpen] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Everything on this tab is account-only (your reviews, library, sketches),
  // so a guest gets the create-account prompt with no "continue" escape.
  function requireAccount(action: () => void) {
    if (!session) { pendingActionRef.current = null; setSignInPromptVisible(true); return; }
    action();
  }
  function dismissSignInPrompt() { setSignInPromptVisible(false); pendingActionRef.current = null; }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <Text style={styles.appName}>Review</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Your wine and restaurant reviews and your Label Library live here — plus Vinster's Review of You, your personality sketches.
        </Text>
        <HelpButton label="More About Review" title="How Review works" body={SCAN_HELP} />
      </View>

      <View style={styles.divider} />

      {/* Your reviews + Label Library. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/restaurants/reviews'))}>
          <Text style={styles.buttonText}>Your Restaurant Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/wines/chosen'))}>
          <Text style={styles.buttonText}>Your Wine Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/scan/archive'))}>
          <Text style={styles.buttonText}>Your Label Library</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Vinster's Review of You — the personality sketches. */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Vinster's Review of You</Text>
        <View style={styles.sketchHeaderRow}>
          <Text style={styles.sketchHeader}>Your Personality Sketch</Text>
          <TouchableOpacity onPress={() => setSketchInfoOpen(true)} activeOpacity={0.7}>
            <Text style={styles.whatsThis}>what's this?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/profile/personality?category=wine'))}>
          <Text style={styles.buttonText}>Your Wine Personality</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/profile/personality?category=recipe'))}>
          <Text style={styles.buttonText}>Your Foodie Personality</Text>
        </TouchableOpacity>
      </View>

      {/* "What's this?" — explains the personality sketches. */}
      <Modal visible={sketchInfoOpen} transparent animationType="fade" onRequestClose={() => setSketchInfoOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSketchInfoOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Your Personality Sketch</Text>
            <Text style={styles.modalBody}>
              As you scan, cellar, rate and cook, Vinster sketches a witty character profile of you — a separate Wine personality and Foodie personality drawn from your tastes. They evolve as you use the app, and you can share them with friends or post them to the community.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setSketchInfoOpen(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        allowContinue={false}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={dismissSignInPrompt}
      />
    </ScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // "Vinster's Review of You" section header + the "Your Personality Sketch"
  // sub-heading with its "what's this?" link.
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 20, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  sketchHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  sketchHeader: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  whatsThis: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
});
