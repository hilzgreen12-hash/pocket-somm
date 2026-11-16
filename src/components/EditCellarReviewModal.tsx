import { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Keyboard, Share } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { LabelThumb } from './LabelThumb';
import { ReviewCardHeader, ReviewedLineEditable } from './ReviewCardHeader';
import { WineReviewShareCard } from './WineReviewShareCard';
import { getCachedLabelUri } from '../api/labelImageCache';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../services/reviewSync';
import { captureCity } from '../utils/captureCity';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { buildEntry, entriesOf, latestEntry, flatMirror } from '../utils/cellarReview';
import { missingReviewFields } from '../utils/reviewDedup';
import { WineReviewFields } from './WineReviewFields';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

interface Props {
  wine: CellarWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  // When true, edit the latest entry in place (pre-filled) instead of appending
  // a fresh blank review. Used by the review card's "Edit" action.
  editLatest?: boolean;
  // Tapping the wine title on a FIRST review hands off to the shared Edit Wine
  // Details screen (fix the name / add a vintage). The parent hides this modal,
  // opens the screen, and re-opens the modal for the same wine on return.
  onEditWine?: (wine: CellarWine) => void;
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
export function EditCellarReviewModal({ wine, visible, onClose, onSaved, editLatest = false, onEditWine }: Props) {
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
  // In edit mode, the id of the entry being edited in place (else null = append).
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shareLabelUri, setShareLabelUri] = useState<string | null>(null);

  const shareCardRef = useRef<View>(null);
  // Set while the user is away on the Edit Wine Details screen, so re-opening
  // the same wine keeps the review they'd already started typing.
  const suspendedForEditRef = useRef<string | null>(null);

  // Re-seed the form whenever a new wine is opened.
  useEffect(() => {
    if (!wine) return;
    if (visible && suspendedForEditRef.current === wine.id) {
      suspendedForEditRef.current = null;
      return;
    }
    // Edit mode: pre-fill from the latest entry and edit it in place. Otherwise
    // this modal writes a NEW review entry each time (append-only), so the
    // review fields open blank; price stays (it's a bottle-level field).
    const latest = editLatest ? latestEntry(entriesOf(wine)) : null;
    setEditingEntryId(latest?.id ?? null);
    if (latest) {
      setReviewNote(latest.note ?? '');
      setPersonalNotes(latest.personalNotes ?? '');
      setScore(latest.score != null ? String(latest.score) : '');
      setReviewDate(latest.date ?? todayISO());
      const { restaurantName, city } = splitLocationString(latest.location ?? '');
      setLocName(restaurantName ?? '');
      setLocCity(city ?? '');
      setPricePaid(wine.purchase_price != null ? String(wine.purchase_price) : '');
      setDrinkingWindow(latest.drinkingWindow ?? '');
      setSaved(false);
      return;
    }
    setReviewNote('');
    setPersonalNotes('');
    setScore('');
    setReviewDate(todayISO());
    setLocName('');
    setLocCity('');
    captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    setPricePaid(wine.purchase_price != null ? String(wine.purchase_price) : '');
    setDrinkingWindow('');
    setSaved(false);
  }, [wine?.id, visible, editLatest]);

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
    // Append a new dated entry to the bottle's review history; mirror the latest
    // entry onto the flat review_* fields so existing surfaces keep reading it.
    const entry = buildEntry({
      note: reviewNote, personalNotes, score: parsedScore,
      location: locationTrim, date: dateTrim || null, drinkingWindow,
    });
    // Edit mode replaces the entry in place (keeping its id + savedAt so the 24h
    // edit clock isn't reset); otherwise append a fresh dated entry.
    const nextEntries = editLatest && editingEntryId
      ? entriesOf(wine).map((e) => (e.id === editingEntryId ? { ...entry, id: e.id, savedAt: e.savedAt } : e))
      : [...entriesOf(wine), entry];
    const latest = latestEntry(nextEntries);
    await updateWine.mutateAsync({
      id: wine.id,
      updates: {
        review_entries: nextEntries,
        ...flatMirror(latest),
        purchase_price: priceValue,
        purchase_price_currency: priceValue != null ? currency : null,
      },
    });
    // Keep any duplicate rows (other cellar bottles / chosen reviews of the
    // same wine) in lock-step — mirrors the wine card's save behaviour.
    if (session?.user.id) {
      const { restaurantName, city } = splitLocationString(locationTrim);
      const identity = { producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage };
      const fields = {
        userScore: parsedScore,
        tastingNote: reviewNote,
        otherObservations: personalNotes,
        drinkingWindow,
        restaurantName,
        city,
        reviewDate: dateTrim || undefined,
        labelImagePath: wine.label_image_path,
      };
      try {
        // Do NOT create a chosen_wines twin for a cellar review. A cellar review
        // already surfaces natively in Your Wine Reviews as a 'cellar' item
        // (chosen.tsx cellarReviews), where delete + multi-entry history work
        // correctly. Creating a twin instead misclassified it as a 'chosen' row,
        // which broke delete (the cellar row re-derived it back), collapsed the
        // review count/history to 1, and could mis-file it under "Winelist". We
        // only UPDATE a pre-existing twin (e.g. one created from a List scan of
        // the same wine) so the two stay in lock-step.
        await syncEditToChosen(session.user.id, identity, fields, { createIfMissing: false, region: wine.region });
        await syncReviewToCellar(session.user.id, identity, fields, { excludeCellarWineId: wine.id });
        qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      } catch (err) {
        console.warn('[cellar review modal] sync failed:', err);
      }
    }
  }

  async function handleSave() {
    if (!wine) return;
    // Pre-save nudge: list anything empty except the optional Personal Notes.
    const missing = missingReviewFields([
      { label: 'Your Score', filled: !!score.trim() },
      { label: 'a Location', filled: !!(locName.trim() || locCity.trim()) },
      { label: 'Your Review', filled: !!reviewNote.trim() },
    ]);
    if (missing.length) {
      showAlert({
        title: 'Ready to Save?',
        body: `You're missing ${missing.join(', ')}.`,
        buttons: [
          { text: 'Yes, Save', onPress: () => { void doSaveNow(); } },
          { text: 'Return to Review', style: 'cancel' },
        ],
      });
      return;
    }
    await doSaveNow();
  }

  async function doSaveNow() {
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

  async function handleShare() {
    if (!wine || sharing) return;
    Keyboard.dismiss();
    let labelUri: string | null = null;
    if (wine.label_image_path) { try { labelUri = await getCachedLabelUri(wine.label_image_path); } catch { /* no photo */ } }
    setShareLabelUri(labelUri);
    setSharing(true);
    try {
      await new Promise((r) => setTimeout(r, 250));
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine review') });
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

  const parsedScore = score.trim() ? Math.round(Number(score.trim())) : null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>

            {/* Top row: back (left) · Share · Edit (right). */}
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text accessibilityLabel="Back" style={styles.backText}>←</Text>
              </TouchableOpacity>
              <View style={styles.topRight}>
                {/* No "Edit" here — a cellar wine's identity is already confirmed
                    (edit it from the wine card). Date + location are editable
                    inline in the stamp below. */}
                <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 8, bottom: 6, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Text style={[styles.topShareText, sharing && styles.btnDisabled]}>{sharing ? 'Preparing…' : 'Export'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Header — the shared review header: centred "Reviewed <date> ·
                <location>" stamp (live), then thumbnail + identity like the
                cellar wine card. */}
            <ReviewCardHeader
              producer={wine.producer}
              wineName={wine.wine_name}
              vintage={wine.vintage}
              region={wine.region}
              grape={wine.grape_variety}
              onPressTitle={onEditWine && !editLatest && entriesOf(wine).length === 0
                ? () => { suspendedForEditRef.current = wine.id; onEditWine(wine); }
                : undefined}
              thumbnail={wine.label_image_path
                ? <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.headerThumb} radius={5} frame={0} />
                : null}
            />

            <View style={styles.divider} />
            <ReviewedLineEditable date={reviewDate} onDate={(t) => { setReviewDate(t.slice(0, 10)); setSaved(false); }} city={locCity} onCity={(v) => { setLocCity(v); setSaved(false); }} venue={locName} onVenue={(v) => { setLocName(v); setSaved(false); }} currency={(wine.purchase_price_currency ?? 'GBP').toUpperCase()} />

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
              showLocation={false}
              requireCity
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
            imageUri={shareLabelUri}
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
  backText: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  topRight: { alignItems: 'flex-end', gap: 2 },
  topShareText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },

  headerThumb: { width: 96, height: 128, borderRadius: 5 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  btnDisabled: { opacity: 0.5 },

  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  deleteText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textDecorationLine: 'underline' },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
