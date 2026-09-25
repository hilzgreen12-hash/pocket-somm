import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { MicButton } from './MicButton';
import { useCellar } from '../hooks/useCellar';
import { usePreferences } from '../hooks/usePreferences';
import { useChefLabelHistory } from '../hooks/useChefHistory';
import { classifyPairVoice } from '../api/pairVoice';
import { isNetworkError } from '../api/invokeResilient';
import { findFoodWinePairing, generatePairings } from '../api/label';
import { useFoodPairingStore, type CellarRecommendation } from '../stores/foodPairingStore';
import { useLabelStore } from '../stores/labelStore';
import { correctWineTerms } from '../utils/wineDictation';
import type { ChefLabelSession } from '../api/chef';
import type { WineDetailsComplete } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

const INTRO = "Vinster has been trained in three Pairing voice commands: Find recipes from Your Cookbook, Find a wine pairing from your cellar for a dish, and suggest ingredients/dishes for a wine. Using Vinster's pairing tools will provide deeper results, but voice command does the trick for quick ideas.";
const SUGGESTIONS = [
  'Find me two wines to open with Sole Meunière tonight',
  'Suggest a dish to pair with Washington Cabernet Franc',
  'Find me my beef recipe that was paired with Côte Rôtie',
];

const norm = (s?: string | null): string => (s ?? '').toLowerCase().trim();

// Best-match a saved cookbook recipe against a spoken dish and/or paired wine.
// Scores exact-substring hits highest, then token overlap; null if nothing matches.
function findCookbookMatch(sessions: ChefLabelSession[], dishQuery?: string | null, wineQuery?: string | null): ChefLabelSession | null {
  const dq = norm(dishQuery);
  const wq = norm(wineQuery);
  if (!dq && !wq) return null;
  let best: ChefLabelSession | null = null;
  let bestScore = 0;
  for (const s of sessions) {
    const dish = norm(s.pairings?.[0]?.dishName);
    const wineStr = norm([s.wine?.producer, s.wine?.wineName, s.wine?.region].filter(Boolean).join(' '));
    let score = 0;
    if (dq && dish.includes(dq)) score += 2;
    else if (dq) for (const t of dq.split(/\s+/)) if (t.length > 2 && dish.includes(t)) score += 1;
    if (wq && wineStr.includes(wq)) score += 2;
    else if (wq) for (const t of wq.split(/\s+/)) if (t.length > 2 && wineStr.includes(t)) score += 1;
    if (score > bestScore) { bestScore = score; best = s; }
  }
  return bestScore > 0 ? best : null;
}

// The Pair-tab voice concierge. Mirrors DiscoverVoiceModal: mic → server classify
// → act on ONE of three pairing intents, never guessing. Styling matches the
// Cellar/Home Voice Command pop-ups for consistency.
export function PairVoiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height: winH } = useWindowDimensions();
  const { wines } = useCellar();
  const { preferences } = usePreferences();
  const { sessions } = useChefLabelHistory();

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
      const res = await classifyPairVoice(transcript);

      // 1. Wine from the user's cellar for a dish.
      if (res.intent === 'cellar_pairing' && res.dish?.trim()) {
        setThinkingText('Finding wines from your cellar…');
        const cellarSummary = wines.map((w) => ({
          id: w.id,
          wine_name: w.wine_name,
          producer: w.producer,
          region: w.region,
          vintage: w.vintage,
          grape_variety: w.grape_variety,
          drinking_window_status: w.drinking_window_status,
          purchase_price: w.purchase_price ?? null,
          purchase_price_currency: w.purchase_price_currency ?? null,
        }));
        const result = await findFoodWinePairing(res.dish.trim(), 'cellar', cellarSummary, undefined, null, null, null) as any;
        const fp = useFoodPairingStore.getState();
        fp.setDish(res.dish.trim());
        fp.setMode('cellar');
        fp.setCellarResult((result?.recommendations ?? []) as CellarRecommendation[]);
        handleClose();
        router.push('/chef/pairing-results' as any);
        return;
      }

      // 2. A dish / recipe for a named wine.
      if (res.intent === 'dish_suggestion' && res.wine) {
        setThinkingText('Finding a dish to pair…');
        const w = res.wine;
        const wineDetails: WineDetailsComplete = {
          producer: w.producer ?? '',
          region: w.region ?? '',
          wineName: w.wineName,
          vintage: (w.vintage ?? '').trim() || 'NV',
          style: w.style ?? null,
          grape: w.grape ?? null,
          bottleSizeMl: null,
          quantity: 1,
        };
        const filters = {
          dietary: null,
          allergens: [],
          customAllergen: '',
          dietaryNote: null,
          course: null,
          difficulty: null,
          timeConsideration: null,
          specificConcerns: null,
          regionalPreferences: preferences?.regionalPreferences ?? [],
          nutritionalPreferences: preferences?.nutritionalPreferences ?? [],
          servings: null,
        };
        const pairings = await generatePairings(wineDetails as any, filters as any);
        const ls = useLabelStore.getState();
        ls.reset();
        ls.setWineDetailsConfirmed(wineDetails);
        ls.setPairings(pairings);
        ls.setFilters(filters as Record<string, unknown>);
        handleClose();
        router.replace('/chef/results' as any);
        return;
      }

      // 3. A recipe already saved in the cookbook.
      if (res.intent === 'cookbook_search') {
        const match = findCookbookMatch(sessions, res.dishQuery, res.wineQuery);
        if (match) {
          handleClose();
          router.push(`/chef/recipe-full?sessionId=${match.id}` as any);
          return;
        }
        setUnclearMsg("Vinster couldn't find that in your cookbook — try the dish name or the wine you paired it with.");
        setPhase('speak');
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
              <Text style={styles.introText}>{INTRO}</Text>
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

// Mirrors CellarCommandModal / DiscoverVoiceModal so every Voice Command reads identically.
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  voiceHeader: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  introText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 22 },
  unclear: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', marginTop: spacing.md, lineHeight: 20 },
  modalDivider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  micRow: { alignItems: 'center', marginBottom: spacing.md },
  inputField: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md, minHeight: 64, marginBottom: spacing.xs },
  inputText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22 },
  editHint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textSubtle, textAlign: 'center', marginBottom: spacing.md },
  suggestions: { gap: spacing.sm, marginBottom: spacing.lg },
  suggestion: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 20 },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelRow: { alignItems: 'center', paddingVertical: spacing.md },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  centre: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  centreText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
