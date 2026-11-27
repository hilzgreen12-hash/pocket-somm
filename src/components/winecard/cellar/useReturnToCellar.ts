import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCellarViews } from '../../../hooks/useCellar';
import { returnToCellar } from '../../../services/archiveNight';
import { wineHeaderLine } from '../../../utils/wineHeader';
import { showAlert } from '../../AppAlert';
import { bottlesLabel, fmtDay } from './format';
import type { CellarWine } from '../../../types/wine';

// "Return to Cellar" on an archived wine (its card, or its line in Your Cellar
// Archive): undo an archive made by mistake. `start` takes the archive entries
// the wine stands for, newest first; with more than one it asks which, then
// confirms before returning that entry's bottles (see returnToCellar).
// `onReturned` hears which archived row went back and the live row now holding
// its bottles.
export function useReturnToCellar(onReturned?: (r: { archivedWineId: string; cellarWineId: string }) => void) {
  const qc = useQueryClient();
  const [returning, setReturning] = useState(false);

  async function run(entry: CellarWine, name: string) {
    if (returning) return;
    setReturning(true);
    try {
      const { returned, cellarWineId } = await returnToCellar(entry.id);
      showAlert({
        title: 'Returned to Your Cellar',
        body: `${bottlesLabel(returned)} of ${name} ${returned === 1 ? 'is' : 'are'} back in Your Full Cellar List, not yet placed.`,
      });
      onReturned?.({ archivedWineId: entry.id, cellarWineId });
    } catch (err) {
      showAlert({ title: 'Could not return to cellar', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      invalidateCellarViews(qc);
      setReturning(false);
    }
  }

  function confirm(entry: CellarWine, name: string) {
    const n = entry.quantity ?? 1;
    showAlert({
      title: `Return ${bottlesLabel(n)} of ${name} to your cellar?`,
      body: `${n === 1 ? 'It leaves' : 'They leave'} your archive and go back to Your Full Cellar List, ready to place.`,
      buttons: [
        { text: 'Return to Cellar', onPress: () => void run(entry, name) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function start(entries: CellarWine[]) {
    const first = entries[0];
    if (!first) return;
    const name = wineHeaderLine(first.producer, first.wine_name, first.vintage) || first.wine_name;
    if (entries.length === 1) { confirm(first, name); return; }
    showAlert({
      title: 'Return which bottles?',
      body: `Choose the archived bottles of ${name} to return to your cellar.`,
      buttons: [
        ...entries.map((a) => ({ text: `${fmtDay(a.archived_at)} · ${bottlesLabel(a.quantity ?? 0)}`, onPress: () => confirm(a, name) })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  return { start, returning };
}
