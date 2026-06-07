import { useRef, useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { showAlert } from './AppAlert';
import { colors } from '../constants/theme';

interface Props {
  // Called with each final transcript chunk; the parent decides how to append.
  onResult: (text: string) => void;
  style?: StyleProp<ViewStyle>;
}

// On-device dictation mic. Tap to speak, tap again (or stop talking) to finish.
// Speech→text happens on the phone (Apple/Google) — the audio never leaves the
// device and nothing is stored; only the resulting text is handed to onResult.
export function MicButton({ onResult, style }: Props) {
  const [listening, setListening] = useState(false);
  // Ref, not state, so the global result handler always reads the live value —
  // multiple MicButtons can be mounted (one per field) and all receive the
  // event; only the one actually listening should append.
  const listeningRef = useRef(false);

  useSpeechRecognitionEvent('result', (e) => {
    if (!listeningRef.current) return;
    const transcript = e.results?.[0]?.transcript?.trim();
    if (e.isFinal && transcript) onResult(transcript);
  });
  useSpeechRecognitionEvent('end', () => { listeningRef.current = false; setListening(false); });
  useSpeechRecognitionEvent('error', () => { listeningRef.current = false; setListening(false); });

  async function toggle() {
    if (listeningRef.current) {
      ExpoSpeechRecognitionModule.stop();
      listeningRef.current = false;
      setListening(false);
      return;
    }
    try {
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Microphone needed', body: 'Allow microphone and speech access to dictate.' });
        return;
      }
      listeningRef.current = true;
      setListening(true);
      ExpoSpeechRecognitionModule.start({ lang: 'en-US', interimResults: false, continuous: false });
    } catch (err) {
      listeningRef.current = false;
      setListening(false);
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
      <Text style={styles.icon}>{listening ? '⏹' : '🎙️'}</Text>
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
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: { backgroundColor: 'rgba(224,184,74,0.25)' },
  icon: { fontSize: 15 },
});
