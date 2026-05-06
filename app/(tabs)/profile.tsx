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
        <Text style={styles.sectionDesc}>Vinster uses your profile settings as its default guide when making recommendations for you. Be as specific or open as you like — remember you will also be prompted to confirm certain settings with each individual search. If there is an occasion when you want to override your profile settings you must do so in this tab before you search.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Set your wine preferences to give Vinster strict parameters when making recommendations for you from wine lists or recommending a style for wine and food pairing recommendations.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/profile/wine')}>
            <Text style={styles.buttonText}>Your Wine Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/wines/chosen')}>
            <Text style={styles.buttonText}>Your Wine Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Set your food preferences along with dietary needs for Vinster to use as strict parameters when it's suggesting food pairings and recommending recipes for you.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/profile/recipe')}>
            <Text style={styles.buttonText}>Your Recipe Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/recipes/chosen')}>
            <Text style={styles.buttonText}>Your Recipe Reviews</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Look back at the restaurants where you've used Vinster — and your notes on them.</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => router.push('/restaurants/reviews')}>
            <Text style={styles.buttonText}>Your Restaurant Reviews</Text>
          </TouchableOpacity>
        </View>
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
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
});
