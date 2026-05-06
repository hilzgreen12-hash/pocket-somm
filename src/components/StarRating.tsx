import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

interface Props {
  value: number | null;
  onChange?: (value: number | null) => void;
  size?: number;
  /** Read-only — render stars without interaction. */
  readonly?: boolean;
}

const MAX = 5;

export function StarRating({ value, onChange, size = 24, readonly }: Props) {
  function handlePress(star: number) {
    if (readonly || !onChange) return;
    // Tapping the same star clears the rating; otherwise sets it.
    onChange(value === star ? null : star);
  }

  return (
    <View style={styles.row}>
      {Array.from({ length: MAX }, (_, i) => {
        const star = i + 1;
        const filled = value != null && star <= value;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => handlePress(star)}
            disabled={readonly}
            activeOpacity={readonly ? 1 : 0.6}
            hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
          >
            <Text style={[styles.star, { fontSize: size, color: filled ? colors.gold : 'rgba(255,255,255,0.18)' }]}>
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  star: { lineHeight: undefined },
});
