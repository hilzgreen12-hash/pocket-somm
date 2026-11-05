import { useSyncExternalStore } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getCellarContext, subscribeCellarContext, setActiveCellar } from '../api/cellarContext';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// Live cellar context for components (re-renders on switch / join / leave).
export function useCellarContext() {
  return useSyncExternalStore(subscribeCellarContext, getCellarContext, getCellarContext);
}

const possessive = (name: string | null) => {
  const n = (name ?? '').trim();
  if (!n) return 'Shared Cellar';
  const first = n.includes('@') ? n.split('@')[0] : n;
  return `${first}${/s$/i.test(first) ? "'" : "'s"} Cellar`;
};
export const sharedCellarLabel = possessive;

// "My Cellar | Hilary's Cellar" — only shown to someone who belongs to at least
// one shared cellar. Selecting one switches every cellar screen to it.
export function CellarSwitcher() {
  const ctx = useCellarContext();
  if (ctx.shared.length === 0) return null;
  const options: { id: string | null; label: string }[] = [
    { id: null, label: 'My Cellar' },
    ...ctx.shared.map((s) => ({ id: s.ownerId, label: possessive(s.ownerName) })),
  ];
  const active = ctx.shared.find((s) => s.ownerId === ctx.ownerId);
  return (
    <View style={styles.wrap}>
      <View style={styles.row} accessibilityRole="tablist">
        {options.map((o) => {
          const on = (o.id ?? null) === (ctx.ownerId ?? null);
          return (
            <TouchableOpacity
              key={o.id ?? 'mine'}
              style={[styles.seg, on && styles.segOn]}
              onPress={() => { if (!on) setActiveCellar(o.id); }}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              activeOpacity={0.7}
            >
              <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={1}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {active?.role === 'view' && <Text style={styles.note}>View only</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  seg: { flexGrow: 1, flexBasis: 0, minWidth: 110, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: spacing.sm, alignItems: 'center' },
  segOn: { borderColor: colors.gold },
  segText: { fontFamily: fonts.headingSemibold, fontSize: 15, color: colors.textMuted },
  segTextOn: { color: colors.gold },
  note: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 6 },
});
