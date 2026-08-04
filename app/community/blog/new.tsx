import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Switch, ActivityIndicator, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useAuth } from '../../../src/hooks/useAuth';
import { createBlogPost, updateBlogPost, fetchBlogPost, isVinsterOwner, type BlogPostInput } from '../../../src/api/blog';
import { extractDocumentText } from '../../../src/api/documents';
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
  const [importing, setImporting] = useState(false);

  // Import the body from a document — a phone keyboard is no place for a long
  // journal entry. .txt is read on-device; PDF and Word (.docx) go through the
  // extract-document-text edge function. Imported text is appended to whatever's
  // already in the body so it stays editable.
  async function handleImportDocument() {
    if (importing) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: [
          'text/plain',
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          '*/*',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      const name = (asset.name ?? '').toLowerCase();
      const mime = asset.mimeType ?? '';
      setImporting(true);
      let text = '';
      if (name.endsWith('.txt') || mime === 'text/plain') {
        text = await new File(asset.uri).text();
      } else if (name.endsWith('.pdf') || mime === 'application/pdf') {
        text = await extractDocumentText(await new File(asset.uri).base64(), 'pdf');
      } else if (name.endsWith('.docx') || mime.includes('wordprocessingml')) {
        text = await extractDocumentText(await new File(asset.uri).base64(), 'docx');
      } else {
        showAlert({ title: 'Unsupported file', body: 'Import a plain-text (.txt), PDF, or Word (.docx) file. Old .doc files aren’t supported — re-save as .docx or PDF.' });
        return;
      }
      if (!text.trim()) {
        showAlert({ title: 'Nothing to import', body: "Vinster couldn't read any text from that file. If it's a scanned image, try a clearer PDF." });
        return;
      }
      setBody((prev) => (prev.trim() ? `${prev.trim()}\n\n${text.trim()}` : text.trim()));
    } catch (err) {
      showAlert({ title: 'Could not import', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setImporting(false);
    }
  }

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
          <Text style={styles.hint}>Writing a long piece on a phone isn't much fun — import it from a document instead, then tweak. Supports ## headings, **bold**, *italic*, &gt; quotes and - lists.</Text>
          <TouchableOpacity onPress={handleImportDocument} disabled={importing} activeOpacity={0.7} style={styles.importRow} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            {importing ? <ActivityIndicator color={colors.gold} size="small" /> : null}
            <Text style={styles.importLink}>{importing ? 'Reading your document…' : '⭳  Import from a document (txt · Word · PDF)'}</Text>
          </TouchableOpacity>
          <TextInput style={[styles.input, styles.bodyInput]} value={body} onChangeText={setBody} placeholder="Write your piece, or import it above…" placeholderTextColor={colors.textSubtle} multiline textAlignVertical="top" />

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
  importRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 10 },
  importLink: { fontSize: 15, fontFamily: fonts.headingSemibold, color: colors.gold, letterSpacing: 0.3 },
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
