import { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { TabFooter } from '../../src/components/TabFooter';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { colors, spacing } from '../../src/constants/theme';

export default function ProfileTab() {
  const { height } = useWindowDimensions();
  // Profile content is dense (5 sections + footer) so we lift the header
  // close to the safe-area to keep everything on one viewport.
  const paddingTop = Math.max(40, height * 0.05);
  const { session } = useAuth();
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  function gated(route: string) {
    const proceed = () => router.push(route as any);
    if (session) {
      proceed();
      return;
    }
    pendingActionRef.current = proceed;
    setSignInPromptVisible(true);
  }

  function dismissSignInPrompt() {
    setSignInPromptVisible(false);
    pendingActionRef.current = null;
  }

  function continueWithoutAccount() {
    setSignInPromptVisible(false);
    const action = pendingActionRef.current;
    pendingActionRef.current = null;
    action?.();
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <Text style={styles.title}>Your Profile</Text>

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Vinster uses your profile preferences as it's default guide when generating recommendations for you — be as specific or open as you like.</Text>
        <Text style={styles.sectionDesc}>Based on your profile and account history Vinster can generate your gastronomic personalities, enjoy this special feature and share it with friends.</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Wine Profile</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => gated('/profile/wine')}>
            <Text style={styles.buttonText}>Your Wine Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => gated('/wines/chosen')}>
            <Text style={styles.buttonText}>Your Wine Reviews</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonFull} onPress={() => gated('/profile/personality?category=wine')}>
          <Text style={styles.buttonText}>Your Wine Personality</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.subheading}>Chef Profile</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => gated('/profile/recipe')}>
            <Text style={styles.buttonText}>Your Recipe Preferences</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonHalf} onPress={() => gated('/chef/archive?filter=favourites')}>
            <Text style={styles.buttonText}>Your Favourite Recipes</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.buttonFull} onPress={() => gated('/profile/personality?category=recipe')}>
          <Text style={styles.buttonText}>Your Chef Personality</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Look back at the restaurants you've dined in — add your notes and share.</Text>
        <TouchableOpacity style={styles.buttonFull} onPress={() => gated('/restaurants/reviews')}>
          <Text style={styles.buttonText}>Your Restaurants</Text>
        </TouchableOpacity>
      </View>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={dismissSignInPrompt}
        onSignIn={() => { dismissSignInPrompt(); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { dismissSignInPrompt(); router.push('/(auth)/sign-up'); }}
        onContinue={continueWithoutAccount}
      />
    </ScrollView>
    <TabFooter />
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 24, marginBottom: spacing.xs },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  buttonHalf: { flex: 1, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.xs, alignItems: 'center' },
  buttonFull: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center', marginBottom: spacing.xs },
});
