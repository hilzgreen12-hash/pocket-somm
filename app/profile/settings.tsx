import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Switch, Modal, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { showAlert } from '../../src/components/AppAlert';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { supabase } from '../../src/api/supabase';
import { CURRENCIES } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Your Settings — account controls moved off the About You tab: currency, email,
// username, and email preferences (all editable here).
export default function SettingsScreen() {
  const { session } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const currentUsername = session?.user.user_metadata?.display_name ?? '';
  const currentEmail = session?.user.email ?? '';

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState(currentUsername);
  const [emailDraft, setEmailDraft] = useState(currentEmail);
  const [savingIdentity, setSavingIdentity] = useState(false);
  const [notifyUpdates, setNotifyUpdates] = useState<boolean>(session?.user.user_metadata?.notify_updates ?? true);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const currentCurrency = preferences?.defaultCurrency ?? 'GBP';
  const currentCurrencyLabel = CURRENCIES.find((c) => c.code === currentCurrency)?.label ?? currentCurrency;

  async function updateNotifySetting(key: string, value: boolean, revert: (v: boolean) => void) {
    try {
      const { error } = await supabase.auth.updateUser({ data: { [key]: value } });
      if (error) throw new Error(error.message);
    } catch (err) {
      revert(!value);
      showAlert({ title: "Couldn't save preference", body: err instanceof Error ? err.message : 'Please try again.' });
    }
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
    Keyboard.dismiss();
    const usernameTrim = usernameDraft.trim();
    const emailTrim = emailDraft.trim();
    const usernameChanged = usernameTrim !== (currentUsername ?? '').trim() && usernameTrim.length > 0;
    const emailChanged = emailTrim !== currentEmail.trim() && emailTrim.length > 0;
    if (!usernameChanged && !emailChanged) { setEditingIdentity(false); return; }
    setSavingIdentity(true);
    try {
      if (usernameChanged) {
        const { error } = await supabase.auth.updateUser({ data: { display_name: usernameTrim } });
        if (error) throw new Error(`username: ${error.message}`);
      }
      if (emailChanged) {
        const redirectTo = Linking.createURL('auth/callback');
        const { error } = await supabase.auth.updateUser({ email: emailTrim }, { emailRedirectTo: redirectTo });
        if (error) throw new Error(`email: ${error.message}`);
        showAlert({
          title: 'Check both inboxes',
          body: 'Confirmation links have been sent to your current and new email address. Tap both links to complete the change.',
        });
      }
      setEditingIdentity(false);
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSavingIdentity(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
        <View style={styles.block}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Currency</Text>
            <TouchableOpacity onPress={() => setCurrencyOpen(true)} activeOpacity={0.7}>
              <Text style={styles.rowValueLink}>{currentCurrencyLabel} ▾</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={[styles.rowValue, styles.rowValueSmall]} numberOfLines={1}>{currentEmail}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={[styles.rowValue, styles.rowValueSmall]} numberOfLines={1}>{currentUsername || '—'}</Text>
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
                editable={!savingIdentity}
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
                editable={!savingIdentity}
              />
              <View style={styles.editActions}>
                <TouchableOpacity onPress={cancelIdentityEdit} disabled={savingIdentity}>
                  <Text style={[styles.cancelText, savingIdentity && { opacity: 0.4 }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleIdentitySave} disabled={savingIdentity}>
                  {savingIdentity ? <ActivityIndicator color={colors.gold} size="small" /> : <Text style={styles.saveBtnText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.block}>
          <Text style={styles.blockHeading}>Email preferences</Text>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Vinster will email you from time to time regarding app updates and offers.</Text>
            <Switch
              value={notifyUpdates}
              onValueChange={(v) => { setNotifyUpdates(v); updateNotifySetting('notify_updates', v, setNotifyUpdates); }}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

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
                    onPress={() => { updatePreferences({ defaultCurrency: c.code }); setCurrencyOpen(false); }}
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
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  block: { gap: 4 },
  blockHeading: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  rowValue: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text, textAlign: 'right', flexShrink: 1, marginLeft: spacing.md },
  rowValueSmall: { fontSize: 13, fontFamily: fonts.bodyRegular },
  rowValueLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: '#FFFFFF' },
  editLinkBtn: { alignSelf: 'flex-end', marginTop: 2 },
  editLinkText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold },
  editPanel: { marginTop: spacing.sm, gap: 4 },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: 4 },
  editActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md, marginTop: 4 },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md, minWidth: 70, alignItems: 'center' },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4 },
  toggleLabel: { flex: 1, fontSize: 15, fontFamily: fonts.bodyItalic, color: '#FFFFFF', lineHeight: 20 },
  currencyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  currencySheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 420, padding: spacing.lg },
  currencySheetTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  currencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  currencyOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  currencyOptionText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  currencyOptionTextActive: { fontFamily: fonts.bodySemibold, color: colors.gold },
  currencyCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold },
  currencyClose: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs },
  currencyCloseText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
});
