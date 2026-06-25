import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { router, useLocalSearchParams } from 'expo-router';
import { useCellar, useWishList } from '../../../src/hooks/useCellar';
import { getWineKnowledge } from '../../../src/api/label';
import { WineKnowledgeShareCard } from '../../../src/components/WineKnowledgeShareCard';
import { VINSTER_TEXT_SHARE_FOOTER } from '../../../src/constants/share';
import { showAlert } from '../../../src/components/AppAlert';
import type { WineKnowledgeData } from '../../../src/types/wine';
import { colors, spacing } from '../../../src/constants/theme';
import { fonts } from '../../../src/constants/fonts';

export default function WineKnowledgeScreen() {
  // Opened either from a cellar wine card (wineId resolves a cellar row, which
  // we can also cache onto) OR from a Your Wine Reviews review that isn't in the
  // cellar — in which case the wine fields arrive as query params.
  const params = useLocalSearchParams<{
    wineId: string; producer?: string; region?: string; wineName?: string; vintage?: string; grape?: string;
  }>();
  const { wines, updateWine } = useCellar();
  const { wines: wishlistWines } = useWishList();
  const cellarWine = wines.find((w) => w.id === params.wineId) ?? wishlistWines.find((w) => w.id === params.wineId) ?? null;

  const info = {
    producer: cellarWine?.producer ?? params.producer ?? '',
    region: cellarWine?.region ?? params.region ?? '',
    wineName: cellarWine?.wine_name ?? params.wineName ?? null,
    vintage: cellarWine?.vintage ?? params.vintage ?? null,
    grape: cellarWine?.grape_variety ?? params.grape ?? null,
  };
  const hasWine = !!(cellarWine || params.producer || params.wineName);
  const infoKey = cellarWine?.id ?? `${info.producer}|${info.wineName}|${info.vintage}`;

  const [knowledge, setKnowledge] = useState<WineKnowledgeData | null>(cellarWine?.wine_knowledge ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasWine) return;
    // Cached profiles on the cellar row → instant. Otherwise generate once.
    if (cellarWine?.wine_knowledge) {
      setKnowledge(cellarWine.wine_knowledge);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWineKnowledge({
          producer: info.producer,
          region: info.region,
          wineName: info.wineName,
          vintage: info.vintage,
          grape: info.grape,
        });
        if (cancelled) return;
        setKnowledge(data);
        // Cache onto the cellar row when we have one (reviews aren't cached).
        if (cellarWine) {
          try {
            await updateWine.mutateAsync({
              id: cellarWine.id,
              updates: { wine_knowledge: data, wine_knowledge_at: new Date().toISOString() },
            });
          } catch { /* non-fatal */ }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load wine knowledge.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [infoKey]);

  // Header line — an exact replica of the wine card's header (producer · name ·
  // region · vintage dedup, then grape underneath).
  const headerLine = (() => {
    const sameName = info.wineName?.trim().toLowerCase() === info.producer?.trim().toLowerCase();
    const parts = sameName
      ? [info.producer, info.region, info.vintage]
      : [info.producer, info.wineName, info.region, info.vintage];
    return parts.filter(Boolean).join(' · ');
  })();

  // Share the four profiles as a branded PNG (same off-screen-capture pattern
  // the wine card uses), falling back to formatted text where unavailable.
  const shareRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (!knowledge || sharing) return;
    setSharing(true);
    try {
      // One paint to let the off-screen card mount.
      await new Promise((r) => setTimeout(r, 250));
      if (shareRef.current && (await Sharing.isAvailableAsync())) {
        const uri = await captureRef(shareRef, { format: 'png', quality: 1, result: 'tmpfile' });
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share wine knowledge',
          UTI: 'public.png',
        });
        return;
      }
      // Plain-text fallback for devices without share-sheet support.
      const grapeLine = info.grape ? `\n${info.grape}` : '';
      const body =
        `${headerLine}${grapeLine}\n\n` +
        `PRODUCER PROFILE\n${knowledge.producerProfile}\n\n` +
        `REGION PROFILE\n${knowledge.regionProfile}\n\n` +
        `VINTAGE PROFILE\n${knowledge.vintageProfile}\n\n` +
        `GRAPE VARIETY\n${knowledge.grapeProfile}` +
        VINSTER_TEXT_SHARE_FOOTER;
      await Share.share({ message: body, title: headerLine });
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        {knowledge ? (
          <TouchableOpacity
            onPress={handleShare}
            disabled={sharing}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.shareBtn}
          >
            <Ionicons name="share-outline" size={20} color={sharing ? colors.textMuted : colors.gold} />
            <Text style={[styles.shareText, sharing && { color: colors.textMuted }]}>{sharing ? 'Preparing…' : 'Share'}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {!hasWine ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Wine not found</Text>
          <Text style={styles.emptyBody}>Open this from a wine card or review to dive deeper.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Branded masthead — mirrors the recipe pairing page. */}
          <Text style={styles.brandHeading}>Wine Knowledge</Text>
          <Text style={styles.brandSub}>Generated by Vinster</Text>

          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Text style={styles.ruleMark}>◇</Text>
            <View style={styles.rule} />
          </View>

          {/* The wine's identity, shown once below the rule: producer · name ·
              region · vintage, with grape varieties in gold beneath. */}
          <Text style={styles.cardHeaderLine}>{headerLine}</Text>
          {info.grape ? <Text style={styles.cardGrape}>{info.grape}</Text> : null}

          <View style={styles.shortDivider} />

          {loading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={colors.gold} />
              <Text style={styles.loadingText}>Vinster is researching this wine…</Text>
            </View>
          ) : error ? (
            <View style={styles.loadingBlock}>
              <Text style={styles.emptyBody}>{error}</Text>
            </View>
          ) : knowledge ? (
            <>
              <Text style={styles.sectionLabel}>Producer Profile</Text>
              <Text style={styles.body}>{knowledge.producerProfile}</Text>

              <Text style={styles.sectionLabel}>Region Profile</Text>
              <Text style={styles.body}>{knowledge.regionProfile}</Text>

              <Text style={styles.sectionLabel}>Vintage Profile</Text>
              <Text style={styles.body}>{knowledge.vintageProfile}</Text>

              <Text style={styles.sectionLabel}>Grape Variety</Text>
              <Text style={styles.body}>{knowledge.grapeProfile}</Text>
            </>
          ) : null}
        </ScrollView>
      )}

      {/* Off-screen branded card, mounted only while a share is in flight. */}
      {sharing && knowledge ? (
        <View style={styles.shareCardWrap} pointerEvents="none">
          <WineKnowledgeShareCard
            ref={shareRef}
            headerLine={headerLine}
            grape={info.grape}
            producerProfile={knowledge.producerProfile}
            regionProfile={knowledge.regionProfile}
            vintageProfile={knowledge.vintageProfile}
            grapeProfile={knowledge.grapeProfile}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  shareBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  shareText: { fontSize: 16, fontFamily: fonts.bodySemibold, color: colors.gold },
  shareCardWrap: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 80 },

  // Wine card header replica.
  cardHeaderLine: { fontSize: 22, fontFamily: fonts.bodyBold, color: colors.text, lineHeight: 28, textAlign: 'center' },
  cardGrape: { fontSize: 13, fontFamily: fonts.bodyRegular, color: colors.gold, marginTop: 2, textAlign: 'center' },

  brandHeading: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' },
  brandSub: { fontFamily: fonts.headingItalic, fontSize: 14, color: 'rgba(224,184,74,0.75)', textAlign: 'center', marginTop: 4 },

  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.md, marginBottom: spacing.md },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.45)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm },

  wineHeader: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', lineHeight: 32 },
  shortDivider: { width: 40, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', alignSelf: 'center', marginVertical: spacing.lg },

  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },

  loadingBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
