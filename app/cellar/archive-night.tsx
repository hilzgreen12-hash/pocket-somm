import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { launchImageLibrary } from '../../src/utils/imagePicker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useQueryClient } from '@tanstack/react-query';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { ensureConnectionForUpload } from '../../src/utils/connectionGuard';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { detectLineup, prepareImageBase64 } from '../../src/api/label';
import { buildLineupWines } from '../../src/services/archiveNight';
import { saveLineupArchive, type LineupWine } from '../../src/api/lineups';
import { captureCity } from '../../src/utils/captureCity';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'preview' | 'analyzing';

// The most bottles one lineup photo is read for.
const MAX_BOTTLES = 8;

// "Archive a Night" — photograph (or upload) a lineup of bottles, let Vinster
// read them, and save it as a lineup. Nothing is removed from the cellar or
// reviewed here; that all happens afterwards on the lineup itself.
export default function ArchiveNightScreen() {
  const { session } = useAuth();
  const { wines } = useCellar();
  const qc = useQueryClient();
  // ?upload=1 (the "upload instead" entry) uses the photo library, never the camera.
  // ?session (+ venue, city, date) — opened from a restaurant review's "+ Add a
  // lineup": the lineup is saved against that visit, with its place and date.
  // ?photo — a photo shared into Vinster from another app: straight to preview.
  const params = useLocalSearchParams<{ upload?: string; session?: string; venue?: string; city?: string; date?: string; photo?: string }>();
  const sharedPhoto = params.photo ? String(params.photo) : null;
  // A shared photo behaves like an upload: Retake picks from the library.
  const isUpload = params.upload === '1' || !!sharedPhoto;
  const visit = params.session
    ? { sessionId: params.session, venue: params.venue || null, date: params.date || null }
    : undefined;
  const uploadTriggeredRef = useRef(false);

  const [stage, setStage] = useState<Stage>(sharedPhoto ? 'preview' : 'capture');
  const [imageUri, setImageUri] = useState<string | null>(sharedPhoto);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [showInstruction, setShowInstruction] = useState(true);
  // Synchronous guards: state updates land too late to stop a fast double tap.
  const capturingRef = useRef(false);
  const savingRef = useRef(false);

  async function handleCapture() {
    if (!cameraRef.current || capturingRef.current) return;
    capturingRef.current = true;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
      if (!photo?.uri) return;
      setImageUri(photo.uri);
      setStage('preview');
    } catch (err) {
      showAlert({ title: 'Camera error', body: err instanceof Error ? err.message : 'Could not capture the photo. Please try again.' });
    } finally {
      capturingRef.current = false;
    }
  }

  // Upload path: open the library picker once on arrival.
  useEffect(() => {
    if (isUpload && !sharedPhoto && !uploadTriggeredRef.current) {
      uploadTriggeredRef.current = true;
      void pickFromLibrary(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUpload]);

  // Pick an existing photo; it lands in the same preview as a camera shot.
  // Cancelling the first picker leaves the flow (there's nothing behind it);
  // cancelling a Retake keeps the current photo.
  async function pickFromLibrary(leaveOnCancel: boolean) {
    try {
      const result = await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets.length) { if (leaveOnCancel) router.back(); return; }
      setImageUri(result.assets[0].uri);
      setStage('preview');
    } catch (err) {
      showAlert({ title: 'Could not open the photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function retake() {
    if (isUpload) { void pickFromLibrary(false); return; }
    setImageUri(null);
    setStage('capture');
  }

  // Read the bottles, link each to the same wine + vintage in the cellar where
  // there is one, save the lineup and open it. The city lookup is best-effort
  // and runs alongside the label read.
  async function saveLineup(uri: string) {
    if (!session?.user.id || savingRef.current) return;
    savingRef.current = true;
    try {
      if (!(await ensureConnectionForUpload())) return;
      setStage('analyzing');
      const cityPromise = captureCity().catch(() => null);
      const { bottles } = await detectLineup(await prepareImageBase64(uri));
      const lineupWines = buildLineupWines((bottles ?? []).slice(0, MAX_BOTTLES), wines);
      const city = await cityPromise;
      if (lineupWines.length === 0) {
        // Saved without wines, a lineup shows as awaiting attention and offers
        // "Identify wines" — so the user can keep the photo and retry the read.
        setStage('preview');
        showAlert({
          title: 'No bottles read',
          body: 'Vinster couldn’t read any bottles in this photo. Retake it with the front labels facing the camera, or save the photo anyway and identify the wines later.',
          buttons: [
            // iOS won't show the picker while this alert is still fading out.
            { text: 'Retake', onPress: () => { if (Platform.OS === 'ios') setTimeout(retake, 350); else retake(); } },
            { text: 'Save anyway', onPress: () => { void persist(uri, [], city); } },
          ],
        });
        return;
      }
      await persist(uri, lineupWines, city);
    } catch (err) {
      showSaveError(err);
    } finally {
      savingRef.current = false;
    }
  }

  async function persist(uri: string, lineupWines: LineupWine[], city: string | null) {
    if (!session?.user.id) return;
    setStage('analyzing');
    try {
      const row = await saveLineupArchive(session.user.id, uri, { wines: lineupWines, city: params.city || city, visit });
      qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
      // A new lineup opens ready to fill in (title, notes, wines).
      // A lineup shared in from another app goes back to the Review tab (where
      // lineups live) from its page, not to the photo screen or Home.
      router.replace(`/cellar/lineup/${row.id}?new=1${sharedPhoto ? `&backTo=${encodeURIComponent('/(tabs)/scan')}` : ''}` as any);
    } catch (err) {
      showSaveError(err);
    }
  }

  function showSaveError(err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    showAlert({
      title: 'Could not save the lineup',
      body: /minute|too many|rate limit/i.test(msg) ? msg : `Please check the photo is clear with front labels facing forward (up to ${MAX_BOTTLES} bottles), and try again.`,
    });
    setStage('preview');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Capturing Your Lineup</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        isUpload ? (
          // Behind the library picker; also the way back in if it was dismissed.
          <View style={styles.centerBlock}>
            <TouchableOpacity style={styles.chooseBtn} onPress={() => pickFromLibrary(false)} activeOpacity={0.85}>
              <Text style={styles.chooseBtnText}>Choose a Photo</Text>
            </TouchableOpacity>
          </View>
        ) : !permission ? (
          <View style={styles.cameraWrap} />
        ) : !permission.granted ? (
          <PermissionScreen onRequest={requestPermission} hideBack />
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" autofocus="on" />
            {showInstruction ? (
              <View style={styles.instructionCard}>
                <TouchableOpacity style={styles.instructionClose} onPress={() => setShowInstruction(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.instructionCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.instructionText}>Photograph up to {MAX_BOTTLES} bottles with their front labels facing the camera.</Text>
              </View>
            ) : null}
            <View style={styles.cameraControls}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} activeOpacity={0.85}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          </View>
        )
      ) : stage === 'preview' ? (
        <View style={styles.cameraWrap}>
          {/* 'contain' so a landscape lineup shows in full on a portrait screen. */}
          {imageUri ? <Image source={{ uri: imageUri }} style={StyleSheet.absoluteFill} resizeMode="contain" /> : null}
          <View style={styles.previewActions}>
            <TouchableOpacity style={styles.previewNeutral} onPress={() => { if (imageUri) void saveLineup(imageUri); }} activeOpacity={0.85}>
              <Text style={styles.previewNeutralText}>Save Lineup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.previewSecondary} onPress={retake} activeOpacity={0.85}>
              <Text style={styles.previewSecondaryText}>Retake</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },

  cameraWrap: { flex: 1, backgroundColor: '#000' },
  instructionCard: {
    position: 'absolute', top: spacing.lg, left: spacing.xl, right: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, borderWidth: 1, borderColor: colors.gold,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  instructionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 21, paddingHorizontal: spacing.md },
  instructionClose: { position: 'absolute', top: 2, right: 4, padding: 6, zIndex: 2 },
  instructionCloseText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.gold },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureBtn: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFFFFF' },

  // Preview actions: Save is neutral white, Retake gold.
  previewActions: { position: 'absolute', bottom: 40, left: spacing.xl, right: spacing.xl, gap: spacing.sm },
  previewNeutral: { borderWidth: 1, borderColor: '#FFFFFF', backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  previewNeutralText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
  previewSecondary: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  previewSecondaryText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },

  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  hint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  chooseBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, alignItems: 'center' },
  chooseBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
});
