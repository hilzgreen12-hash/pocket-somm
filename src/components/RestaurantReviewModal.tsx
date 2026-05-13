import { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Keyboard,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../api/supabase';
import { publishRestaurantSessionToCommunity } from '../services/communityPublish';
import { StarRating } from './StarRating';
import { colors, spacing } from '../constants/theme';

interface Props {
  visible: boolean;
  sessionId: string;
  initialName?: string | null;
  initialNote?: string | null;
  initialRatings?: { food: number | null; service: number | null; wineList: number | null; overall: number | null } | null;
  onClose: () => void;
  onSaved: () => void;
}

export function RestaurantReviewModal({ visible, sessionId, initialName, initialNote, initialRatings, onClose, onSaved }: Props) {
  const qc = useQueryClient();
  const [name, setName] = useState(initialName ?? '');
  const [note, setNote] = useState(initialNote ?? '');
  const [food, setFood] = useState<number | null>(initialRatings?.food ?? null);
  const [service, setService] = useState<number | null>(initialRatings?.service ?? null);
  const [wineList, setWineList] = useState<number | null>(initialRatings?.wineList ?? null);
  const [overall, setOverall] = useState<number | null>(initialRatings?.overall ?? null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    // Dismiss the keyboard explicitly — on iOS, tapping a button outside a
    // focused TextInput can cost the first tap to a keyboard dismiss,
    // requiring the user to tap Save twice.
    Keyboard.dismiss();
    setSaving(true);
    try {
      await supabase
        .from('scan_sessions')
        .update({
          restaurant_name: name.trim() || null,
          restaurant_note: note.trim() || null,
          rating_food: food,
          rating_service: service,
          rating_wine_list: wineList,
          rating_overall: overall,
        })
        .eq('id', sessionId);
      try {
        await publishRestaurantSessionToCommunity({
          id: sessionId,
          restaurant_name: name.trim() || null,
          restaurant_note: note.trim() || null,
          rating_food: food,
          rating_service: service,
          rating_wine_list: wineList,
          rating_overall: overall,
        });
      } catch (err) {
        console.warn('[community] publishRestaurantSessionToCommunity failed (non-fatal):', err);
      }
      qc.invalidateQueries({ queryKey: ['scan-archive'] });
      qc.invalidateQueries({ queryKey: ['my-community-uploads'] });
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
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="always">
            <Text style={styles.heading}>Review this Restaurant</Text>

            <Text style={styles.fieldLabel}>Restaurant name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. The Ledbury"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>Ratings</Text>
            <View style={styles.ratingsBlock}>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Food</Text>
                <StarRating value={food} onChange={setFood} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Service</Text>
                <StarRating value={service} onChange={setService} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Wine list</Text>
                <StarRating value={wineList} onChange={setWineList} />
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingLabel}>Overall</Text>
                <StarRating value={overall} onChange={setOverall} />
              </View>
            </View>

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
  ratingsBlock: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingLabel: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 15,
    color: colors.text,
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
