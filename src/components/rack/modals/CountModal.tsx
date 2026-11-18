import { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { colors } from '../../../constants/theme';
import { sheet } from '../styles';

export interface CountPrompt {
  title: string;
  body: string;
  // Upper bound for the count (and the pre-filled value when `initial` is unset).
  max: number;
  initial?: number;
  confirmText: (n: number) => string;
  onConfirm: (n: number) => void;
  // An optional second action, e.g. "Delete all 6".
  secondary?: { text: string; onPress: () => void };
}

// "How many bottles?" — the one number prompt behind every rack move, add and
// delete. The count is clamped to 1…max.
export function CountModal({ prompt, busy = false, onClose }: { prompt: CountPrompt | null; busy?: boolean; onClose: () => void }) {
  const [value, setValue] = useState('1');
  useEffect(() => {
    if (prompt) setValue(String(prompt.initial ?? prompt.max));
  }, [prompt]);
  const n = Math.max(1, Math.min(prompt?.max ?? 1, parseInt(value, 10) || 1));

  return (
    <Modal visible={!!prompt} transparent animationType="fade" onRequestClose={() => !busy && onClose()}>
      <KeyboardAvoidingView behavior="padding" style={sheet.overlay}>
        <View style={sheet.sheet}>
          <Text style={sheet.title}>{prompt?.title}</Text>
          <Text style={sheet.body}>{prompt?.body}</Text>
          <TextInput
            style={sheet.input}
            value={value}
            onChangeText={(t) => setValue(t.replace(/[^0-9]/g, '').slice(0, 3))}
            keyboardType="number-pad"
            placeholder="1"
            placeholderTextColor={colors.textMuted}
            maxLength={3}
            autoFocus
            selectTextOnFocus
          />
          <TouchableOpacity style={[sheet.confirmBtn, busy && sheet.busy]} onPress={() => prompt?.onConfirm(n)} disabled={busy} activeOpacity={0.85}>
            <Text style={sheet.confirmText}>{prompt?.confirmText(n)}</Text>
          </TouchableOpacity>
          {prompt?.secondary ? (
            <TouchableOpacity style={[sheet.secondaryBtn, busy && sheet.busy]} onPress={prompt.secondary.onPress} disabled={busy} activeOpacity={0.85}>
              <Text style={sheet.secondaryText}>{prompt.secondary.text}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={onClose} disabled={busy} style={sheet.cancel}>
            <Text style={sheet.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
