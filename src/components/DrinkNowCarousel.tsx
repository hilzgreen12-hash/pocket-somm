import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../hooks/useCellar';
import { effectiveMaturity } from '../utils/maturity';
import { WineCardThumb } from './WineCardThumb';
import { PlaceholderCardView, type PlaceholderCard } from './ExamplePlaceholder';
import { wineHeaderLine } from '../utils/wineHeader';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Example cards shown when the user has no bottles at last call yet.
const DRINK_NOW_EXAMPLES: PlaceholderCard[] = [
  { kind: 'label', producer: 'Charles Heidsieck', wineName: 'Brut Vintage', title: 'Charles Heidsieck 1995', stamp: 'Drink now · final year', overlay: 'Your first bottle to drink replaces this content' },
  { kind: 'label', producer: "Dow's", wineName: 'Vintage Port', title: "Dow's 1994", stamp: 'Drink by 2028', overlay: 'Your second bottle to drink replaces this content' },
  { kind: 'label', producer: 'Mas Doix', wineName: 'Doix', title: 'Mas Doix 2005', stamp: 'Drink by 2029', overlay: 'Your third bottle to drink replaces this content' },
];

// Only surface wines whose window closes within this many years — beyond that
// there's no urgency, so they'd just be noise here.
const WINDOW_HORIZON = 5;

// "Last Call — Drink Now": a wine that is drinkable NOW (at peak, or already
// declining) AND whose drinking window closes within the next 5 years (or has
// already closed). Wines still maturing (too young / approaching) or cruising
// well beyond 5 years are excluded — this carousel is only the bottles you
// should actually open soon.
function isLastCall(w: {
  drinking_window_from: number | null;
  drinking_window_to: number | null;
  drinking_window_status?: string | null;
}): boolean {
  const to = w.drinking_window_to;
  if (to == null) return false; // no close year → can't judge urgency
  const nowYear = new Date().getFullYear();
  if (to > nowYear + WINDOW_HORIZON) return false; // plenty of time left
  const status = effectiveMaturity(w);
  return status === 'peak' || status === 'declining'; // drinkable now, not still maturing
}

// Most urgent first — the soonest (or already-past) close year leads.
function byUrgency(
  a: { drinking_window_to: number | null },
  b: { drinking_window_to: number | null },
): number {
  return (a.drinking_window_to ?? 9999) - (b.drinking_window_to ?? 9999);
}

// Total for the "XX Wines at Last Call" stats line under the header.
export function useDrinkNowCount(): number {
  const { wines } = useCellar();
  return wines.filter(isLastCall).length;
}

// "Drink Now" — cellar bottles at last call, most urgent first. Tap → the wine.
export function DrinkNowCarousel() {
  const { wines } = useCellar();
  const nowYear = new Date().getFullYear();
  const urgent = wines.filter(isLastCall).sort(byUrgency);
  // Real bottles fill from the left, replacing placeholder tiles in order; the
  // remaining example tiles stay until there are at least three.
  const fill = urgent.length < DRINK_NOW_EXAMPLES.length ? DRINK_NOW_EXAMPLES.slice(urgent.length) : [];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
      {urgent.map((w) => {
        const to = w.drinking_window_to as number;
        const past = to < nowYear;
        const finalYear = to === nowYear;
        const meta = past ? `Drink now · past ${to}` : finalYear ? 'Drink now · final year' : `Drink by ${to}`;
        // Red "Last Call" pill only on the truly urgent (already declining or in
        // their final good year); the rest just show their drink-by year.
        const showBadge = past || finalYear;
        return (
          <TouchableOpacity key={w.id} style={styles.card} onPress={() => router.push(`/cellar/${w.id}` as any)} activeOpacity={0.85}>
            <View>
              <WineCardThumb path={w.label_image_path} producer={w.producer} wineName={w.wine_name} fallbackText={w.wine_name} />
              {showBadge ? (
                <View style={styles.badge}><Text style={styles.badgeText}>Last Call</Text></View>
              ) : null}
            </View>
            <Text style={styles.cardName} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
            <Text style={styles.cardMeta} numberOfLines={1}>{meta}</Text>
          </TouchableOpacity>
        );
      })}
      {fill.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.text, marginTop: 6, letterSpacing: 0.2 },
  cardMeta: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.4 },
  // Urgency pill, top-right of the thumbnail (red — distinct from the gold score badge).
  badge: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(18,11,10,0.82)', borderRadius: 8, borderWidth: 1, borderColor: colors.error, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.error, letterSpacing: 0.3 },
});
