import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useObservations } from '../../src/hooks/useObservations';
import { showAlert } from '../../src/components/AppAlert';
import type { Observation, ObservationsState, TellOutcome } from '../../src/api/observations';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Vinster's Observations — everything Vinster has learned about the user from
// their reviews, cellar and choices, and what they've told it. The same profile
// quietly tailors their wine-list picks, pairings and cellar picks.

// The groups the server writes, in reading order; any other group follows.
const GROUP_ORDER = ['Wines you love', 'How you score', 'Your cellar', 'Spending', 'Food & restaurants', 'Pairings'];
const MAX_TELL_CHARS = 300;

// Refresh by itself on open only when there's nothing yet, or the observations
// are out of date (or found too little) AND there's new data to learn from.
function shouldAutoRefresh(s: ObservationsState): boolean {
  if (!s.generatedAt) return true;
  return s.hasNewData && (s.stale || s.enoughData === false);
}

function groupObservations(observations: Observation[]): [string, Observation[]][] {
  const groups = new Map<string, Observation[]>();
  for (const o of observations) groups.set(o.group, [...(groups.get(o.group) ?? []), o]);
  const rank = (g: string) => (GROUP_ORDER.includes(g) ? GROUP_ORDER.indexOf(g) : GROUP_ORDER.length);
  return [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0]));
}

function tellMessage({ stored, removed }: TellOutcome): string {
  const removedList = removed.map((t) => `“${t}”`).join(' and ');
  if (stored && removed.length) return `Got it — Vinster will remember that, and has removed ${removedList}.`;
  if (stored) return 'Got it — Vinster will remember that.';
  if (removed.length) return `Done — Vinster has removed ${removedList}.`;
  return "Vinster couldn't match that to one of its observations, so nothing has changed. Tell it something about your taste, or tap Remove on an observation.";
}

function errorText(err: unknown): string {
  return err instanceof Error && err.message ? err.message : 'Something went wrong. Please try again.';
}

export default function ObservationsScreen() {
  const { state, isLoading, isFetching, loadError, reload, refresh, tell, remove } = useObservations();
  const [draft, setDraft] = useState('');
  const [tellNote, setTellNote] = useState<string | null>(null);
  const autoRefreshed = useRef(false);

  // Once per visit, after the fresh read has landed.
  useEffect(() => {
    if (!state || isFetching || autoRefreshed.current) return;
    autoRefreshed.current = true;
    if (shouldAutoRefresh(state)) refresh.mutate();
  }, [state, isFetching]);

  function confirmRemoveObservation(o: Observation) {
    showAlert({
      title: 'Remove this observation?',
      body: `“${o.text}”\n\nVinster won't use it to tailor your recommendations, or suggest it again.`,
      buttons: [
        { text: 'Remove', style: 'gold', onPress: () => remove.mutate({ id: o.id }, { onError: (e) => showAlert({ title: "Couldn't remove it", body: errorText(e) }) }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function confirmRemoveTold(id: string, text: string) {
    showAlert({
      title: 'Forget this?',
      body: `“${text}”\n\nVinster will stop using it in your recommendations.`,
      buttons: [
        { text: 'Remove', style: 'gold', onPress: () => remove.mutate({ toldId: id }, { onError: (e) => showAlert({ title: "Couldn't remove it", body: errorText(e) }) }) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function send() {
    const text = draft.trim();
    if (!text || tell.isPending) return;
    setTellNote(null);
    tell.mutate(text, {
      onSuccess: ({ outcome }) => {
        setDraft('');
        setTellNote(tellMessage(outcome));
      },
      onError: (e) => setTellNote(errorText(e)),
    });
  }


  const generatedOn = state?.generatedAt
    ? new Date(state.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <View style={styles.wrapper}>
      <KeyboardAwareScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={24}
      >
        <Header />
        <Text style={styles.intro}>What Vinster has learned from your reviews, cellar and choices — it uses this to tailor your recommendations.</Text>

        {isLoading ? (
          <ActivityIndicator color={colors.gold} style={styles.spinner} />
        ) : !state ? (
          <View style={styles.notice}>
            <Text style={styles.noticeBody}>{errorText(loadError)}</Text>
            <TouchableOpacity style={styles.goldButton} onPress={() => reload()} activeOpacity={0.8}>
              <Text style={styles.goldButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {refresh.isPending ? (
              <View style={styles.notice}>
                <ActivityIndicator color={colors.gold} />
                <Text style={styles.noticeBody}>Vinster is reading through your reviews, cellar and choices…</Text>
              </View>
            ) : state.enoughData === false ? (
              <View style={styles.notice}>
                <Text style={styles.noticeTitle}>Still getting to know you</Text>
                <View style={styles.rule} />
                <Text style={styles.noticeBody}>
                  Vinster needs a few more reviews and choices before it can tell you what it has learned. Review some wines, rate a restaurant or save a pairing, then come back.
                </Text>
              </View>
            ) : state.observations.length ? (
              groupObservations(state.observations).map(([group, items]) => (
                <View key={group} style={styles.group}>
                  <Text style={styles.groupTitle}>{group}</Text>
                  {items.map((o) => (
                    <View key={o.id} style={styles.item}>
                      <Text style={styles.itemText}>{o.text}</Text>
                      <Text style={styles.evidence}>{o.evidence}</Text>
                      <TouchableOpacity onPress={() => confirmRemoveObservation(o)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} disabled={remove.isPending}>
                        <Text style={styles.link}>Not quite right? Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            ) : state.generatedAt ? (
              <Text style={styles.empty}>You've removed all of Vinster's observations. Refresh to see what it notices next.</Text>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>What you've told Vinster</Text>
            {state.told.length ? (
              state.told.map((t) => (
                <View key={t.id} style={styles.item}>
                  <Text style={styles.itemText}>“{t.text}”</Text>
                  <TouchableOpacity onPress={() => confirmRemoveTold(t.id, t.text)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} disabled={remove.isPending}>
                    <Text style={styles.link}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.empty}>Nothing yet. What you tell Vinster always wins over what it has worked out.</Text>
            )}

            <Text style={styles.sectionTitle}>Tell Vinster</Text>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="e.g. I don't like heavily oaked Chardonnay"
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              maxLength={MAX_TELL_CHARS}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!draft.trim() || tell.isPending) && styles.disabled]}
              onPress={send}
              disabled={!draft.trim() || tell.isPending}
              activeOpacity={0.8}
            >
              {tell.isPending ? <ActivityIndicator color={colors.gold} size="small" /> : <Text style={styles.goldButtonText}>Send</Text>}
            </TouchableOpacity>
            {tellNote ? <Text style={styles.tellNote}>{tellNote}</Text> : null}

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.goldButton, refresh.isPending && styles.disabled]}
              onPress={() => refresh.mutate()}
              disabled={refresh.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.goldButtonText}>{refresh.isPending ? 'Refreshing…' : 'Refresh Observations'}</Text>
            </TouchableOpacity>
            {refresh.error && !refresh.isPending ? <Text style={styles.tellNote}>{errorText(refresh.error)}</Text> : null}
            {generatedOn ? <Text style={styles.updated}>Last updated {generatedOn}</Text> : null}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

// Back / centred title / spacer — the standard profile-screen header bar.
function Header() {
  return (
    <View style={styles.headerBar}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text accessibilityLabel="Back" style={styles.back}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Vinster's Observations</Text>
      <View style={{ width: 44 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 80, marginBottom: spacing.md },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  intro: { fontFamily: fonts.headingItalic, fontSize: 16, lineHeight: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  spinner: { marginTop: spacing.xl },

  // Loading, thin-data and error states.
  notice: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg, paddingHorizontal: spacing.sm },
  noticeTitle: { fontFamily: fonts.headingSemibold, fontSize: 24, color: colors.text, textAlign: 'center' },
  rule: { width: 120, height: 1, backgroundColor: 'rgba(224,184,74,0.6)' },
  noticeBody: { fontFamily: fonts.bodyRegular, fontSize: 16, lineHeight: 24, color: colors.text, textAlign: 'center' },

  group: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, backgroundColor: colors.surface },
  groupTitle: { fontFamily: fonts.headingSemibold, fontSize: 20, color: colors.gold, marginBottom: spacing.sm, letterSpacing: 0.5 },
  item: { marginBottom: spacing.md },
  itemText: { fontFamily: fonts.bodyRegular, fontSize: 16, lineHeight: 23, color: colors.text },
  evidence: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.text, opacity: 0.75, marginTop: 2 },
  link: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline', marginTop: 4 },
  empty: { fontFamily: fonts.bodyItalic, fontSize: 15, lineHeight: 22, color: colors.text, opacity: 0.85, marginBottom: spacing.md },

  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 18 },
  sectionTitle: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },

  input: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 88 },
  sendButton: { alignSelf: 'flex-end', minWidth: 96, alignItems: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  tellNote: { fontFamily: fonts.bodyItalic, fontSize: 14, lineHeight: 20, color: colors.gold, marginTop: spacing.sm, textAlign: 'center' },

  goldButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: spacing.xl, alignItems: 'center', alignSelf: 'stretch' },
  goldButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  disabled: { opacity: 0.5 },
  updated: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.text, opacity: 0.75, textAlign: 'center', marginTop: spacing.sm },
});
