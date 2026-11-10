import { View, Image, Text, ActivityIndicator, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useLabelImageState } from '../hooks/useLabelImageUrl';
import { useAutoLabel } from '../hooks/useAutoLabel';
import { HOME_TILE, colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A Discover-carousel thumbnail that always tries to show a real image: a stored
// label path, a local uri, or — for a wine identity with no photo — a web-fetched
// label. Only a card with no image AND no wine identity (e.g. a restaurant with
// no photo) falls back to a name tile.
export function WineCardThumb({
  path, localUri, producer, wineName, fallbackText, style, resizeMode = 'cover', compact = false,
}: {
  path?: string | null;
  localUri?: string | null;
  producer?: string | null;
  wineName?: string | null;
  fallbackText?: string | null;
  style?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain';
  // Home carousels: smaller tile, photo edge to edge inside a white outline.
  compact?: boolean;
}) {
  const { uri: resolved, pending } = useLabelImageState(path ?? null);
  const stored = localUri ?? resolved;
  // Only web-fetch a stand-in label when there is genuinely no stored photo. If a
  // stored photo is still resolving (pending), wait for it — never flash a
  // web label that then gets replaced by the user's own photo a moment later.
  const auto = useAutoLabel(producer, wineName, !localUri && !path);
  const uri = stored ?? auto;
  // The user's own stored photo is still downloading/caching — show a swirl.
  const loadingStored = !localUri && pending;
  return (
    <View style={[styles.thumb, compact && styles.thumbCompact, style]}>
      {uri ? (
        <Image source={{ uri }} style={[styles.img, compact && styles.imgCompact]} resizeMode={resizeMode} />
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
  thumbCompact: { width: HOME_TILE.w, height: HOME_TILE.h, padding: 0 },
  imgCompact: { borderRadius: 0 },
  fallback: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center', paddingHorizontal: 6 },
});
