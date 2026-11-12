import { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { fetchStorageLocations } from '../api/storageLocations';
import { fetchPlacementsForWines } from '../api/placements';
import { homeOnlyWines } from '../utils/homeWines';
import { useChefLabelHistory } from '../hooks/useChefHistory';
import { usePreferences } from '../hooks/usePreferences';
import { classifyDiscoverVoice } from '../api/discoverVoice';
import { chooseFromCellar, buyCandidates } from '../api/homeVoice';
import { generatePairings } from '../api/label';
import { fetchPricing } from '../services/pricing';
import { resolveIntelCurrency } from '../utils/localCurrency';
import { useLabelStore } from '../stores/labelStore';
import { currencySymbol } from '../constants/currency';
import { WineSearchModal } from './WineSearchModal';
import type { ChefLabelSession } from '../api/chef';
import type { CellarWine, WineDetailsComplete } from '../types/wine';
import {
  useChat, ChatSheet, ChatCancelled, Greeting, Starters, Starter,
  ResultRow, GoldLink, OutlineButton, DoneButton, chatErrorText,
} from './chat/ChatKit';
import { colors } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "Ask Vinster" on the Pair tab — a guided chat (design: the Voice Command Pair
// canvas, locked 2026-11-04). Three conversations:
//   A wine for my dish  → dish → cellar or something new → (buying) cost → picks
//   A dish for my wine  → wine → full recipe or ingredients → …
//   Cookbook reference  → which recipe → matches

const RANKS = ['Top pick', 'Runner up', 'Wildcard'];
const COST_Q = 'Lastly, do you have a cost per bottle in mind? I will use Wine Searcher to compare market values';

function cellarName(w: CellarWine): string {
  return [w.producer, w.wine_name, w.vintage].filter(Boolean).join(' · ') || w.wine_name || 'Wine';
}
function cellarPrice(w: CellarWine): string | null {
  if (w.estimated_value == null) return null;
  const sym = currencySymbol(w.estimated_value_currency ?? 'GBP');
  const range = w.estimated_value_low != null && w.estimated_value_high != null
    ? ` · Range ${sym}${Math.round(w.estimated_value_low)}–${sym}${Math.round(w.estimated_value_high)}` : '';
  return `${sym}${Math.round(w.estimated_value)}${range} · ${(w.estimated_value_source ?? '').toLowerCase().includes('searcher') ? 'Wine-Searcher' : 'Vinster estimate'}`;
}

const norm = (s?: string | null) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
// Saved recipes that match the user's words, best first (dish and paired wine).
function cookbookMatches(sessions: ChefLabelSession[], said: string): ChefLabelSession[] {
  const toks = norm(said).split(/[^a-z0-9]+/).filter((t) => t.length > 2 && !['paired', 'with', 'the', 'and', 'recipe', 'my', 'that', 'was', 'for', 'find', 'dish'].includes(t));
  if (!toks.length) return [];
  return sessions
    .map((s) => {
      const hay = norm([s.pairings?.[0]?.dishName, s.wine?.producer, s.wine?.wineName, s.wine?.region, s.wine?.vintage].filter(Boolean).join(' '));
      return { s, score: toks.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => x.s);
}

// startWith opens straight into one conversation — 'dishForWine' (Recipe
// Requirements' Ask Vinster) or 'wineForDish' (Find a Wine Pairing's); presetWine skips "Which wine?" when the bottle is
// already known (e.g. opened from a wine card).
export function PairVoiceModal({ visible, onClose, startWith, presetWine }: { visible: boolean; onClose: () => void; startWith?: 'dishForWine' | 'wineForDish'; presetWine?: WineDetailsComplete | null }) {
  const { wines } = useCellar();
  const { sessions } = useChefLabelHistory();
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const chat = useChat();
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Closing cancels whatever the chat was doing; opening starts fresh.
  useEffect(() => {
    chat.reset();
    if (visible && startWith === 'dishForWine') setTimeout(() => runDishForWine(), 0);
    if (visible && startWith === 'wineForDish') setTimeout(() => runWineForDish(), 0);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function start(flow: () => Promise<void>) {
    flow().catch((err) => {
      if (err instanceof ChatCancelled) return;
      chat.say(chatErrorText(err));
      chat.push(<DoneButton onPress={onClose} />);
    });
  }

  // ---- A wine for my dish ----------------------------------------------
  const runWineForDish = () => start(async () => {
    chat.hear('A wine for my dish');
    const dish = await chat.ask("Tell me what's cooking in as much detail as you can.", 'ie. Pan-fried sea bass with brown butter and capers', 'food');
    // Tap-to-choose commands instead of a typed answer.
    chat.say('Should I pull some bottles from your cellar, or are you trying something new?');
    const choice = await new Promise<'home' | 'all' | 'new'>((resolve) => {
      let done = false;
      const pickIt = (c: 'home' | 'all' | 'new', label: string) => { if (done) return; done = true; chat.hear(label); resolve(c); };
      chat.push(
        <Starters>
          <Starter first label="Pull from my home cellar" onPress={() => pickIt('home', 'Pull from my home cellar')} />
          <Starter label="Pull from my home or external cellars" onPress={() => pickIt('all', 'Pull from my home or external cellars')} />
          <Starter label="Suggest something new" onPress={() => pickIt('new', 'Suggest something new')} />
        </Starters>,
      );
    });
    let fromCellar = choice !== 'new';
    // "Home cellar" = only bottles NOT held in an external cellar (a wine split
    // between home and an external cellar still counts if any are at home).
    let pool: CellarWine[] = wines;
    if (fromCellar && choice === 'home' && wines.length && session?.user.id) {
      pool = await chat.working('Checking what you have at home…', async () => {
        const locs = await fetchStorageLocations(session.user.id);
        if (!locs.some((l) => l.is_external)) return wines; // no external cellars — everything is home
        const pls = await fetchPlacementsForWines(wines.map((w) => w.id));
        return homeOnlyWines(wines, pls, new Set(locs.filter((l) => l.is_external).map((l) => l.id)));
      });
    }
    if (fromCellar && !pool.length) {
      chat.say(choice === 'home' && wines.length ? "Everything you have is in an external cellar, so I'll suggest something to buy instead." : "Your cellar is empty, so I'll find something to buy instead.");
      fromCellar = false;
    }
    if (fromCellar) {
      const shown: string[] = [];
      const showCellar = async (alt: boolean) => {
        const res = await chat.working(alt ? 'Finding three fresh suggestions…' : 'Finding wines for your dish…', () =>
          chooseFromCellar({ eating: dish, occasion: '', currency, wines: pool, excludeIds: alt ? shown : [] }));
        const picks = res.picks.map((p) => ({ p, w: pool.find((x) => x.id === p.id) })).filter((x) => x.w) as { p: typeof res.picks[0]; w: CellarWine }[];
        if (!picks.length) { chat.say("I couldn't find a good match in your cellar for that."); chat.push(<DoneButton onPress={onClose} />); return; }
        picks.forEach(({ w }) => shown.push(w.id));
        chat.say(res.brief);
        chat.push(
          <View>
            {picks.map(({ p, w }, i) => (
              <ResultRow key={w.id} first={i === 0} rank={p.rank} name={cellarName(w)} price={cellarPrice(w)} why={p.why}
                onPress={() => { onClose(); router.push(`/cellar/${w.id}` as any); }} />
            ))}
          </View>,
        );
        chat.push(<OutlineButton label="Find An Alternative Selection" onPress={() => start(() => showCellar(true))} />);
        chat.push(<DoneButton onPress={onClose} />);
      };
      await showCellar(false);
      return;
    }

    const budget = await chat.ask(COST_Q, 'ie. Around £20 a bottle', 'text');
    const shown: string[] = [];
    const showBuy = async (alt: boolean) => {
      const res = await chat.working(alt ? 'Finding three fresh suggestions…' : 'Finding wines for your dish…', async () => {
        const r = await buyCandidates({ dish, budgetText: budget, currency, exclude: alt ? shown : [] });
        // Only bottles Wine-Searcher can find are shown — nothing unverifiable.
        const cur = await resolveIntelCurrency(preferences?.defaultCurrency).catch(() => currency);
        // Check candidates one at a time and stop at three verified bottles —
        // Wine-Searcher lookups are capped per day, so never spend more than needed.
        const picks: { c: typeof r.candidates[0]; price: string }[] = [];
        for (const c of r.candidates.slice(0, 5)) {
          if (picks.length >= 3) break;
          try {
            const p = await fetchPricing([c.producer, c.wine].filter(Boolean).join(' '), null, cur);
            if (p.source !== 'wine-searcher' || p.matched === false || p.averageMarketPrice == null) continue;
            const sym = currencySymbol(p.currency ?? cur);
            const range = p.minPrice != null && p.maxPrice != null ? ` · Range ${sym}${Math.round(p.minPrice)}–${sym}${Math.round(p.maxPrice)}` : '';
            picks.push({ c, price: `${sym}${Math.round(p.averageMarketPrice)}${range} · Wine-Searcher` });
          } catch { /* skip */ }
        }
        return { brief: r.brief, picks };
      });
      if (!res.picks.length) { chat.say("I couldn't find wines I could verify on the market for that just now. Try describing the dish a little differently."); chat.push(<DoneButton onPress={onClose} />); return; }
      res.picks.forEach(({ c }) => shown.push([c.producer, c.wine].filter(Boolean).join(' ')));
      chat.say(res.brief);
      chat.push(
        <View>
          {res.picks.map(({ c, price }, i) => (
            <ResultRow key={`${c.producer}-${c.wine}`} first={i === 0} rank={RANKS[i]} name={[c.producer, c.wine].filter(Boolean).join(' · ')} price={price} why={c.why} />
          ))}
        </View>,
      );
      chat.push(<OutlineButton label="Find An Alternative Selection" onPress={() => start(() => showBuy(true))} />);
      chat.push(<DoneButton onPress={onClose} />);
    };
    await showBuy(false);
  });

  // ---- A dish for my wine ----------------------------------------------
  const runDishForWine = () => start(async () => {
    chat.hear('A dish for my wine');
    const preset = presetWine?.producer ? presetWine : null;
    const presetLabel = preset ? [preset.producer, preset.wineName, preset.vintage && preset.vintage !== 'NV' ? preset.vintage : null].filter(Boolean).join(' ') : '';
    if (preset) chat.say(`We're pairing ${presetLabel}.`);
    const wineSaid = preset ? presetLabel : await chat.ask('Which wine are we pairing?', 'ie. Domaine Jamet Côte-Rôtie 2015', 'wine', [
      ...(wines.length ? [{ label: 'Or choose from my cellar', onPress: () => setCellarPickerOpen(true) }] : []),
    ]);
    // ONE open question for everything about the dish (course, style,
    // ingredients, allergies), then straight to the dishes.
    const brief = await chat.ask('Tell me in as much detail as you like any guidelines for the dish', 'ie. A cosy main course, no shellfish, ready in an hour', 'food');
    const t = chat.token();
    const { identity, pairings } = await chat.working('Thinking about what to cook…', async () => {
      const id = preset ?? await toIdentity(wineSaid);
      const none = /^\s*(no|none|nope|nothing|anything|surprise me)\b/i.test(brief);
      const filters: Record<string, unknown> = {
        dietary: null, allergens: [], customAllergen: '',
        // Any allergies or dislikes in the brief are honoured through here.
        specificConcerns: none ? null : brief,
        course: courseFilter(brief),
      };
      const p = await generatePairings(id, filters as any, { additionalRequest: none ? undefined : `The diner's guidelines for the dish (course, style, ingredients, allergies — follow all of them): ${brief}.` });
      if (chat.alive(t)) {
        const ls = useLabelStore.getState();
        ls.setWineDetailsConfirmed(id); ls.setFilters(filters); ls.setPairings(p);
      }
      return { identity: id, pairings: p };
    }, "Matching the wine's weight, spice and savoury edge");
    if (!pairings.length) { chat.say("I couldn't come up with dishes for that just now — please try again."); chat.push(<DoneButton onPress={onClose} />); return; }
    const wineLabel = [identity.producer, identity.wineName, identity.vintage].filter(Boolean).join(' ');
    chat.say(`Three dishes for ${wineLabel}`);
    chat.push(
      <View>
        {pairings.slice(0, 3).map((p, i) => (
          <ResultRow key={p.dishName} first={i === 0} rank={RANKS[i]} name={p.dishName} why={(p.pairingNotes ?? '').split(/(?<=[.!?])\s/)[0]}>
            <View style={{ paddingBottom: 10 }}>
              <GoldLink label="Get the recipe" onPress={() => { onClose(); router.push(`/chef/recipe-full?index=${i}` as any); }} />
            </View>
          </ResultRow>
        ))}
      </View>,
    );
    chat.push(<DoneButton onPress={onClose} />);
  });

  // Spoken/typed wine → identity for the recipe generator.
  async function toIdentity(text: string): Promise<WineDetailsComplete> {
    try {
      const res = await classifyDiscoverVoice(`Give me the intel on ${text}`, []);
      if (res.intent === 'intel' && res.wine?.producer) {
        const w = res.wine;
        return { producer: w.producer, region: w.region ?? '', wineName: w.wineName, vintage: (w.vintage ?? '').trim() || 'NV', style: w.style ?? null, grape: w.grape ?? null, bottleSizeMl: null, quantity: 1 };
      }
    } catch { /* fall through */ }
    const m = text.match(/\b(19|20)\d{2}\b/);
    return { producer: text.replace(m?.[0] ?? '', '').trim(), region: '', wineName: null, vintage: m?.[0] ?? 'NV', style: null, grape: null, bottleSizeMl: null, quantity: 1 };
  }

  // ---- Cookbook ---------------------------------------------------------
  const runCookbook = () => start(async () => {
    chat.hear('I need a reference from my Cookbook');
    let said = await chat.ask('Which recipe? Tell me the dish, or the wine you paired it with.', 'ie. Beef paired with Côte-Rôtie');
    for (;;) {
      const found = cookbookMatches(sessions, said);
      if (found.length) {
        chat.say(`${found.length === 1 ? 'One recipe' : `${['', '', 'Two', 'Three', 'Four', 'Five'][found.length]} recipes`} in your cookbook match “${said}”`);
        chat.push(
          <View>
            {found.map((s, i) => (
              <ResultRow key={s.id} first={i === 0}
                rank={`Saved ${new Date(s.saved_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                name={s.pairings?.[0]?.dishName ?? 'Recipe'}
                why={`Paired with ${[s.wine?.producer, s.wine?.wineName, s.wine?.vintage].filter(Boolean).join(' ')}`}
                onPress={() => { onClose(); router.push(`/chef/recipe-full?sessionId=${s.id}` as any); }} />
            ))}
          </View>,
        );
        chat.push(<DoneButton onPress={onClose} />);
        return;
      }
      said = await chat.ask("I couldn't find that in your cookbook. Try the dish, or the wine you paired it with.", 'ie. Venison with Barolo');
    }
  });

  const opening = (
    <>
      <Greeting>Tell me what I can help you with, then we'll talk it through</Greeting>
      <Starters>
        <Starter first label="A wine for my dish" sub="Tell me what's cooking, I'll find the wine" onPress={runWineForDish} />
        <Starter label="A dish for my wine" sub="Name the bottle, I'll suggest what to cook" onPress={runDishForWine} />
        <Starter label="I need a reference from my Cookbook" sub="“Find me what dish I paired with Krug 2002”" onPress={runCookbook} />
      </Starters>
    </>
  );

  return (
    <ChatSheet visible={visible} onClose={onClose} chat={chat} opening={opening}>
      <CellarPicker visible={cellarPickerOpen} wines={wines} onClose={() => setCellarPickerOpen(false)}
        onPick={(w) => { setCellarPickerOpen(false); chat.answer(cellarName(w).replace(/ · /g, ' ')); }} />
      <WineSearchModal visible={searchOpen} onClose={() => setSearchOpen(false)}
        onSelect={(r) => { setSearchOpen(false); chat.answer([r.producer, r.wineName, r.vintage].filter(Boolean).join(' ')); }} />
    </ChatSheet>
  );
}

// "Main course" → the Chef generator's course filter.
function courseFilter(said: string): string | null {
  const s = said.toLowerCase();
  // Values must match the Chef generator's course options exactly.
  if (/snack|canap|nibble|bite|amuse/.test(s)) return 'Amuse Bouche / Canapés';
  if (/starter|appeti|first course|entr[eé]e/.test(s)) return 'Starter';
  // 'main' before dessert: a combined answer like "a main, something sweet and
  // sour" is still a main course.
  if (/\bmain(s|\s+course)?\b/.test(s)) return 'Main';
  if (/dessert|pudding|\bsweet\b/.test(s)) return 'Pudding / Dessert';
  return null;
}

function CellarPicker({ visible, wines, onClose, onPick }: { visible: boolean; wines: CellarWine[]; onClose: () => void; onPick: (w: CellarWine) => void }) {
  const { height } = useWindowDimensions();
  const [q, setQ] = useState('');
  useEffect(() => { if (visible) setQ(''); }, [visible]);
  const list = useMemo(() => {
    const t = norm(q);
    return wines.filter((w) => !w.is_wishlist && !w.archived_at && (!t || norm(cellarName(w)).includes(t))).slice(0, 200);
  }, [wines, q]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={pick.overlay}>
        <View style={[pick.sheet, { maxHeight: height * 0.75 }]}>
          <Text style={pick.title}>Choose from my cellar</Text>
          <TextInput style={pick.input} value={q} onChangeText={setQ} placeholder="Filter your wines" placeholderTextColor="rgba(255,255,255,0.5)" autoCorrect={false} />
          <FlatList
            data={list}
            keyExtractor={(w) => w.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity style={pick.row} onPress={() => onPick(item)} activeOpacity={0.7}>
                <Text style={pick.rowText}>{cellarName(item)}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={{ alignSelf: 'center', paddingTop: 10 }}><Text style={pick.cancel}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const pick = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: 20 },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', padding: 18 },
  title: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginBottom: 10 },
  input: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  row: { paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  rowText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  cancel: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
});
