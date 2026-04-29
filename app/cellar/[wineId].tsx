import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';

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
  const { wineId } = useLocalSearchParams<{ wineId: string }>();
  const { wines, updateWine, deleteWine } = useCellar();
  const wine = wines.find((w) => w.id === wineId);

  const [editing, setEditing] = useState(false);
  const [quantity, setQuantity] = useState(String(wine?.quantity ?? 1));
  const [location, setLocation] = useState(wine?.storage_location ?? '');
  const [saving, setSaving] = useState(false);

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
        updates: {
          quantity: parseInt(quantity) || 1,
          storage_location: location.trim() || null,
        },
      });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Remove from cellar',
      `Remove ${wine!.wine_name} from your cellar?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            await deleteWine.mutateAsync(wine!.id);
            router.back();
          },
        },
      ]
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
        <Text style={styles.producer}>{wine.producer}</Text>
        <Text style={styles.wineName}>{wine.wine_name}</Text>
        <Text style={styles.detail}>{wine.region} · {wine.vintage ?? '—'}</Text>
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
        <Text style={styles.infoLabel}>Date Received</Text>
        <Text style={styles.infoValue}>{wine.date_received ?? '—'}</Text>
      </View>

      {wine.tasting_notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tasting Notes</Text>
          <Text style={styles.tastingNotes}>{wine.tasting_notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>In My Cellar</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editLink}>Edit</Text>
            </TouchableOpacity>
          )}
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
            <Text style={styles.fieldLabel}>Storage location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Rack A, Shelf 2"
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bottles</Text>
              <Text style={styles.infoValue}>{wine.quantity}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{wine.storage_location ?? '—'}</Text>
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Remove from Cellar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.burgundy, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  backRow: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  backText: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.burgundy },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  producer: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  wineName: { fontSize: 26, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.xs },
  grape: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginTop: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  infoLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'right' },
  infoSub: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'right', marginTop: 2 },
  section: { padding: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 17, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  editLink: { fontSize: 14, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.burgundy },
  tastingNotes: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22 },
  fieldLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  button: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  cancelButton: { alignItems: 'center', marginTop: spacing.md },
  cancelText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
  deleteButton: { margin: spacing.xl, alignItems: 'center' },
  deleteText: { color: colors.error, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14 },
});
