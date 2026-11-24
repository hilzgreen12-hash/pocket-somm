import { useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCellarViews } from '../../../hooks/useCellar';
import { updateCellarWine } from '../../../api/cellar';
import { fetchPlacementsForWine, placedCount, addLocationPlacement, type CellarPlacement } from '../../../api/placements';
import { addWinesToFilter, type CustomFilter } from '../../../api/customFilters';
import { showAlert } from '../../AppAlert';
import type { CellarWine, StorageLocation, WineRack } from '../../../types/wine';

const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');

export type PlaceDestinations = {
  racks: WineRack[];
  homeLocations: StorageLocation[];   // alt cellars at home — never external ones
  locations: CustomFilter[];          // Cellar List Location filters (tags)
};

// "Add to Location", shared by the wine card and the Cellar List's long-press
// pop-up: place a wine's loose bottles in a rack or fridge, file them in a home
// alt cellar, or tag a Location filter.
export function usePlaceInLocation(dest: PlaceDestinations) {
  const qc = useQueryClient();
  // A wine just filed into an alt cellar → "How is this wine packaged?"
  const [packaging, setPackaging] = useState<{ wineId: string; locationId: string } | null>(null);

  const refresh = () => {
    invalidateCellarViews(qc);
    void qc.invalidateQueries({ queryKey: ['cellar-locations'] });
  };

  // Loose bottles, from a fresh read — a stale count would let a rack offer more
  // slots than there are bottles to place.
  async function looseNow(wine: CellarWine, known: CellarPlacement[]): Promise<number> {
    const pls = await fetchPlacementsForWine(wine.id).catch(() => known);
    return Math.max(0, (wine.quantity ?? 0) - placedCount(pls));
  }

  // A rack or fridge opens its grid in select-slots mode, capped at the loose count.
  async function placeInRack(wine: CellarWine, known: CellarPlacement[], rackId: string) {
    const loose = await looseNow(wine, known);
    if (loose <= 0) {
      showAlert({ title: 'All placed', body: 'Every bottle of this wine is already placed in your cellar.' });
      return;
    }
    router.push(`/cellar/rack/${rackId}?placeWine=${wine.id}&placeLimit=${loose}`);
  }

  // Bottles already in racks, bins or other cellars stay where they are.
  async function fileInLocation(wine: CellarWine, known: CellarPlacement[], locationId: string) {
    try {
      const loose = await looseNow(wine, known);
      if (loose <= 0) {
        showAlert({ title: 'Already placed', body: 'Every bottle of this wine is already filed in your storage.' });
        return;
      }
      await addLocationPlacement(wine.id, locationId, null, loose);
      if (wine.awaiting_placement) await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
      refresh();
      setPackaging({ wineId: wine.id, locationId });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: errorText(err) });
    }
  }

  // A Location filter is a tag — no physical placement.
  async function tagWithFilter(wine: CellarWine, filterId: string) {
    try {
      await addWinesToFilter(filterId, [wine.id]);
      void qc.invalidateQueries({ queryKey: ['cellar-locations'] });
      showAlert({ title: 'Added to location', body: `Filed under ${dest.locations.find((l) => l.id === filterId)?.name ?? 'the location'}.` });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: errorText(err) });
    }
  }

  // `known` is the wine's placements as last loaded, used if the fresh read fails.
  function openPlaceMenu(wine: CellarWine, known: CellarPlacement[]) {
    const buttons = [
      ...dest.racks.map((r) => ({ text: r.name, onPress: () => void placeInRack(wine, known, r.id) })),
      ...dest.homeLocations.map((l) => ({ text: l.name, onPress: () => void fileInLocation(wine, known, l.id) })),
      ...dest.locations.map((l) => ({ text: l.name, onPress: () => void tagWithFilter(wine, l.id) })),
    ];
    if (buttons.length === 0) {
      showAlert({ title: 'No locations yet', body: 'Create a rack, fridge or home storage location first, then you can add wines to it.' });
      return;
    }
    showAlert({
      title: 'Add to Location',
      body: 'Place in a Home Storage Location.',
      buttons: [...buttons, { text: 'Cancel', style: 'cancel' as const }],
    });
  }

  return { openPlaceMenu, packaging, closePackaging: () => setPackaging(null) };
}
