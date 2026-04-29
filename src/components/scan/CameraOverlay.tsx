import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, spacing } from '../../constants/theme';

const { width } = Dimensions.get('window');
const FRAME_WIDTH = width * 0.9;
const FRAME_HEIGHT = FRAME_WIDTH * 1.4;

export interface FrameRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  onCapture: () => void;
  onFrameLayout?: (rect: FrameRect) => void;
  hint?: string;
}

export function CameraOverlay({ onCapture, onFrameLayout, hint = 'Frame the wine list within the guides' }: Props) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <Text style={styles.hint}>{hint}</Text>

      <View
        style={[styles.frame, { width: FRAME_WIDTH, height: FRAME_HEIGHT }]}
        onLayout={(e) => onFrameLayout?.(e.nativeEvent.layout)}
      >
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      <TouchableOpacity style={styles.captureButton} onPress={onCapture} activeOpacity={0.8}>
        <View style={styles.captureInner} />
      </TouchableOpacity>
    </View>
  );
}

const CORNER = 24;
const THICKNESS = 3;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
  },
  hint: {
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    overflow: 'hidden',
  },
  frame: {
    borderRadius: 4,
  },
  corner: {
    position: 'absolute',
    width: CORNER,
    height: CORNER,
    borderColor: '#fff',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: THICKNESS,
    borderLeftWidth: THICKNESS,
    borderTopLeftRadius: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: THICKNESS,
    borderRightWidth: THICKNESS,
    borderTopRightRadius: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: THICKNESS,
    borderLeftWidth: THICKNESS,
    borderBottomLeftRadius: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: THICKNESS,
    borderRightWidth: THICKNESS,
    borderBottomRightRadius: 4,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },
});
