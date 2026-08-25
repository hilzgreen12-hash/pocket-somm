import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpTitle } from '../../src/components/HelpTitle';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HomeStorageSection } from '../../src/components/HomeStorageSection';

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

  // "Import Cellar Document" → choose the source: a photo or screenshot (OCR),
  // or a spreadsheet file (CSV/TSV). Vivino & CellarTracker have their own
  // dedicated buttons beneath this one.
  function openImportChooser() {
    showAlert({
      title: 'Import Cellar Document',
      body: 'Bring in an existing cellar list.',
      buttons: [
        { text: 'Scan Photo', onPress: () => router.push('/cellar/import-cellar?source=camera' as any) },
        { text: 'Upload Screenshot', onPress: () => router.push('/cellar/import-cellar?source=library' as any) },
        { text: 'Upload File', onPress: () => router.push('/cellar/import-cellar?source=file' as any) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Top-right "+ Import" — import is still being built, so the entry point now
  // just tells the user it's on the way (the working Document / Vivino /
  // CellarTracker flows behind openImportChooser are held until it ships).
  function openImportMenu() {
    showAlert({
      title: 'Import a Cellar',
      body: 'Import features are coming next, stay tuned.',
      buttons: [
        { text: 'Close', style: 'cancel' },
      ],
    });
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
        <View style={styles.titleSide} />
        <HelpTitle label="Cellar" title="How Cellar works" body={CELLAR_HELP} textStyle={styles.title} />
        <TouchableOpacity style={styles.titleSide} onPress={() => requireAuth(openImportMenu)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.importLink}>+ Import</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Gain quick insights into bottles and manage your collection. The only thing Vinster can't do with a bottle of wine is drink it.</Text>

      <View style={styles.divider} />

      {/* Your Cellar List (the full list) and Your Cellar Statistics. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
          <Text style={styles.buttonText}>Your Cellar List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/stats'))}>
          <Text style={styles.buttonText}>Your Cellar Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/wine-archive' as any))}>
          <Text style={styles.buttonText}>Your Wine Archive</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Your Wines At Home — the home-storage carousel, embedded here (replaces
          the old standalone Home Wine Storage page). */}
      <HomeStorageSection requireAuth={requireAuth} />

      {/* "Archive a Lineup" and "Your Lineups" now live on the Scan tab. */}

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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  // Side cells balance the centred title: an empty spacer on the left, the
  // "+ Import" link on the right, both the same width so "Cellar" stays centred.
  titleSide: { width: 72, justifyContent: 'center' },
  importLink: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right' },
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
  buttonVivino: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonVivinoText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Button labels — Cormorant.
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  buttonDisabled: { borderColor: colors.borderLight, opacity: 0.45 },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Coming-soon note — body content.
  comingSoonNote: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
});
