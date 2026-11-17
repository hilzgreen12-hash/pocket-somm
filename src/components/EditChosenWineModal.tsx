import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { launchCamera, launchImageLibrary } from '../utils/imagePicker';
import { uploadLabelImage } from '../api/labelPhotos';
import { LabelThumb } from './LabelThumb';
import { DateInput } from './DateInput';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { AddPhotoThumb } from './AddPhotoThumb';
import { ReviewCardHeader, ReviewedLineEditable } from './ReviewCardHeader';
import { LabelPhotoViewer } from './LabelPhotoViewer';
import { useAttachLabelPhoto } from '../hooks/useAttachLabelPhoto';
import { useQueryClient } from '@tanstack/react-query';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { patchChosenWine, clearChosenReview } from '../api/chosenWines';
import { generateWineIntel } from '../services/pricing';
import { showAlert } from './AppAlert';
import { WineReviewFields } from './WineReviewFields';
import { isoToYmd, ymdToIso } from '../utils/reviewDate';
import { captureCity } from '../utils/captureCity';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { ChosenWine } from '../types/wine';

interface Props {
  wine: ChosenWine | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  // Open straight onto the "Edit wine" identity sheet (producer/name/style/…)
  // rather than the review view. Used by the "Edit Wine" menu action.
  initialIdentityEdit?: boolean;
}

export function EditChosenWineModal({ wine, visible, onClose, onSaved, initialIdentityEdit = false }: Props) {
  const { update, remove } = useChosenWines();
  const { session } = useAuth();
  const qc = useQueryClient();
  const attachPhoto = useAttachLabelPhoto();

  const [userScore, setUserScore] = useState<number | null>(null);
  const [tastingNote, setTastingNote] = useState('');      // Your Review
  const [personalNotes, setPersonalNotes] = useState('');  // Personal Notes (other_observations)
  const [purchasePrice, setPurchasePrice] = useState('');
  const [locCity, setLocCity] = useState('');
  const [locName, setLocName] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [drinkingWindow, setDrinkingWindow] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [estimatedValueAt, setEstimatedValueAt] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [saving, setSaving] = useState(false);
  // Edit-identity sheet (name / vintage / region + thumbnail).
  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRestaurant, setEditRestaurant] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [labelViewerOpen, setLabelViewerOpen] = useState(false);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const currency = (wine?.currency ?? 'GBP').toUpperCase();

  useEffect(() => {
    if (visible && wine) {
      setUserScore(wine.user_score ?? null);
      setTastingNote(wine.tasting_note ?? '');
      setPersonalNotes(wine.other_observations ?? '');
      // Restaurant picks carry the scanned menu price. When the user reviews the
      // bottle later (often without the menu to hand), auto-fill the price from
      // what Vinster stored at scan time rather than leaving it blank.
      setPurchasePrice(
        wine.purchase_price != null
          ? String(wine.purchase_price)
          : wine.menu_price != null ? String(wine.menu_price) : '',
      );
      setLocCity(wine.city ?? '');
      setLocName(wine.restaurant_name ?? '');
      setReviewDate(isoToYmd(wine.chosen_at));
      // Prefill the city from GPS when the review has none yet.
      if (!wine.city) captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
      setDrinkingWindow(wine.user_drinking_window ?? '');
      setEstimatedValue(wine.estimated_value ?? null);
      setEstimatedValueAt(wine.estimated_value_at ?? null);
      // "Edit Wine" entry point opens straight onto the identity sheet.
      if (initialIdentityEdit) openIdentityEdit();
      else setIdentityEditOpen(false);
      // No auto-estimate: Vinster values a review only when the user taps
      // "Generate"; a saved valuation (with its date) is reused above.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, wine?.id]);

  async function fetchEstimate(w: ChosenWine, announce: boolean) {
    if (estimating) return;
    setEstimating(true);
    // Stage 1 — generate the estimate. ONLY a failure here means "couldn't
    // estimate"; the announce alert belongs to this stage alone.
    let intel: Awaited<ReturnType<typeof generateWineIntel>>;
    try {
      intel = await generateWineIntel({
        producer: w.producer ?? '',
        region: w.region ?? '',
        wineName: w.wine_name || null,
        vintage: w.vintage != null ? String(w.vintage) : 'NV',
        style: null,
      } as any, currency);
    } catch (err) {
      if (announce) showAlert({ title: 'Could not estimate', body: err instanceof Error ? err.message : 'Please try again.' });
      setEstimating(false);
      return;
    }
    // The estimate succeeded — show it straight away.
    const at = new Date().toISOString();
    setEstimatedValue(intel.estimatedValue ?? null);
    setEstimatedValueAt(at);
    // Stage 2 — persist. A save hiccup must NOT surface as "could not estimate"
    // (the value is already generated and shown); it'll re-persist on Save.
    try {
      await patchChosenWine(w.id, {
        estimated_value: intel.estimatedValue ?? null,
        estimated_value_currency: currency,
        // Always stamp the attempt (even when no value was found) so we don't
        // re-estimate on every open — the "update" link re-fetches on demand.
        estimated_value_at: at,
        // generateWineIntel is Wine-Searcher-first, so intel.criticScore is the
        // real aggregated score when WS has one — keep it on the review too.
        // (chosen_wines has no critic_score_note column; that's cellar-only.)
        ...(intel.criticScore != null ? { critic_score: intel.criticScore } : {}),
        // Canonical identity anchor when Wine-Searcher matched.
        ...(intel.wsWineId ? { ws_wine_id: intel.wsWineId, ws_wine_name: intel.wsWineName ?? null } : {}),
      });
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
    } catch { /* value shown locally; will persist on Save */ }
    setEstimating(false);
  }

  async function persist() {
    if (!wine) return;
    const parsed = purchasePrice.trim() ? parseFloat(purchasePrice.trim()) : NaN;
    const validPrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
    await update.mutateAsync({
      id: wine.id,
      input: {
        restaurantName: locName.trim(),
        city: locCity.trim(),
        tastingNote,
        otherObservations: personalNotes,
        userScore,
        listPrice: wine.menu_price,
        isFavourite: wine.is_favourite,
        purchasePrice: validPrice,
        purchasePriceCurrency: validPrice != null ? currency : null,
      },
    });
    // user_drinking_window + the review date aren't part of the structured update
    // input, so patch them directly. Only write chosen_at when it actually changed.
    const newIso = reviewDate.trim() && reviewDate !== isoToYmd(wine.chosen_at) ? ymdToIso(reviewDate) : null;
    await patchChosenWine(wine.id, {
      user_drinking_window: drinkingWindow.trim() || null,
      ...(newIso ? { chosen_at: newIso } : {}),
    });
  }

  async function handleSave() {
    if (!wine) return;
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      onSaved();
      onClose();
    } catch (err) {
      showAlert({ title: 'Could not save review', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!wine) return;
    const label = wine.vintage ? `${wine.vintage} ${wine.wine_name}` : wine.wine_name;
    // A restaurant bottle pick (linked to a scan session) should return to
    // "awaiting review" — clear the review content but keep the pick. A
    // standalone review has no such home, so it's removed outright.
    const isBottlePick = !!wine.scan_session_id;
    showAlert({
      title: 'Delete review?',
      body: isBottlePick
        ? `${label}\n\nThis clears your review — the bottle stays in Your Restaurants, awaiting your review.`
        : `${label}\n\nThis permanently removes your review.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete review', style: 'destructive', onPress: () => { void doDelete(isBottlePick); } },
      ],
    });
  }

  async function doDelete(isBottlePick: boolean) {
    if (!wine) return;
    try {
      if (isBottlePick) {
        await clearChosenReview(wine.id);
      } else {
        await remove.mutateAsync(wine.id);
      }
      qc.invalidateQueries({ queryKey: ['chosen-wines', session?.user.id] });
      onSaved(); onClose();
    } catch (err) {
      showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Edit the wine's identity (name / vintage / region) and its label photo.
  function openIdentityEdit() {
    if (!wine) return;
    setEditProducer(wine.producer ?? '');
    setEditName(wine.wine_name ?? '');
    setEditVintage(wine.vintage != null ? String(wine.vintage) : '');
    setEditRegion(wine.region ?? '');
    setEditStyle(wine.style ?? '');
    setEditDate(isoToYmd(wine.chosen_at));
    setEditRestaurant(wine.restaurant_name ?? '');
    setEditCity(wine.city ?? '');
    setEditImageUri(null);
    setIdentityEditOpen(true);
  }

  async function pickIdentityPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await launchCamera({ mediaTypes: ['images'], quality: 1 })
      : await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditImageUri(res.assets[0].uri);
  }

  async function saveIdentity() {
    if (!wine || !session?.user.id) return;
    if (!editName.trim()) { showAlert({ title: 'Wine name needed', body: 'Add at least the wine name.' }); return; }
    setSavingIdentity(true);
    try {
      const vt = editVintage.trim();
      // Non-numeric (e.g. "NV") → null, which renders as "NV" across the app.
      const vintageNum = vt && Number.isFinite(Number(vt)) ? Math.trunc(Number(vt)) : null;
      // Only write chosen_at when the date was actually changed, so an
      // unrelated edit doesn't normalise its time of day to noon.
      const chosenIso = editDate !== isoToYmd(wine.chosen_at) ? ymdToIso(editDate) : null;
      let labelPath: string | undefined;
      if (editImageUri) labelPath = await uploadLabelImage(session.user.id, editImageUri, wine.id);
      await patchChosenWine(wine.id, {
        producer: editProducer.trim() || null,
        wine_name: editName.trim(),
        region: editRegion.trim() || null,
        style: editStyle.trim() || null,
        vintage: vintageNum,
        restaurant_name: editRestaurant.trim() || null,
        city: editCity.trim() || null,
        ...(chosenIso ? { chosen_at: chosenIso } : {}),
        ...(labelPath ? { label_image_path: labelPath } : {}),
      });
      // Keep the (hidden) location state in step so a later "Save Review"
      // writes the edited restaurant/city, not the pre-edit values.
      setLocName(editRestaurant.trim());
      setLocCity(editCity.trim());
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      setIdentityEditOpen(false);
      onSaved();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingIdentity(false);
    }
  }

  if (!wine) return null;

  // No presentationStyle — iOS-only, and it forces a black modal window on
  // Android during the slide-in. iOS is full-screen by default (not transparent).
  return (
    <>
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>

            {/* Top row: just back. Share lives on the wine review page (below
                "+ Add Review"); editing is per-review there, so neither belongs
                on this input screen. */}
            <View style={styles.topRow}>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text accessibilityLabel="Back" style={styles.backText}>←</Text>
              </TouchableOpacity>
            </View>

            {/* Header — the shared review header: a centred "Reviewed <date> ·
                <location>" stamp (live from the fields below), then thumbnail +
                identity, exactly like the cellar wine card. */}
            <ReviewCardHeader
              producer={wine.producer}
              wineName={wine.wine_name}
              vintage={wine.vintage}
              region={wine.region}
              grape={wine.grape}
              thumbnail={wine.label_image_path ? (
                <TouchableOpacity
                  onPress={() => setLabelViewerOpen(true)}
                  onLongPress={() => attachPhoto.present({ kind: 'chosen', wineId: wine.id, producer: wine.producer, wineName: wine.wine_name, hasPhoto: true })}
                  delayLongPress={350}
                  activeOpacity={0.85}
                >
                  <LabelThumb path={wine.label_image_path} fallbackText={wine.wine_name} style={styles.headerThumb} radius={5} frame={0} />
                </TouchableOpacity>
              ) : (
                <AddPhotoThumb
                  style={styles.headerThumb}
                  radius={5}
                  onPress={() => attachPhoto.present({ kind: 'chosen', wineId: wine.id, producer: wine.producer, wineName: wine.wine_name })}
                />
              )}
            />

            <View style={styles.divider} />
            <ReviewedLineEditable date={reviewDate} onDate={setReviewDate} city={locCity} onCity={setLocCity} venue={locName} onVenue={setLocName} currency={currency} />

            {/* Vinster's Review intentionally lives on the wine card / intel, NOT
                in Your Wine Reviews — this screen is the diner's OWN review. */}

            <WineReviewFields
              score={userScore}
              onScore={setUserScore}
              pricePaid={purchasePrice}
              onPricePaid={setPurchasePrice}
              currency={currency}
              estimatedValue={estimatedValue}
              estimatedValueAt={estimatedValueAt}
              estimating={estimating}
              onEstimate={() => fetchEstimate(wine, true)}
              review={tastingNote}
              onReview={setTastingNote}
              personalNotes={personalNotes}
              onPersonalNotes={setPersonalNotes}
              city={locCity}
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={setDrinkingWindow}
              saving={saving || update.isPending}
              onSave={handleSave}
              saveLabel="Save Review"
              goldSave
              onDelete={handleDelete}
              deleteLabel={remove.isPending ? 'Deleting…' : 'Delete this review'}
            />

          </KeyboardAwareScrollView>
        </View>
      </View>

      {/* Edit the wine's identity + label photo */}
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

              <Text style={styles.editLabel}>Restaurant / place</Text>
              <TextInput style={styles.editInput} value={editRestaurant} onChangeText={setEditRestaurant} placeholder="Where you drank it" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>City</Text>
              <TextInput style={styles.editInput} value={editCity} onChangeText={setEditCity} placeholder="City" placeholderTextColor={colors.textSubtle} />

              <Text style={styles.editLabel}>Date</Text>
              <DateInput style={styles.editInput} valueIso={editDate} onChangeIso={setEditDate} currency={currency} placeholderTextColor={colors.textSubtle} />

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

    </Modal>
    {/* Full-screen zoomable viewer — a SIBLING of the edit Modal (nested modals
        fail to present on Android). Opened by tapping the header thumbnail. */}
    <LabelPhotoViewer
      visible={labelViewerOpen}
      path={wine.label_image_path}
      fallbackText={wine.wine_name}
      onClose={() => setLabelViewerOpen(false)}
    />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 56, paddingBottom: 60 },

  backText: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },

  headerThumb: { width: 96, height: 128, borderRadius: 5 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  btnDisabled: { opacity: 0.5 },

  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },

  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
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
});
