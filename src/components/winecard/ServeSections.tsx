import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CellarPick } from '../../utils/wineCardInsights';
import type { WineServingSuggestion } from '../../types/wine';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Serve tab (wine card and Wine Intel), top to bottom: Generate Recipes ·
// Serving at a Glance · Classic Ingredients Pairings · Complimentary Wine Pairings.

export function GenerateRecipesCard({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={s.recipes} onPress={onPress} activeOpacity={0.8}>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={s.recipesTitle}>Generate Recipes</Text>
        <Text style={s.recipesSub}>3 chef-inspired recipes for this wine to cook at home, save to your cookbook and share</Text>
      </View>
      <Text style={s.chevronBig}>›</Text>
    </TouchableOpacity>
  );
}

// Short stats-bar values. Older saved suggestions have long phrases
// ("16-18°C, slightly cool"), so trim them to the headline.
function headline(v?: string): string {
  return (v ?? '').split(/,|\(| — | – | - (?=[a-z])|;/)[0].trim();
}
function shortTemp(v?: string): string {
  const m = (v ?? '').match(/\d+\s*(?:[-–]\s*\d+\s*)?°\s*[CF]?/i);
  return m ? m[0].replace(/\s+/g, '').replace('-', '–') : headline(v);
}
function shortDecant(v?: string): string {
  const t = headline(v);
  if (/^(no need|not necessary|no decant|don'?t|do not|unnecessary)/i.test(t)) return 'No decant';
  return t;
}

export function ServingGlance({ serving }: { serving: WineServingSuggestion }) {
  const bar = [shortTemp(serving.temperature), shortDecant(serving.decant), headline(serving.glassware)].filter(Boolean);
  const lines: [string, string | undefined][] = [
    ['Temperature', serving.temperatureReason],
    ['Decanting', serving.decantReason],
    ['Glassware', serving.glasswareReason],
  ];
  return (
    <View style={s.section}>
      <Text style={s.h2}>Serving at a Glance</Text>
      {bar.length ? <Text style={s.bar}>{bar.join(' · ')}</Text> : null}
      <View style={s.lines}>
        {lines.filter(([, r]) => !!r?.trim()).map(([label, r]) => (
          <Text key={label} style={s.line}><Text style={s.lineLabel}>{label} · </Text>{r}</Text>
        ))}
      </View>
      <View style={s.rule} />
    </View>
  );
}

// "Top Cellar Pick" under a Drink Before / After description; when nothing in
// the home cellar fits, the wider-market offer instead.
export function CellarPickRow({ found, onOpen, onMarket }: { found: CellarPick | null; onOpen: (id: string) => void; onMarket: () => void }) {
  if (!found) {
    return (
      <TouchableOpacity style={s.pickWrap} onPress={onMarket} activeOpacity={0.7}>
        <Text style={s.pickNone}>Nothing in this style is available in your cellar yet, would you like some specific suggestions from the wider market?</Text>
        <Text style={s.link}>View suggestions ›</Text>
      </TouchableOpacity>
    );
  }
  const w = found.wine;
  const q = w.quantity ?? 1;
  return (
    <TouchableOpacity style={[s.pickWrap, s.pickRow]} onPress={() => onOpen(w.id)} activeOpacity={0.7}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={s.label}>Top Cellar Pick</Text>
        <Text style={s.pickName} numberOfLines={2}>{[w.producer, w.wine_name, w.vintage].filter(Boolean).join(' ')}</Text>
        <Text style={s.small}>{[w.region, `${q} ${q === 1 ? 'bottle' : 'bottles'}`].filter(Boolean).join(' · ')}</Text>
      </View>
      <Text style={s.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export function ComplementaryPairings({ serving, renderPick }: {
  serving: WineServingSuggestion;
  renderPick: (slot: 'before' | 'after', style: string) => React.ReactNode;
}) {
  const slots = [
    { slot: 'before' as const, label: 'Drink Before', d: serving.aperitif },
    { slot: 'after' as const, label: 'Drink After', d: serving.digestif },
  ].filter((x) => !!x.d?.style);
  if (!slots.length) return null;
  return (
    <View style={s.section}>
      <Text style={s.h2}>Complimentary Wine Pairings</Text>
      {slots.map(({ slot, label, d }) => (
        <View key={slot} style={s.card}>
          <Text style={s.label}>{label}</Text>
          {/* A description of the kind of wine — never a named wine. Older saved
              suggestions have no description, so fall back to the reason. */}
          {(d!.description || d!.reason) ? <Text style={s.desc}>{d!.description || d!.reason}</Text> : null}
          {renderPick(slot, d!.style!)}
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  recipes: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: 14, borderWidth: 1, borderColor: colors.gold, backgroundColor: colors.surface },
  recipesTitle: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.gold },
  recipesSub: { fontFamily: fonts.bodyItalic, fontSize: 13, lineHeight: 19, color: 'rgba(255,255,255,0.9)' },
  chevronBig: { fontSize: 28, color: colors.gold },
  section: { gap: 8 },
  h2: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center' },
  bar: { borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.divider, paddingVertical: 10, textAlign: 'center', fontFamily: fonts.bodySemibold, fontSize: 13, letterSpacing: 0.8, textTransform: 'uppercase', color: colors.gold },
  lines: { gap: 8, paddingTop: 4 },
  line: { fontFamily: fonts.bodyRegular, fontSize: 13.5, lineHeight: 20, color: colors.text },
  lineLabel: { fontFamily: fonts.bodySemibold, color: colors.gold },
  rule: { height: 1, backgroundColor: colors.divider, marginTop: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: spacing.md, paddingVertical: 14, gap: 8 },
  label: { fontFamily: fonts.bodyRegular, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' },
  desc: { fontFamily: fonts.bodyRegular, fontSize: 14, lineHeight: 21, color: colors.text },
  pickWrap: { marginTop: 4, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pickName: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  pickNone: { fontFamily: fonts.bodyItalic, fontSize: 12.5, color: 'rgba(255,255,255,0.8)' },
  link: { fontFamily: fonts.bodyRegular, fontSize: 13.5, color: colors.gold, marginTop: 4 },
  small: { fontFamily: fonts.bodyRegular, fontSize: 12.5, color: 'rgba(255,255,255,0.85)' },
  chevron: { fontSize: 24, color: colors.gold },
});
