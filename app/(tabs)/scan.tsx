import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { AlterEgoCarousel } from '../../src/components/AlterEgoCarousel';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Your wine and restaurant reviews live here. Restaurants you record, and wines you pick from a restaurant's list, appear here automatically for you to review.

And "Vinster's Review of You" — your Vinster alter-ego, a witty character sketch Vinster draws from how you drink, cook and rate. Share it with friends or the community, and watch it evolve.`;

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();

  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Everything on this tab is account-only (your reviews, library, sketches),
  // so a guest gets the create-account prompt with no "continue" escape.
  function requireAccount(action: () => void) {
    if (!session) { pendingActionRef.current = null; setSignInPromptVisible(true); return; }
    action();
  }
  function dismissSignInPrompt() { setSignInPromptVisible(false); pendingActionRef.current = null; }

  // Top-right "+ Add" — choose which kind of review, then jump to that flow.
  function openAddReviewChooser() {
    requireAccount(() => showAlert({
      title: 'Add a Review',
      body: 'What would you like to review?',
      buttons: [
        { text: 'Add a wine review', onPress: () => router.push('/wines/chosen?addManual=1') },
        { text: 'Add a restaurant review', onPress: () => router.push('/restaurants/reviews?add=1') },
        { text: 'Cancel', style: 'cancel' },
      ],
    }));
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <HelpTitle label="Review" title="How Review works" body={SCAN_HELP} textStyle={styles.appName} />
        <TouchableOpacity style={styles.addTopRight} onPress={openAddReviewChooser} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.addTopRightText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Your Wine and Restaurant reviews live here. Restaurants you save and bottles picked from their lists appear in these tabs automatically.
        </Text>
      </View>

      <View style={styles.divider} />

      {/* Your reviews. (Label Scan History now lives on the Scan tab.) */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/restaurants/reviews'))}>
          <Text style={styles.buttonText}>Your Restaurant Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAccount(() => router.push('/wines/chosen'))}>
          <Text style={styles.buttonText}>Your Wine Reviews</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Vinster's Review of You — a carousel of alter-ego sketches. */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Vinster's Review of You</Text>
        <Text style={styles.sketchBlurb}>
          As you scan, cellar, rate and cook, Vinster sketches your alter-ego — a witty character profile drawn from your tastes that evolves as you use the app. Share it with friends or the community.
        </Text>
      </View>
      <AlterEgoCarousel requireAccount={requireAccount} />

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
  // "+ Add" pinned to the top-right of the title row so the title stays centred.
  addTopRight: { position: 'absolute', right: spacing.xl, top: 0, bottom: 0, justifyContent: 'center' },
  addTopRightText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // "Vinster's Review of You" section header + the "Your Personality Sketch"
  // sub-heading with its "what's this?" link.
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Elegant Cormorant, matching the Review header blurb above. Extra bottom
  // margin gives the alter-ego carousel room to breathe beneath it.
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
});
