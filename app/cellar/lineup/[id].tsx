import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLineupArchive, lineupSignedUrl, setLineupNote, setLineupFavourite, type LineupWine } from '../../../src/api/lineups';
import { LineupShareCard } from '../../../src/components/LineupShareCard';
import { AddChosenWineModal } from '../../../src/components/AddChosenWineModal';
import { MicButton } from '../../../src/components/MicButton';
import { showAlert } from '../../../src/components/AppAlert';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

export default function LineupDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();

  const { data: lineup, isLoading } = useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineupArchive(id!),
    enabled: !!id,
  });

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
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

  // Review a wine from the lineup — opens the same Add-a-Review modal, pre-filled.
  const [reviewWine, setReviewWine] = useState<{ producer?: string | null; wineName?: string | null; vintage?: string | number | null } | null>(null);

  // Branded share (photo + date + note), mirroring Your Lineup Archive.
  const [shareData, setShareData] = useState<{ url: string; date: string; note: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const capturedRef = useRef(false);

  async function saveNoteNow() {
    if (!lineup || savingNote) return;
    setSavingNote(true);
    try {
      await setLineupNote(lineup.id, note);
      qc.invalidateQueries({ queryKey: ['lineup-archives'] });
      qc.invalidateQueries({ queryKey: ['lineup', id] });
      showAlert({ title: 'Saved', body: 'Your note is kept with this lineup.' });
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
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share this lineup', UTI: 'public.png' });
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
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Lineup</Text>
        <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={[styles.shareText, sharing && { opacity: 0.5 }]}>{sharing ? '…' : 'Share'}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {photoUrl ? <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" /> : <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />}
            <TouchableOpacity style={styles.favStar} onPress={toggleFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <Text style={[styles.favStarText, fav && styles.favStarActive]}>{fav ? '★' : '☆'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.stamp}>{stamp}</Text>

          {/* Note */}
          <View style={styles.dictateRow}>
            <Text style={styles.sectionLabel}>Your note</Text>
            <MicButton value={note} onChangeText={setNote} onClear={() => setNote('')} />
          </View>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="A memory from this night — who you were with, what you thought…"
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity style={[styles.saveNoteBtn, savingNote && { opacity: 0.5 }]} onPress={saveNoteNow} disabled={savingNote} activeOpacity={0.85}>
            <Text style={styles.saveNoteText}>{savingNote ? 'Saving…' : 'Save note'}</Text>
          </TouchableOpacity>

          {/* Wines */}
          <Text style={styles.sectionLabel}>Wines in this lineup</Text>
          {wines.length === 0 ? (
            <Text style={styles.muted}>No bottle details were saved for this lineup{lineup.bottle_count ? ` (${lineup.bottle_count} bottle${lineup.bottle_count === 1 ? '' : 's'})` : ''}.</Text>
          ) : (
            <View style={styles.wineList}>
              {wines.map((w, i) => (
                <View key={`${w.cellar_wine_id ?? 'x'}-${i}`} style={styles.wineRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.wineName} numberOfLines={2}>
                      {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    <View style={styles.tagRow}>
                      {w.cellar_wine_id ? (
                        <Text style={[styles.tag, styles.tagYours]}>{w.archived ? 'Yours · Archived' : 'From your cellar'}</Text>
                      ) : (
                        <Text style={[styles.tag, styles.tagOff]}>Off-cellar</Text>
                      )}
                      {w.cellar_wine_id ? (
                        <TouchableOpacity onPress={() => router.push(`/cellar/${w.cellar_wine_id}` as any)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <Text style={styles.viewLink}>View</Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() => setReviewWine({ producer: w.producer, wineName: w.wine_name, vintage: w.vintage })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewBtnText}>Review</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <AddChosenWineModal
        visible={reviewWine !== null}
        initial={reviewWine}
        onClose={() => setReviewWine(null)}
        onSaved={() => setReviewWine(null)}
      />

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
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1 },
  shareText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold },
  photoWrap: { alignItems: 'center', paddingTop: spacing.md },
  photo: { width: '92%', height: 420, borderRadius: 14, backgroundColor: colors.surface },
  favStar: { position: 'absolute', top: spacing.lg, right: '8%', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  favStarText: { fontSize: 22, color: '#FFFFFF' },
  favStarActive: { color: colors.gold },
  stamp: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold, textAlign: 'center', letterSpacing: 0.3, marginTop: spacing.sm, marginBottom: spacing.md },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl },
  sectionLabel: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.text, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  noteInput: { marginHorizontal: spacing.xl, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, minHeight: 90, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveNoteBtn: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  saveNoteText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  wineList: { paddingHorizontal: spacing.xl },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 15, fontFamily: fonts.bodySemibold, color: colors.text },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  tag: { fontSize: 11, fontFamily: fonts.bodySemibold, textTransform: 'uppercase', letterSpacing: 0.4, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  tagYours: { color: colors.gold, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)' },
  tagOff: { color: colors.textMuted, borderWidth: 1, borderColor: colors.border },
  viewLink: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline' },
  reviewBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: 6, paddingHorizontal: spacing.md },
  reviewBtnText: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.gold },
  muted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, lineHeight: 20 },
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
});
