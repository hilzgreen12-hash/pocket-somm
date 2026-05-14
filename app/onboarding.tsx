import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  Switch, Modal, Keyboard, LayoutAnimation, Platform, UIManager,
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { showAlert } from '../src/components/AppAlert';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';
import { supabase } from '../src/api/supabase';
import { ChipPicker } from '../src/components/preferences/ChipPicker';
import { WINE_REGIONS } from '../src/constants/wineRegions';
import { GRAPE_VARIETIES } from '../src/constants/grapeVarieties';
import { CURRENCIES } from '../src/constants/currency';
import { colors, spacing } from '../src/constants/theme';

// Split lists so the combined picker can route each selection back to
// its own profile column (dietary_needs / allergy_risks).
const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Pescatarian'];
const ALLERGEN_OPTIONS = ['Nut Free', 'Dairy Free', 'Gluten Free'];
const DIETARY_AND_ALLERGEN_OPTIONS = [...DIETARY_OPTIONS, ...ALLERGEN_OPTIONS];

function Accordion({ title, summary, open, onToggle, children }: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.7} style={styles.accordionRow}>
        <View style={styles.accordionLeft}>
          <Text style={styles.question}>{title}</Text>
          {!open && <Text style={styles.selectionSummary} numberOfLines={1}>{summary}</Text>}
        </View>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </TouchableOpacity>
      {open && <View style={styles.pickerWrap}>{children}</View>}
    </View>
  );
}

export default function OnboardingScreen() {
  const { session } = useAuth();
  const { preferences, updatePreferencesAsync } = usePreferences();
  const qc = useQueryClient();

  const [username, setUsername] = useState((session?.user.user_metadata?.display_name ?? '').trim());
  const [currency, setCurrency] = useState(preferences?.defaultCurrency ?? 'GBP');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [disRegions, setDisRegions] = useState<string[]>(preferences?.dislikedRegions ?? []);
  const [disGrapes, setDisGrapes] = useState<string[]>(preferences?.dislikedGrapes ?? []);
  // One combined picker for dietary needs + allergens; split on save.
  const [dietary, setDietary] = useState<string[]>([
    ...(preferences?.dietaryNeeds ?? []),
    ...(preferences?.allergyRisks ?? []),
  ]);
  const [concerns, setConcerns] = useState(preferences?.specificConcerns ?? '');
  const [notifyWindow, setNotifyWindow] = useState<boolean>(
    session?.user.user_metadata?.notify_drinking_window ?? false,
  );
  const [notifyDecline, setNotifyDecline] = useState<boolean>(
    session?.user.user_metadata?.notify_decline ?? false,
  );

  const [regionalOpen, setRegionalOpen] = useState(false);
  const [varietalOpen, setVarietalOpen] = useState(false);
  const [dietaryOpen, setDietaryOpen] = useState(false);
  const [concernsOpen, setConcernsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  function summary(values: string[], none: string) {
    return values.length > 0 ? `${values.length} selected` : none;
  }

  const currencyLabel = CURRENCIES.find((c) => c.code === currency)?.label ?? currency;

  async function handleFinish() {
    if (saving) return;
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      showAlert({ title: 'Add your username', body: 'Vinster needs a name to greet you by.' });
      return;
    }
    Keyboard.dismiss();
    setSaving(true);
    try {
      // Username + email preferences live on the auth user; everything
      // else (and the onboarding_completed flag) lives on the profile.
      // Auth update goes first so a failure leaves onboarding_completed
      // unset and the user retries the whole page.
      const { error: authErr } = await supabase.auth.updateUser({
        data: {
          display_name: trimmedUsername,
          notify_drinking_window: notifyWindow,
          notify_decline: notifyDecline,
        },
      });
      if (authErr) throw new Error(authErr.message);

      await updatePreferencesAsync({
        defaultCurrency: currency,
        dislikedRegions: disRegions,
        dislikedGrapes: disGrapes,
        dietaryNeeds: dietary.filter((x) => DIETARY_OPTIONS.includes(x)),
        allergyRisks: dietary.filter((x) => ALLERGEN_OPTIONS.includes(x)),
        specificConcerns: concerns.trim(),
        onboardingCompleted: true,
      });

      qc.invalidateQueries({ queryKey: ['onboarding-complete'] });
      qc.invalidateQueries({ queryKey: ['preferences'] });
      router.replace('/home');
    } catch (err) {
      showAlert({ title: 'Could not finish setup', body: err instanceof Error ? err.message : 'Please try again.' });
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 80, paddingBottom: 60 }}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.intro}>
          <Text style={styles.brand}>Vinster</Text>
          <Text style={styles.introBody}>Let's get you set up — you can change any of this later in About You.</Text>
          <Text style={styles.thanks}>You're one of the first 10,000 users — thank you for being here. Your subscription is on us.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Currency</Text>
          <TouchableOpacity style={styles.selectRow} onPress={() => setCurrencyOpen(true)} activeOpacity={0.7}>
            <Text style={styles.selectValue}>{currencyLabel}</Text>
            <Text style={styles.selectChevron}>▾</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subheading}>Wine Preferences</Text>
        <Text style={styles.subheadingHint}>Hard rules — Vinster will never recommend these. Everything else you tune per search.</Text>

        <Accordion
          title="Regional Dislikes"
          summary={summary(disRegions, 'None')}
          open={regionalOpen}
          onToggle={() => toggle(setRegionalOpen)}
        >
          <Text style={styles.pickerHint}>Select up to 5 — Vinster will never recommend these.</Text>
          <ChipPicker options={WINE_REGIONS} selected={disRegions} onChange={setDisRegions} max={5} />
        </Accordion>

        <Accordion
          title="Varietal Dislikes"
          summary={summary(disGrapes, 'None')}
          open={varietalOpen}
          onToggle={() => toggle(setVarietalOpen)}
        >
          <Text style={styles.pickerHint}>Select up to 5 — Vinster will never recommend these.</Text>
          <ChipPicker options={GRAPE_VARIETIES} selected={disGrapes} onChange={setDisGrapes} max={5} />
        </Accordion>

        <Text style={styles.subheading}>Recipe Requirements</Text>
        <Text style={styles.subheadingHint}>Hard rules Vinster always respects for recipes and pairings.</Text>

        <Accordion
          title="Dietary Needs & Allergens"
          summary={summary(dietary, 'None')}
          open={dietaryOpen}
          onToggle={() => toggle(setDietaryOpen)}
        >
          <Text style={styles.pickerHint}>Vinster will never include these in a recipe or pairing.</Text>
          <ChipPicker options={DIETARY_AND_ALLERGEN_OPTIONS} selected={dietary} onChange={setDietary} />
        </Accordion>

        <Accordion
          title="Specific Requirements"
          summary={concerns.trim() || 'None'}
          open={concernsOpen}
          onToggle={() => toggle(setConcernsOpen)}
        >
          <Text style={styles.pickerHint}>Anything else Vinster must avoid (e.g. raw fish, very spicy food). Treated as a hard rule.</Text>
          <TextInput
            style={styles.concernsInput}
            value={concerns}
            onChangeText={setConcerns}
            placeholder="Type any specific requirements…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </Accordion>

        <Text style={styles.subheading}>Email Preferences</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>When wines approach their drinking window</Text>
          <Switch
            value={notifyWindow}
            onValueChange={setNotifyWindow}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>When wines are approaching decline</Text>
          <Switch
            value={notifyDecline}
            onValueChange={setNotifyDecline}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>

        <TouchableOpacity
          style={[styles.finishButton, saving && styles.finishButtonDisabled]}
          onPress={handleFinish}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Text style={styles.finishButtonText}>{saving ? 'Saving…' : 'Finish'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={currencyOpen} transparent animationType="fade" onRequestClose={() => setCurrencyOpen(false)}>
        <TouchableOpacity style={styles.currencyOverlay} activeOpacity={1} onPress={() => setCurrencyOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.currencySheet} onPress={() => {}}>
            <Text style={styles.currencySheetTitle}>Choose currency</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {CURRENCIES.map((c) => {
                const active = currency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyOption, active && styles.currencyOptionActive]}
                    onPress={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.currencyOptionText, active && styles.currencyOptionTextActive]}>{c.label}</Text>
                    {active && <Text style={styles.currencyCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.currencyClose} onPress={() => setCurrencyOpen(false)}>
              <Text style={styles.currencyCloseText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  intro: { alignItems: 'center', marginBottom: spacing.lg, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 40, color: '#FFFFFF', letterSpacing: 2, marginBottom: spacing.xs },
  introBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.md },
  thanks: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 17, color: colors.gold, textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.sm },
  section: { marginBottom: spacing.md },
  sectionLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  selectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.surface },
  selectValue: { fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text },
  selectChevron: { fontSize: 14, color: colors.gold },
  subheading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, letterSpacing: 0.3, marginTop: spacing.md, marginBottom: 2 },
  subheadingHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, lineHeight: 19, marginBottom: spacing.sm },
  // Accordion chrome mirrors app/profile/wine.tsx so the look carries
  // across the profile/onboarding surfaces.
  accordionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: 4 },
  accordionLeft: { flex: 1, alignItems: 'center' },
  chevron: { fontSize: 14, color: '#FFFFFF', marginLeft: spacing.sm },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: '#FFFFFF', textAlign: 'center' },
  selectionSummary: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: '#FFFFFF', marginTop: 2, textAlign: 'center' },
  pickerWrap: { marginTop: spacing.sm, paddingHorizontal: spacing.xs },
  pickerHint: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, marginBottom: spacing.sm },
  concernsInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4, marginBottom: 4 },
  toggleLabel: { flex: 1, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 20 },
  finishButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.lg },
  finishButtonDisabled: { opacity: 0.6 },
  finishButtonText: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 17, color: colors.gold, letterSpacing: 0.5 },
  currencyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  currencySheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 420, padding: spacing.lg },
  currencySheetTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  currencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  currencyOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  currencyOptionText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.text },
  currencyOptionTextActive: { fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  currencyCheck: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 18, color: colors.gold },
  currencyClose: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs },
  currencyCloseText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 15, color: colors.textMuted },
});
