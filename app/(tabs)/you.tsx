import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, ActivityIndicator, Switch, Modal, Keyboard, useWindowDimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { ArchiveSignInPrompt } from '../../src/components/ArchiveSignInPrompt';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { AlterEgoCarousel } from '../../src/components/AlterEgoCarousel';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabase';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Short "since" stamp for the identity line under the title — e.g. 17/06/26.
function formatJoinedShort(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function YouScreen() {
  const { height } = useWindowDimensions();
  // Match the other tabs' header placement exactly (same dynamic top inset).
  const paddingTop = Math.max(55, height * 0.095);
  const { session } = useAuth();
  const currentUsername = session?.user.user_metadata?.display_name ?? '';
  const currentEmail = session?.user.email ?? '';

  // Account controls (currency, email, username, email preferences) now live on
  // the dedicated Your Settings screen. The alter-ego carousel takes a gate; on
  // this account-gated screen the session always exists, so it just runs.
  const requireAccount = (action: () => void) => action();

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
        <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop }]}>
          <VinsterHeader />
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>About You</Text>
            </View>
            <ArchiveSignInPrompt
              title="Sign in to manage your account"
              body="Sign in or create an account to see your profile, currency, notification preferences and account controls."
            />
          </View>
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
      setDeleteConfirmOpen(false);
      // Confirm before we sign out + leave. dismissable:false so the user has
      // to tap OK, guaranteeing the sign-out + redirect actually runs.
      showAlert({
        title: 'Your account has been deleted',
        body: 'Your account and all your data have been permanently removed. Thanks for trying Vinster.',
        dismissable: false,
        buttons: [{
          text: 'OK',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/sign-in');
          },
        }],
      });
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  }

  return (
    <TabSwipeView style={styles.container}>
    <KeyboardAwareScrollView style={{ flex: 1 }} contentContainerStyle={[styles.content, { paddingTop }]} keyboardShouldPersistTaps="always" bottomOffset={24}>
      <VinsterHeader />

      <View style={styles.body}>

      <View style={styles.titleRow}>
        <Text style={styles.title}>About You</Text>
      </View>
      <Text style={styles.identityLine}>
        {currentUsername || currentEmail.split('@')[0]} · Vinster since {formatJoinedShort(session?.user.created_at)}
      </Text>

      {/* Personality sketches now live on the Review tab under "Vinster's
          Review of You"; Restaurant & Wine Reviews are there too, and the
          Lineup Library is on the Cellar tab. About You starts with your
          preferences, then account settings. */}
      <View style={styles.headerDivider} />

      <View style={styles.block}>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/profile/wine')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Wine Preferences</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/profile/recipe')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Recipe Requirements</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.prefButton} onPress={() => router.push('/profile/settings')} activeOpacity={0.7}>
          <Text style={styles.prefButtonText}>Your Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* Vinster's Review of You — the alter-ego sketch carousel, moved here from
          the Review tab; sits below the Settings button. */}
      <Text style={styles.sectionHeader}>Vinster's Review of You</Text>
      <Text style={styles.sketchBlurb}>
        As you scan, cellar, rate and cook, Vinster sketches your alter-ego — a witty character profile drawn from your tastes that evolves as you use the app. Share it with friends or the community.
      </Text>
      <View style={styles.carouselBleed}>
        <AlterEgoCarousel requireAccount={requireAccount} />
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



      </View>
    </KeyboardAwareScrollView>
    </TabSwipeView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // No horizontal padding here so the V mark sits flush-left like the other
  // tabs; the rest of the page gets its inset from `body`. paddingTop is
  // applied inline (dynamic, matching Scan/Cellar/Chef).
  content: { paddingBottom: 40 },
  body: { paddingHorizontal: spacing.xl },
  // Page title — matches the other tabs (42px Cormorant SemiBold, centred).
  title: { fontSize: 42, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1.5, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  // "Hilary · Vinster since 17/06/26" line directly under the title.
  identityLine: { fontSize: 14, fontFamily: fonts.headingItalic, color: '#FFFFFF', textAlign: 'center', marginBottom: spacing.sm },
  // Italic blurb under the page heading — editorial intro, stays Cormorant.
  thanks: { fontSize: 18, fontFamily: fonts.headingItalic, color: '#FFFFFF', textAlign: 'center', lineHeight: 24, paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.md },
  // Header separator: 18pt from the identity line (it has 8 of its own) and 18pt below, as on Home.
  headerDivider: { height: 1, backgroundColor: colors.divider, marginTop: 10, marginBottom: 18 },
  goldLine: { height: 1, backgroundColor: colors.gold, opacity: 0.55, marginVertical: spacing.md },
  block: { gap: 4 },
  // Section header label.
  blockHeading: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  prefButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: spacing.sm },
  prefButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
  // "Vinster's Review of You" carousel section (moved from the Review tab).
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  // Let the carousel scroll edge-to-edge, breaking out of the body's h-padding.
  carouselBleed: { marginHorizontal: -spacing.xl },
  grapeOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  grapeSheet: { width: '100%', maxWidth: 340, borderRadius: 16, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.gold, padding: spacing.xl, alignItems: 'center', gap: spacing.sm },
  grapeTitle: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.text, textAlign: 'center' },
  grapeCount: { fontFamily: fonts.bodySemibold, fontSize: 16, color: colors.gold, textAlign: 'center' },
  grapeHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center' },
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
