import { forwardRef, useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

// A drop-in <TextInput> that always shows its value from the START (first
// word / first line) whenever it isn't being edited.
//
// React Native leaves a field scrolled to wherever the cursor last sat, so a
// long single-line value ends up scrolled right (you see the end of the name)
// and a long multiline value ends up scrolled down (you see ~2 lines in) —
// forcing the user to scroll back to read it from the beginning. Controlling
// `selection` to {0,0} while the field is blurred pins the scroll to the start;
// selection is released (uncontrolled) the moment it's focused, so typing and
// cursor placement are completely unaffected.
export const StartAlignedInput = forwardRef<TextInput, TextInputProps>((props, ref) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      ref={ref}
      {...props}
      selection={focused ? undefined : { start: 0, end: 0 }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
});

StartAlignedInput.displayName = 'StartAlignedInput';
