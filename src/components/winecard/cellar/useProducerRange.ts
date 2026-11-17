import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchProducerRange, type ProducerRange, type ProducerRangeWine } from '../../../api/label';
import type { CellarWine } from '../../../types/wine';

// Same wine listed twice (bare, and with the château in brackets) → one key.
const rangeKey = (s: string) => (s ?? '')
  .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\([^)]*\)/g, ' ')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

// "The {producer} range" under Vinster's Review, as on the scan Wine Intel card.
// Looked up once, only after the wine has intel (so it arrives with it) and has
// a producer. Display-only: nothing is saved.
export function useProducerRange(wine: CellarWine) {
  const [range, setRange] = useState<ProducerRange | null>(null);
  const [loading, setLoading] = useState(false);
  const triedRef = useRef(false);
  const hasIntel = wine.critic_score != null || wine.estimated_value != null;

  useEffect(() => {
    if (triedRef.current || wine.archived_at || !hasIntel || !wine.producer?.trim()) return;
    triedRef.current = true;
    setLoading(true);
    fetchProducerRange({ producer: wine.producer, region: wine.region, wineName: wine.wine_name, vintage: wine.vintage })
      .then((r) => { if (r.wines.length > 0) setRange(r); })
      .catch(() => { /* the section just doesn't render */ })
      .finally(() => setLoading(false));
    // Looked up once per card; the card remounts for a different wine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIntel]);

  const wines = useMemo<ProducerRangeWine[]>(() => {
    const byKey = new Map<string, ProducerRangeWine>();
    for (const w of range?.wines ?? []) {
      const k = rangeKey(w.wineName);
      if (!k) continue;
      const prev = byKey.get(k);
      if (!prev) { byKey.set(k, w); continue; }
      const keep = w.isThis ? w : prev.isThis ? prev : (w.wineName.length < prev.wineName.length ? w : prev);
      byKey.set(k, { ...keep, isThis: keep.isThis || w.isThis || prev.isThis });
    }
    return Array.from(byKey.values());
  }, [range]);

  return { range, wines, loading };
}

export type ProducerRangeState = ReturnType<typeof useProducerRange>;
