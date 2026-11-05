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
};

const HERO_H = 400;
const DARK = '#3E2120';

export function WineCardHero({ path, title, subtitle, chip, onBack, onPhotoPress, onPhotoLongPress, onTitlePress, badge }: Props) {
  const { uri, pending } = useLabelImageState(path);
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
        ) : (
          <View style={styles.empty}><Text style={styles.emptyText}>Tap to add a label photo</Text></View>
        )}
      </TouchableOpacity>

      {/* Fade into the dark band (no gradient lib: stacked translucent bands). */}
      <View pointerEvents="none" style={[styles.fade, { height: 70, opacity: 0.25 }]} />
      <View pointerEvents="none" style={[styles.fade, { height: 120, opacity: 0.35 }]} />
      <View pointerEvents="none" style={[styles.fade, { height: 160, opacity: 0.45 }]} />
      <View pointerEvents="none" style={styles.topShade} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.backBtn} accessibilityLabel="Back">
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.chip}>{chip}</Text>
        <View style={styles.backBtn} />
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
  photo: { position: 'absolute', left: 0, right: 0, top: 50, bottom: 70 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: DARK },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 64, backgroundColor: 'rgba(62,33,32,0.45)' },
  topBar: { position: 'absolute', left: spacing.md, right: spacing.md, top: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.gold, fontSize: 24, fontFamily: fonts.bodyRegular },
  chip: { fontFamily: fonts.headingBold, fontSize: 15, letterSpacing: 1.5, color: colors.gold, textTransform: 'uppercase' },
  identity: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: 16, gap: 4 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 31, color: colors.text, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  subtitle: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.gold, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});
