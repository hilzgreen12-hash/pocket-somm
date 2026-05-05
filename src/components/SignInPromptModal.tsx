import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSignIn: () => void;
  onCreateAccount: () => void;
  onContinue: () => void;
}

export function SignInPromptModal({ visible, onDismiss, onSignIn, onCreateAccount, onContinue }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onDismiss}>
        <TouchableOpacity style={styles.sheet} activeOpacity={1} onPress={() => {}}>
          <TouchableOpacity style={styles.close} onPress={onDismiss}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Get more from Vinster</Text>
          <Text style={styles.body}>
            Sign in to your account for advanced results tailoring and to archive and manage your results.
          </Text>

          <TouchableOpacity style={styles.signIn} onPress={onSignIn}>
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCreateAccount}>
            <Text style={styles.create}>Not registered? Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onContinue}>
            <Text style={styles.continueText}>Continue without an account</Text>
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
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
  },
  close: {
    alignSelf: 'flex-end',
    padding: 4,
    marginBottom: spacing.sm,
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
  },
  heading: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  body: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  signIn: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signInText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
  create: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: spacing.sm,
  },
  continueText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.sm,
    opacity: 0.6,
  },
});
