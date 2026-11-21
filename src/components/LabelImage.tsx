import { Image, type ImageStyle } from 'expo-image';
import type { StyleProp } from 'react-native';

// The one place stored label / lineup / restaurant photos are drawn. expo-image
// keeps decoded bitmaps in memory, so carousels and grids re-show instantly.
// The cache key is the uri itself, which already encodes storage path + retake
// version (see labelImageCache), so a retake can never show the old bitmap.
export function LabelImage({ uri, style, contentFit = 'cover', blurRadius, onError }: {
  uri: string;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain';
  // A soft blurred backdrop (e.g. behind the wine-card hero photo).
  blurRadius?: number;
  onError?: () => void;
}) {
  // Local files already sit in our own size-capped disk cache — a second disk
  // copy in expo-image's cache would only double the storage — so they are
  // cached in memory only; web images (e.g. auto-found labels) also go to disk.
  const local = uri.startsWith('file:');
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={contentFit}
      blurRadius={blurRadius}
      cachePolicy={local ? 'memory' : 'memory-disk'}
      recyclingKey={uri}
      transition={120}
      onError={onError}
    />
  );
}
