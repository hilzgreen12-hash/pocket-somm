import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuth';
import { useArchive } from '../hooks/useCellar';
import { useChosenWines } from '../hooks/useChosenWines';
import { wineHeaderLine } from '../utils/wineHeader';
import { sameWineIdentity } from '../utils/wineMatch';
import type { CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Cellar tab nudge, styled like Your Wine Reviews' "awaiting your review" pop-up:
// archived bottles (last 60 days) the user hasn't reviewed. Review Now opens the
// newest one's review; tapping a wine reviews that one; Review Later closes it
// until the next app open; Don't show me again turns it off for good.
const WINDOW_MS = 60 * 24 * 60 * 60 * 1000;
const MAX = 10;
let shownThisSession = false;

function hasReview(w: CellarWine): boolean {
  const any = w as any;
  return (Array.isArray(any.review_entries) && any.review_entries.length > 0)
    || !!(w.review_note && w.review_note.trim()) || !!(w.user_notes && w.user_notes.trim())
    || w.review_score != null || !!w.review_date;
}

export function ArchivedReviewPrompt() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const { wines: archived, isLoading } = useArchive();
  const { chosenWines } = useChosenWines();
  const [list, setList] = useState<CellarWine[] | null>(null);
  const [focused, setFocused] = useState(false);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const key = `vinster-archived-review-prompt-off:${userId ?? 'anon'}`;
  const checkedRef = useRef(false);

  const awaiting = useMemo(() => {
    const now = Date.now();
    const reviewedChosen = chosenWines.filter((c) => !!((c.tasting_note && c.tasting_note.trim()) || (c.other_observations && c.other_observations.trim()) || c.user_score != null));
    const picked: CellarWine[] = [];
    const recent = [...archived]
      .filter((w) => w.archived_at && now - new Date(w.archived_at).getTime() <= WINDOW_MS && !w.is_wishlist)
      .sort((a, b) => new Date(b.archived_at!).getTime() - new Date(a.archived_at!).getTime());
    for (const w of recent) {
      if (picked.length >= MAX) break;
      // Reviewed already (this entry, another archived entry of it, or a review).
      const same = archived.filter((x) => sameWineIdentity(x, w));
      if (same.some(hasReview)) continue;
      if (reviewedChosen.some((c) => sameWineIdentity({ producer: c.producer, wine_name: c.wine_name, vintage: c.vintage }, w))) continue;
      if (picked.some((p) => sameWineIdentity(p, w))) continue;
      picked.push(w);
    }
    return picked;
  }, [archived, chosenWines]);

  useEffect(() => {
    if (!userId || !focused || isLoading || shownThisSession || checkedRef.current || awaiting.length === 0) return;
    checkedRef.current = true;
    AsyncStorage.getItem(key)
      .then((off) => { if (!off && !shownThisSession) { shownThisSession = true; setList(awaiting); } })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, focused, isLoading, awaiting.length]);

  function review(w: CellarWine) {
    setList(null);
    router.push(`/wines/chosen?openCellarReviewInput=${w.id}` as any);
  }
  async function dontShowAgain() {
    try { await AsyncStorage.setItem(key, '1'); } catch { /* non-fatal */ }
    setList(null);
  }

  return (
    <Modal visible={!!list && focused} transparent animationType="fade" onRequestClose={() => setList(null)}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.close} onPress={() => setList(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7} accessibilityLabel="Close">
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>You've archived wines without a review:</Text>
          <Text style={styles.sub}>Select a wine to review it</Text>
          <ScrollView style={{ maxHeight: 280 }} alwaysBounceVertical={false}>
            {(list ?? []).map((w) => (
              <TouchableOpacity key={w.id} style={styles.row} onPress={() => review(w)} activeOpacity={0.7}>
                <Text style={styles.wine} numberOfLines={2}>{wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name || 'Wine'}</Text>
                {w.archived_at ? <Text style={styles.meta}>Archived {new Date(w.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text> : null}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.primary} onPress={() => list?.[0] && review(list[0])} activeOpacity={0.85}>
            <Text style={styles.primaryText}>Review Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={() => setList(null)} activeOpacity={0.7}>
            <Text style={styles.secondaryText}>Review Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dontShow} onPress={dontShowAgain} activeOpacity={0.7}>
            <Text style={styles.dontShowText}>Don't show me this again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Same look as Your Wine Reviews' awaiting-review prompt.
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 440 },
  close: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 10, padding: 6 },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.textMuted, lineHeight: 20 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
  sub: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  row: { paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
  wine: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, lineHeight: 22 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  primary: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  primaryText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  secondary: { alignItems: 'center', paddingTop: spacing.md },
  secondaryText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  dontShow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  dontShowText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
});
