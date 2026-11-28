import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, useWindowDimensions } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { showAlert } from '../../src/components/AppAlert';
import { TabSwipeView } from '../../src/components/TabSwipeView';
import { VinsterHeader } from '../../src/components/VinsterHeader';
import * as Application from 'expo-application';
import { router } from 'expo-router';
import { AlterEgoCarousel } from '../../src/components/AlterEgoCarousel';
import { useAuth } from '../../src/hooks/useAuth';
import { useCommunityMember } from '../../src/hooks/useCommunityMember';
import { isMember } from '../../src/api/community';
import { GATHER_LOCKED, GATHER_LOCKED_OPACITY } from '../../src/constants/features';
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
  // Members edit their Community profile here (not from the Gather tab).
  const community = useCommunityMember();
  const communityMember = community.enabled && isMember(community.member);
  const currentUsername = session?.user.user_metadata?.display_name ?? '';
  const currentEmail = session?.user.email ?? '';

  // Account controls (currency, email, username, email preferences) live on
  // the dedicated Your Settings screen.

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
      <VinsterHeader blank />

      <View style={styles.body}>

      <View style={styles.titleRow}>
        <Text style={styles.title}>About You</Text>
      </View>
      <Text style={styles.identityLine}>
        {currentUsername || currentEmail.split('@')[0]} · Vinster since {formatJoinedShort(session?.user.created_at)}
      </Text>

      {/* Personality sketches now live on the Review tab under "Vinster's
          Review of You", alongside Restaurant & Wine Reviews and the Lineup
          Library. About You starts with your preferences, then account settings. */}
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
        {communityMember ? (
          <TouchableOpacity style={[styles.prefButton, GATHER_LOCKED && { opacity: GATHER_LOCKED_OPACITY }]} onPress={() => router.push('/community/join')} disabled={GATHER_LOCKED} activeOpacity={0.7}>
            <Text style={styles.prefButtonText}>Your Community Profile</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* What Vinster has learned from the user's reviews, cellar and choices —
          and the place to correct it. */}
      <Text style={styles.sectionHeader}>Vinster's Observations of You</Text>
      <Text style={styles.sketchBlurb}>
        As you scan, cellar, rate and cook, Vinster gains insight into your preferences and vinous personality. As it gets to know you over time it uses these observations to tailor its recommendations.
      </Text>
      <Text style={styles.sketchBlurb}>
        See (and challenge) what Vinster has learned about you{' '}
        <Text style={styles.hereLink} onPress={() => router.push('/profile/observations')} accessibilityRole="link">HERE</Text>
        , and view its witty alter-ego sketch of you below
      </Text>

      {/* Vinster's Review of You — the alter-ego sketch carousel, moved here from
          the Review tab; sits below the Settings button. */}
      <Text style={styles.sectionHeader}>Vinster's Review of You</Text>
      <Text style={styles.sketchBlurb}>
        As you scan, cellar, rate and cook, Vinster sketches your alter-ego — a witty character profile drawn from your tastes that evolves as you use the app. Share it with friends or the community.
      </Text>
      <View style={styles.carouselBleed}>
        <AlterEgoCarousel />
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

  // 18pt either side of every separator, app-wide.
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 18 },
  // Header separator: 18pt from the identity line (it has 8 of its own) and 18pt below, as on Home.
  headerDivider: { height: 1, backgroundColor: colors.divider, marginTop: 10, marginBottom: 18 },

  block: { gap: 4 },

  prefButton: { borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: spacing.sm },
  prefButtonText: { color: '#FFFFFF', fontFamily: fonts.headingSemibold, fontSize: 15 },
  hereLink: { color: colors.gold, textDecorationLine: 'underline' },
  // "Vinster's Review of You" carousel section (moved from the Review tab).
  sectionHeader: { fontFamily: fonts.headingSemibold, fontSize: 22, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  sketchBlurb: { fontFamily: fonts.headingRegular, fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23, marginBottom: spacing.lg, paddingHorizontal: spacing.sm },
  // Let the carousel scroll edge-to-edge, breaking out of the body's h-padding.
  carouselBleed: { marginHorizontal: -spacing.xl },

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
});
