import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
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
  const { wineId } = useLocalSearchParams<{ wineId: string }>();
  const { session } = useAuth();
  const { wines, updateWine } = useCellar();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed, setPairings, setFilters, setError } = useLabelStore();
  const qc = useQueryClient();
  const { wines: archivedWines } = useArchive();
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

  const [findingPairings, setFindingPairings] = useState(false);

  const [editingPrice, setEditingPrice] = useState(false);
  const [purchasePriceDraft, setPurchasePriceDraft] = useState(wine?.purchase_price != null ? String(wine.purchase_price) : '');
  const [savingPrice, setSavingPrice] = useState(false);
  const [refreshingValue, setRefreshingValue] = useState(false);

  const [reviewExpanded, setReviewExpanded] = useState(false);
  const [reviewScoreDraft, setReviewScoreDraft] = useState(wine?.review_score != null ? String(wine.review_score) : '');
  const [reviewLocationDraft, setReviewLocationDraft] = useState(wine?.review_location ?? '');
  const [reviewDateDraft, setReviewDateDraft] = useState(wine?.review_date ?? '');
  const [savingReview, setSavingReview] = useState(false);

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

  async function handleSaveNote() {
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

  async function handleSavePrice() {
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
      setRemoveStep('success');
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

  async function handleFindPairings() {
    if (!wine) return;
    const confirmed: WineDetailsComplete = {
      producer: wine.producer || '',
      region: wine.region || '',
      wineName: wine.wine_name || null,
      vintage: wine.vintage || 'NV',
      style: null,
    };

    setFindingPairings(true);
    setWineDetailsConfirmed(confirmed);

    try {
      const filters = {
        dietary: (preferences?.dietaryNeeds?.[0] ?? null) as any,
        allergens: (preferences?.allergyRisks ?? []) as any,
        customAllergen: '',
        dietaryNote: null,
        difficulty: null,
        specificConcerns: preferences?.specificConcerns?.trim() || null,
        regionalPreferences: preferences?.regionalPreferences ?? [],
        nutritionalPreferences: preferences?.nutritionalPreferences ?? [],
      };
      const pairings = await generatePairings(confirmed, filters);
      setPairings(pairings);
      setFilters(filters as unknown as Record<string, unknown>);
      router.push('/chef/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      showAlert({ title: 'Error', body: 'Could not generate pairings. Please try again.' });
    } finally {
      setFindingPairings(false);
    }
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
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
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

      {/* Compact stats grid */}
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

        <TouchableOpacity style={styles.statCell} onPress={() => !editingPrice && setEditingPrice(true)} activeOpacity={editingPrice ? 1 : 0.7}>
          <Text style={styles.statLabel}>Purchase Price</Text>
          {editingPrice ? (
            <>
              <TextInput
                style={styles.statInput}
                value={purchasePriceDraft}
                onChangeText={setPurchasePriceDraft}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />
              <View style={styles.statActions}>
                <TouchableOpacity onPress={() => { setEditingPrice(false); setPurchasePriceDraft(wine.purchase_price != null ? String(wine.purchase_price) : ''); }}>
                  <Text style={styles.statCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSavePrice} disabled={savingPrice}>
                  <Text style={[styles.statAction, savingPrice && { opacity: 0.5 }]}>{savingPrice ? '…' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.statValue, wine.purchase_price == null && styles.statValueMuted]}>
                {wine.purchase_price != null ? formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 2 }) : 'Tap to add'}
              </Text>
              {wine.purchase_price != null && <Text style={styles.statAction}>Edit</Text>}
            </>
          )}
        </TouchableOpacity>

        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Estimated Value</Text>
          {refreshingValue ? (
            <Text style={[styles.statValue, styles.statValueMuted]}>Estimating…</Text>
          ) : wine.estimated_value != null ? (
            <Text style={styles.statValue}>{formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}</Text>
          ) : (
            <Text style={[styles.statValue, styles.statValueMuted]}>—</Text>
          )}
          <TouchableOpacity onPress={handleRefreshEstimate} disabled={refreshingValue}>
            <Text style={styles.statAction}>{wine.estimated_value != null ? 'Refresh' : 'Get estimate'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Cellar</Text>
          <Text style={styles.statValue}>{bottleLabel(bottlesInCellar)}</Text>
          {wineRack && (
            <TouchableOpacity onPress={() => router.push(`/cellar/rack/${wineRack.id}`)}>
              <Text style={styles.statAction}>In {wineRack.name} →</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.statCell}>
          <Text style={styles.statLabel}>Bottles in My Archive</Text>
          <Text style={[styles.statValue, bottlesInArchive === 0 && styles.statValueMuted]}>{bottleLabel(bottlesInArchive)}</Text>
        </View>
      </View>

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
                setReviewDateDraft(wine.review_date ?? '');
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
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Archive or Delete Wine</Text>

            <View style={styles.removeBlock}>
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
                onPress={handleArchiveWine}
                disabled={removing}
              >
                <Text style={styles.removeBtnText}>{removing ? 'Working…' : 'Archive Wine'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.removeWineBtn, removing && styles.buttonDisabled]}
                onPress={() => setRemoveStep('confirm')}
                disabled={removing}
              >
                <Text style={styles.removeWineBtnText}>Delete Wine From Your Records</Text>
              </TouchableOpacity>

              {rackRemovalMsg && (
                <Text style={styles.rackRemovalMsg}>{rackRemovalMsg}</Text>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
            <Text style={styles.chefBtnText}>Chef, find me a food pairing for this wine</Text>
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
            ) : (
              <>
                <Text style={styles.removeModalTitle}>Wine has been deleted from your record</Text>
                <TouchableOpacity
                  style={styles.removeModalOkBtn}
                  onPress={() => { setRemoveStep('idle'); router.back(); }}
                >
                  <Text style={styles.removeModalOkText}>OK</Text>
                </TouchableOpacity>
              </>
            )}
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
  removeWineBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: 8, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  removeWineBtnText: { color: colors.error, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
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
  removeModalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  removeModalConfirmBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  removeModalConfirmText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.error },
  removeModalCancel: { alignItems: 'center', paddingVertical: spacing.sm },
  removeModalCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 15, color: colors.textMuted },
  removeModalOkBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  removeModalOkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  rackRemovalMsg: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  chefBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
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
