import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shown in an EMPTY Home carousel so a new user can picture what it becomes once
// populated: a caption card explaining what lands here, then a couple of ghost
// cards in the real card shape (thumbnail + two text lines), all in the gold
// "awaiting content" treatment. Purely decorative — the ghost cards aren't tappable.
export function CarouselPlaceholder({ caption, icon }: { caption: string; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {/* Caption card — what will appear here. */}
      <View style={styles.card}>
        <View style={styles.thumb}><Text style={styles.caption}>{caption}</Text></View>
        <View style={[styles.bar, { width: '80%' }]} />
        <View style={[styles.bar, styles.barSmall, { width: '55%' }]} />
      </View>
      {/* Ghost cards — the shape once it's populated. */}
      {[0, 1].map((i) => (
        <View key={i} style={styles.card}>
          <View style={styles.thumb}><Ionicons name={icon} size={34} color={colors.gold} style={styles.ghostIcon} /></View>
          <View style={[styles.bar, { width: '80%' }]} />
          <View style={[styles.bar, styles.barSmall, { width: '55%' }]} />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  thumb: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: spacing.md },
  caption: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, textAlign: 'center', lineHeight: 18 },
  ghostIcon: { opacity: 0.45 },
  bar: { height: 12, borderRadius: 6, backgroundColor: 'rgba(224,184,74,0.22)', marginTop: 8 },
  barSmall: { height: 10 },
});
