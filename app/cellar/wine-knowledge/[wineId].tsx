import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCellar, useWishList } from '../../../src/hooks/useCellar';
import { useAuth } from '../../../src/hooks/useAuth';
import { getWineKnowledge } from '../../../src/api/label';
import { WineIdentityHeader } from '../../../src/components/WineIdentityHeader';
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
  const { session } = useAuth();
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
    // Cached profiles on the cellar row → instant. But a cache from before the
    // stats bars existed (no producerStats) is regenerated once so it upgrades
    // to the richer shape. A blend's grape profile now carries a per-vintage
    // percentage breakdown, so a pre-change blend cache (no "%" in grapeProfile)
    // is likewise regenerated once.
    const cachedK = cellarWine?.wine_knowledge;
    const isBlend = /[,&]|\band\b/i.test(info.grape ?? '');
    const blendStale = !!cachedK && isBlend && !(cachedK.grapeProfile ?? '').includes('%');
    if (cachedK && cachedK.producerStats !== undefined && !blendStale) {
      setKnowledge(cachedK);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text accessibilityLabel="Back" style={[styles.backText, { color: colors.gold, fontSize: 22 }]}>←</Text>
        </TouchableOpacity>
        <View style={{ width: 44 }} />
      </View>

      {!hasWine ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Wine not found</Text>
          <Text style={styles.emptyBody}>Open this from a wine card or review to dive deeper.</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Branded masthead — mirrors the recipe pairing page. */}
          <Text style={styles.brandHeading}>Wine Knowledge</Text>
          <Text style={styles.brandSub}>Generated by Vinster</Text>

          <View style={styles.ruleRow}>
            <View style={styles.rule} />
            <Text style={styles.ruleMark}>◇</Text>
            <View style={styles.rule} />
          </View>

          {/* The wine's identity, shown once below the rule — the app-wide
              format: Producer · Name · Vintage (white), Region + Grape (gold). */}
          <WineIdentityHeader
            producer={info.producer}
            wineName={info.wineName}
            vintage={info.vintage}
            region={info.region}
            grape={info.grape}
            align="center"
            size="lg"
          />

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
              {(() => {
                const s = knowledge.producerStats;
                const items = s ? [
                  s.founded ? `Circa ${s.founded}` : null,
                  s.annualBottles ? `Est. ${s.annualBottles} bottles/yr` : null,
                  s.hectares ? `${s.hectares}` : null,
                ].filter(Boolean) : [];
                return items.length ? (
                  <View style={styles.statsBar}><Text style={styles.statsText}>{items.join('   ·   ')}</Text></View>
                ) : null;
              })()}
              <Text style={styles.body}>{knowledge.producerProfile}</Text>

              <Text style={styles.sectionLabel}>Region Profile{info.region ? <Text style={styles.sectionValue}>{`:  ${info.region}`}</Text> : null}</Text>
              {(() => {
                const s = knowledge.regionStats;
                const items = s ? [s.climate, s.soil, s.altitude].filter(Boolean) : [];
                return items.length ? (
                  <View style={styles.statsBar}><Text style={styles.statsText}>{items.join('   ·   ')}</Text></View>
                ) : null;
              })()}
              <Text style={styles.body}>{knowledge.regionProfile}</Text>

              <Text style={styles.sectionLabel}>Vintage Profile{info.vintage ? <Text style={styles.sectionValue}>{`:  ${info.vintage}`}</Text> : null}</Text>
              {(() => {
                const s = knowledge.vintageStats;
                if (!s || (!s.comparableVintages && !s.describedAs)) return null;
                return (
                  <View style={styles.statsBar}>
                    {s.comparableVintages ? <Text style={styles.statsText}><Text style={styles.statsKey}>Comparable Vintages: </Text>{s.comparableVintages}</Text> : null}
                    {s.describedAs ? <Text style={[styles.statsText, s.comparableVintages ? styles.statsTextSecond : null]}><Text style={styles.statsKey}>Described As: </Text>{s.describedAs}</Text> : null}
                  </View>
                );
              })()}
              <Text style={styles.body}>{knowledge.vintageProfile}</Text>

              <Text style={styles.sectionLabel}>Grape Variety{info.grape ? <Text style={styles.sectionValue}>{`:  ${info.grape}`}</Text> : null}</Text>
              {(() => {
                const s = knowledge.grapeStats;
                if (!s || (!s.characteristics && !s.grownIn)) return null;
                return (
                  <View style={styles.statsBar}>
                    {s.characteristics ? <Text style={styles.statsText}><Text style={styles.statsKey}>Typical Characteristics: </Text>{s.characteristics}</Text> : null}
                    {s.grownIn ? <Text style={[styles.statsText, s.characteristics ? styles.statsTextSecond : null]}><Text style={styles.statsKey}>Grown in: </Text>{s.grownIn}</Text> : null}
                  </View>
                );
              })()}
              <Text style={styles.body}>{knowledge.grapeProfile}</Text>
            </>
          ) : null}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  // Must fill the remaining height so its content scrolls — without flex:1 the
  // ScrollView hugs its content and overflows the screen with nothing to scroll.
  scroll: { flex: 1 },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  shareText: { fontSize: 16, fontFamily: fonts.headingRegular, color: colors.gold },
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
  // The wine-specific value appended to a section header (e.g. "Pomerol",
  // "2010", "Cabernet Franc & Merlot") — one consistent font + colour, matching
  // the header's gold but in normal case so it reads naturally.
  sectionValue: { fontFamily: fonts.bodySemibold, color: colors.gold, textTransform: 'none', letterSpacing: 0 },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  // Compact facts bar beneath each section label — specifics, not prose.
  statsBar: { borderWidth: 1, borderColor: 'rgba(224,184,74,0.35)', borderRadius: 10, backgroundColor: 'rgba(224,184,74,0.06)', paddingVertical: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  statsText: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, lineHeight: 19 },
  statsTextSecond: { marginTop: 4 },
  statsKey: { fontFamily: fonts.bodyRegular, color: colors.textMuted },

  loadingBlock: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  loadingText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
});
