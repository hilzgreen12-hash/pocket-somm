import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

export function FoodPairingInput({ value, onChange }: Props) {
  // Gold as soon as the field has content, so the user sees their entry
  // acknowledged immediately — even while typing, before they tap away —
  // mirroring how the other preference inputs confirm a selection.
  const confirmed = value.trim().length > 0;
  return (
    <TextInput
      style={[styles.input, confirmed && styles.inputConfirmed]}
      value={value}
      onChangeText={onChange}
      placeholder="e.g. rack of lamb, truffle risotto, grilled sea bass…"
      placeholderTextColor="rgba(255,255,255,0.25)"
      multiline
      numberOfLines={1}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 6,
    fontSize: 17,
    lineHeight: 23,
    fontFamily: fonts.bodyRegular,
    color: '#FFFFFF',
    minHeight: 44,
    textAlignVertical: 'top',
  },
  inputConfirmed: {
    color: colors.gold,
  },
});
