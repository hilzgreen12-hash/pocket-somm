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
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.background },
        // Tab-bar labels — small 11pt navigation chips. Inter for
        // legibility at tiny sizes (Cormorant struggled below 14pt).
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tabs.Screen name="scan" options={{ title: 'List', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="chef" options={{ title: 'Chef', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="cellar" options={{ title: 'Cellar', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Community', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="welcome" options={{ href: null }} />
    </Tabs>
  );
}
