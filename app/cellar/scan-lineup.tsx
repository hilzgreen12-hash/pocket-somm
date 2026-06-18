import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useCellar } from '../../src/hooks/useCellar';
import { useLineupStore } from '../../src/stores/lineupStore';
import { useLabelStore } from '../../src/stores/labelStore';
import { detectLineup, prepareImageBase64, type DetectedBottle } from '../../src/api/label';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'analyzing' | 'review';

const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();

export default function ScanLineupScreen() {
  const { wines: cellarWines } = useCellar();
  const { wines: lineupWines, imageUri, originRackId, setLineup } = useLineupStore();
  const { setWineDetails } = useLabelStore();

  // If the store already holds a lineup (we've returned mid-flow after
  // onboarding a wine), open straight onto the review list.
  const [stage, setStage] = useState<Stage>(lineupWines.length > 0 ? 'review' : 'capture');

  async function pickFrom(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      await analyze(result.assets[0].uri);
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function analyze(uri: string) {
    setStage('analyzing');
    try {
      const base64 = await prepareImageBase64(uri);
      const { bottles } = await detectLineup(base64);
      // Cap raw detections at 10, then batch identical bottles (same producer +
      // name + vintage) into one row carrying a quantity, so a lineup with two
      // of the same wine reads as a single "×2" entry instead of two rows.
      const capped = (bottles ?? []).slice(0, 10);
      const batched: DetectedBottle[] = [];
      const indexByKey = new Map<string, number>();
      for (const b of capped) {
        const key = `${norm(b.producer)}|${norm(b.wineName)}|${(b.vintage ?? '').trim()}`;
        const at = indexByKey.get(key);
        if (at != null) {
          batched[at].quantity = (batched[at].quantity ?? 1) + 1;
          // If any read of this bottle was confident, treat the group as confident.
          batched[at].confident = batched[at].confident || b.confident;
        } else {
          indexByKey.set(key, batched.length);
          batched.push({ ...b, quantity: 1 });
        }
      }
      setLineup(batched, uri);
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  // Is this detected bottle now in the live cellar? (Matched on producer + name
  // so an edited vintage during onboarding still reads as added.)
  function isAdded(b: DetectedBottle): boolean {
    const p = norm(b.producer);
    const n = norm(b.wineName) || p;
    return cellarWines.some((w) => norm(w.producer) === p && (norm(w.wine_name) === n || norm(w.wine_name) === norm(b.wineName)));
  }

  const addedCount = lineupWines.filter(isAdded).length;
  const allDone = lineupWines.length > 0 && addedCount === lineupWines.length;

  // Send one bottle through the same flow as Scan a Label (Confirm Wine
  // Details → Wine Intel → Add to Cellar). context=lineup routes the flow back
  // here afterwards. router.replace keeps the back-stack to a single screen.
  function onboard(b: DetectedBottle) {
    setWineDetails({
      producer: b.producer,
      region: b.region ?? '',
      wineName: b.wineName || null,
      vintage: b.vintage || '',
      style: null,
      bottleSizeMl: null,
      // Pre-seed the cellar quantity from the batched count so a "×2" lineup
      // entry adds 2 bottles (the user can still adjust on the results screen).
      quantity: b.quantity ?? 1,
    } as any);
    router.replace('/label/confirm?context=lineup');
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
            Adding several bottles? Photograph the lineup and Vinster will identify each one so you can
            add them to your cellar — confirming the details and placing each as you go.
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
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}

          {allDone ? (
            <View style={styles.successBlock}>
              <Text style={styles.successTitle}>All Lineup Wines Have Been Saved Successfully</Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list')} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>View Cellar List</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace(originRackId ? `/cellar/rack/${originRackId}` as any : '/(tabs)/cellar')} activeOpacity={0.85}>
                <Text style={styles.doneBtnText}>{originRackId ? 'Back to Rack' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          ) : lineupWines.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't read any bottles. Try a clearer photo with the front labels showing.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Add to Your Cellar</Text>
              {lineupWines.map((b, i) => {
                const added = isAdded(b);
                const qty = b.quantity ?? 1;
                const label = [b.vintage, b.producer, b.wineName].filter(Boolean).join(' ');
                return (
                  <View key={i} style={styles.row}>
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label || 'Unreadable bottle'}</Text>
                      <View style={styles.rowMetaRow}>
                        {b.region ? <Text style={styles.rowMeta} numberOfLines={1}>{b.region}</Text> : null}
                        {qty >= 2 ? <Text style={styles.qtyTag}>×{qty} bottles</Text> : null}
                      </View>
                      {!b.confident && !added ? <Text style={styles.unconfident}>Low-confidence read — check the details</Text> : null}
                    </View>
                    {added ? (
                      <Text style={styles.addedTag}>Added ✓</Text>
                    ) : (
                      <TouchableOpacity onPress={() => onboard(b)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                        <Text style={styles.editAddLink}>edit / add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
              <Text style={styles.progressHint}>{addedCount} of {lineupWines.length} added</Text>
            </>
          )}

          {!allDone && lineupWines.length > 0 ? (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStage('capture')} activeOpacity={0.85}>
              <Text style={styles.secondaryBtnText}>Retake</Text>
            </TouchableOpacity>
          ) : null}
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
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMetaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm, marginTop: 2 },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  // Batched-bottle count shown after the region, e.g. "×2 bottles".
  qtyTag: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold },
  unconfident: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.gold, marginTop: 2 },
  editAddLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  addedTag: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  progressHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
  successBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', lineHeight: 28, marginBottom: spacing.sm },
});
