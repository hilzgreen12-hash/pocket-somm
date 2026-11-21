import NetInfo from '@react-native-community/netinfo';
import { OfflinePhotoPlaceholder } from '../../../src/components/LineupThumb';
import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../../src/utils/shareCard';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { ensureConnectionForUpload } from '../../../src/utils/connectionGuard';
import { getLineupArchive, setLineupNote, updateLineupStamp, setLineupWines, setLineupRestaurant, setLineupName, replaceLineupImage, type LineupArchive, type LineupWine } from '../../../src/api/lineups';
import { launchImageLibrary } from '../../../src/utils/imagePicker';
import { CellarWinePicker } from '../../../src/components/CellarWinePicker';
import type { CellarWine } from '../../../src/types/wine';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useScanHistory } from '../../../src/hooks/useScanHistory';
import { detectLineup, prepareImageBase64, fetchAutoLabelUri, type WineSearchResult } from '../../../src/api/label';
import { getCachedLabelUri } from '../../../src/api/labelImageCache';
import { repairLabelImage, useLabelImageState } from '../../../src/hooks/useLabelImageUrl';
import { LabelImage } from '../../../src/components/LabelImage';
import { useLabelStore } from '../../../src/stores/labelStore';
import { withBordeauxInfo } from '../../../src/constants/bordeauxClassification';
import { findExistingReview } from '../../../src/utils/reviewDedup';
import { buildLineupWines, archiveBottles } from '../../../src/services/archiveNight';
import { findSameCellarWine, sameWineIdentity } from '../../../src/utils/wineMatch';
import { getCellarWineById } from '../../../src/api/cellar';
import { ReviewedLineEditable } from '../../../src/components/ReviewCardHeader';
import { WineSearchInput } from '../../../src/components/WineSearchInput';
import { BottleSizePicker, bottleSizeLabel } from '../../../src/components/BottleSizePicker';
import { File, Paths } from 'expo-file-system';
import { LineupShareCard } from '../../../src/components/LineupShareCard';
import { LabelPhotoViewer } from '../../../src/components/LabelPhotoViewer';
import { Ionicons } from '@expo/vector-icons';
import { MicButton } from '../../../src/components/MicButton';
import { showAlert } from '../../../src/components/AppAlert';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { todayYmd } from '../../../src/utils/reviewDate';
import { isoToDateInput } from '../../../src/utils/dateFormat';
import { useCellar, useArchive, invalidateCellarViews } from '../../../src/hooks/useCellar';
import { useChosenWines } from '../../../src/hooks/useChosenWines';
import { usePreferences } from '../../../src/hooks/usePreferences';
import { UNNAMED_RESTAURANT, isRestaurantVisit, sessionsWithWines } from '../../../src/utils/restaurantReview';
import { WINE_STYLES, inferWineStyle } from '../../../src/utils/wineStyle';
import { SearchProgress } from '../../../src/components/SearchProgress';
import { MessageScreen } from '../../../src/components/MessageScreen';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Local YYYY-MM-DD of a lineup's date — matches the date shown on screen (a UTC
// split can be a day out for rows saved near midnight).
function lineupDay(archivedAt: string): string {
  const d = new Date(archivedAt);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// "19 November 2026" for the read-only date line, from a YYYY-MM-DD day.
function fmtLineupDay(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return '';
  return new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

const UNDO_NOTE = 'The bottle Vinster already moved to your archive for this lineup stays there — this doesn’t put it back in your cellar.';

export default function LineupDetailScreen() {
  // ?new=1: a lineup that has just been added opens ready to fill in.
  const { id, new: isNew } = useLocalSearchParams<{ id: string; new?: string }>();
  // A saved lineup opens as a read-only page; Edit (top right) turns it into
  // the input screen, and Save Lineup turns it back.
  const [editing, setEditing] = useState(isNew === '1');
  const qc = useQueryClient();
  const { session } = useAuth();

  const { data: lineup, isLoading } = useQuery({
    queryKey: ['lineup', id],
    queryFn: () => getLineupArchive(id!),
    enabled: !!id,
  });

  // Synchronous in-flight guards, keyed by action: React state lands too late to
  // stop a fast double tap from firing an upload, read or archive twice.
  const inFlight = useRef(new Set<string>());
  function begin(key: string): boolean {
    if (inFlight.current.has(key)) return false;
    inFlight.current.add(key);
    return true;
  }
  function end(key: string) { inFlight.current.delete(key); }

  // The lineup photo comes from the on-disk label cache: downloaded once, then
  // instant (and offline) on every later visit instead of a fresh signed URL.
  const { uri: photoUri, pending: photoPending } = useLabelImageState(lineup?.image_path);
  // Resolved to nothing (usually no connection on a first view) → offline placeholder.
  const photoFailed = !!lineup && !photoPending && !photoUri;
  const [zoomOpen, setZoomOpen] = useState(false);
  const [replacingPhoto, setReplacingPhoto] = useState(false);
  // The title, date · city · venue line and note are edited in place. Each is
  // saved when its field loses focus, and "Save Lineup" saves whatever is still
  // pending (e.g. a dictated note, which never blurs).
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [dateDraft, setDateDraft] = useState('');
  const [cityDraft, setCityDraft] = useState('');
  const [venueDraft, setVenueDraft] = useState('');
  const [savingLineup, setSavingLineup] = useState(false);
  // After Save Lineup: the unarchived "Your Cellar" rows offered for archiving
  // (indexes), which of them are ticked, and whether that archive is running.
  const [archiveOffer, setArchiveOffer] = useState<number[] | null>(null);
  const [archiveTicked, setArchiveTicked] = useState<Set<number>>(new Set());
  const [archivingOffer, setArchivingOffer] = useState(false);
  // Which wine row (index) is being linked to a cellar wine via the picker.
  const [cellarPickerFor, setCellarPickerFor] = useState<number | null>(null);
  const hydrated = useRef(false);
  useEffect(() => {
    if (lineup && !hydrated.current) {
      hydrated.current = true;
      setNote(lineup.note ?? '');
      setName(lineup.name ?? '');
      setDateDraft(lineupDay(lineup.archived_at));
      setCityDraft(lineup.city ?? '');
      setVenueDraft(lineup.venue ?? '');
    }
  }, [lineup]);
  // Back online after a failed load → fetch the photo again.
  const photoPath = lineup?.image_path;
  useEffect(() => {
    if (!photoFailed || !photoPath) return;
    return NetInfo.addEventListener((st) => {
      if (st.isConnected && st.isInternetReachable !== false) void qc.invalidateQueries({ queryKey: ['label-image', photoPath] });
    });
  }, [photoFailed, photoPath, qc]);

  function invalidateLineup() {
    qc.invalidateQueries({ queryKey: ['lineup', id] });
    qc.invalidateQueries({ queryKey: ['lineup-archives'] });
  }

  // The lineup as it stands in the cache — the baseline each save compares
  // against, kept current so a blur save and Save Lineup don't both write.
  function cachedLineup(): LineupArchive | null {
    return qc.getQueryData<LineupArchive | null>(['lineup', id]) ?? null;
  }
  function patchCachedLineup(patch: Partial<LineupArchive>) {
    qc.setQueryData<LineupArchive | null>(['lineup', id], (old) => (old ? { ...old, ...patch } : old));
  }

  // Each persist* writes its field only if it differs from what's saved, and
  // throws on failure so the caller decides how to report it.
  async function persistTitle() {
    const saved = cachedLineup();
    const next = name.trim() || null;
    if (!saved || next === (saved.name?.trim() || null)) return;
    await setLineupName(saved.id, next);
    patchCachedLineup({ name: next });
  }
  async function persistNote() {
    const saved = cachedLineup();
    const next = note.trim() || null;
    if (!saved || next === (saved.note?.trim() || null)) return;
    await setLineupNote(saved.id, next);
    patchCachedLineup({ note: next });
  }
  async function persistStamp() {
    const saved = cachedLineup();
    if (!saved) return;
    // DateInput only reports complete, valid dates; an empty field leaves the
    // saved date as it is. Noon keeps the day stable across time zones.
    const archivedAt = dateDraft && dateDraft !== lineupDay(saved.archived_at) ? new Date(`${dateDraft}T12:00:00`).toISOString() : undefined;
    const city = cityDraft.trim() || null;
    const venue = venueDraft.trim() || null;
    if (!archivedAt && city === (saved.city?.trim() || null) && venue === (saved.venue?.trim() || null)) return;
    await updateLineupStamp(saved.id, { archivedAt, city, venue });
    patchCachedLineup({ ...(archivedAt ? { archived_at: archivedAt } : {}), city, venue });
  }

  function saveOnBlur(persist: () => Promise<void>, errorTitle: string) {
    persist().then(invalidateLineup, (err) => {
      showAlert({ title: errorTitle, body: err instanceof Error ? err.message : 'Please try again.' });
    });
  }

  // Read-only lineup: each wine links to its review and its Wine Intel, and Back
  // from either returns to this lineup.
  const backToLineup = `&backTo=${encodeURIComponent(`/cellar/lineup/${id}`)}`;
  function openWineReview(w: LineupWine) {
    // A cellar bottle's review lives on that bottle; otherwise the wine's own
    // review in Your Wine Reviews, or a new one seeded with its name. Your Wine
    // Reviews finds the bottle live or archived, and opens a new entry when it
    // has no review yet.
    if (w.cellar_wine_id) {
      router.push(`/wines/chosen?openCellarReview=${w.cellar_wine_id}${backToLineup}` as any);
      return;
    }
    const existing = findExistingReview(chosenWines, { producer: w.producer ?? '', wineName: w.wine_name ?? '', vintage: w.vintage != null ? String(w.vintage) : null });
    if (existing) { router.push(`/wines/chosen?openReview=${existing.id}${backToLineup}` as any); return; }
    const q = (v: string | number | null | undefined) => encodeURIComponent(v != null ? String(v) : '');
    router.push(`/wines/chosen?seedAdd=1&sp=${q(w.producer)}&sw=${q(w.wine_name)}&sv=${q(w.vintage)}${backToLineup}` as any);
  }
  function openWineIntel(w: LineupWine) {
    const ls = useLabelStore.getState();
    ls.reset();
    // The row's region as read off the label; classification + appellation
    // are filled in for a classified Bordeaux château.
    ls.setWineDetailsConfirmed(withBordeauxInfo({
      producer: w.producer ?? '',
      region: w.region ?? '',
      wineName: w.wine_name || null,
      vintage: w.vintage != null ? String(w.vintage) : 'NV',
    }) as any);
    // Header photo in the background: the cellar bottle's own label, else a web
    // label. The card shows its title alone until one lands.
    void (async () => {
      let img: string | null = null;
      const cw = linkedBottle(w.cellar_wine_id);
      try { img = await getCachedLabelUri(cw?.label_image_path); } catch { /* fall through */ }
      if (!img) { try { img = await fetchAutoLabelUri(w.producer, w.wine_name); } catch { /* photoless */ } }
      if (img) useLabelStore.getState().setImageUri(img);
    })();
    // gen=1 builds the intel on the card; confirmed=1 skips "which wine?";
    // noRecent=1 keeps a lineup view out of recent scans.
    router.push(`/label/results?context=intel&confirmed=1&gen=1&noRecent=1${backToLineup}` as any);
  }

  async function saveLineup() {
    if (!begin('saveLineup')) return;
    setSavingLineup(true);
    try {
      await persistTitle();
      await persistStamp();
      await persistNote();
      invalidateLineup();
      setEditing(false);
      // Offer to archive cellar bottles not yet taken out. Unticked by default:
      // archiving removes bottles from the cellar, so it should be a choice.
      const pending = currentWines().flatMap((w, i) => (w.cellar_wine_id && !w.archived ? [i] : []));
      if (pending.length) {
        setArchiveTicked(new Set());
        setArchiveOffer(pending);
      }
    } catch (err) {
      showAlert({ title: 'Could not save lineup', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingLineup(false);
      end('saveLineup');
    }
  }

  // The lineup's wines as they stand NOW in the cache. Every write builds from
  // this rather than from the render's snapshot, so a slow archive can't
  // overwrite an edit made while it ran.
  function currentWines(): LineupWine[] {
    return qc.getQueryData<LineupArchive | null>(['lineup', id])?.wines ?? [];
  }

  // Apply a change to the latest wines and persist it. The cache is updated
  // straight away so a quick follow-up edit builds on this one rather than on
  // the pre-write array while the refetch is in flight.
  async function updateWines(change: (wines: LineupWine[]) => LineupWine[]): Promise<boolean> {
    if (!lineup) return false;
    const next = change(currentWines());
    try {
      await setLineupWines(lineup.id, next);
      patchCachedLineup({ wines: next });
      invalidateLineup();
      return true;
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
      return false;
    }
  }

  // Move the cellar bottles behind these lineup rows into the cellar archive,
  // dated today, and mark each row archived. archiveBottles re-reads the
  // cellar row, so two rows linked to one wine each take their own bottles,
  // and caps each at what's left in the cellar. Resolves to the bottles
  // archived and which wines, or null when it failed (already reported) or was a
  // double tap.
  // Archives run one after another: a second request made while one is still
  // saving (archiving two wines in quick succession) waits its turn rather than
  // being refused — refusing it silently left the second bottle in the cellar.
  const archiveQueue = useRef<Promise<unknown>>(Promise.resolve());
  // What an archive did: the bottles moved and the wines they were (null when it
  // failed or didn't run).
  // requested = the rows asked for, so "nothing archived" copy can be plural.
  type ArchiveResult = { bottles: number; names: string[]; day: string; requested: number } | null;
  function archiveRows(indexes: number[]): Promise<ArchiveResult> {
    const run = archiveQueue.current.then(() => archiveRowsNow(indexes));
    archiveQueue.current = run.catch(() => undefined);
    return run;
  }
  async function archiveRowsNow(indexes: number[]): Promise<ArchiveResult> {
    if (!lineup || !begin('archive')) return null;
    // Dated the day the bottles leave the cellar — today — not the lineup's date.
    const day = todayYmd();
    const done: Array<{ index: number; cellarId: string }> = [];
    const names: string[] = [];
    let bottles = 0;
    let failed = false;
    try {
      for (const index of indexes) {
        const w = currentWines()[index];
        if (!w?.cellar_wine_id || w.archived) continue;
        const { archived } = await archiveBottles(w.cellar_wine_id, w.count ?? 1, day);
        if (archived > 0) {
          done.push({ index, cellarId: w.cellar_wine_id });
          bottles += archived;
          names.push(wineHeaderLine(w.producer, w.wine_name, w.vintage) || w.wine_name);
        }
      }
    } catch (err) {
      failed = true;
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      // Record whatever did get archived, even after a failure part-way. Rows are
      // matched by position AND link, in case the list changed meanwhile.
      if (done.length) {
        await updateWines((ws) => ws.map((w, i) => (done.some((d) => d.index === i && d.cellarId === w.cellar_wine_id) ? { ...w, archived: true } : w)));
      }
      invalidateCellarViews(qc);
      end('archive');
    }
    return failed ? null : { bottles, names, day, requested: indexes.length };
  }

  // Tell the user what an archive did. Nothing archived means the cellar had
  // no bottles of it left (already drunk, or archived elsewhere).
  function reportArchived(result: ArchiveResult) {
    if (!result) return;
    if (result.bottles === 0) {
      showAlert({ title: 'Nothing to archive', body: result.requested > 1 ? 'Vinster found no bottles of these wines left in your cellar.' : 'Vinster found no bottles of this wine left in your cellar.' });
      return;
    }
    const on = isoToDateInput(result.day, currency);
    showAlert({
      title: 'Archived',
      body: result.names.length === 1
        ? `${result.names[0]} has been archived from your cellar on ${on}.`
        : `These wines have been archived from your cellar on ${on}:\n${result.names.map((n) => `• ${n}`).join('\n')}`,
    });
  }

  const bottlesLabel = (w: LineupWine) => `${w.count ?? 1} ${(w.count ?? 1) === 1 ? 'bottle' : 'bottles'}`;

  // "Archive Selected" in the after-save pop-up: archive the ticked rows, then
  // close the pop-up and confirm.
  async function archiveOfferSelected() {
    setArchivingOffer(true);
    const bottles = await archiveRows([...archiveTicked]);
    setArchivingOffer(false);
    setArchiveOffer(null);
    reportArchived(bottles);
  }

  // "Off Cellar" tapped → confirm the bottle came from the cellar, then pick
  // the cellar wine it was.
  function confirmFromCellar(index: number) {
    showAlert({
      title: 'This was from my cellar',
      body: 'Choose the wine in your cellar. Vinster links this bottle to it and moves the bottle from your cellar to your archive, dated today.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose from my cellar', onPress: () => setCellarPickerFor(index) },
      ],
    });
  }
  // Link a lineup row to the chosen cellar wine — adopting its identity and
  // details, since the user has said which wine it is — then archive that bottle.
  // Region, grape and style come from the cellar wine so a label misread
  // doesn't linger on the row.
  async function pickCellarForWine(cw: CellarWine) {
    const index = cellarPickerFor;
    setCellarPickerFor(null);
    if (index == null) return;
    const linked = await updateWines((ws) => ws.map((w, i) => (
      i === index ? {
        ...w,
        cellar_wine_id: cw.id, producer: cw.producer, wine_name: cw.wine_name, vintage: cw.vintage, archived: false,
        region: cw.region ?? null,
        grape: cw.grape_variety ?? null,
        style: inferWineStyle({ style: cw.style, region: cw.region, grape_variety: cw.grape_variety }),
      } : w
    )));
    if (linked) reportArchived(await archiveRows([index]));
  }

  // Tap the "Your Cellar" badge → archive the bottle here, or mark it as not
  // from the cellar after all. Archiving stays on this screen: opening the wine
  // card instead started a Wine Intel lookup and never archived anything.
  function openCellarBadgeOptions(index: number, w: LineupWine) {
    showAlert({
      title: wineHeaderLine(w.producer, w.wine_name, w.vintage) || 'This wine',
      body: w.archived ? 'Already moved from your cellar to your archive for this lineup.' : undefined,
      buttons: [
        ...(w.archived ? [] : [{ text: 'Archive this bottle', onPress: () => confirmArchiveRow(index, w) }]),
        { text: 'This wine was Off Cellar', onPress: () => { void markOffCellar(index); } },
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }
  function confirmArchiveRow(index: number, w: LineupWine) {
    showAlert({
      title: 'Archive from your cellar?',
      body: `Vinster moves ${bottlesLabel(w)} of this wine from your cellar to your archive, dated today.`,
      buttons: [
        { text: 'Archive', onPress: () => { void archiveRows([index]).then(reportArchived); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  // Unlink the bottle from the cellar. A removal already made stays made — say
  // so, rather than implying the bottle has gone back.
  async function markOffCellar(index: number) {
    const wasArchived = !!currentWines()[index]?.archived;
    const saved = await updateWines((ws) => ws.map((w, i) => (i === index ? { ...w, cellar_wine_id: null, archived: false } : w)));
    if (saved && wasArchived) showAlert({ title: 'Marked Off Cellar', body: UNDO_NOTE });
  }

  const { wines: cellarWines } = useCellar();
  // A fully archived bottle leaves the live cellar list, so linked rows look in
  // the archive too.
  const { wines: archivedWines } = useArchive();
  function linkedBottle(cellarId: string | null | undefined): CellarWine | null {
    if (!cellarId) return null;
    return cellarWines.find((c) => c.id === cellarId) ?? archivedWines.find((c) => c.id === cellarId) ?? null;
  }
  const { chosenWines } = useChosenWines();
  const { preferences } = usePreferences();
  // Decides the date format (DD/MM vs MM/DD), as on the review screens.
  const currency = (preferences?.defaultCurrency ?? 'GBP').toUpperCase();
  const { archive: restaurantArchive } = useScanHistory();
  const navigation = useNavigation();

  // Match this lineup to a restaurant review in Your Restaurants (scan_sessions).
  const [restaurantPickerOpen, setRestaurantPickerOpen] = useState(false);
  const [savingMatch, setSavingMatch] = useState(false);
  const [restaurantSearch, setRestaurantSearch] = useState('');
  const matchedRestaurant = lineup?.restaurant_session_id
    ? restaurantArchive.find((a) => a.id === lineup.restaurant_session_id) ?? null
    : null;

  // Back to the matched visit's review. When this lineup was opened from that
  // review it's already in the stack, so return to it rather than stacking a
  // second copy (dismissTo would replace this screen if it weren't there).
  function openRestaurantReview(sessionId: string) {
    const href = `/restaurants/reviews?openSession=${sessionId}`;
    const inStack = navigation.getState()?.routes.some((r) => r.name === 'restaurants/reviews');
    if (inStack) router.dismissTo(href as any);
    else router.push(href as any);
  }

  // Pass null to unmatch (the "(unmatch)" link under a matched review).
  async function matchRestaurant(sessionId: string | null) {
    if (!lineup || savingMatch) return;
    setSavingMatch(true);
    try {
      await setLineupRestaurant(lineup.id, sessionId);
      invalidateLineup();
      setRestaurantPickerOpen(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingMatch(false);
    }
  }

  // Offer only the visits listed in Your Restaurant Reviews — the same
  // predicate that list uses, so bare scan sessions never appear here.
  const withWines = sessionsWithWines(chosenWines);
  const restaurantVisits = restaurantArchive.filter((v) => isRestaurantVisit(v, withWines));
  const filteredRestaurants = restaurantVisits.filter((a) => {
    const q = restaurantSearch.trim().toLowerCase();
    if (!q) return true;
    return (a.restaurantName ?? '').toLowerCase().includes(q) || (a.city ?? '').toLowerCase().includes(q);
  });

  // "Identify wines" — Vinster reads the saved photo, then the user confirms.
  const [identifying, setIdentifying] = useState(false);
  const [confirmWines, setConfirmWines] = useState<LineupWine[] | null>(null);
  const [included, setIncluded] = useState<Set<number>>(new Set());
  const [savingWines, setSavingWines] = useState(false);

  // Edit wine pop-up (tap a wine name): correct one bottle's details.
  const [editWineIndex, setEditWineIndex] = useState<number | null>(null);
  const [editProducer, setEditProducer] = useState('');
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editVintage, setEditVintage] = useState('');
  const [editStyle, setEditStyle] = useState<string | null>(null);
  const [editSizeMl, setEditSizeMl] = useState(750);
  const [savingWineEdit, setSavingWineEdit] = useState(false);
  // "Find Online" swaps the pop-up's fields for a catalogue search.
  const [findingOnline, setFindingOnline] = useState(false);

  // Details the row doesn't carry yet fall back to its linked cellar wine.
  function openWineEdit(index: number, w: LineupWine) {
    const linked = linkedBottle(w.cellar_wine_id);
    setEditWineIndex(index);
    setEditProducer(w.producer ?? '');
    setEditName(w.wine_name ?? '');
    setEditRegion(w.region ?? linked?.region ?? '');
    setEditVintage(w.vintage != null ? String(w.vintage) : '');
    setEditStyle(w.style ?? (linked ? inferWineStyle({ style: linked.style, region: linked.region, grape_variety: linked.grape_variety }) : null));
    setEditSizeMl(w.bottle_size_ml ?? linked?.bottle_size_ml ?? 750);
    setFindingOnline(false);
  }

  // A wine picked from Find Online fills the fields. The user's vintage and
  // bottle size stay unless the search carried a vintage.
  function applyFoundWine(r: WineSearchResult) {
    setEditProducer(r.producer);
    setEditName(r.wineName ?? '');
    if (r.region) setEditRegion(r.region);
    const found = inferWineStyle({ style: r.style ?? r.colour ?? null, region: r.region, grape_variety: r.grape });
    if (found) setEditStyle(found);
    if (r.vintage) setEditVintage(r.vintage);
    setFindingOnline(false);
  }

  // After an identity edit, does the row still point at the right cellar wine?
  // Kept when the edit still describes the linked wine; otherwise re-matched
  // strictly (same wine + vintage) or unlinked.
  async function relinkAfterEdit(prev: LineupWine, edited: { producer: string | null; wineName: string; vintage: string | null }) {
    if (prev.cellar_wine_id) {
      // Not loaded yet (e.g. archive still fetching) → fetch it.
      const linked = linkedBottle(prev.cellar_wine_id)
        ?? (await getCellarWineById(prev.cellar_wine_id).catch(() => null));
      if (linked && sameWineIdentity(edited, linked)) return { cellar_wine_id: prev.cellar_wine_id, archived: prev.archived };
    }
    const match = findSameCellarWine(cellarWines, edited);
    return { cellar_wine_id: match?.id ?? null, archived: false };
  }

  async function saveWineEdit() {
    const index = editWineIndex;
    if (index == null || !begin('editWine')) return;
    setSavingWineEdit(true);
    try {
      const prev = currentWines()[index];
      if (!prev) return;
      const edited = {
        producer: editProducer.trim() || null,
        wineName: editName.trim() || editProducer.trim(),
        vintage: editVintage.trim() || null,
      };
      const link = await relinkAfterEdit(prev, edited);
      const saved = await updateWines((ws) => ws.map((w, i) => (
        i === index ? {
          ...w,
          producer: edited.producer,
          wine_name: edited.wineName,
          vintage: edited.vintage,
          region: editRegion.trim() || null,
          style: editStyle,
          bottle_size_ml: editSizeMl,
          ...link,
        } : w
      )));
      if (!saved) return;
      setEditWineIndex(null);
      if (prev.archived && link.cellar_wine_id !== prev.cellar_wine_id) {
        showAlert({ title: 'Wine updated', body: `This bottle is no longer linked to the cellar wine it was archived from. ${UNDO_NOTE}` });
      }
    } finally {
      setSavingWineEdit(false);
      end('editWine');
    }
  }

  async function identifyWines() {
    if (!lineup || !begin('identify')) return;
    try {
      if (!(await ensureConnectionForUpload())) return;
      setIdentifying(true);
      // The cached local copy when there is one; otherwise the cache hands back
      // a fresh signed URL, downloaded here for the detector.
      const src = await getCachedLabelUri(lineup.image_path);
      if (!src) { showAlert({ title: 'Photo unavailable', body: 'Could not load this lineup’s photo. Please try again.' }); return; }
      let local = src;
      if (!src.startsWith('file:')) {
        const dest = new File(Paths.cache, `lineup-detect-${lineup.id}.jpg`);
        try { if (dest.exists) dest.delete(); } catch { /* ignore */ }
        local = (await File.downloadFileAsync(src, dest)).uri;
      }
      const { bottles } = await detectLineup(await prepareImageBase64(local));
      const candidates = buildLineupWines(bottles ?? [], cellarWines);
      if (!candidates.length) {
        showAlert({ title: 'No wines detected', body: 'Vinster couldn’t read any bottles from this photo. A clearer, well-lit shot with the labels in frame works best.' });
        return;
      }
      setIncluded(new Set(candidates.map((_, i) => i)));
      setConfirmWines(candidates);
    } catch (err) {
      showAlert({ title: 'Could not identify wines', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setIdentifying(false);
      end('identify');
    }
  }

  async function saveIdentifiedWines() {
    if (!confirmWines || !begin('saveWines')) return;
    const kept = confirmWines.filter((_, i) => included.has(i));
    setSavingWines(true);
    try {
      if (!(await updateWines(() => kept))) return;
      setConfirmWines(null);
      // These were drunk that night — offer to archive the cellar ones so they
      // don't linger as "in cellar".
      const fromCellar = kept.map((w, i) => (w.cellar_wine_id ? i : -1)).filter((i) => i >= 0);
      if (fromCellar.length) promptArchiveDrunk(fromCellar, kept);
    } finally {
      setSavingWines(false);
      end('saveWines');
    }
  }

  function promptArchiveDrunk(indexes: number[], wines: LineupWine[]) {
    const n = indexes.reduce((s, i) => s + (wines[i].count ?? 1), 0);
    showAlert({
      title: 'You drank these — archive them?',
      body: `${n} ${n === 1 ? 'bottle is' : 'bottles are'} from your cellar. Move ${n === 1 ? 'it' : 'them'} into your archive now?`,
      buttons: [
        { text: 'Not now', style: 'cancel' },
        { text: 'Archive', onPress: () => { void archiveRows(indexes).then(reportArchived); } },
      ],
    });
  }

  // Branded share (photo + date + note), mirroring Your Lineup Library.
  const [shareData, setShareData] = useState<{ url: string; date: string; note: string } | null>(null);
  const [sharing, setSharing] = useState(false);
  const shareCardRef = useRef<View>(null);
  const capturedRef = useRef(false);
  // Captures anyway after 5 s if the photo never reports loading, so a bad image
  // can't leave the share stuck on "Sharing…".
  const shareTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (shareTimer.current) clearTimeout(shareTimer.current); }, []);

  // Replace the lineup photo — pick from the library, upload, repoint image_path.
  async function changeLineupPhoto() {
    if (!lineup || !session?.user.id || !begin('photo')) return;
    try {
      if (!(await ensureMediaPermission('library'))) return;
      const res = await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
      if (res.canceled || !res.assets?.[0]) return;
      setReplacingPhoto(true);
      const path = await replaceLineupImage(session.user.id, lineup.id, res.assets[0].uri);
      // Point at the new photo straight away (the upload primed the cache with
      // it); the refetch then confirms.
      qc.setQueryData<LineupArchive | null>(['lineup', id], (old) => (old ? { ...old, image_path: path } : old));
      invalidateLineup();
    } catch (err) {
      showAlert({ title: 'Could not update photo', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setReplacingPhoto(false);
      end('photo');
    }
  }

  async function handleShare() {
    if (!lineup || !begin('share')) return;
    setSharing(true);
    try {
      // The cached local copy (a signed URL only if it can't be cached).
      const url = await getCachedLabelUri(lineup.image_path);
      if (!url) throw new Error('Could not load the lineup photo.');
      capturedRef.current = false;
      setShareData({
        url,
        date: new Date(lineup.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: note.trim() || (lineup.note ?? ''),
      });
      shareTimer.current = setTimeout(() => { void captureAndShare(); }, 5000);
    } catch (err) {
      setSharing(false);
      end('share');
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }
  // Fired by the share card once its photo has loaded (or failed), or by the
  // 5 s cap — whichever comes first.
  async function captureAndShare() {
    if (capturedRef.current || !shareCardRef.current) return;
    capturedRef.current = true;
    if (shareTimer.current) { clearTimeout(shareTimer.current); shareTimer.current = null; }
    try {
      await new Promise((r) => setTimeout(r, 150));
      if (!(await Sharing.isAvailableAsync())) {
        showAlert({ title: 'Sharing unavailable', body: 'This device can’t open the share sheet.' });
        return;
      }
      if (shareCardRef.current) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine lineup') });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
      setShareData(null);
      capturedRef.current = false;
      end('share');
    }
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  // Reading the lineup photo is a multi-second vision call — show the branded
  // percentage counter (not a dark spinner) so the wait reads as progress.
  if (identifying) return (
    <SearchProgress
      title="Reading your lineup…"
      subtitle="Vinster needs a few seconds"
      body="Vinster is reading each label in your photo. A clear, well-lit shot with the fronts facing forward gives the best results."
      durationMs={30000}
    />
  );
  if (!lineup) return (
    <MessageScreen
      title="Lineup not found"
      body="This lineup no longer exists."
      onBack={() => router.back()}
    />
  );

  const wines: LineupWine[] = lineup.wines ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Back (and Edit, when read-only) on the top row; Share and Save Lineup
            sit at the foot of the page. */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 16 }}>
            <Text accessibilityLabel="Back" style={styles.back}>←</Text>
          </TouchableOpacity>
          {!editing ? (
            <TouchableOpacity onPress={() => setEditing(true)} hitSlop={{ top: 10, bottom: 10, left: 16, right: 10 }} accessibilityLabel="Edit lineup">
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {/* The lineup's own name IS the title (no fixed "Your Lineup" heading). */}
        {!editing ? (
          name.trim() ? <Text style={styles.titleInput}>{name.trim()}</Text> : null
        ) : (
        <TextInput
          style={styles.titleInput}
          value={name}
          onChangeText={setName}
          onEndEditing={() => saveOnBlur(persistTitle, 'Could not save title')}
          placeholder="Add Your Title"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          textAlign="center"
          spellCheck={false}
          autoCorrect={false}
        />
        )}
        {/* Date · city · venue, editable in place — the same line as the wine
            review input screens. */}
        <View style={styles.headerStampWrap}>
          {!editing ? (
            <Text style={styles.stampLine}>{[fmtLineupDay(dateDraft), cityDraft.trim(), venueDraft.trim()].filter(Boolean).join(' · ')}</Text>
          ) : (
          <ReviewedLineEditable
            date={dateDraft} onDate={setDateDraft}
            city={cityDraft} onCity={setCityDraft}
            venue={venueDraft} onVenue={setVenueDraft}
            currency={currency}
            onEndEditing={() => saveOnBlur(persistStamp, 'Could not save')}
          />
          )}
        </View>
      </View>

      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <View style={styles.photoWrap}>
            {photoFailed ? (
              <OfflinePhotoPlaceholder width="100%" height={420} borderRadius={14} />
            ) : photoUri ? (
              <TouchableOpacity style={styles.photoTouch} activeOpacity={0.9} onPress={() => setZoomOpen(true)}>
                <LabelImage uri={photoUri} style={styles.photo} contentFit="contain" onError={() => repairLabelImage(qc, lineup.image_path)} />
              </TouchableOpacity>
            ) : <ActivityIndicator color={colors.gold} style={{ marginVertical: 40 }} />}
            {editing ? (
            <View style={styles.photoBadges}>
              {/* Change photo — upload a new image to replace this lineup's. */}
              <TouchableOpacity style={styles.photoBadge} onPress={changeLineupPhoto} disabled={replacingPhoto} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7} accessibilityLabel="Change photo">
                {replacingPhoto ? <ActivityIndicator size="small" color={colors.gold} /> : <Ionicons name="camera" size={18} color={colors.gold} />}
              </TouchableOpacity>
            </View>
            ) : null}
          </View>

          {/* Your Lineup Notes & Musings — an input field styled like the wine
              review fields, with the mic + clear inside it. */}
          {!editing ? (
            note.trim() ? (
              <View style={styles.noteBlock}>
                <Text style={styles.noteHeadLabel}>Your Lineup Notes & Musings</Text>
                <Text style={styles.noteText}>{note.trim()}</Text>
              </View>
            ) : null
          ) : (
          <View style={styles.noteBlock}>
            <Text style={styles.noteHeadLabel}>Your Lineup Notes & Musings</Text>
            <View>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                onEndEditing={() => saveOnBlur(persistNote, 'Could not save note')}
                placeholder="Tap to write, or use the mic to dictate your thoughts on this lineup…"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
              <MicButton style={styles.noteMic} value={note} onChangeText={setNote} onClear={() => setNote('')} domain="note" serverCorrect />
            </View>
          </View>
          )}

          {/* Wines */}
          <View style={styles.winesHeaderRow}>
            <Text style={styles.sectionLabel}>Wines in this lineup</Text>
          </View>
          {editing && wines.length > 0 ? <Text style={styles.sectionHint}>Tap a wine name to edit it</Text> : null}
          {wines.length === 0 ? (
            <View>
              {/* Identifying is an edit, so read-only points the way to Edit
                  rather than offering a button that isn't there. */}
              <Text style={styles.muted}>No bottles identified yet{lineup.bottle_count ? ` (${lineup.bottle_count} bottle${lineup.bottle_count === 1 ? '' : 's'} in the photo)` : ''}. {editing ? "Let Vinster read the labels and confirm what's in this lineup." : 'Tap Edit to identify the wines.'}</Text>
              {editing ? (
                <TouchableOpacity style={[styles.identifyBtn, identifying && { opacity: 0.5 }]} onPress={identifyWines} disabled={identifying} activeOpacity={0.85}>
                  <Text style={styles.identifyBtnText}>{identifying ? 'Reading the labels…' : 'Identify wines'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View style={styles.wineList}>
              {wines.map((w, i) => {
                // Detail line beneath the name, as on the Full Cellar List: the
                // row's own region (else the linked cellar wine's), grape, colour,
                // and the bottle size when it isn't a standard 75cl.
                const linkedCellar = linkedBottle(w.cellar_wine_id);
                const subParts = [
                  w.region ?? linkedCellar?.region,
                  w.grape ?? linkedCellar?.grape_variety,
                  w.style,
                  w.bottle_size_ml && w.bottle_size_ml !== 750 ? bottleSizeLabel(w.bottle_size_ml) : null,
                ].filter(Boolean) as string[];
                return (
                <View key={`${w.cellar_wine_id ?? 'x'}-${i}`} style={styles.wineRow}>
                  <View style={{ flex: 1 }}>
                    {/* Editing: tap the name to open the Edit wine pop-up. */}
                    <TouchableOpacity onPress={() => openWineEdit(i, w)} disabled={!editing} activeOpacity={0.7} hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}>
                      <Text style={styles.wineName}>
                        {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                    </TouchableOpacity>
                    {subParts.length > 0 ? <Text style={styles.wineDetail} numberOfLines={1}>{subParts.join(' · ')}</Text> : null}
                    {/* Status stamp. "Your Cellar" (linked) → tap to archive the
                        bottle or mark it Off Cellar. "Off Cellar" → tap to link it
                        via "This was from my cellar". */}
                    {w.cellar_wine_id ? (
                      <TouchableOpacity onPress={() => openCellarBadgeOptions(i, w)} disabled={!editing} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.stampTag}>Your Cellar</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => confirmFromCellar(i)} disabled={!editing} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                        <Text style={styles.stampTag}>Off Cellar</Text>
                      </TouchableOpacity>
                    )}
                    {/* Read-only: Your Review · Wine Intel for each wine. */}
                    {!editing ? (
                      <View style={styles.wineLinks}>
                        <TouchableOpacity onPress={() => openWineReview(w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <Text style={styles.wineLink}>Your Review</Text>
                        </TouchableOpacity>
                        <Text style={styles.wineLinkDot}>·</Text>
                        <TouchableOpacity onPress={() => openWineIntel(w)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                          <Text style={styles.wineLink}>Wine Intel</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                </View>
                );
              })}
            </View>
          )}

          {/* Foot of the page: Match (white), Share (white), Save Lineup (gold).
              Once matched, Match becomes "Your Restaurant Review" with an
              "(unmatch)" link beneath — the only way to unmatch. */}
          {matchedRestaurant ? (
            <View style={styles.matchBottomWrap}>
              <TouchableOpacity
                style={[styles.whiteButton, styles.footButton]}
                onPress={() => openRestaurantReview(matchedRestaurant.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.whiteButtonText}>Your Restaurant Review</Text>
              </TouchableOpacity>
              {editing ? (
                <TouchableOpacity onPress={() => matchRestaurant(null)} disabled={savingMatch} activeOpacity={0.7} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={styles.unmatchLink}>(unmatch)</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : editing ? (
            <TouchableOpacity style={[styles.whiteButton, styles.footButton]} onPress={() => setRestaurantPickerOpen(true)} activeOpacity={0.85}>
              <Text style={styles.whiteButtonText}>Match to a Restaurant Review</Text>
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity style={[styles.whiteButton, styles.footButton]} onPress={handleShare} disabled={sharing} activeOpacity={0.85}>
            <Text style={styles.whiteButtonText}>{sharing ? 'Sharing…' : 'Share'}</Text>
          </TouchableOpacity>

          {editing ? (
            <TouchableOpacity
              style={[styles.goldButton, styles.footButton, savingLineup && { opacity: 0.5 }]}
              onPress={saveLineup}
              disabled={savingLineup}
              activeOpacity={0.85}
            >
              <Text style={styles.goldButtonText}>{savingLineup ? 'Saving…' : 'Save Lineup'}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* "This was from my cellar" — pick the cellar wine this bottle was. */}
      <CellarWinePicker
        visible={cellarPickerFor != null}
        onClose={() => setCellarPickerFor(null)}
        onSelect={(cw) => { void pickCellarForWine(cw); }}
        allowPlaced
        subtitle="Pick the wine this bottle came from — Vinster moves it from your cellar to your archive."
      />

      {/* Edit wine pop-up. The backdrop is a sibling (not a wrapper) so the
          sheet's ScrollView scrolls freely. */}
      <Modal visible={editWineIndex !== null} transparent animationType="fade" onRequestClose={() => setEditWineIndex(null)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditWineIndex(null)} />
          <View style={[styles.modalSheet, styles.editSheet]}>
            <TouchableOpacity style={styles.pickerCloseX} onPress={() => setEditWineIndex(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit wine</Text>
            {findingOnline ? (
              // Catalogue-only search (real wines, never generated), pre-filled
              // with what Vinster already has for this wine.
              <ScrollView keyboardShouldPersistTaps="handled">
                <WineSearchInput
                  initialQuery={[editProducer, editName, editVintage].map((t) => t.trim()).filter(Boolean).join(' ')}
                  onSelect={applyFoundWine}
                />
                <TouchableOpacity style={styles.confirmCancel} onPress={() => setFindingOnline(false)}>
                  <Text style={styles.confirmCancelText}>Back</Text>
                </TouchableOpacity>
              </ScrollView>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.fieldLabel}>Producer</Text>
                <TextInput style={styles.fieldInput} value={editProducer} onChangeText={setEditProducer} placeholder="e.g. Château Batailley" placeholderTextColor={colors.textMuted} />
                <Text style={styles.fieldLabel}>Wine name</Text>
                <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="e.g. Grand Cru Classé" placeholderTextColor={colors.textMuted} />
                <Text style={styles.fieldLabel}>Region</Text>
                <TextInput style={styles.fieldInput} value={editRegion} onChangeText={setEditRegion} placeholder="e.g. Pauillac" placeholderTextColor={colors.textMuted} />
                <Text style={styles.fieldLabel}>Vintage</Text>
                <TextInput style={styles.fieldInput} value={editVintage} onChangeText={(t) => setEditVintage(t.slice(0, 7))} placeholder="e.g. 2019 or NV" placeholderTextColor={colors.textMuted} autoCapitalize="characters" maxLength={7} />
                <Text style={styles.fieldLabel}>Colour</Text>
                {/* Tap the selected colour again to clear it. */}
                <View style={styles.styleChips}>
                  {WINE_STYLES.map((st) => {
                    const on = editStyle === st;
                    return (
                      <TouchableOpacity key={st} style={[styles.styleChip, on && styles.styleChipOn]} onPress={() => setEditStyle(on ? null : st)} activeOpacity={0.7}>
                        <Text style={[styles.styleChipText, on && styles.styleChipTextOn]}>{st}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={styles.fieldLabel}>Bottle size</Text>
                <BottleSizePicker value={editSizeMl} onChange={setEditSizeMl} />
                <TouchableOpacity style={[styles.whiteButton, styles.findOnlineButton]} onPress={() => setFindingOnline(true)} activeOpacity={0.85}>
                  <Text style={styles.whiteButtonText}>Find Online</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, savingWineEdit && { opacity: 0.5 }]} onPress={saveWineEdit} disabled={savingWineEdit} activeOpacity={0.85}>
                  <Text style={styles.saveButtonText}>{savingWineEdit ? 'Saving…' : 'Save'}</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Match to a restaurant review in Your Restaurants. */}
      <Modal visible={restaurantPickerOpen} transparent animationType="fade" onRequestClose={() => setRestaurantPickerOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRestaurantPickerOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {/* White X (top-right) dismisses without matching. */}
            <TouchableOpacity style={styles.pickerCloseX} onPress={() => setRestaurantPickerOpen(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityLabel="Close">
              <Text style={styles.closeX}>✕</Text>
            </TouchableOpacity>

            <Text style={[styles.modalTitle, styles.pickerTitle]}>Match this lineup to a restaurant review</Text>
            <TextInput
              style={styles.fieldInput}
              value={restaurantSearch}
              onChangeText={setRestaurantSearch}
              placeholder="Search your restaurant reviews…"
              placeholderTextColor={colors.textMuted}
              spellCheck={false}
              autoCorrect={false}
            />
            {restaurantVisits.length === 0 ? (
              <Text style={styles.muted}>No restaurant reviews yet. Add one in Your Restaurants first.</Text>
            ) : filteredRestaurants.length === 0 ? (
              <Text style={styles.muted}>No restaurants match your search.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 300, marginTop: spacing.sm }} keyboardShouldPersistTaps="handled">
                {filteredRestaurants.map((a) => (
                  <TouchableOpacity key={a.id} style={styles.pickerOption} onPress={() => matchRestaurant(a.id)} disabled={savingMatch} activeOpacity={0.7}>
                    <Text style={styles.pickerOptionText} numberOfLines={1}>{a.restaurantName?.trim() || UNNAMED_RESTAURANT}</Text>
                    <Text style={styles.pickerOptionMeta} numberOfLines={1}>{[a.city?.trim(), a.capturedAt ? new Date(a.capturedAt).toLocaleDateString('en-GB') : ''].filter(Boolean).join(' · ')}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Confirm the wines Vinster identified — tap a wine to include/exclude. */}
      <Modal visible={confirmWines !== null} transparent animationType="fade" onRequestClose={() => setConfirmWines(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '82%' }]}>
            <Text style={styles.modalTitle}>Confirm the wines</Text>
            <Text style={styles.confirmBlurb}>Vinster read these from the photo. Tap to include or exclude, then save.</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {(confirmWines ?? []).map((w, i) => {
                const on = included.has(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={styles.confirmRow}
                    onPress={() => setIncluded((prev) => { const n = new Set(prev); if (n.has(i)) n.delete(i); else n.add(i); return n; })}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.confirmCheck, on && styles.confirmCheckOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.confirmWineName, !on && styles.confirmWineOff]}>
                        {w.count > 1 ? `${w.count}× ` : ''}{wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                      </Text>
                      {w.cellar_wine_id ? <Text style={styles.confirmCellarTag}>In your cellar</Text> : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={[styles.saveButton, (savingWines || included.size === 0) && { opacity: 0.5 }]} onPress={saveIdentifiedWines} disabled={savingWines || included.size === 0} activeOpacity={0.85}>
              <Text style={styles.saveButtonText}>{savingWines ? 'Saving…' : `Save ${included.size} wine${included.size === 1 ? '' : 's'}`}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setConfirmWines(null)} disabled={savingWines}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* After Save Lineup: offer to archive the cellar bottles drunk at this
          lineup that are still in the cellar. Nothing is ticked to start. */}
      <Modal visible={archiveOffer !== null} transparent animationType="fade" onRequestClose={() => { if (!archivingOffer) setArchiveOffer(null); }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { maxHeight: '82%' }]}>
            <Text style={styles.modalTitle}>Lineup Saved</Text>
            <Text style={styles.confirmBlurb}>Would you like the following bottles from your cellar to be archived?</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {(archiveOffer ?? []).map((index) => {
                const w = lineup.wines?.[index];
                if (!w) return null;
                const on = archiveTicked.has(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.confirmRow}
                    onPress={() => setArchiveTicked((prev) => { const n = new Set(prev); if (n.has(index)) n.delete(index); else n.add(index); return n; })}
                    disabled={archivingOffer}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.confirmCheck, on && styles.confirmCheckOn]}>{on ? '☑' : '☐'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.confirmWineName}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
                      <Text style={styles.confirmCellarTag}>{bottlesLabel(w)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity
              style={[styles.goldButton, styles.footButton, (archivingOffer || archiveTicked.size === 0) && { opacity: 0.5 }]}
              onPress={() => { void archiveOfferSelected(); }}
              disabled={archivingOffer || archiveTicked.size === 0}
              activeOpacity={0.85}
            >
              <Text style={styles.goldButtonText}>{archivingOffer ? 'Archiving…' : 'Archive Selected'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmCancel} onPress={() => setArchiveOffer(null)} disabled={archivingOffer}>
              <Text style={styles.confirmCancelText}>Not Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Full-screen zoomable viewer for the lineup photo. */}
      <LabelPhotoViewer visible={zoomOpen} uri={photoUri} onClose={() => setZoomOpen(false)} contain />

      {/* Off-screen share card. */}
      {shareData ? (
        <View style={styles.offscreen} pointerEvents="none">
          <LineupShareCard ref={shareCardRef} imageUrl={shareData.url} name={name.trim() || lineup.name} venue={lineup.venue} city={lineup.city} date={shareData.date} note={shareData.note} wines={lineup.wines ?? []} onImageReady={captureAndShare} />
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  editLink: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.gold },
  stampLine: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.text, textAlign: 'center' },
  noteText: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 22 },
  wineLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  wineLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold },
  wineLinkDot: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },

  // The lineup's own name — the large gold heading.
  titleInput: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.gold, textAlign: 'center', letterSpacing: 0.5, paddingVertical: 4, marginTop: spacing.xs, alignSelf: 'stretch', paddingHorizontal: spacing.xl },
  headerStampWrap: { marginTop: spacing.sm },

  photoWrap: { alignItems: 'center', paddingTop: spacing.md },
  // The touchable owns the 92% width; the image fills it (a percentage width on
  // the image alone collapses to 0 inside an auto-width touchable).
  photoTouch: { width: '92%' },
  photo: { width: '100%', height: 420, borderRadius: 14, backgroundColor: colors.surface },
  // Change-photo badge, top-right on the photo.
  photoBadges: { position: 'absolute', top: spacing.lg, right: '8%', flexDirection: 'row', gap: spacing.sm },
  photoBadge: { backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 18, minWidth: 34, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center' },

  // Section headers — gold, all-caps, matching the stats-bar type.
  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.sm },
  sectionHint: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text, paddingHorizontal: spacing.xl, marginTop: -spacing.xs, marginBottom: spacing.xs },
  winesHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  noteBlock: { marginTop: spacing.md, marginBottom: spacing.sm, paddingHorizontal: spacing.xl },
  noteHeadLabel: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm },
  // Same field as the wine review inputs (WineReviewFields), with room on the
  // right for the mic + clear pinned inside it.
  noteInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, paddingRight: 92, minHeight: 100, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  noteMic: { position: 'absolute', top: spacing.sm, right: spacing.sm },

  wineList: { paddingHorizontal: spacing.xl },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  // Detail line beneath the name — mirrors the Full Cellar List row detail.
  wineDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  // "Your Cellar" / "Off Cellar" status stamp.
  stampTag: { alignSelf: 'flex-start', fontSize: 11, fontFamily: fonts.bodySemibold, textTransform: 'uppercase', letterSpacing: 0.4, color: colors.gold, borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', paddingHorizontal: 8, paddingVertical: 1, borderRadius: 999, overflow: 'hidden' },
  muted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, lineHeight: 20 },

  identifyBtn: { marginHorizontal: spacing.xl, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  identifyBtnText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },

  // Buttons: white outline (secondary actions) and gold outline (saving).
  whiteButton: { alignItems: 'center', borderWidth: 1, borderColor: colors.text, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl },
  whiteButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, letterSpacing: 0.3, textAlign: 'center' },
  goldButton: { alignItems: 'center', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, backgroundColor: 'rgba(224,184,74,0.12)' },
  goldButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold, letterSpacing: 0.3, textAlign: 'center' },
  // The foot-of-page buttons share one width so they line up.
  footButton: { alignSelf: 'center', minWidth: '82%', marginTop: spacing.md },
  matchBottomWrap: { alignItems: 'center', gap: spacing.sm },
  unmatchLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },

  // Pop-ups (Edit wine, restaurant match, confirm identified wines).
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, width: '100%', maxWidth: 460 },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', letterSpacing: 0.4, marginBottom: spacing.md },
  closeX: { fontFamily: fonts.bodyRegular, fontSize: 20, color: '#FFFFFF' },
  pickerCloseX: { position: 'absolute', top: spacing.sm, right: spacing.sm, zIndex: 2, padding: 4 },
  fieldLabel: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginBottom: 4, marginTop: spacing.sm, letterSpacing: 0.3 },
  fieldInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  saveButton: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', backgroundColor: 'rgba(224,184,74,0.12)' },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },

  // Edit wine: taller than the other pop-ups, so its fields scroll.
  editSheet: { maxHeight: '88%' },
  styleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  styleChip: { borderWidth: 1, borderColor: 'rgba(224,184,74,0.4)', borderRadius: 999, paddingHorizontal: spacing.md, paddingVertical: 6 },
  styleChipOn: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  styleChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  styleChipTextOn: { color: colors.gold },
  findOnlineButton: { marginTop: spacing.lg },

  // Restaurant-match picker. The title is padded clear of the close X.
  pickerTitle: { paddingHorizontal: spacing.lg },
  pickerOption: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerOptionText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  pickerOptionMeta: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  confirmBlurb: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md, lineHeight: 20 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  confirmCheck: { fontSize: 22, color: colors.textMuted },
  confirmCheckOn: { color: colors.gold },
  confirmWineName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text, lineHeight: 20 },
  confirmWineOff: { color: colors.textMuted, textDecorationLine: 'line-through' },
  confirmCellarTag: { fontFamily: fonts.bodySemibold, fontSize: 11, color: colors.gold, marginTop: 2 },
  confirmCancel: { alignItems: 'center', paddingVertical: spacing.md, marginTop: spacing.xs },
  confirmCancelText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.textMuted },

  offscreen: { position: 'absolute', left: -9999, top: -9999 },
});
