import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { colors, spacing } from '../../constants/theme';
import { fontsSpectral as fonts } from '../../constants/fonts';

export interface FilterSheetOption {
  value: string;
  label: string;
  indent?: boolean;
  header?: boolean;      // a group title, not a choice
  disabled?: boolean;    // a placeholder line, not a choice
  action?: boolean;      // does something (e.g. "+ New Location") rather than filter
  manageable?: boolean;  // long-press opens its management options
}

interface Props {
  visible: boolean;
  title: string;
  hint?: string;
  options: FilterSheetOption[];
  selected: string;
  onSelect: (value: string) => void;
  onLongPress?: (option: FilterSheetOption) => void;
  onClose: () => void;
}

// The pop-up list behind each filter chip on Your Cellar List. Picking an
// option closes it.
export function FilterSheet({ visible, title, hint, options, selected, onSelect, onLongPress, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}
          <ScrollView style={{ maxHeight: 400 }}>
            {options.map((opt) => {
              if (opt.header || opt.disabled) {
                return (
                  <View key={opt.value} style={[styles.option, opt.indent && styles.indent]}>
                    <Text style={[styles.optionText, opt.header && styles.headerText, opt.disabled && styles.disabledText]}>{opt.label}</Text>
                  </View>
                );
              }
              const active = selected === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, opt.indent && styles.indent, active && styles.optionActive]}
                  onPress={() => { onClose(); onSelect(opt.value); }}
                  onLongPress={opt.manageable && onLongPress ? () => { onClose(); onLongPress(opt); } : undefined}
                  delayLongPress={400}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, (active || opt.action) && styles.optionTextGold]}>{opt.label}</Text>
                  {active && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity style={styles.close} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.md },
  hint: { fontFamily: fonts.bodyItalic, fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: -spacing.sm, marginBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  indent: { paddingLeft: spacing.xl },
  optionActive: { backgroundColor: 'rgba(212,176,96,0.10)' },
  optionText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text },
  optionTextGold: { color: colors.gold },
  headerText: { fontFamily: fonts.headingBold, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 14, color: colors.gold },
  disabledText: { fontFamily: fonts.bodyItalic, fontSize: 14, color: colors.textMuted, textTransform: 'none', letterSpacing: 0 },
  check: { fontFamily: fonts.bodyBold, fontSize: 18, color: colors.gold, marginLeft: spacing.sm },
  close: { alignItems: 'center', paddingTop: spacing.md, paddingBottom: 4 },
  closeText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
