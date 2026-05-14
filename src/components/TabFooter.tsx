import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { spacing } from '../constants/theme';

export function TabFooter() {
  const { session } = useAuth();

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/account')}>
        <Text style={styles.text}>About You</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/about')}>
        <Text style={styles.text}>About Vinster</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  button: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
  },
  text: {
    fontFamily: 'CormorantGaramond_400Regular',
    color: '#FFFFFF',
    fontSize: 14,
  },
});
