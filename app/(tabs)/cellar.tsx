import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, useWindowDimensions, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel, importCellarDocument } from '../../src/api/label';
import { useCellarImportStore, type ImportedWine } from '../../src/stores/cellarImportStore';
import { useAuth } from '../../src/hooks/useAuth';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { colors, spacing } from '../../src/constants/theme';

// Minimal CSV parser — handles standard comma-separated values with optional
// double-quoted fields containing commas or escaped quotes. Doesn't try to be
// RFC-4180 perfect; good enough for the kinds of cellar exports users
// generate from Numbers / Excel / Google Sheets.
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { inQuotes = false; }
      } else {
        cell += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); row = []; cell = ''; }
        if (c === '\r' && text[i + 1] === '\n') i++;
      } else {
        cell += c;
      }
    }
  }
  if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
  return rows;
}

function findCol(headers: string[], aliases: string[]): number {
  const norm = headers.map((h) => h.trim().toLowerCase().replace(/[\s_-]+/g, ''));
  for (const a of aliases) {
    const idx = norm.indexOf(a.toLowerCase().replace(/[\s_-]+/g, ''));
    if (idx >= 0) return idx;
  }
  return -1;
}

// Replaced by an in-component sign-in prompt modal — see CellarTab below.

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const { setWines } = useCellarImportStore();
  const [importing, setImporting] = useState(false);
  const [addWineOpen, setAddWineOpen] = useState(false);
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

  async function handleImportDocument() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    setImporting(true);
    try {
      const base64 = await prepareImageBase64(result.assets[0].uri);
      const data = await importCellarDocument(base64);
      if (!data.wines || data.wines.length === 0) {
        showAlert({ title: 'No wines found', body: 'Vinster could not identify any wines in that document. Try a clearer photo.' });
        return;
      }
      setWines(data.wines);
      router.push('/cellar/import-preview');
    } catch (err) {
      showAlert({ title: 'Error', body: 'Could not read the document. Please try again.' });
    } finally {
      setImporting(false);
    }
  }

  async function handleImportSpreadsheet() {
    const pick = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/csv', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (pick.canceled || !pick.assets?.[0]) return;
    const file = pick.assets[0];
    setImporting(true);
    try {
      const text = await FileSystem.readAsStringAsync(file.uri);
      const rows = parseCSV(text);
      if (rows.length < 2) {
        showAlert({ title: 'Empty file', body: 'Vinster couldn\'t find any rows in that spreadsheet.' });
        return;
      }
      const headers = rows[0];
      const nameIdx     = findCol(headers, ['wine_name', 'wine name', 'wine', 'name']);
      const producerIdx = findCol(headers, ['producer', 'estate', 'chateau', 'château', 'winery']);
      const regionIdx   = findCol(headers, ['region', 'appellation', 'origin']);
      const vintageIdx  = findCol(headers, ['vintage', 'year']);
      const qtyIdx      = findCol(headers, ['quantity', 'qty', 'bottles', 'count']);
      const priceIdx    = findCol(headers, ['price', 'purchase_price', 'cost', 'paid']);
      const currencyIdx = findCol(headers, ['currency', 'ccy']);

      if (nameIdx < 0 && producerIdx < 0) {
        showAlert({
          title: 'Columns not recognised',
          body: 'Vinster looks for columns named wine, producer, region, vintage, quantity, price, currency. Add a header row that uses one of those names and try again.',
        });
        return;
      }

      const wines: ImportedWine[] = rows.slice(1)
        .filter((r) => r.some((c) => c.trim().length > 0))
        .map((r) => {
          const get = (i: number) => (i >= 0 && i < r.length ? r[i].trim() : '');
          const name = get(nameIdx) || get(producerIdx);
          const producer = get(producerIdx) || get(nameIdx);
          const priceRaw = get(priceIdx).replace(/[^0-9.]/g, '');
          const qtyRaw = get(qtyIdx).replace(/[^0-9]/g, '');
          return {
            wine_name: name,
            producer,
            region: get(regionIdx),
            vintage: get(vintageIdx) || null,
            quantity: qtyRaw ? Math.max(1, parseInt(qtyRaw, 10) || 1) : 1,
            purchase_price: priceRaw ? Number(priceRaw) : null,
            currency: get(currencyIdx).toUpperCase() || null,
          };
        })
        .filter((w) => w.wine_name);

      if (wines.length === 0) {
        showAlert({ title: 'No wines found', body: 'No usable rows in that spreadsheet.' });
        return;
      }
      setWines(wines);
      router.push('/cellar/import-preview');
    } catch (err) {
      showAlert({ title: 'Couldn\'t read file', body: 'Vinster expects a comma-separated CSV file with a header row. Try saving from Numbers/Excel as CSV.' });
    } finally {
      setImporting(false);
    }
  }

  async function handleUpload() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
    }
    router.push('/label/confirm');
  }

  return (
    <View style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      {importing && (
        <View style={styles.importingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.importingText}>Reading your cellar document…</Text>
        </View>
      )}

      <Text style={styles.title}>Cellar</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.buttonFull} onPress={() => requireAuth(() => setAddWineOpen(true))}>
          <Text style={styles.buttonText}>Add Wine / Generate Intel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonFull, { marginTop: spacing.xs }]} onPress={() => requireAuth(() => router.push('/cellar/full-list'))}>
          <Text style={styles.buttonText}>Full Cellar List</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionDesc, { marginTop: spacing.lg }]}>
          View your cellar stats and your virtual storage racks, edit your cellar.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/list'))}>
            <Text style={styles.buttonText}>Quick Cellar Stats</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/racks'))}>
            <Text style={styles.buttonText}>View Storage</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/wishlist'))}>
            <Text style={styles.buttonText}>View Wish List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(() => router.push('/cellar/archive'))}>
            <Text style={styles.buttonText}>View Archived Wines</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section 3 — Import */}
      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Import wines into your cellar from a photo (printed inventory, receipt, invoice) or a spreadsheet (CSV with columns: wine, producer, region, vintage, quantity, price).
        </Text>
        <Text style={styles.comingSoonNote}>(coming soon)</Text>
        <View style={styles.buttonRow}>
          <View style={[styles.buttonHalf, styles.buttonDisabled]}>
            <Text style={styles.buttonTextDisabled}>Photo / Receipt</Text>
          </View>
          <View style={[styles.buttonHalf, styles.buttonDisabled]}>
            <Text style={styles.buttonTextDisabled}>Upload Spreadsheet</Text>
          </View>
        </View>
      </View>

      <Modal visible={addWineOpen} transparent animationType="fade" onRequestClose={() => setAddWineOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddWineOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a wine</Text>
            <Text style={styles.modalBody}>Scan the label or upload a photo and Vinster will pull in the details.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => { setAddWineOpen(false); router.push('/label/camera'); }}
            >
              <Text style={styles.modalButtonText}>Scan Label</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { marginTop: spacing.sm }]}
              onPress={() => { setAddWineOpen(false); handleUpload(); }}
            >
              <Text style={styles.modalButtonText}>Upload Screenshot / Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddWineOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />
    </ScrollView>
    <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  importingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: spacing.lg },
  importingText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.lg },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  buttonDisabled: { borderColor: colors.borderLight, opacity: 0.45 },
  buttonTextDisabled: { color: colors.textMuted, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  comingSoonNote: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xs },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
});
