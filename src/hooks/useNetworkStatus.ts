import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

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

// Coarse connection quality used to pre-flight the heavy image-upload actions
// (label scan, wine-list scan, lineup detect, cellar import). Deliberately
// optimistic: anything we can't positively classify as offline or weak falls
// through to 'ok', so an unknown NetInfo state never over-blocks a scan.
export type ConnectionQuality = 'offline' | 'weak' | 'ok';

// Derive the quality from a single NetInfo snapshot. 2g/3g cellular counts as
// 'weak' (large uploads routinely stall and then time out after 90s×retries);
// 4g/5g and wifi are 'ok'. No connection / unreachable internet is 'offline'.
export function qualityFromState(state: NetInfoState): ConnectionQuality {
  if (state.isConnected === false || state.isInternetReachable === false) return 'offline';
  if (state.type === 'cellular') {
    const gen = state.details?.cellularGeneration;
    if (gen === '2g' || gen === '3g') return 'weak';
  }
  return 'ok';
}

// Imperative one-shot read for a pre-flight check right before an upload (as
// opposed to the live hook above). Never throws — a failed probe returns 'ok'
// so we don't block on our own instrumentation.
export async function getConnectionQuality(): Promise<ConnectionQuality> {
  try {
    return qualityFromState(await NetInfo.fetch());
  } catch {
    return 'ok';
  }
}
