import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

// Live online/offline status. Starts optimistic (online) so nothing flashes on
// a normal launch; flips to offline only when NetInfo reports the connection is
// genuinely down. `isInternetReachable` is null while unknown, so only an
// explicit false (or no connection at all) counts as offline — avoids false
// "you're offline" flashes while reachability is still being probed.
export function useNetworkStatus(): boolean {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return () => unsubscribe();
  }, []);
  return online;
}
