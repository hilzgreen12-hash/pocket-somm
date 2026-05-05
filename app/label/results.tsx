import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { useCellar, useWishList } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { assignSlot } from '../../src/api/racks';
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
  const { wineDetailsConfirmed, intelligence, reset } = useLabelStore();
  const { session } = useAuth();
  const { addWine } = useCellar();
  const { addWine: addToWishList } = useWishList();
  const { pendingSlot, setPendingSlot } = useRackStore();

  const [addingToCellar, setAddingToCellar] = useState(false);
  const [addingToWishList, setAddingToWishList] = useState(false);
  const [quantity, setQuantity] = useState('1');
  const [storageLocation, setStorageLocation] = useState('');
  const [orientation, setOrientation] = useState<'Vertical' | 'Horizontal'>('Vertical');
  const [saving, setSaving] = useState(false);

  if (!wineDetailsConfirmed || !intelligence) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No results available.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/label')}>
          <Text style={styles.linkText}>Scan a label</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wine = wineDetailsConfirmed;
  const intel = intelligence;

  function buildWinePayload(userId: string) {
    return {
      user_id: userId,
      wine_name: wine.wineName ?? wine.producer,
      producer: wine.producer,
      region: wine.region,
      vintage: wine.vintage,
      quantity: parseInt(quantity) || 1,
      storage_location: pendingSlot ? orientation : (storageLocation.trim() || null),
      date_received: new Date().toISOString().split('T')[0],
      critic_score: intel.criticScore,
      drinking_window_from: intel.drinkingWindowFrom,
      drinking_window_to: intel.drinkingWindowTo,
      drinking_window_status: intel.drinkingWindowStatus,
      tasting_notes: intel.tastingNotes,
      grape_variety: intel.grapeVariety,
      label_image_path: null,
      user_notes: null,
      is_wishlist: false,
    };
  }

  async function handleAddToWishList() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await addToWishList.mutateAsync({ ...buildWinePayload(session.user.id), is_wishlist: true });
      setAddingToWishList(false);
      Alert.alert('Added to Wish List', `${wine.wineName ?? wine.producer} has been saved to your wish list.`);
    } catch {
      Alert.alert('Error', 'Could not save to wish list. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleAddToCellar() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const saved = await addWine.mutateAsync(buildWinePayload(session.user.id));

      if (pendingSlot) {
        await assignSlot(pendingSlot.rackId, pendingSlot.row, pendingSlot.col, saved.id);
        setPendingSlot(null);
        setAddingToCellar(false);
        reset();
        router.replace(`/cellar/rack/${pendingSlot.rackId}`);
        return;
      }

      setAddingToCellar(false);
      Alert.alert('Added to cellar', `${wine.wineName ?? wine.producer} has been saved.`);
    } catch (err) {
      Alert.alert('Error', 'Could not save to cellar. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.header}>
        <Text style={styles.producer}>{wine.producer}</Text>
        {wine.wineName && <Text style={styles.wineName}>{wine.wineName}</Text>}
        <Text style={styles.detail}>{wine.region} · {wine.vintage}</Text>
        {intel.grapeVariety && <Text style={styles.grape}>{intel.grapeVariety}</Text>}
      </View>

      {intel.criticScore !== null && (
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>Critic Score</Text>
          <Text style={styles.score}>{intel.criticScore}</Text>
        </View>
      )}

      <DrinkingWindowBadge
        status={intel.drinkingWindowStatus}
        from={intel.drinkingWindowFrom}
        to={intel.drinkingWindowTo}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasting Notes</Text>
        <Text style={styles.tastingNotes}>{intel.tastingNotes}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setAddingToCellar(true)}>
          <Text style={styles.actionButtonText}>Add to Cellar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => setAddingToWishList(true)}>
          <Text style={styles.actionButtonText}>Add to Wish List</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.scanAgainButton} onPress={() => { reset(); router.replace('/(tabs)/label'); }}>
        <Text style={styles.scanAgainText}>Scan Another Label</Text>
      </TouchableOpacity>

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

            <Text style={styles.modalLabel}>How many bottles of this wine?</Text>
            <TextInput
              style={styles.modalInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="1"
              placeholderTextColor={colors.textMuted}
            />

            {pendingSlot ? (
              <>
                <Text style={styles.modalLabel}>Storage orientation</Text>
                <View style={styles.orientationRow}>
                  <TouchableOpacity
                    style={[styles.orientationBtn, orientation === 'Vertical' && styles.orientationBtnActive]}
                    onPress={() => setOrientation('Vertical')}
                  >
                    <Text style={[styles.orientationText, orientation === 'Vertical' && styles.orientationTextActive]}>Store Vertically</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.orientationBtn, orientation === 'Horizontal' && styles.orientationBtnActive]}
                    onPress={() => setOrientation('Horizontal')}
                  >
                    <Text style={[styles.orientationText, orientation === 'Horizontal' && styles.orientationTextActive]}>Store Horizontally</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalLabel}>Storage location (optional)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={storageLocation}
                  onChangeText={setStorageLocation}
                  placeholder="e.g. Rack A, Shelf 2"
                  placeholderTextColor={colors.textMuted}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.button, saving && styles.buttonDisabled]}
              onPress={handleAddToCellar}
              disabled={saving}
            >
              <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save to Cellar'}</Text>
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
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  producer: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, marginTop: 2 },
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
  tastingNotes: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.xl },
  actionButton: { flex: 1, borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, textAlign: 'center' },
  scanAgainButton: { margin: spacing.xl, alignItems: 'center' },
  scanAgainText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: spacing.xl, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.xs },
  modalWine: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.lg },
  modalLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.background },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  orientationRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  orientationBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  orientationBtnActive: { borderColor: colors.gold, backgroundColor: colors.gold + '22' },
  orientationText: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  orientationTextActive: { color: colors.gold },
});
