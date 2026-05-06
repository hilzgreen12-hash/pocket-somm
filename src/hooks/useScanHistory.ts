import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { supabase } from '../api/supabase';
import { useAuth } from './useAuth';
import type { ExtractedWine, RecommendationResponse } from '../types/wine';

const STORAGE_KEY = 'vinster_scan_history';
const MAX_LOCAL = 3;

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
}

async function readLocal(): Promise<ScanHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function writeLocal(items: ScanHistoryItem[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useScanHistory() {
  const { session } = useAuth();
  const qc = useQueryClient();

  const { data: history = [] } = useQuery<ScanHistoryItem[]>({
    queryKey: ['scan-history'],
    queryFn: readLocal,
  });

  const { data: archive = [], isLoading: archiveLoading } = useQuery<ScanArchiveItem[]>({
    queryKey: ['scan-archive', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_sessions')
        .select('id, captured_at, extracted_wines, recommendation, city, restaurant_name, restaurant_note')
        .eq('user_id', session!.user.id)
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
      }));
    },
  });

  const autoSave = useMutation({
    mutationFn: async ({ extractedWines, recommendation }: { extractedWines: ExtractedWine[]; recommendation: RecommendationResponse }) => {
      const now = new Date().toISOString();

      let city: string | null = null;
      let restaurantName: string | null = null;
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
          const [geo] = await Location.reverseGeocodeAsync({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          if (geo) {
            city = geo.city ?? geo.subregion ?? geo.region ?? null;
            // Use the establishment name if the geocoder returns one (e.g. "The Clove Club")
            // Falls back to null — user can fill it in on the results screen
            restaurantName = (geo.name && geo.name !== geo.street && geo.name !== geo.streetNumber) ? geo.name : null;
          }
        }
      } catch { /* location unavailable */ }

      let sessionId: string | undefined;
      if (session) {
        const { data: inserted } = await supabase
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
        sessionId = inserted?.id;
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
      const existing = await readLocal();
      const updated = [newItem, ...existing].slice(0, MAX_LOCAL);
      await writeLocal(updated);
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

  return { history, archive, archiveLoading, autoSave };
}
