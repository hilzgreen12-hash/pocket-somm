import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { TabFooter } from '../../src/components/TabFooter';
import { colors, spacing } from '../../src/constants/theme';

export default function ProfileTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);
  const { session } = useAuth();

  if (!session) {
    return (
      <View style={[styles.guestContainer, { paddingTop }]}>
        <View style={styles.guestHero}>
          <Text style={styles.guestTitle}>Your Profile</Text>
          <Text style={styles.guestBody}>Set and review your profile settings. These will be the parameters that Vinster uses when making its wine list recommendations and recipe pairings for you.</Text>
        </View>
        <View style={styles.guestActions}>
          <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.guestSecondary} onPress={() => router.push('/(auth)/sign-up')}>
            <Text style={styles.guestSecondaryText}>Create Account</Text>
          </TouchableOpacity>
          <TabFooter />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60, paddingTop }}>

      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Vinster uses your profile preferences as it's default guide when generating recommendations for you — be as specific or open as you like.</Text>
        <Text style={styles.sectionDesc}>Based on your profile and account history Vinster can generate your gastronomic personalities, enjoy this special feature and share it with friends.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Wine Profile</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/profile/wine')}>
            <Text style={styles.buttonText}>Your Wine Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/wines/chosen')}>
            <Text style={styles.buttonText}>Your Wine Reviews</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/profile/personality?category=wine' as any)}>
          <Text style={styles.buttonText}>Your Wine Personality</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Chef Profile</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/profile/recipe')}>
            <Text style={styles.buttonText}>Your Recipe Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/recipes/chosen')}>
            <Text style={styles.buttonText}>Your Recipe Reviews</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/profile/personality?category=recipe' as any)}>
          <Text style={styles.buttonText}>Your Chef Personality</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Look back at the restaurants you've dined in — add your notes and share.</Text>
        <TouchableOpacity style={styles.buttonFull} onPress={() => router.push('/restaurants/reviews')}>
          <Text style={styles.buttonText}>Your Restaurants</Text>
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
  whiteBubble: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  whiteBubbleText: { fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, fontSize: 17 },
  guestContainer: { flex: 1, justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: 60, backgroundColor: colors.background },
  guestHero: { alignItems: 'center' },
  guestTitle: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, marginBottom: spacing.sm, textAlign: 'center' },
  guestBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.xl },
  guestActions: { width: '100%', gap: spacing.sm },
  guestSecondary: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  guestSecondaryText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15 },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.xs },
});
