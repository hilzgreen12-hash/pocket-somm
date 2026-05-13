import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Keyboard } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useRackStore } from '../../src/stores/rackStore';
import { colors, spacing } from '../../src/constants/theme';

export default function AddWineScreen() {
  const { wines, addWine, updateWine } = useCellar();
  const { session } = useAuth();
  const { setPendingWineId } = useRackStore();

  const [wineName, setWineName] = useState('');
  const [producer, setProducer] = useState('');
  const [region, setRegion] = useState('');
  const [vintage, setVintage] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [saving, setSaving] = useState(false);

  function findMatchingExisting() {
    const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
    const wantedName = norm(wineName);
    const wantedProducer = norm(producer || wineName);
    const wantedVintage = vintage.trim();
    if (!wantedName) return null;
    return wines.find((w) =>
      norm(w.wine_name) === wantedName &&
      norm(w.producer) === wantedProducer &&
      (w.vintage ?? '').trim() === wantedVintage
    ) ?? null;
  }

  async function performNewEntry() {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      const saved = await addWine.mutateAsync({
        user_id: session.user.id,
        wine_name: wineName.trim(),
        producer: producer.trim() || null,
        region: region.trim() || null,
        vintage: vintage.trim() || null,
        quantity: parseInt(quantity) || 1,
        storage_location: null,
        date_received: new Date().toISOString().split('T')[0],
        critic_score: null,
        drinking_window_from: null,
        drinking_window_to: null,
        drinking_window_status: 'unknown',
        tasting_notes: null,
        grape_variety: null,
        label_image_path: null,
        user_notes: null,
      });
      showAlert({
        title: 'Added to cellar',
        body: 'Would you like to place this wine in a rack?',
        buttons: [
          {
            text: 'Add to Rack',
            onPress: () => {
              setPendingWineId(saved.id);
              router.replace('/cellar/racks');
            },
          },
          { text: 'View in cellar', onPress: () => router.replace('/cellar/list') },
          { text: 'Not now', style: 'cancel', onPress: () => router.back() },
        ],
      });
    } catch {
      showAlert({ title: 'Error', body: 'Could not save wine. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function performMerge(existingId: string, currentQty: number) {
    const addQty = parseInt(quantity) || 1;
    setSaving(true);
    try {
      await updateWine.mutateAsync({
        id: existingId,
        updates: { quantity: currentQty + addQty },
      });
      showAlert({
        title: 'Added to cellar',
        body: `Updated existing listing — you now have ${currentQty + addQty} bottle${currentQty + addQty === 1 ? '' : 's'}.`,
        buttons: [
          { text: 'OK', onPress: () => router.back() },
          { text: 'View in cellar', onPress: () => router.replace('/cellar/list') },
        ],
      });
    } catch {
      showAlert({ title: 'Error', body: 'Could not update listing. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    // Dismiss the keyboard explicitly so the iOS first-tap-eats-the-tap
    // bug can't strand the user on a focused TextInput.
    Keyboard.dismiss();
    if (!wineName.trim()) {
      showAlert({ title: 'Wine name required', body: 'Please enter a wine name.' });
      return;
    }
    if (!session?.user.id) return;

    const match = findMatchingExisting();
    if (match) {
      const existingQty = match.quantity;
      const wineLabel = `${match.wine_name}${match.vintage ? ` ${match.vintage}` : ''}`;
      showAlert({
        title: 'Already in your cellar',
        body: `You already have ${existingQty} bottle${existingQty === 1 ? '' : 's'} of ${wineLabel}. Add this bottle to that listing?`,
        buttons: [
          { text: 'Yes', onPress: () => performMerge(match.id, existingQty) },
          { text: 'No, create a new line', onPress: performNewEntry },
          { text: 'Cancel', style: 'cancel' },
        ],
      });
      return;
    }

    await performNewEntry();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Add a Wine</Text>
      <Text style={styles.subheading}>Scan a label for full details, or enter manually.</Text>

      <TouchableOpacity style={styles.scanButton} onPress={() => router.push('/label/camera')}>
        <Text style={styles.scanButtonText}>Scan Wine Label</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or enter manually</Text>
        <View style={styles.dividerLine} />
      </View>

      <Text style={styles.label}>Wine Name *</Text>
      <TextInput
        style={styles.input}
        value={wineName}
        onChangeText={setWineName}
        placeholder="e.g. Château Margaux"
        placeholderTextColor={colors.textMuted}
      />

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
        placeholder="e.g. Bordeaux, France"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Vintage</Text>
      <TextInput
        style={styles.input}
        value={vintage}
        onChangeText={setVintage}
        placeholder="e.g. 2018"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="1"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
      />

      <TouchableOpacity
        style={[styles.saveButton, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color={colors.gold} />
          : <Text style={styles.saveButtonText}>Save to Cellar</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60 },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginBottom: spacing.xl },
  heading: { fontSize: 30, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  subheading: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', marginBottom: spacing.xl },
  scanButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginBottom: spacing.xl },
  scanButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted },
  label: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.lg },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  saveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
});
