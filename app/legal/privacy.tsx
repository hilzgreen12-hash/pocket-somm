import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../../src/constants/theme';

// Vinster privacy policy — in-app surface for the same text that must
// also be hosted at a public URL (e.g. https://vinsterapp.com/privacy)
// for the App Store / Play Store submission. Edit both together so they
// don't drift.

const POLICY_VERSION = 'Version 1.0 · Last updated May 2026';
const CONTACT_EMAIL = 'tellme@vinsterapp.com';

interface Section { title: string; body: string }

const SECTIONS: Section[] = [
  {
    title: 'Who we are',
    body: 'Vinster ("we", "us", "our") is an AI sommelier app that helps you choose better wine at restaurants, build a personal cellar, and discover recipes that pair with your bottles. This policy explains what data we collect when you use Vinster, why we collect it, and what your rights are.\n\nVinster is operated by [Your Full Legal Name], a sole trader based in the United Kingdom. You can contact us at the email address listed under "Contact us" below.',
  },
  {
    title: 'What we collect',
    body: 'Account details: your email address, password (hashed — we never see it in plain text), and any display name you choose.\n\nProfile preferences: wine preferences, recipe requirements, dietary needs, and any optional fields you fill in.\n\nContent you create: wines you add to your cellar, wish list and archive; tasting notes, restaurant reviews, scores, and photos you upload of wine lists or labels.\n\nAI-generated content: wine recommendations, recipes, drinking-window assessments, and personality sketches Vinster generates from your activity. These are stored on your account so you can revisit them.\n\nDevice and usage info: anonymous app version, OS version, and crash diagnostics provided by Expo / React Native.\n\nOptional location: when you write a wine review on Vinster, we may briefly use your device location (with your permission) to suggest a nearby city. We do not track or log your location otherwise.',
  },
  {
    title: 'How we use your data',
    body: 'To provide the service: storing your cellar, surfacing past scans, generating recommendations, building your personality sketches.\n\nTo personalise: the more you use Vinster, the better its AI knows your taste. Personalisation is per-account — your data is not used to train any shared model.\n\nTo communicate: account-related emails (password reset, sign-up confirmation) and very occasional product updates. We do not send marketing emails without your explicit opt-in.\n\nTo improve the app: aggregate, anonymous metrics on which features are used.',
  },
  {
    title: 'Third parties',
    body: 'We use a small number of carefully chosen third-party services to run Vinster.\n\nSupabase (database, authentication, file storage, edge function compute): your account and content are stored on Supabase\'s managed infrastructure. Supabase is GDPR-compliant; data is hosted in EU regions where available.\n\nAnthropic (Claude API): we send wine list photos, label photos, and short summaries of your profile and activity to Anthropic\'s Claude API to generate recommendations, recipes, and personality sketches. Anthropic does not retain this data for training under their API terms.\n\nExpo (build and update infrastructure): Vinster is built on the Expo platform. Expo collects anonymous crash and performance data.\n\nWe do not sell your data, ever.',
  },
  {
    title: 'AI and your data',
    body: 'Vinster uses Claude (an AI by Anthropic) to power its recommendations. When you scan a wine list, scan a wine label, or generate a recipe pairing, the photo and the relevant context (your preferences, the wine name, etc.) is sent to Claude\'s API for processing.\n\nThe responses Claude returns are stored on your account in our database.\n\nClaude does not learn from your specific inputs — Anthropic\'s API terms ensure your data is not used to train shared models. Photos you upload are processed by Claude and then discarded by our edge functions — they are not retained on our servers.',
  },
  {
    title: 'Age restriction',
    body: 'Vinster is intended for adults of legal drinking age (18 or older in the UK). On first launch we ask for your date of birth to confirm this. We do not knowingly collect data from anyone under 18. If you believe a minor has used Vinster, please contact us at the email below and we will delete the account.',
  },
  {
    title: 'Your rights',
    body: 'Under UK GDPR and other privacy laws, you have the right to:\n\n• Access the data we hold about you — request via email\n• Delete your account and all associated data — via the app (About You → Delete Account) or by emailing us\n• Export your data in a portable format — request via email\n• Correct inaccurate data — edit your profile in the app, or contact us\n• Withdraw consent for processing — by deleting your account\n• Object to certain types of processing or lodge a complaint with the UK ICO\n\nWe respond to data requests within 30 days.',
  },
  {
    title: 'Data retention',
    body: 'We keep your account data for as long as your account is active. When you delete your account, your data is removed from our primary database within 30 days. Encrypted backups may take up to 90 days to fully expire.',
  },
  {
    title: 'Security',
    body: 'All network requests are made over HTTPS. Passwords are hashed by Supabase Auth and are never seen in plain text by Vinster or its developers. Database access is gated by Supabase Row Level Security so users can only see their own data. No system is perfectly secure — if you become aware of a security issue, please contact us so we can investigate.',
  },
  {
    title: 'Changes to this policy',
    body: 'We may update this policy from time to time. Material changes will be flagged inside the app and through email where appropriate. The version number and "last updated" date at the top of this page will always reflect the current revision.',
  },
  {
    title: 'Contact us',
    body: `Questions, requests, or feedback — email us at ${CONTACT_EMAIL}. We read everything.`,
  },
];

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Privacy Policy</Text>
      <Text style={styles.versionLine}>{POLICY_VERSION}</Text>

      {SECTIONS.map((s) => (
        <View key={s.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{s.title}</Text>
          <Text style={styles.sectionBody}>{s.body}</Text>
        </View>
      ))}

      <View style={styles.contactSection}>
        <Text style={styles.contactBody}>
          Get in touch:{' '}
          <Text style={styles.contactLink} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            {CONTACT_EMAIL}
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
  heading: { fontSize: 36, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 1, marginBottom: spacing.xs },
  versionLine: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.xl },
  section: { marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, letterSpacing: 0.3 },
  sectionBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 24 },
  contactSection: { marginTop: spacing.md, padding: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, backgroundColor: 'rgba(212,176,96,0.06)' },
  contactBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 24 },
  contactLink: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', textDecorationLine: 'underline' },
});
