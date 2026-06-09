import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../api/supabase';

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
        qc.clear();
        // Clear the city autocomplete history (global key) and the LEGACY
        // base scan-history key on account switch. Scan history is now stored
        // per-user (vinster_scan_history_<userId>, see useScanHistory) so a
        // user's "View Last Result" persists across sign-out/in and app
        // updates; those scoped keys are intentionally NOT removed here, and
        // wiping the old base key just cleans up pre-scoping data.
        AsyncStorage.multiRemove(['vinster_scan_history', 'vinster_city_history']).catch(() => {});
      }
      prevUserId.current = nextUserId;
      setSession(next);
    }

    supabase.auth.getSession().then(({ data }) => {
      syncUser(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session);
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
