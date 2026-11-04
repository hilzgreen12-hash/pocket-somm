import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../hooks/useCellar';
import { usePreferences } from '../hooks/usePreferences';
import { classifyDiscoverVoice, askMyData } from '../api/discoverVoice';
import {
  chooseFromCellar, decideBetween, compareWines, isYes, isDone, compareCount, splitVintage,
  type MarketPoint,
} from '../api/homeVoice';
import { useLabelStore } from '../stores/labelStore';
import { currencySymbol } from '../constants/currency';
import { fetchPricing } from '../services/pricing';
import { resolveIntelCurrency } from '../utils/localCurrency';
import type { CellarWine, WineDetailsComplete } from '../types/wine';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';
import {
  useChat, ChatSheet, ChatCancelled, Greeting, Starters, Starter, Card, CardLabel, CardBody, Tag,
  ResultRow, GoldLink, DoneButton, ServingSuggestions, chatErrorText,
} from './chat/ChatKit';

// "Ask Vinster" on Home — a guided chat (design: the Voice Command Mockups
// canvas, 2026-11-04). Vinster asks one thing at a time; the user speaks or
// types each answer. Four conversations:
//   Choose from my cellar  → eating → occasion → decant → serving help → cost → picks
//   Decide between wines   → each wine in turn → eating → occasion → market check → verdict
//   Generate Intelligence  → one wine (→ Wine Intel page) or compare several
//   Ask about my reviews   → question → answer → follow-ups (records, or online)

const CTX = "Give me some context — what you're eating, the mood, the company — and I'll serve up suggestions.";
const ORDINAL = ['first', 'second', 'third', 'fourth'];

function cellarName(w: CellarWine): string {
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ') || w.wine_name || 'Wine';
}
// "£48 · Range £40–£55 · Wine-Searcher" from the value stored on the wine.
function cellarPrice(w: CellarWine): string | null {
  if (w.estimated_value == null) return null;
  const sym = currencySymbol(w.estimated_value_currency ?? 'GBP');
  const range = w.estimated_value_low != null && w.estimated_value_high != null
    ? ` · Range ${sym}${Math.round(w.estimated_value_low)}–${sym}${Math.round(w.estimated_value_high)}` : '';
  const src = (w.estimated_value_source ?? '').toLowerCase().includes('searcher') ? 'Wine-Searcher' : 'Vinster estimate';
  return `${sym}${Math.round(w.estimated_value)}${range} · ${src}`;
}
function marketPrice(m: MarketPoint | null): string | null {
  if (!m || m.avg == null) return null;
  const sym = currencySymbol(m.currency ?? 'GBP');
  const range = m.min != null && m.max != null ? ` · Range ${sym}${Math.round(m.min)}–${sym}${Math.round(m.max)}` : '';
  return `${sym}${Math.round(m.avg)}${range} · Wine-Searcher`;
}

export function HomeVoiceModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { wines } = useCellar();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const chat = useChat();

  useEffect(() => { if (visible) chat.reset(); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Run one conversation; a closed/abandoned chat just stops quietly.
  function start(flow: () => Promise<void>) {
    flow().catch((err) => {
      if (err instanceof ChatCancelled) return;
      chat.say(chatErrorText(err));
      chat.push(<DoneButton onPress={onClose} />);
    });
  }

  async function marketFor(texts: string[]): Promise<(MarketPoint | null)[]> {
    const cur = await resolveIntelCurrency(preferences?.defaultCurrency).catch(() => currency);
    return Promise.all(texts.map(async (t) => {
      const { name, vintage } = splitVintage(t);
      try {
        const p = await fetchPricing(name, vintage, cur);
        if (p.source !== 'wine-searcher' || p.matched === false) return null;
        return { avg: p.averageMarketPrice ?? null, min: p.minPrice ?? null, max: p.maxPrice ?? null, currency: p.currency ?? cur, criticScore: p.criticScore ?? null };
      } catch { return null; }
    }));
  }

  // ---- Choose from my cellar ---------------------------------------------
  const runCellar = () => start(async () => {
    chat.hear('Choose from my cellar');
    if (!wines.length) {
      chat.say('Your cellar is empty — add some wines first and I can choose from them.');
      chat.push(<DoneButton onPress={onClose} />);
      return;
    }
    chat.say(CTX);
    const eating = await chat.ask('What are you eating with it, if anything? Tap the mic and tell me in as much detail as you can', 'ie. Roast chicken with morels and asparagus', 'food');
    const occasion = await chat.ask("What's the occasion or mood?", "ie. An intimate birthday gathering of good friends so we need something special, and warming as it's cold outside");
    const decant = await chat.ask('Are you opening this now or is there time to decant?', "ie. I've got up to 3 hours to decant");
    const serving = isYes(await chat.ask('Do you need help with your stemwear or what wines to serve before or after?', 'ie. Yes help me with both'));
    const budget = await chat.ask('Lastly, do you have a cost per bottle in mind? I will use Wine Searcher to compare market values', 'ie. Around £60 a bottle');
    const res = await chat.working('Choosing three bottles from your cellar…', () =>
      chooseFromCellar({ eating, occasion, decantText: decant, budgetText: budget, serving, currency, wines }));
    const picks = res.picks.map((p) => ({ p, w: wines.find((x) => x.id === p.id) })).filter((x) => x.w) as { p: typeof res.picks[0]; w: CellarWine }[];
    if (!picks.length) { chat.say("I couldn't find a good match in your cellar for that."); chat.push(<DoneButton onPress={onClose} />); return; }
    chat.say(res.brief);
    chat.push(
      <View>
        {picks.map(({ p, w }, i) => (
          <ResultRow key={w.id} first={i === 0} rank={p.rank} name={cellarName(w)} price={cellarPrice(w)} why={p.why}
            extra={!serving ? p.decant : null}
            onPress={() => { onClose(); router.push(`/cellar/${w.id}` as any); }}>
            {/* Serving Suggestions carry the ONLY decant time when offered. */}
            {serving ? <ServingSuggestions wine={w} decantTime={decant} /> : null}
          </ResultRow>
        ))}
      </View>,
    );
    chat.push(<DoneButton onPress={onClose} />);
  });

  // ---- Decide between wines -------------------------------------------------
  const runDecide = () => start(async () => {
    chat.hear('Decide between wines');
    const list: string[] = [];
    list.push(await chat.ask('Which wines are you choosing between? Tell me the first one in as much detail as you can', 'ie. Cave de Tain Crozes-Hermitage 2021', 'wine'));
    list.push(await chat.ask('And the next one?', 'ie. Mullineux Syrah, Swartland, 2020', 'wine'));
    while (list.length < 4) {
      const more = await chat.ask('Any others, or is that all of them?', "ie. That's all of them", 'wine');
      if (isDone(more)) break;
      list.push(more);
    }
    const eating = await chat.ask('What are you eating with them, if anything? Tap the mic and tell me in as much detail as you can', 'ie. Steak frites with peppercorn sauce', 'food');
    const occasion = await chat.ask("What's the occasion or mood?", 'ie. A low-key anniversary dinner at home');
    const { market, verdict } = await chat.working("Let me do a quick compare of the market to see which is giving you the best value, this won't take a moment", async () => {
      const m = await marketFor(list);
      const v = await decideBetween({ wines: list, eating, occasion, market: m });
      return { market: m, verdict: v };
    });
    // Reply 1: the market check.
    chat.say("Here's what the market says right now");
    chat.push(
      <Card>
        {list.map((t, i) => (
          <View key={i} style={{ gap: 3, paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.12)' }}>
            {verdict.bestValueIndex === i + 1 ? <Tag>Best value</Tag> : null}
            <ResultName text={verdict.names?.[i] || t} />
            <CardBody>{marketPrice(market[i]) ?? 'No Wine-Searcher listing found'}</CardBody>
            {verdict.valueNotes?.[i] ? <CardBody>{verdict.valueNotes[i]}</CardBody> : null}
          </View>
        ))}
      </Card>,
    );
    if (verdict.marketSummary) chat.say(verdict.marketSummary);
    // Reply 2: the verdict.
    const pickPrice = marketPrice(market[verdict.pickIndex - 1] ?? null);
    const runnerPrice = marketPrice(market[verdict.runnerUpIndex - 1] ?? null);
    chat.say(verdict.headline);
    chat.push(
      <Card>
        <ResultName text={verdict.pickName} />
        {pickPrice ? <CardBody>{pickPrice}</CardBody> : null}
        <CardLabel>With the food</CardLabel>
        <CardBody>{verdict.withFood}</CardBody>
        <CardLabel>For the occasion</CardLabel>
        <CardBody>{verdict.forOccasion}</CardBody>
      </Card>,
    );
    chat.push(<ResultRow first rank="Runner up" name={verdict.runnerUpName} price={runnerPrice} why={verdict.runnerUpWhy} />);
    chat.push(<DoneButton onPress={onClose} />);
  });

  // ---- Generate Intelligence ---------------------------------------------
  // Resolve spoken/typed text to a wine identity (null = didn't catch it).
  async function resolveWine(text: string): Promise<WineDetailsComplete | null> {
    const res = await classifyDiscoverVoice(`Give me the intel on ${text}`, []);
    if (res.intent !== 'intel' || !res.wine?.producer) return null;
    const w = res.wine;
    return {
      producer: w.producer, region: w.region ?? '', wineName: w.wineName,
      vintage: (w.vintage ?? '').trim() || 'NV', style: w.style ?? null, grape: w.grape ?? null,
      bottleSizeMl: null, quantity: 1,
    };
  }
  // Open the Wine Intel page. Verified against Wine-Searcher first, exactly like
  // a label scan; anything unverified goes through "Which wine is this?" and the
  // identity gate, so a card is never built for a wine that doesn't exist.
  async function openIntel(identity: WineDetailsComplete) {
    const ls = useLabelStore.getState();
    ls.reset(); ls.setWineDetailsConfirmed(identity); ls.setIntelligence(null); ls.setImageUri(null);
    let verified = false;
    try {
      const cur = await resolveIntelCurrency(preferences?.defaultCurrency);
      const q = [identity.producer, identity.wineName].filter(Boolean).join(' ').trim();
      const v = identity.vintage && identity.vintage !== 'NV' ? Number(identity.vintage) : null;
      const pricing = await fetchPricing(q, Number.isFinite(v) ? v : null, cur);
      verified = pricing.source === 'wine-searcher' && pricing.matched !== false;
    } catch { verified = false; }
    onClose();
    router.push((verified
      ? '/label/results?context=intel&fresh=1&confirmed=1&gen=1&noRecent=1'
      : '/label/results?context=intel&fresh=1&confirm=1&noRecent=1') as any);
  }

  const runIntel = () => start(async () => {
    chat.hear('Generate Intelligence');
    const mode = await chat.ask('Are you looking for intelligence on one wine or would you like to compare multiple wines?', "ie. I'd like to compare 3 wines");
    const n = compareCount(mode);

    if (n === null) {
      let said = await chat.ask('Which wine would you like the intel on? Tell me the producer, the wine and the vintage', 'ie. Château Latour 2005', 'wine');
      for (;;) {
        const identity = await resolveWine(said);
        if (identity) {
          const label = [identity.producer, identity.wineName, identity.region, identity.vintage].filter(Boolean).join(' · ');
          await chat.working(`Building Wine Intel on ${label}…`, () => openIntel(identity),
            'Producer and vintage information, market data, and critic scores', 'This could take a moment, please keep this page open');
          return;
        }
        said = await chat.ask("Sorry, I didn't catch that. Could you say the wine again?", 'ie. Château Latour 2005', 'wine');
      }
    }

    const list: string[] = [];
    list.push(await chat.ask("Great, what's the first wine", 'ie. Château Latour 2005', 'wine'));
    while (list.length < (n || 4)) {
      if (n) {
        list.push(await chat.ask(`And the ${ORDINAL[list.length]}?`, 'ie. Château Margaux 2005', 'wine'));
      } else {
        const more = await chat.ask(list.length < 2 ? 'And the next one?' : 'Any others, or is that all of them?', list.length < 2 ? 'ie. Château Margaux 2005' : "ie. That's all of them", 'wine');
        if (list.length >= 2 && isDone(more)) break;
        list.push(more);
      }
    }
    const measure = await chat.ask('What specifically would you like to compare? Market price, readiness for drinking, something else?', "ie. I'd like to compare overall critic scores");
    const what = /score|critic|rating|rated/i.test(measure) ? 'critic scores'
      : /price|market|value|cost|worth/i.test(measure) ? 'market prices'
      : /ready|readiness|drink|window|mature/i.test(measure) ? 'drinking readiness' : 'them';
    const result = await chat.working(`Comparing ${what} across your ${['', '', 'two', 'three', 'four'][list.length] || list.length} wines…`, async () => {
      const market = await marketFor(list);
      return compareWines({ wines: list, measure, market });
    });
    if (result.intro) chat.say(result.intro);
    chat.push(
      <Card>
        {result.rows.map((r, i) => (
          <View key={i} style={{ gap: 3, paddingTop: i ? 10 : 0, borderTopWidth: i ? 1 : 0, borderTopColor: 'rgba(255,255,255,0.12)' }}>
            {r.tag ? <Tag>{r.tag}</Tag> : null}
            <ResultName text={r.name} />
            {r.figure ? <CardBody>{r.figure}</CardBody> : null}
            <CardBody>{r.note}</CardBody>
            <GoldLink label="View full wine intel" onPress={() => start(async () => {
              const text = list[(r.index || i + 1) - 1] ?? r.name;
              const identity = await chat.working(`Opening Wine Intel on ${r.name}…`, () => resolveWine(text));
              if (identity) await openIntel(identity);
              else chat.say(`Sorry, I couldn't pin down ${r.name} well enough to build its Wine Intel.`);
            })} />
          </View>
        ))}
      </Card>,
    );
    if (result.closing) chat.say(result.closing);
    chat.push(<DoneButton onPress={onClose} />);
  });

  // ---- Ask about my reviews ----------------------------------------------
  const runReviews = () => start(async () => {
    chat.hear('Ask about my reviews');
    const history: { q: string; a: string }[] = [];
    let q = await chat.ask("What would you like to know? Ask about anything you've reviewed: scores, restaurants, dates, what you drank where", 'ie. Where did I drink a Cornas recently?');
    for (;;) {
      const a = await chat.working('Looking through your records…', () => askMyData(q, history));
      chat.say(a);
      history.push({ q, a });
      if (history.length === 1) chat.push(<DoneButton onPress={onClose} />);
      q = await chat.ask('Would you like to know anything else about that wine or the restaurant where you drank it? I can pull from your reviews or online.', 'ie. What did I score it?');
    }
  });

  const opening = (
    <>
      <Greeting>Tell me what I can help you with, then we'll talk it through</Greeting>
      <Starters>
        <Starter first label="Choose from my cellar" sub="Not sure what to open? Let's talk about it" onPress={runCellar} />
        <Starter label="Decide between wines" sub="You've got a selection, I'll narrow it down" onPress={runDecide} />
        <Starter label="Generate Intelligence" sub="“Give me the intel on Château Latour 2005”" onPress={runIntel} />
        <Starter label="Ask about my reviews" sub="“Where did I drink a Cornas recently?”" onPress={runReviews} />
      </Starters>
    </>
  );

  return <ChatSheet visible={visible} onClose={onClose} chat={chat} opening={opening} />;
}

function ResultName({ text }: { text: string }) {
  return <Text style={{ fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22, color: colors.gold }}>{text}</Text>;
}
