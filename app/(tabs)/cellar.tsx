import { View, Text, TouchableOpacity, Pressable, Modal, ActivityIndicator, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useCellar } from '../../src/hooks/useCellar';
import { useStorageLocationNav, type StorageNavEntry } from '../../src/hooks/useStorageLocationNav';
import { fetchPlacementsForWines } from '../../src/api/placements';
import { getBinCells } from '../../src/api/bins';
import { shareCellarListPdf } from '../../src/utils/exportCellarList';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpTitle } from '../../src/components/HelpTitle';
import { CellarSwitcher } from '../../src/components/CellarSwitcher';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HomeStorageSection } from '../../src/components/HomeStorageSection';
import { CellarCommandModal } from '../../src/components/CellarCommandModal';
import { ArchivedReviewPrompt } from '../../src/components/ArchivedReviewPrompt';

const CELLAR_HELP = `Your cellar, brought to life. Scan a label — or add a bottle by hand — and Vinster fills in the details for you: critic scores, tasting notes, drinking windows, and what each bottle is worth today.

Build virtual racks and fridges that mirror your real storage, so you always know where a bottle is and what's ready to open.

Dictate your wine reviews while enjoying easy access to your full cellar stats. Truly a masterpiece in Cellar management.`;
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  const { wines } = useCellar();
  const { locations: storageLocs } = useStorageLocationNav();
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
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

  // "Import Cellar" (bottom of the tab) — bring in an existing CELLAR list (photo /
  // screenshot / file). Reviews (Vivino etc.) are imported from Your Wine Reviews,
  // not here — they're not cellar stock.
  function openImportMenu() {
    openImportChooser();
  }

  // "Export Cellar" (bottom of the tab) — the whole list, or one location.
  // Exports in place (no navigation): builds the branded PDF and opens the share
  // sheet right here.
  function openExportMenu() {
    showAlert({
      title: 'Export Cellar',
      body: 'Choose what to export.',
      buttons: [
        { text: 'Export Full Cellar List', onPress: () => runExport(wines, 'My Cellar') },
        { text: 'Export by Location', onPress: () => setExportPickerOpen(true) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function runExport(list: typeof wines, title: string) {
    if (exporting) return;
    if (!list.length) { showAlert({ title: 'Nothing to export', body: 'There are no wines here to export yet.' }); return; }
    setExporting(true);
    try {
      await shareCellarListPdf(list, { title, session });
    } catch (err) {
      showAlert({ title: 'Could not export', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setExporting(false);
    }
  }

  // Export just the wines placed in one storage location. Membership comes from
  // cellar_placements: alt cellars match storage_location_id, racks match rack_id,
  // and bins match any of the bin's cell ids.
  async function exportByLocation(loc: StorageNavEntry) {
    setExportPickerOpen(false);
    if (exporting) return;
    setExporting(true);
    try {
      const placements = await fetchPlacementsForWines(wines.map((w) => w.id));
      let cellIds: Set<string> | null = null;
      if (loc.kind === 'bin') {
        const cells = await getBinCells(loc.id);
        cellIds = new Set(cells.map((c) => c.id));
      }
      const inLoc = new Set<string>();
      for (const p of placements) {
        if (loc.kind === 'location' && p.kind === 'location' && p.storage_location_id === loc.id) inLoc.add(p.cellar_wine_id);
        else if (loc.kind === 'rack' && p.kind === 'rack' && p.rack_id === loc.id) inLoc.add(p.cellar_wine_id);
        else if (loc.kind === 'bin' && p.kind === 'bin' && p.bin_cell_id && cellIds?.has(p.bin_cell_id)) inLoc.add(p.cellar_wine_id);
      }
      const filtered = wines.filter((w) => inLoc.has(w.id));
      if (!filtered.length) { showAlert({ title: 'Nothing to export', body: `No wines are stored in ${loc.name} yet.` }); return; }
      await shareCellarListPdf(filtered, { title: loc.name, session, filterSummary: loc.name });
    } catch (err) {
      showAlert({ title: 'Could not export', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setExporting(false);
    }
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
        <HelpTitle label="Cellar" title="How Cellar works" body={CELLAR_HELP} textStyle={styles.title} />
      </View>
      <Text style={styles.subtitle}>Gain quick insights into bottles and manage your collection. The only thing Vinster can't do with a bottle of wine is drink it.</Text>

      {/* Shared cellars — switch between My Cellar and any cellar shared with you. */}
      <CellarSwitcher />

      {/* Add Wines (white outline, opens the scan/upload/manual chooser) and
          Quick Command (gold outline, the cellar voice command) side by side. */}
      <View style={[styles.actionRow, styles.buttonRow, { gap: spacing.sm }]}>
        <TouchableOpacity onPress={() => requireAuth(() => router.push('/cellar/list?add=1' as any))} activeOpacity={0.85} style={[styles.buttonFull, { flex: 1 }]}>
          <Text style={styles.buttonText}>Add Wines</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => requireAuth(() => setVoiceOpen(true))} activeOpacity={0.85} style={[styles.buttonFull, { flex: 1, borderColor: colors.gold }]}>
          <Text style={[styles.buttonText, { color: colors.gold }]}>Quick Command</Text>
        </TouchableOpacity>
      </View>

      {/* Rule beneath Add Wines. */}
      <View style={styles.divider} />

      {/* Your Wines At Home — the home-storage carousel, embedded here (replaces
          the old standalone Home Wine Storage page). */}
      <HomeStorageSection requireAuth={requireAuth} />

      {/* Rule between the home-storage carousel and the buttons below it. */}
      <View style={styles.divider} />

      {/* Your Cellar List, Statistics and Archive — below the home-storage carousel. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
          <Text style={styles.buttonText}>Your Cellar List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/stats'))}>
          <Text style={styles.buttonText}>Your Cellar Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/list?archived=1' as any))}>
          <Text style={styles.buttonText}>Your Cellar Archive</Text>
        </TouchableOpacity>
      </View>

      {/* Import / Export the whole cellar — the same inset rule as the others,
          then the gold buttons. */}
      <View style={styles.divider} />
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonVivino} onPress={() => requireAuth(openImportMenu)} activeOpacity={0.85}>
          <Text style={styles.buttonVivinoText}>Import Cellar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonVivino, { marginTop: spacing.xs }]} onPress={() => requireAuth(openExportMenu)} activeOpacity={0.85}>
          <Text style={styles.buttonVivinoText}>Export Cellar</Text>
        </TouchableOpacity>
        {/* Share Cellar — invite someone into this cellar (moved here from You). */}
        <TouchableOpacity style={[styles.buttonVivino, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/profile/share-cellar' as any))} activeOpacity={0.85}>
          <Text style={styles.buttonVivinoText}>Share Cellar</Text>
        </TouchableOpacity>
      </View>

      {/* "Archive a Lineup" and "Your Lineups" now live on the Scan tab. */}

      {/* Export by Location — pick one of the user's storage locations. */}
      <Modal visible={exportPickerOpen} transparent animationType="fade" onRequestClose={() => setExportPickerOpen(false)}>
        <View style={styles.pickerOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setExportPickerOpen(false)} />
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Export a Location</Text>
            {storageLocs.length === 0 ? (
              <Text style={styles.pickerEmpty}>You don't have any storage locations yet.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator>
                {storageLocs.map((loc) => (
                  <TouchableOpacity key={`${loc.kind}-${loc.id}`} style={styles.pickerRow} onPress={() => exportByLocation(loc)} activeOpacity={0.7}>
                    <Text style={styles.pickerRowText} numberOfLines={1}>{loc.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setExportPickerOpen(false)} style={styles.pickerCancel} activeOpacity={0.7}>
              <Text style={styles.pickerCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preparing-export spinner while the PDF builds / placements resolve. */}
      <Modal visible={exporting} transparent animationType="fade">
        <View style={styles.exportingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.exportingText}>Preparing your export…</Text>
        </View>
      </Modal>

      <CellarCommandModal visible={voiceOpen} onClose={() => setVoiceOpen(false)} />
      {/* Nudge to review recently archived bottles (like Your Wine Reviews'). */}
      <ArchivedReviewPrompt />

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
  title: { fontSize: 42, fontFamily: fonts.headingBold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.xs },
  // Export-by-location picker.
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  pickerSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  pickerTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  pickerEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  pickerRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.divider },
  pickerRowText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  pickerCancel: { alignSelf: 'center', paddingVertical: spacing.md, marginTop: spacing.sm },
  pickerCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  exportingOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  exportingText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: '#FFFFFF' },
  // Side cells balance the centred title: an empty spacer on the left, the
  // "+ Import" link on the right, both the same width so "Cellar" stays centred.
  titleSide: { width: 72, justifyContent: 'center', alignItems: 'flex-end' },
  // Voice Command — gold bubble (matches the app-wide treatment).
  voiceBubble: { alignSelf: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 8, paddingHorizontal: spacing.lg, marginTop: spacing.sm, marginBottom: spacing.xs },
  // Wrapper for the full-width gold "Add Wines" button (same padding as the
  // sections below, so it lines up exactly with "Your Cellar List").
  actionRow: { paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  actionBtn: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  actionBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  voiceBubbleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  importLink: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right' },
  // Italic blurb under the "Cellar" title — kept Cormorant per spec
  // ("blurbs below the headers on the tab screens").
  subtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26, paddingHorizontal: spacing.xl, marginBottom: 0 },
  // 18pt either side — matches the Home header separator and keeps the tab compact.
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: 18 },
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
