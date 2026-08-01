import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { showAlert } from './AppAlert';
import { LabelThumb } from './LabelThumb';
import { AddPhotoThumb } from './AddPhotoThumb';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { UnifiedReview } from '../utils/reviewModel';

// The single, source-agnostic review detail view. Restaurant, cellar and other
// reviews all open THIS screen. Styled to mirror the Your Wine Reviews landing
// cards: label thumbnail + wine name up top, a yellow "N Reviews · X Average
// Score" band framed by separator rules, then each saved entry (newest first)
// divided by rules — date · location, score with an inline "Drink:" window, and
// the review body. A chevron beside "Your Review" removes that entry.
function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export function ReviewDetailModal({
  review, visible, onClose, onAddReview, onEditLatest, onDeleteEntry, thumbPath, onAddPhoto,
}: {
  review: UnifiedReview | null;
  visible: boolean;
  onClose: () => void;
  onAddReview: () => void;
  onEditLatest: () => void;
  onDeleteEntry: (entryId: string) => Promise<void> | void;
  thumbPath?: string | null;
  onAddPhoto?: () => void;
}) {
  if (!review) return null;
  const { entries } = review; // newest first

  function confirmDelete(entryId: string) {
    showAlert({
      title: 'Delete this review?',
      body: 'This review will be permanently removed.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDeleteEntry(entryId);
            // Deleting the last remaining entry empties the review — close out.
            if (review!.count <= 1) onClose();
          },
        },
      ],
    });
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

        <ScrollView contentContainerStyle={styles.content}>
          {/* Header — mirrors the landing card: thumbnail left, wine name right. */}
          <View style={styles.headerRow}>
            {thumbPath ? (
              <LabelThumb path={thumbPath} fallbackText={review.title} style={styles.headerThumb} radius={5} frame={0} />
            ) : (
              <AddPhotoThumb style={styles.headerThumb} radius={5} onPress={() => onAddPhoto?.()} />
            )}
            <Text style={styles.wineName} numberOfLines={3}>{review.title}</Text>
          </View>

          {/* Yellow stats band, framed by separator rules. */}
          <View style={styles.rule} />
          <Text style={styles.stats}>
            {review.count} {review.count === 1 ? 'Review' : 'Reviews'}
            {review.averageScore != null ? ` · ${review.averageScore} Average Score` : ''}
          </Text>
          <View style={styles.rule} />

          {entries.map((e, i) => {
            const place = (e.location ?? '').trim();
            const meta = [fmtDate(e.dateIso), place].filter(Boolean).join(' · ');
            const editable = i === 0 && review.latestEditable;
            const drink = (e.drinkingWindow ?? '').trim();
            return (
              <View key={e.id} style={styles.entry}>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{meta || 'Latest entry'}</Text>
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

                {(e.note ?? '').trim() ? (
                  <>
                    <View style={styles.reviewHeadRow}>
                      <Text style={styles.sectionLabel}>Your Review</Text>
                      <TouchableOpacity
                        onPress={() => confirmDelete(e.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Delete this review"
                      >
                        <Text style={styles.chevron}>›</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.sectionBody}>{e.note}</Text>
                  </>
                ) : (
                  // No written note — still offer the delete chevron on its own row.
                  <View style={styles.reviewHeadRow}>
                    <Text style={styles.sectionLabelMuted}>No written review</Text>
                    <TouchableOpacity
                      onPress={() => confirmDelete(e.id)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      accessibilityLabel="Delete this review"
                    >
                      <Text style={styles.chevron}>›</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {(e.personalNotes ?? '').trim() ? (
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
  content: { padding: spacing.xl, paddingTop: 96, paddingBottom: 60 },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  headerThumb: { width: 54, height: 72 },
  wineName: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 19, color: colors.text, lineHeight: 25 },

  rule: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderLight },
  stats: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, paddingVertical: spacing.sm },

  entry: { paddingTop: spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, flex: 1 },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },

  scoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginTop: 6, marginBottom: spacing.sm },
  star: { fontSize: 18, color: colors.gold },
  score: { fontFamily: fonts.bodyBold, fontSize: 18, color: '#FFFFFF' },
  drink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },

  reviewHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  sectionLabelMuted: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  chevron: { fontFamily: fonts.bodyRegular, fontSize: 22, color: colors.gold, lineHeight: 22 },
  sectionBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  subSection: { marginTop: spacing.sm, marginBottom: spacing.xs },
});
