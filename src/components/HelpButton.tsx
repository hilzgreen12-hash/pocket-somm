import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Small gold-bordered "i" sat next to a tab title. Tapping opens a centered
// modal with a brief explanation of how the AI on that tab actually works.
// Self-contained — drop one in next to a title and pass title + body.

interface Props {
  title: string;
  body: string;
}

export function HelpButton({ title, body }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`How ${title.replace(/^How\s+/i, '').replace(/\s+works$/i, '')} works`}
      >
        <View style={styles.icon}>
          <Text style={styles.iconLetter}>i</Text>
        </View>
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
  // Small gold-outlined circle with an italic "i" — bespoke rather than a
  // Unicode glyph so it renders identically across iOS / Android.
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLetter: {
    fontFamily: fonts.headingItalic,
    fontSize: 14,
    color: colors.gold,
    lineHeight: 16,
    // Nudge the italic glyph optically into the circle's centre.
    marginTop: -1,
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
