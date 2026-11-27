import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { WineCardThumb } from '../WineCardThumb';
import { RESTAURANT_WARM_IMG } from '../ExamplePlaceholder';
import { communityImageUrl, type FeedItem, type FeedTile } from '../../api/community';
import { HOME_TILE, colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// The Vinster Community's building blocks: member avatars, carousel tiles and
// the full review card used in lists and on a review's own page.

export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: days > 300 ? 'numeric' : undefined });
}

const stars = (n: number | null | undefined) => (n ? '★'.repeat(n) + '☆'.repeat(5 - n) : '');
const restaurantStars = (item: FeedItem) =>
  stars((item.metadata as { stars?: { overall?: number | null } } | null)?.stars?.overall ?? null);

// The headline score: a wine's 0–100, or a restaurant's stars.
export function scoreText(item: FeedItem): string {
  if (item.category === 'restaurant') return restaurantStars(item);
  return item.rating != null ? `${item.rating}/100` : '';
}

export function Avatar({ path, name, size = 36 }: { path: string | null | undefined; name: string | null | undefined; size?: number }) {
  const url = communityImageUrl(path);
  const box = { width: size, height: size, borderRadius: size / 2 };
  if (url) return <Image source={{ uri: url }} style={box} contentFit="cover" />;
  return (
    <View style={[box, styles.avatarEmpty]}>
      <Text style={[styles.avatarInitial, { fontSize: size * 0.42 }]}>{(name?.trim()[0] ?? '?').toUpperCase()}</Text>
    </View>
  );
}

// A review's picture: its shared photo, else the wine's label art, else a
// restaurant photo.
function ReviewPicture({ item }: { item: FeedItem }) {
  const url = communityImageUrl(item.image_path);
  if (url) return <Image source={{ uri: url }} style={StyleSheet.absoluteFill} contentFit="cover" />;
  if (item.category === 'wine') {
    const m = (item.metadata ?? {}) as { producer?: string | null; wine_name?: string | null };
    return <WineCardThumb producer={m.producer ?? null} wineName={m.wine_name ?? item.title} fallbackText={item.title} style={StyleSheet.absoluteFill} />;
  }
  return <Image source={RESTAURANT_WARM_IMG} style={StyleSheet.absoluteFill} contentFit="cover" />;
}

// A carousel tile, the same size as the Home carousels'.
export function FeedTileView({ tile, onPress }: { tile: FeedTile; onPress: () => void }) {
  const item = tile.kind === 'review' ? tile.item : tile.latest;
  const name = tile.kind === 'review' ? item.title : `${tile.count} reviews`;
  const who = (tile.kind === 'review' ? item.username : tile.username) ?? 'A member';
  const stamp = tile.kind === 'review' ? [who, scoreText(item)].filter(Boolean).join(' · ') : `Shared by ${who}`;
  return (
    <TouchableOpacity style={styles.tile} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.tileImage}>
        <ReviewPicture item={item} />
      </View>
      <Text style={styles.tileName} numberOfLines={2} allowFontScaling={false}>{name}</Text>
      <Text style={styles.tileStamp} numberOfLines={1} allowFontScaling={false}>{stamp}</Text>
    </TouchableOpacity>
  );
}

// A full review card: author, picture, wine or restaurant, score, the review,
// and cheers / comments. `full` shows the whole review (its own page).
export function FeedCard({ item, onPress, onCheer, full = false }: {
  item: FeedItem; onPress?: () => void; onCheer?: () => void; full?: boolean;
}) {
  const meta = (item.metadata ?? {}) as { place?: string | null; wines?: string[] };
  const score = scoreText(item);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.9}>
      <View style={styles.byline}>
        <Avatar path={item.avatar_path} name={item.username} size={32} />
        <Text style={styles.author} numberOfLines={1}>{item.username ?? 'A member'}</Text>
        <Text style={styles.when}>{timeAgo(item.created_at)}</Text>
      </View>
      <View style={[styles.picture, full && styles.pictureFull]}>
        <ReviewPicture item={item} />
      </View>
      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={full ? undefined : 2}>{item.title}</Text>
        {score ? <Text style={styles.score}>{score}</Text> : null}
      </View>
      {item.subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text> : null}
      {full && meta.place ? <Text style={styles.place}>Enjoyed at {meta.place}</Text> : null}
      {item.body ? <Text style={styles.body} numberOfLines={full ? undefined : 4}>{item.body}</Text> : null}
      {full && meta.wines?.length ? <Text style={styles.place}>Wines: {meta.wines.join(', ')}</Text> : null}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onCheer} disabled={!onCheer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.action, item.liked_by_me && styles.actionOn]}>
            {item.liked_by_me ? '♥' : '♡'} {item.like_count} {item.like_count === 1 ? 'cheer' : 'cheers'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.action}>{item.comment_count} {item.comment_count === 1 ? 'comment' : 'comments'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  avatarEmpty: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontFamily: fonts.headingBold, color: colors.gold },
  tile: { width: HOME_TILE.w },
  tileImage: { width: HOME_TILE.w, height: HOME_TILE.h, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderWhite },
  tileName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  tileStamp: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.4 },
  card: { marginHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: spacing.sm },
  byline: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  author: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  when: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted },
  picture: { height: 180, borderRadius: 12, overflow: 'hidden', backgroundColor: colors.surface },
  pictureFull: { height: 260 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  title: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 19, color: colors.text, lineHeight: 24 },
  score: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, marginTop: 2 },
  subtitle: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  place: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: 2 },
  action: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  actionOn: { color: colors.gold },
});
