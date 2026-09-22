import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MicButton } from './MicButton';
import { showAlert } from './AppAlert';
import { useAuth } from '../hooks/useAuth';
import { useCellar } from '../hooks/useCellar';
import { fetchStorageLocations } from '../api/storageLocations';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../api/cellar';
import { getRacks, clearWineFromRacks, removeSlotsForWine } from '../api/racks';
import { getBins } from '../api/bins';
import { parseCellarCommand, type CellarCommandAction, type CellarCommandResult } from '../api/cellarCommand';
import { recommendFromCellar } from '../api/cellarRecommend';
import { useMoodPicksStore, type MoodPickView } from '../stores/moodPicksStore';
import type { CellarWine } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

type Phase = 'choose' | 'speak' | 'parsing' | 'pick' | 'confirm' | 'need' | 'success' | 'error';


function wineLabel(w: CellarWine | undefined): string {
  if (!w) return 'this wine';
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ');
}

// Speech-to-text routinely mishears wine vocabulary ("seller" for "cellar",
// etc.). Nudge the obvious ones back. Applied to the MIC's output only — manual
// edits in the input field are left exactly as the user types them.
function correctWineTerms(text: string): string {
  const fixes: Array<[RegExp, string]> = [
    [/\bsellers?\b/gi, 'cellar'],
    [/\bsellars?\b/gi, 'cellar'],
    [/\bcella\b/gi, 'cellar'],
    [/\bwould store\b/gi, 'wood store'],
    [/\bwood stall\b/gi, 'wood store'],
    [/\bshably\b/gi, 'Chablis'],
    [/\bbore doe\b/gi, 'Bordeaux'],
    [/\bsee rah\b/gi, 'Syrah'],
    [/\bgren(a|ai)sh\b/gi, 'Grenache'],
    [/\bmag num\b/gi, 'magnum'],
  ];
  return fixes.reduce((s, [re, rep]) => s.replace(re, rep), text);
}

// True if the spoken command names a vintage (a 19xx/20xx year) or explicitly
// flags a non-vintage bottle ("non-vintage" / "NV"). Move / archive / add all
// require one so Vinster targets the right bottle.
function mentionsVintage(text: string): boolean {
  return /\b(19|20)\d{2}\b/.test(text) || /\bnon[-\s]?vintage\b/i.test(text) || /\bnv\b/i.test(text);
}

// Default intro copy + examples (the Cellar-tab, full-scope voice command).
// A caller (e.g. a home-storage location screen) can override these to present
// a scoped explainer — the underlying move/archive/add engine is unchanged.
const DEFAULT_INTRO_TEXT = 'Vinster has been trained in four voice commands: Move wines between storage locations, Archive bottles or Add them to your cellar list for you to place into a specific location later, or ask Vinster to recommend wines to drink based on your mood and occasion.';
const DEFAULT_SUGGESTIONS = [
  'Move my Lafite 1982 from my wine fridge to my small wine rack',
  'Archive 3 bottles of Harlan 1990',
  'Add a bottle of Sassicaia 2007 to my cellar',
  "It's cold and raining, I want a smooth red wine for the fireside.",
];

export function CellarCommandModal({ visible, onClose, introText, suggestions, allowedActions }: { visible: boolean; onClose: () => void; introText?: string; suggestions?: string[]; allowedActions?: CellarCommandAction[] }) {
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
  const [executing, setExecuting] = useState(false);
  const [success, setSuccess] = useState<{
    action: 'move' | 'archive' | 'add';
    wine: string;        // producer + name
    meta: string;        // region · vintage
    detail: string;      // "from X to Y" (move) / "N bottles archived" (archive)
    viewLabel: string;   // "View in <destination>"
    viewRoute: string;
  } | null>(null);

  const chosenWine = wines.find((w) => w.id === chosenWineId);
  const targetLocation = locations.find((l) => l.id === result?.locationId);
  const targetUnit = units.find((u) => u.id === result?.unitId);
  const destName = targetUnit?.name ?? targetLocation?.name ?? null;

  function reset() {
    setPhase('speak');
    setTranscript('');
    setResult(null);
    setChosenWineId(null);
    setSuccess(null);
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
    if (new RegExp(`^(${preamble})*(move|archive|add)\\b`, 'i').test(s)) return false;
    const hasCommandVerb = /\bmove(s|d|ing)?\b/i.test(s) || /\barchiv/i.test(s) || /\badd(s|ed|ing)?\b/i.test(s);
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
      const picks = await recommendFromCellar(transcript, wines);
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
    // Mood / recommendation — a free description, handled by its own flow.
    if (isMoodCommand(transcript)) { runMoodRecommend(); return; }
    // Move / archive / add must name a vintage so the right bottle is targeted —
    // or the user can explicitly say the wine is non-vintage.
    if (!mentionsVintage(transcript)) {
      showAlert({
        title: "Vinster didn't catch a vintage",
        body: "Please repeat the command including the wine's vintage, or say 'non-vintage'.",
      });
      return;
    }
    // Free-form command: infer the verb from the words rather than making the
    // user pick it up front. "add" (a new bottle) first, then archive, else move.
    const act: CellarCommandAction = /\badd(s|ed|ing)?\b/i.test(transcript)
      ? 'add'
      : /\barchiv/i.test(transcript) ? 'archive' : 'move';
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
      const res = await parseCellarCommand(act, transcript, wines, locations, units);
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
        if (res.candidates.length > 1) { setPhase('pick'); return; }
        setPhase('need');
        return;
      }
      // A move needs a destination — either an Alt Cellar or a rack/fridge/bin.
      if (act === 'move' && (res.needs === 'location' || (!res.locationId && !res.unitId))) {
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
        if (!result?.locationId && !result?.unitId) return;
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const whole = count >= chosenWine.quantity;
        const fromName = chosenWine.storage_location_id
          ? (locations.find((l) => l.id === chosenWine.storage_location_id)?.name ?? 'your cellar')
          : 'your cellar';
        const toName = destName ?? 'its new location';
        // A rack/fridge/bin destination flags the bottle "awaiting placement" in
        // that unit (no slot yet); an Alt Cellar keeps storage_location_id and
        // is flagged awaiting placement too (the user can "ignore" it there).
        const destFields = result?.unitId
          ? { storage_location_id: null, case_id: null, bin_cell_id: null, awaiting_placement: true, awaiting_placement_unit_id: result.unitId }
          : { storage_location_id: result!.locationId, case_id: null, bin_cell_id: null, awaiting_placement: true, awaiting_placement_unit_id: null };

        if (whole) {
          await clearWineFromRacks(chosenWine.id);
          await updateCellarWine(chosenWine.id, destFields);
        } else {
          // Partial move: free that many source slots, decrement the source, and
          // clone a destination row carrying the moved bottles (awaiting placement).
          await removeSlotsForWine(chosenWine.id, count);
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
          const { id, created_at, updated_at, ...rest } = chosenWine;
          await addCellarWine({ ...rest, quantity: count, is_wishlist: false, ...destFields });
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
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} · from ${fromName} to ${toName} — awaiting placement`,
          viewLabel: `View in ${toName}`,
          viewRoute,
        });
      } else if (action === 'archive') {
        if (!chosenWine) return;
        // archive — mirror the Chef pairing "Select & Archive" flow so the
        // removal log and archive stats stay consistent.
        const count = Math.min(chosenWine.quantity, Math.max(1, result?.quantity ?? chosenWine.quantity));
        const removedAt = new Date().toISOString();
        await addCellarWineRemoval({ cellarWineId: chosenWine.id, removedAt, count, note: 'Archived by voice command' });
        if (count >= chosenWine.quantity) {
          await updateCellarWine(chosenWine.id, { quantity: count, archived_at: removedAt });
        } else {
          await updateCellarWine(chosenWine.id, { quantity: chosenWine.quantity - count });
          const { id, created_at, updated_at, ...rest } = chosenWine;
          await addCellarWine({ ...rest, quantity: count, archived_at: removedAt, is_wishlist: false });
        }
        qc.invalidateQueries({ queryKey: ['cellar', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-archive', userId] });
        qc.invalidateQueries({ queryKey: ['cellar-removals', chosenWine.id] });
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        setSuccess({
          action: 'archive',
          wine: [chosenWine.producer, chosenWine.wine_name].filter(Boolean).join(' '),
          meta: [chosenWine.region, chosenWine.vintage].filter(Boolean).join(' · '),
          detail: `${count} ${count === 1 ? 'bottle' : 'bottles'} moved to Your Cellar Archive`,
          viewLabel: 'View in Your Cellar Archive',
          viewRoute: '/cellar/list?archived=1',
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
          storage_location_id: result?.locationId ?? null,
          awaiting_placement: true,
        };
        await addCellarWine(payload);
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
      setPhase('success');
    } catch {
      setPhase('error');
    } finally {
      setExecuting(false);
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
    return `Archive ${bottles} of ${wineLabel(chosenWine)}?`;
  }

  const candidateWines = (result?.candidates ?? []).map((id) => wines.find((w) => w.id === id)).filter(Boolean) as CellarWine[];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {phase === 'speak' && (
            <ScrollView style={{ maxHeight: winH * 0.82 }} contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.voiceHeader}>Voice Command</Text>
              <Text style={styles.introText}>{introText ?? DEFAULT_INTRO_TEXT}</Text>

              <View style={styles.modalDivider} />

              <Text style={styles.title}>Tap the mic and speak</Text>
              <View style={styles.micRow}>
                {/* Mic output runs through the wine-term corrector; manual edits below don't. */}
                <MicButton value={transcript} onChangeText={(t) => setTranscript(correctWineTerms(t))} onClear={() => setTranscript('')} />
              </View>
              {/* Editable so the user can fix any mis-hearing before confirming. */}
              <TextInput
                style={[styles.inputField, styles.inputText]}
                value={transcript}
                onChangeText={setTranscript}
                placeholder="Tap the mic and speak, or type your command…"
                placeholderTextColor={colors.textSubtle}
                multiline
              />
              <Text style={styles.editHint}>Tip: you can edit the text above before confirming.</Text>

              <View style={styles.suggestions}>
                {(suggestions ?? DEFAULT_SUGGESTIONS).map((s, i) => (
                  <Text key={i} style={styles.suggestion}>{`“${s}”`}</Text>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !transcript.trim() && styles.btnDisabled]}
                onPress={runParse}
                disabled={!transcript.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </ScrollView>
          )}

          {phase === 'parsing' && (
            <View style={styles.centerBlock}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.parsingText}>Understanding…</Text>
            </View>
          )}

          {phase === 'pick' && (
            <>
              <Text style={styles.title}>Which wine did you mean?</Text>
              <ScrollView style={{ maxHeight: 320 }}>
                {candidateWines.map((w) => (
                  <TouchableOpacity key={w.id} style={styles.pickRow} onPress={() => { setChosenWineId(w.id); setPhase('confirm'); }} activeOpacity={0.7}>
                    <Text style={styles.pickWine} numberOfLines={2}>{wineLabel(w)}</Text>
                    {w.region ? <Text style={styles.pickRegion} numberOfLines={1}>{w.region}</Text> : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={() => setPhase('speak')} style={styles.cancelRow}><Text style={styles.cancelText}>Try again</Text></TouchableOpacity>
            </>
          )}

          {phase === 'confirm' && (
            <>
              <Text style={styles.title}>Confirm</Text>
              <Text style={styles.confirmBody}>{confirmText()}</Text>
              <TouchableOpacity style={[styles.primaryBtn, executing && styles.btnDisabled]} onPress={execute} disabled={executing} activeOpacity={0.8}>
                {executing ? <ActivityIndicator color={colors.gold} /> : <Text style={styles.primaryBtnText}>{action === 'archive' ? 'Archive' : action === 'add' ? 'Add' : 'Move'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPhase('speak')} style={styles.cancelRow}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </>
          )}

          {phase === 'need' && (
            <>
              <Text style={styles.title}>Didn't quite catch that</Text>
              <Text style={styles.confirmBody}>{result?.message?.trim() || (action === 'move' ? "I couldn't match the wine or the location. Try again — name the wine and where to move it." : "I couldn't match that to a wine in your cellar. Try again with the producer or wine name.")}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('speak')} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Try again</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
            </>
          )}

          {phase === 'error' && (
            <>
              <Text style={styles.title}>Something went wrong</Text>
              <Text style={styles.confirmBody}>Please try again.</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('speak')} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Try again</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Close</Text></TouchableOpacity>
            </>
          )}

          {phase === 'success' && success && (
            <>
              <Text style={styles.successAction}>{success.action === 'archive' ? 'Archived' : success.action === 'add' ? 'Added' : 'Moved'}</Text>
              <Text style={styles.successWine}>{success.wine}</Text>
              {success.meta ? <Text style={styles.successMeta}>{success.meta}</Text> : null}
              <Text style={styles.successDetail}>{success.detail}</Text>
              <TouchableOpacity onPress={() => { handleClose(); router.push(success.viewRoute as any); }} activeOpacity={0.7} style={styles.viewLinkRow}>
                <Text style={styles.viewLink}>{success.viewLabel} →</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, styles.successBtn]} onPress={reset} activeOpacity={0.8}><Text style={styles.primaryBtnText}>Another Command</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Done</Text></TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

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
