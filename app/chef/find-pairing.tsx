import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SearchProgress } from '../../src/components/SearchProgress';
import { SignInPromptModal } from '../../src/components/SignInPromptModal';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useCellar } from '../../src/hooks/useCellar';
import { usePreferences } from '../../src/hooks/usePreferences';
import { useAuth } from '../../src/hooks/useAuth';
import { findFoodWinePairing } from '../../src/api/label';
import { useFoodPairingStore, type CellarRecommendation, type GeneralRecommendation } from '../../src/stores/foodPairingStore';
import { colors, spacing } from '../../src/constants/theme';

export default function FindPairingScreen() {
  useKeepAwake();
  const { session } = useAuth();
  const { wines } = useCellar();
  const { preferences: savedPreferences } = usePreferences();
  const { setCellarResult, setGeneralResult, setDish, setMode } = useFoodPairingStore();

  const [dish, setDishLocal] = useState('');
  const [flavours, setFlavours] = useState('');
  const [stylePreference, setStylePreference] = useState<string | null>(null);
  const [mode, setModeLocal] = useState<'cellar' | 'general'>('cellar');
  const [loading, setLoading] = useState(false);
  const [signInPromptVisible, setSignInPromptVisible] = useState(false);
  const [signInPromptShown, setSignInPromptShown] = useState(false);
  const pendingFindRef = useRef(false);

  async function handleFind(skipPrompt = false) {
    if (!dish.trim()) {
      Alert.alert('What are you cooking?', 'Please describe your dish first.');
      return;
    }
    if (mode === 'cellar' && wines.length === 0) {
      Alert.alert('Empty cellar', 'Your cellar is empty. Switch to "Suggest a Style" to get a general recommendation.');
      return;
    }

    if (!session && !signInPromptShown && !skipPrompt) {
      setSignInPromptShown(true);
      pendingFindRef.current = true;
      setSignInPromptVisible(true);
      return;
    }

    setLoading(true);
    const baseDish = flavours.trim() ? `${dish.trim()}. Key flavours/ingredients: ${flavours.trim()}` : dish.trim();
    const fullDish = stylePreference ? `${baseDish}. Wine colour/style preference: ${stylePreference}` : baseDish;
    setDish(fullDish);
    setMode(mode);

    try {
      const cellarSummary = wines.map((w) => ({
        id: w.id,
        wine_name: w.wine_name,
        producer: w.producer,
        region: w.region,
        vintage: w.vintage,
        grape_variety: w.grape_variety,
        drinking_window_status: w.drinking_window_status,
      }));

      const result = await findFoodWinePairing(fullDish, mode, mode === 'cellar' ? cellarSummary : undefined, undefined, mode === 'general' && savedPreferences ? (savedPreferences as unknown as Record<string, unknown>) : null) as any;

      if (mode === 'cellar') {
        setCellarResult(result.recommendations as CellarRecommendation[]);
      } else {
        setGeneralResult(result.recommendations as GeneralRecommendation[], result.summary);
      }

      router.push('/chef/pairing-results');
    } catch {
      Alert.alert('Error', 'Could not find a pairing. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <SearchProgress
        title="Finding your perfect pairing…"
        subtitle="Vinster needs up to a minute for your result"
        body={mode === 'cellar'
          ? 'Our sommelier is searching your cellar for the ideal match'
          : 'Our sommelier is selecting the perfect wine style for your dish'}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Text style={styles.back}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Find a Wine Pairing</Text>
      <Text style={styles.subheading}>Tell us what you're cooking and we'll find the perfect wine.</Text>

      <Text style={styles.profileNote}>
        Vinster will use your wine profile settings to guide its results.{' '}
        <Text style={styles.profileNoteLink} onPress={() => router.push('/profile/recipe')}>Update profile settings</Text>
      </Text>

      <Text style={styles.label}>What are you cooking?</Text>
      <TextInput
        style={styles.input}
        value={dish}
        onChangeText={setDishLocal}
        placeholder="e.g. Roast leg of lamb with rosemary and garlic"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Any strong flavours or ingredients?</Text>
      <TextInput
        style={styles.input}
        value={flavours}
        onChangeText={setFlavours}
        placeholder="e.g. Truffle, anchovies, chilli, lemon"
        placeholderTextColor={colors.textMuted}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <Text style={styles.label}>Where should Vinster look?</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'cellar' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('cellar')}
        >
          <Text style={[styles.toggleText, mode === 'cellar' && styles.toggleTextActive]}>From My Cellar</Text>
          {wines.length > 0 && <Text style={[styles.toggleSub, mode === 'cellar' && styles.toggleSubActive]}>{wines.length} bottles</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, mode === 'general' && styles.toggleBtnActive]}
          onPress={() => setModeLocal('general')}
        >
          <Text style={[styles.toggleText, mode === 'general' && styles.toggleTextActive]}>Suggest a Style</Text>
          <Text style={[styles.toggleSub, mode === 'general' && styles.toggleSubActive]}>To go and buy</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Any specific style preference?</Text>
      <View style={styles.styleGrid}>
        {['Any', 'White', 'Red', 'Rosé', 'Sparkling', 'Fortified'].map((s) => {
          const val = s === 'Any' ? null : s;
          const active = stylePreference === val;
          return (
            <TouchableOpacity
              key={s}
              style={[styles.styleBtn, active && styles.styleBtnActive]}
              onPress={() => setStylePreference(val)}
            >
              <Text style={[styles.styleBtnText, active && styles.styleBtnTextActive]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.button} onPress={() => handleFind()}>
        <Text style={styles.buttonText}>Find Pairing</Text>
      </TouchableOpacity>

      <SignInPromptModal
        visible={signInPromptVisible}
        onDismiss={() => { setSignInPromptVisible(false); pendingFindRef.current = false; }}
        onSignIn={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-in'); }}
        onCreateAccount={() => { setSignInPromptVisible(false); router.push('/(auth)/sign-up'); }}
        onContinue={() => { setSignInPromptVisible(false); handleFind(true); }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  loadingBrand: { fontSize: 36, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xxl },
  loadingTitle: { fontSize: 20, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  loadingTiming: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  loadingBody: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  loadingStay: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textAlign: 'center', opacity: 0.8 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: 80, paddingBottom: 60, alignItems: 'center' },
  backRow: { alignSelf: 'flex-start', marginBottom: spacing.xl },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  heading: { fontSize: 30, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, marginBottom: spacing.sm, textAlign: 'center' },
  subheading: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 22, marginBottom: spacing.xl, textAlign: 'center' },
  profileNote: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  profileNoteLink: { fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textDecorationLine: 'underline' },
  label: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 17, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 90, marginBottom: spacing.xl, width: '100%', textAlign: 'center' },
  difficultyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl, width: '100%' },
  difficultyBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 8, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, alignItems: 'center', width: '48.5%' },
  difficultyBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  difficultyBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.textMuted },
  difficultyBtnTextActive: { color: colors.gold },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl, width: '100%' },
  toggleBtn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, alignItems: 'center' },
  toggleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.08)' },
  toggleText: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted },
  toggleTextActive: { color: colors.gold },
  toggleSub: { fontSize: 12, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted, marginTop: 2 },
  toggleSubActive: { color: colors.gold },
  styleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.xl, width: '100%', justifyContent: 'center' },
  styleBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingVertical: spacing.xs, paddingHorizontal: spacing.md },
  styleBtnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.10)' },
  styleBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.textMuted },
  styleBtnTextActive: { color: colors.gold },
  button: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', width: '100%' },
  buttonText: { color: colors.gold, fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 17 },
});
