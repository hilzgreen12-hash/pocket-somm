import { Fragment, useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, useWindowDimensions, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ScrollView as GHScrollView } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReorderableSections, mergeSectionOrder, useAutoScrollHost } from '../../src/components/ReorderableSections';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { HelpTitle } from '../../src/components/HelpTitle';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import { showAlert } from '../../src/components/AppAlert';
import { PlaceholderCardView, NAMED_LABELS, RESTAURANT_IMG, RESTAURANT_LANTERNS_IMG, RESTAURANT_GLASSES_IMG, type PlaceholderCard } from '../../src/components/ExamplePlaceholder';
import { Avatar, FeedTileView } from '../../src/components/community/CommunityCards';
import { useAuth } from '../../src/hooks/useAuth';
import { useCommunityMember } from '../../src/hooks/useCommunityMember';
import { FEED_KEY, getMyStats, isMember, listFeed, toTiles, type FeedTile } from '../../src/api/community';
import { confirmShareAll, withMembership } from '../../src/services/communityShare';
import { colors, spacing } from '../../src/constants/theme';
import { GATHER_LOCKED } from '../../src/constants/features';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const COMMUNITY_HELP = `Gather is the Vinster Community, where members share their wine and restaurant reviews, and meet the people behind them.

Share any of your reviews from Your Wine Reviews or Your Restaurant Reviews, or share all your wine reviews at once. Only your review, score and your own photo are shared — your private notes never are.

Vinster checks everything before it appears, and you can report anything that breaks the Gather guidelines.`;

const SOON_HELP = `Gather is the Vinster Community, where Vinster users will share wine reviews, restaurant finds and personality sketches with friends and the wider community.

It's not live yet. We're building it carefully so it stays warm and high-signal rather than noisy.`;

const OVERLAY = "Members' reviews appear here soon";
const WINE_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: [NAMED_LABELS.lynchBages], title: 'Château Lynch-Bages 2010', stamp: 'A member · 94/100', overlay: OVERLAY },
  { kind: 'labelCollage', images: [NAMED_LABELS.donnhoff], title: 'Dönnhoff Krötenpfuhl 2019', stamp: 'A member · 95/100', overlay: OVERLAY },
  { kind: 'labelCollage', images: [NAMED_LABELS.denisMortet], title: 'Denis Mortet Gevrey-Chambertin', stamp: 'A member · 92/100', overlay: OVERLAY },
];
// A member's whole set of reviews shared at once, shown as one tile.
const SHARED_SET_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelCollage', images: [NAMED_LABELS.rocDeCambes, NAMED_LABELS.tollotBeaut, NAMED_LABELS.munjebel, NAMED_LABELS.gruaudLarose], title: '50 Reviews', stamp: "Shared by She's Vinster", overlay: '' },
  { kind: 'labelCollage', images: [NAMED_LABELS.benditoDestino, NAMED_LABELS.denisMortet, NAMED_LABELS.donnhoff, NAMED_LABELS.lynchBages], title: '50 Reviews', stamp: "Shared by She's Vinster", overlay: '' },
];
const RESTAURANT_EXAMPLES: PlaceholderCard[] = [
  { kind: 'image', image: RESTAURANT_IMG, title: 'A neighbourhood bistro', stamp: 'A member · ★★★★★', overlay: OVERLAY },
  { kind: 'image', image: RESTAURANT_LANTERNS_IMG, title: 'A wine bar worth the trip', stamp: 'A member · ★★★★☆', overlay: OVERLAY },
  { kind: 'image', image: RESTAURANT_GLASSES_IMG, title: 'A list full of surprises', stamp: 'A member · ★★★★★', overlay: OVERLAY },
];

// The Gather carousels' order, arranged by the user (saved per device) — the
// same hold-and-drag grip as the Home tab.
const GATHER_ORDER_KEY = 'gather_section_order_v1';
const GATHER_SECTION_DEFAULT = ['wine', 'restaurant'];

export default function CommunityTab() {
  const { height } = useWindowDimensions();
  const paddingTop = Math.max(55, height * 0.095);
  const community = useCommunityMember();

  return (
    <TabSwipeView style={styles.container}>
      {community.enabled ? <CommunityHub paddingTop={paddingTop} /> : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20, paddingTop }}>
          <VinsterHeader />
          <View style={styles.titleRow}>
            <HelpTitle label="Gather" title="How the Community works" body={SOON_HELP} textStyle={styles.title} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine and restaurant reviews while connecting with friends, old and new.</Text>
          </View>
          <View style={styles.headerDivider} />
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Community Features Arriving Soon</Text>
            {['Wine Reviews', 'Restaurant Reviews', 'Your Connections'].map((t) => (
              <TouchableOpacity key={t} style={[styles.button, styles.buttonSoon]} disabled activeOpacity={1}>
                <Text style={styles.buttonText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </TabSwipeView>
  );
}

// The Community hub: your profile card, Share and Search, then carousels of
// the latest wine and restaurant reviews.
function CommunityHub({ paddingTop }: { paddingTop: number }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { member, shares, refreshShares } = useCommunityMember();
  const joined = isMember(member);
  const [refreshing, setRefreshing] = useState(false);
  const [order, setOrder] = useState<string[]>(GATHER_SECTION_DEFAULT);
  const [scrollLocked, setScrollLocked] = useState(false);
  // Lets a carousel drag auto-scroll the page near the screen edges.
  const pageScroll = useAutoScrollHost();
  useEffect(() => {
    AsyncStorage.getItem(GATHER_ORDER_KEY)
      .then((raw) => { if (raw) setOrder(mergeSectionOrder(JSON.parse(raw), GATHER_SECTION_DEFAULT)); })
      .catch(() => {});
  }, []);
  function saveOrder(next: string[]) {
    setOrder(next);
    AsyncStorage.setItem(GATHER_ORDER_KEY, JSON.stringify(next)).catch(() => {});
  }

  const { data: stats } = useQuery({
    queryKey: [FEED_KEY, 'my-stats', userId],
    enabled: !!userId && joined,
    queryFn: () => getMyStats(userId!),
  });
  const { data: wineTiles = [] } = useQuery({
    queryKey: [FEED_KEY, 'wine'],
    queryFn: async () => toTiles(await listFeed({ category: 'wine', limit: 20 })),
  });
  const { data: restaurantTiles = [] } = useQuery({
    queryKey: [FEED_KEY, 'restaurant'],
    queryFn: async () => toTiles(await listFeed({ category: 'restaurant', limit: 20 })),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: [FEED_KEY] });
    setRefreshing(false);
  }, [qc]);

  function openShareMenu() {
    showAlert({
      title: 'Share to Community',
      body: 'Open a review and tap Share Review, then Share to Community, or share all your wine reviews at once.',
      buttons: [
        { text: 'Your Wine Reviews', onPress: () => router.push('/wines/chosen') },
        { text: 'Your Restaurant Reviews', onPress: () => router.push('/restaurants/reviews') },
        {
          text: 'Share All My Wine Reviews',
          style: 'gold',
          onPress: () => { if (userId) void confirmShareAll(userId, member, new Set(shares.keys()), () => { refreshShares(); void qc.invalidateQueries({ queryKey: [FEED_KEY] }); }); },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const openTile = (tile: FeedTile) => tile.kind === 'review'
    ? router.push(`/community/post/${tile.item.id}` as any)
    : router.push(`/community/feed?bulkId=${tile.bulkId}&title=${encodeURIComponent(`Shared by ${tile.username ?? 'a member'}`)}` as any);

  return (
    <GHScrollView
      {...pageScroll.scrollProps}
      style={{ flex: 1 }}
      scrollEnabled={!scrollLocked}
      contentContainerStyle={{ paddingBottom: 40, paddingTop }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.gold} />}
    >
      {/* While Gather is locked the whole page shows, faded, and nothing on it
          can be used (scrolling still works). */}
      <View style={GATHER_LOCKED ? styles.locked : undefined} pointerEvents={GATHER_LOCKED ? 'none' : 'auto'}>
      <VinsterHeader />
      <View style={styles.titleRow}>
        <HelpTitle label="Gather" title="How the Community works" body={COMMUNITY_HELP} textStyle={styles.title} />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionDesc}>Be a part of the Vinster community, share and discover wine and restaurant reviews while connecting with friends, old and new.</Text>
      </View>
      <View style={styles.headerDivider} />

      {/* You: your Community profile, or an invitation to join. */}
      <View style={styles.section}>
        {joined && member ? (
          // Edited from You → Your Community Profile, not from here.
          <View style={styles.profileCard}>
            <Avatar path={member.avatar_path} name={member.username} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName} numberOfLines={1}>{member.username}</Text>
              <Text style={styles.profileStats}>
                {stats ? `${stats.shared} shared · ${stats.followers} ${stats.followers === 1 ? 'follower' : 'followers'} · ${stats.following} following` : ' '}
              </Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.joinCard} onPress={() => withMembership(member, () => {})} activeOpacity={0.85}>
            <Text style={styles.joinTitle}>Join the Community</Text>
            <Text style={styles.joinBody}>Choose your username and start sharing your reviews.</Text>
          </TouchableOpacity>
        )}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.button, styles.actionBtn]} onPress={openShareMenu} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Share Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.actionBtn]} onPress={() => router.push('/community/search')} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />
      {/* The two carousels — each title has a grip at its left indent; hold and
          drag to reorder (as on Home). Saved on this device. */}
      <View style={styles.sections}>
        <ReorderableSections
          order={order}
          onReorder={saveOrder}
          onDragActive={(on) => setScrollLocked(on)}
          autoScroll={pageScroll.host}
          headerStyle={styles.carouselHeader}
          separatorStyle={styles.sectionSeparator}
          sections={[
            {
              key: 'wine',
              title: 'Latest Wine Reviews',
              headerRight: wineTiles.length ? <ViewAll onPress={() => router.push('/community/feed?category=wine&title=Latest%20Wine%20Reviews' as any)} /> : null,
              content: <View style={styles.bleed}><Carousel tiles={wineTiles} examples={WINE_EXAMPLES} extras={SHARED_SET_EXAMPLES} showHint={false} onOpen={openTile} /></View>,
            },
            {
              key: 'restaurant',
              title: 'Latest Restaurant Reviews',
              headerRight: restaurantTiles.length ? <ViewAll onPress={() => router.push('/community/feed?category=restaurant&title=Latest%20Restaurant%20Reviews' as any)} /> : null,
              content: <View style={styles.bleed}><Carousel tiles={restaurantTiles} examples={RESTAURANT_EXAMPLES} onOpen={openTile} /></View>,
            },
          ]}
        />
      </View>
      </View>
    </GHScrollView>
  );
}

// "View All ›" at the right of a carousel title.
function ViewAll({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <Text style={styles.viewAll}>View All ›</Text>
    </TouchableOpacity>
  );
}

// A carousel of the latest shares. With nothing shared yet it shows three
// example tiles, like the other new-user carousels.
function Carousel({ tiles, examples, extras = [], showHint = true, onOpen }: {
  tiles: FeedTile[]; examples: PlaceholderCard[];
  // Example tiles placed straight after the first tile.
  extras?: PlaceholderCard[];
  // "Listed by recency · Swipe to view all →" under the carousel.
  showHint?: boolean;
  onOpen: (t: FeedTile) => void;
}) {
  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {tiles.length
          ? tiles.map((t, i) => (
            <Fragment key={t.kind === 'review' ? t.item.id : t.bulkId}>
              <FeedTileView tile={t} onPress={() => onOpen(t)} />
              {i === 0 ? extras.map((c, j) => <PlaceholderCardView key={`x${j}`} card={c} stampCaps />) : null}
            </Fragment>
          ))
          : examples.map((c, i) => (
            <Fragment key={i}>
              <PlaceholderCardView card={c} stampCaps />
              {i === 0 ? extras.map((x, j) => <PlaceholderCardView key={`x${j}`} card={x} stampCaps />) : null}
            </Fragment>
          ))}
      </ScrollView>
      {showHint ? <Text style={styles.hint}>Listed by recency · Swipe to view all →</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  locked: { opacity: 0.35 },
  title: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  // 18pt either side of every separator, app-wide.
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: 18 },
  headerDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: 14, marginBottom: 18 },
  section: { paddingHorizontal: spacing.xl, gap: spacing.sm },
  sectionDesc: { fontSize: 19, fontFamily: fonts.headingRegular, color: '#FFFFFF', lineHeight: 26, marginBottom: spacing.xs },
  sectionHeader: { fontSize: 22, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Carousel titles: as sectionHeader, with Home's spacing so the grip centres on the text.
  carouselHeader: { fontSize: 22, fontFamily: fonts.headingSemibold, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  buttonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  buttonSoon: { opacity: 0.5 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  profileName: { fontSize: 22, fontFamily: fonts.headingSemibold, color: '#FFFFFF' },
  profileStats: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  editLink: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.gold },
  joinCard: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', gap: 4 },
  joinTitle: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.gold },
  joinBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: '#FFFFFF', textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  actionBtn: { flex: 1 },
  // The reorderable carousels sit inside the page indent (as on Home); each
  // carousel bleeds back out to the screen edges.
  sections: { paddingHorizontal: spacing.xl },
  bleed: { marginHorizontal: -spacing.xl },
  sectionSeparator: { height: 1, backgroundColor: colors.divider, marginTop: 18, marginBottom: 18 },
  viewAll: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.xs },
  hint: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
});
