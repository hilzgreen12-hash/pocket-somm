import { useEffect, useState } from 'react';
import { TextInput, type StyleProp, type TextStyle } from 'react-native';
import { isoToDateInput, dateInputToIso, sanitizeDateInput, dateInputPlaceholder } from '../utils/dateFormat';

// A date field that STORES ISO ('YYYY-MM-DD') but shows the user their local
// format (DD/MM/YYYY, or MM/DD/YYYY in the US & Canada). Drop-in replacement
// for the old `<TextInput placeholder="YYYY-MM-DD" …>` date fields.
interface Props {
  valueIso: string | null | undefined;
  onChangeIso: (iso: string) => void;
  currency?: string | null;
  style?: StyleProp<TextStyle>;
  placeholderTextColor?: string;
  autoFocus?: boolean;
}

export function DateInput({ valueIso, onChangeIso, currency, style, placeholderTextColor, autoFocus }: Props) {
  const [text, setText] = useState(() => isoToDateInput(valueIso, currency));

  // Re-sync when the ISO value changes from OUTSIDE (e.g. the form is reset on
  // open) — but leave the field alone while the user is mid-edit (when the
  // current text already round-trips to the incoming value).
  useEffect(() => {
    setText((cur) => (dateInputToIso(cur, currency) === ((valueIso ?? '').slice(0, 10)) ? cur : isoToDateInput(valueIso, currency)));
  }, [valueIso, currency]);

  return (
    <TextInput
      style={style}
      value={text}
      onChangeText={(t) => {
        const clean = sanitizeDateInput(t);
        setText(clean);
        const iso = dateInputToIso(clean, currency);
        if (iso) onChangeIso(iso);
        else if (clean === '') onChangeIso('');
      }}
      placeholder={dateInputPlaceholder(currency)}
      placeholderTextColor={placeholderTextColor}
      keyboardType="numbers-and-punctuation"
      maxLength={10}
      autoFocus={autoFocus}
    />
  );
}
