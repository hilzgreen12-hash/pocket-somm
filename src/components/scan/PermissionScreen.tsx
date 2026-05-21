import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing, typography } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

interface Props {
  onRequest: () => void;
  // Override the default back behaviour (router.back) if a screen needs
  // to route elsewhere — e.g. back to the wine-storage form rather than
  // the OS-level previous view.
  onBack?: () => void;
}

export function PermissionScreen({ onRequest, onBack }: Props) {
  function handleBack() {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={handleBack}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>Camera Access</Text>
        <Text style={styles.bodyText}>Vinster needs your camera to scan wine lists.</Text>
        <TouchableOpacity style={styles.button} onPress={onRequest} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backRow: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  backLink: {
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  bodyText: {
    ...typography.body,
    fontFamily: fonts.bodyRegular,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: colors.gold,
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
