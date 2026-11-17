import { useState } from 'react';
import { showAlert } from '../../AppAlert';
import { StoragePickerSheet, DestinationRow, BottleCountPrompt } from './StoragePicker';
import type { CellarWine } from '../../../types/wine';
import type { MoveDestination, WineCardData } from './useWineCardData';
import type { BottleActions } from './useBottleActions';

// Cellar tab → "Move Bottles": pick a home destination (or the Full Cellar
// List), then how many. Only home bottles not already there can move.
export function MoveBottlesSheet({ visible, wine, data, actions, onClose }: {
  visible: boolean;
  wine: CellarWine;
  data: WineCardData;
  actions: BottleActions;
  onClose: () => void;
}) {
  const [dest, setDest] = useState<MoveDestination | null>(null);
  const title = [wine.producer, wine.wine_name !== wine.producer ? wine.wine_name : null, wine.vintage].filter(Boolean).join(' ');
  const max = dest ? data.movableTo(dest) : 0;

  function pick(d: MoveDestination) {
    onClose();
    const movable = data.movableTo(d);
    if (movable === 0) {
      showAlert({ title: 'Nothing to move', body: d.kind === 'list'
        ? 'All of the bottles kept at home are already in your Full Cellar List, not yet placed.'
        : `All of the bottles kept at home are already in ${d.name}.` });
      return;
    }
    if (movable === 1) { void actions.move(d, 1); return; }
    setDest(d);
  }

  return (
    <>
      <StoragePickerSheet
        visible={visible}
        title={`Move ${title} to…`}
        racks={data.racks}
        bins={data.bins}
        homeLocations={data.homeLocations}
        onPick={pick}
        onClose={onClose}
      >
        <DestinationRow name="Full Cellar List" type="Unplaced" gold last onPress={() => pick({ kind: 'list', id: null, name: 'your Full Cellar List' })} />
      </StoragePickerSheet>
      <BottleCountPrompt
        visible={!!dest}
        body={`How many bottles of ${wine.wine_name || wine.producer} to move to ${dest?.name}? You can move ${max}.`}
        initial={max}
        actionLabel={`Move to ${dest?.name ?? ''}`}
        busy={actions.moving}
        busyLabel="Moving…"
        onConfirm={(n) => { const d = dest; if (!d) return; void actions.move(d, n).then(() => setDest(null)); }}
        onClose={() => setDest(null)}
      />
    </>
  );
}
