import { useState } from 'react';
import { Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shown on the intel card / wine card when the bottle is a spirit (whisky, gin,
// rum, brandy…). Tap for a short note on why drinking windows / maturity don't
// apply. Mirrors NaturalWineBadge.
const SPIRIT_NOTE =
  'This bottle is a spirit, not a wine. Unlike wine, spirits are stable once bottled and don’t mature in the glass — so drinking windows and maturity ratings don’t apply.';

export function SpiritBadge() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.badge} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.badgeText} allowFontScaling={false}>Spirit</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>Spirit</Text>
            <Text style={styles.body}>{SPIRIT_NOTE}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setOpen(false)} activeOpacity={0.85}>
              <Text style={styles.closeText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 4, backgroundColor: 'rgba(224,184,74,0.10)', marginTop: spacing.sm },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.5, textTransform: 'uppercase' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.5 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 23, marginBottom: spacing.lg },
  closeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  closeText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
