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
  const currentUsername = session?.user.user_metadata?.display_name ?? '';
  const currentEmail = session?.user.email ?? '';

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState(currentUsername);
  const [emailDraft, setEmailDraft] = useState(currentEmail);
  const [savingIdentity, setSavingIdentity] = useState(false);

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

  function openIdentityEdit() {
    setUsernameDraft(currentUsername);
    setEmailDraft(currentEmail);
    setEditingIdentity(true);
  }

  function cancelIdentityEdit() {
    setUsernameDraft(currentUsername);
    setEmailDraft(currentEmail);
    setEditingIdentity(false);
  }

  async function handleIdentitySave() {
    const usernameTrim = usernameDraft.trim();
    const emailTrim = emailDraft.trim();
    const usernameChanged = usernameTrim !== (currentUsername ?? '').trim() && usernameTrim.length > 0;
    const emailChanged = emailTrim !== currentEmail.trim() && emailTrim.length > 0;
    if (!usernameChanged && !emailChanged) {
      setEditingIdentity(false);
      return;
    }
    setSavingIdentity(true);
    try {
      if (usernameChanged) {
        const { error } = await supabase.auth.updateUser({ data: { display_name: usernameTrim } });
        if (error) throw new Error(`username: ${error.message}`);
      }
      if (emailChanged) {
        const redirectTo = Linking.createURL('auth/callback');
        const { error } = await supabase.auth.updateUser(
          { email: emailTrim },
          { emailRedirectTo: redirectTo },
        );
        if (error) throw new Error(`email: ${error.message}`);
        Alert.alert(
          'Check both inboxes',
          'Confirmation links have been sent to your current and new email address. Tap both links to complete the change.'
        );
      }
      setEditingIdentity(false);
    } catch (err) {
      Alert.alert('Could not save', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSavingIdentity(false);
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

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function handleDeleteAccount() {
    setDeleteConfirmOpen(true);
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) {
        Alert.alert('Error', 'Could not delete your account. Please try again or contact support.');
        return;
      }
      await supabase.auth.signOut();
      router.replace('/(auth)/sign-in');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Account</Text>

      <Text style={styles.thanks}>You're one of the first 10,000 users — thank you for being here. Your subscription is on us.</Text>

      <View style={styles.divider} />

      <View style={styles.block}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Date joined</Text>
          <Text style={styles.rowValue}>{formatJoinedDate(session?.user.created_at)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Username</Text>
          <Text style={styles.rowValue}>{currentUsername || '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Email</Text>
          <Text style={[styles.rowValue, styles.rowValueSmall]} numberOfLines={1}>{currentEmail}</Text>
        </View>
        {!editingIdentity ? (
          <TouchableOpacity onPress={openIdentityEdit} style={styles.editLinkBtn}>
            <Text style={styles.editLinkText}>Edit username or email</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.editPanel}>
            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput
              style={styles.input}
              value={usernameDraft}
              onChangeText={setUsernameDraft}
              placeholder="Username"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
            />
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={emailDraft}
              onChangeText={setEmailDraft}
              placeholder="you@example.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={cancelIdentityEdit}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleIdentitySave} disabled={savingIdentity}>
                {savingIdentity
                  ? <ActivityIndicator color={colors.gold} size="small" />
                  : <Text style={styles.saveBtnText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <Text style={styles.blockHeading}>Email preferences</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>When wines approach their drinking window</Text>
          <Switch
            value={notifyWindow}
            onValueChange={(v) => { setNotifyWindow(v); updateNotifySetting('notify_drinking_window', v); }}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>When wines are approaching decline</Text>
          <Switch
            value={notifyDecline}
            onValueChange={(v) => { setNotifyDecline(v); updateNotifySetting('notify_decline', v); }}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Currency</Text>
          <TouchableOpacity onPress={() => setCurrencyOpen(true)} activeOpacity={0.7}>
            <Text style={styles.rowValueLink}>{currentCurrencyLabel} ▾</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {!session && (
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={() => router.push('/(auth)/sign-in')}
        >
          <Text style={styles.signOutText}>Sign In</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.signOutButton, !session && { marginTop: spacing.sm }]}
        onPress={() =>
          Alert.alert('Sign Out', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: handleSignOut },
          ])
        }
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      <Modal visible={deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => !deleting && setDeleteConfirmOpen(false)}>
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={() => !deleting && setDeleteConfirmOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Delete account?</Text>
            <Text style={styles.confirmBody}>
              This will permanently delete your account and all your data — cellar, preferences, reviews, personality sketches, everything. There's no undo.
            </Text>
            <TouchableOpacity
              style={[styles.confirmDangerBtn, deleting && styles.confirmDangerBtnDisabled]}
              onPress={confirmDelete}
              disabled={deleting}
            >
              <Text style={styles.confirmDangerBtnText}>{deleting ? 'Deleting…' : 'Delete permanently'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDeleteConfirmOpen(false)} style={styles.confirmCancel} disabled={deleting}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
  content: { paddingTop: 64, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  backButton: { marginBottom: spacing.sm, alignSelf: 'flex-start' },
  backText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  heading: { fontSize: 32, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.sm },
  thanks: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.gold, textAlign: 'center', lineHeight: 20, paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  block: { gap: 4 },
  blockHeading: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.text, textAlign: 'right', flexShrink: 1, marginLeft: spacing.md },
  rowValueSmall: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular' },
  rowValueLink: { fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  editLinkBtn: { alignSelf: 'flex-end', marginTop: 2 },
  editLinkText: { fontSize: 13, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold },
  editPanel: { marginTop: spacing.sm, gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, marginBottom: 4 },
  editActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md, marginTop: 4 },
  cancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 13, color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md, minWidth: 70, alignItems: 'center' },
  saveBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 13, color: colors.gold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4 },
  toggleLabel: { flex: 1, fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: '#FFFFFF', lineHeight: 18 },
  signOutButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: spacing.xs, marginBottom: 6 },
  signOutText: { color: colors.gold, fontSize: 15, fontFamily: 'CormorantGaramond_600SemiBold' },
  deleteButton: { alignItems: 'center', paddingVertical: 4 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  confirmTitle: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  confirmBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  confirmDangerBtn: { borderWidth: 1, borderColor: colors.error, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmDangerBtnDisabled: { opacity: 0.5 },
  confirmDangerBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.error },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  confirmCancelText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 14, color: colors.textMuted },
  deleteText: { color: colors.error, fontSize: 13, fontFamily: 'CormorantGaramond_400Regular', textDecorationLine: 'underline' },
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
