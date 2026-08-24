import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

interface Props {
  value: string;
  onChange: (text: string) => void;
}

// Free-text "preferred country of origin" for the wine picks — deliberately an
// input rather than a picker so any country (or a loose phrase like "somewhere
// Italian") is allowed. Mirrors FoodPairingInput's look: gold once it has
// content so the entry is acknowledged immediately.
export function PreferredCountryInput({ value, onChange }: Props) {
  const confirmed = value.trim().length > 0;
  return (
    <TextInput
      style={[styles.input, confirmed && styles.inputConfirmed]}
      value={value}
      onChangeText={onChange}
      placeholder="e.g. France, Italy, Australia…"
      placeholderTextColor="rgba(255,255,255,0.25)"
      autoCapitalize="words"
      autoCorrect={false}
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
