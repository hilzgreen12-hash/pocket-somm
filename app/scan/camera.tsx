import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Modal, TouchableOpacity } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Haptics from 'expo-haptics';
import { useScanStore } from '../../src/stores/scanStore';
import { CameraOverlay, type FrameRect } from '../../src/components/scan/CameraOverlay';
import { PermissionScreen } from '../../src/components/scan/PermissionScreen';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const { setImage } = useScanStore();
  const [autofocus, setAutofocus] = useState<'on' | 'off'>('on');
  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);
  // "Steady!" prompt — fires on every mount of the scan camera so the
  // user is reminded about lighting / focus / framing before each
  // capture. Initialised true so it appears even when the camera screen
  // is re-entered from a previous failed scan. Dismissing requires an
  // explicit OK tap; the overlay click is deliberately non-dismissive
  // so the user can't accidentally tap through it and shoot a blurry
  // photo. Per-mount state (not AsyncStorage) so it shows every time
  // the user opens Scan Wine List.
  const [steadyOpen, setSteadyOpen] = useState(true);

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
    if (!cameraRef.current) return;
    try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const photo = await cameraRef.current.takePictureAsync({
      base64: false,
      quality: 1,
    });
    if (!photo?.uri) return;

    let uri = photo.uri;
    let dims = { width: photo.width ?? 0, height: photo.height ?? 0 };

    // Normalise orientation — ImageManipulator re-encodes with the EXIF rotation
    // baked in, so the preview and OCR always see the photo upright, and gives us
    // the true upright pixel dimensions to crop against.
    try {
      const normalised = await ImageManipulator.manipulateAsync(
        uri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );
      uri = normalised.uri;
      dims = { width: normalised.width, height: normalised.height };
    } catch (e) {
      console.warn('[Camera] orientation normalise failed, using raw photo:', e);
    }

    // Center-crop to the on-screen preview's aspect ratio. The live CameraView
    // fills the whole window (cover), but takePictureAsync saves the sensor's
    // FULL, wider field of view — so the captured photo shows more than the user
    // framed, leaving the wine list small ("zoomed out") and giving OCR a smaller
    // target. Cropping to the window aspect makes the saved photo match what was
    // framed (WYSIWYG) and hands the read a bigger list. We crop to the full
    // preview area (NOT the tight guide frame, whose screen→pixel math was the
    // old buggy path) and use the post-normalise upright dims so orientation
    // can't flip the branch. Best-effort — any issue falls back to the full photo.
    try {
      const { width: winW, height: winH } = Dimensions.get('window');
      const targetAspect = winW / winH;
      const { width: pw, height: ph } = dims;
      if (pw > 0 && ph > 0 && targetAspect > 0) {
        let cropW = pw, cropH = ph, originX = 0, originY = 0;
        if (pw / ph > targetAspect) {
          // Photo wider than the framed preview → trim the hidden sides.
          cropW = Math.round(ph * targetAspect);
          originX = Math.round((pw - cropW) / 2);
        } else {
          // Photo taller than the preview → trim top/bottom.
          cropH = Math.round(pw / targetAspect);
          originY = Math.round((ph - cropH) / 2);
        }
        if (cropW >= 8 && cropH >= 8 && cropW <= pw && cropH <= ph) {
          const cropped = await ImageManipulator.manipulateAsync(
            uri,
            [{ crop: { originX, originY, width: cropW, height: cropH } }],
            { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
          );
          uri = cropped.uri;
        }
      }
    } catch (e) {
      console.warn('[Camera] framing crop failed, using full photo:', e);
    }

    setImage(uri);
    router.push('/scan/preview');
    } catch (err) {
      console.error('[Camera] Capture failed:', err);
      showAlert({ title: 'Camera error', body: 'Could not capture the photo. Please try again.' });
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        autofocus={autofocus}
        focusable
        onTouchEnd={handleTap}
      />
      <CameraOverlay onCapture={handleCapture} onFrameLayout={setFrameRect} />

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
