import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQueries } from '@tanstack/react-query';
import { setActiveCellar, sharedCellarLabel } from '../api/cellarContext';
import { fetchCellarSummary } from '../api/cellarSummary';
import { useCellarContext } from '../hooks/useCellarContext';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Cellar tab: "Select A Cellar ⌄" with the cellar being viewed in gold beneath;
// the chevron opens the list — "Your Cellar · 4 Locations · 190 Wines", then
// each cellar shared with the user. Shown only to someone with a shared
// cellar; selecting one switches every cellar screen to it. Draws its own rule
// beneath, so the tab shows no extra line when there's nothing to choose.
export function CellarSwitcher() {
  const ctx = useCellarContext();
  const [open, setOpen] = useState(false);
  const options: { id: string | null; ownerId: string | null; label: string; viewOnly: boolean }[] = [
    { id: null, ownerId: ctx.userId, label: 'Your Cellar', viewOnly: false },
    ...ctx.shared.map((s) => ({ id: s.ownerId, ownerId: s.ownerId, label: sharedCellarLabel(s.ownerName), viewOnly: s.role === 'view' })),
  ];
  const summaries = useQueries({
    queries: options.map((o) => ({
      queryKey: ['cellar-summary', o.ownerId],
      queryFn: () => fetchCellarSummary(o.ownerId!),
      enabled: open && !!o.ownerId,
      staleTime: 60_000,
    })),
  });
  if (ctx.shared.length === 0) return null;
  const current = options.find((o) => (o.id ?? null) === (ctx.ownerId ?? null)) ?? options[0];
  const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <View>
      <View style={styles.wrap}>
        <TouchableOpacity
          style={styles.header}
          onPress={() => setOpen((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`Select A Cellar. Viewing ${current.label}`}
        >
          <Text style={styles.headerText}>Select A Cellar</Text>
          <Text style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
        </TouchableOpacity>
        {open ? (
          <View style={styles.list}>
            {options.map((o, i) => {
              const on = o === current;
              const s = summaries[i]?.data;
              return (
                <TouchableOpacity
                  key={o.id ?? 'mine'}
                  style={[styles.row, i === options.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => { if (!on) setActiveCellar(o.id); setOpen(false); }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tick, !on && { opacity: 0 }]}>✓</Text>
                  <Text style={[styles.rowText, on && styles.rowTextOn]} numberOfLines={1}>
                    <Text style={styles.rowName}>{o.label}</Text>
                    {s ? `  ·  ${plural(s.locations, 'Location')}  ·  ${plural(s.wines, 'Wine')}` : ''}
                  </Text>
                  {o.viewOnly ? <Text style={styles.viewOnly}>View only</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <Text style={styles.current} numberOfLines={1}>{current.label}</Text>
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' },
  headerText: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.text },
  chevron: { fontFamily: fonts.bodySemibold, fontSize: 20, color: colors.gold, marginTop: -4 },
  current: { fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold, marginTop: 4 },
  list: { marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  tick: { width: 16, fontFamily: fonts.bodySemibold, fontSize: 15, color: colors.gold },
  rowText: { flex: 1, fontFamily: fonts.bodyRegular, fontSize: 15, color: colors.text },
  rowTextOn: { color: colors.gold },
  rowName: { fontFamily: fonts.bodySemibold },
  viewOnly: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textSubtle },
  // Same rule as the Cellar tab's other dividers.
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: spacing.xl, marginVertical: 18 },
});
