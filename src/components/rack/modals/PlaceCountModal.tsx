import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { colors, spacing } from '../../../constants/theme';
import { fonts } from '../../../constants/fonts';
import { sheet } from '../styles';

export type Orientation = 'Vertical' | 'Horizontal';

// A just-added wine is being placed: how many bottles, starting at the tapped
// slot, and (for more than one) which way they run.
export function PlaceCountModal({ visible, placing, onPlace, onClose }: {
  visible: boolean;
  placing: boolean;
  onPlace: (count: number, orientation: Orientation) => void;
  onClose: () => void;
}) {
  const [count, setCount] = useState('1');
  const [orientation, setOrientation] = useState<Orientation>('Vertical');
  useEffect(() => {
    if (visible) { setCount('1'); setOrientation('Vertical'); }
  }, [visible]);
  const n = Math.max(1, parseInt(count, 10) || 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => !placing && onClose()}>
      <KeyboardAvoidingView behavior="padding" style={sheet.overlay}>
        <View style={sheet.sheet}>
          <Text style={sheet.title}>How many bottles?</Text>
          <Text style={sheet.body}>Place your wine in the rack — one slot per bottle, starting at the tapped position.</Text>
          <TextInput
            style={sheet.input}
            value={count}
            onChangeText={(t) => setCount(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            maxLength={3}
            autoFocus
            selectTextOnFocus
          />
          {n > 1 && (
            <>
              <Text style={sheet.fieldLabel}>Orientation</Text>
              <View style={styles.row}>
                {(['Vertical', 'Horizontal'] as const).map((o) => (
                  <TouchableOpacity key={o} style={[styles.btn, orientation === o && styles.btnActive]} onPress={() => setOrientation(o)}>
                    <Text style={[styles.text, orientation === o && styles.textActive]}>{o}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={[sheet.confirmBtn, placing && sheet.busy]} onPress={() => onPlace(n, orientation)} disabled={placing}>
            <Text style={sheet.confirmText}>{placing ? 'Placing…' : 'Place in rack'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} disabled={placing} style={sheet.cancel}>
            <Text style={sheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  btn: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: spacing.sm, alignItems: 'center' },
  btnActive: { borderColor: colors.gold, backgroundColor: 'rgba(212,176,96,0.15)' },
  // Cormorant — option button text
  text: { fontSize: 14, fontFamily: fonts.headingSemibold, color: colors.textMuted },
  textActive: { color: colors.gold },
});
