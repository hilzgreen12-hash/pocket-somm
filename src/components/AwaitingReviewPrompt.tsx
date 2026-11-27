import { useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useScanHistory, type RestaurantVisit } from '../hooks/useScanHistory';
import { useChosenWines, useWineReviewCards } from '../hooks/useChosenWines';
import { hasRestaurantReview, isRestaurantVisit, sessionsWithWines, UNNAMED_RESTAURANT } from '../utils/restaurantReview';
import { wineHeaderLine } from '../utils/wineHeader';
import type { ChosenWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Review tab: the restaurants and wines awaiting a review, listed with their
// dates. Tap one to review it — coming back to the Review tab reopens this list
// to pick another; ✕ on the left of a row takes it off the list; ✕ top right
// closes. Shown once per app open, until "Don't show me this again".
let shownThisOpen = false;
let resumeAfterReview = false;
const MAX = 15;

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;

type Row =
  | { kind: 'restaurant'; key: string; visit: RestaurantVisit }
  | { kind: 'wine'; key: string; pick: ChosenWine };

export function AwaitingReviewPrompt() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { awaiting, isLoading: winesLoading } = useWineReviewCards();
  const { archive, archiveLoading } = useScanHistory();
  const { chosenWines, dismissAwaiting } = useChosenWines();
  const loading = winesLoading || archiveLoading;

  const offKey = `vinster-awaiting-review-prompt-off:${userId}`;
  // Restaurants taken off this list with their ✕ (wines use the review list's
  // own "remove from Awaiting Review", which keeps them on their restaurant).
  const dismissedKey = `vinster-awaiting-restaurants-dismissed:${userId}`;
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!userId) return;
    AsyncStorage.getItem(dismissedKey)
      .then((v) => { try { setDismissed(new Set(JSON.parse(v ?? '[]'))); } catch { /* ignore */ } })
      .catch(() => {});
  }, [userId, dismissedKey]);

  const rows = useMemo<Row[]>(() => {
    const withWines = sessionsWithWines(chosenWines);
    const restaurants = archive
      .filter((a) => isRestaurantVisit(a, withWines) && !hasRestaurantReview(a) && !dismissed.has(a.id))
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt))
      .map((visit): Row => ({ kind: 'restaurant', key: `r-${visit.id}`, visit }));
    const wines = [...awaiting]
      .sort((a, b) => b.chosen_at.localeCompare(a.chosen_at))
      .map((pick): Row => ({ kind: 'wine', key: `w-${pick.id}`, pick }));
    return [...restaurants, ...wines].slice(0, MAX);
  }, [archive, awaiting, chosenWines, dismissed]);

  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => {
    setFocused(true);
    if (resumeAfterReview) { resumeAfterReview = false; setOpen(true); }
    return () => setFocused(false);
  }, []));

  // First visit to the Review tab this app open.
  useEffect(() => {
    if (!focused || shownThisOpen || loading || !userId || rows.length === 0) return;
    shownThisOpen = true;
    AsyncStorage.getItem(offKey).then((off) => { if (!off) setOpen(true); }).catch(() => {});
  }, [focused, loading, userId, rows.length, offKey]);

  function review(r: Row) {
    setOpen(false);
    resumeAfterReview = true;
    if (r.kind === 'restaurant') router.push(`/restaurants/reviews?openSession=${r.visit.id}` as any);
    else router.push(`/wines/chosen?openReview=${r.pick.id}&backTo=${encodeURIComponent('/(tabs)/scan')}` as any);
  }
  function remove(r: Row) {
    if (r.kind === 'wine') { dismissAwaiting.mutate(r.pick.id); return; }
    setDismissed((prev) => {
      const next = new Set(prev).add(r.visit.id);
      AsyncStorage.setItem(dismissedKey, JSON.stringify([...next])).catch(() => {});
      return next;
    });
  }
  function dontShowAgain() {
    AsyncStorage.setItem(offKey, '1').catch(() => {});
    setOpen(false);
  }

  return (
    <Modal visible={open && focused && rows.length > 0} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.close} onPress={() => setOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Awaiting Your Review</Text>
          <Text style={styles.sub}>Select one to review it</Text>
          <ScrollView style={{ maxHeight: 320 }} alwaysBounceVertical={false}>
            {rows.map((r) => {
              const name = r.kind === 'restaurant'
                ? (r.visit.restaurantName?.trim() || UNNAMED_RESTAURANT)
                : (wineHeaderLine(r.pick.producer, r.pick.wine_name, r.pick.vintage) || r.pick.wine_name || 'Wine');
              const where = r.kind === 'restaurant' ? r.visit.city?.trim() : r.pick.restaurant_name?.trim();
              const date = fmtDate(r.kind === 'restaurant' ? r.visit.capturedAt : r.pick.chosen_at);
              return (
                <View key={r.key} style={styles.row}>
                  <TouchableOpacity onPress={() => remove(r)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Remove from this list" style={styles.rowX}>
                    <Text style={styles.rowXText}>✕</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ flex: 1 }} onPress={() => review(r)} activeOpacity={0.7}>
                    <Text style={styles.kind}>{r.kind === 'restaurant' ? 'Restaurant' : 'Wine'}</Text>
                    <Text style={styles.name} numberOfLines={2}>{name}</Text>
                    <Text style={styles.meta} numberOfLines={1}>{[where, date].filter(Boolean).join(' · ')}</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.dontShow} onPress={dontShowAgain} activeOpacity={0.7}>
            <Text style={styles.dontShowText}>Don't show me this again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Same look as the Cellar tab's archived-wines prompt.
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 440 },
  close: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs, paddingHorizontal: spacing.lg },
  sub: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  rowX: { paddingHorizontal: 4 },
  rowXText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  kind: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  name: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, lineHeight: 22 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  dontShow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  dontShowText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
