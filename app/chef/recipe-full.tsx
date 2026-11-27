import { useMemo, useRef, useState } from 'react';
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
import { ShareSheet } from '../../src/components/ShareSheet';
import { RecipeShareCard } from '../../src/components/RecipeShareCard';
import { RecipeNotesModal } from '../../src/components/RecipeNotesModal';
import { latestRecipeNote } from '../../src/utils/recipeNotes';
import { uploadSharedPdf } from '../../src/api/sharedFiles';
import { captureRef } from 'react-native-view-shot';

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
  // The off-screen "The Vinster Kitchen" card captured as the share image.
  const shareCardRef = useRef<View>(null);
  // Pairing Notes pop-up before sharing: an optional note for the share card.
  const [pairingNoteOpen, setPairingNoteOpen] = useState(false);
  const [pairingNoteDraft, setPairingNoteDraft] = useState('');
  const [shareNote, setShareNote] = useState<string | null>(null);
  function askPairingNote() {
    // Start from the newest saved recipe note, if there is one.
    setPairingNoteDraft(latestRecipeNote(savedSession?.user_notes));
    setPairingNoteOpen(true);
  }
  function finishPairingNote(note: string | null) {
    setPairingNoteOpen(false);
    setShareNote(note);
    // Let the card redraw with the note before it is captured.
    setTimeout(() => void handleShare(), 350);
  }
  // The user's own pairing notes on this saved recipe (chef_label_sessions
  // .user_notes, migration 036). Editable via the "Add Your Pairing Notes" link.
  const savedSession = sessionId ? labelSessions.find((row) => row.id === sessionId) : null;
  const userNotes = (savedSession?.user_notes ?? '').trim();
  const [notesOpen, setNotesOpen] = useState(false);

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

  // Share → the Share pop-up (Share externally / Cancel).
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  async function handleShare() {
    if (!pairing || sharing) return;
    setSharing(true);
    try {
      // The message: the "The Vinster Kitchen · Recipe Pairings" card as the
      // image, "<name> has shared a recipe pairing with you.", a link to the
      // full recipe as a PDF, then "Get Vinster". expo-print is lazy-required
      // so this file still typechecks even if the native module isn't in a build.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Print = require('expo-print');
      const { uri: pdfUri } = await Print.printToFileAsync({ html: buildRecipeHtml(pairing, wineLine) });
      if (!(await Sharing.isAvailableAsync())) {
        showAlert({ title: 'Sharing unavailable', body: 'This device cannot open the share sheet.' });
        return;
      }
      const name = sharerNameFrom(session);
      const lead = `${name} has shared a recipe pairing with you.`;
      // Upload the PDF for the link; if that fails, send the PDF itself.
      let pdfUrl: string | null = null;
      try { if (session?.user.id) pdfUrl = await uploadSharedPdf(session.user.id, pdfUri, pairing.dishName); } catch { /* fall back to the file */ }
      await new Promise((r) => setTimeout(r, 150));
      // captureRef throws (rather than returning null) when the snapshot
      // fails — fall back to sending the PDF file itself.
      let imageUri: string | null = null;
      try {
        if (shareCardRef.current) imageUri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
      } catch { /* fall back to the PDF */ }
      if (imageUri && pdfUrl) {
        await shareResult(imageUri, { sharerName: name, message: `${lead}\n${pdfUrl}`, getVinsterOnNewLine: true });
      } else {
        await shareResult(pdfUri, { sharerName: name, mimeType: 'application/pdf', message: lead, getVinsterOnNewLine: true });
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
      {/* Off-screen share image — "The Vinster Kitchen · Recipe Pairings". */}
      <View style={styles.offscreen} pointerEvents="none">
        <RecipeShareCard
          ref={shareCardRef}
          dishName={pairing.dishName}
          chef={pairing.chefInspiration}
          servings={pairing.recipe?.servings}
          prepTime={pairing.recipe?.prepTime}
          cookTime={pairing.recipe?.cookTime}
          wineLine={wineLine}
          pairingNotes={pairing.pairingNotes}
          userNote={shareNote}
        />
      </View>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {/* Notes live in a popup now (not inline on the recipe). Only on a
              saved recipe, which has a session to attach them to. */}
          {sessionId ? (
            <TouchableOpacity onPress={() => setNotesOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.actionLink}>{userNotes ? '+ VIEW NOTES' : '+ ADD NOTES'}</Text>
            </TouchableOpacity>
          ) : null}
          <ShareSheet visible={shareSheetOpen} heading="Your Recipe" name={pairing?.dishName ?? null} detail={[wine?.producer, wine?.wineName, wine?.vintage].filter(Boolean).join(' ') || null} onShareExternally={askPairingNote} onClose={() => setShareSheetOpen(false)} />
          <TouchableOpacity onPress={() => setShareSheetOpen(true)} disabled={sharing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
      {/* Pairing Notes — asked before the share sheet opens; the note appears
          on the share card. */}
      <Modal visible={pairingNoteOpen} transparent animationType="fade" onRequestClose={() => setPairingNoteOpen(false)}>
        <View style={styles.notesOverlay}>
          <View style={styles.notesSheet}>
            <Text style={styles.notesTitle}>Pairing Notes</Text>
            <Text style={styles.pairingNoteDish}>{pairing.dishName}</Text>
            {wineLine ? <Text style={styles.pairingNoteWine}>{wineLine}</Text> : null}
            <Text style={styles.pairingNoteLabel}>Add A Pairing Note</Text>
            <TextInput
              style={styles.notesInput}
              value={pairingNoteDraft}
              onChangeText={setPairingNoteDraft}
              placeholder="How did the pairing go? Tweaks, occasion, who you cooked it for…"
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={400}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.notesSaveBtn, !pairingNoteDraft.trim() && { opacity: 0.5 }]}
              disabled={!pairingNoteDraft.trim()}
              onPress={() => finishPairingNote(pairingNoteDraft.trim())}
              activeOpacity={0.85}
            >
              <Text style={styles.notesSaveText}>Confirm Note</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.notesSaveBtn, { marginTop: spacing.sm }]} onPress={() => finishPairingNote(null)} activeOpacity={0.85}>
              <Text style={styles.notesSaveText}>No Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Recipe notes — dated entries, each editable / deletable, plus Add
          Note for another (like review entries). */}
      <RecipeNotesModal
        visible={notesOpen}
        title={pairing.dishName}
        rawNotes={savedSession?.user_notes}
        notesUpdatedAt={savedSession?.user_notes_updated_at ?? savedSession?.saved_at ?? null}
        onSave={async (notes) => { if (sessionId) await updateNotes.mutateAsync({ id: sessionId, notes }); }}
        onClose={() => setNotesOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
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
  pairingNoteDish: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.gold, textAlign: 'center' },
  pairingNoteWine: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4 },
  pairingNoteLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.lg, marginBottom: spacing.xs },
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
