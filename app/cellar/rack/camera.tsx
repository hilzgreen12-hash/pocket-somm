import { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { CameraOverlay } from '../../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../../src/components/scan/PermissionScreen';
import { prepareImageBase64 } from '../../../src/api/label';
import { detectRack } from '../../../src/api/racks';
import { useRackStore } from '../../../src/stores/rackStore';

export default function RackCameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setDetected, setImage } = useRackStore();
  const [capturing, setCapturing] = useState(false);

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) return <PermissionScreen onRequest={requestPermission} />;

  async function handleCapture() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 0.8 });
      if (!photo?.uri) return;

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
});
