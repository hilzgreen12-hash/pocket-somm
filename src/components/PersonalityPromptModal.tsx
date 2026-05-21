import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { PersonalityCategory } from '../hooks/usePersonalityPrompt';

interface Props {
  visible: boolean;
  category: PersonalityCategory;
  onGenerate: () => void;
  onDismiss: () => void;
}

// Shown on the home screen when the user has done enough for a personality
// sketch they haven't generated yet. Dismissing only hides it for the
// session — it returns on the next app-open until they generate it.
export function PersonalityPromptModal({ visible, category, onGenerate, onDismiss }: Props) {
  const label = category === 'wine' ? 'Wine' : 'Foodie';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.body}>
            Thanks for all your input, you're ready for your personality sketch!
          </Text>

          <TouchableOpacity style={styles.generateBtn} onPress={onGenerate} activeOpacity={0.85}>
            <Text style={styles.generateBtnText}>Generate my {label} Personality</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterBtn} onPress={onDismiss} activeOpacity={0.7}>
            <Text style={styles.laterText}>Maybe later</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    borderWidth: 1.5,
    borderColor: colors.gold,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 420,
  },
  body: {
    fontFamily: fonts.bodyRegular,
    fontSize: 19,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: spacing.lg,
  },
  generateBtn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(212,176,96,0.10)',
  },
  generateBtnText: {
    fontFamily: fonts.headingBold,
    fontSize: 16,
    color: colors.gold,
    letterSpacing: 0.3,
  },
  laterBtn: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  laterText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
