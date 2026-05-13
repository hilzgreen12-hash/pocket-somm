import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useRackStore } from '../../src/stores/rackStore';
import { useRacks } from '../../src/hooks/useRacks';
import { assignSlots } from '../../src/api/racks';
import { formatCurrency, currencySymbol } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';

function DrinkingWindowBadge({ status, from, to }: { status: string; from: number | null; to: number | null }) {
  const labels: Record<string, { text: string; color: string }> = {
    too_young: { text: 'Too Young', color: colors.warning },
    approaching: { text: 'Approaching Peak', color: colors.gold },
    peak: { text: 'Peak Now', color: colors.gold },
    declining: { text: 'Declining', color: colors.error },
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


export default function LabelResultsScreen() {
  const { context } = useLocalSearchParams<{ context?: string }>();
  const isWishlistFlow = context === 'wishlist';
  const { wineDetailsConfirmed, intelligence } = useLabelStore();
  const { session } = useAuth();
  const { wines, addWine, updateWine } = useCellar();
  const { addWine: addToWishList } = useWishList();
  const { pendingSlot, setPendingSlot, setPendingWineId, setPendingStorageType } = useRackStore();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const qc = useQueryClient();
  const userCurrency = preferences?.defaultCurrency ?? 'GBP';

  const [addingToCellar, setAddingToCellar] = useState(false);
  const [addingToWishList, setAddingToWishList] = useState(false);
  const [selectedRackId, setSelectedRackId] = useState<string | null>(null);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);

  if (!wineDetailsConfirmed || !intelligence) {
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
  const intel = intelligence;

  function computeSlots(
    startRow: number, startCol: number,
    totalRows: number, totalCols: number,
    count: number, orient: 'Horizontal' | 'Vertical'
  ): Array<{ row: number; col: number }> {
    const result: Array<{ row: number; col: number }> = [];
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
      // Wine is always saved as 1 bottle at this step. Multi-bottle placement
      // is asked later on the rack grid after the user has tapped a slot.
      quantity: 1,
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
      estimated_value: intel.estimatedValue,
      estimated_value_currency: userCurrency,
      estimated_value_at: intel.estimatedValue != null ? new Date().toISOString() : null,
      purchase_price: validPrice,
      purchase_price_currency: userCurrency,
    };
  }

  async function handleAddToWishList() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await addToWishList.mutateAsync({ ...buildWinePayload(session.user.id), is_wishlist: true });
      setAddingToWishList(false);
      showAlert({
        title: 'Added to Wish List',
        body: `${wine.wineName ?? wine.producer} has been saved to your wish list.`,
        // When the user came in via the wish-list flow they're expecting to
        // land back on the wish list, not the wine card. Route there from OK.
        buttons: isWishlistFlow
          ? [{ text: 'OK', onPress: () => router.replace('/cellar/wishlist') }]
          : undefined,
      });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save to wish list. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  // Find an existing active cellar row for the same wine identity. Match
  // on producer + wine_name + vintage (case-insensitive). Falls back to a
  // SWAPPED match (producer↔wine_name) so OCR flips on boutique wines like
  // Mullineux Schist still merge into the same entry.
  // Avoids duplicate entries and avoids regenerating wine-intelligence
  // (non-deterministic, can produce slightly different drinking windows).
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

  // Single place that handles all post-save routing — used by both the new-
  // entry path and the merge-with-existing path. NOTE: don't call
  // labelStore.reset() here. Clearing wineDetailsConfirmed while the
  // addingToCellar Modal is still animating closed causes the modal's body
  // (which references `wine.wineName`) to re-render with a null wine,
  // crashing into the ErrorBoundary as "Something Went Wrong". The store
  // will be naturally replaced on the next label scan.
  async function performSaveFlow(savedWineId: string) {
    if (pendingSlot) {
      // User came in from a specific empty rack slot — assign that one slot.
      // Adding more bottles to this wine is done from the wine card or by
      // tapping further slots on the rack.
      const slots = computeSlots(pendingSlot.row, pendingSlot.col, pendingSlot.rows, pendingSlot.cols, 1, 'Vertical');
      await assignSlots(pendingSlot.rackId, slots, savedWineId);
      qc.invalidateQueries({ queryKey: ['rack-slots', pendingSlot.rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      setPendingSlot(null);
      setAddingToCellar(false);
      // Camera/confirm now use router.replace so the stack is short by the
      // time we land here. A clean router.replace to the destination keeps
      // the back-stack tidy and doesn't push extra entries.
      router.replace(`/cellar/rack/${pendingSlot.rackId}`);
      return;
    }

    if (selectedRackId === '__new__') {
      setPendingWineId(savedWineId);
      setPendingStorageType('rack');
      setAddingToCellar(false);
      router.replace('/cellar/rack/camera');
      return;
    }

    if (selectedRackId) {
      setPendingWineId(savedWineId);
      setAddingToCellar(false);
      router.replace(`/cellar/rack/${selectedRackId}` as any);
      return;
    }

    setAddingToCellar(false);
    showAlert({
      title: 'Added to cellar',
      body: `${wine.wineName ?? wine.producer} has been saved.`,
      buttons: [
        { text: 'OK' },
        { text: 'View in cellar', onPress: () => router.replace('/cellar/list') },
      ],
    });
  }

  async function performNewEntry() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const saved = await addWine.mutateAsync(buildWinePayload(session.user.id));
      await performSaveFlow(saved.id);
    } catch (err) {
      // Surface the underlying error so RLS / FK / schema failures are
      // visible instead of swallowed under a generic message.
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function performMerge() {
    if (!matchingExisting) return;
    setSaving(true);
    try {
      await updateWine.mutateAsync({
        id: matchingExisting.id,
        updates: { quantity: matchingExisting.quantity + 1 },
      });
      await performSaveFlow(matchingExisting.id);
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      showAlert({ title: 'Could not save to cellar', body: detail });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToCellar() {
    if (!session?.user.id) return;
    if (matchingExisting) {
      const existingQty = matchingExisting.quantity;
      const wineLabel = `${matchingExisting.wine_name}${matchingExisting.vintage ? ` ${matchingExisting.vintage}` : ''}`;
      showAlert({
        title: 'Already in your cellar',
        body: `You already have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel}. Add this bottle to that listing?`,
        buttons: [
          { text: 'Yes', onPress: performMerge },
          { text: 'No, create a new line', onPress: performNewEntry },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }
    await performNewEntry();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity
        style={styles.backRow}
        onPress={() => router.replace(isWishlistFlow ? '/cellar/wishlist' : '/(tabs)/cellar')}
      >
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.producer}>{wine.producer}</Text>
        {wine.wineName && <Text style={styles.wineName}>{wine.wineName}</Text>}
        <Text style={styles.detail}>{wine.region} · {wine.vintage}</Text>
        {intel.grapeVariety && <Text style={styles.grape}>{intel.grapeVariety}</Text>}
      </View>

      {intel.criticScore !== null ? (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Critic Score</Text>
          <Text style={styles.score}>{intel.criticScore}</Text>
        </View>
      ) : intel.criticScoreNote ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critic Score</Text>
          <Text style={styles.tastingNotes}>{intel.criticScoreNote}</Text>
        </View>
      ) : null}

      <DrinkingWindowBadge
        status={intel.drinkingWindowStatus}
        from={intel.drinkingWindowFrom}
        to={intel.drinkingWindowTo}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasting Notes</Text>
        <Text style={styles.tastingNotes}>{intel.tastingNotes}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estimated Value</Text>
        {!showEstimate ? (
          <TouchableOpacity style={styles.estimateButton} onPress={() => setShowEstimate(true)}>
            <Text style={styles.estimateButtonText}>Generate estimated value</Text>
          </TouchableOpacity>
        ) : intel.estimatedValue != null ? (
          <View>
            <Text style={styles.estimateValue}>{formatCurrency(intel.estimatedValue, userCurrency, { decimals: 0 })}</Text>
            <Text style={styles.estimateCaption}>per bottle · AI estimate based on producer, region, and vintage</Text>
          </View>
        ) : (
          <View>
            <Text style={styles.estimateUnavailable}>Not enough market data</Text>
            <Text style={styles.estimateCaption}>This wine is too obscure for Vinster to estimate reliably. Add a purchase price when saving to your cellar to track value yourself.</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.communityRow}>
          <Text style={styles.communityLabel}>Community notes on this wine</Text>
          <Text style={styles.communityComingSoon}>coming soon</Text>
        </View>
        <Text style={styles.communityCaption}>See what other Vinster users have noted about this wine.</Text>
      </View>

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
      ) : (
        <>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => setAddingToCellar(true)}>
              <Text style={styles.actionButtonText}>Add to Cellar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => setAddingToWishList(true)}>
              <Text style={styles.actionButtonText}>Add to Wish List</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.discardButton} onPress={() => router.replace('/(tabs)/cellar')}>
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
        </>
      )}

      <Modal visible={addingToWishList} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Wish List</Text>
            <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>
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

      <Modal visible={addingToCellar} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add to Cellar</Text>
            <Text style={styles.modalWine}>{wine.wineName ?? wine.producer} {wine.vintage}</Text>

            {/* Bottle count is no longer asked here. Save without placing
                creates 1 bottle (editable later from the wine card). Place-
                in-rack flows ask for quantity on the rack grid AFTER the
                user has picked a slot, so the count maps directly to slots. */}

            {!pendingSlot && (
              <>
                <Text style={styles.modalLabel}>Storage location</Text>
                <Text style={styles.modalHint}>Pick a rack to place this bottle in now, or save without and assign later.</Text>
                <View style={styles.rackList}>
                  <TouchableOpacity
                    style={[styles.rackOptionPrimary, selectedRackId === null && styles.rackOptionPrimaryActive]}
                    onPress={() => setSelectedRackId(null)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rackOptionPrimaryText}>Save without placing</Text>
                  </TouchableOpacity>
                  {racks.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      style={[styles.rackOption, selectedRackId === r.id && styles.rackOptionActive]}
                      onPress={() => setSelectedRackId(r.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.rackOptionText, selectedRackId === r.id && styles.rackOptionTextActive]}>Save to {r.name}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.rackOptionPrimary, selectedRackId === '__new__' && styles.rackOptionPrimaryActive]}
                    onPress={() => setSelectedRackId('__new__')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.rackOptionPrimaryText}>+ Create new rack</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            <Text style={styles.modalLabel}>Purchase price (optional)</Text>
            <View style={styles.priceRow}>
              <Text style={styles.priceCurrency}>{currencySymbol(userCurrency)}</Text>
              <TextInput
                style={styles.priceInput}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
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
                    ? 'Save & Build a New Rack'
                    : selectedRackId
                      ? `Save & Place in ${racks.find((r) => r.id === selectedRackId)?.name ?? 'Rack'}`
                      : 'Save to Cellar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => setAddingToCellar(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm, alignSelf: 'flex-start' },
  backLink: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  producer: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  wineName: { fontSize: 19, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.xs },
  grape: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  scoreLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  score: { fontSize: 28, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold },
  badge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  badgeText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold' },
  badgeWindow: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { fontSize: 17, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm },
  tastingNotes: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
  estimateButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  estimateButtonText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, letterSpacing: 0.3 },
  estimateValue: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, letterSpacing: 0.5 },
  estimateUnavailable: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  estimateCaption: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  communityRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  communityLabel: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: 'rgba(212,176,96,0.45)', letterSpacing: 0.3 },
  communityComingSoon: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textTransform: 'lowercase', letterSpacing: 0.5 },
  communityCaption: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs, lineHeight: 19 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.xl },
  actionButton: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  singleActionRow: { marginHorizontal: spacing.xl, marginTop: spacing.xl },
  singleActionButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  singleActionButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, textAlign: 'center' },
  discardButton: { margin: spacing.xl, alignItems: 'center', paddingVertical: spacing.sm },
  discardText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, textDecorationLine: 'underline' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  modalWine: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  modalHint: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: -spacing.xs, marginBottom: spacing.sm, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  priceCurrency: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, marginRight: spacing.xs },
  priceInput: { flex: 1, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, paddingVertical: spacing.sm },
  rackList: { gap: spacing.xs, marginBottom: spacing.md },
  rackOption: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionActive: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  rackOptionText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  rackOptionTextActive: { color: colors.gold },
  rackOptionPrimary: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  rackOptionPrimaryActive: { backgroundColor: 'rgba(255,255,255,0.10)' },
  rackOptionPrimaryText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: '#FFFFFF' },
});
