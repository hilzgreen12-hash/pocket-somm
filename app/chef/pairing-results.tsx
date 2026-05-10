import { useState } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { useCellar } from '../../src/hooks/useCellar';
import { useAuth } from '../../src/hooks/useAuth';
import { useChefPairingHistory } from '../../src/hooks/useChefHistory';
import { addCellarWine, addCellarWineRemoval, updateCellarWine } from '../../src/api/cellar';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { colors, spacing } from '../../src/constants/theme';
import type { CellarWine } from '../../src/types/wine';

const RANK_LABELS = ['1st choice', '2nd choice', '3rd choice'];

function CellarResults({ recommendations, wines, onSelect }: {
  recommendations: CellarRecommendation[];
  wines: ReturnType<typeof useCellar>['wines'];
  onSelect: (wine: CellarWine, recName: string) => void;
}) {
  return (
    <>
      {recommendations.map((rec) => {
        const wine = wines.find((w) => w.id === rec.cellarWineId);
        const subtitleParts = [wine?.vintage, wine?.region].filter(Boolean);
        const subtitle = subtitleParts.length > 0 ? `From your cellar · ${subtitleParts.join(' · ')}` : 'From your cellar';
        return (
          <View key={rec.cellarWineId} style={styles.card}>
            <Text style={styles.cardWine}>{rec.wineName}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>
            <Text style={styles.cardBody}>{rec.rationale}</Text>

            <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Serving tip</Text>
            <Text style={styles.cardItem}>{rec.servingTip}</Text>

            <TouchableOpacity
              onPress={() => wine && onSelect(wine, rec.wineName)}
              activeOpacity={0.7}
              disabled={!wine}
            >
              <Text style={[styles.cardLink, !wine && styles.cardLinkMuted]}>
                {wine ? 'Select This Wine' : 'No longer in your cellar'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </>
  );
}

function GeneralResults({ results, summary }: { results: GeneralRecommendation[]; summary: string | null }) {
  return (
    <>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
      {results.map((result, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardWine}>{result.wineStyle}</Text>
          <Text style={styles.cardSubtitle}>{RANK_LABELS[i] ?? `Choice ${i + 1}`} · {result.region}</Text>
          <Text style={styles.cardBody}>{result.whyItWorks}</Text>

          <Text style={[styles.cardSection, { marginTop: spacing.md }]}>What to look for</Text>
          <Text style={styles.cardItem}>{result.characteristics}</Text>

          <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Price guide</Text>
          <Text style={styles.cardItem}>{result.priceGuide}</Text>

          {result.examples && result.examples.length > 0 && (
            <>
              <Text style={[styles.cardSection, { marginTop: spacing.md }]}>Examples to look for</Text>
              {result.examples.map((ex, j) => (
                <Text key={j} style={styles.cardItem}>· {ex}</Text>
              ))}
            </>
          )}
        </View>
      ))}
    </>
  );
}

export default function PairingResultsScreen() {
  const { fromHistory, savedAt, city } = useLocalSearchParams<{ fromHistory?: string; savedAt?: string; city?: string }>();
  const isFromHistory = fromHistory === 'true';
  const { dish, mode, cellarResult, generalResult, generalSummary } = useFoodPairingStore();
  const { wines } = useCellar();
  const { session } = useAuth();
  const qc = useQueryClient();
  const { save: savePairingSession } = useChefPairingHistory();
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>(isFromHistory ? 'saved' : 'idle');
  const [renderedAt] = useState(() => new Date().toISOString());

  // Selection modal — opens when the user taps "Select This Wine" on a
  // cellar recommendation. Lets them archive bottles without leaving the
  // results page.
  const [selecting, setSelecting] = useState<{ wine: CellarWine; recName: string } | null>(null);
  const [bottleCount, setBottleCount] = useState('1');
  const [archiving, setArchiving] = useState(false);
  const [archivedSuccess, setArchivedSuccess] = useState<{ count: number; recName: string } | null>(null);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);

  const stampDateSource = savedAt || renderedAt;
  const stampDate = stampDateSource
    ? new Date(stampDateSource).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;
  const stampLocation = (city ?? '').trim() || null;

  function handleBack() {
    // Don't reset — keep the latest search in memory so "View last result"
    // on the Chef tab can return the user to it within the same session.
    router.replace('/(tabs)/chef');
  }

  function openSelect(wine: CellarWine, recName: string) {
    setSelecting({ wine, recName });
    setBottleCount('1');
    setArchivedSuccess(null);
  }

  function closeSelect() {
    setSelecting(null);
    setBottleCount('1');
    setArchivedSuccess(null);
  }

  async function handleArchiveWine() {
    if (!selecting || !session?.user.id) return;
    const count = Math.max(1, parseInt(bottleCount, 10) || 0);
    const wine = selecting.wine;
    if (count > wine.quantity) {
      showAlert({ title: 'Not enough bottles', body: `You only have ${wine.quantity} ${wine.quantity === 1 ? 'bottle' : 'bottles'} of this wine in your cellar.` });
      return;
    }
    setArchiving(true);
    try {
      const removedAt = new Date().toISOString();
      await addCellarWineRemoval({
        cellarWineId: wine.id,
        removedAt,
        count,
        note: 'Selected for a Chef pairing',
      });

      if (count >= wine.quantity) {
        // Archive the row directly with the actual count removed so the
        // Bottles in My Archive stat sums correctly.
        await updateCellarWine(wine.id, {
          quantity: count,
          archived_at: removedAt,
        });
      } else {
        // Decrement the live row and clone an archived row carrying the
        // selected bottles so the user can edit/note them later.
        await updateCellarWine(wine.id, { quantity: wine.quantity - count });
        const { id, created_at, updated_at, ...rest } = wine;
        await addCellarWine({
          ...rest,
          quantity: count,
          archived_at: removedAt,
          is_wishlist: false,
        });
      }

      qc.invalidateQueries({ queryKey: ['cellar', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-archive', session.user.id] });
      qc.invalidateQueries({ queryKey: ['cellar-removals', wine.id] });
      qc.invalidateQueries({ queryKey: ['slot-assignments'] });
      qc.invalidateQueries({ queryKey: ['rack-slots'] });

      setArchivedSuccess({ count, recName: selecting.recName });
    } catch (err) {
      showAlert({ title: 'Could not archive', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setArchiving(false);
    }
  }

  async function handleSaveToArchive() {
    if (saveState !== 'idle' || !dish) return;
    if (!session) {
      setSignInPromptVisible(true);
      return;
    }
    setSaveState('saving');
    try {
      await savePairingSession.mutateAsync({
        dish,
        mode,
        cellarResult: mode === 'cellar' ? (cellarResult ?? null) : null,
        generalResult: mode === 'general' ? (generalResult ?? null) : null,
        generalSummary: mode === 'general' ? (generalSummary ?? null) : null,
      });
      setSaveState('saved');
    } catch (err) {
      setSaveState('idle');
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <TouchableOpacity onPress={handleBack} style={styles.backRow}>
        <Text style={styles.backLink}>Back</Text>
      </TouchableOpacity>

      {(stampDate || stampLocation) && (
        <View style={styles.stampRow}>
          {stampDate ? <Text style={styles.stampDate}>{stampDate}</Text> : null}
          {stampLocation ? <Text style={styles.stampLocation}>{stampLocation}</Text> : null}
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.headerLine}>Your Pairing</Text>
        <Text style={styles.dish}>{dish}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{mode === 'cellar' ? 'From Your Cellar' : 'Style Recommendations'}</Text>
        {mode === 'cellar' && cellarResult && (
          <CellarResults recommendations={cellarResult} wines={wines} onSelect={openSelect} />
        )}
        {mode === 'general' && generalResult && (
          <GeneralResults results={generalResult} summary={generalSummary} />
        )}
      </View>

      {!isFromHistory && (
        <TouchableOpacity
          style={[styles.saveButton, saveState !== 'idle' && styles.saveButtonDone]}
          onPress={handleSaveToArchive}
          disabled={saveState !== 'idle'}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {saveState === 'saved' ? 'Saved ✓' : saveState === 'saving' ? 'Saving…' : 'Save to Archive'}
          </Text>
        </TouchableOpacity>
      )}

      <Modal visible={selecting !== null} transparent animationType="fade" onRequestClose={closeSelect}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {selecting && archivedSuccess ? (
              <>
                <Text style={styles.successTick}>✓</Text>
                <Text style={styles.modalTitle}>This wine has been archived</Text>
                <Text style={styles.successCount}>
                  {archivedSuccess.count} {archivedSuccess.count === 1 ? 'bottle' : 'bottles'}
                </Text>
                <Text style={styles.modalBody}>
                  Your cellar and archive have been updated. You can edit this wine and add notes later from the archive.
                </Text>
                <TouchableOpacity style={styles.archiveBtn} onPress={closeSelect} activeOpacity={0.8}>
                  <Text style={styles.archiveBtnText}>Back to wine results</Text>
                </TouchableOpacity>
              </>
            ) : selecting ? (
              <>
                <Text style={styles.modalTitle}>{selecting.recName}</Text>
                <Text style={styles.modalBody}>
                  Archive this wine — you can edit it and add notes later.
                </Text>

                <Text style={styles.fieldLabel}>How many bottles?</Text>
                <TextInput
                  style={styles.input}
                  value={bottleCount}
                  onChangeText={setBottleCount}
                  keyboardType="number-pad"
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  maxLength={3}
                />
                <Text style={styles.fieldHint}>
                  {selecting.wine.quantity} in cellar
                </Text>

                <TouchableOpacity
                  style={[styles.archiveBtn, archiving && styles.btnDisabled]}
                  onPress={handleArchiveWine}
                  disabled={archiving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.archiveBtnText}>{archiving ? 'Archiving…' : 'Archive Wine'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryBtn} onPress={closeSelect}>
                  <Text style={styles.secondaryBtnText}>Back to wine results</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={closeSelect} style={styles.cancelLink}>
                  <Text style={styles.cancelLinkText}>Cancel selection</Text>
                </TouchableOpacity>
              </>
            ) : null}
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
  stampRow: { alignItems: 'center', gap: 2, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  stampDate: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold, textTransform: 'uppercase', letterSpacing: 1 },
  stampLocation: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  header: { padding: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerLine: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 0.5 },
  dish: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: spacing.xs },
  successTick: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 56, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  successCount: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.sm },
  section: { padding: spacing.xl },
  sectionTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.md },
  summary: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 20, marginBottom: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: 8, padding: spacing.md, marginBottom: spacing.md },
  cardWine: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  cardSubtitle: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, marginTop: 2 },
  cardBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: spacing.sm, lineHeight: 20 },
  cardSection: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.xs },
  cardItem: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 20, marginBottom: 4 },
  cardLink: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, marginTop: spacing.sm },
  cardLinkMuted: { color: colors.textMuted },
  saveButton: { marginHorizontal: spacing.xl, marginTop: spacing.md, borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center' },
  saveButtonDone: { backgroundColor: 'rgba(212,176,96,0.10)' },
  saveButtonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  modalSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  modalTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  modalBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  fieldLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, backgroundColor: colors.surface },
  fieldHint: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg, textAlign: 'right' },
  archiveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  archiveBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  btnDisabled: { opacity: 0.6 },
  secondaryBtn: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center', marginTop: spacing.sm },
  secondaryBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.text },
  cancelLink: { alignItems: 'center', paddingVertical: spacing.md },
  cancelLinkText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
});
