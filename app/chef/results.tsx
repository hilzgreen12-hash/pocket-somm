import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, Keyboard, ActivityIndicator } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { SearchProgress } from '../../src/components/SearchProgress';
import { RecipeShareCard, RECIPE_SHARE_QR_URL } from '../../src/components/RecipeShareCard';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { Pairing, WineDetailsComplete } from '../../src/types/wine';

function PairingCard({
  pairing,
  saveState,
  onSave,
  isFromHistory,
  onShare,
  sharing,
}: {
  pairing: Pairing;
  saveState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  isFromHistory: boolean;
  onShare: () => void;
  sharing: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.8}>
        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
        <Text style={styles.recipeMetaInline}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>
        <Text style={styles.pairingNotes}>{pairing.pairingNotes}</Text>
        <Text style={styles.toggle}>{expanded ? 'Hide Recipe' : 'View Recipe'}</Text>
      </TouchableOpacity>

      {/* Quick-save sits just under the View Recipe toggle so the user can
          save without expanding the full recipe. Saved recipes land in the
          Cookbook as Unfiled (no folder assignment, not starred). */}
      {!isFromHistory && (
        saveState === 'saved' ? (
          <View style={styles.cardSavedBlock}>
            <Text style={styles.cardSavedLabel}>Saved</Text>
            <TouchableOpacity onPress={() => router.push('/chef/archive')} activeOpacity={0.7}>
              <Text style={styles.cardViewArchiveLink}>View in Your Cookbook</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.cardSaveButton, saveState === 'saving' && styles.cardSaveButtonDisabled]}
            onPress={onSave}
            disabled={saveState === 'saving'}
            activeOpacity={0.8}
          >
            <Text style={styles.cardSaveButtonText}>
              {saveState === 'saving' ? 'Saving…' : 'Quick Save Recipe'}
            </Text>
          </TouchableOpacity>
        )
      )}

      {expanded && (
        <View style={styles.recipe}>
          <Text style={styles.recipeIntro}>{pairing.introduction}</Text>

          <Text style={styles.recipeSection}>Ingredients</Text>
          {pairing.recipe.ingredients.map((ing, i) => (
            <Text key={i} style={styles.recipeItem}>· {ing}</Text>
          ))}

          <Text style={[styles.recipeSection, { marginTop: spacing.md }]}>Method</Text>
          {pairing.recipe.instructions.map((step, i) => (
            <Text key={i} style={styles.recipeItem}>{step}</Text>
          ))}

          <TouchableOpacity
            style={[styles.cardShareButton, sharing && styles.cardSaveButtonDisabled]}
            onPress={onShare}
            disabled={sharing}
            activeOpacity={0.8}
          >
            <Text style={styles.cardShareButtonText}>
              {sharing ? 'Preparing…' : 'Share Recipe'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function ChefResultsScreen() {
  const { fromHistory, sessionId, savedAt, city, from, wineId } = useLocalSearchParams<{ fromHistory?: string; sessionId?: string; savedAt?: string; city?: string; from?: string; wineId?: string }>();
  const isFromHistory = fromHistory === 'true';
  const isFromCellar = from === 'cellar' && !!wineId;
  const { wineDetailsConfirmed, pairings: freshPairings, filters, reset, setPairings, setError } = useLabelStore();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { sessions: labelSessions, isLoading: labelLoading, save: saveLabelSession, updateNotes } = useChefLabelHistory();

  // When the user is viewing a saved cookbook entry, surface the
  // session-level notes block. Notes are tied to the session row, not
  // the individual pairing, since each saved chef_label_session carries
  // a single pairing (see handleSavePairing).
  const viewingSession = useMemo(
    () => (isFromHistory && sessionId ? labelSessions.find((s) => s.id === sessionId) ?? null : null),
    [isFromHistory, sessionId, labelSessions],
  );

  // Fresh results live in the label store; a saved cookbook entry is read
  // straight from its chef_label_session row (viewingSession). Keeping the
  // two sources separate means opening a cookbook entry never overwrites
  // an un-saved fresh result still mounted on the nav stack — previously
  // setPairings() from the archive clobbered it, so navigating back showed
  // only the one recipe that had been saved.
  const wine = isFromHistory ? (viewingSession?.wine ?? null) : wineDetailsConfirmed;
  const pairings = isFromHistory ? (viewingSession?.pairings ?? []) : freshPairings;

  const [notesEditing, setNotesEditing] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  useEffect(() => {
    setNotesDraft(viewingSession?.user_notes ?? '');
  }, [viewingSession?.user_notes, viewingSession?.id]);

  async function handleSaveNotes() {
    if (!viewingSession) return;
    Keyboard.dismiss();
    setNotesSaving(true);
    try {
      const trimmed = notesDraft.trim();
      await updateNotes.mutateAsync({ id: viewingSession.id, notes: trimmed.length > 0 ? trimmed : null });
      setNotesEditing(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setNotesSaving(false);
    }
  }

  function handleCancelNotes() {
    setNotesDraft(viewingSession?.user_notes ?? '');
    setNotesEditing(false);
  }

  function formatNotesDate(iso: string | null | undefined): string | null {
    if (!iso) return null;
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  // Share-card render state. We keep a single off-screen RecipeShareCard
  // and point it at whichever pairing the user just tapped Share on.
  // sharingIndex tracks which card is in flight so the button can show
  // "Preparing..." without freezing all three.
  const shareCardRef = useRef<View>(null);
  const [sharingIndex, setSharingIndex] = useState<number | null>(null);
  const [sharePairing, setSharePairing] = useState<Pairing | null>(null);

  async function handleSharePairing(idx: number) {
    const pairing = pairings[idx];
    if (!pairing || sharingIndex !== null) return;
    setSharingIndex(idx);
    setSharePairing(pairing);
    try {
      // Prefetch the remote QR so it's in cache when view-shot snapshots
      // the card. Without this the QR can appear blank on Android.
      try { await Image.prefetch(RECIPE_SHARE_QR_URL); } catch { /* non-fatal */ }
      // Give RN one paint to mount the off-screen card with the new
      // pairing data before we capture.
      await new Promise((r) => setTimeout(r, 250));
      if (!shareCardRef.current) throw new Error('Share card not ready');
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        width: 1080,
        height: 1920,
        result: 'tmpfile',
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: `Share ${pairing.dishName}`,
          UTI: 'public.png',
        });
      } else {
        showAlert({ title: 'Sharing unavailable', body: 'This device cannot open the share sheet.' });
      }
    } catch (err) {
      showAlert({ title: 'Could not share recipe', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingIndex(null);
      setSharePairing(null);
    }
  }

  // Per-pairing save state for the in-flight transitions (idle → saving
  // → saved) within this mount. The authoritative "already saved" answer
  // is derived from the cookbook archive below so the state survives
  // navigating away and back.
  const [pairingSaveStates, setPairingSaveStates] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});

  // Set of dish names (normalised) that already live in the cookbook
  // for the current wine. Used both to render the "Saved" state on a
  // re-visit and to short-circuit handleSavePairing so a second tap
  // can never create a duplicate row.
  const savedDishNames = useMemo(() => {
    const set = new Set<string>();
    if (!wine) return set;
    const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
    const wantedProducer = norm(wine.producer);
    const wantedName = norm(wine.wineName);
    const wantedVintage = norm(wine.vintage);
    for (const sess of labelSessions) {
      const sw = sess.wine;
      if (!sw) continue;
      if (
        norm(sw.producer) === wantedProducer &&
        norm(sw.wineName) === wantedName &&
        norm(sw.vintage) === wantedVintage
      ) {
        for (const p of (sess.pairings ?? [])) {
          if (p?.dishName) set.add(norm(p.dishName));
        }
      }
    }
    return set;
  }, [labelSessions, wine]);

  function getSaveState(index: number): 'idle' | 'saving' | 'saved' {
    const local = pairingSaveStates[index];
    if (local === 'saving' || local === 'saved') return local;
    const pairing = pairings[index];
    if (pairing?.dishName && savedDishNames.has(pairing.dishName.trim().toLowerCase())) {
      return 'saved';
    }
    return 'idle';
  }
  const [renderedAt] = useState(() => new Date().toISOString());
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    if (!wine || regenerating) return;
    setRegenerating(true);
    try {
      const fresh = await generatePairings(wine, (filters ?? {}) as any);
      setPairings(fresh);
      setPairingSaveStates({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      showAlert({ title: 'Could not regenerate', body: 'Please try again in a moment.' });
    } finally {
      setRegenerating(false);
    }
  }

  const stampDateSource = savedAt || renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampLocation = (city ?? '').trim() || null;

  async function handleSavePairing(index: number) {
    const pairing = pairings[index];
    if (!wine || !pairing) return;
    // Already-saved short-circuit covers both in-flight saves and any
    // pairing already in the cookbook for this wine identity. Without
    // this a user who re-opened the result via View Last Result could
    // tap Quick Save and create a duplicate row.
    if (getSaveState(index) !== 'idle') return;
    if (!session) {
      setSignInPromptVisible(true);
      return;
    }
    setPairingSaveStates((s) => ({ ...s, [index]: 'saving' }));
    try {
      await saveLabelSession.mutateAsync({
        wine,
        filters: filters ?? null,
        // Save just this one pairing as its own archive entry, so each
        // recipe lives independently in the archive (can be starred,
        // foldered, deleted on its own).
        pairings: [pairing],
      });
      setPairingSaveStates((s) => ({ ...s, [index]: 'saved' }));
    } catch (err) {
      setPairingSaveStates((s) => ({ ...s, [index]: 'idle' }));
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // A cookbook entry opened by id may still be resolving from the
  // chef-label-sessions cache on first paint — show a spinner rather than
  // flashing the "No pairings" fallback.
  if (isFromHistory && !viewingSession && labelLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!wine || pairings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No pairings available.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/chef')}>
          <Text style={styles.linkText}>Scan a label</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const headerLine = wineHeaderLine(wine.producer, wine.wineName, wine.vintage);

  if (regenerating) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="A fresh set of three chef-inspired dishes coming up"
        durationMs={55000}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity
        onPress={() => {
          // Back routing depends on where the user came from:
          //  - Cellar wine card → land back on that wine.
          //  - Cookbook entry (fromHistory) → land back on the cookbook
          //    so the user keeps their place in the list rather than
          //    being kicked all the way to the Chef tab.
          //  - Fresh result from a label scan → Chef tab.
          if (isFromCellar) router.replace(`/cellar/${wineId}` as any);
          else if (isFromHistory) router.replace('/chef/archive');
          else router.replace('/(tabs)/chef');
        }}
        style={styles.backRow}
      >
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      {(stampDate || stampLocation) && (
        <View style={styles.stampRow}>
          {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
          {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerLine}>{headerLine}</Text>
        {wine.region ? <Text style={styles.region}>{wine.region}</Text> : null}

      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chef-Inspired Pairings</Text>
        {pairings.map((p, i) => (
          <PairingCard
            key={i}
            pairing={p}
            saveState={getSaveState(i)}
            onSave={() => handleSavePairing(i)}
            isFromHistory={isFromHistory}
            onShare={() => handleSharePairing(i)}
            sharing={sharingIndex === i}
          />
        ))}

        {/* Your Recipe Notes bubble — shown when viewing a saved cookbook
            entry. Sits below the recipe card in matching surface colour. */}
        {viewingSession && (
          <View style={styles.notesCard}>
            <View style={styles.notesHeader}>
              <Text style={styles.notesTitle}>Your Recipe Notes</Text>
              {viewingSession.user_notes_updated_at ? (
                <Text style={styles.notesDate}>Updated {formatNotesDate(viewingSession.user_notes_updated_at)}</Text>
              ) : null}
            </View>

            {notesEditing ? (
              <>
                <TextInput
                  style={styles.notesInput}
                  value={notesDraft}
                  onChangeText={setNotesDraft}
                  placeholder="Tweaks, swaps, who you cooked it for…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  autoFocus
                />
                <View style={styles.notesActions}>
                  <TouchableOpacity onPress={handleCancelNotes} disabled={notesSaving}>
                    <Text style={styles.notesCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.notesSaveBtn, notesSaving && styles.notesSaveBtnDisabled]}
                    onPress={handleSaveNotes}
                    disabled={notesSaving}
                  >
                    <Text style={styles.notesSaveBtnText}>{notesSaving ? 'Saving…' : 'Save Notes'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : viewingSession.user_notes ? (
              <>
                <Text style={styles.notesBody}>{viewingSession.user_notes}</Text>
                <TouchableOpacity onPress={() => setNotesEditing(true)}>
                  <Text style={styles.notesEditLink}>Edit Notes</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={() => setNotesEditing(true)}>
                <Text style={styles.notesEditLink}>+ Add Notes</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {!isFromHistory && (
        <TouchableOpacity style={styles.regenLink} onPress={handleRegenerate} disabled={regenerating}>
          <Text style={styles.regenLinkText}>Not quite — generate another set of recipes</Text>
        </TouchableOpacity>
      )}

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => setSignInPromptVisible(false)}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => setSignInPromptVisible(false)}
      />

      {/* Off-screen branded share card. Mounted only while a share is in
          flight so the remote QR image gets a fresh render each time. */}
      {sharePairing && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <RecipeShareCard
            ref={shareCardRef}
            pairing={sharePairing}
            wineHeader={wine ? wineHeaderLine(wine.producer, wine.wineName, wine.vintage) : null}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  backLink: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  stampRow: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 2 },
  stampDate: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.5 },
  region: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  dishName: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  chefInspiration: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: 2 },
  recipeMetaInline: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, marginTop: 4, letterSpacing: 0.3 },
  pairingNotes: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  toggle: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.sm },
  recipe: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cardSaveButton: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cardSaveButtonDisabled: { opacity: 0.6 },
  cardSaveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, letterSpacing: 0.3 },
  cardShareButton: { marginTop: spacing.md, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cardShareButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, letterSpacing: 0.3 },
  shareCardWrap: { position: 'absolute', top: 100000, left: 0, opacity: 0 },
  cardSavedBlock: { alignItems: 'center', marginTop: spacing.md, gap: 4 },
  cardSavedLabel: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, letterSpacing: 0.5 },
  cardViewArchiveLink: { color: colors.gold, fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, textDecorationLine: 'underline' },
  recipeIntro: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  notesCard: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.md },
  notesHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.sm },
  notesTitle: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  notesDate: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22, marginBottom: spacing.sm },
  notesInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background, minHeight: 100, textAlignVertical: 'top' },
  notesActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  notesCancel: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  notesSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  notesSaveBtnDisabled: { opacity: 0.6 },
  notesSaveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  notesEditLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, alignSelf: 'flex-start' },
  recipeSection: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  recipeItem: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 20, marginBottom: 4 },
  regenLink: { alignItems: 'center', paddingVertical: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm },
  regenLinkText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
});
