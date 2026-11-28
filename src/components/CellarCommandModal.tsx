import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, useWindowDimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { router, useFocusEffect, usePathname } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MicButton } from './MicButton';
import { showAlert } from './AppAlert';
import { showFoundBanner } from './FoundBanner';
import { HomeVoiceModal } from './HomeVoiceModal';
import { useAuth } from '../hooks/useAuth';
import { useCellar, invalidateCellarViews } from '../hooks/useCellar';
import { useCellarContext } from '../hooks/useCellarContext';
import { useSoundCorrect, setPriorityDictationHints } from '../hooks/useDictationCorrect';
import { fetchStorageLocations, fetchStorageLocationCases } from '../api/storageLocations';
import { updateCellarWine, deleteCellarWine, getCellarWineById } from '../api/cellar';
import { getRacks, clearWineFromRacks } from '../api/racks';
import { getBins } from '../api/bins';
import { VIEW_ONLY_MESSAGE } from '../api/cellarContext';
import { isNetworkError } from '../api/invokeResilient';
import { parseCellarCommand, type CellarCommandAction, type CellarCommandResult } from '../api/cellarCommand';
import { moveBottlesToLocation, fetchPlacementsForWine, fetchPlacementsForWines, addLocationPlacement, type StorageUnitRef } from '../api/placements';
import { recommendFromCellar } from '../api/cellarRecommend';
import { supabase } from '../api/supabase';
import { archiveBottles, ARCHIVE_NOTE_MAX } from '../services/archiveNight';
import { releaseHomeBottles, releaseLeavingBottles } from '../services/moveBottles';
import { rackRoomFor } from '../services/rackMoves';
import { useMoodPicksStore, type MoodPickView } from '../stores/moodPicksStore';
import { rankWinesBySound, likelyProducerWines } from '../utils/soundAlike';
import { findSameCellarWine } from '../utils/wineMatch';
import { foldAccents, wineNameKey } from '../utils/wineIdentity';
import { effectiveMaturity } from '../utils/maturity';
import { todayYmd } from '../utils/reviewDate';
import type { CellarWine } from '../types/wine';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { DictationSwirl } from './DictationSwirl';

const MARK = require('../../assets/vinster-mark.png');

// How many of the user's wines go to the model. A large (imported) cellar can
// hold thousands, so only likely candidates are ever sent.
const MATCH_SHORTLIST = 50;   // naming a wine: the closest-sounding ones
const MOOD_SHORTLIST = 180;   // "what should I open?": the readiest ones

type Phase = 'speak' | 'parsing' | 'pick' | 'confirm' | 'need' | 'success' | 'archiveNote' | 'error' | 'find' | 'found' | 'addWhere';

// One place a wine's bottles sit, for "Find a bottle" and for naming where moved
// bottles came from. `key` identifies the place; loose / awaiting entries
// ('loose', 'u:…') are bottles without a placement.
type Place = { key: string; name: string; label: string; route: string; count: number; external: boolean };

// "Producer · Wine · 1999" for lists and cards.
function wineLabel(w: CellarWine | undefined): string {
  if (!w) return 'this wine';
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ');
}
// "Producer Wine 1999" for sentences.
function wineName(w: CellarWine): string {
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ');
}

// "Two bottles" in done lines (numbers above twelve stay as digits).
function countWord(n: number): string {
  const w = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];
  return w[n] ?? String(n);
}
function bottlesOf(n: number, label: string): string {
  return `${countWord(n)} ${n === 1 ? 'bottle' : 'bottles'} of ${label}`;
}

// Bottles sent to wait in a rack or fridge: how many of `n` it has free slots
// for, and the sentence that says so when that's fewer (`rest` ends "the rest …").
async function fitInRack(unitId: string, sizeMl: number, n: number, rest: string): Promise<{ fits: number; name: string; note: string }> {
  const { free, name } = await rackRoomFor(unitId, sizeMl);
  const fits = Math.min(n, free);
  return { fits, name, note: fits < n && fits > 0 ? ` Only ${fits} of ${n} will fit in the ${name} — the rest ${rest}.` : '' };
}

// Keep the first candidate per distinct wine — the shared name key plus vintage
// and bottle size — so duplicate rows or a wine the model listed twice never
// show up as two identical "which did you mean?" options. (Exact key only: the
// looser identity match would fold "Chambertin" and "Chambertin Clos de Bèze"
// into one option.)
function distinctCandidateIds(ids: string[], wines: CellarWine[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const w = wines.find((x) => x.id === id);
    if (!w) continue;
    const key = [wineNameKey(w.producer, w.wine_name), String(w.vintage ?? '').trim().toLowerCase(), w.bottle_size_ml ?? 750].join('|');
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

// Bottles leaving the cellar. "Drank", "opened" and "remove" all mean archive
// ("delete" is the one verb that removes without archiving). Present-tense
// "drink" / "open" are also how people ask for a suggestion ("what should I
// open?"), so they only count when they lead the command, name bottles or a
// vintage, and aren't a mood (see isMoodCommand).
const ARCHIVE_VERB = /\b(archiv\w*|drank|drunk|opened|remove[sd]?|removing)\b/i;
const MOVE_VERB = /\bmov(e|es|ed|ing)\b/i;
const NAMES_BOTTLES = /\b(bottles?|(19|20)\d{2})\b/i;
const MOOD_SIGNAL = /\b(mood|recommend(ation)?s?|suggest(ion)?s?|feel like|i fancy|in the mood|craving|treat myself|what should i|which wine|what (wine )?(should|would|do|can) i|help me (choose|pick|decide)|pair(ing)?( with)?|goes (well )?with|open tonight|for (dinner|tonight|a celebration|an occasion|the occasion)|celebrat|something (smooth|light|bold|rich|crisp|warming|cold|warm|fruity|elegant|special|celebratory|festive|easy|refreshing|full[- ]?bodied|delicate|spicy|sweet|savoury))\b/i;
const POLITE = '(please\\s+|can you\\s+|could you\\s+|would you\\s+|will you\\s+|vinster,?\\s+|i\\s+want\\s+to\\s+|i\\s+wanna\\s+|i\'?d\\s+like\\s+to\\s+|i\\s+would\\s+like\\s+to\\s+|i\\s+need\\s+to\\s+|i\'?d\\s+want\\s+to\\s+|let\'?s\\s+|please\\s+can\\s+you\\s+)';
// The verb a command starts with, after any polite preamble.
const LEADING_VERB = new RegExp(`^${POLITE}*(move|archive|add|delete|remove|open|drink)\\b`, 'i');
const leadingVerb = (s: string) => s.trim().match(LEADING_VERB)?.[2]?.toLowerCase() ?? null;

function hasCommandVerb(s: string): boolean {
  return MOVE_VERB.test(s) || ARCHIVE_VERB.test(s) || /\badd(s|ed|ing)?\b/i.test(s) || /\bdelet/i.test(s);
}

// Is this a free-form mood / recommendation rather than a Move / Archive / Add /
// Delete instruction? Commands are treated STRICTLY — a clear instruction must
// never be mistaken for a recommendation. In order:
//   1. A command verb at the start, after an optional polite/desire preamble
//      ("I want to move…", "please add…") is a command: people phrase commands
//      that way too, so desire words never by themselves mean "recommend".
//   2. Bottles already drunk or opened ("we drank two bottles of…") are a command.
//   3. "Open / drink" at the start naming bottles, with no mood words, is a command.
//   4. A command verb with a source/destination ("…from the bin to the fridge").
//   5. Otherwise, recommendation phrasing → mood.
//   6. Otherwise a command only if it names a command verb at all.
function isMoodCommand(text: string): boolean {
  const s = text.trim();
  const lead = leadingVerb(s);
  if (lead && lead !== 'open' && lead !== 'drink') return false;
  if (/\b(drank|drunk|opened)\b/i.test(s)) return false;
  const mood = MOOD_SIGNAL.test(s);
  if (lead && NAMES_BOTTLES.test(s) && !mood) return false;
  const verb = hasCommandVerb(s);
  if (verb && /\b(from|to|into|out of|onto)\b/i.test(s)) return false;
  if (mood) return true;
  return !verb;
}

// The action a command asks for: its leading verb when it starts with one
// ("open" / "drink" there mean archive), else the strongest verb in it. "Move"
// only when nothing says the bottles are new, gone or leaving.
function commandAction(text: string): CellarCommandAction {
  const lead = leadingVerb(text);
  if (lead === 'move' || lead === 'add' || lead === 'delete') return lead;
  if (lead) return 'archive';
  if (/\badd(s|ed|ing)?\b/i.test(text)) return 'add';
  if (/\bdelet/i.test(text)) return 'delete';
  return ARCHIVE_VERB.test(text) ? 'archive' : 'move';
}

// Mood picks choose from a shortlist: wines the request names (a producer,
// region, grape or style) first, then what's drinking now, then by score.
const MATURITY_ORDER: Record<string, number> = { peak: 0, approaching: 1, declining: 1, unknown: 2, too_young: 3 };
const MOOD_FILLER = new Set(['wine', 'wines', 'bottle', 'bottles', 'something', 'tonight', 'with', 'that', 'this', 'have', 'what', 'would', 'like', 'want', 'open', 'drink', 'should', 'from', 'cellar', 'some', 'good', 'nice']);
function moodShortlist(request: string, pool: CellarWine[], max: number): CellarWine[] {
  const asked = foldAccents(request).split(/[^a-z0-9]+/).filter((t) => t.length >= 4 && !MOOD_FILLER.has(t));
  const named = (w: CellarWine) => {
    const hay = foldAccents([w.producer, w.wine_name, w.region, w.grape_variety, w.style].filter(Boolean).join(' '));
    return asked.some((t) => hay.includes(t));
  };
  return pool
    .map((w) => ({ w, named: named(w) ? 0 : 1, ready: MATURITY_ORDER[effectiveMaturity(w)] ?? 4, score: w.critic_score ?? 0 }))
    .sort((a, b) => a.named - b.named || a.ready - b.ready || b.score - a.score)
    .slice(0, max)
    .map((x) => x.w);
}

// What to say when a command fails: the app's own explanation when there is one
// (view-only access, a usage limit, a wine that changed meanwhile), else a retry line.
function failureText(err: unknown): string {
  if (isNetworkError(err)) return 'You appear to be offline. Check your connection and try again.';
  if (err instanceof Error && err.name === 'Error' && err.message && !/^cellar-\w+/.test(err.message)) return err.message;
  return 'Something went wrong. Please try again.';
}

// Quick Command: a typed or spoken instruction to move, archive, add or delete
// bottles, or a mood ("something light tonight") answered with three picks.
// Opened from a storage screen it is scoped to that place:
//   `scope`       — that rack / fridge / bin / alt cellar. Added bottles go into
//                   it, and archived, deleted or moved bottles come out of it first.
//   `hereWineIds` — the wines in it. Spoken names are matched against these
//                   first (a short list makes "rear sack" → Rieussec easy).
//   `locationName` — its name, for the title and replies.
export function CellarCommandModal({ visible, onClose, locationName, hereWineIds, scope }: {
  visible: boolean;
  onClose: () => void;
  locationName?: string | null;
  hereWineIds?: string[];
  scope?: StorageUnitRef;
}) {
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
  const { wines, addWine } = useCellar();
  const canEdit = useCellarContext().role !== 'view';
  const soundCorrect = useSoundCorrect();
  const scoped = !!scope;
  const hereWines = () => (hereWineIds?.length ? wines.filter((w) => hereWineIds.includes(w.id)) : []);
  // Speech hints: the wines in this location go first.
  useEffect(() => {
    if (!visible || !hereWineIds?.length) return;
    const names = wines.filter((w) => hereWineIds.includes(w.id)).flatMap((w) => [w.producer, w.wine_name]).filter(Boolean) as string[];
    setPriorityDictationHints(names);
    return () => setPriorityDictationHints([]);
  }, [visible, hereWineIds?.join('|'), wines]);
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

  // Cases in this alt cellar, so "Add six bottles … to the XX Mixed Case" can
  // file them straight into that case.
  const { data: scopeCases = [] } = useQuery({
    queryKey: ['storage-location-cases', scope?.kind === 'location' ? scope.id : null],
    queryFn: () => fetchStorageLocationCases(scope!.id),
    enabled: scope?.kind === 'location',
  });
  const [addCaseId, setAddCaseId] = useState<string | null>(null);
  // The words actually sent for the current command (the field can change
  // afterwards, e.g. a late dictation correction) — replies always refer to this.
  const [sentText, setSentText] = useState('');
  const [pickIntro, setPickIntro] = useState<string | null>(null);
  // Vinster's reply when it needs more (overrides the parser's own message).
  const [needText, setNeedText] = useState<string | null>(null);
  const [errorText, setErrorText] = useState('');
  // An Add from the Cellar tab with no location named: added to the cellar list,
  // waiting for "where shall I place them?".
  const [addedPending, setAddedPending] = useState<{ id: string; count: number; label: string; wine: string } | null>(null);
  const [phase, setPhase] = useState<Phase>('speak');
  const [action, setAction] = useState<CellarCommandAction>('move');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<CellarCommandResult | null>(null);
  const [chosenWineId, setChosenWineId] = useState<string | null>(null);
  // Move destination is the Full Cellar List (unplace), not a location/rack/bin.
  const [moveToCellarList, setMoveToCellarList] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState<{
    action: CellarCommandAction;
    wine: string;          // producer + name, for the archive-note prompt
    line: string;          // the done line
    viewLabel: string;
    viewRoute: string;
    archivedWineId?: string | null; // the archived row the archive note belongs on
  } | null>(null);
  // Draft archive note typed on the post-archive success screen.
  const [archiveNote, setArchiveNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const chosenWine = wines.find((w) => w.id === chosenWineId);
  const targetLocation = locations.find((l) => l.id === result?.locationId);
  const targetUnit = units.find((u) => u.id === result?.unitId);
  const destName = moveToCellarList ? 'your Full Cellar List' : (targetUnit?.name ?? targetLocation?.name ?? null);

  // Bottles of each wine held in EXTERNAL (offsite) cellars. A move only ever
  // takes home bottles, and mood picks only suggest bottles that are to hand.
  async function externalBottles(ws: CellarWine[]): Promise<Map<string, number>> {
    const external = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
    const out = new Map<string, number>();
    if (external.size === 0 || ws.length === 0) return out;
    for (const p of await fetchPlacementsForWines(ws.map((w) => w.id))) {
      if (p.kind === 'location' && p.storage_location_id && external.has(p.storage_location_id)) {
        out.set(p.cellar_wine_id, (out.get(p.cellar_wine_id) ?? 0) + (p.quantity ?? 0));
      }
    }
    return out;
  }
  const homeBottles = (w: CellarWine, external: Map<string, number>) => Math.max(0, (w.quantity ?? 0) - (external.get(w.id) ?? 0));

  // Offsite bottles of the wine on the confirm card, so "move all" counts home bottles only.
  const [chosenOffsite, setChosenOffsite] = useState(0);
  useEffect(() => {
    setChosenOffsite(0);
    if (action !== 'move' || !chosenWine) return;
    let live = true;
    externalBottles([chosenWine]).then((m) => { if (live) setChosenOffsite(m.get(chosenWine.id) ?? 0); }).catch(() => {});
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, chosenWine?.id]);

  function reset() {
    setPhase('speak');
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setMoveToCellarList(false);
    setSuccess(null);
    setArchiveNote('');
    setAddCaseId(null);
    setSentText('');
    setPickIntro(null);
    setNeedText(null);
    setErrorText('');
    setAddedPending(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function fail(err: unknown) {
    setErrorText(failureText(err));
    setPhase('error');
  }

  async function runMoodRecommend() {
    setSentText(transcript);
    setNeedText(null);
    setPhase('parsing');
    try {
      // "What should I open?" only suggests bottles that are to hand — not wines
      // living ONLY in external / offsite cellars — unless the user asks for
      // something from storage (to be delivered or collected).
      const wantsStorage = /\b(storage|stored|external|offsite|off-site|bonded|deliver|delivered|collect|collection|reserves?)\b/i.test(transcript);
      let pool = wines;
      if (!wantsStorage) {
        const external = await externalBottles(wines);
        pool = wines.filter((w) => homeBottles(w, external) > 0);
      }
      const shortlist = moodShortlist(transcript, pool, MOOD_SHORTLIST);
      if (shortlist.length === 0) {
        setNeedText("There aren't any bottles at home to choose from yet.");
        setPhase('need');
        return;
      }
      const picks = await recommendFromCellar(transcript, shortlist);
      const views = picks
        .map((p) => {
          const w = wines.find((x) => x.id === p.id);
          return w ? { wine: w, rank: p.rank, why: p.why } : null;
        })
        .filter(Boolean) as MoodPickView[];
      if (views.length === 0) {
        setNeedText("Nothing in your cellar quite fits that. Try describing it another way — the occasion, the food, or the style you're after.");
        setPhase('need');
        return;
      }
      useMoodPicksStore.getState().set(transcript.trim(), views);
      router.push('/cellar/mood-picks' as any);
      handleClose();
    } catch (err) {
      fail(err);
    }
  }

  // Open a screen; if it's the one we're on, just update its params.
  function openRoute(route: string) {
    const [path, query] = route.split('?');
    if (path === pathname) {
      const params = Object.fromEntries((query ?? '').split('&').filter(Boolean).map((kv) => { const [k, v = ''] = kv.split('='); return [k, decodeURIComponent(v)]; }));
      router.setParams(params as any);
    } else {
      router.push(route as any);
    }
  }

  // Show the done line, refresh every cellar view, and (optionally) open the
  // screen where the bottles are placed — this sheet hides while that screen is
  // in front and shows the done line when the user comes back. A rack placement
  // is always pushed as a fresh screen, so its placement mode starts even when
  // the command came from that same rack.
  function finish(done: NonNullable<typeof success>, next?: { route: string; push?: boolean }) {
    invalidateCellarViews(qc);
    setSuccess(done);
    setTranscript('');
    setPhase('success');
    if (next?.push) router.push(next.route as any);
    else if (next) openRoute(next.route);
  }

  // "Where shall I place them?" — file the just-added bottles in a rack / fridge /
  // bin / alt cellar using that screen's own placement flow, or leave them loose.
  async function placeAddedInto(dest: { kind: 'unit' | 'location'; id: string; name: string; isBin?: boolean } | null) {
    const p = addedPending;
    if (!p || executing) return;
    setExecuting(true);
    try {
      const what = bottlesOf(p.count, p.label);
      if (!dest) {
        await updateCellarWine(p.id, { awaiting_placement: true, awaiting_placement_unit_id: null });
        finish({ action: 'add', wine: p.wine, line: `Added. ${what}, waiting to be placed in Your Full Cellar List.`, viewLabel: 'View in Your Full Cellar List', viewRoute: '/cellar/list' });
        return;
      }
      const isRack = dest.kind === 'unit' && !dest.isBin;
      const fit = isRack ? await fitInRack(dest.id, wines.find((w) => w.id === p.id)?.bottle_size_ml ?? 750, p.count, 'stay in Your Full Cellar List') : null;
      if (fit?.fits === 0) throw new Error(`There's no free slot in the ${fit.name} — choose another place, or leave them in Your Full Cellar List.`);
      if (dest.kind === 'location') await addLocationPlacement(p.id, dest.id, null, p.count);
      await updateCellarWine(p.id, { awaiting_placement: true, awaiting_placement_unit_id: dest.id });
      finish(
        {
          action: 'add', wine: p.wine,
          line: dest.kind === 'location' ? `Added. ${what} ${p.count === 1 ? 'is' : 'are'} in your ${dest.name}.` : `Added. ${what}, ready to place in the ${dest.name}.${fit?.note ?? ''}`,
          viewLabel: 'View the wine card', viewRoute: `/cellar/${p.id}`,
        },
        dest.kind === 'location'
          ? { route: `/cellar/storage-location/${dest.id}?placeWine=${p.id}` }
          : dest.isBin ? { route: `/cellar/bin/${dest.id}` } : { route: `/cellar/rack/${dest.id}?placeWine=${p.id}&placeLimit=${fit?.fits ?? p.count}`, push: true },
      );
    } catch (err) {
      fail(err);
    } finally {
      setExecuting(false);
    }
  }

  // Resolve a named wine with the model, sending only likely candidates: the
  // wines in THIS location first, then the whole cellar. Each pool is tried
  // narrow (the few that sound most like what was said, plus that producer's
  // other wines) then wide (its closest-sounding MATCH_SHORTLIST).
  async function resolveWine(act: 'move' | 'archive', rawText: string): Promise<CellarCommandResult> {
    // Snap misheard names to the user's own wines by sound first ("rear sack" →
    // Rieussec), so the model reads the real name.
    const text = soundCorrect(rawText);
    const shortlists = (pool: CellarWine[]): CellarWine[][] => {
      const ranked = rankWinesBySound(rawText, pool, MATCH_SHORTLIST, 0.5);
      const close = ranked.filter((m) => m.score >= 0.8).slice(0, 6);
      let narrow: CellarWine[] = [];
      if (close.length) {
        const top = close[0].score;
        const producers = new Set(close.filter((m) => m.score >= top - 0.1).map((m) => (m.wine.producer ?? '').toLowerCase()));
        const picked = close.map((m) => m.wine);
        narrow = [...picked, ...pool.filter((w) => !picked.includes(w) && producers.has((w.producer ?? '').toLowerCase()))].slice(0, MATCH_SHORTLIST);
      }
      return [narrow, pool.length <= MATCH_SHORTLIST ? pool : ranked.map((m) => m.wine)];
    };
    const here = hereWines();
    const tries = [...(here.length ? shortlists(here) : []), ...shortlists(wines)];
    const sent = new Set<string>();
    let last: CellarCommandResult | null = null;
    for (const pool of tries) {
      const key = pool.map((w) => w.id).join(',');
      if (!pool.length || sent.has(key)) continue;
      sent.add(key);
      last = await parseCellarCommand(act, text, pool, locations, units);
      if (last.wineId || last.candidates.length) return last;
    }
    return last ?? { action: act, wineId: null, locationId: null, unitId: null, quantity: null, add: null, candidates: [], needs: 'wine', message: '' };
  }

  async function runParse() {
    if (!transcript.trim()) return;
    // Mood / recommendation — a free description, handled by its own flow. A
    // storage screen doesn't offer recommendations, so say so there.
    if (isMoodCommand(transcript)) {
      if (scoped) {
        showAlert({
          title: 'Not available here',
          body: 'From a storage location you can move, archive, add or delete bottles. For a recommendation, use Voice Command on the Cellar tab.',
        });
        return;
      }
      runMoodRecommend();
      return;
    }
    if (!canEdit) { fail(new Error(VIEW_ONLY_MESSAGE)); return; }
    const act = commandAction(transcript);
    // A move to the Full Cellar List = unplace (take the bottles out of an alt
    // cellar / rack and leave them loose) — not a destination the parser resolves.
    const wantsCellarList = act === 'move' && mentionsCellarList(transcript);
    setMoveToCellarList(wantsCellarList);
    setAction(act);
    setSentText(transcript);
    setResult(null);
    setPickIntro(null);
    setNeedText(null);
    setPhase('parsing');
    try {
      if (act === 'add') await parseAdd();
      // 'delete' resolves like 'archive' (a wine + a count, no destination); only
      // the end action differs.
      else await parseExisting(act, await resolveWine(act === 'move' ? 'move' : 'archive', transcript), wantsCellarList);
    } catch (err) {
      fail(err);
    }
  }

  // Add is a NEW bottle — nothing to match in the cellar, just a wine name, a
  // count and (optionally) where it goes; then straight to confirm.
  async function parseAdd() {
    let res = await parseCellarCommand('add', soundCorrect(transcript), [], locations, units);
    // From a storage screen the bottles go into THIS place unless the user named
    // somewhere else. In an alt cellar, a named case is honoured.
    if (scope && !res.locationId && !res.unitId) {
      res = scope.kind === 'location' ? { ...res, locationId: scope.id } : { ...res, unitId: scope.id };
    }
    const said = foldAccents(transcript);
    const hitCase = res.locationId === scope?.id ? scopeCases.find((c) => said.includes(foldAccents(c.name))) : undefined;
    setAddCaseId(hitCase?.id ?? null);
    setResult(res);
    const a = res.add;
    setPhase(res.needs === 'wine' || !a || (!a.producer && !a.wineName) ? 'need' : 'confirm');
  }

  // Move / archive / delete: settle on one wine the user owns (asking "which
  // one?" when it's ambiguous), then confirm.
  async function parseExisting(act: CellarCommandAction, parsed: CellarCommandResult, wantsCellarList: boolean) {
    let res = parsed;
    if (act === 'move') {
      // A move takes HOME bottles, so a wine living only in an external cellar
      // can't be the one meant — never offer it.
      const ids = Array.from(new Set([...res.candidates, res.wineId].filter(Boolean))) as string[];
      const external = await externalBottles(wines.filter((w) => ids.includes(w.id)));
      const offsiteOnly = (id: string) => {
        const w = wines.find((x) => x.id === id);
        return !!w && homeBottles(w, external) === 0;
      };
      res = { ...res, candidates: res.candidates.filter((c) => !offsiteOnly(c)), wineId: res.wineId && offsiteOnly(res.wineId) ? null : res.wineId };

      // Home bottles can't be moved OUT to external storage (bringing them home
      // is done from the Full Cellar List's long-press "Move to Home Storage").
      const dest = res.locationId ? locations.find((l) => l.id === res.locationId) : undefined;
      if (dest?.is_external) {
        setResult(res);
        setNeedText(`${dest.name} is external storage, so bottles can't be moved into it from home. Choose a home location instead.`);
        setPhase('need');
        return;
      }
    }
    setResult(res);

    if (!res.wineId || res.needs === 'wine') {
      const distinct = distinctCandidateIds(res.candidates, wines);
      if (distinct.length > 1) { setResult({ ...res, candidates: distinct }); setPhase('pick'); return; }
      if (distinct.length === 1) { setChosenWineId(distinct[0]); setPhase('confirm'); return; }
      // Nothing matched exactly — but if the PRODUCER is recognisable ("René
      // Engel La Brulli"), offer that producer's wines rather than "not found".
      const here = hereWines();
      const fallback = (here.length ? likelyProducerWines(transcript, here) : null) ?? likelyProducerWines(transcript, wines);
      if (fallback?.wines.length === 1) {
        setPickIntro(`I couldn't match that exactly, but you have ${wineLabel(fallback.wines[0])}.`);
        setChosenWineId(fallback.wines[0].id);
        setPhase('confirm');
      } else if (fallback?.wines.length) {
        setResult({ ...res, candidates: fallback.wines.map((w) => w.id) });
        setPickIntro(`I couldn't match that exactly, but you have ${fallback.wines.length} wines from ${fallback.producer}. Which one did you mean?`);
        setPhase('pick');
      } else {
        setPhase('need');
      }
      return;
    }
    // A move needs a destination — an Alt Cellar, a rack/fridge/bin, or the Full
    // Cellar List (which has no locationId/unitId by design).
    if (act === 'move' && !wantsCellarList && (res.needs === 'location' || (!res.locationId && !res.unitId))) {
      setPhase('need');
      return;
    }
    setChosenWineId(res.wineId);
    setPhase('confirm');
  }

  async function execute() {
    if (executing) return;
    setExecuting(true);
    try {
      if (action === 'add') {
        await executeAdd();
      } else {
        // Work from the wine as it is NOW: in a shared cellar, or on another
        // device, the cached list can be behind.
        const wine = chosenWineId ? await getCellarWineById(chosenWineId) : null;
        if (!wine || wine.archived_at || (wine.quantity ?? 0) < 1) throw new Error('That wine is no longer in your cellar. Pull to refresh and try again.');
        if (action === 'move') await executeMove(wine);
        else if (action === 'archive') await executeArchive(wine);
        else await executeDelete(wine);
      }
    } catch (err) {
      fail(err);
    } finally {
      setExecuting(false);
    }
  }

  // Where moved bottles came from: the places that hold fewer of them now.
  // Bottles with no placement count as Your Full Cellar List.
  function movedFrom(before: Place[], after: Place[]): string {
    const left = before.filter((p) => p.key !== 'loose' && !p.key.startsWith('u:') && (after.find((a) => a.key === p.key)?.count ?? 0) < p.count);
    if (left.length === 0) return 'Your Full Cellar List';
    const names = left.map((p) => `the ${p.name}`);
    return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
  }

  async function executeMove(wine: CellarWine) {
    const externalIds = new Set(locations.filter((l) => l.is_external).map((l) => l.id));
    const home = homeBottles(wine, await externalBottles([wine]));
    if (home < 1) throw new Error(`Every bottle of ${wineName(wine)} is in external storage.`);
    const count = Math.min(home, result?.quantity ?? home);
    const before = await placesFor(wine);
    const title = [wine.producer, wine.wine_name].filter(Boolean).join(' ');

    // To the Full Cellar List: UNPLACE the bottles. The quantity is unchanged —
    // they don't leave the cellar, just their spot.
    if (moveToCellarList) {
      await releaseHomeBottles(wine.id, count, externalIds, scope);
      if (count >= wine.quantity) await updateCellarWine(wine.id, { awaiting_placement: false, awaiting_placement_unit_id: null });
      const from = movedFrom(before, await placesFor(wine));
      finish({ action: 'move', wine: title, line: `${bottlesOf(count, wineName(wine))} moved from ${from} to Your Full Cellar List.`, viewLabel: 'View in Your Full Cellar List', viewRoute: '/cellar/list' });
      return;
    }

    const toName = destName ?? 'its new place';
    if (result?.locationId) {
      // To an alt cellar: placement-native and merge-aware, so the bottles land
      // there (on the wine's existing line in that cellar, if it has one).
      await moveBottlesToLocation(wine, result.locationId, count, { fromUnit: scope });
      const from = movedFrom(before, await placesFor(wine));
      finish({
        action: 'move', wine: title,
        line: `${bottlesOf(count, wineName(wine))} moved from ${from} to ${toName}. Open it to place them more precisely.`,
        viewLabel: `Go to ${toName}`, viewRoute: `/cellar/storage-location/${result.locationId}`,
      });
      return;
    }
    if (!result?.unitId) return;

    // To a rack / fridge / bin: free home bottles (never offsite), keep them on
    // the SAME row (one wine = one Cellar List line), and mark them awaiting
    // placement there; the unit's screen opens so the user picks the spots. A
    // rack or fridge takes only as many as it has free slots for.
    const isBin = targetUnit?.storage_type === 'bin';
    const fit = isBin ? null : await fitInRack(result.unitId, wine.bottle_size_ml ?? 750, count, 'stay where they are');
    if (fit?.fits === 0) throw new Error(`There's no free slot in the ${fit.name}, so nothing has been moved.`);
    const sending = fit?.fits ?? count;
    const freed = await releaseHomeBottles(wine.id, sending, externalIds, scope);
    const looseBefore = before.filter((p) => p.key === 'loose' || p.key.startsWith('u:')).reduce((n, p) => n + p.count, 0);
    const toPlace = Math.min(sending, freed + looseBefore);
    await updateCellarWine(wine.id, { awaiting_placement: true, awaiting_placement_unit_id: result.unitId });
    const from = movedFrom(before, await placesFor(wine));
    const unitRoute = isBin ? `/cellar/bin/${result.unitId}` : `/cellar/rack/${result.unitId}`;
    finish(
      {
        action: 'move', wine: title,
        line: `${bottlesOf(toPlace, wineName(wine))} moved from ${from}, ready to place in the ${toName}.${fit?.note ?? ''}`,
        viewLabel: `View the ${toName}`, viewRoute: unitRoute,
      },
      { route: isBin ? unitRoute : `${unitRoute}?placeWine=${wine.id}&placeLimit=${toPlace}`, push: true },
    );
  }

  // Archive: the same outcome as the wine card's archive (archive copy, removal
  // log, storage freed before the quantity drops), via the shared archiveBottles.
  async function executeArchive(wine: CellarWine) {
    const count = Math.min(wine.quantity, result?.quantity ?? wine.quantity);
    const { archived, archivedWineId } = await archiveBottles(wine.id, count, todayYmd(), { fromUnit: scope });
    if (archived < 1) throw new Error('That wine is no longer in your cellar. Pull to refresh and try again.');
    finish({
      action: 'archive',
      wine: [wine.producer, wine.wine_name].filter(Boolean).join(' '),
      line: `Wine Archived. ${bottlesOf(archived, wineName(wine))} moved to Your Cellar Archive.`,
      viewLabel: 'View in Your Cellar Archive',
      viewRoute: '/cellar/list?archived=1',
      archivedWineId,
    });
  }

  // Permanent delete — no archive, no removal log. The whole row goes when the
  // count covers every bottle; otherwise free those bottles' storage, then lower
  // the quantity.
  async function executeDelete(wine: CellarWine) {
    const count = Math.min(wine.quantity, result?.quantity ?? wine.quantity);
    if (count >= wine.quantity) {
      await clearWineFromRacks(wine.id);
      await deleteCellarWine(wine.id);
    } else {
      await releaseLeavingBottles(wine.id, wine.quantity, count, scope);
      await updateCellarWine(wine.id, { quantity: wine.quantity - count });
    }
    finish({
      action: 'delete',
      wine: [wine.producer, wine.wine_name].filter(Boolean).join(' '),
      line: `Deleted. ${bottlesOf(count, wineName(wine))} removed from your records.`,
      viewLabel: 'View your Cellar List',
      viewRoute: '/cellar/list',
    });
  }

  // Add: brand-new bottles through the cellar's usual add (purchase-price
  // estimate, label thumbnail), or onto the wine's existing line when it's
  // already in the cellar (one wine = one line).
  async function executeAdd() {
    const a = result?.add;
    if (!a || !userId) return;
    const count = result?.quantity ?? 1;
    const name = (a.wineName ?? a.producer ?? '').trim() || 'Unnamed wine';
    const unitId = result?.unitId ?? null;
    const locationId = result?.locationId ?? null;
    let addedId: string | null = null;
    // A rack or fridge only takes as many new bottles as it has free slots for;
    // with none free they wait in Your Full Cellar List instead.
    const fit = unitId && targetUnit?.storage_type !== 'bin' ? await fitInRack(unitId, 750, count, 'stay in Your Full Cellar List') : null;
    const waitUnitId = fit?.fits === 0 ? null : unitId;

    const twin = findSameCellarWine(wines, { producer: a.producer, wineName: name, region: a.region, vintage: a.vintage }, 750);
    const live = twin ? await getCellarWineById(twin.id) : null;
    if (live && !live.archived_at) {
      await updateCellarWine(live.id, {
        quantity: (live.quantity ?? 0) + count,
        ...(unitId ? { awaiting_placement: true, awaiting_placement_unit_id: waitUnitId } : {}),
      });
      addedId = live.id;
    } else {
      const row = await addWine.mutateAsync({
        user_id: userId,
        wine_name: name,
        producer: a.producer,
        region: a.region,
        vintage: a.vintage,
        quantity: count,
        storage_location: null,
        date_received: todayYmd(),
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
        // Into an alt cellar: filed there below as a placement. Into a rack /
        // fridge / bin: waiting for that unit (its screen opens to place them).
        // Otherwise loose, awaiting placement in the Cellar List.
        awaiting_placement: !locationId,
        awaiting_placement_unit_id: waitUnitId,
      });
      addedId = row.id;
    }
    if (!addedId) return;
    if (locationId) {
      await addLocationPlacement(addedId, locationId, addCaseId, count);
      // No case named → the cellar opens with its "Where should this go?"
      // prompt (a case, or loose), the same as a manual add.
      if (!addCaseId) await updateCellarWine(addedId, { awaiting_placement: true, awaiting_placement_unit_id: locationId });
    }

    const label = [a.producer, a.wineName, a.vintage].filter(Boolean).join(' ') || name;
    const title = [a.producer, a.wineName].filter(Boolean).join(' ') || name;
    if (!unitId && !locationId) {
      // Added to the cellar list; now ask where to place them (or leave them).
      invalidateCellarViews(qc);
      setAddedPending({ id: addedId, count, label, wine: title });
      setTranscript('');
      setPhase('addWhere');
      return;
    }
    const destLabel = targetUnit?.name ?? targetLocation?.name ?? locationName ?? 'this location';
    const caseName = addCaseId ? scopeCases.find((c) => c.id === addCaseId)?.name : null;
    const what = bottlesOf(count, label);
    if (fit?.fits === 0) {
      finish({
        action: 'add', wine: title,
        line: `Added. There's no free slot in the ${fit.name}, so ${what} ${count === 1 ? 'is' : 'are'} waiting to be placed in Your Full Cellar List.`,
        viewLabel: 'View the wine card', viewRoute: `/cellar/${addedId}`,
      });
      return;
    }
    finish(
      {
        action: 'add', wine: title,
        line: unitId
          ? `Added. ${what}, ready to place in the ${destLabel}.${fit?.note ?? ''}`
          : `Added. ${what} ${count === 1 ? 'is' : 'are'} in your ${destLabel}${caseName ? `, in ${caseName}` : ''}.`,
        viewLabel: 'View the wine card', viewRoute: `/cellar/${addedId}`,
      },
      // Rack / fridge / bin: open that unit to place the new bottles. Alt cellar
      // with no case named: open it at its "Where should this go?" prompt.
      unitId
        ? { route: targetUnit?.storage_type === 'bin' ? `/cellar/bin/${unitId}` : `/cellar/rack/${unitId}?placeWine=${addedId}&placeLimit=${fit?.fits ?? count}`, push: true }
        : !addCaseId ? { route: `/cellar/storage-location/${locationId}?placeWine=${addedId}` } : undefined,
    );
  }

  // Save the typed note onto the archived row (the archive copy, after a partial
  // archive), then close. Guards a double-tap while saving.
  async function saveArchiveNote() {
    if (savingNote) return;
    const id = success?.archivedWineId;
    if (!id) { handleClose(); return; }
    setSavingNote(true);
    try {
      const note = archiveNote.trim().slice(0, ARCHIVE_NOTE_MAX) || null;
      await updateCellarWine(id, { archive_note: note });
      invalidateCellarViews(qc);
      handleClose();
    } catch (err) {
      fail(err);
    } finally {
      setSavingNote(false);
    }
  }

  const candidateWines = (result?.candidates ?? []).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];

  // Storage screens (rack / fridge / bin / alt cellar) offer "Find a bottle in
  // this location" instead of "Choose from my cellar".
  const prompts = scoped
    ? ['Archive (or Drank) X bottles of...', 'Move X bottles of... to another location', 'Add X bottles of...', 'Delete X bottles of...']
    : ['Archive (or Drank) X bottles of...', 'Move X bottles of...', 'Add X bottles of...', 'Delete X bottles of...'];

  function restate() { setTranscript(''); setSentText(''); setPickIntro(null); setNeedText(null); setResult(null); setChosenWineId(null); setPhase('speak'); }

  // ---- Find a bottle ----------------------------------------------------
  // One location → that location's real screen opens straight away with the
  // wine highlighted (no reply). Two or more → Vinster lists them with links;
  // coming back from one returns here to open the other.
  const [findText, setFindText] = useState('');
  const [findResult, setFindResult] = useState<
    | { kind: 'many'; label: string; total: number; places: Place[] }
    | { kind: 'others'; asked: string; others: { label: string; places: Place[] }[]; producer?: string }
    | { kind: 'none'; asked: string }
    | null
  >(null);

  // Every place a wine's bottles sit, with a count each.
  async function placesFor(w: CellarWine): Promise<Place[]> {
    const pls = await fetchPlacementsForWine(w.id);
    const out = new Map<string, Place>();
    const add = (key: string, name: string, route: string, n: number, opts?: { note?: string; external?: boolean }) => {
      const cur = out.get(key);
      if (cur) cur.count += n;
      else out.set(key, { key, name, label: opts?.note ? `${name} (${opts.note})` : name, route, count: n, external: !!opts?.external });
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
        const loc = locations.find((l) => l.id === p.storage_location_id);
        add(`l:${p.storage_location_id}`, loc?.name ?? 'Cellar', `/cellar/storage-location/${p.storage_location_id}?highlight=${w.id}`, n, { external: !!loc?.is_external });
      }
    }
    // Bottles with no placement row: waiting to be placed in a rack/bin, or
    // simply loose in the Cellar List.
    const placed = Array.from(out.values()).reduce((n, p) => n + p.count, 0);
    const rest = Math.max(0, (w.quantity ?? 0) - placed);
    if (rest > 0) {
      const unit = w.awaiting_placement_unit_id ? units.find((u) => u.id === w.awaiting_placement_unit_id) : null;
      if (unit) add(`u:${unit.id}`, unit.name, unit.storage_type === 'bin' ? `/cellar/bin/${unit.id}?highlight=${w.id}` : `/cellar/rack/${unit.id}?placeWine=${w.id}&placeLimit=${rest}`, rest, { note: 'waiting to be placed' });
      else add('loose', 'Your Full Cellar List', `/cellar/${w.id}`, rest, { note: 'not yet placed' });
    }
    return Array.from(out.values());
  }

  async function runFind() {
    const asked = findText.trim();
    if (!asked) return;
    setPhase('parsing');
    try {
      const res = await resolveWine('archive', asked);
      const match = res.wineId ? wines.find((w) => w.id === res.wineId) : null;
      if (match) {
        const places = await placesFor(match);
        if (places.length === 1) {
          // One place: close the chat, open that location with the bottles
          // highlighted, and say what was found in a small banner (Done clears it).
          const n = places[0].count;
          handleClose();
          showFoundBanner(`Found ${n} ${n === 1 ? 'bottle' : 'bottles'} of ${wineLabel(match)}`, places[0].route.split('?')[0]);
          openRoute(places[0].route);
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
        const here = hereWines();
        const fb = (here.length ? likelyProducerWines(asked, here) : null) ?? likelyProducerWines(asked, wines);
        if (fb?.wines.length) {
          const withPlaces = await Promise.all(fb.wines.slice(0, 4).map(async (w) => ({ label: wineLabel(w), places: await placesFor(w) })));
          setFindResult({ kind: 'others', asked, others: withPlaces, producer: fb.producer });
        } else {
          setFindResult({ kind: 'none', asked });
        }
      }
      setPhase('found');
    } catch (err) {
      fail(err);
    }
  }

  const title = scoped && locationName ? `What would you like to do in your ${locationName}?` : 'What would you like to do?';
  // Bottles on the confirm card. A move counts home bottles only.
  const available = Math.max(1, (chosenWine?.quantity ?? 1) - (action === 'move' ? chosenOffsite : 0));
  const count = Math.min(available, result?.quantity ?? available);
  const bottles = `${count} ${count === 1 ? 'bottle' : 'bottles'}`;

  // The confirm card for each action.
  function ConfirmCard() {
    if (action === 'add') {
      const a = result?.add;
      const n = result?.quantity ?? 1;
      return (
        <View style={qs.card}>
          <Text style={qs.cardAction}>Add</Text>
          <Text style={qs.cardWine}>{[a?.producer, a?.wineName, a?.vintage].filter(Boolean).join(' · ') || 'This wine'}</Text>
          <Text style={qs.cardLine}>{`${n} ${n === 1 ? 'bottle' : 'bottles'} · ${targetUnit?.name ?? targetLocation?.name ?? 'Your Full Cellar List'}${addCaseId ? ` · ${scopeCases.find((c) => c.id === addCaseId)?.name ?? ''}` : ''}`}</Text>
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
    : action === 'add' ? 'Confirm & Place Wine'
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
                {canEdit ? (
                  <>
                    <CommandField value={transcript} onChange={setTranscript} onSend={runParse}
                      placeholder={scoped ? 'ie. Move two bottles of Rousseau 1999 to the wine fridge' : 'ie. Move two bottles of Lafite 1982 from the wine fridge to the small rack'} />
                    <View style={{ gap: 6 }}>
                      <Text style={qs.goldLabel}>Start your instruction with</Text>
                      {prompts.map((p) => <Text key={p} style={qs.prompt}>{p}</Text>)}
                    </View>
                  </>
                ) : (
                  // View-only member of a shared cellar: nothing here can change it.
                  <>
                    <Text style={qs.caption}>{scoped ? `${VIEW_ONLY_MESSAGE} You can still find a bottle.` : `${VIEW_ONLY_MESSAGE} I can still suggest a bottle to open.`}</Text>
                    {scoped ? null : <CommandField value={transcript} onChange={setTranscript} onSend={runParse} placeholder="ie. Something light to go with roast chicken" />}
                  </>
                )}
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
                <UserLine text={sentText || transcript} />
                <VinsterLine text={pickIntro ?? 'Which wine did you mean?'} />
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
                <UserLine text={sentText || transcript} />
                {pickIntro ? <VinsterLine text={pickIntro} /> : null}
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
                <UserLine text={sentText || transcript} />
                <VinsterLine text={needText ?? (result?.message?.trim() || (action === 'move' ? "I couldn't match the wine or where it's going. Tell me again: the wine, how many, and where to." : "I couldn't match that to a wine in your cellar. Tell me again with the producer and vintage."))} />
                <OutlineBtn label="Restate Command" onPress={restate} />
              </>
            )}

            {phase === 'addWhere' && addedPending && (
              <>
                <VinsterLine text={`Added ${addedPending.count} ${addedPending.count === 1 ? 'bottle' : 'bottles'} of ${addedPending.label}. Where shall I place ${addedPending.count === 1 ? 'it' : 'them'}?`} />
                {executing ? <ActivityIndicator color={colors.gold} /> : (
                  <View>
                    {units.map((u, i) => (
                      <RowLink key={u.id} first={i === 0} label={u.name} sub={u.storage_type === 'bin' ? 'Bin' : u.storage_type === 'fridge' ? 'Fridge' : 'Rack'} onPress={() => void placeAddedInto({ kind: 'unit', id: u.id, name: u.name, isBin: u.storage_type === 'bin' })} />
                    ))}
                    {locations.filter((l) => !l.is_external).map((l, i) => (
                      <RowLink key={l.id} first={units.length === 0 && i === 0} label={l.name} sub="Alt Cellar" onPress={() => void placeAddedInto({ kind: 'location', id: l.id, name: l.name })} />
                    ))}
                    <RowLink label="Leave in my Cellar List" sub="Place them later" onPress={() => void placeAddedInto(null)} />
                  </View>
                )}
              </>
            )}

            {phase === 'error' && (
              <>
                <VinsterLine text={errorText || 'Something went wrong. Please try again.'} />
                <OutlineBtn label="Restate Command" onPress={restate} />
              </>
            )}

            {phase === 'success' && success && (
              <>
                <View style={qs.tick}><Text style={qs.tickText}>✓</Text></View>
                <Text style={qs.doneLine}>{success.line}</Text>
                <RowLink label={success.viewLabel} onPress={() => { handleClose(); router.push(success.viewRoute as any); }} />
                {success.action === 'archive' && success.archivedWineId ? <RowLink label="Add Archive Note" onPress={() => setPhase('archiveNote')} /> : null}
                <Text style={[qs.goldLabel, { marginTop: 8 }]}>Another command?</Text>
                <CommandField value={transcript} onChange={setTranscript} onSend={() => { setSuccess(null); setPhase('speak'); runParse(); }} placeholder="ie. Archive a bottle of Harlan 1990" />
                <DoneLink onPress={handleClose} />
              </>
            )}

            {phase === 'archiveNote' && success && (
              <>
                <VinsterLine text={`Add an archive note for ${success.wine}`} />
                <TextInput style={qs.noteInput} value={archiveNote} onChangeText={setArchiveNote} placeholder="ie. Dad's 70th birthday" placeholderTextColor="rgba(255,255,255,0.4)" maxLength={ARCHIVE_NOTE_MAX} multiline />
                <Text style={qs.caption}>{`${archiveNote.length}/${ARCHIVE_NOTE_MAX}`}</Text>
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
                    <VinsterLine text={`There are ${findResult.total} bottles of ${findResult.label} stored across ${findResult.places.length === 2 ? 'two' : findResult.places.length} locations: ${findResult.places.map((p) => p.label).join(', and ')}.`} />
                    <View>{findResult.places.map((p, i) => <RowLink key={p.route} first={i === 0} label={`View In ${p.label}`} sub={`${p.count} ${p.count === 1 ? 'bottle' : 'bottles'}`} onPress={() => router.push(p.route as any)} />)}</View>
                  </>
                ) : findResult.kind === 'others' ? (
                  <>
                    <VinsterLine text={findResult.producer
                      ? `I couldn't match ${findResult.asked} exactly, but you have ${findResult.others.length === 1 ? 'this wine' : 'these wines'} from ${findResult.producer}.`
                      : `I can't find ${findResult.asked} anywhere in your cellar, but you do have ${findResult.others.length === 1 ? 'another vintage' : 'other vintages'}.`} />
                    {findResult.others.map((o) => (
                      <View key={o.label} style={{ gap: 4 }}>
                        <View style={qs.card}>
                          <Text style={qs.cardWine}>{o.label}</Text>
                          {o.places.length ? o.places.map((p) => <Text key={p.route} style={qs.cardLine}>{`${p.count} ${p.count === 1 ? 'bottle' : 'bottles'} · ${p.label}`}</Text>) : <Text style={qs.cardLine}>Not yet placed</Text>}
                        </View>
                        {o.places.map((p) => <RowLink key={`v-${p.route}`} label={`View ${p.label}`} onPress={() => router.push(p.route as any)} />)}
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
  // Swirl while a spoken wine name is being worked out — the field is locked and
  // Send disabled meanwhile, so typing can't be wiped by the finished text.
  const [dictating, setDictating] = useState(false);
  const can = !!value.trim() && !dictating;
  return (
    <View style={qs.field}>
      <View style={{ flex: 1 }}>
        <TextInput style={qs.fieldInput} value={value} onChangeText={onChange} editable={!dictating} placeholder={placeholder} placeholderTextColor="rgba(255,255,255,0.4)" multiline returnKeyType="send" blurOnSubmit onSubmitEditing={() => { if (can) onSend(); }} />
        <DictationSwirl visible={dictating} />
      </View>
      {/* No catalogue (server) correction here: Quick Command is about bottles
          the user OWNS, which the on-phone cellar sound-match handles — the
          catalogue pass could turn their wine into one they don't have, and it
          lands late, changing the text after it was sent. */}
      {/* Bin: clear the instruction and start fresh. */}
      <MicButton value={value} onChangeText={onChange} onClear={() => onChange('')} domain="query"  onWorkingChange={setDictating} />
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

