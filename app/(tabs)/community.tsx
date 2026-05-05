import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { TabFooter } from '../../src/components/TabFooter';
import { colors, spacing } from '../../src/constants/theme';

export default function CommunityTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      <Text style={styles.title}>Community</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine, recipe, and restaurant reviews while connecting with friends, old and new.</Text>
        <Text style={styles.comingSoon}>(Coming Soon)</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Recipe Ratings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Wine Ratings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Restaurant Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Your Connections</Text>
        </TouchableOpacity>
      </View>

      <TabFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  comingSoon: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', textAlign: 'center' },
});
