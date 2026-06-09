import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Switch, Modal, Keyboard } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import * as Linking from 'expo-linking';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { usePreferences } from '../../src/hooks/usePreferences';
import { supabase } from '../../src/api/supabase';
import { CURRENCIES } from '../../src/constants/currency';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

function formatJoinedDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function YouScreen() {
  const { session } = useAuth();
  const { preferences, updatePreferences } = usePreferences();
  const currentUsername = session?.user.user_metadata?.display_name ?? '';
  const currentEmail = session?.user.email ?? '';

  const [editingIdentity, setEditingIdentity] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState(currentUsername);
  const [emailDraft, setEmailDraft] = useState(currentEmail);
  const [savingIdentity, setSavingIdentity] = useState(false);

  const [notifyUpdates, setNotifyUpdates] = useState<boolean>(
    session?.user.user_metadata?.notify_updates ?? true
  );
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [sketchInfoOpen, setSketchInfoOpen] = useState(false);
  const currentCurrency = preferences?.defaultCurrency ?? 'GBP';
  const currentCurrencyLabel = CURRENCIES.find((c) => c.code === currentCurrency)?.label ?? currentCurrency;

  async function updateNotifySetting(key: string, value: boolean, revert: (v: boolean) => void) {
    try {
      const { error } = await supabase.auth.updateUser({ data: { [key]: value } });
      if (error) throw new Error(error.message);
    } catch (err) {
      revert(!value);
      showAlert({
        title: "Couldn't save preference",
        body: err instanceof Error ? err.message : 'Please try again.',
      });
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
    // Dismiss the keyboard explicitly so the iOS first-tap-eats-the-tap
    // bug can't strand the user with focused username/email inputs.
    Keyboard.dismiss();
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

  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showAlert({ title: 'Could not sign out', body: `${error.message}\n\nPlease try again.` });
        return;
      }
      router.replace('/(auth)/sign-in');
    } finally {
      setSigningOut(false);
    }
  }

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);

  function handleDeleteAccount() {
    setDeleteConfirmOpen(true);
  }

  if (!session) {
    return (
      <TabSwipeView style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <VinsterHeader />
          <Text style={styles.heading}>You</Text>
          <ArchiveSignInPrompt
            title="Sign in to manage your account"
            body="Sign in or create an account to see your profile, currency, notification preferences and account controls."
          />
        </ScrollView>
      </TabSwipeView>
    );
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) {
        showAlert({ title: 'Error', body: 'Could not delete your account. Please try again or contact support.' });
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
    <TabSwipeView style={styles.container}>
    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="always" bottomOffset={24}>
      <VinsterHeader />

      <Text style={styles.heading}>You</Text>

      <View style={styles.divider} />

      {/* Collections — moved out of the Cellar tab. */}
      <View style={styles.block}>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/restaurants/reviews')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Restaurants</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/wines/chosen')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Wine Reviews</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/cellar/labels')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Label Library</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <View style={styles.sketchHeaderRow}>
          <Text style={styles.sketchHeader}>Your Personality Sketch</Text>
          <TouchableOpacity onPress={() => setSketchInfoOpen(true)} activeOpacity={0.7}>
            <Text style={styles.whatsThis}>what's this?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.personalityButton} onPress={() => router.push('/profile/personality?category=wine')} activeOpacity={0.7}>
          <Text style={styles.personalityButtonText}>Your Wine Personality</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.personalityButton} onPress={() => router.push('/profile/personality?category=recipe')} activeOpacity={0.7}>
          <Text style={styles.personalityButtonText}>Your Foodie Personality</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.block}>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/profile/wine')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Wine Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/profile/recipe')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Recipe Requirements</Text>
        </TouchableOpacity>
      </View>

      {/* Account details — moved below the preference buttons. */}
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
          <Text style={styles.rowLabel}>Currency</Text>
          <TouchableOpacity onPress={() => setCurrencyOpen(true)} activeOpacity={0.7}>
            <Text style={styles.rowValueLink}>{currentCurrencyLabel} ▾</Text>
          </TouchableOpacity>
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
          <Text style={styles.toggleLabel}>Vinster will email you from time to time regarding app updates and offers.</Text>
          <Switch
            value={notifyUpdates}
            onValueChange={(v) => { setNotifyUpdates(v); updateNotifySetting('notify_updates', v, setNotifyUpdates); }}
            trackColor={{ false: 'rgba(255,255,255,0.15)', true: colors.gold }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.signOutButton, signingOut && { opacity: 0.5 }]}
        onPress={() => setSignOutConfirmOpen(true)}
        disabled={signingOut}
      >
        <Text style={styles.signOutText}>{signingOut ? 'Signing out…' : 'Sign Out'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
        <Text style={styles.deleteText}>Delete Account</Text>
      </TouchableOpacity>

      {/* Build identifier — lets testers report exactly which build they're
          running (the version name 1.0.0 is shared by every build). */}
      <Text style={styles.versionText}>
        Vinster {Application.nativeApplicationVersion ?? '1.0.0'}
        {Application.nativeBuildVersion ? ` (build ${Application.nativeBuildVersion})` : ''}
      </Text>

      <Modal visible={signOutConfirmOpen} transparent animationType="fade" onRequestClose={() => setSignOutConfirmOpen(false)}>
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={() => setSignOutConfirmOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Sign out?</Text>
            <Text style={styles.confirmBody}>
              You can sign back in anytime — your cellar, reviews, and personality sketches stay safe.
            </Text>
            <TouchableOpacity
              style={styles.confirmGoldBtn}
              onPress={() => {
                setSignOutConfirmOpen(false);
                handleSignOut();
              }}
            >
              <Text style={styles.confirmGoldBtnText}>Sign Out</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSignOutConfirmOpen(false)} style={styles.confirmCancel}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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

      <Modal visible={sketchInfoOpen} transparent animationType="fade" onRequestClose={() => setSketchInfoOpen(false)}>
        <TouchableOpacity style={styles.confirmOverlay} activeOpacity={1} onPress={() => setSketchInfoOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.confirmSheet} onPress={() => {}}>
            <Text style={styles.confirmTitle}>Your Personality Sketch</Text>
            <Text style={styles.confirmBody}>
              As you scan, cellar, rate and cook, Vinster sketches a witty character profile of you — a separate Wine personality and Foodie personality drawn from your tastes. They evolve as you use the app, and you can share them with friends or post them to the community.
            </Text>
            <TouchableOpacity style={styles.confirmGoldBtn} onPress={() => setSketchInfoOpen(false)}>
              <Text style={styles.confirmGoldBtnText}>Got it</Text>
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
    </KeyboardAwareScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingTop: 56, paddingHorizontal: spacing.xl, paddingBottom: 40 },
  heading: { fontSize: 32, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 1, textAlign: 'center', marginBottom: spacing.lg },
  // Italic blurb under the page heading — editorial intro, stays Cormorant.
  thanks: { fontSize: 18, fontFamily: fonts.headingItalic, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  block: { gap: 4 },
  // Section header label.
  blockHeading: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  sketchHeaderRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  sketchHeader: { fontFamily: fonts.headingSemibold, fontSize: 17, color: colors.text },
  whatsThis: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.gold, textDecorationLine: 'underline' },
  personalityButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: spacing.sm },
  personalityButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
  prefButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: spacing.sm },
  prefButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  // Form-style label in identity rows.
  rowLabel: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  // Form-style value rendered to the right of the row label.
  rowValue: { fontSize: 13, fontFamily: fonts.bodySemibold, color: colors.text, textAlign: 'right', flexShrink: 1, marginLeft: spacing.md },
  rowValueSmall: { fontSize: 13, fontFamily: fonts.bodyRegular },
  // Currency selector tappable value — still a value, leans Inter.
  rowValueLink: { fontSize: 13, fontFamily: fonts.bodySemibold, color: '#FFFFFF' },
  editLinkBtn: { alignSelf: 'flex-end', marginTop: 2 },
  // "Edit" link button text.
  editLinkText: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.gold },
  editPanel: { marginTop: spacing.sm, gap: 4 },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 8, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: 4 },
  editActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing.md, marginTop: 4 },
  // Cancel link inside the inline edit panel.
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingVertical: 6, paddingHorizontal: spacing.md, minWidth: 70, alignItems: 'center' },
  saveBtnText: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4 },
  // Toggle row descriptive label — form-style content, switches to Inter.
  toggleLabel: { flex: 1, fontSize: 15, fontFamily: fonts.bodyItalic, color: '#FFFFFF', lineHeight: 20 },
  signOutButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginTop: spacing.xs, marginBottom: 6 },
  signOutText: { color: colors.gold, fontSize: 15, fontFamily: fonts.headingSemibold },
  versionText: { fontFamily: fonts.bodyRegular, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg, marginBottom: spacing.sm, opacity: 0.7 },
  deleteButton: { alignItems: 'center', paddingVertical: 4 },
  confirmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  confirmSheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  confirmTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.sm },
  // Modal body copy.
  confirmBody: { fontFamily: fonts.bodyItalic, fontSize: 16, color: '#FFFFFF', textAlign: 'center', lineHeight: 22, marginBottom: spacing.lg },
  confirmDangerBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmDangerBtnDisabled: { opacity: 0.5 },
  confirmDangerBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  confirmGoldBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: spacing.sm, alignItems: 'center' },
  confirmGoldBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  confirmCancel: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  // Cancel link inside the confirm modal.
  confirmCancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  // "Delete Account" underlined link — button-style action.
  deleteText: { color: colors.gold, fontSize: 13, fontFamily: fonts.headingRegular, textDecorationLine: 'underline' },
  currencyOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  currencySheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, width: '100%', maxWidth: 420, padding: spacing.lg },
  currencySheetTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  currencyOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  currencyOptionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  // Modal option row label.
  currencyOptionText: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text },
  currencyOptionTextActive: { fontFamily: fonts.bodySemibold, color: colors.gold },
  currencyCheck: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold },
  currencyClose: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: spacing.xs },
  // Close link inside currency picker — cancel-style.
  currencyCloseText: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted },
});
