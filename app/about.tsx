import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/constants/theme';

const FEEDBACK_EMAIL = 'tellme@vinterapp.com';

interface Subsection {
  title: string;
  body: string;
}

interface Section {
  title: string;
  body: string;
  subsections?: Subsection[];
}

const SECTIONS: Section[] = [
  {
    title: 'How List Works',
    body: 'Point your camera at a restaurant wine list or upload a photo. Vinster reads the list using AI-powered optical character recognition, then scores every wine against your preferences — wine type, style, budget, and food pairing — before surfacing your best match. From your results screen you can also save a review of the wine you chose and a review of the restaurant you dined at — both kept in your archive for future reference.',
    subsections: [
      {
        title: 'How Recommendations Are Scored',
        body: 'Wines are ranked in this order:\n\n1. Average critic score, sourced via deep AI from respected global wine critics, calculated and delivered — wines below 85 are filtered out\n2. Vintage quality for the specific appellation\n3. Value for money vs. market price\n4. Application of your profile preferences, the more you input the more tailored the results',
      },
    ],
  },
  {
    title: 'How Chef Works',
    body: 'Scan or upload a wine label and Vinster identifies the bottle. Our AI sommelier then generates three chef-inspired dishes, each crafted to complement the specific flavour profile of your wine — with a full recipe for each. Chef will apply any additional dietary needs or preferences that you have set in your profile.',
  },
  {
    title: 'How Cellar Works',
    body: 'Scan a label or enter a wine manually to add it to your cellar. Vinster pulls in critic scores, drinking windows, grape variety, and tasting notes from a deep AI knowledge base — so every bottle you add is enriched on the spot.\n\nBeyond tracking what you own, the Cellar gives you:\n\n• A visual storage layout — map your bottles to virtual racks that mirror your real cellar\n• A Wish List for bottles you want to buy\n• Cellar Statistics — total bottles, total estimated value, condition breakdown, top regions, style breakdown\n• A per-bottle purchase price log alongside Vinster\'s estimated current value\n• Personal notes and your own tasting reviews per bottle\n• An archive for bottles you\'ve drunk, gifted, or otherwise removed — with the date and a note on each\n• Drinking-window alerts so you always open a bottle at the right time',
  },
  {
    title: 'Personality Sketches',
    body: 'Vinster watches how you drink and what you eat, then sketches witty character profiles for you — separate Wine and Foodie personalities drawn from your scans, cellar, ratings, saved recipes, and preferences. Share them with friends, post them to the Vinster community, or watch them evolve as your tastes broaden. Every sketch Vinster has ever drawn for you lives in your personality archive.',
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

const FOUNDER_BLURB = 'Vinster is entirely, much to great excitement and surprise, vibecoded by one mum of two young kids in her home office. With not much technical experience but a 20 year career in fine wine under her belt, the founder started with one niggling question: how can I guide people to feel more in control of their wine choices at restaurants? And the rest was an avalanche rather than a snowball.';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>About Vinster</Text>
      <Text style={styles.intro}>Vinster is your AI sommelier — built to help you choose better wine, cook more inspired meals, and understand your collection.</Text>

      <Text style={styles.founderBlurb}>{FOUNDER_BLURB}</Text>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
          {s.subsections?.map((sub) => (
            <View key={sub.title} style={styles.subsection}>
              <Text style={styles.subsectionTitle}>{sub.title}</Text>
              <Text style={styles.sectionBody}>{sub.body}</Text>
            </View>
          ))}
        </View>
      ))}

      <TouchableOpacity style={styles.privacyLinkRow} onPress={() => router.push('/legal/privacy')} activeOpacity={0.7}>
        <Text style={styles.privacyLinkText}>Privacy Policy →</Text>
      </TouchableOpacity>

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
  intro: { fontSize: 20, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 28, marginBottom: spacing.md },
  founderBlurb: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 28, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  sectionBody: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 27 },
  // Subsection sits inside its parent section with no separator above it —
  // by design, since "How Recommendations Are Scored" reads as a subheading
  // under "How List Works" rather than a standalone section.
  subsection: { marginTop: spacing.lg },
  subsectionTitle: { fontSize: 17, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase' },
  privacyLinkRow: { paddingVertical: spacing.md, alignItems: 'center' },
  privacyLinkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold, letterSpacing: 0.5, textDecorationLine: 'underline' },
  feedbackSection: { marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  feedbackHeading: { fontSize: 19, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, marginBottom: spacing.xs, letterSpacing: 0.5 },
  feedbackBody: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 26 },
  feedbackLink: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', textDecorationLine: 'underline' },
});
