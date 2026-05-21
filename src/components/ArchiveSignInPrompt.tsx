import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface Props {
  title?: string;
  body?: string;
}

// Shared empty-state for any archive / cellar surface that needs a signed-in
// account. Mirrors the pattern used in scan/history.tsx so the look is
// consistent everywhere a guest hits a private list.
export function ArchiveSignInPrompt({ title = 'Sign in to view this', body = 'Your account is needed to see this content.' }: Props) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      <TouchableOpacity style={styles.signInButton} onPress={() => router.push('/(auth)/sign-in')}>
        <Text style={styles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Empty-state body — Inter italic
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  signInButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  signInButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
