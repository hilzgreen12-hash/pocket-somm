import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';
import { clearAllStores } from '../stores/clearAllStores';
import { getCellarContext, loadCellarContext, subscribeCellarContext } from '../api/cellarContext';
import { clearPersistedQueries, saveBigListsNow, savePersistedQueries, setPersistedQueryUser } from '../api/queryPersistence';
import { recordAccountActivity } from '../api/accountActivity';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const qc = useQueryClient();
  // Tracks the previously signed-in user so we can detect a real change.
  const prevUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    // When the signed-in user changes — a sign-out, or switching to a
    // different account — wipe the React Query cache. Otherwise one
    // account's cached data (e.g. chosen-wine reviews) lingers in memory
    // and bleeds into the next account, so the review dedup would flag a
    // wine the *previous* user reviewed. Skipped on first load (prev
    // undefined) so we don't needlessly clear a freshly-restored session.
    function syncUser(next: Session | null) {
      const nextUserId = next?.user.id ?? null;
      if (prevUserId.current !== undefined && prevUserId.current !== nextUserId) {
        // Stop saving first, so the wipe below can't be written over the
        // next user's saved lists; then delete the previous user's saved copy
        // (see queryPersistence) so it can't be restored on this device again.
        setPersistedQueryUser(null);
        if (prevUserId.current) clearPersistedQueries(prevUserId.current);
        qc.clear();
        // The Zustand stores live in module scope and survive sign-out, so
        // clearing only the React Query cache left the previous account's
        // state in memory — signing in as another user and tapping "View
        // last result" showed their wines. lastIntelStore also persists to
        // AsyncStorage under a global key, so it survived restarts too.
        clearAllStores();
        // Clear the city autocomplete history (global key) and the LEGACY
        // base scan-history key on account switch. Scan history is now stored
        // per-user (vinster_scan_history_<userId>, see useScanHistory) so a
        // user's "View Last Result" persists across sign-out/in and app
        // updates; those scoped keys are intentionally NOT removed here, and
        // wiping the old base key just cleans up pre-scoping data.
        AsyncStorage.multiRemove(['vinster_scan_history', 'vinster_city_history']).catch(() => {});
      }
      // Shared household cellar: work out whose cellar this user is in. Loaded
      // whenever the user changes (incl. first load); a change refetches all
      // cellar data via the subscription below.
      if (prevUserId.current !== nextUserId) {
        void loadCellarContext(nextUserId);
        setPersistedQueryUser(nextUserId);
      }
      prevUserId.current = nextUserId;
      if (nextUserId) void recordAccountActivity(nextUserId);
      setSession(next);
    }

    // `loading` gates the whole app (app/index.tsx renders null while true),
    // so it MUST be cleared on the failure path too. A rejected getSession —
    // corrupt stored token, AsyncStorage fault, transport failure — would
    // otherwise leave the app on a blank screen forever, with nothing thrown
    // for the root ErrorBoundary to catch. Treat a failure as signed-out and
    // let the normal routing take over.
    // Safety net: if getSession() ever hangs (a wedged transport on a flaky/no
    // connection), clear the gate anyway so the app can't sit on the loading
    // screen forever — it falls through to normal routing as signed-out.
    const safety = setTimeout(() => setLoading(false), 8000);
    supabase.auth
      .getSession()
      .then(({ data }) => {
        syncUser(data.session);
      })
      .catch(() => {
        syncUser(null);
      })
      .finally(() => {
        clearTimeout(safety);
        setLoading(false);
      });

    // Joining/leaving a shared cellar (or finishing the first load) switches
    // which cellar every screen reads — refetch everything.
    let lastCellar: { userId: string | null; ownerId: string | null } | null = null;
    let switchCount = 0;
    const unsubCellar = subscribeCellarContext(() => {
      const { userId, ownerId } = getCellarContext();
      const switched = !!userId && lastCellar?.userId === userId && lastCellar.ownerId !== ownerId;
      lastCellar = { userId, ownerId };
      if (!switched) { void qc.invalidateQueries(); return; }
      // Switched cellar: cellar queries are keyed by the user, not the cellar,
      // so the saved lists now describe the wrong cellar. Delete them, drop
      // what no screen is showing (label images are per photo, so they stay),
      // and only save again once the refetch has replaced the rest.
      const thisSwitch = ++switchCount;
      setPersistedQueryUser(null);
      clearPersistedQueries(userId);
      qc.removeQueries({ type: 'inactive', predicate: (q) => q.queryKey[0] !== 'label-image' && q.queryKey[0] !== 'auto-label' });
      void qc.invalidateQueries().finally(() => {
        // Signed out, or switched again, meanwhile.
        if (thisSwitch !== switchCount || getCellarContext().userId !== userId) return;
        setPersistedQueryUser(userId);
        savePersistedQueries(qc);
        saveBigListsNow(qc);
      });
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    // Back in the foreground: re-read shared-cellar memberships, so an invite
    // accepted, a member removed or a role changed elsewhere shows up without
    // restarting the app; and note the user as active.
    const appState = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || !prevUserId.current) return;
      void loadCellarContext(prevUserId.current);
      void recordAccountActivity(prevUserId.current);
    });

    return () => { clearTimeout(safety); unsubCellar(); listener.subscription.unsubscribe(); appState.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
