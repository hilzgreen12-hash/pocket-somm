import { useRef, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { showAlert } from './AppAlert';
import { correctWineTerms } from '../utils/wineDictation';
import { correctFoodTerms } from '../utils/foodDictation';
import { correctVoiceTranscript } from '../api/correctVoice';
import { useDictationCorrect, useDictationHints, useSoundCorrect } from '../hooks/useDictationCorrect';
import { colors } from '../constants/theme';

interface Props {
  // Current field text + a live setter. Dictation streams interim results
  // straight into the field so the writing fills in as the user speaks.
  value: string;
  onChangeText: (text: string) => void;
  // When provided, a bin button sits beside the mic so the user can trash
  // what they've written and start a fresh review.
  onClear?: () => void;
  style?: StyleProp<ViewStyle>;
  // Which vocabulary to correct the dictation against. 'wine' (default) nudges
  // producer/region/grape names + fuzzy-matches the user's cellar; 'food' nudges
  // dish/ingredient/technique names (e.g. the Find A Wine Pairing dish field).
  // wine = names; query = a question about wine records; note = free-text
  // tasting note / memory; food = dishes; text = plain answers (mood, occasion,
  // decant time, budget…) with no wine or food correction at all. Only wine,
  // query and note get wine-name correction.
  domain?: 'wine' | 'food' | 'query' | 'note' | 'text';
  // When true, the FINAL transcript is additionally sent to the server-side LLM
  // corrector (correct-voice) — catches the long tail of mangled wine/food names
  // the on-device dictionary misses ("corn-ass" → "Cornas"). Best-effort: the
  // local-corrected text shows immediately and is replaced if the server differs.
  // Enable on short, name-heavy fields (search, dish, voice command), NOT on
  // long free-text notes.
  serverCorrect?: boolean;
  // True from the moment dictation starts until the finished, corrected text is
  // in the field — the field shows a swirl (DictationSwirl) meanwhile instead of
  // the raw words and their corrections appearing as the user speaks.
  onWorkingChange?: (working: boolean) => void;
}

// On-device dictation mic, drawn in the gold motif style, with an optional
// bin. Tap the mic to speak, tap again to stop. Speech→text happens on the
// phone (Apple/Google) — the audio never leaves the device and nothing is
// stored; only the resulting text is written into the field.
export function MicButton({ value, onChangeText, onClear, style, domain = 'wine', serverCorrect = false, onWorkingChange }: Props) {
  const [listening, setListening] = useState(false);
  const workingRef = useRef(onWorkingChange);
  workingRef.current = onWorkingChange;
  // Live field text, so a late finish can tell whether the field has changed.
  const valueRef = useRef(value);
  valueRef.current = value;
  // Set once a final transcript is being corrected, so "end" doesn't hide the
  // swirl before the finished text lands.
  const finishingRef = useRef(false);
  // Each dictation gets a stamp; a late finish from an earlier dictation (its
  // server correction still pending) must not overwrite a newer one or hide
  // its swirl.
  const sessionRef = useRef(0);
  // Latest interim (locally corrected) transcript, and whether a final result
  // arrived — Android often ends/errors without a final, and for wine fields
  // the interim words are hidden, so they'd otherwise be lost.
  const interimRef = useRef('');
  const gotFinalRef = useRef(false);
  // Only wine names are worked out behind the swirl (they're what speech-to-
  // text mangles); notes, dishes and plain answers still fill in live.
  const hideLive = domain === 'wine' || domain === 'query';
  const setWorking = (w: boolean) => { if (hideLive) workingRef.current?.(w); };
  // Refs, not state, so the global event handlers always read live values —
  // multiple MicButtons can be mounted (one per field) and all receive
  // events; only the one actually listening should write. `base` holds the
  // committed text captured when dictation starts so interim transcripts
  // (which are cumulative) can be re-joined onto it live.
  const listeningRef = useRef(false);
  const baseRef = useRef('');
  // Data-driven producer correction from the user's cellar (long tail beyond the
  // hand-written dictionary). Held in a ref so the event handler always uses the
  // latest index even if the cellar changes mid-mount.
  const refine = useDictationCorrect();
  // Cellar producer / cuvée names, passed to the recogniser as hints (wine only).
  const hints = useDictationHints();
  // Sound-alike correction against the user's own wines (not for long notes).
  const sound = useSoundCorrect();
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const refineRef = useRef(refine);
  refineRef.current = refine;

  function stopState() {
    listeningRef.current = false;
    setListening(false);
    if (!finishingRef.current) setWorking(false);
  }

  // The finished utterance: run the heavier corrections (cellar fuzzy snap,
  // optional server pass) and write the result once.
  function finalize(spoken: string) {
    gotFinalRef.current = true;
    const session = sessionRef.current;
    // The fuzzy cellar-producer snap is wine-only; for food, the dictionary pass
    // is the final correction.
    const base = baseRef.current;
    const refined = domain === 'food' || domain === 'text' ? spoken
      : domain === 'note' ? refineRef.current(spoken)
      : soundRef.current(refineRef.current(spoken));
    const joined = joinDictation(base, refined);
    if (!hideLive) {
      // Live fields: show the local text now; the server pass may replace it.
      onChangeText(joined);
      baseRef.current = joined;
    }
    finishingRef.current = hideLive;
    // Write the finished text once — after the server correction when there
    // is one — so the user never sees the raw words being fixed.
    const finish = (text: string) => {
      // A newer dictation has started: this result is stale.
      if (session !== sessionRef.current) return;
      finishingRef.current = false;
      setWorking(false);
      if (!hideLive) {
        // Only replace the live text if nothing has changed since.
        if (text !== joined && baseRef.current === joined) { onChangeText(text); baseRef.current = text; }
        return;
      }
      // Defensive: the field is locked while the swirl shows, but never
      // overwrite text that changed since dictation started.
      if ((valueRef.current ?? '').trim() !== base) return;
      onChangeText(text);
      baseRef.current = text;
    };
    // Server-side LLM pass for the long tail the local dictionary misses.
    // Re-joins onto the SAME base. If the on-phone pass already snapped a name
    // to one of the user's OWN wines, trust it: the server corrector matches
    // against the whole wine catalogue and could swap the user's wine for one
    // they don't own ("Rieussec" → "d'Armailhac").
    const ownWineHit = domain !== 'food' && refined !== spoken;
    if (serverCorrect && domain !== 'text' && !ownWineHit && refined.trim()) {
      // Never wait forever: after 12s the on-phone correction stands.
      const timeout = new Promise<null>((r) => setTimeout(() => r(null), 12000));
      Promise.race([correctVoiceTranscript(refined, domain), timeout])
        .then((corrected) => {
          const c = (corrected ?? '').trim();
          finish(c && c !== refined.trim() ? joinDictation(base, c) : joined);
        })
        .catch(() => finish(joined));
    } else {
      finish(joined);
    }
  }

  useSpeechRecognitionEvent('result', (e) => {
    if (!listeningRef.current) return;
    const transcript = e.results?.[0]?.transcript;
    if (transcript == null) return;
    // Nudge misheard wine vocabulary (producer/region/grape names) back to the
    // right spelling on the DICTATED text only — applied centrally here so every
    // dictation surface benefits (tasting notes, reviews, voice commands), not
    // just the ones that happened to wrap it. Correct only the spoken chunk and
    // join onto the untouched base, so anything the user typed is left exactly
    // as written.
    const spoken = domain === 'text' ? transcript : (domain === 'food' ? correctFoodTerms : correctWineTerms)(transcript);
    // Interim transcripts are the full hypothesis-so-far for the utterance, so
    // re-join onto the captured base each time rather than appending. On the
    // FINAL transcript, also run the (heavier) corrections once.
    if (e.isFinal) {
      finalize(spoken);
    } else {
      interimRef.current = spoken;
      // Notes, dishes and answers fill the field live as the user speaks.
      if (!hideLive) onChangeText(joinDictation(baseRef.current, spoken));
      // Wine names: interim results stay hidden — the swirl stands in for them.
    }
  });
  // Ended/errored without a final result (common on Android): for hidden-live
  // fields, finish with the last interim words rather than dropping them.
  function endWithoutFinal() {
    if (listeningRef.current && hideLive && !gotFinalRef.current && interimRef.current.trim()) {
      finalize(interimRef.current);
    }
    stopState();
  }
  useSpeechRecognitionEvent('end', endWithoutFinal);
  useSpeechRecognitionEvent('error', endWithoutFinal);

  async function toggle() {
    if (listeningRef.current) {
      ExpoSpeechRecognitionModule.stop(); // triggers a final result + "end"
      return;
    }
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Microphone needed', body: 'Allow microphone and speech access to dictate.' });
        return;
      }
      sessionRef.current += 1;
      baseRef.current = (value ?? '').trim();
      interimRef.current = '';
      gotFinalRef.current = false;
      listeningRef.current = true;
      finishingRef.current = false;
      setListening(true);
      setWorking(true);
      // interimResults:true so the field updates as the user speaks.
      // British English (Vinster's users say "Château" and "Sadie" the UK way),
      // biased towards the names in the user's own cellar for wine fields.
      ExpoSpeechRecognitionModule.start({
        lang: 'en-GB',
        interimResults: true,
        continuous: false,
        ...(domain !== 'food' && hints.length ? { contextualStrings: hints } : {}),
      });
    } catch (err) {
      stopState();
      showAlert({ title: 'Could not start dictation', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function handleClear() {
    if (!onClear) return;
    if (!(value ?? '').trim()) { onClear(); return; }
    showAlert({
      title: 'Clear this field?',
      body: "This removes what you've written so you can start again.",
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClear },
      ],
    });
  }

  return (
    <View style={[styles.row, style]}>
      <TouchableOpacity
        onPress={toggle}
        style={[styles.btn, listening && styles.btnActive]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
        accessibilityLabel={listening ? 'Stop dictation' : 'Dictate'}
      >
        {listening ? (
          <View style={styles.stopSquare} />
        ) : (
          <View style={styles.micStack}>
            <View style={styles.micHead} />
            <View style={styles.micStem} />
            <View style={styles.micBase} />
          </View>
        )}
      </TouchableOpacity>
      {onClear ? (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.btn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
          accessibilityLabel="Clear this field"
        >
          <View style={styles.binStack}>
            <View style={styles.binHandle} />
            <View style={styles.binLid} />
            <View style={styles.binBody} />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// Join a dictated chunk onto existing field text with sensible spacing.
function joinDictation(base: string, chunk: string): string {
  const head = (base ?? '').trimEnd();
  const tail = (chunk ?? '').trim();
  if (!tail) return head;
  return head ? `${head} ${tail}` : tail;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: { backgroundColor: 'rgba(224,184,74,0.20)' },
  // Gold mic motif — matches the home-tile / Your Wine Reviews icon style.
  micStack: { alignItems: 'center' },
  micHead: { width: 9, height: 13, borderWidth: 1.2, borderColor: colors.gold, borderRadius: 4.5 },
  micStem: { width: 1.2, height: 3, backgroundColor: colors.gold },
  micBase: { width: 10, height: 1.2, backgroundColor: colors.gold, borderRadius: 1 },
  stopSquare: { width: 11, height: 11, borderRadius: 2, backgroundColor: colors.gold },
  // Gold bin motif — handle bar, lid, tapered body.
  binStack: { alignItems: 'center' },
  binHandle: { width: 5, height: 1.4, backgroundColor: colors.gold, borderRadius: 1, marginBottom: 1 },
  binLid: { width: 14, height: 1.6, backgroundColor: colors.gold, borderRadius: 1 },
  binBody: { width: 10, height: 11, borderWidth: 1.2, borderColor: colors.gold, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginTop: 1 },
});
