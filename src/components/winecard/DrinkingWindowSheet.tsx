import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { stageFrom, STAGE_LABEL, type DrinkingStage } from '../../utils/maturity';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Tap "Window" on a wine card / Wine Intel → where the wine sits in its drinking
// window: a timeline with Too Young before it, the window split into its five
// stages (Approachable · Within Peak · Sweet Spot · Getting On · Drink Up — a
// fifth of the window each) and Declining after, with a "Now" marker. The
// stages are the ones shown on every card and filter (utils/maturity).
type Props = {
  visible: boolean;
  onClose: () => void;
  wineName: string;
  from: number | null | undefined;
  to: number | null | undefined;
  // Stored status, used only when there are no window years.
  fallbackStatus?: string | null;
};

const yrs = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`;

// What the stage means for this bottle, in a sentence.
function summary(from: number, to: number, nowYear: number, stage: DrinkingStage): string {
  const left = to - nowYear;
  const keep = left > 0 ? ` It should drink well until ${to} (${yrs(left)} more).` : ` Its window closes this year.`;
  switch (stage) {
    case 'too_young': return `Its window opens in ${from}${from - nowYear > 0 ? `, in ${yrs(from - nowYear)}` : ''}. Best kept until then; it should drink well until ${to}.`;
    case 'approachable': return `Early in its ${from}–${to} window: drinkable now, with its best years still ahead.${keep}`;
    case 'within_peak': return `Coming into its best within its ${from}–${to} window.${keep}`;
    case 'sweet_spot': return `In the heart of its ${from}–${to} window — drinking at its best.${keep}`;
    case 'getting_on': return `Past the middle of its ${from}–${to} window: still drinking well, but don't leave it too long.${keep}`;
    case 'drink_up': return `In the last stretch of its ${from}–${to} window — time to open it.${keep}`;
    case 'declining': return `Past the close of its window by ${yrs(Math.max(1, nowYear - to))} (${to}). Drink soon if it's still sound.`;
    default: return "Vinster doesn't have drinking-window years for this wine yet.";
  }
}

// The five in-window stages, youngest first, in deepening gold.
const WINDOW_BANDS: { stage: DrinkingStage; style: object }[] = [
  { stage: 'approachable', style: { backgroundColor: 'rgba(224,184,74,0.40)' } },
  { stage: 'within_peak', style: { backgroundColor: 'rgba(224,184,74,0.65)' } },
  { stage: 'sweet_spot', style: { backgroundColor: 'rgba(224,184,74,1)' } },
  { stage: 'getting_on', style: { backgroundColor: 'rgba(224,184,74,0.65)' } },
  { stage: 'drink_up', style: { backgroundColor: 'rgba(224,184,74,0.40)' } },
];

export function DrinkingWindowSheet({ visible, onClose, wineName, from, to, fallbackStatus }: Props) {
  const today = new Date();
  const nowYear = today.getFullYear();
  const hasYears = typeof from === 'number' && typeof to === 'number' && Number.isFinite(from) && Number.isFinite(to) && to >= from;
  // Same rule as the card's Window stat: stageFrom on the raw years + stored
  // status, so a one-sided or inverted window reads the same in both places.
  // hasYears only decides whether the slider (which needs both ends) is drawn.
  const stage = stageFrom(from, to, fallbackStatus, today);
  const fromOk = typeof from === 'number' && Number.isFinite(from);
  const toOk = typeof to === 'number' && Number.isFinite(to);
  const partialBlurb = stage === 'too_young' && fromOk
    ? `Its window opens in ${from}${(from as number) - nowYear > 0 ? `, in ${yrs((from as number) - nowYear)}` : ''}.`
    : stage === 'declining' && toOk
      ? `Past the close of its window by ${yrs(Math.max(1, nowYear - (to as number)))} (${to}). Drink soon if it's still sound.`
      : "Vinster doesn't have drinking-window years for this wine yet.";

  let bar: React.ReactNode = null;
  if (hasYears) {
    const f = from as number;
    const t = (to as number) + 1; // the window runs to the end of its last year
    const nowPos = nowYear + (today.getMonth() + 0.5) / 12;
    const start = Math.min(f - 3, Math.floor(nowPos) - 1);
    const end = Math.max(t + 3, Math.ceil(nowPos) + 1);
    const pct = (y: number) => `${((y - start) / (end - start)) * 100}%` as const;
    const width = (a: number, b: number) => `${((b - a) / (end - start)) * 100}%` as const;
    const fifth = (t - f) / 5;
    bar = (
      <View style={styles.slider}>
        <View style={[styles.nowWrap, { left: pct(nowPos) }]} pointerEvents="none">
          <Text style={styles.nowLabel} allowFontScaling={false}>Now · {nowYear}</Text>
          <View style={styles.nowLine} />
        </View>
        <View style={styles.track}>
          <View style={[styles.zone, styles.young, { left: pct(start), width: width(start, f) }]} />
          {WINDOW_BANDS.map((b, i) => (
            <View key={b.stage} style={[styles.zone, b.style, { left: pct(f + fifth * i), width: width(f + fifth * i, f + fifth * (i + 1)) }]} />
          ))}
          <View style={[styles.zone, styles.declining, { left: pct(t), width: width(t, end) }]} />
        </View>
        <View style={styles.ticks}>
          <Text style={[styles.tick, { left: pct(f) }]} allowFontScaling={false}>{f}</Text>
          {to !== from ? <Text style={[styles.tick, { left: pct(t) }]} allowFontScaling={false}>{to}</Text> : null}
        </View>
        <View style={styles.legend}>
          {[['Too Young', styles.young], ...WINDOW_BANDS.map((b) => [STAGE_LABEL[b.stage], b.style]), ['Declining', styles.declining]].map(([l, st]) => (
            <View key={l as string} style={styles.legendItem}><View style={[styles.legendSwatch, st as object]} /><Text style={styles.legendText}>{l as string}</Text></View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Drinking Window</Text>
          {wineName ? <Text style={styles.wineName} numberOfLines={2}>{wineName}</Text> : null}
          <Text style={styles.status}>
            {STAGE_LABEL[stage]}
            {hasYears ? <Text style={styles.statusYears}> · {from}–{to}</Text> : null}
          </Text>
          {bar}
          <Text style={styles.blurb}>
            {hasYears ? summary(from as number, to as number, nowYear, stage) : partialBlurb}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.close} hitSlop={{ top: 8, bottom: 8, left: 16, right: 16 }}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, gap: 10 },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text },
  wineName: { fontFamily: fonts.bodyRegular, fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: -6 },
  status: { fontFamily: fonts.bodySemibold, fontSize: 17, color: colors.gold },
  statusYears: { fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  slider: { paddingTop: 30, marginTop: 4, gap: 4 },
  track: { height: 14, borderRadius: 7, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
  zone: { position: 'absolute', top: 0, bottom: 0 },
  young: { backgroundColor: 'rgba(212,146,58,0.45)' },
  declining: { backgroundColor: 'rgba(255,255,255,0.22)' },
  nowWrap: { position: 'absolute', top: 0, width: 90, marginLeft: -45, alignItems: 'center', zIndex: 2 },
  nowLabel: { fontFamily: fonts.bodySemibold, fontSize: 11.5, color: colors.text, backgroundColor: '#3E2120', borderWidth: 1, borderColor: colors.gold, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, overflow: 'hidden' },
  nowLine: { width: 4, height: 24, borderRadius: 2, backgroundColor: '#FFFFFF', marginTop: 2, borderWidth: 1, borderColor: '#3E2120' },
  ticks: { height: 18 },
  tick: { position: 'absolute', width: 40, marginLeft: -20, textAlign: 'center', fontFamily: fonts.bodyRegular, fontSize: 11.5, color: 'rgba(255,255,255,0.75)' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendSwatch: { width: 10, height: 10, borderRadius: 3 },
  legendText: { fontFamily: fonts.bodyRegular, fontSize: 11.5, color: 'rgba(255,255,255,0.75)' },
  blurb: { fontFamily: fonts.bodyRegular, fontSize: 14.5, lineHeight: 22, color: colors.text },
  close: { alignSelf: 'center', marginTop: 6 },
  closeText: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
});
