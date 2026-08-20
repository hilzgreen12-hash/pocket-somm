import { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { fetchRangeWineNote, type RangeWineNote } from '../api/label';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Tapping a wine in "The {producer} range" opens this — a short "inside line" on
// that wine plus its key technical details, fetched on demand. Shared by the
// scan intel card and the cellar wine card.
export function RangeWineNoteSheet({
  producer, wineName, region, visible, onClose,
}: {
  producer: string | null;
  wineName: string | null;
  region?: string | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<RangeWineNote | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!visible || !wineName) return;
    let active = true;
    setLoading(true); setNote(null); setFailed(false);
    fetchRangeWineNote({ producer, wineName, region })
      .then((r) => { if (!active) return; if (r) setNote(r); else setFailed(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [visible, wineName, producer, region]);

  const details = note ? [note.grape, note.region, note.style].filter(Boolean).join(' · ') : '';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title} numberOfLines={2}>{wineName ?? 'Wine'}</Text>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>Pulling the inside line…</Text>
            </View>
          ) : note ? (
            <ScrollView style={{ maxHeight: 320 }}>
              {details ? <Text style={styles.details}>{details}</Text> : null}
              <Text style={styles.note}>{note.note}</Text>
            </ScrollView>
          ) : failed ? (
            <Text style={styles.failed}>Vinster couldn't pull the inside line just now. Tap the wine again to retry.</Text>
          ) : null}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm, letterSpacing: 0.3 },
  details: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.3 },
  note: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted },
  failed: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, paddingVertical: spacing.md },
  closeBtn: { alignSelf: 'center', paddingVertical: spacing.sm, marginTop: spacing.md },
  closeText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
});
