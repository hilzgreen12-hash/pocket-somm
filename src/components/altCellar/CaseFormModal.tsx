import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { sheet } from './styles';
import { colors } from '../../constants/theme';

// Name and note for a case — creating one ("+ Add Case") or editing it.
export function CaseFormModal({ visible, title, saveText, initial, onSave, onClose }: {
  visible: boolean;
  title: string;
  saveText: string;
  initial?: { name: string; note: string | null };
  onSave: (name: string, note: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => {
    if (!visible) return;
    setName(initial?.name ?? '');
    setNote(initial?.note ?? '');
  }, [visible, initial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={sheet.overlay}>
        <KeyboardAwareScrollView contentContainerStyle={sheet.scroll} keyboardShouldPersistTaps="handled" bottomOffset={24}>
          <View style={sheet.sheet}>
            <Text style={sheet.title}>{title}</Text>
            <Text style={sheet.label}>Name</Text>
            <TextInput style={sheet.input} value={name} onChangeText={setName} placeholder="e.g. Rhône reds" placeholderTextColor={colors.textSubtle} maxLength={12} autoFocus={!initial} />
            <Text style={sheet.hint}>Up to 12 characters.</Text>
            <Text style={sheet.label}>Note</Text>
            <TextInput style={[sheet.input, sheet.noteInput]} value={note} onChangeText={setNote} placeholder="e.g. next to the Pétrus" placeholderTextColor={colors.textSubtle} maxLength={20} multiline />
            <Text style={sheet.hint}>Up to 20 characters.</Text>
            <TouchableOpacity style={sheet.save} onPress={() => onSave(name, note)} activeOpacity={0.85}>
              <Text style={sheet.saveText}>{saveText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={sheet.cancel} onPress={onClose}>
              <Text style={sheet.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </Modal>
  );
}
