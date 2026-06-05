import { useEffect, useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { router } from 'expo-router';
import { useChosenRecipes } from '../hooks/useChosenRecipes';
import { useAuth } from '../hooks/useAuth';
import { CityAutocomplete } from './CityAutocomplete';
import { colors, spacing } from '../constants/theme';
import { fonts } from '../constants/fonts';
import type { Pairing, WineDetailsComplete } from '../types/wine';

interface Props {
  pairing: Pairing | null;
  wine: WineDetailsComplete | null;
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function ChosenRecipeModal({ pairing, wine, visible, onClose, onSaved }: Props) {
  const { session } = useAuth();
  const { save } = useChosenRecipes();

  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [cookingNote, setCookingNote] = useState('');
  const [otherObservations, setOtherObservations] = useState('');
  const [userScore, setUserScore] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      setLocation('');
      setCity('');
      setCookingNote('');
      setOtherObservations('');
      setUserScore(null);
      setSaved(false);
    }
  }, [visible]);

  async function handleSave() {
    if (!pairing || !session) return;
    await save.mutateAsync({
      pairing,
      wine,
      cookedAtLocation: location,
      city,
      cookingNote,
      otherObservations,
      userScore,
    });
    setSaved(true);
    onSaved();
  }

  if (!pairing) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <KeyboardAwareScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" bottomOffset={24}>

            <Text style={styles.heading}>{pairing.dishName}</Text>
            {pairing.chefInspiration ? (
              <Text style={styles.chefInspiration}>Inspired by {pairing.chefInspiration}</Text>
            ) : null}

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Where did you make it?</Text>

            <Text style={styles.fieldLabel}>Home, restaurant, friend's place…</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g. Home, The Clove Club"
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.fieldLabel}>City</Text>
            <CityAutocomplete
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
              placeholderTextColor={colors.textMuted}
            />

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>Your cooking note (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={cookingNote}
              onChangeText={setCookingNote}
              placeholder="Flavours, technique, what worked, what you'd change…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Other observations (optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={otherObservations}
              onChangeText={setOtherObservations}
              placeholder="The pairing with the wine, occasion, who you cooked it for…"
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.sectionLabel}>Your score (optional)</Text>
            <TextInput
              style={[styles.input, styles.scoreInput]}
              value={userScore != null ? String(userScore) : ''}
              onChangeText={(text) => {
                if (text === '') { setUserScore(null); return; }
                const n = parseInt(text, 10);
                if (!isNaN(n)) setUserScore(Math.min(100, Math.max(1, n)));
              }}
              placeholder="e.g. 88"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={3}
            />
            <Text style={styles.scoreHint}>out of 100</Text>

            {saved ? (
              <View style={styles.savedRow}>
                <Text style={styles.savedText}>Saved — </Text>
                <TouchableOpacity onPress={() => { onClose(); router.push('/recipes/chosen'); }}>
                  <Text style={styles.savedLink}>View Recipe Reviews</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={save.isPending}
              >
                <Text style={styles.saveButtonText}>
                  {save.isPending ? 'Saving…' : 'Add to Your Recipe Reviews'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

          </KeyboardAwareScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '92%', borderTopWidth: 1, borderColor: colors.border },
  content: { padding: spacing.xl, paddingBottom: 40 },
  heading: { fontFamily: fonts.headingBold, fontSize: 26, color: colors.text, textAlign: 'center', letterSpacing: 0.5, marginBottom: spacing.xs },
  // Chef inspiration sub-line — italic body, Inter
  chefInspiration: { fontFamily: fonts.bodyItalic, fontSize: 15, color: colors.gold, textAlign: 'center', marginBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  sectionLabel: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.text, marginBottom: spacing.sm },
  // Field label — form label, Inter
  fieldLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  // Form input — Inter
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 15, fontFamily: fonts.bodyRegular, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm },
  noteInput: { minHeight: 80, marginBottom: spacing.md },
  scoreInput: { marginBottom: 4 },
  // Score hint — Inter italic
  scoreHint: { fontFamily: fonts.bodyItalic, fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
  savedRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.md, marginBottom: spacing.sm },
  // "Saved —" label paired with the View link below — Cormorant to match the link's button-like treatment
  savedText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  savedLink: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold, textDecorationLine: 'underline' },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 12, padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm },
  saveButtonText: { fontFamily: fonts.headingSemibold, fontSize: 16, color: colors.gold },
  cancelButton: { alignItems: 'center', padding: spacing.sm },
  // Cancel link in modal — Inter
  cancelText: { fontFamily: fonts.bodyRegular, fontSize: 14, color: colors.textMuted },
});
