import { useEffect, useState, type ReactNode } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image,
  StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { MicButton } from './MicButton';
import { showAlert } from './AppAlert';
import { useCellar } from '../hooks/useCellar';
import { usePreferences } from '../hooks/usePreferences';
import { classifyDiscoverVoice, askMyData } from '../api/discoverVoice';
import { chooseFromCellar, decideBetween, mentionsBudget, type CellarPicksResult, type DecideResult } from '../api/homeVoice';
import { isNetworkError } from '../api/invokeResilient';
import { useLabelStore } from '../stores/labelStore';
import { currencySymbol } from '../constants/currency';
import { fetchPricing } from '../services/pricing';
import { resolveIntelCurrency } from '../utils/localCurrency';
import type { CellarWine, WineDetailsComplete } from '../types/wine';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// The guided Home Voice Command (design: the "Voice Command Mockups" canvas).
// Vinster leads with a short set of starters; every step asks ONE thing and the
// user answers by voice (or typing) in a row tied to that question — there is
// no open "say anything" bar. Four flows:
//   Choose from my cellar → dish + mood → decant → budget (only if not given) → picks
//   Help me decide        → how many → describe each wine → dish + mood → verdict
//   Generate Intelligence → which wine → the Wine Intel page
//   Ask about my reviews  → the question → the answer

type Step =
  | 'home'
  | 'c_q' | 'c_decant' | 'c_budget' | 'c_working' | 'c_picks'
  | 'd_count' | 'd_wines' | 'd_q' | 'd_working' | 'd_verdict'
  | 'i_q' | 'i_working'
  | 'r_q' | 'r_working' | 'r_answer'
  | 'error';

const NOTHING_FOOD = 'Nothing, just for drinking';
const NOTHING_SPECIFIC = 'Nothing Specific';
// What the reply bubble says when the user picks "Nothing Specific".
const NO_OCCASION = 'No specific occasion or mood';
const MARK = require('../../assets/vinster-mark.png');

function wineName(w: CellarWine): string {
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ') || w.wine_name || 'Wine';
}

// "£48 · Range £40–£55 · Wine-Searcher" from the value stored on the wine.
function priceLine(w: CellarWine): string | null {
  if (w.estimated_value == null) return null;
  const sym = currencySymbol(w.estimated_value_currency ?? 'GBP');
  const range = w.estimated_value_low != null && w.estimated_value_high != null
    ? ` · Range ${sym}${Math.round(w.estimated_value_low)}–${sym}${Math.round(w.estimated_value_high)}` : '';
  const src = (w.estimated_value_source ?? '').toLowerCase().includes('searcher') ? 'Wine-Searcher' : 'Vinster estimate';
  return `${sym}${Math.round(w.estimated_value)}${range} · ${src}`;
}

export function HomeVoiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height: winH } = useWindowDimensions();
  const { wines } = useCellar();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const sym = currencySymbol(currency);

  const [step, setStep] = useState<Step>('home');
  const [errorMsg, setErrorMsg] = useState('');
  const [retryStep, setRetryStep] = useState<Step>('home');

  // Choose from my cellar
  const [eating, setEating] = useState('');
  const [mood, setMood] = useState('');
  const [decant, setDecant] = useState<'now' | 'time'>('now');
  const [budgetText, setBudgetText] = useState('');
  const [budget, setBudget] = useState<number | null>(null);
  const [picks, setPicks] = useState<CellarPicksResult | null>(null);

  // Help me decide
  const [count, setCount] = useState(3);
  const [decideWines, setDecideWines] = useState<string[]>(['', '', '']);
  const [dEating, setDEating] = useState('');
  const [dMood, setDMood] = useState('');
  const [verdict, setVerdict] = useState<DecideResult | null>(null);

  // Generate Intelligence / Ask about my reviews
  const [intelText, setIntelText] = useState('');
  const [intelUnclear, setIntelUnclear] = useState(false);
  const [intelHeard, setIntelHeard] = useState('');
  const [intelName, setIntelName] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    if (!visible) return;
    setStep('home'); setErrorMsg('');
    setEating(''); setMood(''); setDecant('now'); setBudgetText(''); setBudget(null); setPicks(null);
    setCount(3); setDecideWines(['', '', '']); setDEating(''); setDMood(''); setVerdict(null);
    setIntelText(''); setIntelUnclear(false); setIntelHeard(''); setIntelName(''); setQuestion(''); setAnswer('');
  }, [visible]);

  function fail(err: unknown, back: Step) {
    setErrorMsg(isNetworkError(err) ? 'You appear to be offline. Check your connection and try again.' : 'Something went wrong. Please try again.');
    setRetryStep(back);
    setStep('error');
  }

  // ---- Choose from my cellar --------------------------------------------
  function afterDecant(choice: 'now' | 'time') {
    setDecant(choice);
    if (mentionsBudget(eating, mood)) runCellar(choice, null);
    else setStep('c_budget');
  }
  function submitBudget(value: number | null) {
    setBudget(value);
    runCellar(decant, value);
  }
  async function runCellar(dec: 'now' | 'time', bud: number | null) {
    if (!wines.length) {
      setErrorMsg('Your cellar is empty — add some wines first and Vinster can choose from them.');
      setRetryStep('home'); setStep('error');
      return;
    }
    setStep('c_working');
    try {
      const res = await chooseFromCellar({ eating, occasion: mood, decant: dec, budget: bud, currency, wines });
      setPicks(res);
      setStep('c_picks');
    } catch (err) { fail(err, 'c_decant'); }
  }

  // ---- Help me decide -----------------------------------------------------
  function chooseCount(n: number) {
    setCount(n);
    setDecideWines((cur) => Array.from({ length: n }, (_, i) => cur[i] ?? ''));
    setStep('d_wines');
  }
  async function runDecide() {
    setStep('d_working');
    try {
      const res = await decideBetween({ wines: decideWines.map((w) => w.trim()), eating: dEating, occasion: dMood });
      setVerdict(res);
      setStep('d_verdict');
    } catch (err) { fail(err, 'd_q'); }
  }

  // ---- Generate Intelligence ---------------------------------------------
  async function runIntel() {
    const said = intelText.trim();
    if (!said) return;
    setIntelName(said);
    setStep('i_working');
    try {
      const res = await classifyDiscoverVoice(`Give me the intel on ${said}`, []);
      if (res.intent !== 'intel' || !res.wine?.producer) {
        // Only ask again when Vinster genuinely didn't catch it.
        setIntelHeard(said); setIntelText(''); setIntelUnclear(true); setStep('i_q');
        return;
      }
      const w = res.wine;
      setIntelName([w.producer, w.wineName, w.region, w.vintage].filter(Boolean).join(' · '));
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
      ls.setIntelligence(null);
      ls.setImageUri(null);
      // Verify against Wine-Searcher first, exactly like a label scan. A real
      // listing goes straight to the card; anything unverified (often a misheard
      // name) goes through "Which wine is this?" and Vinster's identity check —
      // so a voice command can never build a card for a wine that doesn't exist.
      let verified = false;
      try {
        const cur = await resolveIntelCurrency(preferences?.defaultCurrency);
        const queryName = [confirmed.producer, confirmed.wineName].filter(Boolean).join(' ').trim();
        const vintageNum = confirmed.vintage && confirmed.vintage !== 'NV' ? Number(confirmed.vintage) : null;
        const pricing = await fetchPricing(queryName, Number.isFinite(vintageNum) ? vintageNum : null, cur);
        verified = pricing.source === 'wine-searcher' && pricing.matched !== false;
      } catch { verified = false; }
      onClose();
      router.push((verified
        ? '/label/results?context=intel&fresh=1&confirmed=1&gen=1&noRecent=1'
        : '/label/results?context=intel&fresh=1&confirm=1&noRecent=1') as any);
    } catch (err) { fail(err, 'i_q'); }
  }

  // ---- Ask about my reviews ----------------------------------------------
  async function runReviews(q?: string) {
    const ask = (q ?? question).trim();
    if (!ask) return;
    setQuestion(ask);
    setStep('r_working');
    try {
      setAnswer(await askMyData(ask));
      setStep('r_answer');
    } catch (err) { fail(err, 'r_q'); }
  }

  // ---- Shared building blocks ---------------------------------------------
  const Title = ({ children }: { children: ReactNode }) => <Text style={styles.title}>{children}</Text>;
  const Q = ({ children, small }: { children: ReactNode; small?: boolean }) => <Text style={[styles.q, small && styles.qSmall]}>{children}</Text>;
  const Said = ({ lines }: { lines: string[] }) => (
    <View style={styles.bubbleWrap}>
      <View style={styles.bubble}>
        {lines.filter(Boolean).map((l, i) => <Text key={i} style={styles.bubbleText}>{l}</Text>)}
      </View>
    </View>
  );
  const Option = ({ label, sub, onPress, first }: { label: string; sub?: string; onPress: () => void; first?: boolean }) => (
    <TouchableOpacity style={[styles.option, first && styles.optionFirst]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionText}>{label}</Text>
        {sub ? <Text style={styles.optionSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.optionArrow}>›</Text>
    </TouchableOpacity>
  );
  const Footer = ({ status, enabled, onContinue }: { status: string; enabled: boolean; onContinue: () => void }) => (
    <View style={styles.footer}>
      <Text style={styles.footerStatus}>{status}</Text>
      <TouchableOpacity onPress={onContinue} disabled={!enabled} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={[styles.continue, !enabled && styles.continueOff]}>Continue ›</Text>
      </TouchableOpacity>
    </View>
  );
  const Working = ({ line, sub }: { line: string; sub?: string }) => (
    <View style={styles.working}>
      <Text style={styles.workingLine}>{line}</Text>
      {sub ? <Text style={styles.workingSub}>{sub}</Text> : null}
      <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.md, alignSelf: 'flex-start' }} />
    </View>
  );

  // An answer row: speak (mic) or type, tied to ONE question.
  function answerRow(value: string, set: (t: string) => void, placeholder = 'Tap the mic and tell me', domain: 'wine' | 'food' | 'query' = 'food', label?: string) {
    return (
      <View style={styles.answerRow}>
        <View style={{ flex: 1 }}>
          {label ? <Text style={styles.answerLabel}>{label}</Text> : null}
          <TextInput
            style={styles.answerInput}
            value={value}
            onChangeText={set}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.6)"
            multiline
          />
        </View>
        <MicButton value={value} onChangeText={set} domain={domain} serverCorrect />
      </View>
    );
  }

  const budgetLabel = budget != null ? `${sym}${budget}` : 'No budget preference';
  const cellarAnswers = [eating, mood];
  const decantLabel = decant === 'time' ? 'I have time to decant' : 'Opening now';

  function renderBody() {
    switch (step) {
      case 'home':
        return (
          <>
            <Title>Tell me what I can help you with, we'll take it from there</Title>
            <View style={styles.options}>
              <Option first label="Choose from my cellar" sub="Not sure what to open? Let's talk about it" onPress={() => setStep('c_q')} />
              <Option label="Help me decide" sub="You've got a selection, I'll narrow it down" onPress={() => setStep('d_count')} />
              <Option label="Generate Intelligence" sub="“Give me the intel on Château Latour 2005”" onPress={() => setStep('i_q')} />
              <Option label="Ask about my reviews" sub="“Where did I drink a Cornas recently?”" onPress={() => setStep('r_q')} />
            </View>
          </>
        );

      // ---------------- Choose from my cellar ----------------
      case 'c_q':
        return (
          <>
            <Title>Tell me what I can help you with, we'll take it from there</Title>
            <Said lines={['Choose from my cellar']} />
            <Q small>Give me some context — what you're eating, the mood, the company — and I'll serve up suggestions.</Q>
            <Q>What are you eating with it?</Q>
            {answerRow(eating, setEating)}
            <View style={styles.options}><Option first label={NOTHING_FOOD} onPress={() => setEating(NOTHING_FOOD)} /></View>
            <Q>What's the occasion or mood?</Q>
            {answerRow(mood, setMood)}
            <View style={styles.options}><Option first label={NOTHING_SPECIFIC} onPress={() => setMood(NO_OCCASION)} /></View>
          </>
        );
      case 'c_decant':
        return (
          <>
            <Title>Selecting wines from your cellar</Title>
            {cellarAnswers.map((a, i) => <Said key={i} lines={[a]} />)}
            <Q>Opening now, or is there time to decant?</Q>
            <View style={styles.options}>
              <Option first label="Opening now" onPress={() => afterDecant('now')} />
              <Option label="I have time to decant" onPress={() => afterDecant('time')} />
            </View>
            <Q small>It changes which bottles are drinking best tonight.</Q>
          </>
        );
      case 'c_budget':
        return (
          <>
            <Title>Selecting wines from your cellar</Title>
            {cellarAnswers.map((a, i) => <Said key={i} lines={[a]} />)}
            <Said lines={[decantLabel]} />
            <Q>Do you have a cost per bottle in mind?</Q>
            <View style={styles.amountRow}>
              <View style={styles.amountBox}>
                <Text style={styles.amountSym}>{sym}</Text>
                <TextInput
                  style={styles.amountInput}
                  value={budgetText}
                  onChangeText={(t) => setBudgetText(t.replace(/[^0-9.]/g, ''))}
                  placeholder="e.g. 45"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  keyboardType="decimal-pad"
                  accessibilityLabel="Price per bottle"
                />
              </View>
              <TouchableOpacity
                onPress={() => { const n = Number(budgetText); if (n > 0) submitBudget(Math.round(n)); }}
                disabled={!(Number(budgetText) > 0)}
                accessibilityLabel="Continue"
                style={styles.amountGo}
              >
                <Text style={[styles.optionArrow, !(Number(budgetText) > 0) && styles.continueOff]}>›</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.note}>Used as a guide against current market prices</Text>
            <View style={styles.options}><Option first label="No preference" onPress={() => submitBudget(null)} /></View>
          </>
        );
      case 'c_working':
        return (
          <>
            <Title>Selecting wines from your cellar</Title>
            {cellarAnswers.map((a, i) => <Said key={i} lines={[a]} />)}
            <Said lines={[decantLabel]} />
            <Said lines={[budgetLabel]} />
            <Working line="Choosing three bottles from your cellar…" />
          </>
        );
      case 'c_picks':
        return (
          <>
            <Text style={styles.brief}>{picks?.brief}</Text>
            <View style={styles.options}>
              {(picks?.picks ?? []).map((p, i) => {
                const w = wines.find((x) => x.id === p.id);
                if (!w) return null;
                const price = priceLine(w);
                return (
                  <TouchableOpacity key={p.id} style={[styles.pick, i === 0 && styles.optionFirst]} activeOpacity={0.7}
                    onPress={() => { onClose(); router.push(`/cellar/${w.id}` as any); }}>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.pickRank}>{p.rank}</Text>
                      <Text style={styles.pickName}>{wineName(w)}</Text>
                      {price ? <Text style={styles.price}>{price}</Text> : null}
                      <Text style={styles.pickWhy}>{p.why}</Text>
                      {p.decant ? <Text style={styles.decant}>{p.decant}</Text> : null}
                    </View>
                    <Text style={styles.optionArrow}>›</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );

      // ---------------- Help me decide ----------------
      case 'd_count':
        return (
          <>
            <Title>Tell me what I can help you with, we'll take it from there</Title>
            <Said lines={['Help me decide between wine options']} />
            <Q>How many wines are you weighing up?</Q>
            <View style={styles.options}>
              <Option first label="Two" onPress={() => chooseCount(2)} />
              <Option label="Three" onPress={() => chooseCount(3)} />
              <Option label="Four" onPress={() => chooseCount(4)} />
            </View>
          </>
        );
      case 'd_wines':
        return (
          <>
            <Title>Helping you choose between {['', '', 'two', 'three', 'four'][count]} wines</Title>
            <Q>Tell me what the wines are in as much detail as you can</Q>
            {decideWines.map((w, i) =>
              <View key={i}>{answerRow(w, (t) => setDecideWines((cur) => cur.map((x, j) => (j === i ? t : x))), 'Tap the mic and describe it', 'wine', `Wine ${i + 1}`)}</View>,
            )}
            <View style={styles.options}>
              <Option first label="Scan labels instead, up to 3" onPress={() => showAlert({ title: 'Coming next', body: 'Scanning labels for Help me decide arrives in the next stage. For now, say or type each wine.' })} />
            </View>
          </>
        );
      case 'd_q':
        return (
          <>
            <Title>Helping you choose between {['', '', 'two', 'three', 'four'][count]} wines</Title>
            <Said lines={decideWines.map((w, i) => `${i + 1}  ${w.trim()}`)} />
            <Q>What are you eating with it?</Q>
            {answerRow(dEating, setDEating)}
            <View style={styles.options}><Option first label={NOTHING_FOOD} onPress={() => setDEating(NOTHING_FOOD)} /></View>
            <Q>What's the occasion or mood?</Q>
            {answerRow(dMood, setDMood)}
            <View style={styles.options}><Option first label={NOTHING_SPECIFIC} onPress={() => setDMood(NO_OCCASION)} /></View>
          </>
        );
      case 'd_working':
        return (
          <>
            <Title>Helping you choose between {['', '', 'two', 'three', 'four'][count]} wines</Title>
            <Said lines={[dEating]} />
            <Said lines={[dMood]} />
            <Working line="Weighing up your wines…" />
          </>
        );
      case 'd_verdict':
        return verdict ? (
          <>
            <Q>{verdict.headline}</Q>
            <View style={styles.pickCard}>
              <Text style={styles.pickName}>{verdict.pickName}</Text>
              <Text style={styles.cardLabel}>With the food</Text>
              <Text style={styles.cardBody}>{verdict.withFood}</Text>
              <Text style={styles.cardLabel}>For the occasion</Text>
              <Text style={styles.cardBody}>{verdict.forOccasion}</Text>
            </View>
            <View style={styles.options}>
              <View style={[styles.pick, styles.optionFirst]}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={styles.pickRank}>Runner up</Text>
                  <Text style={styles.pickName}>{verdict.runnerUpName}</Text>
                  <Text style={styles.pickWhy}>{verdict.runnerUpWhy}</Text>
                </View>
              </View>
            </View>
          </>
        ) : null;

      // ---------------- Generate Intelligence ----------------
      case 'i_q':
        return (
          <>
            {!intelUnclear ? <Title>Tell me what I can help you with, we'll take it from there</Title> : null}
            {!intelUnclear ? <Said lines={['Generate Intelligence']} /> : <Said lines={[intelHeard]} />}
            <Q>{intelUnclear ? "Sorry, I didn't catch that." : 'Which wine?'}</Q>
            <Q small>{intelUnclear ? 'Could you say the wine again?' : "Tell me the producer, the wine and the vintage, and I'll build its Wine Intel."}</Q>
            {answerRow(intelText, setIntelText, 'e.g. Château Latour 2005', 'wine')}
            {!intelUnclear ? (
              <View style={styles.options}>
                <Option first label="Scan the label instead" onPress={() => { onClose(); router.push(`/label/camera?context=intel&backTo=${encodeURIComponent('/(tabs)')}` as any); }} />
              </View>
            ) : null}
          </>
        );
      case 'i_working':
        return (
          <>
            <Said lines={[intelText || intelHeard]} />
            <Working line={`Building Wine Intel on ${intelName}…`} sub="Producer and vintage information, market data, and critic scores" />
            <Text style={styles.note}>This could take a moment, please keep this page open</Text>
          </>
        );

      // ---------------- Ask about my reviews ----------------
      case 'r_q':
        return (
          <>
            <Title>Tell me what I can help you with, we'll take it from there</Title>
            <Said lines={['Ask about my reviews']} />
            <Q>What would you like to know?</Q>
            <Q small>Ask about anything you've reviewed: scores, restaurants, dates, what you drank where.</Q>
            {answerRow(question, setQuestion, 'Tap the mic and ask', 'query')}
            <View style={styles.options}>
              <Option first label="“Where did I drink a Cornas recently?”" onPress={() => runReviews('Where did I drink a Cornas recently?')} />
              <Option label="“What did I score Château Latour?”" onPress={() => runReviews('What did I score Château Latour?')} />
              <Option label="“My highest-scored wines this year”" onPress={() => runReviews('My highest-scored wines this year')} />
            </View>
          </>
        );
      case 'r_working':
        return (
          <>
            <Said lines={[question]} />
            <Working line="Looking through your records…" />
          </>
        );
      case 'r_answer':
        return (
          <>
            <Said lines={[question]} />
            <Text style={styles.answerText}>{answer}</Text>
          </>
        );

      case 'error':
        return (
          <>
            <Q>{errorMsg}</Q>
            <View style={styles.options}>
              <Option first label="Try again" onPress={() => setStep(retryStep)} />
            </View>
          </>
        );
    }
  }

  function renderFooter() {
    switch (step) {
      case 'c_q': {
        const n = [eating, mood].filter((x) => x.trim()).length;
        return <Footer status={`${n} of 2 answered`} enabled={n === 2} onContinue={() => setStep('c_decant')} />;
      }
      case 'd_wines': {
        const n = decideWines.filter((x) => x.trim()).length;
        return <Footer status={`${n} of ${count} described`} enabled={n === count} onContinue={() => setStep('d_q')} />;
      }
      case 'd_q': {
        const n = [dEating, dMood].filter((x) => x.trim()).length;
        return <Footer status={`${n} of 2 answered`} enabled={n === 2} onContinue={runDecide} />;
      }
      case 'i_q':
        return <Footer status="" enabled={!!intelText.trim()} onContinue={runIntel} />;
      case 'r_q':
        return <Footer status="" enabled={!!question.trim()} onContinue={() => runReviews()} />;
      case 'c_picks': case 'd_verdict': case 'r_answer':
        return (
          <View style={styles.doneWrap}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
              <Text style={styles.done}>Done</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.sheet, { height: winH * 0.88 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image source={MARK} style={styles.mark} resizeMode="contain" />
              <Text style={styles.headerName}>Vinster</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {renderBody()}
          </ScrollView>
          {renderFooter()}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'center', marginTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(224,184,74,0.3)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: { width: 30, height: 30 },
  headerName: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, letterSpacing: 0.3 },
  close: { fontSize: 20, color: 'rgba(255,255,255,0.75)' },
  body: { paddingHorizontal: 28, paddingTop: 20, paddingBottom: spacing.xl, gap: 16 },
  title: { fontFamily: fonts.headingItalic, fontSize: 29, lineHeight: 34, color: colors.text },
  q: { fontFamily: fonts.headingItalic, fontSize: 25, lineHeight: 30, color: colors.text },
  qSmall: { fontSize: 23, lineHeight: 28 },
  bubbleWrap: { alignItems: 'flex-end', marginTop: -6 },
  bubble: { maxWidth: '88%', backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  bubbleText: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 23, color: colors.text },
  options: { marginHorizontal: -8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', gap: 12 },
  optionFirst: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  optionText: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold },
  optionSub: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', marginTop: 3 },
  optionArrow: { fontSize: 22, color: colors.gold },
  answerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingLeft: 14, paddingRight: 10, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  answerLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  answerInput: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, paddingVertical: 4, minHeight: 28 },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amountBox: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.6)', paddingHorizontal: 16, gap: 6 },
  amountSym: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold },
  amountInput: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 18, color: colors.text },
  amountGo: { width: 44, height: 52, alignItems: 'center', justifyContent: 'center' },
  note: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: -8 },
  working: { gap: 6 },
  workingLine: { fontFamily: fonts.headingItalic, fontSize: 24, lineHeight: 30, color: colors.text },
  workingSub: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: 'rgba(255,255,255,0.78)' },
  brief: { fontFamily: fonts.headingItalic, fontSize: 22, lineHeight: 28, color: colors.text },
  pick: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
  pickRank: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' },
  pickName: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22, color: colors.gold },
  price: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  pickWhy: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.88)' },
  decant: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  pickCard: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)' },
  cardLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.92)' },
  answerText: { fontFamily: fonts.bodyRegular, fontSize: 15.5, lineHeight: 23, color: colors.text },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 14, paddingBottom: 34, borderTopWidth: 1, borderTopColor: 'rgba(224,184,74,0.3)' },
  footerStatus: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: 'rgba(255,255,255,0.8)' },
  continue: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold },
  continueOff: { opacity: 0.45 },
  doneWrap: { alignItems: 'center', paddingTop: 10, paddingBottom: 34 },
  done: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
});
