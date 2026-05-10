import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { showAlert } from '../../src/components/AppAlert';
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
      showAlert({ title: 'Could not update', body: 'Please try again.' });
    }
  }

  if (!session) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Sign in required</Text>
      </View>
    );
  }

  const loading = pubLoading;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.intro}>
          <Text style={styles.heading}>Your Community Profile</Text>
          <Text style={styles.subheading}>This is what other Vinster users see when they come across your reviews. Your username can be edited in your account and your personality sketches can be uploaded from Your Profile.</Text>
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
            {/* Wine personality — posted from the user's Profile screen */}
            <PersonalityBlock
              title="Wine personality"
              publishedText={published?.wine_personality ?? null}
              onUnpublish={() => unpublish('wine_personality')}
            />

            {/* Chef personality — posted from the user's Profile screen */}
            <PersonalityBlock
              title="Chef personality"
              publishedText={published?.recipe_personality ?? null}
              onUnpublish={() => unpublish('recipe_personality')}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

function PersonalityBlock({
  title,
  publishedText,
  onUnpublish,
}: {
  title: string;
  publishedText: string | null;
  onUnpublish: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{title}</Text>

      {publishedText ? (
        <>
          <View style={styles.publishedCard}>
            {(() => {
              const { title: sketchTitle, body } = splitPersonality(publishedText);
              return (
                <>
                  {sketchTitle ? <Text style={styles.publishedTitle}>{sketchTitle}</Text> : null}
                  <Text style={styles.publishedText}>{body}</Text>
                </>
              );
            })()}
          </View>
          <TouchableOpacity onPress={onUnpublish} style={styles.unpublishBtn}>
            <Text style={styles.unpublishText}>Delete personality from your community profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.helper}>Not yet posted to your community profile. You can post it from Your Profile → Wine/Chef Personality.</Text>
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
