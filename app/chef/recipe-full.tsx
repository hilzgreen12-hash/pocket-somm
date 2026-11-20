import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import { useLabelStore } from '../../src/stores/labelStore';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { useAuth } from '../../src/hooks/useAuth';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { showAlert } from '../../src/components/AppAlert';
import { MessageScreen } from '../../src/components/MessageScreen';
import { buildRecipeHtml } from '../../src/utils/recipeHtml';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { Pairing, WineDetailsComplete } from '../../src/types/wine';

// Full-screen "artifact" view of a single pairing — the surface users
// hand to friends as a PDF (Export). Designed to feel like a recipe
// document rather than an in-app card: more breathing room, branded
// header, prominent wine + dish.
//
// Sources:
//   - Fresh result: ?index=N reads labelStore.pairings[N] + wineDetailsConfirmed
//   - Saved cookbook: ?sessionId=X reads from useChefLabelHistory
export default function RecipeFullScreen() {
  const { index, sessionId } = useLocalSearchParams<{ index?: string; sessionId?: string }>();
  const { session } = useAuth();
  const { wineDetailsConfirmed, pairings: freshPairings, filters: labelFilters } = useLabelStore();
  const { sessions: labelSessions, updateNotes, save: saveLabelSession } = useChefLabelHistory();
  const [sharing, setSharing] = useState(false);
  // The user's own pairing notes on this saved recipe (chef_label_sessions
  // .user_notes, migration 036). Editable via the "Add Your Pairing Notes" link.
  const savedSession = sessionId ? labelSessions.find((row) => row.id === sessionId) : null;
  const userNotes = (savedSession?.user_notes ?? '').trim();
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');

  // Resolve the pairing + wine from whichever source the caller indicated.
  const { pairing, wine } = useMemo<{ pairing: Pairing | null; wine: WineDetailsComplete | null }>(() => {
    if (sessionId) {
      const s = labelSessions.find((row) => row.id === sessionId);
      if (s) return { pairing: s.pairings[0] ?? null, wine: s.wine ?? null };
      return { pairing: null, wine: null };
    }
    const i = parseInt(index ?? '0', 10);
    const p = !Number.isNaN(i) ? freshPairings[i] ?? null : null;
    return { pairing: p, wine: wineDetailsConfirmed ?? null };
  }, [sessionId, labelSessions, index, freshPairings, wineDetailsConfirmed]);

  // Full "to pair with" identity: producer · wine name · origin · vintage.
  const wineLine = wine
    ? formatWineTitle({ producer: wine.producer, wineName: wine.wineName, region: wine.region, vintage: wine.vintage })
    : '';

  // "Add to Cookbook" — the bottom-of-card save. Already saved if we opened this
  // from the cookbook (sessionId) or a saved session already holds this dish for
  // this wine, so the button reads "In Your Cookbook ✓" instead.
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const alreadyInCookbook = !!sessionId || labelSessions.some((s) =>
    (s.pairings ?? []).some((p) => p.dishName === pairing?.dishName) &&
    s.wine?.wineName === wine?.wineName &&
    String(s.wine?.vintage ?? '') === String(wine?.vintage ?? ''),
  );
  const isSaved = saveState === 'saved' || alreadyInCookbook;

  async function handleAddToCookbook() {
    if (!wine || !pairing || saveState !== 'idle' || isSaved) return;
    if (!session) {
      showAlert({ title: 'Sign in to save', body: 'Create a free account or sign in to save recipes to Your Cookbook.' });
      return;
    }
    setSaveState('saving');
    try {
      // Save just this one recipe as its own cookbook entry (mirrors the Quick
      // Save on the results screen).
      await saveLabelSession.mutateAsync({ wine, filters: labelFilters ?? null, pairings: [pairing] });
      setSaveState('saved');
    } catch (err) {
      setSaveState('idle');
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function handleShare() {
    if (!pairing || sharing) return;
    setSharing(true);
    try {
      // Share as a PDF (not a screenshot) so an emailed recipe arrives as a
      // readable document. expo-print is lazy-required so this file still
      // typechecks even if the native module isn't in a given build.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Print = require('expo-print');
      const { uri } = await Print.printToFileAsync({ html: buildRecipeHtml(pairing, wineLine) });
      if (await Sharing.isAvailableAsync()) {
        const name = sharerNameFrom(session);
        await shareResult(uri, {
          sharerName: name,
          mimeType: 'application/pdf',
          message: `${name} has shared a recipe with you: ${pairing.dishName}${wineLine ? ` paired to ${wineLine}` : ''}`,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Cannot find module') || msg.includes("Can't find variable")) {
        showAlert({ title: 'Share not available yet', body: 'Sharing as a PDF will work in the next app build.' });
      } else if (!msg.toLowerCase().includes('cancel')) {
        showAlert({ title: 'Could not share', body: msg });
      }
    } finally {
      setSharing(false);
    }
  }

  if (!pairing || !wine) {
    return (
      <MessageScreen
        title="Recipe not available"
        body="The pairing couldn't be loaded — try opening it again from your Chef results."
        onBack={() => router.back()}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {/* Notes live in a popup now (not inline on the recipe). Only on a
              saved recipe, which has a session to attach them to. */}
          {sessionId ? (
            <TouchableOpacity onPress={() => { setNotesDraft(userNotes); setNotesOpen(true); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.actionLink}>{userNotes ? '+ VIEW NOTES' : '+ ADD NOTES'}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionLink, sharing && { opacity: 0.4 }]}>
              {sharing ? 'PREPARING…' : '+ EXPORT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brandHeading}>Recipe Pairing</Text>
        <Text style={styles.brandSub}>Generated by Vinster</Text>

        <View style={styles.ruleRow}>
          <View style={styles.rule} />
          <Text style={styles.ruleMark}>◇</Text>
          <View style={styles.rule} />
        </View>

        <Text style={styles.toPair}>To pair with</Text>
        <Text style={styles.wineHeader}>{wineLine}</Text>

        <View style={styles.shortDivider} />

        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}{pairing.chefCountry ? `, ${pairing.chefCountry}` : ''}</Text>
        <Text style={styles.meta}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>

        <Text style={styles.sectionLabel}>Introduction</Text>
        <Text style={styles.body}>{pairing.introduction}</Text>

        <Text style={styles.sectionLabel}>Ingredients</Text>
        {pairing.recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.bullet}>· {ing}</Text>
        ))}

        <Text style={styles.sectionLabel}>Method</Text>
        {pairing.recipe.instructions.map((step, i) => (
          <Text key={i} style={styles.bullet}>{step}</Text>
        ))}

        {/* Add this recipe to Your Cookbook — sits at the foot of the card. */}
        <TouchableOpacity
          style={[styles.addCookbookBtn, (isSaved || saveState === 'saving') && styles.addCookbookBtnDisabled]}
          onPress={handleAddToCookbook}
          disabled={isSaved || saveState === 'saving'}
          activeOpacity={0.85}
        >
          <Text style={styles.addCookbookText}>
            {isSaved ? 'In Your Cookbook ✓' : saveState === 'saving' ? 'Saving…' : 'Add to Cookbook'}
          </Text>
        </TouchableOpacity>

        {sharing && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </ScrollView>

      {/* Add / edit the user's own pairing notes on this recipe. */}
      <Modal visible={notesOpen} transparent animationType="fade" onRequestClose={() => setNotesOpen(false)}>
        <View style={styles.notesOverlay}>
          <View style={styles.notesSheet}>
            <Text style={styles.notesTitle}>Your Pairing Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notesDraft}
              onChangeText={setNotesDraft}
              placeholder="How did the pairing go? Tweaks, occasion, who you cooked it for…"
              placeholderTextColor={colors.textMuted}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={styles.notesSaveBtn}
              onPress={() => {
                if (!sessionId) return;
                updateNotes.mutate({ id: sessionId, notes: notesDraft.trim() || null });
                setNotesOpen(false);
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.notesSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setNotesOpen(false)} style={styles.notesCancel} activeOpacity={0.7}>
              <Text style={styles.notesCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  actionLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 80 },

  brandHeading: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' },
  brandSub: { fontFamily: fonts.headingItalic, fontSize: 14, color: 'rgba(224,184,74,0.75)', textAlign: 'center', marginTop: 4 },

  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.md, marginBottom: spacing.md, paddingHorizontal: spacing.xl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.45)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm },

  toPair: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },

  // Your-pairing-notes editor.
  notesOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  notesSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg },
  notesTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md },
  notesInput: { minHeight: 120, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  notesSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  notesSaveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  // "Add to Cookbook" at the foot of the recipe card — gold-outline bubble.
  addCookbookBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl },
  addCookbookBtnDisabled: { opacity: 0.6 },
  addCookbookText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  notesCancel: { alignItems: 'center', paddingTop: spacing.md },
  notesCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  wineHeader: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginTop: 4, lineHeight: 28 },
  shortDivider: { width: 40, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', alignSelf: 'center', marginVertical: spacing.lg },

  dishName: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.text, lineHeight: 34 },
  chefInspiration: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.gold, marginTop: 2 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: 6 },

  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  bullet: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24, marginBottom: 4 },


  busyOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Render the share card off-screen so captureRef can produce the PNG
  // without affecting the visible layout.
});
