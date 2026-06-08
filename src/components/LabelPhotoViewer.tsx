import { useMemo, useRef } from 'react';
import { Modal, View, Image, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { labelPublicUrl } from '../api/labelPhotos';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  visible: boolean;
  path: string | null | undefined;
  fallbackText?: string | null;
  onClose: () => void;
}

// Full-screen, framed, phone-photo-style viewer for a wine label. Pinch or
// double-tap to zoom (1–6×), drag to pan, ✕ to close. RN Animated + gesture-
// handler on the JS thread (no Reanimated worklet plugin in this project). A
// <Modal> renders in its own native hierarchy, so it gets its OWN
// GestureHandlerRootView or the gestures are dead.
export function LabelPhotoViewer({ visible, path, fallbackText, onClose }: Props) {
  const { width } = useWindowDimensions();
  const url = labelPublicUrl(path);

  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const base = useRef({ scale: 1, tx: 0, ty: 0 }).current;
  const cur = useRef({ scale: 1, tx: 0, ty: 0 }).current;

  function close() {
    base.scale = 1; cur.scale = 1; base.tx = 0; base.ty = 0; cur.tx = 0; cur.ty = 0;
    scale.setValue(1); tx.setValue(0); ty.setValue(0);
    onClose();
  }

  const gesture = useMemo(() => {
    const pinch = Gesture.Pinch()
      .runOnJS(true)
      .onUpdate((e) => {
        let s = base.scale * e.scale;
        if (s < 1) s = 1;
        if (s > 6) s = 6;
        cur.scale = s;
        scale.setValue(s);
      })
      .onEnd(() => { base.scale = cur.scale; });
    const pan = Gesture.Pan()
      .runOnJS(true)
      .minDistance(2)
      .onUpdate((e) => {
        cur.tx = base.tx + e.translationX;
        cur.ty = base.ty + e.translationY;
        tx.setValue(cur.tx);
        ty.setValue(cur.ty);
      })
      .onEnd(() => { base.tx = cur.tx; base.ty = cur.ty; });
    const doubleTap = Gesture.Tap()
      .numberOfTaps(2)
      .runOnJS(true)
      .onEnd(() => {
        if (base.scale > 1) {
          base.scale = 1; cur.scale = 1; base.tx = 0; base.ty = 0; cur.tx = 0; cur.ty = 0;
          scale.setValue(1); tx.setValue(0); ty.setValue(0);
        } else {
          base.scale = 2.5; cur.scale = 2.5;
          scale.setValue(2.5);
        }
      });
    return Gesture.Simultaneous(pinch, pan, doubleTap);
  }, []);

  const frameW = width - 48;
  const frameH = frameW * 1.3;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      {visible && (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.backdrop}>
            <GestureDetector gesture={gesture}>
              <Animated.View style={{ transform: [{ translateX: tx }, { translateY: ty }, { scale }] }}>
                <View style={[styles.frame, { width: frameW, height: frameH }]}>
                  {url ? (
                    <Image source={{ uri: url }} style={styles.img} resizeMode="cover" />
                  ) : (
                    <View style={styles.fallback}>
                      <Text style={styles.fallbackText} numberOfLines={4}>{fallbackText?.trim() || 'No photo'}</Text>
                    </View>
                  )}
                </View>
              </Animated.View>
            </GestureDetector>
            <TouchableOpacity style={styles.close} onPress={close} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.hint}>Pinch or double-tap to zoom · drag to move</Text>
          </View>
        </GestureHandlerRootView>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(18,11,10,0.97)', alignItems: 'center', justifyContent: 'center' },
  frame: {
    backgroundColor: colors.cream,
    padding: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  img: { width: '100%', height: '100%', borderRadius: 6 },
  fallback: { width: '100%', height: '100%', backgroundColor: colors.creamDim, alignItems: 'center', justifyContent: 'center', borderRadius: 6, paddingHorizontal: 16 },
  fallbackText: { fontFamily: fonts.bodySemibold, fontSize: 18, color: colors.surface, textAlign: 'center' },
  close: { position: 'absolute', top: 52, right: 24, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#FFFFFF', fontSize: 20, fontFamily: fonts.bodySemibold },
  hint: { position: 'absolute', bottom: 48, color: 'rgba(255,255,255,0.7)', fontSize: 13, fontFamily: fonts.bodyItalic },
});
