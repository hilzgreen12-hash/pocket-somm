import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

function BottleIcon({ color }: { color: string }) {
  return <MaterialCommunityIcons name="bottle-wine-outline" size={20} color={color} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        // The bottom bar is now a single app-wide component (AppBottomBar,
        // mounted in the root layout so it shows on every screen), so the
        // native per-tab bar is hidden to avoid a double bar.
        tabBarStyle: { display: 'none' },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="chef" options={{ title: 'Dine', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="cellar" options={{ title: 'Cellar', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="welcome" options={{ href: null }} />
    </Tabs>
  );
}
