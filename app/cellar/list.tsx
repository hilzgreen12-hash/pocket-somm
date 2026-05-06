import { useState, useEffect } from 'react';
import { View, Text, SectionList, TouchableOpacity, StyleSheet, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useRacks } from '../../src/hooks/useRacks';
import { useAuth } from '../../src/hooks/useAuth';
import { getSlotAssignments } from '../../src/api/racks';
import { repairRackedWines } from '../../src/api/cellar';
import { colors, spacing } from '../../src/constants/theme';
import { formatCurrency } from '../../src/constants/currency';
import type { CellarWine } from '../../src/types/wine';

const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching',
  peak: 'Peak',
  declining: 'Declining',
  unknown: '—',
};

function WineRow({ wine }: { wine: CellarWine }) {
  return (
    <TouchableOpacity style={styles.row} onPress={() => router.push(`/cellar/${wine.id}`)}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName} numberOfLines={1}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>
        <Text style={styles.rowDetail} numberOfLines={1}>{[wine.producer, wine.region].filter(Boolean).join(' · ')}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowStatus}>{STATUS_LABELS[wine.drinking_window_status] ?? '—'}</Text>
        <Text style={styles.rowQty}>{wine.quantity} btl</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CellarListScreen() {
  const { session } = useAuth();
  const { wines, isLoading } = useCellar();
  const { racks, create: createList } = useRacks();
  const qc = useQueryClient();
  const [addListOpen, setAddListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'peak' | 'declining' | null>(null);

  // Heal any wines stuck with stale flags but still assigned to a rack.
  // See repairRackedWines in src/api/cellar.ts for the why.
  useEffect(() => {
    if (!session?.user.id) return;
    repairRackedWines(session.user.id).then((fixed) => {
      if (fixed > 0) {
        qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
        qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      }
    });
  }, [session?.user.id]);

  const rackIds = racks.map((r) => r.id);

  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });

  // Build wine-id → rack-name lookup
  const wineToRack: Record<string, string> = {};
  for (const slot of slotAssignments) {
    const rack = racks.find((r) => r.id === slot.rack_id);
    if (rack) wineToRack[slot.cellar_wine_id] = rack.name;
  }

  // Always-on totals (computed from the full set, not the filtered one — so
  // the stats row always reflects the user's whole cellar regardless of any
  // active filter).
  const totalBottles = wines.reduce((sum, w) => sum + w.quantity, 0);
  const peakNow = wines.filter((w) => w.drinking_window_status === 'peak').length;
  const declining = wines.filter((w) => w.drinking_window_status === 'declining').length;

  // Apply the active status filter (Peak Now / Declining tap) before building
  // sections, so the list shows only matching wines under each rack.
  const visibleWines = statusFilter
    ? wines.filter((w) => w.drinking_window_status === statusFilter)
    : wines;

  // Build sections: one per rack (in rack creation order, newest first), then
  // unassigned. Empty racks are intentionally included so the user can see
  // their racks listed and tap through to add wines.
  const assignedIds = new Set(Object.keys(wineToRack));
  const sections: { title: string; rackId: string | null; data: CellarWine[] }[] = [];

  for (const rack of [...racks].reverse()) {
    const rackWines = visibleWines.filter((w) => wineToRack[w.id] === rack.name);
    sections.push({ title: rack.name, rackId: rack.id, data: rackWines });
  }

  const unassigned = visibleWines.filter((w) => !assignedIds.has(w.id));
  if (unassigned.length > 0) {
    sections.push({ title: racks.length > 0 ? 'Unassigned' : 'All Wines', rackId: null, data: unassigned });
  }

  // Group totals by currency so wines stored under different currencies don't
  // get summed together silently.
  const purchaseByCurrency: Record<string, number> = {};
  const valueByCurrency: Record<string, number> = {};
  for (const w of wines) {
    if (w.purchase_price != null) {
      const code = (w.purchase_price_currency ?? 'GBP').toUpperCase();
      purchaseByCurrency[code] = (purchaseByCurrency[code] ?? 0) + Number(w.purchase_price) * w.quantity;
    }
    if (w.estimated_value != null) {
      const code = (w.estimated_value_currency ?? 'GBP').toUpperCase();
      valueByCurrency[code] = (valueByCurrency[code] ?? 0) + Number(w.estimated_value) * w.quantity;
    }
  }
  const fmtTotals = (totals: Record<string, number>) =>
    Object.entries(totals)
      .map(([code, amt]) => formatCurrency(amt, code, { decimals: 0 }))
      .join(' · ');
  const purchaseTotal = fmtTotals(purchaseByCurrency);
  const valueTotal = fmtTotals(valueByCurrency);

  async function handleAddList() {
    if (!newListName.trim()) return;
    setSaving(true);
    try {
      await createList.mutateAsync({ name: newListName.trim(), rows: 1, cols: 50 });
      setNewListName('');
      setAddListOpen(false);
    } catch {
      Alert.alert('Error', 'Could not create list. Please try again.');
    } finally {
      setSaving(false);
    }
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
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cellar List</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => router.push('/cellar/archive')}>
            <Text style={styles.headerLinkMuted}>Archive</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAddListOpen(true)}>
            <Text style={styles.headerLink}>Add List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {wines.length > 0 && (
        <>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{totalBottles}</Text>
              <Text style={styles.statLabel}>Bottles</Text>
            </View>
            <TouchableOpacity
              style={[styles.stat, statusFilter === 'peak' && styles.statActive]}
              onPress={() => setStatusFilter(statusFilter === 'peak' ? null : 'peak')}
              disabled={peakNow === 0}
              activeOpacity={0.7}
            >
              <Text style={[styles.statValue, statusFilter === 'peak' && styles.statValueActive]}>{peakNow}</Text>
              <Text style={[styles.statLabel, statusFilter === 'peak' && styles.statLabelActive]}>Peak Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.stat, statusFilter === 'declining' && styles.statActive]}
              onPress={() => setStatusFilter(statusFilter === 'declining' ? null : 'declining')}
              disabled={declining === 0}
              activeOpacity={0.7}
            >
              <Text style={[styles.statValue, statusFilter === 'declining' && styles.statValueActive]}>{declining}</Text>
              <Text style={[styles.statLabel, statusFilter === 'declining' && styles.statLabelActive]}>Declining</Text>
            </TouchableOpacity>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{wines.length}</Text>
              <Text style={styles.statLabel}>Wines</Text>
            </View>
          </View>
          {(purchaseTotal || valueTotal) && (
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValueSmall}>{purchaseTotal || '—'}</Text>
                <Text style={styles.statLabel}>Spent</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValueSmall}>{valueTotal || '—'}</Text>
                <Text style={styles.statLabel}>Est. Value</Text>
              </View>
            </View>
          )}
          {statusFilter && (
            <View style={styles.filterBanner}>
              <Text style={styles.filterBannerText}>
                Showing {statusFilter === 'peak' ? 'Peak Now' : 'Declining'} wines only
              </Text>
              <TouchableOpacity onPress={() => setStatusFilter(null)}>
                <Text style={styles.filterClearLink}>Clear filter</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {wines.length === 0 && racks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Your cellar is empty</Text>
          <Text style={styles.emptyBody}>Go back and scan a wine label to start tracking your collection.</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.back()}>
            <Text style={styles.emptyButtonText}>Add a Wine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(w) => w.id}
          renderItem={({ item }) => <WineRow wine={item} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.rackId && (
                <TouchableOpacity onPress={() => router.push(`/cellar/rack/${section.rackId}`)}>
                  <Text style={styles.sectionLink}>View Live Rack →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          renderSectionFooter={({ section }) => (
            section.data.length === 0 && section.rackId && !statusFilter ? (
              <TouchableOpacity onPress={() => router.push(`/cellar/rack/${section.rackId}`)} style={styles.emptyRackHint}>
                <Text style={styles.emptyRackHintText}>No wines in this rack yet — tap to add</Text>
              </TouchableOpacity>
            ) : null
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 80 }}
          stickySectionHeadersEnabled={false}
        />
      )}

      <Modal visible={addListOpen} transparent animationType="slide" onRequestClose={() => setAddListOpen(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add List</Text>
            <Text style={styles.modalBody}>Give your list a name — for example "Drinking Soon", "Cellar Reserve", or "Gifts".</Text>

            <TextInput
              style={styles.modalInput}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="List name"
              placeholderTextColor={colors.textMuted}
              autoFocus
              onSubmitEditing={handleAddList}
              returnKeyType="done"
            />

            <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleAddList} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? 'Creating…' : 'Create List'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => { setAddListOpen(false); setNewListName(''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  headerLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  headerLinkMuted: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
  stat: { flex: 1, alignItems: 'center', paddingVertical: spacing.md },
  statValue: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  statValueSmall: { fontSize: 17, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, textAlign: 'center' },
  statActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  statValueActive: { color: colors.text },
  statLabelActive: { color: colors.gold },
  filterBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, backgroundColor: 'rgba(212,176,96,0.06)', borderBottomWidth: 1, borderBottomColor: colors.border },
  filterBannerText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold },
  filterClearLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textDecorationLine: 'underline' },
  statLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xs, backgroundColor: colors.background },
  sectionTitle: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  sectionLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  rowMain: { flex: 1, marginRight: spacing.md },
  rowName: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  rowDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowStatus: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  rowQty: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl },
  emptyRackHint: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, alignItems: 'flex-start' },
  emptyRackHintText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  emptyButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  emptyButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  modalBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.lg },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.lg },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
});
