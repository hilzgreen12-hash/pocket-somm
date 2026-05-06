import { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useLabelStore } from '../../src/stores/labelStore';
import { CameraOverlay, type FrameRect } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { prepareImageBase64 } from '../../src/api/label';
import { scanLabel } from '../../src/api/label';

export default function LabelCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);
  const { setImage, setWineDetails, setError } = useLabelStore();

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <PermissionScreen onRequest={requestPermission} />;

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
    if (!photo?.uri) return;

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
      Alert.alert('Camera error', 'Could not capture the photo. Please try again.');
    }
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
});
