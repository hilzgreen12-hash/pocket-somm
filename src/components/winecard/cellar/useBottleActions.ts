import { useRef, useState } from 'react';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../hooks/useAuth';
import { invalidateCellarViews } from '../../../hooks/useCellar';
import { useRackStore } from '../../../stores/rackStore';
import { getCellarWineById, updateCellarWine, deleteCellarWine } from '../../../api/cellar';
import { clearSlotOfWine } from '../../../api/racks';
import { fetchPlacementsForWine, placedCount, addLocationPlacement, moveBottlesToLocation } from '../../../api/placements';
import { addWinesToFilter, removeWineFromFilter } from '../../../api/customFilters';
import { evictCachedLabel } from '../../../api/labelImageCache';
import { archiveBottles, archiveDateIso } from '../../../services/archiveNight';
import { releaseHomeBottles, releaseLeavingBottles, loosenBottlesFor } from '../../../services/moveBottles';
import { rackRoomFor, confirmRackRoom } from '../../../services/rackMoves';
import { formatWineTitle } from '../../../utils/wineTitle';
import { showAlert } from '../../AppAlert';
import type { CellarWine } from '../../../types/wine';
import type { ArchiveSource, MoveDestination, WineCardData } from './useWineCardData';

// The rack slot the card was opened from (tapping a bottle in a rack).
export type TappedSlot = { rackId: string; row: number; col: number };

const errorText = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');

// Everything the card does to a wine's bottles: add, move, place, archive and
// delete. Each action reads the wine fresh where counts matter and refreshes
// every cellar view after.
export function useBottleActions(wine: CellarWine, data: WineCardData, opts: { tappedSlot: TappedSlot | null; onDeleted: () => void }) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [working, setWorking] = useState(false);
  const [moving, setMoving] = useState(false);
  // An Other Home Storage location the wine was just filed into → "How is this wine packaged?"
  const [packagingLocationId, setPackagingLocationId] = useState<string | null>(null);
  // The Location filter an archive was scoped to: the wine leaves that filter.
  const archiveFilterRef = useRef<string | null>(null);
  const tappedSlotUsedRef = useRef(false);

  const refresh = () => {
    invalidateCellarViews(qc);
    void qc.invalidateQueries({ queryKey: ['cellar-locations'] });
  };

  // The bottle the user tapped to open the card leaves first: its slot is freed
  // (so it becomes loose, and the archive/delete then takes loose bottles
  // first). Used once, and only while the slot still holds this wine.
  async function freeTappedSlot(): Promise<boolean> {
    const slot = opts.tappedSlot;
    if (!slot || tappedSlotUsedRef.current) return false;
    tappedSlotUsedRef.current = true;
    return clearSlotOfWine(slot.rackId, slot.row, slot.col, wine.id);
  }

  // A wine filed under more than one Location filter: ask which one the
  // bottles are being removed from first.
  function chooseArchiveFilter(then: () => void) {
    const tagged = data.locations.filter((l) => l.wineIds.includes(wine.id));
    if (tagged.length <= 1) {
      archiveFilterRef.current = tagged[0]?.id ?? null;
      then();
      return;
    }
    showAlert({
      title: 'Remove from which location?',
      body: 'This wine is filed under more than one location.',
      buttons: [
        ...tagged.map((l) => ({ text: l.name, onPress: () => { archiveFilterRef.current = l.id; then(); } })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  async function archive(input: { count: number; date: string; note: string; source: ArchiveSource | null }) {
    if (working) return;
    setWorking(true);
    try {
      const fromTappedSlot = await freeTappedSlot();
      const { archived, archivedWineId } = await archiveBottles(wine.id, input.count, input.date, {
        fromUnit: fromTappedSlot ? undefined : input.source?.unit ?? undefined,
        note: input.note || undefined,
      });
      if (archived === 0 || !archivedWineId) throw new Error('This wine is no longer in your cellar. Go back and try again.');
      // Every bottle went: the row itself is now the archive record.
      const whole = archivedWineId === wine.id;
      const filterId = archiveFilterRef.current;
      archiveFilterRef.current = null;
      if (filterId) await removeWineFromFilter(filterId, wine.id);
      if (whole && userId) {
        // Move the row from the live cellar to the archive in the cache straight
        // away: the card keeps showing it (now archived) and a fresh add can't
        // match it as a duplicate while the refetch lands.
        const now = { ...wine, archived_at: archiveDateIso(input.date), archive_note: input.note || null };
        qc.setQueryData<CellarWine[]>(['cellar', userId], (old) => (old ?? []).filter((w) => w.id !== wine.id));
        qc.setQueryData<CellarWine[]>(['cellar-archive', userId], (old) => [now, ...(old ?? []).filter((w) => w.id !== wine.id)]);
      }
      refresh();
      const wineLine = formatWineTitle({ producer: wine.producer, wineName: wine.wine_name, region: wine.region, vintage: wine.vintage });
      showAlert({
        title: 'Wine Archived',
        body: `${wineLine}\n\n${archived} bottle${archived === 1 ? ' has' : 's have'} been moved from your cellar to your archive.`,
        buttons: whole
          ? [
            // The whole row is now the archive record, so this card shows it.
            { text: 'View In Archive' },
            { text: 'Done', style: 'cancel', onPress: () => router.back() },
          ]
          : [
            { text: 'View In Archive', onPress: () => void openArchiveCopy(archivedWineId) },
            { text: 'Done', style: 'cancel' },
          ],
      });
    } catch (err) {
      refresh();
      showAlert({ title: 'Could not archive', body: errorText(err) });
    } finally {
      setWorking(false);
    }
  }

  // A part-archive's new copy isn't in the archive cache until the refetch
  // lands; seeded first, its card opens straight away instead of flashing
  // "Wine not found".
  async function openArchiveCopy(id: string) {
    const copy = await getCellarWineById(id).catch(() => null);
    if (copy && userId) {
      qc.setQueryData<CellarWine[]>(['cellar-archive', userId], (old) => [copy, ...(old ?? []).filter((w) => w.id !== id)]);
    }
    router.push(`/cellar/${id}`);
  }

  // Delete `count` bottles. All of them deletes the row — and the reviews stored
  // on it; fewer frees that many from storage first, then lowers the count. An
  // archived wine's card stands for its whole line in Your Cellar Archive, so
  // every entry of that line goes, as deleting the line from the archive does.
  async function deleteBottles(count: number) {
    if (working) return;
    setWorking(true);
    try {
      if (wine.archived_at || count >= wine.quantity) {
        const ids = new Set(wine.archived_at ? data.archiveLine.map((r) => r.id) : [wine.id]);
        for (const id of ids) await deleteCellarWine(id);
        evictCachedLabel(wine.label_image_path);
        // Gone from the caches at once, so a fresh add can never match it.
        if (userId) {
          for (const key of ['cellar', 'cellar-archive']) {
            qc.setQueryData<CellarWine[]>([key, userId], (old) => (old ?? []).filter((w) => !ids.has(w.id)));
          }
        }
        refresh();
        opts.onDeleted();
        return;
      }
      await freeTappedSlot();
      const fresh = await getCellarWineById(wine.id);
      if (!fresh || fresh.archived_at) throw new Error('This wine is no longer in your cellar. Go back and try again.');
      if (count >= fresh.quantity) throw new Error('The number of bottles has changed. Please try again.');
      // Free the leaving bottles' storage BEFORE lowering the count (see releaseLeavingBottles).
      await releaseLeavingBottles(wine.id, fresh.quantity, count);
      await updateCellarWine(wine.id, { quantity: fresh.quantity - count });
      refresh();
    } catch (err) {
      refresh();
      showAlert({ title: 'Could not delete', body: errorText(err) });
    } finally {
      setWorking(false);
    }
  }

  // Add bottles to Your Cellar List (unplaced), a bin (flagged to place there)
  // or an alt cellar (placed there), then open that bin or cellar.
  async function addBottles(dest: { kind: 'list' | 'bin' | 'location'; id: string | null }, count: number) {
    const fresh = await getCellarWineById(wine.id);
    if (!fresh) throw new Error('This wine is no longer in your cellar.');
    await updateCellarWine(wine.id, {
      quantity: fresh.quantity + count,
      ...(dest.kind === 'bin' ? { awaiting_placement: true, awaiting_placement_unit_id: dest.id } : {}),
    });
    if (dest.kind === 'location' && dest.id) await addLocationPlacement(wine.id, dest.id, null, count);
    refresh();
    if (dest.kind === 'bin') router.push(`/cellar/bin/${dest.id}?highlight=${wine.id}`);
    if (dest.kind === 'location') router.push(`/cellar/storage-location/${dest.id}?highlight=${wine.id}`);
  }

  // Move home bottles (never external ones, never ones already there). An alt
  // cellar takes them directly; a rack, fridge or bin gets them loose and
  // flagged, then its screen places them; Your Cellar List unplaces them.
  async function move(dest: MoveDestination, requested: number) {
    if (moving) return;
    const n = Math.min(requested, data.movableTo(dest));
    if (n <= 0) return;
    setMoving(true);
    try {
      const fresh = await getCellarWineById(wine.id);
      if (!fresh || fresh.archived_at) throw new Error('This wine is no longer in your cellar. Go back and try again.');
      let ready = n;
      if (dest.kind === 'location' && dest.id) {
        await moveBottlesToLocation(fresh, dest.id, n);
      } else if (dest.kind === 'list') {
        await releaseHomeBottles(wine.id, n, data.externalIds);
        if (n >= fresh.quantity) await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
      } else if (dest.id) {
        // A rack or fridge only takes as many as it has free slots for; the
        // rest stay where they are.
        const sending = dest.kind === 'rack'
          ? await confirmRackRoom(await rackRoomFor(dest.id, fresh.bottle_size_ml ?? 750), n, 'stay where they are')
          : n;
        if (sending === 0) return;
        ready = await loosenBottlesFor(wine.id, fresh.quantity, sending, data.externalIds, { kind: dest.kind, id: dest.id });
        await updateCellarWine(wine.id, { awaiting_placement: true, awaiting_placement_unit_id: dest.id });
      }
      refresh();
      if (dest.kind === 'rack') router.push(`/cellar/rack/${dest.id}?placeWine=${wine.id}&placeLimit=${ready}`);
      else if (dest.kind === 'bin') router.push(`/cellar/bin/${dest.id}?highlight=${wine.id}`);
      else if (dest.kind === 'location') router.push(`/cellar/storage-location/${dest.id}?highlight=${wine.id}`);
      else showAlert({ title: 'Moved', body: `${n} ${n === 1 ? 'bottle is' : 'bottles are'} now in your Full Cellar List, not yet placed.` });
    } catch (err) {
      refresh();
      showAlert({ title: 'Could not move bottles', body: errorText(err) });
    } finally {
      setMoving(false);
    }
  }

  // Loose bottles, from a fresh read — a stale count would let a rack offer more
  // slots than there are bottles to place.
  async function looseNow(): Promise<number> {
    const pls = await fetchPlacementsForWine(wine.id).catch(() => data.placements);
    return Math.max(0, (wine.quantity ?? 0) - placedCount(pls));
  }

  // Place loose bottles in a rack or fridge: its grid opens in select-slots
  // mode, capped at the loose count.
  async function placeInRack(rackId: string) {
    const loose = await looseNow();
    if (loose <= 0) {
      showAlert({ title: 'All placed', body: 'Every bottle of this wine is already placed in your cellar.' });
      return;
    }
    router.push(`/cellar/rack/${rackId}?placeWine=${wine.id}&placeLimit=${loose}`);
  }

  // File the loose bottles in an Other Home Storage location; bottles already in
  // racks, bins or other cellars stay where they are.
  async function fileInLocation(locationId: string) {
    try {
      const loose = await looseNow();
      if (loose <= 0) {
        showAlert({ title: 'Already placed', body: 'Every bottle of this wine is already filed in your storage.' });
        return;
      }
      await addLocationPlacement(wine.id, locationId, null, loose);
      if (wine.awaiting_placement) await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
      refresh();
      setPackagingLocationId(locationId);
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: errorText(err) });
    }
  }

  // Tag the wine under a Cellar List Location filter — no physical placement.
  async function tagWithFilter(filterId: string) {
    try {
      await addWinesToFilter(filterId, [wine.id]);
      void qc.invalidateQueries({ queryKey: ['cellar-locations', userId] });
      showAlert({ title: 'Added to location', body: `Filed under ${data.locations.find((l) => l.id === filterId)?.name ?? 'the location'}.` });
    } catch (err) {
      showAlert({ title: 'Could not add to location', body: errorText(err) });
    }
  }

  // "Add to Location": place the loose bottles in a rack or fridge, file them in
  // a home alt cellar (never an external one), or tag a Location filter.
  function openPlaceMenu() {
    const buttons = [
      ...data.racks.map((r) => ({ text: r.name, onPress: () => void placeInRack(r.id) })),
      ...data.homeLocations.map((l) => ({ text: l.name, onPress: () => void fileInLocation(l.id) })),
      ...data.locations.map((l) => ({ text: l.name, onPress: () => void tagWithFilter(l.id) })),
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

  // Add Bottles → "Add New Location": set the storage up first. A new rack or
  // fridge carries the wine, so its grid asks where to place the new bottles.
  function addToNewLocation() {
    const newRack = (type: 'rack' | 'fridge') => {
      const store = useRackStore.getState();
      store.setPendingWineId(wine.id);
      store.setPendingAddMode(true);
      store.setPendingStorageType(type);
      router.push('/cellar/rack/new');
    };
    showAlert({
      title: 'What Kind of Storage Location?',
      body: 'Set up the new location, then place your bottles in it.',
      buttons: [
        { text: 'Rack', onPress: () => newRack('rack') },
        { text: 'Fridge', onPress: () => newRack('fridge') },
        { text: 'Bin (diamonds)', onPress: () => router.push('/cellar/bin/new') },
        { text: 'Alt Cellar', onPress: () => router.push('/cellar/storage-location/new') },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  return {
    working,
    moving,
    archive,
    deleteBottles,
    addBottles,
    move,
    openPlaceMenu,
    addToNewLocation,
    chooseArchiveFilter,
    packagingLocationId,
    closePackaging: () => setPackagingLocationId(null),
  };
}

export type BottleActions = ReturnType<typeof useBottleActions>;
