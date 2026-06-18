import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { CameraOverlay } from '../../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../../src/components/scan/PermissionScreen';
import { prepareImageBase64 } from '../../../src/api/label';
import { detectRack } from '../../../src/api/racks';
import { useRackStore } from '../../../src/stores/rackStore';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

export default function RackCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setDetected, setImage, pendingStorageType } = useRackStore();
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  // Intro shown only when the rack camera is reached straight from
  // "+ Create New Rack" in the Add Wine flow (intro=1), where it isn't
  // obvious what the camera is for. The Add Rack flow already explains
  // itself via the photograph/manual chooser, so it passes no flag.
  const { intro } = useLocalSearchParams<{ intro?: string }>();
  const [introVisible, setIntroVisible] = useState(intro === '1');

  // Drop the still-photo preview when the screen regains focus (e.g. user
  // navigated back from /cellar/rack/detect) so the live camera returns.
  useFocusEffect(useCallback(() => { setPreviewUri(null); }, []));

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <PermissionScreen onRequest={requestPermission} />;

  async function handleCapture() {
    if (!cameraRef.current || capturing || previewUri) return;
    setCapturing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.8 });
      if (!photo?.uri) return;

      // Show the captured photo immediately so the user gets visual feedback
      // that the shot worked — keep it on screen while detection runs and
      // through to the confirm-rack screen.
      setPreviewUri(photo.uri);

      const compressed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const base64 = await prepareImageBase64(compressed.uri);
      setImage(compressed.uri);

      const result = await detectRack(base64);
      // A wine fridge is photographed from one side only, but each shelf
      // typically holds a second run of bottles facing the other way (visible
      // only from the back). The camera captures every vertical level (rows)
      // but only half the horizontal positions (cols), so double the detected
      // horizontal count for fridges. Racks are fully visible from the front,
      // so they're left exactly as detected. Cap at 30 to match the manual
      // editor and the edge-function bounds.
      const isFridge = pendingStorageType === 'fridge';
      const cols = isFridge ? Math.min(30, result.cols * 2) : result.cols;
      setDetected(result.rows, cols);
      router.push('/cellar/rack/detect');
    } catch {
      // Blind fallback when detection fails — give fridges a wider horizontal
      // default for the same one-side-visibility reason.
      setDetected(4, pendingStorageType === 'fridge' ? 12 : 6);
      router.push('/cellar/rack/detect');
    } finally {
      setCapturing(false);
    }
  }

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.processingText}>Reading the rack…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" autofocus="on" focusable />
      <CameraOverlay
        onCapture={handleCapture}
        hint="Frame your wine rack within the guides"
      />

      <Modal visible={introVisible} transparent animationType="fade" onRequestClose={() => setIntroVisible(false)}>
        <View style={styles.introOverlay}>
          <View style={styles.introSheet}>
            <Text style={styles.introTitle}>New Rack</Text>
            <Text style={styles.introBody}>You're creating a new rack in Vinster. Point your camera at your rack, fit it within the frame, and shoot.</Text>
            <TouchableOpacity style={styles.introBtn} onPress={() => setIntroVisible(false)} activeOpacity={0.8}>
              <Text style={styles.introBtnText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  processingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  processingText: {
    // Inter — body (processing status text)
    fontFamily: fonts.bodySemibold,
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  introOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  introSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460, alignItems: 'center', gap: spacing.md },
  introTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5 },
  introBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22 },
  introBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, alignItems: 'center', marginTop: spacing.xs },
  introBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
});
