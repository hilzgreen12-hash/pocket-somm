import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { showAlert } from '../../src/components/AppAlert';
import { useAuth } from '../../src/hooks/useAuth';
import { searchRestaurantImages, type LabelImageCandidate } from '../../src/api/label';
import { uploadRestaurantPhotoFromUrl } from '../../src/api/labelPhotos';
import { setRestaurantPhotoPath } from '../../src/api/restaurantSessions';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import { MessageScreen } from '../../src/components/MessageScreen';

// "Find Online" for a restaurant visit — searches the web for photos of the
// restaurant (by name + city), lets the user pick one, and stores it as the
// visit's photo. Mirrors the wine-label find-label screen.
type Stage = 'searching' | 'choosing' | 'saving' | 'empty' | 'error';

export default function FindRestaurantPhotoScreen() {
  const { sessionId, restaurant, city } = useLocalSearchParams<{ sessionId?: string; restaurant?: string; city?: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const [stage, setStage] = useState<Stage>('searching');
  const [candidates, setCandidates] = useState<LabelImageCandidate[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const images = await searchRestaurantImages({ restaurant, city });
        if (!active) return;
        if (images.length === 0) { setStage('empty'); return; }
        setCandidates(images);
        setStage('choosing');
      } catch {
        if (active) setStage('error');
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function choose(c: LabelImageCandidate) {
    if (!session?.user.id || !sessionId || stage === 'saving') return;
    setStage('saving');
    try {
      const path = await uploadRestaurantPhotoFromUrl(session.user.id, c.url, sessionId);
      // Throws (and removes the upload) if the visit no longer exists.
      await setRestaurantPhotoPath(sessionId, path);
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save that photo', body: err instanceof Error ? err.message : 'Pick another, or try again.' });
      setStage('choosing');
    }
  }

  // A short wait either way, so a plain spinner rather than a progress counter.
  if (stage === 'searching' || stage === 'saving') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={styles.spinnerText}>
          {stage === 'saving' ? 'Adding your photo…' : `Finding photos of ${restaurant?.trim() || 'the restaurant'}…`}
        </Text>
      </View>
    );
  }

  if (stage === 'empty' || stage === 'error') {
    return (
      <MessageScreen
        title={stage === 'empty' ? 'No photos found' : 'Search failed'}
        body={stage === 'empty'
          ? "Vinster couldn't find a photo for this restaurant online. You can add one from your camera or library instead."
          : "Vinster couldn't run the search just now. Please try again in a moment."}
        action={{ label: 'Back', onPress: () => router.back() }}
        onBack={null}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Choose a photo</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={styles.note}>Tap a photo of {restaurant?.trim() || 'the restaurant'} to use for this visit.</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {candidates.map((c, i) => (
          <TouchableOpacity key={`${c.url}-${i}`} style={styles.cell} onPress={() => choose(c)} activeOpacity={0.8}>
            <Image source={{ uri: c.thumbnail || c.url }} style={styles.thumb} resizeMode="cover" />
            {c.source ? <Text style={styles.source} numberOfLines={1}>{c.source}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const GAP = spacing.sm;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 54, paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { fontSize: 22, fontFamily: fonts.bodyRegular, color: colors.gold },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontFamily: fonts.headingSemibold, color: colors.text, letterSpacing: 0.5 },
  note: { fontSize: 13, fontFamily: fonts.bodyItalic, color: colors.textMuted, textAlign: 'center', paddingHorizontal: spacing.xl, marginBottom: spacing.md, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: spacing.xl, paddingBottom: 60 },
  cell: { width: '31%', aspectRatio: 3 / 4 },
  thumb: { width: '100%', flex: 1, borderRadius: 10, backgroundColor: colors.surface },
  source: { fontSize: 10, fontFamily: fonts.bodyRegular, color: colors.textMuted, marginTop: 2 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.xl },
  spinnerText: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
