import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { showAlert } from '../../src/components/AppAlert';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { LineupsCarousel } from '../../src/components/LineupsCarousel';
import { useQuery } from '@tanstack/react-query';
import { listLineupArchives } from '../../src/api/lineups';
import { useAuth } from '../../src/hooks/useAuth';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Your wine and restaurant reviews live here. Restaurants you record, and wines you pick from a restaurant's list, appear here automatically for you to review.

And Your Lineups — archive a night of wines with a photo, a note and the bottle list, to revisit and share your most epic wine exploits.`;

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  // Count for the "X Lineups · View All Lineups →" stats line. Same query key as
  // LineupsCarousel, so react-query dedupes it (no extra fetch).
  const { data: lineups = [] } = useQuery({
    queryKey: ['lineup-archives', session?.user.id],
    queryFn: () => listLineupArchives(session!.user.id!),
    enabled: !!session?.user.id,
  });

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

      {/* Your Lineups — Archive-a-Night carousel, with a top-left "+ Add" and a
          sort/swipe hint beneath it. */}
      <View style={styles.section}>
        <View style={styles.lineupHeaderRow}>
          <Text style={styles.sectionHeader}>Your Lineups</Text>
          <TouchableOpacity style={styles.addLineupRight} onPress={() => requireAccount(() => router.push('/cellar/archive-night'))} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} activeOpacity={0.7}>
            <Text style={styles.addTopRightText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sketchBlurb}>
          A record of your most epic wine exploits.
        </Text>
        <TouchableOpacity onPress={() => requireAccount(() => router.push('/cellar/lineups'))} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Text style={styles.lineupStats}>{lineups.length} {lineups.length === 1 ? 'Lineup' : 'Lineups'} · View All Lineups →</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.statsSep} />
      <Text style={styles.lineupHint}>Listed by recency · Swipe to view →</Text>
      <LineupsCarousel requireAccount={requireAccount} />

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
  appName: { fontSize: 42, fontFamily: fonts.headingBold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  // "+ Add" pinned to the top-right of the title row so the title stays centred.
  addTopRight: { position: 'absolute', right: spacing.xl, top: 0, bottom: 0, justifyContent: 'center' },
  addTopRightText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // "Your Lineups" header row: heading centred, "+ Add" pinned top-left.
  lineupHeaderRow: { justifyContent: 'center', alignItems: 'center', marginBottom: spacing.xs },
  addLineupRight: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center' },
  // Sort/swipe caption — left-indented, above the carousel (beneath the separator).
  lineupHint: { fontFamily: fonts.headingItalic, fontSize: 13, color: colors.textMuted, textAlign: 'left', paddingLeft: spacing.xl, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // "Vinster's Review of You" section header + the "Your Personality Sketch"
  // sub-heading with its "what's this?" link.
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Elegant Cormorant, matching the Review header blurb above. Extra bottom
  // margin gives the alter-ego carousel room to breathe beneath it.
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 19, color: colors.textMuted, textAlign: 'center', lineHeight: 26, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
  // Gold "X Lineups · View All Lineups →" line (matches Cookbook stats).
  lineupStats: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  // Separator bar between the stats line and the lineups carousel.
  statsSep: { height: 1, backgroundColor: colors.divider, marginHorizontal: 0, marginTop: spacing.md, marginBottom: spacing.sm },
});
