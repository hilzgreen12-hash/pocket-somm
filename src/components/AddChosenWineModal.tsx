import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Image, ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { useQueryClient } from '@tanstack/react-query';
import { showAlert } from './AppAlert';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { LabelThumb } from './LabelThumb';
import { DateInput } from './DateInput';
import { LabelPhotoViewer } from './LabelPhotoViewer';
import { WineIdentityHeader } from './WineIdentityHeader';
import { ReviewCardHeader } from './ReviewCardHeader';
import { WineReviewFields } from './WineReviewFields';
import { WineSearchInput } from './WineSearchInput';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { usePreferences } from '../hooks/usePreferences';
import { patchChosenWine } from '../api/chosenWines';
import { uploadLabelImage } from '../api/labelPhotos';
import { generateWineIntel } from '../services/pricing';
import { fetchAutoLabelUri } from '../api/label';
import { findExistingReview } from '../utils/reviewDedup';
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
  initial?: { producer?: string | null; wineName?: string | null; vintage?: string | number | null; region?: string | null; grape?: string | null; listPrice?: number | null; date?: string | null } | null;
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
  // Which collection this review belongs to — set by the "Add a Wine Review"
  // chooser (Restaurant Wine vs Other Wine). Both live on chosen_wines and are
  // distinguished by the `source` column; defaults to 'other' for a hand-entered
  // review that isn't tied to a restaurant visit.
  source?: 'restaurant' | 'other';
  // Set from a review card's "+ Add Review": this is a new dated entry on an
  // EXISTING review. We append to this review_group_id and skip the "you've
  // reviewed this before" prompt (the user already knows — they're on its card).
  addToGroupId?: string | null;
  // Present only when the modal was reached by scanning/uploading a label — a
  // "Scan again" link re-runs the capture so a bad OCR read can be redone.
  onScanAgain?: () => void;
}

export function AddChosenWineModal({ visible, onClose, onSaved, initial, labelImageUri, confirmedIdentity = false, labelImagePath = null, source = 'other', addToGroupId = null, onScanAgain }: Props) {
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const { saveManual, update, chosenWines } = useChosenWines();
  const qc = useQueryClient();

  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();

  const [producer, setProducer] = useState('');
  const [wineName, setWineName] = useState('');
  const [vintage, setVintage] = useState('');
  const [region, setRegion] = useState('');
  const [grape, setGrape] = useState('');
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
  // Tracks whether the user has typed/picked anything not yet saved, so backing
  // out of a half-written review prompts to save rather than losing it silently.
  const [dirty, setDirty] = useState(false);
  // Estimated Value — generated on demand (Wine-Searcher-first) and persisted
  // onto the new review row when it's saved.
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [estimatedValueAt, setEstimatedValueAt] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [findingLabel, setFindingLabel] = useState(false);
  // Drinking date defaults to today; editable in the identity sheet.
  const [reviewDate, setReviewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [style, setStyle] = useState('');
  // Confirmed-identity card: name/region + date·location stamp, edited via a
  // separate identity sheet (mirrors the cellar review card).
  const [identityEditOpen, setIdentityEditOpen] = useState(false);
  // Manual entry: once the user confirms the wine (name + vintage) with the tick,
  // the typed fields collapse into the SAME review card the Label-Library flow
  // shows (title as text, thumbnail area, date · location stamp). `showCard`
  // unifies that with the prop-driven confirmed identity.
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const showCard = confirmedIdentity || identityConfirmed;
  // A wine picked from the predictive search: Vinster has filled the identity,
  // so we show the wine name large across the screen and ask ONLY for the
  // vintage — the producer/name/region inputs (and the review fields below) stay
  // hidden until the wine is confirmed. Makes it clear the pick was applied.
  const [searchPicked, setSearchPicked] = useState(false);
  // After a predictive-search pick fills a long producer/name, single-line
  // inputs scroll to the END. Setting the selection to the start (once) snaps
  // them back so the value reads from its beginning; cleared on first focus/edit.
  const [justFilled, setJustFilled] = useState(false);
  // Full-screen label viewer — the thumbnail enlarges on a short press.
  const [labelViewerOpen, setLabelViewerOpen] = useState(false);
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  async function pickIdentityPhoto(source: 'camera' | 'library') {
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    const res = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setEditImageUri(res.assets[0].uri);
  }

  // Photo chooser for the confirmed review card's thumbnail area.
  function openPhotoChooser() {
    showAlert({
      title: 'Add a Label',
      body: 'Add a label photo to this review.',
      buttons: [
        { text: 'Scan a Label', onPress: () => setTimeout(() => pickIdentityPhoto('camera'), 300) },
        { text: 'Upload', onPress: () => setTimeout(() => pickIdentityPhoto('library'), 300) },
        { text: 'Find Online', onPress: () => setTimeout(() => void findLabelOnline(), 300) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // "Find Online" — fetch a web label photo for the current producer/wine.
  async function findLabelOnline() {
    if (!producer.trim() && !wineName.trim()) { showAlert({ title: 'Wine details needed', body: 'Add a producer or wine name first.' }); return; }
    setFindingLabel(true);
    try {
      const uri = await fetchAutoLabelUri(producer.trim(), wineName.trim());
      if (uri) setEditImageUri(uri);
      else showAlert({ title: 'No label found', body: "Vinster couldn't find a label photo online for this wine." });
    } catch {
      showAlert({ title: 'Could not search', body: 'Please try again.' });
    } finally {
      setFindingLabel(false);
    }
  }

  // Manual-entry "Confirm Wine" tick: validate name + vintage (prompting for a
  // missing vintage, or NV), then collapse the typed fields into the review card.
  function confirmIdentity() {
    // Wine name is optional — a flagship sold under the producer's own name
    // (e.g. Château Lafite Rothschild) needs only the producer. Require one of them.
    if (!wineName.trim() && !producer.trim()) { showAlert({ title: 'Wine details needed', body: 'Add at least a producer or a wine name to confirm.' }); return; }
    const vt = vintage.trim();
    const validYear = /^\d{4}$/.test(vt) && Number(vt) >= 1800 && Number(vt) <= new Date().getFullYear() + 1;
    const isNV = /^nv$/i.test(vt);
    if (!validYear && !isNV) {
      showAlert({
        title: 'Add a vintage',
        body: 'Every review needs a vintage. Enter the four-digit year, or confirm this wine is non-vintage.',
        buttons: [
          { text: 'Confirm non-vintage', onPress: () => { setVintage('NV'); Keyboard.dismiss(); setIdentityConfirmed(true); } },
          { text: 'Add a vintage', style: 'cancel' },
        ],
      });
      return;
    }
    Keyboard.dismiss();
    setIdentityConfirmed(true);
  }

  // Generate an Estimated Value on demand from the current identity fields.
  // Held locally and written onto the row when the review is saved.
  async function fetchEstimate() {
    if (estimating) return;
    if (!wineName.trim() && !producer.trim()) { showAlert({ title: 'Wine details needed', body: 'Add a producer or wine name before estimating a value.' }); return; }
    setEstimating(true);
    try {
      const intel = await generateWineIntel({
        producer: producer.trim(),
        region: region.trim(),
        wineName: wineName.trim() || null,
        vintage: vintage.trim() || 'NV',
        style: style.trim() || null,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any, currency);
      setEstimatedValue(intel.estimatedValue ?? null);
      setEstimatedValueAt(new Date().toISOString());
      if (intel.estimatedValue == null) {
        showAlert({ title: 'No value found', body: "Vinster couldn't find a market value for this wine just now." });
      }
    } catch (err) {
      showAlert({ title: 'Could not estimate', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setEstimating(false);
    }
  }

  useEffect(() => {
    if (visible) {
      setProducer(initial?.producer ?? '');
      setWineName(initial?.wineName ?? '');
      setVintage(initial?.vintage != null ? String(initial.vintage) : '');
      setRegion(initial?.region ?? '');
      setGrape(initial?.grape ?? '');
      setLocCity(''); setLocName(''); setTastingNote(''); setOtherObservations('');
      // Carry the scanned/stored menu price through so the user doesn't have to
      // re-enter it when reviewing a restaurant wine after the fact.
      setListPrice(initial?.listPrice != null ? String(initial.listPrice) : '');
      setUserScore(null); setDrinkingWindow(''); setIsFavourite(false); setSaved(false); setDirty(false);
      // Default the review date to when the label was scanned (e.g. reviewing a
      // wine from the Label Library), falling back to today. Still editable.
      setReviewDate((initial?.date && /^\d{4}-\d{2}-\d{2}$/.test(initial.date)) ? initial.date : new Date().toISOString().split('T')[0]);
      setStyle(''); setEditImageUri(null); setIdentityEditOpen(false);
      setIdentityConfirmed(false); setJustFilled(false); setSearchPicked(false);
      setEstimatedValue(null); setEstimatedValueAt(null); setEstimating(false);
      // Prefill the city from GPS for a fresh review.
      captureCity().then((c) => { if (c) setLocCity((cur) => cur || c); });
    }
  }, [visible]);

  async function handleSave() {
    if (!session) { showAlert({ title: 'Sign in required', body: 'Sign in to save a review.' }); return; }
    if (!wineName.trim() && !producer.trim()) { showAlert({ title: 'Wine details needed', body: 'Add at least a producer or a wine name before saving.' }); return; }
    Keyboard.dismiss();
    // Hard requirements FIRST — a review can't be saved without a date, a
    // location (city) and a score. Checked BEFORE the vintage prompt so the
    // "Confirm non-vintage" path (which calls proceedSave directly) can't
    // bypass them. (A written note stays optional.)
    const need: string[] = [];
    if (!reviewDate.trim()) need.push('a date');
    if (!locCity.trim()) need.push('a location');
    if (userScore == null) need.push('a score');
    if (need.length) {
      showAlert({ title: 'A bit more needed', body: `Please add ${need.join(', ')} before saving your review.` });
      return;
    }
    // Every review must record a vintage. Accept a four-digit year or an
    // explicit "NV"; anything else is either a typo (block) or blank (confirm
    // the wine really is non-vintage rather than saving an unknown silently).
    const vt = vintage.trim();
    const validYear = /^\d{4}$/.test(vt) && Number(vt) >= 1800 && Number(vt) <= new Date().getFullYear() + 1;
    const isNV = /^nv$/i.test(vt);
    if (!validYear && !isNV) {
      if (vt === '') {
        showAlert({
          title: 'Add a vintage',
          body: 'Every review needs a vintage. Enter the four-digit year, or confirm this wine is non-vintage.',
          buttons: [
            { text: 'Confirm non-vintage', onPress: () => { setVintage('NV'); void proceedSave(); } },
            { text: 'Add a vintage', style: 'cancel' },
          ],
        });
      } else {
        showAlert({ title: 'Check the vintage', body: 'A vintage must be a four-digit year, e.g. 2023 — or NV for a non-vintage wine.' });
      }
      return;
    }
    await proceedSave();
  }

  async function proceedSave() {
    // Review-card "+ Add Review": append straight onto that review's group — no
    // dedup prompt, the user is explicitly adding to a review they can see.
    if (addToGroupId) {
      await doSave('append', null);
      return;
    }
    const existing = findExistingReview(chosenWines, { producer, wineName, vintage });
    if (existing) {
      // A bottle pick added from the list starts as an empty row (no note,
      // score or observations). Reviewing it just fills that row in — the FIRST
      // review, not an edit of a prior one. Mirrors ChosenWineModal.
      const hasContent = !!(
        (existing.tasting_note ?? '').trim() ||
        existing.user_score != null ||
        (existing.other_observations ?? '').trim()
      );
      if (!hasContent) {
        await doSave('update', existing);
        return;
      }
      const dateLabel = existing.chosen_at ? new Date(existing.chosen_at).toLocaleDateString('en-GB') : 'a previous date';
      showAlert({
        title: "You've reviewed this wine before",
        body: `You reviewed this wine on ${dateLabel}. Add this as a new dated entry on that review, or start a separate new review?`,
        buttons: [
          { text: 'Add to that review', onPress: () => { void doSave('append', existing); } },
          { text: 'Create a new review', onPress: () => { void doSave('create', null); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
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
      if (mode === 'update' && existing) {
        // Bare, unreviewed bottle pick — fill its first review in place (this
        // stamps reviewed_at and starts the 24h window).
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        await update.mutateAsync({
          id: existing.id,
          input: { restaurantName, city, tastingNote, otherObservations, userScore, listPrice: price, isFavourite, ...identity },
        });
        if (dw !== null) {
          await patchChosenWine(existing.id, { user_drinking_window: dw });
          qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
        }
        if (estimatedValue != null) {
          try { await patchChosenWine(existing.id, { estimated_value: estimatedValue, estimated_value_currency: currency, estimated_value_at: estimatedValueAt }); } catch { /* non-fatal */ }
        }
      } else {
        // create OR append. "Add to this review" (append) = a NEW dated entry
        // that joins the existing review's card via its review_group_id.
        const row = await saveManual.mutateAsync({
          wineName, producer, region, vintage: vintageNum,
          restaurantName, city, listPrice: price, currency,
          tastingNote, otherObservations, userScore, isFavourite,
          reviewDate: reviewDate.trim() || null,
          userDrinkingWindow: dw,
          // Collection tag from the "Add a Wine Review" chooser: 'restaurant'
          // (drunk at a restaurant) or 'other' (a tasting, event, or at home).
          source,
          ...(mode === 'append' ? { reviewGroupId: addToGroupId ?? existing?.review_group_id ?? existing?.id ?? null } : {}),
        });
        // Persist any style the user set via the identity sheet.
        if (style.trim() && row?.id) {
          try { await patchChosenWine(row.id, { style: style.trim() }); } catch { /* non-fatal */ }
        }
        // Persist a generated Estimated Value onto the new row.
        if (estimatedValue != null && row?.id) {
          try { await patchChosenWine(row.id, { estimated_value: estimatedValue, estimated_value_currency: currency, estimated_value_at: estimatedValueAt }); } catch { /* non-fatal */ }
        }
        // Attach the label photo — a photo picked in the identity sheet wins,
        // else the scanned one. Best-effort: a failed upload never blocks save.
        const photoUri = editImageUri ?? labelImageUri;
        if (photoUri && row?.id) {
          try {
            const path = await uploadLabelImage(session.user.id, photoUri, row.id);
            await patchChosenWine(row.id, { label_image_path: path });
            qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          } catch { /* non-fatal — review saved without a photo */ }
        } else if (labelImagePath && row?.id) {
          try {
            await patchChosenWine(row.id, { label_image_path: labelImagePath });
            qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
          } catch { /* non-fatal — review saved without a photo */ }
        }
      }
      onSaved();
      setSaved(true);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Clear the "saved" state whenever the user edits a field again, and mark the
  // review dirty so backing out prompts to save.
  function edited<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setDirty(true); if (saved) setSaved(false); };
  }

  // Guard against silently losing an in-progress review (the reported bug: a
  // half-written review vanished after leaving the page). If anything's been
  // entered and not saved, confirm on Back.
  function handleBack() {
    if (dirty && !saved) {
      showAlert({
        title: 'Save this review?',
        body: "You've started a review but haven't saved it. Save it so you can finish later, or discard it?",
        buttons: [
          { text: 'Save', onPress: () => { void handleSave(); } },
          { text: 'Discard', style: 'destructive', onPress: onClose },
          { text: 'Keep editing', style: 'cancel' },
        ],
      });
      return;
    }
    onClose();
  }

  // No presentationStyle on the Modal: it's iOS-only and forces a black modal
  // window on Android during the slide-in ("screen turns black while loading").
  // Not transparent, so iOS already presents full-screen by default.
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleBack}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <TouchableOpacity style={styles.backBtn} onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
            <Text accessibilityLabel="Back" style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            {showCard ? (
              // Review CARD — the wine is confirmed (from Your Label Library, or
              // via the manual "Confirm Wine" tick). Mirrors the cellar review
              // card: thumbnail + name/region + date·location stamp, with a
              // top-right "Edit" opening a full identity/photo sheet.
              <>
                {/* Adding to an existing review — the wine is fixed, so no Edit
                    affordance (edit the wine from its card, not here). */}
                {addToGroupId ? null : (
                  <View style={styles.cardTopRow}>
                    <TouchableOpacity onPress={() => setIdentityEditOpen(true)} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }} activeOpacity={0.7}>
                      <Text style={styles.topEditText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <ReviewCardHeader
                  producer={producer}
                  wineName={wineName}
                  vintage={vintage}
                  region={region}
                  grape={grape}
                  dateIso={reviewDate}
                  location={[locName.trim(), locCity.trim()].filter(Boolean).join(', ')}
                  thumbnail={(() => {
                    // A retaken photo, else the local scanned-label uri carried in
                    // from Scan → Review (labelImageUri), else a stored label path,
                    // else the "+ Photo" placeholder. The scan uri was previously
                    // omitted here, so a fresh scan showed the empty placeholder
                    // even though its label uploads fine on save.
                    const uri = editImageUri ?? labelImageUri;
                    return uri ? (
                      <TouchableOpacity onPress={openPhotoChooser} activeOpacity={0.85}>
                        <Image source={{ uri }} style={styles.headerThumb} resizeMode="cover" />
                      </TouchableOpacity>
                    ) : labelImagePath ? (
                      <TouchableOpacity onPress={openPhotoChooser} activeOpacity={0.85}>
                        <LabelThumb path={labelImagePath} fallbackText={wineName} style={styles.headerThumb} radius={5} frame={0} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={openPhotoChooser} activeOpacity={0.8} style={styles.headerThumbAdd}>
                        <Text style={styles.headerThumbAddIcon}>＋</Text>
                        <Text style={styles.headerThumbAddText}>Photo</Text>
                      </TouchableOpacity>
                    );
                  })()}
                />

                <View style={styles.divider} />
              </>
            ) : (
              <>
                <Text style={styles.heading}>Add a Wine Review</Text>

                <View style={styles.divider} />

                {/* Predictive search — type the wine and pick a real match to fill
                    the fields below (vintage stays yours to enter). Manual typing
                    still works. Hidden when a label photo already sourced these. */}
                {!labelImageUri ? (
                  <WineSearchInput onSelect={(r) => {
                    setProducer(r.producer ?? '');
                    setWineName(r.wineName ?? '');
                    setRegion(r.region ?? '');
                    if (r.style) setStyle(r.style);
                    if (r.grape) setGrape(r.grape);
                    // A vintage typed into the search ("… 2009") fills the vintage.
                    if (r.vintage) setVintage(r.vintage);
                    // A search pick fills the identity — collapse to the "name +
                    // vintage only" prompt so it's clear Vinster filled it in.
                    setSearchPicked(true);
                    setJustFilled(true);
                    setDirty(true);
                    if (saved) setSaved(false);
                  }} />
                ) : null}

                {searchPicked ? (
                  // A wine was picked from the search bar: show its name on a line
                  // below the search bar, then an "Add Vintage" prompt with a
                  // single field. The rest of the identity fields stay hidden.
                  <>
                    <Text style={styles.pickedNameLine}>{[producer, wineName].filter(Boolean).join(' ') || 'Selected wine'}</Text>
                    <View style={styles.pickedVintageRow}>
                      <Text style={styles.pickedVintageLabel}>Add Vintage:</Text>
                      <TextInput
                        style={styles.pickedVintageInput}
                        value={vintage}
                        onChangeText={edited((t: string) => setVintage(t.replace(/[^0-9A-Za-z]/g, '').slice(0, 7)))}
                        placeholder="e.g. 2019 or NV"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={7}
                        returnKeyType="done"
                        onSubmitEditing={confirmIdentity}
                      />
                    </View>
                    <TouchableOpacity style={styles.confirmIdentityBtn} onPress={confirmIdentity} activeOpacity={0.85}>
                      <Text style={styles.confirmIdentityText}>✓  Confirm Wine</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    {/* Manual entry — a gold prompt matching "Search your wine",
                        sitting above the identity fields. */}
                    {!labelImageUri ? <Text style={styles.inputYourWineLabel}>Or, Input your wine</Text> : null}

                    {/* Scanned / uploaded label sits to the left of the identity
                        fields, mirroring a cellar wine card. */}
                    <View style={labelImageUri ? styles.identityRow : undefined}>
                      {labelImageUri ? (
                        <TouchableOpacity onPress={() => setLabelViewerOpen(true)} activeOpacity={0.85}>
                          <Image source={{ uri: labelImageUri }} style={styles.identityThumb} resizeMode="cover" />
                        </TouchableOpacity>
                      ) : null}
                      {/* Identity fields as inline, borderless text (not boxed
                          inputs) so they read like the wine's own line. */}
                      <View style={labelImageUri ? styles.identityFields : undefined}>
                        <TextInput style={styles.inputInline} value={producer} onChangeText={edited(setProducer)} placeholder="Producer" placeholderTextColor={colors.textMuted} selection={justFilled ? { start: 0, end: 0 } : undefined} onFocus={() => setJustFilled(false)} />
                        <TextInput style={styles.inputInline} value={wineName} onChangeText={edited(setWineName)} placeholder="Wine name (optional)" placeholderTextColor={colors.textMuted} selection={justFilled ? { start: 0, end: 0 } : undefined} onFocus={() => setJustFilled(false)} />
                        <TextInput
                          style={styles.inputInline}
                          value={vintage}
                          onChangeText={edited((text: string) => setVintage(text.replace(/[^0-9]/g, '').slice(0, 4)))}
                          placeholder="Vintage"
                          placeholderTextColor={colors.textMuted}
                          keyboardType="numeric"
                          maxLength={4}
                        />
                        <TextInput style={styles.inputInline} value={region} onChangeText={edited(setRegion)} placeholder="Region" placeholderTextColor={colors.textMuted} selection={justFilled ? { start: 0, end: 0 } : undefined} onFocus={() => setJustFilled(false)} />
                      </View>
                    </View>

                    {/* Reached via scan/upload — let the user redo a bad read. */}
                    {onScanAgain && labelImageUri ? (
                      <TouchableOpacity onPress={onScanAgain} activeOpacity={0.7} style={styles.scanAgainRow}>
                        <Text style={styles.scanAgainLink}>Scan again</Text>
                      </TouchableOpacity>
                    ) : null}

                    {/* Confirm the wine (manual entry) → collapse into the review
                        card. Prompts for a vintage if one's missing. */}
                    {!labelImageUri ? (
                      <TouchableOpacity style={styles.confirmIdentityBtn} onPress={confirmIdentity} activeOpacity={0.85}>
                        <Text style={styles.confirmIdentityText}>✓  Confirm Wine</Text>
                      </TouchableOpacity>
                    ) : null}
                  </>
                )}

                <View style={styles.divider} />
              </>
            )}

            {/* Shared review card — identical to every other review surface.
                Hidden during the search-picked "add the vintage" step so only
                the vintage prompt shows; it returns once the wine is confirmed. */}
            {searchPicked && !showCard ? null : (
            <WineReviewFields
              score={userScore}
              onScore={edited(setUserScore)}
              pricePaid={listPrice}
              onPricePaid={edited(setListPrice)}
              currency={currency}
              estimatedValue={estimatedValue}
              estimatedValueAt={estimatedValueAt}
              estimating={estimating}
              onEstimate={fetchEstimate}
              review={tastingNote}
              onReview={edited(setTastingNote)}
              personalNotes={otherObservations}
              onPersonalNotes={edited(setOtherObservations)}
              date={reviewDate}
              onDate={edited((t: string) => setReviewDate(t.replace(/[^0-9-]/g, '').slice(0, 10)))}
              city={locCity}
              onCity={edited(setLocCity)}
              locationName={locName}
              onLocationName={edited(setLocName)}
              showLocation
              drinkingWindow={drinkingWindow}
              onDrinkingWindow={edited(setDrinkingWindow)}
              saving={saveManual.isPending || update.isPending}
              saved={saved}
              onSave={handleSave}
              saveLabel="Add to Your Wine Reviews"
              savedLabel="Review Saved"
              goldSave
            />
            )}
          </KeyboardAwareScrollView>
        </View>
        {findingLabel ? (
          <View style={styles.findingOverlay} pointerEvents="auto">
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.findingText}>Finding a label…</Text>
          </View>
        ) : null}
      </View>

      {/* Enlarge the label photo on a short press of the thumbnail. */}
      <LabelPhotoViewer visible={labelViewerOpen} uri={labelImageUri} fallbackText={wineName} onClose={() => setLabelViewerOpen(false)} />

      {/* Edit the wine's identity, location, date + label photo — the same sheet
          as the cellar review card. Edits the form state directly; the main
          "Add to Your Wine Reviews" save creates the record with these. */}
      {showCard ? (
        <Modal visible={identityEditOpen} transparent animationType="fade" onRequestClose={() => setIdentityEditOpen(false)}>
          <View style={styles.confirmOverlay}>
            <KeyboardAwareScrollView contentContainerStyle={styles.editScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
              <View style={styles.editSheet}>
                <Text style={styles.confirmTitle}>Edit wine</Text>

                <Text style={styles.editLabel}>Producer</Text>
                <TextInput style={styles.editInput} value={producer} onChangeText={edited(setProducer)} placeholder="Producer" placeholderTextColor={colors.textSubtle} />

                <Text style={styles.editLabel}>Wine name (optional)</Text>
                <TextInput style={styles.editInput} value={wineName} onChangeText={edited(setWineName)} placeholder="Wine name (optional)" placeholderTextColor={colors.textSubtle} />

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
                <DateInput style={styles.editInput} valueIso={reviewDate} onChangeIso={edited(setReviewDate)} currency={currency} placeholderTextColor={colors.textSubtle} />

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
  backBtnText: { fontFamily: fonts.bodyRegular, fontSize: 22, color: colors.gold },
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
  // Larger label thumbnail — tap to enlarge full-screen.
  identityThumb: { width: 112, height: 150, borderRadius: 8, backgroundColor: colors.surface },
  identityFields: { flex: 1, justifyContent: 'center' },
  // Inline, borderless identity fields — read like the wine's own line, with a
  // faint underline to hint they're editable (vs the clunky boxed inputs).
  inputInline: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm },
  // Search-picked: the filled wine name on a line below the search bar (prominent),
  // then a compact inline "Add Vintage:" prompt with the input on the same line.
  pickedNameLine: { fontFamily: fonts.headingSemibold, fontSize: 19.5, color: colors.text, marginTop: spacing.md, letterSpacing: 0.3 },
  pickedVintageRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  pickedVintageLabel: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, letterSpacing: 0.5 },
  pickedVintageInput: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md, fontSize: 18,
    fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface,
  },
  // "Or, Input your wine" — gold prompt above the manual identity fields, styled
  // to match WineSearchInput's "Search your wine" label.
  inputYourWineLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: spacing.md, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  // "Scan again" — gold link, shown when the review was reached via scan/upload.
  scanAgainRow: { alignItems: 'center', paddingVertical: spacing.sm },
  scanAgainLink: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textDecorationLine: 'underline' },
  cardHeader: { alignItems: 'center', marginBottom: spacing.sm },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerThumb: { width: 96, height: 128, borderRadius: 5 },
  // Tappable "add photo" placeholder in the confirmed-card thumbnail slot.
  headerThumbAdd: { width: 96, height: 128, borderRadius: 5, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', gap: 4 },
  headerThumbAddIcon: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.gold },
  headerThumbAddText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold },
  // "Add your location" — gold link in the date stamp when no location is set.
  addLocationLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  // Manual-entry "Confirm Wine" tick — outline, gold (no filled buttons).
  confirmIdentityBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  confirmIdentityText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  headerTextCol: { flex: 1 },
  headerLine: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, textAlign: 'center', letterSpacing: 0.3 },
  headerLineLeft: { textAlign: 'left' },
  headerRegion: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginTop: 2 },
  editIdentityRow: { alignItems: 'center', paddingVertical: spacing.xs, marginBottom: spacing.xs },
  editIdentityLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  // Edit (top) and the favourite star stacked at the top-right, right-aligned,
  // with a gap between them so the star never overlays the Edit link.
  cardTopRow: { alignItems: 'flex-end', marginBottom: spacing.xs, gap: spacing.sm },
  topEditText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3 },
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, textAlign: 'center', marginTop: 5, letterSpacing: 0.3 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  findingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  findingText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, letterSpacing: 0.3 },
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
