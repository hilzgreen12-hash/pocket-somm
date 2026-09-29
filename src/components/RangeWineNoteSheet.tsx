import { Modal, View, Text, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchRangeWineNote } from '../api/label';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Tapping a wine in "The {producer} range" opens this — a short "inside line" on
// that wine plus its key technical details, fetched on demand. Shared by the
// scan intel card and the cellar wine card.
export function RangeWineNoteSheet({
  producer, wineName, region, tier, visible, onClose,
}: {
  producer: string | null;
  wineName: string | null;
  region?: string | null;
  // The wine's placement in the producer's range (Entry … Flagship) so the note
  // stays consistent with the range card.
  tier?: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  // Cache the inside line by wine identity so re-opening the same wine (even after
  // closing) is instant — Vinster generates it once, not on every open. staleTime
  // keeps it warm for the whole session (and well beyond).
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const enabled = visible && !!(wineName && wineName.trim());
  const { data: note, isFetching, isError } = useQuery({
    queryKey: ['range-wine-note', norm(producer), norm(wineName), norm(region), norm(tier)],
    queryFn: async () => {
      const r = await fetchRangeWineNote({ producer, wineName, region, tier });
      if (!r) throw new Error('no inside line'); // don't cache an empty result — let a retry re-fetch
      return r;
    },
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
  const loading = enabled && isFetching && note == null && !isError;
  const failed = enabled && isError && !isFetching;

  const details = note ? [note.grape, note.region, note.style].filter(Boolean).join(' · ') : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Tap-outside-to-close backdrop sits BEHIND the sheet so it never
            competes with the note's ScrollView for touch/scroll gestures. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          {producer ? <Text style={styles.producerLine} numberOfLines={1}>{producer}</Text> : null}
          <Text style={styles.title} numberOfLines={2}>{wineName ?? 'Wine'}</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>Pulling the inside line…</Text>
            </View>
          ) : note ? (
            <ScrollView
              style={styles.noteScroll}
              contentContainerStyle={styles.noteScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {details ? <Text style={styles.details}>{details}</Text> : null}
              <Text style={styles.note}>{note.note}</Text>
            </ScrollView>
          ) : failed ? (
            <Text style={styles.failed}>Vinster couldn't pull the inside line just now. Tap the wine again to retry.</Text>
          ) : null}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  noteScroll: { maxHeight: 340 },
  noteScrollContent: { paddingBottom: spacing.xs },
  producerLine: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: 2, letterSpacing: 0.3 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm, letterSpacing: 0.3 },
  details: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.3 },
  note: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  failed: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, paddingVertical: spacing.md },
  closeBtn: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.md },
  closeText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
});
