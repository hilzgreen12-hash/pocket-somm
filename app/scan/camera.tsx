import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useScanStore } from '../../src/stores/scanStore';
import { CameraOverlay } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { Ionicons } from '@expo/vector-icons';

type Dims = { width: number; height: number };

// Re-encode with the EXIF rotation baked in, so the preview and the reader
// always see the photo upright, and return its true upright size.
async function normaliseOrientation(uri: string, dims: Dims): Promise<{ uri: string; dims: Dims }> {
  try {
    const out = await ImageManipulator.manipulateAsync(uri, [], { compress: 1, format: ImageManipulator.SaveFormat.JPEG });
    return { uri: out.uri, dims: { width: out.width, height: out.height } };
  } catch (e) {
    console.warn('[Camera] orientation normalise failed, using raw photo:', e);
    return { uri, dims };
  }
}

// Crop to what the user actually framed. The live preview fills the window
// (cover) but the sensor saves a wider field of view, which leaves the list
// small in the photo. Centre-crop to the window's aspect ratio; any problem
// falls back to the full photo.
async function cropToPreview(uri: string, { width: pw, height: ph }: Dims): Promise<string> {
  try {
    const { width: winW, height: winH } = Dimensions.get('window');
    const target = winW / winH;
    if (!(pw > 0 && ph > 0 && target > 0)) return uri;
    let cropW = pw, cropH = ph, originX = 0, originY = 0;
    if (pw / ph > target) {
      cropW = Math.round(ph * target);          // wider than framed → trim the sides
      originX = Math.round((pw - cropW) / 2);
    } else {
      cropH = Math.round(pw / target);          // taller than framed → trim top/bottom
      originY = Math.round((ph - cropH) / 2);
    }
    if (cropW < 8 || cropH < 8 || cropW > pw || cropH > ph) return uri;
    const out = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX, originY, width: cropW, height: cropH } }],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
    );
    return out.uri;
  } catch (e) {
    console.warn('[Camera] framing crop failed, using full photo:', e);
    return uri;
  }
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setImage } = useScanStore();
  const [autofocus, setAutofocus] = useState<'on' | 'off'>('on');
  // "Steady!" prompt — fires on every mount of the scan camera so the
  // user is reminded about lighting / focus / framing before each
  // capture. Initialised true so it appears even when the camera screen
  // is re-entered from a previous failed scan. Dismissing requires an
  // explicit OK tap; the overlay click is deliberately non-dismissive
  // so the user can't accidentally tap through it and shoot a blurry
  // photo. Per-mount state (not AsyncStorage) so it shows every time
  // the user opens Scan Wine List.
  // The "Steady!" reminder before the first page only, not each extra page.
  const cameraPages = useScanStore((st) => st.cameraPages);
  const [steadyOpen, setSteadyOpen] = useState(cameraPages.length === 0);
  // Torch for dim restaurants.
  const [torchOn, setTorchOn] = useState(false);
  // One capture at a time — a double tap on the shutter used to push two
  // previews (and so two paid scans). Declared with the other hooks, above the
  // permission early returns: a hook after them crashes the screen once the
  // permission check resolves.
  const capturing = useRef(false);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return <PermissionScreen onRequest={requestPermission} />;
  }

  function handleTap() {
    // expo-camera's CameraView doesn't expose a "focus at point" API, but
    // toggling the autofocus prop forces the camera to re-acquire focus.
    // Brief flicker off → on gives the user a tactile "tap to refocus".
    setAutofocus('off');
    setTimeout(() => setAutofocus('on'), 50);
  }

  async function handleCapture() {
    if (!cameraRef.current || capturing.current) return;
    capturing.current = true;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({ base64: false, quality: 1 });
      if (!photo?.uri) return;
      const upright = await normaliseOrientation(photo.uri, { width: photo.width ?? 0, height: photo.height ?? 0 });
      const framed = await cropToPreview(upright.uri, upright.dims);
      setImage(framed);
      router.push('/scan/preview');
    } catch (err) {
      console.error('[Camera] Capture failed:', err);
      showAlert({ title: 'Camera error', body: 'Could not capture the photo. Please try again.' });
    } finally {
      capturing.current = false;
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus={autofocus}
        enableTorch={torchOn}
        focusable
        onTouchEnd={handleTap}
      />
      <CameraOverlay
        onCapture={handleCapture}
        hint={cameraPages.length ? `Page ${cameraPages.length + 1} — frame the next section of the list` : undefined}
      />
      <TouchableOpacity
        style={styles.torch}
        onPress={() => setTorchOn((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={torchOn ? 'Turn the torch off' : 'Turn the torch on'}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name={torchOn ? 'flashlight' : 'flashlight-outline'} size={26} color={torchOn ? colors.gold : '#FFFFFF'} />
      </TouchableOpacity>

      {/* Steady-reminder overlay — blocks any interaction with the
          camera (including the capture button beneath it) until the
          user explicitly taps OK. onRequestClose is a no-op so the
          Android hardware back doesn't dismiss it either. */}
      <Modal
        visible={steadyOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
        statusBarTranslucent
      >
        <View style={styles.steadyOverlay}>
          <View style={styles.steadySheet}>
            <Text style={styles.steadyTitle}>Steady!</Text>
            <Text style={styles.steadyBody}>
              Ensure your list is well lit, not blurry, and you've got all the information in the frame before you shoot.
            </Text>
            <TouchableOpacity
              style={styles.steadyButton}
              onPress={() => setSteadyOpen(false)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="OK, I understand"
            >
              <Text style={styles.steadyButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  torch: { position: 'absolute', top: 60, right: spacing.xl, padding: spacing.sm, borderRadius: 24, backgroundColor: 'rgba(0,0,0,0.45)' },
  // Steady-reminder modal — terracotta sheet on dim scrim, matching the
  // app's modal pattern (see chef.tsx modalOverlay/modalSheet). Single
  // gold OK button is the only way out, so the user actively
  // acknowledges before shooting.
  steadyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  steadySheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
  },
  steadyTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  steadyBody: {
    fontFamily: fonts.bodyItalic,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  steadyButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  steadyButtonText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 18,
    color: colors.gold,
    letterSpacing: 0.5,
  },
});
