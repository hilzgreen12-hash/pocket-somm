import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { router, useLocalSearchParams } from 'expo-router';
import { useLabelStore } from '../../src/stores/labelStore';
import { useCellar } from '../../src/hooks/useCellar';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../../src/api/cellar';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { SearchProgress } from '../../src/components/SearchProgress';
import { generatePairings } from '../../src/api/label';
import { colors, spacing } from '../../src/constants/theme';
import type { Pairing, CellarWine, WineDetailsComplete } from '../../src/types/wine';

function PairingCard({
  pairing,
  saveState,
  onSave,
  isFromHistory,
}: {
  pairing: Pairing;
  saveState: 'idle' | 'saving' | 'saved';
  onSave: () => void;
  isFromHistory: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setExpanded((v) => !v)} activeOpacity={0.8}>
        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
        <Text style={styles.pairingNotes}>{pairing.pairingNotes}</Text>
        <Text style={styles.toggle}>{expanded ? 'Hide Recipe' : 'View Recipe'}</Text>
      </TouchableOpacity>

      {/* Quick-save sits just under the View Recipe toggle so the user can
          save without expanding the full recipe. Saved recipes land in the
          Recipe Archive as Unfiled (no folder assignment, not starred). */}
      {!isFromHistory && (
        saveState === 'saved' ? (
          <View style={styles.cardSavedBlock}>
            <Text style={styles.cardSavedLabel}>Saved</Text>
            <TouchableOpacity onPress={() => router.push('/chef/archive')} activeOpacity={0.7}>
              <Text style={styles.cardViewArchiveLink}>View in Recipe Archive</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.cardSaveButton, saveState === 'saving' && styles.cardSaveButtonDisabled]}
            onPress={onSave}
            disabled={saveState === 'saving'}
            activeOpacity={0.8}
          >
            <Text style={styles.cardSaveButtonText}>
              {saveState === 'saving' ? 'Saving…' : 'Quick Save Recipe'}
            </Text>
          </TouchableOpacity>
        )
      )}

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

function findCellarMatch(wines: CellarWine[], wine: WineDetailsComplete): CellarWine | null {
  const norm = (s: string | null | undefined) => (s ?? '').trim().toLowerCase();
  const producer = norm(wine.producer);
  const vintage = norm(wine.vintage);
  const wineName = norm(wine.wineName);
  if (!producer) return null;

  // Strongest match: producer + wine name + vintage all align
  let match = wines.find((w) =>
    norm(w.producer) === producer &&
    norm(w.vintage) === vintage &&
    norm(w.wine_name) === wineName,
  );
  if (match) return match;

  // Drop wine name (label wine name is often null/empty)
  match = wines.find((w) =>
    norm(w.producer) === producer &&
    norm(w.vintage) === vintage,
  );
  if (match) return match;

  // Producer-only fallback (shouldn't happen often)
  return wines.find((w) => norm(w.producer) === producer) ?? null;
}

export default function ChefResultsScreen() {
  const { fromHistory, savedAt, city, from, wineId } = useLocalSearchParams<{ fromHistory?: string; savedAt?: string; city?: string; from?: string; wineId?: string }>();
  const isFromHistory = fromHistory === 'true';
  const isFromCellar = from === 'cellar' && !!wineId;
  const { wineDetailsConfirmed, pairings, filters, reset, setPairings, setError } = useLabelStore();
  const { wines: cellarWines } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { save: saveLabelSession } = useChefLabelHistory();
  const [archiving, setArchiving] = useState(false);
  const [archivedModalOpen, setArchivedModalOpen] = useState(false);
  // Per-pairing save state — the user can save each recipe individually
  // to their archive. Indexed by pairing position (0/1/2).
  const [pairingSaveStates, setPairingSaveStates] = useState<Record<number, 'idle' | 'saving' | 'saved'>>({});
  const [renderedAt] = useState(() => new Date().toISOString());
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleRegenerate() {
    if (!wineDetailsConfirmed || regenerating) return;
    setRegenerating(true);
    try {
      const fresh = await generatePairings(wineDetailsConfirmed, (filters ?? {}) as any);
      setPairings(fresh);
      setSaveState('idle');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate pairings');
      showAlert({ title: 'Could not regenerate', body: 'Please try again in a moment.' });
    } finally {
      setRegenerating(false);
    }
  }

  const stampDateSource = savedAt || renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampLocation = (city ?? '').trim() || null;

  const cellarMatch = useMemo(
    () => (wineDetailsConfirmed ? findCellarMatch(cellarWines, wineDetailsConfirmed) : null),
    [cellarWines, wineDetailsConfirmed],
  );

  async function handleSavePairing(index: number) {
    const pairing = pairings[index];
    if (!wineDetailsConfirmed || !pairing) return;
    if (pairingSaveStates[index] && pairingSaveStates[index] !== 'idle') return;
    if (!session) {
      setSignInPromptVisible(true);
      return;
    }
    setPairingSaveStates((s) => ({ ...s, [index]: 'saving' }));
    try {
      await saveLabelSession.mutateAsync({
        wine: wineDetailsConfirmed,
        filters: filters ?? null,
        // Save just this one pairing as its own archive entry, so each
        // recipe lives independently in the archive (can be starred,
        // foldered, deleted on its own).
        pairings: [pairing],
      });
      setPairingSaveStates((s) => ({ ...s, [index]: 'saved' }));
    } catch (err) {
      setPairingSaveStates((s) => ({ ...s, [index]: 'idle' }));
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

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
  const headerLine = wineHeaderLine(wine.producer, wine.wineName, wine.vintage);

  async function handleRemoveFromCellar() {
    if (!cellarMatch || !session?.user.id) return;
    setArchiving(true);
    try {
      const removedAt = new Date().toISOString();
      await addCellarWineRemoval({
        cellarWineId: cellarMatch.id,
        removedAt,
        count: 1,
        note: 'Archived from Chef pairing',
      });

      if (cellarMatch.quantity <= 1) {
        // Last bottle — archive the existing row directly.
        await updateCellarWine(cellarMatch.id, {
          quantity: 0,
          archived_at: removedAt,
        });
      } else {
        // Multiple bottles — decrement the live cellar row by one and clone
        // a separate archived row carrying the single removed bottle so the
        // user can edit its quantity in the archived area later.
        await updateCellarWine(cellarMatch.id, { quantity: cellarMatch.quantity - 1 });
        const { id, created_at, updated_at, ...rest } = cellarMatch;
        await addCellarWine({
          ...rest,
          quantity: 1,
          archived_at: removedAt,
          is_wishlist: false,
        });
      }

      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-removals', cellarMatch.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });

      setArchivedModalOpen(true);
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setArchiving(false);
    }
  }

  if (regenerating) {
    return (
      <SearchProgress
        title="Crafting your pairings…"
        subtitle="Vinster needs up to a minute for your result"
        body="A fresh set of three chef-inspired dishes coming up"
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity
        onPress={() => router.replace(isFromCellar ? `/cellar/${wineId}` as any : '/(tabs)/chef')}
        style={styles.backRow}
      >
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      {(stampDate || stampLocation) && (
        <View style={styles.stampRow}>
          {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
          {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerLine}>{headerLine}</Text>
        {wine.region ? <Text style={styles.region}>{wine.region}</Text> : null}

        {cellarMatch && (
          <TouchableOpacity
            style={[styles.removeBtn, archiving && styles.removeBtnDisabled]}
            onPress={handleRemoveFromCellar}
            disabled={archiving}
            activeOpacity={0.8}
          >
            <Text style={styles.removeBtnText}>{archiving ? 'Archiving…' : 'Remove This Wine From My Cellar'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chef-Inspired Pairings</Text>
        {pairings.map((p, i) => (
          <PairingCard
            key={i}
            pairing={p}
            saveState={pairingSaveStates[i] ?? 'idle'}
            onSave={() => handleSavePairing(i)}
            isFromHistory={isFromHistory}
          />
        ))}
      </View>

      {!isFromHistory && (
        <TouchableOpacity style={styles.regenLink} onPress={handleRegenerate} disabled={regenerating}>
          <Text style={styles.regenLinkText}>Not quite — generate another set of recipes</Text>
        </TouchableOpacity>
      )}

      <Modal visible={archivedModalOpen} transparent animationType="fade" onRequestClose={() => setArchivedModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Wine has been Archived</Text>
            <Text style={styles.modalBody}>
              One bottle has been moved to your cellar archive. You can update the quantity in the archived wines area if you removed more than one.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setArchivedModalOpen(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => setSignInPromptVisible(false)}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => setSignInPromptVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backRow: { paddingHorizontal: spacing.xl, paddingTop: 56, paddingBottom: spacing.sm },
  backLink: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  stampRow: { alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: 2 },
  stampDate: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  errorText: { color: colors.text, fontFamily: 'CormorantGaramond_400Regular', fontSize: 16 },
  linkText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, marginTop: spacing.md },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.5 },
  region: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: spacing.xs },
  removeBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', marginTop: spacing.md, alignSelf: 'flex-start' },
  removeBtnDisabled: { opacity: 0.6 },
  removeBtnText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14 },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  dishName: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  chefInspiration: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: 2 },
  pairingNotes: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  toggle: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.sm },
  recipe: { marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  cardSaveButton: { marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  cardSaveButtonDisabled: { opacity: 0.6 },
  cardSaveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, letterSpacing: 0.3 },
  cardSavedBlock: { alignItems: 'center', marginTop: spacing.md, gap: 4 },
  cardSavedLabel: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, letterSpacing: 0.5 },
  cardViewArchiveLink: { color: colors.gold, fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, textDecorationLine: 'underline' },
  recipeIntro: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  recipeMeta: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  recipeSection: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  recipeItem: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 20, marginBottom: 4 },
  regenLink: { alignItems: 'center', paddingVertical: spacing.md, marginHorizontal: spacing.xl, marginTop: spacing.sm },
  regenLinkText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.gold, textDecorationLine: 'underline', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, marginBottom: spacing.lg },
  modalButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  modalButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
});
