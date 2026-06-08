import { useState, useRef, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../services/reviewSync';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

interface Props {
  wine: CellarWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// The focused review input for a cellar wine — the sibling of
// EditChosenWineModal. A cellar review's data lives on the cellar_wines
// row (review_note / user_notes / review_score / review_location /
// review_date) rather than chosen_wines, so this modal reads and saves
// there. It lets Your Wine Reviews open every review the same way — a
// review form, never the full wine card.
export function EditCellarReviewModal({ wine, visible, onClose, onSaved }: Props) {
  const { updateWine } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();

  const [reviewNote, setReviewNote] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [score, setScore] = useState<string>('');
  const [reviewDate, setReviewDate] = useState('');
  const [reviewLocation, setReviewLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [posting, setPosting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareCardRef = useRef<View>(null);

  // Re-seed the form whenever a new wine is opened.
  useEffect(() => {
    if (!wine) return;
    setReviewNote(wine.review_note ?? '');
    setPersonalNotes(wine.user_notes ?? '');
    setScore(wine.review_score != null ? String(wine.review_score) : '');
    setReviewDate(wine.review_date ?? todayISO());
    setReviewLocation(wine.review_location ?? '');
  }, [wine?.id, visible]);

  async function persist() {
    if (!wine) return;
    const scoreTrim = score.trim();
    let parsedScore: number | null = null;
    if (scoreTrim) {
      const n = Number(scoreTrim);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        showAlert({ title: 'Invalid score', body: 'Enter a score between 0 and 100.' });
        throw new Error('invalid score');
      }
      parsedScore = Math.round(n);
    }
    const locationTrim = reviewLocation.trim();
    const dateTrim = reviewDate.trim();
    await updateWine.mutateAsync({
      id: wine.id,
      updates: {
        review_score: parsedScore,
        review_location: locationTrim || null,
        review_date: dateTrim || null,
        review_note: reviewNote.trim() || null,
        user_notes: personalNotes.trim() || null,
      },
    });
    // Keep any duplicate rows (other cellar bottles / chosen reviews of the
    // same wine) in lock-step — mirrors the wine card's save behaviour.
    if (session?.user.id) {
      const { restaurantName, city } = splitLocationString(locationTrim);
      const identity = { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage };
      const fields = { userScore: parsedScore, restaurantName, city, reviewDate: dateTrim || undefined };
      try {
        await syncEditToChosen(session.user.id, identity, fields, { createIfMissing: true, region: wine.region });
        await syncReviewToCellar(session.user.id, identity, fields, { excludeCellarWineId: wine.id });
        qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        qc.invalidateQueries({ queryKey: ['wishlist', session.user.id] });
        qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      } catch (err) {
        console.warn('[cellar review modal] sync failed:', err);
      }
    }
  }

  async function handleSave() {
    if (!wine) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      onSaved();
      onClose();
    } catch {
      // persist() surfaces its own alert for an invalid score.
    } finally {
      setSaving(false);
    }
  }

  async function handlePostToCommunity() {
    if (!wine || posting) return;
    if (!session?.user.id) { showAlert({ title: 'Sign in required', body: 'You need an account to share to the community.' }); return; }
    Keyboard.dismiss();
    setPosting(true);
    try {
      await persist();
      const title = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' · ').trim() || wine.wine_name || 'Wine review';
      const subtitle = [wine.region, wine.grape_variety].filter(Boolean).join(' · ') || null;
      const parsedScore = score.trim() ? Math.round(Number(score.trim())) : null;
      await publishCommunityReview(
        {
          category: 'wine', source_table: 'cellar_wines', source_id: wine.id,
          title, subtitle, rating: Number.isFinite(parsedScore as number) ? parsedScore : null,
          body: reviewNote.trim() || personalNotes.trim() || null,
          metadata: {
            producer: wine.producer ?? null, region: wine.region ?? null, vintage: wine.vintage ?? null,
            grape_variety: wine.grape_variety ?? null, critic_score: wine.critic_score ?? null,
            review_date: reviewDate.trim() || null,
          },
        },
        (session.user.email ?? '').split('@')[0] || null,
      );
      showAlert({ title: 'Shared to community', body: 'Your wine review now appears in the Vinster community feed.' });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      const already = detail.toLowerCase().includes('duplicate') || detail.toLowerCase().includes('unique');
      showAlert({ title: already ? 'Already shared' : 'Could not share', body: already ? "You've already shared this review." : detail });
    } finally {
      setPosting(false);
    }
  }

  async function handleShare() {
    if (!wine || sharing) return;
    Keyboard.dismiss();
    setSharing(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share my wine review', UTI: 'public.png' });
        return;
      }
      const header = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
      const scoreText = score.trim() ? `\nMy score: ${Math.round(Number(score.trim()))}/100` : '';
      const noteFormatted = reviewNote.trim() ? `\n\n"${reviewNote.trim()}"` : '';
      await Share.share({ message: `${header}${scoreText}${noteFormatted}${VINSTER_TEXT_SHARE_FOOTER}`, title: header });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  function handleClearReview() {
    if (!wine) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    showAlert({
      title: 'Delete this review?',
      body: `${label}\n\nThis clears your review. The bottle stays in your cellar.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete review', style: 'destructive', onPress: async () => {
            try {
              await updateWine.mutateAsync({
                id: wine.id,
                updates: { review_score: null, review_location: null, review_date: null, review_note: null, user_notes: null },
              });
              onSaved();
              onClose();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          } },
      ],
    });
  }

  function openFullCard() {
    if (!wine) return;
    onClose();
    router.push(`/cellar/${wine.id}?from=reviews` as any);
  }

  if (!wine) return null;

  const headerLine = (() => {
    const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
    return sameName
      ? [wine.producer, wine.vintage].filter(Boolean).join(' ')
      : [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');
  })();

  const parsedScore = score.trim() ? Math.round(Number(score.trim())) : null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>

            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.headerLine}>{headerLine}</Text>
              {wine.region ? <Text style={styles.region}>{wine.region}</Text> : null}
              {wine.grape_variety ? <Text style={styles.grape}>{wine.grape_variety}</Text> : null}
            </View>

            <View style={styles.divider} />

            {/* Your Score | When */}
            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>Your Score</Text>
                <TextInput
                  style={styles.statInput}
                  value={score}
                  onChangeText={(t) => setScore(t.replace(/[^0-9]/g, '').slice(0, 3))}
                  keyboardType="number-pad"
                  placeholder="e.g. 92"
                  placeholderTextColor={colors.textMuted}
                  maxLength={3}
                />
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statLabel}>When did you drink it?</Text>
                <TextInput
                  style={styles.statInput}
                  value={reviewDate}
                  onChangeText={setReviewDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <Text style={styles.fieldLabel}>Where did you drink it?</Text>
            <TextInput
              style={styles.input}
              value={reviewLocation}
              onChangeText={setReviewLocation}
              placeholder="Restaurant, home, friend's place…"
              placeholderTextColor={colors.textMuted}
            />

            {/* Your Review — the shareable body. Maps to review_note. */}
            <View style={styles.dictateRow}>
              <Text style={styles.sectionTitle}>Your Review</Text>
              <MicButton value={reviewNote} onChangeText={setReviewNote} onClear={() => setReviewNote('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={reviewNote}
              onChangeText={setReviewNote}
              placeholder="What you thought of the wine — taste, occasion, anything worth sharing."
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />

            <View style={styles.shareRow}>
              <TouchableOpacity style={[styles.shareBtn, posting && styles.btnDisabled]} onPress={handlePostToCommunity} disabled={posting} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>{posting ? 'Sharing…' : 'Share to Community'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.shareBtn, sharing && styles.btnDisabled]} onPress={handleShare} disabled={sharing} activeOpacity={0.8}>
                <Text style={styles.shareBtnText}>{sharing ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
            </View>

            {/* Personal Notes — private, maps to user_notes. */}
            <View style={styles.dictateRow}>
              <Text style={styles.sectionTitle}>Personal Notes</Text>
              <MicButton value={personalNotes} onChangeText={setPersonalNotes} onClear={() => setPersonalNotes('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={personalNotes}
              onChangeText={setPersonalNotes}
              placeholder="Just for you — anything you'd rather keep private."
              placeholderTextColor={colors.textMuted}
              multiline numberOfLines={4} textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving || updateWine.isPending}>
              <Text style={styles.saveButtonText}>{saving || updateWine.isPending ? 'Saving…' : 'Save Changes'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.wishlistBtn} onPress={openFullCard} activeOpacity={0.8}>
              <Text style={styles.wishlistBtnText}>View full wine card</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleClearReview} disabled={updateWine.isPending}>
              <Text style={styles.deleteText}>Delete this review</Text>
            </TouchableOpacity>

          </KeyboardAwareScrollView>
        </View>
      </View>

      {sharing && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineReviewShareCard
            ref={shareCardRef}
            producer={wine.producer}
            wineName={wine.wine_name}
            vintage={wine.vintage}
            region={wine.region}
            userScore={parsedScore}
            criticScore={wine.critic_score}
            tastingNote={reviewNote}
            otherObservations={null}
            date={reviewDate ? new Date(reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
            location={reviewLocation || null}
            isFavourite={wine.is_favourite}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 56, paddingBottom: 60 },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginBottom: spacing.md },
  header: { alignItems: 'center', marginBottom: spacing.sm },
  headerLine: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  region: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  grape: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.sm },
  statCell: { width: '50%', paddingVertical: spacing.sm, paddingRight: spacing.sm },
  statLabel: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  statInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textMuted, marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.6 },
  sectionTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, marginTop: spacing.sm, marginBottom: spacing.sm },
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.md },
  noteInput: { minHeight: 90 },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shareBtn: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  shareBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  btnDisabled: { opacity: 0.5 },
  saveButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF' },
  wishlistBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  wishlistBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  deleteText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
