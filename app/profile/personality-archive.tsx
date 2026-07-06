import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { listPersonalitySketches, type PersonalitySketch } from '../../src/api/personality';
import { splitPersonality } from '../../src/utils/personalityText';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

type Category = 'wine' | 'recipe';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function PersonalityArchiveScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const cat: Category = category === 'recipe' ? 'recipe' : 'wine';
  const { session } = useAuth();

  const [sketches, setSketches] = useState<PersonalitySketch[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user.id) {
      setLoading(false);
      return;
    }
    listPersonalitySketches(session.user.id, cat)
      .then((rows) => {
        setSketches(rows);
        // Auto-expand the most recent sketch
        if (rows.length > 0) setExpandedId(rows[0].id);
      })
      .finally(() => setLoading(false));
  }, [session?.user.id, cat]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text accessibilityLabel="Back" style={[styles.back, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{cat === 'wine' ? 'Wine Personality Archive' : 'Chef Personality Archive'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : sketches.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No archive yet</Text>
          <Text style={styles.emptyBody}>
            Once Vinster has drawn a personality sketch for you, every revision will be kept here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {sketches.map((s, i) => {
            const { title, body } = splitPersonality(s.text);
            const expanded = expandedId === s.id;
            const isCurrent = i === 0;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.card, isCurrent && styles.cardCurrent]}
                onPress={() => setExpandedId(expanded ? null : s.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardDate}>{formatDate(s.created_at)}</Text>
                  {isCurrent ? <Text style={styles.currentTag}>CURRENT</Text> : null}
                </View>
                {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
                {expanded ? (
                  <Text style={styles.cardBody}>{body}</Text>
                ) : (
                  <Text style={styles.cardPreview} numberOfLines={2}>{body}</Text>
                )}
                <Text style={styles.toggle}>{expanded ? 'Hide' : 'Read'}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingTop: 70,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  back: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted, width: 40 },
  title: { fontSize: 18, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.8, flex: 1, textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: 22, fontFamily: fonts.headingBold, color: colors.text, textAlign: 'center' },
  emptyBody: { fontSize: 16, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  card: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  cardCurrent: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.06)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  cardDate: { fontSize: 12, fontFamily: fonts.bodySemibold, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  currentTag: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.gold, letterSpacing: 1 },
  cardTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.gold, letterSpacing: 0.5, lineHeight: 26, marginBottom: spacing.sm },
  cardPreview: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.textMuted, lineHeight: 20 },
  cardBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text, lineHeight: 24, marginBottom: spacing.sm },
  toggle: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, marginTop: spacing.xs },
});
