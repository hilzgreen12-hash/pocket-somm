import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// A full-screen message in Vinster's own style — a wine that can't be found, a
// lineup that no longer exists, a load that failed. Centred, with margins, a
// heading, a short explanation, one gold action and a way back, so a dead end
// never looks like a bare error.
type Action = { label: string; onPress: () => void };

export function MessageScreen({ title, body, action, secondary, onBack, busy }: {
  title: string;
  body?: string | null;
  // The main way forward (gold outlined button).
  action?: Action | null;
  // A quieter second option beneath it.
  secondary?: Action | null;
  // Back link at the foot; defaults to the previous screen. Pass null to hide.
  onBack?: (() => void) | null;
  // Show a spinner in place of the action (e.g. while retrying).
  busy?: boolean;
}) {
  const back = onBack === undefined ? (router.canGoBack() ? () => router.back() : null) : onBack;
  return (
    <View style={styles.screen}>
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.rule} />
        {body ? <Text style={styles.body}>{body}</Text> : null}
        {busy ? <ActivityIndicator color={colors.gold} style={styles.spinner} /> : action ? (
          <TouchableOpacity style={styles.button} onPress={action.onPress} activeOpacity={0.85} accessibilityRole="button">
            <Text style={styles.buttonText}>{action.label}</Text>
          </TouchableOpacity>
        ) : null}
        {secondary && !busy ? (
          <TouchableOpacity onPress={secondary.onPress} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button">
            <Text style={styles.secondary}>{secondary.label}</Text>
          </TouchableOpacity>
        ) : null}
        {back ? (
          <TouchableOpacity onPress={back} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityRole="button">
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', paddingHorizontal: spacing.xl },
  inner: { alignItems: 'center', gap: spacing.md },
  title: { fontFamily: fonts.headingSemibold, fontSize: 26, lineHeight: 32, color: colors.text, textAlign: 'center' },
  rule: { width: 120, height: 1, backgroundColor: 'rgba(224,184,74,0.6)' },
  body: { fontFamily: fonts.bodyRegular, fontSize: 17, lineHeight: 25, color: colors.text, textAlign: 'center' },
  spinner: { marginTop: spacing.sm },
  button: { marginTop: spacing.sm, borderWidth: 1.5, borderColor: colors.gold, borderRadius: 24, paddingVertical: 11, paddingHorizontal: spacing.xl, minWidth: 200, alignItems: 'center' },
  buttonText: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  secondary: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, textDecorationLine: 'underline' },
  back: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, marginTop: spacing.sm },
});
