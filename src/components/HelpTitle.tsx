import { useState } from 'react';
import { Text, TouchableOpacity, Modal, ScrollView, StyleSheet, useWindowDimensions, type StyleProp, type TextStyle } from 'react-native';
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
  // Size the text area to the screen so longer help copy is never cut off
  // (it scrolls only if it truly can't fit).
  const { height: winH } = useWindowDimensions();

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
            <ScrollView style={{ maxHeight: Math.round(winH * 0.62) }} showsVerticalScrollIndicator>
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
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.5 },
});
