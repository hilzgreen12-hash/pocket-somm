import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { colors, spacing } from '../src/constants/theme';

interface Slide {
  badge: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    badge: 'List',
    title: 'Scan any wine list',
    body: 'Like the smoothest Somm, Vinster reads any restaurant list and offers three wines fitted to your taste, budget, and what you\'re eating. Sweat over your wine pairing no longer.',
  },
  {
    badge: 'Chef',
    title: 'Cook & Drink better',
    body: 'Tell Vinster what you\'re cooking and it offers you a wine, scan a label and it serves up three chef-inspired recipes.',
  },
  {
    badge: 'Cellar',
    title: 'Save & Track',
    body: 'Scan labels to input your wines and have your cellar stats all in one place — what you paid, what it\'s worth, when to drink it, and even where the heck it is in your home cellar.',
  },
  {
    badge: 'Personality + Community',
    title: 'Meet your gastronomic self & others',
    body: 'Vinster watches how you drink and what you eat not only to improve your recommendations, it sketches a witty character profile of you to share with friends and within the Vinster community.',
  },
];

export default function OnboardingTour() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { session } = useAuth();

  async function finish() {
    // Per-user flag so a fresh sign-up on a device that's previously seen
    // the tour still gets the tour for the new account.
    const userKey = session?.user.id ? `vinster_tour_seen_${session.user.id}` : 'vinster_tour_seen';
    await AsyncStorage.setItem(userKey, 'true');
    // After the tour, push the user straight into Wine Preferences in
    // onboarding mode — they'll then move on to Recipe Preferences and
    // finally land on the List tab. Bypasses the old welcome-profile step.
    router.replace('/profile/wine?onboarding=1');
  }

  function handleNext() {
    if (index === SLIDES.length - 1) {
      finish();
      return;
    }
    const nextIndex = index + 1;
    scrollRef.current?.scrollTo({ x: width * nextIndex, animated: true });
    setIndex(nextIndex);
  }

  function onScrollEnd(e: { nativeEvent: { contentOffset: { x: number } } }) {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  }

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Vinster</Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <Text style={styles.badge}>{slide.badge}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginTop: spacing.xl, marginBottom: spacing.lg },
  topBarSide: { flex: 1, alignItems: 'flex-end' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 38, color: '#FFFFFF', letterSpacing: 2, textAlign: 'center', flex: 1 },
  slide: { paddingHorizontal: spacing.xl, justifyContent: 'center' },
  badge: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center', marginBottom: spacing.lg },
  title: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 38, color: colors.text, letterSpacing: 0.5, lineHeight: 46, textAlign: 'center', marginBottom: spacing.lg },
  body: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: '#FFFFFF', textAlign: 'center', lineHeight: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: spacing.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.20)' },
  dotActive: { backgroundColor: colors.gold, width: 24 },
  footer: { paddingHorizontal: spacing.xl },
  nextButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  nextText: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 17, color: colors.gold, letterSpacing: 0.5 },
});
