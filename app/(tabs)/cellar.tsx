import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel, importCellarDocument } from '../../src/api/label';
import { useCellarImportStore, type ImportedWine } from '../../src/stores/cellarImportStore';
import { useAuth } from '../../src/hooks/useAuth';
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

function requireAuth(session: ReturnType<typeof useAuth>['session'], action: () => void) {
  if (!session) {
    Alert.alert('Sign in required', 'You must be signed in to your account for access.');
    return;
  }
  action();
}

export default function CellarTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const { setWines } = useCellarImportStore();
  const [importing, setImporting] = useState(false);

  async function handleImportDocument() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    setImporting(true);
    try {
      const base64 = await prepareImageBase64(result.assets[0].uri);
      const data = await importCellarDocument(base64);
      if (!data.wines || data.wines.length === 0) {
        Alert.alert('No wines found', 'Vinster could not identify any wines in that document. Try a clearer photo.');
        return;
      }
      setWines(data.wines);
      router.push('/cellar/import-preview');
    } catch (err) {
      Alert.alert('Error', 'Could not read the document. Please try again.');
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
        Alert.alert('Empty file', 'Vinster couldn\'t find any rows in that spreadsheet.');
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
        Alert.alert(
          'Columns not recognised',
          'Vinster looks for columns named wine, producer, region, vintage, quantity, price, currency. Add a header row that uses one of those names and try again.'
        );
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
        Alert.alert('No wines found', 'No usable rows in that spreadsheet.');
        return;
      }
      setWines(wines);
      router.push('/cellar/import-preview');
    } catch (err) {
      Alert.alert('Couldn\'t read file', 'Vinster expects a comma-separated CSV file with a header row. Try saving from Numbers/Excel as CSV.');
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      {importing && (
        <View style={styles.importingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.importingText}>Reading your cellar document…</Text>
        </View>
      )}

      <Text style={styles.title}>Cellar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>View, manage and share your cellar using the below functions.</Text>
      </View>

      <View style={styles.divider} />

      {/* Section 1 — Label scanning */}
      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          Scan a label or upload a label photo to receive wine insights and/or to add a wine to your cellar or wish list.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, () => router.push('/label/camera'))}>
            <Text style={styles.buttonText}>Scan Wine Label</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, handleUpload)}>
            <Text style={styles.buttonText}>Upload Screenshot / Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Section 2 — Cellar viewing */}
      <View style={styles.section}>
        <Text style={styles.sectionDesc}>
          View and edit your cellar in list format or in your virtual wine rack. Create and edit wine racks to reflect your home storage so you never lose a bottle.
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, () => router.push('/cellar/list'))}>
            <Text style={styles.buttonText}>View Cellar List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, () => router.push('/cellar/racks'))}>
            <Text style={styles.buttonText}>View Live Cellar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, () => router.push('/cellar/wishlist'))}>
            <Text style={styles.buttonText}>View Wish List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, () => router.push('/cellar/archive'))}>
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
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, handleImportDocument)}>
            <Text style={styles.buttonText}>Photo / Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => requireAuth(session, handleImportSpreadsheet)}>
            <Text style={styles.buttonText}>Upload Spreadsheet</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TabFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  importingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10, gap: spacing.lg },
  importingText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
});
