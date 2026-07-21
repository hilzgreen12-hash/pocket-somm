import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, TextInput, Keyboard, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { buildRecipeHtml } from '../../src/utils/recipeHtml';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { SearchProgress } from '../../src/components/SearchProgress';
import { RecipeShareCard, RECIPE_SHARE_QR_URL } from '../../src/components/RecipeShareCard';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import type { Pairing, WineDetailsComplete } from '../../src/types/wine';

function PairingCard({
  pairing,
  saveState,
  onSave,
  isFromHistory,
  onShare,
  sharing,
  onViewFull,
}: {
  pairing: Pairing;
  saveState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  isFromHistory: boolean;
  onShare: () => void;
  sharing: boolean;
  onViewFull: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <Text style={[styles.dishName, { flex: 1 }]}>{pairing.dishName}</Text>
        {/* "+ SHARE" shares the FULL recipe (the off-screen RecipeShareCard),
            not the thumbnail. */}
        <TouchableOpacity
          onPress={onShare}
          disabled={sharing}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.cardShareLink}
          accessibilityRole="button"
          accessibilityLabel="Share this recipe"
        >
          <Text style={styles.cardShareLinkText}>{sharing ? '…' : '+ SHARE'}</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
      <Text style={styles.recipeMetaInline}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>
      <Text style={styles.pairingNotes}>{pairing.pairingNotes}</Text>

      {/* "View Full Recipe" opens the dedicated full-screen recipe page —
          the destination the old "+ FULL" link used. */}
      <TouchableOpacity onPress={onViewFull} activeOpacity={0.7}>
        <Text style={styles.toggle}>View Full Recipe</Text>
      </TouchableOpacity>

      {/* Quick-save sits under the View Full Recipe link so the user can
          save without leaving the thumbnail. Saved recipes land in the
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
              {saveState === 'saving' ? 'Saving…' : 'Quick Save to Cookbook'}
            </Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

// Card used for SAVED recipes — recipe name is the main header (replacing
// the wine name), wine sits as subhead, and the full method is shown by
// default (no expand/collapse). + SHARE and + FULL sit in the top-right.
// A "View/Edit Your Recipe Notes" link opens the notes popup.
function PairingCardSaved({
  pairing,
  wineLine,
  hasNotes,
  onShare,
  onViewFull,
  onOpenNotes,
  sharing,
}: {
  pairing: Pairing;
  wineLine: string;
  hasNotes: boolean;
  onShare: () => void;
  onViewFull: () => void;
  onOpenNotes: () => void;
  sharing: boolean;
}) {
  return (
    <View style={styles.savedCard}>
      {/* "+ FULL" opens the full-screen recipe card, where sharing and
          printing live. Sits in its own row above the title so the recipe
          name can stretch the full inner width. */}
      <View style={styles.savedActionsRow}>
        <TouchableOpacity
          onPress={onViewFull}
          onLongPress={onViewFull}
          delayLongPress={400}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.cardShareLink}
        >
          <Text style={styles.cardShareLinkText}>+ FULL</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={styles.savedDishName}>{pairing.dishName}</Text>
        <Text style={styles.savedChef}>Inspired by {pairing.chefInspiration}</Text>
        {wineLine ? <Text style={styles.savedWineLine}>To pair with {wineLine}</Text> : null}
      </View>

      <TouchableOpacity onPress={onOpenNotes} style={styles.savedNotesLink} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
        <Text style={styles.savedNotesLinkText}>
          + {hasNotes ? 'View/Edit Your Recipe Notes' : 'Add Your Recipe Notes'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.recipeMetaInline}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>
      <Text style={styles.pairingNotes}>{pairing.pairingNotes}</Text>

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
      </View>
    </View>
  );
}

// Build a short "You requested…" line from the recipe filters so the user
// sees, on the results card, what they asked Vinster for. (A future
// iteration can swap this for an AI-written summary from the edge function.)
function buildBriefSummary(filters: Record<string, any> | null | undefined): string | null {
  if (!filters) return null;
  const reqs: string[] = [];
  if (filters.dietary) reqs.push(String(filters.dietary));
  if (Array.isArray(filters.allergens)) reqs.push(...filters.allergens.map((a: any) => String(a)));
  const reqStr = reqs.filter(Boolean).join(', ').trim();
  const concerns = typeof filters.specificConcerns === 'string' ? filters.specificConcerns.trim() : '';
  if (!reqStr && !concerns) return null;
  let s = reqStr ? `You requested a ${reqStr.toLowerCase()} recipe` : 'You requested a recipe';
  if (concerns) s += ` — ${concerns}`;
  return s.endsWith('.') ? s : `${s}.`;
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

  // Notes for a saved recipe — previously edited inline at the bottom of
  // the screen, now lifted into a popup modal reachable from the
  // "+ View/Edit Your Recipe Notes" link on the recipe header.
  const [notesModalOpen, setNotesModalOpen] = useState(false);
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
      setNotesModalOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setNotesSaving(false);
    }
  }

  function handleCancelNotes() {
    setNotesDraft(viewingSession?.user_notes ?? '');
    setNotesModalOpen(false);
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
    try {
      const wineLine = wine ? wineHeaderLine(wine.producer, wine.wineName, wine.vintage) : '';
      // Share as a PDF (not a screenshot image) so an emailed recipe arrives
      // as a readable document. expo-print lazy-required for build safety.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Print = require('expo-print');
      const { uri } = await Print.printToFileAsync({ html: buildRecipeHtml(pairing, wineLine) });
      if (await Sharing.isAvailableAsync()) {
        await shareResult(uri, { sharerName: sharerNameFrom(session), mimeType: 'application/pdf' });
      } else {
        showAlert({ title: 'Sharing unavailable', body: 'This device cannot open the share sheet.' });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Cannot find module') || msg.includes("Can't find variable")) {
        showAlert({ title: 'Share not available yet', body: 'Sharing as a PDF will work in the next app build.' });
      } else if (!msg.toLowerCase().includes('cancel')) {
        showAlert({ title: 'Could not share recipe', body: msg });
      }
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

  // Regen modal — opens when the user taps "Not quite — generate
  // another set of recipes". Carries the free-form steer and (under
  // the hood) the running list of chefs already shown so the next
  // batch can't recycle them.
  const [regenModalOpen, setRegenModalOpen] = useState(false);
  const [regenRequestDraft, setRegenRequestDraft] = useState('');
  const [usedChefs, setUsedChefs] = useState<string[]>([]);

  // Seed the used-chefs list from the initial pairings so the first
  // regen already excludes round-one chefs. Re-seeds when fresh
  // pairings land (e.g. after a regen) — see handleConfirmRegenerate
  // which also pushes its own.
  useEffect(() => {
    if (isFromHistory) return;
    const initial = (freshPairings ?? [])
      .map((p) => (p.chefInspiration ?? '').trim())
      .filter((s) => s.length > 0);
    if (initial.length > 0) {
      setUsedChefs((prev) => {
        const merged = new Set<string>(prev);
        for (const c of initial) merged.add(c);
        return Array.from(merged);
      });
    }
    // Only run on first mount of a fresh result. We don't include
    // freshPairings in the deps because handleConfirmRegenerate already
    // updates usedChefs imperatively after each regen — re-running
    // this on every pairings change would just re-do that work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openRegenModal() {
    if (regenerating) return;
    setRegenRequestDraft('');
    setRegenModalOpen(true);
  }

  function cancelRegen() {
    setRegenModalOpen(false);
    setRegenRequestDraft('');
  }

  async function handleConfirmRegenerate() {
    if (!wine || regenerating) return;
    const steer = regenRequestDraft.trim();
    Keyboard.dismiss();
    setRegenModalOpen(false);
    setRegenerating(true);
    try {
      const fresh = await generatePairings(wine, (filters ?? {}) as any, {
        excludeChefs: usedChefs,
        additionalRequest: steer.length > 0 ? steer : null,
      });
      setPairings(fresh);
      setPairingSaveStates({});
      // Roll the new chefs into the running exclude list so a third
      // regen avoids rounds one AND two.
      const incoming = fresh
        .map((p) => (p.chefInspiration ?? '').trim())
        .filter((s) => s.length > 0);
      setUsedChefs((prev) => {
        const merged = new Set<string>(prev);
        for (const c of incoming) merged.add(c);
        return Array.from(merged);
      });
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
  const briefSummary = !isFromHistory ? buildBriefSummary(filters as Record<string, any> | null) : null;

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
        <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      {(stampDate || stampLocation) && (
        <View style={styles.stampRow}>
          {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
          {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
        </View>
      )}

      {/* Wine header is hidden for cookbook entries — the saved-recipe
          card carries its own recipe-name-first layout with the wine
          as subhead. Fresh-result flow keeps the wine header at top. */}
      {!isFromHistory && (
        <View style={styles.freshHeader}>
          <Text style={styles.freshWineLine}>{headerLine}{wine.region ? `, ${wine.region}` : ''}</Text>
          {briefSummary ? (
            <Text style={styles.briefSummary}>
              <Text style={styles.briefSummaryLabel}>Brief Summary: </Text>{briefSummary}
            </Text>
          ) : null}
        </View>
      )}

      <View style={styles.section}>
        {pairings.map((p, i) => (
          isFromHistory && viewingSession ? (
            <PairingCardSaved
              key={i}
              pairing={p}
              wineLine={wine ? wineHeaderLine(wine.producer, wine.wineName, wine.vintage) : ''}
              hasNotes={!!viewingSession.user_notes?.trim()}
              sharing={sharingIndex === i}
              onShare={() => handleSharePairing(i)}
              onViewFull={() => {
                if (sessionId) router.push(`/chef/recipe-full?sessionId=${encodeURIComponent(sessionId)}` as any);
              }}
              onOpenNotes={() => setNotesModalOpen(true)}
            />
          ) : (
            <PairingCard
              key={i}
              pairing={p}
              saveState={getSaveState(i)}
              onSave={() => handleSavePairing(i)}
              isFromHistory={isFromHistory}
              onShare={() => handleSharePairing(i)}
              sharing={sharingIndex === i}
              onViewFull={() => {
                // Fresh result → load by index into labelStore.pairings.
                router.push(`/chef/recipe-full?index=${i}` as any);
              }}
            />
          )
        ))}
      </View>

      {!isFromHistory && (
        <TouchableOpacity style={styles.regenLink} onPress={openRegenModal} disabled={regenerating}>
          <Text style={styles.regenLinkText}>
            {regenerating ? 'Generating a fresh set…' : 'Not quite — generate another set of recipes'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Regen steer modal — asks the user if they'd like to nudge the
          next set in a particular direction. The exclude-chefs list is
          carried through invisibly; the user only sees the steer
          prompt. Empty input is fine — just hit Generate to roll again
          with the chef list as the only differentiator. */}
      <Modal
        visible={regenModalOpen}
        transparent
        animationType="fade"
        onRequestClose={cancelRegen}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableOpacity style={styles.notesModalOverlay} activeOpacity={1} onPress={cancelRegen}>
          <TouchableOpacity activeOpacity={1} style={styles.notesModalSheet} onPress={() => {}}>
            <Text style={styles.notesModalTitle}>Anything in particular you'd like to see in the next set of recipes?</Text>
            <Text style={styles.notesModalHint}>Leave blank to roll the dice — Vinster will also pick three new chefs so the next set doesn't repeat.</Text>
            <TextInput
              style={styles.notesModalInput}
              value={regenRequestDraft}
              onChangeText={setRegenRequestDraft}
              placeholder="ie. Show me Japanese inspired pairings, recipes with fresh vegetables"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.notesModalActions}>
              <TouchableOpacity onPress={cancelRegen} disabled={regenerating}>
                <Text style={styles.notesCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.notesSaveBtn, regenerating && styles.notesSaveBtnDisabled]}
                onPress={handleConfirmRegenerate}
                disabled={regenerating}
              >
                <Text style={styles.notesSaveBtnText}>{regenerating ? 'Generating…' : 'Generate'}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => setSignInPromptVisible(false)}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => setSignInPromptVisible(false)}
      />

      {/* Recipe-notes popup — opened from the "View/Edit Your Recipe Notes"
          link on the saved-recipe card. Replaces the old inline notes
          editor block that used to sit at the bottom of the screen. */}
      <Modal
        visible={notesModalOpen}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNotes}
      >
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <TouchableOpacity style={styles.notesModalOverlay} activeOpacity={1} onPress={handleCancelNotes}>
          <TouchableOpacity activeOpacity={1} style={styles.notesModalSheet} onPress={() => {}}>
            <Text style={styles.notesModalTitle}>Your Recipe Notes</Text>
            <Text style={styles.notesModalHint}>Tweaks, swaps, who you cooked it for — keep your own version of the recipe alongside Vinster's.</Text>
            <TextInput
              style={styles.notesModalInput}
              value={notesDraft}
              onChangeText={setNotesDraft}
              placeholder="Your notes…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.notesModalActions}>
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
            {viewingSession?.user_notes_updated_at ? (
              <Text style={styles.notesModalDate}>Last updated {formatNotesDate(viewingSession.user_notes_updated_at)}</Text>
            ) : null}
          </TouchableOpacity>
        </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

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
  backLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  stampRow: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 2 },
  stampDate: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.5 },
  region: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs },
  // Fresh-result header — wine line centred in gold beneath the date, with
  // a "Brief Summary" of the requested requirements below it.
  freshHeader: { paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.md, alignItems: 'center' },
  freshWineLine: { fontSize: 20, fontFamily: fonts.headingBold, color: '#FFFFFF', textAlign: 'center', letterSpacing: 0.5, lineHeight: 26 },
  briefSummary: { fontSize: 14, fontFamily: fonts.bodyRegular, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 20, marginTop: spacing.sm },
  briefSummaryLabel: { fontFamily: fonts.bodySemibold, color: '#FFFFFF' },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  dishName: { fontSize: 16, fontFamily: fonts.headingBold, color: colors.text },
  // Header row hosting dishName + the quick "+ SHARE" link in the corner.
  cardHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  cardShareLink: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  cardShareLinkText: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  chefInspiration: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: 2 },
  recipeMetaInline: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text, marginTop: 4, letterSpacing: 0.3 },
  pairingNotes: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  toggle: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold, marginTop: spacing.sm },
  recipe: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cardSaveButton: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cardSaveButtonDisabled: { opacity: 0.6 },
  cardSaveButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, letterSpacing: 0.3 },
  cardShareButton: { marginTop: spacing.md, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cardShareButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, letterSpacing: 0.3 },
  shareCardWrap: { position: 'absolute', top: 100000, left: 0, opacity: 0 },
  cardSavedBlock: { alignItems: 'center', marginTop: spacing.md, gap: 4 },
  cardSavedLabel: { color: colors.gold, fontFamily: fonts.bodySemibold, fontSize: 14, letterSpacing: 0.5 },
  cardViewArchiveLink: { color: colors.gold, fontFamily: fonts.bodyItalic, fontSize: 14, textDecorationLine: 'underline' },
  recipeIntro: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  notesCard: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginTop: spacing.md, marginBottom: spacing.md },
  notesHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.sm },
  notesTitle: { fontSize: 16, fontFamily: fonts.headingBold, color: colors.text },
  notesDate: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5 },
  notesBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 22, marginBottom: spacing.sm },
  notesInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.background, minHeight: 100, textAlignVertical: 'top' },
  notesActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  notesCancel: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  notesSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  notesSaveBtnDisabled: { opacity: 0.6 },
  notesSaveBtnText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold },
  notesEditLink: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, alignSelf: 'flex-start' },
  recipeSection: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  recipeItem: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 20, marginBottom: 4 },
  regenLink: { alignItems: 'center', paddingVertical: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm },
  regenLinkText: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },

  // ---- Saved-recipe card (cookbook view) ----
  // Same card shell as the fresh-result PairingCard but with a different
  // header structure: recipe name big at the top, wine line below it,
  // share/full links in the corner, and a notes-popup link.
  // Saved-recipe card — outer margin was spacing.xl (32) which left
  // the title squeezed against the inner padding once the +FULL /
  // +SHARE buttons ate the right side of the header row. Now narrower
  // outer margin + dedicated actions row above the title so the
  // recipe name has the full card width to breathe.
  savedCard: { marginHorizontal: spacing.md, marginTop: spacing.lg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.xs },
  savedActionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginBottom: spacing.xs },
  savedDishName: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.text, lineHeight: 34 },
  savedChef: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: 2 },
  savedWineLine: { fontFamily: fonts.bodyItalic, fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: spacing.xs, lineHeight: 20 },
  savedNotesLink: { paddingVertical: spacing.xs, alignSelf: 'flex-start', marginTop: spacing.xs },
  savedNotesLinkText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, letterSpacing: 0.3, textDecorationLine: 'underline' },

  // ---- Notes popup modal ----
  notesModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  notesModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  notesModalTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  notesModalHint: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  notesModalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 140, lineHeight: 22, marginBottom: spacing.md },
  notesModalActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md },
  notesModalDate: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});
