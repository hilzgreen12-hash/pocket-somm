import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal, Keyboard, ActivityIndicator } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useCellar, useArchive } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRacks } from '../../src/hooks/useRacks';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { useRackStore } from '../../src/stores/rackStore';
import { generatePairings, getWineIntelligence } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine } from '../../src/api/racks';
import { addCellarWineRemoval, listCellarWineRemovals, updateCellarWineRemoval } from '../../src/api/cellar';
import { supabase } from '../../src/api/supabase';
import { SearchProgress } from '../../src/components/SearchProgress';
import { colors, spacing } from '../../src/constants/theme';
import { formatCurrency } from '../../src/constants/currency';
import type { WineDetailsComplete } from '../../src/types/wine';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

const STATUS_COLORS: Record<string, string> = {
  too_young: colors.warning,
  approaching: colors.gold,
  peak: colors.gold,
  declining: colors.error,
  unknown: colors.textMuted,
};

const STATUS_LABELS: Record<string, string> = {
  too_young: 'Too Young',
  approaching: 'Approaching Peak',
  peak: 'Peak Now',
  declining: 'Declining',
  unknown: 'Unknown',
};

function RemovalRow({ removal, onSaved }: { removal: { id: string; removed_at: string; count: number; note: string | null }; onSaved: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(removal.note ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    Keyboard.dismiss();
    setSaving(true);
    try {
      await updateCellarWineRemoval(removal.id, { note: draft.trim() || null });
      setEditing(false);
      onSaved();
    } catch {
      showAlert({ title: 'Could not save', body: 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  const dateLabel = new Date(removal.removed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.removalRow}>
      <View style={styles.removalHeader}>
        <Text style={styles.removalCount}>{removal.count} {removal.count === 1 ? 'bottle' : 'bottles'}</Text>
        <Text style={styles.removalDate}>{dateLabel}</Text>
      </View>
      {editing ? (
        <>
          <TextInput
            style={[styles.input, styles.removalInput]}
            value={draft}
            onChangeText={setDraft}
            placeholder="Add a note for this removal — occasion, who you were with…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            autoFocus
          />
          <View style={styles.noteActions}>
            <TouchableOpacity onPress={() => { setEditing(false); setDraft(removal.note ?? ''); }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Note'}</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {removal.note ? <Text style={styles.removalNoteText}>{removal.note}</Text> : null}
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>{removal.note ? 'Edit Note' : 'Add Note'}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

export default function CellarWineDetail() {
  useKeepAwake();
  const { wineId, from } = useLocalSearchParams<{ wineId: string; from?: string }>();
  // When the user came in by tapping a slot on a rack grid, the
  // "In {rack name} →" affordance on the Bottles stat would just point
  // them back to where they came from — hide it in that case. The link
  // stays visible when entering via Full Cellar List, where it acts as a
  // legitimate shortcut to the rack.
  const cameFromRack = from === 'rack';
  const { session } = useAuth();
  const { wines, updateWine, isLoading: cellarLoading } = useCellar();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed, setPairings, setFilters, setError } = useLabelStore();
  const { setPendingWineId, setPendingAddMode } = useRackStore();
  const qc = useQueryClient();
  const { wines: archivedWines, isLoading: archiveLoading } = useArchive();
  const wine = wines.find((w) => w.id === wineId) ?? archivedWines.find((w) => w.id === wineId);
  const isArchived = !!wine?.archived_at;

  const { data: removals = [] } = useQuery({
    queryKey: ['cellar-removals', wineId],
    queryFn: () => listCellarWineRemovals(wineId!),
    enabled: !!wineId,
  });

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });
  const wineSlot = slotAssignments.find((s) => s.cellar_wine_id === wineId);
  const wineRack = wineSlot ? racks.find((r) => r.id === wineSlot.rack_id) ?? null : null;

  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(wine?.user_notes ?? '');
  const [savingNote, setSavingNote] = useState(false);

  const [removeCount, setRemoveCount] = useState('1');
  const [removeDate, setRemoveDate] = useState(todayISO());
  const [removing, setRemoving] = useState(false);
  const [rackRemovalMsg, setRackRemovalMsg] = useState<string | null>(null);
  const [removeStep, setRemoveStep] = useState<'idle' | 'confirm' | 'success'>('idle');
  // True for the brief window between deletion and auto-navigation. Used to
  // suppress the "Wine not found" fallback (the cellar query has already
  // refetched without this wine) so the auto-dismissing success toast can
  // render on top of an otherwise-empty screen.
  const [justDeleted, setJustDeleted] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [addBottlesOpen, setAddBottlesOpen] = useState(false);
  const [addBottlesCount, setAddBottlesCount] = useState('1');
  const [addingBottles, setAddingBottles] = useState(false);

  const [findingPairings, setFindingPairings] = useState(false);

  const [editingPrice, setEditingPrice] = useState(false);
  const [purchasePriceDraft, setPurchasePriceDraft] = useState(wine?.purchase_price != null ? String(wine.purchase_price) : '');
  const [savingPrice, setSavingPrice] = useState(false);
  const [refreshingValue, setRefreshingValue] = useState(false);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [reviewScoreDraft, setReviewScoreDraft] = useState(wine?.review_score != null ? String(wine.review_score) : '');
  const [reviewLocationDraft, setReviewLocationDraft] = useState(wine?.review_location ?? '');
  // "When did you drink it?" defaults to today if the wine hasn't been
  // reviewed yet — users adding a review immediately after drinking would
  // otherwise have to type the date out every time.
  const [reviewDateDraft, setReviewDateDraft] = useState(wine?.review_date ?? todayISO());
  const [savingReview, setSavingReview] = useState(false);

  // Brief "Wine removed from your records" toast — shown for ~1.4s after
  // a permanent delete, then the auto-dismiss timer navigates back. The
  // user just confirmed deletion, so the underlying wine row is gone and
  // we render this on top of an empty screen rather than the wine card.
  if (justDeleted) {
    return (
      <View style={styles.removeModalOverlay}>
        <View style={styles.removeModalSheet}>
          <Text style={styles.removeModalTitle}>Wine has been removed from your records</Text>
        </View>
      </View>
    );
  }

  // While the cellar query is in flight, show a spinner instead of the
  // "Wine not found" fallback — otherwise the user sees a flash of that
  // message right after a wine is added (the navigation lands before the
  // cellar refetch resolves).
  if (!wine && (cellarLoading || archiveLoading)) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  if (!wine) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Wine not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.linkText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleAddBottlesEntry() {
    // When the wine is already placed in a rack, route the user through
    // the rack grid so they can choose a starting slot + orientation and
    // place the new bottles visually. When the wine has no rack yet, fall
    // back to the simple inline modal (just bumps the quantity) — the
    // user can place those bottles later by picking a rack first.
    if (wineRack) {
      setPendingWineId(wine!.id);
      setPendingAddMode(true);
      router.push(`/cellar/rack/${wineRack.id}` as any);
      return;
    }
    setAddBottlesCount('1');
    setAddBottlesOpen(true);
  }

  async function handleSaveNote() {
    Keyboard.dismiss();
    setSavingNote(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { user_notes: noteText.trim() || null },
      });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setEditingNote(false);
      showAlert({ title: 'Note Saved' });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save note.' });
    } finally {
      setSavingNote(false);
    }
  }

  async function handleArchiveWine() {
    const count = parseInt(removeCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to archive.' });
      return;
    }
    if (count > wine!.quantity) {
      showAlert({ title: 'Invalid', body: `You only have ${wine!.quantity} bottle${wine!.quantity === 1 ? '' : 's'}.` });
      return;
    }

    const newQuantity = wine!.quantity - count;
    const removalNote = `${removeDate}: removed ${count} bottle${count === 1 ? '' : 's'}`;
    const updatedNotes = wine!.user_notes ? `${wine!.user_notes}\n${removalNote}` : removalNote;

    setRemoving(true);
    try {
      // Log the structured removal event regardless of partial vs full —
      // these power the Removal History block on the wine card and the
      // Cellar Archive view.
      await addCellarWineRemoval({
        cellarWineId: wine!.id,
        removedAt: removeDate,
        count,
      });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wine!.id] });

      if (newQuantity === 0) {
        // Archive the row with the actual number removed in this event so the
        // "Bottles in My Archive" stat on the wine card sums correctly.
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: {
            quantity: count,
            archived_at: `${removeDate}T12:00:00.000Z`,
            user_notes: updatedNotes,
          },
        });
        await clearWineFromRacks(wine!.id);
        if (session?.user.id) {
          qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
        }
        qc.invalidateQueries({ queryKey: ['slot-assignments'] });
        qc.invalidateQueries({ queryKey: ['rack-slots'] });
        showAlert({
          title: 'Wine Archived',
          body: 'Removed from Cellar List and racks.',
          buttons: [{ text: 'OK', onPress: () => router.back() }],
        });
      } else {
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: { quantity: newQuantity, user_notes: updatedNotes },
        });
        const slotsRemoved = await removeSlotsForWine(wine!.id, count);
        if (slotsRemoved > 0) {
          qc.invalidateQueries({ queryKey: ['slot-assignments'] });
          qc.invalidateQueries({ queryKey: ['rack-slots'] });
          setRackRemovalMsg(
            `${slotsRemoved} bottle${slotsRemoved === 1 ? '' : 's'} also removed from your live cellar rack.`
          );
        } else {
          setRackRemovalMsg(null);
        }
        setRemoveCount('1');
        setNoteText(updatedNotes);
      }
    } catch {
      showAlert({ title: 'Error', body: 'Could not record removal. Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleAddBottles() {
    const count = parseInt(addBottlesCount) || 0;
    if (count < 1) {
      showAlert({ title: 'Invalid', body: 'Enter at least 1 bottle to add.' });
      return;
    }
    setAddingBottles(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { quantity: wine!.quantity + count },
      });
      setAddBottlesOpen(false);
      setAddBottlesCount('1');
    } catch {
      showAlert({ title: 'Error', body: 'Could not add bottles. Please try again.' });
    } finally {
      setAddingBottles(false);
    }
  }

  async function handleSavePrice() {
    Keyboard.dismiss();
    const trimmed = purchasePriceDraft.trim();
    const parsed = trimmed ? Number(trimmed) : null;
    if (trimmed && (parsed === null || Number.isNaN(parsed) || parsed < 0)) {
      showAlert({ title: 'Invalid', body: 'Enter a positive number for the purchase price.' });
      return;
    }
    setSavingPrice(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: {
          purchase_price: parsed,
          // Stamp the user's current currency only on first entry; preserve
          // existing currency on subsequent edits so historical prices stay
          // in their original currency.
          ...(wine!.purchase_price_currency ? {} : { purchase_price_currency: preferences?.defaultCurrency ?? 'GBP' }),
        },
      });
      setEditingPrice(false);
    } catch {
      showAlert({ title: 'Error', body: 'Could not save purchase price.' });
    } finally {
      setSavingPrice(false);
    }
  }

  async function handleSaveReview() {
    Keyboard.dismiss();
    const scoreTrim = reviewScoreDraft.trim();
    const locationTrim = reviewLocationDraft.trim();
    const dateTrim = reviewDateDraft.trim();
    let parsedScore: number | null = null;
    if (scoreTrim) {
      const n = Number(scoreTrim);
      if (!Number.isFinite(n) || n < 0 || n > 100) {
        showAlert({ title: 'Invalid score', body: 'Enter a score between 0 and 100.' });
        return;
      }
      parsedScore = Math.round(n);
    }
    setSavingReview(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: {
          review_score: parsedScore,
          review_location: locationTrim || null,
          review_date: dateTrim || null,
        },
      });
      setReviewExpanded(false);
    } catch {
      showAlert({ title: 'Could not save review', body: 'Please try again.' });
    } finally {
      setSavingReview(false);
    }
  }

  async function handleRemoveWine() {
    // Hard delete: removes the wine record entirely from cellar_wines and
    // clears any rack slots referencing it. Triggered after the user has
    // confirmed in the styled confirm modal.
    if (!wine) return;
    setRemoving(true);
    try {
      await clearWineFromRacks(wine.id);
      const { error } = await supabase.from('cellar_wines').delete().eq('id', wine.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['cellar'] });
      qc.invalidateQueries({ queryKey: ['cellar-archive'] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });
      setRemoveStep('idle');
      // Flip the just-deleted flag BEFORE the cellar refetch can land — the
      // dedicated render block at the top of the component renders the
      // toast and suppresses the "Wine not found" fallback. Auto-dismiss
      // after a beat, then navigate back to wherever the user came from.
      setJustDeleted(true);
      setTimeout(() => {
        if (router.canGoBack()) router.back();
        else router.replace('/(tabs)/cellar');
      }, 1400);
    } catch {
      setRemoveStep('idle');
      showAlert({ title: 'Could not remove', body: 'Please try again.' });
    } finally {
      setRemoving(false);
    }
  }

  async function handleRefreshEstimate() {
    if (!wine) return;
    setRefreshingValue(true);
    const currency = preferences?.defaultCurrency ?? 'GBP';
    try {
      const intel = await getWineIntelligence({
        producer: wine.producer ?? '',
        region: wine.region ?? '',
        wineName: wine.wine_name || null,
        vintage: wine.vintage || 'NV',
      } as any, currency);
      await updateWine.mutateAsync({
        id: wine.id,
        updates: {
          estimated_value: intel.estimatedValue,
          estimated_value_currency: currency,
          estimated_value_at: new Date().toISOString(),
        },
      });
    } catch {
      showAlert({ title: 'Could not refresh', body: 'Vinster couldn\'t generate an estimate right now. Please try again.' });
    } finally {
      setRefreshingValue(false);
    }
  }

  function handleFindPairings() {
    if (!wine) return;
    // Route through the same per-search preferences screen that the Chef
    // tab uses (dietary / allergy / difficulty / time / specific concerns),
    // rather than generating pairings inline from profile preferences only.
    // The screen reads wineDetailsConfirmed from the label store, so we set
    // it here. from=cellar lets the results screen know to route Back to
    // the wine card on tap rather than to the Chef tab.
    const confirmed: WineDetailsComplete = {
      producer: wine.producer || '',
      region: wine.region || '',
      wineName: wine.wine_name || null,
      vintage: wine.vintage || 'NV',
      style: null,
    };
    setWineDetailsConfirmed(confirmed);
    router.push(`/chef/review-requirements?from=cellar&wineId=${wine.id}`);
  }

  if (findingPairings) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="Our sommelier is selecting three chef-inspired dishes to complement your wine"
      />
    );
  }

  const windowColor = STATUS_COLORS[wine.drinking_window_status] ?? colors.textMuted;
  const windowLabel = STATUS_LABELS[wine.drinking_window_status] ?? 'Unknown';

  // Count bottles across all rows (cellar + archive) that match this wine's
  // identity. Producer + wine name + vintage normalised so 'NV' / null /
  // case differences don't fragment the count.
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const matchesIdentity = (w: typeof wine) =>
    norm(w.producer) === norm(wine.producer) &&
    norm(w.wine_name) === norm(wine.wine_name) &&
    norm(w.vintage) === norm(wine.vintage);
  const bottlesInCellar = wines.filter(matchesIdentity).reduce((sum, w) => sum + (w.quantity ?? 0), 0);
  const bottlesInArchive = archivedWines.filter(matchesIdentity).reduce((sum, w) => sum + (w.quantity ?? 0), 0);

  function bottleLabel(n: number) {
    return `${n} ${n === 1 ? 'bottle' : 'bottles'}`;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }} keyboardShouldPersistTaps="always">
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerLine}>
          {(() => {
            const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
            const parts = sameName
              ? [wine.producer, wine.vintage]
              : [wine.producer, wine.wine_name, wine.vintage];
            return parts.filter(Boolean).join(' · ');
          })()}
        </Text>
        {wine.region ? <Text style={styles.region}>{wine.region}</Text> : null}
        {wine.grape_variety ? <Text style={styles.grape}>{wine.grape_variety}</Text> : null}
      </View>

      {/* Compact stats grid — score / window / bottle counts only. The
          Purchase and Estimated values are pulled out into full-width rows
          below so each has room to breathe and a clearer call to action. */}
      <View style={styles.statsGrid}>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Critic Score</Text>
          <Text style={styles.statValue}>{wine.critic_score != null ? wine.critic_score : '—'}</Text>
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Drinking Window</Text>
          <Text style={[styles.statValue, { color: windowColor }]}>{windowLabel}</Text>
          {wine.drinking_window_from && wine.drinking_window_to && (
            <Text style={styles.statSub}>{wine.drinking_window_from}–{wine.drinking_window_to}</Text>
          )}
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Cellar</Text>
          <Text style={styles.statValue}>{bottleLabel(bottlesInCellar)}</Text>
          {wineRack && !cameFromRack && (
            <TouchableOpacity onPress={() => router.push(`/cellar/rack/${wineRack.id}`)}>
              <Text style={styles.statAction}>In {wineRack.name} →</Text>
            </TouchableOpacity>
          )}
          {!isArchived && (
            <TouchableOpacity onPress={() => handleAddBottlesEntry()}>
              <Text style={styles.statAction}>+ Add bottles</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Archive</Text>
          <Text style={[styles.statValue, bottlesInArchive === 0 && styles.statValueMuted]}>{bottleLabel(bottlesInArchive)}</Text>
        </View>
      </View>

      {/* When no critic score is available, surface Vinster's brief
          explanation so the dash doesn't feel like an error. */}
      {wine.critic_score == null && wine.critic_score_note ? (
        <View style={styles.scoreNoteBlock}>
          <Text style={styles.scoreNoteLabel}>Why no critic score?</Text>
          <Text style={styles.scoreNoteText}>{wine.critic_score_note}</Text>
        </View>
      ) : null}

      {/* Purchase Value — full-width row, label left, value or input-prompt
          on the right. Tap anywhere on the row to start editing. */}
      <TouchableOpacity
        style={styles.valueRow}
        onPress={() => !editingPrice && setEditingPrice(true)}
        activeOpacity={editingPrice ? 1 : 0.7}
      >
        <Text style={styles.valueLabel}>Purchase Value</Text>
        {editingPrice ? (
          <View style={styles.valueEditBlock}>
            <TextInput
              style={styles.valueInput}
              value={purchasePriceDraft}
              onChangeText={setPurchasePriceDraft}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TouchableOpacity onPress={() => { setEditingPrice(false); setPurchasePriceDraft(wine.purchase_price != null ? String(wine.purchase_price) : ''); }}>
              <Text style={styles.valueCancel}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSavePrice} disabled={savingPrice}>
              <Text style={[styles.valueSave, savingPrice && { opacity: 0.5 }]}>{savingPrice ? '…' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        ) : wine.purchase_price != null ? (
          <Text style={styles.valueText}>{formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 2 })}</Text>
        ) : (
          <Text style={styles.valueAction}>Input Purchase Price</Text>
        )}
      </TouchableOpacity>

      {/* Estimated Value — full-width row, label left, value + date or
          generate-prompt on the right. */}
      <TouchableOpacity
        style={styles.valueRow}
        onPress={handleRefreshEstimate}
        activeOpacity={refreshingValue ? 1 : 0.7}
        disabled={refreshingValue}
      >
        <Text style={styles.valueLabel}>Estimated Value</Text>
        {refreshingValue ? (
          <Text style={[styles.valueText, styles.valueTextMuted]}>Estimating…</Text>
        ) : wine.estimated_value != null ? (
          <Text style={styles.valueText}>
            {formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}
            {wine.estimated_value_at ? `, on ${new Date(wine.estimated_value_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
          </Text>
        ) : (
          <Text style={styles.valueAction}>Generate Value</Text>
        )}
      </TouchableOpacity>

      {wine.tasting_notes && (
        <View style={styles.tastingBlock}>
          <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          {!reviewExpanded && (
            <TouchableOpacity onPress={() => setReviewExpanded(true)}>
              <Text style={styles.editLink}>
                {wine.review_score != null || wine.review_location || wine.review_date ? 'Edit Review' : 'Add Review'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {reviewExpanded ? (
          <>
            <Text style={styles.fieldLabel}>Score (0–100)</Text>
            <TextInput
              style={styles.input}
              value={reviewScoreDraft}
              onChangeText={setReviewScoreDraft}
              keyboardType="number-pad"
              placeholder="e.g. 92"
              placeholderTextColor={colors.textMuted}
              maxLength={3}
            />
            <Text style={styles.fieldLabel}>Where did you drink it?</Text>
            <TextInput
              style={styles.input}
              value={reviewLocationDraft}
              onChangeText={setReviewLocationDraft}
              placeholder="Restaurant, home, friend's place…"
              placeholderTextColor={colors.textMuted}
            />
            <Text style={styles.fieldLabel}>When did you drink it?</Text>
            <TextInput
              style={styles.input}
              value={reviewDateDraft}
              onChangeText={setReviewDateDraft}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => {
                setReviewExpanded(false);
                setReviewScoreDraft(wine.review_score != null ? String(wine.review_score) : '');
                setReviewLocationDraft(wine.review_location ?? '');
                setReviewDateDraft(wine.review_date ?? todayISO());
              }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, savingReview && styles.buttonDisabled]} onPress={handleSaveReview} disabled={savingReview}>
                <Text style={styles.saveBtnText}>{savingReview ? 'Saving…' : 'Save Review'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (wine.review_score != null || wine.review_location || wine.review_date) ? (
          <View>
            {wine.review_score != null && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Score</Text>
                <Text style={styles.infoValue}>{wine.review_score}</Text>
              </View>
            )}
            {wine.review_location ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Where</Text>
                <Text style={styles.infoValue}>{wine.review_location}</Text>
              </View>
            ) : null}
            {wine.review_date ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>When</Text>
                <Text style={styles.infoValue}>{wine.review_date}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          {!editingNote && (
            <TouchableOpacity onPress={() => setEditingNote(true)}>
              <Text style={styles.editLink}>{wine.user_notes ? 'Edit Note' : 'Add Note'}</Text>
            </TouchableOpacity>
          )}
        </View>
        {editingNote ? (
          <>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Add a personal note about this wine…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
            />
            <View style={styles.noteActions}>
              <TouchableOpacity onPress={() => { setEditingNote(false); setNoteText(wine.user_notes ?? ''); }}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, savingNote && styles.buttonDisabled]} onPress={handleSaveNote} disabled={savingNote}>
                <Text style={styles.saveBtnText}>{savingNote ? 'Saving…' : 'Save Note'}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : wine.user_notes ? (
          <Text style={styles.noteText}>{wine.user_notes}</Text>
        ) : null}
      </View>

      {!isArchived && (
        <>
          {rackRemovalMsg && (
            <Text style={[styles.rackRemovalMsg, { marginHorizontal: spacing.xl }]}>{rackRemovalMsg}</Text>
          )}

          <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
            <Text style={styles.chefBtnText}>Chef, find me a food pairing for this wine</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.archiveAccessBtn} onPress={() => setArchiveModalOpen(true)}>
            <Text style={styles.archiveAccessBtnText}>Archive or Delete Wine</Text>
          </TouchableOpacity>
        </>
      )}

      {removals.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{isArchived ? 'Archived' : 'Removal History'}</Text>
            {isArchived && wine.archived_at && (
              <Text style={styles.archivedAt}>{new Date(wine.archived_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
            )}
          </View>
          {removals.map((ev) => (
            <RemovalRow key={ev.id} removal={ev} onSaved={() => qc.invalidateQueries({ queryKey: ['cellar-removals', wineId] })} />
          ))}
        </View>
      )}

      {isArchived && (
        <TouchableOpacity
          style={[styles.removeWineBtn, styles.archivedDeleteBtn, removing && styles.buttonDisabled]}
          onPress={() => setRemoveStep('confirm')}
          disabled={removing}
        >
          <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={addBottlesOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !addingBottles && setAddBottlesOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Add bottles</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

            <Text style={styles.fieldLabel}>How many bottles to add?</Text>
            <TextInput
              style={styles.input}
              value={addBottlesCount}
              onChangeText={setAddBottlesCount}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.removeBtn, { borderColor: colors.gold }, addingBottles && styles.buttonDisabled]}
              onPress={handleAddBottles}
              disabled={addingBottles}
            >
              <Text style={[styles.removeBtnText, { color: colors.gold }]}>
                {addingBottles ? 'Adding…' : 'Add to Cellar'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setAddBottlesOpen(false)} style={styles.archiveModalCancel} disabled={addingBottles}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={archiveModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => !removing && setArchiveModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.archiveModalSheet}>
            <Text style={styles.archiveModalTitle}>Archive or Delete Wine</Text>
            <Text style={styles.archiveModalWine}>{wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''}</Text>

            {wine.quantity > 1 && (
              <>
                <Text style={styles.fieldLabel}>How many of your {wine.quantity} bottles?</Text>
                <TextInput
                  style={styles.input}
                  value={removeCount}
                  onChangeText={setRemoveCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Date removed</Text>
            <TextInput
              style={styles.input}
              value={removeDate}
              onChangeText={setRemoveDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              style={[styles.removeBtn, removing && styles.buttonDisabled]}
              onPress={async () => {
                await handleArchiveWine();
                setArchiveModalOpen(false);
              }}
              disabled={removing}
            >
              <Text style={styles.removeBtnText}>{removing ? 'Working…' : 'Archive Wine'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.removeWineBtn, removing && styles.buttonDisabled]}
              onPress={() => { setArchiveModalOpen(false); setRemoveStep('confirm'); }}
              disabled={removing}
            >
              <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setArchiveModalOpen(false)} style={styles.archiveModalCancel} disabled={removing}>
              <Text style={styles.archiveModalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={removeStep !== 'idle'}
        transparent
        animationType="fade"
        onRequestClose={() => removeStep === 'success' ? null : setRemoveStep('idle')}
      >
        <View style={styles.removeModalOverlay}>
          <View style={styles.removeModalSheet}>
            {removeStep === 'confirm' ? (
              <>
                <Text style={styles.removeModalTitle}>Remove this wine?</Text>
                <Text style={styles.removeModalBody}>
                  This will permanently delete {wine.wine_name}{wine.vintage ? ` ${wine.vintage}` : ''} from your record. This can't be undone.
                </Text>
                <TouchableOpacity
                  style={[styles.removeModalConfirmBtn, removing && styles.buttonDisabled]}
                  onPress={handleRemoveWine}
                  disabled={removing}
                >
                  <Text style={styles.removeModalConfirmText}>{removing ? 'Removing…' : 'Remove permanently'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRemoveStep('idle')} style={styles.removeModalCancel}>
                  <Text style={styles.removeModalCancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  backRow: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, lineHeight: 28 },
  region: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 4 },
  grape: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginTop: 2 },
  tastingBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'right' },
  infoSub: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 17, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  editLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  tastingNotes: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
  fieldLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  buttonDisabled: { opacity: 0.6 },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22 },
  noteInput: { minHeight: 90, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  saveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  removeBlock: { paddingTop: spacing.sm },
  removeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  removeBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  removeWineBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  removeWineBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  archivedDeleteBtn: { marginHorizontal: spacing.xl, marginBottom: spacing.lg },
  archivedAt: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold, letterSpacing: 0.5 },
  removalRow: { paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  removalHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 },
  removalCount: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  removalDate: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  removalNoteText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20, marginBottom: 4 },
  removalInput: { minHeight: 70, textAlignVertical: 'top' },
  removeModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  removeModalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  removeModalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm, lineHeight: 28 },
  removeModalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  removeModalConfirmBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  removeModalConfirmText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  removeModalCancel: { alignItems: 'center', paddingVertical: spacing.sm },
  removeModalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 15, color: colors.textMuted },
  removeModalOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  removeModalOkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  rackRemovalMsg: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  chefBtn: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  archiveAccessBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.md },
  archiveAccessBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  archiveModalSheet: { backgroundColor: colors.background, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48, borderTopWidth: 1, borderColor: colors.border },
  archiveModalTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: 2 },
  archiveModalWine: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.lg },
  archiveModalCancel: { alignItems: 'center', marginTop: spacing.md },
  archiveModalCancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  // Full-width "label left, value/action right" rows used for Purchase
  // and Estimated value — these get their own single-line treatment so the
  // CTAs are scannable instead of cramped into the 50%-wide grid.
  valueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  valueLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  valueText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, flexShrink: 1, textAlign: 'right' },
  valueTextMuted: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' },
  valueAction: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  valueEditBlock: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1, justifyContent: 'flex-end' },
  valueInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minWidth: 80, maxWidth: 120, textAlign: 'right' },
  valueCancel: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  valueSave: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  // "Why no critic score?" explanation block — only renders when Vinster
  // couldn't find a score and provided a one-sentence reason.
  scoreNoteBlock: { paddingHorizontal: spacing.xl, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  scoreNoteLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  scoreNoteText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 18 },
  statCell: {
    width: '50%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.text,
    lineHeight: 20,
  },
  statValueMuted: {
    color: colors.textMuted,
    fontFamily: 'CormorantGaramond_400Regular_Italic',
  },
  statSub: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
    marginTop: 2,
  },
  statAction: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_600SemiBold',
    color: colors.gold,
    marginTop: 4,
  },
  statCancel: {
    fontSize: 12,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.textMuted,
  },
  statInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    backgroundColor: colors.surface,
    marginTop: 2,
  },
  statActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});
