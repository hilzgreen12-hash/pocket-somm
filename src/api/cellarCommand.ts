import { invokeResilient } from './invokeResilient';
import type { CellarWine, StorageLocation } from '../types/wine';

export type CellarCommandAction = 'move' | 'archive' | 'add';

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
  locationId: string | null;
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

// Parse a dictated cellar command against the user's live cellar. The action
// (move / archive / add) is chosen in the UI first, so the parser only has to
// resolve which wine, where, and how many.
export async function parseCellarCommand(
  action: CellarCommandAction,
  transcript: string,
  wines: CellarWine[],
  locations: StorageLocation[],
): Promise<CellarCommandResult> {
  const nameById = new Map(locations.map((l) => [l.id, l.name]));
  const data = await invokeResilient('cellar-command', {
    action,
    transcript,
    wines: wines.map((w) => toWinePayload(w, w.storage_location_id ? nameById.get(w.storage_location_id) : null)),
    locations: locations.map((l) => ({ id: l.id, name: l.name, isExternal: l.is_external })),
  }) as Partial<CellarCommandResult>;

  return {
    action,
    wineId: data.wineId ?? null,
    locationId: data.locationId ?? null,
    quantity: data.quantity ?? null,
    add: data.add ?? null,
    candidates: Array.isArray(data.candidates) ? data.candidates : [],
    needs: data.needs ?? null,
    message: data.message ?? '',
  };
}
