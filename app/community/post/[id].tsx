import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { useCommunityMember } from '../../../src/hooks/useCommunityMember';
import { Avatar, FeedCard, timeAgo } from '../../../src/components/community/CommunityCards';
import {
  FEED_KEY, addComment, deleteComment, getFeedItem, isMember, listComments, report, setCheer, unshareReview,
  type CommunityComment,
} from '../../../src/api/community';
import { withMembership } from '../../../src/services/communityShare';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

const REASONS = ['Offensive or hurtful', 'Spam or advertising', 'Something else'];

// One shared review: the whole review, its cheers, and its comments.
export default function CommunityPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const userId = session?.user.id;
  const qc = useQueryClient();
  const { member, refreshShares } = useCommunityMember();
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);

  const { data: item, isLoading, refetch } = useQuery({
    queryKey: [FEED_KEY, 'post', id],
    enabled: !!id,
    queryFn: () => getFeedItem(id!),
  });
  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: [FEED_KEY, 'comments', id],
    enabled: !!id,
    queryFn: () => listComments(id!),
  });

  const mine = !!item && item.user_id === userId;
  const refreshAll = () => { void refetch(); void refetchComments(); void qc.invalidateQueries({ queryKey: [FEED_KEY], refetchType: 'none' }); };

  async function cheer() {
    if (!item || !userId) return;
    try { await setCheer(item.id, userId, !item.liked_by_me); refreshAll(); }
    catch { showAlert({ title: 'Could Not Cheer', body: 'Please try again.' }); }
  }

  function sendComment() {
    const body = draft.trim();
    if (!body || !item || posting) return;
    withMembership(member, async () => {
      setPosting(true);
      try {
        const { status } = await addComment(item.id, body);
        setDraft('');
        refreshAll();
        if (status !== 'visible') showAlert({ title: 'Almost There', body: 'Vinster is taking a quick look at your comment before it appears.' });
      } catch (err) {
        showAlert({ title: 'Could Not Comment', body: err instanceof Error ? err.message : 'Please try again.' });
      } finally {
        setPosting(false);
      }
    });
  }

  function askReport(targetType: 'review' | 'comment', targetId: string) {
    if (!userId) return;
    showAlert({
      title: targetType === 'review' ? 'Report This Review' : 'Report This Comment',
      body: 'Why are you reporting it? Vinster will take a look.',
      buttons: [
        ...REASONS.map((reason) => ({
          text: reason,
          onPress: async () => {
            try { await report(userId, targetType, targetId, reason); showAlert({ title: 'Thank You', body: 'Your report has been sent to Vinster.' }); }
            catch { showAlert({ title: 'Could Not Report', body: 'Please try again.' }); }
          },
        })),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  function commentMenu(c: CommunityComment) {
    const canDelete = c.user_id === userId || mine;
    showAlert({
      title: 'Comment',
      body: c.body,
      buttons: [
        ...(canDelete ? [{
          text: 'Delete', style: 'destructive' as const,
          onPress: async () => {
            try { await deleteComment(c.id); refreshAll(); }
            catch { showAlert({ title: 'Could Not Delete', body: 'Please try again.' }); }
          },
        }] : []),
        ...(c.user_id !== userId ? [{ text: 'Report', onPress: () => askReport('comment', c.id) }] : []),
        { text: 'Cancel', style: 'cancel' as const },
      ],
    });
  }

  function removeMine() {
    if (!item) return;
    showAlert({
      title: 'Remove From Community',
      body: 'This review will no longer be visible to other members. It stays in your own reviews.',
      buttons: [
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try { await unshareReview(item.id); refreshShares(); void qc.invalidateQueries({ queryKey: [FEED_KEY] }); router.back(); }
            catch { showAlert({ title: 'Could Not Remove', body: 'Please try again.' }); }
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{item?.category === 'restaurant' ? 'Restaurant Review' : 'Wine Review'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} /></View>
      ) : !item ? (
        <View style={styles.center}><Text style={styles.empty}>This review is no longer shared.</Text></View>
      ) : (
        <KeyboardAwareScrollView contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled" bottomOffset={20}>
          {mine && item.status !== 'visible' ? (
            <Text style={styles.notice}>Vinster is taking a quick look at this review. Only you can see it until then.</Text>
          ) : null}
          <FeedCard item={item} onCheer={item.status === 'visible' ? () => void cheer() : undefined} full />

          <View style={styles.linkRow}>
            {mine
              ? <TouchableOpacity onPress={removeMine}><Text style={styles.link}>Remove from Community</Text></TouchableOpacity>
              : <TouchableOpacity onPress={() => askReport('review', item.id)}><Text style={styles.linkMuted}>Report</Text></TouchableOpacity>}
          </View>

          <Text style={styles.sectionHeader}>Comments</Text>
          {comments.length === 0 ? <Text style={styles.noComments}>No comments yet. Be the first.</Text> : null}
          {comments.map((c) => (
            <TouchableOpacity key={c.id} style={styles.comment} onLongPress={() => commentMenu(c)} onPress={() => commentMenu(c)} activeOpacity={0.8}>
              <Avatar path={c.avatar_path} name={c.username} size={28} />
              <View style={{ flex: 1 }}>
                <Text style={styles.commentHead}>
                  <Text style={styles.commentAuthor}>{c.username ?? 'A member'}</Text>
                  <Text style={styles.commentWhen}>  {timeAgo(c.created_at)}</Text>
                </Text>
                <Text style={styles.commentBody}>{c.body}</Text>
                {c.status !== 'visible' ? <Text style={styles.commentPending}>Waiting for Vinster’s check</Text> : null}
              </View>
            </TouchableOpacity>
          ))}

          {item.status === 'visible' ? (
            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                value={draft}
                onChangeText={setDraft}
                placeholder={isMember(member) ? 'Add a comment…' : 'Join the Community to comment…'}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity style={[styles.postBtn, (!draft.trim() || posting) && { opacity: 0.5 }]} onPress={sendComment} disabled={!draft.trim() || posting}>
                {posting ? <ActivityIndicator color={colors.background} /> : <Text style={styles.postBtnText}>Post</Text>}
              </TouchableOpacity>
            </View>
          ) : null}
        </KeyboardAwareScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold, width: 40 },
  title: { flex: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.6, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  empty: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center' },
  notice: { marginHorizontal: spacing.xl, marginTop: spacing.md, fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold, textAlign: 'center' },
  linkRow: { flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  link: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.gold },
  linkMuted: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted },
  sectionHeader: { fontSize: 20, fontFamily: fonts.headingSemibold, color: colors.text, paddingHorizontal: spacing.xl, marginTop: spacing.lg, marginBottom: spacing.sm },
  noComments: { fontSize: 14, fontFamily: fonts.bodyItalic, color: colors.textMuted, paddingHorizontal: spacing.xl },
  comment: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingVertical: spacing.sm },
  commentHead: { fontSize: 14 },
  commentAuthor: { fontFamily: fonts.bodySemibold, color: colors.text },
  commentWhen: { fontFamily: fonts.bodyRegular, color: colors.textMuted, fontSize: 12 },
  commentBody: { fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, lineHeight: 21, marginTop: 2 },
  commentPending: { fontSize: 12, fontFamily: fonts.bodyItalic, color: colors.gold, marginTop: 2 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, marginHorizontal: spacing.xl, marginTop: spacing.lg },
  input: { flex: 1, minHeight: 44, maxHeight: 140, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: spacing.sm, paddingVertical: 10, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface },
  postBtn: { backgroundColor: colors.gold, borderRadius: 10, paddingVertical: 12, paddingHorizontal: spacing.md },
  postBtnText: { fontSize: 15, fontFamily: fonts.headingBold, color: colors.background },
});
