import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing } from '../../src/constants/theme';

const TITLES: Record<string, string> = {
  recipe: 'Recipe Reviews',
  wine: 'Wine Reviews',
  restaurant: 'Restaurant Reviews',
};

const SUBTITLES: Record<string, string> = {
  recipe: 'Share your recipe pairings, see what other home cooks are loving, and find new ideas worth trying.',
  wine: 'Share the wines you\'ve loved, see what the community is drinking, and discover bottles worth seeking out.',
  restaurant: 'Share the restaurants you\'ve been to, read what the community thinks, and find your next great meal.',
};

export default function CommunityCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const key = (category ?? '').toLowerCase();
  const title = TITLES[key] ?? 'Reviews';
  const subtitle = SUBTITLES[key] ?? '';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <View style={styles.intro}>
          <Text style={styles.heading}>{title}</Text>
          {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/community/upload?category=${key}`)}>
            <Text style={styles.buttonText}>Upload your reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => router.push(`/community/search?category=${key}`)}>
            <Text style={styles.buttonText}>Search community reviews</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 32, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginTop: spacing.xs },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.md },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
});
