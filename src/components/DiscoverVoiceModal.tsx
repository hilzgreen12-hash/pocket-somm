import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MicButton } from './MicButton';
import { useCellar } from '../hooks/useCellar';
import { usePreferences } from '../hooks/usePreferences';
import { classifyDiscoverVoice } from '../api/discoverVoice';
import { isNetworkError } from '../api/invokeResilient';
import { useMoodPicksStore, type MoodPickView } from '../stores/moodPicksStore';
import { useConsultStore } from '../stores/consultStore';
import { useLabelStore } from '../stores/labelStore';
import { useLastIntelStore } from '../stores/lastIntelStore';
import { generateWineIntel } from '../services/pricing';
import { correctWineTerms } from '../utils/wineDictation';
import type { WineDetailsComplete } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

const SUGGESTIONS = [
  "It's cold and I want something red — choose from my cellar",
  "I'm at a shop, help me choose between a Cabernet and a Syrah for steak frites",
  'Generate wine intel on Château Latour 2005',
];

// Discovery-only voice concierge for the Discover tab: recommend from the user's
// cellar, a shop/restaurant consult, or Wine Intel on a named wine. It does NOT
// do cellar admin (move/archive/add) — the server classifier routes to exactly
// one intent and asks the user to rephrase if it isn't confident.
export function DiscoverVoiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height: winH } = useWindowDimensions();
  const { wines } = useCellar();
  const { preferences } = usePreferences();
  const [phase, setPhase] = useState<'speak' | 'thinking' | 'error'>('speak');
  const [transcript, setTranscript] = useState('');
  const [thinkingText, setThinkingText] = useState('Vinster is listening…');
  const [unclearMsg, setUnclearMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    setPhase('speak'); setTranscript(''); setUnclearMsg(null); setThinkingText('Vinster is listening…');
  }, [visible]);

  function handleClose() { onClose(); }

  async function runVoice() {
    if (!transcript.trim()) return;
    setUnclearMsg(null);
    setThinkingText('Working out what you need…');
    setPhase('thinking');
    try {
      const res = await classifyDiscoverVoice(transcript, wines);

      if (res.intent === 'cellar_mood') {
        const views = (res.picks ?? [])
          .map((p) => { const w = wines.find((x) => x.id === p.id); return w ? { wine: w, rank: p.rank, why: p.why } : null; })
          .filter(Boolean) as MoodPickView[];
        if (views.length === 0) {
          setUnclearMsg("Vinster couldn't find a match in your cellar — try describing your mood, the meal, or the style you fancy.");
          setPhase('speak');
          return;
        }
        useMoodPicksStore.getState().set(transcript.trim(), views);
        handleClose();
        router.push('/cellar/mood-picks' as any);
        return;
      }

      if (res.intent === 'consult') {
        useConsultStore.getState().set(res.question?.trim() || transcript.trim(), res.advice?.trim() || '');
        handleClose();
        router.push('/discover/consult' as any);
        return;
      }

      if (res.intent === 'intel' && res.wine) {
        const w = res.wine;
        setThinkingText('Generating Wine Intel…');
        const confirmed: WineDetailsComplete = {
          producer: w.producer,
          region: w.region ?? '',
          wineName: w.wineName,
          vintage: (w.vintage ?? '').trim() || 'NV',
          style: w.style ?? null,
          grape: w.grape ?? null,
          bottleSizeMl: null,
          quantity: 1,
        };
        const ls = useLabelStore.getState();
        ls.reset();
        ls.setWineDetailsConfirmed(confirmed);
        const currency = preferences?.defaultCurrency ?? 'GBP';
        const intel = await generateWineIntel(confirmed, currency);
        ls.setIntelligence(intel);
        ls.setImageUri(null);
        // A voice-command wine query isn't a "scan" — keep it out of Recent Scans.
        useLastIntelStore.getState().setLast(confirmed, intel, { recordRecent: false });
        handleClose();
        router.push('/label/results?context=intel&fresh=1&confirmed=1' as any);
        return;
      }

      // unclear (or a payload we couldn't act on) — never guess.
      setUnclearMsg(res.message?.trim() || "Vinster wasn't sure what you meant. Try one of the examples below.");
      setPhase('speak');
    } catch (err) {
      setThinkingText(isNetworkError(err) ? 'You appear to be offline.' : 'Something went wrong.');
      setPhase('error');
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {phase === 'thinking' ? (
            <View style={styles.centre}>
              <ActivityIndicator size="large" color={colors.gold} />
              <Text style={styles.centreText}>{thinkingText}</Text>
            </View>
          ) : phase === 'error' ? (
            <View style={styles.centre}>
              <Text style={styles.title}>{thinkingText}</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('speak')} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={{ maxHeight: winH * 0.82 }} contentContainerStyle={{ paddingBottom: 0 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.voiceHeader}>Voice Command</Text>
              <Text style={styles.introText}>Ask Vinster to recommend a wine from your cellar, help you choose between bottles while you're out, or generate Wine Intel on any wine.</Text>

              {unclearMsg ? <Text style={styles.unclear}>{unclearMsg}</Text> : null}

              <View style={styles.modalDivider} />

              <Text style={styles.title}>Tap the mic and speak</Text>
              <View style={styles.micRow}>
                <MicButton value={transcript} onChangeText={(t) => setTranscript(correctWineTerms(t))} onClear={() => setTranscript('')} />
              </View>
              <TextInput
                style={[styles.inputField, styles.inputText]}
                value={transcript}
                onChangeText={setTranscript}
                placeholder="Tap the mic and speak, or type your request…"
                placeholderTextColor={colors.textSubtle}
                multiline
              />
              <Text style={styles.editHint}>Tip: you can edit the text above before continuing.</Text>

              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s, i) => (
                  <Text key={i} style={styles.suggestion}>{`“${s}”`}</Text>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryBtn, !transcript.trim() && styles.btnDisabled]}
                onPress={runVoice}
                disabled={!transcript.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClose} style={styles.cancelRow}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  voiceHeader: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  introText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textAlign: 'center', lineHeight: 21 },
  unclear: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },
  modalDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  title: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  micRow: { alignItems: 'center', marginBottom: spacing.sm },
  inputField: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, minHeight: 60 },
  inputText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, textAlignVertical: 'top' },
  editHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  suggestions: { gap: spacing.xs, marginBottom: spacing.lg },
  suggestion: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19 },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  btnDisabled: { opacity: 0.4 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelRow: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  centre: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  centreText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
