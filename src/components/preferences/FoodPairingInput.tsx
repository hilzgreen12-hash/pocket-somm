import { TextInput, StyleSheet } from 'react-native';
import { fonts } from '../../constants/fonts';

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
});
