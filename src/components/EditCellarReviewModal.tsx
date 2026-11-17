import { useState, useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Keyboard, Share } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { LabelThumb } from './LabelThumb';
import { ReviewCardHeader, ReviewedLineEditable } from './ReviewCardHeader';
import { WineReviewShareCard } from './WineReviewShareCard';
import { getCachedLabelUri } from '../api/labelImageCache';
import { captureCity } from '../utils/captureCity';
import { todayYmd } from '../utils/reviewDate';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { buildEntry, entriesOf, latestEntry, flatMirror, withoutEntries, splitLocation } from '../utils/cellarReview';
import { missingReviewFields } from '../utils/reviewDedup';
import { WineReviewFields } from './WineReviewFields';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { CellarWine } from '../types/wine';

// What a NEW entry starts with instead of today and a blank place (a review of
// an archived bottle: the day it was archived, at its Archive Note's place).
export interface NewReviewSeed {
  date?: string | null;
  venue?: string | null;
}

interface Props {
  wine: CellarWine | null;
  visible: boolean;
  onClose: () => void;
  // The entry was saved or deleted; the parent closes the modal.
  onSaved: () => void;
  // The entry to edit in place (pre-filled). Omit to write a NEW dated entry.
  editEntryId?: string | null;
  // Tapping the wine title on a FIRST review hands off to the shared Edit Wine
  // Details screen (fix the name / add a vintage). The parent hides this modal,
  // opens the screen, and re-opens the modal for the same wine on return.
  onEditWine?: (wine: CellarWine) => void;
  seed?: NewReviewSeed;
}

// The review input for a cellar bottle — the sibling of EditChosenWineModal.
// A cellar review is a list of dated entries on the cellar_wines row
// (review_entries); this writes one entry, new or edited, and nothing else.
export function EditCellarReviewModal({ wine, visible, onClose, onSaved, editEntryId = null, onEditWine, seed }: Props) {
  const { updateWine } = useCellar();
  const { session } = useAuth();

  const [reviewNote, setReviewNote] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [score, setScore] = useState<string>('');
  const [reviewDate, setReviewDate] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [pricePaid, setPricePaid] = useState('');
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [saving, setSaving] = useState(false);
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
    // Editing pre-fills from that entry; a new entry opens blank. Price stays
    // either way — it belongs to the bottle, not the entry.
    const editing = editEntryId ? entriesOf(wine).find((e) => e.id === editEntryId) : undefined;
    setPricePaid(wine.purchase_price != null ? String(wine.purchase_price) : '');
    if (editing) {
      setReviewNote(editing.note ?? '');
      setPersonalNotes(editing.personalNotes ?? '');
      setScore(editing.score != null ? String(editing.score) : '');
      setReviewDate(editing.date ?? todayYmd());
      const { place, city } = splitLocation(editing.location);
      setLocName(place);
      setLocCity(city);
      setDrinkingWindow(editing.drinkingWindow ?? '');
      return;
    }
    setReviewNote('');
    setPersonalNotes('');
    setScore('');
    setReviewDate(seed?.date || todayYmd());
    setLocName(seed?.venue ?? '');
    setLocCity('');
    captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    setDrinkingWindow('');
  }, [wine?.id, visible, editEntryId]);

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
    const entry = buildEntry({
      note: reviewNote, personalNotes, score: parsedScore,
      location: locationTrim, date: dateTrim || null, drinkingWindow,
    });
    // An edit replaces the entry in place, keeping its id and savedAt so it
    // holds its place in the history; otherwise the entry is appended.
    const existing = entriesOf(wine);
    const nextEntries = editEntryId && existing.some((e) => e.id === editEntryId)
      ? existing.map((e) => (e.id === editEntryId ? { ...entry, id: e.id, savedAt: e.savedAt } : e))
      : [...existing, entry];
    await updateWine.mutateAsync({
      id: wine.id,
      updates: {
        review_entries: nextEntries,
        ...flatMirror(latestEntry(nextEntries)),
        purchase_price: priceValue,
        purchase_price_currency: priceValue != null ? currency : null,
      },
    });
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

  // Delete the entry being edited. Other entries of this wine stay, and the
  // flat review fields re-mirror whichever entry is now the latest.
  function handleDeleteEntry() {
    if (!wine || !editEntryId) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    showAlert({
      title: 'Delete this review?',
      body: `${label}\n\nThis deletes this review. The bottle stays in your cellar.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete review', style: 'destructive', onPress: async () => {
            try {
              await updateWine.mutateAsync({ id: wine.id, updates: withoutEntries(wine, [editEntryId]) });
              onSaved();
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
              onPressTitle={onEditWine && !editEntryId && entriesOf(wine).length === 0
                ? () => { suspendedForEditRef.current = wine.id; onEditWine(wine); }
                : undefined}
              thumbnail={wine.label_image_path
                ? <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.headerThumb} radius={5} frame={0} />
                : null}
            />

            <View style={styles.divider} />
            <ReviewedLineEditable date={reviewDate} onDate={(t) => setReviewDate(t.slice(0, 10))} city={locCity} onCity={setLocCity} venue={locName} onVenue={setLocName} currency={(wine.purchase_price_currency ?? 'GBP').toUpperCase()} />

            <WineReviewFields
              score={parsedScore}
              onScore={(n) => setScore(n != null ? String(n) : '')}
              pricePaid={pricePaid}
              onPricePaid={setPricePaid}
              currency={(wine.purchase_price_currency ?? 'GBP').toUpperCase()}
              estimatedValue={wine.estimated_value ?? null}
              estimatedValueAt={wine.estimated_value_at}
              review={reviewNote}
              onReview={setReviewNote}
              personalNotes={personalNotes}
              onPersonalNotes={setPersonalNotes}
              city={locCity}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={setDrinkingWindow}
              saving={saving || updateWine.isPending}
              onSave={handleSave}
              saveLabel="Save Review"
            />

            {editEntryId ? (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteEntry} disabled={updateWine.isPending}>
                <Text style={styles.deleteText}>Delete this review</Text>
              </TouchableOpacity>
            ) : null}

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
            date={reviewDate ? new Date(`${reviewDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null}
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
