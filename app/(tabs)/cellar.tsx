import { View, Text, TouchableOpacity, Pressable, Modal, ActivityIndicator, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useCallback, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useCellar } from '../../src/hooks/useCellar';
import { useCellarContext } from '../../src/hooks/useCellarContext';
import { loadCellarContext, sharedCellarLabel } from '../../src/api/cellarContext';
import { useStorageLocationNav, type StorageNavEntry } from '../../src/hooks/useStorageLocationNav';
import { fetchPlacementsForWines } from '../../src/api/placements';
import { getBinCells } from '../../src/api/bins';
import { shareCellarListPdf } from '../../src/utils/exportCellarList';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpTitle } from '../../src/components/HelpTitle';
import { CellarSwitcher } from '../../src/components/CellarSwitcher';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HomeStorageSection } from '../../src/components/HomeStorageSection';
import { CellarCommandModal } from '../../src/components/CellarCommandModal';
import { ArchivedReviewPrompt } from '../../src/components/ArchivedReviewPrompt';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

const CELLAR_HELP = `Your cellar, brought to life. Scan a label — or add a bottle by hand — and Vinster fills in the details for you: critic scores, tasting notes, drinking windows, and what each bottle is worth today.

Build virtual racks and fridges that mirror your real storage, so you always know where a bottle is and what's ready to open.

Dictate your wine reviews while enjoying easy access to your full cellar stats. Truly a masterpiece in Cellar management.`;

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  const { wines } = useCellar();
  const cellarCtx = useCellarContext();
  // A view-only member of a shared cellar can browse it but not add to it.
  const canEdit = cellarCtx.role !== 'view';
  const { locations: storageLocs } = useStorageLocationNav();
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [exportPickerOpen, setExportPickerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Re-read shared-cellar memberships whenever the tab comes into view, so a
  // new invite, a removal or a role change shows without restarting the app.
  const userId = session?.user.id ?? null;
  useFocusEffect(useCallback(() => { if (userId) void loadCellarContext(userId); }, [userId]));

  // "Import Cellar" → choose the source: a photo or screenshot (OCR), or a
  // spreadsheet file (CSV/TSV). Reviews (Vivino etc.) are imported from Your
  // Wine Reviews, not here — they're not cellar stock.
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

  // "Export Cellar" (bottom of the tab) — the whole list, or one location.
  // Exports in place (no navigation): builds the branded PDF and opens the share
  // sheet right here.
  function openExportMenu() {
    showAlert({
      title: 'Export Cellar',
      body: 'Choose what to export.',
      buttons: [
        { text: 'Export Full Cellar List', onPress: () => runExport(wines, cellarCtx.ownerId ? sharedCellarLabel(cellarCtx.ownerName) : 'My Cellar') },
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

  // Export just the bottles placed in one storage location, each wine with the
  // count stored there (not its whole quantity). Membership comes from
  // cellar_placements: alt cellars match storage_location_id, racks match
  // rack_id, and bins match any of the bin's cell ids.
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
      const here = new Map<string, number>();
      for (const p of placements) {
        const inLoc = (loc.kind === 'location' && p.kind === 'location' && p.storage_location_id === loc.id)
          || (loc.kind === 'rack' && p.kind === 'rack' && p.rack_id === loc.id)
          || (loc.kind === 'bin' && p.kind === 'bin' && !!p.bin_cell_id && !!cellIds?.has(p.bin_cell_id));
        if (inLoc) here.set(p.cellar_wine_id, (here.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
      }
      const filtered = wines.filter((w) => (here.get(w.id) ?? 0) > 0).map((w) => ({ ...w, quantity: here.get(w.id)! }));
      if (!filtered.length) { showAlert({ title: 'Nothing to export', body: `No wines are stored in ${loc.name} yet.` }); return; }
      await shareCellarListPdf(filtered, { title: loc.name, session, filterSummary: loc.name });
    } catch (err) {
      showAlert({ title: 'Could not export', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setExporting(false);
    }
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
          Quick Command (gold outline) side by side. */}
      <View style={styles.actionRow}>
        {canEdit ? (
          <TouchableOpacity onPress={() => router.push('/cellar/list?add=1' as any)} activeOpacity={0.85} style={[styles.buttonFull, { flex: 1 }]}>
            <Text style={styles.buttonText}>Add Wines</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity onPress={() => setVoiceOpen(true)} activeOpacity={0.85} style={[styles.buttonFull, { flex: 1, borderColor: colors.gold }]}>
          <Text style={[styles.buttonText, { color: colors.gold }]}>Quick Command</Text>
        </TouchableOpacity>
      </View>

      {/* Rule beneath Add Wines. */}
      <View style={styles.divider} />

      {/* Your Wines At Home — the home-storage carousel. */}
      <HomeStorageSection />

      {/* Rule between the home-storage carousel and the buttons below it. */}
      <View style={styles.divider} />

      {/* Your Cellar List, Statistics and Archive — below the home-storage carousel. */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/cellar/list')}>
          <Text style={styles.buttonText}>Your Cellar List</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => router.push('/cellar/stats')}>
          <Text style={styles.buttonText}>Your Cellar Statistics</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => router.push('/cellar/list?archived=1' as any)}>
          <Text style={styles.buttonText}>Your Cellar Archive</Text>
        </TouchableOpacity>
      </View>

      {/* Import / Export the whole cellar, and Share Cellar (invite someone in). */}
      <View style={styles.divider} />
      <View style={styles.section}>
        {canEdit ? (
          <TouchableOpacity style={styles.buttonVivino} onPress={openImportChooser} activeOpacity={0.85}>
            <Text style={styles.buttonVivinoText}>Import Cellar</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={[styles.buttonVivino, canEdit && { marginTop: spacing.xs }]} onPress={openExportMenu} activeOpacity={0.85}>
          <Text style={styles.buttonVivinoText}>Export Cellar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.buttonVivino, { marginTop: spacing.xs }]} onPress={() => router.push('/profile/share-cellar' as any)} activeOpacity={0.85}>
          <Text style={styles.buttonVivinoText}>Share Cellar</Text>
        </TouchableOpacity>
      </View>

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

  // The Add Wines / Quick Command row — same side padding as the sections
  // below, so it lines up with "Your Cellar List".
  actionRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.sm },

  // Blurb under the "Cellar" title (Cormorant, like every tab-screen blurb).
  subtitle: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', textAlign: 'center', lineHeight: 26, paddingHorizontal: spacing.xl, marginBottom: 0 },
  // 18pt either side — matches the Home header separator and keeps the tab compact.
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: 18 },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },

  buttonFull: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonVivino: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonVivinoText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Button labels — Cormorant.
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
});
