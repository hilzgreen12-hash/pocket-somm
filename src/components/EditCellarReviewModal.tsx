import { useState, useRef, useEffect } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share, Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { LabelThumb } from './LabelThumb';
import { uploadLabelImage } from '../api/labelPhotos';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { WineReviewShareCard } from './WineReviewShareCard';
import { publishCommunityReview } from '../api/community';
import { syncReviewToCellar, syncEditToChosen, splitLocationString } from '../services/reviewSync';
import { captureCity } from '../utils/captureCity';
import { normaliseCity } from '../utils/city';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { buildEntry, entriesOf, latestEntry, flatMirror } from '../utils/cellarReview';
import { missingReviewFields } from '../utils/reviewDedup';
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

  // Edit-identity sheet (name / vintage / region / style + location + date +
  // label photo) — the same affordance the restaurant review editor has.
  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editRestaurant, setEditRestaurant] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const shareCardRef = useRef<View>(null);

  function openIdentityEdit() {
    if (!wine) return;
    setEditProducer(wine.producer ?? '');
    setEditName(wine.wine_name ?? '');
    setEditVintage(wine.vintage ?? '');
    setEditRegion(wine.region ?? '');
    setEditStyle(wine.style ?? '');
    const { restaurantName, city } = splitLocationString(wine.review_location);
    if (city) { setEditRestaurant(restaurantName); setEditCity(city); }
    else { setEditRestaurant(''); setEditCity(restaurantName); }
    setEditDate(wine.review_date ?? todayISO());
    setEditImageUri(null);
    setIdentityEditOpen(true);
  }

  async function pickIdentityPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditImageUri(res.assets[0].uri);
  }

  async function saveIdentity() {
    if (!wine || !session?.user.id) return;
    if (!editName.trim()) { showAlert({ title: 'Wine name needed', body: 'Add at least the wine name.' }); return; }
    setSavingIdentity(true);
    try {
      const location = [editRestaurant.trim(), editCity.trim()].filter(Boolean).join(', ') || null;
      let labelPath: string | undefined;
      if (editImageUri) labelPath = await uploadLabelImage(session.user.id, editImageUri, wine.id);
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          producer: editProducer.trim() || null,
          wine_name: editName.trim(),
          region: editRegion.trim() || null,
          style: editStyle.trim() || null,
          vintage: editVintage.trim() || null,
          review_location: location,
          review_date: editDate.trim() || null,
          ...(labelPath ? { label_image_path: labelPath } : {}),
        },
      });
      // Keep the review form's own location/date state in step.
      setLocName(editRestaurant.trim());
      setLocCity(editCity.trim());
      setReviewDate(editDate.trim());
      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      setIdentityEditOpen(false);
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingIdentity(false);
    }
  }

  // Re-seed the form whenever a new wine is opened.
  useEffect(() => {
    if (!wine) return;
    // This modal now writes a NEW review entry each time (append-only), so the
    // review fields open blank; price stays (it's a bottle-level field).
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
    // Append a new dated entry to the bottle's review history; mirror the latest
    // entry onto the flat review_* fields so existing surfaces keep reading it.
    const entry = buildEntry({
      note: reviewNote, personalNotes, score: parsedScore,
      location: locationTrim, date: dateTrim || null, drinkingWindow,
    });
    const nextEntries = [...entriesOf(wine), entry];
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

            {/* Top row: back (left) · Share · Edit (right). */}
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.backText}>← Back</Text>
              </TouchableOpacity>
              <View style={styles.topRight}>
                <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 8, bottom: 6, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Text style={[styles.topShareText, sharing && styles.btnDisabled]}>{sharing ? 'Preparing…' : 'Share'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={openIdentityEdit} hitSlop={{ top: 6, bottom: 8, left: 12, right: 12 }} activeOpacity={0.7}>
                  <Text style={styles.topEditText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Header — label thumbnail (when present) beside the identity, then
                a date · location stamp beneath the region. */}
            <View style={[styles.header, wine.label_image_path ? styles.headerWithThumb : null]}>
              {wine.label_image_path ? (
                <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.headerThumb} radius={5} frame={0} />
              ) : null}
              <View style={wine.label_image_path ? styles.headerTextCol : undefined}>
                <Text style={[styles.headerLine, wine.label_image_path ? styles.headerLineLeft : null]}>{headerLine}</Text>
                {(wine.region || wine.grape_variety) ? (
                  <Text style={[styles.region, wine.label_image_path ? styles.regionLeft : null]}>{[wine.region, wine.grape_variety].filter(Boolean).join(' · ')}</Text>
                ) : null}
                {(() => {
                  const { restaurantName, city } = splitLocationString(wine.review_location);
                  const loc = [restaurantName, normaliseCity(city)].filter(Boolean).join(', ');
                  const dateStr = wine.review_date
                    ? new Date(wine.review_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                    : '';
                  const stamp = [dateStr, loc].filter(Boolean).join(' · ');
                  return stamp ? <Text style={[styles.stampLine, wine.label_image_path ? styles.stampLineLeft : null]}>{stamp}</Text> : null;
                })()}
              </View>
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
              showLocation={false}
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

      {/* Edit the wine's identity (name / vintage / region / style), the review
          location + date, and the label photo — the same sheet as the restaurant
          review editor, saving to the cellar wine. */}
      <Modal visible={identityEditOpen} transparent animationType="fade" onRequestClose={() => setIdentityEditOpen(false)}>
        <View style={styles.confirmOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.editScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.editSheet}>
              <Text style={styles.confirmTitle}>Edit wine</Text>

              <Text style={styles.editLabel}>Producer</Text>
              <TextInput style={styles.editInput} value={editProducer} onChangeText={setEditProducer} placeholder="Producer" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Wine name</Text>
              <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder="Wine name" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Vintage</Text>
              <TextInput style={styles.editInput} value={editVintage} onChangeText={(t) => setEditVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textSubtle} autoCapitalize="characters" maxLength={7} />

              <Text style={styles.editLabel}>Region</Text>
              <TextInput style={styles.editInput} value={editRegion} onChangeText={setEditRegion} placeholder="Region" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Style</Text>
              <TextInput style={styles.editInput} value={editStyle} onChangeText={setEditStyle} placeholder="e.g. Red, White, Rosé, Sparkling" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Location</Text>
              <TextInput style={styles.editInput} value={editRestaurant} onChangeText={setEditRestaurant} placeholder="Where you drank it" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>City</Text>
              <TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} placeholder="City" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Date</Text>
              <TextInput style={styles.editInput} value={editDate} onChangeText={(t) => setEditDate(t.replace(/[^0-9-]/g, '').slice(0, 10))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSubtle} keyboardType="numbers-and-punctuation" maxLength={10} />

              <Text style={styles.editLabel}>Photo</Text>
              <View style={styles.editThumbRow}>
                {editImageUri ? (
                  <Image source={{ uri: editImageUri }} style={styles.editThumb} />
                ) : (
                  <LabelThumb path={wine.label_image_path ?? null} fallbackText={wine.wine_name} style={styles.editThumb} radius={6} frame={0} />
                )}
                <View style={styles.editPhotoBtns}>
                  <TouchableOpacity style={styles.editPhotoBtn} onPress={() => pickIdentityPhoto('camera')}>
                    <Text style={styles.editPhotoBtnText}>Take Photo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editPhotoBtn} onPress={() => pickIdentityPhoto('library')}>
                    <Text style={styles.editPhotoBtnText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={[styles.confirmButton, savingIdentity && styles.btnDisabled]} onPress={saveIdentity} disabled={savingIdentity}>
                <Text style={styles.confirmButtonText}>{savingIdentity ? 'Saving…' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmCancel} onPress={() => setIdentityEditOpen(false)} disabled={savingIdentity}>
                <Text style={styles.confirmCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

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
  topRight: { alignItems: 'flex-end', gap: 2 },
  topShareText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  topEditText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  header: { alignItems: 'center', marginBottom: spacing.sm },
  headerWithThumb: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerThumb: { width: 52, height: 68 },
  headerTextCol: { flex: 1 },
  headerLineLeft: { textAlign: 'left' },
  regionLeft: { textAlign: 'left' },
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 5, letterSpacing: 0.3 },
  stampLineLeft: { textAlign: 'left' },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm, marginTop: spacing.sm },
  confirmButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.xs },
  confirmCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  editScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  editSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  editLabel: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.sm },
  editInput: { backgroundColor: colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  editThumbRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  editThumb: { width: 72, height: 96 },
  editPhotoBtns: { flex: 1, gap: spacing.sm },
  editPhotoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  editPhotoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
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
