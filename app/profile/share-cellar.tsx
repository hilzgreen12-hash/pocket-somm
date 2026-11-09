import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchRecentCellarActivity, describeActivity, actorLabel } from '../../src/api/cellarActivity';
import { showAlert } from '../../src/components/AppAlert';
import { useAuth } from '../../src/hooks/useAuth';
import {
  fetchMyCellarMembers, inviteToMyCellar, setMemberRole, removeCellarMember,
  fetchInvitesForMe, acceptCellarInvite, leaveOrDeclineCellar,
  type CellarMember, type CellarMemberRole,
} from '../../src/api/cellarMembers';
import { sharedCellarLabel } from '../../src/components/CellarSwitcher';
import { setActiveCellar } from '../../src/api/cellarContext';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// Share Your Cellar — invite another Vinster account into your cellar (view
// only or full edit, chosen per invite), see who has access, and accept or
// leave a cellar someone has shared with you. Reviews stay personal.

const ROLE_LABEL: Record<CellarMemberRole, string> = { edit: 'Full edit', view: 'View only' };

export default function ShareCellarScreen() {
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CellarMemberRole>('edit');
  const [sending, setSending] = useState(false);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['cellar-members', userId],
    queryFn: fetchMyCellarMembers,
    enabled: !!userId,
  });
  // Recent changes by the people this cellar is shared with (migration 127).
  const { data: activity = [] } = useQuery({
    queryKey: ['cellar-activity', userId],
    queryFn: () => fetchRecentCellarActivity(30).catch(() => []),
    enabled: !!userId,
  });
  const { data: invites = [], isLoading: invitesLoading } = useQuery({
    queryKey: ['cellar-invites-for-me', userId],
    queryFn: fetchInvitesForMe,
    enabled: !!userId,
  });
  const joined = invites.filter((i) => i.status === 'accepted' && i.member_id === userId);
  const pending = invites.filter((i) => i.status === 'pending');

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['cellar-members', userId] });
    qc.invalidateQueries({ queryKey: ['cellar-invites-for-me', userId] });
  };

  async function sendInvite() {
    if (sending) return;
    setSending(true);
    try {
      await inviteToMyCellar(email, role);
      setEmail('');
      refresh();
      showAlert({ title: 'Invite saved', body: "When they sign in to Vinster with that email, they'll be asked to join your cellar." });
    } catch (err) {
      showAlert({ title: 'Could not invite', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSending(false);
    }
  }

  function memberActions(m: CellarMember) {
    const other: CellarMemberRole = m.role === 'edit' ? 'view' : 'edit';
    showAlert({
      title: m.invite_email,
      body: `${m.status === 'accepted' ? 'Joined' : 'Invite pending'} · ${ROLE_LABEL[m.role]}`,
      buttons: [
        { text: `Change to ${ROLE_LABEL[other]}`, onPress: () => { void setMemberRole(m.id, other).then(refresh).catch((e) => showAlert({ title: 'Could not change', body: e instanceof Error ? e.message : 'Please try again.' })); } },
        {
          text: m.status === 'accepted' ? 'Remove access' : 'Cancel invite',
          style: 'destructive',
          onPress: () => { void removeCellarMember(m.id).then(refresh).catch((e) => showAlert({ title: 'Could not remove', body: e instanceof Error ? e.message : 'Please try again.' })); },
        },
        { text: 'Close', style: 'cancel' },
      ],
    });
  }

  async function accept(inv: CellarMember) {
    try {
      await acceptCellarInvite(inv.id);
      setActiveCellar(inv.owner_id); // open the newly shared cellar straight away
      refresh();
      showAlert({ title: 'Cellar shared', body: `${sharedCellarLabel(inv.owner_name)} is now in your Cellar tab. Use the switcher at the top to move between it and My Cellar.` });
    } catch (err) {
      showAlert({ title: 'Could not join', body: err instanceof Error ? err.message : 'Please try again.' });
    }
  }

  function confirmLeave(inv: CellarMember, declining: boolean) {
    showAlert({
      title: declining ? 'Decline this invite?' : 'Leave this cellar?',
      body: declining ? undefined : "It disappears from your Cellar tab switcher. The shared cellar itself isn't changed.",
      buttons: [
        {
          text: declining ? 'Decline' : 'Leave',
          style: 'destructive',
          onPress: () => { void leaveOrDeclineCellar(inv.id).then(refresh).catch((e) => showAlert({ title: 'Something went wrong', body: e instanceof Error ? e.message : 'Please try again.' })); },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  const loading = membersLoading || invitesLoading;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Share Your Cellar</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>
        {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.xl }} /> : (
          <>
            {/* A cellar shared WITH me */}
            {joined.map((j) => (
              <View key={j.id} style={styles.card}>
                <Text style={styles.cardTitle}>{sharedCellarLabel(j.owner_name)}</Text>
                <Text style={styles.cardBody}>Shared with you · {ROLE_LABEL[j.role]} · switch to it from the Cellar tab</Text>
                <TouchableOpacity onPress={() => confirmLeave(j, false)} style={styles.linkBtn}>
                  <Text style={styles.linkText}>Leave this cellar</Text>
                </TouchableOpacity>
              </View>
            ))}

            {pending.map((inv) => (
              <View key={inv.id} style={styles.card}>
                <Text style={styles.cardTitle}>{inv.owner_name ?? 'Someone'} has invited you to share their cellar</Text>
                <Text style={styles.cardBody}>{ROLE_LABEL[inv.role]}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.outlineBtn} onPress={() => void accept(inv)}>
                    <Text style={styles.outlineBtnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmLeave(inv, true)} style={styles.linkBtn}>
                    <Text style={styles.linkText}>Decline</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {(joined.length > 0 || pending.length > 0) && <View style={styles.divider} />}

            {/* Invite someone into MY cellar. */}
            {(
              <>
                <Text style={styles.blurb}>
                  Invite someone to share your cellar. They'll see every bottle, rack, fridge, bin and cellar, plus the archive, on their own Vinster account. Reviews stay personal.
                </Text>
                <Text style={styles.fieldLabel}>Their Vinster email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@example.com"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="send"
                  onSubmitEditing={() => void sendInvite()}
                />
                <Text style={styles.fieldLabel}>Access</Text>
                <View style={styles.roleRow}>
                  {(['edit', 'view'] as CellarMemberRole[]).map((r) => (
                    <TouchableOpacity key={r} style={[styles.roleChip, role === r && styles.roleChipOn]} onPress={() => setRole(r)} accessibilityState={{ selected: role === r }}>
                      <Text style={[styles.roleChipText, role === r && styles.roleChipTextOn]}>{ROLE_LABEL[r]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.roleHint}>
                  {role === 'edit' ? 'Can add, move, archive and delete bottles.' : 'Can browse the cellar but not change anything.'}
                </Text>
                <TouchableOpacity style={[styles.outlineBtn, styles.sendBtn, (!email.trim() || sending) && { opacity: 0.5 }]} onPress={() => void sendInvite()} disabled={!email.trim() || sending}>
                  {sending ? <ActivityIndicator color={colors.gold} size="small" /> : <Text style={styles.outlineBtnText}>Send Invite</Text>}
                </TouchableOpacity>

                {members.length > 0 && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.blockHeading}>People with access</Text>
                    {members.map((m) => (
                      <TouchableOpacity key={m.id} style={styles.memberRow} onPress={() => memberActions(m)} activeOpacity={0.7}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.memberEmail} numberOfLines={1}>{m.invite_email}</Text>
                          <Text style={styles.memberMeta}>{m.status === 'accepted' ? 'Joined' : 'Invite pending'} · {ROLE_LABEL[m.role]}</Text>
                        </View>
                        <Text style={styles.memberEdit}>Edit</Text>
                      </TouchableOpacity>
                    ))}
                  </>
                )}
                {activity.length > 0 ? (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.blockHeading}>Recent activity</Text>
                    {activity.map((a) => (
                      <View key={a.id} style={styles.memberRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cardBody}><Text style={{ fontFamily: fonts.bodySemibold, color: colors.gold }}>{actorLabel(a)}</Text> {describeActivity(a)}</Text>
                          <Text style={styles.memberMeta}>{new Date(a.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
                        </View>
                      </View>
                    ))}
                  </>
                ) : null}
              </>
            )}
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 40, fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  title: { flex: 1, fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, letterSpacing: 0.8, textAlign: 'center' },
  content: { paddingHorizontal: spacing.xl, paddingBottom: 60 },
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.lg },
  blurb: { fontSize: 15, fontFamily: fonts.bodyItalic, color: '#FFFFFF', lineHeight: 21, marginBottom: spacing.md },
  blockHeading: { fontSize: 13, fontFamily: fonts.headingSemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.xs },
  fieldLabel: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4, marginTop: spacing.sm },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  roleChip: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  roleChipOn: { borderColor: colors.gold },
  roleChipText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  roleChipTextOn: { color: colors.gold },
  roleHint: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, marginTop: 6 },
  outlineBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: spacing.lg, alignItems: 'center' },
  outlineBtnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  sendBtn: { marginTop: spacing.lg },
  card: { borderWidth: 1, borderColor: colors.borderWhite, borderRadius: 14, padding: spacing.md, backgroundColor: colors.surface, marginBottom: spacing.md, gap: 4 },
  cardTitle: { fontFamily: fonts.headingSemibold, fontSize: 18, color: colors.gold, lineHeight: 23 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.text },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: spacing.sm },
  linkBtn: { paddingVertical: 6 },
  linkText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold },
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.md },
  memberEmail: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.text },
  memberMeta: { fontFamily: fonts.bodyRegular, fontSize: 13, color: colors.textMuted, marginTop: 2 },
  memberEdit: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.gold },
});
