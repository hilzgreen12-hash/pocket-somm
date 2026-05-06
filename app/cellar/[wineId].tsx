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
import { generatePairings } from '../../src/api/label';
import { getSlotAssignments, clearWineFromRacks, removeSlotsForWine } from '../../src/api/racks';
import { SearchProgress } from '../../src/components/SearchProgress';
import { colors, spacing } from '../../src/constants/theme';
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
        dietary: (preferences?.dietaryPreference as any) ?? null,
        allergens: (preferences?.allergens as any) ?? [],
        customAllergen: (preferences?.customAllergen as any) ?? '',
        dietaryNote: null,
        difficulty: null,
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
});
