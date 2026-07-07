import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Modal, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings } from '../../src/api/label';
import { generateWineIntel } from '../../src/services/pricing';
import { useLastIntelStore } from '../../src/stores/lastIntelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { assignSlots, getRackSlots } from '../../src/api/racks';
import { uploadLabelImage } from '../../src/api/labelPhotos';
import { BottleSizePicker } from '../../src/components/BottleSizePicker';
import { usePreferences } from '../../src/hooks/usePreferences';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { WineDetailsComplete } from '../../src/types/wine';

// Walk the rack grid from (startRow,startCol) in the given orientation, skipping
// occupied slots, collecting up to `count` FREE positions. Vertical runs down a
// column then to the next; Horizontal runs across a row then to the next. The
// large-format band (row -1) stays on its own row. Mirrors the helper used by
// the lineup placement flow.
function computeFreeSlots(
  startRow: number, startCol: number, rows: number, cols: number,
  count: number, orient: 'Vertical' | 'Horizontal',
  occupied: Set<string>, largeFormatCols?: number | null,
): Array<{ row: number; col: number }> {
  const result: Array<{ row: number; col: number }> = [];
  if (startRow === -1) {
    const lfCols = largeFormatCols ?? 0;
    let col = startCol;
    while (result.length < count && col < lfCols) {
      if (!occupied.has(`-1,${col}`)) result.push({ row: -1, col });
      col++;
    }
    return result;
  }
  let row = startRow;
  let col = startCol;
  while (result.length < count && row >= 0 && row < rows && col >= 0 && col < cols) {
    if (!occupied.has(`${row},${col}`)) result.push({ row, col });
    if (orient === 'Horizontal') { col++; if (col >= cols) { col = 0; row++; } }
    else { row++; if (row >= rows) { row = 0; col++; } }
  }
  return result;
}

export default function LabelConfirmScreen() {
  useKeepAwake();
  const { context, manual } = useLocalSearchParams<{ context?: string; manual?: string }>();
  // Forward any context (wishlist / reviews / …) so /label/results knows
  // which flow we're in for back routing and which action set to show.
  const contextQuery = context ? `?context=${context}` : '';
  // Reached straight from Cellar → Add Wine → Manual Input: no scan
  // happened, so the form opens blank and there's nothing to "scan again".
  const isManual = manual === '1';
  // Reached from Scan a Lineup — Back returns to the lineup list to continue
  // onboarding the remaining bottles.
  const isLineup = context === 'lineup';
  const { wineDetails, setWineDetailsConfirmed, setIntelligence, setPairings, setError } = useLabelStore();
  const { preferences } = usePreferences();
  // Rack-placement context: when the user reached here by tapping an empty rack
  // slot, we skip Wine Intel and drop the bottle straight into the slot.
  const { pendingSlot, setPendingSlot } = useRackStore();
  const { addWine, updateWine } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();

  const [producer, setProducer] = useState(wineDetails?.producer ?? '');
  const [region, setRegion] = useState(wineDetails?.region ?? '');
  const [wineName, setWineName] = useState(wineDetails?.wineName ?? '');
  const [vintage, setVintage] = useState(wineDetails?.vintage ?? '');
  const [style, setStyle] = useState(wineDetails?.style ?? '');
  const [loading, setLoading] = useState(false);
  // Rack/fridge single-slot placement confirm popup: after Confirm Wine Details
  // the user sets the bottle format, how many bottles, and the fill direction
  // before the wine is saved and dropped into the tapped slot (and the slots
  // that follow). No Location step — the slot already fixes where it lives.
  const [placeModalOpen, setPlaceModalOpen] = useState(false);
  const [placeFormat, setPlaceFormat] = useState(750);
  const [placeCount, setPlaceCount] = useState('1');
  const [placeOrientation, setPlaceOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  const [placing, setPlacing] = useState(false);

  async function handleConfirm() {
    if (!producer.trim() || !region.trim()) {
      showAlert({ title: 'Missing details', body: 'Producer and region are required.' });
      return;
    }
    if (!vintage.trim()) {
      showAlert({ title: 'Missing vintage', body: 'Please enter a vintage year or NV.' });
      return;
    }

    const confirmed: WineDetailsComplete = {
      producer: producer.trim(),
      region: region.trim(),
      wineName: wineName.trim() || null,
      vintage: vintage.trim(),
      style: style.trim() || null,
      // Pass any bottle size the scanner read off the label straight
      // through to /label/results so the Add modal can pre-populate the
      // picker. The user can still adjust it on that screen.
      bottleSizeMl: wineDetails?.bottleSizeMl ?? null,
      // Carry a batched lineup quantity through so /label/results seeds the
      // bottle count (e.g. a "×2" lineup entry adds 2 to the cellar).
      quantity: wineDetails?.quantity ?? 1,
    };

    setWineDetailsConfirmed(confirmed);

    // Rack placement: arrived from an empty rack slot (context=place guards
    // against a stale pendingSlot hijacking an unrelated add). Instead of saving
    // immediately, confirm the format, bottle count and fill direction in a
    // popup — the save + slot assignment happens in handlePlaceConfirm. No
    // Location step: the tapped slot already fixes where the wine lives.
    if (pendingSlot && context === 'place') {
      // Seed the format from a large-format slot's configured size, else from
      // anything the scanner read, else a standard 75cl bottle.
      setPlaceFormat(
        pendingSlot.row === -1
          ? (pendingSlot.largeFormatBottleSizeMl ?? confirmed.bottleSizeMl ?? 1500)
          : (confirmed.bottleSizeMl ?? 750),
      );
      setPlaceCount('1');
      setPlaceOrientation('Vertical');
      setPlaceModalOpen(true);
      return;
    }

    // Cellar List "Add Wine" (no explicit context): no Wine Intel card — intel
    // is only generated from the Cellar tab's Generate Wine Intel. Go straight
    // to the add confirmation (size / quantity / orientation / location) on
    // results, with no intel generated.
    if (!context) {
      setIntelligence(null);
      router.replace('/label/results?context=add');
      return;
    }

    setLoading(true);
    try {
      // generateWineIntel queries Wine-Searcher first (real market price +
      // WS-anchored critic score, converted to the user's currency), falling
      // back to the Claude estimate on a no-match.
      const intel = await generateWineIntel(confirmed, preferences?.defaultCurrency ?? 'GBP');
      setIntelligence(intel);
      // Persist as the "last result" so the Cellar tab's View last result link
      // survives an app restart (separate from the transient label store).
      useLastIntelStore.getState().setLast(confirmed, intel);
      router.replace(`/label/results${contextQuery}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load wine details');
      showAlert({ title: 'Error', body: 'Could not load wine details. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  // Save the wine and drop it into the tapped slot (and the slots that follow,
  // per the chosen count + direction). Quantity is set to the number of slots
  // actually filled, so the rack and cellar counts can't drift apart.
  async function handlePlaceConfirm() {
    if (!pendingSlot) return;
    const userId = session?.user.id;
    if (!userId) { showAlert({ title: 'Sign in required', body: 'Please sign in and try again.' }); return; }
    const requested = Math.max(1, parseInt(placeCount) || 1);
    setPlacing(true);
    try {
      const existing = await getRackSlots(pendingSlot.rackId);
      const occupied = new Set(existing.filter((s) => s.cellar_wine_id).map((s) => `${s.row_index},${s.col_index}`));
      const free = computeFreeSlots(
        pendingSlot.row, pendingSlot.col, pendingSlot.rows, pendingSlot.cols,
        requested, placeOrientation, occupied, pendingSlot.largeFormatCols,
      );
      if (free.length === 0) {
        showAlert({ title: 'No room here', body: 'There are no free slots from this position in that direction. Try the other orientation or a different slot.' });
        setPlacing(false);
        return;
      }
      const saved = await addWine.mutateAsync({
        user_id: userId,
        wine_name: wineName.trim() || producer.trim(),
        producer: producer.trim(),
        region: region.trim(),
        vintage: vintage.trim(),
        quantity: free.length,
        storage_location: null,
        date_received: new Date().toISOString().split('T')[0],
        critic_score: null,
        critic_score_note: null,
        drinking_window_from: null,
        drinking_window_to: null,
        drinking_window_status: 'unknown',
        tasting_notes: null,
        grape_variety: null,
        label_image_path: null,
        user_notes: null,
        is_wishlist: false,
        estimated_value: null,
        estimated_value_currency: null,
        estimated_value_at: null,
        estimated_value_source: null,
        purchase_price: null,
        purchase_price_currency: null,
        bottle_size_ml: placeFormat,
      } as any);
      // Upload the scanned label photo so the slot shows the bottle thumbnail
      // (matches the normal add flow). Manual entries have no image, and a
      // failed upload is non-fatal — the wine is still placed.
      const labelUri = useLabelStore.getState().imageUri;
      if (labelUri) {
        try {
          const path = await uploadLabelImage(userId, labelUri, saved.id);
          await updateWine.mutateAsync({ id: saved.id, updates: { label_image_path: path } });
        } catch { /* non-fatal — placed without a thumbnail */ }
      }
      await assignSlots(pendingSlot.rackId, free, saved.id);
      const rackId = pendingSlot.rackId;
      qc.invalidateQueries({ queryKey: ['rack-slots', rackId] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['cellar'] });
      setPendingSlot(null);
      setPlaceModalOpen(false);
      if (free.length < requested) {
        showAlert({
          title: 'Placed what fit',
          body: `Only ${free.length} of ${requested} bottles fit from here — the rest weren't placed. What did fit is in your Full Cellar List.`,
          buttons: [{ text: 'OK', onPress: () => router.replace(`/cellar/rack/${rackId}`) }],
        });
      } else {
        router.replace(`/cellar/rack/${rackId}`);
        showAlert({
          title: 'Added to your cellar',
          body: `${free.length} bottle${free.length === 1 ? '' : 's'} placed in your rack — and added to your Full Cellar List.`,
          buttons: [
            { text: 'View in Full Cellar List', onPress: () => router.replace('/cellar/list') },
            { text: 'Done', style: 'cancel' },
          ],
        });
      }
    } catch (err) {
      showAlert({ title: 'Could not place wine', body: err instanceof Error ? err.message : 'Please try again.' });
      setPlacing(false);
    }
  }

  return (
    <>
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      bottomOffset={24}
    >
      <Text style={styles.heading}>Confirm Wine Details</Text>
      <Text style={styles.subheading}>
        {isManual
          ? "Enter the wine's details below."
          : 'Check the details we extracted and correct anything that looks wrong.'}
      </Text>

      <Text style={styles.label}>Producer</Text>
      <TextInput
        style={styles.input}
        value={producer}
        onChangeText={setProducer}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Region</Text>
      <TextInput
        style={styles.input}
        value={region}
        onChangeText={setRegion}
        placeholder="e.g. Margaux, Bordeaux"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Wine Name (optional)</Text>
      <TextInput
        style={styles.input}
        value={wineName}
        onChangeText={setWineName}
        placeholder="e.g. Reserve, Cuvée Prestige"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={styles.input}
        value={vintage}
        onChangeText={setVintage}
        placeholder="e.g. 2019 or NV"
        placeholderTextColor={colors.textMuted}
        keyboardType="default"
        maxLength={4}
      />

      <Text style={styles.label}>Style</Text>
      <TextInput
        style={styles.input}
        value={style}
        onChangeText={setStyle}
        placeholder="e.g. Red, White, Rosé, Sparkling, Fortified"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Loading wine details…' : 'Confirm'}
        </Text>
      </TouchableOpacity>

      {isLineup ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/cellar/scan-lineup')}>
          <Text style={styles.backText}>Back to Lineup</Text>
        </TouchableOpacity>
      ) : isManual ? (
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>Cancel</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace(`/label/camera${contextQuery}`)}>
          <Text style={styles.backText}>Scan Again</Text>
        </TouchableOpacity>
      )}
    </KeyboardAwareScrollView>

    {/* Placement confirm — format, bottle count and fill direction for a single
        rack/fridge slot add. No Location: the chosen slot fixes that already. */}
    <Modal visible={placeModalOpen} transparent animationType="fade" onRequestClose={() => !placing && setPlaceModalOpen(false)}>
      <View style={styles.placeOverlay}>
        <View style={styles.placeSheet}>
          <Text style={styles.placeTitle}>Confirm placement</Text>
          <Text style={styles.label}>Bottle format</Text>
          <BottleSizePicker value={placeFormat} onChange={setPlaceFormat} />
          <Text style={[styles.label, { marginTop: spacing.md }]}>Number of bottles</Text>
          <TextInput
            style={styles.input}
            value={placeCount}
            onChangeText={setPlaceCount}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.label}>Fill direction</Text>
          <View style={styles.orientRow}>
            <TouchableOpacity
              style={[styles.orientBtn, placeOrientation === 'Vertical' && styles.orientBtnOn]}
              onPress={() => setPlaceOrientation('Vertical')}
            >
              <Text style={[styles.orientText, placeOrientation === 'Vertical' && styles.orientTextOn]}>Vertical ↓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.orientBtn, placeOrientation === 'Horizontal' && styles.orientBtnOn]}
              onPress={() => setPlaceOrientation('Horizontal')}
            >
              <Text style={[styles.orientText, placeOrientation === 'Horizontal' && styles.orientTextOn]}>Horizontal →</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.button, placing && styles.buttonDisabled]}
            onPress={handlePlaceConfirm}
            disabled={placing}
          >
            <Text style={styles.buttonText}>{placing ? 'Adding…' : 'Add Wine'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => !placing && setPlaceModalOpen(false)} disabled={placing}>
            <Text style={styles.backText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 130, paddingBottom: 60 },
  heading: {
    fontSize: 26,
    fontFamily: fonts.headingBold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 14,
    fontFamily: fonts.headingRegular,
    color: colors.textMuted,
    marginBottom: spacing.xl,
    lineHeight: 20,
    textAlign: 'center',
  },
  // Form field label — body.
  label: {
    fontSize: 13,
    fontFamily: fonts.bodySemibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Form input — body.
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    fontSize: 16,
    fontFamily: fonts.bodyRegular,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: fonts.headingSemibold,
    fontSize: 16,
  },
  backButton: { alignItems: 'center', marginTop: spacing.lg },
  // Back/nav link — body.
  backText: {
    color: colors.textMuted,
    fontFamily: fonts.bodyRegular,
    fontSize: 14,
  },
  placeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', padding: spacing.xl },
  placeSheet: { backgroundColor: colors.background, borderRadius: 18, padding: spacing.xl },
  placeTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  orientRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  orientBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, alignItems: 'center' },
  orientBtnOn: { borderColor: colors.gold },
  orientText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  orientTextOn: { color: colors.gold },
});
