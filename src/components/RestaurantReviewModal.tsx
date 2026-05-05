import { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { colors, spacing } from '../constants/theme';

interface Props {
  visible: boolean;
  sessionId: string;
  initialName?: string | null;
  initialNote?: string | null;
  onClose: () => void;
  onSaved: () => void;
}

export function RestaurantReviewModal({ visible, sessionId, initialName, initialNote, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(initialName ?? '');
  const [note, setNote] = useState(initialNote ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase
        .from('scan_sessions')
        .update({ restaurant_name: name.trim() || null, restaurant_note: note.trim() || null })
        .eq('id', sessionId);
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>Review this Restaurant</Text>

            <Text style={styles.fieldLabel}>Restaurant name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. The Ledbury"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Your review</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={note}
              onChangeText={setNote}
              placeholder="Food, service, atmosphere, wine list quality…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Review'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 40,
  },
  heading: {
    fontFamily: 'CormorantGaramond_700Bold',
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: 15,
    fontFamily: 'CormorantGaramond_400Regular',
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  noteInput: {
    minHeight: 110,
    marginBottom: spacing.lg,
  },
  saveButton: {
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 16,
    color: colors.gold,
  },
  cancelButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  cancelText: {
    fontFamily: 'CormorantGaramond_400Regular',
    fontSize: 14,
    color: colors.textMuted,
  },
});
