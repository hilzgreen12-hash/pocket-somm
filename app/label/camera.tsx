import { useCallback, useRef, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useLabelStore } from '../../src/stores/labelStore';
import { CameraOverlay, type FrameRect } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { prepareImageBase64 } from '../../src/api/label';
import { scanLabel } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';

export default function LabelCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const { setImage, setWineDetails, setError } = useLabelStore();

  // Drop the still-photo preview when the screen regains focus (e.g. user
  // navigated back from /label/confirm) so the live camera comes back.
  useFocusEffect(useCallback(() => { setPreviewUri(null); }, []));

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <PermissionScreen onRequest={requestPermission} />;

  async function handleCapture() {
    if (!cameraRef.current || previewUri) return;
    try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
    if (!photo?.uri) return;

    // Show the captured photo immediately so the user gets visual feedback
    // that the shot worked — keep it on screen while the OCR call runs.
    setPreviewUri(photo.uri);

    let uri = photo.uri;

    if (frameRect) {
      const normalised = await ImageManipulator.manipulateAsync(uri, [], {
        compress: 1, format: ImageManipulator.SaveFormat.JPEG,
      });
      const { width: screenW, height: screenH } = Dimensions.get('window');
      const { width: photoW, height: photoH } = normalised;
      const screenRatio = screenH / screenW;
      const photoRatio = photoH / photoW;

      let cropX, cropY, cropW, cropH;
      if (photoRatio >= screenRatio) {
        const scale = photoW / screenW;
        const yOffset = (photoH - screenH * scale) / 2;
        cropX = frameRect.x * scale; cropY = frameRect.y * scale + yOffset;
        cropW = frameRect.width * scale; cropH = frameRect.height * scale;
      } else {
        const scale = photoH / screenH;
        const xOffset = (photoW - screenW * scale) / 2;
        cropX = frameRect.x * scale + xOffset; cropY = frameRect.y * scale;
        cropW = frameRect.width * scale; cropH = frameRect.height * scale;
      }

      const safeX = Math.max(0, Math.min(Math.round(cropX), photoW - 2));
      const safeY = Math.max(0, Math.min(Math.round(cropY), photoH - 2));
      const safeW = Math.min(Math.round(cropW), photoW - safeX);
      const safeH = Math.min(Math.round(cropH), photoH - safeY);

      if (safeW > 10 && safeH > 10) {
        const cropped = await ImageManipulator.manipulateAsync(
          normalised.uri,
          [{ crop: { originX: safeX, originY: safeY, width: safeW, height: safeH } }],
          { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
        );
        uri = cropped.uri;
      }
    }

    try {
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan label');
      router.push('/label/confirm');
    }
    } catch (err) {
      console.error('[LabelCamera] Capture failed:', err);
      setPreviewUri(null);
      showAlert({ title: 'Camera error', body: 'Could not capture the photo. Please try again.' });
    }
  }

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.processingText}>Reading the label…</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus="on"
        focusable
      />
      <CameraOverlay onCapture={handleCapture} onFrameLayout={setFrameRect} hint="Frame the bottle's label within the guides" />
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
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
