import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';

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
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.background },
        tabBarLabelStyle: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="scan" options={{ title: 'List', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="chef" options={{ title: 'Chef', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="cellar" options={{ title: 'Cellar', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="welcome" options={{ href: null }} />
      <Tabs.Screen name="label" options={{ href: null }} />
      <Tabs.Screen name="history" options={{ href: null }} />
    </Tabs>
  );
}
