import { View, Image, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { labelPublicUrl } from '../api/labelPhotos';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  // Stored storage path (cellar_wines.label_image_path). When null/absent
  // we render a clean cream "blank label" card with the wine name, so a
  // photo-less wine still reads as a framed tile in the gallery grid.
  path: string | null | undefined;
  fallbackText?: string | null;
  style?: StyleProp<ViewStyle>;
  // Inner corner radius of the photo; the cream frame sits just outside it.
  radius?: number;
  // Cream mat thickness around the photo.
  frame?: number;
  fallbackFontSize?: number;
}

// A wine label presented as a framed picture: the photo sits inside a cream
// mat so a grid of them reads as a cohesive gallery against any background.
export function LabelThumb({ path, fallbackText, style, radius = 6, frame = 4, fallbackFontSize = 11 }: Props) {
  const url = labelPublicUrl(path);
  return (
    <View style={[styles.frame, { padding: frame, borderRadius: radius + frame }, style]}>
      {url ? (
        <Image
          source={{ uri: url }}
          style={[styles.img, { borderRadius: radius }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.fallback, { borderRadius: radius }]}>
          <Text style={[styles.fallbackText, { fontSize: fallbackFontSize }]} numberOfLines={3}>
            {fallbackText?.trim() || 'No photo'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: colors.cream,
    overflow: 'hidden',
    // Subtle lift so framed labels read as objects on the cream boxing.
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  img: { width: '100%', height: '100%' },
  fallback: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.creamDim,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  // Dark ink on the cream blank-label card for legibility.
  fallbackText: {
    fontFamily: fonts.bodySemibold,
    color: colors.surface,
    textAlign: 'center',
  },
});
