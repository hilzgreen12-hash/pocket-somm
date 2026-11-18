import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { setActiveCellar, sharedCellarLabel } from '../api/cellarContext';
import { useCellarContext } from '../hooks/useCellarContext';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';

// "Adding to: Sam's Cellar · Switch to My Cellar" on the Add form, so a bottle
// never lands in a shared cellar unnoticed. Only shown to someone who belongs
// to a shared cellar. A view-only member is told here, as the form opens.
// `fixed`: the destination already belongs to this cellar (one of its storage
// locations), so no switch is offered. `onSwitch` lets the form drop choices
// that belonged to the cellar it was showing.
export function AddingToCellarLine({ fixed = false, onSwitch }: { fixed?: boolean; onSwitch?: () => void }) {
  const ctx = useCellarContext();
  if (ctx.shared.length === 0) return null;
  const name = ctx.ownerId ? sharedCellarLabel(ctx.ownerName) : 'My Cellar';
  const canSwitch = !!ctx.ownerId && !fixed;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.text}>Adding to: <Text style={styles.name}>{name}</Text></Text>
        {canSwitch ? (
          <TouchableOpacity onPress={() => { setActiveCellar(null); onSwitch?.(); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
            <Text style={styles.link}>Switch to My Cellar</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {ctx.role === 'view' ? (
        <Text style={styles.note}>
          {`You have view-only access to ${name}, so wines can't be added to it.${canSwitch ? ' Switch to My Cellar to add this one.' : ''}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', justifyContent: 'space-between', gap: spacing.sm },
  text: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
  name: { fontFamily: fonts.bodySemibold, color: colors.text },
  link: { fontFamily: fonts.bodySemibold, fontSize: 14, color: colors.gold, textDecorationLine: 'underline' },
  note: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.gold, marginTop: spacing.xs, lineHeight: 18 },
});
