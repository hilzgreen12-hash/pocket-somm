import { Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, spacing } from '../../../constants/theme';
import { fonts } from '../../../constants/fonts';

// An empty slot (or a set of them) was tapped: how should it be filled?
export function SlotChooserModal({ visible, slotCount, onScan, onPickFromCellar, onUpload, onManual, onClose }: {
  visible: boolean;
  slotCount: number;
  onScan: () => void;
  onPickFromCellar: () => void;
  onUpload: () => void;
  onManual: () => void;
  onClose: () => void;
}) {
  const choices: [string, () => void][] = [
    ['Scan a Label', onScan],
    ['Select from Cellar List', onPickFromCellar],
    ['Upload Screenshot', onUpload],
    ['Manual Input', onManual],
  ];
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{slotCount > 1 ? `Add a wine to ${slotCount} slots` : 'Add a wine to this slot'}</Text>
          {choices.map(([label, run]) => (
            <TouchableOpacity key={label} style={styles.btn} onPress={run} activeOpacity={0.8}>
              <Text style={styles.btnText}>{label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.cancel} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.background, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, width: '100%' },
  title: { fontFamily: fonts.headingBold, fontSize: 20, color: colors.text, textAlign: 'center', marginBottom: spacing.lg },
  btn: { borderWidth: 1, borderColor: colors.gold, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center', marginBottom: spacing.sm },
  btnText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancel: { alignItems: 'center', paddingTop: spacing.sm },
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
