import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

// The gold swirl shown inside a text field while Vinster is listening and
// working out what was said — the raw words and their corrections stay hidden
// until the finished text drops in. Place it inside the field's container.
export function DictationSwirl({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator color={colors.gold} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
