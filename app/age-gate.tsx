import { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing } from '../src/constants/theme';

// Vinster is a wine app — both App Store and Play Store require a neutral
// age gate before users can access the content. We capture a date of birth
// (not a yes/no) and only let the user proceed when they're 18 or older
// (the UK legal drinking age the founder is based in).
//
// Two AsyncStorage keys are used:
//   AGE_GATE_KEY      — set when the user passes the gate; cleared only
//                        by reinstalling the app.
//   AGE_GATE_BLOCKED_KEY — set when the user enters an under-18 DOB;
//                        persists across launches so a kill-and-relaunch
//                        with a different date can't bypass the gate
//                        (App Store Review Guideline 1.4.3).

export const AGE_GATE_KEY = 'vinster_age_verified_at';
export const AGE_GATE_BLOCKED_KEY = 'vinster_age_blocked_at';
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
  // null = still checking storage; once loaded we know whether to show
  // the DOB form or the persisted-blocked screen.
  const [storageLoaded, setStorageLoaded] = useState(false);
  // Inline validation error (e.g. "31 Feb isn't a real date"). Was
  // computed but never shown previously — that left the Continue button
  // silently no-op'ing on impossible dates.
  const [validationError, setValidationError] = useState<string | null>(null);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  useEffect(() => {
    // Check whether this device has been blocked on a previous run. If
    // so, render the rejection screen straight away — no DOB re-entry.
    AsyncStorage.getItem(AGE_GATE_BLOCKED_KEY)
      .then((blocked) => {
        if (blocked) setRejected(true);
      })
      .finally(() => setStorageLoaded(true));
  }, []);

  // Auto-advance focus when each field hits its expected width so the
  // input feels like a single date control rather than three separate
  // boxes the user has to tab through. Each onChange clears any prior
  // validation error so the user isn't stuck staring at a stale message.
  function onDayChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setDay(cleaned);
    if (validationError) setValidationError(null);
    if (cleaned.length === 2) monthRef.current?.focus();
  }
  function onMonthChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setMonth(cleaned);
    if (validationError) setValidationError(null);
    if (cleaned.length === 2) yearRef.current?.focus();
  }
  function onYearChange(text: string) {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
    setYear(cleaned);
    if (validationError) setValidationError(null);
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
      // Surface the validation reason so the user knows why nothing's
      // happening — previously the handler silently no-op'd.
      setValidationError(result.reason);
      return;
    }
    if (result.age < MIN_AGE_YEARS) {
      // Persist the block so a kill-and-relaunch can't bypass the gate
      // by re-entering a different DOB. Apple/Google reviewers test this.
      try {
        await AsyncStorage.setItem(
          AGE_GATE_BLOCKED_KEY,
          JSON.stringify({ blockedAt: new Date().toISOString() }),
        );
      } catch {
        // Even if storage fails, still show the rejection in-memory for
        // this session. The next launch may not block — but the AsyncStorage
        // surface is reliable enough that this is acceptable degradation.
      }
      setRejected(true);
      return;
    }
    setSubmitting(true);
    try {
      // Only the verification timestamp is stored — the DOB itself is PII
      // we don't need to keep on disk after the gate decision is made.
      await AsyncStorage.setItem(AGE_GATE_KEY, JSON.stringify({ verifiedAt: new Date().toISOString() }));
      router.replace('/');
    } catch {
      // AsyncStorage failure is exceptionally rare; let the user retry.
      setSubmitting(false);
    }
  }

  // Require fully-padded day/month so single-digit "1/1/2000" can't slip
  // past the form validation — that was the only path to reach the
  // silent-no-op branch on invalid dates.
  const dobLooksFilled = day.length === 2 && month.length === 2 && year.length === 4;

  if (!storageLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      </View>
    );
  }

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
          {/* No "Try again" path — App Store Review Guideline 1.4.3 requires
              the rejection to persist on the device. A user who genuinely
              mistyped will need to reinstall the app to retry. */}
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

        {validationError ? (
          <Text style={styles.validationError}>{validationError}</Text>
        ) : null}

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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  validationError: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.error, textAlign: 'center', marginBottom: spacing.md, marginTop: -spacing.md },
});
