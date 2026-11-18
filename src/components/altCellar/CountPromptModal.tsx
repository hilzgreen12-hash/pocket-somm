import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { sheet } from './styles';
import { colors, spacing } from '../../constants/theme';

// "How many?" — a number of bottles from 1 to `max`, for deleting or moving
// some of a wine's bottles. `all` adds a one-tap button for every bottle.
export function CountPromptModal({ visible, title, body, max, initial, confirmText, all, onConfirm, onClose }: {
  visible: boolean;
  title: string;
  body: string;
  max: number;
  initial: number;
  confirmText: string;
  all?: string;
  onConfirm: (n: number) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState('');
  useEffect(() => { if (visible) setValue(String(initial)); }, [visible, initial]);
  const confirm = (n: number) => onConfirm(Math.max(1, Math.min(max, n)));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sheet.overlay}>
        <View style={[sheet.sheet, { marginHorizontal: spacing.xl }]}>
          <Text style={sheet.title}>{title}</Text>
          <Text style={[sheet.hint, { textAlign: 'center' }]}>{body}</Text>
          <TextInput
            style={sheet.input}
            value={value}
            onChangeText={(t) => setValue(t.replace(/[^0-9]/g, '').slice(0, 4))}
            keyboardType="number-pad"
            placeholder="Number of bottles"
            placeholderTextColor={colors.textSubtle}
            autoFocus
            selectTextOnFocus
          />
          <TouchableOpacity style={sheet.save} onPress={() => { const n = parseInt(value, 10); if (n > 0) confirm(n); }} activeOpacity={0.85}>
            <Text style={sheet.saveText}>{confirmText}</Text>
          </TouchableOpacity>
          {all ? (
            <TouchableOpacity style={sheet.save} onPress={() => confirm(max)} activeOpacity={0.85}>
              <Text style={sheet.saveText}>{all}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity style={sheet.cancel} onPress={onClose}>
            <Text style={sheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
