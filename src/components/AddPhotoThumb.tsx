import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Stand-in for a bottle thumbnail when a review has no photo yet — e.g. a wine
// picked from a scanned restaurant list (text only, no label shot). A dashed
// gold frame with a "+ Add" prompt; tapping opens the photo-options sheet
// (Take Photo / Upload / Search Online — see useAttachLabelPhoto).
export function AddPhotoThumb({
  onPress,
  style,
  radius = 4,
}: {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  radius?: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Add a photo"
      style={[styles.box, { borderRadius: radius }, style]}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      <Text style={styles.plus}>+</Text>
      <Text style={styles.label}>Add</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(224,184,74,0.06)',
  },
  plus: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.gold, lineHeight: 20 },
  label: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.gold, letterSpacing: 0.4 },
});
