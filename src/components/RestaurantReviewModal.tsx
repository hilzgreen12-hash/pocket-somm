import { useRef, useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share, ActivityIndicator, ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../utils/shareCard';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { addSessionBottle, patchChosenWine } from '../api/chosenWines';
import { archiveCellarWine } from '../api/cellar';
import { uploadLabelImage } from '../api/labelPhotos';
import { prepareImageBase64, detectLineup } from '../api/label';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { useCellar } from '../hooks/useCellar';
import { useAuth } from '../hooks/useAuth';
import { publishRestaurantSessionToCommunity } from '../services/communityPublish';
import { StarRating } from './StarRating';
import { RestaurantReviewShareCard } from './RestaurantReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { COMMUNITY_ENABLED } from '../constants/features';
import { showAlert } from './AppAlert';
import { MicButton } from './MicButton';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

interface WineLine {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
  userScore: number | null;
  // 'other' = brought to the visit (Off-List); anything else = chosen off the
  // restaurant's list (List Bottle). Undefined from legacy callers → List.
  source?: string | null;
  // Whether this wine already carries a review (drives Add vs View/Edit).
  reviewed?: boolean;
}

interface Props {
  visible: boolean;
  sessionId: string;
  initialName?: string | null;
  initialNote?: string | null;
  initialRatings?: { food: number | null; service: number | null; wineList: number | null; overall: number | null; value: number | null } | null;
  initialFavourite?: boolean;
  // Read-only context shown at the top of the card, mirroring the wine
  // review page's header: where/when the visit was, all pre-filled by
  // Vinster from the scan, and which wine(s) were chosen.
  city?: string | null;
  date?: string | null;
  wines?: WineLine[];
  // Opens the per-wine review (ChosenWineModal) for the picked wine at this
  // index. Wired by the results screen; absent when there's nothing to link.
  onReviewWine?: (index: number) => void;
  // Opens Wine Intel for the wine at this index (parent closes the modal and
  // navigates — same reason onReviewWine is a callback, not done inline).
  onViewIntel?: (index: number) => void;
  // Permanently delete the wine at this index from the visit.
  onDeleteWine?: (index: number) => void;
  onClose: () => void;
  // Reports the saved name + city back so callers (e.g. the List results
  // card) can reflect edits without refetching.
  onSaved: (details?: { name: string | null; city: string | null }) => void;
}

export function RestaurantReviewModal({
  visible, sessionId, initialName, initialNote, initialRatings, initialFavourite,
  city, date, wines, onReviewWine, onViewIntel, onDeleteWine, onClose, onSaved,
}: Props) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { wines: cellarWines } = useCellar();
  // Restaurant identity — prefilled from the scan but editable here so the
  // user can correct the name or place while saving their review.
  const [restaurantName, setRestaurantName] = useState((initialName ?? '').trim());
  const [cityValue, setCityValue] = useState((city ?? '').trim());
  const [note, setNote] = useState(initialNote ?? '');
  const [overall, setOverall] = useState<number | null>(initialRatings?.overall ?? null);
  const [food, setFood] = useState<number | null>(initialRatings?.food ?? null);
  const [wineList, setWineList] = useState<number | null>(initialRatings?.wineList ?? null);
  const [service, setService] = useState<number | null>(initialRatings?.service ?? null);
  const [value, setValue] = useState<number | null>(initialRatings?.value ?? null);
  const [isFavourite, setIsFavourite] = useState(initialFavourite ?? false);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [posting, setPosting] = useState(false);
  const shareCardRef = useRef<View>(null);

  // --- Add a Bottle: ONE flow, four ways in (Cellar / Upload / Scan / Manual),
  // all landing on a confirm-details sheet. Whether it's a "List Bottle" (off
  // the restaurant's list) or an "Off-List Bottle" (brought along) is INFERRED,
  // not asked up front — a wine picked from your own cellar is one you brought;
  // scanned/manual ones default to "off the list" with a single "I brought this"
  // toggle on the confirm sheet to correct it. ---
  const [bottleChooserOpen, setBottleChooserOpen] = useState(false);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [cellarSearch, setCellarSearch] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bottleBusy, setBottleBusy] = useState(false);
  const [cbProducer, setCbProducer] = useState('');
  const [cbWineName, setCbWineName] = useState('');
  const [cbRegion, setCbRegion] = useState('');
  const [cbColour, setCbColour] = useState('');
  const [cbVintage, setCbVintage] = useState('');
  // "I brought this" — off the restaurant's list. Pre-set true for cellar picks.
  const [cbBrought, setCbBrought] = useState(false);
  // Set when this bottle was picked from the cellar, so after adding we can
  // offer to move that cellar wine to the archive. Null for scan/upload/manual.
  const [cbCellarWineId, setCbCellarWineId] = useState<string | null>(null);
  // Local uri of a scanned/uploaded label for a SINGLE bottle — saved onto the
  // review row so its card shows the photo, like a cellar wine card.
  const [cbImageUri, setCbImageUri] = useState<string | null>(null);
  // Multi-bottle add: a photo with several bottles opens a tick-list to confirm
  // which to add (mirrors the rack lineup flow).
  const [multiOpen, setMultiOpen] = useState(false);
  const [multiBottles, setMultiBottles] = useState<{ producer: string | null; wineName: string | null; vintage: string | number | null; region: string | null }[]>([]);
  const [multiChecked, setMultiChecked] = useState<Set<number>>(new Set());
  // Per-wine origin — indices in the set were "brought"; the rest are list picks.
  const [multiBrought, setMultiBrought] = useState<Set<number>>(new Set());

  function openConfirm(prefill: { producer?: string | null; wineName?: string | null; region?: string | null; colour?: string | null; vintage?: string | number | null }, brought: boolean) {
    setCbProducer(prefill.producer ?? '');
    setCbWineName(prefill.wineName ?? '');
    setCbRegion(prefill.region ?? '');
    setCbColour(prefill.colour ?? '');
    setCbVintage(prefill.vintage != null ? String(prefill.vintage) : '');
    setCbBrought(brought);
    setConfirmOpen(true);
  }

  function chooseManual() { setBottleChooserOpen(false); setCbCellarWineId(null); setCbImageUri(null); openConfirm({}, false); }
  function chooseCellar() { setBottleChooserOpen(false); setCellarSearch(''); setCellarPickerOpen(true); }

  async function chooseFromImage(source: 'camera' | 'library') {
    setBottleChooserOpen(false);
    setCbCellarWineId(null);
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets.length) return;
      setBottleBusy(true);
      const uri = res.assets[0].uri;
      try {
        const base64 = await prepareImageBase64(uri);
        const { bottles } = await detectLineup(base64);
        const detected = (bottles ?? []).slice(0, 8);
        if (detected.length >= 2) {
          // Several bottles → tick-list. A group photo isn't a single label, so
          // no per-wine photo in that case.
          setCbImageUri(null);
          setMultiBottles(detected.map((b) => ({ producer: b.producer, wineName: b.wineName, vintage: b.vintage, region: b.region ?? null })));
          setMultiChecked(new Set(detected.map((_, i) => i)));
          setMultiBrought(new Set()); // default all to "list pick"
          setMultiOpen(true);
        } else if (detected.length === 1) {
          const b = detected[0];
          setCbImageUri(uri); // save this label onto the review card
          openConfirm({ producer: b.producer, wineName: b.wineName, region: b.region, vintage: b.vintage }, false);
        } else {
          setCbImageUri(uri);
          openConfirm({}, false);
        }
      } catch {
        // Detection failed — still keep the photo and let them fill it in.
        setCbImageUri(uri);
        openConfirm({}, false);
      }
    } catch (err) {
      showAlert({ title: source === 'camera' ? 'Could not open camera' : 'Could not open photos', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBottleBusy(false);
    }
  }

  const cellarMatches = useMemo(() => {
    const q = cellarSearch.trim().toLowerCase();
    const list = q
      ? cellarWines.filter((w) => [w.producer, w.wine_name, w.region, w.vintage].filter(Boolean).join(' ').toLowerCase().includes(q))
      : cellarWines;
    return list.slice(0, 50);
  }, [cellarWines, cellarSearch]);

  function toggleMultiCheck(i: number) {
    setMultiChecked((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  }

  async function handleAddMulti() {
    if (bottleBusy) return;
    if (!session?.user.id) { showAlert({ title: 'Sign in needed', body: 'Sign in to add bottles to a visit.' }); return; }
    if (multiChecked.size === 0) { showAlert({ title: 'Nothing selected', body: 'Tick at least one bottle to add.' }); return; }
    setBottleBusy(true);
    try {
      for (let i = 0; i < multiBottles.length; i++) {
        if (!multiChecked.has(i)) continue;
        const b = multiBottles[i];
        const vint = b.vintage != null ? String(b.vintage).trim() : '';
        await addSessionBottle(session.user.id, {
          sessionId,
          restaurantName: restaurantName.trim() || null,
          city: cityValue.trim() || null,
          producer: b.producer?.trim() || null,
          wineName: (b.wineName || b.producer || 'Wine').trim(),
          region: b.region?.trim() || null,
          vintage: vint && !Number.isNaN(Number(vint)) ? Number(vint) : null,
          source: multiBrought.has(i) ? 'other' : 'restaurant',
        });
      }
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      setMultiOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not add bottles', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBottleBusy(false);
    }
  }

  async function handleAddBottle() {
    if (bottleBusy) return;
    const name = cbWineName.trim();
    if (!name) { showAlert({ title: 'Wine name needed', body: 'Enter at least the wine name to add this bottle.' }); return; }
    if (!session?.user.id) { showAlert({ title: 'Sign in needed', body: 'Sign in to add bottles to a visit.' }); return; }
    setBottleBusy(true);
    try {
      const vint = cbVintage.trim();
      const row = await addSessionBottle(session.user.id, {
        sessionId,
        restaurantName: restaurantName.trim() || null,
        city: cityValue.trim() || null,
        producer: cbProducer.trim() || null,
        wineName: name,
        region: cbRegion.trim() || null,
        style: cbColour.trim() || null,
        vintage: vint && !Number.isNaN(Number(vint)) ? Number(vint) : null,
        source: cbBrought ? 'other' : 'restaurant',
      });
      // Save the scanned/uploaded label onto the review card (best-effort).
      if (cbImageUri && row?.id) {
        try {
          const path = await uploadLabelImage(session.user.id, cbImageUri, row.id);
          await patchChosenWine(row.id, { label_image_path: path });
        } catch { /* non-fatal — review saved without a photo */ }
      }
      setCbImageUri(null);
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      setConfirmOpen(false);
      // Added from the cellar → offer to move that bottle to the archive (it's
      // been drunk, after all). Capture the id before clearing state.
      const cellarId = cbCellarWineId;
      setCbCellarWineId(null);
      if (cellarId) {
        showAlert({
          title: 'Move to your archive?',
          body: 'Would you like Vinster to move this wine from your cellar list to your archive?',
          buttons: [
            { text: 'Keep in cellar', style: 'cancel' },
            {
              text: 'Move to archive',
              onPress: () => {
                archiveCellarWine(cellarId)
                  .then(() => qc.invalidateQueries({ queryKey: ['cellar', session.user.id] }))
                  .catch((e) => showAlert({ title: 'Could not archive', body: e instanceof Error ? e.message : 'Please try again.' }));
              },
            },
          ],
        });
      }
    } catch (err) {
      showAlert({ title: 'Could not add bottle', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setBottleBusy(false);
    }
  }

  function communityPayload() {
    return {
      id: sessionId,
      restaurant_name: restaurantName || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
    };
  }

  async function persist() {
    await supabase.from('scan_sessions').update({
      restaurant_name: restaurantName.trim() || null,
      city: cityValue.trim() || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
      rating_value: value,
      is_favourite: isFavourite,
    }).eq('id', sessionId);
  }

  async function handleSave() {
    // Dismiss the keyboard explicitly — on iOS, tapping a button outside a
    // focused TextInput can cost the first tap to a keyboard dismiss.
    Keyboard.dismiss();
    setSaving(true);
    try {
      await persist();
      // Saving a restaurant review no longer auto-publishes it. Community
      // sharing happens only via the explicit "Share to Community" button
      // (handleShareToCommunity) so nothing reaches the public feed silently.
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      onSaved({ name: restaurantName.trim() || null, city: cityValue.trim() || null });
    } finally {
      setSaving(false);
    }
  }

  async function handleShareToCommunity() {
    Keyboard.dismiss();
    if (posting) return;
    setPosting(true);
    try {
      // Persist first so the published review matches what's on screen.
      await persist();
      await publishRestaurantSessionToCommunity(communityPayload());
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      showAlert({ title: 'Shared to community', body: 'Your restaurant review now appears in the Vinster community feed.' });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setPosting(false);
    }
  }

  async function handleShare() {
    Keyboard.dismiss();
    if (sharing) return;
    setSharing(true);
    try {
      // One paint to mount the off-screen branded card before the snapshot.
      await new Promise((r) => setTimeout(r, 250));
      const restaurant = restaurantName || 'Restaurant visit';
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const ratingText = (label: string, v: number | null) =>
        v == null ? null : `${label}: ${'★'.repeat(v)}${'☆'.repeat(5 - v)} (${v}/5)`;
      const header = cityValue.trim() ? `${restaurant} · ${cityValue.trim()}` : restaurant;
      const ratings = [
        ratingText('Overall', overall),
        ratingText('Food', food),
        ratingText('Wine list', wineList),
        ratingText('Service', service),
        ratingText('Value', value),
      ].filter(Boolean).join('\n');
      const noteText = note.trim() ? `\n\n"${note.trim()}"` : '';
      const winesBlock = !wines || wines.length === 0 ? '' : '\n\nWines I had:\n' + wines.map((w) => {
        const line = [w.producer, w.wineName, w.vintage].filter((x) => x != null && String(x).trim().length > 0).join(' · ');
        return `· ${line}${w.userScore != null ? ` (${w.userScore}/100)` : ''}`;
      }).join('\n');
      const message = `${header}${date ? `\n${date}` : ''}` + (ratings ? `\n\n${ratings}` : '') + noteText + winesBlock + VINSTER_TEXT_SHARE_FOOTER;
      await Share.share({ message, title: restaurant });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  // Split the visit's wines into List Bottles (chosen off the restaurant list)
  // and Off-List Bottles (brought along). Keep each wine's original index so
  // "Review this wine →" still targets the right chosen_wine.
  const indexedWines = (wines ?? []).map((w, i) => ({ ...w, _idx: i }));

  // Tap a wine → choose to review it (add or view/edit) or see its Wine Intel.
  function openWinePopup(w: WineLine & { _idx: number }) {
    const line = [w.producer, w.wineName, w.vintage].filter((x) => x != null && String(x).trim().length > 0).join(' · ');
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (onReviewWine) buttons.push({ text: w.reviewed ? 'View / Edit Review' : 'Add Review', onPress: () => onReviewWine(w._idx) });
    if (onViewIntel) buttons.push({ text: 'View Wine Intel', onPress: () => onViewIntel(w._idx) });
    if (onDeleteWine) buttons.push({ text: 'Delete Wine', style: 'destructive', onPress: () => onDeleteWine(w._idx) });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    showAlert({ title: line || 'This wine', body: w.source === 'other' ? 'Brought to this visit.' : 'Chosen off the list.', buttons });
  }

  const renderBottle = (w: WineLine & { _idx: number }) => {
    const line = [w.producer, w.wineName, w.vintage].filter((x) => x != null && String(x).trim().length > 0).join(' · ');
    // Origin ("Brought" / "List Pick") now reads as a prefix on the wine line
    // itself — no longer a separate bubble after it.
    const origin = w.source === 'other' ? 'Brought' : 'List Pick';
    return (
      <TouchableOpacity key={w._idx} style={styles.wineRow} onPress={() => openWinePopup(w)} activeOpacity={0.7}>
        <Text style={styles.wineNameWhite} numberOfLines={2}>
          <Text style={styles.wineOrigin}>{origin}: </Text>{line}{w.userScore != null ? <Text style={styles.wineScoreInline}> · {w.userScore}/100</Text> : null}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Top bar: gold back arrow (left); Share + favourite star (right). */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
              <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <View style={styles.topRight}>
              <TouchableOpacity onPress={handleShare} disabled={sharing} hitSlop={{ top: 10, bottom: 6, left: 10, right: 10 }} activeOpacity={0.7}>
                <Text style={[styles.topShareText, sharing && styles.btnDisabled]}>{sharing ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsFavourite((v) => !v)} hitSlop={{ top: 6, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
                <Text style={[styles.favouriteStar, isFavourite && styles.favouriteStarActive]}>{isFavourite ? '★' : '☆'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            {/* Restaurant + location read as headers at the top, date below —
                all prefilled from the scan, editable here. */}
            <TextInput
              style={styles.restaurantHeaderInput}
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="Restaurant name"
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={styles.locationHeaderInput}
              value={cityValue}
              onChangeText={setCityValue}
              placeholder="City or location"
              placeholderTextColor={colors.textMuted}
            />
            {date ? <Text style={styles.dateHeader}>{date}</Text> : null}

            <View style={styles.divider} />

            {/* Your review — moved to the top, right under the date. */}
            <View style={styles.dictateRow}>
              <Text style={styles.fieldLabel}>Your review</Text>
              <MicButton value={note} onChangeText={setNote} onClear={() => setNote('')} />
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Food, service, atmosphere, wine list quality…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <View style={styles.divider} />

            {/* Ratings — condensed: label + stars on one line, two columns, so
                the five ratings fit in three tight rows. */}
            <Text style={styles.fieldLabel}>Ratings</Text>
            <View style={styles.ratingsGrid}>
              {([
                { label: 'Overall', value: overall, set: setOverall },
                { label: 'Food', value: food, set: setFood },
                { label: 'Wine list', value: wineList, set: setWineList },
                { label: 'Service', value: service, set: setService },
                { label: 'Value', value: value, set: setValue },
              ] as const).map((r) => (
                <View key={r.label} style={styles.ratingItem}>
                  <Text style={styles.ratingItemLabel}>{r.label}</Text>
                  <StarRating value={r.value} onChange={r.set} size={16} />
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Wines You Drank — one list. Whether each bottle was off the list
                or brought along is shown as a quiet origin tag. */}
            <Text style={styles.sectionLabel}>Wines You Drank</Text>
            <View style={styles.wineBlock}>
              {indexedWines.map(renderBottle)}
              <TouchableOpacity style={styles.addBottleBtn} onPress={() => setBottleChooserOpen(true)} activeOpacity={0.8}>
                <Text style={styles.addBottleText}>+ Add a bottle</Text>
              </TouchableOpacity>
            </View>

            {/* Share lives in the top-right corner now — no bottom share row. */}

            <TouchableOpacity style={[styles.saveButton, (saving || !sessionId) && styles.btnDisabled]} onPress={handleSave} disabled={saving || !sessionId}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving…' : !sessionId ? 'Preparing…' : 'Save to Your Restaurants'}</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>

          {/* Add-a-Bottle chooser — four ways in. */}
          {bottleChooserOpen && (
            <View style={styles.bottleOverlay}>
              <TouchableOpacity style={styles.bottleBackdrop} activeOpacity={1} onPress={() => setBottleChooserOpen(false)} />
              <View style={styles.bottleSheet}>
                <Text style={styles.bottleSheetTitle}>Add a bottle</Text>
                <Text style={styles.bottleSheetBody}>Log a wine you drank at this visit — pick one from your cellar, or scan, upload, or type its label.</Text>
                <TouchableOpacity style={styles.bottleOptBtn} onPress={chooseCellar} activeOpacity={0.85}><Text style={styles.bottleOptText}>Add Bottle From Cellar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={() => chooseFromImage('library')} activeOpacity={0.85}><Text style={styles.bottleOptText}>Upload a Wine Label</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={() => chooseFromImage('camera')} activeOpacity={0.85}><Text style={styles.bottleOptText}>Scan a Label</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={chooseManual} activeOpacity={0.85}><Text style={styles.bottleOptText}>Manual Input</Text></TouchableOpacity>
                <TouchableOpacity style={styles.bottleCancel} onPress={() => setBottleChooserOpen(false)}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {/* Cellar picker — a simple searchable list. */}
          {cellarPickerOpen && (
            <View style={styles.bottleOverlay}>
              <TouchableOpacity style={styles.bottleBackdrop} activeOpacity={1} onPress={() => setCellarPickerOpen(false)} />
              <View style={styles.bottleSheet}>
                <Text style={styles.bottleSheetTitle}>Choose from your cellar</Text>
                <TextInput style={styles.bottleInput} value={cellarSearch} onChangeText={setCellarSearch} placeholder="Search your cellar…" placeholderTextColor={colors.textMuted} />
                <ScrollView style={styles.cellarList} keyboardShouldPersistTaps="handled">
                  {cellarMatches.length === 0 ? (
                    <Text style={styles.cellarEmpty}>No cellar wines match.</Text>
                  ) : cellarMatches.map((w) => (
                    <TouchableOpacity
                      key={w.id}
                      style={styles.cellarRow}
                      onPress={() => { setCellarPickerOpen(false); setCbCellarWineId(w.id); setCbImageUri(null); openConfirm({ producer: w.producer, wineName: w.wine_name, region: w.region, vintage: w.vintage }, true); }}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.cellarRowName} numberOfLines={1}>{w.wine_name}</Text>
                      <Text style={styles.cellarRowMeta} numberOfLines={1}>{[w.producer, w.vintage].filter(Boolean).join(' · ')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.bottleCancel} onPress={() => setCellarPickerOpen(false)}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {/* Confirm wine details — the shared last step for every add path.
              Wrapped in a keyboard-aware scroll so the inputs lift above the
              keyboard instead of being covered. */}
          {confirmOpen && (
            <View style={styles.confirmSheetOverlay}>
              <View style={styles.bottleBackdrop} />
              <KeyboardAwareScrollView style={styles.confirmScroll} contentContainerStyle={styles.confirmContent} keyboardShouldPersistTaps="handled" bottomOffset={24}>
                <View style={styles.bottleSheet}>
                  <Text style={styles.bottleSheetTitle}>Confirm wine details</Text>
                  <Text style={styles.bottleFieldLabel}>Producer</Text>
                  <TextInput style={styles.bottleInput} value={cbProducer} onChangeText={setCbProducer} placeholder="Producer" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Wine name</Text>
                  <TextInput style={styles.bottleInput} value={cbWineName} onChangeText={setCbWineName} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Region</Text>
                  <TextInput style={styles.bottleInput} value={cbRegion} onChangeText={setCbRegion} placeholder="Region" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Colour</Text>
                  <TextInput style={styles.bottleInput} value={cbColour} onChangeText={setCbColour} placeholder="e.g. Red, White, Rosé, Sparkling" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Vintage</Text>
                  <TextInput style={styles.bottleInput} value={cbVintage} onChangeText={setCbVintage} placeholder="Vintage (e.g. 2019 or NV)" placeholderTextColor={colors.textMuted} maxLength={7} />
                  {/* Origin — two mutually-exclusive ticks (brought vs ordered). */}
                  <TouchableOpacity style={styles.broughtToggleRow} onPress={() => setCbBrought(true)} activeOpacity={0.7}>
                    <View style={[styles.broughtCheckbox, cbBrought && styles.broughtCheckboxOn]}>
                      {cbBrought ? <Text style={styles.broughtCheckTick}>✓</Text> : null}
                    </View>
                    <Text style={styles.broughtToggleLabel}>I brought this</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.broughtToggleRow} onPress={() => setCbBrought(false)} activeOpacity={0.7}>
                    <View style={[styles.broughtCheckbox, !cbBrought && styles.broughtCheckboxOn]}>
                      {!cbBrought ? <Text style={styles.broughtCheckTick}>✓</Text> : null}
                    </View>
                    <Text style={styles.broughtToggleLabel}>I ordered this</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.bottleAddBtn, bottleBusy && styles.btnDisabled]} onPress={handleAddBottle} disabled={bottleBusy}>
                    <Text style={styles.bottleAddText}>{bottleBusy ? 'Adding…' : 'Add to This Visit'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottleCancel} onPress={() => setConfirmOpen(false)} disabled={bottleBusy}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            </View>
          )}

          {/* Multi-bottle confirm — a tick-list for a photo with several bottles. */}
          {multiOpen && (
            <View style={styles.confirmSheetOverlay}>
              <View style={styles.bottleBackdrop} />
              <KeyboardAwareScrollView style={styles.confirmScroll} contentContainerStyle={styles.confirmContent} keyboardShouldPersistTaps="handled">
                <View style={styles.bottleSheet}>
                  <Text style={styles.bottleSheetTitle}>Confirm bottles</Text>
                  <Text style={styles.bottleSheetBody}>Vinster read {multiBottles.length} bottles — tick the ones to add, and set each as List Pick or Brought.</Text>
                  {multiBottles.map((b, i) => {
                    const on = multiChecked.has(i);
                    const brought = multiBrought.has(i);
                    const line = [b.producer, b.wineName, b.vintage].filter((x) => x != null && String(x).trim().length > 0).join(' · ') || 'Unreadable bottle';
                    return (
                      <View key={i} style={styles.multiRow}>
                        <TouchableOpacity onPress={() => toggleMultiCheck(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                          <View style={[styles.broughtCheckbox, on && styles.broughtCheckboxOn]}>
                            {on ? <Text style={styles.broughtCheckTick}>✓</Text> : null}
                          </View>
                        </TouchableOpacity>
                        <View style={styles.multiRowMain}>
                          <Text style={styles.multiRowText} numberOfLines={2}>{line}</Text>
                          <View style={styles.originToggleRow}>
                            <TouchableOpacity onPress={() => setMultiBrought((prev) => { const n = new Set(prev); n.delete(i); return n; })} style={[styles.originChip, !brought && styles.originChipActive]} activeOpacity={0.7}>
                              <Text style={[styles.originChipText, !brought && styles.originChipTextActive]}>List Pick</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setMultiBrought((prev) => { const n = new Set(prev); n.add(i); return n; })} style={[styles.originChip, brought && styles.originChipActive]} activeOpacity={0.7}>
                              <Text style={[styles.originChipText, brought && styles.originChipTextActive]}>Brought</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                  <TouchableOpacity style={[styles.bottleAddBtn, bottleBusy && styles.btnDisabled]} onPress={handleAddMulti} disabled={bottleBusy}>
                    <Text style={styles.bottleAddText}>{bottleBusy ? 'Adding…' : `Add ${multiChecked.size} ${multiChecked.size === 1 ? 'Bottle' : 'Bottles'}`}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.bottleCancel} onPress={() => setMultiOpen(false)} disabled={bottleBusy}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            </View>
          )}

          {/* OCR spinner while reading a scanned / uploaded label. */}
          {bottleBusy && !confirmOpen && (
            <View style={styles.bottleOverlay}>
              <View style={styles.bottleBackdrop} />
              <View style={styles.ocrCard}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.ocrText}>Reading the label…</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Off-screen branded share card — mounted only during a share so
          react-native-view-shot can snapshot it for the native share. No
          opacity:0 here: on Android that degrades the rasterised PNG, so we
          hide it by off-screen position alone. */}
      {sharing && (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <RestaurantReviewShareCard
            ref={shareCardRef}
            restaurantName={restaurantName || 'Restaurant visit'}
            city={cityValue.trim() || null}
            date={date ?? null}
            ratingOverall={overall}
            ratingFood={food}
            ratingService={service}
            ratingWineList={wineList}
            ratingValue={value}
            note={note.trim() || null}
            wines={(wines ?? []).map((w) => ({ producer: w.producer, wineName: w.wineName, vintage: w.vintage, userScore: w.userScore }))}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  // Top bar — gold back arrow (left), Share + favourite star stacked (right).
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backArrow: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  topRight: { alignItems: 'flex-end', gap: 4 },
  topShareText: { fontSize: 16, fontFamily: fonts.headingSemibold, color: colors.gold },
  favouriteStar: { fontSize: 26, color: colors.textMuted },
  favouriteStarActive: { color: colors.gold },
  content: { padding: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  // Restaurant + location read as headers; date beneath.
  restaurantHeaderInput: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, letterSpacing: 0.3, paddingVertical: 2 },
  locationHeaderInput: { fontFamily: fonts.headingItalic, fontSize: 17, color: colors.textMuted, paddingVertical: 2, marginTop: 2 },
  dateHeader: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  subheading: { fontFamily: fonts.headingItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.sm, lineHeight: 21 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  // Restaurant + Place inputs share one row at the top of the card.
  identityRow: { flexDirection: 'row', gap: spacing.sm },
  identityCol: { flex: 1 },
  // Vinster's auto-attached bottle pick(s), sitting under the date.
  bottlePickBlock: { marginTop: spacing.xs, marginBottom: spacing.sm },
  // Read-only restaurant identity stamp.
  stamp: { marginBottom: spacing.lg },
  stampNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stampPin: { fontSize: 20 },
  stampName: { flex: 1, fontFamily: fonts.headingBold, fontSize: 24, color: colors.text },
  stampMeta: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: spacing.xs },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  // Sub-heading for each bottle bucket (List / Off-List).
  bottleGroupLabel: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.3, marginTop: spacing.sm, marginBottom: spacing.xs },
  fieldLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Field label + dictation mic on one row.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noteInput: { minHeight: 110, marginBottom: spacing.lg },
  ratingsBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  wineBlock: { marginBottom: spacing.lg, gap: spacing.sm },
  wineRow: { gap: 2 },
  wineLineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  broughtTag: { fontFamily: fonts.bodySemibold, fontSize: 10.5, color: colors.gold, letterSpacing: 0.4, textTransform: 'uppercase', borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  // "From List" — same bubble treatment as "brought", for wines chosen off the
  // restaurant's list.
  fromListTag: { fontFamily: fonts.bodySemibold, fontSize: 10.5, color: colors.gold, letterSpacing: 0.4, textTransform: 'uppercase', borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1, overflow: 'hidden' },
  broughtToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xs },
  broughtCheckbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  broughtCheckboxOn: { backgroundColor: 'rgba(224,184,74,0.18)' },
  broughtCheckTick: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold },
  broughtToggleTextWrap: { flex: 1 },
  broughtToggleLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  broughtToggleHint: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  // Wine reference — gold italic, matching the wine reference style elsewhere.
  wineLine: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, lineHeight: 21 },
  // Wine name in white; the origin prefix beside it stays gold.
  wineNameWhite: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 21 },
  wineScoreInline: { fontFamily: fonts.bodySemibold, color: colors.gold },
  // Origin prefix ("Brought:" / "List Pick:") — gold, semibold to stand apart.
  wineOrigin: { fontFamily: fonts.bodySemibold, color: colors.gold },
  wineReviewLink: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 2 },
  // "Add a Bottle" — dashed gold affordance under the bottle list.
  addBottleBtn: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  addBottleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Condensed ratings — label + stars share one line, two columns, three rows.
  ratingsGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs, marginBottom: spacing.md },
  ratingItem: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingItemLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },
  // "(coming soon)" line beneath "Share to Community".
  comingSoonText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: '#FFFFFF', textAlign: 'center', marginTop: 2, opacity: 0.85 },
  shareRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  shareBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  shareBtnText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: '#FFFFFF', textAlign: 'center' },
  btnDisabled: { opacity: 0.5 },
  saveButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelButton: { alignItems: 'center', padding: spacing.sm },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Off-screen wrapper so the branded share card can be snapshotted while
  // staying out of the visible layout (off-screen position only — no opacity).
  shareCardWrap: { position: 'absolute', left: -10000, top: 0 },
  // --- Add-a-Bottle overlays (rendered inside this full-screen modal, not as
  // nested RN Modals, which misbehave on Android). ---
  bottleOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  // Confirm-details sheet: a keyboard-aware scroll fills the overlay and centres
  // the sheet, lifting it above the keyboard when a field is focused.
  confirmSheetOverlay: { ...StyleSheet.absoluteFillObject },
  confirmScroll: { flex: 1 },
  confirmContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: 40 },
  // Multi-bottle tick-list rows.
  multiRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  multiRowMain: { flex: 1, gap: spacing.xs },
  multiRowText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  // Per-wine "List Pick / Brought" toggle chips.
  originToggleRow: { flexDirection: 'row', gap: spacing.sm, marginTop: 2 },
  originChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 999, paddingVertical: 4, paddingHorizontal: spacing.md },
  originChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  originChipText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted },
  originChipTextActive: { color: colors.gold },
  bottleBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  bottleSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460, maxHeight: '82%' },
  bottleSheetTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  bottleSheetBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  bottleOptBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  bottleOptMt: { marginTop: spacing.sm },
  bottleOptText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  bottleCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 2 },
  bottleCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  bottleFieldLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  bottleInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  bottleAddBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  bottleAddText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cellarList: { maxHeight: 320, marginBottom: spacing.sm },
  cellarEmpty: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingVertical: spacing.md },
  cellarRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  cellarRowName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  cellarRowMeta: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ocrCard: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, paddingVertical: spacing.xl, paddingHorizontal: spacing.xl, alignItems: 'center', gap: spacing.md },
  ocrText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.3 },
});
