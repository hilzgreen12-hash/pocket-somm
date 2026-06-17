import { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useLabelStore } from '../../src/stores/labelStore';
import { useChefLabelHistory } from '../../src/hooks/useChefHistory';
import { wineHeaderLine } from '../../src/utils/wineHeader';
import { showAlert } from '../../src/components/AppAlert';
import { RecipeShareCard } from '../../src/components/RecipeShareCard';
import { VINSTER_INSTALL_URL, VINSTER_GET_LABEL, VINSTER_TAGLINE } from '../../src/constants/share';
import { colors, spacing } from '../../src/constants/theme';
import { fonts } from '../../src/constants/fonts';
import type { Pairing, WineDetailsComplete } from '../../src/types/wine';

// Full-screen "artifact" view of a single pairing — the surface users
// hand to friends (Share) and to printers (Print). Designed to feel like
// a recipe document rather than an in-app card: more breathing room,
// branded header, prominent wine + dish, and a Get Vinster footer so
// the receiver knows where to find Vinster.
//
// Sources:
//   - Fresh result: ?index=N reads labelStore.pairings[N] + wineDetailsConfirmed
//   - Saved cookbook: ?sessionId=X reads from useChefLabelHistory
export default function RecipeFullScreen() {
  const { index, sessionId } = useLocalSearchParams<{ index?: string; sessionId?: string }>();
  const { wineDetailsConfirmed, pairings: freshPairings } = useLabelStore();
  const { sessions: labelSessions } = useChefLabelHistory();
  const shareCardRef = useRef<View>(null);
  const [sharing, setSharing] = useState(false);
  const [printing, setPrinting] = useState(false);

  // Resolve the pairing + wine from whichever source the caller indicated.
  const { pairing, wine } = useMemo<{ pairing: Pairing | null; wine: WineDetailsComplete | null }>(() => {
    if (sessionId) {
      const s = labelSessions.find((row) => row.id === sessionId);
      if (s) return { pairing: s.pairings[0] ?? null, wine: s.wine ?? null };
      return { pairing: null, wine: null };
    }
    const i = parseInt(index ?? '0', 10);
    const p = !Number.isNaN(i) ? freshPairings[i] ?? null : null;
    return { pairing: p, wine: wineDetailsConfirmed ?? null };
  }, [sessionId, labelSessions, index, freshPairings, wineDetailsConfirmed]);

  // Wine header line used both on-screen and in the print HTML.
  const wineLine = wine
    ? wineHeaderLine(wine.producer, wine.wineName, wine.vintage)
    : '';

  async function handleShare() {
    if (!pairing || sharing) return;
    setSharing(true);
    try {
      if (shareCardRef.current) {
        const uri = await captureRef(shareCardRef, { format: 'png', quality: 1, result: 'tmpfile' });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: pairing.dishName, UTI: 'public.png' });
        }
      }
    } catch (err) {
      showAlert({ title: 'Could not share', body: err instanceof Error ? err.message : 'Please try again.' });
    } finally {
      setSharing(false);
    }
  }

  async function handlePrint() {
    if (!pairing || printing) return;
    setPrinting(true);
    try {
      // Lazy require so this file typechecks before expo-print lands in
      // node_modules. The next EAS build installs it; until then the
      // catch below shows a graceful fallback message.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Print = require('expo-print');
      await Print.printAsync({ html: buildPrintHtml(pairing, wineLine) });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('Cannot find module') || msg.includes("Can't find variable")) {
        showAlert({ title: 'Print not available yet', body: 'Print will work in the next app build.' });
      } else if (!msg.toLowerCase().includes('cancel')) {
        showAlert({ title: 'Could not print', body: msg });
      }
    } finally {
      setPrinting(false);
    }
  }

  if (!pairing || !wine) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Recipe not available</Text>
          <Text style={styles.emptyBody}>The pairing couldn't be loaded — try opening it again from your Chef results.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} disabled={sharing || printing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionLink, (sharing || printing) && { opacity: 0.4 }]}>
              {sharing ? 'PREPARING…' : '+ SHARE'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} disabled={sharing || printing} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={[styles.actionLink, (sharing || printing) && { opacity: 0.4 }]}>
              {printing ? 'PRINTING…' : '+ PRINT'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brandHeading}>Recipe Pairing</Text>
        <Text style={styles.brandSub}>Generated by Vinster</Text>

        <View style={styles.ruleRow}>
          <View style={styles.rule} />
          <Text style={styles.ruleMark}>◇</Text>
          <View style={styles.rule} />
        </View>

        <Text style={styles.toPair}>To pair with</Text>
        <Text style={styles.wineHeader}>{wineLine}</Text>

        <View style={styles.shortDivider} />

        <Text style={styles.dishName}>{pairing.dishName}</Text>
        <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
        <Text style={styles.meta}>Serves {pairing.recipe.servings} · Prep {pairing.recipe.prepTime} · Cook {pairing.recipe.cookTime}</Text>

        <Text style={styles.sectionLabel}>Pairing notes</Text>
        <Text style={styles.body}>{pairing.pairingNotes}</Text>

        <Text style={styles.sectionLabel}>Introduction</Text>
        <Text style={styles.body}>{pairing.introduction}</Text>

        <Text style={styles.sectionLabel}>Ingredients</Text>
        {pairing.recipe.ingredients.map((ing, i) => (
          <Text key={i} style={styles.bullet}>· {ing}</Text>
        ))}

        <Text style={styles.sectionLabel}>Method</Text>
        {pairing.recipe.instructions.map((step, i) => (
          <Text key={i} style={styles.bullet}>{step}</Text>
        ))}

        <View style={styles.footerRule} />
        <View style={styles.footerBlock}>
          <Text style={styles.footerHeadline}>{VINSTER_GET_LABEL}</Text>
          <Text style={styles.footerTagline}>{VINSTER_TAGLINE}</Text>
        </View>

        {(sharing || printing) && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator color={colors.gold} />
          </View>
        )}
      </ScrollView>

      {/* Off-screen share card captured by handleShare to produce the
          branded PNG that ends up in the user's share sheet. Identical
          look to the share inside chef/results so the artefact users
          send out is consistent regardless of which surface they share
          from. */}
      <View style={styles.offscreen} pointerEvents="none">
        <RecipeShareCard ref={shareCardRef} pairing={pairing} wineHeader={wineLine || null} />
      </View>
    </View>
  );
}

// Build the printable HTML version. Different aesthetic from the in-app
// view — white background, dark text, clean serif — designed to look
// like a proper recipe document on paper. Footer carries the Get Vinster
// CTA so the printout still drives the brand.
function buildPrintHtml(pairing: Pairing, wineLine: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ingredients = pairing.recipe.ingredients.map((i) => `<li>${esc(i)}</li>`).join('');
  const method = pairing.recipe.instructions.map((step, i) => `<li>${esc(step)}</li>`).join('');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>${esc(pairing.dishName)} — Vinster</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; color: #1A1A1A; margin: 40px; line-height: 1.5; }
  .brand { text-align: center; letter-spacing: 6px; font-size: 14px; color: #8A6A1F; text-transform: uppercase; margin-bottom: 6px; }
  .brand-sub { text-align: center; font-style: italic; color: #8A6A1F; font-size: 13px; margin-bottom: 24px; }
  .to-pair { text-align: center; font-size: 13px; color: #555; text-transform: uppercase; letter-spacing: 2px; }
  .wine { text-align: center; font-size: 22px; font-weight: bold; margin: 4px 0 28px; }
  hr { border: none; border-top: 1px solid #DDD; margin: 16px 0 24px; }
  h1 { font-size: 28px; margin: 0 0 4px; font-weight: bold; }
  .chef { font-style: italic; color: #444; margin-bottom: 4px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
  h2 { font-size: 16px; text-transform: uppercase; letter-spacing: 2px; color: #8A6A1F; margin: 24px 0 8px; }
  p, li { font-size: 14px; }
  ul, ol { padding-left: 20px; }
  ul li { margin-bottom: 4px; }
  ol li { margin-bottom: 10px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #DDD; text-align: center; font-size: 13px; color: #555; }
  .footer .get { letter-spacing: 4px; color: #8A6A1F; font-weight: bold; }
  .footer .url { color: #1A1A1A; font-weight: bold; margin-top: 4px; }
</style></head><body>
  <div class="brand">Recipe Pairing</div>
  <div class="brand-sub">Generated by Vinster</div>
  <div class="to-pair">To pair with</div>
  <div class="wine">${esc(wineLine || '')}</div>
  <hr/>
  <h1>${esc(pairing.dishName)}</h1>
  <div class="chef">Inspired by ${esc(pairing.chefInspiration)}</div>
  <div class="meta">Serves ${esc(String(pairing.recipe.servings))} · Prep ${esc(pairing.recipe.prepTime)} · Cook ${esc(pairing.recipe.cookTime)}</div>
  <h2>Pairing notes</h2>
  <p>${esc(pairing.pairingNotes)}</p>
  <h2>Introduction</h2>
  <p>${esc(pairing.introduction)}</p>
  <h2>Ingredients</h2>
  <ul>${ingredients}</ul>
  <h2>Method</h2>
  <ol>${method}</ol>
  <div class="footer">
    <div class="get">GET VINSTER</div>
    <div>${esc(VINSTER_TAGLINE)}</div>
    <div class="url">${VINSTER_INSTALL_URL.replace(/^https?:\/\//, '')}</div>
  </div>
</body></html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingTop: 70, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backText: { fontSize: 16, fontFamily: fonts.bodyRegular, color: colors.textMuted },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  actionLink: { fontFamily: fonts.headingSemibold, fontSize: 13, color: colors.gold, letterSpacing: 1.5, textTransform: 'uppercase' },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: 80 },

  brandHeading: { fontFamily: fonts.headingSemibold, fontSize: 14, color: colors.gold, letterSpacing: 4, textTransform: 'uppercase', textAlign: 'center' },
  brandSub: { fontFamily: fonts.headingItalic, fontSize: 14, color: 'rgba(224,184,74,0.75)', textAlign: 'center', marginTop: 4 },

  ruleRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch', marginTop: spacing.md, marginBottom: spacing.md, paddingHorizontal: spacing.xl },
  rule: { flex: 1, height: 1, backgroundColor: 'rgba(224,184,74,0.45)' },
  ruleMark: { color: colors.gold, fontSize: 12, marginHorizontal: spacing.sm },

  toPair: { fontFamily: fonts.bodySemibold, fontSize: 12, color: colors.textMuted, letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' },
  wineHeader: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center', marginTop: 4, lineHeight: 28 },
  shortDivider: { width: 40, height: 1, backgroundColor: 'rgba(224,184,74,0.55)', alignSelf: 'center', marginVertical: spacing.lg },

  dishName: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.text, lineHeight: 34 },
  chefInspiration: { fontFamily: fonts.bodyItalic, fontSize: 16, color: colors.gold, marginTop: 2 },
  meta: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted, marginTop: 6 },

  sectionLabel: { fontFamily: fonts.bodySemibold, fontSize: 13, color: colors.gold, letterSpacing: 2.5, textTransform: 'uppercase', marginTop: spacing.lg, marginBottom: spacing.xs },
  body: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24 },
  bullet: { fontFamily: fonts.bodyRegular, fontSize: 16, color: colors.text, lineHeight: 24, marginBottom: 4 },

  footerRule: { height: 1, backgroundColor: 'rgba(224,184,74,0.45)', marginTop: spacing.xxl, marginBottom: spacing.md },
  footerBlock: { alignItems: 'center', paddingBottom: spacing.lg },
  footerHeadline: { fontFamily: fonts.headingBold, fontSize: 18, color: colors.gold, letterSpacing: 4 },
  footerTagline: { fontFamily: fonts.headingItalic, fontSize: 14, color: 'rgba(255,255,255,0.70)', marginTop: 6, textAlign: 'center' },
  footerUrl: { fontFamily: fonts.headingSemibold, fontSize: 16, color: '#FFFFFF', marginTop: 6, letterSpacing: 0.5 },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text, textAlign: 'center' },
  emptyBody: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },

  busyOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  // Render the share card off-screen so captureRef can produce the PNG
  // without affecting the visible layout.
  offscreen: { position: 'absolute', left: -10000, top: 0, opacity: 0 },
});
