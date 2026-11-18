import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { showAlert } from '../AppAlert';
import { useRackStore } from '../../stores/rackStore';
import { invalidateCellarViews } from '../../hooks/useCellar';
import { assignSlots, clearSlotOfWine, getRackSlots, type SlotPos } from '../../api/racks';
import { fetchPlacementsForWine, fetchPlacementsForWines, placedCount } from '../../api/placements';
import { getCellarWineById, updateCellarWine } from '../../api/cellar';
import { warnIfSizeMismatch, moveBottlesBetweenRacks, moveIntoRackFromStorage } from '../../services/rackMoves';
import { slotKey, parseSlotKey, freeSlotsFrom } from '../../utils/rackSlots';
import { wineHeaderLine } from '../../utils/wineHeader';
import type { CellarWine, RackSlot, StorageLocation, WineRack } from '../../types/wine';

// What a tap on an empty slot does right now. (Moving a bottle lives in the
// rack store, so it survives switching racks; bottles awaiting a slot come from
// the cellar data.)
export type PlacementMode =
  | { kind: 'idle' }
  // Long-pressed empty slots, to be filled with one new wine.
  | { kind: 'multiSelect' }
  // More bottles of a wine already here: tap empty slots, then Save.
  | { kind: 'addMore'; wineId: string; wineName: string }
  // Bottles that already exist (wine card "Place", Quick Command, a move from
  // another rack): tap up to `limit` empty slots, then Confirm.
  | { kind: 'placeExisting'; wine: CellarWine; limit: number; fromRack: { id: string; name: string } | null };

// "Select from Cellar List" picked a wine kept in an alt cellar or bin: the
// screen asks how many to move here (or confirms the one bottle).
export type MoveIntoRackPrompt = { wine: CellarWine; where: string; max: number; start: SlotPos };

const errorBody = (err: unknown) => (err instanceof Error ? err.message : 'Please try again.');
const wineLabel = (w: CellarWine) => wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name;
const bottles = (n: number) => `${n} bottle${n === 1 ? '' : 's'}`;

interface Args {
  rack: WineRack | undefined;
  rackId: string;
  slotMap: Record<string, RackSlot>;
  wines: CellarWine[];
  racks: WineRack[];
  locations: StorageLocation[];
  notify: (msg: string) => void;
  // Route hand-offs: ?placeWine=&placeLimit=[&fromRack=] and ?addMoreWine=.
  params: { placeWine?: string; placeLimit?: string; fromRack?: string; addMoreWine?: string };
}

export function useRackPlacement({ rack, rackId, slotMap, wines, racks, locations, notify, params }: Args) {
  const qc = useQueryClient();
  const [mode, setMode] = useState<PlacementMode>({ kind: 'idle' });
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const busy = useRef(false);

  // Optimistic fills: a tapped slot shows its bottle at once (with a swirl)
  // instead of after the write + refetch. Mirrored in a ref so a second tap in
  // the same frame already sees the slot as taken.
  const optimisticRef = useRef<Record<string, CellarWine>>({});
  const [optimistic, setOptimisticState] = useState<Record<string, CellarWine>>({});
  const setOptimistic = useCallback((update: (m: Record<string, CellarWine>) => Record<string, CellarWine>) => {
    optimisticRef.current = update(optimisticRef.current);
    setOptimisticState(optimisticRef.current);
  }, []);
  const dropOptimistic = (keys: Iterable<string>) => setOptimistic((m) => {
    const next = { ...m };
    for (const k of keys) delete next[k];
    return next;
  });

  const isTaken = (key: string) => !!slotMap[key]?.cellar_wine_id || !!optimisticRef.current[key];

  // Once the server owns a slot, its optimistic fill goes — otherwise a fill
  // that outlived its flow would show an extra bottle the header doesn't count.
  useEffect(() => {
    const stale = Object.keys(optimisticRef.current).filter((k) => slotMap[k]?.cellar_wine_id);
    if (stale.length) dropOptimistic(stale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotMap]);

  // Bottles of each wine in this rack, real and optimistic (each slot once).
  const countByWine = useMemo(() => {
    const counts = new Map<string, number>();
    const add = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1);
    for (const s of Object.values(slotMap)) if (s.cellar_wine_id) add(s.cellar_wine_id);
    for (const [k, w] of Object.entries(optimistic)) if (!slotMap[k]?.cellar_wine_id) add(w.id);
    return counts;
  }, [slotMap, optimistic]);
  const countHere = (wineId: string) => countByWine.get(wineId) ?? 0;
  // The same count read from the ref, for decisions made between renders (two
  // quick taps must not both take the wine's last bottle).
  const countHereNow = (wineId: string) => {
    let n = 0;
    for (const s of Object.values(slotMap)) if (s.cellar_wine_id === wineId) n++;
    for (const [k, w] of Object.entries(optimisticRef.current)) if (w.id === wineId && !slotMap[k]?.cellar_wine_id) n++;
    return n;
  };

  // Re-reads every view after a write; resolves once this rack's slots are back,
  // so an optimistic fill hands over to the real one without a flicker.
  async function refreshViews() {
    invalidateCellarViews(qc);
    await qc.refetchQueries({ queryKey: ['rack-slots', rackId] }, { cancelRefetch: false });
  }

  function exitMode() {
    setMode({ kind: 'idle' });
    setSelected(new Set());
  }

  // ---- Bottles waiting for a slot here (Quick Command, a Lineup, a move) ----

  // The wine handed over by ?placeWine= runs its own placement bar, so it stays
  // out of the checklist until its flag clears (or the bar is cancelled).
  const [handedOverId, setHandedOverId] = useState<string | null>(params.placeWine ?? null);
  // Slots filled from the checklist on this visit, per wine — the only bottles
  // "untick" may take back out (never ones that were here before).
  const [sessionPlaced, setSessionPlaced] = useState<Record<string, string[]>>({});
  const [activeAwaitingId, setActiveAwaitingId] = useState<string | null>(null);
  // Wine + slot size pairs the user has already OK'd, so the size warning shows
  // once per wine, not on every tap.
  const sizeOk = useRef(new Set<string>());

  // Oldest first, so a Lineup's bottles queue in the order they were scanned.
  const awaitingWines = useMemo(
    () => wines
      .filter((w) => w.awaiting_placement_unit_id === rackId && w.id !== handedOverId
        && !(mode.kind === 'placeExisting' && mode.wine.id === w.id))
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [wines, rackId, handedOverId, mode],
  );

  // Bottles of each awaiting wine already placed ELSEWHERE: a merged wine with 4
  // of 5 bottles in another unit has just 1 to place here. Previous counts stay
  // on screen while a changed set of wines loads, but taps wait for them.
  const awaitingIds = useMemo(() => awaitingWines.map((w) => w.id).sort().join(','), [awaitingWines]);
  const elsewhere = useQuery({
    queryKey: ['awaiting-placed-elsewhere', rackId, awaitingIds],
    enabled: awaitingWines.length > 0,
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const byWine: Record<string, number> = {};
      for (const p of await fetchPlacementsForWines(awaitingWines.map((w) => w.id))) {
        if (p.kind === 'rack' && p.rack_id === rackId) continue;
        byWine[p.cellar_wine_id] = (byWine[p.cellar_wine_id] ?? 0) + (p.quantity ?? 0);
      }
      return byWine;
    },
  });
  const countsReady = elsewhere.isSuccess && !elsewhere.isPlaceholderData;
  const toPlaceHere = (w: CellarWine) => Math.max(0, (w.quantity ?? 1) - (elsewhere.data?.[w.id] ?? 0));
  const stillToPlace = (w: CellarWine) => Math.max(0, toPlaceHere(w) - countHere(w.id));
  const awaitingBottles = awaitingWines.reduce((sum, w) => sum + stillToPlace(w), 0);

  // The checklist: wines still waiting, plus ones finished on this visit (shown
  // ticked, so they can be taken out again while the rest are placed).
  const checklist = useMemo(() => {
    const done = wines.filter((w) => sessionPlaced[w.id]?.length && !awaitingWines.some((a) => a.id === w.id));
    return [...awaitingWines, ...done];
  }, [wines, awaitingWines, sessionPlaced]);

  // One checklist row: bottles placed here out of those to place here, and
  // whether a finished row can be taken back out.
  function checklistRow(w: CellarWine) {
    const waiting = awaitingWines.some((a) => a.id === w.id);
    const mine = sessionPlaced[w.id]?.length ?? 0;
    const total = waiting ? toPlaceHere(w) : mine;
    const placed = waiting ? Math.min(countHere(w.id), total) : mine;
    return { placed, total, done: placed >= total, canTakeOut: mine > 0 && placed >= total };
  }

  // Keep the ticked wine pointed at one that still has bottles to place.
  useEffect(() => {
    const open = awaitingWines.filter((w) => stillToPlace(w) > 0);
    if (!open.some((w) => w.id === activeAwaitingId)) setActiveAwaitingId(open[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [awaitingWines, countByWine, elsewhere.data]);

  // File the next bottle of the ticked wine into this empty slot.
  async function placeAwaitingAt(row: number, col: number) {
    if (!rack) return;
    const key = slotKey(row, col);
    if (isTaken(key)) return;
    if (!countsReady) { notify('One moment — checking which bottles still need a slot'); return; }
    const remaining = (w: CellarWine) => toPlaceHere(w) - countHereNow(w.id);
    const target = awaitingWines.find((w) => w.id === activeAwaitingId && remaining(w) > 0)
      ?? awaitingWines.find((w) => remaining(w) > 0);
    if (!target) { notify('Tick a wine below first'); return; }
    const sizeKey = `${target.id}:${row === -1 ? 'band' : 'grid'}`;
    if (!sizeOk.current.has(sizeKey)) {
      if (!(await warnIfSizeMismatch(target, rack, [row]))) return;
      sizeOk.current.add(sizeKey);
      if (isTaken(key) || remaining(target) <= 0) return;
    }
    const left = remaining(target) - 1;
    setOptimistic((m) => ({ ...m, [key]: target }));
    notify(left > 0 ? `Bottle placed — ${left} to go` : 'Bottle placed');
    try {
      const placed = await assignSlots(rackId, [{ row, col }], target.id);
      if (placed.length === 0) { notify('That slot was just filled — choose another'); return; }
      setSessionPlaced((s) => ({ ...s, [target.id]: [...(s[target.id] ?? []), key] }));
      if (left <= 0) await updateCellarWine(target.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
    } catch (err) {
      showAlert({ title: 'Could not place', body: errorBody(err) });
    } finally {
      await refreshViews();
      dropOptimistic([key]);
    }
  }

  // Untick a finished wine: take back out ONLY the bottles placed from the
  // checklist on this visit, after asking. They wait to be placed again.
  function takeBackOut(w: CellarWine) {
    const keys = sessionPlaced[w.id] ?? [];
    if (keys.length === 0) return;
    showAlert({
      title: 'Take these bottles out again?',
      body: `The ${bottles(keys.length)} of ${wineLabel(w)} you just placed will leave ${keys.length === 1 ? 'its slot' : 'their slots'} and wait to be placed again. Bottles that were already in this rack stay put.`,
      buttons: [
        { text: 'Take Out', style: 'destructive', onPress: async () => {
            try {
              const freed: string[] = [];
              for (const k of keys) {
                const { row, col } = parseSlotKey(k);
                if (await clearSlotOfWine(rackId, row, col, w.id)) freed.push(k);
              }
              setSessionPlaced((s) => ({ ...s, [w.id]: (s[w.id] ?? []).filter((k) => !freed.includes(k)) }));
              await updateCellarWine(w.id, { awaiting_placement: true, awaiting_placement_unit_id: rackId });
              setActiveAwaitingId(w.id);
            } catch (err) {
              showAlert({ title: 'Could not remove', body: errorBody(err) });
            } finally {
              await refreshViews();
            }
          } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // "Leave the rest unplaced": stop waiting for slots here. The bottles stay in
  // Your Cellar List, unplaced.
  async function leaveRestUnplaced() {
    try {
      for (const w of awaitingWines) await updateCellarWine(w.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
      notify('The rest stay in Your Cellar List, unplaced');
    } catch (err) {
      showAlert({ title: 'Could not update', body: errorBody(err) });
    } finally {
      await refreshViews();
    }
  }

  // ---- Placing existing bottles (?placeWine=) ----

  const placeWineHandled = useRef<string | null>(null);
  useEffect(() => {
    const id = params.placeWine;
    if (!id || placeWineHandled.current === id) return;
    const wine = wines.find((w) => w.id === id);
    // A move from another rack needs that rack's name and must never fall back
    // to placing new bottles, so wait for the racks list.
    const from = params.fromRack ? racks.find((r) => r.id === params.fromRack) : undefined;
    if (!wine || (params.fromRack && !from)) return;
    placeWineHandled.current = id;
    setHandedOverId(id);
    setSelected(new Set());
    setMode({
      kind: 'placeExisting',
      wine,
      limit: Math.max(1, parseInt(params.placeLimit ?? '1', 10) || 1),
      fromRack: from ? { id: from.id, name: from.name } : null,
    });
  }, [params.placeWine, params.placeLimit, params.fromRack, wines, racks]);

  function togglePlaceExisting(row: number, col: number) {
    if (mode.kind !== 'placeExisting') return;
    const key = slotKey(row, col);
    if (slotMap[key]?.cellar_wine_id) return;
    if (selected.has(key)) {
      setSelected((s) => { const n = new Set(s); n.delete(key); return n; });
      dropOptimistic([key]);
      return;
    }
    if (selected.size >= mode.limit) {
      notify(`That's all ${mode.limit} bottle${mode.limit === 1 ? '' : 's'} — tap Confirm.`);
      return;
    }
    if (isTaken(key)) return;
    setSelected((s) => new Set(s).add(key));
    setOptimistic((m) => ({ ...m, [key]: mode.wine }));
  }

  function cancelPlaceExisting() {
    if (mode.kind !== 'placeExisting') return;
    dropOptimistic(selected);
    // Nothing was freed for a move from another rack, so nothing to put back.
    if (mode.fromRack) notify(`Nothing moved — the bottles are still in ${mode.fromRack.name}`);
    exitMode();
    // A wine still flagged for this rack goes back to the regular checklist.
    setHandedOverId(null);
  }

  async function confirmPlaceExisting() {
    if (mode.kind !== 'placeExisting' || !rack || busy.current || selected.size === 0) return;
    const { wine, fromRack } = mode;
    const keys = [...selected];
    const slots = keys.map(parseSlotKey);
    busy.current = true;
    try {
      // Count again now: bottles may have been placed or moved since the
      // hand-off was made.
      const available = fromRack
        ? (await getRackSlots(fromRack.id)).filter((s) => s.cellar_wine_id === wine.id).length
        : Math.max(0, ((await getCellarWineById(wine.id))?.quantity ?? 0) - placedCount(await fetchPlacementsForWine(wine.id)));
      const targets = slots.slice(0, available);
      if (targets.length === 0) {
        showAlert({ title: 'Nothing left to place', body: fromRack ? `${wineLabel(wine)} is no longer in ${fromRack.name}.` : `Every bottle of ${wineLabel(wine)} is already placed.` });
        await finishPlaceExisting(keys);
        return;
      }
      // Cancelling the size warning keeps the chosen slots, to change them.
      if (!(await warnIfSizeMismatch(wine, rack, targets.map((s) => s.row)))) return;
      let placed: number;
      if (fromRack) {
        const { moved, refused } = await moveBottlesBetweenRacks(wine.id, fromRack.id, rackId, targets);
        placed = moved;
        if (refused) showAlert({ title: moved ? `Moved ${moved} of ${targets.length}` : 'Could not move', body: refused.message });
      } else {
        placed = (await assignSlots(rackId, targets, wine.id)).length;
        // A hand-off (e.g. Quick Command) may have flagged the wine for THIS
        // unit; it's placed now. A flag for a different unit is left alone.
        const live = wines.find((w) => w.id === wine.id) ?? wine;
        if (live.awaiting_placement_unit_id === rackId || (live.awaiting_placement && !live.awaiting_placement_unit_id)) {
          await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
        }
      }
      const missed = slots.length - placed;
      notify(missed > 0
        ? `${bottles(placed)} placed — ${missed} ${missed === 1 ? 'slot was' : 'slots were'} left empty`
        : `${placed === 1 ? 'Bottle' : bottles(placed)} placed in this rack`);
      await finishPlaceExisting(keys);
    } catch (err) {
      showAlert({ title: 'Could not place', body: errorBody(err) });
      await finishPlaceExisting(keys);
    } finally {
      busy.current = false;
    }
  }

  async function finishPlaceExisting(keys: string[]) {
    exitMode();
    await refreshViews();
    dropOptimistic(keys);
  }

  // ---- Choosing slots (new wine / Add More) ----

  const addMoreHandled = useRef(false);
  useEffect(() => {
    if (addMoreHandled.current || !params.addMoreWine) return;
    const wine = wines.find((w) => w.id === params.addMoreWine);
    if (!wine) return;
    addMoreHandled.current = true;
    startAddMore(wine.id, wineLabel(wine));
  }, [params.addMoreWine, wines]);

  function startAddMore(wineId: string, wineName: string) {
    setSelected(new Set());
    setMode({ kind: 'addMore', wineId, wineName });
  }

  function startMultiSelect(row: number, col: number) {
    setSelected(new Set([slotKey(row, col)]));
    setMode({ kind: 'multiSelect' });
  }

  function toggleSelected(row: number, col: number) {
    const key = slotKey(row, col);
    if (isTaken(key)) return;
    setSelected((s) => { const n = new Set(s); if (n.has(key)) n.delete(key); else n.add(key); return n; });
  }

  // Hand the chosen slots over to the add-a-wine flow, top-left first.
  function takeSelection(): SlotPos[] {
    const slots = [...selected].map(parseSlotKey).sort((a, b) => (a.row - b.row) || (a.col - b.col));
    exitMode();
    return slots;
  }

  // "Add More Bottles" → Save: one new bottle in each chosen slot, and the
  // wine's count rises by however many landed.
  async function saveAddMore() {
    if (mode.kind !== 'addMore' || !rack || busy.current || selected.size === 0) return;
    const { wineId } = mode;
    const wine = wines.find((w) => w.id === wineId);
    const slots = [...selected].map(parseSlotKey);
    if (wine && !(await warnIfSizeMismatch(wine, rack, slots.map((s) => s.row)))) return;
    busy.current = true;
    try {
      const placed = await assignSlots(rackId, slots, wineId);
      const fresh = await getCellarWineById(wineId);
      if (fresh && placed.length) await updateCellarWine(wineId, { quantity: (fresh.quantity ?? 0) + placed.length });
      const n = placed.length;
      notify(n === 1 ? 'Saved to rack & Cellar List' : `${n} bottles saved to rack & Cellar List`);
    } catch (err) {
      showAlert({ title: 'Could not place', body: errorBody(err) });
    } finally {
      busy.current = false;
      exitMode();
      await refreshViews();
    }
  }

  // ---- A just-added wine (pendingWineId) placed from a tapped slot ----

  async function placeNewWine(start: SlotPos, wineId: string, count: number, orientation: 'Vertical' | 'Horizontal'): Promise<boolean> {
    if (!rack) return false;
    const occupied = new Set([...Object.keys(slotMap).filter((k) => slotMap[k]?.cellar_wine_id), ...Object.keys(optimisticRef.current)]);
    const free = freeSlotsFrom(start.row, start.col, rack.rows, rack.cols, count, orientation, occupied, rack.large_format_cols);
    if (free.length === 0) {
      showAlert({ title: 'No empty slots', body: 'The next slots are already in use. Try a different starting position or orientation.' });
      return false;
    }
    const wine = wines.find((w) => w.id === wineId);
    if (wine && !(await warnIfSizeMismatch(wine, rack, free.map((s) => s.row)))) return false;
    const keys = free.map((s) => slotKey(s.row, s.col));
    if (wine) setOptimistic((m) => { const n = { ...m }; keys.forEach((k) => { n[k] = wine; }); return n; });
    const store = useRackStore.getState();
    try {
      const placed = (await assignSlots(rackId, free, wineId)).length;
      const fresh = await getCellarWineById(wineId);
      if (fresh) {
        const updates: Partial<CellarWine> = {};
        if (fresh.awaiting_placement) Object.assign(updates, { awaiting_placement: false, awaiting_placement_unit_id: null });
        // "+ Add bottles" adds to the wine's count; a brand-new wine was saved
        // with one bottle, so placing more backfills its count.
        if (store.pendingAddMode) updates.quantity = fresh.quantity + placed;
        else if (placed > fresh.quantity) updates.quantity = placed;
        if (Object.keys(updates).length) await updateCellarWine(wineId, updates);
      }
      store.setPendingWineId(null);
      store.setPendingAddMode(false);
      notify(placed === 1 ? 'Saved to rack & Cellar List' : `${placed} bottles saved to rack & Cellar List`);
      return true;
    } catch (err) {
      showAlert({ title: 'Could not place', body: errorBody(err) });
      return false;
    } finally {
      await refreshViews();
      dropOptimistic(keys);
    }
  }

  // ---- "Select from Cellar List" into the tapped slot(s) ----

  // A wine kept in an alt cellar or bin is MOVED here (the screen asks how many);
  // an unplaced one (or one in another rack) fills the tapped slots, never more
  // than its unplaced bottles — each slot is one real bottle.
  async function placeFromCellarList(wine: CellarWine, targets: SlotPos[]): Promise<MoveIntoRackPrompt | null> {
    if (!rack || targets.length === 0) return null;
    const placements = await fetchPlacementsForWine(wine.id);
    const stored = placements.filter((p) => p.kind === 'location' || p.kind === 'bin');
    const inStorage = placedCount(stored);
    if (inStorage > 0) {
      const names = [...new Set(stored.map((p) => (p.kind === 'location'
        ? (locations.find((l) => l.id === p.storage_location_id)?.name ?? 'a home storage location')
        : 'a wine bin')))];
      return { wine, where: names.join(' and '), max: inStorage, start: targets[0] };
    }
    const unplaced = Math.max(0, (wine.quantity ?? 0) - placedCount(placements));
    if (unplaced <= 0) {
      showAlert({
        title: 'No unplaced bottles',
        body: `Every bottle of ${wine.wine_name} is already placed. Use “+ Add bottles” on its wine card if you have more.`,
        buttons: [{ text: 'OK', style: 'cancel' }],
      });
      return null;
    }
    const chosen = targets.filter((s) => !isTaken(slotKey(s.row, s.col))).slice(0, unplaced);
    if (!(await warnIfSizeMismatch(wine, rack, chosen.map((s) => s.row)))) return null;
    try {
      const placed = (await assignSlots(rackId, chosen, wine.id)).length;
      const empty = targets.length - placed;
      showAlert({
        title: placed > 1 ? `Placed in ${placed} slots` : 'Placed in this rack',
        body: empty > 0
          ? `${wine.wine_name} had only ${bottles(unplaced)} unplaced (or a slot was taken meanwhile), so ${empty} of the slots you tapped ${empty === 1 ? 'was' : 'were'} left empty.`
          : `${wine.wine_name} is already in your Full Cellar List — it's now mapped to ${placed > 1 ? `${placed} slots` : 'a slot'} here too.`,
        buttons: [{ text: 'Done', style: 'cancel' }],
      });
    } catch (err) {
      showAlert({ title: 'Could not place wine', body: errorBody(err) });
    } finally {
      await refreshViews();
    }
    return null;
  }

  // Move `count` bottles of a wine from its alt cellar / bin into free slots
  // running from `start` (the quantity doesn't change — it's a move).
  async function moveIntoRack(prompt: MoveIntoRackPrompt, count: number) {
    if (!rack) return;
    const occupied = new Set([...Object.keys(slotMap).filter((k) => slotMap[k]?.cellar_wine_id), ...Object.keys(optimisticRef.current)]);
    const free = freeSlotsFrom(prompt.start.row, prompt.start.col, rack.rows, rack.cols, count, 'Vertical', occupied, rack.large_format_cols);
    if (free.length === 0) {
      showAlert({ title: 'No free slots', body: 'There are no free slots from here to place into. Try a different starting slot.' });
      return;
    }
    if (!(await warnIfSizeMismatch(prompt.wine, rack, free.map((s) => s.row)))) return;
    try {
      const placed = await moveIntoRackFromStorage(prompt.wine, count, rackId, free);
      notify(placed === 1 ? 'Bottle moved to this rack' : `${placed} bottles moved to this rack`);
    } catch (err) {
      showAlert({ title: 'Could not move', body: errorBody(err) });
    } finally {
      await refreshViews();
    }
  }

  return {
    mode, selected, optimistic, countHere, isTaken, refreshViews,
    // awaiting
    checklist, checklistRow, awaitingBottles, activeAwaitingId, setActiveAwaitingId,
    placeAwaitingAt, takeBackOut, leaveRestUnplaced,
    // placeExisting
    togglePlaceExisting, cancelPlaceExisting, confirmPlaceExisting,
    // choosing slots
    startAddMore, startMultiSelect, toggleSelected, takeSelection, saveAddMore, exitMode,
    // other paths
    placeNewWine, placeFromCellarList, moveIntoRack,
  };
}
