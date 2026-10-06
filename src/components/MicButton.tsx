import { useRef, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { showAlert } from './AppAlert';
import { correctWineTerms } from '../utils/wineDictation';
import { correctFoodTerms } from '../utils/foodDictation';
import { useDictationCorrect } from '../hooks/useDictationCorrect';
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
  domain?: 'wine' | 'food';
}

// On-device dictation mic, drawn in the gold motif style, with an optional
// bin. Tap the mic to speak, tap again to stop. Speech→text happens on the
// phone (Apple/Google) — the audio never leaves the device and nothing is
// stored; only the resulting text is written into the field.
export function MicButton({ value, onChangeText, onClear, style, domain = 'wine' }: Props) {
  const [listening, setListening] = useState(false);
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
  const refineRef = useRef(refine);
  refineRef.current = refine;

  function stopState() {
    listeningRef.current = false;
    setListening(false);
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
    const spoken = (domain === 'food' ? correctFoodTerms : correctWineTerms)(transcript);
    // Interim transcripts are the full hypothesis-so-far for the utterance, so
    // re-join onto the captured base each time rather than appending — this fills
    // the field live instead of only on stop. On the FINAL transcript, also run
    // the (heavier) fuzzy cellar-producer correction once, so a misheard producer
    // snaps to the real name the user owns without slowing the live typing.
    if (e.isFinal) {
      // The fuzzy cellar-producer snap is wine-only; for food, the dictionary pass
      // above is the final correction.
      const refined = domain === 'food' ? spoken : refineRef.current(spoken);
      const joined = joinDictation(baseRef.current, refined);
      onChangeText(joined);
      baseRef.current = joined;
    } else {
      onChangeText(joinDictation(baseRef.current, spoken));
    }
  });
  useSpeechRecognitionEvent('end', () => { stopState(); });
  useSpeechRecognitionEvent('error', () => { stopState(); });

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
      baseRef.current = (value ?? '').trim();
      listeningRef.current = true;
      setListening(true);
      // interimResults:true so the field updates as the user speaks.
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
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
export function joinDictation(base: string, chunk: string): string {
  const head = (base ?? '').trimEnd();
  const tail = (chunk ?? '').trim();
  if (!tail) return head;
  return head ? `${head} ${tail}` : tail;
}

// Back-compat alias for older append-style callers.
export const appendDictation = joinDictation;

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
