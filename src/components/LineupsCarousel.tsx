import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { listLineupArchives, deleteLineupArchive, type LineupArchive } from '../api/lineups';
import { showAlert } from './AppAlert';
import { LineupThumb } from './LineupThumb';
import { PlaceholderCardView, type PlaceholderCard, placeholderLabelImages } from './ExamplePlaceholder';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Placeholder tiles shown until the user saves their first lineup — a faded row
// of bundled wine labels (a bottle lineup) under a scrim, mirroring the empty
// "Your Recent Scans" carousel.
const LINEUP_OVERLAY = 'Your first lineup appears here as you use Vinster';
const LINEUP_EXAMPLES: PlaceholderCard[] = [
  { kind: 'labelLineup', images: placeholderLabelImages(0, 4), title: 'Your Lineup', stamp: '20 Dec 2029 · La Steakhouse', overlay: LINEUP_OVERLAY },
  { kind: 'labelLineup', images: placeholderLabelImages(4, 4), title: 'Your Lineup', stamp: '18 Dec 2029 · At Home', overlay: LINEUP_OVERLAY },
  { kind: 'labelLineup', images: placeholderLabelImages(8, 4), title: 'Your Lineup', stamp: '02 Dec 2029 · The Cellar Door', overlay: LINEUP_OVERLAY },
];

// One lineup in the carousel — a large thumbnail with a date · location stamp.
function LineupCard({ item }: { item: LineupArchive }) {
  const qc = useQueryClient();
  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const place = (item.venue || item.city || '').trim();
  // Long-hold to permanently delete this lineup (photo + notes + wines).
  function confirmDelete() {
    showAlert({
      title: 'Delete this lineup?',
      body: `${item.name?.trim() || date}${place ? ` · ${place}` : ''} — this permanently removes the photo, note and wines. This can't be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteLineupArchive(item.id);
            qc.invalidateQueries({ queryKey: ['lineup-archives'] });
          } catch (err) {
            showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
          }
        } },
      ],
    });
  }
  return (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} onLongPress={confirmDelete} delayLongPress={450} activeOpacity={0.85}>
      <View style={styles.cardImageWrap}>
        <LineupThumb path={item.image_path} width={220} height={165} />
      </View>
      {item.name?.trim() ? <Text style={styles.cardName} numberOfLines={1} allowFontScaling={false}>{item.name.trim()}</Text> : null}
      <Text style={[styles.cardStamp, item.name?.trim() ? styles.cardStampTight : null]} numberOfLines={1} allowFontScaling={false}>{date}{place ? ` · ${place}` : ''}</Text>
    </TouchableOpacity>
  );
}

// "Your Lineups" — the Archive-a-Night thumbnail carousel, with an "Add a
// lineup" tile at the end. Self-contained (loads the user's lineups); pass
// requireAccount to gate the add action behind sign-in on account-only tabs.
export function LineupsCarousel({ requireAccount, max, showAdd = true }: { requireAccount?: (action: () => void) => void; max?: number; showAdd?: boolean }) {
  const { session } = useAuth();
  const userId = session?.user.id;
  const gate = requireAccount ?? ((a: () => void) => a());
  // "Add Lineup" chooser — Take a Photo (live camera) or Upload a Photo (library).
  const [addOpen, setAddOpen] = useState(false);
  const { data: lineups = [], isLoading } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });
  if (isLoading) return <View style={styles.loading}><ActivityIndicator color={colors.gold} /></View>;

  function startLineup(upload: boolean) {
    setAddOpen(false);
    router.push(upload ? '/cellar/archive-night?upload=1' : '/cellar/archive-night');
  }

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
        {(max ? lineups.slice(0, max) : lineups).map((l) => <LineupCard key={l.id} item={l} />)}
        {/* Empty state → three faded bottle placeholders (like the scan carousel). */}
        {lineups.length === 0 ? LINEUP_EXAMPLES.map((c, i) => <PlaceholderCardView key={`ph-${i}`} card={c} />) : null}
        {showAdd ? (
          <TouchableOpacity style={styles.addCard} onPress={() => gate(() => setAddOpen(true))} activeOpacity={0.85}>
            <Text style={styles.addCardIcon} allowFontScaling={false}>＋</Text>
            <Text style={styles.addCardText} allowFontScaling={false}>Add</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Add Lineup</Text>
            <Text style={styles.sheetBody}>Photograph your lineup now, or upload a photo you already have.</Text>
            <TouchableOpacity style={styles.optBtn} onPress={() => startLineup(false)} activeOpacity={0.85}>
              <Text style={styles.optText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optBtn, styles.optBtnMt]} onPress={() => startLineup(true)} activeOpacity={0.85}>
              <Text style={styles.optText}>Upload a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddOpen(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  loading: { paddingVertical: spacing.lg, alignItems: 'center' },
  carousel: { paddingHorizontal: spacing.xl, gap: spacing.md, paddingBottom: spacing.sm },
  card: { width: 220 },
  cardImageWrap: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderColor: colors.borderWhite, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cardImage: { width: 220, height: 165 },
  // Lineup title white; date · location gold beneath it.
  cardName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, marginTop: 6, letterSpacing: 0.3 },
  cardStamp: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, marginTop: 6 },
  cardStampTight: { marginTop: 2 },
  addCard: { width: 220, height: 165, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 6 },
  addCardIcon: { fontFamily: fonts.headingBold, fontSize: 30, color: colors.gold },
  addCardText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // "Add Lineup" chooser popup.
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  sheetTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.xs },
  sheetBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  optBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center' },
  optBtnMt: { marginTop: spacing.sm },
  optText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15 },
  cancelBtn: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 15 },
});
