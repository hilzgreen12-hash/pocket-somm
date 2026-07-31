import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { UnifiedReview } from '../utils/reviewModel';

// The single, source-agnostic review detail view. Restaurant, cellar and other
// reviews all open THIS screen: the saved static entries newest-first, an
// "N Reviews · X Average Score" header, +Add Review (append a new entry), an Edit
// affordance on the newest entry while it's still within 24h, and Delete.
function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export function ReviewDetailModal({
  review, visible, onClose, onAddReview, onEditLatest, onDelete,
}: {
  review: UnifiedReview | null;
  visible: boolean;
  onClose: () => void;
  onAddReview: () => void;
  onEditLatest: () => void;
  onDelete: () => Promise<void> | void;
}) {
  if (!review) return null;
  const { entries } = review; // newest first

  function confirmDelete() {
    showAlert({
      title: 'Delete this review?',
      body: review!.count > 1
        ? `This review and its ${review!.count} entries will be permanently removed.`
        : 'This review will be permanently removed.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await onDelete(); onClose(); } },
      ],
    });
  }

  const Section = ({ label, value }: { label: string; value: string | null | undefined }) =>
    (value ?? '').trim() ? (
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{label}</Text>
        <Text style={styles.sectionBody}>{value}</Text>
      </View>
    ) : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={onAddReview} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
          <Text style={styles.addText}>+ Add Review</Text>
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{review.title}</Text>
          <Text style={styles.stats}>
            {review.count} {review.count === 1 ? 'Review' : 'Reviews'}
            {review.averageScore != null ? ` · ${review.averageScore} Average Score` : ''}
          </Text>

          {entries.map((e, i) => {
            const place = (e.location ?? '').trim();
            const meta = [fmtDate(e.dateIso), place].filter(Boolean).join(' · ');
            const editable = i === 0 && review.latestEditable;
            return (
              <View key={e.id} style={[styles.entry, i > 0 && styles.entryDivided]}>
                <View style={styles.entryHead}>
                  {meta ? <Text style={styles.meta}>{meta}</Text> : <Text style={styles.meta}>Latest entry</Text>}
                  {editable ? (
                    <TouchableOpacity onPress={onEditLatest} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.editLink}>Edit</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                {(e.favourite || e.score != null) ? (
                  <View style={styles.scoreRow}>
                    {e.favourite ? <Text style={styles.star}>★</Text> : null}
                    {e.score != null ? <Text style={styles.score}>{e.score} / 100</Text> : null}
                  </View>
                ) : null}
                <Section label="Your Review" value={e.note} />
                <Section label="Personal Notes" value={e.personalNotes} />
                <Section label="Drinking Window" value={e.drinkingWindow} />
              </View>
            );
          })}

          <TouchableOpacity style={styles.deleteLink} onPress={confirmDelete} activeOpacity={0.7}>
            <Text style={styles.deleteText}>Delete this review</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { position: 'absolute', top: 56, left: spacing.xl, zIndex: 10, padding: 4 },
  backText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.textMuted },
  addBtn: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, padding: 4 },
  addText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  content: { padding: spacing.xl, paddingTop: 96, paddingBottom: 60 },
  title: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3, lineHeight: 30 },
  stats: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', marginTop: 6, marginBottom: spacing.lg },
  entry: { marginBottom: spacing.md },
  entryDivided: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.sm },
  entryHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  meta: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, flex: 1 },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xs, marginBottom: spacing.sm },
  star: { fontSize: 18, color: colors.gold },
  score: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  section: { marginTop: spacing.sm },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginBottom: 4, letterSpacing: 0.3 },
  sectionBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  deleteLink: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.lg },
  deleteText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
});
