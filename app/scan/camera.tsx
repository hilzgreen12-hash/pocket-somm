import { useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useScanStore } from '../../src/stores/scanStore';
import { CameraOverlay, type FrameRect } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setImage } = useScanStore();
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);
  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return <PermissionScreen onRequest={requestPermission} />;
  }

  function handleTap(event: { nativeEvent: { locationX: number; locationY: number } }) {
    const { locationX: x, locationY: y } = event.nativeEvent;
    setFocusPoint({ x, y });
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current.takePictureAsync({
      base64: false,
      quality: 1,
    });
    if (!photo?.uri) return;

    let uri = photo.uri;

    // Crop photo to the guide frame area.
    // Step 1: normalise orientation — ImageManipulator applies EXIF rotation when
    // writing the file, giving us reliable width/height values in screen space.
    if (frameRect) {
      const normalised = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const { width: screenW, height: screenH } = Dimensions.get('window');
      const photoW = normalised.width;
      const photoH = normalised.height;

      // After normalisation the photo should be portrait when the phone is portrait.
      // Map guide-frame screen coordinates → photo pixel coordinates.
      // If the photo aspect is wider than the screen (preview crops L/R),
      // scale by height; otherwise scale by width.
      let cropX: number, cropY: number, cropW: number, cropH: number;

      const screenRatio = screenH / screenW;
      const photoRatio = photoH / photoW;

      if (photoRatio >= screenRatio) {
        // Photo is taller than screen preview — preview crops top & bottom
        const scale = photoW / screenW;
        const yOffset = (photoH - screenH * scale) / 2;
        cropX = frameRect.x * scale;
        cropY = frameRect.y * scale + yOffset;
        cropW = frameRect.width * scale;
        cropH = frameRect.height * scale;
      } else {
        // Photo is wider than screen preview — preview crops left & right
        const scale = photoH / screenH;
        const xOffset = (photoW - screenW * scale) / 2;
        cropX = frameRect.x * scale + xOffset;
        cropY = frameRect.y * scale;
        cropW = frameRect.width * scale;
        cropH = frameRect.height * scale;
      }

      // Clamp to photo bounds
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

    setImage(uri);
    router.push('/scan/preview');
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus="on"
        focusable
        onTouchEnd={handleTap}
      />
      <CameraOverlay onCapture={handleCapture} onFrameLayout={setFrameRect} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
