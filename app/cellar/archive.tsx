import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useArchive } from '../../src/hooks/useCellar';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ArchiveCard({ wine, onPress }: { wine: CellarWine; onPress: () => void }) {
  // Header line follows the wine-card convention: producer · wine name ·
  // vintage, deduped when producer matches the wine name.
  const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
  const headerLine = (sameName
    ? [wine.producer, wine.vintage]
    : [wine.producer, wine.wine_name, wine.vintage]
  ).filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.headerLine} numberOfLines={2}>{headerLine}</Text>
      {wine.region ? <Text style={styles.region} numberOfLines={1}>{wine.region}</Text> : null}
      {wine.archived_at ? (
        <Text style={styles.archivedAt}>Removed {formatDate(wine.archived_at)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function CellarArchiveScreen() {
  const { wines, isLoading } = useArchive();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Archived Wines</Text>
        <View style={{ width: 40 }} />
      </View>

      {wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archived wines</Text>
          <Text style={styles.emptyBody}>Wines you archive from your cellar will appear here with the date they were removed and the option to add a note for each removal.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {wines.map((wine) => (
            <ArchiveCard key={wine.id} wine={wine} onPress={() => router.push(`/cellar/${wine.id}` as any)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, width: 60 },
  title: { fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  headerLine: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, lineHeight: 22 },
  region: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 4 },
  archivedAt: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: 4, letterSpacing: 0.3 },
});
