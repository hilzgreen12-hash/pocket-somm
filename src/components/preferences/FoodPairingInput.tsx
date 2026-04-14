import { TextInput, StyleSheet } from 'react-native';
import { colors, spacing } from '../../constants/theme';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export function FoodPairingInput({ value, onChange }: Props) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder="e.g. rack of lamb, truffle risotto, grilled sea bass…"
      placeholderTextColor={colors.textMuted}
      multiline
      numberOfLines={2}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 70,
    textAlignVertical: 'top',
  },
});
