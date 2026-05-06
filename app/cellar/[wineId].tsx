import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRacks } from '../../src/hooks/useRacks';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useLabelStore } from '../../src/stores/labelStore';
import { generatePairings, getWineIntelligence } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine } from '../../src/api/racks';
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

export default function CellarWineDetail() {
  useKeepAwake();
  const { wineId } = useLocalSearchParams<{ wineId: string }>();
  const { session } = useAuth();
  const { wines, updateWine } = useCellar();
  const { racks } = useRacks();
  const { preferences } = usePreferences();
  const { setWineDetailsConfirmed, setPairings, setError } = useLabelStore();
  const qc = useQueryClient();
  const wine = wines.find((w) => w.id === wineId);

  const rackIds = racks.map((r) => r.id);
  const { data: slotAssignments = [] } = useQuery({
    queryKey: ['slot-assignments', rackIds],
    queryFn: () => getSlotAssignments(rackIds),
    enabled: rackIds.length > 0,
  });
  const wineSlot = slotAssignments.find((s) => s.cellar_wine_id === wineId);
  const wineRack = wineSlot ? racks.find((r) => r.id === wineSlot.rack_id) ?? null : null;

  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(wine?.quantity ?? 1));
  const [saving, setSaving] = useState(false);

  const [editingNote, setEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(wine?.user_notes ?? '');
  const [savingNote, setSavingNote] = useState(false);

  const [removeCount, setRemoveCount] = useState('1');
  const [removeDate, setRemoveDate] = useState(todayISO());
  const [removing, setRemoving] = useState(false);
  const [rackRemovalMsg, setRackRemovalMsg] = useState<string | null>(null);

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

  async function handleSave() {
    setSaving(true);
    try {
      await updateWine.mutateAsync({
        id: wine!.id,
        updates: { quantity: parseInt(quantity) || 1 },
      });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
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
      Alert.alert('Note Saved');
    } catch {
      Alert.alert('Error', 'Could not save note.');
    } finally {
      setSavingNote(false);
    }
  }

  async function handleRemoveBottles() {
    const count = parseInt(removeCount) || 0;
    if (count < 1) {
      Alert.alert('Invalid', 'Enter at least 1 bottle to remove.');
      return;
    }
    if (count > wine!.quantity) {
      Alert.alert('Invalid', `You only have ${wine!.quantity} bottle${wine!.quantity === 1 ? '' : 's'}.`);
      return;
    }

    const newQuantity = wine!.quantity - count;
    const removalNote = `${removeDate}: removed ${count} bottle${count === 1 ? '' : 's'}`;
    const updatedNotes = wine!.user_notes ? `${wine!.user_notes}\n${removalNote}` : removalNote;

    setRemoving(true);
    try {
      if (newQuantity === 0) {
        await updateWine.mutateAsync({
          id: wine!.id,
          updates: {
            quantity: 0,
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
        if (wineRack) {
          Alert.alert(
            'Removed from cellar',
            'This wine has also been removed from your live cellar rack.',
            [{ text: 'OK', onPress: () => router.back() }]
          );
        } else {
          router.back();
        }
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
      Alert.alert('Error', 'Could not record removal. Please try again.');
    } finally {
      setRemoving(false);
    }
  }

  async function handleSavePrice() {
    const trimmed = purchasePriceDraft.trim();
    const parsed = trimmed ? Number(trimmed) : null;
    if (trimmed && (parsed === null || Number.isNaN(parsed) || parsed < 0)) {
      Alert.alert('Invalid', 'Enter a positive number for the purchase price.');
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
      Alert.alert('Error', 'Could not save purchase price.');
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
        Alert.alert('Invalid score', 'Enter a score between 0 and 100.');
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
      Alert.alert('Could not save review', 'Please try again.');
    } finally {
      setSavingReview(false);
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
      Alert.alert('Could not refresh', 'Vinster couldn\'t generate an estimate right now. Please try again.');
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

      try {
        const raw = await AsyncStorage.getItem('vinster_chef_history');
        const history = raw ? JSON.parse(raw) : [];
        history.unshift({ id: Date.now().toString(), timestamp: new Date().toISOString(), wine: confirmed, pairings });
        await AsyncStorage.setItem('vinster_chef_history', JSON.stringify(history.slice(0, 30)));
      } catch { /* non-critical */ }

      router.push('/chef/results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      Alert.alert('Error', 'Could not generate pairings. Please try again.');
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.wineName}>{wine.wine_name || wine.producer}</Text>
        {wine.producer && wine.wine_name?.trim().toLowerCase() !== wine.producer?.trim().toLowerCase() && (
          <Text style={styles.producer}>{wine.producer}</Text>
        )}
        <Text style={styles.detail}>{[wine.region, wine.vintage].filter(Boolean).join(' · ')}</Text>
        {wine.grape_variety && <Text style={styles.grape}>{wine.grape_variety}</Text>}
      </View>

      {wine.critic_score !== null && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Critic Score</Text>
          <Text style={styles.infoValue}>{wine.critic_score}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Drinking Window</Text>
        <View>
          <Text style={[styles.infoValue, { color: windowColor }]}>{windowLabel}</Text>
          {wine.drinking_window_from && wine.drinking_window_to && (
            <Text style={styles.infoSub}>{wine.drinking_window_from}–{wine.drinking_window_to}</Text>
          )}
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Purchase Price</Text>
        {editingPrice ? (
          <View style={styles.priceEditRow}>
            <TextInput
              style={styles.priceInput}
              value={purchasePriceDraft}
              onChangeText={setPurchasePriceDraft}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.priceSaveBtn, savingPrice && { opacity: 0.5 }]}
              onPress={handleSavePrice}
              disabled={savingPrice}
            >
              <Text style={styles.priceSaveBtnText}>{savingPrice ? '…' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingPrice(false); setPurchasePriceDraft(wine.purchase_price != null ? String(wine.purchase_price) : ''); }}>
              <Text style={styles.priceCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setEditingPrice(true)} style={styles.priceDisplay}>
            <Text style={[styles.infoValue, wine.purchase_price == null && { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' }]}>
              {wine.purchase_price != null ? formatCurrency(Number(wine.purchase_price), wine.purchase_price_currency, { decimals: 2 }) : 'Tap to add'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Estimated Value</Text>
        <View style={styles.estimateDisplay}>
          {refreshingValue ? (
            <Text style={[styles.infoValue, { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' }]}>Estimating…</Text>
          ) : wine.estimated_value != null ? (
            <Text style={styles.infoValue}>{formatCurrency(Number(wine.estimated_value), wine.estimated_value_currency, { decimals: 0 })}</Text>
          ) : (
            <Text style={[styles.infoValue, { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular_Italic' }]}>—</Text>
          )}
          <TouchableOpacity onPress={handleRefreshEstimate} disabled={refreshingValue}>
            <Text style={styles.estimateRefreshLink}>{wine.estimated_value != null ? 'Refresh' : 'Get estimate'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {wine.tasting_notes && (
        <View style={styles.tastingBlock}>
          <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.chefBtn} onPress={handleFindPairings}>
        <Text style={styles.chefBtnText}>Chef, find me a food pairing for this wine</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Notes</Text>
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
          <Text style={styles.sectionTitle}>{wineRack ? `In my ${wineRack.name}` : 'In My Cellar'}</Text>
          <View style={styles.headerActions}>
            {wineRack && !editing && (
              <TouchableOpacity onPress={() => router.push(`/cellar/rack/${wineRack.id}`)}>
                <Text style={styles.editLink}>View in Rack →</Text>
              </TouchableOpacity>
            )}
            {!editing && (
              <TouchableOpacity onPress={() => setEditing(true)}>
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {editing ? (
          <>
            <Text style={styles.fieldLabel}>Number of bottles</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity style={[styles.button, saving && styles.buttonDisabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setEditing(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.bottlesRow}>
              <Text style={styles.infoLabel}>Bottles</Text>
              <Text style={styles.infoValue}>{wine.quantity}</Text>
            </View>

            <View style={styles.removeBlock}>
              <Text style={styles.removeHeading}>Remove Bottles</Text>

              <Text style={styles.fieldLabel}>Number of bottles to remove</Text>
              <TextInput
                style={styles.input}
                value={removeCount}
                onChangeText={setRemoveCount}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor={colors.textMuted}
              />

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
                onPress={handleRemoveBottles}
                disabled={removing}
              >
                <Text style={styles.removeBtnText}>{removing ? 'Removing…' : 'Remove from Cellar'}</Text>
              </TouchableOpacity>

              {rackRemovalMsg && (
                <Text style={styles.rackRemovalMsg}>{rackRemovalMsg}</Text>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  backRow: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  backText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  wineName: { fontSize: 26, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  producer: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginTop: spacing.xs },
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
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  noteText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 22 },
  noteInput: { minHeight: 90, textAlignVertical: 'top' },
  noteActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: spacing.md, marginTop: spacing.xs },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md },
  saveBtnText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  bottlesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm, marginBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  removeBlock: { paddingTop: spacing.sm },
  removeHeading: { fontSize: 15, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  removeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  removeBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  rackRemovalMsg: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginTop: spacing.md },
  chefBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, padding: spacing.md, alignItems: 'center', marginHorizontal: spacing.xl, marginTop: spacing.lg },
  chefBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  priceDisplay: { alignItems: 'flex-end' },
  priceEditRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  priceInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 6, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minWidth: 90, textAlign: 'right' },
  priceSaveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.sm },
  priceSaveBtnText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  priceCancelText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  estimateDisplay: { alignItems: 'flex-end' },
  estimateRefreshLink: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: 2 },
});
