import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpButton } from '../../src/components/HelpButton';
import { VinsterHeader } from '../../src/components/VinsterHeader';

const CELLAR_HELP = `Your cellar, brought to life. Scan a label — or add a bottle by hand — and Vinster fills in the details for you: critic scores, tasting notes, drinking windows, and what each bottle is worth today.

Build virtual racks and fridges that mirror your real storage, so you always know where a bottle is and what's ready to open.

Dictate your wine reviews while enjoying easy access to your full cellar stats. Truly a masterpiece in Cellar management.`;
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function requireAuth(action: () => void) {
    if (!session) {
      pendingActionRef.current = action;
      setSignInPromptVisible(true);
      return;
    }
    action();
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

      <VinsterHeader />

      <View style={styles.titleRow}>
        <Text style={styles.title}>Cellar</Text>
      </View>
      <Text style={styles.subtitle}>Gain quick insights into bottles and manage your collection. The only thing Vinster can't do with a bottle of wine is drink it.</Text>
      <HelpButton label="More About Cellar" title="How Cellar works" body={CELLAR_HELP} />

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/stats'))}>
          <Text style={styles.buttonText}>Quick Cellar Stats</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
          <Text style={styles.buttonText}>Full Cellar List: Add & Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/racks'))}>
          <Text style={styles.buttonText}>Home Wine Storage: Add & Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* "Archive a Night" photographs a bottle lineup, matches each to the
          cellar and bulk-archives them. The archived-bottles list ("Cellar
          Archive") is no longer a top-level button — it now lives as an
          "Archive" folder in the Full Cellar List filter carousel. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/archive-night'))}>
          <Text style={styles.buttonText}>Archive a Night</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Import an existing cellar from another app (Vivino, CellarTracker, a
          spreadsheet…) by screenshot/photo. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/import-cellar'))}>
          <Text style={styles.buttonText}>Import Cellar Document</Text>
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
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Big "Cellar" tab title.
  title: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  // Italic blurb under the "Cellar" title — kept Cormorant per spec
  // ("blurbs below the headers on the tab screens").
  subtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26, paddingHorizontal: spacing.xl, marginBottom: 0 },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Body description text under section CTAs — Inter for readability.
  sectionDesc: { fontSize: 17, fontFamily: fonts.bodyRegular, color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Button labels — Cormorant.
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  buttonDisabled: { borderColor: colors.borderLight, opacity: 0.45 },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Coming-soon note — body content.
  comingSoonNote: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
});
