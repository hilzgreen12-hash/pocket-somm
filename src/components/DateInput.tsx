import { useEffect, useRef, useState } from 'react';
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
  // Fired when the field loses focus — lets a screen save the date on blur.
  onEndEditing?: () => void;
}

const FULL_LENGTH = 10; // "DD/MM/YYYY"

// Typing into a date that's already full overwrites the digit after the cursor
// (stepping over a "/"), so one number can be changed in place — tap before the
// 7 in 17/11/2026, type 8 → 18/11/2026 — without clearing the field first.
function overtype(prev: string, next: string, cursor: number): string {
  if (prev.length < FULL_LENGTH || next.length !== prev.length + 1) return next;
  const typed = next[cursor];
  if (!typed || !/\d/.test(typed)) return prev;
  let target = cursor;
  if (prev[target] === '/') target += 1;
  if (target >= prev.length) return prev;
  return prev.slice(0, target) + typed + prev.slice(target + 1);
}

export function DateInput({ valueIso, onChangeIso, currency, style, placeholderTextColor, autoFocus, onEndEditing }: Props) {
  const [text, setText] = useState(() => isoToDateInput(valueIso, currency));
  // Where the cursor was before the latest keystroke (for overtyping).
  const cursorRef = useRef(0);

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
      onSelectionChange={(e) => { cursorRef.current = e.nativeEvent.selection.start; }}
      onChangeText={(t) => {
        const clean = sanitizeDateInput(overtype(text, t, cursorRef.current));
        setText(clean);
        const iso = dateInputToIso(clean, currency);
        if (iso) onChangeIso(iso);
        else if (clean === '') onChangeIso('');
      }}
      placeholder={dateInputPlaceholder(currency)}
      placeholderTextColor={placeholderTextColor}
      keyboardType="numbers-and-punctuation"
      // One over the full length, so a digit typed into a full date reaches
      // onChangeText and can overwrite in place.
      maxLength={FULL_LENGTH + 1}
      autoFocus={autoFocus}
      onEndEditing={onEndEditing}
    />
  );
}
