import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { supabase } from '../api/supabase';
import { useAuth } from './useAuth';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';
import { normaliseCity } from '../utils/city';

const STORAGE_KEY = 'vinster_scan_history';
const MAX_LOCAL = 3;

// Per-user storage key for the "View Last Result" cache. Scoping by user id
// means a user's last results PERSIST across signing out and back in and
// across app updates (AsyncStorage survives both), while still keeping one
// account's results from showing under another on a shared device. The
// account-switch cleanup in useAuth only wipes the legacy base key, so these
// scoped keys are left intact. Signed-out scans fall back to the base key.
export function scanHistoryKey(userId: string | null | undefined): string {
  return userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
}

export interface ScanHistoryItem {
  id: string;
  savedAt: string;
  extractedWines: ExtractedWine[];
  recommendation: RecommendationResponse;
  savedToAccount: boolean;
  city?: string | null;
  restaurantName?: string | null;
  sessionId?: string;
}

export interface ScanArchiveItem {
  id: string;
  capturedAt: string;
  extractedWines: ExtractedWine[];
  recommendation: RecommendationResponse;
  city: string | null;
  restaurantName: string | null;
  restaurantNote: string | null;
  ratingFood: number | null;
  ratingService: number | null;
  ratingWineList: number | null;
  ratingOverall: number | null;
  ratingValue: number | null;
  isFavourite: boolean;
}

async function readLocal(userId: string | null | undefined): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(scanHistoryKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeLocal(userId: string | null | undefined, items: ScanHistoryItem[]) {
  await AsyncStorage.setItem(scanHistoryKey(userId), JSON.stringify(items));
}

// Caches a fresh scan to local AsyncStorage only (no Supabase, no GPS).
// Fires on result render so View Last Result always works inside the
// session, regardless of whether the user has tapped Save to Archive.
export async function cacheScanLocally(userId: string | null | undefined, input: { extractedWines: ExtractedWine[]; recommendation: RecommendationResponse; restaurantName?: string | null; city?: string | null }) {
  const newItem: ScanHistoryItem = {
    id: Date.now().toString(),
    savedAt: new Date().toISOString(),
    extractedWines: input.extractedWines,
    recommendation: input.recommendation,
    savedToAccount: false,
    city: input.city ?? null,
    restaurantName: input.restaurantName ?? null,
  };
  const existing = await readLocal(userId);
  const updated = [newItem, ...existing].slice(0, MAX_LOCAL);
  await writeLocal(userId, updated);
}

export function useScanHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();

  const { data: history = [] } = useQuery<ScanHistoryItem[]>({
    queryKey: ['scan-history', session?.user.id ?? null],
    queryFn: () => readLocal(session?.user.id ?? null),
  });

  const { data: archive = [], isLoading: archiveLoading, error: archiveError } = useQuery<ScanArchiveItem[]>({
    queryKey: ['scan-archive', session?.user.id],
    enabled: !!session,
    // Always refetch when the archive screen opens — invalidation alone
    // can be skipped if React Query thinks the cache is fresh, leading
    // to a just-saved scan failing to appear.
    refetchOnMount: 'always',
    queryFn: async () => {
      const userId = session?.user.id;
      if (!userId) return [];
      const { data, error } = await supabase
        .from('scan_sessions')
        .select('id, captured_at, extracted_wines, recommendation, city, restaurant_name, restaurant_note, rating_food, rating_service, rating_wine_list, rating_overall, rating_value, is_favourite')
        .eq('user_id', userId)
        .order('captured_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        id: row.id,
        capturedAt: row.captured_at,
        extractedWines: row.extracted_wines as ExtractedWine[],
        recommendation: row.recommendation as RecommendationResponse,
        city: row.city ?? null,
        restaurantName: row.restaurant_name ?? null,
        restaurantNote: row.restaurant_note ?? null,
        ratingFood: row.rating_food ?? null,
        ratingService: row.rating_service ?? null,
        ratingWineList: row.rating_wine_list ?? null,
        ratingOverall: row.rating_overall ?? null,
        ratingValue: row.rating_value ?? null,
        isFavourite: row.is_favourite ?? false,
      }));
    },
  });

  const autoSave = useMutation({
    mutationFn: async ({ extractedWines, recommendation, restaurantNameOverride }: { extractedWines: ExtractedWine[]; recommendation: RecommendationResponse; restaurantNameOverride?: string | null }) => {
      // Surface a clear failure when the auth token hasn't hydrated yet —
      // previously this branch silently skipped the Supabase insert, so the
      // user saw "Saved ✓" but the archive query found nothing.
      if (!session) {
        throw new Error('Sign in to save to archive — your save did not reach the cloud.');
      }
      const now = new Date().toISOString();

      let city: string | null = null;
      let restaurantName: string | null = null;
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          const req = await Location.requestForegroundPermissionsAsync();
          status = req.status;
        }
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          if (geo) {
            const rawCity = geo.city ?? geo.subregion ?? geo.region ?? null;
            city = rawCity ? normaliseCity(rawCity) : null;
            // Use the establishment name if the geocoder returns one (e.g. "The Clove Club")
            // Falls back to null — user can fill it in on the results screen
            restaurantName = (geo.name && geo.name !== geo.street && geo.name !== geo.streetNumber) ? geo.name : null;
          }
        }
      } catch { /* location unavailable */ }

      // User-typed restaurant name takes precedence over the GPS-derived one
      // since the user knows the establishment better than reverse geocoding.
      if (restaurantNameOverride !== undefined && restaurantNameOverride !== null) {
        const trimmed = restaurantNameOverride.trim();
        restaurantName = trimmed.length > 0 ? trimmed : restaurantName;
      }

      let sessionId: string | undefined;
      const { data: inserted, error: insertError } = await supabase
        .from('scan_sessions')
        .insert({
          user_id: session.user.id,
          captured_at: now,
          extracted_wines: extractedWines,
          recommendation,
          city,
          latitude,
          longitude,
          restaurant_name: restaurantName,
          image_path: null,
          preferences_snapshot: null,
        })
        .select('id')
        .single();
      if (insertError) {
        // Surface the failure so the UI can fall out of "Saved ✓" — the
        // local AsyncStorage write below is skipped to avoid a misleading
        // success state. Include code + details to help diagnose RLS or
        // schema issues that just say "permission denied" otherwise.
        const detail = [insertError.code, insertError.message, insertError.details]
          .filter(Boolean)
          .join(' — ');
        throw new Error(`scan_sessions insert failed: ${detail || 'unknown error'}`);
      }
      if (!inserted?.id) {
        // Should never happen because .single() throws on missing row, but
        // belt-and-braces — if we got here without an inserted id the row
        // wasn't actually written.
        throw new Error('scan_sessions insert returned no row id');
      }
      sessionId = inserted.id;

      // Verify the inserted row is selectable under the same auth
      // context. If the insert succeeded but the row isn't returned by
      // a SELECT, that's an RLS read-side issue we want surfaced
      // explicitly — otherwise the user sees a successful save and an
      // empty archive (the bug we're chasing).
      const { data: verify, error: verifyError } = await supabase
        .from('scan_sessions')
        .select('id')
        .eq('id', sessionId)
        .maybeSingle();
      if (verifyError) {
        throw new Error(`scan_sessions verify failed: ${verifyError.message}`);
      }
      if (!verify) {
        throw new Error(`scan_sessions row ${sessionId} not visible after insert — RLS read policy may be rejecting your own rows.`);
      }

      const newItem: ScanHistoryItem = {
        id: Date.now().toString(),
        savedAt: now,
        extractedWines,
        recommendation,
        savedToAccount: !!session,
        city,
        restaurantName,
        sessionId,
      };
      const existing = await readLocal(session.user.id);
      const updated = [newItem, ...existing].slice(0, MAX_LOCAL);
      await writeLocal(session.user.id, updated);
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scan-history'] });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      // history tab uses a separate query key; invalidate it too so newly
      // saved scans appear without an app restart
      qc.invalidateQueries({ queryKey: ['scan-sessions'] });
    },
  });

  const removeArchiveItem = useMutation({
    mutationFn: async (id: string) => {
      if (!session) throw new Error('Sign in required');
      const { error } = await supabase.from('scan_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['scan-sessions'] });
    },
  });

  return { history, archive, archiveLoading, archiveError, autoSave, removeArchiveItem };
}
