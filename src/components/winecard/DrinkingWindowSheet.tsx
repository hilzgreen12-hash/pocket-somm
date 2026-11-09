import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { deriveMaturityStatus } from '../../utils/maturity';
import { colors, spacing } from '../../constants/theme';
import { fonts } from '../../constants/fonts';

// Tap "Window" on a wine card / Wine Intel → where the wine sits in its drinking
// window: a timeline with too-young, approaching (the 2 years before it opens),
// the window itself and declining, plus a "Now" marker. Bands follow the same
// rules as the Too Young / Approaching / Peak Now / Declining labels.
type Props = {
  visible: boolean;
  onClose: () => void;
  wineName: string;
  from: number | null | undefined;
  to: number | null | undefined;
  // Stored status, used only when there are no window years.
  fallbackStatus?: string | null;
};

const LABEL: Record<string, string> = {
  too_young: 'Too Young', approaching: 'Approaching', peak: 'Peak Now', declining: 'Declining', unknown: 'Unknown',
};
const APPROACHING_YEARS = 2;
const yrs = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`;

function summary(from: number, to: number, now: number, status: string): string {
  if (status === 'peak') {
    const into = now - from;
    const left = to - now;
    const lead = into <= 0 ? 'In its first year' : `${yrs(into)} into`;
    return `${lead} a ${to - from}-year window. Drink now, or keep it until ${to}${left > 0 ? ` (${yrs(left)} more)` : ''}.`;
  }
  if (status === 'too_young' || status === 'approaching') {
    return `Opens in ${yrs(from - now)}, in ${from}. Best kept until then; it should drink well until ${to}.`;
  }
  return `Past the close of its window by ${yrs(now - to)} (${to}). Drink soon if it's still sound.`;
}

export function DrinkingWindowSheet({ visible, onClose, wineName, from, to, fallbackStatus }: Props) {
  const now = new Date().getFullYear();
  const hasYears = typeof from === 'number' && typeof to === 'number' && Number.isFinite(from) && Number.isFinite(to) && to >= from;
  const status = hasYears ? deriveMaturityStatus(from, to, now) : (fallbackStatus ?? 'unknown');

  let bar: React.ReactNode = null;
  if (hasYears) {
    const f = from as number;
    const t = to as number;
    const start = Math.min(f - 4, now - 1);
    const end = Math.max(t + 3, now + 1);
    const pct = (y: number) => `${((y - start) / (end - start)) * 100}%` as const;
    const width = (a: number, b: number) => `${((b - a) / (end - start)) * 100}%` as const;
    const ap = Math.max(start, f - APPROACHING_YEARS);
    bar = (
      <View style={styles.slider}>
        <View style={[styles.nowWrap, { left: pct(now) }]} pointerEvents="none">
          <Text style={styles.nowLabel} allowFontScaling={false}>Now · {now}</Text>
          <View style={styles.nowLine} />
        </View>
        <View style={styles.track}>
          {ap > start ? <View style={[styles.zone, styles.young, { left: pct(start), width: width(start, ap) }]} /> : null}
          {f > ap ? <View style={[styles.zone, styles.approaching, { left: pct(ap), width: width(ap, f) }]} /> : null}
          <View style={[styles.zone, styles.window, { left: pct(f), width: width(f, t) }]} />
          <View style={[styles.zone, styles.declining, { left: pct(t), width: width(t, end) }]} />
        </View>
        <View style={styles.ticks}>
          <Text style={[styles.tick, { left: pct(f) }]} allowFontScaling={false}>{f}</Text>
          {t !== f ? <Text style={[styles.tick, { left: pct(t) }]} allowFontScaling={false}>{t}</Text> : null}
        </View>
        <View style={styles.legend}>
          {[['Too young', styles.young], ['Approaching', styles.approaching], ['Drinking window', styles.window], ['Declining', styles.declining]].map(([l, s]) => (
            <View key={l as string} style={styles.legendItem}><View style={[styles.legendSwatch, s as object]} /><Text style={styles.legendText}>{l as string}</Text></View>
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
            {LABEL[status] ?? LABEL.unknown}
            {hasYears ? <Text style={styles.statusYears}> · {from}–{to}</Text> : null}
          </Text>
          {bar}
          <Text style={styles.blurb}>
            {hasYears ? summary(from as number, to as number, now, status) : "Vinster doesn't have drinking-window years for this wine yet."}
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
  approaching: { backgroundColor: 'rgba(224,184,74,0.55)' },
  window: { backgroundColor: colors.gold },
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
