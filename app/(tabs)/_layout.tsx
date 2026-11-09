import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { prefetchCookbook } from '../../src/api/cookbookPrefetch';
import { fetchInvitesForMe } from '../../src/api/cellarMembers';
import { showAlert } from '../../src/components/AppAlert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

function BottleIcon({ color }: { color: string }) {
  return <MaterialCommunityIcons name="bottle-wine-outline" size={20} color={color} />;
}

// Invites already prompted for this app session (so the prompt shows once).
const promptedInvites = new Set<string>();

export default function TabsLayout() {
  // Shared cellar: when someone signs in with an email they've been invited
  // with, ask once whether they want to look at the invite.
  const { session } = useAuth();
  const userId = session?.user.id;
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    fetchInvitesForMe()
      .then((invites) => {
        const inv = invites.find((i) => i.status === 'pending' && !promptedInvites.has(i.id));
        if (cancelled || !inv) return;
        promptedInvites.add(inv.id);
        showAlert({
          title: 'Shared cellar invite',
          body: `${inv.owner_name ?? 'Someone'} has invited you to share their cellar.`,
          buttons: [
            { text: 'View Invite', onPress: () => router.push('/profile/share-cellar' as any) },
            { text: 'Later', style: 'cancel' },
          ],
        });
      })
      .catch(() => { /* table not there yet, or offline — try next time */ });
    return () => { cancelled = true; };
  }, [userId]);

  // Preload the Pair tab's cookbook (folders, counts, cover images) shortly
  // after launch so the carousel is ready before the tab is opened.
  const qc = useQueryClient();
  useEffect(() => {
    if (!userId) return;
    const t = setTimeout(() => { void prefetchCookbook(qc, userId); }, 1500);
    return () => clearTimeout(t);
  }, [userId, qc]);

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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Review', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="chef" options={{ title: 'Pair', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="cellar" options={{ title: 'Cellar', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="community" options={{ title: 'Share', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <BottleIcon color={color} /> }} />
      <Tabs.Screen name="welcome" options={{ href: null }} />
    </Tabs>
  );
}
