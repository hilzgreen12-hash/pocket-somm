import { useState } from 'react';
import { Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Shown on the wine-intel card when the wine is a natural wine. Tap to read a
// short description of what natural wine is.
const NATURAL_WINE_NOTE =
  'Natural wine is made with minimal intervention from the winemaker, both in the vineyard and in the cellar. Grapes are grown either organically or biodynamically and wines are made using little to no preservatives and often bottled unfined and unfiltered. Some critics suggest that many new wave natural wines differ stylistically from conventional wines in that they can be wild and unpredictable.';

export function NaturalWineBadge() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.badge} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={styles.badgeText} allowFontScaling={false}>Natural Wine</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.title}>Natural Wine</Text>
            <Text style={styles.body}>{NATURAL_WINE_NOTE}</Text>
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
  // Compact gold pill, left-aligned beneath the wine identity.
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: 4, backgroundColor: 'rgba(224,184,74,0.10)', marginTop: spacing.sm },
  badgeText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, letterSpacing: 0.5, textTransform: 'uppercase' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md, letterSpacing: 0.5 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 23, marginBottom: spacing.lg },
  closeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  closeText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
