import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { SearchProgress } from '../../src/components/SearchProgress';
import { showAlert } from '../../src/components/AppAlert';
import { useAuth } from '../../src/hooks/useAuth';
import { searchLabelImages, type LabelImageCandidate } from '../../src/api/label';
import { uploadLabelImageFromUrl } from '../../src/api/labelPhotos';
import { updateCellarWine } from '../../src/api/cellar';
import { patchChosenWine } from '../../src/api/chosenWines';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';

// "Find label online" — searches the open web for candidate bottle-label images
// for a wine with no photo, lets the user pick the right one, and stores it as
// that bottle's (private) label. Vintage is not part of the search, so a shown
// result may be a different vintage — that's expected and called out up front.
type Stage = 'searching' | 'choosing' | 'saving' | 'empty' | 'error';

export default function FindLabelScreen() {
  // `kind` decides which table the chosen image is saved to: cellar wines live
  // in cellar_wines (the default), restaurant/other reviews in chosen_wines.
  const { wineId, producer, wineName, kind } = useLocalSearchParams<{ wineId?: string; producer?: string; wineName?: string; kind?: string }>();
  const { session } = useAuth();
  const qc = useQueryClient();
  const [stage, setStage] = useState<Stage>('searching');
  const [candidates, setCandidates] = useState<LabelImageCandidate[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const images = await searchLabelImages({ producer, wineName });
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
    if (!session?.user.id || !wineId || stage === 'saving') return;
    setStage('saving');
    try {
      const path = await uploadLabelImageFromUrl(session.user.id, c.url, wineId);
      if (kind === 'chosen') {
        await patchChosenWine(wineId, { label_image_path: path });
        qc.invalidateQueries({ queryKey: ['chosen-wines', session.user.id] });
      } else {
        await updateCellarWine(wineId, { label_image_path: path, label_image_fetched: true } as any);
        qc.invalidateQueries({ queryKey: ['cellar'] });
      }
      qc.invalidateQueries({ queryKey: ['label-image', path] });
      router.back();
    } catch (err) {
      showAlert({ title: 'Could not save that image', body: err instanceof Error ? err.message : 'Pick another, or try again.' });
      setStage('choosing');
    }
  }

  if (stage === 'searching' || stage === 'saving') {
    return (
      <SearchProgress
        title={stage === 'saving' ? 'Saving your label…' : 'Locating your label image…'}
        subtitle="Vinster needs a few seconds"
        body="Vinster is locating your label image. Please note that your result may show a different vintage to what you've got in your cellar."
        durationMs={12000}
      />
    );
  }

  if (stage === 'empty' || stage === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{stage === 'empty' ? 'No labels found' : 'Search failed'}</Text>
        <Text style={styles.body}>
          {stage === 'empty'
            ? "Vinster couldn't find a label image for this wine online. You can add one from your camera or library instead."
            : "Vinster couldn't run the search just now. Please try again in a moment."}
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.btnText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Choose a label</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={styles.note}>Tap the image that matches your bottle. It may be a different vintage — that's fine.</Text>
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
  title: { fontSize: 20, fontFamily: fonts.headingBold, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  body: { fontSize: 14, fontFamily: fonts.bodyRegular, color: colors.textMuted, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  btnText: { color: colors.gold, fontFamily: fonts.headingSemibold, fontSize: 16 },
});
