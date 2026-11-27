import type { ChosenWine } from '../types/wine';
import { wineNameKey } from './wineIdentity';

// A user's chosen wines grouped by wine (producer + name, accent and word-order
// tolerant), so "have I reviewed this wine?" is one lookup rather than a pass
// over every review — thousands for an imported Vivino history. Built once per
// list and shared by every screen that asks.
const cache = new WeakMap<ChosenWine[], Map<string, ChosenWine[]>>();

export function chosenByWineKey(chosen: ChosenWine[]): Map<string, ChosenWine[]> {
  let map = cache.get(chosen);
  if (!map) {
    map = new Map();
    for (const c of chosen) {
      const k = wineNameKey(c.producer, c.wine_name);
      if (!k) continue;
      const list = map.get(k);
      if (list) list.push(c); else map.set(k, [c]);
    }
    cache.set(chosen, map);
  }
  return map;
}
