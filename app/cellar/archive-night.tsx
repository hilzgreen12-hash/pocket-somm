import { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { detectLineup, prepareImageBase64, type DetectedBottle } from '../../src/api/label';
import { matchLineupToCellar, archiveBottles, type NightMatch } from '../../src/services/archiveNight';
import { saveLineupArchive, setLineupNote, type LineupArchive } from '../../src/api/lineups';
import { LabelThumb } from '../../src/components/LabelThumb';
import { MicButton } from '../../src/components/MicButton';
import { RestaurantReviewModal } from '../../src/components/RestaurantReviewModal';
import { createManualRestaurantSession, deleteScanSession } from '../../src/api/restaurantSessions';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

type Stage = 'capture' | 'analyzing' | 'review' | 'archiving' | 'done';

export default function ArchiveNightScreen() {
  const { session } = useAuth();
  const { wines } = useCellar();
  const qc = useQueryClient();

  const [stage, setStage] = useState<Stage>('capture');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [matches, setMatches] = useState<NightMatch[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [unmatched, setUnmatched] = useState<DetectedBottle[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  // Whether the lineup photo made it into Your Lineup Library. Bottle archiving
  // is the critical action and must not be blocked by a photo failure, but we
  // shouldn't claim the photo saved when it didn't.
  const [photoSaved, setPhotoSaved] = useState(true);
  // The saved lineup row (when the photo made it to the Library) — lets the
  // done screen attach a "memory" note to it. Plus the note draft + save state.
  const [savedLineup, setSavedLineup] = useState<LineupArchive | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  // "Where did you enjoy these bottles?" — Private Location is just selectable
  // for now (no input flow yet); A Restaurant opens the full review modal on a
  // blank manual restaurant session, saved to Your Restaurants.
  const [locationChoice, setLocationChoice] = useState<'private' | 'restaurant' | null>(null);
  const [restaurantSessionId, setRestaurantSessionId] = useState<string | null>(null);
  const [openingRestaurant, setOpeningRestaurant] = useState(false);
  const restaurantSavedRef = useRef(false);

  async function handleChooseRestaurant() {
    if (!session?.user.id || openingRestaurant) return;
    setOpeningRestaurant(true);
    try {
      const id = await createManualRestaurantSession(session.user.id);
      restaurantSavedRef.current = false;
      setRestaurantSessionId(id);
    } catch (err) {
      showAlert({ title: 'Could not start a review', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setOpeningRestaurant(false);
    }
  }

  async function pickFrom(source: 'camera' | 'library') {
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await analyze(uri);
    } catch (err) {
      showAlert({ title: 'Could not open camera', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function analyze(uri: string) {
    setStage('analyzing');
    try {
      const base64 = await prepareImageBase64(uri);
      const { bottles } = await detectLineup(base64);
      // Cap the lineup at 8 bottles.
      const capped = (bottles ?? []).slice(0, 8);
      const result = matchLineupToCellar(capped, wines);
      setMatches(result.matched);
      setUnmatched(result.unmatched);
      // Default each removal count to what was detected (capped at owned qty).
      const initial: Record<string, number> = {};
      result.matched.forEach((m) => { initial[m.wine.id] = Math.min(m.count, m.wine.quantity); });
      setCounts(initial);
      setStage('review');
    } catch (err) {
      showAlert({ title: 'Could not read the photo', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('capture');
    }
  }

  function adjust(wineId: string, delta: number, maxQty: number) {
    setCounts((prev) => {
      const next = Math.max(0, Math.min(maxQty, (prev[wineId] ?? 0) + delta));
      return { ...prev, [wineId]: next };
    });
  }

  const totalToArchive = matches.reduce((sum, m) => sum + (counts[m.wine.id] ?? 0), 0);

  async function handleSaveNote() {
    if (!savedLineup || savingNote || !note.trim()) return;
    setSavingNote(true);
    try {
      await setLineupNote(savedLineup.id, note);
      setNoteSaved(true);
      if (session?.user.id) qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
    }
  }

  async function confirmArchive() {
    if (!session?.user.id || totalToArchive === 0) return;
    setStage('archiving');
    const today = new Date().toISOString().split('T')[0];
    try {
      for (const m of matches) {
        const n = counts[m.wine.id] ?? 0;
        if (n > 0) await archiveBottles(m.wine, n, today);
      }
      // Save the lineup photo to Your Lineup Library. Non-fatal: a photo
      // failure must not lose the (already-committed) archiving, but we record
      // the outcome so the done screen tells the truth.
      let savedPhoto = false;
      if (imageUri) {
        try {
          const row = await saveLineupArchive(session.user.id, imageUri, totalToArchive);
          setSavedLineup(row);
          savedPhoto = true;
        } catch (e) {
          console.warn('saveLineupArchive failed:', e);
        }
      }
      setPhotoSaved(savedPhoto);
      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives', session.user.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setArchivedCount(totalToArchive);
      setStage('done');
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
      setStage('review');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Archive a Night</Text>
        <View style={styles.headerSpacer} />
      </View>

      {stage === 'capture' ? (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.lead}>Drank some bottles?</Text>
          <Text style={styles.leadBody}>
            Photograph your lineup and Vinster will match which bottles came from your cellar. Confirm the selection to archive.
          </Text>
          <Text style={styles.leadBody}>
            All of your lineup photos are saved to Your Lineup Library in the You tab — you can comment on lineups and share them with friends.
          </Text>
          <Text style={styles.hint}>Photograph up to 8 bottles with their front labels facing the camera</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => pickFrom('camera')} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>Take a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => pickFrom('library')} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Upload a Photo</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : stage === 'analyzing' ? (
        <View style={styles.centerBlock}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" /> : null}
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Vinster is reading your bottles…</Text>
        </View>
      ) : stage === 'archiving' ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.hint}>Archiving…</Text>
        </View>
      ) : stage === 'done' ? (
        <ScrollView contentContainerStyle={styles.doneContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.doneTitle}>Night Archived</Text>
          <Text style={styles.doneCount}>
            {archivedCount} bottle{archivedCount === 1 ? '' : 's'} moved to your archive.{' '}
            {photoSaved
              ? 'The photo is saved in Your Lineup Library.'
              : "The bottles were archived, but the lineup photo couldn't be saved to Your Lineup Library."}
          </Text>

          {savedLineup ? (
            <>
              <Text style={styles.doneBlurb}>Fun session! Can you tell Vinster a little more about it?</Text>

              <Text style={styles.notePrompt}>Where did you enjoy these bottles?</Text>
              <View style={styles.locationRow}>
                <TouchableOpacity
                  style={[styles.locationBtn, locationChoice === 'private' && styles.locationBtnActive]}
                  onPress={() => setLocationChoice('private')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.locationBtnText, locationChoice === 'private' && styles.locationBtnTextActive]}>Private Location</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.locationBtn, locationChoice === 'restaurant' && styles.locationBtnActive]}
                  onPress={handleChooseRestaurant}
                  disabled={openingRestaurant}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.locationBtnText, locationChoice === 'restaurant' && styles.locationBtnTextActive]}>
                    {openingRestaurant ? '…' : locationChoice === 'restaurant' ? '✓ Restaurant' : 'A Restaurant'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.notePrompt}>
                What stood out? A note about this lineup will be kept next to the photo in Your Lineup Library.
              </Text>
              <View style={styles.noteRow}>
                <TextInput
                  style={styles.noteInput}
                  value={note}
                  onChangeText={(t) => { setNote(t); if (noteSaved) setNoteSaved(false); }}
                  placeholder="Tap the mic to speak, or type a few words…"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                />
                <MicButton value={note} onChangeText={(t) => { setNote(t); if (noteSaved) setNoteSaved(false); }} />
              </View>
              <TouchableOpacity
                style={[styles.saveNoteBtn, (!note.trim() || savingNote) && styles.primaryBtnDisabled]}
                onPress={handleSaveNote}
                disabled={!note.trim() || savingNote}
                activeOpacity={0.85}
              >
                <Text style={styles.saveNoteText}>
                  {noteSaved ? '✓ Note saved' : savingNote ? 'Saving…' : 'Save note'}
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/cellar/list?archived=1')} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>View Cellar Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        // review
        <ScrollView contentContainerStyle={styles.content}>
          {imageUri ? <Image source={{ uri: imageUri }} style={styles.previewSmall} resizeMode="contain" /> : null}

          {matches.length === 0 ? (
            <Text style={styles.hint}>Vinster couldn't match any of these bottles to your cellar. Try a clearer photo with the front labels showing.</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Matched in your cellar</Text>
              {matches.map((m) => {
                const n = counts[m.wine.id] ?? 0;
                const label = m.wine.vintage ? `${m.wine.vintage} ${m.wine.wine_name}` : m.wine.wine_name;
                return (
                  <View key={m.wine.id} style={[styles.row, n === 0 && styles.rowMuted]}>
                    <LabelThumb path={m.wine.label_image_path} fallbackText={m.wine.wine_name} style={styles.thumb} />
                    <View style={styles.rowText}>
                      <Text style={styles.rowName} numberOfLines={2}>{label}</Text>
                      <Text style={styles.rowMeta} numberOfLines={1}>
                        {m.wine.producer}{m.wine.quantity ? ` · ${m.wine.quantity} in cellar` : ''}
                      </Text>
                      {m.anyUnconfident ? <Text style={styles.unconfident}>Low-confidence read — check this one</Text> : null}
                    </View>
                    <View style={styles.stepper}>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(m.wine.id, -1, m.wine.quantity)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.stepBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.stepCount}>{n}</Text>
                      <TouchableOpacity style={styles.stepBtn} onPress={() => adjust(m.wine.id, 1, m.wine.quantity)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.stepBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          )}

          {unmatched.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Not in your cellar</Text>
              {unmatched.map((b, i) => (
                <Text key={i} style={styles.unmatchedLine}>
                  · {[b.vintage, b.producer, b.wineName].filter(Boolean).join(' ')}
                </Text>
              ))}
              <Text style={styles.hintSmall}>These won't be archived.</Text>
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryBtn, totalToArchive === 0 && styles.primaryBtnDisabled]}
            onPress={confirmArchive}
            disabled={totalToArchive === 0}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {totalToArchive === 0 ? 'Nothing selected' : `Archive ${totalToArchive} bottle${totalToArchive === 1 ? '' : 's'}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStage('capture'); setImageUri(null); }} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Retake</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Restaurant review on a blank manual session, saved to Your Restaurants.
          Cancelling without saving removes the empty draft. */}
      {restaurantSessionId ? (
        <RestaurantReviewModal
          visible
          sessionId={restaurantSessionId}
          initialName={null}
          initialNote={null}
          initialRatings={null}
          initialFavourite={false}
          city={null}
          date={null}
          wines={[]}
          onClose={() => {
            if (restaurantSessionId && !restaurantSavedRef.current) void deleteScanSession(restaurantSessionId);
            setRestaurantSessionId(null);
          }}
          onSaved={() => { restaurantSavedRef.current = true; setLocationChoice('restaurant'); setRestaurantSessionId(null); }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 44 },
  headerSpacer: { width: 44 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  content: { padding: spacing.xl, paddingBottom: 60 },
  centerBlock: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  lead: { fontSize: 17, fontFamily: fonts.headingRegular, color: colors.text, lineHeight: 24, textAlign: 'center', marginBottom: spacing.sm },
  leadBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 22, textAlign: 'center', marginBottom: spacing.md },
  hint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.md },
  hintSmall: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  preview: { width: '80%', height: 240, borderRadius: 12, backgroundColor: '#000' },
  previewSmall: { width: '100%', height: 160, borderRadius: 12, backgroundColor: '#000', marginBottom: spacing.md },
  primaryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  secondaryBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  // Done-screen buttons — match the Cellar tab's Archive a Night / Cellar
  // Archive buttons (full-width, white border, rounded 14).
  doneBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  doneBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: spacing.sm },
  doneTitle: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center' },
  doneContent: { padding: spacing.xl, paddingTop: spacing.xl * 2, paddingBottom: 60, gap: spacing.md },
  // Non-italic — the count summary + the "fun session" blurb read as plain copy.
  // Count summary in gold; "Fun session!" + note prompt in white.
  doneCount: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold, textAlign: 'center', lineHeight: 20 },
  doneBlurb: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 22, marginTop: spacing.sm, textAlign: 'center' },
  notePrompt: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, lineHeight: 20, marginTop: spacing.sm },
  locationRow: { flexDirection: 'row', gap: spacing.sm },
  locationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  locationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  locationBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  locationBtnTextActive: { color: colors.gold },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  noteInput: { flex: 1, minHeight: 88, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  // Save note — gold, but the SAME footprint as the View Cellar Archive / Done buttons.
  saveNoteBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  saveNoteText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMuted: { opacity: 0.45 },
  thumb: { width: 40, height: 52, borderRadius: 4 },
  rowText: { flex: 1 },
  rowName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  rowMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  unconfident: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.gold, marginTop: 2 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepBtn: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.gold, lineHeight: 20 },
  stepCount: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, minWidth: 18, textAlign: 'center' },
  unmatchedLine: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, lineHeight: 20 },
});
