import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../src/hooks/useAuth';
import { supabase } from '../../src/api/supabase';
import { splitPersonality } from '../../src/utils/personalityText';
import { colors, spacing } from '../../src/constants/theme';

interface CommunityProfileRow {
  user_id: string;
  username: string;
  wine_personality: string | null;
  recipe_personality: string | null;
  updated_at: string;
}

interface PrivateCache {
  last_wine_personality: string | null;
  last_recipe_personality: string | null;
}

export default function CommunityProfileScreen() {
  const { session } = useAuth();
  const qc = useQueryClient();

  const username = session?.user.user_metadata?.display_name
    || (session?.user.email?.split('@')[0] ?? 'Anonymous');

  // Pulled from the public community_profiles table — what's currently
  // visible to other users.
  const { data: published, isLoading: pubLoading } = useQuery({
    queryKey: ['community-profile', session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('community_profiles')
        .select('*')
        .eq('user_id', session!.user.id)
        .maybeSingle();
      return (data ?? null) as CommunityProfileRow | null;
    },
  });

  // Pulled from the user's private profile — generated personalities the
  // user can publish to the community.
  const { data: cached, isLoading: cacheLoading } = useQuery({
    queryKey: ['community-personality-cache', session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('last_wine_personality, last_recipe_personality')
        .eq('user_id', session!.user.id)
        .maybeSingle();
      return (data ?? { last_wine_personality: null, last_recipe_personality: null }) as PrivateCache;
    },
  });

  const [savingWine, setSavingWine] = useState(false);
  const [savingRecipe, setSavingRecipe] = useState(false);

  async function publish(field: 'wine_personality' | 'recipe_personality', text: string) {
    if (!session?.user.id) return;
    const setter = field === 'wine_personality' ? setSavingWine : setSavingRecipe;
    setter(true);
    try {
      const { error } = await supabase.from('community_profiles').upsert({
        user_id: session.user.id,
        username,
        [field]: text,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['community-profile', session.user.id] });
    } catch (err: any) {
      Alert.alert('Could not publish', err?.message || 'Please try again.');
    } finally {
      setter(false);
    }
  }

  async function unpublish(field: 'wine_personality' | 'recipe_personality') {
    if (!session?.user.id) return;
    try {
      const { error } = await supabase
        .from('community_profiles')
        .update({ [field]: null, updated_at: new Date().toISOString() })
        .eq('user_id', session.user.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ['community-profile', session.user.id] });
    } catch {
      Alert.alert('Could not update', 'Please try again.');
    }
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Sign in required</Text>
      </View>
    );
  }

  const loading = pubLoading || cacheLoading;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.intro}>
          <Text style={styles.heading}>Your Community Profile</Text>
          <Text style={styles.subheading}>This is what other Vinster users see when they come across your reviews. Your username is set in Account; your personalities are generated from your profile in Wine Profile and Restaurant Reviews.</Text>
        </View>

        {/* Username */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Username</Text>
          <Text style={styles.usernameText}>{username}</Text>
          <Text style={styles.helper}>Change it under Account → Username.</Text>
        </View>

        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.gold} />
          </View>
        ) : (
          <>
            {/* Wine personality — generated from Profile, publishable here */}
            <PersonalityBlock
              title="Wine personality"
              cachedText={cached?.last_wine_personality ?? null}
              publishedText={published?.wine_personality ?? null}
              onPublish={(t) => publish('wine_personality', t)}
              onUnpublish={() => unpublish('wine_personality')}
              saving={savingWine}
              generateRoute="/profile/personality?category=wine"
            />

            {/* Chef personality — generated from Profile, publishable here */}
            <PersonalityBlock
              title="Chef personality"
              cachedText={cached?.last_recipe_personality ?? null}
              publishedText={published?.recipe_personality ?? null}
              onPublish={(t) => publish('recipe_personality', t)}
              onUnpublish={() => unpublish('recipe_personality')}
              saving={savingRecipe}
              generateRoute="/profile/personality?category=recipe"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PersonalityBlock({
  title,
  cachedText,
  publishedText,
  onPublish,
  onUnpublish,
  saving,
  generateRoute,
}: {
  title: string;
  cachedText: string | null;
  publishedText: string | null;
  onPublish: (text: string) => void;
  onUnpublish: () => void;
  saving: boolean;
  generateRoute: string;
}) {
  const isLatestPublished = !!publishedText && publishedText === cachedText;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>

      {publishedText ? (
        <View style={styles.publishedCard}>
          <Text style={styles.publishedLabel}>Published</Text>
          {(() => {
            const { title, body } = splitPersonality(publishedText);
            return (
              <>
                {title ? <Text style={styles.publishedTitle}>{title}</Text> : null}
                <Text style={styles.publishedText}>{body}</Text>
              </>
            );
          })()}
        </View>
      ) : (
        <Text style={styles.helper}>Not yet published to the community.</Text>
      )}

      {cachedText ? (
        <>
          {!isLatestPublished && (
            <View style={styles.latestCard}>
              <Text style={styles.latestLabel}>Latest from Vinster</Text>
              {(() => {
                const { title, body } = splitPersonality(cachedText);
                return (
                  <>
                    {title ? <Text style={styles.latestTitle}>{title}</Text> : null}
                    <Text style={styles.latestText}>{body}</Text>
                  </>
                );
              })()}
            </View>
          )}
          <TouchableOpacity
            style={[styles.publishBtn, saving && styles.btnDisabled]}
            onPress={() => onPublish(cachedText)}
            disabled={saving || isLatestPublished}
          >
            <Text style={styles.publishBtnText}>
              {saving ? 'Publishing…' : isLatestPublished ? 'Already published' : (publishedText ? 'Update with latest' : 'Publish to community')}
            </Text>
          </TouchableOpacity>
          {publishedText && (
            <TouchableOpacity onPress={onUnpublish} style={styles.unpublishBtn}>
              <Text style={styles.unpublishText}>Unpublish</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <TouchableOpacity style={styles.generateBtn} onPress={() => router.push(generateRoute as any)}>
          <Text style={styles.generateBtnText}>Generate it now</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  backRow: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  intro: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center', gap: spacing.xs },
  heading: { fontFamily: 'CormorantGaramond_700Bold', fontSize: 30, color: colors.text, letterSpacing: 1, textAlign: 'center' },
  subheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginTop: spacing.xs, paddingHorizontal: spacing.md },
  section: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, gap: spacing.sm },
  sectionLabel: { fontSize: 12, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2 },
  usernameText: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.text },
  helper: { fontSize: 13, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.textMuted, lineHeight: 18 },
  loadingRow: { padding: spacing.xl, alignItems: 'center' },
  emptyTitle: { fontSize: 22, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, textAlign: 'center' },
  publishedCard: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, backgroundColor: 'rgba(212,176,96,0.06)', gap: spacing.xs },
  publishedLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.gold, textTransform: 'uppercase', letterSpacing: 0.8 },
  publishedTitle: { fontSize: 18, fontFamily: 'CormorantGaramond_700Bold', color: colors.gold, lineHeight: 24, marginBottom: 2 },
  publishedText: { fontSize: 15, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, lineHeight: 22 },
  latestCard: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, padding: spacing.md, gap: spacing.xs, marginTop: spacing.sm },
  latestLabel: { fontSize: 11, fontFamily: 'CormorantGaramond_600SemiBold', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  latestTitle: { fontSize: 16, fontFamily: 'CormorantGaramond_700Bold', color: colors.text, lineHeight: 22, marginBottom: 2 },
  latestText: { fontSize: 14, fontFamily: 'CormorantGaramond_400Regular_Italic', color: colors.text, lineHeight: 20 },
  publishBtn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  publishBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 15, color: colors.gold },
  btnDisabled: { opacity: 0.5 },
  unpublishBtn: { alignItems: 'center', paddingVertical: spacing.sm },
  unpublishText: { fontFamily: 'CormorantGaramond_400Regular', fontSize: 13, color: colors.textMuted, textDecorationLine: 'underline' },
  generateBtn: { borderWidth: 1, borderColor: colors.borderLight, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  generateBtnText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: colors.textMuted },
});
