import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ActivityIndicator, Modal } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchStorageLocation, fetchStorageLocationWines, deleteStorageLocation, assignWineToStorageLocation, fetchStorageLocationCases, updateStorageCase, deleteStorageCase } from '../../../src/api/storageLocations';
import type { StorageCase, CellarWine } from '../../../src/types/wine';
import { archiveCellarWine, deleteCellarWine } from '../../../src/api/cellar';
import { clearWineFromRacks } from '../../../src/api/racks';
import { prepareImageBase64, scanLabel } from '../../../src/api/label';
import { useLabelStore } from '../../../src/stores/labelStore';
import { ensureMediaPermission } from '../../../src/utils/mediaPermissions';
import { useLabelImageUrl } from '../../../src/hooks/useLabelImageUrl';
import { useRackStore } from '../../../src/stores/rackStore';
import { wineHeaderLine } from '../../../src/utils/wineHeader';
import { showAlert } from '../../../src/components/AppAlert';
import { LabelThumb } from '../../../src/components/LabelThumb';
import { MicButton } from '../../../src/components/MicButton';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

// Search terms that map free text onto a drinking-window status (mirrors the
// rack screen), so a search for "peak" or "young" filters by maturity too.
const STATUS_SEARCH: { status: string; terms: string[] }[] = [
  { status: 'too_young', terms: ['too young', 'young', 'hold'] },
  { status: 'approaching', terms: ['approaching', 'approach'] },
  { status: 'peak', terms: ['peak', 'drinking now', 'drink now', 'ready', 'drinking'] },
  { status: 'declining', terms: ['declining', 'decline', 'fading', 'past peak'] },
];
const MATURITY_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'too_young', label: 'Too Young' },
  { value: 'approaching', label: 'Approaching' },
  { value: 'peak', label: 'Peak' },
  { value: 'declining', label: 'Declining' },
];

function bottleLabel(n: number) {
  return n === 0 ? 'Empty' : `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

export default function StorageLocationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const qc = useQueryClient();
  const { setPendingStorageLocationId, setPendingCaseId } = useRackStore();
  const { setImage, setWineDetails } = useLabelStore();
  const [search, setSearch] = useState('');
  const [maturity, setMaturity] = useState('');
  const [uploading, setUploading] = useState(false);
  // Multi-select — long-press a wine to select, then bulk archive / delete /
  // remove-from-location. Mirrors the Full Cellar List select-mode.
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const { data: location, isLoading } = useQuery({
    queryKey: ['storage-location', id],
    queryFn: () => fetchStorageLocation(id!),
    enabled: !!id,
  });
  const { data: wines = [] } = useQuery({
    queryKey: ['storage-location-wines', id],
    queryFn: () => fetchStorageLocationWines(id!),
    enabled: !!id,
  });
  const { data: cases = [] } = useQuery({
    queryKey: ['storage-location-cases', id],
    queryFn: () => fetchStorageLocationCases(id!),
    enabled: !!id,
  });
  const photoUrl = useLabelImageUrl(location?.photo_path ?? null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wines.filter((w) => {
      if (maturity && w.drinking_window_status !== maturity) return false;
      if (q) {
        const hay = [w.producer, w.wine_name, w.region, w.vintage].filter(Boolean).join(' ').toLowerCase();
        const statusTerms = STATUS_SEARCH.find((s) => s.status === w.drinking_window_status)?.terms ?? [];
        if (!hay.includes(q) && !statusTerms.some((t) => t.includes(q))) return false;
      }
      return true;
    });
  }, [wines, search, maturity]);

  // All add paths file the saved wine into THIS location (context=add-location,
  // pendingStorageLocationId set). A "case" is just a wine with a higher quantity.
  // caseId non-null routes the add into an existing case (the mixed-case loop);
  // a normal add clears it so no stale case is inherited.
  function handleScan(caseId: string | null = null) {
    if (!id) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    router.push('/label/camera?context=add-location' as any);
  }
  function handleManual(caseId: string | null = null) {
    if (!id) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    useLabelStore.getState().reset();
    router.push('/label/confirm?manual=1&context=add-location' as any);
  }
  async function handleUpload(caseId: string | null = null) {
    if (!id) return;
    if (!(await ensureMediaPermission('library'))) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (res.canceled || !res.assets[0]) return;
    setPendingStorageLocationId(id);
    setPendingCaseId(caseId);
    setUploading(true);
    try {
      const uri = res.assets[0].uri;
      const base64 = await prepareImageBase64(uri);
      setImage(uri, base64);
      const details = await scanLabel(base64);
      setWineDetails(details);
      router.push('/label/confirm?context=add-location' as any);
    } catch (err) {
      showAlert({ title: 'Could not read label', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  function handleLongPressHeader() {
    if (!location) return;
    showAlert({
      title: location.name,
      body: 'Remove this storage location? The wines in it stay in your cellar — they just become loose bottles again.',
      buttons: [
        {
          text: 'Delete location',
          style: 'destructive',
          onPress: async () => {
            try { await deleteStorageLocation(location.id); router.back(); }
            catch (err) { showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  function enterSelect(wineId: string) { setSelectMode(true); setSelectedIds(new Set([wineId])); }
  function toggleSelected(wineId: string) {
    setSelectedIds((prev) => { const next = new Set(prev); next.has(wineId) ? next.delete(wineId) : next.add(wineId); return next; });
  }
  function exitSelect() { setSelectMode(false); setSelectedIds(new Set()); }

  function invalidateAfterBulk() {
    qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
    qc.invalidateQueries({ queryKey: ['storage-location', id] });
    qc.invalidateQueries({ queryKey: ['storage-locations'] });
    qc.invalidateQueries({ queryKey: ['cellar'] });
    qc.invalidateQueries({ queryKey: ['cellar-archive'] });
    qc.invalidateQueries({ queryKey: ['slot-assignments'] });
    qc.invalidateQueries({ queryKey: ['rack-slots'] });
  }

  // Run a per-wine action across the selection, tolerating a mid-way failure:
  // successfully-processed wines drop out of the selection so a retry only
  // touches the remainder.
  async function runBulk(verb: string, action: (wineId: string) => Promise<void>) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBusy(true);
    const done: string[] = [];
    try {
      for (const wid of ids) { await action(wid); done.push(wid); }
      invalidateAfterBulk();
      exitSelect();
    } catch (err) {
      invalidateAfterBulk();
      if (done.length) setSelectedIds((prev) => { const next = new Set(prev); done.forEach((wid) => next.delete(wid)); return next; });
      showAlert({
        title: done.length ? `${verb} some, then hit a snag` : `Could not ${verb.toLowerCase()}`,
        body: `${done.length ? `${done.length} of ${ids.length} done. The rest are still selected — try again. ` : ''}${err instanceof Error ? err.message : 'Please try again.'}`,
      });
    } finally { setBusy(false); }
  }

  function confirmArchiveSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Archive ${n} wine${n === 1 ? '' : 's'}?`,
      body: 'They move to Your Archive and leave this location. Your reviews and history stay.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Archive Wines', onPress: () => runBulk('Archived', async (wid) => { await clearWineFromRacks(wid); await archiveCellarWine(wid); }) },
      ],
    });
  }
  function confirmDeleteSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Delete ${n} wine${n === 1 ? '' : 's'}?`,
      body: "Permanently remove them from your records. This can't be undone.",
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete (permanent)', style: 'destructive', onPress: () => runBulk('Deleted', async (wid) => { await clearWineFromRacks(wid); await deleteCellarWine(wid); }) },
      ],
    });
  }
  function confirmRemoveSelected() {
    const n = selectedIds.size;
    if (n === 0) return;
    showAlert({
      title: `Remove ${n} wine${n === 1 ? '' : 's'} from ${location?.name ?? 'this location'}?`,
      body: 'They stay in your cellar as loose bottles — this only takes them out of this location.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove from location', onPress: () => runBulk('Removed', (wid) => assignWineToStorageLocation(wid, null)) },
      ],
    });
  }

  // ---- Cases ----
  const [caseEdit, setCaseEdit] = useState<StorageCase | null>(null);
  const [caseEditName, setCaseEditName] = useState('');
  const [caseEditNote, setCaseEditNote] = useState('');

  function invalidateCases() {
    qc.invalidateQueries({ queryKey: ['storage-location-cases', id] });
    qc.invalidateQueries({ queryKey: ['storage-location-wines', id] });
  }
  function openAddToCase(c: StorageCase) {
    showAlert({
      title: `Add a wine to ${c.name}`,
      body: c.kind === 'mixed' ? 'Add another wine to this mixed case.' : 'Add more bottles of this wine.',
      buttons: [
        { text: 'Scan a Label', onPress: () => handleScan(c.id) },
        { text: 'Upload Photo', onPress: () => handleUpload(c.id) },
        { text: 'Manual Input', onPress: () => handleManual(c.id) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  function confirmDissolveCase(c: StorageCase) {
    showAlert({
      title: `Dissolve ${c.name}?`,
      body: 'The bottles stay in this location as loose wines — this only removes the case grouping.',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Dissolve', style: 'destructive', onPress: async () => {
          try { await deleteStorageCase(c.id); invalidateCases(); }
          catch (err) { showAlert({ title: 'Could not dissolve', body: err instanceof Error ? err.message : 'Please try again.' }); }
        } },
      ],
    });
  }
  function openCaseMenu(c: StorageCase) {
    showAlert({
      title: c.name,
      body: c.note || 'Manage this case.',
      buttons: [
        { text: 'Add a wine to this case', onPress: () => openAddToCase(c) },
        { text: 'Edit name & note', onPress: () => { setCaseEditName(c.name); setCaseEditNote(c.note ?? ''); setCaseEdit(c); } },
        { text: 'Dissolve case', style: 'destructive', onPress: () => confirmDissolveCase(c) },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }
  async function saveCaseEdit() {
    if (!caseEdit) return;
    try {
      await updateStorageCase(caseEdit.id, { name: caseEditName, note: caseEditNote });
      invalidateCases();
      setCaseEdit(null);
    } catch (err) { showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' }); }
  }

  // Wines split into their cases + the loose remainder (search/maturity applied).
  const caseGroups = cases
    .map((c) => ({ box: c, wines: filtered.filter((w) => w.case_id === c.id) }))
    .filter((g) => g.wines.length > 0);
  const looseFiltered = filtered.filter((w) => !w.case_id);

  const renderWine = (w: CellarWine) => {
    const isSelected = selectedIds.has(w.id);
    return (
      <TouchableOpacity
        key={w.id}
        style={[styles.wineRow, isSelected && styles.wineRowSelected]}
        onPress={() => { if (selectMode) toggleSelected(w.id); else router.push(`/cellar/${w.id}` as any); }}
        onLongPress={() => { if (!selectMode) enterSelect(w.id); }}
        delayLongPress={400}
        activeOpacity={0.7}
      >
        {selectMode ? (
          <View style={[styles.checkbox, isSelected && styles.checkboxOn]}>{isSelected ? <Text style={styles.checkboxTick}>✓</Text> : null}</View>
        ) : null}
        <LabelThumb path={w.label_image_path} fallbackText={w.wine_name} style={styles.thumb} />
        <View style={styles.wineMain}>
          <Text style={styles.wineName} numberOfLines={1}>{wineHeaderLine(w.producer, w.wine_name, w.vintage)}</Text>
          <View style={styles.wineMetaRow}>
            {w.region ? <Text style={styles.wineMeta} numberOfLines={1}>{w.region}</Text> : null}
            {w.region ? <Text style={styles.wineMetaDot}>·</Text> : null}
            <Text style={styles.wineMeta}>{bottleLabel(w.quantity ?? 0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>;
  }
  if (!location) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyBody}>This location no longer exists.</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backLink}>← Back</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} onLongPress={handleLongPressHeader} delayLongPress={400} activeOpacity={1}>
          <Text style={styles.title} numberOfLines={1}>{location.name}</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: selectMode ? 170 : 90 }} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        {photoUrl ? (
          <Image source={{ uri: photoUrl }} style={styles.areaPhoto} resizeMode="contain" />
        ) : null}

        {/* Add a wine — filed straight into this location. Scan a wine label,
            upload a photo, or enter by hand. (Case-label scanning was removed:
            a case/box label doesn't carry enough to identify the wine inside.) */}
        <View style={styles.addSection}>
          <TouchableOpacity style={styles.addBtn} onPress={() => handleScan()} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>Scan a Wine Label</Text>
          </TouchableOpacity>
          <View style={styles.addRow}>
            <TouchableOpacity style={[styles.addBtn, styles.addBtnSecondary, { flex: 1 }]} onPress={() => handleUpload()} activeOpacity={0.85}>
              <Text style={[styles.addBtnText, styles.addBtnTextSecondary]}>Upload Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, styles.addBtnSecondary, { flex: 1 }]} onPress={() => handleManual()} activeOpacity={0.85}>
              <Text style={[styles.addBtnText, styles.addBtnTextSecondary]}>Manual Input</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.listHeader}>List</Text>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search producer, wine, region, maturity…"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.maturityRow}>
          {MATURITY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value || 'all'}
              style={[styles.maturityChip, maturity === opt.value && styles.maturityChipActive]}
              onPress={() => setMaturity(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.maturityChipText, maturity === opt.value && styles.maturityChipTextActive]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {filtered.length === 0 ? (
          <Text style={styles.emptyList}>{wines.length === 0 ? 'No wines here yet — photograph a wine label to start filling it.' : 'No wines match your search.'}</Text>
        ) : (
          <View style={styles.listSection}>
            {caseGroups.map((g) => (
              <View key={g.box.id} style={styles.caseGroup}>
                <TouchableOpacity
                  style={styles.caseHeader}
                  onPress={() => { if (!selectMode) openAddToCase(g.box); }}
                  onLongPress={() => { if (!selectMode) openCaseMenu(g.box); }}
                  delayLongPress={350}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.caseTitleRow}>
                      <Text style={styles.caseName} numberOfLines={1}>{g.box.name}</Text>
                      <View style={styles.caseChip}><Text style={styles.caseChipText}>{g.box.kind === 'mixed' ? 'Mixed case' : 'Case'}</Text></View>
                    </View>
                    {g.box.note ? <Text style={styles.caseNoteText} numberOfLines={2}>{g.box.note}</Text> : null}
                  </View>
                  {!selectMode ? <Text style={styles.caseAdd}>+ Add</Text> : null}
                </TouchableOpacity>
                {g.wines.map(renderWine)}
              </View>
            ))}
            {looseFiltered.length > 0 ? (
              <>
                {caseGroups.length > 0 ? <Text style={styles.looseHeader}>Loose bottles</Text> : null}
                {looseFiltered.map(renderWine)}
              </>
            ) : null}
          </View>
        )}
      </KeyboardAwareScrollView>

      {/* Multi-select action bar — floats at the bottom while selecting. */}
      {selectMode && (
        <View style={styles.selectBar}>
          <View style={styles.selectBarTop}>
            <Text style={styles.selectBarCount}>{selectedIds.size} selected</Text>
            <TouchableOpacity onPress={exitSelect} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.selectBarCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.selectBarActions}>
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmArchiveSelected}>
              <Text style={styles.selectActionText}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmRemoveSelected}>
              <Text style={styles.selectActionText}>Remove from Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.selectAction, (selectedIds.size === 0 || busy) && styles.selectActionDisabled]} disabled={selectedIds.size === 0 || busy} onPress={confirmDeleteSelected}>
              <Text style={styles.selectActionText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit a case's name + note */}
      <Modal visible={caseEdit !== null} transparent animationType="fade" onRequestClose={() => setCaseEdit(null)}>
        <View style={styles.caseModalOverlay}>
          <KeyboardAwareScrollView contentContainerStyle={styles.caseModalScroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
            <View style={styles.caseModalSheet}>
              <Text style={styles.caseModalTitle}>Edit case</Text>
              <Text style={styles.caseModalLabel}>Name</Text>
              <TextInput style={styles.caseModalInput} value={caseEditName} onChangeText={setCaseEditName} placeholder="Case name" placeholderTextColor={colors.textSubtle} />
              <Text style={styles.caseModalLabel}>Note</Text>
              <View style={styles.caseModalNoteRow}>
                <TextInput style={[styles.caseModalInput, styles.caseModalNoteInput]} value={caseEditNote} onChangeText={setCaseEditNote} placeholder="Ie. in the back next to the Petrus" placeholderTextColor={colors.textSubtle} multiline />
                <MicButton value={caseEditNote} onChangeText={setCaseEditNote} onClear={() => setCaseEditNote('')} />
              </View>
              <TouchableOpacity style={styles.caseModalSave} onPress={saveCaseEdit} activeOpacity={0.85}>
                <Text style={styles.caseModalSaveText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.caseModalCancel} onPress={() => setCaseEdit(null)}>
                <Text style={styles.caseModalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {uploading && (
        <View style={styles.uploadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.uploadingText}>Reading the label…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.md },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  backLink: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  areaPhoto: { width: '100%', height: 360, backgroundColor: colors.surface },
  addSection: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, gap: spacing.sm },
  addRow: { flexDirection: 'row', gap: spacing.sm },
  addBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  addBtnSecondary: { borderColor: '#FFFFFF' },
  addBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, textAlign: 'center' },
  addBtnTextSecondary: { color: '#FFFFFF' },
  listHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.xl, marginBottom: spacing.sm },
  searchInput: { flex: 1, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  searchClear: { fontSize: 15, color: colors.textMuted, paddingLeft: spacing.sm },
  maturityRow: { paddingHorizontal: spacing.xl, gap: spacing.sm, paddingBottom: spacing.md },
  maturityChip: { borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingVertical: 6, paddingHorizontal: spacing.md },
  maturityChipActive: { borderColor: colors.gold, backgroundColor: 'rgba(224,184,74,0.12)' },
  maturityChipText: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  maturityChipTextActive: { color: colors.gold, fontFamily: fonts.bodySemibold },
  listSection: { paddingHorizontal: spacing.xl },
  emptyList: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl, lineHeight: 20 },
  emptyBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  wineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineRowSelected: { backgroundColor: 'rgba(224,184,74,0.16)' },
  caseGroup: { marginBottom: spacing.md, borderWidth: 1, borderColor: 'rgba(224,184,74,0.30)', borderRadius: 12, overflow: 'hidden' },
  caseHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: 'rgba(224,184,74,0.10)' },
  caseTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  caseName: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, flexShrink: 1 },
  caseChip: { borderWidth: 1, borderColor: colors.gold, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8 },
  caseChipText: { fontFamily: fonts.bodySemibold, fontSize: 10, color: colors.gold, letterSpacing: 0.3 },
  caseNoteText: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  caseAdd: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold },
  looseHeader: { fontFamily: fonts.headingSemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: spacing.sm, marginBottom: spacing.xs },
  caseModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center' },
  caseModalScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.xl },
  caseModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl },
  caseModalTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  caseModalLabel: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs, marginTop: spacing.sm },
  caseModalInput: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  caseModalNoteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  caseModalNoteInput: { flex: 1, minHeight: 44, textAlignVertical: 'top' },
  caseModalSave: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  caseModalSaveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.surface },
  caseModalCancel: { alignItems: 'center', paddingTop: spacing.md },
  caseModalCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  checkboxOn: { backgroundColor: colors.gold },
  checkboxTick: { fontSize: 13, color: colors.surface, fontFamily: fonts.headingBold },
  selectBar: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl, gap: spacing.sm },
  selectBarTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xs },
  selectBarCount: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold },
  selectBarCancel: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.gold },
  selectBarActions: { flexDirection: 'row', gap: spacing.sm },
  selectAction: { flex: 1, borderWidth: 1, borderColor: 'rgba(244,235,224,0.30)', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  selectActionDisabled: { opacity: 0.4 },
  selectActionText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.cream, textAlign: 'center', letterSpacing: 0.3 },
  thumb: { width: 34, height: 44 },
  wineMain: { flex: 1 },
  wineName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  wineMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  wineMeta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, flexShrink: 1 },
  wineMetaDot: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  uploadingText: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.text, letterSpacing: 0.5 },
});
