import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { router } from 'expo-router';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpButton } from '../../src/components/HelpButton';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { useLabelStore } from '../../src/stores/labelStore';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { useChefLabelHistory, useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

interface AppMessage { title: string; body: string; }

const CHEF_HELP = `Chef works two ways.

Start with a wine and Vinster picks a chef-style recipe to pair with it. Or start with a dish — and Vinster will suggest wines, either from your own cellar or out in the wild.

The recipes are generated fresh by Anthropic's Claude AI each time, not pulled from a database. They bend to your dietary needs, the food you usually cook, and the bottle you're matching to. Save your favourites to your Cookbook for later, and share them within the Vinster community or friends outside.

The same AI reads your wine preferences, your recipe requirements, and your history — so each recipe and wine pairing is personal.`;

export default function ChefTab() {
  const { height } = useWindowDimensions();
  // Match the Cellar / Community tabs so the header sits at a consistent
  // height across the bottom-nav surfaces.
  const paddingTop = Math.max(55, height * 0.095);
  const { pairings, wineDetailsConfirmed } = useLabelStore();
  const { generalResult, cellarResult, setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();
  const { sessions: labelSessions } = useChefLabelHistory();
  const { sessions: pairingSessions } = useChefPairingHistory();
  const [message, setMessage] = useState<AppMessage | null>(null);

  function handleViewLastPairing() {
    if (generalResult || cellarResult) {
      router.push('/chef/pairing-results');
      return;
    }
    const last = pairingSessions[0];
    if (!last) {
      setMessage({ title: 'No previous search', body: 'Once you save a wine pairing to your archive, you can come back here to revisit it.' });
      return;
    }
    setDish(last.dish);
    setMode(last.mode);
    if (last.mode === 'cellar') setCellarResult(last.cellar_result ?? []);
    else setGeneralResult(last.general_result ?? [], last.general_summary ?? undefined);
    router.push({
      pathname: '/chef/pairing-results',
      params: {
        fromHistory: 'true',
        savedAt: last.saved_at,
        city: last.city ?? '',
      },
    });
  }

  function handleViewLastLabelSearch() {
    if (wineDetailsConfirmed && pairings.length) {
      router.push('/chef/results');
      return;
    }
    const last = labelSessions[0];
    if (!last) {
      setMessage({ title: 'No previous search', body: 'Once you save a label scan to your archive, you can come back here to revisit it.' });
      return;
    }
    // History view — the results screen reads the saved session by id.
    router.push({
      pathname: '/chef/results',
      params: {
        fromHistory: 'true',
        sessionId: last.id,
        savedAt: last.saved_at,
        city: last.city ?? '',
      },
    });
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <Text style={styles.appName}>Chef</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Tell Vinster what you're cooking and it'll offer you a wine. What you're drinking and it'll generate original, chef-inspired recipes tailored to your tastes. Keep, organise, and share your recipes in Your Cookbook.
        </Text>
        <HelpButton label="More About Chef" title="How Chef works" body={CHEF_HELP} />
      </View>

      <View style={styles.divider} />

      {/* Wine → Recipe */}
      <View style={styles.section}>
        <Text style={styles.subheading}>Chosen your bottle?</Text>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/chef/review-requirements')}>
          <Text style={styles.buttonText}>Find Me a Recipe</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewLastLabelSearch}>
          <Text style={styles.lastResultLink}>View last result</Text>
        </TouchableOpacity>
      </View>

      {/* Recipe → Wine (flow unchanged) */}
      <View style={[styles.section, { marginTop: spacing.lg }]}>
        <Text style={styles.subheading}>Have a recipe & need a wine?</Text>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/chef/find-pairing')}>
          <Text style={styles.buttonText}>Find a Wine Pairing</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleViewLastPairing}>
          <Text style={styles.lastResultLink}>View last result</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/chef/archive')}>
          <Text style={styles.buttonText}>View Your Cookbook</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!message} transparent animationType="fade" onRequestClose={() => setMessage(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMessage(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>{message?.title}</Text>
            <Text style={styles.modalBody}>{message?.body}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setMessage(null)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Big "Chef" tab title — header, Cormorant.
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Section question prompts ("Chosen your bottle?", "Have a recipe & need
  // a wine?") — Cormorant.
  subheading: { fontFamily: fonts.headingBold, fontSize: 24, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.xs },
  // Top blurb under the Chef heading — italic blurb directly under the
  // tab title, kept Cormorant per user spec ("blurbs below the headers
  // on the tab screens"). Italics retained.
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  // "View last result" link — body / link, Inter.
  lastResultLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: '#FFFFFF', textDecorationLine: 'underline', textAlign: 'center', marginBottom: spacing.sm },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Button label — Cormorant. Matched to the other tab pages (14pt).
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Pop-up title — Cormorant. Pop-up body — Inter.
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: fonts.bodyRegular, fontSize: 17, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  // Pop-up button — Cormorant.
  modalButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
});
