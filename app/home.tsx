import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { TabFooter } from '../src/components/TabFooter';
import { colors, spacing } from '../src/constants/theme';

// The four main destinations. The Profile tab was retired — its contents
// now live under About You, which sits in the fixed footer below.
const TILES = [
  { label: 'List', route: '/(tabs)/scan' },
  { label: 'Chef', route: '/(tabs)/chef' },
  { label: 'Cellar', route: '/(tabs)/cellar' },
  { label: 'Community', route: '/(tabs)/community' },
] as const;

export default function HomeScreen() {
  const { session } = useAuth();
  const username = (session?.user.user_metadata?.display_name ?? '').trim();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.appName}>Vinster</Text>
          <Text style={styles.welcome}>
            {username ? `Welcome, ${username}` : 'Welcome'}
          </Text>
        </View>

        <View style={styles.grid}>
          {TILES.map((tile) => (
            <TouchableOpacity
              key={tile.label}
              style={styles.tile}
              onPress={() => router.push(tile.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.tileText}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TabFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center' },
  hero: { alignItems: 'center', marginBottom: spacing.xxl },
  appName: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 44,
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: spacing.xs,
  },
  welcome: {
    fontFamily: 'CormorantGaramond_400Regular_Italic',
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  tile: {
    width: '48%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: colors.gold,
    letterSpacing: 1,
  },
});
