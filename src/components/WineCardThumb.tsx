import { View, Image, Text, ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useLabelImageUrl } from '../hooks/useLabelImageUrl';
import { useAutoLabel } from '../hooks/useAutoLabel';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A Discover-carousel thumbnail that always tries to show a real image: a stored
// label path, a local uri, or — for a wine identity with no photo — a web-fetched
// label. Only a card with no image AND no wine identity (e.g. a restaurant with
// no photo) falls back to a name tile.
export function WineCardThumb({
  path, localUri, producer, wineName, fallbackText, style, resizeMode = 'cover',
}: {
  path?: string | null;
  localUri?: string | null;
  producer?: string | null;
  wineName?: string | null;
  fallbackText?: string | null;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain';
}) {
  const resolved = useLabelImageUrl(path ?? null);
  const stored = localUri ?? resolved;
  const auto = useAutoLabel(producer, wineName, !stored);
  const uri = stored ?? auto;
  // A stored path still resolving to a signed URL — show a swirl, not the tile.
  const loadingStored = !!path && !resolved && !localUri;
  return (
    <View style={[styles.thumb, style]}>
      {uri ? (
        <Image source={{ uri }} style={styles.img} resizeMode={resizeMode} />
      ) : loadingStored ? (
        <ActivityIndicator size="small" color={colors.gold} />
      ) : (
        <Text style={styles.fallback} numberOfLines={3}>{fallbackText?.trim() || 'No photo'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  thumb: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: 6 },
  img: { width: '100%', height: '100%', borderRadius: 8 },
  fallback: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center', paddingHorizontal: 6 },
});
