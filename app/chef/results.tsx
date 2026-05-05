import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { colors, spacing } from '../../src/constants/theme';
import type { Pairing } from '../../src/types/wine';

function PairingCard({ pairing }: { pairing: Pairing }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
        <Text style={styles.pairingNotes}>{pairing.pairingNotes}</Text>
        <Text style={styles.toggle}>{expanded ? 'Hide recipe' : 'Show recipe'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.recipe}>
          <Text style={styles.recipeIntro}>{pairing.introduction}</Text>
          <Text style={styles.recipeMeta}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>

          <Text style={styles.recipeSection}>Ingredients</Text>
          {pairing.recipe.ingredients.map((ing, i) => (
            <Text key={i} style={styles.recipeItem}>· {ing}</Text>
          ))}

          <Text style={[styles.recipeSection, { marginTop: spacing.md }]}>Method</Text>
          {pairing.recipe.instructions.map((step, i) => (
            <Text key={i} style={styles.recipeItem}>{step}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default function ChefResultsScreen() {
  const { wineDetailsConfirmed, pairings, reset } = useLabelStore();

  if (!wineDetailsConfirmed || pairings.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No pairings available.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)/chef')}>
          <Text style={styles.linkText}>Scan a label</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const wine = wineDetailsConfirmed;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.producer}>{wine.producer}</Text>
        {wine.wineName && <Text style={styles.wineName}>{wine.wineName}</Text>}
        <Text style={styles.detail}>{wine.region}{wine.vintage ? ` · ${wine.vintage}` : ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chef-Inspired Pairings</Text>
        {pairings.map((p, i) => <PairingCard key={i} pairing={p} />)}
      </View>

      <TouchableOpacity style={styles.scanAgain} onPress={() => { reset(); router.replace('/(tabs)/chef'); }}>
        <Text style={styles.scanAgainText}>Scan Another Label</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  backLink: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  producer: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  wineName: { fontSize: 18, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, marginTop: 2 },
  detail: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.xs },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  dishName: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  chefInspiration: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: 2 },
  pairingNotes: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  toggle: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.sm },
  recipe: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  recipeIntro: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  recipeMeta: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  recipeSection: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  recipeItem: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 20, marginBottom: 4 },
  scanAgain: { margin: spacing.xl, alignItems: 'center' },
  scanAgainText: { color: colors.textMuted, fontFamily: 'CormorantGaramond_400Regular', fontSize: 14 },
});
