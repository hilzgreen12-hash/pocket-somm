import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { View, Text, TouchableOpacity, Share } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { wc as wcBase, wcArchived } from '../wcStyles';
import { ArchivedCardProvider, ARCHIVED } from '../cardTheme';
import { s } from './styles';
import { WineCardHero } from '../WineCardHero';
import { DrinkingWindowSheet } from '../DrinkingWindowSheet';
import { PlaceWinesSheet } from '../PlaceWinesSheet';
import { showAlert } from '../../AppAlert';
import { WineIntelShareCard } from '../../WineIntelShareCard';
import { ShareSheet } from '../../ShareSheet';
import { wineHeaderLine } from '../../../utils/wineHeader';
import { NoIntelPrompt } from '../../NoIntelPrompt';
import { SpiritBadge } from '../../SpiritBadge';
import { LabelPhotoViewer } from '../../LabelPhotoViewer';
import { PackagingPrompt } from '../../PackagingPrompt';
import { RangeWineNoteSheet } from '../../RangeWineNoteSheet';
import { useAuth } from '../../../hooks/useAuth';
import { useCellar } from '../../../hooks/useCellar';
import { usePreferences } from '../../../hooks/usePreferences';
import { useLabelStore } from '../../../stores/labelStore';
import { uploadLabelImage } from '../../../api/labelPhotos';
import { getCachedLabelUri } from '../../../api/labelImageCache';
import { useCommunityMember } from '../../../hooks/useCommunityMember';
import { cellarShare, confirmAndShare, confirmAndUnshare } from '../../../services/communityShare';
import { entriesOf, latestEntry } from '../../../utils/cellarReview';
import { launchCamera, launchImageLibrary } from '../../../utils/imagePicker';
import { shareResult, sharerNameFrom, vinsterSharedLead } from '../../../utils/shareCard';
import { perBottle } from '../../../utils/bottleValue';
import { todayYmd } from '../../../utils/reviewDate';
import { confirmWineDelete, reviewsOn } from '../../../utils/confirmWineDelete';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../../constants/share';
import { COMMUNITY_ENABLED } from '../../../constants/features';
import { formatCurrency } from '../../../constants/currency';
import type { CellarWine } from '../../../types/wine';
import { useWineCardData, type ArchiveSource } from './useWineCardData';
import { useMarketComparison } from './useMarketComparison';
import { useServing } from './useServing';
import { useProducerRange } from './useProducerRange';
import { useBottleActions, type TappedSlot } from './useBottleActions';
import { useReturnToCellar } from './useReturnToCellar';
import type { WineIntel } from './useWineIntel';
import { OverviewFacts, OverviewTab } from './OverviewTab';
import { MarketTab } from './MarketTab';
import { ServeTab } from './ServeTab';
import { CellarTab } from './CellarTab';
import { ArchiveBottlesCard } from './ArchiveBottlesCard';
import { AddBottlesSheet } from './AddBottlesSheet';
import { MoveBottlesSheet } from './MoveBottlesSheet';
import { ArchiveBottlesSheet } from './ArchiveBottlesSheet';

type Tab = 'overview' | 'market' | 'somm' | 'cellar';

// A sheet another screen asked the card to open on arrival (Edit Wine's "Place
// Now", or its Archive / Delete when the bottle count was lowered). `t` makes
// each request unique, so returning to the same card handles it exactly once.
export type CardRequest = { open?: string; count?: string; t?: string };
const handledRequests = new Set<string>();

// The cellar wine card itself — mounted by the route's gate only once the wine
// is loaded and its intel is ready to show.
export function CellarWineCard({ wine, intel, canEdit, cameFromReviews, tappedSlot, request, onDeleted }: {
  wine: CellarWine;
  intel: WineIntel;
  canEdit: boolean;
  cameFromReviews: boolean;
  tappedSlot: TappedSlot | null;
  request: CardRequest;
  onDeleted: () => void;
}) {
  const qc = useQueryClient();
  const { session } = useAuth();
  const { updateWine } = useCellar();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed } = useLabelStore();
  const isArchived = !!wine.archived_at;
  // Archived cards wear their own colours (cream page, terracotta panels).
  const wc = isArchived ? wcArchived : wcBase;
  const currency = preferences?.defaultCurrency ?? wine.estimated_value_currency ?? 'GBP';

  const [tab, setTab] = useState<Tab>('overview');
  const data = useWineCardData(wine);
  const market = useMarketComparison(wine, { open: tab === 'market', canEdit, currency });
  const serving = useServing(wine, { open: tab === 'somm', canEdit });
  const range = useProducerRange(wine);
  const actions = useBottleActions(wine, data, { tappedSlot, onDeleted });
  // Returning this card's own entry to a cellar line that already holds the
  // wine merges it there (the archived row goes), so follow it to that line.
  const returnToCellar = useReturnToCellar(({ archivedWineId, cellarWineId }) => {
    if (archivedWineId === wine.id && cellarWineId !== wine.id) router.replace(`/cellar/${cellarWineId}`);
  });

  const [windowSheetOpen, setWindowSheetOpen] = useState(false);
  // Share Result → the Share pop-up.
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [placeOpen, setPlaceOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [archiveCount, setArchiveCount] = useState<number | null>(null);
  const [rangeNote, setRangeNote] = useState<{ name: string; tier: string | null } | null>(null);
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  // The just-picked photo, shown at once while it uploads (and kept, so the
  // stored copy's reload never flashes the old label).
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const community = useCommunityMember();
  // Share Result renders the Wine Intel share card off-screen and captures it.
  const intelShareRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [sharePayload, setSharePayload] = useState<ComponentProps<typeof WineIntelShareCard> | null>(null);
  // Resolves when the share card's label photo has drawn (or failed).
  const sharePhotoDrawnRef = useRef<(() => void) | null>(null);

  // A live wine's tabs (an archived wine's card is a single page).
  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'market', label: 'Market' },
    { id: 'cellar', label: 'Cellar' },
    { id: 'somm', label: 'Serve' },
  ];
  const wineTitle = [wine.producer, wine.wine_name, wine.vintage].filter(Boolean).join(' ');

  function openEdit() {
    router.push(`/cellar/edit-wine/${wine.id}`);
  }

  // ---- Archive / delete ----------------------------------------------------

  function startArchive(count: number) {
    actions.chooseArchiveFilter(() => setArchiveCount(count));
  }

  // A partial archive of a wine split across several places (and not already
  // tied to a tapped rack slot) asks which place the bottles come from.
  function archiveFromSheet(input: { count: number; date: string; note: string }) {
    setArchiveCount(null);
    const sources = data.archiveSources;
    if (input.count < wine.quantity && !tappedSlot && sources.length > 1) {
      showAlert({
        title: 'Archive the bottle from which location?',
        body: 'This wine is split across more than one place — choose where these bottles come from.',
        buttons: [
          ...sources.map((src: ArchiveSource) => ({ text: `${src.label} · ${src.count} bottle${src.count === 1 ? '' : 's'}`, onPress: () => void actions.archive({ ...input, source: src }) })),
          { text: 'Cancel', style: 'cancel' as const },
        ],
      });
      return;
    }
    void actions.archive({ ...input, source: null });
  }

  // Deleting every bottle deletes the wine and the reviews stored on it, so
  // the confirmation says so and offers to archive it instead. An archived
  // wine's delete removes its whole archive line (see deleteBottles).
  function confirmDelete(count: number) {
    const whole = isArchived || count >= wine.quantity;
    confirmWineDelete({
      lead: isArchived ? 'Permanently remove it from your archive.'
        : whole ? undefined
        : `Permanently delete ${count} of your ${wine.quantity} bottles of ${wine.wine_name}${wine.vintage ? ` ${wine.vintage}` : ''}.`,
      reviewsLost: whole ? reviewsOn(isArchived ? data.archiveLine : [wine]) : 0,
      deleteText: 'Remove permanently',
      onDelete: () => void actions.deleteBottles(count),
      onArchive: isArchived ? undefined : () => actions.chooseArchiveFilter(() => void actions.archive({ count: wine.quantity, date: todayYmd(), note: '', source: null })),
    });
  }

  // Requests from another screen, handled once the destinations have loaded
  // (the place chooser would otherwise report "no locations yet").
  useEffect(() => {
    const { open, t } = request;
    if (!open || !t || handledRequests.has(t) || data.destinationsLoading || !canEdit || isArchived) return;
    handledRequests.add(t);
    const count = Math.max(1, parseInt(request.count ?? '', 10) || 1);
    if (open === 'place') actions.openPlaceMenu();
    else if (open === 'archive') startArchive(Math.min(count, wine.quantity));
    else if (open === 'delete') confirmDelete(Math.min(count, wine.quantity));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.open, request.t, data.destinationsLoading]);

  // ---- Label photo ----------------------------------------------------------

  // Add or replace the label photo: camera, library, or a label found online.
  function addPhoto() {
    const pick = async (fromCamera: boolean) => {
      if (!session?.user.id) return;
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        showAlert({ title: 'Permission needed', body: fromCamera ? 'Allow camera access to photograph your label.' : 'Allow photo access to choose a label.' });
        return;
      }
      const result = fromCamera
        ? await launchCamera({ quality: 1 })
        : await launchImageLibrary({ mediaTypes: ['images'], quality: 1 });
      if (result.canceled || !result.assets?.[0]) return;
      setLocalPhotoUri(result.assets[0].uri);
      setUploadingPhoto(true);
      try {
        const path = await uploadLabelImage(session.user.id, result.assets[0].uri, wine.id);
        // The user's own photo, not a web label (those stay off shared cards).
        await updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: path, label_image_fetched: false } });
        void qc.invalidateQueries({ queryKey: ['rack-slots'] });
        // The path is reused per wine, so bust its cached signed URL or the
        // previous image would keep showing.
        void qc.invalidateQueries({ queryKey: ['label-image', path] });
      } catch (err) {
        setLocalPhotoUri(null);
        showAlert({ title: 'Could not save photo', body: err instanceof Error ? err.message : 'Please try again.' });
      } finally {
        setUploadingPhoto(false);
      }
    };
    showAlert({
      title: wine.label_image_path ? 'Change label photo' : 'Add a label photo',
      body: 'Take a photo of the bottle label, choose one from your library, or let Vinster find one online.',
      buttons: [
        { text: 'Take Photo', onPress: () => void pick(true) },
        { text: 'Choose from Library', onPress: () => void pick(false) },
        { text: 'Find Label Online', onPress: () => router.push(`/label/find-label?wineId=${wine.id}&producer=${encodeURIComponent(wine.producer ?? '')}&wineName=${encodeURIComponent(wine.wine_name ?? '')}`) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function photoMenu() {
    showAlert({
      title: 'Label photo',
      body: 'Change this label photo, or remove it.',
      buttons: [
        { text: 'Change photo', onPress: addPhoto },
        {
          text: 'Delete photo',
          style: 'destructive',
          onPress: () => {
            setLocalPhotoUri(null);
            updateWine.mutateAsync({ id: wine.id, updates: { label_image_path: null } })
              .then(() => qc.invalidateQueries({ queryKey: ['rack-slots'] }))
              .catch((err) => showAlert({ title: 'Could not remove photo', body: err instanceof Error ? err.message : 'Please try again.' }));
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  // ---- Serve, share and community --------------------------------------------

  // Recipes go through the Chef tab's per-search preferences screen; colour and
  // grape are known for this wine, so they're passed rather than re-inferred.
  function findPairings() {
    setWineDetailsConfirmed({
      producer: wine.producer || '',
      region: wine.region || '',
      wineName: wine.wine_name || null,
      vintage: wine.vintage || 'NV',
      style: wine.style || null,
      grape: wine.grape_variety || null,
    });
    router.push(`/chef/review-requirements?from=cellar&wineId=${wine.id}`);
  }

  // Share Result: Vinster's scores, value and tasting note as an image
  // (or plain text where the share sheet can't take one).
  async function shareIntel() {
    if (sharing) return;
    setSharing(true);
    const drinkingWindow = wine.drinking_window_from && wine.drinking_window_to ? `${wine.drinking_window_from}–${wine.drinking_window_to}` : null;
    const estimatedValue = wine.estimated_value != null
      ? `${formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}${perBottle(wine.bottle_size_ml)}`
      : null;
    // The label goes into the captured image, so resolve it to a local file first.
    let imageUri: string | null = null;
    if (wine.label_image_path) {
      try { imageUri = await getCachedLabelUri(wine.label_image_path); } catch { /* no photo */ }
    }
    // Capture only once the photo has drawn (a fixed wait could catch it
    // blank), capped at 5s so a stuck image can't hold the share.
    const photoDrawn = imageUri ? new Promise<void>((r) => { sharePhotoDrawnRef.current = r; }) : Promise.resolve();
    setSharePayload({
      producer: wine.producer, wineName: wine.wine_name, vintage: wine.vintage, region: wine.region,
      grape: wine.grape_variety, criticScore: wine.critic_score, drinkingWindow, estimatedValue,
      tastingNote: wine.tasting_notes, imageUri,
    });
    try {
      await Promise.race([photoDrawn, new Promise((r) => setTimeout(r, 5000))]);
      // One paint for the off-screen card to settle.
      await new Promise((r) => setTimeout(r, 250));
      if (intelShareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(intelShareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session), message: vinsterSharedLead(sharerNameFrom(session), 'a wine note') });
        return;
      }
      const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
      const header = (sameName ? [wine.producer, wine.vintage] : [wine.producer, wine.wine_name, wine.vintage]).filter(Boolean).join(' ');
      const stats = [
        wine.critic_score != null ? `Critic score: ${wine.critic_score} pts` : null,
        drinkingWindow ? `Drinking window: ${drinkingWindow}` : null,
        estimatedValue ? `Estimated value: ${estimatedValue}` : null,
      ].filter(Boolean);
      const note = (wine.tasting_notes ?? '').trim();
      await Share.share({
        message: `${header}${stats.length ? `\n${stats.join('\n')}` : ''}${note ? `\n\n${note}` : ''}${VINSTER_TEXT_SHARE_FOOTER}`,
        title: header,
      });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      sharePhotoDrawnRef.current = null;
      setSharing(false);
      setSharePayload(null);
    }
  }

  // Opened from Your Wine Reviews: share the bottle's latest tasting with the
  // Vinster Community, or take the share down again.
  const latestTasting = latestEntry(entriesOf(wine));
  const communityInput = latestTasting ? cellarShare(wine, latestTasting) : null;
  const myShare = community.shares.get(`cellar_wines:${wine.id}`);
  function postToCommunity() {
    if (myShare) confirmAndUnshare(myShare.id, communityInput?.title ?? wine.wine_name, community.refreshShares);
    else if (communityInput) confirmAndShare(communityInput, community.member, community.refreshShares);
  }

  return (
    <ArchivedCardProvider value={isArchived}>
    <KeyboardAwareScrollView
      style={[s.container, isArchived && { backgroundColor: ARCHIVED.page }]}
      contentContainerStyle={{ paddingBottom: 80 }}
      keyboardShouldPersistTaps="always"
      automaticallyAdjustKeyboardInsets
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <WineCardHero
        path={wine.label_image_path}
        uri={localPhotoUri}
        busy={uploadingPhoto}
        title={wineTitle}
        subtitle={[wine.region, wine.grape_variety].filter(Boolean).join(' · ')}
        chip=""
        onBack={() => router.back()}
        onPhotoPress={() => (wine.label_image_path ? setPhotoViewerOpen(true) : canEdit ? addPhoto() : undefined)}
        onPhotoLongPress={() => (canEdit ? (wine.label_image_path ? photoMenu() : addPhoto()) : undefined)}
        onTitlePress={() => (canEdit ? openEdit() : undefined)}
        placeholder={canEdit ? undefined : <View />}
        badge={wine.is_spirit ? <SpiritBadge /> : null}
      />

      {isArchived ? (
        // An archived wine is one page: its history, archive entries and
        // reviews, with no market, serving or storage tabs.
        <>
          <Text style={[s.archivedHeading, { color: ARCHIVED.espresso }]}>Archived Wine</Text>
          <View style={[s.archivedRule, { backgroundColor: ARCHIVED.accent }]} />
          <OverviewFacts wine={wine} data={data} intel={intel} canEdit={canEdit} onWindow={() => setWindowSheetOpen(true)} />
          <View style={wc.Body}>
            <OverviewTab
              wine={wine}
              data={data}
              intel={intel}
              range={range}
              canEdit={canEdit}
              currency={currency}
              onRangeWine={(name, tier) => setRangeNote({ name, tier })}
              afterHistory={<ArchiveBottlesCard data={data} canEdit={canEdit} returning={returnToCellar.returning} onReturn={() => returnToCellar.start(data.archiveLine)} />}
            />
            {canEdit ? (
              <TouchableOpacity style={[s.exportBtn, s.archivedDeleteBtn, { borderColor: ARCHIVED.espresso }, actions.working && s.buttonDisabled]} onPress={() => confirmDelete(wine.quantity)} disabled={actions.working}>
                <Text style={[s.exportBtnText, { color: ARCHIVED.espresso }]}>Delete Wine From Your Records</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </>
      ) : (
        <>
          <View style={wc.TabBar} accessibilityRole="tablist">
            {tabs.map((t) => {
              const on = tab === t.id;
              return (
                <TouchableOpacity key={t.id} style={[wc.Tab, on && wc.TabOn]} onPress={() => setTab(t.id)} accessibilityRole="tab" accessibilityState={{ selected: on }} activeOpacity={0.7}>
                  <Text style={[wc.TabText, on && wc.TabTextOn]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {tab === 'overview' ? (
            <OverviewFacts wine={wine} data={data} intel={intel} canEdit={canEdit} onBottles={() => setTab('cellar')} onWindow={() => setWindowSheetOpen(true)} />
          ) : null}

          <View style={wc.Body}>
            {tab === 'overview' ? (
              <OverviewTab wine={wine} data={data} intel={intel} range={range} canEdit={canEdit} currency={currency} onRangeWine={(name, tier) => setRangeNote({ name, tier })} />
            ) : null}
            {tab === 'market' ? <MarketTab wine={wine} market={market} intel={intel} canEdit={canEdit} currency={currency} /> : null}
            {tab === 'somm' ? <ServeTab wine={wine} serving={serving} canEdit={canEdit} onFindPairings={findPairings} /> : null}
            {tab === 'cellar' ? (
              <CellarTab
                wine={wine}
                data={data}
                canEdit={canEdit}
                moving={actions.moving}
                onPlace={() => setPlaceOpen(true)}
                onAddToLocation={actions.openPlaceMenu}
                onAdd={() => setAddOpen(true)}
                onMove={() => {
                  if (data.homeBottles === 0) {
                    showAlert({ title: 'Nothing to move', body: 'All bottles of this wine are in external storage. To bring them home, hold the wine in your cellar list and choose Move to Home Storage.' });
                    return;
                  }
                  setMoveOpen(true);
                }}
                onArchive={() => startArchive(1)}
                onDelete={() => confirmDelete(wine.quantity)}
              />
            ) : null}

            {/* Share Result → the Share pop-up: Share to Community (the review,
                when opened from Your Wine Reviews) and Share externally. */}
            <TouchableOpacity style={s.exportBtn} onPress={() => setShareSheetOpen(true)} disabled={sharing} activeOpacity={0.85}>
              <Text style={s.exportBtnText}>{sharing ? 'Preparing…' : 'Share Result'}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <ShareSheet
        visible={shareSheetOpen}
        heading={COMMUNITY_ENABLED && cameFromReviews ? 'Your Wine Review' : 'Your Wine'}
        name={wineHeaderLine(wine.producer, wine.wine_name, wine.vintage) || wine.wine_name}
        detail={wine.region ?? null}
        community={COMMUNITY_ENABLED && cameFromReviews && (communityInput || myShare) ? {
          label: !myShare ? 'Share to Community' : myShare.status === 'visible' ? '✓ Shared to Community' : 'Waiting for Vinster’s Check',
          onPress: postToCommunity,
        } : null}
        onShareExternally={() => void shareIntel()}
        onClose={() => setShareSheetOpen(false)}
      />

      <PlaceWinesSheet visible={placeOpen} onClose={() => setPlaceOpen(false)} wine={wine} available={data.unplaced} racks={data.racks} bins={data.bins} locations={data.storageLocations} />
      <AddBottlesSheet visible={addOpen} wine={wine} data={data} actions={actions} onClose={() => setAddOpen(false)} />
      <MoveBottlesSheet visible={moveOpen} wine={wine} data={data} actions={actions} onClose={() => setMoveOpen(false)} />
      <ArchiveBottlesSheet
        visible={archiveCount != null}
        wine={wine}
        initialCount={archiveCount ?? 1}
        working={actions.working}
        onArchive={archiveFromSheet}
        onDelete={(count) => { setArchiveCount(null); confirmDelete(count); }}
        onClose={() => setArchiveCount(null)}
      />
      <DrinkingWindowSheet
        visible={windowSheetOpen}
        onClose={() => setWindowSheetOpen(false)}
        wineName={[wine.producer, wine.wine_name !== wine.producer ? wine.wine_name : null, wine.vintage].filter(Boolean).join(' ')}
        from={wine.drinking_window_from}
        to={wine.drinking_window_to}
        fallbackStatus={wine.drinking_window_status}
      />
      <LabelPhotoViewer visible={photoViewerOpen} path={wine.label_image_path} fallbackText={wine.wine_name} onClose={() => setPhotoViewerOpen(false)} />
      <NoIntelPrompt
        visible={intel.noIntelVisible}
        onDismiss={intel.dismissNoIntel}
        onEdit={() => { intel.dismissNoIntel(); openEdit(); }}
        editLabel="Edit Wine"
      />
      <RangeWineNoteSheet
        producer={wine.producer}
        wineName={rangeNote?.name ?? null}
        region={wine.region}
        tier={rangeNote?.tier ?? null}
        visible={!!rangeNote}
        onClose={() => setRangeNote(null)}
      />
      {/* "How is this wine packaged?" — after filing it into an Other Home Storage location. */}
      <PackagingPrompt
        visible={actions.packagingLocationId !== null}
        wineId={wine.id}
        locationId={actions.packagingLocationId}
        userId={session?.user.id ?? ''}
        onClose={actions.closePackaging}
        onDone={() => {
          void qc.invalidateQueries({ queryKey: ['storage-location-cases', actions.packagingLocationId] });
          void qc.invalidateQueries({ queryKey: ['cellar'] });
        }}
      />
      {sharePayload ? (
        <View style={s.shareCardWrap} pointerEvents="none">
          <WineIntelShareCard ref={intelShareRef} {...sharePayload} onImageReady={() => sharePhotoDrawnRef.current?.()} />
        </View>
      ) : null}
    </KeyboardAwareScrollView>
    </ArchivedCardProvider>
  );
}
