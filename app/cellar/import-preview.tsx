import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCellarImportStore, type ImportedWine } from '../../src/stores/cellarImportStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { formatCurrency } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';

function WineCard({ wine, index, onRemove }: { wine: ImportedWine; index: number; onRemove: () => void }) {
  const priceLine = wine.purchase_price != null
    ? `Paid ${formatCurrency(Number(wine.purchase_price), wine.currency, { decimals: 2 })}`
    : null;
  return (
    <View style={styles.card}>
      <View style={styles.cardMain}>
        <Text style={styles.cardName}>{wine.wine_name}</Text>
        {wine.producer !== wine.wine_name && (
          <Text style={styles.cardProducer}>{wine.producer}</Text>
        )}
        <Text style={styles.cardDetail}>
          {[wine.region, wine.vintage].filter(Boolean).join(' · ')}
          {wine.quantity > 1 ? ` · ${wine.quantity} bottles` : ''}
          {priceLine ? ` · ${priceLine}` : ''}
        </Text>
      </View>
      <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ImportPreviewScreen() {
  const { wines, removeWine, reset } = useCellarImportStore();
  const { addWine } = useCellar();
  const { session } = useAuth();
  const { preferences } = usePreferences();
  const [saving, setSaving] = useState(false);

  async function handleImportAll() {
    if (!session?.user.id) return;
    if (wines.length === 0) {
      Alert.alert('Nothing to import', 'All wines have been removed.');
      return;
    }
    setSaving(true);
    const fallbackCurrency = preferences?.defaultCurrency ?? 'GBP';
    try {
      await Promise.all(
        wines.map((w) =>
          addWine.mutateAsync({
            user_id: session.user.id,
            wine_name: w.wine_name,
            producer: w.producer,
            region: w.region,
            vintage: w.vintage ?? null,
            quantity: w.quantity,
            storage_location: null,
            date_received: new Date().toISOString().split('T')[0],
            critic_score: null,
            drinking_window_from: null,
            drinking_window_to: null,
            drinking_window_status: 'unknown',
            tasting_notes: null,
            grape_variety: null,
            label_image_path: null,
            purchase_price: w.purchase_price ?? null,
            purchase_price_currency: w.purchase_price != null ? (w.currency ?? fallbackCurrency) : null,
          } as any)
        )
      );
      reset();
      Alert.alert('Cellar updated', `${wines.length} wine${wines.length > 1 ? 's' : ''} added to your cellar.`, [
        { text: 'OK', onPress: () => router.replace('/cellar/list') },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save all wines. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (saving) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.savingText}>Adding {wines.length} wines to your cellar…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Import Preview</Text>
        <View style={{ width: 60 }} />
      </View>

      <Text style={styles.subtitle}>
        {wines.length} wine{wines.length !== 1 ? 's' : ''} found — remove any you don't want to import.
      </Text>

      <FlatList
        data={wines}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item, index }) => (
          <WineCard wine={item} index={index} onRemove={() => removeWine(index)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.importButton, wines.length === 0 && styles.importButtonDisabled]}
          onPress={handleImportAll}
          disabled={wines.length === 0}
        >
          <Text style={styles.importButtonText}>
            Add {wines.length} Wine{wines.length !== 1 ? 's' : ''} to Cellar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, gap: spacing.lg },
  savingText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center' },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 60 },
  title: { fontSize: 22, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1 },
  subtitle: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  cardMain: { flex: 1 },
  cardName: { fontSize: 17, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  cardProducer: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 1 },
  cardDetail: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', color: colors.gold, marginTop: 2 },
  removeBtn: { paddingLeft: spacing.md },
  removeText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: spacing.xl },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.xl, paddingBottom: 48, backgroundColor: colors.background },
  importButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  importButtonDisabled: { opacity: 0.4 },
  importButtonText: { color: '#FFFFFF', fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
});
