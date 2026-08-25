import { useState } from 'react';
import { Text, TouchableOpacity, Modal, ScrollView, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// The tab title, doubling as the "more about this tab" trigger: tapping it opens
// the same help modal the old "More About …" link used. Underlined to hint it's
// tappable. Replaces the separate HelpButton that used to sit beneath the blurb.
interface Props {
  label: string;   // the visible tab title, e.g. "Cellar"
  title: string;   // help modal title
  body: string;    // help modal body
  textStyle?: StyleProp<TextStyle>;  // the tab's own title text style
}

export function HelpTitle({ label, title, body, textStyle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label} — how it works`}
      >
        <Text style={[textStyle, styles.underline]}>{label}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>{title}</Text>
            <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.body}>{body}</Text>
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)} style={styles.button}>
              <Text style={styles.buttonText}>Got it</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  underline: { textDecorationLine: 'underline' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  bodyScroll: { maxHeight: 400 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.5 },
});
