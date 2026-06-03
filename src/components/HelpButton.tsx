import { useState } from 'react';
import { Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// An underlined text link (e.g. "More About List") that sits beneath a tab's
// blurb. Tapping it opens a centered modal explaining how the AI on that tab
// actually works. Self-contained — drop one in below the blurb and pass the
// link label plus the modal title + body. (Replaced the old circled-"i" icon
// that used to sit next to the tab title.)

interface Props {
  label: string;
  title: string;
  body: string;
}

export function HelpButton({ label, title, body }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={styles.link}>{label}</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
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
  // Underlined link beneath the blurb — matched to the "View last result"
  // links (13pt, Inter/Spectral body, white, underlined, centred).
  link: {
    fontSize: 13,
    fontFamily: fonts.bodyRegular,
    color: colors.gold,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 460,
  },
  modalTitle: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.gold,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  bodyScroll: {
    maxHeight: 400,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 10,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: {
    fontFamily: fonts.headingSemibold,
    fontSize: 15,
    color: colors.gold,
    letterSpacing: 0.5,
  },
});
