import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../../src/api/supabase';
import { useAuth } from '../../src/hooks/useAuth';
import { useScanStore } from '../../src/stores/scanStore';
import { colors, spacing, typography } from '../../src/constants/theme';
import type { ScanSession } from '../../src/types/scan';

export default function HistoryTab() {
  const { session } = useAuth();
  const { setExtractedWines, setRecommendation } = useScanStore();

  function handleOpen(item: ScanSession) {
    setExtractedWines(item.extracted_wines as any);
    setRecommendation(item.recommendation as any);
    const params = new URLSearchParams({ fromHistory: 'true', sessionId: item.id });
    if (item.restaurant_name) params.set('restaurant', item.restaurant_name);
    if (item.city) params.set('city', item.city);
    router.push(`/scan/results?${params.toString()}`);
  }

  const { data: sessions, isLoading, isError } = useQuery({
    queryKey: ['scan-sessions', session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scan_sessions')
        .select('*')
        .order('captured_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as ScanSession[];
    },
  });

  if (!session) {
    return (
      <View style={styles.guestContainer}>
        <Text style={styles.guestTitle}>Sign in to see your history</Text>
        <Text style={styles.guestBody}>Your past scans and recommendations will appear here.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/(auth)/sign-in')}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={typography.body}>Loading history…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Couldn't load history</Text>
        <Text style={styles.emptyBody}>Check your connection and try again.</Text>
      </View>
    );
  }

  if (!sessions?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptyBody}>Scan a wine list to get your first recommendation.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Scan History</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleOpen(item)} activeOpacity={0.7}>
            <Text style={styles.cardDate}>
              {format(new Date(item.captured_at), 'd MMM yyyy · h:mm a')}
            </Text>
            {item.restaurant_name && (
              <Text style={styles.cardRestaurant}>{item.restaurant_name}</Text>
            )}
            {item.recommendation?.wines?.[0] && (
              <Text style={styles.cardWine}>{item.recommendation.wines[0].name}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing.md,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  cardRestaurant: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  cardWine: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 2,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  guestBody: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
