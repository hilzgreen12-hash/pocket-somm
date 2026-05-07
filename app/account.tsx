import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator, Switch, Modal } from 'react-native';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';
import { usePreferences } from '../src/hooks/usePreferences';
import { supabase } from '../src/api/supabase';
import { CURRENCIES } from '../src/constants/currency';
import { colors, spacing } from '../src/constants/theme';

function formatJoinedDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AccountScreen() {
  const { session } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const [emailChangeOpen, setEmailChangeOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [usernameOpen, setUsernameOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameSaving, setUsernameSaving] = useState(false);

  const currentUsername = session?.user.user_metadata?.display_name ?? '—';
  const [notifyWindow, setNotifyWindow] = useState<boolean>(
    session?.user.user_metadata?.notify_drinking_window ?? false
  );
  const [notifyDecline, setNotifyDecline] = useState<boolean>(
    session?.user.user_metadata?.notify_decline ?? false
  );
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currentCurrency = preferences?.defaultCurrency ?? 'GBP';
  const currentCurrencyLabel = CURRENCIES.find((c) => c.code === currentCurrency)?.label ?? currentCurrency;

  async function updateNotifySetting(key: string, value: boolean) {
    await supabase.auth.updateUser({ data: { [key]: value } });
  }

  function toggleEmailChange() {
    setEmailChangeOpen((v) => !v);
    setNewEmail('');
  }

  function toggleUsernameChange() {
    setUsernameOpen((v) => !v);
    setNewUsername(currentUsername);
  }

  async function handleEmailChange() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    const redirectTo = Linking.createURL('auth/callback');
    const { error } = await supabase.auth.updateUser(
      { email: newEmail.trim() },
      { emailRedirectTo: redirectTo },
    );
    setEmailSaving(false);
    if (error) {
      Alert.alert('Unable to update email', error.message);
    } else {
      setEmailChangeOpen(false);
      setNewEmail('');
      Alert.alert('Check both inboxes', 'Confirmation links have been sent to your current and new email address. Tap both links to complete the change.');
    }
  }

  async function handleUsernameChange() {
    if (!newUsername.trim()) return;
    setUsernameSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: newUsername.trim() },
    });
    setUsernameSaving(false);
    if (error) {
      Alert.alert('Unable to update username', error.message);
    } else {
      setUsernameOpen(false);
      setNewUsername('');
    }
  }

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Could not sign out', error.message);
      return;
    }
    router.replace('/(auth)/sign-in');
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data including your cellar, preferences and chosen wines. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.functions.invoke('delete-account');
            if (error) {
              Alert.alert('Error', 'Could not delete your account. Please try again or contact support.');
            } else {
              await supabase.auth.signOut();
              router.replace('/(auth)/sign-in');
            }
          },
        },
      ],
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Account</Text>

      {/* Username */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Username</Text>
        <Text style={styles.valueText}>{currentUsername}</Text>
        {!usernameOpen ? (
          <TouchableOpacity onPress={toggleUsernameChange} style={styles.changeButton}>
            <Text style={styles.changeLink}>Change username</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.changeWrap}>
            <TextInput
              style={styles.input}
              placeholder="New username"
              placeholderTextColor={colors.textMuted}
              value={newUsername}
              onChangeText={setNewUsername}
              autoCapitalize="words"
              autoFocus
            />
            <View style={styles.changeRow}>
              <TouchableOpacity onPress={toggleUsernameChange}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleUsernameChange} disabled={usernameSaving}>
                {usernameSaving
                  ? <ActivityIndicator color={colors.background} size="small" />
                  : <Text style={styles.confirmButtonText}>Save</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Email */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Email</Text>
        <Text style={styles.valueText}>{session?.user.email}</Text>
        {!emailChangeOpen ? (
          <TouchableOpacity onPress={toggleEmailChange} style={styles.changeButton}>
            <Text style={styles.changeLink}>Change email address</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.changeWrap}>
            <TextInput
              style={styles.input}
              placeholder="New email address"
              placeholderTextColor={colors.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoFocus
            />
            <View style={styles.changeRow}>
              <TouchableOpacity onPress={toggleEmailChange}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleEmailChange} disabled={emailSaving}>
                {emailSaving
                  ? <ActivityIndicator color={colors.background} size="small" />
                  : <Text style={styles.confirmButtonText}>Confirm</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Email preferences live with Email since they are email notifications */}
        <View style={styles.emailPrefsBlock}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email me when my wines are approaching their drinking windows</Text>
            <Switch
              value={notifyWindow}
              onValueChange={(v) => {
                setNotifyWindow(v);
                updateNotifySetting('notify_drinking_window', v);
              }}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingDivider} />

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Email me when my wines are approaching decline</Text>
            <Switch
              value={notifyDecline}
              onValueChange={(v) => {
                setNotifyDecline(v);
                updateNotifySetting('notify_decline', v);
              }}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Date Joined */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date joined</Text>
        <Text style={styles.valueText}>{formatJoinedDate(session?.user.created_at)}</Text>
      </View>

      <View style={styles.divider} />

      {/* Currency */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Currency</Text>
        <Text style={styles.currencyHint}>Used throughout your cellar, prices, and budget. Change it any time — useful when you're travelling.</Text>
        <TouchableOpacity style={styles.currencyDropdown} onPress={() => setCurrencyOpen(true)} activeOpacity={0.7}>
          <Text style={styles.currencyDropdownText}>{currentCurrencyLabel}</Text>
          <Text style={styles.currencyDropdownArrow}>▾</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Early access message */}
      <View style={styles.section}>
        <Text style={styles.earlyAccessText}>You're one of the first 10,000 users — thank you for being here! Your subscription is on us.</Text>
      </View>

      <View style={styles.divider} />

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() =>
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
          ])
        }
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <Modal visible={currencyOpen} transparent animationType="fade" onRequestClose={() => setCurrencyOpen(false)}>
        <TouchableOpacity style={styles.currencyOverlay} activeOpacity={1} onPress={() => setCurrencyOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.currencySheet} onPress={() => {}}>
            <Text style={styles.currencySheetTitle}>Choose currency</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {CURRENCIES.map((c) => {
                const active = currentCurrency === c.code;
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[styles.currencyOption, active && styles.currencyOptionActive]}
                    onPress={() => {
                      updatePreferences({ defaultCurrency: c.code });
                      setCurrencyOpen(false);
                    }}
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

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 80, paddingHorizontal: spacing.xl, paddingBottom: 80 },
  backButton: { marginBottom: spacing.xl },
  backText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 16, color: colors.textMuted },
  heading: { fontSize: 42, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, letterSpacing: 1.5, marginBottom: spacing.xxl },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  valueText: { fontSize: 18, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, marginBottom: spacing.sm },
  changeButton: { marginTop: spacing.xs },
  changeLink: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', color: '#FFFFFF', textDecorationLine: 'underline' },
  changeWrap: { marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.md, marginBottom: spacing.sm, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface },
  changeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md },
  cancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  confirmButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, minWidth: 80, alignItems: 'center' },
  confirmButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.gold },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  earlyAccessText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, lineHeight: 26 },
  signOutButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginBottom: spacing.md },
  signOutText: { color: colors.gold, fontSize: 16, fontFamily: 'CormorantGaramond_600SemiBold' },
  deleteButton: { alignItems: 'center', paddingVertical: spacing.sm },
  deleteText: { color: colors.error, fontSize: 14, fontFamily: 'CormorantGaramond_400Regular', textDecorationLine: 'underline' },
  settingsHeading: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.lg },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 22 },
  settingDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  currencyHint: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 18 },
  currencyDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.md, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  currencyDropdownText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.text },
  currencyDropdownArrow: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.gold, marginLeft: spacing.sm },
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
  emailPrefsBlock: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
});
