import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

interface Props {
  text: string;
}

export function RationaleBlock({ text }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sommelier's Note</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  label: {
    fontSize: 11,
    fontFamily: fonts.bodyBold,
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  text: {
    ...typography.body,
    fontFamily: fonts.bodyRegular,
    fontSize: 17,
    color: colors.text,
    lineHeight: 25,
  },
});
