import { useRef, useState } from 'react';
import { TouchableOpacity, View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { showAlert } from './AppAlert';
import { colors } from '../constants/theme';

interface Props {
  // Called with each captured transcript chunk; the parent decides how to append.
  onResult: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

// On-device dictation mic, drawn in the gold motif style. Tap to speak, tap
// again to stop. Speech→text happens on the phone (Apple/Google) — the audio
// never leaves the device and nothing is stored; only the resulting text is
// handed to onResult.
export function MicButton({ onResult, style }: Props) {
  const [listening, setListening] = useState(false);
  // Refs, not state, so the global event handlers always read live values —
  // multiple MicButtons can be mounted (one per field) and all receive events;
  // only the one actually listening should append. `latest` holds the most
  // recent transcript so we can commit it even if no "final" result arrives.
  const listeningRef = useRef(false);
  const latestRef = useRef('');

  function commit() {
    const text = latestRef.current.trim();
    latestRef.current = '';
    if (text) onResult(text);
  }
  function stopState() {
    listeningRef.current = false;
    setListening(false);
  }

  useSpeechRecognitionEvent('result', (e) => {
    if (!listeningRef.current) return;
    const transcript = e.results?.[0]?.transcript;
    if (transcript) latestRef.current = transcript;
    // If the recognizer flags a final result, commit it immediately. Many
    // devices only ever emit interim results and finalise on "end" — handled
    // there too, so we never lose the dictation.
    if (e.isFinal) commit();
  });
  useSpeechRecognitionEvent('end', () => {
    if (listeningRef.current) commit();
    stopState();
  });
  useSpeechRecognitionEvent('error', () => { latestRef.current = ''; stopState(); });

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
      latestRef.current = '';
      listeningRef.current = true;
      setListening(true);
      // interimResults:true so we receive transcripts even when the device
      // never sets isFinal; we commit the latest on stop/end.
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: true, continuous: false });
    } catch (err) {
      stopState();
      showAlert({ title: 'Could not start dictation', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <TouchableOpacity
      onPress={toggle}
      style={[styles.btn, listening && styles.btnActive, style]}
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
  );
}

// Append a dictated chunk to existing field text with sensible spacing.
export function appendDictation(prev: string, chunk: string): string {
  const base = (prev ?? '').trimEnd();
  return base ? `${base} ${chunk}` : chunk;
}

const styles = StyleSheet.create({
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
});
