import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { fetchBlogPost, deleteBlogPost, isVinsterOwner } from '../../../src/api/blog';
import { MarkdownLite } from '../../../src/components/MarkdownLite';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fontsSpectral as fonts } from '../../../src/constants/fonts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogPostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const owner = isVinsterOwner(session);
  const qc = useQueryClient();
  const { data: post, isLoading } = useQuery({ queryKey: ['blog-post', id], queryFn: () => fetchBlogPost(id!), enabled: !!id });

  function confirmDelete() {
    if (!post) return;
    showAlert({
      title: 'Delete this post?',
      body: `“${post.title}” will be permanently removed.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteBlogPost(post.id);
              qc.invalidateQueries({ queryKey: ['blog-posts'] });
              router.back();
            } catch (err) {
              showAlert({ title: 'Could not delete', body: err instanceof Error ? err.message : 'Please try again.' });
            }
          },
        },
      ],
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>The Journal</Text>
        {owner && post ? (
          <TouchableOpacity onPress={() => router.push(`/community/blog/new?id=${post.id}`)} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 48 }} />}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : !post ? (
        <View style={styles.center}><Text style={styles.emptyBody}>This post isn’t available.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 70 }}>
          {post.cover_image_url ? <Image source={{ uri: post.cover_image_url }} style={styles.cover} resizeMode="cover" /> : null}
          <View style={styles.body}>
            {!post.is_published ? <Text style={styles.draft}>Draft — only you can see this</Text> : null}
            <Text style={styles.title}>{post.title}</Text>
            <Text style={styles.meta}>{formatDate(post.published_at ?? post.created_at)}{post.tags.length ? ` · ${post.tags.join(' · ')}` : ''}</Text>
            {post.excerpt ? <Text style={styles.excerpt}>{post.excerpt}</Text> : null}
            <View style={styles.rule} />
            <MarkdownLite body={post.body} />
            {owner ? (
              <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn}>
                <Text style={styles.deleteText}>Delete post</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: colors.gold, width: 48 },
  headerTitle: { flex: 1, fontSize: 18, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  edit: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, width: 48, textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  emptyBody: { fontSize: 16, fontFamily: fonts.headingRegular, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  body: { padding: spacing.xl },
  draft: { fontSize: 11, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm },
  title: { fontSize: 30, fontFamily: fonts.headingBold, color: '#FFFFFF', lineHeight: 36, letterSpacing: 0.3 },
  meta: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: spacing.sm, letterSpacing: 0.3 },
  excerpt: { fontSize: 18, fontFamily: fonts.headingRegular, color: 'rgba(255,255,255,0.82)', lineHeight: 26, marginTop: spacing.md, fontStyle: 'italic' },
  rule: { height: 1, backgroundColor: colors.border, marginVertical: spacing.lg },
  deleteBtn: { marginTop: spacing.xxl, alignItems: 'center', paddingVertical: spacing.md },
  deleteText: { fontFamily: fonts.bodySemibold, fontSize: 14, color: '#FFFFFF', textDecorationLine: 'underline' },
});
