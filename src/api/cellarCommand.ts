import { invokeResilient } from './invokeResilient';
import { fetchPlacementsForWines } from './placements';
import type { CellarWine, StorageLocation, WineRack } from '../types/wine';

export type CellarCommandAction = 'move' | 'archive' | 'add' | 'delete';

// The trimmed cellar/location context we send the parser — just enough to
// resolve a spoken command, no images or notes.
function toWinePayload(w: CellarWine, locationName?: string | null) {
  return {
    id: w.id,
    producer: w.producer,
    wineName: w.wine_name,
    vintage: w.vintage,
    region: w.region,
    quantity: w.quantity,
    storageLocationName: locationName ?? null,
  };
}

export interface CellarCommandResult {
  action: CellarCommandAction;
  wineId: string | null;
  // Destination — a storage location (Alt Cellar) OR a placement unit
  // (rack / fridge / bin). At most one is set.
  locationId: string | null;
  unitId: string | null;
  quantity: number | null;
  // Only present for the 'add' action — the parsed identity of a new wine.
  add: { producer: string | null; wineName: string | null; vintage: string | null; region: string | null } | null;
  // Wine ids when the spoken wine was ambiguous (needs === 'wine').
  candidates: string[];
  // What the parser still needs from the user, if anything.
  needs: 'wine' | 'location' | null;
  // One short human sentence describing what was understood.
  message: string;
}

const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() ? v.trim() : null);

// Parse a typed or dictated cellar command. The verb is inferred in the app
// first; the parser resolves which wine (from the shortlist in `wines`), where
// (an Alt Cellar or a rack/fridge/bin unit) and how many. An Add sends no wines:
// a new bottle isn't matched against the cellar.
//
// The model's answer is checked against what was sent: ids it wasn't given are
// dropped, and the quantity must be a whole number of bottles.
export async function parseCellarCommand(
  action: CellarCommandAction,
  transcript: string,
  wines: CellarWine[],
  locations: StorageLocation[],
  units: WineRack[],
): Promise<CellarCommandResult> {
  // Each wine's alt cellars by name, so "the Margaux in the shed" resolves.
  // Best-effort: without them the parser still matches on the wine itself.
  const nameById = new Map(locations.map((l) => [l.id, l.name]));
  const whereByWine = new Map<string, string[]>();
  try {
    for (const p of await fetchPlacementsForWines(wines.map((w) => w.id))) {
      const name = p.kind === 'location' && p.storage_location_id ? nameById.get(p.storage_location_id) : undefined;
      const names = whereByWine.get(p.cellar_wine_id) ?? [];
      if (name && !names.includes(name)) whereByWine.set(p.cellar_wine_id, [...names, name]);
    }
  } catch { /* names are a hint only */ }
  const data = await invokeResilient('cellar-command', {
    action,
    transcript,
    wines: wines.map((w) => toWinePayload(w, whereByWine.get(w.id)?.join(', ') ?? null)),
    locations: locations.map((l) => ({ id: l.id, name: l.name, isExternal: l.is_external })),
    units: units.map((u) => ({ id: u.id, name: u.name, type: u.storage_type ?? 'rack' })),
  }) as Record<string, any>;

  const wineIds = new Set(wines.map((w) => w.id));
  const known = (ids: Set<string>, v: unknown) => (typeof v === 'string' && ids.has(v) ? v : null);
  const qty = Number(data.quantity);
  const add = data.add && typeof data.add === 'object'
    ? { producer: str(data.add.producer), wineName: str(data.add.wineName), vintage: str(String(data.add.vintage ?? '')), region: str(data.add.region) }
    : null;
  const locationId = known(new Set(locations.map((l) => l.id)), data.locationId);
  return {
    action,
    wineId: known(wineIds, data.wineId),
    locationId,
    // One destination at most: an Alt Cellar wins over a unit.
    unitId: locationId ? null : known(new Set(units.map((u) => u.id)), data.unitId),
    quantity: Number.isInteger(qty) && qty > 0 ? qty : null,
    add,
    candidates: Array.isArray(data.candidates) ? Array.from(new Set(data.candidates.filter((c: unknown) => known(wineIds, c)))) as string[] : [],
    needs: data.needs === 'wine' || data.needs === 'location' ? data.needs : null,
    message: str(data.message) ?? '',
  };
}
