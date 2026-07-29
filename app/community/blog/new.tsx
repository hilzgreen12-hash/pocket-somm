import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../src/hooks/useAuth';
import { createBlogPost, updateBlogPost, fetchBlogPost, isVinsterOwner, type BlogPostInput } from '../../../src/api/blog';
import { showAlert } from '../../../src/components/AppAlert';
import { colors, spacing } from '../../../src/constants/theme';
import { fontsSpectral as fonts } from '../../../src/constants/fonts';

export default function BlogComposeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { session } = useAuth();
  const owner = isVinsterOwner(session);
  const qc = useQueryClient();

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [tags, setTags] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(false);
  const [wasPublished, setWasPublished] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);

  // Only the owner may compose — bounce anyone else out.
  useEffect(() => {
    if (session && !owner) { router.back(); }
  }, [session, owner]);

  // Editing an existing post — prefill.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchBlogPost(id)
      .then((p) => {
        if (cancelled || !p) return;
        setTitle(p.title); setExcerpt(p.excerpt ?? ''); setCoverUrl(p.cover_image_url ?? '');
        setTags(p.tags.join(', ')); setBody(p.body); setPublished(p.is_published); setWasPublished(p.is_published);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  async function save() {
    if (!session?.user.id || saving) return;
    if (!title.trim()) { showAlert({ title: 'Add a title', body: 'Your post needs a title.' }); return; }
    if (!body.trim()) { showAlert({ title: 'Add some words', body: 'Write the body of your post.' }); return; }
    const input: BlogPostInput = {
      title, excerpt: excerpt || null, body, cover_image_url: coverUrl || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean), is_published: published,
    };
    setSaving(true);
    try {
      if (id) await updateBlogPost(id, input, wasPublished);
      else await createBlogPost(session.user.id, input);
      qc.invalidateQueries({ queryKey: ['blog-posts'] });
      if (id) qc.invalidateQueries({ queryKey: ['blog-post', id] });
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{id ? 'Edit post' : 'New post'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.gold} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: 90 }} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Title</Text>
          <TextInput style={[styles.input, styles.titleInput]} value={title} onChangeText={setTitle} placeholder="A headline" placeholderTextColor={colors.textSubtle} multiline />

          <Text style={styles.label}>Cover image URL (optional)</Text>
          <TextInput style={styles.input} value={coverUrl} onChangeText={setCoverUrl} placeholder="https://…" placeholderTextColor={colors.textSubtle} autoCapitalize="none" autoCorrect={false} />
          {coverUrl.trim() ? <Image source={{ uri: coverUrl.trim() }} style={styles.coverPreview} resizeMode="cover" /> : null}

          <Text style={styles.label}>Excerpt (optional)</Text>
          <TextInput style={[styles.input, { minHeight: 60 }]} value={excerpt} onChangeText={setExcerpt} placeholder="A one-line teaser shown in the list" placeholderTextColor={colors.textSubtle} multiline />

          <Text style={styles.label}>Tags (comma-separated)</Text>
          <TextInput style={styles.input} value={tags} onChangeText={setTags} placeholder="Burgundy, Tasting, Travel" placeholderTextColor={colors.textSubtle} />

          <Text style={styles.label}>Body</Text>
          <Text style={styles.hint}>Supports ## headings, **bold**, *italic*, &gt; quotes and - lists. Leave a blank line between paragraphs.</Text>
          <TextInput style={[styles.input, styles.bodyInput]} value={body} onChangeText={setBody} placeholder="Write your piece…" placeholderTextColor={colors.textSubtle} multiline textAlignVertical="top" />

          <View style={styles.publishRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.publishLabel}>Publish now</Text>
              <Text style={styles.publishSub}>{published ? 'Visible to everyone in Community.' : 'Kept as a private draft only you can see.'}</Text>
            </View>
            <Switch value={published} onValueChange={setPublished} trackColor={{ true: colors.gold, false: 'rgba(255,255,255,0.2)' }} thumbColor="#FFFFFF" />
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={save} disabled={saving} activeOpacity={0.85}>
            <Text style={styles.saveText}>{saving ? 'Saving…' : published ? (id ? 'Update & publish' : 'Publish') : 'Save draft'}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, color: colors.gold, width: 40 },
  title: { flex: 1, fontSize: 18, fontFamily: fonts.headingSemibold, color: '#FFFFFF', letterSpacing: 1, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  label: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8, marginTop: spacing.lg, marginBottom: 6 },
  hint: { fontSize: 12.5, fontFamily: fonts.bodyItalic, color: 'rgba(255,255,255,0.55)', marginBottom: 8, lineHeight: 18 },
  input: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: 12, fontSize: 16, fontFamily: fonts.bodyRegular, color: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.04)' },
  titleInput: { fontSize: 20, fontFamily: fonts.headingSemibold, minHeight: 52 },
  bodyInput: { minHeight: 260, lineHeight: 24 },
  coverPreview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 10, marginTop: spacing.sm },
  publishRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.xl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.lg },
  publishLabel: { fontSize: 16, fontFamily: fonts.headingSemibold, color: '#FFFFFF' },
  publishSub: { fontSize: 13, fontFamily: fonts.bodyRegular, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  saveBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.xl, backgroundColor: 'rgba(224,184,74,0.12)' },
  saveText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
});
