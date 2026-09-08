import { useMemo, useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator, Share, BackHandler } from 'react-native';
import { KeyboardAwareScrollView, KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { VinstersNoteHeading, VINSTERS_NOTE_EXPLAINER } from '../../src/components/VinstersNoteHeading';
import { LabelPhotoViewer } from '../../src/components/LabelPhotoViewer';
import { WineIdentityHeader } from '../../src/components/WineIdentityHeader';
import { RangeWineNoteSheet } from '../../src/components/RangeWineNoteSheet';
import { NoIntelPrompt } from '../../src/components/NoIntelPrompt';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { useLabels } from '../../src/hooks/useLabels';
import { promptAddToLabelLibrary } from '../../src/utils/labelLibraryPrompt';
import { captureCity } from '../../src/utils/captureCity';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { useChosenWines } from '../../src/hooks/useChosenWines';
import { patchChosenWine } from '../../src/api/chosenWines';
import { findExistingReview, appendDatedEntry, todayLabel } from '../../src/utils/reviewDedup';
import { fetchCellarLocations, addWinesToFilter } from '../../src/api/customFilters';
import { createStorageCase, assignWineToCase, deleteStorageCase, fetchStorageLocationCases } from '../../src/api/storageLocations';
import { MicButton } from '../../src/components/MicButton';
import type { ChosenWine, WineIntelligence } from '../../src/types/wine';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useRackStore } from '../../src/stores/rackStore';
import { useRacks } from '../../src/hooks/useRacks';
import { assignSlots, getRackSlots, getSlotAssignments, clearWineFromRacks } from '../../src/api/racks';
import { fetchPricing, generateWineIntel, fetchVintageComparison, type VintageComparisonRow } from '../../src/services/pricing';
import { peekIntelCurrency } from '../../src/utils/localCurrency';
import { getWineIntelligence, fetchWineCandidates, fetchProducerRange, prepareImageBase64, scanLabel, type WineCandidate, type ProducerRange } from '../../src/api/label';
import { updateLabelIntel } from '../../src/api/labels';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../src/constants/share';
import { formatWineTitle } from '../../src/utils/wineTitle';
import { regionWithCountry } from '../../src/utils/wineOrigin';
import * as ImagePicker from 'expo-image-picker';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import type { WineDetailsComplete } from '../../src/types/wine';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import { BottleSizePicker, detectPlacementMismatch, placementWarningBody, COMMON_BOTTLE_SIZES, bottleSizeLabel } from '../../src/components/BottleSizePicker';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

function DrinkingWindowBadge({ status, from, to }: { status: string; from: number | null; to: number | null }) {
  const labels: Record<string, { text: string; color: string }> = {
    too_young: { text: 'Too Young', color: colors.warning },
    approaching: { text: 'Approaching Peak', color: colors.gold },
    peak: { text: 'Peak Now', color: colors.gold },
    declining: { text: 'Declining', color: colors.gold },
    unknown: { text: 'Drinking Window Unknown', color: colors.textMuted },
  };
  const badge = labels[status] ?? labels.unknown;
  const window = from && to ? `${from}–${to}` : null;

  return (
    <View style={styles.badge}>
      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
      {window && <Text style={styles.badgeWindow}>{window}</Text>}
    </View>
  );
}

// Compact label + colour for the drinking-window stat cell — mirrors the badge
// above and the cellar wine card, with shorter labels for the tight cell.
function windowMeta(status: string): { text: string; color: string } {
  const map: Record<string, { text: string; color: string }> = {
    too_young: { text: 'Too Young', color: colors.warning },
    approaching: { text: 'Approaching', color: colors.gold },
    peak: { text: 'Peak Now', color: colors.gold },
    declining: { text: 'Declining', color: colors.gold },
    unknown: { text: 'Unknown', color: colors.textMuted },
  };
  return map[status] ?? map.unknown;
}


// Stand-in intel for the no-intel "Add Wine" flow so the shared render + save
// code can read intel.* uniformly (all blank — real intel is generated later
// from the wine card / Generate Wine Intel).
const EMPTY_INTEL: WineIntelligence = {
  criticScore: null,
  drinkingWindowFrom: null,
  drinkingWindowTo: null,
  drinkingWindowStatus: 'unknown',
  grapeVariety: null,
  tastingNotes: '',
  estimatedValue: null,
  valueSource: null,
};

export default function LabelResultsScreen() {
  const { context, fresh, backTo, via, confirm, labelId, confirmed } = useLocalSearchParams<{ context?: string; fresh?: string; backTo?: string; via?: string; confirm?: string; labelId?: string; confirmed?: string }>();
  // A caller (e.g. a lineup wine) that KNOWS the identity — never disambiguate.
  const identityConfirmed = confirmed === '1';
  const isUploadFlow = via === 'upload';
  const isWishlistFlow = context === 'wishlist';
  // Entered from Your Wine Reviews "+ Add" — the only intent is to capture
  // a review, so the action area collapses to a single "Review this Wine"
  // and the back + post-save routing land on /wines/chosen.
  const isReviewsFlow = context === 'reviews';
  // Entered from Scan a Lineup — after saving (placed or not) we return to the
  // lineup list to onboard the next bottle, rather than the rack / wine card.
  const isLineupFlow = context === 'lineup';
  // Entered from the Cellar tab's "Generate Wine Intel" — view-only. The card
  // surfaces the intel and nothing more; there's no Add-to-Cellar action here
  // (saving a bottle lives in the rack / +Add Bottles flows). Other add flows
  // — review-add, Archive a Night, manual add — keep their Add to Cellar.
  const isIntelOnlyFlow = context === 'intel';
  // Entered from Cellar List "Add Wine" — no Wine Intel card. Go straight to the
  // Add-to-Cellar confirmation (size / quantity / orientation / location); intel
  // is generated later, only from the Cellar tab's Generate Wine Intel. Both the
  // plain add and the "add into an Other Home Storage location" flow are
  // no-intel adds — 'add-location' must be included or the guard below dead-ends
  // on "No results available" and the wine never saves (regression from 7e9deec).
  const isAddFlow = context === 'add' || context === 'add-location';
  const { wineDetailsConfirmed, intelligence, imageUri, setImage, setWineDetails, setWineDetailsConfirmed, setIntelligence } = useLabelStore();
  const { session } = useAuth();
  const { wines, addWine, updateWine } = useCellar();
  const { addWine: addToWishList } = useWishList();
  const { saveManual, update: updateChosen, chosenWines } = useChosenWines();
  const { create: createLabel, remove: removeLabel, labels } = useLabels();
  const { pendingSlot, setPendingSlot, pendingSlots, setPendingSlots, setPendingWineId, setPendingStorageType, pendingStorageLocationId, setPendingStorageLocationId, pendingCaseId, setPendingCaseId } = useRackStore();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  // In the intel/search flow the currency may have been switched to a local one
  // abroad (asked once per session upstream) — display in that same currency so
  // the value labels match how the intel was priced. Other flows use the home
  // default.
  const userCurrency = (isIntelOnlyFlow ? peekIntelCurrency(preferences?.defaultCurrency) : null) ?? (preferences?.defaultCurrency ?? 'GBP');
  // A cellar wine is a long-lived home asset, so its stored value must always be
  // in the user's HOME (default) currency — never the transient abroad/session
  // currency that intel may have been priced in (peekIntelCurrency). If the
  // on-card value was priced in a different currency (you were abroad), we don't
  // carry that figure into the cellar; the cellar values it in the home currency
  // on its next valuation pass. This stops a one-off "use local currency?" choice
  // silently turning a GBP cellar into a mixed-currency one.
  const homeCurrency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const cellarValueInHomeCurrency = userCurrency.toUpperCase() === homeCurrency;

  // When Generate Wine Intel comes back empty (no score, no value) it's almost
  // always a misspelt / wrongly-ordered name — prompt the user to check it.
  const [noIntelDismissed, setNoIntelDismissed] = useState(false);
  // Weak-intel disambiguation: when intel comes back empty, auto-fetch the
  // producer's plausible bottlings so the user can confirm the exact wine.
  const [candidates, setCandidates] = useState<WineCandidate[]>([]);
  const [candidatesOpen, setCandidatesOpen] = useState(false);
  // Single-select tick in the "Which wine is this?" list (lineup-style rows).
  const [selectedCand, setSelectedCand] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [reReading, setReReading] = useState(false);
  const candidatesTriedRef = useRef(false);
  // Producer range ("where this wine sits in the lineup") — fetched once on the
  // Wine Intel card. Best-effort: an empty result simply hides the section.
  const [producerRange, setProducerRange] = useState<ProducerRange | null>(null);
  const [producerRangeLoading, setProducerRangeLoading] = useState(false);
  const producerRangeTriedRef = useRef(false);
  // The range wine the user tapped for its "inside line" note.
  const [rangeNoteWine, setRangeNoteWine] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  // Confirm-first: when the scan couldn't be verified against Wine-Searcher,
  // camera.tsx routes here with confirm=1 and no intel yet. We show typo/OCR-
  // tolerant matches and only generate the card once the user picks or confirms
  // their read — so Vinster never builds a card for a misread/fictional wine.
  const [awaitingConfirm, setAwaitingConfirm] = useState(confirm === '1' && !identityConfirmed);
  const [confirmOptions, setConfirmOptions] = useState<WineCandidate[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmGenerating, setConfirmGenerating] = useState(false);
  const confirmTriedRef = useRef(false);
  // Tap-to-enlarge the label photo on the confirm screen (pinch/zoom/pan).
  const [zoomOpen, setZoomOpen] = useState(false);
  // Vinster's Note + Vinster's Map are collapsible, both reduced by default.
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [mapExpanded, setMapExpanded] = useState(false);
  // Vinster's Vintage & Market Comparison — a third collapsible; its Wine-Searcher
  // per-vintage table is generated on first expand (N live lookups) and cached.
  const [vintagesExpanded, setVintagesExpanded] = useState(false);
  const [vintageRows, setVintageRows] = useState<VintageComparisonRow[] | null>(null);
  const [vintagesLoading, setVintagesLoading] = useState(false);
  const vintagesTriedRef = useRef(false);
  // Vintage prompt — shown when the scan couldn't read a vintage, so the user
  // enters it (or confirms NV) rather than the intel silently assuming non-vintage.
  const [vintagePromptOpen, setVintagePromptOpen] = useState(false);
  const [vintageInput, setVintageInput] = useState('');
  const vintagePromptedRef = useRef(false);

  // "Upload Again" — re-pick a label and regenerate intel in place (the upload
  // flow's equivalent of the camera's "Scan Again"). Stays on this screen; the
  // store update re-renders the card with the new wine.
  async function handleUploadAgain() {
    if (reReading) return;
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setReReading(true);
    try {
      const base64 = await prepareImageBase64(uri);
      // Read the new label FIRST — only swap the on-screen photo once the read
      // succeeds, so a failed re-read never leaves the new photo over the old wine.
      const details = await scanLabel(base64);
      setImage(uri, base64);
      setWineDetails(details);
      const confirmed: WineDetailsComplete = {
        producer: (details.producer ?? '').trim(),
        region: (details.region ?? '').trim(),
        wineName: (details.wineName ?? '').trim() || null,
        vintage: (details.vintage ?? '').trim(),
        style: (details.style ?? '').trim() || null,
        grape: (details.grape ?? '').trim() || null,
        bottleSizeMl: details.bottleSizeMl ?? null,
        quantity: details.quantity ?? 1,
      };
      setWineDetailsConfirmed(confirmed);
      const intel = await generateWineIntel(confirmed, userCurrency);
      setIntelligence(intel);
      useLastIntelStore.getState().setLast(confirmed, intel);
      // Let the disambiguation check run again for the new wine.
      candidatesTriedRef.current = false;
      setCandidates([]);
      setCandidatesOpen(false);
      setNoIntelDismissed(false);
      // New wine → re-map the producer range for it.
      producerRangeTriedRef.current = false;
      setProducerRange(null);
      // New wine → the vintage-comparison table must regenerate for it.
      vintagesTriedRef.current = false;
      setVintageRows(null);
      setVintagesExpanded(false);
      // (Label Library retired — scanned labels are no longer saved to a library;
      // the user saves the wine to Your Wine Reviews from the intel card instead.)
    } catch {
      showAlert({ title: 'Could not read that label', body: 'Please try another photo.' });
    } finally {
      setReReading(false);
    }
  }

  useEffect(() => {
    if (candidatesTriedRef.current) return;
    if (!isIntelOnlyFlow || !intelligence || !wineDetailsConfirmed) return;
    // Only offer disambiguation on a FRESH scan (fresh=1) — the label reading may
    // be off, so we let the user pick the right bottling. When VIEWING a saved
    // label's intel (Label Library, restaurants, lineup — no fresh=1), the wine
    // is already confirmed; the "Which wine is this?" prompt must not appear.
    if (identityConfirmed || fresh !== '1' || awaitingConfirm) return;
    // Offer disambiguation whenever Wine-Searcher couldn't verify the wine — the
    // score/value are then Vinster estimates, and the label reading may be off
    // (a missed cuvée). A verified real record means no need to ask.
    if (intelligence.verified) return;
    candidatesTriedRef.current = true;
    (async () => {
      try {
        const list = await fetchWineCandidates({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        // LAST RESORT only. Build a single list that INCLUDES the wine as read
        // (first) plus any genuinely-different bottlings. If there are no real
        // alternatives (the producer range is just this wine, or empty), don't
        // prompt at all — asking "which wine is this?" with one option that IS
        // the current wine is the loop the user hit. Only open with ≥2 choices.
        const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
        const readAsCand: WineCandidate = {
          wineName: wineDetailsConfirmed.wineName ?? '',
          region: wineDetailsConfirmed.region ?? null,
          style: wineDetailsConfirmed.style ?? null,
        };
        const alternatives = list.filter((c) => norm(c.wineName) !== norm(readAsCand.wineName));
        const combined = [readAsCand, ...alternatives];
        if (combined.length >= 2) { setCandidates(combined); setSelectedCand(0); setCandidatesOpen(true); }
      } catch { /* silent — NoIntelPrompt stays as the fallback */ }
    })();
  }, [intelligence, isIntelOnlyFlow, wineDetailsConfirmed]);

  // Confirm-first: load typo/OCR-tolerant matches for the unverified read so the
  // user can pick the correct wine before Vinster builds the card.
  useEffect(() => {
    if (!awaitingConfirm || confirmTriedRef.current || !wineDetailsConfirmed) return;
    confirmTriedRef.current = true;
    if (!wineDetailsConfirmed.producer?.trim()) return; // no producer to list a range for
    setConfirmLoading(true);
    (async () => {
      try {
        // The producer's full range of wines, so the user picks the right cuvée
        // (wine-candidates lists a producer's distinct bottlings; the narrower
        // wine-search returned only the exact-cuvée match).
        const list = await fetchWineCandidates({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        setConfirmOptions(list);
      } catch { /* silent — the panel falls back to "Scan Again" */ }
      finally { setConfirmLoading(false); }
    })();
  }, [awaitingConfirm, wineDetailsConfirmed]);

  // Resolve the confirm step: generate the card for the chosen identity (a picked
  // match, or the read as-is) and drop out of the confirm state.
  async function resolveConfirm(identity: WineDetailsComplete) {
    if (confirmGenerating) return;
    setConfirmGenerating(true);
    try {
      const generated = await generateWineIntel(identity, userCurrency);
      setWineDetailsConfirmed(identity);
      setIntelligence(generated);
      useLastIntelStore.getState().setLast(identity, generated);
      // The user has already confirmed the wine — don't re-prompt the post-card
      // "which wine is this?" disambiguation for the same result.
      candidatesTriedRef.current = true;
      // Re-map the producer range for the (possibly corrected) producer.
      producerRangeTriedRef.current = false;
      setProducerRange(null);
      vintagesTriedRef.current = false;
      setVintageRows(null);
      setVintagesExpanded(false);
      setAwaitingConfirm(false);
    } catch {
      showAlert({ title: 'Could not get intel', body: 'Please try again.' });
    } finally {
      setConfirmGenerating(false);
    }
  }
  // Manual correction: open the confirm/search step over an existing card, for
  // when the read looks confident but is simply the wrong wine (e.g. OCR swapped
  // in a different real producer, which verifies and never auto-prompts).
  // Android hardware/gesture back: when the "Not this wine?" search is open over
  // an existing intel card, close the search (return to the card) rather than
  // popping the whole screen back to wherever we came from.
  useEffect(() => {
    if (!(awaitingConfirm && intelligence)) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setAwaitingConfirm(false);
      return true; // handled — don't pop the route
    });
    return () => sub.remove();
  }, [awaitingConfirm, intelligence]);

  function openManualConfirm() {
    confirmTriedRef.current = false;
    setConfirmOptions([]);
    setAwaitingConfirm(true);
  }
  // Confirm-step "keep" action: on a manual re-confirm keep the existing card;
  // on the initial (no-card) confirm, generate intel for the read as-is.
  function keepCurrentOrRead() {
    if (intelligence) { setAwaitingConfirm(false); return; }
    if (wineDetailsConfirmed) resolveConfirm(wineDetailsConfirmed);
  }
  // "Scan Again" / "Upload Again" from the confirm screen — re-capture a photo
  // and re-run the same read + verify-first, so a bad photo can be redone
  // without leaving the flow. Camera re-opens the scanner; upload re-picks from
  // the library in place.
  async function recaptureFromConfirm() {
    if (!isUploadFlow) {
      router.replace(`/label/camera?context=intel${backTo ? `&backTo=${encodeURIComponent(backTo)}` : ''}` as any);
      return;
    }
    if (reReading) return;
    if (!(await ensureMediaPermission('library'))) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;
    setReReading(true);
    try {
      const base64 = await prepareImageBase64(uri);
      const details = await scanLabel(base64);
      setImage(uri, base64);
      setWineDetails(details);
      const confirmed: WineDetailsComplete = {
        producer: (details.producer ?? '').trim(),
        region: (details.region ?? '').trim(),
        wineName: (details.wineName ?? '').trim() || null,
        vintage: (details.vintage ?? '').trim(),
        style: (details.style ?? '').trim() || null,
        grape: (details.grape ?? '').trim() || null,
        bottleSizeMl: details.bottleSizeMl ?? null,
        quantity: details.quantity ?? 1,
      };
      setWineDetailsConfirmed(confirmed);
      // Verify-first again: a confident re-read goes straight to the card; an
      // unconfirmed one stays on the confirm screen with fresh matches.
      const queryName = [confirmed.producer, confirmed.wineName].filter(Boolean).join(' ').trim() || (confirmed.wineName ?? '');
      const vintageNum = confirmed.vintage && confirmed.vintage !== 'NV' ? Number(confirmed.vintage) : null;
      let verified = false;
      try {
        const pricing = await fetchPricing(queryName, Number.isFinite(vintageNum) ? vintageNum : null, userCurrency);
        verified = pricing.source === 'wine-searcher' && pricing.matched !== false;
      } catch { verified = false; }
      if (verified) {
        const intel = await generateWineIntel(confirmed, userCurrency);
        setIntelligence(intel);
        useLastIntelStore.getState().setLast(confirmed, intel);
        setAwaitingConfirm(false);
      } else {
        setIntelligence(null);
        confirmTriedRef.current = false;
        setConfirmOptions([]);
        setAwaitingConfirm(true);
      }
    } catch {
      showAlert({ title: 'Could not read that label', body: 'Please try another photo.' });
    } finally {
      setReReading(false);
    }
  }
  // Picking a bottling from the producer's range: keep the (confident) producer,
  // vintage, size and grape from the read; take the cuvée / region / style from
  // the chosen candidate.
  function pickConfirmOption(c: WineCandidate) {
    if (!wineDetailsConfirmed) return;
    resolveConfirm({
      ...wineDetailsConfirmed,
      wineName: c.wineName,
      region: c.region ?? wineDetailsConfirmed.region,
      style: c.style ?? wineDetailsConfirmed.style,
    });
  }

  // The scan couldn't read a vintage → prompt for it once, so the intel isn't
  // silently computed as non-vintage. Only fires on a fresh scan whose vintage is
  // blank (a detected 'NV' or a real year is left alone).
  useEffect(() => {
    if (vintagePromptedRef.current) return;
    if (!isIntelOnlyFlow || fresh !== '1' || awaitingConfirm || !intelligence) return;
    if ((wineDetailsConfirmed?.vintage ?? '').trim()) return;
    vintagePromptedRef.current = true;
    setVintagePromptOpen(true);
  }, [isIntelOnlyFlow, fresh, awaitingConfirm, intelligence, wineDetailsConfirmed]);

  // Save the entered vintage → rebuild the card for it (score / value / drinking
  // window all depend on the year). Reuses resolveConfirm's regenerate path.
  async function submitVintage() {
    const raw = vintageInput.trim();
    // Accept "NV" / "Non vintage" typed straight into the box (no separate link).
    if (/^(nv|non[\s-]?vintage)$/i.test(raw)) { confirmNoVintage(); return; }
    if (!/^\d{4}$/.test(raw)) {
      showAlert({ title: 'Enter a 4-digit year or NV', body: 'e.g. 2018, or NV for a non-vintage wine.' });
      return;
    }
    if (!wineDetailsConfirmed) { setVintagePromptOpen(false); return; }
    await resolveConfirm({ ...wineDetailsConfirmed, vintage: raw });
    setVintagePromptOpen(false);
  }
  function confirmNoVintage() {
    setVintagePromptOpen(false);
    if (wineDetailsConfirmed) setWineDetailsConfirmed({ ...wineDetailsConfirmed, vintage: 'NV' });
  }

  // "Where this wine sits in the producer's range" — fetched once on the Wine
  // Intel card (the producer is the reliable anchor). Silent on failure. Held
  // off during the confirm step so it runs for the CONFIRMED producer, not a
  // misread one.
  // Restore a producer range that was folded into the saved intel snapshot on a
  // previous view — no re-generation. Marks the fetch as done so it won't fire.
  useEffect(() => {
    const saved = intelligence?.producerRange;
    if (saved && saved.wines?.length && !producerRangeTriedRef.current) {
      producerRangeTriedRef.current = true;
      setProducerRange(saved);
    }
  }, [intelligence]);

  useEffect(() => {
    if (producerRangeTriedRef.current) return;
    // Already saved on the snapshot → the restore effect handles it; don't fetch.
    if (intelligence?.producerRange?.wines?.length) return;
    if (!isIntelOnlyFlow || awaitingConfirm || !wineDetailsConfirmed?.producer?.trim()) return;
    producerRangeTriedRef.current = true;
    setProducerRangeLoading(true);
    (async () => {
      try {
        const r = await fetchProducerRange({
          producer: wineDetailsConfirmed.producer,
          region: wineDetailsConfirmed.region,
          wineName: wineDetailsConfirmed.wineName,
          vintage: wineDetailsConfirmed.vintage,
        });
        if (r.wines.length > 0) {
          setProducerRange(r);
          // Fold the range into the intel snapshot so it's saved with the label
          // and reused next time instead of regenerating. Persist to the label
          // row if we know which one this is (library view passes labelId; a
          // fresh scan sets savedLabelIdRef after createLabel).
          const cur = useLabelStore.getState().intelligence;
          const merged = { ...(cur ?? {} as any), producerRange: r };
          setIntelligence(merged);
          const id = labelId ?? savedLabelIdRef.current;
          if (id) { try { await updateLabelIntel(id, merged); } catch { /* best-effort */ } }
        }
      } catch { /* silent — the section simply doesn't render */ }
      finally { setProducerRangeLoading(false); }
    })();
  }, [isIntelOnlyFlow, awaitingConfirm, wineDetailsConfirmed]);

  // Share the wine intel as plain text (identity + the three headline numbers +
  // Vinster's note), with the standard install footer. Mirrors the review-share
  // text path used elsewhere in the app.
  async function handleShare() {
    if (sharing) return;
    setSharing(true);
    try {
      const w = wineDetailsConfirmed;
      const header = [w?.producer, w?.wineName, w?.vintage].filter((s) => s && String(s).trim()).join(' ');
      const scoreLine = intel.criticScore != null ? `\nScore: ${intel.criticScore}/100` : '';
      const valueLine = intel.estimatedValue != null
        ? `\nValue: ${formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 })}${intel.valueSource === 'vinster' ? ' (Vinster estimate)' : ''}`
        : '';
      const windowLine = intel.drinkingWindowFrom && intel.drinkingWindowTo
        ? `\nDrinking window: ${intel.drinkingWindowFrom}–${intel.drinkingWindowTo}`
        : '';
      const noteLine = intel.tastingNotes?.trim() ? `\n\n"${intel.tastingNotes.trim()}"` : '';
      const message = `${header}${scoreLine}${valueLine}${windowLine}${noteLine}${VINSTER_TEXT_SHARE_FOOTER}`;
      await Share.share({ message, title: header || 'Wine Intel' });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  // Confirm a candidate → update the identity and regenerate intel for it.
  async function pickCandidate(c: WineCandidate) {
    if (!wineDetailsConfirmed || regenerating) return;
    // Never re-prompt for this scan once the user has chosen (prevents the loop).
    candidatesTriedRef.current = true;
    const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
    // Picking the wine as-read (option 1) needs no regeneration — just close.
    if (norm(c.wineName) === norm(wineDetailsConfirmed.wineName)) { setCandidatesOpen(false); return; }
    const updated = {
      ...wineDetailsConfirmed,
      wineName: c.wineName,
      region: c.region ?? wineDetailsConfirmed.region,
      style: c.style ?? wineDetailsConfirmed.style,
    };
    setWineDetailsConfirmed(updated);
    setRegenerating(true);
    try {
      const fresh = await generateWineIntel(updated, userCurrency);
      setIntelligence(fresh);
      setCandidatesOpen(false);
    } catch {
      showAlert({ title: 'Could not update', body: 'Please try again.' });
    } finally {
      setRegenerating(false);
    }
  }

  const [addingToCellar, setAddingToCellar] = useState(false);
  const [addingToWishList, setAddingToWishList] = useState(false);
  const [addingReview, setAddingReview] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  // Bespoke cellar Location (rack_id NULL custom filter) chosen as the
  // destination — mutually exclusive with a rack/fridge selection.
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  // True once the user types in the price field — so an untouched auto-filled
  // estimate is saved as an estimate, and a hand-entered price is not.
  const [purchasePriceUserEdited, setPurchasePriceUserEdited] = useState(false);
  // Pre-populate the bottle size picker from the label scanner. Lazy init
  // reads the labelStore once at mount; the user can still adjust the
  // chip selection afterwards on the Add modals.
  const [bottleSizeMl, setBottleSizeMl] = useState<number>(() =>
    useLabelStore.getState().wineDetailsConfirmed?.bottleSizeMl ?? 750
  );
  const [saving, setSaving] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  // Review-without-adding form state — captured in a Modal and saved to
  // chosen_wines without touching cellar or wishlist inventory.
  const [reviewNote, setReviewNote] = useState('');
  const [reviewRestaurant, setReviewRestaurant] = useState('');
  const [reviewCity, setReviewCity] = useState('');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewListPrice, setReviewListPrice] = useState('');
  // Only used when the user came in from a tapped empty rack slot.
  const [placeCount, setPlaceCount] = useState('1');
  const [placeOrientation, setPlaceOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  // Add-to-Cellar form: how many bottles, which compact field dropdown is
  // open, and the "Other" custom bottle size.
  // Seed from a batched lineup quantity when present (e.g. a "×2" lineup entry
  // pre-fills 2); plain single-bottle scans carry nothing and default to 1.
  const [bottleCount, setBottleCount] = useState(() =>
    Math.max(1, useLabelStore.getState().wineDetailsConfirmed?.quantity ?? 1)
  );
  const [openField, setOpenField] = useState<null | 'storage' | 'bottle' | 'count' | 'packaging'>(null);
  // How a wine is packaged in an Other Home Storage location. Loose = no case;
  // the rest create a storage_cases row of that kind (migration 073).
  const PACKAGING = [
    { k: 'loose', label: 'Loose Bottle(s)' },
    { k: 'owc', label: 'OWC' },
    { k: 'non_owc', label: 'Non-OWC Case' },
    { k: 'mixed', label: 'Mixed Case' },
  ] as const;
  // Case storage (add-to-location flow, migration 069). 'loose' files the wine
  // straight into the location; 'single'/'mixed' also box it in a named case.
  const [storageKind, setStorageKind] = useState<'loose' | 'owc' | 'non_owc' | 'mixed'>('loose');
  const [caseName, setCaseName] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [customSizeMode, setCustomSizeMode] = useState(false);
  const [customSizeCl, setCustomSizeCl] = useState('');

  // When the user came in from a specific empty rack slot, load that
  // rack's slots so a multi-bottle placement can skip any occupied ones.
  const { data: pendingRackSlots = [] } = useQuery({
    queryKey: ['rack-slots', pendingSlot?.rackId],
    queryFn: () => getRackSlots(pendingSlot!.rackId),
    enabled: !!pendingSlot,
  });

  // Bespoke cellar-wide Locations (rack_id NULL) — offered as destinations in
  // the Add flow alongside Cellar List and the racks/fridges. Per-rack filters
  // are deliberately excluded.
  const { data: cellarLocations = [] } = useQuery({
    queryKey: ['cellar-locations', session?.user.id],
    queryFn: () => fetchCellarLocations(session!.user.id),
    enabled: !!session?.user.id,
  });

  // Existing case names in the target location, offered as quick-pick chips when
  // naming a case — so a user can drop a wine into a case they've already made
  // (e.g. add another bottle to "Meyney Case"). Empty cases are auto-removed, so
  // only cases that still hold wine appear here.
  const { data: locationCases = [] } = useQuery({
    queryKey: ['storage-location-cases', pendingStorageLocationId],
    queryFn: () => fetchStorageLocationCases(pendingStorageLocationId!),
    enabled: !!pendingStorageLocationId && context === 'add-location',
  });

  // Default name for a whole-wine case (OWC / Non-OWC): the wine itself —
  // producer · name · region · vintage as one line, e.g. "Château Petrus
  // Pomerol 2008". When the location already holds a case of the same wine, the
  // new one is numbered ("No2 …") so identical cases stay distinguishable. The
  // user can still edit it. Mixed cases are named by the user instead.
  function autoCaseName(): string {
    const base = [
      wine.producer,
      wine.wineName && wine.wineName.trim() && wine.wineName.trim() !== (wine.producer ?? '').trim() ? wine.wineName : null,
      wine.region,
      wine.vintage,
    ]
      .map((s) => (s == null ? '' : String(s).trim()))
      .filter((s) => s.length > 0)
      .join(' ');
    if (!base) return '';
    // Count existing whole-wine cases of this same base (ignoring any "NoN "
    // prefix already applied), so the next one continues the numbering.
    const stripNo = (s: string) => s.trim().replace(/^no\s*\d+\s+/i, '').toLowerCase();
    const dupes = locationCases.filter((c) => c.kind !== 'mixed' && stripNo(c.name) === base.toLowerCase()).length;
    return dupes >= 1 ? `No${dupes + 1} ${base}` : base;
  }

  // Across-all-racks placement map, so the duplicate prompt can tell the user
  // *where* their existing bottles already sit (e.g. "in your Kitchen rack").
  const allRackIds = racks.map((r) => r.id);
  const { data: allSlotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', allRackIds],
    queryFn: () => getSlotAssignments(allRackIds),
    enabled: allRackIds.length > 0,
  });

  // Human-readable description of where a cellar wine's bottles are placed.
  // Returns "in your X rack", "across your X and Y racks", or "unplaced".
  function existingLocationText(cellarWineId: string): string {
    const rackNames = Array.from(
      new Set(
        allSlotAssignments
          .filter((s) => s.cellar_wine_id === cellarWineId)
          .map((s) => racks.find((r) => r.id === s.rack_id)?.name)
          .filter((n): n is string => !!n),
      ),
    );
    if (rackNames.length === 0) return 'not yet in a rack';
    if (rackNames.length === 1) return `in your ${rackNames[0]} rack`;
    return `across your ${rackNames.slice(0, -1).join(', ')} and ${rackNames[rackNames.length - 1]} racks`;
  }

  // Pre-fill the purchase price with Vinster's estimate (now real Wine-Searcher
  // market data when matched) so the field starts populated in every add flow —
  // not just when the Add-to-Cellar button's onPress happens to fire first.
  useEffect(() => {
    const est = intelligence?.estimatedValue;
    if (est != null) setPurchasePrice((prev) => prev || String(est));
  }, [intelligence?.estimatedValue]);

  // Some add flows skip full Wine Intel (notably add-to-location under Other
  // Home Storage), so `intelligence` is null and the price never pre-filled.
  // Fetch a real Wine-Searcher market price directly so the Estimated Purchase
  // Price/Bottle is populated in EVERY add flow. Runs once; a user-typed price
  // is left untouched.
  // Estimate stamped onto the saved wine when full Wine Intel was skipped, so
  // add-to-location wines still contribute to Total Estimated Current Value.
  const [prefetchedValue, setPrefetchedValue] = useState<{ value: number; source: string } | null>(null);
  const pricePrefetchedRef = useRef(false);
  useEffect(() => {
    if (!isAddFlow || pricePrefetchedRef.current) return;
    if (intelligence?.estimatedValue != null) return; // already have an estimate
    const w = wineDetailsConfirmed;
    if (!w) return;
    const queryName = [w.producer, w.wineName].filter(Boolean).join(' ').trim() || (w.wineName ?? '');
    if (!queryName) return;
    pricePrefetchedRef.current = true;
    const vintageNum = w.vintage && w.vintage !== 'NV' ? Number(w.vintage) : null;
    const vint = Number.isFinite(vintageNum as number) ? (vintageNum as number) : null;
    (async () => {
      try {
        // 1) Wine-Searcher — real market price.
        const p = await fetchPricing(queryName, vint, userCurrency);
        if (p.source === 'wine-searcher' && p.matched !== false && p.averageMarketPrice != null) {
          setPurchasePrice((prev) => prev || String(p.averageMarketPrice));
          setPrefetchedValue({ value: p.averageMarketPrice, source: 'wine-searcher' });
          return;
        }
        // 2) Wine-Searcher has no price → Vinster estimates one from the
        //    producer / region / vintage (Claude), so every wine gets a value
        //    bar the genuinely un-estimable.
        const intel = await getWineIntelligence(
          { producer: w.producer ?? '', region: w.region ?? '', wineName: w.wineName ?? null, vintage: w.vintage || 'NV', style: (w as any).style ?? null },
          userCurrency,
          null,
        );
        if (intel.estimatedValue != null) {
          setPurchasePrice((prev) => prev || String(Math.round(intel.estimatedValue as number)));
          setPrefetchedValue({ value: intel.estimatedValue, source: 'vinster' });
        }
      } catch { /* leave blank on failure */ }
    })();
  }, [isAddFlow, wineDetailsConfirmed, intelligence?.estimatedValue, userCurrency]);

  // Add flow has no intel card — drop the user straight onto the Add-to-Cellar
  // confirmation (size / quantity / orientation / location).
  useEffect(() => {
    if (isAddFlow) setAddingToCellar(true);
  }, [isAddFlow]);

  // Label Library retired — scanned labels are no longer auto-saved to a
  // library. The user files the wine into Your Wine Reviews from the intel card
  // ("Save to Your Wine Reviews") instead. Ref kept (always null) so the few
  // remaining references stay harmless.
  const savedLabelIdRef = useRef<string | null>(null);

  // Duplicate-detection memos. These MUST run before any early-return (the guard
  // below, and the confirm-first early-return) — otherwise toggling awaitingConfirm
  // changes the number of hooks React sees between renders and crashes the screen
  // ("Rendered more/fewer hooks than during the previous render").
  //
  // Find an existing active cellar row for the same wine identity. Match on
  // producer + wine_name + vintage (case-insensitive). Falls back to a SWAPPED
  // match (producer↔wine_name) so OCR flips on boutique wines like Mullineux
  // Schist still merge into the same entry. Avoids duplicate entries and avoids
  // regenerating wine-intelligence (non-deterministic drinking windows).
  const matchingExisting = useMemo(() => {
    if (!wineDetailsConfirmed || !wines) return null;
    const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
    const wantedProducer = norm(wineDetailsConfirmed.producer);
    const wantedName = norm(wineDetailsConfirmed.wineName || wineDetailsConfirmed.producer);
    const wantedVintage = (wineDetailsConfirmed.vintage ?? '').trim();
    const exact = wines.find((w) =>
      norm(w.producer) === wantedProducer &&
      norm(w.wine_name) === wantedName &&
      (w.vintage ?? '').trim() === wantedVintage
    );
    if (exact) return exact;
    // Swapped match — OCR flipped producer and wine name on a previous scan.
    if (wantedProducer && wantedName && wantedProducer !== wantedName) {
      const swapped = wines.find((w) =>
        norm(w.producer) === wantedName &&
        norm(w.wine_name) === wantedProducer &&
        (w.vintage ?? '').trim() === wantedVintage
      );
      if (swapped) return swapped;
    }
    return null;
  }, [wineDetailsConfirmed, wines]);

  // Fuzzy-duplicate check — a partial hand-typed name vs a fuller scanned one
  // (e.g. "Pavillon Rouge 2009" vs "Chateau Margaux Pavillon Rouge 2009"). Same
  // vintage required; token-subset match on combined producer + wine_name, with
  // the shorter set needing ≥2 tokens so single grape words don't false-positive.
  const fuzzyExisting = useMemo(() => {
    if (!wineDetailsConfirmed || !wines) return null;
    if (matchingExisting) return null; // exact / swapped wins
    const wantedVintage = (wineDetailsConfirmed.vintage ?? '').trim();
    if (!wantedVintage) return null;

    function tokenise(s: string): Set<string> {
      return new Set(
        s.toLowerCase()
          .replace(/[^a-z0-9 ]/g, ' ')
          .split(/\s+/)
          .filter((t) => t.length >= 3),
      );
    }
    const wantedCombined = `${wineDetailsConfirmed.producer ?? ''} ${wineDetailsConfirmed.wineName ?? ''}`;
    const wantedTokens = tokenise(wantedCombined);
    if (wantedTokens.size < 2) return null;

    for (const w of wines) {
      if ((w.vintage ?? '').trim() !== wantedVintage) continue;
      const cellarCombined = `${w.producer ?? ''} ${w.wine_name ?? ''}`;
      const cellarTokens = tokenise(cellarCombined);
      if (cellarTokens.size < 2) continue;
      const [small, big] =
        wantedTokens.size <= cellarTokens.size
          ? [wantedTokens, cellarTokens]
          : [cellarTokens, wantedTokens];
      let allIn = true;
      for (const t of small) {
        if (!big.has(t)) { allIn = false; break; }
      }
      if (allIn) return w;
    }
    return null;
  }, [wineDetailsConfirmed, wines, matchingExisting]);

  // The Add flow legitimately has no intel; the confirm-first step deliberately
  // has none yet; every other flow needs it.
  if (!wineDetailsConfirmed || (!intelligence && !isAddFlow && !awaitingConfirm)) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No results available.</Text>
        <TouchableOpacity onPress={() => router.replace('/label/camera')}>
          <Text style={styles.linkText}>Scan a label</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wine = wineDetailsConfirmed;
  const intel = intelligence ?? EMPTY_INTEL;

  // Confirm screen: shown either when a scan couldn't be verified (no card yet),
  // or when the user taps "Not this wine?" to correct a confident misread over an
  // existing card. The user picks the correct wine (typo/OCR-corrected) or keeps
  // what's there; picking rebuilds the card, keeping leaves it untouched.
  if (awaitingConfirm) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => {
            // Reached here via "Not this wine?" FROM an existing intel card →
            // return to that card (close the search), don't exit the whole flow.
            // Only leave to backTo on the initial confirm (no card yet).
            if (intelligence) setAwaitingConfirm(false);
            else router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan');
          }}
        >
          <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Confirm this wine</Text>

        <View style={styles.header}>
          {imageUri ? (
            <TouchableOpacity onPress={() => setZoomOpen(true)} activeOpacity={0.85}>
              <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : null}
          {/* Full identity reference — producer, wine name, vintage, region,
              grape — so the user has the complete wine to check against while
              confirming (this is the key reference on the page). */}
          <View style={styles.headerText}>
            <WineIdentityHeader
              producer={wine.producer}
              wineName={wine.wineName}
              vintage={wine.vintage}
              region={wine.region}
              grape={wine.grape}
              align="left"
              size="md"
            />
          </View>
        </View>

        <View style={styles.section}>
          {confirmGenerating ? (
            <View style={styles.confirmLoading}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.confirmLoadingText}>Building your wine intel…</Text>
            </View>
          ) : (
            <>
              <Text style={styles.confirmTitle}>Confirm which wine this is</Text>
              {confirmLoading ? (
                <View style={styles.confirmLoading}>
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.confirmLoadingText}>Finding close matches…</Text>
                </View>
              ) : confirmOptions.length > 0 ? (
                confirmOptions.map((r, i) => (
                  <TouchableOpacity
                    key={`${r.wineName ?? ''}-${i}`}
                    style={styles.confirmRow}
                    onPress={() => pickConfirmOption(r)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmRowName} numberOfLines={2}>
                      {formatWineTitle({ producer: wine.producer, wineName: r.wineName, region: r.region, vintage: wine.vintage })}
                    </Text>
                    {r.style ? <Text style={styles.confirmRowMeta}>{r.style}</Text> : null}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.confirmBody}>No close matches found — try another photo.</Text>
              )}
              {/* Keep the current wine only applies to a manual re-confirm over an
                  existing card; the initial confirm offers a re-capture instead. */}
              {intelligence ? (
                <TouchableOpacity style={styles.confirmPrimary} onPress={keepCurrentOrRead} activeOpacity={0.85}>
                  <Text style={styles.confirmPrimaryText}>Keep the current wine</Text>
                </TouchableOpacity>
              ) : (
                <>
                  {/* Accept the read as-is — Vinster builds intel from exactly
                      what was scanned (same as manual input), inferring the grape
                      and details even when the catalog had no close match. */}
                  <TouchableOpacity style={styles.confirmPrimary} onPress={keepCurrentOrRead} activeOpacity={0.85}>
                    <Text style={styles.confirmPrimaryText}>Yes, this is my wine</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmPrimary} onPress={recaptureFromConfirm} activeOpacity={0.85}>
                    <Text style={styles.confirmPrimaryText}>{isUploadFlow ? 'Upload Again' : 'Scan Again'}</Text>
                  </TouchableOpacity>
                  {/* Vinster couldn't find it — let the user type it in by hand
                      rather than only re-capturing. */}
                  <TouchableOpacity
                    style={styles.confirmManualLink}
                    onPress={() => {
                      // Clear the just-scanned wine so its grape / bottle size /
                      // quantity don't leak into the fresh manual entry (the
                      // confirm screen only blanks the visible fields).
                      useLabelStore.getState().reset();
                      router.replace(`/label/confirm?manual=1&mode=input&context=intel&backTo=${encodeURIComponent('/(tabs)')}`);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.confirmManualText}>Manually input wine</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        <LabelPhotoViewer visible={zoomOpen} uri={imageUri} onClose={() => setZoomOpen(false)} />

        {/* Re-reading overlay while a re-capture is processed. */}
        <Modal visible={reReading} transparent animationType="fade">
          <View style={styles.reReadOverlay}>
            <ActivityIndicator size="large" color={colors.gold} />
            <Text style={styles.reReadText}>Finding this wine…</Text>
          </View>
        </Modal>
      </ScrollView>
    );
  }

  function computeSlots(
    startRow: number, startCol: number,
    totalRows: number, totalCols: number,
    count: number, orient: 'Horizontal' | 'Vertical',
    largeFormatCols?: number | null,
  ): Array<{ row: number; col: number }> {
    const result: Array<{ row: number; col: number }> = [];
    // Large-format row (row_index = -1) is a one-row band above the
    // standard grid. Cap placement to that row's width and force
    // horizontal orientation so magnums can never bleed into 750ml slots.
    const inLargeFormat = startRow === -1;
    if (inLargeFormat) {
      const lfCols = largeFormatCols ?? 0;
      let col = startCol;
      for (let i = 0; i < count; i++) {
        if (col >= lfCols) break;
        result.push({ row: -1, col });
        col++;
      }
      return result;
    }
    let row = startRow;
    let col = startCol;
    for (let i = 0; i < count; i++) {
      if (row >= totalRows || col >= totalCols) break;
      result.push({ row, col });
      if (orient === 'Horizontal') {
        col++;
        if (col >= totalCols) { col = 0; row++; }
      } else {
        row++;
        if (row >= totalRows) { row = 0; col++; }
      }
    }
    return result;
  }

  function buildWinePayload(userId: string) {
    const parsedPrice = parseFloat(purchasePrice);
    const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
    return {
      user_id: userId,
      wine_name: wine.wineName ?? wine.producer,
      producer: wine.producer,
      region: wine.region,
      vintage: wine.vintage,
      // Number of bottles chosen in the Add to Cellar form. When the bottles
      // are later placed into specific rack slots, the placement count
      // refines this; for "save without placing" it stands as the quantity.
      quantity: bottleCount,
      storage_location: null,
      date_received: new Date().toISOString().split('T')[0],
      critic_score: intel.criticScore,
      critic_score_note: intel.criticScoreNote ?? null,
      drinking_window_from: intel.drinkingWindowFrom,
      drinking_window_to: intel.drinkingWindowTo,
      drinking_window_status: intel.drinkingWindowStatus,
      tasting_notes: intel.tastingNotes,
      grape_variety: intel.grapeVariety,
      label_image_path: null,
      user_notes: null,
      is_wishlist: false,
      // Prefer the intel estimate; otherwise fall back to the value we pre-fetched
      // for the add card (Wine-Searcher, or Vinster's own estimate) so add flows
      // that skip full intel still contribute to Total Estimated Current Value.
      estimated_value: cellarValueInHomeCurrency ? (intel.estimatedValue ?? prefetchedValue?.value ?? null) : null,
      estimated_value_currency: homeCurrency,
      estimated_value_at: (cellarValueInHomeCurrency && (intel.estimatedValue != null || prefetchedValue != null)) ? new Date().toISOString() : null,
      // The Wine-Searcher offer spread the headline value averages (from full
      // intel; the price-prefetch add path has only the single figure). Only
      // kept when the value is in the home currency (see cellarValueInHomeCurrency).
      estimated_value_low: cellarValueInHomeCurrency ? (intel.estimatedValueLow ?? null) : null,
      estimated_value_high: cellarValueInHomeCurrency ? (intel.estimatedValueHigh ?? null) : null,
      // Real Wine-Searcher market price vs Claude estimate — drives the card's
      // value source label.
      estimated_value_source: intel.estimatedValue != null ? (intel.valueSource ?? 'vinster') : (prefetchedValue?.source ?? null),
      // Exact-vintage vs all-vintage fallback, so the cellar card can label a
      // stored WS value the same way the scan card does (null = treated as exact).
      estimated_value_scope: intel.estimatedValue != null ? (intel.priceScope ?? null) : null,
      // Canonical identity anchor when Wine-Searcher matched this wine.
      ws_wine_id: intel.wsWineId ?? null,
      ws_wine_name: intel.wsWineName ?? null,
      purchase_price: validPrice,
      purchase_price_currency: userCurrency,
      // A price the user never touched came from the auto-estimate → flag it so
      // they can review it later on the Cellar Value screen.
      purchase_price_estimated: validPrice != null && !purchasePriceUserEdited,
      bottle_size_ml: bottleSizeMl,
    };
  }

  async function handleAddToWishList() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await addToWishList.mutateAsync({ ...buildWinePayload(session.user.id), is_wishlist: true });
      setAddingToWishList(false);
      // Include the vintage in the confirmation so the user sees the
      // full identity of what just landed ("Château Margaux 2013",
      // not "Château Margaux"). Falls back to whichever pieces are
      // populated when scan-label couldn't pull a vintage.
      const confirmLabel = [wine.producer, wine.wineName, wine.vintage]
        .filter((s) => s && String(s).trim().length > 0)
        .join(' ');
      showAlert({
        title: 'Added to Wish List',
        body: `${confirmLabel || (wine.wineName ?? wine.producer ?? 'This wine')} has been saved to your wish list.`,
        // When the user came in via the wish-list flow they're expecting to
        // land back on the wish list, not the wine card. Route there from OK.
        buttons: isWishlistFlow
          ? [{ text: 'OK', onPress: () => router.replace('/cellar/wishlist') }]
          : undefined,
      });
    } catch (err) {
      // Surface the underlying error rather than the generic message so
      // RLS / FK / schema failures are visible.
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to wish list', body: detail });
    } finally {
      setSaving(false);
    }
  }

  // Single place that handles all post-save routing — used by both the new-
  // entry path and the merge-with-existing path. NOTE: don't call
  // labelStore.reset() here. Clearing wineDetailsConfirmed while the
  // addingToCellar Modal is still animating closed causes the modal's body
  // (which references `wine.wineName`) to re-render with a null wine,
  // crashing into the ErrorBoundary as "Something Went Wrong". The store
  // will be naturally replaced on the next label scan.

  async function performSaveFlow(savedWineId: string, mode: 'new' | 'merge', baseQuantity: number) {
    // Home storage location: the label flow was entered from a location's "add
    // a wine" button (context 'add-location' — the gate makes a stale pending id
    // harmless on any other flow). File the saved wine in and return to it.
    if (pendingStorageLocationId && context === 'add-location') {
      const locQty = Math.max(1, bottleCount);
      // Filing into a location means the wine is no longer racked. A re-scanned
      // wine that already sat in a rack would otherwise be counted twice — once
      // via its rack slots and once via the location's summed quantity (S3).
      await clearWineFromRacks(savedWineId);
      await updateWine.mutateAsync({
        id: savedWineId,
        updates: { quantity: mode === 'merge' ? baseQuantity + locQty : locQty, storage_location_id: pendingStorageLocationId },
      });
      // Case boxing: attach to the case we were told to (the "add another to
      // this case" loop) or create a fresh one from the storage-kind choice.
      // Non-fatal — a failure still leaves the wine filed loose in the location.
      try {
        if (pendingCaseId) {
          await assignWineToCase(savedWineId, pendingCaseId);
        } else if (storageKind !== 'loose' && session?.user.id) {
          // Merge into an existing case of the same name only for MIXED cases —
          // they're the only kind another wine can join. Complete/OWC cases are
          // single-wine, so they always create a fresh case even on a name clash.
          const wanted = caseName.trim().toLowerCase();
          const existingCase = wanted && storageKind === 'mixed'
            ? locationCases.find((c) => c.kind === 'mixed' && c.name.trim().toLowerCase() === wanted)
            : undefined;
          if (existingCase) {
            await assignWineToCase(savedWineId, existingCase.id);
          } else {
            const created = await createStorageCase(session.user.id, {
              storageLocationId: pendingStorageLocationId,
              name: caseName,
              kind: storageKind,
              note: caseNote,
            });
            try {
              await assignWineToCase(savedWineId, created.id);
            } catch (assignErr) {
              // Roll back the just-created case — a create that succeeds followed
              // by a failed assign otherwise commits a zero-member case that (per
              // D1) is invisible and undeletable (D2).
              try { await deleteStorageCase(created.id); } catch { /* best-effort */ }
              throw assignErr;
            }
          }
        }
      } catch { /* wine is still filed in the location */ }
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['storage-location-wines', pendingStorageLocationId] });
      qc.invalidateQueries({ queryKey: ['storage-location-cases', pendingStorageLocationId] });
      qc.invalidateQueries({ queryKey: ['storage-locations', session?.user.id] });
      const dest = pendingStorageLocationId;
      setPendingStorageLocationId(null);
      setPendingCaseId(null);
      setAddingToCellar(false);
      router.replace(`/cellar/storage-location/${dest}` as any);
      return;
    }
    // Gate on context === 'place' so a stale pendingSlot (left by an abandoned
    // rack-placement flow, never cleared on cancel) can't silently hijack an
    // unrelated wine save into that slot — mirrors confirm.tsx's guard.
    if (pendingSlot && context === 'place') {
      // Soft warning when the bottle's size doesn't match the slot's
      // expected size. Fires once before placement runs; user can
      // continue or cancel back into the Add modal.
      const mismatch = detectPlacementMismatch(
        bottleSizeMl,
        pendingSlot.row,
        pendingSlot.largeFormatBottleSizeMl,
      );
      if (mismatch) {
        const proceed = await new Promise<boolean>((resolve) => {
          showAlert({
            title: 'Bottle size mismatch',
            body: placementWarningBody(mismatch),
            buttons: [
              { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
              { text: 'Place anyway', onPress: () => resolve(true) },
            ],
          });
        });
        if (!proceed) {
          setSaving(false);
          return;
        }
      }
      // User came in from a specific empty rack slot. Place the requested
      // number of bottles from that slot — skipping any occupied slots in
      // the path — and set the wine's quantity to match what was placed.
      const occupied = new Set(
        pendingRackSlots.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`),
      );
      let placed: Array<{ row: number; col: number }>;
      if (pendingSlots && pendingSlots.length > 0) {
        // Multi-slot: the user hand-picked exactly these slots — fill each one,
        // skipping any that got occupied since they were selected.
        const free = pendingSlots.filter((s) => !occupied.has(`${s.row},${s.col}`));
        placed = free.length > 0 ? free : pendingSlots.slice(0, 1);
      } else {
        const requested = Math.max(1, parseInt(placeCount, 10) || 1);
        const allSlots = computeSlots(pendingSlot.row, pendingSlot.col, pendingSlot.rows, pendingSlot.cols, requested, placeOrientation, pendingSlot.largeFormatCols);
        const freeSlots = allSlots.filter((s) => !occupied.has(`${s.row},${s.col}`));
        // The tapped slot is empty by definition; fall back to it if a race
        // somehow leaves nothing free.
        placed = freeSlots.length > 0 ? freeSlots : allSlots.slice(0, 1);
      }
      await assignSlots(pendingSlot.rackId, placed, savedWineId);
      const targetQuantity = mode === 'new' ? placed.length : baseQuantity + placed.length;
      if (targetQuantity !== baseQuantity) {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: targetQuantity } });
      }
      qc.invalidateQueries({ queryKey: ['rack-slots', pendingSlot.rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setPendingSlot(null);
      setPendingSlots(null);
      setAddingToCellar(false);
      // Camera/confirm now use router.replace so the stack is short by the
      // time we land here. A clean router.replace keeps the back-stack tidy.
      router.replace(isLineupFlow ? '/cellar/scan-lineup' : `/cellar/rack/${pendingSlot.rackId}`);
      return;
    }

    // Lineup onboarding: each wine is saved (unplaced) and we return to the
    // lineup list to do the next bottle — destination choice doesn't apply.
    if (isLineupFlow) {
      if (mode === 'merge') {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + 1 } });
      }
      setAddingToCellar(false);
      router.replace('/cellar/scan-lineup');
      return;
    }

    // ---- Cellar List "Add Wine" flow ----
    const qty = Math.max(1, bottleCount);

    // Bespoke cellar Location: tag the wine to that location and leave it
    // unplaced (locations aren't grid racks — no slots / orientation).
    if (selectedLocationId) {
      await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: mode === 'merge' ? baseQuantity + qty : qty } });
      try { await addWinesToFilter(selectedLocationId, [savedWineId]); } catch { /* tag is best-effort */ }
      qc.invalidateQueries({ queryKey: ['cellar-locations', session?.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setAddingToCellar(false);
      // Land on the Full Cellar List with a brief auto-fading toast (no popup).
      router.replace('/cellar/list?added=1');
      return;
    }

    // A live rack/fridge: auto-place the bottles from the first free slot in
    // the chosen orientation, then land on the rack.
    if (selectedRackId && selectedRackId !== '__new__') {
      const rack = racks.find((r) => r.id === selectedRackId);
      if (rack) {
        const slots = await getRackSlots(selectedRackId);
        const occupied = new Set(slots.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
        let start: { row: number; col: number } | null = null;
        for (let r = 0; r < rack.rows && !start; r++) {
          for (let c = 0; c < rack.cols; c++) {
            if (!occupied.has(`${r},${c}`)) { start = { row: r, col: c }; break; }
          }
        }
        if (start) {
          const candidate = computeSlots(start.row, start.col, rack.rows, rack.cols, qty, placeOrientation, rack.large_format_cols);
          const free = candidate.filter((s) => !occupied.has(`${s.row},${s.col}`));
          const placed = free.length > 0 ? free : [start];
          await assignSlots(selectedRackId, placed, savedWineId);
          const targetQuantity = mode === 'merge' ? baseQuantity + placed.length : placed.length;
          await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: targetQuantity } });
          qc.invalidateQueries({ queryKey: ['rack-slots', selectedRackId] });
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          qc.invalidateQueries({ queryKey: ['cellar'] });
          setAddingToCellar(false);
          if (placed.length < qty) {
            showAlert({
              title: 'Placed what fit',
              body: `Only ${placed.length} of ${qty} bottle${qty === 1 ? '' : 's'} fit from the first free slot — the rest weren't placed.`,
              buttons: [{ text: 'OK', onPress: () => router.replace(`/cellar/rack/${selectedRackId}` as any) }],
            });
          } else {
            // No confirmation popup — landing on the rack with the bottles in
            // place is confirmation enough; keep the add flow quick so the user
            // can move straight to the next wine.
            router.replace(`/cellar/rack/${selectedRackId}` as any);
          }
          return;
        }
        showAlert({ title: 'Rack full', body: 'There were no free slots, so this wine was saved to your Full Cellar List instead.' });
      }
    }

    // "+ New Location" — the wine is saved to the cellar; ask what kind of
    // storage location to set up, then route to its builder. Rack/Fridge carry
    // the wine as pending so the new grid prompts "tap a slot to place it";
    // Bin / Other Location leave it in the cellar to file afterwards.
    if (selectedRackId === '__new__') {
      if (mode === 'merge') {
        await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + qty } });
      }
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setAddingToCellar(false);
      showAlert({
        title: 'What Kind of Storage Location?',
        body: 'Your wine is saved to the cellar — set up where it lives.',
        buttons: [
          { text: 'Rack', onPress: () => { setPendingWineId(savedWineId); setPendingStorageType('rack'); router.replace('/cellar/rack/resize' as any); } },
          { text: 'Fridge', onPress: () => { setPendingWineId(savedWineId); setPendingStorageType('fridge'); router.replace('/cellar/rack/resize' as any); } },
          { text: 'Bin (diamonds)', onPress: () => router.replace('/cellar/bin/resize' as any) },
          { text: 'Alt Cellar', onPress: () => router.replace('/cellar/storage-location/new' as any) },
          { text: 'Cancel', style: 'cancel', onPress: () => router.replace('/cellar/list?added=1' as any) },
        ],
      });
      return;
    }

    // Cellar List (unplaced) — land on the Full Cellar List, NOT the wine card.
    // Opening the card auto-generates intel; adding should stay quick, with intel
    // generated only when the user deliberately taps into a wine to view it.
    if (mode === 'merge') {
      await updateWine.mutateAsync({ id: savedWineId, updates: { quantity: baseQuantity + qty } });
    }
    setAddingToCellar(false);
    // Land on the Full Cellar List with a brief auto-fading toast (no popup).
    router.replace('/cellar/list?added=1');
  }

  async function performNewEntry() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const saved = await addWine.mutateAsync(buildWinePayload(session.user.id));
      // Persist the scanned label photo as this wine's framed thumbnail.
      // Best-effort: a photo failure must never block the cellar save.
      const labelUri = useLabelStore.getState().imageUri;
      if (labelUri) {
        try {
          const path = await uploadLabelImage(session.user.id, labelUri, saved.id);
          await updateWine.mutateAsync({ id: saved.id, updates: { label_image_path: path } });
        } catch (photoErr) {
          console.warn('[label-photo] upload failed (non-fatal):', photoErr);
        }
      }
      await performSaveFlow(saved.id, 'new', 1);
    } catch (err) {
      // Surface the underlying error so RLS / FK / schema failures are
      // visible instead of swallowed under a generic message.
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function performMerge(target?: { id: string; quantity: number } | null) {
    // Accept an explicit target so the fuzzy-duplicate path can merge
    // into a row that isn't an exact identity hit. Falls back to the
    // exact match for the original entry-point.
    const merge = target ?? matchingExisting;
    if (!merge) return;
    setSaving(true);
    try {
      // Quantity is reconciled inside performSaveFlow — it differs for the
      // place-in-slot path (adds the placed count) vs the non-slot paths.
      await performSaveFlow(merge.id, 'merge', merge.quantity);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveReview() {
    if (!session?.user.id) return;
    // If this wine already has a review, prompt to update / add a dated
    // tasting / create new — same guard the List + manual-add flows use,
    // so scanning or uploading a label for a wine you've reviewed before
    // never silently creates a duplicate review.
    const parsedVintage = parseInt(wine.vintage, 10);
    const validVintage = !Number.isNaN(parsedVintage) ? parsedVintage : null;
    const wineNameValue = wine.wineName ?? wine.producer;
    const existing = findExistingReview(chosenWines, { producer: wine.producer, wineName: wineNameValue, vintage: validVintage });
    if (existing) {
      showAlert({
        title: "You've reviewed this wine before",
        body: `You already have a review for ${wineNameValue}. Update it, add a new dated tasting to it, or start a fresh review?`,
        buttons: [
          { text: 'Update review', onPress: () => { void doSaveReview('update', existing); } },
          { text: 'Add to review', onPress: () => { void doSaveReview('append', existing); } },
          { text: 'Create new', onPress: () => { void doSaveReview('create', null); } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await doSaveReview('create', null);
  }

  async function doSaveReview(mode: 'create' | 'update' | 'append', existing: ChosenWine | null) {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const parsedScore = parseInt(reviewScore, 10);
      const validScore = !Number.isNaN(parsedScore) && parsedScore >= 0 && parsedScore <= 100 ? parsedScore : null;
      const parsedPrice = parseFloat(reviewListPrice);
      const validPrice = !Number.isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null;
      const parsedVintage = parseInt(wine.vintage, 10);
      const validVintage = !Number.isNaN(parsedVintage) ? parsedVintage : null;
      if (mode === 'create' || !existing) {
        await saveManual.mutateAsync({
          wineName: wine.wineName ?? wine.producer,
          producer: wine.producer,
          region: wine.region,
          vintage: validVintage,
          restaurantName: reviewRestaurant,
          city: reviewCity,
          listPrice: validPrice,
          currency: userCurrency,
          tastingNote: reviewNote,
          otherObservations: '',
          userScore: validScore,
          isFavourite: false,
          // The "Review without adding" path on the Cellar add-wine
          // flow isn't a restaurant scan and isn't a cellar wine — it's
          // a standalone review. Mark it 'other' so the Your Wine
          // Reviews Type filter can split it out from the Restaurant
          // bucket. Manual-entry-via-Reviews-tab continues to fall back
          // to the DB default 'restaurant'.
          source: 'other',
        });
      } else {
        const identity = { producer: existing.producer, wineName: existing.wine_name, vintage: existing.vintage };
        if (mode === 'update') {
          await updateChosen.mutateAsync({
            id: existing.id,
            input: { restaurantName: reviewRestaurant, city: reviewCity, tastingNote: reviewNote, otherObservations: existing.other_observations ?? '', userScore: validScore, listPrice: validPrice, isFavourite: existing.is_favourite, ...identity },
          });
        } else {
          // Append a dated tasting onto the existing review, keeping its
          // original where/when/price/score intact.
          const label = todayLabel();
          await updateChosen.mutateAsync({
            id: existing.id,
            input: {
              restaurantName: existing.restaurant_name ?? '',
              city: existing.city ?? '',
              tastingNote: appendDatedEntry(existing.tasting_note, reviewNote, label),
              otherObservations: existing.other_observations ?? '',
              userScore: validScore != null ? validScore : existing.user_score,
              listPrice: existing.menu_price,
              isFavourite: existing.is_favourite,
              ...identity,
            },
          });
        }
      }
      setAddingReview(false);
      if (isReviewsFlow) {
        // Entered from Your Wine Reviews — go straight back there so the
        // user sees the new review land in the list.
        router.replace('/wines/chosen');
      } else {
        showAlert({
          title: 'Review saved',
          body: 'Your tasting note is in Your Wine Reviews.',
          buttons: [
            { text: 'View reviews', onPress: () => router.replace('/wines/chosen') },
            { text: 'Done', style: 'cancel', onPress: () => router.replace('/(tabs)/cellar') },
          ],
        });
      }
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save review', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToCellar() {
    if (!session?.user.id) return;
    // A case must be named — Vinster no longer silently saves it as "Case".
    // Skipped when filing into an already-chosen case (pendingCaseId), which
    // carries its own name.
    if (context === 'add-location' && storageKind !== 'loose' && !pendingCaseId && !caseName.trim()) {
      showAlert({ title: 'Case name needed', body: 'Give this case a name before adding — e.g. "Mixed Burgundy".' });
      return;
    }
    // Scanning a wine to add to a home storage location, but that wine already
    // sits UNPLACED in the cellar → offer to place the existing listing here
    // (rather than duplicating it) or just bump the existing count.
    if (context === 'add-location' && matchingExisting && pendingStorageLocationId
        && !matchingExisting.storage_location_id && !matchingExisting.bin_cell_id) {
      const target = matchingExisting;
      const destLoc = pendingStorageLocationId;
      const addCount = Math.max(1, bottleCount);
      const existingQty = target.quantity;
      const wineLabel = `${target.wine_name}${target.vintage ? ` ${target.vintage}` : ''}`;
      showAlert({
        title: 'Already in your cellar!',
        body: `You already have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel} not yet in a home storage location. Should Vinster place your existing listing here?`,
        buttons: [
          { text: 'Yes, place existing wines', onPress: async () => {
            setSaving(true);
            try {
              await clearWineFromRacks(target.id);
              await updateWine.mutateAsync({ id: target.id, updates: { storage_location_id: destLoc, bin_cell_id: null, case_id: pendingCaseId ?? null } });
              qc.invalidateQueries({ queryKey: ['cellar'] });
              qc.invalidateQueries({ queryKey: ['storage-location-wines', destLoc] });
              qc.invalidateQueries({ queryKey: ['storage-locations'] });
              setPendingStorageLocationId(null); setPendingCaseId(null); setAddingToCellar(false);
              router.replace(`/cellar/storage-location/${destLoc}` as any);
            } catch (err) { showAlert({ title: 'Could not place', body: err instanceof Error ? err.message : 'Please try again.' }); }
            finally { setSaving(false); }
          } },
          { text: 'No, add to existing wines', onPress: async () => {
            setSaving(true);
            try {
              await updateWine.mutateAsync({ id: target.id, updates: { quantity: target.quantity + addCount } });
              qc.invalidateQueries({ queryKey: ['cellar'] });
              setPendingStorageLocationId(null); setPendingCaseId(null); setAddingToCellar(false);
              router.replace('/cellar/list?added=1');
            } catch (err) { showAlert({ title: 'Could not add', body: err instanceof Error ? err.message : 'Please try again.' }); }
            finally { setSaving(false); }
          } },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    if (matchingExisting) {
      // Exact match (producer + wine name + vintage). We never create a
      // second Full Cellar List line for the same bottle — that would
      // fragment the count. Instead we tell the user where their existing
      // bottles are and fold this one into that listing's total.
      const existingQty = matchingExisting.quantity;
      const wineLabel = `${matchingExisting.wine_name}${matchingExisting.vintage ? ` ${matchingExisting.vintage}` : ''}`;
      const where = existingLocationText(matchingExisting.id);
      showAlert({
        title: 'Already in your cellar',
        body: `You have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel} ${where}. Vinster won't create a duplicate listing — this bottle is added to that total.`,
        buttons: [
          { text: 'Add to my bottles', onPress: () => performMerge() },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    // Near-duplicate caught by fuzzy-token match — same vintage, one
    // wine's name is a token-subset of the other (e.g. "Pavillon
    // Rouge 2009" vs "Chateau Margaux Pavillon Rouge 2009"). Surface
    // the full label of the cellar match so the user can confirm.
    if (fuzzyExisting) {
      const existingQty = fuzzyExisting.quantity;
      const producerPart = fuzzyExisting.producer ? `${fuzzyExisting.producer} ` : '';
      const vintagePart = fuzzyExisting.vintage ? ` ${fuzzyExisting.vintage}` : '';
      const wineLabel = `${producerPart}${fuzzyExisting.wine_name}${vintagePart}`.trim();
      // Capture by value so the alert callbacks can't see a stale
      // fuzzyExisting if the user pauses on the prompt while the
      // cellar query refetches in the background.
      const mergeTarget = { id: fuzzyExisting.id, quantity: existingQty };
      showAlert({
        title: 'Similar wine in your cellar',
        body: `There is a similar wine in your cellar — is this the same as ${wineLabel}? You currently have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of it.`,
        buttons: [
          { text: 'Yes, same wine', onPress: () => performMerge(mergeTarget) },
          { text: 'No, create a new line', onPress: performNewEntry },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await performNewEntry();
  }

  // Compact Add-to-Cellar field dropdowns.
  const storageLabel = selectedRackId === '__new__'
    ? '+ New Location'
    : selectedRackId
      ? (racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack')
      : selectedLocationId
        ? (cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'Location')
        : 'Cellar List';
  // Destinations: Cellar List (unplaced), each rack/fridge, each bespoke cellar
  // Location, then "+ Create new rack". Per-rack filters are deliberately not
  // offered here. Picking one kind clears the other so they stay exclusive.
  const fieldOptions: { label: string; value: string | number; onSelect: () => void }[] =
    openField === 'storage'
      ? [
          { label: 'Cellar List', value: 'none', onSelect: () => { setSelectedRackId(null); setSelectedLocationId(null); } },
          ...racks.map((r) => ({ label: `Save to ${r.name}`, value: r.id, onSelect: () => { setSelectedRackId(r.id); setSelectedLocationId(null); } })),
          ...cellarLocations.map((l) => ({ label: `Save to ${l.name}`, value: `loc:${l.id}`, onSelect: () => { setSelectedLocationId(l.id); setSelectedRackId(null); } })),
          { label: '+ New Location', value: '__new__', onSelect: () => { setSelectedRackId('__new__'); setSelectedLocationId(null); } },
        ]
      : openField === 'bottle'
        ? [
            ...COMMON_BOTTLE_SIZES.map((s) => ({ label: s.label, value: s.ml, onSelect: () => { setBottleSizeMl(s.ml); setCustomSizeMode(false); } })),
            { label: 'Other…', value: 'other', onSelect: () => setCustomSizeMode(true) },
          ]
        : openField === 'count'
          ? Array.from({ length: 12 }, (_, i) => ({ label: String(i + 1), value: i + 1, onSelect: () => setBottleCount(i + 1) }))
          : openField === 'packaging'
            ? PACKAGING.map((p) => ({ label: p.label, value: p.k, onSelect: () => {
                setStorageKind(p.k);
                // Whole-wine cases auto-name after the wine (editable); mixed
                // cases are named by the user; loose needs no case name.
                if (p.k === 'owc' || p.k === 'non_owc') setCaseName(autoCaseName());
                else setCaseName('');
              } }))
            : [];

  const windowM = windowMeta(intel.drinkingWindowStatus);

  // The three headline stats are tappable — each opens a short "why" popup.
  function openScoreInfo() {
    const body = intel.criticScoreNote?.trim()
      || "Vinster's score distils critic consensus and Wine-Searcher's aggregate rating for this wine into a single 100-point mark.";
    showAlert({ title: 'How Vinster scored this', body });
  }
  function openValueInfo() {
    let body: string;
    if (intel.valueSource === 'wine-searcher') {
      body = intel.estimatedValueLow != null && intel.estimatedValueHigh != null && intel.estimatedValueLow !== intel.estimatedValueHigh
        ? `Wine-Searcher values range from ${formatCurrency(intel.estimatedValueLow, userCurrency, { decimals: 0 })}–${formatCurrency(intel.estimatedValueHigh, userCurrency, { decimals: 0 })}${intel.priceScope === 'all-vintage' ? ', across all vintages (no price for this exact vintage).' : '.'}`
        : `Wine-Searcher's live market value${intel.priceScope === 'all-vintage' ? ', averaged across all vintages (no price for this exact vintage).' : ' for this wine.'}`;
    } else if (intel.valueSource === 'vinster' && intel.estimatedValue != null) {
      body = "This value is Vinster's own estimate — there's no Wine-Searcher price for this exact wine.";
    } else {
      body = "There's no Wine-Searcher price for this wine.";
    }
    showAlert({ title: 'Where this value comes from', body });
  }
  function openWindowInfo() {
    const status = windowMeta(intel.drinkingWindowStatus).text;
    const yrs = intel.drinkingWindowFrom && intel.drinkingWindowTo ? `\n\n${intel.drinkingWindowFrom} – ${intel.drinkingWindowTo}` : '';
    showAlert({ title: 'Drinking Window', body: `Drinking Window: ${status}${yrs}` });
  }

  // Vinster's Vintage & Market Comparison — generate the Wine-Searcher per-vintage
  // table on first expand (N live lookups; cached after so re-opening is instant).
  function toggleVintages() {
    const opening = !vintagesExpanded;
    setNoteExpanded(false); setMapExpanded(false);
    setVintagesExpanded(opening);
    if (opening && !vintagesTriedRef.current && wine) {
      vintagesTriedRef.current = true;
      setVintagesLoading(true);
      const queryName = [wine.producer, wine.wineName].filter(Boolean).join(' ').trim() || (wine.wineName ?? '');
      const scanned = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : NaN;
      fetchVintageComparison(queryName, userCurrency, Number.isFinite(scanned) ? scanned : null)
        .then((rows) => setVintageRows(rows))
        .catch(() => setVintageRows([]))
        .finally(() => setVintagesLoading(false));
    }
  }

  // Dive Deeper works pre-save: the wine-knowledge screen falls back to query
  // params when the path id matches no cellar row (so we pass a placeholder id
  // + the wine fields). It just won't cache, which is fine for a preview.
  // "Save to Your Wine Reviews" — replaces the retired Label Library. Review now
  // (opens the +Add review pre-filled) or later (files it as an awaiting pick).
  function handleSaveToReviews() {
    if (!wine) return;
    const label = [wine.producer, wine.wineName, wine.vintage].filter(Boolean).join(' ');
    showAlert({
      title: 'Save to Your Wine Reviews',
      body: `${label}\n\nReview it now, or save it to review later?`,
      buttons: [
        {
          text: 'Review now',
          onPress: () => {
            const qs = new URLSearchParams({ seedAdd: '1' });
            if (wine.producer) qs.set('sp', wine.producer);
            if (wine.wineName) qs.set('sw', wine.wineName);
            if (wine.vintage) qs.set('sv', wine.vintage);
            if (wine.region) qs.set('sr', wine.region);
            // Carry the scanned label into the +Add review as a local uri to
            // upload on save (slu = seed label uri, read from the label store).
            if (imageUri) qs.set('slu', '1');
            router.push(`/wines/chosen?${qs.toString()}` as any);
          },
        },
        { text: 'Review later', onPress: () => void saveReviewLater() },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveReviewLater() {
    if (!wine) return;
    const vn = wine.vintage && wine.vintage !== 'NV' ? Number(wine.vintage) : null;
    try {
      const row = await saveManual.mutateAsync({
        wineName: wine.wineName ?? '', producer: wine.producer ?? '', region: wine.region ?? '',
        vintage: Number.isFinite(vn as number) ? (vn as number) : null,
        restaurantName: '', city: '', listPrice: null, currency: userCurrency,
        tastingNote: '', otherObservations: '', userScore: null, isFavourite: false,
        source: 'other',
      });
      // Carry the scanned label photo onto the review. The intel flow keeps the
      // shot as a local uri only (the Label Library auto-upload was retired), so
      // upload it against the new review's id and stamp the path. Best-effort:
      // a failed upload must not lose the review the user just saved.
      const labelUri = useLabelStore.getState().imageUri;
      if (row?.id && labelUri && session?.user?.id) {
        try {
          const path = await uploadLabelImage(session.user.id, labelUri, row.id);
          await patchChosenWine(row.id, { label_image_path: path });
        } catch { /* label image is best-effort — keep the saved review */ }
      }
      showAlert({
        title: 'Saved to Your Wine Reviews',
        body: 'It\'s waiting in Your Wine Reviews for you to review when you\'re ready.',
        buttons: [{ text: 'View', onPress: () => router.push('/wines/chosen') }, { text: 'OK', style: 'cancel' }],
      });
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function handleDiveDeeper() {
    const q = [
      `producer=${encodeURIComponent(wine.producer ?? '')}`,
      `region=${encodeURIComponent(wine.region ?? '')}`,
      `wineName=${encodeURIComponent(wine.wineName ?? '')}`,
      `vintage=${encodeURIComponent(wine.vintage ?? '')}`,
      `grape=${encodeURIComponent(intel.grapeVariety ?? '')}`,
    ].join('&');
    router.push(`/cellar/wine-knowledge/preview?${q}`);
  }

  // Chef pairing also works pre-save: wineDetailsConfirmed is already in the
  // label store (it's what this card renders), so from=cellar ("bottle known")
  // generates pairings straight away without needing a cellar wine id.
  function handleChefPairing() {
    // backTo=intel threads through to the recipe results screen so its Back pops
    // straight back to THIS Wine Intel card, not out to the Pair tab.
    router.push('/chef/review-requirements?from=cellar&backTo=intel');
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.dismissTo(
          backTo ? (decodeURIComponent(backTo) as any)
          : isWishlistFlow ? '/cellar/wishlist'
          : isReviewsFlow ? '/wines/chosen'
          : isLineupFlow ? '/cellar/scan-lineup'
          // Wine Intel is launched from the Scan tab now, so return there by
          // default rather than the old Cellar home. Non-Scan origins should
          // still pass an explicit backTo.
          : isIntelOnlyFlow ? '/(tabs)/scan'
          : '/(tabs)/cellar'
        )}
      >
        <Text accessibilityLabel="Back" style={[styles.backLink, { color: colors.gold, fontSize: 22 }]}>←</Text>
      </TouchableOpacity>

      {/* Share the intel card (top-right). Replaces the old Scan/Upload Again
          action — re-reading a bottle is still available from the Scan tab. */}
      {isIntelOnlyFlow ? (
        <TouchableOpacity
          style={styles.scanAgainBtn}
          onPress={handleShare}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
          disabled={sharing}
        >
          <Text style={styles.scanAgainText}>{sharing ? 'Exporting…' : 'Export'}</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.pageTitle}>{context === 'add-location' ? 'Add to Location' : isAddFlow ? 'Add to Cellar' : 'Wine Intel'}</Text>

      {/* One separator line beneath the title. The stats bar itself now sits
          lower — below the wine identity, just above Vinster's Note / Map. */}
      {!isAddFlow ? <View style={styles.titleRule} /> : null}

      {/* Header block: the wine-card row + the "Not this wine?" link both sit
          ABOVE the separator line (the block's bottom border). */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          {/* Wine-card layout: the scanned/uploaded label photo on the left, the
              wine identity (name · region · grape) on its right. Manual entries
              have no imageUri, so the text column simply fills the row. */}
          {imageUri ? (
            <TouchableOpacity onPress={() => setZoomOpen(true)} activeOpacity={0.85}>
              <Image source={{ uri: imageUri }} style={styles.heroImage} resizeMode="cover" />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerText}>
            {/* Full wine identity — Producer · Name · Vintage (white), Region +
                Grape (gold) — the app-wide format, wrapping rather than truncating. */}
            <WineIdentityHeader
              producer={wine.producer}
              wineName={wine.wineName}
              vintage={wine.vintage}
              region={wine.region}
              grape={intel.grapeVariety ?? wine.grape}
              align="left"
              size="md"
            />
          </View>
        </View>

        {/* Always-available correction — centred, above the separator line. Even
            a confident card can be the wrong wine (OCR can swap in a different
            real producer, which verifies and never auto-prompts). */}
        {isIntelOnlyFlow && intelligence ? (
          <TouchableOpacity onPress={openManualConfirm} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} style={styles.wrongWineLink} activeOpacity={0.7}>
            <Text style={styles.wrongWineText}>Not this wine? Search for the right one</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tap the label photo to view it full-screen with pinch/zoom + pan. */}
      <LabelPhotoViewer visible={zoomOpen} uri={imageUri} onClose={() => setZoomOpen(false)} />

      {/* Generate Wine Intel came back empty → prompt to check the name/format. */}
      {/* Weak intel: if we found candidate bottlings, the disambiguation modal
          takes over; otherwise fall back to the check-details prompt. */}
      <NoIntelPrompt
        visible={isIntelOnlyFlow && intelligence != null && intel.criticScore == null && intel.estimatedValue == null && !noIntelDismissed && !candidatesOpen && candidates.length === 0}
        onDismiss={() => setNoIntelDismissed(true)}
        onEdit={() => router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan')}
        editLabel="Check details"
      />

      {/* Upload Again — re-reading the new photo + regenerating intel. */}
      <Modal visible={reReading} transparent animationType="fade">
        <View style={styles.reReadOverlay}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.reReadText}>Finding this wine…</Text>
        </View>
      </Modal>

      {/* Vintage prompt — the label had no readable vintage. */}
      <Modal visible={vintagePromptOpen} transparent animationType="fade" onRequestClose={() => setVintagePromptOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            {confirmGenerating ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Updating for {vintageInput}…</Text></View>
            ) : (
              <>
                <Text style={styles.candTitle}>What's the vintage?</Text>
                <Text style={styles.candBody}>Vinster couldn't read the vintage from the label. Enter the year — or "NV" for a non-vintage wine — so the score, value and drinking window are accurate.</Text>
                <TextInput
                  style={styles.vintagePromptInput}
                  value={vintageInput}
                  onChangeText={(t) => setVintageInput(t.replace(/[^0-9a-zA-Z ]/g, '').slice(0, 12))}
                  placeholder="e.g. 2018 or NV"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={12}
                  autoFocus
                />
                <TouchableOpacity style={styles.candConfirmBtn} onPress={submitVintage} activeOpacity={0.8}>
                  <Text style={styles.candConfirmText}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.candCancel} onPress={() => setVintagePromptOpen(false)} activeOpacity={0.7}>
                  <Text style={styles.candCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* "Which wine is this?" — Claude's list of this producer's plausible
          bottlings, shown when intel came back weak. Picking one regenerates
          intel for the exact wine. */}
      <Modal visible={candidatesOpen} transparent animationType="fade" onRequestClose={() => !regenerating && setCandidatesOpen(false)}>
        <View style={styles.candOverlay}>
          <View style={styles.candSheet}>
            <Text style={styles.candTitle}>Which wine is this?</Text>
            <Text style={styles.candBody}>We couldn't find a confident match. Pick the exact {wine.producer} wine to get accurate intel — it may be a bottling the label reading missed.</Text>
            {regenerating ? (
              <View style={styles.candLoading}><ActivityIndicator color={colors.gold} /><Text style={styles.candLoadingText}>Getting intel…</Text></View>
            ) : (
              <>
                <ScrollView style={{ maxHeight: 320 }}>
                  {candidates.map((c, i) => {
                    const on = selectedCand === i;
                    return (
                      <TouchableOpacity key={`${c.wineName}-${i}`} style={styles.candRow} onPress={() => setSelectedCand(on ? null : i)} activeOpacity={0.7}>
                        <Text style={[styles.candCheck, on && styles.candCheckOn]}>{on ? '☑' : '☐'}</Text>
                        <View style={styles.candRowText}>
                          <Text style={styles.candItemName} numberOfLines={2}>{formatWineTitle({ producer: wine.producer, wineName: c.wineName, region: c.region, vintage: wine.vintage })}</Text>
                          {c.style ? <Text style={styles.candItemMeta} numberOfLines={1}>{c.style}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={[styles.candConfirmBtn, selectedCand == null && styles.candConfirmBtnDisabled]}
                  onPress={() => { if (selectedCand != null) pickCandidate(candidates[selectedCand]); }}
                  disabled={selectedCand == null}
                  activeOpacity={0.8}
                >
                  <Text style={styles.candConfirmText}>Select This Wine</Text>
                </TouchableOpacity>
              </>
            )}
            {/* No "None of these — keep as is": the wine as read is already the
                first option in the list, so picking it keeps it. */}
          </View>
        </View>
      </Modal>

      {/* Intel content — hidden in the Add flow, which carries no intel (it's
          generated later, only from Generate Wine Intel). */}
      {!isAddFlow && (
        <>
          {/* Gold stats bar — moved here, beneath the wine identity and above
              Vinster's Note / Map. Full-width yellow rules top and bottom (the
              bottom rule is the separator above the Note/Map section). Three
              tappable figures — Score · Value · Drinking Window — each opening a
              short "why" popup. */}
          <View style={styles.statBarRule} />
          <View style={styles.statBar}>
            <TouchableOpacity style={styles.statBarItem} onPress={openScoreInfo} disabled={intel.criticScore == null} activeOpacity={0.7}>
              <Text style={[styles.statBarValueGold, intel.criticScore == null && styles.statBarValueMuted]}>
                {intel.criticScore != null ? `${intel.criticScore}/100` : '—'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.statBarSepGold}>·</Text>
            <TouchableOpacity style={styles.statBarItem} onPress={openValueInfo} disabled={intel.estimatedValue == null} activeOpacity={0.7}>
              <Text style={[styles.statBarValueGold, intel.estimatedValue == null && styles.statBarValueMuted]}>
                {intel.estimatedValue != null ? formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 }) : '—'}
              </Text>
            </TouchableOpacity>
            <Text style={styles.statBarSepGold}>·</Text>
            <TouchableOpacity style={styles.statBarItem} onPress={openWindowInfo} disabled={!(intel.drinkingWindowFrom && intel.drinkingWindowTo) && intel.drinkingWindowStatus === 'unknown'} activeOpacity={0.7}>
              <Text style={[styles.statBarValueGold, !(intel.drinkingWindowFrom && intel.drinkingWindowTo) && styles.statBarValueMuted]}>
                {intel.drinkingWindowFrom && intel.drinkingWindowTo ? `${intel.drinkingWindowFrom} - ${intel.drinkingWindowTo}` : '—'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statBarRule} />

          {/* Vinster's Note + Vinster's Map share ONE section — squeezed directly
              one above the other with no separator between them; the section's
              bottom border is the only separator (it sits below the Map, before
              The Inside Line). "(what's this)" is replaced by the explainer shown
              in gold italics below the note when it's open. */}
          <View style={styles.noteMapSection}>
            {/* Vinster's Note (left) and Vinster's Map (right) share ONE centred
                line with an indent between them; each expands its body below. */}
            <View style={styles.noteMapHeadingRow}>
              <VinstersNoteHeading expanded={noteExpanded} onToggle={() => { setMapExpanded(false); setNoteExpanded((v) => !v); }} hideExplainerLink />
              <TouchableOpacity style={styles.mapHeadingRow} onPress={() => { setNoteExpanded(false); setMapExpanded((v) => !v); }} activeOpacity={0.7}>
                <Text style={styles.mapTitle}>Vinster's Map</Text>
                <Text style={styles.mapChevron}>{mapExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
            </View>
            {noteExpanded ? <Text style={styles.tastingNotes}>{intel.tastingNotes}</Text> : null}
            {noteExpanded ? <Text style={styles.noteExplainer}>{VINSTERS_NOTE_EXPLAINER}</Text> : null}
            {mapExpanded ? (
              <Text style={styles.mapBody}>
                Soon, Vinster will offer a map of this wine's region and where the particular producer places within it. It'll show next to the highest profile producers in the region for comparison. We're currently working on Bordeaux, Burgundy, Champagne, California's North Coast, and Piedmont for a start.
              </Text>
            ) : null}
          </View>

          {/* Vinster's Vintage & Market Comparison — a third collapsible with a
              chevron matching the Note/Map above. On first expand it generates a
              Wine-Searcher per-vintage table (aggregate critic score + market
              price). Intel view only — it needs live lookups. */}
          {isIntelOnlyFlow ? (
            <View style={styles.vintageSection}>
              <TouchableOpacity style={styles.vintageHeadingRow} onPress={toggleVintages} activeOpacity={0.7}>
                <Text style={styles.mapTitle}>Vinster's Vintage &amp; Market Comparison</Text>
                <Text style={styles.mapChevron}>{vintagesExpanded ? '⌃' : '⌄'}</Text>
              </TouchableOpacity>
              {vintagesExpanded ? (
                vintagesLoading ? (
                  <View style={styles.vintageLoading}>
                    <ActivityIndicator color={colors.gold} />
                    <Text style={styles.vintageLoadingText}>Checking Wine-Searcher across vintages…</Text>
                  </View>
                ) : vintageRows && vintageRows.length > 0 ? (
                  <View style={styles.vintageTable}>
                    <View style={[styles.vintageRow, styles.vintageHeadRow]}>
                      <Text style={[styles.vintageCell, styles.vintageColYear, styles.vintageHeadCell]}>Vintage</Text>
                      <Text style={[styles.vintageCell, styles.vintageColScore, styles.vintageHeadCell]}>Score</Text>
                      <Text style={[styles.vintageCell, styles.vintageColPrice, styles.vintageHeadCell]}>Price</Text>
                    </View>
                    {vintageRows.map((r) => (
                      <View key={r.vintage} style={[styles.vintageRow, String(r.vintage) === (wine.vintage ?? '') && styles.vintageRowThis]}>
                        <Text style={[styles.vintageCell, styles.vintageColYear]}>{r.vintage}</Text>
                        <Text style={[styles.vintageCell, styles.vintageColScore]}>{r.score != null ? `${r.score}/100` : '—'}</Text>
                        <Text style={[styles.vintageCell, styles.vintageColPrice]}>{r.price != null ? formatCurrency(r.price, userCurrency, { decimals: 0 }) : '—'}</Text>
                      </View>
                    ))}
                    <Text style={styles.vintageFootnote}>Wine-Searcher market value and aggregate critic score, by vintage.</Text>
                  </View>
                ) : (
                  <Text style={styles.vintageEmpty}>Wine-Searcher has no per-vintage listings for this wine.</Text>
                )
              ) : null}
            </View>
          ) : null}

          {/* The Inside Line — the "sommelier best friend" verdict: how this
              vintage actually fared and how this producer stacked up against its
              peers that year. Real in-the-know context, not a dictionary entry. */}
          {intel.insiderNote?.trim() ? (
            <View style={styles.section}>
              <Text style={styles.insiderTitle}>The Inside Line</Text>
              <Text style={styles.insiderBody}>{intel.insiderNote.trim()}</Text>
              {isIntelOnlyFlow ? (
                <TouchableOpacity onPress={handleDiveDeeper} activeOpacity={0.7}>
                  <Text style={styles.diveDeeperLink}>Dive deeper into this wine →</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : isIntelOnlyFlow ? (
            // No inside line for this wine — still offer the deep-dive link.
            <View style={styles.section}>
              <TouchableOpacity onPress={handleDiveDeeper} activeOpacity={0.7}>
                <Text style={styles.diveDeeperLink}>Dive deeper into this wine →</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Where this wine sits in the producer's range — the context most
              wine apps don't offer. Wine Intel card only (needs a live lookup). */}
          {isIntelOnlyFlow && (producerRangeLoading || (producerRange && producerRange.wines.length > 0)) ? (
            <View style={styles.section}>
              <Text style={styles.rangeTitle}>The {wine.producer} range</Text>
              {producerRange && producerRange.wines.length > 0 ? (
                <Text style={styles.rangeHint}>Tap a wine for its inside line</Text>
              ) : null}
              {producerRange ? (
                <>
                  {producerRange.wines.map((rw, i) => (
                    <TouchableOpacity key={`${rw.wineName}-${i}`} style={[styles.rangeRow, rw.isThis && styles.rangeRowThis]} onPress={() => setRangeNoteWine(rw.wineName)} activeOpacity={0.7}>
                      <View style={styles.rangeRowMain}>
                        <Text style={[styles.rangeMarker, !rw.isThis && styles.rangeMarkerHidden]}>▸</Text>
                        <Text style={[styles.rangeName, rw.isThis && styles.rangeNameThis]} numberOfLines={2}>{rw.wineName}</Text>
                      </View>
                      <View style={styles.rangeRight}>
                        <Text style={[styles.rangeBand, rw.isThis && styles.rangeBandThis]}>{currencySymbol(userCurrency).repeat(rw.band)}</Text>
                        {rw.tier ? <Text style={styles.rangeTier}>{rw.tier}</Text> : null}
                      </View>
                    </TouchableOpacity>
                  ))}
                  {producerRange.summary ? <Text style={styles.rangeSummary}>{producerRange.summary}</Text> : null}
                </>
              ) : (
                <View style={styles.rangeLoading}>
                  <ActivityIndicator color={colors.gold} />
                  <Text style={styles.rangeLoadingText}>Mapping the range…</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Inside-line note for a tapped range wine. */}
          <RangeWineNoteSheet
            producer={wine.producer}
            wineName={rangeNoteWine}
            region={wine.region}
            visible={!!rangeNoteWine}
            onClose={() => setRangeNoteWine(null)}
          />
        </>
      )}

      {/* Generate Wine Intel (view-only) gets the two deep-dive actions beneath
          Vinster's note. Estimated value now lives in the compact grid above,
          so it isn't repeated here. */}
      {isIntelOnlyFlow ? (
        <View style={styles.section}>
          <TouchableOpacity style={styles.saveReviewBtn} onPress={handleSaveToReviews} activeOpacity={0.85}>
            <Text style={styles.saveReviewBtnText}>Save to Your Wine Reviews</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveReviewBtn, { marginTop: spacing.sm }]}
            onPress={() => {
              // Seed the price field with Vinster's estimate so the user adjusts
              // rather than typing from scratch (mirrors the dedicated add flow).
              if (!purchasePrice && intel.estimatedValue != null) setPurchasePrice(String(intel.estimatedValue));
              setAddingToCellar(true);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.saveReviewBtnText}>Save to Your Cellar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveReviewBtn, { marginTop: spacing.sm }]} onPress={handleChefPairing} activeOpacity={0.85}>
            <Text style={styles.saveReviewBtnText}>Find me a Recipe</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {!isAddFlow && (
        <View style={styles.section}>
          <View style={styles.communityRow}>
            <Text style={styles.communityLabel}>Community notes on this wine</Text>
            <Text style={styles.communityComingSoon}>coming soon</Text>
          </View>
          <Text style={styles.communityCaption}>See what other Vinster users have noted about this wine.</Text>
        </View>
      )}

      {isWishlistFlow ? (
        // User entered the flow via "Add to Wish List" — they've already
        // decided this wine is going to the wish list. Skip the dual-button
        // decision and offer a single confirm.
        <>
          <View style={styles.singleActionRow}>
            <TouchableOpacity
              style={[styles.singleActionButton, saving && { opacity: 0.6 }]}
              onPress={handleAddToWishList}
              disabled={saving}
            >
              <Text style={styles.singleActionButtonText}>
                {saving ? 'Adding…' : 'Confirm Add to Wish List'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/cellar/wishlist')}>
            <Text style={styles.discardText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : isReviewsFlow ? (
        // User entered via Your Wine Reviews "+ Add" → Scan / Upload. The
        // intent is to capture a review, not park inventory — show only
        // the Review action.
        <>
          <View style={styles.singleActionRow}>
            <TouchableOpacity
              style={[styles.singleActionButton, saving && { opacity: 0.6 }]}
              onPress={() => setAddingReview(true)}
              disabled={saving}
            >
              <Text style={styles.singleActionButtonText}>Review this Wine</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/wines/chosen')}>
            <Text style={styles.discardText}>Cancel</Text>
          </TouchableOpacity>
        </>
      ) : isIntelOnlyFlow ? (
        // Cellar tab "Generate Wine Intel" — view-only. No Add to Cellar action
        // (deliberately removed when the add-a-wine routes were simplified);
        // this flow exists purely to surface the intel card.
        <TouchableOpacity style={styles.discardButton} onPress={() => router.dismissTo(backTo ? (decodeURIComponent(backTo) as any) : '/(tabs)/scan')}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
      ) : (
        <>
          {/* This is the dedicated Add-to-Cellar flow (Cellar → Add Wine),
              a committed action — so only the primary Add to Cellar button
              shows. Wish List and review-only capture have their own entry
              points and aren't offered here. */}
          <View style={styles.actionStack}>
            <TouchableOpacity
              style={styles.primaryAddBtn}
              onPress={() => {
                // Seed the price field with Vinster's estimate so the user
                // adjusts for accuracy rather than entering from scratch.
                if (!purchasePrice && intel.estimatedValue != null) setPurchasePrice(String(intel.estimatedValue));
                setAddingToCellar(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryAddBtnText}>Add to Cellar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.discardButton} onPress={() => { setPendingStorageLocationId(null); router.replace('/(tabs)/cellar'); }}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={addingToWishList} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Wish List</Text>
            <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>

            <Text style={styles.modalLabel}>Bottle size</Text>
            <View style={styles.bottleSizeWrap}>
              <BottleSizePicker value={bottleSizeMl} onChange={setBottleSizeMl} />
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddToWishList}
              disabled={saving}
            >
              <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save to Wish List'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingToWishList(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addingReview} transparent animationType="slide" onRequestClose={() => !saving && setAddingReview(false)}>
        <View style={styles.modalOverlay}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            bottomOffset={24}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Review this Wine</Text>
              <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>
              <Text style={styles.modalHint}>Save your tasting note for this wine without adding it to your cellar or wish list.</Text>

              <Text style={styles.modalLabel}>Tasting note</Text>
              <TextInput
                style={styles.reviewNoteInput}
                value={reviewNote}
                onChangeText={setReviewNote}
                placeholder="What did you think?"
                placeholderTextColor={colors.textSubtle}
                multiline
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>Restaurant (optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewRestaurant}
                onChangeText={setReviewRestaurant}
                placeholder="Where did you drink it?"
                placeholderTextColor={colors.textSubtle}
              />

              <Text style={styles.modalLabel}>City (optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewCity}
                onChangeText={setReviewCity}
                placeholder="City"
                placeholderTextColor={colors.textSubtle}
              />

              <Text style={styles.modalLabel}>Your score (0–100, optional)</Text>
              <TextInput
                style={styles.countInput}
                value={reviewScore}
                onChangeText={(t) => setReviewScore(t.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="—"
                placeholderTextColor={colors.textSubtle}
                keyboardType="number-pad"
              />

              <Text style={styles.modalLabel}>List price (optional)</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
                <TextInput
                  style={styles.priceInput}
                  value={reviewListPrice}
                  onChangeText={setReviewListPrice}
                  placeholder="0.00"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="decimal-pad"
                />
              </View>

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                onPress={handleSaveReview}
                disabled={saving}
              >
                <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save Review'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingReview(false)} disabled={saving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      <Modal visible={addingToCellar} transparent animationType="slide">
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{context === 'add-location' ? 'Add to Location' : 'Add to Cellar'}</Text>
            {/* Full identity — producer · wine name · appellation/region, country · vintage. */}
            <Text style={styles.modalWine}>{formatWineTitle({ producer: wine.producer, wineName: wine.wineName, region: regionWithCountry(wine.region), vintage: wine.vintage })}</Text>

            {/* Came in from a tapped empty slot — ask how many bottles and
                which way they run so the placement maps to real slots. The
                save-without-a-slot paths still create 1 bottle, editable
                later from the wine card. */}
            {pendingSlot && (
              <>
                <Text style={styles.modalLabel}>Number of bottles</Text>
                <TextInput
                  style={styles.countInput}
                  value={placeCount}
                  onChangeText={(t) => setPlaceCount(t.replace(/[^0-9]/g, ''))}
                  placeholder="1"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                />
                <Text style={styles.modalLabel}>Orientation</Text>
                <Text style={styles.modalHint}>Which way the bottles run from the slot you tapped.</Text>
                <View style={styles.orientationRow}>
                  <TouchableOpacity
                    style={[styles.orientationBtn, placeOrientation === 'Vertical' && styles.orientationBtnActive]}
                    onPress={() => setPlaceOrientation('Vertical')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.orientationBtnText, placeOrientation === 'Vertical' && styles.orientationBtnTextActive]}>Vertical</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orientationBtn, placeOrientation === 'Horizontal' && styles.orientationBtnActive]}
                    onPress={() => setPlaceOrientation('Horizontal')}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.orientationBtnText, placeOrientation === 'Horizontal' && styles.orientationBtnTextActive]}>Horizontal</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.modalLabel}>Bottle size</Text>
                <View style={styles.bottleSizeWrap}>
                  <BottleSizePicker value={bottleSizeMl} onChange={setBottleSizeMl} />
                </View>
              </>
            )}

            {/* Destination picker: hidden only when we're actually filing into a
                home storage location (context gate), so a stale
                pendingStorageLocationId can never hide it on a normal add. */}
            {!pendingSlot && context !== 'add-location' && (
              <>
                <Text style={styles.modalLabel}>Where should this live?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storageChipsScroll} contentContainerStyle={styles.storageChips} keyboardShouldPersistTaps="handled">
                  <TouchableOpacity
                    style={[styles.storageChip, !selectedRackId && !selectedLocationId && styles.storageChipActive]}
                    onPress={() => { setSelectedRackId(null); setSelectedLocationId(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.storageChipText, !selectedRackId && !selectedLocationId && styles.storageChipTextActive]}>Cellar List</Text>
                  </TouchableOpacity>
                  {racks.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.storageChip, selectedRackId === r.id && styles.storageChipActive]}
                      onPress={() => { setSelectedRackId(r.id); setSelectedLocationId(null); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.storageChipText, selectedRackId === r.id && styles.storageChipTextActive]} numberOfLines={1}>{r.name}</Text>
                    </TouchableOpacity>
                  ))}
                  {cellarLocations.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      style={[styles.storageChip, selectedLocationId === l.id && styles.storageChipActive]}
                      onPress={() => { setSelectedLocationId(l.id); setSelectedRackId(null); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.storageChipText, selectedLocationId === l.id && styles.storageChipTextActive]} numberOfLines={1}>{l.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.storageChip, styles.storageChipNew, selectedRackId === '__new__' && styles.storageChipActive]}
                    onPress={() => { setSelectedRackId('__new__'); setSelectedLocationId(null); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.storageChipText, styles.storageChipNewText, selectedRackId === '__new__' && styles.storageChipTextActive]}>+ New Location</Text>
                  </TouchableOpacity>
                </ScrollView>

                <Text style={styles.modalLabel}>Bottle size</Text>
                <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('bottle')} activeOpacity={0.7}>
                  <Text style={styles.fieldSelectValue} numberOfLines={1}>{customSizeMode ? (customSizeCl ? `${customSizeCl}cl` : 'Other') : bottleSizeLabel(bottleSizeMl)}</Text>
                  <Text style={styles.fieldSelectArrow}>▾</Text>
                </TouchableOpacity>

                {customSizeMode && (
                  <View style={styles.customSizeRow}>
                    <TextInput
                      style={styles.customSizeInput}
                      value={customSizeCl}
                      onChangeText={(t) => {
                        const cleaned = t.replace(/[^0-9]/g, '').slice(0, 4);
                        setCustomSizeCl(cleaned);
                        const cl = parseInt(cleaned, 10);
                        if (!Number.isNaN(cl) && cl > 0) setBottleSizeMl(cl * 10);
                      }}
                      placeholder="e.g. 62"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <Text style={styles.customSizeSuffix}>cl</Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Number of bottles</Text>
                <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('count')} activeOpacity={0.7}>
                  <Text style={styles.fieldSelectValue}>{bottleCount}</Text>
                  <Text style={styles.fieldSelectArrow}>▾</Text>
                </TouchableOpacity>

                {/* Fill direction only matters when placing into a rack/fridge
                    grid — auto-placed from the first free slot. */}
                {selectedRackId && selectedRackId !== '__new__' && (
                  <>
                    <Text style={styles.modalLabel}>Orientation</Text>
                    <Text style={styles.modalHint}>Which way the bottles run from the first free slot.</Text>
                    <View style={styles.orientationRow}>
                      <TouchableOpacity
                        style={[styles.orientationBtn, placeOrientation === 'Vertical' && styles.orientationBtnActive]}
                        onPress={() => setPlaceOrientation('Vertical')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.orientationBtnText, placeOrientation === 'Vertical' && styles.orientationBtnTextActive]}>Vertical</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.orientationBtn, placeOrientation === 'Horizontal' && styles.orientationBtnActive]}
                        onPress={() => setPlaceOrientation('Horizontal')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.orientationBtnText, placeOrientation === 'Horizontal' && styles.orientationBtnTextActive]}>Horizontal</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            )}

            {/* Home storage location: destination is fixed (the location), but a
                bottle count still matters — e.g. photographing a whole case. */}
            {context === 'add-location' && (
              <>
                <Text style={styles.modalLabel}>Bottle size</Text>
                <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('bottle')} activeOpacity={0.7}>
                  <Text style={styles.fieldSelectValue} numberOfLines={1}>{customSizeMode ? (customSizeCl ? `${customSizeCl}cl` : 'Other') : bottleSizeLabel(bottleSizeMl)}</Text>
                  <Text style={styles.fieldSelectArrow}>▾</Text>
                </TouchableOpacity>

                {customSizeMode && (
                  <View style={styles.customSizeRow}>
                    <TextInput
                      style={styles.customSizeInput}
                      value={customSizeCl}
                      onChangeText={(t) => {
                        const cleaned = t.replace(/[^0-9]/g, '').slice(0, 4);
                        setCustomSizeCl(cleaned);
                        const cl = parseInt(cleaned, 10);
                        if (!Number.isNaN(cl) && cl > 0) setBottleSizeMl(cl * 10);
                      }}
                      placeholder="e.g. 62"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <Text style={styles.customSizeSuffix}>cl</Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Number of bottles</Text>
                <TextInput
                  style={styles.countInput}
                  value={bottleCount ? String(bottleCount) : ''}
                  onChangeText={(t) => {
                    const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
                    setBottleCount(Number.isNaN(n) ? 0 : n);
                  }}
                  placeholder="1"
                  placeholderTextColor={colors.textSubtle}
                  keyboardType="number-pad"
                />

                {pendingCaseId ? (
                  <Text style={styles.caseAddingNote}>Adding to your open case.</Text>
                ) : (
                  <>
                    <Text style={styles.modalLabel}>How is this wine packaged?</Text>
                    <TouchableOpacity style={styles.fieldSelect} onPress={() => setOpenField('packaging')} activeOpacity={0.7}>
                      <Text style={styles.fieldSelectValue}>{PACKAGING.find((p) => p.k === storageKind)?.label ?? 'Loose Bottle(s)'}</Text>
                      <Text style={styles.fieldSelectArrow}>▾</Text>
                    </TouchableOpacity>

                    {storageKind !== 'loose' && (
                      <>
                        <Text style={styles.modalLabel}>Case name</Text>
                        <TextInput
                          style={styles.caseInput}
                          value={caseName}
                          onChangeText={setCaseName}
                          placeholder={storageKind === 'mixed' ? 'e.g. Mixed Burgundy' : 'e.g. OWC'}
                          placeholderTextColor={colors.textSubtle}
                        />
                        {/* Quick-pick from existing MIXED case names in this
                            location — only mixed cases can take another wine, so
                            complete/OWC cases are never offered as a destination.
                            (deduped, excluding the one being typed). */}
                        {storageKind === 'mixed' && (() => {
                          const names = Array.from(new Set(locationCases.filter((c) => c.kind === 'mixed').map((c) => c.name.trim()).filter(Boolean)))
                            .filter((n) => n.toLowerCase() !== caseName.trim().toLowerCase());
                          return names.length ? (
                            <View style={styles.caseSuggestRow}>
                              {names.map((s) => (
                                <TouchableOpacity key={s} style={styles.caseSuggestChip} onPress={() => setCaseName(s)} activeOpacity={0.7}>
                                  <Text style={styles.caseSuggestText}>{s}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : null;
                        })()}
                        <Text style={styles.modalLabel}>Note <Text style={styles.modalLabelHint}>(optional)</Text></Text>
                        <View style={styles.caseNoteRow}>
                          <TextInput
                            style={[styles.caseInput, styles.caseNoteInput]}
                            value={caseNote}
                            onChangeText={setCaseNote}
                            placeholder="Ie. in the back next to the Petrus"
                            placeholderTextColor={colors.textSubtle}
                            multiline
                          />
                          <MicButton value={caseNote} onChangeText={setCaseNote} onClear={() => setCaseNote('')} />
                        </View>
                      </>
                    )}
                  </>
                )}
              </>
            )}

            <Text style={styles.modalLabel}>Estimated Purchase Price/Bottle <Text style={styles.modalLabelHint}>(adjust for accuracy)</Text></Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
              <TextInput
                style={styles.priceInput}
                value={purchasePrice}
                onChangeText={(t) => { setPurchasePrice(t); setPurchasePriceUserEdited(true); }}
                placeholder="0.00"
                placeholderTextColor={colors.textSubtle}
                keyboardType="decimal-pad"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddToCellar}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? 'Saving…'
                  : selectedRackId === '__new__'
                    ? 'Save & Add New Location'
                    : selectedRackId
                      ? `Save & Place in ${racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack'}`
                      : selectedLocationId
                        ? `Save to ${cellarLocations.find((l) => l.id === selectedLocationId)?.name ?? 'Location'}`
                        : context === 'add-location'
                          ? 'Save to Location'
                          : 'Save to Cellar List'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingToCellar(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={openField !== null} transparent animationType="fade" onRequestClose={() => setOpenField(null)}>
        <TouchableOpacity style={styles.fieldModalOverlay} activeOpacity={1} onPress={() => setOpenField(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.fieldModalSheet} onPress={() => {}}>
            <Text style={styles.fieldModalTitle}>
              {openField === 'storage' ? 'Storage location' : openField === 'bottle' ? 'Bottle size' : openField === 'packaging' ? 'How is this wine packaged?' : 'Number of bottles'}
            </Text>
            <ScrollView style={{ maxHeight: 320 }}>
              {fieldOptions.map((opt) => (
                <TouchableOpacity
                  key={String(opt.value)}
                  style={styles.fieldOption}
                  onPress={() => { opt.onSelect(); setOpenField(null); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.fieldOptionText}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpenField(null)} style={styles.fieldModalCancel}>
              <Text style={styles.fieldModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: fonts.bodyRegular, fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, marginTop: spacing.md },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm, alignSelf: 'flex-start' },
  backLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  scanAgainBtn: { position: 'absolute', top: 56, right: spacing.xl, zIndex: 10, paddingVertical: spacing.xs },
  scanAgainText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  reReadOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  reReadText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: '#FFFFFF' },
  pageTitle: { fontSize: 26, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1.5, textAlign: 'center', marginBottom: spacing.sm, marginTop: spacing.xs },
  // No bottom border now — the stats bar (moved below this block) provides the
  // separator above Vinster's Note / Map.
  headerBlock: {},
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.sm },
  heroImage: { width: 120, aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: colors.surface, marginRight: spacing.md },
  headerText: { flex: 1 },
  candOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  candSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%', maxWidth: 440 },
  candTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.sm },
  candBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  candLoading: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  candLoadingText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // Tickable list rows (lineup-detection style) — replaces the old bordered
  // "bubbles". Single-select: tapping a row ticks it; "Select This Wine" confirms.
  candRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  candCheck: { fontSize: 24, color: colors.textMuted, width: 28, textAlign: 'center' },
  candCheckOn: { color: colors.gold },
  candRowText: { flex: 1 },
  candItemName: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text },
  candItemMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  vintagePromptInput: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text, backgroundColor: colors.surface, textAlign: 'center', letterSpacing: 3, marginBottom: spacing.sm },
  candConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.md },
  candConfirmBtnDisabled: { opacity: 0.4 },
  candConfirmText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  candCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  candCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  producer: { fontSize: 20.5, fontFamily: fonts.bodyBold, color: colors.text },
  wineName: { fontSize: 19, fontFamily: fonts.bodyItalic, color: colors.text, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: spacing.xs },
  grape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  scoreLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  score: { fontSize: 28, fontFamily: fonts.bodyBold, color: colors.gold },
  // Avg Critic Score header row + per-critic breakdown beneath it.
  criticBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  criticScoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  criticBreakdown: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm, columnGap: spacing.md, rowGap: spacing.xs },
  criticChipText: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  criticChipName: { fontFamily: fonts.bodyBold, color: colors.gold },
  criticBreakdownCaption: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, lineHeight: 18 },
  badge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  badgeText: { fontSize: 14, fontFamily: fonts.bodySemibold },
  badgeWindow: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Vinster's Note + Map combined block — tighter than a full section, with a
  // single bottom border (the separator before The Inside Line) and no divider
  // between the note and the map.
  // Note/Map + the Vintage & Market Comparison read as one group — no separator
  // line between them (the comparison's own bottom border closes the group).
  noteMapSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.md },
  // Vinster's Note beside Vinster's Map — centred as a pair with an indent
  // between them; text baselines aligned so both titles sit on one line.
  noteMapHeadingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline', gap: spacing.xl, flexWrap: 'wrap' },
  // Pulls the Map heading up close beneath the note (squeezed together).
  mapHeadingTight: { marginTop: spacing.sm },
  // The "(what's this)" explainer, now shown inline in gold italics below the
  // note when it's expanded instead of behind a link.
  noteExplainer: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 19, marginTop: spacing.sm },
  sectionTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.sm },
  // Inline headline stats bar: Score · Value · Drinking Window, bracketed by
  // full-width rules top and bottom (matches the app's other stats bars).
  // Full-width yellow (gold) rules bracketing the stats bar, edge to edge.
  // Faded gold rule top & bottom of the stats bar (matches the app's stats bars).
  statBarRule: { height: 1, backgroundColor: colors.divider },
  // Subtle separator directly beneath the "Wine Intel" title.
  titleRule: { height: 1, backgroundColor: colors.border },
  statBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap', paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.md, gap: spacing.sm },
  statBarItem: { alignItems: 'center', flexShrink: 1, paddingHorizontal: 2 },
  statBarValue: { fontSize: 18.5, fontFamily: fonts.bodyBold, color: colors.text, letterSpacing: 0.3, textAlign: 'center' },
  statBarValueMuted: { color: colors.textMuted, fontFamily: fonts.bodySemibold },
  statBarLabel: { fontSize: 10, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4, textAlign: 'center' },
  statBarSep: { fontSize: 18, color: colors.border, marginBottom: 16 },
  // Gold, label-less headline stats bar under the title — tappable figures.
  statBarValueGold: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  statBarSepGold: { fontSize: 26, color: colors.gold, opacity: 0.75 },
  // Vinster's Vintage & Market Comparison — collapsible section + its table.
  vintageSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  vintageHeadingRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  vintageLoading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingTop: spacing.md },
  vintageLoadingText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  vintageEmpty: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingTop: spacing.md },
  vintageTable: { marginTop: spacing.md },
  vintageRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  vintageHeadRow: { borderBottomColor: colors.gold },
  vintageRowThis: { backgroundColor: 'rgba(224,184,74,0.10)' },
  vintageCell: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.text },
  vintageHeadCell: { fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.6 },
  vintageColYear: { flex: 1 },
  vintageColScore: { flex: 1, textAlign: 'center' },
  vintageColPrice: { flex: 1, textAlign: 'right' },
  vintageFootnote: { fontSize: 11, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
  // Compact 2-column stat grid mirroring the cellar wine card.
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  statCell: { width: '50%', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  // "The Inside Line" — sommelier-best-friend commentary. Header matches the
  // producer-range header (rangeTitle) and is gold, per design.
  insiderTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  insiderBody: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 23 },
  // Producer range ladder — entry → flagship, this wine highlighted. Header gold
  // to match The Inside Line above it.
  rangeTitle: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  rangeHint: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.sm },
  rangeLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  rangeLoadingText: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  rangeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  rangeRowThis: { backgroundColor: 'rgba(212,176,96,0.10)', borderRadius: 8, paddingHorizontal: spacing.sm, borderBottomColor: 'transparent' },
  rangeRowMain: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.xs },
  rangeMarker: { fontSize: 14, color: colors.gold, width: 14, textAlign: 'center' },
  rangeMarkerHidden: { opacity: 0 },
  rangeName: { flex: 1, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text },
  rangeNameThis: { fontFamily: fonts.bodySemibold, color: colors.gold },
  rangeRight: { alignItems: 'flex-end' },
  rangeBand: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.textMuted, letterSpacing: 1 },
  rangeBandThis: { color: colors.gold },
  rangeTier: { fontSize: 10, fontFamily: fonts.bodyRegular, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 1 },
  rangeSummary: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 21, marginTop: spacing.md },
  // Confirm-first panel (shown before a card when the scan couldn't be verified).
  confirmTitle: { fontSize: 18, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs },
  confirmBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted, lineHeight: 21, marginBottom: spacing.md },
  confirmLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.md },
  confirmLoadingText: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  confirmRow: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  confirmRowName: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.text },
  confirmRowMeta: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  confirmPrimary: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  confirmPrimaryText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, textAlign: 'center' },
  confirmManualLink: { alignItems: 'center', paddingVertical: spacing.sm, marginTop: spacing.xs },
  confirmManualText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  // "Not this wine?" correction link under the header on the intel card.
  wrongWineLink: { alignSelf: 'center', paddingHorizontal: spacing.lg, paddingTop: 2, paddingBottom: spacing.md },
  wrongWineText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: '#FFFFFF', textDecorationLine: 'underline', textAlign: 'center' },
  statLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text, lineHeight: 20 },
  statValueMuted: { color: colors.textMuted, fontFamily: fonts.bodyItalic },
  statSub: { fontSize: 12, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  marketNote: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.sm, marginHorizontal: spacing.xl },
  estimatedByLink: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textDecorationLine: 'underline', marginTop: 3 },
  estimatedValueGold: { color: colors.gold },
  // "Dive Deeper" / "Chef, find me a recipe" — gold-outline actions.
  deepBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  deepBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Yellow italic "Dive deeper" link, sits below The Inside Line blurb.
  diveDeeperLink: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, marginTop: spacing.sm },
  // Primary CTA above Dive Deeper — gold-filled to stand out.
  saveReviewBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  saveReviewBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, letterSpacing: 0.3 },
  tastingNotes: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22 },
  // Vinster's Map — collapsible heading + placeholder body.
  mapHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  mapTitle: { fontSize: 17, fontFamily: fonts.headingBold, color: colors.text },
  mapChevron: { fontSize: 15, color: colors.gold, fontFamily: fonts.bodySemibold },
  mapBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, lineHeight: 22, marginTop: spacing.sm },
  estimateHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estimateGenerateLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
  estimateValue: { fontSize: 32, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 0.5 },
  estimateRange: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.text, marginTop: 2, textTransform: 'capitalize' },
  estimateUnavailable: { fontSize: 18, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  estimateCaption: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  communityRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  communityLabel: { fontSize: 16, fontFamily: fonts.bodySemibold, color: 'rgba(212,176,96,0.45)', letterSpacing: 0.3 },
  communityComingSoon: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textTransform: 'lowercase', letterSpacing: 0.5 },
  communityCaption: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  actionStack: { marginHorizontal: spacing.xl, marginTop: spacing.xl, gap: spacing.sm },
  primaryAddBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  primaryAddBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, letterSpacing: 0.3 },
  secondaryAddBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  secondaryAddBtnText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  reviewNoteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, minHeight: 100, lineHeight: 22, marginBottom: spacing.md },
  bottleSizeWrap: { marginBottom: spacing.md },
  // Compact Add-to-Cellar field dropdowns (Storage location | Bottle size,
  // then Number of bottles).
  fieldRow: { flexDirection: 'row', gap: spacing.md },
  fieldCol: { flex: 1 },
  fieldSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, marginBottom: spacing.md },
  // "Where should this live?" destination chips — a visible one-tap choice.
  storageChipsScroll: { flexGrow: 0, marginBottom: spacing.md },
  storageChips: { flexDirection: 'row', gap: spacing.xs, paddingVertical: 2, paddingRight: spacing.sm },
  storageChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 7, backgroundColor: colors.surface, maxWidth: 190 },
  storageChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.15)' },
  storageChipText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text },
  storageChipTextActive: { color: colors.gold },
  storageChipNew: { borderStyle: 'dashed', borderColor: colors.gold },
  storageChipNewText: { color: colors.gold },
  fieldSelectValue: { flex: 1, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  fieldSelectArrow: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
  customSizeRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, backgroundColor: colors.surface, marginTop: -spacing.xs, marginBottom: spacing.md },
  customSizeInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  customSizeSuffix: { fontSize: 16, fontFamily: fonts.bodyMedium, color: colors.textMuted, marginLeft: spacing.xs },
  fieldModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  fieldModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 420, padding: spacing.lg },
  fieldModalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  fieldOption: { paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  fieldOptionText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, textAlign: 'center' },
  fieldModalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs },
  fieldModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
  singleActionRow: { marginHorizontal: spacing.xl, marginTop: spacing.xl },
  singleActionButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  singleActionButtonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16, textAlign: 'center' },
  discardButton: { margin: spacing.xl, alignItems: 'center', paddingVertical: spacing.sm },
  discardText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.xs },
  modalWine: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Lower-case bracketed hint inside an uppercase label, e.g. "(adjust for accuracy)".
  modalLabelHint: { fontFamily: fonts.bodyItalic, fontSize: 11, color: colors.textMuted, textTransform: 'none', letterSpacing: 0 },
  caseAddingNote: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, marginBottom: spacing.md },
  caseKindRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  caseKindBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: colors.surface },
  caseKindBtnOn: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.14)' },
  caseKindText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.textMuted },
  caseKindTextOn: { color: colors.gold },
  caseInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  caseSuggestRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  caseSuggestChip: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 999, paddingVertical: 5, paddingHorizontal: spacing.md },
  caseSuggestText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.gold },
  caseNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  caseNoteInput: { flex: 1, minHeight: 44, marginBottom: 0, textAlignVertical: 'top' },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: fonts.bodyRegular, fontSize: 14 },
  modalHint: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.sm, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  priceCurrency: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { flex: 1, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, paddingVertical: spacing.sm },
  countInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.text, marginBottom: spacing.md },
  orientationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  orientationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  orientationBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  orientationBtnText: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  orientationBtnTextActive: { color: colors.gold },
  rackList: { gap: spacing.xs, marginBottom: spacing.md },
  rackOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionActive: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  rackOptionText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  rackOptionTextActive: { color: colors.gold },
  rackOptionPrimary: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionPrimaryActive: { backgroundColor: 'rgba(255,255,255,0.10)' },
  rackOptionPrimaryText: { fontSize: 15, fontFamily: fonts.headingSemibold, color: '#FFFFFF' },
});
