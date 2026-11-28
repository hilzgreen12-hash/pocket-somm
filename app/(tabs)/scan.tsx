import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { HelpTitle } from '../../src/components/HelpTitle';
import { LineupsCarousel } from '../../src/components/LineupsCarousel';
import { WineReviewsCarousel, RestaurantReviewsCarousel } from '../../src/components/ReviewCarousels';
import { AwaitingReviewPrompt } from '../../src/components/AwaitingReviewPrompt';
import { ReorderableSections, mergeSectionOrder, useAutoScrollHost } from '../../src/components/ReorderableSections';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const SCAN_HELP = `Your wine and restaurant reviews live here. Restaurants you record, and wines you pick from a restaurant's list, appear here automatically for you to review.

And Your Lineups — archive a night of wines with a photo, a note and the bottle list, to revisit and share your most epic wine exploits.`;

// The Review carousels' order, arranged by the user (saved per device) — the
// same hold-and-drag grip as the Home tab.
const REVIEW_ORDER_KEY = 'review_section_order_v1';
const REVIEW_SECTION_DEFAULT = ['wines', 'restaurants', 'lineups'];

export default function ScanTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);

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

  const [order, setOrder] = useState<string[]>(REVIEW_SECTION_DEFAULT);
  const [scrollLocked, setScrollLocked] = useState(false);
  // Lets a carousel drag auto-scroll the page near the screen edges.
  const pageScroll = useAutoScrollHost();
  useEffect(() => {
    AsyncStorage.getItem(REVIEW_ORDER_KEY)
      .then((raw) => { if (raw) setOrder(mergeSectionOrder(JSON.parse(raw), REVIEW_SECTION_DEFAULT)); })
      .catch(() => {});
  }, []);
  function saveOrder(next: string[]) {
    setOrder(next);
    AsyncStorage.setItem(REVIEW_ORDER_KEY, JSON.stringify(next)).catch(() => {});
  }

  return (
    <TabSwipeView style={styles.container}>
      {/* Restaurants and wines awaiting review, once per app open. */}
      <AwaitingReviewPrompt />
    <GHScrollView {...pageScroll.scrollProps} style={{ flex: 1 }} scrollEnabled={!scrollLocked} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>

      <VinsterHeader blank />

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
          up to 8 of the latest and a View All link. Each title has a grip at its
          left indent; hold and drag to reorder (as on Home). Saved on this device. */}
      <View style={styles.sections}>
        <ReorderableSections
          order={order}
          onReorder={saveOrder}
          onDragActive={(on) => setScrollLocked(on)}
          autoScroll={pageScroll.host}
          headerStyle={styles.sectionHeader}
          separatorStyle={styles.sectionSeparator}
          sections={[
            {
              key: 'wines',
              title: 'Your Wine Reviews',
              content: <View style={styles.bleed}><WineReviewsCarousel onViewAll={() => router.push('/wines/chosen')} /></View>,
            },
            {
              key: 'restaurants',
              title: 'Your Restaurant Reviews',
              content: <View style={styles.bleed}><RestaurantReviewsCarousel onViewAll={() => router.push('/restaurants/reviews')} /></View>,
            },
            {
              key: 'lineups',
              title: 'Your Lineups',
              content: (
                <>
                  <Text style={styles.sketchBlurb}>A record of your most epic wine exploits.</Text>
                  <View style={styles.bleed}><LineupsCarousel max={8} onViewAll={() => router.push('/cellar/lineups')} /></View>
                </>
              ),
            },
          ]}
        />
      </View>
    </GHScrollView>
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
  // The reorderable carousels sit inside the page indent (as on Home); each
  // carousel bleeds back out to the screen edges.
  sections: { paddingHorizontal: spacing.xl },
  bleed: { marginHorizontal: -spacing.xl },
  sectionSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },
  headerDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: 14, marginBottom: 18 },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  topBlurb: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs, textAlign: 'center' },
  // "Vinster's Review of You" section header + the "Your Personality Sketch"
  // sub-heading with its "what's this?" link.
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  // Elegant Cormorant, matching the Review header blurb above. Extra bottom
  // margin gives the alter-ego carousel room to breathe beneath it.
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 17, color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: spacing.sm, paddingHorizontal: spacing.sm },
});
