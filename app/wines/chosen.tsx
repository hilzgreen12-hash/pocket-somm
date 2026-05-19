import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Share } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { EditChosenWineModal } from '../../src/components/EditChosenWineModal';
import { AddChosenWineModal } from '../../src/components/AddChosenWineModal';
import { showAlert } from '../../src/components/AppAlert';
import { ShareIcon } from '../../src/components/ShareIcon';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { useLabelStore } from '../../src/stores/labelStore';
import { prepareImageBase64, scanLabel } from '../../src/api/label';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { colors, spacing } from '../../src/constants/theme';
import type { ChosenWine, CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function locationLine(wine: ChosenWine): string {
  const parts = [wine.restaurant_name, wine.city].filter(Boolean);
  return parts.join(', ');
}

function formatListPrice(wine: ChosenWine): string | null {
  if (wine.menu_price == null) return null;
  const cur = (wine.currency ?? 'GBP').toUpperCase();
  const map: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$', NZD: 'NZ$', JPY: '¥', CHF: 'Fr', HKD: 'HK$', SGD: 'S$' };
  const sym = map[cur] ?? `${cur} `;
  return `${sym}${wine.menu_price}`;
}

function normKey(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase();
}

// Identity key for cross-referencing a review against wishlist/cellar
// rows — producer + name + vintage, normalised. Mirrors the matching
// used by reviewSync.
function wineIdentityKey(
  producer: string | null | undefined,
  wineName: string | null | undefined,
  vintage: string | number | null | undefined,
): string {
  return `${normKey(producer)}|${normKey(wineName)}|${normKey(vintage != null ? String(vintage) : '')}`;
}

type ReviewItem =
  | { source: 'restaurant'; date: string; score: number | null; wine: ChosenWine }
  | { source: 'cellar';     date: string; score: number | null; wine: CellarWine };

export default function ChosenWinesScreen() {
  const { chosenWines, isLoading, remove } = useChosenWines();
  const { wines: cellarWines, updateWine } = useCellar();
  const { wines: wishlistWines } = useWishList();
  const { setImage, setWineDetails, setError } = useLabelStore();
  const [editingWine, setEditingWine] = useState<ChosenWine | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  // "+ Add" opens a chooser first — Scan / Upload / Manual — then the
  // chosen path takes over (manual reuses the existing AddChosenWineModal;
  // scan + upload feed into the label flow with context=reviews).
  const [chooserOpen, setChooserOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'city' | 'score' | 'favourites'>('date');
  const [filterBy, setFilterBy] = useState<'all' | 'cellar' | 'restaurant'>('all');

  // Cellar wines that have ANY user-supplied review content count as a
  // "cellar review".
  const cellarReviews = cellarWines.filter((w) =>
    (w.user_notes && w.user_notes.trim().length > 0) ||
    w.review_score != null ||
    (w.review_location && w.review_location.trim().length > 0) ||
    !!w.review_date
  );

  const items: ReviewItem[] = [
    ...chosenWines.map((w): ReviewItem => ({ source: 'restaurant', date: w.chosen_at, score: w.user_score, wine: w })),
    ...cellarReviews.map((w): ReviewItem => ({ source: 'cellar', date: w.review_date ?? w.created_at, score: w.review_score, wine: w })),
  ];

  const filtered = filterBy === 'all' ? items : items.filter((i) => i.source === filterBy);

  // For city sort we read off the chosen_wines.city for restaurant
  // reviews; cellar reviews keep the location they were drunk at in the
  // free-text review_location. Rows with no city sort to the bottom.
  function cityFor(item: ReviewItem): string {
    if (item.source === 'restaurant') return (item.wine as ChosenWine).city?.trim() ?? '';
    return (item.wine as CellarWine).review_location?.trim() ?? '';
  }

  // Both ChosenWine and CellarWine carry an is_favourite flag, so the
  // favourites sort is the same logic on either side: favourites first,
  // tiebreak by date.
  function isFavourite(item: ReviewItem): boolean {
    return !!(item.wine as { is_favourite?: boolean }).is_favourite;
  }

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'favourites') {
      const af = isFavourite(a);
      const bf = isFavourite(b);
      if (af !== bf) return af ? -1 : 1;
    } else if (sortBy === 'score') {
      const ar = a.score ?? -1;
      const br = b.score ?? -1;
      if (ar !== br) return br - ar;
    } else if (sortBy === 'city') {
      const ac = cityFor(a).toLowerCase();
      const bc = cityFor(b).toLowerCase();
      const aEmpty = ac.length === 0;
      const bEmpty = bc.length === 0;
      if (aEmpty !== bEmpty) return aEmpty ? 1 : -1;
      const cmp = ac.localeCompare(bc);
      if (cmp !== 0) return cmp;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // A review's wine may also live in the wishlist or cellar. Match by
  // identity so each card can note when it was added there. date_received
  // is the user-set acquisition date; fall back to created_at when blank.
  const cellarByIdentity = new Map(
    cellarWines.map((w) => [wineIdentityKey(w.producer, w.wine_name, w.vintage), w] as const),
  );
  const wishlistByIdentity = new Map(
    wishlistWines.map((w) => [wineIdentityKey(w.producer, w.wine_name, w.vintage), w] as const),
  );

  function addedNote(item: ReviewItem): { kind: 'cellar' | 'wish list'; date: string } | null {
    if (item.source === 'cellar') {
      return { kind: 'cellar', date: item.wine.date_received ?? item.wine.created_at };
    }
    const key = wineIdentityKey(item.wine.producer, item.wine.wine_name, item.wine.vintage);
    const cellarMatch = cellarByIdentity.get(key);
    if (cellarMatch) return { kind: 'cellar', date: cellarMatch.date_received ?? cellarMatch.created_at };
    const wishMatch = wishlistByIdentity.get(key);
    if (wishMatch) return { kind: 'wish list', date: wishMatch.date_received ?? wishMatch.created_at };
    return null;
  }

  // Long-press a review to delete it. A restaurant review is its own
  // chosen_wines row, so it's deleted outright. A cellar review lives on
  // the cellar_wines row, so we only clear the review fields — the bottle
  // stays in the cellar.
  function handleLongPressReview(item: ReviewItem) {
    const w = item.wine;
    const label = wineHeaderLine(w.producer, w.wine_name, w.vintage);
    const onError = (err: unknown) => showAlert({
      title: 'Could not delete',
      body: err instanceof Error ? err.message : 'Please try again.',
    });
    showAlert({
      title: 'Delete review?',
      body: item.source === 'restaurant'
        ? `${label}\n\nThis permanently removes your review.`
        : `${label}\n\nThis clears your review — the bottle stays in your cellar.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete review',
          style: 'destructive',
          onPress: () => {
            if (item.source === 'restaurant') {
              remove.mutate(item.wine.id, { onError });
            } else {
              updateWine.mutate(
                {
                  id: item.wine.id,
                  updates: { user_notes: null, review_score: null, review_location: null, review_date: null },
                },
                { onError },
              );
            }
          },
        },
      ],
    });
  }

  const hasAnything = items.length > 0;

  // Hand a review to the native share sheet — wine identity + score +
  // location + the user's tasting note, formatted as plain text so it can
  // land cleanly into WhatsApp, Messages, email etc.
  async function handleShareReview(item: ReviewItem) {
    const w = item.wine;
    const header = wineHeaderLine(w.producer, w.wine_name, w.vintage);
    const scoreText = item.score != null ? `\nMy score: ${item.score}/100` : '';
    const locText = item.source === 'restaurant'
      ? locationLine(item.wine as ChosenWine)
      : (item.wine as CellarWine).review_location ?? '';
    const locFormatted = locText ? `\nWhere: ${locText}` : '';
    const note = item.source === 'restaurant'
      ? (item.wine as ChosenWine).tasting_note ?? ''
      : (item.wine as CellarWine).user_notes ?? '';
    const noteFormatted = note.trim() ? `\n\n"${note.trim()}"` : '';
    try {
      await Share.share({
        message: `${header}${scoreText}${locFormatted}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: header,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function handleChooseScan() {
    setChooserOpen(false);
    router.push('/label/camera?context=reviews');
  }

  function handleChooseManual() {
    setChooserOpen(false);
    setAddOpen(true);
  }

  // Gallery path — pick a photo, run it through the same OCR pipeline the
  // camera uses, then hand control to /label/confirm exactly as a live
  // capture would. Errors land on confirm so the user can edit details by
  // hand if scanLabel failed.
  async function handleChooseUpload() {
    setChooserOpen(false);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Photo access needed', body: 'Enable photo access in Settings to upload a wine label image.' });
        return;
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const uri = picked.assets[0].uri;
      setUploading(true);
      try {
        const base64 = await prepareImageBase64(uri);
        setImage(uri, base64);
        const details = await scanLabel(base64);
        setWineDetails(details);
        router.push('/label/confirm?context=reviews');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to scan label');
        router.push('/label/confirm?context=reviews');
      } finally {
        setUploading(false);
      }
    } catch (err) {
      showAlert({ title: 'Could not open photo', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <View style={styles.container}>
      <EditChosenWineModal
        wine={editingWine}
        visible={!!editingWine}
        onClose={() => setEditingWine(null)}
        onSaved={() => setEditingWine(null)}
      />

      <AddChosenWineModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => setAddOpen(false)}
      />

      <Modal visible={chooserOpen} transparent animationType="fade" onRequestClose={() => setChooserOpen(false)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooserOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>Add a review</Text>
            <Text style={styles.chooserBody}>How would you like to log this wine?</Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChooseScan} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Scan a label</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChooseUpload} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Upload screenshot or photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChooseManual} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>Manual input</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooserOpen(false)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen overlay while the chosen photo is being read. Sits
          above the screen so the user can't tap "+ Add" again mid-scan. */}
      {uploading ? (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadingText}>Reading the label…</Text>
        </View>
      ) : null}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wine Reviews</Text>
        <TouchableOpacity
          onPress={() => setChooserOpen(true)}
          hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
        >
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? null : !hasAnything ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyBody}>
            When you choose a wine from a Vinster recommendation, tap "Review This Wine" to record it here — or tap + Add at the top to enter a wine by hand. Notes you save on cellar wines also appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Sort:</Text>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'date' && styles.sortChipActive]}
              onPress={() => setSortBy('date')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'date' && styles.sortChipTextActive]}>Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'city' && styles.sortChipActive]}
              onPress={() => setSortBy('city')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'city' && styles.sortChipTextActive]}>City</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'score' && styles.sortChipActive]}
              onPress={() => setSortBy('score')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'score' && styles.sortChipTextActive]}>Top rated</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'favourites' && styles.sortChipActive]}
              onPress={() => setSortBy('favourites')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, sortBy === 'favourites' && styles.sortChipTextActive]}>Favourites</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sortRow}>
            <Text style={styles.sortLabel}>Show:</Text>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'all' && styles.sortChipActive]}
              onPress={() => setFilterBy('all')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'all' && styles.sortChipTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'cellar' && styles.sortChipActive]}
              onPress={() => setFilterBy('cellar')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'cellar' && styles.sortChipTextActive]}>Cellar wines</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, filterBy === 'restaurant' && styles.sortChipActive]}
              onPress={() => setFilterBy('restaurant')}
              activeOpacity={0.7}
            >
              <Text style={[styles.sortChipText, filterBy === 'restaurant' && styles.sortChipTextActive]}>Restaurant wines</Text>
            </TouchableOpacity>
          </View>

          {sorted.length === 0 ? (
            <View style={styles.emptyFilter}>
              <Text style={styles.emptyBody}>No reviews match this filter.</Text>
            </View>
          ) : (
            sorted.map((item) => {
              const w = item.wine;
              const onPress = item.source === 'restaurant'
                ? () => setEditingWine(item.wine as ChosenWine)
                : () => router.push(`/cellar/${(item.wine as CellarWine).id}?from=reviews` as any);
              const locText = item.source === 'restaurant'
                ? locationLine(item.wine as ChosenWine)
                : (item.wine as CellarWine).review_location ?? '';
              const note = addedNote(item);
              return (
                <TouchableOpacity
                  key={`${item.source}-${w.id}`}
                  style={styles.cardCompact}
                  onPress={onPress}
                  onLongPress={() => handleLongPressReview(item)}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardCompactRow}>
                    <Text style={styles.wineNameCompact} numberOfLines={2}>
                      {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    <View style={styles.scoreCluster}>
                      <View style={styles.scoreLine}>
                        {item.source === 'restaurant' && (item.wine as ChosenWine).is_favourite ? (
                          <Text style={styles.favouriteStar}>★</Text>
                        ) : null}
                        {item.score != null && (
                          <Text style={styles.scoreCompact}>{item.score}</Text>
                        )}
                      </View>
                      <TouchableOpacity
                        onPress={() => handleShareReview(item)}
                        // No-op long-press handler so the parent card's
                        // onLongPress (delete prompt) doesn't fire when
                        // the user holds the share icon for >400ms.
                        onLongPress={() => handleShareReview(item)}
                        delayLongPress={400}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        accessibilityRole="button"
                        accessibilityLabel="Share this review"
                      >
                        <ShareIcon />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {w.region ? <Text style={styles.regionText} numberOfLines={1}>{w.region}</Text> : null}
                  <View style={styles.cardCompactMetaRow}>
                    <Text style={styles.metaText}>{formatDate(item.date)}</Text>
                    {locText ? <Text style={styles.metaText} numberOfLines={1}> · {locText}</Text> : null}
                    {item.source === 'restaurant' && formatListPrice(item.wine as ChosenWine) ? (
                      <Text style={styles.metaText}> · {formatListPrice(item.wine as ChosenWine)}</Text>
                    ) : null}
                    <Text style={styles.metaText}> · {item.source === 'restaurant' ? 'Restaurant' : 'Cellar'}</Text>
                  </View>
                  {note ? (
                    <Text style={styles.addedNote}>
                      You added this to your {note.kind} on {formatDate(note.date)}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 40 },
  addLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.5, width: 50, textAlign: 'right' },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  cardCompact: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  cardCompactRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  cardCompactMetaRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  wineNameCompact: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, lineHeight: 22 },
  regionText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  scoreCompact: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  // Cluster sits as a column on the right: score (+ favourite star) at
  // the top, the white share icon below it.
  scoreCluster: { alignItems: 'flex-end', gap: spacing.xs },
  scoreLine: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  favouriteStar: { fontSize: 18, color: colors.gold },
  metaText: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  addedNote: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: spacing.xs },
  emptyFilter: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xs },
  sortLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginRight: spacing.xs },
  sortChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, paddingVertical: 4, paddingHorizontal: spacing.md },
  sortChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  sortChipText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  sortChipTextActive: { color: colors.gold },
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  chooserTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  chooserBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  chooserCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  uploadingText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
