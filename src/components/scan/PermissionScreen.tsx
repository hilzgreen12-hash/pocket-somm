import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

interface Props {
  onRequest: () => void;
}

export function PermissionScreen({ onRequest }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Camera Access</Text>
      <Text style={styles.body}>Pocket Somm needs your camera to scan wine lists.</Text>
      <TouchableOpacity style={styles.button} onPress={onRequest}>
        <Text style={styles.buttonText}>Grant Permission</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontFamily: 'CormorantGaramond_700Bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.body,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.burgundy,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
  },
});
