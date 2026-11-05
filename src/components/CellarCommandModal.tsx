import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MicButton } from './MicButton';
import { showAlert } from './AppAlert';
import { useAuth } from '../hooks/useAuth';
import { useCellar } from '../hooks/useCellar';
import { fetchStorageLocations } from '../api/storageLocations';
import { addCellarWine, addCellarWineRemoval, updateCellarWine, deleteCellarWine } from '../api/cellar';
import { getRacks, clearWineFromRacks, removeSlotsForWine } from '../api/racks';
import { getBins } from '../api/bins';
import { parseCellarCommand, type CellarCommandAction, type CellarCommandResult } from '../api/cellarCommand';
import { moveBottlesToLocation, releaseBottlesFromPlacements, fetchPlacementsForWine, fetchPlacementsForWines, placedCount, decrementPlacement, addLocationPlacement } from '../api/placements';
import { recommendFromCellar } from '../api/cellarRecommend';
import { useMoodPicksStore, type MoodPickView } from '../stores/moodPicksStore';
import type { CellarWine } from '../types/wine';
import { supabase } from '../api/supabase';
import { HomeVoiceModal } from './HomeVoiceModal';

const MARK = require('../../assets/vinster-mark.png');
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Phase = 'choose' | 'speak' | 'parsing' | 'pick' | 'confirm' | 'need' | 'success' | 'archiveNote' | 'error' | 'find' | 'found';


function wineLabel(w: CellarWine | undefined): string {
  if (!w) return 'this wine';
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ');
}

// Identity of a cellar wine for de-duping disambiguation candidates — producer +
// name + vintage + format. Two rows with the same identity are the SAME wine to
// the user, so offering them both as "which did you mean?" is never helpful.
function wineIdentityKey(w: CellarWine): string {
  return [
    (w.producer ?? '').toLowerCase().trim(),
    (w.wine_name ?? '').toLowerCase().trim(),
    w.vintage ?? '',
    w.bottle_size_ml ?? 750,
  ].join('|');
}
// Keep the first candidate id per distinct identity — collapses duplicate rows /
// a wine the model listed twice, so identical options never reach the picker.
function distinctCandidateIds(ids: string[], wines: CellarWine[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const w = wines.find((x) => x.id === id);
    if (!w) continue;
    const key = wineIdentityKey(w);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(id);
  }
  return out;
}


// A move whose DESTINATION is the Full Cellar List (i.e. unplace the bottles — take
// them out of an alt cellar / rack and leave them loose in the cellar). This isn't a
// storage location or a rack, so the parser can't resolve it as a destination; we
// detect the phrasing here and handle it as an unplace.
function mentionsCellarList(text: string): boolean {
  return /\b(full\s+)?cellar\s+list\b/i.test(text) || /\bunplace/i.test(text);
}

// Default intro copy + examples (the Cellar-tab, full-scope voice command).
// A caller (e.g. a home-storage location screen) can override these to present
// a scoped explainer — the underlying move/archive/add engine is unchanged.
const DEFAULT_INTRO_TEXT = 'Use Quick Command to: Move wines between storage locations, Archive bottles, Add them to your cellar list to place later, permanently Delete bottles, or ask Vinster to recommend wines to drink based on your mood and occasion.';
const DEFAULT_SUGGESTIONS = [
  'Move my Lafite 1982 from my wine fridge to my small wine rack',
  'Archive 3 bottles of Harlan 1990',
  'Delete two bottles of Sassicaia 2007',
  "It's cold and raining, I want a smooth red wine for the fireside.",
];

// Shared preset for the "Voice Command" entry on EVERY home-storage location
// screen (racks, fridges, bins, alt cellars): move/archive only, scoped copy +
// examples. Spread into <CellarCommandModal {...HOME_STORAGE_VOICE} /> so all
// four screen types stay identical.
export const HOME_STORAGE_VOICE: { introText: string; suggestions: string[]; allowedActions: CellarCommandAction[] } = {
  introText: 'Through your home storage locations you can use Quick Command to: Move wines from this location to another, Archive bottles, and permanently Delete bottles.',
  suggestions: [
    'Move two bottles of Rousseau 1999 to My Small Wine Bin',
    'Archive one bottle of Lafite 1961',
    'Delete three bottles of Barbaresco 2017 from this bin',
  ],
  allowedActions: ['move', 'archive', 'delete'],
};

export function CellarCommandModal({ visible, onClose, introText, suggestions, allowedActions, locationName }: { visible: boolean; onClose: () => void; introText?: string; suggestions?: string[]; allowedActions?: CellarCommandAction[]; locationName?: string | null }) {
  void introText; void suggestions; // superseded by the Quick Command layout (kept for callers)
  // Hide while another screen (e.g. the rack placement screen) is in front; come
  // back to the same state (e.g. the done line) when the user returns.
  const [focused, setFocused] = useState(true);
  useFocusEffect(useCallback(() => { setFocused(true); return () => setFocused(false); }, []));
  const pathname = usePathname();
  const [chooseOpen, setChooseOpen] = useState(false);
  const [chooseShown, setChooseShown] = useState(false);
  // Hand over to the chat after the sheet's own dismissal has finished.
  useEffect(() => {
    if (!chooseOpen) return;
    const t = setTimeout(() => setChooseShown(true), 450);
    return () => clearTimeout(t);
  }, [chooseOpen]);
  const { session } = useAuth();
  const { height: winH } = useWindowDimensions();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { wines } = useCellar();
  const { data: locations = [] } = useQuery({
    queryKey: ['storage-locations', userId],
    queryFn: () => fetchStorageLocations(userId!),
    enabled: !!userId,
  });
  // Placement units a voice move can target — racks & fridges plus bins (all
  // wine_racks rows). Each destination screen surfaces awaiting-placement
  // bottles so a moved bottle is never invisible.
  const { data: units = [] } = useQuery({
    queryKey: ['placement-units', userId],
    queryFn: async () => [...(await getRacks(userId!)), ...(await getBins(userId!))],
    enabled: !!userId,
  });

  const [phase, setPhase] = useState<Phase>('speak');
  const [action, setAction] = useState<CellarCommandAction>('move');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<CellarCommandResult | null>(null);
  const [chosenWineId, setChosenWineId] = useState<string | null>(null);
  // Move destination is the Full Cellar List (unplace), not a location/rack/bin.
  const [moveToCellarList, setMoveToCellarList] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState<{
    action: 'move' | 'archive' | 'add' | 'delete';
    wine: string;        // producer + name
    meta: string;        // region · vintage
    detail: string;      // "from X to Y" (move) / "N bottles archived" (archive)
    viewLabel: string;   // "View in <destination>"
    viewRoute: string;
    wineId?: string;     // cellar_wine id of the acted-on wine (archive note target)
  } | null>(null);
  // Draft archive note typed on the post-archive success screen.
  const [archiveNote, setArchiveNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const chosenWine = wines.find((w) => w.id === chosenWineId);
  const targetLocation = locations.find((l) => l.id === result?.locationId);
  const targetUnit = units.find((u) => u.id === result?.unitId);
  const destName = moveToCellarList ? 'your Full Cellar List' : (targetUnit?.name ?? targetLocation?.name ?? null);

  function reset() {
    setPhase('speak');
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setMoveToCellarList(false);
    setSuccess(null);
    setArchiveNote('');
  }

  function handleClose() {
    reset();
    onClose();
  }

  // Decide whether a spoken command is a free-form mood / recommendation vs a
  // Move / Archive / Add instruction. Commands are treated STRICTLY: a clear
  // "move/archive/add" instruction must never be mistaken for a recommendation.
  // Priority order:
  //   1. A command verb led by an optional polite/desire preamble ("I want to
  //      move…", "please add…", "can you archive…") is ALWAYS a command — the
  //      desire words ("I want", "I'd like") are how people phrase commands too,
  //      so they never by themselves mean "recommend".
  //   2. A command verb co-occurring with a source/destination preposition
  //      ("move X from the bin to the fridge") is ALWAYS a command.
  //   3. Otherwise, genuine recommendation phrasing → mood.
  //   4. Otherwise it's a command only if it names a verb at all; else → mood.
  function isMoodCommand(t: string): boolean {
    const s = t.trim();
    // 1. Leading command, allowing a polite/desire preamble before the verb.
    const preamble = '(please\\s+|can you\\s+|could you\\s+|would you\\s+|will you\\s+|vinster,?\\s+|i\\s+want\\s+to\\s+|i\\s+wanna\\s+|i\'?d\\s+like\\s+to\\s+|i\\s+would\\s+like\\s+to\\s+|i\\s+need\\s+to\\s+|i\'?d\\s+want\\s+to\\s+|let\'?s\\s+|please\\s+can\\s+you\\s+)';
    if (new RegExp(`^(${preamble})*(move|archive|add|delete|remove)\\b`, 'i').test(s)) return false;
    const hasCommandVerb = /\bmove(s|d|ing)?\b/i.test(s) || /\barchiv/i.test(s) || /\badd(s|ed|ing)?\b/i.test(s) || /\bdelet/i.test(s) || /\bremove(s|d|ing)?\b/i.test(s);
    // 2. A command verb plus a source/destination preposition is an unambiguous
    //    action ("…move… from… to…", "…add… into…").
    if (hasCommandVerb && /\b(from|to|into|out of|onto)\b/i.test(s)) return false;
    // 3. Genuine recommendation phrasing. NB the bare desire verbs (i want,
    //    i'd like, i need…) are deliberately NOT here — they equally precede
    //    commands, so on their own they must not force a recommendation.
    const moodSignal = /\b(mood|recommend(ation)?s?|suggest(ion)?s?|feel like|i fancy|in the mood|craving|treat myself|what should i|which wine|what (wine )?(should|would|do|can) i|help me (choose|pick|decide)|pair(ing)?( with)?|goes (well )?with|open tonight|for (dinner|tonight|a celebration|an occasion|the occasion)|celebrat|something (smooth|light|bold|rich|crisp|warming|cold|warm|fruity|elegant|special|celebratory|festive|easy|refreshing|full[- ]?bodied|delicate|spicy|sweet|savoury))\b/i.test(s);
    if (moodSignal) return true;
    // 4. A stray command verb anywhere → command; otherwise mood.
    return !hasCommandVerb;
  }

  async function runMoodRecommend() {
    setPhase('parsing');
    try {
      // "What should I open?" should only suggest bottles that are actually to
      // hand — exclude wines living ONLY in external / offsite cellars, since
      // those aren't easily accessible. If the user explicitly asks for
      // something from storage/offsite (to be delivered or collected), keep them.
      const wantsStorage = /\b(storage|stored|external|offsite|off-site|bonded|deliver|delivered|collect|collection|reserves?)\b/i.test(transcript);
      let candidateWines = wines;
      if (!wantsStorage) {
        const externalLocIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
        if (externalLocIds.size > 0) {
          const pls = await fetchPlacementsForWines(wines.map((w) => w.id));
          const extByWine = new Map<string, number>();
          for (const p of pls) {
            if (p.kind === 'location' && p.storage_location_id && externalLocIds.has(p.storage_location_id)) {
              extByWine.set(p.cellar_wine_id, (extByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
            }
          }
          candidateWines = wines.filter((w) => {
            const ext = extByWine.get(w.id) ?? 0;
            // Legacy single-location filing straight onto the wine row.
            const legacyExternalOnly = !!w.storage_location_id && externalLocIds.has(w.storage_location_id) && ext === 0;
            if (legacyExternalOnly) return false;
            // Keep the wine if at least one bottle is home/loose (not external).
            return (w.quantity ?? 0) - ext > 0;
          });
        }
      }
      const picks = await recommendFromCellar(transcript, candidateWines);
      const views = picks
        .map((p) => {
          const w = wines.find((x) => x.id === p.id);
          return w ? { wine: w, rank: p.rank, why: p.why } : null;
        })
        .filter(Boolean) as MoodPickView[];
      if (views.length === 0) { setPhase('need'); return; }
      useMoodPicksStore.getState().set(transcript.trim(), views);
      router.push('/cellar/mood-picks' as any);
      handleClose();
    } catch {
      setPhase('error');
    }
  }

  async function runParse() {
    if (!transcript.trim()) return;
    // Mood / recommendation — a free description, handled by its own flow. But a
    // SCOPED caller (a home storage location, allowedActions set to move/archive)
    // doesn't offer recommendations, so don't silently run mood picks there —
    // honour the scope the intro copy promised.
    if (isMoodCommand(transcript)) {
      if (allowedActions) {
        showAlert({
          title: 'Not available here',
          body: 'From a home storage location you can move bottles to another location, archive them, or delete them. For a recommendation, use Vinster on the Cellar or Pair tab.',
        });
        return;
      }
      runMoodRecommend();
      return;
    }
    // Free-form command: infer the verb from the words rather than making the
    // user pick it up front. "add" (a new bottle) first, then archive, else move.
    const act: CellarCommandAction = /\badd(s|ed|ing)?\b/i.test(transcript)
      ? 'add'
      : /\bdelet/i.test(transcript) ? 'delete'
      : /\barchiv/i.test(transcript) ? 'archive' : 'move';
    // A move whose destination is the Full Cellar List = unplace (take the bottles out
    // of an alt cellar / rack and leave them loose). Not a resolvable parser
    // destination, so detect the phrasing and handle it specially.
    const wantsCellarList = act === 'move' && mentionsCellarList(transcript);
    setMoveToCellarList(wantsCellarList);
    // We no longer force a vintage up front: the parser resolves the wine by name
    // (phonetically), multiple matching vintages come back as candidates → the "which
    // one?" pick step, and a single match lands on the confirm step (which shows the
    // vintage before anything happens). Demanding a vintage blocked clear commands
    // like "move one bottle of Rieussec to my full cellar list".
    // Scoped callers (e.g. a home storage location) may only permit some verbs —
    // e.g. move/archive but not "add". Nudge the user to the right tool instead.
    if (allowedActions && !allowedActions.includes(act)) {
      showAlert({
        title: 'Not available here',
        body: "From a home storage location you can move bottles to another location or archive them. To add a new wine, use the + Add Wine button.",
      });
      setPhase('speak');
      return;
    }
    setAction(act);
    setPhase('parsing');
    try {
      // 'delete' resolves identically to 'archive' (a wine + a count, no
      // destination) — only the end action differs — so parse it as archive.
      let res = await parseCellarCommand(act === 'delete' ? 'archive' : act, transcript, wines, locations, units);

      // A MOVE here targets HOME storage, so a wine that lives ONLY in an
      // external/offsite cellar can't be the one meant — drop it from the
      // candidates (and from a lone resolved match) so it's never offered.
      if (act === 'move') {
        const externalLocIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
        if (externalLocIds.size > 0) {
          const ids = Array.from(new Set([...(res.candidates ?? []), res.wineId].filter(Boolean))) as string[];
          if (ids.length) {
            const pls = await fetchPlacementsForWines(ids);
            const extByWine = new Map<string, number>();
            for (const p of pls) {
              if (p.kind === 'location' && p.storage_location_id && externalLocIds.has(p.storage_location_id)) {
                extByWine.set(p.cellar_wine_id, (extByWine.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
              }
            }
            const externalOnly = (wid: string) => {
              const w = wines.find((x) => x.id === wid);
              const ext = extByWine.get(wid) ?? 0;
              if (!!w?.storage_location_id && externalLocIds.has(w.storage_location_id) && ext === 0) return true;
              return ext > 0 && (w?.quantity ?? 0) - ext <= 0;
            };
            res = {
              ...res,
              candidates: (res.candidates ?? []).filter((c) => !externalOnly(c)),
              wineId: res.wineId && externalOnly(res.wineId) ? null : res.wineId,
            };
          }
        }
      }

      setResult(res);

      // Add is a NEW bottle — it doesn't resolve against the existing cellar, it
      // just needs a wine name (+ count), then goes straight to confirm.
      if (act === 'add') {
        const a = res.add;
        if (res.needs === 'wine' || !a || (!a.producer && !a.wineName)) { setPhase('need'); return; }
        setPhase('confirm');
        return;
      }

      // move / archive both need a resolved wine
      if (!res.wineId || res.needs === 'wine') {
        // Collapse candidates that are the same wine (duplicate cellar rows / a wine
        // listed twice) so identical "which did you mean?" options never appear.
        const distinct = distinctCandidateIds(res.candidates, wines);
        if (distinct.length > 1) { setResult({ ...res, candidates: distinct }); setPhase('pick'); return; }
        if (distinct.length === 1) { setChosenWineId(distinct[0]); setPhase('confirm'); return; }
        setPhase('need');
        return;
      }
      // A move needs a destination — an Alt Cellar, a rack/fridge/bin, OR the Full
      // Cellar List (unplace). Only nag for a destination when it isn't the cellar-list
      // case, which has no locationId/unitId by design.
      if (act === 'move' && !wantsCellarList && (res.needs === 'location' || (!res.locationId && !res.unitId))) {
        setPhase('need');
        return;
      }
      setChosenWineId(res.wineId);
      setPhase('confirm');
    } catch {
      setPhase('error');
    }
  }

  async function execute() {
    if (executing) return;
    if (action !== 'add' && !chosenWine) return;
    setExecuting(true);
    try {
      if (action === 'move') {
        if (!chosenWine) return;
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const whole = count >= chosenWine.quantity;
        const fromName = chosenWine.storage_location_id
          ? (locations.find((l) => l.id === chosenWine.storage_location_id)?.name ?? 'your cellar')
          : 'your cellar';

        // Destination is the Full Cellar List → UNPLACE the bottles: take them out of
        // wherever they sit (alt cellar / rack) and leave them loose in the cellar.
        // Quantity is unchanged — the bottles don't leave the cellar, just their spot.
        if (moveToCellarList) {
          // Free `count` HOME bottles (racks, then bins and home cellars — never
          // offsite stock); quantity is unchanged, so they become loose.
          await releaseHomeBottles(chosenWine.id, count);
          if (whole) await updateCellarWine(chosenWine.id, { storage_location_id: null, case_id: null, bin_cell_id: null, awaiting_placement: false, awaiting_placement_unit_id: null });
          qc.invalidateQueries({ queryKey: ['cellar', userId] });
          qc.invalidateQueries({ queryKey: ['placements', chosenWine.id] });
          qc.invalidateQueries({ queryKey: ['placements-list'] });
          qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
          qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
          qc.invalidateQueries({ queryKey: ['rack-slots'] });
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          setSuccess({
            action: 'move',
            wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
            meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
            detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} · from ${fromName} to your Full Cellar List`,
            viewLabel: 'View in Cellar List',
            viewRoute: '/cellar/list',
          });
          return;
        }

        if (!result?.locationId && !result?.unitId) return;
        const toName = destName ?? 'its new location';
        // One wine = one Cellar List line: moved bottles stay on THIS row.
        const movedWineId: string = chosenWine.id;
        void whole;

        if (result?.locationId) {
          // Destination is an alt cellar — go placement-native + merge-aware so
          // the bottles actually land there (and consolidate onto an existing
          // line, e.g. bumping a 3-bottle count to 4) instead of vanishing.
          await moveBottlesToLocation(chosenWine, result.locationId, count);
        } else {
          // Destination is a rack/fridge/bin. Free `count` HOME bottles from where
          // they sit (racks, bins, home cellars — never offsite), keeping them on
          // the SAME row (no second Cellar List line), and mark them awaiting
          // placement in that unit until the user picks slots/cells there.
          await releaseHomeBottles(chosenWine.id, count);
          await updateCellarWine(chosenWine.id, { awaiting_placement: true, awaiting_placement_unit_id: result!.unitId });
        }
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['racks', userId] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['bins', userId] });
        const viewRoute = result?.unitId
          ? (targetUnit?.storage_type === 'bin' ? `/cellar/bin/${result.unitId}` : `/cellar/rack/${result.unitId}`)
          : `/cellar/storage-location/${result!.locationId}`;
        setSuccess({
          action: 'move',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: result?.locationId
            ? `${count} ${count === 1 ? 'bottle' : 'bottles'} of ${wineLabel(chosenWine)} moved to your alt cellar ${toName}. Navigate to that cellar to place the wine more precisely.`
            : `Moved. ${count} ${count === 1 ? 'bottle' : 'bottles'} of ${wineLabel(chosenWine)} ${count === 1 ? 'is' : 'are'} now in the ${toName}.`,
          viewLabel: result?.locationId ? `Go to ${toName}` : `View the ${toName}`,
          viewRoute,
        });
        // Racks/fridges: open the REAL rack screen in placement mode on the moved
        // bottles (the user always picks the slots). Bins: open the bin, which
        // surfaces awaiting-placement bottles. This sheet hides while that screen
        // is in front and shows the done line when they come back.
        if (result?.unitId) {
          setTranscript('');
          setPhase('success');
          setExecuting(false);
          router.push((targetUnit?.storage_type === 'bin'
            ? `/cellar/bin/${result.unitId}`
            : `/cellar/rack/${result.unitId}${movedWineId ? `?placeWine=${movedWineId}&placeLimit=${count}` : ''}`) as any);
          return;
        }
      } else if (action === 'archive') {
        if (!chosenWine) return;
        // archive — mirror the Chef pairing "Select & Archive" flow so the
        // removal log and archive stats stay consistent.
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const removedAt = new Date().toISOString();
        await addCellarWineRemoval({ cellarWineId: chosenWine.id, removedAt, count, note: 'Archived via Quick Command' });
        if (count >= chosenWine.quantity) {
          await updateCellarWine(chosenWine.id, { quantity: count, archived_at: removedAt });
        } else {
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
          const { id, created_at, updated_at, ...rest } = chosenWine;
          await addCellarWine({ ...rest, quantity: count, archived_at: removedAt, is_wishlist: false });
        }
        // Free the archived bottles from their storage so a placement count never
        // lingers above the wine's quantity (e.g. "3 bottles in Large Wine Rack"
        // after archiving down to 2). Take from LOOSE/unplaced bottles first —
        // only free actual placements (rack/fridge slots, then alt cellars) for
        // any that exceed the loose count (mirrors the wine card's archive flow).
        const winePlacements = await fetchPlacementsForWine(chosenWine.id);
        const unplaced = Math.max(0, (chosenWine.quantity ?? 0) - placedCount(winePlacements));
        const toRelease = Math.max(0, count - unplaced);
        if (toRelease > 0) await releaseBottlesFromPlacements(chosenWine.id, toRelease);
        qc.invalidateQueries({ queryKey: ['placements', chosenWine.id] });
        qc.invalidateQueries({ queryKey: ['placements-list'] });
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-removals', chosenWine.id] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        // Refresh the alt-cellar screens too — archiving a bottle that lived in a
        // home storage location must remove its thumbnail there straight away.
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        setSuccess({
          action: 'archive',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} moved to Your Cellar Archive`,
          viewLabel: 'View in Your Cellar Archive',
          viewRoute: '/cellar/list?archived=1',
          wineId: chosenWine.id,
        });
      } else if (action === 'delete') {
        if (!chosenWine) return;
        // Permanent delete — no archive, no removal log. Takes a count; delete
        // the whole row when it covers every bottle, else just decrement. Free
        // the deleted bottles from any placements first (loose-first, mirroring
        // archive) so a rack/bin/alt-cellar count never lingers above quantity.
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        if (count >= (chosenWine.quantity ?? 0)) {
          await clearWineFromRacks(chosenWine.id);
          await deleteCellarWine(chosenWine.id);
        } else {
          const winePlacements = await fetchPlacementsForWine(chosenWine.id);
          const unplaced = Math.max(0, (chosenWine.quantity ?? 0) - placedCount(winePlacements));
          const toRelease = Math.max(0, count - unplaced);
          if (toRelease > 0) await releaseBottlesFromPlacements(chosenWine.id, toRelease);
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
        }
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['placements', chosenWine.id] });
        qc.invalidateQueries({ queryKey: ['placements-list'] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        qc.invalidateQueries({ queryKey: ['bins', userId] });
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        setSuccess({
          action: 'delete',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} permanently deleted`,
          viewLabel: 'View your Cellar List',
          viewRoute: '/cellar/list',
        });
      } else {
        // add — a brand-new bottle straight to Your Cellar List, awaiting
        // placement so the user slots it into storage later.
        const a = result?.add;
        if (!a) return;
        const count = Math.max(1, result?.quantity ?? 1);
        const name = (a.wineName ?? a.producer ?? '').trim() || 'Unnamed wine';
        const payload: Omit<CellarWine, 'id' | 'created_at' | 'updated_at'> = {
          user_id: userId!,
          wine_name: name,
          producer: a.producer ?? null,
          region: a.region ?? null,
          vintage: a.vintage ?? null,
          quantity: count,
          storage_location: null,
          date_received: new Date().toISOString().split('T')[0],
          critic_score: null,
          critic_score_note: null,
          drinking_window_from: null,
          drinking_window_to: null,
          drinking_window_status: 'unknown',
          tasting_notes: null,
          grape_variety: null,
          style: null,
          label_image_path: null,
          user_notes: null,
          review_note: null,
          is_wishlist: false,
          archived_at: null,
          purchase_price: null,
          purchase_price_currency: null,
          estimated_value: null,
          estimated_value_currency: null,
          estimated_value_at: null,
          estimated_value_source: null,
          wine_knowledge: null,
          wine_knowledge_at: null,
          review_score: null,
          review_location: null,
          review_date: null,
          user_drinking_window: null,
          review_entries: [],
          is_favourite: false,
          label_favourite: false,
          bottle_size_ml: 750,
          storage_location_id: null,
          // Into an alt cellar: filed there below as a placement. Otherwise loose,
          // awaiting placement in the Cellar List.
          awaiting_placement: !result?.locationId,
        };
        // One wine = one line: an identical wine already in the cellar just gets
        // the extra bottles.
        const norm = (x?: string | null) => (x ?? '').trim().toLowerCase();
        const twin = wines.find((w) => !w.archived_at && !w.is_wishlist
          && norm(w.producer) === norm(payload.producer) && norm(w.wine_name) === norm(payload.wine_name) && norm(w.vintage) === norm(payload.vintage));
        let addedId: string;
        if (twin) {
          await updateCellarWine(twin.id, { quantity: (twin.quantity ?? 0) + count });
          addedId = twin.id;
        } else {
          const row = await addCellarWine(payload);
          addedId = row.id;
        }
        if (result?.locationId) await addLocationPlacement(addedId, result.locationId, null, count);
        qc.invalidateQueries({ queryKey: ['placements', addedId] });
        qc.invalidateQueries({ queryKey: ['placements-list'] });
        qc.invalidateQueries({ queryKey: ['storage-locations', userId] });
        qc.invalidateQueries({ queryKey: ['storage-location-wines'] });
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        setSuccess({
          action: 'add',
          wine: [a.producer, a.wineName].filter(Boolean).join(' ') || name,
          meta: [a.region, a.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} added to Your Cellar List — awaiting placement`,
          viewLabel: 'View in Your Cellar List',
          viewRoute: '/cellar/list',
        });
      }
      setTranscript('');
      setPhase('success');
    } catch {
      setPhase('error');
    } finally {
      setExecuting(false);
    }
  }

  // Save the typed note onto the just-archived wine, then close. Guards against a
  // missing id (nothing to attach the note to) and a double-tap while saving.
  async function saveArchiveNote() {
    if (savingNote) return;
    const id = success?.wineId;
    if (!id) { handleClose(); return; }
    setSavingNote(true);
    try {
      const note = archiveNote.trim().slice(0, 100) || null;
      await updateCellarWine(id, { archive_note: note });
      qc.invalidateQueries({ queryKey: ['cellar', userId] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
      handleClose();
    } catch {
      setPhase('error');
    } finally {
      setSavingNote(false);
    }
  }

  // The confirm sentence for move / archive — always states the bottle count.
  function confirmText(): string {
    if (action === 'add') {
      const a = result?.add;
      const label = [a?.producer, a?.wineName, a?.vintage].filter(Boolean).join(' ') || 'this wine';
      const n = Math.max(1, result?.quantity ?? 1);
      return `Add ${n} ${n === 1 ? 'bottle' : 'bottles'} of ${label} to your cellar list?`;
    }
    const count = Math.min(chosenWine?.quantity ?? 1, Math.max(1, result?.quantity ?? (chosenWine?.quantity ?? 1)));
    const bottles = `${count} ${count === 1 ? 'bottle' : 'bottles'}`;
    if (action === 'move') return `Move ${bottles} of ${wineLabel(chosenWine)} to ${destName ?? 'the chosen location'}?`;
    if (action === 'delete') return `Permanently delete ${bottles} of ${wineLabel(chosenWine)}? This can't be undone.`;
    return `Archive ${bottles} of ${wineLabel(chosenWine)}?`;
  }

  const candidateWines = (result?.candidates ?? []).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];

  // Storage screens (rack / fridge / bin / alt cellar) are scoped: no Add, and
  // "Find a bottle in this location" instead of "Choose from my cellar".
  const scoped = !!allowedActions;
  const prompts = scoped
    ? ['Archive X bottles of...', 'Move X bottles of... to another location', 'Delete X bottles of...']
    : ['Archive X bottles of...', 'Move X bottles of...', 'Add X bottles of...', 'Delete X bottles of...'];

  // Free `n` bottles from HOME storage only: rack/fridge slots first, then bin
  // cells and home alt cellars. Offsite/external cellars are never touched by a
  // move or unplace (that stock isn't to hand).
  async function releaseHomeBottles(wineId: string, n: number): Promise<number> {
    if (n <= 0) return 0;
    let freed = await removeSlotsForWine(wineId, n);
    if (freed >= n) return freed;
    const externalIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
    const rest = (await fetchPlacementsForWine(wineId)).filter((p) =>
      p.kind === 'bin' || (p.kind === 'location' && !(p.storage_location_id && externalIds.has(p.storage_location_id))));
    for (const p of rest) {
      if (freed >= n) break;
      const take = Math.min(n - freed, p.quantity ?? 0);
      if (take > 0) { await decrementPlacement(p.id, take); freed += take; }
    }
    return freed;
  }

  function restate() { setTranscript(''); setResult(null); setChosenWineId(null); setPhase('speak'); }

  // ---- Find a bottle ----------------------------------------------------
  // One location → that location's real screen opens straight away with the
  // wine highlighted (no reply). Two or more → Vinster lists them with links;
  // coming back from one returns here to open the other.
  const [findText, setFindText] = useState('');
  const [findResult, setFindResult] = useState<
    | { kind: 'many'; label: string; total: number; places: { name: string; route: string; count: number }[] }
    | { kind: 'others'; asked: string; others: { label: string; places: { name: string; route: string; count: number }[] }[] }
    | { kind: 'none'; asked: string }
    | null
  >(null);

  async function placesFor(w: CellarWine): Promise<{ name: string; route: string; count: number }[]> {
    const pls = await fetchPlacementsForWine(w.id);
    const out = new Map<string, { name: string; route: string; count: number }>();
    const add = (key: string, name: string, route: string, n: number) => {
      const cur = out.get(key);
      if (cur) cur.count += n; else out.set(key, { name, route, count: n });
    };
    const binCellIds = pls.filter((p) => p.kind === 'bin' && p.bin_cell_id).map((p) => p.bin_cell_id as string);
    const cellToBin = new Map<string, string>();
    if (binCellIds.length) {
      const { data } = await supabase.from('bin_cells').select('id, bin_id').in('id', binCellIds);
      (data ?? []).forEach((r: any) => cellToBin.set(r.id, r.bin_id));
    }
    for (const p of pls) {
      const n = p.quantity ?? 1;
      if (p.kind === 'rack' && p.rack_id) {
        const u = units.find((x) => x.id === p.rack_id);
        add(`r:${p.rack_id}`, u?.name ?? 'Rack', `/cellar/rack/${p.rack_id}?highlight=${w.id}`, n);
      } else if (p.kind === 'bin' && p.bin_cell_id) {
        const binId = cellToBin.get(p.bin_cell_id);
        if (binId) add(`b:${binId}`, units.find((x) => x.id === binId)?.name ?? 'Bin', `/cellar/bin/${binId}?highlight=${w.id}`, n);
      } else if (p.kind === 'location' && p.storage_location_id) {
        add(`l:${p.storage_location_id}`, locations.find((l) => l.id === p.storage_location_id)?.name ?? 'Cellar', `/cellar/storage-location/${p.storage_location_id}?highlight=${w.id}`, n);
      }
    }
    // Bottles with no placement row: waiting to be placed in a rack/bin, filed
    // the older way on the wine itself, or simply loose in the Cellar List.
    const placed = Array.from(out.values()).reduce((n, p) => n + p.count, 0);
    const rest = Math.max(0, (w.quantity ?? 0) - placed);
    if (rest > 0) {
      const unit = w.awaiting_placement_unit_id ? units.find((u) => u.id === w.awaiting_placement_unit_id) : null;
      const loc = !unit && w.storage_location_id ? locations.find((l) => l.id === w.storage_location_id) : null;
      if (unit) add(`u:${unit.id}`, `${unit.name} (waiting to be placed)`, unit.storage_type === 'bin' ? `/cellar/bin/${unit.id}?highlight=${w.id}` : `/cellar/rack/${unit.id}?placeWine=${w.id}&placeLimit=${rest}`, rest);
      else if (loc) add(`l:${loc.id}`, loc.name, `/cellar/storage-location/${loc.id}?highlight=${w.id}`, rest);
      else add('loose', 'Your Cellar List (not yet placed)', `/cellar/${w.id}`, rest);
    }
    return Array.from(out.values());
  }

  async function runFind() {
    const asked = findText.trim();
    if (!asked) return;
    setPhase('parsing');
    try {
      const res = await parseCellarCommand('archive', asked, wines, locations, units);
      const match = res.wineId ? wines.find((w) => w.id === res.wineId) : null;
      if (match) {
        const places = await placesFor(match);
        if (places.length === 1) {
          // One place: open it straight away (no reply).
          setFindResult(null);
          setPhase('find');
          const [path, query] = places[0].route.split('?');
          if (path === pathname) {
            // Already on that screen: highlight in place rather than stacking a copy.
            const params = Object.fromEntries((query ?? '').split('&').filter(Boolean).map((kv) => { const [k, v = ''] = kv.split('='); return [k, decodeURIComponent(v)]; }));
            router.setParams(params as any);
          } else {
            router.push(places[0].route as any);
          }
          return;
        }
        if (places.length > 1) {
          setFindResult({ kind: 'many', label: wineLabel(match), total: places.reduce((n, p) => n + p.count, 0), places });
          setPhase('found');
          return;
        }
      }
      // The asked-for vintage isn't stored: offer other vintages of the wine.
      const others = distinctCandidateIds(res.candidates, wines).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];
      if (others.length) {
        const withPlaces = await Promise.all(others.slice(0, 4).map(async (w) => ({ label: wineLabel(w), places: await placesFor(w) })));
        setFindResult({ kind: 'others', asked, others: withPlaces });
      } else {
        setFindResult({ kind: 'none', asked });
      }
      setPhase('found');
    } catch {
      setPhase('error');
    }
  }

  const title = scoped && locationName ? `What would you like to do in your ${locationName}?` : 'What would you like to do?';
  const count = Math.min(chosenWine?.quantity ?? 1, Math.max(1, result?.quantity ?? (chosenWine?.quantity ?? 1)));
  const bottles = `${count} ${count === 1 ? 'bottle' : 'bottles'}`;

  // The confirm card for each action.
  function ConfirmCard() {
    if (action === 'add') {
      const a = result?.add;
      const n = Math.max(1, result?.quantity ?? 1);
      return (
        <View style={qs.card}>
          <Text style={qs.cardAction}>Add</Text>
          <Text style={qs.cardWine}>{[a?.producer, a?.wineName, a?.vintage].filter(Boolean).join(' · ') || 'This wine'}</Text>
          <Text style={qs.cardLine}>{`${n} ${n === 1 ? 'bottle' : 'bottles'} · ${targetLocation?.name ?? 'Your Cellar List'}`}</Text>
          <Text style={qs.cardLine}>Wine Intel builds in the background</Text>
        </View>
      );
    }
    return (
      <View style={qs.card}>
        <Text style={qs.cardAction}>{action === 'move' ? 'Move' : action === 'delete' ? 'Delete' : 'Archive'}</Text>
        <Text style={qs.cardWine}>{wineLabel(chosenWine)}</Text>
        <Text style={qs.cardLine}>{action === 'move' ? `${bottles} · → ${destName ?? 'the chosen location'}` : action === 'archive' ? `${bottles} · dated today` : bottles}</Text>
        {action === 'delete' ? <Text style={qs.warn}>This permanently removes them from your records. If you drank them, archive them instead.</Text> : null}
      </View>
    );
  }

  const confirmLabel = action === 'move'
    ? (result?.unitId ? 'Confirm & Select Placement' : 'Confirm move')
    : action === 'archive' ? 'Confirm archive'
    : action === 'add' ? 'Confirm and add'
    : `Delete ${bottles}`;

  return (
    <>
    <Modal visible={visible && focused && !chooseOpen} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={qs.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[qs.sheet, { maxHeight: winH * 0.9 }]}>
          <View style={qs.handle} />
          <View style={qs.header}>
            <View style={qs.headerLeft}>
              <Image source={MARK} style={qs.mark} resizeMode="contain" />
              <Text style={qs.headerName}>Vinster</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={qs.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={qs.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {phase === 'speak' && (
              <>
                <Text style={qs.title}>{title}</Text>
                <CommandField value={transcript} onChange={setTranscript} onSend={runParse}
                  placeholder={scoped ? 'ie. Move two bottles of Rousseau 1999 to the wine fridge' : 'ie. Move two bottles of Lafite 1982 from the wine fridge to the small rack'} />
                <View style={{ gap: 6 }}>
                  <Text style={qs.goldLabel}>Start your instruction with</Text>
                  {prompts.map((p) => <Text key={p} style={qs.prompt}>{p}</Text>)}
                </View>
                <View style={qs.sep} />
                <Text style={qs.title}>Or, if you like...</Text>
                {scoped ? (
                  <RowLink label="Find a bottle in this location" sub="If it's not here, I'll find where it is" onPress={() => { setFindText(''); setFindResult(null); setPhase('find'); }} />
                ) : (
                  <RowLink label="Choose from my cellar" sub="Not sure what to open? Let's talk about it" onPress={() => setChooseOpen(true)} />
                )}
              </>
            )}

            {phase === 'parsing' && (
              <View style={qs.centre}>
                <ActivityIndicator color={colors.gold} />
              </View>
            )}

            {phase === 'pick' && (
              <>
                <UserLine text={transcript} />
                <VinsterLine text="Which wine did you mean?" />
                <View>
                  {candidateWines.map((w, i) => (
                    <RowLink key={w.id} first={i === 0} label={wineLabel(w)} sub={w.region ?? ''} onPress={() => { setChosenWineId(w.id); setPhase('confirm'); }} />
                  ))}
                </View>
                <OutlineBtn label="Restate Command" onPress={restate} />
              </>
            )}

            {phase === 'confirm' && (
              <>
                <UserLine text={transcript} />
                <ConfirmCard />
                {executing ? <ActivityIndicator color={colors.gold} /> : (
                  <>
                    <OutlineBtn label={confirmLabel} onPress={execute} />
                    {action === 'delete' ? <OutlineBtn label="Archive instead" onPress={() => { setAction('archive'); }} /> : null}
                    <OutlineBtn label="Restate Command" onPress={restate} />
                  </>
                )}
              </>
            )}

            {phase === 'need' && (
              <>
                <UserLine text={transcript} />
                <VinsterLine text={result?.message?.trim() || (action === 'move' ? "I couldn't match the wine or where it's going. Tell me again: the wine, how many, and where to." : "I couldn't match that to a wine in your cellar. Tell me again with the producer and vintage.")} />
                <OutlineBtn label="Restate Command" onPress={restate} />
              </>
            )}

            {phase === 'error' && (
              <>
                <VinsterLine text="Something went wrong. Please try again." />
                <OutlineBtn label="Restate Command" onPress={restate} />
              </>
            )}

            {phase === 'success' && success && (
              <>
                <View style={qs.tick}><Text style={qs.tickText}>✓</Text></View>
                <Text style={qs.doneLine}>{success.action === 'move' ? success.detail : `${success.action === 'archive' ? 'Wine Archived.' : success.action === 'add' ? 'Added.' : 'Deleted.'} ${success.detail.replace(/^\d+ bottles? · /, '')} · ${success.wine}`}</Text>
                <RowLink label={success.viewLabel} onPress={() => { handleClose(); router.push(success.viewRoute as any); }} />
                {success.action === 'archive' ? <RowLink label="Add Archive Note" onPress={() => setPhase('archiveNote')} /> : null}
                <Text style={[qs.goldLabel, { marginTop: 8 }]}>Another command?</Text>
                <CommandField value={transcript} onChange={setTranscript} onSend={() => { setSuccess(null); setPhase('speak'); runParse(); }} placeholder="ie. Archive a bottle of Harlan 1990" />
                <DoneLink onPress={handleClose} />
              </>
            )}

            {phase === 'archiveNote' && success && (
              <>
                <VinsterLine text={`Add an archive note for ${success.wine}`} />
                <TextInput style={qs.noteInput} value={archiveNote} onChangeText={setArchiveNote} placeholder="ie. Dad's 70th birthday" placeholderTextColor="rgba(255,255,255,0.4)" maxLength={100} multiline />
                <Text style={qs.caption}>{`${archiveNote.length}/100`}</Text>
                {savingNote ? <ActivityIndicator color={colors.gold} /> : <OutlineBtn label="Save Note" onPress={saveArchiveNote} />}
              </>
            )}

            {phase === 'find' && (
              <>
                <UserLine text="Find a bottle in this location" />
                <VinsterLine text="Which bottle are you looking for?" />
                <CommandField value={findText} onChange={setFindText} onSend={runFind} placeholder="ie. Lafite 2005" />
              </>
            )}

            {phase === 'found' && findResult && (
              <>
                <UserLine text={findText} />
                {findResult.kind === 'many' ? (
                  <>
                    <VinsterLine text={`There are ${findResult.total} bottles of ${findResult.label} stored across ${findResult.places.length === 2 ? 'two' : findResult.places.length} locations: ${findResult.places.map((p) => p.name).join(', and ')}.`} />
                    <View>{findResult.places.map((p, i) => <RowLink key={p.route} first={i === 0} label={`View In ${p.name}`} sub={`${p.count} ${p.count === 1 ? 'bottle' : 'bottles'}`} onPress={() => router.push(p.route as any)} />)}</View>
                  </>
                ) : findResult.kind === 'others' ? (
                  <>
                    <VinsterLine text={`I can't find ${findResult.asked} anywhere in your cellar, but you do have ${findResult.others.length === 1 ? 'another vintage' : 'other vintages'}.`} />
                    {findResult.others.map((o) => (
                      <View key={o.label} style={{ gap: 4 }}>
                        <View style={qs.card}>
                          <Text style={qs.cardWine}>{o.label}</Text>
                          {o.places.length ? o.places.map((p) => <Text key={p.route} style={qs.cardLine}>{`${p.count} ${p.count === 1 ? 'bottle' : 'bottles'} · ${p.name}`}</Text>) : <Text style={qs.cardLine}>Not yet placed</Text>}
                        </View>
                        {o.places.map((p) => <RowLink key={`v-${p.route}`} label={`View ${p.name}`} onPress={() => router.push(p.route as any)} />)}
                      </View>
                    ))}
                  </>
                ) : (
                  <VinsterLine text={`I can't find ${findResult.asked} anywhere in your cellar.`} />
                )}
                <DoneLink onPress={handleClose} />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
    {/* "Choose from my cellar" runs the same chat as Home — opened only once the
        Quick Command sheet has gone, so the two never stack. */}
    <HomeVoiceModal visible={chooseShown} startWith="cellar" onClose={() => { setChooseShown(false); setChooseOpen(false); handleClose(); }} />
    </>
  );
}

// ---- small building blocks (Quick Command look) ---------------------------
function CommandField({ value, onChange, onSend, placeholder }: { value: string; onChange: (t: string) => void; onSend: () => void; placeholder: string }) {
  const can = !!value.trim();
  return (
    <View style={qs.field}>
      <TextInput style={qs.fieldInput} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.4)" multiline returnKeyType="send" blurOnSubmit onSubmitEditing={() => { if (can) onSend(); }} />
      <MicButton value={value} onChangeText={onChange} domain="query" serverCorrect />
      <TouchableOpacity onPress={() => { if (can) onSend(); }} disabled={!can} accessibilityLabel="Send" style={qs.send} hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}>
        <Text style={[qs.sendText, !can && { opacity: 0.4 }]}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
function RowLink({ label, sub, onPress, first }: { label: string; sub?: string; onPress: () => void; first?: boolean }) {
  return (
    <TouchableOpacity style={[qs.row, first && qs.rowFirst]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1, gap: 3 }}>
        <Text style={qs.rowLabel}>{label}</Text>
        {sub ? <Text style={qs.rowSub}>{sub}</Text> : null}
      </View>
      <Text style={qs.arrow}>›</Text>
    </TouchableOpacity>
  );
}
function OutlineBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return <TouchableOpacity style={qs.outline} onPress={onPress} activeOpacity={0.8}><Text style={qs.outlineText}>{label}</Text></TouchableOpacity>;
}
function VinsterLine({ text }: { text: string }) {
  return <View style={qs.vWrap}><View style={qs.vBubble}><Text style={qs.vText}>{text}</Text></View></View>;
}
function UserLine({ text }: { text: string }) {
  return text ? <View style={qs.uWrap}><View style={qs.uBubble}><Text style={qs.uText}>{text}</Text></View></View> : null;
}
function DoneLink({ onPress }: { onPress: () => void }) {
  return <TouchableOpacity onPress={onPress} style={{ alignSelf: 'center', paddingVertical: 8 }}><Text style={qs.done}>Done</Text></TouchableOpacity>;
}

const qs = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(224,184,74,0.3)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 30, height: 30 },
  headerName: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, letterSpacing: 0.3 },
  close: { fontSize: 20, color: 'rgba(255,255,255,0.75)' },
  body: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 40, gap: 14 },
  title: { fontFamily: fonts.headingItalic, fontSize: 27, lineHeight: 32, color: colors.text },
  goldLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: colors.gold },
  prompt: { fontFamily: fonts.bodyItalic, fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  sep: { height: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 6 },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingLeft: 16, paddingRight: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  fieldInput: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, paddingVertical: 6, minHeight: 30, maxHeight: 140 },
  send: { width: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 28, lineHeight: 30, color: colors.gold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  rowFirst: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  rowLabel: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gold },
  rowSub: { fontFamily: fonts.bodyItalic, fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  arrow: { fontSize: 22, color: colors.gold },
  card: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)' },
  cardAction: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' },
  cardWine: { fontFamily: fonts.headingBold, fontSize: 19, lineHeight: 23, color: colors.gold },
  cardLine: { fontFamily: fonts.bodyRegular, fontSize: 14.5, lineHeight: 21, color: 'rgba(255,255,255,0.92)' },
  warn: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 19, color: '#F2B8A0' },
  outline: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold },
  vWrap: { alignItems: 'flex-start' },
  vBubble: { maxWidth: '90%', backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.35)', borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  vText: { fontFamily: fonts.headingItalic, fontSize: 20, lineHeight: 25, color: colors.text },
  uWrap: { alignItems: 'flex-end' },
  uBubble: { maxWidth: '90%', backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  uText: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 23, color: colors.text },
  tick: { width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  tickText: { color: colors.gold, fontSize: 22 },
  doneLine: { fontFamily: fonts.headingItalic, fontSize: 23, lineHeight: 29, color: colors.text },
  noteInput: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 12, minHeight: 60 },
  caption: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' },
  centre: { paddingVertical: 40, alignItems: 'center' },
  done: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
});

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  // Intro paragraph atop the speak screen — the four commands, one sentence.
  voiceHeader: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  introText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 22 },
  modalDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  micRow: { alignItems: 'center', marginBottom: spacing.md },
  // Transcript box — darker terracotta, matching the voice-note inputs in Reviews.
  inputField: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md, minHeight: 64, marginBottom: spacing.xs },
  inputText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22 },
  inputPlaceholder: { color: colors.textSubtle },
  editHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textSubtle, textAlign: 'center', marginBottom: spacing.md },
  // Suggested commands — white italic, quoted.
  suggestions: { gap: spacing.sm, marginBottom: spacing.lg },
  suggestion: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 20 },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  btnDisabled: { opacity: 0.5 },
  cancelRow: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  centerBlock: { alignItems: 'center', paddingVertical: spacing.md, gap: spacing.sm },
  parsingText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, marginTop: spacing.sm },
  confirmBody: { fontFamily: fonts.bodyRegular, fontSize: 17, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  pickRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickWine: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickRegion: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  // Success popup — "Moved"/"Archived" header, the wine, its region · vintage,
  // the from→to (or count) detail, then a "View in <destination>" link.
  successAction: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  successWine: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: 2 },
  successMeta: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  successDetail: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  viewLinkRow: { alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.sm },
  viewLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Enlarged so "Another Command" isn't cramped.
  successBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
});
