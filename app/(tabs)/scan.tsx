import { View, Text, ScrollView, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { LineupsCarousel } from '../../src/components/LineupsCarousel';
import { WineReviewsCarousel, RestaurantReviewsCarousel } from '../../src/components/ReviewCarousels';
import { useAwaitingReviewPrompt } from '../../src/hooks/useAwaitingReviewPrompt';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Your wine and restaurant reviews live here. Restaurants you record, and wines you pick from a restaurant's list, appear here automatically for you to review.

And Your Lineups — archive a night of wines with a photo, a note and the bottle list, to revisit and share your most epic wine exploits.`;

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  useAwaitingReviewPrompt();

  // Add a Lineup → photograph one now, or upload a photo from the library.
  function chooseLineupSource() {
    showAlert({
      title: 'Add a Lineup',
      buttons: [
        { text: 'Photograph a Lineup', onPress: () => router.push('/cellar/archive-night') },
        { text: 'Upload a Lineup', onPress: () => router.push('/cellar/archive-night?upload=1') },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // Top-right "+ Add" — choose which kind of review, then jump to that flow.
  function openAddReviewChooser() {
    showAlert({
      title: 'Add a Review',
      body: 'What would you like to review?',
      buttons: [
        { text: 'Add a wine review', onPress: () => router.push('/wines/chosen?addManual=1') },
        { text: 'Add a restaurant review', onPress: () => router.push('/restaurants/reviews?add=1') },
        { text: 'Add a Lineup', onPress: () => setTimeout(chooseLineupSource, 350) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <TabSwipeView style={styles.container}>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader />

      <View style={styles.titleRow}>
        <HelpTitle label="Review" title="How Review works" body={SCAN_HELP} textStyle={styles.appName} />
        <TouchableOpacity style={styles.addTopRight} onPress={openAddReviewChooser} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.addTopRightText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.topBlurb}>
          Your Wine and Restaurant reviews live here. Restaurants you save and bottles picked from their lists appear in these tabs automatically.
        </Text>
      </View>

      <View style={styles.headerDivider} />

      {/* Three carousels — Wine Reviews, Restaurant Reviews, Lineups — each with
          up to 8 of the latest and a View All link to its full page. */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Your Wine Reviews</Text>
      </View>
      <WineReviewsCarousel onViewAll={() => router.push('/wines/chosen')} />

      <View style={styles.carouselDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Your Restaurant Reviews</Text>
      </View>
      <RestaurantReviewsCarousel onViewAll={() => router.push('/restaurants/reviews')} />

      <View style={styles.carouselDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Your Lineups</Text>
        <Text style={styles.sketchBlurb}>
          A record of your most epic wine exploits.
        </Text>
      </View>
      <LineupsCarousel max={8} onViewAll={() => router.push('/cellar/lineups')} />
    </ScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  appName: { fontSize: 42, fontFamily: fonts.headingBold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  // "+ Add" pinned to the top-right of the title row so the title stays centred.
  addTopRight: { position: 'absolute', right: spacing.xl, top: 0, bottom: 0, justifyContent: 'center' },
  addTopRightText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },

  // Header separator: 18pt from the header's last line and 18pt below, as on Home.
  // Under a carousel: 18pt from the last caption line.
  carouselDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: 18 },
  headerDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: 14, marginBottom: 18 },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  // "Vinster's Review of You" section header + the "Your Personality Sketch"
  // sub-heading with its "what's this?" link.
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Elegant Cormorant, matching the Review header blurb above. Extra bottom
  // margin gives the alter-ego carousel room to breathe beneath it.
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 17, color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
});
