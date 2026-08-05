import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { getLineupArchive, lineupSignedUrl, setLineupNote, setLineupFavourite, updateLineupStamp, setLineupWines, type LineupWine } from '../../../src/api/lineups';
import { detectLineup, prepareImageBase64 } from '../../../src/api/label';
import { matchLineupToCellar } from '../../../src/services/archiveNight';
import { File, Paths } from 'expo-file-system';
import { LineupShareCard } from '../../../src/components/LineupShareCard';
import { MicButton } from '../../../src/components/MicButton';
import { showAlert } from '../../../src/components/AppAlert';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { useCellar } from '../../../src/hooks/useCellar';
import { useChosenWines } from '../../../src/hooks/useChosenWines';
import { useLabels } from '../../../src/hooks/useLabels';
import { findWineConnections } from '../../../src/utils/wineConnections';
import { Modal } from 'react-native';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

export default function LineupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { session } = useAuth();

  const { data: lineup, isLoading } = useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineupArchive(id!),
    enabled: !!id,
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  // The note reads as plain text once saved; editing opens a popup with the
  // input, and saving converts it back to text.
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [fav, setFav] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => {
    if (lineup && !hydrated.current) {
      hydrated.current = true;
      setNote(lineup.note ?? '');
      setFav(lineup.is_favourite);
      lineupSignedUrl(lineup.image_path).then(setPhotoUrl);
    }
  }, [lineup]);

  // Edit the date + location stamp (tap the stamp below the photo).
  const [stampOpen, setStampOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [savingStamp, setSavingStamp] = useState(false);

  function openStampEdit() {
    if (!lineup) return;
    // Seed from LOCAL date parts (not UTC) so the pre-filled draft matches the
    // displayed stamp — avoids an off-by-one for rows saved near midnight.
    const d = new Date(lineup.archived_at);
    const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setDateDraft(local);
    setCityDraft(lineup.city ?? '');
    setStampOpen(true);
  }
  async function saveStamp() {
    if (!lineup || savingStamp) return;
    const ymd = dateDraft.trim();
    const valid = /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !Number.isNaN(new Date(ymd).getTime());
    // A non-empty but malformed date must not silently save nothing — tell the
    // user rather than closing as if it worked. (Empty = leave the date as-is.)
    if (ymd && !valid) {
      showAlert({ title: 'Check the date', body: 'Enter the date as YYYY-MM-DD (e.g. 2026-08-02).' });
      return;
    }
    setSavingStamp(true);
    try {
      await updateLineupStamp(lineup.id, {
        archivedAt: valid ? new Date(`${ymd}T12:00:00`).toISOString() : undefined,
        city: cityDraft,
      });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setStampOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingStamp(false);
    }
  }

  // For linking each identified wine to its reviews / cellar entry (like the
  // Label Library), vintage-agnostic via findWineConnections.
  const { wines: cellarWines } = useCellar();
  const { chosenWines } = useChosenWines();
  const { labels } = useLabels();

  // "Identify wines" — Vinster reads the archived photo, then the user confirms.
  const [identifying, setIdentifying] = useState(false);
  const [confirmWines, setConfirmWines] = useState<LineupWine[] | null>(null);
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [savingWines, setSavingWines] = useState(false);

  // Per-wine manual edit (replaces whole-photo re-identify): correct one bottle's
  // producer / name / vintage in place and persist the lineup's wines list.
  const [editWineIndex, setEditWineIndex] = useState<number | null>(null);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [savingWineEdit, setSavingWineEdit] = useState(false);

  function openWineEdit(index: number, w: LineupWine) {
    setEditWineIndex(index);
    setEditProducer(w.producer ?? '');
    setEditName(w.wine_name ?? '');
    setEditVintage(w.vintage != null ? String(w.vintage) : '');
  }

  async function saveWineEdit() {
    if (!lineup || editWineIndex == null || savingWineEdit) return;
    const current: LineupWine[] = lineup.wines ?? [];
    const next = current.map((w, i) =>
      i === editWineIndex
        ? { ...w, producer: editProducer.trim() || null, wine_name: editName.trim() || editProducer.trim(), vintage: editVintage.trim() || null }
        : w,
    );
    setSavingWineEdit(true);
    try {
      await setLineupWines(lineup.id, next);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setEditWineIndex(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingWineEdit(false);
    }
  }

  async function identifyWines() {
    if (!lineup || identifying) return;
    setIdentifying(true);
    try {
      const url = photoUrl ?? (await lineupSignedUrl(lineup.image_path));
      if (!url) { showAlert({ title: 'Photo unavailable', body: 'Could not load this lineup’s photo. Please try again.' }); return; }
      // The archived photo lives in Storage — download it locally, then OCR.
      const dest = new File(Paths.cache, `lineup-detect-${lineup.id}.jpg`);
      try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
      const file = await File.downloadFileAsync(url, dest);
      const base64 = await prepareImageBase64(file.uri);
      const { bottles } = await detectLineup(base64);
      if (!bottles.length) {
        showAlert({ title: 'No wines detected', body: 'Vinster couldn’t read any bottles from this photo. A clearer, well-lit shot with the labels in frame works best.' });
        return;
      }
      // Match to the live cellar so confirmed wines carry a cellar link where possible.
      const { matched, unmatched } = matchLineupToCellar(bottles, cellarWines);
      const candidates: LineupWine[] = [
        ...matched.map((m) => ({ producer: m.wine.producer, wine_name: m.wine.wine_name, vintage: m.wine.vintage, cellar_wine_id: m.wine.id, archived: false, count: m.count })),
        ...unmatched.map((b) => ({ producer: b.producer ?? null, wine_name: b.wineName, vintage: b.vintage, cellar_wine_id: null, archived: false, count: b.quantity ?? 1 })),
      ];
      setIncluded(new Set(candidates.map((_, i) => i)));
      setConfirmWines(candidates);
    } catch (err) {
      showAlert({ title: 'Could not identify wines', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIdentifying(false);
    }
  }

  async function saveIdentifiedWines() {
    if (!lineup || !confirmWines || savingWines) return;
    const kept = confirmWines.filter((_, i) => included.has(i));
    setSavingWines(true);
    try {
      await setLineupWines(lineup.id, kept);
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      setConfirmWines(null);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingWines(false);
    }
  }


  // Branded share (photo + date + note), mirroring Your Lineup Library.
  const [shareData, setShareData] = useState<{ url: string; date: string; note: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const capturedRef = useRef(false);

  function openNoteEditor() {
    setNoteDraft(note);
    setNoteEditorOpen(true);
  }

  async function saveNoteFromEditor() {
    if (!lineup || savingNote) return;
    setSavingNote(true);
    try {
      await setLineupNote(lineup.id, noteDraft);
      setNote(noteDraft);
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      setNoteEditorOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
    }
  }

  async function toggleFav() {
    if (!lineup) return;
    const next = !fav;
    setFav(next);
    try {
      await setLineupFavourite(lineup.id, next);
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
    } catch { setFav(!next); }
  }

  async function handleShare() {
    if (!lineup || sharing) return;
    setSharing(true);
    try {
      const url = photoUrl ?? (await lineupSignedUrl(lineup.image_path));
      if (!url) throw new Error('Could not load the lineup photo.');
      capturedRef.current = false;
      setShareData({
        url,
        date: new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: note.trim() || (lineup.note ?? ''),
      });
    } catch (err) {
      setSharing(false);
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  async function captureAndShare() {
    if (capturedRef.current || !shareCardRef.current) return;
    capturedRef.current = true;
    try {
      await new Promise((r) => setTimeout(r, 150));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setShareData(null);
      capturedRef.current = false;
    }
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  if (!lineup) return (
    <View style={styles.center}>
      <Text style={styles.muted}>This lineup no longer exists.</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
    </View>
  );

  const dateStr = new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const stamp = [dateStr, lineup.city].filter(Boolean).join(' · ');
  const wines: LineupWine[] = lineup.wines ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back + Share on their own row, so the stamp's tap area no longer sits
            against the back arrow (which is what hijacked Back into the editor). */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 16 }}>
            <Text accessibilityLabel="Back" style={styles.back}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 10, bottom: 10, left: 16, right: 10 }}>
            <Text style={[styles.shareText, sharing && { opacity: 0.5 }]}>{sharing ? '…' : 'Share'}</Text>
          </TouchableOpacity>
        </View>
        {/* Date · location as the header title (tap to edit), dropped below the
            back/share row. */}
        <TouchableOpacity style={styles.headerStampWrap} onPress={openStampEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={styles.headerStamp} numberOfLines={1}>{stamp || 'Add date · location'}<Text style={styles.stampEditHint}>  ✎</Text></Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="contain" /> : <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />}
            <TouchableOpacity style={styles.favStar} onPress={toggleFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <Text style={[styles.favStarText, fav && styles.favStarActive]}>{fav ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>

          {/* Note — reads as plain text once saved; "Edit" reopens the input in a
              popup, and saving there converts it back to text. */}
          <View style={styles.noteBlock}>
            <View style={styles.noteHeadRow}>
              <Text style={styles.noteHeadLabel}>Your note</Text>
              {note.trim() ? (
                <TouchableOpacity onPress={openNoteEditor} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={styles.viewLink}>Edit</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {note.trim() ? (
              <Text style={styles.noteText}>{note}</Text>
            ) : (
              <TouchableOpacity onPress={openNoteEditor} activeOpacity={0.7}>
                <Text style={styles.addNoteLink}>+ Add a note</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Wines */}
          <View style={styles.winesHeaderRow}>
            <Text style={styles.sectionLabel}>Wines in this lineup</Text>
          </View>
          {wines.length === 0 ? (
            <View>
              <Text style={styles.muted}>No bottles identified yet{lineup.bottle_count ? ` (${lineup.bottle_count} bottle${lineup.bottle_count === 1 ? '' : 's'} in the photo)` : ''}. Let Vinster read the labels and confirm what's in this lineup.</Text>
              <TouchableOpacity style={[styles.identifyBtn, identifying && { opacity: 0.5 }]} onPress={identifyWines} disabled={identifying} activeOpacity={0.85}>
                <Text style={styles.identifyBtnText}>{identifying ? 'Reading the labels…' : 'Identify wines'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.wineList}>
              {wines.map((w, i) => {
                // Whether this wine has been reviewed anywhere (any vintage).
                const conn = findWineConnections(
                  { producer: w.producer, wineName: w.wine_name, vintage: w.vintage },
                  { labels, chosenWines, cellarWines },
                );
                return (
                <View key={`${w.cellar_wine_id ?? 'x'}-${i}`} style={styles.wineRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wineName} numberOfLines={2}>
                      {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    <View style={styles.tagRow}>
                      {/* One status stamp: Yours (in the cellar) or Off cellar. */}
                      <Text style={styles.stampTag}>{w.cellar_wine_id ? 'Yours' : 'Off cellar'}</Text>
                      {/* Review — becomes View/Edit Review once one's written. A
                          cellar wine's review lives on its card; off-cellar wines
                          go through Your Wine Reviews. */}
                      <TouchableOpacity
                        onPress={() => {
                          if (w.cellar_wine_id) { router.push(`/cellar/${w.cellar_wine_id}` as any); return; }
                          if (conn.reviewCount > 0) { router.push('/wines/chosen'); return; }
                          router.push(`/wines/chosen?seedAdd=1&sp=${encodeURIComponent(w.producer ?? '')}&sw=${encodeURIComponent(w.wine_name ?? '')}&sv=${encodeURIComponent(w.vintage != null ? String(w.vintage) : '')}` as any);
                        }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Text style={styles.viewLink}>{conn.reviewCount > 0 ? 'View/Edit Review' : 'Review'}</Text>
                      </TouchableOpacity>
                      {/* Edit this bottle's identity (replaces whole-photo re-identify). */}
                      <TouchableOpacity onPress={() => openWineEdit(i, w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.viewLink}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Edit the date + location stamp. */}
      <Modal visible={stampOpen} transparent animationType="fade" onRequestClose={() => setStampOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setStampOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <Text style={styles.stampTitle}>Date & location</Text>
            <Text style={styles.stampFieldLabel}>Date</Text>
            <TextInput
              style={styles.stampInput}
              value={dateDraft}
              onChangeText={(t) => setDateDraft(t.replace(/[^0-9-]/g, '').slice(0, 10))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            <Text style={styles.stampFieldLabel}>Location</Text>
            <TextInput
              style={styles.stampInput}
              value={cityDraft}
              onChangeText={setCityDraft}
              placeholder="City or place"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={[styles.stampSaveBtn, savingStamp && { opacity: 0.5 }]} onPress={saveStamp} disabled={savingStamp} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingStamp ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Your note — editor popup. Saving converts the note back to text. */}
      <Modal visible={noteEditorOpen} transparent animationType="fade" onRequestClose={() => setNoteEditorOpen(false)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setNoteEditorOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <View style={styles.dictateRowFlush}>
              <Text style={styles.stampTitle}>Your note</Text>
              <MicButton value={noteDraft} onChangeText={setNoteDraft} onClear={() => setNoteDraft('')} />
            </View>
            <TextInput
              style={styles.noteEditorInput}
              value={noteDraft}
              onChangeText={setNoteDraft}
              placeholder="A memory from this night — who you were with, what you thought…"
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <TouchableOpacity style={[styles.stampSaveBtn, savingNote && { opacity: 0.5 }]} onPress={saveNoteFromEditor} disabled={savingNote} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingNote ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit one bottle's identity. */}
      <Modal visible={editWineIndex !== null} transparent animationType="fade" onRequestClose={() => setEditWineIndex(null)}>
        <TouchableOpacity style={styles.stampOverlay} activeOpacity={1} onPress={() => setEditWineIndex(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.stampSheet} onPress={() => {}}>
            <Text style={styles.stampTitle}>Edit wine</Text>
            <Text style={styles.stampFieldLabel}>Producer</Text>
            <TextInput style={styles.stampInput} value={editProducer} onChangeText={setEditProducer} placeholder="e.g. Château Batailley" placeholderTextColor={colors.textMuted} />
            <Text style={styles.stampFieldLabel}>Wine name</Text>
            <TextInput style={styles.stampInput} value={editName} onChangeText={setEditName} placeholder="e.g. Grand Cru Classé" placeholderTextColor={colors.textMuted} />
            <Text style={styles.stampFieldLabel}>Vintage</Text>
            <TextInput style={styles.stampInput} value={editVintage} onChangeText={(t) => setEditVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />
            <TouchableOpacity style={[styles.stampSaveBtn, savingWineEdit && { opacity: 0.5 }]} onPress={saveWineEdit} disabled={savingWineEdit} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingWineEdit ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Confirm the wines Vinster identified — tap a wine to include/exclude. */}
      <Modal visible={confirmWines !== null} transparent animationType="fade" onRequestClose={() => setConfirmWines(null)}>
        <View style={styles.stampOverlay}>
          <View style={[styles.stampSheet, { maxHeight: '82%' }]}>
            <Text style={styles.stampTitle}>Confirm the wines</Text>
            <Text style={styles.confirmBlurb}>Vinster read these from the photo. Tap to include or exclude, then save.</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {(confirmWines ?? []).map((w, i) => {
                const on = included.has(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.confirmRow}
                    onPress={() => setIncluded((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.confirmCheck, on && styles.confirmCheckOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.confirmWineName, !on && styles.confirmWineOff]} numberOfLines={2}>
                        {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                      {w.cellar_wine_id ? <Text style={styles.confirmCellarTag}>In your cellar</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.stampSaveBtn, (savingWines || included.size === 0) && { opacity: 0.5 }]} onPress={saveIdentifiedWines} disabled={savingWines || included.size === 0} activeOpacity={0.85}>
              <Text style={styles.stampSaveText}>{savingWines ? 'Saving…' : `Save ${included.size} wine${included.size === 1 ? '' : 's'}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmWines(null)} disabled={savingWines}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Off-screen share card. */}
      {shareData ? (
        <View style={styles.offscreen} pointerEvents="none">
          <LineupShareCard ref={shareCardRef} imageUrl={shareData.url} date={shareData.date} location={lineup.city} note={shareData.note} onImageReady={captureAndShare} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  headerStampWrap: { alignItems: 'center', paddingHorizontal: spacing.sm, marginTop: spacing.lg },
  headerStamp: { fontSize: 17, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5, textAlign: 'center' },
  shareText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  photoWrap: { alignItems: 'center', paddingTop: spacing.md },
  photo: { width: '92%', height: 420, borderRadius: 14, backgroundColor: colors.surface },
  favStar: { position: 'absolute', top: spacing.lg, right: '8%', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  favStarText: { fontSize: 22, color: '#FFFFFF' },
  favStarActive: { color: colors.gold },
  stampEditHint: { fontSize: 13, color: colors.textMuted },
  stampOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  stampSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  stampTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  stampFieldLabel: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginBottom: 4, marginTop: spacing.sm, letterSpacing: 0.3 },
  stampInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  stampSaveBtn: { marginTop: spacing.lg, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  stampSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  winesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: spacing.xl },
  reIdentifyLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  identifyBtn: { marginHorizontal: spacing.xl, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  identifyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  confirmBlurb: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  confirmCheck: { fontSize: 22, color: colors.textMuted },
  confirmCheckOn: { color: colors.gold },
  confirmWineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, lineHeight: 20 },
  confirmWineOff: { color: colors.textMuted, textDecorationLine: 'line-through' },
  confirmCellarTag: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, marginTop: 2 },
  confirmCancel: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  confirmCancelText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  dictateRowFlush: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  sectionLabel: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  noteBlock: { marginTop: spacing.md, marginBottom: spacing.sm },
  noteHeadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  noteHeadLabel: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text },
  noteText: { paddingHorizontal: spacing.xl, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
  addNoteLink: { paddingHorizontal: spacing.xl, fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  noteEditorInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 100, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  noteInput: { marginHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 90, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveNoteBtn: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  saveNoteText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  wineList: { paddingHorizontal: spacing.xl },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  // Non-link status stamps — all yellow (Off-cellar, Not reviewed, Archived).
  stampTag: { fontSize: 11, fontFamily: fonts.bodySemibold, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.gold, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  viewLink: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline' },
  muted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, lineHeight: 20 },
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
});
