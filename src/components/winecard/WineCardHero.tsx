import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { repairLabelImage, useLabelImageState } from '../../hooks/useLabelImageUrl';
import { LabelImage } from '../LabelImage';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';
import { useArchivedCard, ARCHIVED } from './cardTheme';

// Wine card hero: the label photo large across the top, with a see-through
// terracotta band at its foot, with the wine's identity laid over its foot. Tap the photo to
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

// Hero height scales with the screen width so a typical portrait label fills
// most of the width (labels are taller than wide; a fixed 400pt box left wide
// empty sides). The photo runs from under the top bar down into the title fade.
function heroHeight(width: number): number {
  return Math.round(Math.min(620, Math.max(400, width * 1.4)));
}
const DARK = '#3E2120';
// The band's usual height, and the headroom it keeps above the identity block.
const BAND_MIN = 130;
const BAND_HEADROOM = 20;
const IDENTITY_BOTTOM = 16;

export function WineCardHero({ path, title, subtitle, chip, onBack, onPhotoPress, onPhotoLongPress, onTitlePress, badge, uri: uriProp, placeholder, rightAction, busy }: Props) {
  const archived = useArchivedCard();
  const qc = useQueryClient();
  const stored = useLabelImageState(uriProp ? null : path);
  const uri = uriProp ?? stored.uri;
  const pending = uriProp ? false : stored.pending;
  const { width } = useWindowDimensions();
  // The identity block's measured height: a long title (3 lines) with a
  // 2-line subtitle and a badge outgrows the usual band, so the band grows to
  // keep the text over it.
  const [identityHeight, setIdentityHeight] = useState(0);
  const bandHeight = Math.max(BAND_MIN, Math.ceil(identityHeight) + IDENTITY_BOTTOM + BAND_HEADROOM);
  return (
    <View style={[styles.hero, { height: heroHeight(width) }]}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onPhotoPress} onLongPress={onPhotoLongPress} delayLongPress={350} activeOpacity={0.9} accessibilityLabel={path ? 'View label photo' : 'Add a label photo'}>
        {uri ? (
          <>
            {/* Blurred-out fill behind so a tall label never leaves bare edges. */}
            <LabelImage uri={uri} style={[StyleSheet.absoluteFill, { opacity: 0.35 }]} blurRadius={18} />
            {/* A stored photo whose cached file won't draw is re-downloaded. */}
            <LabelImage uri={uri} style={styles.photo} contentFit="contain" onError={uriProp ? undefined : () => repairLabelImage(qc, path)} />
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

      {/* One even see-through terracotta band behind the title, so the hero
          runs into the page colour below rather than a dark brown block. */}
      <View pointerEvents="none" style={[styles.fade, archived && arch.fade, { height: bandHeight }]} />
      <View pointerEvents="none" style={[styles.topShade, archived && arch.topShade]} />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={styles.backBtn} accessibilityLabel="Back">
          <Text style={[styles.backText, archived && arch.dark]}>←</Text>
        </TouchableOpacity>
        {chip ? <Text style={[styles.chip, archived && arch.dark]}>{chip}</Text> : null}
        {rightAction ?? <View style={styles.backBtn} />}
      </View>

      <TouchableOpacity style={styles.identity} onLayout={(e) => setIdentityHeight(e.nativeEvent.layout.height)} onPress={onTitlePress} activeOpacity={0.8} accessibilityLabel="Edit wine details">
        <Text style={[styles.title, archived && arch.title]} numberOfLines={3}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, archived && arch.subtitle]} numberOfLines={2}>{subtitle}</Text> : null}
        {badge}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: DARK, overflow: 'hidden' },
  photo: { position: 'absolute', left: spacing.md, right: spacing.md, top: 76, bottom: 40 },
  busy: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(62,33,32,0.35)' },
  busyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  fade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(127,79,76,0.86)' },
  topShade: { position: 'absolute', left: 0, right: 0, top: 0, height: 96, backgroundColor: 'rgba(62,33,32,0.45)' },
  topBar: { position: 'absolute', left: spacing.md, right: spacing.md, top: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.gold, fontSize: 24, fontFamily: fonts.bodyRegular },
  chip: { fontFamily: fonts.headingBold, fontSize: 15, letterSpacing: 1.5, color: colors.gold, textTransform: 'uppercase' },
  identity: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: IDENTITY_BOTTOM, gap: 4 },
  title: { fontFamily: fonts.headingBold, fontSize: 28, lineHeight: 31, color: colors.text, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 6 },
  subtitle: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.gold, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 4 },
});

// Archived wine cards: a cream band under the photo with dark type, matching
// the card's cream page.
const arch = StyleSheet.create({
  fade: { backgroundColor: 'rgba(226,214,198,0.94)' },
  topShade: { backgroundColor: 'rgba(226,214,198,0.35)' },
  dark: { color: ARCHIVED.espresso },
  title: { color: ARCHIVED.espresso, textShadowRadius: 0 },
  subtitle: { color: ARCHIVED.accent, textShadowRadius: 0 },
});
