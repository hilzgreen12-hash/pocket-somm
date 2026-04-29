import { View, Text, StyleSheet } from 'react-native';
import { TabFooter } from '../../src/components/TabFooter';
import { colors, spacing } from '../../src/constants/theme';

function WhiteBubble({ title }: { title: string }) {
  return (
    <View style={styles.whiteBubble}>
      <Text style={styles.whiteBubbleText}>{title}</Text>
    </View>
  );
}

export default function CommunityTab() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.title}>Community</Text>
        <Text style={styles.subtitle}>View and leave community ratings and reviews on wines, recipes, and restaurants while connecting with friends, old and new.</Text>
        <Text style={styles.comingSoonHero}>(Coming Soon)</Text>
      </View>

      <View style={styles.actions}>
        <WhiteBubble title="Recipe Ratings" />
        <WhiteBubble title="Wine Ratings" />
        <WhiteBubble title="Restaurant Reviews" />

        <View style={styles.pinkBubble}>
          <Text style={styles.pinkBubbleText}>Your Connections</Text>
        </View>
      </View>

      <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.xl, paddingTop: 120 },
  hero: { alignItems: 'center', flex: 1 },
  brandName: { fontSize: 22, fontFamily: 'CormorantGaramond_400Regular_Italic', color: 'rgba(255,255,255,0.50)', letterSpacing: 1, marginBottom: spacing.xl },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5 },
  subtitle: { fontSize: 22, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, textAlign: 'center' },
  comingSoonHero: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: spacing.sm, textAlign: 'center' },
  actions: { gap: spacing.sm },
  whiteBubble: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  whiteBubbleText: { fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', fontSize: 17 },
  comingSoon: { fontFamily: 'CormorantGaramond_400Regular_Italic', color: 'rgba(255,255,255,0.45)', fontSize: 13 },
  pinkBubble: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  pinkBubbleText: { fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', fontSize: 17 },
  comingSoonPink: { fontFamily: 'CormorantGaramond_400Regular_Italic', color: 'rgba(255,255,255,0.65)', fontSize: 13 },
});
