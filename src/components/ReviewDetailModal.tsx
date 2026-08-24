import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LabelThumb } from './LabelThumb';
import { AddPhotoThumb } from './AddPhotoThumb';
import { LabelPhotoViewer } from './LabelPhotoViewer';
import { WineIdentityHeader } from './WineIdentityHeader';
import { fetchVinsterReview } from '../api/label';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { UnifiedReview } from '../utils/reviewModel';

// The single, source-agnostic review detail view. Restaurant, cellar and other
// reviews all open THIS card. Layout: thumbnail + wine name, a rule, the stats
// band, then "View Vinster's Note" (collapsed — Vinster's own take, kept out of
// the user's OWN review), a rule, then each saved entry (newest first) — a large
// date · location stamp, a concise origin line, score + drink window, and the
// review body. Delete lives in Edit, not here; the latest entry is editable.
function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export function ReviewDetailModal({
  review, visible, onClose, onAddReview, onEditLatest, thumbPath, onAddPhoto,
  cellarBottles = 0, archiveBottles = 0, onShare, onNoteGenerated,
}: {
  review: UnifiedReview | null;
  visible: boolean;
  onClose: () => void;
  onAddReview: () => void;
  onEditLatest: () => void;
  onDeleteEntry?: (entryId: string) => Promise<void> | void;
  thumbPath?: string | null;
  onAddPhoto?: () => void;
  cellarBottles?: number;
  archiveBottles?: number;
  onShare?: () => void;
  // Called once when Vinster's Note is generated on demand, so the caller can
  // persist it to the row and never regenerate it.
  onNoteGenerated?: (note: string) => void;
}) {
  // "View Vinster's Note" is collapsed by default; the sommelier note is fetched
  // on demand (like the results card) when it wasn't saved on the wine.
  const [noteOpen, setNoteOpen] = useState(false);
  const [fetchedNote, setFetchedNote] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);

  // A new review opened → reset the collapsible + its fetched note.
  const reviewKey = review ? `${review.title}|${review.entries[0]?.id ?? ''}` : null;
  useEffect(() => { setNoteOpen(false); setFetchedNote(null); setNoteLoading(false); }, [reviewKey]);

  if (!review) return null;
  const { entries } = review; // newest first
  const intel = review.vinsterIntel;
  const savedNote = (intel.rationale ?? '').trim() || null;
  const displayNote = savedNote || fetchedNote;

  async function toggleNote() {
    const willOpen = !noteOpen;
    setNoteOpen(willOpen);
    if (!willOpen || savedNote || (fetchedNote && fetchedNote.length > 0) || noteLoading) return;
    setNoteLoading(true);
    try {
      const note = await fetchVinsterReview({
        producer: review!.producer,
        wineName: review!.wineName,
        region: review!.region,
        grape: review!.grape,
        vintage: review!.vintage,
      });
      setFetchedNote(note ?? '');
      // Persist it so re-opening the card is instant and never regenerates.
      if (note) onNoteGenerated?.(note);
    } finally {
      setNoteLoading(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
          <Text accessibilityLabel="Back" style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={onAddReview} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
          <Text style={styles.addText}>+ Add Review</Text>
        </TouchableOpacity>
        {onShare ? (
          <TouchableOpacity style={styles.shareBtn} onPress={onShare} hitSlop={{ top: 8, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={styles.shareText}>Export</Text>
          </TouchableOpacity>
        ) : null}
        {/* Centred card-type label — matches the Cellar wine card's gold chip so
            the two cards read as the same family. */}
        <Text style={styles.cardTypeLabel} pointerEvents="none">Wine Review</Text>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Header — thumbnail left, wine name right. Sits well clear of the
              back / Share controls above it. */}
          <View style={styles.headerRow}>
            {thumbPath ? (
              <TouchableOpacity onPress={() => setViewerOpen(true)} activeOpacity={0.85}>
                <LabelThumb path={thumbPath} fallbackText={review.title} style={styles.headerThumb} radius={5} frame={0} />
              </TouchableOpacity>
            ) : (
              <AddPhotoThumb style={styles.headerThumb} radius={5} onPress={() => onAddPhoto?.()} />
            )}
            <WineIdentityHeader
              producer={review.producer}
              wineName={review.wineName}
              vintage={review.vintage}
              region={review.region}
              grape={review.grape}
              align="left"
              size="lg"
              numberOfLinesName={3}
              containerStyle={styles.headerIdentity}
            />
          </View>

          <View style={styles.rule} />
          <View style={styles.statsBand}>
            <Text style={styles.stats}>
              {review.count} {review.count === 1 ? 'Review' : 'Reviews'}
              {review.averageScore != null ? ` · ${review.averageScore} Average Score` : ''}
            </Text>
            <Text style={styles.statsSub}>
              {cellarBottles} {cellarBottles === 1 ? 'Bottle' : 'Bottles'} in Your Cellar
              {' · '}
              {archiveBottles} {archiveBottles === 1 ? 'Bottle' : 'Bottles'} in Your Archive
            </Text>
          </View>

          {/* Vinster's own take — collapsed, off by default, separate from the
              diner's OWN review below. Sommelier note fetched on demand. */}
          <TouchableOpacity style={[styles.vinsterToggleRow, styles.vinsterToggleCentered]} onPress={toggleNote} activeOpacity={0.7}>
            <Text style={styles.vinsterToggleText}>View Vinster's Note</Text>
            <Ionicons name={noteOpen ? 'chevron-up-outline' : 'chevron-down-outline'} size={16} color={colors.gold} />
          </TouchableOpacity>
          {noteOpen ? (
            <View style={styles.vinsterBlock}>
              {intel.criticScore != null ? (
                <Text style={styles.vinsterField}><Text style={styles.vinsterLabel}>Critic Score · </Text>{intel.criticScore} pts</Text>
              ) : null}
              {intel.vintageAssessment ? (
                <Text style={styles.vinsterField}><Text style={styles.vinsterLabel}>Vintage · </Text>{intel.vintageAssessment.label}. {intel.vintageAssessment.notes}</Text>
              ) : null}
              {intel.rarityAssessment ? (
                <Text style={styles.vinsterField}><Text style={styles.vinsterLabel}>Rarity · </Text>{intel.rarityAssessment.label}. {intel.rarityAssessment.notes}</Text>
              ) : null}
              {noteLoading ? (
                <View style={styles.noteLoadingRow}>
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.noteLoadingText}>Pouring Vinster's Note…</Text>
                </View>
              ) : displayNote ? (
                <Text style={styles.vinsterField}><Text style={styles.vinsterLabel}>Sommelier's Note · </Text>{displayNote}</Text>
              ) : (
                <Text style={styles.noteRetry}>Vinster couldn't write this note just now — tap "View Vinster's Note" again to retry.</Text>
              )}
            </View>
          ) : null}

          <View style={styles.rule} />

          {entries.map((e, i) => {
            // The Location field ("Restaurant, home, other…") drives the single
            // origin line: when it's set we show "You had this wine at X" — no
            // "brought"/"purchased" wording. The date stands alone as the stamp.
            const place = (e.location ?? '').trim();
            const editable = i === 0 && review.latestEditable;
            const drink = (e.drinkingWindow ?? '').trim();
            return (
              <View key={e.id} style={styles.entry}>
                <View style={styles.metaRow}>
                  <Text style={styles.stamp}>{fmtDate(e.dateIso) || 'Latest entry'}</Text>
                  {editable ? (
                    <TouchableOpacity onPress={onEditLatest} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {(e.favourite || e.score != null || drink) ? (
                  <View style={styles.scoreRow}>
                    {e.favourite ? <Text style={styles.star}>★</Text> : null}
                    {e.score != null ? <Text style={styles.score}>{e.score} / 100</Text> : null}
                    {drink ? <Text style={styles.drink}>Drink: {drink}</Text> : null}
                  </View>
                ) : null}

                {place ? <Text style={styles.originLine}>You had this wine at {place}</Text> : null}

                {(e.note ?? '').trim() ? (
                  <Text style={styles.sectionBody}>{e.note}</Text>
                ) : null}

                {/* Cellar reviews keep their private note as the card-only
                    "Cellar Note", so it never appears here. */}
                {review.source !== 'cellar' && (e.personalNotes ?? '').trim() ? (
                  <View style={styles.subSection}>
                    <Text style={styles.sectionLabel}>Personal Notes</Text>
                    <Text style={styles.sectionBody}>{e.personalNotes}</Text>
                  </View>
                ) : null}

                <View style={styles.rule} />
              </View>
            );
          })}
        </ScrollView>
        {/* Full-screen zoomable viewer for the header thumbnail. */}
        <LabelPhotoViewer
          visible={viewerOpen}
          path={thumbPath}
          fallbackText={review.title}
          onClose={() => setViewerOpen(false)}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { position: 'absolute', top: 56, left: spacing.xl, zIndex: 10, padding: 4 },
  backText: { fontFamily: fonts.bodyRegular, fontSize: 22, color: colors.gold },
  addBtn: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, padding: 4 },
  addText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Share sits directly below "+ Add Review".
  shareBtn: { position: 'absolute', top: 84, right: spacing.xl, zIndex: 10, padding: 4, alignItems: 'flex-end' },
  shareText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // Centred gold card-type chip — same face/size/spacing as the Cellar card's.
  cardTypeLabel: { position: 'absolute', top: 58, left: 0, right: 0, textAlign: 'center', zIndex: 5, fontFamily: fonts.headingBold, fontSize: 16, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  // Extra top padding drops the header clear of the back / Share controls.
  content: { padding: spacing.xl, paddingTop: 128, paddingBottom: 60 },

  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  headerThumb: { width: 60, height: 76 },
  headerIdentity: { flex: 1 },

  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderLight },
  // Stats band + Vinster's Note are centred, matching the request.
  statsBand: { paddingVertical: spacing.sm, gap: 3, alignItems: 'center' },
  stats: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  statsSub: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },

  // View Vinster's Note — collapsible, sits between the stats band and the rule.
  vinsterToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  vinsterToggleCentered: { justifyContent: 'center' },
  vinsterToggleText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1.2 },
  vinsterBlock: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, gap: spacing.sm, backgroundColor: 'rgba(212,176,96,0.06)', marginBottom: spacing.sm },
  vinsterLabel: { fontFamily: fonts.bodyBold, color: colors.gold },
  vinsterField: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 21 },
  noteLoadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  noteLoadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  noteRetry: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, lineHeight: 20 },

  entry: { paddingTop: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  // Larger date · location stamp; concise origin line beneath it in white, smaller.
  stamp: { fontFamily: fonts.bodySemibold, fontSize: 17, color: colors.text, flex: 1 },
  originLine: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, marginTop: spacing.sm },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },

  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 8, marginBottom: spacing.sm },
  star: { fontSize: 18, color: colors.gold },
  score: { fontFamily: fonts.bodyBold, fontSize: 18, color: '#FFFFFF' },
  drink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },

  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  sectionBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  subSection: { marginTop: spacing.sm, marginBottom: spacing.xs },
});
