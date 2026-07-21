import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Modal, TextInput, useWindowDimensions } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as Sharing from 'expo-sharing';
import { shareResult, sharerNameFrom } from '../../src/utils/shareCard';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { listLineupArchives, lineupSignedUrl, setLineupFavourite, setLineupNote, saveLineupArchive, deleteLineupArchive, type LineupArchive } from '../../src/api/lineups';
import { MicButton } from '../../src/components/MicButton';
import { LineupShareCard } from '../../src/components/LineupShareCard';
import { ensureMediaPermission } from '../../src/utils/mediaPermissions';
import { captureCity } from '../../src/utils/captureCity';
import { useLibraryFilters } from '../../src/hooks/useLibraryFilters';
import { LibraryFilterModal } from '../../src/components/LibraryFilterModal';
import type { LibraryFilter } from '../../src/api/libraryFilters';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fontsSpectral as fonts } from '../../src/constants/fonts';

const FAV_OPTIONS = [
  { value: 'all', label: 'All lineups' },
  { value: 'fav', label: 'Favourites only' },
];

function monthKey(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

// A single lineup tile — resolves a fresh signed URL for its photo on mount.
function LineupTile({ item, size, onPress, onToggleFav, onLongPress }: { item: LineupArchive; size: number; onPress: () => void; onToggleFav: () => void; onLongPress: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    lineupSignedUrl(item.image_path).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [item.image_path]);

  const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const stamp = [date, item.city].filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={[styles.tile, { width: size }]} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.8}>
      <View style={[styles.tileImageWrap, { width: size, height: size * 1.1 }]}>
        {url ? <Image source={{ uri: url }} style={{ width: size, height: size * 1.1 }} resizeMode="cover" />
             : <ActivityIndicator color={colors.gold} />}
        <TouchableOpacity style={styles.favStar} onPress={onToggleFav} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
          <Text style={[styles.favStarText, item.is_favourite && styles.favStarActive]}>{item.is_favourite ? '★' : '☆'}</Text>
        </TouchableOpacity>
        {item.note ? <View style={styles.noteDot} /> : null}
      </View>
      {/* Date · city stamp. Tap the tile to open the lineup (note, share, wines). */}
      <View style={styles.tileTopRow}>
        <Text style={styles.tileDate} numberOfLines={1}>{item.is_favourite ? '★ ' : ''}{stamp}</Text>
      </View>
      {item.bottle_count ? (
        <Text style={styles.tileCount}>{item.bottle_count} bottle{item.bottle_count === 1 ? '' : 's'}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function LineupLibraryScreen() {
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const qc = useQueryClient();
  const userId = session?.user.id;

  const { data: lineups = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['lineup-archives', userId],
    queryFn: () => listLineupArchives(userId!),
    enabled: !!userId,
  });

  const [favFilter, setFavFilter] = useState<'all' | 'fav'>('all');
  const [monthFilter, setMonthFilter] = useState<string>('All');
  const [openDropdown, setOpenDropdown] = useState<'fav' | 'month' | null>(null);

  // "+ Add" a lineup straight from a photo — no cellar match, no bottle count,
  // just the picture. Once saved it behaves exactly like an Archive-a-Night
  // lineup (favourite, note, share).
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  async function addLineupFrom(source: 'camera' | 'library') {
    setAddOpen(false);
    if (!userId) return;
    if (source === 'library' && !(await ensureMediaPermission('library'))) return;
    try {
      const opts = { mediaTypes: ['images'] as ImagePicker.MediaType[], quality: 1 };
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (result.canceled || !result.assets.length) return;
      setAdding(true);
      const city = await captureCity();
      await saveLineupArchive(userId, result.assets[0].uri, null, { city });
      qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
    } catch (err) {
      showAlert({ title: source === 'camera' ? 'Could not open camera' : 'Could not add the photo', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setAdding(false);
    }
  }

  // Bespoke user-created filters.
  const { filters: customFilters, create, setItems, rename, remove } = useLibraryFilters('lineup');
  const [activeCustomId, setActiveCustomId] = useState<string | null>(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [editingFilter, setEditingFilter] = useState<LibraryFilter | null>(null);
  const [savingFilter, setSavingFilter] = useState(false);

  // Month options grow as the collection does — distinct months, newest first.
  const monthOptions = useMemo(() => {
    const seen: string[] = [];
    for (const l of lineups) { const k = monthKey(l.archived_at); if (!seen.includes(k)) seen.push(k); }
    return [{ value: 'All', label: 'All months' }, ...seen.map((m) => ({ value: m, label: m }))];
  }, [lineups]);

  const filtered = useMemo(() => {
    let list = lineups;
    if (favFilter === 'fav') list = list.filter((l) => l.is_favourite);
    if (monthFilter !== 'All') list = list.filter((l) => monthKey(l.archived_at) === monthFilter);
    if (activeCustomId) {
      const f = customFilters.find((cf) => cf.id === activeCustomId);
      const ids = new Set(f?.itemIds ?? []);
      list = list.filter((l) => ids.has(l.id));
    }
    return list;
  }, [lineups, favFilter, monthFilter, activeCustomId, customFilters]);

  function applyCustom(id: string) {
    setActiveCustomId((prev) => (prev === id ? null : id));
  }
  function openCreateFilter() {
    setEditingFilter(null);
    setFilterModalOpen(true);
  }
  function openFilterOptions(f: LibraryFilter) {
    showAlert({
      title: f.name,
      body: 'Edit this filter’s name and lineups, or delete it. Your lineups stay in the library either way.',
      buttons: [
        { text: 'Edit', onPress: () => { setEditingFilter(f); setFilterModalOpen(true); } },
        { text: 'Delete', style: 'destructive', onPress: () => { if (activeCustomId === f.id) setActiveCustomId(null); remove.mutate(f.id); } },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveFilter(name: string, ids: string[]) {
    setSavingFilter(true);
    try {
      if (editingFilter) {
        await rename.mutateAsync({ filterId: editingFilter.id, name });
        await setItems.mutateAsync({ filterId: editingFilter.id, itemIds: ids });
      } else {
        await create.mutateAsync({ name, itemIds: ids });
      }
      setFilterModalOpen(false);
      setEditingFilter(null);
    } catch (err) {
      showAlert({ title: 'Could not save filter', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingFilter(false);
    }
  }
  // Items offered in the create/edit sheet — every lineup, by date.
  const filterItems = useMemo(() => lineups.map((l) => ({
    id: l.id,
    label: new Date(l.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    sublabel: l.bottle_count ? `${l.bottle_count} bottle${l.bottle_count === 1 ? '' : 's'}` : undefined,
  })), [lineups]);

  async function toggleFav(item: LineupArchive) {
    try {
      await setLineupFavourite(item.id, !item.is_favourite);
      qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
    } catch (err) {
      showAlert({ title: 'Could not update', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  // Long-press a tile to delete the lineup (photo + record).
  function confirmDeleteLineup(item: LineupArchive) {
    const date = new Date(item.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    showAlert({
      title: 'Delete this lineup?',
      body: `This permanently removes the lineup photo from ${date} and its note. This can't be undone.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete lineup',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLineupArchive(item.id);
              qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
      ],
    });
  }

  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  async function openViewer(item: LineupArchive) {
    const u = await lineupSignedUrl(item.image_path);
    setViewerUrl(u);
    setViewerOpen(true);
  }

  // Note "letter" — view / record / type a memory note for a lineup.
  const [noteTarget, setNoteTarget] = useState<LineupArchive | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  function openNote(item: LineupArchive) {
    setNoteTarget(item);
    setNoteDraft(item.note ?? '');
  }
  async function saveNote() {
    if (!noteTarget || savingNote) return;
    setSavingNote(true);
    try {
      await setLineupNote(noteTarget.id, noteDraft);
      qc.invalidateQueries({ queryKey: ['lineup-archives', userId] });
      setNoteTarget(null);
    } catch (err) {
      showAlert({ title: 'Could not save note', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingNote(false);
    }
  }

  // Share the lineup as a branded image (photo + date stamp + note). Resolves a
  // fresh signed URL, mounts the off-screen card, and snapshots it once the
  // photo has loaded (captureAndShareLineup, fired by the card's onImageReady).
  const [shareData, setShareData] = useState<{ url: string; date: string; note: string; location?: string | null } | null>(null);
  const [sharingNote, setSharingNote] = useState(false);
  const shareCardRef = useRef<View>(null);
  const capturedRef = useRef(false);

  async function handleShareNote() {
    if (!noteTarget || sharingNote) return;
    setSharingNote(true);
    try {
      const url = await lineupSignedUrl(noteTarget.image_path);
      if (!url) throw new Error('Could not load the lineup photo.');
      capturedRef.current = false;
      setShareData({
        url,
        date: new Date(noteTarget.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        note: noteDraft.trim() || (noteTarget.note ?? ''),
        location: noteTarget.city ?? null,
      });
    } catch (err) {
      setSharingNote(false);
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  async function captureAndShareLineup() {
    if (capturedRef.current || !shareCardRef.current) return;
    capturedRef.current = true;
    try {
      await new Promise((r) => setTimeout(r, 150)); // let the photo settle after load
      if (shareCardRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await shareResult(uri, { sharerName: sharerNameFrom(session) });
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharingNote(false);
      setShareData(null);
      capturedRef.current = false;
    }
  }

  const cols = 2;
  const gap = spacing.md;
  const tileWidth = (width - spacing.xl * 2 - gap * (cols - 1)) / cols;

  const favLabel = FAV_OPTIONS.find((o) => o.value === favFilter)?.label ?? 'All lineups';
  const monthLabel = monthFilter === 'All' ? 'All months' : monthFilter;

  const dropdown = openDropdown === 'fav'
    ? { title: 'Favourites', options: FAV_OPTIONS, selected: favFilter, onSelect: (v: string) => setFavFilter(v as 'all' | 'fav') }
    : openDropdown === 'month'
    ? { title: 'Month enjoyed', options: monthOptions, selected: monthFilter, onSelect: (v: string) => setMonthFilter(v) }
    : null;

  // Whole-library tally shown in gold under the header, mirroring the Full
  // Cellar List summary. Prefer the stored bottle_count, else sum the wines.
  const lineupBottles = filtered.reduce(
    (sum, l) => sum + (l.bottle_count ?? (l.wines?.reduce((s, w) => s + (w.count ?? 1), 0) ?? 0)),
    0,
  );

  // Lineups captured but not yet confirmed/actioned. `wines == null` means the
  // photo was saved (Archive a Night / + Add) without its bottles being
  // detected, matched and confirmed yet — the deferred "tend to it later"
  // state. Counted across the WHOLE library (not the active filter) so the
  // nudge reflects the real backlog, mirroring "wines awaiting review".
  const awaitingLineups = lineups.filter((l) => l.wines == null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Lineup Library</Text>
        <TouchableOpacity onPress={() => setAddOpen(true)} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
          <Text style={styles.addLink}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.blurb}>
        A visual record of your vinous exploits. Lineups photographed in Archive a Night under Cellar will appear here with date stamps.
      </Text>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : isError ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Couldn't load your lineups</Text>
          <Text style={styles.emptyBody}>Something went wrong reaching your library. Check your connection and try again.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.85}>
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : lineups.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No lineups yet</Text>
          <Text style={styles.emptyBody}>Tap + Add to save a lineup photo straight to your library, or use Archive a Night in your Cellar to photograph and log a bottle lineup — each one is saved here with its date.</Text>
        </View>
      ) : (
        <>
          <Text style={styles.lineupSummary}>
            {filtered.length} {filtered.length === 1 ? 'Lineup' : 'Lineups'} · {lineupBottles} {lineupBottles === 1 ? 'Bottle' : 'Bottles'}
          </Text>
          {/* Awaiting-attention line — mirrors "N wines awaiting your review".
              Shown whenever there is a backlog; the count is the whole library,
              not the active filter. */}
          {awaitingLineups.length > 0 && (
            <Text style={styles.lineupAwaiting}>
              {awaitingLineups.length} {awaitingLineups.length === 1 ? 'lineup' : 'lineups'} awaiting attention
            </Text>
          )}
          <View style={styles.summaryDivider} />
          <Text style={styles.filterHint}>Listed by Recency · Swipe to see all filters →</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterRow}>
            <TouchableOpacity style={[styles.filterChip, favFilter !== 'all' && styles.filterChipActive]} onPress={() => setOpenDropdown('fav')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Favourites</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'fav' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, favFilter !== 'all' && { color: colors.gold }]} numberOfLines={1}>{favLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterChip, monthFilter !== 'All' && styles.filterChipActive]} onPress={() => setOpenDropdown('month')}>
              <View style={styles.filterChipHeadingRow}>
                <Text style={styles.filterChipLabel}>Month enjoyed</Text>
                <Text style={styles.filterChipChevron}>{openDropdown === 'month' ? '▴' : '▾'}</Text>
              </View>
              <Text style={[styles.filterChipValue, monthFilter !== 'All' && { color: colors.gold }]} numberOfLines={1}>{monthLabel}</Text>
            </TouchableOpacity>
            {customFilters.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.customChip, activeCustomId === f.id && styles.customChipActive]}
                onPress={() => applyCustom(f.id)}
                onLongPress={() => openFilterOptions(f)}
                delayLongPress={400}
                activeOpacity={0.7}
              >
                <Text style={[styles.customChipText, activeCustomId === f.id && { color: colors.gold }]} numberOfLines={1}>{f.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.customChipAdd} onPress={openCreateFilter} activeOpacity={0.7}>
              <Text style={styles.customChipAddText}>+ Add</Text>
            </TouchableOpacity>
          </ScrollView>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No lineups match</Text>
              <Text style={styles.emptyBody}>Try clearing the filters above.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.grid}>
              {filtered.map((item) => (
                <LineupTile key={item.id} item={item} size={tileWidth} onPress={() => router.push(`/cellar/lineup/${item.id}` as any)} onToggleFav={() => toggleFav(item)} onLongPress={() => confirmDeleteLineup(item)} />
              ))}
            </ScrollView>
          )}
        </>
      )}

      <Modal visible={!!dropdown} transparent animationType="fade" onRequestClose={() => setOpenDropdown(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpenDropdown(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            {dropdown && (
              <>
                <Text style={styles.modalTitle}>{dropdown.title}</Text>
                <ScrollView style={{ maxHeight: 320 }}>
                  {dropdown.options.map((opt) => {
                    const active = dropdown.selected === opt.value;
                    return (
                      <TouchableOpacity key={opt.value} style={[styles.modalOption, active && styles.modalOptionActive]} onPress={() => { dropdown.onSelect(opt.value); setOpenDropdown(null); }} activeOpacity={0.7}>
                        <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>{opt.label}</Text>
                        {active && <Text style={styles.modalOptionCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity style={styles.modalCancel} onPress={() => setOpenDropdown(null)}>
                  <Text style={styles.modalCancelText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal visible={viewerOpen} transparent animationType="fade" onRequestClose={() => setViewerOpen(false)}>
        <TouchableOpacity style={styles.viewerOverlay} activeOpacity={1} onPress={() => setViewerOpen(false)}>
          {viewerUrl ? <Image source={{ uri: viewerUrl }} style={styles.viewerImage} resizeMode="contain" /> : <ActivityIndicator color={colors.gold} />}
        </TouchableOpacity>
      </Modal>

      {/* The "letter" — opens with the night's note. View it, or record / type
          one if it's empty. */}
      <Modal visible={!!noteTarget} transparent animationType="fade" onRequestClose={() => setNoteTarget(null)}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalOverlay}>
          <View style={styles.letterSheet}>
            <Text style={styles.letterFlap}>✉︎</Text>
            <Text style={styles.letterTitle}>A note from your night</Text>
            {noteTarget ? (
              <Text style={styles.letterDate}>
                {new Date(noteTarget.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            ) : null}
            <View style={styles.letterInputRow}>
              <TextInput
                style={styles.letterInput}
                value={noteDraft}
                onChangeText={setNoteDraft}
                placeholder="Tap the mic to speak, or type your memories of the night…"
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
              />
              <MicButton value={noteDraft} onChangeText={setNoteDraft} />
            </View>
            <View style={styles.letterActions}>
              <TouchableOpacity onPress={() => setNoteTarget(null)}>
                <Text style={styles.letterCancel}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShareNote} disabled={sharingNote}>
                <Text style={[styles.letterShare, sharingNote && { color: colors.textMuted }]}>{sharingNote ? 'Preparing…' : 'Share'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.letterSaveBtn} onPress={saveNote} disabled={savingNote}>
                <Text style={styles.letterSaveText}>{savingNote ? 'Saving…' : 'Save note'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Off-screen branded lineup card, mounted only while a share is in flight. */}
      {shareData ? (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <LineupShareCard
            ref={shareCardRef}
            imageUrl={shareData.url}
            date={shareData.date}
            location={shareData.location}
            note={shareData.note}
            onImageReady={captureAndShareLineup}
          />
        </View>
      ) : null}

      <LibraryFilterModal
        visible={filterModalOpen}
        title={editingFilter ? 'Edit filter' : 'New filter'}
        itemNoun="lineups"
        items={filterItems}
        initialName={editingFilter?.name}
        initialSelected={editingFilter?.itemIds}
        saving={savingFilter}
        onSave={saveFilter}
        onClose={() => { setFilterModalOpen(false); setEditingFilter(null); }}
      />

      {/* Add a lineup straight from a photo — scan (camera) or upload. */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setAddOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add a lineup</Text>
            <Text style={styles.addBody}>Photograph a bottle lineup or upload one from your library. It saves to Your Lineup Library with today’s date, ready to note and share.</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => addLineupFrom('camera')} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { marginTop: spacing.sm }]} onPress={() => addLineupFrom('library')} activeOpacity={0.85}>
              <Text style={styles.addBtnText}>Upload a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setAddOpen(false)} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {adding && (
        <View style={styles.savingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.savingText}>Saving your lineup…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  headerSpacer: { width: 40 },
  addLink: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.gold, textAlign: 'right', minWidth: 40 },
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8 },
  blurb: { fontSize: 15, fontFamily: fonts.headingItalic, color: colors.textMuted, lineHeight: 21, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  // Gold whole-library tally, same treatment as the Full Cellar List summary.
  lineupSummary: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  lineupAwaiting: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: 4 },
  summaryDivider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginTop: spacing.md },
  filterHint: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm, fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.textMuted, letterSpacing: 0.3 },
  filterScroll: { flexGrow: 0, flexShrink: 0 },
  filterRow: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, gap: spacing.sm },
  filterChip: { width: 160, height: 56, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.sm, justifyContent: 'center', alignItems: 'flex-start', overflow: 'hidden' },
  filterChipActive: { borderColor: colors.gold },
  filterChipHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', alignSelf: 'stretch' },
  filterChipLabel: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  filterChipChevron: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.textMuted, marginLeft: 4 },
  filterChipValue: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text, marginTop: 3, alignSelf: 'stretch' },
  // Bespoke custom-filter pills + the "+ Add" pill.
  customChip: { height: 56, justifyContent: 'center', borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm, maxWidth: 160 },
  customChipActive: { borderColor: colors.gold },
  customChipText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.text },
  customChipAdd: { height: 56, justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.md, marginRight: spacing.sm },
  customChipAddText: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.xl, paddingBottom: 60 },
  tile: { alignItems: 'flex-start' },
  tileImageWrap: { borderRadius: 10, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  // Date + envelope share a top-aligned row; bottle count sits below.
  tileTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', alignSelf: 'stretch', marginTop: spacing.xs },
  tileDate: { flex: 1, fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.text, marginRight: spacing.sm },
  envelopeWrap: { marginRight: spacing.xs },
  tileCount: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  // Hand-drawn envelope: a gold-outlined body with a "V" flap (two rotated
  // gold strokes), ~3:2 wide so it stands out. Matches the mic / bin motif.
  envelope: { width: 40, height: 26, borderWidth: 1.5, borderColor: colors.gold, borderRadius: 3, overflow: 'hidden' },
  envelopeEmpty: { opacity: 0.45 },
  envFlapLeft: { position: 'absolute', top: 5.5, left: -0.5, width: 22, height: 1.5, backgroundColor: colors.gold, transform: [{ rotate: '30deg' }] },
  envFlapRight: { position: 'absolute', top: 5.5, left: 18.5, width: 22, height: 1.5, backgroundColor: colors.gold, transform: [{ rotate: '-30deg' }] },
  favStar: { position: 'absolute', top: spacing.xs, right: spacing.xs, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  // Small gold dot marking a lineup that already has a note.
  noteDot: { position: 'absolute', top: spacing.sm, left: spacing.sm, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
  favStarText: { fontSize: 20, color: '#FFFFFF', lineHeight: 22 },
  favStarActive: { color: colors.gold },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  retryBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  retryBtnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 15 },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 21 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  modalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  modalOptionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  modalOptionTextActive: { color: colors.gold },
  modalOptionCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  modalCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  modalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // "Add a lineup" chooser — mirrors the Cellar List add-wine sheet.
  addBody: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  savingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  savingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
  viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  viewerImage: { width: '100%', height: '80%' },
  // The note "letter" — a cream card with a gold flap glyph at the top.
  letterSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.gold, padding: spacing.lg, width: '100%', alignSelf: 'center', marginHorizontal: spacing.xl },
  letterFlap: { fontSize: 28, color: colors.gold, textAlign: 'center', marginBottom: spacing.xs },
  letterTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  letterDate: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 2, marginBottom: spacing.md },
  letterInputRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  letterInput: { flex: 1, minHeight: 100, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  letterActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.lg, marginTop: spacing.md },
  letterCancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  letterShare: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
  // Off-screen position only (no opacity:0 — that degrades the Android snapshot).
  shareCardWrap: { position: 'absolute', left: -10000, top: 0 },
  letterSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg },
  letterSaveText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.gold },
});
