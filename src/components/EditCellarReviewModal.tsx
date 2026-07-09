import { useState, useRef, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../services/reviewSync';
import { captureCity } from '../utils/captureCity';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { WineReviewFields } from './WineReviewFields';
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
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
    {
      // review_location is one free-text field; split it into place + city.
      const { restaurantName: seedName, city: seedCity } = splitLocationString(wine.review_location);
      if (seedCity) { setLocName(seedName); setLocCity(seedCity); }
      else { setLocName(''); setLocCity(seedName); }
      if (!wine.review_location) captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    }
    setPricePaid(wine.purchase_price != null ? String(wine.purchase_price) : '');
    setDrinkingWindow(wine.user_drinking_window ?? '');
    setSaved(false);
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
    const locationTrim = [locName.trim(), locCity.trim()].filter(Boolean).join(', ');
    const dateTrim = reviewDate.trim();
    const parsedPrice = pricePaid.trim() ? parseFloat(pricePaid.trim()) : NaN;
    const priceValue = Number.isFinite(parsedPrice) && parsedPrice >= 0 ? parsedPrice : null;
    const currency = (wine.purchase_price_currency ?? 'GBP').toUpperCase();
    await updateWine.mutateAsync({
      id: wine.id,
      updates: {
        review_score: parsedScore,
        review_location: locationTrim || null,
        review_date: dateTrim || null,
        review_note: reviewNote.trim() || null,
        user_notes: personalNotes.trim() || null,
        purchase_price: priceValue,
        purchase_price_currency: priceValue != null ? currency : null,
        user_drinking_window: drinkingWindow.trim() || null,
      },
    });
    // Keep any duplicate rows (other cellar bottles / chosen reviews of the
    // same wine) in lock-step — mirrors the wine card's save behaviour.
    if (session?.user.id) {
      const { restaurantName, city } = splitLocationString(locationTrim);
      const identity = { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage };
      const fields = { userScore: parsedScore, restaurantName, city, reviewDate: dateTrim || undefined };
      try {
        // Update a matching chosen_wines review if one exists, but DON'T
        // create one — the cellar wine's review already shows in Your Wine
        // Reviews as a 'cellar' item, so creating a chosen_wines row here
        // duplicated it (as a score-only twin).
        await syncEditToChosen(session.user.id, identity, fields, { createIfMissing: false, region: wine.region });
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
      // Stay on the form and flip the button to a gold "Review Saved" rather
      // than closing — the user gets clear confirmation. Back exits.
      setSaved(true);
    } catch (err) {
      // Surface the failure instead of swallowing it — a silent catch here is
      // what hid the missing-column 400 that broke saving entirely.
      const msg = err instanceof Error ? err.message : 'Please try again.';
      if (!msg.includes('invalid score')) {
        showAlert({ title: 'Could not save review', body: msg });
      }
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
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
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

            {/* Top row: back (left) · Share (right). */}
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
                <Text style={[styles.topShareText, sharing && styles.btnDisabled]}>{sharing ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <Text style={styles.headerLine}>{headerLine}</Text>
              {(wine.region || wine.grape_variety) ? (
                <Text style={styles.region}>{[wine.region, wine.grape_variety].filter(Boolean).join(' · ')}</Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            <WineReviewFields
              score={parsedScore}
              onScore={(n) => { setScore(n != null ? String(n) : ''); setSaved(false); }}
              pricePaid={pricePaid}
              onPricePaid={(v) => { setPricePaid(v); setSaved(false); }}
              currency={(wine.purchase_price_currency ?? 'GBP').toUpperCase()}
              estimatedValue={wine.estimated_value ?? null}
              estimatedValueAt={wine.estimated_value_at}
              review={reviewNote}
              onReview={(v) => { setReviewNote(v); setSaved(false); }}
              personalNotes={personalNotes}
              onPersonalNotes={(v) => { setPersonalNotes(v); setSaved(false); }}
              city={locCity}
              onCity={(v) => { setLocCity(v); setSaved(false); }}
              locationName={locName}
              onLocationName={(v) => { setLocName(v); setSaved(false); }}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={(v) => { setDrinkingWindow(v); setSaved(false); }}
              saving={saving || updateWine.isPending}
              saved={saved}
              onSave={handleSave}
              saveLabel="Save Review"
            />

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
            location={[locName.trim(), locCity.trim()].filter(Boolean).join(', ') || null}
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
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topShareText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
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
