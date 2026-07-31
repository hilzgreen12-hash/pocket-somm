import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { showAlert } from './AppAlert';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

// Read-only "reflection" for a review that has passed its 24-hour edit window.
// Nothing is editable — it's a tidy record to re-read — but the user can still
// delete it. A review may have multiple dated entries (the original plus later
// "Add to this review" entries), shown oldest-first as one growing body.
function fmtDate(iso: string | null): string {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
}

export function ReviewReflectionModal({
  entries, visible, onClose, onDelete,
}: {
  entries: ChosenWine[];
  visible: boolean;
  onClose: () => void;
  onDelete: (entries: ChosenWine[]) => Promise<void> | void;
}) {
  if (!entries.length) return null;
  const head = entries[0];
  const title = [head.producer, head.wine_name, head.vintage ? String(head.vintage) : null].filter(Boolean).join(', ');
  // Oldest-first, so the review reads as a chronological log.
  const ordered = [...entries].sort((a, b) => new Date(a.chosen_at).getTime() - new Date(b.chosen_at).getTime());
  const multi = ordered.length > 1;

  function confirmDelete() {
    showAlert({
      title: 'Delete this review?',
      body: multi
        ? `This review and its ${ordered.length} entries will be permanently removed.`
        : 'This review will be permanently removed.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await onDelete(entries); onClose(); } },
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

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lockedTag}>Saved reflection · no longer editable</Text>
          <Text style={styles.title}>{title}</Text>

          {ordered.map((e, i) => {
            const place = [e.restaurant_name, e.city].map((s) => (s ?? '').trim()).filter(Boolean).join(', ');
            const meta = [fmtDate(e.chosen_at), place].filter(Boolean).join(' · ');
            return (
              <View key={e.id} style={[styles.entry, i > 0 && styles.entryDivided]}>
                {multi ? <Text style={styles.entryTag}>Entry {i + 1} of {ordered.length}</Text> : null}
                {meta ? <Text style={styles.meta}>{meta}</Text> : null}
                {(e.is_favourite || e.user_score != null) ? (
                  <View style={styles.scoreRow}>
                    {e.is_favourite ? <Text style={styles.star}>★</Text> : null}
                    {e.user_score != null ? <Text style={styles.score}>{e.user_score} / 100</Text> : null}
                  </View>
                ) : null}
                <Section label="Your Review" value={e.tasting_note} />
                <Section label="Personal Notes" value={e.other_observations} />
                <Section label="Drinking Window" value={e.user_drinking_window} />
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
  content: { padding: spacing.xl, paddingTop: 96, paddingBottom: 60 },
  lockedTag: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.md },
  title: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3, lineHeight: 30, marginBottom: spacing.lg },
  entry: { marginBottom: spacing.md },
  entryDivided: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg, marginTop: spacing.sm },
  entryTag: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  meta: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xs, marginBottom: spacing.sm },
  star: { fontSize: 18, color: colors.gold },
  score: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  section: { marginTop: spacing.sm },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, marginBottom: 4, letterSpacing: 0.3 },
  sectionBody: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  deleteLink: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.lg },
  deleteText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
});
