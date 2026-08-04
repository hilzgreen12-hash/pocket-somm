import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { runWsIdBackfill } from '../services/backfillWsIds';

// Bump the suffix to force a one-off re-run on every device (e.g. if the match
// query changes and we want existing rows re-resolved).
const FLAG = 'ws_id_backfill_v1_done';

// Mounts once at the app root. The first time a signed-in user opens this build,
// it stamps the canonical Wine-Searcher id onto their older labels / reviews /
// cellar wines so the id-only cross-linker (Label Library ↔ Your Wine Reviews ↔
// cellar) can connect them. Silent and non-blocking; runs exactly once per
// device (guarded by AsyncStorage). Renders nothing.
export function WsIdBackfillRunner() {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const started = useRef(false);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || started.current) return;
    started.current = true;

    void (async () => {
      try {
        if (await AsyncStorage.getItem(FLAG)) return;
        const result = await runWsIdBackfill(userId, {
          currency: preferences?.defaultCurrency ?? 'GBP',
        });
        await AsyncStorage.setItem(FLAG, '1');
        // Refresh the surfaces that read ws_wine_id so newly-stamped links appear
        // without an app restart.
        if (result.rowsUpdated > 0) {
          qc.invalidateQueries({ queryKey: ['labels', userId] });
          qc.invalidateQueries({ queryKey: ['chosen-wines', userId] });
          qc.invalidateQueries({ queryKey: ['cellar', userId] });
        }
        console.log('[ws-backfill] complete', result);
      } catch (e) {
        // Non-fatal — allow a retry on a later launch (flag stays unset).
        started.current = false;
        console.warn('[ws-backfill] failed', e);
      }
    })();
  }, [session?.user?.id, preferences?.defaultCurrency, qc]);

  return null;
}
