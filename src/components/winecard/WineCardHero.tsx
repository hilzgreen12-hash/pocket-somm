import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useLabelImageState } from '../../hooks/useLabelImageUrl';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Wine card hero: the label photo large across the top, fading into the dark
// band below, with the wine's identity laid over its foot. Tap the photo to
// view it (or add one); long-press to change / delete; tap the name to edit.
type Props = {
  path: string | null | undefined;
  title: string;
  subtitle: string;
  chip: string;
  onBack: () => void;
  onPhotoPress: () => void;
  onPhotoLongPress: () => void;
  onTitlePress: () => void;
  badge?: React.ReactNode;
  // A local / already-resolved image (Wine Intel's scanned or web label) used
  // instead of the stored `path`.
  uri?: string | null;
  // Shown when there's no image at all (instead of "Tap to add a label photo").
  placeholder?: React.ReactNode;
  // Top-right action (e.g. Wine Intel's "Edit Wine").
  rightAction?: React.ReactNode;
  // Saving a new photo — a spinner over the image.
  busy?: boolean;
};

const HERO_H = 400;
const DARK = '#3E2120';

export function WineCardHero({ path, title, subtitle, chip, onBack, onPhotoPress, onPhotoLongPress, onTitlePress, badge, uri: uriProp, placeholder, rightAction, busy }: Props) {
  const stored = useLabelImageState(uriProp ? null : path);
  const uri = uriProp ?? stored.uri;
  const pending = uriProp ? false : stored.pending;
  return (
    <View style={styles.hero}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onPhotoPress} onLongPress={onPhotoLongPress} delayLongPress={350} activeOpacity={0.9} accessibilityLabel={path ? 'View label photo' : 'Add a label photo'}>
        {uri ? (
          <>
            {/* Blurred-out fill behind so a tall label never leaves bare edges. */}
            <Image source={{ uri }} style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} resizeMode="cover" blurRadius={18} />
            <Image source={{ uri }} style={styles.photo} resizeMode="contain" />
          </>
        ) : pending ? (
          <View style={styles.empty}><ActivityIndicator color={colors.gold} /></View>
        ) : placeholder ? (
          <View style={styles.empty}>{placeholder}</View>
        ) : (
          <View style={styles.empty}><Text style={styles.emptyText}>Tap to add a label photo</Text></View>
        )}
      </TouchableOpacity>

      {busy ? (
        <View pointerEvents="none" style={styles.busy}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.busyText}>Saving photo…</Text>
        </View>
      ) : null}

      {/* One even shade behind the title (no lighter upper tier). */}
      <View pointerEvents="none" style={[styles.fade, { height: 130, opacity: 0.7 }]} />
      <View pointerEvents="none" style={styles.topShade} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.backBtn} accessibilityLabel="Back">
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        {chip ? <Text style={styles.chip}>{chip}</Text> : null}
        {rightAction ?? <View style={styles.backBtn} />}
      </View>

      <TouchableOpacity style={styles.identity} onPress={onTitlePress} activeOpacity={0.8} accessibilityLabel="Edit wine details">
        <Text style={styles.title} numberOfLines={3}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
        {badge}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: HERO_H, backgroundColor: DARK, overflow: 'hidden' },
  photo: { position: 'absolute', left: 0, right: 0, top: 86, bottom: 70 },
  busy: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(62,33,32,0.35)' },
  busyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: DARK },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 96, backgroundColor: 'rgba(62,33,32,0.45)' },
  topBar: { position: 'absolute', left: spacing.md, right: spacing.md, top: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.gold, fontSize: 24, fontFamily: fonts.bodyRegular },
  chip: { fontFamily: fonts.headingBold, fontSize: 15, letterSpacing: 1.5, color: colors.gold, textTransform: 'uppercase' },
  identity: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 16, gap: 4 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 31, color: colors.text, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  subtitle: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.gold, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});
