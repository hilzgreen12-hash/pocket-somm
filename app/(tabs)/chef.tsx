import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, Modal, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpButton } from '../../src/components/HelpButton';
import * as ImagePicker from 'expo-image-picker';
import { useLabelStore } from '../../src/stores/labelStore';
import { useFoodPairingStore } from '../../src/stores/foodPairingStore';
import { useChefLabelHistory, useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
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
  const { setImage, setWineDetails, setError, pairings, wineDetailsConfirmed } = useLabelStore();
  const { generalResult, cellarResult, setDish, setMode, setCellarResult, setGeneralResult } = useFoodPairingStore();
  const { sessions: labelSessions } = useChefLabelHistory();
  const { sessions: pairingSessions } = useChefPairingHistory();
  const [message, setMessage] = useState<AppMessage | null>(null);
  // Holds the picked image while prepareImageBase64 + scanLabel run.
  // Surfaces a fullscreen overlay so the user sees their photo + a
  // spinner instead of staring at the chef tab wondering if the upload
  // landed. Cleared when navigation kicks in (or on error).
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

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

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 1,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    // Show the picked photo + a "Reading the label…" overlay immediately
    // so the user has feedback during the (sometimes multi-second)
    // base64-prepare + Claude scan call. Same pattern the camera flow
    // uses for live captures.
    setUploadingImage(uri);
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/chef/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/chef/confirm');
    } finally {
      // Clear after navigation so the overlay doesn't linger on the chef
      // tab if the user swipes back to it before the confirm screen mounts.
      setUploadingImage(null);
    }
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <View style={styles.titleRow}>
        <Text style={styles.appName}>Chef</Text>
        <HelpButton title="How Chef works" body={CHEF_HELP} />
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Tell Vinster what you're cooking and it'll offer you a wine. Select your bottle first for an original, tailored recipe sure to satisfy. Keep, organise, and share your recipes to grow your cookbook.
        </Text>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.sm, borderColor: '#FFFFFF' }]} onPress={() => router.push('/chef/archive')}>
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>View Your Cookbook</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Find Me A Wine</Text>
        <Text style={styles.sectionDesc}>
          Chosen your recipe? We'll help guide your wine pairing with a bottle from your cellar, or something new.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.buttonHalf, { flex: 1 }]} onPress={() => router.push('/chef/find-pairing')}>
            <Text style={styles.buttonText}>Find a Wine Pairing</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleViewLastPairing}>
          <Text style={styles.lastResultLink}>View last result</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Find Me A Recipe</Text>
        <Text style={styles.sectionDesc}>
          Chosen your bottle? Input it below to receive original, Vinster generated recipes inspired by top global chefs.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/chef/camera')}>
            <Text style={styles.buttonText}>Scan Wine Label</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={handleUpload}>
            <Text style={styles.buttonText}>Upload Screenshot</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleViewLastLabelSearch}>
          <Text style={styles.lastResultLink}>View last result</Text>
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

    {/* Upload-in-progress overlay — shows the picked image full-screen
        with a spinner while prepareImageBase64 + scanLabel are running.
        Without this the user sat staring at the chef tab for a few
        seconds wondering whether their upload had landed. */}
    <Modal visible={!!uploadingImage} transparent animationType="fade">
      <View style={styles.uploadOverlay}>
        {uploadingImage ? (
          <Image source={{ uri: uploadingImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : null}
        <View style={styles.uploadScrim} />
        <View style={styles.uploadStatus}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadStatusText}>Reading the label…</Text>
        </View>
      </View>
    </Modal>

    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Upload overlay — full-screen Modal showing the picked image with a
  // dark scrim on top, gold spinner, and "Reading the label…" status text.
  uploadOverlay: { flex: 1, backgroundColor: '#000' },
  uploadScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  uploadStatus: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  // Overlay caption while a label is being read — body-tier readability.
  uploadStatusText: { fontFamily: fonts.bodySemibold, fontSize: 18, color: '#FFFFFF', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, textAlign: 'center' },
  // Big "Chef" tab title — header, Cormorant.
  appName: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  // Profile note in the body of the tab — body content, Inter.
  profileNote: { fontSize: 17, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, lineHeight: 24, marginBottom: spacing.xs },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  // Section subheadings ("Recipe → Wine", "Wine → Recipe") — Cormorant.
  subheading: { fontFamily: fonts.headingBold, fontSize: 24, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.xs },
  // Top blurb under the Chef heading — italic blurb directly under the
  // tab title, kept Cormorant per user spec ("blurbs below the headers
  // on the tab screens"). Italics retained.
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs },
  // Body copy under each subheading — switched to Inter for readability.
  sectionDesc: { fontSize: 17, fontFamily: fonts.bodyRegular, color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  // "View last result" link — body / link, Inter.
  lastResultLink: { fontSize: 13, fontFamily: fonts.bodyRegular, color: '#FFFFFF', textDecorationLine: 'underline', textAlign: 'center', marginBottom: spacing.sm },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Button label — Cormorant.
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
