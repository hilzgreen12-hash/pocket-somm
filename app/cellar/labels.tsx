import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { LabelThumb } from '../../src/components/LabelThumb';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

export default function MyLabelsScreen() {
  useAuth();
  const { wines, isLoading } = useCellar();
  const { width } = useWindowDimensions();

  // Three tiles per row. Account for the grid's horizontal padding and the
  // gaps between tiles so the row never overflows the screen edge.
  const gap = spacing.sm;
  const tileWidth = (width - spacing.xl * 2 - gap * 2) / 3;
  const tileHeight = tileWidth * 1.3;

  const withPhotos = wines.filter((w) => w.label_image_path);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Label Library</Text>
        <View style={styles.headerSpacer} />
      </View>

      {withPhotos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No labels yet</Text>
          <Text style={styles.emptyBody}>Scan or photograph a wine and its label appears here.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listScroll}
          contentContainerStyle={styles.grid}
        >
          {withPhotos.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={[styles.tile, { width: tileWidth, marginRight: gap, marginBottom: gap }]}
              onPress={() => router.push(`/cellar/${w.id}`)}
              activeOpacity={0.7}
            >
              <LabelThumb
                path={w.label_image_path}
                fallbackText={w.wine_name}
                style={{ width: tileWidth, height: tileHeight }}
              />
              <Text style={styles.caption} numberOfLines={1}>{w.wine_name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  headerSpacer: { width: 40 },
  // Cormorant — page header
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  listScroll: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  // Inter — tile caption
  caption: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.text, marginTop: spacing.xs, alignSelf: 'stretch' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  // Cormorant — empty-state header
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Inter — empty body
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
});
