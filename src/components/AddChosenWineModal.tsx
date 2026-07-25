import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { showAlert } from './AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { LabelThumb } from './LabelThumb';
import { WineReviewFields } from './WineReviewFields';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { patchChosenWine } from '../api/chosenWines';
import { uploadLabelImage } from '../api/labelPhotos';
import { findExistingReview, appendDatedEntry, todayLabel } from '../utils/reviewDedup';
import { isoToYmd } from '../utils/reviewDate';
import { splitLocationString } from '../services/reviewSync';
import { captureCity } from '../utils/captureCity';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

// Manual-entry counterpart to ChosenWineModal. Used by the +Add link on Your
// Wine Reviews. The wine-identity fields (producer/name/vintage/region) stay
// bespoke; the review body uses the shared WineReviewFields card so it matches
// every other review surface exactly.

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Optional OCR pre-fill so Scan / Upload land on this SAME screen (no wine
  // intel card) with the wine identity already filled in — the only difference
  // from Manual Input is where the details come from.
  initial?: { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null } | null;
  // Local image uri of the scanned/uploaded label (Scan / Upload review flow).
  // When present and the review is newly CREATED, we upload it and stamp
  // chosen_wines.label_image_path so the review card shows the label photo —
  // exactly like a cellar wine card. Null for Manual Input.
  labelImageUri?: string | null;
  // Set when the identity is ALREADY confirmed (e.g. adding a review from Your
  // Label Library). We then present a review CARD — wine name as an editable
  // header, an editable date, and the label thumbnail — instead of the blank
  // manual-entry form. `labelImagePath` is the label's existing stored photo
  // (reused on save, no re-upload) so the review carries the same thumbnail.
  confirmedIdentity?: boolean;
  labelImagePath?: string | null;
}

export function AddChosenWineModal({ visible, onClose, onSaved, initial, labelImageUri, confirmedIdentity = false, labelImagePath = null }: Props) {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { saveManual, update, chosenWines } = useChosenWines();
  const qc = useQueryClient();

  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();

  const [producer, setProducer] = useState('');
  const [wineName, setWineName] = useState('');
  const [vintage, setVintage] = useState('');
  const [region, setRegion] = useState('');
  // Combined "Discovered at" (restaurant + city), split on save.
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [tastingNote, setTastingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [saved, setSaved] = useState(false);
  // Drinking date defaults to today; editable in the identity sheet.
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [style, setStyle] = useState('');
  // Confirmed-identity card: name/region + date·location stamp, edited via a
  // separate identity sheet (mirrors the cellar review card).
  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  async function pickIdentityPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditImageUri(res.assets[0].uri);
  }

  useEffect(() => {
    if (visible) {
      setProducer(initial?.producer ?? '');
      setWineName(initial?.wineName ?? '');
      setVintage(initial?.vintage != null ? String(initial.vintage) : '');
      setRegion(initial?.region ?? '');
      setLocCity(''); setLocName(''); setListPrice(''); setTastingNote(''); setOtherObservations('');
      setUserScore(null); setDrinkingWindow(''); setIsFavourite(false); setSaved(false);
      setReviewDate(new Date().toISOString().split('T')[0]);
      setStyle(''); setEditImageUri(null); setIdentityEditOpen(false);
      // Prefill the city from GPS for a fresh review.
      captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    }
  }, [visible]);

  async function handleSave() {
    if (!session) { showAlert({ title: 'Sign in required', body: 'Sign in to save a review.' }); return; }
    if (!wineName.trim()) { showAlert({ title: 'Wine name needed', body: 'Add at least the wine name before saving.' }); return; }
    Keyboard.dismiss();
    const existing = findExistingReview(chosenWines, { producer, wineName, vintage });
    if (existing) {
      // A bottle pick added from the list starts as an empty row (no note,
      // score or observations). Reviewing it should just fill that row in —
      // not prompt "you've reviewed this before". Mirrors ChosenWineModal.
      const hasContent = !!(
        (existing.tasting_note ?? '').trim() ||
        existing.user_score != null ||
        (existing.other_observations ?? '').trim()
      );
      if (!hasContent) {
        await doSave('update', existing);
        return;
      }
      // Compare LOCAL calendar days (not UTC) so the same-day vs earlier-date
      // prompt is right for non-UTC users near midnight.
      const existingDay = isoToYmd(existing.chosen_at);
      const todayDay = isoToYmd(new Date().toISOString());
      if (existingDay === todayDay) {
        // Same-day duplicate — keep both is allowed (e.g. two bottles that day).
        showAlert({
          title: 'Already in Your Reviews today',
          body: `You already have this wine in Your Reviews on this date. Keep both, replace the existing one, or discard this?`,
          buttons: [
            { text: 'Keep both', onPress: () => { void doSave('create', null); } },
            { text: 'Replace existing', onPress: () => { void doSave('update', existing); } },
            { text: 'Discard', style: 'cancel' },
          ],
        });
      } else {
        const dateLabel = existing.chosen_at ? new Date(existing.chosen_at).toLocaleDateString('en-GB') : 'a previous date';
        showAlert({
          title: "You've reviewed this wine before",
          body: `You reviewed this wine on ${dateLabel}. Would you like to add to that review, update that review, or create a new review card?`,
          buttons: [
            { text: 'Add to that review', onPress: () => { void doSave('append', existing); } },
            { text: 'Update that review', onPress: () => { void doSave('update', existing); } },
            { text: 'Create a new review card', onPress: () => { void doSave('create', null); } },
            { text: 'Cancel', style: 'cancel' },
          ],
        });
      }
      return;
    }
    await doSave('create', null);
  }

  async function doSave(mode: 'create' | 'update' | 'append', existing: ChosenWine | null) {
    if (!session) return;
    const trimmedPrice = listPrice.trim();
    const parsedPrice = trimmedPrice ? parseFloat(trimmedPrice) : NaN;
    const price = Number.isFinite(parsedPrice) ? parsedPrice : null;
    const trimmedVintage = vintage.trim();
    const parsedVintage = trimmedVintage ? parseInt(trimmedVintage, 10) : NaN;
    const vintageNum = Number.isFinite(parsedVintage) ? parsedVintage : null;
    const dw = drinkingWindow.trim() || null;
    const restaurantName = locName.trim();
    const city = locCity.trim();
    try {
      if (mode === 'create' || !existing) {
        const row = await saveManual.mutateAsync({
          wineName, producer, region, vintage: vintageNum,
          restaurantName, city, listPrice: price, currency,
          tastingNote, otherObservations, userScore, isFavourite,
          reviewDate: reviewDate.trim() || null,
          userDrinkingWindow: dw,
          // Hand-entered review → 'other' so it stays in Your Wine Reviews but
          // not under You · Your Restaurants · Bottle Picks.
          source: 'other',
        });
        // Persist any style the user set via the identity sheet.
        if (style.trim() && row?.id) {
          try { await patchChosenWine(row.id, { style: style.trim() }); } catch { /* non-fatal */ }
        }
        // Attach the label photo — a photo picked in the identity sheet wins,
        // else the scanned one, so the review card shows the label like a cellar
        // wine. Best-effort: a failed upload never blocks the save.
        const photoUri = editImageUri ?? labelImageUri;
        if (photoUri && row?.id) {
          try {
            const path = await uploadLabelImage(session.user.id, photoUri, row.id);
            await patchChosenWine(row.id, { label_image_path: path });
            qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          } catch { /* non-fatal — review saved without a photo */ }
        } else if (labelImagePath && row?.id) {
          // From Your Label Library — the photo already lives in storage, so
          // reuse its path rather than re-uploading, so the review card shows
          // the same thumbnail.
          try {
            await patchChosenWine(row.id, { label_image_path: labelImagePath });
            qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          } catch { /* non-fatal — review saved without a photo */ }
        }
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await update.mutateAsync({
            id: existing.id,
            input: { restaurantName, city, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, ...identity },
          });
        } else {
          const label = todayLabel();
          await update.mutateAsync({
            id: existing.id,
            input: {
              restaurantName: existing.restaurant_name ?? '',
              city: existing.city ?? '',
              tastingNote: appendDatedEntry(existing.tasting_note, tastingNote, label),
              otherObservations: appendDatedEntry(existing.other_observations, otherObservations, label),
              userScore: userScore != null ? userScore : existing.user_score,
              listPrice: existing.menu_price,
              isFavourite: existing.is_favourite || isFavourite,
              ...identity,
            },
          });
        }
        // The structured update input doesn't carry the drinking window — patch
        // it onto the existing row, then refresh.
        if (dw !== null) {
          await patchChosenWine(existing.id, { user_drinking_window: dw });
          qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        }
      }
      onSaved();
      setSaved(true);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Clear the "saved" state whenever the user edits a field again.
  function edited<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); if (saved) setSaved(false); };
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.favouriteBtn} onPress={() => setIsFavourite((v) => !v)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
          </TouchableOpacity>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            {confirmedIdentity ? (
              // Review CARD — the wine is already confirmed (from Your Label
              // Library). Mirrors the cellar review card: thumbnail + name/region
              // + date·location stamp, with a top-right "Edit" opening a full
              // identity/photo sheet. Review inputs sit below.
              <>
                <View style={styles.cardTopRow}>
                  <TouchableOpacity onPress={() => setIdentityEditOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }} activeOpacity={0.7}>
                    <Text style={styles.topEditText}>Edit</Text>
                  </TouchableOpacity>
                </View>
                <View style={[styles.cardHeader, (editImageUri || labelImagePath) ? styles.cardHeaderRow : null]}>
                  {editImageUri ? (
                    <Image source={{ uri: editImageUri }} style={styles.headerThumb} resizeMode="cover" />
                  ) : labelImagePath ? (
                    <LabelThumb path={labelImagePath} fallbackText={wineName} style={styles.headerThumb} radius={5} frame={0} />
                  ) : null}
                  <View style={(editImageUri || labelImagePath) ? styles.headerTextCol : undefined}>
                    <Text style={[styles.headerLine, (editImageUri || labelImagePath) ? styles.headerLineLeft : null]}>
                      {[producer, wineName, vintage].filter(Boolean).join(' · ') || wineName || 'This wine'}
                    </Text>
                    {region ? <Text style={[styles.headerRegion, (editImageUri || labelImagePath) ? styles.headerLineLeft : null]}>{region}</Text> : null}
                    {(() => {
                      const loc = [locName.trim(), locCity.trim()].filter(Boolean).join(', ');
                      const dateStr = reviewDate ? new Date(reviewDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                      const stamp = [dateStr, loc].filter(Boolean).join(' · ');
                      return stamp ? <Text style={[styles.stampLine, (editImageUri || labelImagePath) ? styles.headerLineLeft : null]}>{stamp}</Text> : null;
                    })()}
                  </View>
                </View>

                <View style={styles.divider} />
              </>
            ) : (
              <>
                <Text style={styles.heading}>Add a Wine Review</Text>
                <Text style={styles.subheading}>Record a wine you drank — every field is editable.</Text>

                <View style={styles.divider} />

                <Text style={styles.sectionLabel}>The wine</Text>

                {/* Scanned / uploaded label sits to the left of the identity fields,
                    mirroring a cellar wine card. */}
                <View style={labelImageUri ? styles.identityRow : undefined}>
                  {labelImageUri ? (
                    <Image source={{ uri: labelImageUri }} style={styles.identityThumb} resizeMode="cover" />
                  ) : null}
                  <View style={labelImageUri ? styles.identityFields : undefined}>
                    <Text style={styles.fieldLabel}>Producer</Text>
                    <TextInput style={styles.input} value={producer} onChangeText={edited(setProducer)} placeholder="e.g. Domaine Leflaive" placeholderTextColor={colors.textMuted} />

                    <Text style={styles.fieldLabel}>Wine name</Text>
                    <TextInput style={styles.input} value={wineName} onChangeText={edited(setWineName)} placeholder="e.g. Puligny-Montrachet" placeholderTextColor={colors.textMuted} />

                    <Text style={styles.fieldLabel}>Vintage</Text>
                    <TextInput
                      style={styles.input}
                      value={vintage}
                      onChangeText={edited((text: string) => setVintage(text.replace(/[^0-9]/g, '').slice(0, 4)))}
                      placeholder="e.g. 2018"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      maxLength={4}
                    />

                    <Text style={styles.fieldLabel}>Region</Text>
                    <TextInput style={styles.input} value={region} onChangeText={edited(setRegion)} placeholder="e.g. Burgundy" placeholderTextColor={colors.textMuted} />
                  </View>
                </View>

                <View style={styles.divider} />
              </>
            )}

            {/* Shared review card — identical to every other review surface. */}
            <WineReviewFields
              score={userScore}
              onScore={edited(setUserScore)}
              pricePaid={listPrice}
              onPricePaid={edited(setListPrice)}
              currency={currency}
              estimatedValue={null}
              estimatedValueAt={null}
              review={tastingNote}
              onReview={edited(setTastingNote)}
              personalNotes={otherObservations}
              onPersonalNotes={edited(setOtherObservations)}
              city={locCity}
              onCity={edited(setLocCity)}
              locationName={locName}
              onLocationName={edited(setLocName)}
              showLocation={false}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={edited(setDrinkingWindow)}
              saving={saveManual.isPending || update.isPending}
              saved={saved}
              onSave={handleSave}
              saveLabel="Add to Your Wine Reviews"
              savedLabel="Review Saved"
              goldSave
            />
          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Edit the wine's identity, location, date + label photo — the same sheet
          as the cellar review card. Edits the form state directly; the main
          "Add to Your Wine Reviews" save creates the record with these. */}
      {confirmedIdentity ? (
        <Modal visible={identityEditOpen} transparent animationType="fade" onRequestClose={() => setIdentityEditOpen(false)}>
          <View style={styles.confirmOverlay}>
            <KeyboardAwareScrollView contentContainerStyle={styles.editScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
              <View style={styles.editSheet}>
                <Text style={styles.confirmTitle}>Edit wine</Text>

                <Text style={styles.editLabel}>Producer</Text>
                <TextInput style={styles.editInput} value={producer} onChangeText={edited(setProducer)} placeholder="Producer" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Wine name</Text>
                <TextInput style={styles.editInput} value={wineName} onChangeText={edited(setWineName)} placeholder="Wine name" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Vintage</Text>
                <TextInput style={styles.editInput} value={vintage} onChangeText={edited((t: string) => setVintage(t.replace(/[^0-9A-Za-z]/g, '').slice(0, 7)))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textSubtle} autoCapitalize="characters" maxLength={7} />

                <Text style={styles.editLabel}>Region</Text>
                <TextInput style={styles.editInput} value={region} onChangeText={edited(setRegion)} placeholder="Region" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Style</Text>
                <TextInput style={styles.editInput} value={style} onChangeText={edited(setStyle)} placeholder="e.g. Red, White, Rosé, Sparkling" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Location</Text>
                <TextInput style={styles.editInput} value={locName} onChangeText={edited(setLocName)} placeholder="Where you drank it" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>City</Text>
                <TextInput style={styles.editInput} value={locCity} onChangeText={edited(setLocCity)} placeholder="City" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Date</Text>
                <TextInput style={styles.editInput} value={reviewDate} onChangeText={edited((t: string) => setReviewDate(t.replace(/[^0-9-]/g, '').slice(0, 10)))} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textSubtle} keyboardType="numbers-and-punctuation" maxLength={10} />

                <Text style={styles.editLabel}>Photo</Text>
                <View style={styles.editThumbRow}>
                  {editImageUri ? (
                    <Image source={{ uri: editImageUri }} style={styles.editThumb} />
                  ) : (
                    <LabelThumb path={labelImagePath} fallbackText={wineName} style={styles.editThumb} radius={6} frame={0} />
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

                <TouchableOpacity style={styles.confirmButton} onPress={() => setIdentityEditOpen(false)}>
                  <Text style={styles.confirmButtonText}>Done</Text>
                </TouchableOpacity>
              </View>
            </KeyboardAwareScrollView>
          </View>
        </Modal>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  backBtn: { position: 'absolute', top: 56, left: spacing.xl, zIndex: 10, padding: 4 },
  backBtnText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.textMuted },
  favouriteBtn: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, padding: 4 },
  favouriteStar: { fontSize: 30, color: colors.textMuted },
  favouriteStarActive: { color: colors.gold },
  content: { padding: spacing.xl, paddingTop: 64, paddingBottom: 60 },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 21 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm,
    fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  identityRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  identityThumb: { width: 60, height: 80, borderRadius: 6, backgroundColor: colors.surface },
  identityFields: { flex: 1 },
  cardHeader: { alignItems: 'center', marginBottom: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerThumb: { width: 52, height: 68 },
  headerTextCol: { flex: 1 },
  headerLine: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  headerLineLeft: { textAlign: 'left' },
  headerRegion: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: 2 },
  editIdentityRow: { alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.xs },
  editIdentityLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.xs },
  topEditText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 5, letterSpacing: 0.3 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  confirmButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
  editScroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.xl },
  editSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  editLabel: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs, marginTop: spacing.sm },
  editInput: { backgroundColor: colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  editThumbRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  editThumb: { width: 72, height: 96 },
  editPhotoBtns: { flex: 1, gap: spacing.sm },
  editPhotoBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  editPhotoBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
});
