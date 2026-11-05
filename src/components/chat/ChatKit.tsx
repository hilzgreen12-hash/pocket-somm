import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Image,
  StyleSheet, useWindowDimensions, KeyboardAvoidingView, Platform, Linking,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { MicButton } from '../MicButton';
import { generateServingSuggestion } from '../../api/wineExtras';
import { isNetworkError } from '../../api/invokeResilient';
import type { CellarWine, WineServingSuggestion } from '../../types/wine';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Shared pieces for the "Ask Vinster" chats (Home + Pair). Design: the Voice
// Command Mockups canvases. Vinster speaks in LEFT bubbles; the user's answers
// are RIGHT bubbles; one question at a time; every answer can be spoken or
// typed and sent with ›; no quick-answer buttons.

const MARK = require('../../../assets/vinster-mark.png');
type Domain = 'wine' | 'food' | 'query' | 'note';

export class ChatCancelled extends Error { constructor() { super('cancelled'); } }

interface Item { key: string; node: ReactNode }
interface Pending { placeholder: string; domain: Domain; links?: { label: string; onPress: () => void }[] }

// A small engine that lets each flow be written as straight-line async code:
//   const dish = await chat.ask('What are you eating?', 'ie. Roast chicken')
// ask() shows Vinster's question and the answer field, and resolves with the
// user's answer (which is added as their bubble). reset() abandons a flow.
export function useChat() {
  const [items, setItems] = useState<Item[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState<{ line: string; sub?: string; note?: string } | null>(null);
  const resolver = useRef<{ resolve: (s: string) => void; reject: (e: Error) => void } | null>(null);
  const run = useRef(0);
  const seq = useRef(0);

  const push = useCallback((node: ReactNode) => {
    seq.current += 1;
    const key = `i${seq.current}`;
    setItems((cur) => [...cur, { key, node }]);
  }, []);
  const say = useCallback((text: string) => push(<VBubble text={text} />), [push]);
  const hear = useCallback((text: string) => push(<UBubble text={text} />), [push]);

  const ask = useCallback((question: string | string[] | null, placeholder: string, domain: Domain = 'query', links?: Pending['links']): Promise<string> => {
    const mine = run.current;
    (Array.isArray(question) ? question : question ? [question] : []).forEach((q) => say(q));
    setPending({ placeholder, domain, links });
    return new Promise<string>((resolve, reject) => {
      resolver.current = {
        resolve: (text: string) => (run.current === mine ? resolve(text) : reject(new ChatCancelled())),
        reject,
      };
    });
  }, [say]);

  // Answer the open question (typed/spoken, or programmatically, e.g. a picker).
  const answer = useCallback((text: string) => {
    const t = text.trim();
    if (!t || !resolver.current) return;
    const r = resolver.current;
    resolver.current = null;
    setPending(null);
    hear(t);
    r.resolve(t);
  }, [hear]);

  // Run work with Vinster's "working" bubble + spinner showing.
  const working = useCallback(async <T,>(line: string, fn: () => Promise<T>, sub?: string, note?: string): Promise<T> => {
    const mine = run.current;
    setBusy({ line, sub, note });
    try {
      const out = await fn();
      if (run.current !== mine) throw new ChatCancelled();
      return out;
    } finally {
      if (run.current === mine) {
        setBusy(null);
        // Keep the line in the thread once the work is done.
        push(<VBubble text={line} />);
      }
    }
  }, [push]);

  const reset = useCallback(() => {
    run.current += 1;
    // End any flow still waiting on an answer (it stops quietly).
    resolver.current?.reject(new ChatCancelled());
    resolver.current = null;
    setItems([]); setPending(null); setBusy(null);
  }, []);

  // Is a flow started after `token` still the live one?
  const token = () => run.current;
  const alive = (t: number) => run.current === t;

  return { items, pending, busy, push, say, hear, ask, answer, working, reset, token, alive };
}
export type Chat = ReturnType<typeof useChat>;

// ---------------------------------------------------------------------------
// Sheet + thread

export function ChatSheet({ visible, onClose, chat, opening, children }: {
  visible: boolean;
  onClose: () => void;
  chat: Chat;
  // Shown while the thread is empty: the greeting + conversation starters.
  opening: ReactNode;
  // Extra pop-ups (pickers) — rendered INSIDE this Modal: on iOS a sibling
  // Modal can't be presented while this sheet is up.
  children?: ReactNode;
}) {
  const { height: winH } = useWindowDimensions();
  const scroll = useRef<ScrollView>(null);
  const empty = chat.items.length === 0 && !chat.busy;
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
          <ScrollView
            ref={scroll}
            style={{ flex: 1 }}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => { if (!empty) scroll.current?.scrollToEnd({ animated: true }); }}
          >
            {empty ? opening : null}
            {chat.items.map((it) => <View key={it.key}>{it.node}</View>)}
            {chat.busy ? (
              <View style={{ gap: 8 }}>
                <VBubble text={chat.busy.line} />
                {chat.busy.sub ? <Text style={styles.caption}>{chat.busy.sub}</Text> : null}
                <ActivityIndicator color={colors.gold} style={{ alignSelf: 'flex-start' }} />
                {chat.busy.note ? <Text style={styles.caption}>{chat.busy.note}</Text> : null}
              </View>
            ) : null}
            {chat.pending ? (
              <AnswerField
                key={chat.items.length}
                placeholder={chat.pending.placeholder}
                domain={chat.pending.domain}
                onSend={chat.answer}
                links={chat.pending.links}
              />
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      {children}
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Building blocks

export function Greeting({ children }: { children: ReactNode }) {
  return <Text style={styles.greeting}>{children}</Text>;
}

export function Starter({ label, sub, onPress, first }: { label: string; sub?: string; onPress: () => void; first?: boolean }) {
  return (
    <TouchableOpacity style={[styles.option, first && styles.optionFirst]} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.optionText}>{label}</Text>
        {sub ? <Text style={styles.optionSub}>{sub}</Text> : null}
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}
export function Starters({ children }: { children: ReactNode }) {
  return <View style={styles.options}>{children}</View>;
}

// Links in Vinster's answers (only ever URLs the server verified) are tappable.
function Linked({ text, style }: { text: string; style: any }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <Text style={style}>
      {parts.map((p, i) => (/^https?:\/\//.test(p)
        ? <Text key={i} style={styles.link} onPress={() => { WebBrowser.openBrowserAsync(p).catch(() => Linking.openURL(p).catch(() => {})); }}>{p}</Text>
        : p))}
    </Text>
  );
}

export function VBubble({ text, children }: { text?: string; children?: ReactNode }) {
  return (
    <View style={styles.vWrap}>
      <View style={styles.vBubble}>
        {text ? <Linked text={text} style={styles.vText} /> : null}
        {children}
      </View>
    </View>
  );
}

export function UBubble({ text, children }: { text?: string; children?: ReactNode }) {
  return (
    <View style={styles.uWrap}>
      <View style={styles.uBubble}>
        {text ? <Text style={styles.uText}>{text}</Text> : null}
        {children}
      </View>
    </View>
  );
}

function AnswerField({ placeholder, domain, onSend, links }: { placeholder: string; domain: Domain; onSend: (t: string) => void; links?: Pending['links'] }) {
  const [value, setValue] = useState('');
  const can = !!value.trim();
  return (
    <View style={{ gap: 8 }}>
      <View style={styles.field}>
        <TextInput
          style={styles.fieldInput}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          multiline
          returnKeyType="send"
          blurOnSubmit
          onSubmitEditing={() => { if (can) onSend(value); }}
        />
        <MicButton value={value} onChangeText={setValue} domain={domain} serverCorrect />
        <TouchableOpacity onPress={() => { if (can) onSend(value); }} disabled={!can} accessibilityLabel="Send" hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }} style={styles.send}>
          <Text style={[styles.sendText, !can && { opacity: 0.4 }]}>›</Text>
        </TouchableOpacity>
      </View>
      {links?.length ? (
        <View style={{ gap: 6 }}>
          {links.map((l) => (
            <TouchableOpacity key={l.label} onPress={l.onPress} hitSlop={{ top: 6, bottom: 6 }}>
              <Text style={styles.textLink}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
export function CardLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.cardLabel}>{children}</Text>;
}
export function CardBody({ children }: { children: ReactNode }) {
  return <Text style={styles.cardBody}>{children}</Text>;
}
export function Tag({ children }: { children: ReactNode }) {
  return <Text style={styles.tag}>{children}</Text>;
}

// A result row: rank · name · price · why, optionally tappable.
export function ResultRow({ rank, name, price, why, extra, onPress, first, children }: {
  rank?: string | null; name: string; price?: string | null; why?: string | null; extra?: string | null;
  onPress?: () => void; first?: boolean; children?: ReactNode;
}) {
  const inner = (
    <View style={{ flex: 1, gap: 3 }}>
      {rank ? <Text style={styles.rank}>{rank}</Text> : null}
      <Text style={styles.name}>{name}</Text>
      {price ? <Text style={styles.price}>{price}</Text> : null}
      {why ? <Text style={styles.why}>{why}</Text> : null}
      {extra ? <Text style={styles.extra}>{extra}</Text> : null}
    </View>
  );
  return (
    <View style={[styles.row, first && styles.rowFirst]}>
      {onPress ? (
        <TouchableOpacity style={styles.rowTap} onPress={onPress} activeOpacity={0.7}>
          {inner}
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      ) : <View style={styles.rowTap}>{inner}</View>}
      {children}
    </View>
  );
}

export function GoldLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} hitSlop={{ top: 6, bottom: 6 }} style={{ alignSelf: 'flex-start' }}>
      <Text style={styles.goldLink}>{label} ›</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.outline} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.outlineText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function DoneButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.doneWrap} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
      <Text style={styles.done}>Done</Text>
    </TouchableOpacity>
  );
}

// "Serving Suggestions ⌄" under a pick (Wine Intel format), generated ON TAP so
// the picks arrive fast. decantTime: the user's own words, so the advice fits.
export function ServingSuggestions({ wine, decantTime }: { wine: CellarWine; decantTime?: string }) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<WineServingSuggestion | null>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle');
  async function load() {
    setState('loading');
    try {
      setData(await generateServingSuggestion(wine, decantTime));
      setState('idle');
    } catch (err) {
      setState('error');
      if (!isNetworkError(err)) console.warn('serving suggestion failed');
    }
  }
  useEffect(() => { if (open && !data && state === 'idle') void load(); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View>
      <TouchableOpacity onPress={() => setOpen((o) => !o)} style={styles.servHead} activeOpacity={0.7}>
        <Text style={styles.servTitle}>Serving Suggestions</Text>
        <Text style={[styles.servChev, open && { transform: [{ rotate: '180deg' }] }]}>⌄</Text>
      </TouchableOpacity>
      {open ? (
        <View style={styles.servBox}>
          {state === 'loading' ? <Text style={styles.cardBody}>Thinking about how best to serve this…</Text> : null}
          {state === 'error' ? (
            <TouchableOpacity onPress={load}><Text style={styles.cardBody}>Couldn't load serving suggestions — tap to try again.</Text></TouchableOpacity>
          ) : null}
          {data ? (
            <>
              {data.temperature ? <ServLine label="Temperature" text={data.temperature} /> : null}
              {data.decant ? <ServLine label="Decanting" text={data.decant} /> : null}
              {data.glassware ? <ServLine label="Glassware" text={data.glassware} /> : null}
              {data.aperitif?.style ? <ServLine label="Drink Before" text={[data.aperitif.style, data.aperitif.reason].filter(Boolean).join(' — ')} /> : null}
              {data.digestif?.style ? <ServLine label="Drink After" text={[data.digestif.style, data.digestif.reason].filter(Boolean).join(' — ')} /> : null}
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
function ServLine({ label, text }: { label: string; text: string }) {
  return <Text style={styles.cardBody}><Text style={styles.servLabel}>{label} · </Text>{text}</Text>;
}

export function chatErrorText(err: unknown): string {
  return isNetworkError(err) ? 'You appear to be offline. Check your connection and try again.' : 'Something went wrong. Please try again.';
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
  body: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 40, gap: 14 },
  greeting: { fontFamily: fonts.headingItalic, fontSize: 29, lineHeight: 34, color: colors.text },
  options: { marginHorizontal: -8 },
  option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', gap: 12 },
  optionFirst: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  optionText: { fontFamily: fonts.headingBold, fontSize: 19, color: colors.gold },
  optionSub: { fontFamily: fonts.bodyItalic, fontSize: 13.5, color: 'rgba(255,255,255,0.82)', marginTop: 3 },
  arrow: { fontSize: 22, color: colors.gold },
  vWrap: { alignItems: 'flex-start' },
  vBubble: { maxWidth: '88%', backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.35)', borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  vText: { fontFamily: fonts.headingItalic, fontSize: 20, lineHeight: 25, color: colors.text },
  link: { color: colors.gold, textDecorationLine: 'underline', fontFamily: fonts.bodyRegular, fontSize: 15 },
  uWrap: { alignItems: 'flex-end' },
  uBubble: { maxWidth: '88%', backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, paddingVertical: 10, paddingHorizontal: 16 },
  uText: { fontFamily: fonts.bodyRegular, fontSize: 15, lineHeight: 23, color: colors.text },
  caption: { fontFamily: fonts.bodyItalic, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  field: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 14, paddingRight: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
  fieldInput: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, paddingVertical: 6, minHeight: 30, maxHeight: 140 },
  send: { width: 30, height: 44, alignItems: 'center', justifyContent: 'center' },
  sendText: { fontSize: 28, lineHeight: 30, color: colors.gold },
  textLink: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  card: { gap: 6, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)' },
  cardLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.92)' },
  tag: { alignSelf: 'flex-start', fontFamily: fonts.bodySemibold, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: '#3E2120', backgroundColor: colors.gold, borderRadius: 10, overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 2 },
  row: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)', marginHorizontal: -8, paddingHorizontal: 8 },
  rowFirst: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  rowTap: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  rank: { fontFamily: fonts.bodySemibold, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' },
  name: { fontFamily: fonts.headingBold, fontSize: 18, lineHeight: 22, color: colors.gold },
  price: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  why: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.88)' },
  extra: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold },
  goldLink: { fontFamily: fonts.headingBold, fontSize: 16, color: colors.gold },
  outline: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  outlineText: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gold },
  doneWrap: { alignSelf: 'center', paddingVertical: 8 },
  done: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, textDecorationLine: 'underline' },
  servHead: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 2, paddingBottom: 10 },
  servTitle: { fontFamily: fonts.headingBold, fontSize: 17, color: colors.text },
  servChev: { fontSize: 16, color: colors.gold },
  servBox: { gap: 5, marginBottom: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(224,184,74,0.55)', backgroundColor: colors.surface },
  servLabel: { fontFamily: fonts.bodySemibold, color: colors.gold },
});

export { spacing };
