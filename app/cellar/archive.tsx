import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useArchive } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { showAlert } from '../../src/components/AppAlert';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { CellarWine } from '../../src/types/wine';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ArchiveCard({ wine, onPress, onLongPress }: { wine: CellarWine; onPress: () => void; onLongPress: () => void }) {
  // Header line follows the wine-card convention: producer · wine name ·
  // vintage, deduped when producer matches the wine name.
  const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
  const headerLine = (sameName
    ? [wine.producer, wine.vintage]
    : [wine.producer, wine.wine_name, wine.vintage]
  ).filter(Boolean).join(' · ');
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress} delayLongPress={400} activeOpacity={0.7}>
      <Text style={styles.headerLine} numberOfLines={2}>{headerLine}</Text>
      {wine.region ? <Text style={styles.region} numberOfLines={1}>{wine.region}</Text> : null}
      {wine.archived_at ? (
        <Text style={styles.archivedAt}>Removed {formatDate(wine.archived_at)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function CellarArchiveScreen() {
  const { session } = useAuth();
  const { wines, isLoading, deleteWine } = useArchive();
  const [search, setSearch] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = q
    ? wines.filter((w) => {
        const hay = [w.producer, w.wine_name, w.region, w.vintage]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q);
      })
    : wines;

  function handleLongPressWine(wine: CellarWine) {
    const sameName = wine.wine_name?.trim().toLowerCase() === wine.producer?.trim().toLowerCase();
    const label = (sameName
      ? [wine.producer, wine.vintage]
      : [wine.producer, wine.wine_name, wine.vintage]
    ).filter(Boolean).join(' · ');
    showAlert({
      title: 'Remove from archive?',
      body: `${label}\n\nThis permanently deletes the wine from your records.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteWine.mutate(wine.id, {
              onError: (err) => showAlert({ title: 'Could not remove', body: err instanceof Error ? err.message : 'Please try again.' }),
            });
          },
        },
      ],
    });
  }

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

      {!session ? (
        <ArchiveSignInPrompt
          title="Sign in to view your archive"
          body="Wines you archive from your cellar live here — sign in to access them."
        />
      ) : wines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archived wines</Text>
          <Text style={styles.emptyBody}>Wines you archive from your cellar will appear here with the date they were removed and the option to add a note for each removal.</Text>
        </View>
      ) : (
        <>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search archived wines"
            placeholderTextColor={colors.textMuted}
          />
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyBody}>No archived wines match your search.</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
              {filtered.map((wine) => (
                <ArchiveCard
                  key={wine.id}
                  wine={wine}
                  onPress={() => router.push(`/cellar/${wine.id}` as any)}
                  onLongPress={() => handleLongPressWine(wine)}
                />
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Inter — back/nav link
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 60 },
  // Cormorant — page header
  title: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 1, textAlign: 'center', flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  // Cormorant — empty-state header
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  // Inter — empty-state body
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  // Inter — form input
  searchInput: { marginHorizontal: spacing.xl, marginTop: spacing.md, marginBottom: spacing.xs, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: 'rgba(255,255,255,0.04)' },
  card: { marginHorizontal: spacing.xl, marginTop: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  // Inter — wine card name line (card content, not a page header)
  headerLine: { fontSize: 16, fontFamily: fonts.bodyBold, color: colors.text, lineHeight: 22 },
  // Inter — caption
  region: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 4 },
  // Inter — subtle small info
  archivedAt: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, marginTop: 4, letterSpacing: 0.3 },
});
