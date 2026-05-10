import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/constants/theme';

const FEEDBACK_EMAIL = 'tellme@vinterapp.com';

const SECTIONS = [
  {
    title: 'How List Works',
    body: 'Point your camera at a restaurant wine list or upload a photo. Vinster reads the list using AI-powered optical character recognition, then scores every wine against your preferences — wine type, style, budget, and food pairing — before surfacing your best match.',
  },
  {
    title: 'How Recommendations Are Scored',
    body: 'Wines are ranked in this order:\n\n1. Average critic score, sourced via deep AI from respected global wine critics, calculated and delivered — wines below 85 are filtered out\n2. Vintage quality for the specific appellation\n3. Value for money vs. market price\n4. Application of your profile preferences, the more you input the more tailored the results',
  },
  {
    title: 'How Chef Works',
    body: 'Scan or upload a wine label and Vinster identifies the bottle. Our AI sommelier then generates three chef-inspired dishes, each crafted to complement the specific flavour profile of your wine — with a full recipe for each. Chef will apply any additional dietary needs or preferences that you have set in your profile.',
  },
  {
    title: 'How Cellar Works',
    body: 'Scan a label to add a bottle to your cellar. Vinster tracks your collection, records critic scores and drinking windows, and lets you know when each wine is approaching its peak — so you always open a bottle at the right time.',
  },
  {
    title: 'Personality Sketches',
    body: 'Vinster watches how you drink and what you eat, then sketches witty character profiles for you — separate Wine and Chef personalities drawn from your scans, cellar, ratings, and preferences. Share them with friends, post them to the Vinster community, or watch them evolve as your tastes broaden. Every sketch Vinster has ever drawn for you lives in your personality archive.',
  },
  {
    title: 'Your Preferences',
    body: 'The settings you save in your Profile are used as default parameters across List and Chef as you generate recommendations. You can override your preferences on each specific search you generate in List or Chef, depending on one-off requirements.',
  },
  {
    title: 'Privacy & Data',
    body: 'Your cellar, preferences, and scan history are stored securely in your personal account and never shared. Wine list images are processed by our AI and discarded immediately — they are not stored.',
  },
  {
    title: 'Powered By',
    body: 'Vinster uses Claude (Anthropic) for AI recommendations and recipe generation, and Supabase for secure data storage and authentication.',
  },
];

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>About Vinster</Text>
      <Text style={styles.intro}>Vinster is your AI sommelier — built to help you choose better wine, cook more inspired meals, and understand your collection.</Text>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}

      <View style={styles.feedbackSection}>
        <Text style={styles.feedbackHeading}>Get in touch</Text>
        <Text style={styles.feedbackBody}>
          We'd love to hear from you — send feedback to{' '}
          <Text style={styles.feedbackLink} onPress={() => Linking.openURL(`mailto:${FEEDBACK_EMAIL}`)}>
            {FEEDBACK_EMAIL}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 80, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  backButton: { marginBottom: spacing.xl },
  backText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.textMuted },
  heading: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.md },
  intro: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 26, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  sectionBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 24 },
  feedbackSection: { marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  feedbackHeading: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, marginBottom: spacing.xs, letterSpacing: 0.5 },
  feedbackBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 24 },
  feedbackLink: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', textDecorationLine: 'underline' },
});
