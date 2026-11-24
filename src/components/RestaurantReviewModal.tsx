import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Keyboard, Share, ActivityIndicator, ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../utils/shareCard';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { listLineupArchives, setLineupRestaurant } from '../api/lineups';
import { addSessionBottle, patchChosenWine, updateSessionRestaurant } from '../api/chosenWines';
import { uploadLabelImage } from '../api/labelPhotos';
import { getCachedLabelUri } from '../api/labelImageCache';
import { prepareImageBase64, detectLineup } from '../api/label';
import { ensureMediaPermission } from '../utils/mediaPermissions';
import { useCellar, invalidateCellarViews } from '../hooks/useCellar';
import { archiveBottles } from '../services/archiveNight';
import { useChosenWines } from '../hooks/useChosenWines';
import { useAuth } from '../hooks/useAuth';
import { StarRating } from './StarRating';
import { WineSearchModal } from './WineSearchModal';
import { LabelThumb } from './LabelThumb';
import { DateInput } from './DateInput';
import { RestaurantReviewShareCard } from './RestaurantReviewShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../constants/share';
import { showAlert } from './AppAlert';
import { ensureConnectionForUpload } from '../utils/connectionGuard';
import { MicButton } from './MicButton';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import { isoToYmd, todayYmd, ymdToIso } from '../utils/reviewDate';
import { noteHappyMoment } from '../services/ratingPrompt';
import { wineHeaderLine } from '../utils/wineHeader';
import { formatVisitDate } from '../utils/restaurantReview';
import { matchesWineSearch } from '../utils/wineIdentity';
import { launchCamera, launchImageLibrary } from '../utils/imagePicker';

interface WineLine {
  producer: string | null;
  wineName: string;
  vintage: string | number | null;
  userScore: number | null;
  // 'other' = brought to the visit (Off-List); anything else = chosen off the
  // restaurant's list (List Bottle). Undefined from legacy callers → List.
  source?: string | null;
}

interface Props {
  visible: boolean;
  sessionId: string;
  initialName?: string | null;
  initialNote?: string | null;
  initialRatings?: { food: number | null; service: number | null; wineList: number | null; overall: number | null; value: number | null; atmosphere: number | null; glassware: number | null } | null;
  initialFavourite?: boolean;
  // Read-only context shown at the top of the card, mirroring the wine
  // review page's header: where/when the visit was, all pre-filled by
  // Vinster from the scan, and which wine(s) were chosen.
  city?: string | null;
  date?: string | null;
  // Raw ISO visit timestamp (scan_sessions.captured_at). When provided, the
  // date under the header becomes editable (YYYY-MM-DD) and is saved back.
  capturedAt?: string | null;
  wines?: WineLine[];
  // Opens the review of the wine at this index (the parent closes this modal
  // and navigates).
  onReviewWine?: (index: number) => void;
  // Opens Wine Intel for the wine at this index (parent closes the modal and
  // navigates — same reason onReviewWine is a callback, not done inline).
  onViewIntel?: (index: number) => void;
  // Opens the full "Edit wine" sheet (identity + style + photo) for the wine at
  // this index. Parent closes this modal and opens EditChosenWineModal.
  onEditWine?: (index: number) => void;
  // "Delete Wine" for the wine at this index — the parent asks whether to take
  // it off this visit or delete its review too.
  onDeleteWine?: (index: number) => void;
  onClose: () => void;
  // Reports the saved name + city back so callers (e.g. the List results
  // card) can reflect edits without refetching.
  onSaved: (details?: { name: string | null; city: string | null }) => void;
  // The parent is still creating the scan_sessions row (sessionId ''), or that
  // failed (sessionError) — Save then offers onRetrySession instead.
  sessionError?: boolean;
  onRetrySession?: () => void;
  // The restaurant "photo of the night" shown on the Your Restaurants list —
  // mirrored at the top of this card. Tap to view full-screen (onViewPhoto), or
  // add one when there's none yet (onAddPhoto).
  restaurantPhotoPath?: string | null;
  onViewPhoto?: () => void;
  // Passes the CURRENTLY-typed restaurant name + city so "Find Online" searches
  // for that restaurant, not the stale saved value. saveDraft persists unsaved
  // edits, for a parent that must close this modal to navigate.
  onAddPhoto?: (name: string, city: string, saveDraft: () => Promise<void>) => void;
  // "+ Add a lineup": photograph (or upload, `upload`) a lineup from this visit.
  // Same contract as onAddPhoto — the parent closes this modal to navigate.
  onAddLineup?: (upload: boolean, name: string, city: string, saveDraft: () => Promise<void>) => void;
  // Opens a matched lineup's card. The parent closes this modal first (saving
  // the draft), as for "+ Add a lineup"; name/city are the form's edits.
  onOpenLineup?: (lineupId: string, saveDraft: () => Promise<void>, name: string, city: string) => void;
}

type Place = { restaurant_name: string | null; city: string | null };

// Write the review to its scan_sessions row, then carry a renamed restaurant or
// changed city (vs `before`) onto the wines linked to the visit. The Supabase
// client resolves with { error } rather than throwing, so check it explicitly.
async function writeVisit(sessionId: string, payload: Place, before: Place) {
  const { error } = await supabase.from('scan_sessions').update(payload).eq('id', sessionId);
  if (error) throw error;
  await updateSessionRestaurant(sessionId, {
    ...(payload.restaurant_name !== before.restaurant_name ? { restaurantName: payload.restaurant_name } : {}),
    ...(payload.city !== before.city ? { city: payload.city } : {}),
  });
}

export function RestaurantReviewModal({
  visible, sessionId, initialName, initialNote, initialRatings, initialFavourite,
  city, date, capturedAt, wines, onReviewWine, onViewIntel, onEditWine, onDeleteWine, onClose, onSaved,
  sessionError, onRetrySession, restaurantPhotoPath, onViewPhoto, onAddPhoto, onAddLineup, onOpenLineup,
}: Props) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { wines: cellarWines } = useCellar();
  // Lineups matched to THIS restaurant visit (their restaurant_session_id points
  // here) — listed under "Matched Lineups", each opening its lineup card.
  const { data: lineups = [] } = useQuery({
    queryKey: ['lineup-archives', session?.user.id],
    queryFn: () => listLineupArchives(session!.user.id),
    enabled: !!session?.user.id,
  });
  const matchedLineups = sessionId ? lineups.filter((l) => l.restaurant_session_id === sessionId) : [];
  // "Remove match": the lineup stays in the Lineup Library, just no longer
  // linked to this visit.
  const [unmatching, setUnmatching] = useState<string | null>(null);
  function confirmRemoveMatch(lineupId: string, name: string) {
    showAlert({
      title: 'Remove this match?',
      body: `'${name}' stays in Your Lineup Library — it just won't be linked to this restaurant review.`,
      buttons: [
        { text: 'Remove Match', style: 'destructive', onPress: () => {
          setUnmatching(lineupId);
          setLineupRestaurant(lineupId, null)
            .then(() => {
              void qc.invalidateQueries({ queryKey: ['lineup-archives'] });
              void qc.invalidateQueries({ queryKey: ['lineup', lineupId] });
            })
            .catch(() => showAlert({ title: "Couldn't remove the match", body: 'Check your connection and try again.' }))
            .finally(() => setUnmatching(null));
        } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  const { chosenWines } = useChosenWines();
  // Restaurant identity — prefilled from the scan but editable here so the
  // user can correct the name or place while saving their review.
  const [restaurantName, setRestaurantName] = useState((initialName ?? '').trim());
  const [cityValue, setCityValue] = useState((city ?? '').trim());
  const [note, setNote] = useState(initialNote ?? '');
  // A SAVED review opens read-only — plain wrapped text that reads from the first
  // word (no scrolled-down input box). A brand-new review (no saved note) opens
  // straight into the editable box. Tapping Edit (or the text) switches to edit.
  const [noteEditing, setNoteEditing] = useState(() => !(initialNote ?? '').trim());
  // A saved review (a note or any rating) has no Save button at its foot:
  // changes are saved from the review's Edit box, or on leaving.
  const [savedReview, setSavedReview] = useState(() => !!(initialNote ?? '').trim()
    || Object.values(initialRatings ?? {}).some((r) => r != null));
  const [overall, setOverall] = useState<number | null>(initialRatings?.overall ?? null);
  const [food, setFood] = useState<number | null>(initialRatings?.food ?? null);
  const [wineList, setWineList] = useState<number | null>(initialRatings?.wineList ?? null);
  const [service, setService] = useState<number | null>(initialRatings?.service ?? null);
  const [atmosphere, setAtmosphere] = useState<number | null>(initialRatings?.atmosphere ?? null);
  const [glassware, setGlassware] = useState<number | null>(initialRatings?.glassware ?? null);
  const [value, setValue] = useState<number | null>(initialRatings?.value ?? null);
  // Not editable here, but written back with every save.
  const isFavourite = initialFavourite ?? false;
  // Visit date, editable as YYYY-MM-DD. Only writable when a raw capturedAt was
  // passed in (i.e. we know which timestamp to overwrite).
  const [dateValue, setDateValue] = useState(() => isoToYmd(capturedAt));
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  // The visit photo for the share card (a local file) and the resolver the
  // card's onImageReady calls, so handleShare can wait for it to be drawn.
  const [sharePhotoUri, setSharePhotoUri] = useState<string | null>(null);
  const sharePhotoReady = useRef<(() => void) | null>(null);

  // The scan_sessions patch this review writes. Kept in one place so the Save
  // button, the community share, and the silent autosave-on-leave all write
  // exactly the same fields.
  function buildPayload() {
    // Only overwrite captured_at when the user actually changed the date to a
    // valid new value — otherwise leave the original timestamp (incl. its time
    // of day) untouched rather than normalising it to noon on every save.
    const capturedIso = dateValue !== isoToYmd(capturedAt) ? ymdToIso(dateValue) : null;
    return {
      restaurant_name: restaurantName.trim() || null,
      city: cityValue.trim() || null,
      restaurant_note: note.trim() || null,
      rating_food: food,
      rating_service: service,
      rating_wine_list: wineList,
      rating_overall: overall,
      rating_value: value,
      rating_atmosphere: atmosphere,
      rating_glassware: glassware,
      is_favourite: isFavourite,
      // Only overwrite the visit date when the field holds a complete valid
      // date; an empty/partial entry leaves captured_at untouched.
      ...(capturedIso ? { captured_at: capturedIso } : {}),
    };
  }

  // --- Silent autosave so a review is never lost when leaving the page. ---
  // The note + ratings live only in local state until Save. Tapping a wine to
  // view its intel unmounts this modal (the parent sets editing=null before
  // navigating), and the back arrow could discard edits too. We persist on the
  // way out with NO confirmation prompt. Refs mirror the latest values so the
  // unmount cleanup reads current state rather than a stale first-render
  // closure, and a saved snapshot lets us skip a redundant write. onBlur is
  // unreliable on Android unmount, so we diff refs — same pattern as
  // app/profile/recipe.tsx.
  const payloadRef = useRef(buildPayload());
  payloadRef.current = buildPayload();
  const currentSnap = JSON.stringify(payloadRef.current);
  const savedSnapRef = useRef(currentSnap); // initialised to the loaded values
  // The place as last written, so only a real rename/move touches the wines.
  const savedPlaceRef = useRef<Place>({ restaurant_name: payloadRef.current.restaurant_name, city: payloadRef.current.city });
  const dirtyRef = useRef(false);
  dirtyRef.current = currentSnap !== savedSnapRef.current;
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;
  // Set true only when the user explicitly chooses "Discard" in the Back popup,
  // so the unmount safety-net below doesn't silently re-save what they discarded.
  const discardRef = useRef(false);

  useEffect(() => {
    return () => {
      if (discardRef.current || !dirtyRef.current || !sessionIdRef.current) return;
      // Fire-and-forget: the component is unmounting so we can't await. The
      // invalidations refresh the list and a re-opened form with what was saved.
      writeVisit(sessionIdRef.current, payloadRef.current, savedPlaceRef.current)
        // Only refetch on a confirmed write: refetching after a failure would
        // silently render the pre-edit values back over the user's changes.
        .then(() => {
          qc.invalidateQueries({ queryKey: ['scan-archive'] });
          qc.invalidateQueries({ queryKey: ['chosen-wines'] });
        })
        .catch(() => {});
    };
  }, []);

  // --- Add a Bottle: one flow, several ways in (Cellar / Upload / Scan /
  // Search), all landing on a confirm-details sheet; "Link to a Wine Review"
  // attaches existing reviews instead. Whether it's a "List Bottle" (off
  // the restaurant's list) or an "Off-List Bottle" (brought along) is INFERRED,
  // not asked up front — a wine picked from your own cellar is one you brought;
  // scanned/manual ones default to "off the list" with a single "I brought this"
  // toggle on the confirm sheet to correct it. ---
  const [bottleChooserOpen, setBottleChooserOpen] = useState(false);
  const [wineSearchOpen, setWineSearchOpen] = useState(false);
  const [cellarPickerOpen, setCellarPickerOpen] = useState(false);
  const [cellarSearch, setCellarSearch] = useState('');
  // "Link to a Wine Review" — attach existing reviews (not yet tied to a visit)
  // to this restaurant. Multi-select; linking sets each review's scan_session_id
  // so it appears under "Wines You Drank".
  const [reviewPickerOpen, setReviewPickerOpen] = useState(false);
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewChecked, setReviewChecked] = useState<Set<string>>(new Set());
  const [linkBusy, setLinkBusy] = useState(false);
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
  const [multiBottles, setMultiBottles] = useState<{ producer: string | null; wineName: string | null; vintage: string | number | null; region: string | null; style: string | null }[]>([]);
  const [multiChecked, setMultiChecked] = useState<Set<number>>(new Set());
  // Per-wine origin — indices in the set were "brought"; the rest are list picks.
  const [multiBrought, setMultiBrought] = useState<Set<number>>(new Set());
  // When set, the Confirm-details sheet is editing this multi-bottle row inline
  // (correct its fields, then it stays in the batch) rather than adding a wine.
  const [editingMultiIndex, setEditingMultiIndex] = useState<number | null>(null);

  function openConfirm(prefill: { producer?: string | null; wineName?: string | null; region?: string | null; colour?: string | null; vintage?: string | number | null }, brought: boolean) {
    setCbProducer(prefill.producer ?? '');
    setCbWineName(prefill.wineName ?? '');
    setCbRegion(prefill.region ?? '');
    setCbColour(prefill.colour ?? '');
    setCbVintage(prefill.vintage != null ? String(prefill.vintage) : '');
    setCbBrought(brought);
    setConfirmOpen(true);
  }

  // Catalog Search replaces free-text Manual Input — pick the match, then confirm.
  function chooseSearch() { setBottleChooserOpen(false); setWineSearchOpen(true); }
  function handleSearchSelect(r: { producer: string; wineName: string | null; region: string | null; style: string | null; vintage: string | null }) {
    setCbCellarWineId(null); setCbImageUri(null);
    openConfirm({ producer: r.producer, wineName: r.wineName, region: r.region, colour: r.style, vintage: r.vintage }, false);
  }
  function chooseCellar() { setBottleChooserOpen(false); setCellarSearch(''); setCellarPickerOpen(true); }

  async function chooseFromImage(source: 'camera' | 'library') {
    setBottleChooserOpen(false);
    setCbCellarWineId(null);
    if (!(await ensureMediaPermission(source === 'camera' ? 'camera' : 'library'))) return;
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const res = source === 'camera'
        ? await launchCamera(opts)
        : await launchImageLibrary(opts);
      if (res.canceled || !res.assets.length) return;
      if (!(await ensureConnectionForUpload())) return;
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
          setMultiBottles(detected.map((b) => ({ producer: b.producer, wineName: b.wineName, vintage: b.vintage, region: b.region ?? null, style: b.style ?? null })));
          setMultiChecked(new Set(detected.map((_, i) => i)));
          setMultiBrought(new Set()); // default all to "list pick"
          setMultiOpen(true);
        } else if (detected.length === 1) {
          const b = detected[0];
          setCbImageUri(uri); // save this label onto the review card
          openConfirm({ producer: b.producer, wineName: b.wineName, region: b.region, colour: b.style, vintage: b.vintage }, false);
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
    const list = cellarWines.filter((w) => matchesWineSearch([w.producer, w.wine_name, w.region, w.vintage], cellarSearch));
    return list.slice(0, 50);
  }, [cellarWines, cellarSearch]);

  // Reviews the user can link to this visit — their wine reviews not already
  // tied to a restaurant visit (scan_session_id null), newest first. Searchable.
  const reviewMatches = useMemo(() => {
    const list = chosenWines
      .filter((w) => !w.scan_session_id)
      .filter((w) => matchesWineSearch([w.producer, w.wine_name, w.region, w.vintage], reviewSearch))
      .slice()
      .sort((a, b) => new Date(b.chosen_at).getTime() - new Date(a.chosen_at).getTime());
    return list.slice(0, 100);
  }, [chosenWines, reviewSearch]);

  function chooseLinkReview() { setBottleChooserOpen(false); setReviewSearch(''); setReviewChecked(new Set()); setReviewPickerOpen(true); }
  function toggleReviewCheck(id: string) {
    setReviewChecked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  }

  // Link the ticked reviews to this visit: stamp each with this session id (so
  // findChosenForVisit surfaces it) plus the restaurant name/city so its own
  // review card reads "You had this wine at …".
  async function handleLinkReviews() {
    if (linkBusy) return;
    if (!session?.user.id) return;
    const ids = Array.from(reviewChecked);
    if (ids.length === 0) { setReviewPickerOpen(false); return; }
    setLinkBusy(true);
    try {
      for (const id of ids) {
        await patchChosenWine(id, {
          scan_session_id: sessionId,
          restaurant_name: restaurantName.trim() || null,
          city: cityValue.trim() || null,
        });
      }
      qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      setReviewPickerOpen(false);
      setReviewChecked(new Set());
    } catch (err) {
      showAlert({ title: 'Could not link reviews', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setLinkBusy(false);
    }
  }

  function toggleMultiCheck(i: number) {
    setMultiChecked((prev) => { const next = new Set(prev); if (next.has(i)) next.delete(i); else next.add(i); return next; });
  }

  async function handleAddMulti() {
    if (bottleBusy) return;
    if (!session?.user.id) return;
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
          style: b.style?.trim() || null,
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

  // "Edit" on a multi-bottle row — reuse the Confirm-details sheet to correct
  // that detected bottle's fields. It stays in the batch (nothing is saved
  // until "Add N Bottles"). We hide the tick-list while editing so the sheet
  // isn't rendered behind it, and restore it on save/cancel.
  function startEditMulti(i: number) {
    const b = multiBottles[i];
    setCbCellarWineId(null);
    setCbImageUri(null);
    setEditingMultiIndex(i);
    openConfirm(
      { producer: b.producer, wineName: b.wineName, region: b.region, colour: b.style, vintage: b.vintage },
      multiBrought.has(i),
    );
    setMultiOpen(false);
  }

  function saveEditMulti() {
    const i = editingMultiIndex;
    if (i == null) return;
    const vint = cbVintage.trim();
    setMultiBottles((prev) => prev.map((b, idx) => idx === i ? {
      producer: cbProducer.trim() || null,
      wineName: cbWineName.trim() || b.wineName,
      region: cbRegion.trim() || null,
      style: cbColour.trim() || null,
      vintage: vint ? vint : null,
    } : b));
    // Keep the row's List Pick / Brought origin in step with the sheet's toggle.
    setMultiBrought((prev) => { const n = new Set(prev); if (cbBrought) n.add(i); else n.delete(i); return n; });
    setEditingMultiIndex(null);
    setConfirmOpen(false);
    setMultiOpen(true);
  }

  function cancelConfirm() {
    if (editingMultiIndex != null) {
      // Editing a multi-bottle row — drop back to the tick-list unchanged.
      setEditingMultiIndex(null);
      setConfirmOpen(false);
      setMultiOpen(true);
    } else {
      setConfirmOpen(false);
    }
  }

  async function handleAddBottle() {
    if (bottleBusy) return;
    const name = cbWineName.trim();
    if (!name) { showAlert({ title: 'Wine name needed', body: 'Enter at least the wine name to add this bottle.' }); return; }
    if (!session?.user.id) return;
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
      // Added from the cellar → offer to archive the bottle (it's been drunk,
      // after all): one bottle, dated the visit, noted with the restaurant.
      // Capture the id before clearing state.
      const cellarId = cbCellarWineId;
      setCbCellarWineId(null);
      if (cellarId) {
        const day = ymdToIso(dateValue) ? dateValue.trim() : todayYmd();
        showAlert({
          title: 'Move to your archive?',
          body: 'Would you like Vinster to move this wine from your cellar list to your archive?',
          buttons: [
            { text: 'Keep in cellar', style: 'cancel' },
            {
              text: 'Move to archive',
              onPress: () => {
                archiveBottles(cellarId, 1, day, { note: restaurantName.trim() || undefined })
                  .catch((e) => showAlert({ title: 'Could not archive', body: e instanceof Error ? e.message : 'Please try again.' }))
                  .finally(() => invalidateCellarViews(qc));
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

  async function persist() {
    const payload = buildPayload();
    await writeVisit(sessionId, payload, savedPlaceRef.current);
    // Mark the form clean ONLY on a confirmed write, so a failure leaves it
    // dirty and the unmount autosave still gets its attempt.
    savedSnapRef.current = JSON.stringify(payload);
    savedPlaceRef.current = { restaurant_name: payload.restaurant_name, city: payload.city };
    qc.invalidateQueries({ queryKey: ['chosen-wines'] });
  }

  // Unsaved edits are written before the parent closes this modal to open
  // another screen (Find Online), so nothing typed is lost on the way.
  // "+ Add a lineup" → camera or library, then the parent opens the lineup flow
  // for this visit (the draft is saved first, as for a photo search).
  function chooseLineupSource() {
    const go = (upload: boolean) => onAddLineup?.(upload, restaurantName.trim(), cityValue.trim(), saveDraft);
    showAlert({
      title: 'Add a lineup',
      buttons: [
        { text: 'Photograph a Lineup', onPress: () => go(false) },
        { text: 'Upload a Lineup', onPress: () => go(true) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  async function saveDraft() {
    if (dirtyRef.current && sessionId) await persist();
  }

  // Something worth keeping: a name, note, rating, photo or wine.
  function hasContent(): boolean {
    return !!(restaurantName.trim() || note.trim() || restaurantPhotoPath || (wines?.length ?? 0) > 0
      || [overall, food, wineList, service, atmosphere, glassware, value].some((r) => r != null));
  }

  async function handleSave() {
    // Dismiss the keyboard explicitly — on iOS, tapping a button outside a
    // focused TextInput can cost the first tap to a keyboard dismiss.
    Keyboard.dismiss();
    if (!hasContent()) {
      showAlert({ title: 'Nothing to save yet', body: "Add the restaurant's name, a rating or a few words about the visit first." });
      return;
    }
    setSaving(true);
    try {
      await persist();
      // Once saved, collapse Your Review back to read-only text (like a wine
      // review) — Edit re-opens the box on command.
      setNoteEditing(false);
      setSavedReview(true);
      // Saving a restaurant review no longer auto-publishes it. Community
      // sharing happens only via the explicit "Share to Community" button
      // (handleShareToCommunity) so nothing reaches the public feed silently.
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
      onSaved({ name: restaurantName.trim() || null, city: cityValue.trim() || null });
      noteHappyMoment('restaurant-review');
    } catch {
      // Deliberately do NOT call onSaved here — that closes the modal. Keeping
      // it open preserves what the user typed and leaves the form dirty, so
      // the unmount autosave can still retry.
      showAlert({ title: "Couldn't save your review", body: 'Check your connection and try again. Your notes and ratings are still here.' });
    } finally {
      setSaving(false);
    }
  }

  // Leaving via the back arrow (or Android hardware back). If there are unsaved
  // edits, ask rather than losing them silently — matching the wine-review flow.
  // "Save" persists (onSaved closes); "Discard" flags discardRef so the unmount
  // safety-net won't re-save, then closes; "Keep editing" stays. An untouched
  // form just closes (the parent drops a blank manual draft).
  function handleBack() {
    Keyboard.dismiss();
    if (dirtyRef.current && sessionId) {
      showAlert({
        title: 'Save this review?',
        body: "You've started a review but haven't saved it. Save it so you can finish later, or discard it?",
        buttons: [
          { text: 'Save', onPress: () => { void handleSave(); } },
          { text: 'Discard', style: 'destructive', onPress: () => { discardRef.current = true; onClose(); } },
          { text: 'Keep editing', style: 'cancel' },
        ],
      });
      return;
    }
    onClose();
  }

  async function handleShare() {
    Keyboard.dismiss();
    if (sharing) return;
    setSharing(true);
    try {
      // The photo goes into the captured image, so resolve it to a local file
      // and wait for the card to draw it (capped, so a bad image can't hang the
      // share) before snapshotting.
      let photoUri: string | null = null;
      if (restaurantPhotoPath) {
        try { photoUri = await getCachedLabelUri(restaurantPhotoPath); } catch { /* share without it */ }
      }
      const photoDrawn = photoUri
        ? new Promise<void>((resolve) => { sharePhotoReady.current = resolve; })
        : Promise.resolve();
      setSharePhotoUri(photoUri);
      await Promise.race([photoDrawn, new Promise((r) => setTimeout(r, 5000))]);
      // One paint to mount the off-screen branded card before the snapshot.
      await new Promise((r) => setTimeout(r, 250));
      const restaurant = restaurantName || 'Restaurant visit';
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a restaurant review') });
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
        ratingText('Atmosphere', atmosphere),
        ratingText('Glassware', glassware),
        ratingText('Value', value),
      ].filter(Boolean).join('\n');
      const noteText = note.trim() ? `\n\n"${note.trim()}"` : '';
      const winesBlock = !wines || wines.length === 0 ? '' : '\n\nWines I had:\n' + wines.map((w) =>
        `· ${wineHeaderLine(w.producer, w.wineName, w.vintage)}${w.userScore != null ? ` (${w.userScore}/100)` : ''}`,
      ).join('\n');
      const message = `${header}${displayDate ? `\n${displayDate}` : ''}` + (ratings ? `\n\n${ratings}` : '') + noteText + winesBlock + VINSTER_TEXT_SHARE_FOOTER;
      await Share.share({ message, title: restaurant });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      sharePhotoReady.current = null;
      setSharePhotoUri(null);
      setSharing(false);
    }
  }

  // Split the visit's wines into List Bottles (chosen off the restaurant list)
  // and Off-List Bottles (brought along). Keep each wine's original index so
  // "Review this wine →" still targets the right chosen_wine.
  const indexedWines = (wines ?? []).map((w, i) => ({ ...w, _idx: i }));

  // Date shown on the shares — reflect an in-progress date edit when valid,
  // otherwise fall back to the pre-formatted `date` prop.
  const displayDate = (() => {
    const iso = ymdToIso(dateValue);
    return iso ? formatVisitDate(iso, 'long') : (date ?? null);
  })();

  // Tap a wine → choose to review it (add or view/edit) or see its Wine Intel.
  function openWinePopup(w: WineLine & { _idx: number }) {
    const line = wineHeaderLine(w.producer, w.wineName, w.vintage);
    const buttons: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [];
    if (onReviewWine) buttons.push({ text: 'Add/View Review', onPress: () => onReviewWine(w._idx) });
    if (onViewIntel) buttons.push({ text: 'View Wine Intel', onPress: () => onViewIntel(w._idx) });
    // Correct a misread producer/name/vintage inline — opens the identity sheet
    // (onEditWine) rather than sending the user off to Wine Reviews.
    if (onEditWine) buttons.push({ text: 'Edit Wine Name', onPress: () => onEditWine(w._idx) });
    if (onDeleteWine) buttons.push({ text: 'Delete Wine', style: 'destructive', onPress: () => onDeleteWine(w._idx) });
    buttons.push({ text: 'Cancel', style: 'cancel' });
    showAlert({ title: line || 'This wine', body: w.source === 'other' ? 'Brought to this visit.' : 'Chosen off the list.', buttons });
  }

  const renderBottle = (w: WineLine & { _idx: number }) => {
    const line = wineHeaderLine(w.producer, w.wineName, w.vintage);
    // Origin reads as a prefix on the wine line ("Brought: …").
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
    <Modal visible={visible} animationType="slide" onRequestClose={handleBack}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Top bar: gold back arrow (left). Centred title names the page for
              a first-time user. Share Review sits at the foot of the page. */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={handleBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.7}>
              <Text accessibilityLabel="Back" style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.topTitle} numberOfLines={1} pointerEvents="none">Your Restaurant Review</Text>
          </View>

          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
            {/* Photo of the night as a large header banner — the picture fills
                the header and the restaurant name + location · date sit
                overlaid on it (a scrim + text shadow keep them legible). Tap an
                empty banner to add a photo; tap "Change" to replace one. */}
            <View style={styles.photoBanner}>
              {restaurantPhotoPath ? (
                <>
                  <LabelThumb path={restaurantPhotoPath} fallbackText={restaurantName} style={styles.photoBannerImg} radius={0} frame={0} resizeMode="contain" />
                  <View style={styles.photoBannerScrim} pointerEvents="none" />
                  <TouchableOpacity style={styles.photoChangeBtn} onPress={() => onAddPhoto?.(restaurantName.trim(), cityValue.trim(), saveDraft)} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel="Change photo">
                    <Ionicons name="camera" size={18} color={colors.gold} />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.photoBannerAdd} onPress={() => onAddPhoto?.(restaurantName.trim(), cityValue.trim(), saveDraft)} activeOpacity={0.85} />
              )}
              {/* Overlaid identity — always editable, anchored to the bottom.
                  A "+ Add Photo" gold link sits above the name when there's no
                  photo yet. Location · date share one line beneath the name. */}
              <View style={styles.photoBannerText} pointerEvents="box-none">
                {!restaurantPhotoPath ? (
                  <TouchableOpacity onPress={() => onAddPhoto?.(restaurantName.trim(), cityValue.trim(), saveDraft)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} activeOpacity={0.7}>
                    <Text style={styles.addPhotoLink}>+ Add Photo</Text>
                  </TouchableOpacity>
                ) : null}
                <TextInput
                  style={styles.bannerNameInput}
                  value={restaurantName}
                  onChangeText={setRestaurantName}
                  placeholder="Restaurant name"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                />
                {/* Location then date STACKED (date below location), matched
                    fonts, neither italic. */}
                <View style={styles.bannerMetaCol}>
                  <TextInput
                    style={styles.bannerMetaInput}
                    value={cityValue}
                    onChangeText={setCityValue}
                    placeholder="City or location"
                    placeholderTextColor="rgba(255,255,255,0.55)"
                  />
                  {capturedAt != null ? (
                    <DateInput
                      style={[styles.bannerMetaInput, styles.bannerDateInput]}
                      valueIso={dateValue}
                      onChangeIso={setDateValue}
                      placeholderTextColor="rgba(255,255,255,0.55)"
                    />
                  ) : date ? (
                    <Text style={styles.bannerMetaStatic}>{date}</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Your review — moved to the top, right under the date. A saved
                review shows as read-only text (reads from the first word); the
                editable box + mic only appear once Edit is tapped. */}
            <View style={styles.dictateRow}>
              <Text style={styles.fieldLabel}>Your review</Text>
              {noteEditing ? (
                <MicButton value={note} onChangeText={setNote} onClear={() => setNote('')} domain="note" serverCorrect />
              ) : (
                <TouchableOpacity onPress={() => setNoteEditing(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
                  <Text style={styles.editNoteLink}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* Overall star rating lives here so a review can be a single star
                score plus an optional note — no written review required. */}
            <View style={styles.overallRow}>
              <Text style={styles.overallLabel}>Overall</Text>
              <StarRating value={overall} onChange={setOverall} size={22} />
            </View>
            {noteEditing ? (
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
            ) : (
              <TouchableOpacity onPress={() => setNoteEditing(true)} activeOpacity={0.7} style={styles.noteReadonlyWrap}>
                <Text style={note.trim() ? styles.noteReadonly : styles.noteReadonlyEmpty}>{note.trim() || 'No review yet'}</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            {/* Ratings — condensed: label + stars on one line, two columns, so
                the five ratings fit in three tight rows. */}
            <Text style={styles.fieldLabel}>Ratings</Text>
            <View style={styles.ratingsGrid}>
              {([
                { label: 'Food', value: food, set: setFood },
                { label: 'Wine list', value: wineList, set: setWineList },
                { label: 'Service', value: service, set: setService },
                { label: 'Atmosphere', value: atmosphere, set: setAtmosphere },
                { label: 'Glassware', value: glassware, set: setGlassware },
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
              {/* Bottles attach to the visit's row, so wait until it exists. */}
              <TouchableOpacity style={[styles.addBottleBtn, !sessionId && styles.btnDisabled]} onPress={() => setBottleChooserOpen(true)} disabled={!sessionId} activeOpacity={0.8}>
                <Text style={styles.addBottleText}>+ Add a bottle</Text>
              </TouchableOpacity>
              {onAddLineup ? (
                <TouchableOpacity style={[styles.addBottleBtn, !sessionId && styles.btnDisabled]} onPress={chooseLineupSource} disabled={!sessionId} activeOpacity={0.8}>
                  <Text style={styles.addBottleText}>+ Add a lineup</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {matchedLineups.length ? (
              <>
                <Text style={[styles.sectionLabel, { marginTop: spacing.lg }]}>Matched Lineups</Text>
                {matchedLineups.map((l) => (
                  <TouchableOpacity key={l.id} style={styles.lineupRow} onPress={() => onOpenLineup?.(l.id, saveDraft, restaurantName.trim(), cityValue.trim())} disabled={!onOpenLineup} activeOpacity={0.7}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.lineupName} numberOfLines={1}>{l.name?.trim() || 'Your Lineup'}</Text>
                      <Text style={styles.lineupDate}>{new Date(l.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                      <TouchableOpacity onPress={() => confirmRemoveMatch(l.id, l.name?.trim() || 'Your Lineup')} disabled={unmatching === l.id} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} activeOpacity={0.7}>
                        <Text style={styles.removeMatch}>{unmatching === l.id ? 'Removing…' : 'Remove match'}</Text>
                      </TouchableOpacity>
                    </View>
                    {onOpenLineup ? <Text style={styles.lineupLink}>View ›</Text> : null}
                  </TouchableOpacity>
                ))}
              </>
            ) : null}

            {!sessionId && sessionError ? (
              <TouchableOpacity style={styles.saveButton} onPress={onRetrySession}>
                <Text style={styles.saveButtonText}>Couldn't start this visit · Tap to Retry</Text>
              </TouchableOpacity>
            ) : !savedReview || noteEditing ? (
              <TouchableOpacity style={[styles.saveButton, (saving || !sessionId) && styles.btnDisabled]} onPress={handleSave} disabled={saving || !sessionId}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving…' : !sessionId ? 'Preparing…' : 'Save to Your Restaurant Reviews'}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity style={[styles.shareButton, sharing && styles.btnDisabled]} onPress={handleShare} disabled={sharing} activeOpacity={0.85}>
              <Text style={styles.shareButtonText}>{sharing ? 'Preparing…' : 'Share Review'}</Text>
            </TouchableOpacity>
          </KeyboardAwareScrollView>

          {/* Add-a-Bottle chooser. */}
          {bottleChooserOpen && (
            <View style={styles.bottleOverlay}>
              <TouchableOpacity style={styles.bottleBackdrop} activeOpacity={1} onPress={() => setBottleChooserOpen(false)} />
              <View style={styles.bottleSheet}>
                <Text style={styles.bottleSheetTitle}>Add a bottle</Text>
                <Text style={styles.bottleSheetBody}>Log a wine you drank at this visit — pick one from your cellar, or scan, upload, or type its label.</Text>
                <TouchableOpacity style={styles.bottleOptBtn} onPress={chooseCellar} activeOpacity={0.85}><Text style={styles.bottleOptText}>Add Bottle From Cellar</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={chooseLinkReview} activeOpacity={0.85}><Text style={styles.bottleOptText}>Link to a Wine Review</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={() => chooseFromImage('library')} activeOpacity={0.85}><Text style={styles.bottleOptText}>Upload a Wine Label</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={() => chooseFromImage('camera')} activeOpacity={0.85}><Text style={styles.bottleOptText}>Scan a Label</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.bottleOptBtn, styles.bottleOptMt]} onPress={chooseSearch} activeOpacity={0.85}><Text style={styles.bottleOptText}>Search/Manual Input</Text></TouchableOpacity>
                <TouchableOpacity style={styles.bottleCancel} onPress={() => setBottleChooserOpen(false)}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
              </View>
            </View>
          )}

          <WineSearchModal visible={wineSearchOpen} onClose={() => setWineSearchOpen(false)} onSelect={handleSearchSelect} />

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

          {/* Link-to-a-Wine-Review picker — multi-select list of the user's
              wine reviews, newest first. Ticked reviews are attached to this
              visit and show under "Wines You Drank". */}
          {reviewPickerOpen && (
            <View style={styles.bottleOverlay}>
              <TouchableOpacity style={styles.bottleBackdrop} activeOpacity={1} onPress={() => setReviewPickerOpen(false)} />
              <View style={styles.bottleSheet}>
                <Text style={styles.bottleSheetTitle}>Link to a wine review</Text>
                <Text style={styles.bottleSheetBody}>Select one or more of your wine reviews to add to this visit.</Text>
                <TextInput style={styles.bottleInput} value={reviewSearch} onChangeText={setReviewSearch} placeholder="Search your reviews…" placeholderTextColor={colors.textMuted} />
                <ScrollView style={styles.cellarList} keyboardShouldPersistTaps="handled">
                  {reviewMatches.length === 0 ? (
                    <Text style={styles.cellarEmpty}>No reviews available to link.</Text>
                  ) : reviewMatches.map((w) => {
                    const checked = reviewChecked.has(w.id);
                    return (
                      <TouchableOpacity
                        key={w.id}
                        style={[styles.cellarRow, { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }]}
                        onPress={() => toggleReviewCheck(w.id)}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cellarRowName} numberOfLines={1}>{w.wine_name}</Text>
                          <Text style={styles.cellarRowMeta} numberOfLines={1}>{[w.producer, w.vintage, formatVisitDate(w.chosen_at)].filter(Boolean).join(' · ')}</Text>
                        </View>
                        <Text style={[styles.reviewCheck, checked && { color: colors.gold }]}>{checked ? '☑' : '☐'}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.bottleAddBtn, (linkBusy || reviewChecked.size === 0) && styles.btnDisabled]}
                  onPress={handleLinkReviews}
                  disabled={linkBusy || reviewChecked.size === 0}
                >
                  <Text style={styles.bottleAddText}>{linkBusy ? 'Linking…' : reviewChecked.size > 0 ? `Add ${reviewChecked.size} ${reviewChecked.size === 1 ? 'Review' : 'Reviews'}` : 'Add Reviews'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottleCancel} onPress={() => setReviewPickerOpen(false)}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
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
                  <Text style={styles.bottleSheetTitle}>{editingMultiIndex != null ? 'Edit bottle' : 'Confirm wine details'}</Text>
                  <Text style={styles.bottleFieldLabel}>Producer</Text>
                  <TextInput style={styles.bottleInput} value={cbProducer} onChangeText={setCbProducer} placeholder="Producer" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Wine name</Text>
                  <TextInput style={styles.bottleInput} value={cbWineName} onChangeText={setCbWineName} placeholder="Wine name" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Region</Text>
                  <TextInput style={styles.bottleInput} value={cbRegion} onChangeText={setCbRegion} placeholder="Region" placeholderTextColor={colors.textMuted} />
                  <Text style={styles.bottleFieldLabel}>Style</Text>
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
                  {editingMultiIndex != null ? (
                    <TouchableOpacity style={styles.bottleAddBtn} onPress={saveEditMulti}>
                      <Text style={styles.bottleAddText}>Save changes</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.bottleAddBtn, bottleBusy && styles.btnDisabled]} onPress={handleAddBottle} disabled={bottleBusy}>
                      <Text style={styles.bottleAddText}>{bottleBusy ? 'Adding…' : 'Add to This Visit'}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity style={styles.bottleCancel} onPress={cancelConfirm} disabled={bottleBusy}><Text style={styles.bottleCancelText}>Cancel</Text></TouchableOpacity>
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
                    const line = wineHeaderLine(b.producer, b.wineName, b.vintage) || 'Unreadable bottle';
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
                            <TouchableOpacity onPress={() => startEditMulti(i)} style={styles.multiEditChip} activeOpacity={0.7}>
                              <Text style={styles.multiEditChipText}>Edit</Text>
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
            date={displayDate}
            ratingOverall={overall}
            ratingFood={food}
            ratingService={service}
            ratingWineList={wineList}
            ratingAtmosphere={atmosphere}
            ratingGlassware={glassware}
            ratingValue={value}
            note={note.trim() || null}
            wines={(wines ?? []).map((w) => ({ producer: w.producer, wineName: w.wineName, vintage: w.vintage, userScore: w.userScore }))}
            imageUri={sharePhotoUri}
            onImageReady={() => sharePhotoReady.current?.()}
          />
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: colors.background },
  sheet: { flex: 1, backgroundColor: colors.background },
  // Top bar — gold back arrow (left); the title is overlaid centrally.
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  backArrow: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  // Centred page title, overlaid on the top bar.
  topTitle: { position: 'absolute', top: 58, left: 0, right: 0, textAlign: 'center', fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, letterSpacing: 0.4 },

  content: { padding: spacing.xl, paddingTop: spacing.md, paddingBottom: 60 },
  // Large photo-of-the-night banner: bleeds to the screen edges and fills the
  // header area, with the restaurant identity overlaid on it.
  photoBanner: { height: 230, marginHorizontal: -spacing.xl, marginTop: -spacing.md, marginBottom: spacing.md, backgroundColor: '#1c1712', overflow: 'hidden', justifyContent: 'flex-end' },
  photoBannerImg: { ...StyleSheet.absoluteFillObject },
  // Dark scrim over the picture so the overlaid white text stays legible.
  photoBannerScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.34)' },
  // Empty-state: the whole banner is a tap target to add a photo.
  photoBannerAdd: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 6 },

  // Camera badge (top-right of the photo), matching the archived-lineup image.
  photoChangeBtn: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 18, minWidth: 34, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },
  // Overlaid, editable identity anchored to the bottom of the banner.
  photoBannerText: { position: 'absolute', left: spacing.xl, right: spacing.xl, bottom: spacing.md },
  addPhotoLink: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 0.3, marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
  // Venue name shares the LOCATION field's font family (bodyRegular) so the two
  // read as one family — just larger for hierarchy.
  bannerNameInput: { fontFamily: fonts.bodyRegular, fontSize: 28, color: '#fff', letterSpacing: 0.3, paddingVertical: 2, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  // Location + date stacked (date on its own line beneath the location).
  bannerMetaCol: { alignItems: 'flex-start', marginTop: 2 },
  // Matched Lineups: title on the left, date beneath, gold View link.
  lineupRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  lineupName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  lineupDate: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 1 },
  lineupLink: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  removeMatch: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline', marginTop: 4 },
  bannerMetaInput: { flexShrink: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: 'rgba(255,255,255,0.92)', paddingVertical: 2, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
  bannerDateInput: { flexShrink: 0, width: 118, fontStyle: 'normal', fontFamily: fonts.bodyRegular },

  bannerMetaStatic: { fontFamily: fonts.bodyRegular, fontSize: 15, color: 'rgba(255,255,255,0.92)', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text, marginBottom: spacing.sm },

  fieldLabel: {
    fontFamily: fonts.bodySemibold,
    fontSize: 16,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  // Field label + dictation mic on one row.
  dictateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  // Overall star rating beneath the "Your review" header.
  overallRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  overallLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
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
  // Read-only saved review: plain wrapped text (always reads from the first word).
  editNoteLink: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  noteReadonlyWrap: { marginBottom: spacing.lg },
  noteReadonly: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 22 },
  noteReadonlyEmpty: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, lineHeight: 22 },

  wineBlock: { marginBottom: spacing.lg, gap: spacing.sm },
  wineRow: { gap: 2 },

  broughtToggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xs },
  broughtCheckbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  broughtCheckboxOn: { backgroundColor: 'rgba(224,184,74,0.18)' },
  broughtCheckTick: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.gold },

  broughtToggleLabel: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },

  // Wine name in white; the origin prefix beside it stays gold.
  wineNameWhite: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 21 },
  wineScoreInline: { fontFamily: fonts.bodySemibold, color: colors.gold },
  // Origin prefix ("Brought:" / "List Pick:") — gold, semibold to stand apart.
  wineOrigin: { fontFamily: fonts.bodySemibold, color: colors.gold },

  // "Add a Bottle" — dashed gold affordance under the bottle list.
  addBottleBtn: { borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.xs },
  addBottleText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Condensed ratings — label + stars share one line, two columns, three rows.
  ratingsGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.md, rowGap: spacing.xs, marginBottom: spacing.md },
  ratingItem: { width: '47%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingItemLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },

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
  // White foot button, matching the lineup page's Share.
  shareButton: { alignSelf: 'center', minWidth: '82%', alignItems: 'center', borderWidth: 1, borderColor: colors.text, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  shareButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, letterSpacing: 0.3, textAlign: 'center' },

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
  // "Edit" affordance on a multi-bottle row — an underlined text link so it
  // reads as an action, distinct from the List Pick / Brought origin chips.
  multiEditChip: { paddingVertical: 4, paddingHorizontal: spacing.sm },
  multiEditChipText: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.gold, textDecorationLine: 'underline' },
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
  reviewCheck: { fontSize: 20, color: colors.textMuted },
  cellarRowName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  cellarRowMeta: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  ocrCard: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, paddingVertical: spacing.xl, paddingHorizontal: spacing.xl, alignItems: 'center', gap: spacing.md },
  ocrText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.3 },
});
