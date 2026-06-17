import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { importCellarDocument, prepareImageBase64, type ImportedCellarWine } from '../../src/api/label';
import { addCellarWine } from '../../src/api/cellar';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'analyzing' | 'review' | 'adding' | 'done';

export default function ImportCellarScreen() {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const defaultCurrency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();

  const [stage, setStage] = useState<Stage>('capture');
  const [wines, setWines] = useState<ImportedCellarWine[]>([]);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [addedCount, setAddedCount] = useState(0);

  async function pick(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1, allowsMultipleSelection: source === 'library' };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      await analyze(result.assets.map((a) => a.uri));
    } catch (err) {
      showAlert({ title: 'Could not open picker', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function analyze(uris: string[]) {
    setStage('analyzing');
    try {
      // Read each screenshot in parallel; merge the extracted wines (cellar
      // lists often span several screens).
      const results = await Promise.all(uris.map(async (uri) => {
        const base64 = await prepareImageBase64(uri);
        const { wines: w } = await importCellarDocument(base64);
        return w ?? [];
      }));
      const all = results.flat();
      setWines(all);
      setKeep(all.map(() => true));
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the screenshot', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  const keptCount = keep.filter(Boolean).length;

  async function confirmImport() {
    if (!session?.user.id || keptCount === 0) return;
    setStage('adding');
    const userId = session.user.id;
    const chosen = wines.filter((_, i) => keep[i]);
    try {
      // Bulk add identity + quantity + price. No per-wine AI enrichment here —
      // a cellar import can be dozens of wines; the user can generate intel on
      // any wine later from its card.
      for (const w of chosen) {
        const qty = Number.isFinite(w.quantity) && w.quantity > 0 ? Math.round(w.quantity) : 1;
        await addCellarWine({
          user_id: userId,
          wine_name: w.wine_name || w.producer,
          producer: w.producer,
          region: w.region ?? null,
          vintage: w.vintage ?? null,
          quantity: qty,
          storage_location: null,
          date_received: new Date().toISOString().split('T')[0],
          critic_score: null,
          critic_score_note: null,
          drinking_window_from: null,
          drinking_window_to: null,
          drinking_window_status: 'unknown',
          tasting_notes: null,
          grape_variety: null,
          label_image_path: null,
          user_notes: null,
          is_wishlist: false,
          estimated_value: null,
          estimated_value_currency: null,
          estimated_value_at: null,
          purchase_price: w.purchase_price ?? null,
          purchase_price_currency: w.purchase_price != null ? (w.currency ?? defaultCurrency) : null,
          bottle_size_ml: 750,
        } as any);
      }
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      setAddedCount(chosen.reduce((s, w) => s + (Number.isFinite(w.quantity) && w.quantity > 0 ? Math.round(w.quantity) : 1), 0));
      setStage('done');
    } catch (err) {
      showAlert({ title: 'Could not import', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('review');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import a Cellar</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lead}>
            Vinster can upload cellar lists from invoices, storage certificates, or wine apps, as
            long as they are clear screenshots.
          </Text>
          <Text style={styles.hint}>Pick several screenshots at once if your list spans more than one screen.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => pick('library')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Upload screenshot(s)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => pick('camera')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Take a photo of a list</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your cellar list…</Text>
        </View>
      ) : stage === 'adding' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Adding your wines…</Text>
        </View>
      ) : stage === 'done' ? (
        <View style={styles.centerBlock}>
          <Text style={styles.doneTitle}>Cellar imported</Text>
          <Text style={styles.hint}>
            {addedCount} bottle{addedCount === 1 ? '' : 's'} added. Open any wine to place it in a rack or generate its details.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Cellar List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/cellar')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {wines.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any wines from that image. Try a clearer screenshot showing the wine names.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Found {wines.length} wine{wines.length === 1 ? '' : 's'} — tap to include or skip</Text>
              {wines.map((w, i) => {
                const on = keep[i];
                const qty = Number.isFinite(w.quantity) && w.quantity > 0 ? Math.round(w.quantity) : 1;
                const label = [w.vintage, w.producer, w.wine_name].filter(Boolean).join(' ');
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.row, !on && styles.rowOff]}
                    onPress={() => setKeep((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label || 'Unnamed wine'}{qty > 1 ? `  ×${qty}` : ''}</Text>
                      {w.region ? <Text style={styles.rowMeta} numberOfLines={1}>{w.region}</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, keptCount === 0 && styles.primaryBtnDisabled]}
            onPress={confirmImport}
            disabled={keptCount === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {keptCount === 0 ? 'Nothing selected' : `Add ${keptCount} wine${keptCount === 1 ? '' : 's'} to cellar`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Choose another image</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  content: { padding: spacing.xl, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lead: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: spacing.sm },
  hint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowOff: { opacity: 0.4 },
  checkbox: { fontSize: 22, color: colors.textMuted },
  checkboxOn: { color: colors.gold },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
