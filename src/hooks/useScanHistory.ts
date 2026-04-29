import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const autoSave = useMutation({
    mutationFn: async ({ extractedWines, recommendation }: { extractedWines: ExtractedWine[]; recommendation: RecommendationResponse }) => {
      const existing = await readLocal();
      const newItem: ScanHistoryItem = {
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
        extractedWines,
        recommendation,
        savedToAccount: false,
      };
      const updated = [newItem, ...existing].slice(0, MAX_LOCAL);
      await writeLocal(updated);
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scan-history'] }),
  });

  const saveToAccount = useMutation({
    mutationFn: async (item: ScanHistoryItem) => {
      if (!session) throw new Error('Not signed in');
      await supabase.from('scan_history').insert({
        user_id: session.user.id,
        extracted_wines: item.extractedWines,
        recommendation: item.recommendation,
        scanned_at: item.savedAt,
      });
      const existing = await readLocal();
      const updated = existing.map((h) =>
        h.id === item.id ? { ...h, savedToAccount: true } : h
      );
      await writeLocal(updated);
      return updated;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scan-history'] }),
  });

  return { history, autoSave, saveToAccount };
}
