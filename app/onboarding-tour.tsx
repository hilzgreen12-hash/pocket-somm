import { useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/constants/theme';
import { fonts } from '../src/constants/fonts';

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

  function finish() {
    // After the tour, the consolidated onboarding setup page collects
    // the user's preferences and marks onboarding_completed — which is
    // what index.tsx checks to route returning users straight to /home.
    router.replace('/onboarding');
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
        <Image source={require('../assets/vinster-logo.png')} style={styles.brandLogo} resizeMode="contain" />
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
  topBar: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.lg },
  brandLogo: { width: 180, height: 130 },
  slide: { paddingHorizontal: spacing.xl, justifyContent: 'center' },
  // Slide eyebrow (List / Chef / …) — sized to match the title beneath it,
  // in gold Cormorant, per the onboarding brief.
  badge: { fontFamily: fonts.headingBold, fontSize: 38, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 44, textAlign: 'center', marginBottom: spacing.sm },
  title: { fontFamily: fonts.headingBold, fontSize: 38, color: colors.text, letterSpacing: 0.5, lineHeight: 46, textAlign: 'center', marginBottom: spacing.lg },
  // Slide body copy.
  body: { fontFamily: fonts.bodyItalic, fontSize: 19, color: '#FFFFFF', textAlign: 'center', lineHeight: 28 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: spacing.lg },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.20)' },
  dotActive: { backgroundColor: colors.gold, width: 24 },
  footer: { paddingHorizontal: spacing.xl },
  nextButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  nextText: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.gold, letterSpacing: 0.5 },
});
