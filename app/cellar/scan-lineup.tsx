import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { detectLineup, prepareImageBase64, getWineIntelligence, type DetectedBottle } from '../../src/api/label';
import { addCellarWine } from '../../src/api/cellar';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'analyzing' | 'review' | 'adding' | 'done';

export default function ScanLineupScreen() {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();

  const [stage, setStage] = useState<Stage>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [bottles, setBottles] = useState<DetectedBottle[]>([]);
  const [keep, setKeep] = useState<boolean[]>([]);
  const [addedCount, setAddedCount] = useState(0);

  async function pickFrom(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await analyze(uri);
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function analyze(uri: string) {
    setStage('analyzing');
    try {
      const base64 = await prepareImageBase64(uri);
      const { bottles: detected } = await detectLineup(base64);
      const list = (detected ?? []).slice(0, 10); // cap at 10 bottles
      setBottles(list);
      setKeep(list.map(() => true));
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  const keptCount = keep.filter(Boolean).length;

  async function confirmAdd() {
    if (!session?.user.id || keptCount === 0) return;
    setStage('adding');
    const userId = session.user.id;
    const chosen = bottles.filter((_, i) => keep[i]);
    try {
      // Onboard each bottle exactly like a single scan: enrich with
      // wine-intelligence, then add a cellar row. Run in parallel.
      await Promise.all(chosen.map(async (b) => {
        let intel: any = null;
        try {
          intel = await getWineIntelligence(
            { producer: b.producer, region: b.region ?? '', wineName: b.wineName || null, vintage: b.vintage || 'NV', style: null } as any,
            currency,
          );
        } catch { /* enrich best-effort — still add the bottle */ }
        await addCellarWine({
          user_id: userId,
          wine_name: b.wineName || b.producer,
          producer: b.producer,
          region: b.region ?? null,
          vintage: b.vintage ?? null,
          quantity: 1,
          storage_location: null,
          date_received: new Date().toISOString().split('T')[0],
          critic_score: intel?.criticScore ?? null,
          critic_score_note: intel?.criticScoreNote ?? null,
          drinking_window_from: intel?.drinkingWindowFrom ?? null,
          drinking_window_to: intel?.drinkingWindowTo ?? null,
          drinking_window_status: intel?.drinkingWindowStatus ?? 'unknown',
          tasting_notes: intel?.tastingNotes ?? null,
          grape_variety: intel?.grapeVariety ?? null,
          label_image_path: null,
          user_notes: null,
          is_wishlist: false,
          estimated_value: intel?.estimatedValue ?? null,
          estimated_value_currency: intel?.estimatedValue != null ? currency : null,
          estimated_value_at: intel?.estimatedValue != null ? new Date().toISOString() : null,
          purchase_price: null,
          purchase_price_currency: null,
          bottle_size_ml: 750,
        } as any);
      }));
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      setAddedCount(chosen.length);
      setStage('done');
    } catch (err) {
      showAlert({ title: 'Could not add', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('review');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Scan a Lineup</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lead}>
            Adding several bottles? Photograph the lineup and Vinster will identify each one and add
            them all to your cellar in one go.
          </Text>
          <Text style={styles.hint}>Stand up to 10 bottles up with their front labels facing the camera.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => pickFrom('camera')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Take a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickFrom('library')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Choose from library</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      ) : stage === 'adding' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Adding your wines and pulling in their details…</Text>
        </View>
      ) : stage === 'done' ? (
        <View style={styles.centerBlock}>
          <Text style={styles.doneTitle}>Added to your cellar</Text>
          <Text style={styles.hint}>
            {addedCount} wine{addedCount === 1 ? '' : 's'} added. Open any wine to place it in a rack or fine-tune the details.
          </Text>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Cellar List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}
          {bottles.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any bottles. Try a clearer photo with the front labels showing.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Found {bottles.length} bottle{bottles.length === 1 ? '' : 's'} — tap to include or skip</Text>
              {bottles.map((b, i) => {
                const on = keep[i];
                const label = [b.vintage, b.producer, b.wineName].filter(Boolean).join(' ');
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.row, !on && styles.rowOff]}
                    onPress={() => setKeep((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.checkbox, on && styles.checkboxOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label || 'Unreadable bottle'}</Text>
                      {b.region ? <Text style={styles.rowMeta} numberOfLines={1}>{b.region}</Text> : null}
                      {!b.confident ? <Text style={styles.unconfident}>Low-confidence read — check this one</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, keptCount === 0 && styles.primaryBtnDisabled]}
            onPress={confirmAdd}
            disabled={keptCount === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {keptCount === 0 ? 'Nothing selected' : `Add ${keptCount} to cellar`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStage('capture'); setImageUri(null); }} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Retake</Text>
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
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  previewSmall: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#000', marginBottom: spacing.md },
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
  unconfident: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.gold, marginTop: 2 },
});
