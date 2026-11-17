import { useState } from 'react';
import { router } from 'expo-router';
import { showAlert } from '../../AppAlert';
import { StoragePickerSheet, DestinationRow, BottleCountPrompt } from './StoragePicker';
import type { CellarWine } from '../../../types/wine';
import type { MoveDestination, WineCardData } from './useWineCardData';
import type { BottleActions } from './useBottleActions';

type AddTarget = { kind: 'list' | 'bin' | 'location'; id: string | null; name: string };

// Cellar tab → "Add Bottles": where the NEW bottles go. A rack or fridge opens
// its grid to place them; a bin, alt cellar or the Full Cellar List asks how
// many; "Add New Location" sets one up first.
export function AddBottlesSheet({ visible, wine, data, actions, onClose }: {
  visible: boolean;
  wine: CellarWine;
  data: WineCardData;
  actions: BottleActions;
  onClose: () => void;
}) {
  const [target, setTarget] = useState<AddTarget | null>(null);
  const [adding, setAdding] = useState(false);
  const title = [wine.producer, wine.wine_name !== wine.producer ? wine.wine_name : null, wine.vintage].filter(Boolean).join(' ');

  function pick(dest: MoveDestination) {
    onClose();
    if (dest.kind === 'rack') router.push(`/cellar/rack/${dest.id}?addMoreWine=${wine.id}`);
    else setTarget({ kind: dest.kind, id: dest.id, name: dest.name });
  }

  async function confirm(count: number) {
    if (!target) return;
    setAdding(true);
    try {
      await actions.addBottles(target, count);
      setTarget(null);
    } catch (err) {
      showAlert({ title: 'Could not add bottles', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setAdding(false);
    }
  }

  return (
    <>
      <StoragePickerSheet
        visible={visible}
        title={`Add ${title} to Your Cellar`}
        racks={data.racks}
        bins={data.bins}
        homeLocations={data.homeLocations}
        onPick={pick}
        onClose={onClose}
      >
        <DestinationRow name="+ Add New Location" gold onPress={() => { onClose(); actions.addToNewLocation(); }} />
        <DestinationRow name="Add to Full Cellar List" type="Unplaced" gold last onPress={() => { onClose(); setTarget({ kind: 'list', id: null, name: 'your Full Cellar List' }); }} />
      </StoragePickerSheet>
      <BottleCountPrompt
        visible={!!target}
        body={`How many bottles of ${wine.wine_name || wine.producer} to add to ${target?.name}?`}
        initial={1}
        actionLabel={target?.kind === 'list' ? 'Add to Cellar' : `Add to ${target?.name ?? ''}`}
        busy={adding}
        busyLabel="Adding…"
        onConfirm={(n) => void confirm(n)}
        onClose={() => setTarget(null)}
      />
    </>
  );
}
