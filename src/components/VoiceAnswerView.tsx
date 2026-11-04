import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Chat-style display for a Vinster voice reply, shared so every voice-command
// pop-up reads identically: a centred "Vinster Voice Command" header, the user's
// query echoed in a GOLD-outlined bubble indented LEFT, and Vinster's answer in a
// WHITE-outlined bubble indented RIGHT — like a text thread.
export function VoiceAnswerView({ query, answer }: { query?: string | null; answer: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>Chat with Vinster</Text>
      {query?.trim() ? (
        <View style={[styles.bubble, styles.queryBubble]}>
          <Text style={styles.queryText}>{query.trim()}</Text>
        </View>
      ) : null}
      <View style={[styles.bubble, styles.answerBubble]}>
        <Text style={styles.answerText}>{answer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.lg },
  header: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  bubble: { maxWidth: '88%', borderWidth: 1, borderRadius: 16, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  // User's query — gold outline, left, with a squared bottom-left corner (speech tail).
  queryBubble: { alignSelf: 'flex-start', borderColor: colors.gold, borderBottomLeftRadius: 4, backgroundColor: 'rgba(224,184,74,0.08)' },
  queryText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 21 },
  // Vinster's answer — white outline, right, squared bottom-right corner.
  answerBubble: { alignSelf: 'flex-end', borderColor: colors.borderWhite, borderBottomRightRadius: 4, backgroundColor: colors.surface },
  answerText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
});
