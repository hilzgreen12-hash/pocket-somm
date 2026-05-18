import { useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../src/constants/theme';

// Vinster is a wine app — both App Store and Play Store require a neutral
// age gate before users can access the content. We capture a date of birth
// (not a yes/no) and only let the user proceed when they're 18 or older
// (the UK legal drinking age the founder is based in).
//
// Result is persisted to AsyncStorage so the gate only ever appears once
// per device install. A re-install will re-prompt, which both stores allow.

export const AGE_GATE_KEY = 'vinster_age_verified_at';
export const MIN_AGE_YEARS = 18;

function ageInYears(dobIso: string, now: Date = new Date()): number {
  const dob = new Date(dobIso + 'T00:00:00');
  let years = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years -= 1;
  return years;
}

function pad2(s: string) {
  return s.padStart(2, '0');
}

export default function AgeGateScreen() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [rejected, setRejected] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Auto-advance focus when each field hits its expected width so the
  // input feels like a single date control rather than three separate
  // boxes the user has to tab through.
  function onDayChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(cleaned);
    if (cleaned.length === 2) monthRef.current?.focus();
  }
  function onMonthChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(cleaned);
    if (cleaned.length === 2) yearRef.current?.focus();
  }
  function onYearChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(cleaned);
  }

  function validateDob(): { ok: true; iso: string; age: number } | { ok: false; reason: string } {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!Number.isFinite(d) || !Number.isFinite(m) || !Number.isFinite(y)) {
      return { ok: false, reason: 'Please enter your full date of birth.' };
    }
    if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) {
      return { ok: false, reason: 'That doesn\'t look like a valid date.' };
    }
    const iso = `${y}-${pad2(String(m))}-${pad2(String(d))}`;
    // Re-parse to catch impossible dates like 31 Feb.
    const parsed = new Date(iso + 'T00:00:00');
    if (parsed.getFullYear() !== y || parsed.getMonth() !== m - 1 || parsed.getDate() !== d) {
      return { ok: false, reason: 'That doesn\'t look like a valid date.' };
    }
    return { ok: true, iso, age: ageInYears(iso) };
  }

  async function handleContinue() {
    if (submitting) return;
    const result = validateDob();
    if (!result.ok) {
      setRejected(false);
      return;
    }
    if (result.age < MIN_AGE_YEARS) {
      setRejected(true);
      return;
    }
    setSubmitting(true);
    try {
      // Store the verification timestamp + the DOB so future features (e.g.
      // birthday wishes, age-adjusted recommendations) can use it without
      // re-prompting. The actual gate decision only cares that the key is
      // present, but recording the value is cheap and useful.
      await AsyncStorage.setItem(AGE_GATE_KEY, JSON.stringify({ verifiedAt: new Date().toISOString(), dob: result.iso }));
      router.replace('/');
    } catch {
      // AsyncStorage failure is exceptionally rare; let the user retry.
      setSubmitting(false);
    }
  }

  const dobLooksFilled = day.length > 0 && month.length > 0 && year.length === 4;

  if (rejected) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.brand}>VINSTER</Text>
          <View style={styles.rule} />
          <Text style={styles.heading}>You must be {MIN_AGE_YEARS} or older to use Vinster</Text>
          <Text style={styles.body}>
            Vinster is a wine app and is intended only for adults of legal drinking age.
          </Text>
          <Text style={styles.body}>
            If you've entered your date of birth incorrectly, you can try again.
          </Text>
          <TouchableOpacity style={styles.tryAgainBtn} onPress={() => { setRejected(false); setDay(''); setMonth(''); setYear(''); }}>
            <Text style={styles.tryAgainText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.brand}>VINSTER</Text>
        <View style={styles.rule} />
        <Text style={styles.heading}>Confirm your age</Text>
        <Text style={styles.body}>
          Vinster is for over-{MIN_AGE_YEARS}s only. Please enter your date of birth to continue.
        </Text>

        <View style={styles.dobRow}>
          <View style={styles.dobField}>
            <Text style={styles.dobLabel}>Day</Text>
            <TextInput
              style={styles.dobInput}
              value={day}
              onChangeText={onDayChange}
              placeholder="DD"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
            />
          </View>
          <View style={styles.dobField}>
            <Text style={styles.dobLabel}>Month</Text>
            <TextInput
              ref={monthRef}
              style={styles.dobInput}
              value={month}
              onChangeText={onMonthChange}
              placeholder="MM"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
          <View style={[styles.dobField, { flex: 1.5 }]}>
            <Text style={styles.dobLabel}>Year</Text>
            <TextInput
              ref={yearRef}
              style={styles.dobInput}
              value={year}
              onChangeText={onYearChange}
              placeholder="YYYY"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, (!dobLooksFilled || submitting) && { opacity: 0.4 }]}
          onPress={handleContinue}
          disabled={!dobLooksFilled || submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.continueBtnText}>{submitting ? 'Saving…' : 'Continue'}</Text>
        </TouchableOpacity>

        <Text style={styles.legalNote}>
          By continuing you confirm you are of legal drinking age in your country. Vinster does not promote excessive drinking and asks users to drink responsibly.
        </Text>

        <TouchableOpacity onPress={() => router.push('/legal/privacy')} style={styles.privacyLink}>
          <Text style={styles.privacyLinkText}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: 100, paddingBottom: spacing.xxl, alignItems: 'center' },
  brand: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 38, color: '#FFFFFF', letterSpacing: 8, marginBottom: spacing.sm },
  rule: { width: 80, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', marginBottom: spacing.lg },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 28, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.md, paddingHorizontal: spacing.sm },
  body: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.text, textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  dobRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.xl, alignSelf: 'stretch' },
  dobField: { flex: 1 },
  dobLabel: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 11, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, textAlign: 'center' },
  dobInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, fontSize: 20, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, backgroundColor: colors.surface, textAlign: 'center' },
  continueBtn: { alignSelf: 'stretch', borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, alignItems: 'center' },
  continueBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold, letterSpacing: 0.5 },
  legalNote: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, textAlign: 'center', lineHeight: 19, marginTop: spacing.lg, paddingHorizontal: spacing.sm },
  privacyLink: { marginTop: spacing.md, paddingVertical: spacing.sm },
  privacyLinkText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold, textDecorationLine: 'underline', letterSpacing: 0.5 },
  tryAgainBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.md, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  tryAgainText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
});
