import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { fetchBlogPosts, isVinsterOwner, type BlogPost } from '../../../src/api/blog';
import { colors, spacing } from '../../../src/constants/theme';
import { fontsSpectral as fonts } from '../../../src/constants/fonts';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BlogListScreen() {
  const { session } = useAuth();
  const owner = isVinsterOwner(session);
  const { data: posts = [], isLoading } = useQuery({ queryKey: ['blog-posts'], queryFn: fetchBlogPosts });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>The Journal</Text>
        {owner ? (
          <TouchableOpacity onPress={() => router.push('/community/blog/new')} hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}>
            <Text style={styles.write}>＋ Write</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 54 }} />}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>Nothing published yet</Text>
          <Text style={styles.emptyBody}>{owner ? 'Tap “＋ Write” to publish your first piece.' : 'The Vinster Journal — wine notes, stories and finds — is coming soon.'}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 60 }}>
          <Text style={styles.lead}>Wine notes, stories and finds from Vinster.</Text>
          {posts.map((p: BlogPost) => (
            <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.85} onPress={() => router.push(`/community/blog/${p.id}`)}>
              {p.cover_image_url ? (
                <Image source={{ uri: p.cover_image_url }} style={styles.cover} resizeMode="cover" />
              ) : null}
              <View style={styles.cardBody}>
                {!p.is_published ? <Text style={styles.draft}>Draft</Text> : null}
                <Text style={styles.postTitle} numberOfLines={3}>{p.title}</Text>
                <Text style={styles.meta}>{formatDate(p.published_at ?? p.created_at)}{p.tags.length ? ` · ${p.tags.join(' · ')}` : ''}</Text>
                {p.excerpt ? <Text style={styles.excerpt} numberOfLines={3}>{p.excerpt}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: colors.gold, width: 54 },
  title: { flex: 1, fontSize: 20, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  write: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.gold, width: 54, textAlign: 'right' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: '#FFFFFF' },
  emptyBody: { fontSize: 16, fontFamily: fonts.headingRegular, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 23 },
  lead: { fontSize: 15, fontFamily: fonts.headingRegular, color: 'rgba(255,255,255,0.7)', marginBottom: spacing.lg },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: spacing.lg, backgroundColor: colors.surface },
  cover: { width: '100%', aspectRatio: 16 / 9 },
  cardBody: { padding: spacing.lg },
  draft: { fontSize: 11, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  postTitle: { fontSize: 23, fontFamily: fonts.headingBold, color: '#FFFFFF', lineHeight: 28, letterSpacing: 0.3 },
  meta: { fontSize: 12.5, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: 6, letterSpacing: 0.3 },
  excerpt: { fontSize: 15, fontFamily: fonts.bodyRegular, color: 'rgba(255,255,255,0.78)', lineHeight: 22, marginTop: spacing.sm },
});
