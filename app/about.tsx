import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../src/constants/theme';

const FEEDBACK_EMAIL = 'tellme@vinsterapp.com';

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
    title: 'How Scan Works',
    body: 'Scan is your way in — and Vinster\'s home tab. Point the camera at a single wine label (or upload a photo) for instant Wine Intel: critic scores, tasting notes, drinking windows, and what the bottle is worth today — then save it straight to your reviews or your cellar. Scan a restaurant wine list and Vinster reads it with AI-powered optical character recognition, scores every wine against your preferences — wine type, style, budget, and food pairing — and surfaces your best match. Scan a lineup to add several bottles to your cellar at once, or to archive a night you\'ve drunk. No label to hand? Search a Wine finds the bottle in Vinster\'s catalogue, or you can type the details in yourself.',
    subsections: [
      {
        title: 'How Recommendations Are Scored',
        body: 'When Vinster scores a wine list, wines are ranked in this order:\n\n1. Average critic score, sourced via deep AI from respected global wine critics, calculated and delivered — wines below 85 are filtered out\n2. Vintage quality for the specific appellation\n3. Value for money vs. market price\n4. Application of your saved preferences — the more you input, the more tailored the results',
      },
    ],
  },
  {
    title: 'How Review Works',
    body: 'The Review tab is your record of everything you\'ve tasted. Every wine you pick from a restaurant\'s list and every restaurant you dine at is saved here automatically — as Your Wine Reviews and Your Restaurant Reviews — for you to rate and revisit any time. You can also add a wine or restaurant review by hand with + Add.',
  },
  {
    title: 'How Pair Works',
    body: 'Two ways to pair. Start with a wine and Vinster generates original, chef-inspired dishes crafted to its flavour profile — each with a full recipe; or start with a recipe and Vinster finds the wine to match, from your cellar or beyond. Either flow works around the dietary needs and preferences you set on the You tab (or adjust per search), and you can keep the recipes and pairing notes you love in Your Cookbook.',
  },
  {
    title: 'How Cellar Works',
    body: 'Scan a label or enter a wine by hand to add it to your cellar, and Vinster fills in the details on the spot — critic scores, drinking windows, grape variety, tasting notes, and what each bottle is worth today.\n\nBeyond tracking what you own, the Cellar gives you:\n\n• Your Wines At Home — virtual racks and fridges that mirror your real storage, so you always know where a bottle lives\n• Your Cellar Statistics — total bottles, what you paid versus what your cellar is worth today, and breakdowns by region and style\n• A per-bottle purchase price alongside Vinster\'s estimated current value\n• Personal notes and your own tasting reviews per bottle — dictated hands-free with Voice Command if you like\n• Your Wine Archive for bottles you\'ve drunk, gifted, or otherwise removed — with the date and a note on each\n• Drinking-window guidance so you always open a bottle at the right time',
    subsections: [
      {
        title: 'How Your Wines At Home Works',
        body: 'Set up racks and fridges under Your Wines At Home to mirror your real storage. Map each bottle to a slot so you can see at a glance where it lives, tap a bottle to view its notes, and move or remove it as you work your way through the cellar.',
      },
    ],
  },
  {
    title: 'Importing Your Cellar & Reviews',
    body: 'Already keep your wines or tasting notes somewhere else? Bring them into Vinster. From the Cellar tab you can import an existing cellar list from a photo, screenshot, or spreadsheet, and from Your Wine Reviews (+ Import) you can bring in your Vivino reviews or a review spreadsheet.\n\nA few things to know:\n\n• Files must be saved as CSV, and keep the top header row that names each column (Wine Name, Vintage, and so on)\n• Reviews land in Your Wine Reviews under a dated Import folder; if you\'ve rated the same wine several times, those tastings group into one wine card\n• Dates are read in your local format — day/month/year in the UK & Europe, month/day/year in the US & Canada\n• Importing brings in your wines and ratings only — Vinster generates the intel (critic scores, drinking windows, tasting notes, current value) when you open an individual wine, not all at once',
    subsections: [
      {
        title: 'How Vivino Scores Convert',
        body: 'Vivino rates on a 5-star scale; Vinster uses a 100-point scale. Your star rating is converted at 20 points per star, so your relative ranking is preserved exactly:\n\n5★ = 100   ·   4.5★ = 90   ·   4★ = 80\n3.5★ = 70   ·   3★ = 60   ·   2.5★ = 50\n\nThis is your own score, kept separate from the critic scores Vinster sources. If your file is already on a 0–100 scale, those scores are kept as they are.',
      },
    ],
  },
  {
    title: 'Vinster\'s Review of You',
    body: 'As you scan, cellar, rate, and cook, Vinster sketches your alter-ego — a witty character profile drawn from your tastes that grows and shifts as your palate broadens. You\'ll find it on the Review tab under "Vinster\'s Review of You": read it, share it with friends or the Vinster community, and browse every sketch Vinster has ever drawn for you.',
  },
  {
    title: 'Your Preferences',
    body: 'The wine and recipe preferences you save on the You tab — Your Wine Preferences and Your Recipe Requirements — are used as the default parameters across Scan and Pair whenever Vinster generates a recommendation. You can override them on any individual search, depending on your one-off requirements.',
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
        <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>About Vinster</Text>
      <Text style={styles.intro}>{`Vinster is an all-encompassing wine professional on the go. It is a sommelier at your table at restaurants, helping you choose a bottle based on your criteria. It will pair wines to dishes and vice versa, generating recipe ideas for you to explore and save to your cookbook. Vinster is the most comprehensive cellaring tool anywhere on the app stores, offering you a range of cellar and wine stats including Wine Searcher market values. You can review wines and the restaurants you drank them in while Vinster offers you up tongue in cheek personality sketches based on your engagement.`}</Text>
      <Text style={styles.introQuestion}>Why, you ask?</Text>
      <Text style={styles.founderBlurb}>{`When human passion and experience are combined with the capabilities of AI, amazing things can happen. Vinster is the result of exactly this, a wine professional and collector given the ability through AI to create their Wine & Food App of dreams where only her imagination is the limit.`}</Text>
      <Text style={styles.introLeadIn}>It's complex, I know, but it's worth getting to understand:</Text>

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
  introQuestion: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.5, marginBottom: spacing.md },
  founderBlurb: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 28, marginBottom: spacing.md },
  introLeadIn: { fontSize: 20, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 28, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl, paddingBottom: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  sectionBody: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 27 },
  // Subsection sits inside its parent section with no separator above it —
  // by design, since "How Recommendations Are Scored" reads as a subheading
  // under "How Scan Works" rather than a standalone section.
  subsection: { marginTop: spacing.lg },
  subsectionTitle: { fontSize: 17, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.5, marginBottom: spacing.sm, textTransform: 'uppercase' },
  privacyLinkRow: { paddingVertical: spacing.md, alignItems: 'center' },
  privacyLinkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold, letterSpacing: 0.5, textDecorationLine: 'underline' },
  feedbackSection: { marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  feedbackHeading: { fontSize: 19, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, marginBottom: spacing.xs, letterSpacing: 0.5 },
  feedbackBody: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 26 },
  feedbackLink: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', textDecorationLine: 'underline' },
});
