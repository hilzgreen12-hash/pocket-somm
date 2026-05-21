import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
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
  const { setDetected, setImage } = useRackStore();
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

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
      setDetected(result.rows, result.cols);
      router.push('/cellar/rack/detect');
    } catch {
      setDetected(4, 6);
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
});
