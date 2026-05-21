import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useRacks } from '../../src/hooks/useRacks';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { getSlotAssignments } from '../../src/api/racks';
import { rackHomeToBlurb } from '../../src/utils/rackBlurb';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineRack, CellarWine } from '../../src/types/wine';

function bottleLabel(n: number) {
  if (n === 0) return 'Empty';
  return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
}

function formatCreatedDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function RackRow({ rack, wines, onLongPress }: { rack: WineRack; wines: CellarWine[]; onLongPress: () => void }) {
  const totalBottles = wines.reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const blurb = rackHomeToBlurb(rack.id, wines);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/cellar/rack/${rack.id}`)}
      onLongPress={onLongPress}
      delayLongPress={400}
    >
      <View style={styles.rowMain}>
        <Text style={styles.rowName}>{rack.name}</Text>
        <View style={styles.rowMetaLine}>
          <Text style={styles.rowBottles}>{bottleLabel(totalBottles)}</Text>
          <Text style={styles.rowCreated}>Created {formatCreatedDate(rack.created_at)}</Text>
        </View>
        <View style={styles.homeToRow}>
          <Text style={styles.homeToLabel}>Home to</Text>
          <Text style={styles.homeToBlurb}>{blurb}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function RacksScreen() {
  const { session } = useAuth();
  const { racks, isLoading, remove: removeRack } = useRacks();
  const { wines } = useCellar();
  const { setPendingStorageType, reset: resetRackStore } = useRackStore();
  // null = chooser closed; 'rack' / 'fridge' = open, asking how to build
  // that storage type (photograph vs manual layout).
  const [chooser, setChooser] = useState<'rack' | 'fridge' | null>(null);

  function handleLongPressRack(rack: WineRack) {
    showAlert({
      title: rack.name,
      body: `Permanently remove this ${rack.storage_type === 'fridge' ? 'fridge' : 'rack'}? Wines stay in your cellar — they're just no longer mapped to it.`,
      buttons: [
        {
          text: 'Delete rack',
          style: 'destructive',
          onPress: () => {
            removeRack.mutate(rack.id, {
              onError: (err) => showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });

  // Build rack_id → list of wines map
  const winesByRack: Record<string, CellarWine[]> = {};
  for (const slot of slotAssignments) {
    const wine = wines.find((w) => w.id === slot.cellar_wine_id);
    if (!wine) continue;
    const list = winesByRack[slot.rack_id] ?? [];
    list.push(wine);
    winesByRack[slot.rack_id] = list;
  }

  // useCellar returns wines newest-first, so the three most recent
  // additions are just the head of the list — they update and roll off
  // automatically as the cellar query refreshes.
  const recentAdditions = wines.slice(0, 3);

  // Open the photograph-or-manual chooser for the requested storage type.
  function handleAddType(type: 'rack' | 'fridge') {
    setChooser(type);
  }

  // "Photograph your rack/fridge" — the existing camera-then-detect flow.
  function handleChoosePhotograph() {
    if (!chooser) return;
    setPendingStorageType(chooser);
    setChooser(null);
    router.push('/cellar/rack/camera');
  }

  // "Manually Select Layout" — skip the camera and drop the user straight
  // onto the Confirm Rack / Confirm Fridge page with default 4×6 dims that
  // they can tweak before saving. Reset first so any stale image / dims
  // from a previous photograph attempt don't bleed through.
  function handleChooseManual() {
    if (!chooser) return;
    resetRackStore();
    setPendingStorageType(chooser);
    setChooser(null);
    router.push('/cellar/rack/detect');
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Wines</Text>
        <View style={{ width: 40 }} />
      </View>

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your wines"
          body="Build virtual wine racks that mirror your home storage — sign in to keep them."
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.subHeader}>Racks & Fridges</Text>

          {/* Add Wine Rack + Add Wine Fridge sit above the rack list now
              (was below) and render as a white side-by-side pair so the
              two creation entry points read as siblings, distinct from
              the yellow "primary action" buttons elsewhere in the app. */}
          <View style={styles.addButtonRow}>
            <TouchableOpacity
              style={[styles.addButtonWhite, { flex: 1 }]}
              onPress={() => handleAddType('rack')}
            >
              <Text style={styles.addButtonWhiteText}>Add Wine Rack</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButtonWhite, { flex: 1 }]}
              onPress={() => handleAddType('fridge')}
            >
              <Text style={styles.addButtonWhiteText}>Add Wine Fridge</Text>
            </TouchableOpacity>
          </View>

          {racks.map((rack) => (
            <RackRow
              key={rack.id}
              rack={rack}
              wines={winesByRack[rack.id] ?? []}
              onLongPress={() => handleLongPressRack(rack)}
            />
          ))}

          <View style={styles.divider} />

          <Text style={styles.subHeader}>Cellar List</Text>

          <View style={styles.cellarListSection}>
            <TouchableOpacity style={styles.fullListButton} onPress={() => router.push('/cellar/list')}>
              <Text style={styles.fullListButtonText}>View Full Cellar List</Text>
            </TouchableOpacity>

            {recentAdditions.length > 0 && (
              <>
                <Text style={styles.recentLabel}>Recently added</Text>
                {recentAdditions.map((w) => (
                  <TouchableOpacity
                    key={w.id}
                    style={styles.recentRow}
                    onPress={() => router.push(`/cellar/${w.id}`)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.recentName} numberOfLines={1}>
                      {wineHeaderLine(w.producer, w.wine_name, w.vintage)}
                    </Text>
                    {w.region ? <Text style={styles.recentDetail} numberOfLines={1}>{w.region}</Text> : null}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Photograph / manual chooser for Add Wine Rack & Add Wine Fridge.
          The photograph path runs the camera + auto-detect flow; the
          manual path skips the camera and drops the user straight on the
          Confirm Rack/Fridge page so they can set dimensions by hand. */}
      <Modal visible={chooser !== null} transparent animationType="fade" onRequestClose={() => setChooser(null)}>
        <TouchableOpacity style={styles.chooserOverlay} activeOpacity={1} onPress={() => setChooser(null)}>
          <TouchableOpacity activeOpacity={1} style={styles.chooserSheet} onPress={() => {}}>
            <Text style={styles.chooserTitle}>
              {chooser === 'fridge' ? 'Add Wine Fridge' : 'Add Wine Rack'}
            </Text>
            <Text style={styles.chooserBody}>
              How would you like to build it?
            </Text>
            <TouchableOpacity style={styles.chooserBtn} onPress={handleChoosePhotograph} activeOpacity={0.8}>
              <Text style={styles.chooserBtnText}>
                {chooser === 'fridge' ? 'Photograph your fridge' : 'Photograph your rack'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.chooserBtn, styles.chooserBtnSecondary]} onPress={handleChooseManual} activeOpacity={0.8}>
              <Text style={[styles.chooserBtnText, styles.chooserBtnTextSecondary]}>Manually Select Layout</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setChooser(null)} style={styles.chooserCancel}>
              <Text style={styles.chooserCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  // Cormorant — page header
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  // Cormorant — section header
  subHeader: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.3, textAlign: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowMain: { flex: 1 },
  // Inter — rack card name (card content, not a page header)
  rowName: { fontSize: 18, fontFamily: fonts.bodyBold, color: colors.text, letterSpacing: 0.3 },
  rowMetaLine: { flexDirection: 'row', alignItems: 'baseline', marginTop: 4, gap: spacing.sm },
  // Inter — meta value
  rowBottles: { fontSize: 14, fontFamily: fonts.bodySemibold, color: colors.gold },
  // Inter — meta caption
  rowCreated: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  homeToRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: spacing.xs, gap: 6 },
  // Inter — meta label
  homeToLabel: { fontSize: 11, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Inter — body blurb
  homeToBlurb: { flex: 1, fontSize: 15, fontFamily: fonts.bodyItalic, color: colors.text, lineHeight: 19 },
  arrow: { fontSize: 20, fontFamily: fonts.bodyRegular, color: colors.gold, marginLeft: spacing.md },
  // White side-by-side Add Wine Rack / Add Wine Fridge buttons. Sized
  // a touch tighter than the old stacked yellow pair so two read
  // comfortably across the screen width.
  addButtonRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.xs, paddingBottom: spacing.md },
  addButtonWhite: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, alignItems: 'center' },
  // Cormorant — button text
  addButtonWhiteText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15, textAlign: 'center' },
  divider: { height: 1, backgroundColor: colors.border, marginHorizontal: spacing.xl, marginVertical: spacing.lg },
  cellarListSection: { paddingHorizontal: spacing.xl },
  fullListButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center' },
  // Cormorant — button text
  fullListButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 14, textAlign: 'center' },
  // Inter — meta label
  recentLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.lg, marginBottom: spacing.xs },
  recentRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  // Inter — wine card name
  recentName: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.text },
  // Inter — wine detail caption
  recentDetail: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  // Photograph / manual chooser overlay
  chooserOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  chooserSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  // Cormorant — chooser pop-up title
  chooserTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Inter — chooser pop-up body
  chooserBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  chooserBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  chooserBtnSecondary: { borderColor: '#FFFFFF' },
  // Cormorant — chooser button text
  chooserBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  chooserBtnTextSecondary: { color: '#FFFFFF' },
  chooserCancel: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: 4 },
  // Inter — cancel link inside modal (not a button)
  chooserCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
