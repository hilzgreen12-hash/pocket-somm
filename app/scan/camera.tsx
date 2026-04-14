import { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { useScanStore } from '../../src/stores/scanStore';
import { CameraOverlay } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setImage } = useScanStore();
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | undefined>(undefined);

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
      quality: 0.9,
    });
    if (photo?.uri) {
      setImage(photo.uri);
      router.push('/scan/preview');
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
        onTouchEnd={handleTap}
      />
      <CameraOverlay onCapture={handleCapture} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
