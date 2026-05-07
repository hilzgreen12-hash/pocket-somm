import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { TabFooter } from '../../src/components/TabFooter';
import { colors, spacing } from '../../src/constants/theme';

export default function WelcomeTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(60, height * 0.13);

  return (
    <View style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <Text style={styles.title}>Welcome to Vinster</Text>
      <Text style={styles.tagline}>Your personal AI sommelier</Text>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>List</Text>
        <Text style={styles.sectionDesc}>Scan or photograph a restaurant wine list and Vinster will recommend the best bottles for your taste, budget, and what you're eating.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chef</Text>
        <Text style={styles.sectionDesc}>Tell Vinster what you're cooking and it will recommend a wine pairing — or scan a wine label and receive chef-inspired recipe suggestions to match the bottle.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cellar</Text>
        <Text style={styles.sectionDesc}>Build and manage your personal wine collection. Scan labels to log bottles, track your stock, and maintain a wish list of wines you'd like to try.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Community</Text>
        <Text style={styles.sectionDesc}>Share wine and recipe discoveries, rate restaurants, and connect with fellow wine lovers. Coming soon.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.sectionDesc}>Set your wine and food preferences so Vinster's recommendations are always tailored to you. The more you tell us, the better the suggestions.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.button} onPress={() => router.replace('/welcome-profile')}>
          <Text style={styles.buttonText}>Set Up My Wine Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipButton} onPress={() => router.replace('/(tabs)/scan')}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
    <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.xs },
  tagline: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl },
  sectionTitle: { fontSize: 26, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginBottom: spacing.xs },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24 },
  buttonSection: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  skipButton: { alignItems: 'center', padding: spacing.md },
  skipText: { fontFamily: 'CormorantGaramond_400Regular', color: 'rgba(255,255,255,0.45)', fontSize: 14 },
});
