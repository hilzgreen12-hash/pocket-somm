import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { router } from 'expo-router';
import { usePreferences } from '../../src/hooks/usePreferences';
import { ChipPicker } from '../../src/components/preferences/ChipPicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../../src/constants/theme';

const REGIONAL_CUISINES = [
  'Italian', 'French', 'Spanish', 'Greek', 'Mediterranean',
  'Mexican', 'Tex-Mex', 'Cajun & Creole', 'American Comfort', 'Caribbean',
  'Brazilian', 'Argentinian', 'Chinese', 'Japanese', 'Korean',
  'Thai', 'Vietnamese', 'Indian', 'Middle Eastern', 'Moroccan',
];

const NUTRITIONAL_OPTIONS = ['Low Calorie', 'High Protein', 'Low Salt', 'High Fibre'];

export default function RecipeProfileScreen() {
  const { preferences, updatePreferences } = usePreferences();
  const [dietaryOpen, setDietaryOpen] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [regionalOpen, setRegionalOpen] = useState(false);
  const [nutritionalOpen, setNutritionalOpen] = useState(false);
  const [concernsDraft, setConcernsDraft] = useState(preferences?.specificConcerns ?? '');
  const [saved, setSaved] = useState(false);

  function toggle(setter: React.Dispatch<React.SetStateAction<boolean>>) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  }

  useEffect(() => {
    setConcernsDraft(preferences?.specificConcerns ?? '');
  }, [preferences?.specificConcerns]);

  function handleSave() {
    if (concernsDraft !== (preferences?.specificConcerns ?? '')) {
      updatePreferences({ specificConcerns: concernsDraft.trim() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>Back</Text>
        </TouchableOpacity>

        <View style={styles.profileIntro}>
          <Text style={styles.profileHeading}>Recipe Profile</Text>
          <Text style={styles.profileBody}>Tell us about your dietary needs so Vinster can tailor its recipe and pairing suggestions.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setDietaryOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Dietary Needs</Text>
          </TouchableOpacity>
          {!dietaryOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.dietaryNeeds ?? []).length > 0
                ? (preferences?.dietaryNeeds ?? []).join(', ')
                : 'None selected'}
            </Text>
          )}
          {dietaryOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={['Vegetarian', 'Vegan', 'Pescatarian']}
                selected={preferences?.dietaryNeeds ?? []}
                onChange={(v) => updatePreferences({ dietaryNeeds: v })}
                allOptionLabel="None"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setAllergyOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="options-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Allergy Risk</Text>
          </TouchableOpacity>
          {!allergyOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.allergyRisks ?? []).length > 0
                ? (preferences?.allergyRisks ?? []).join(', ')
                : 'None selected'}
            </Text>
          )}
          {allergyOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={['Nut Free', 'Dairy Free', 'Gluten Free']}
                selected={preferences?.allergyRisks ?? []}
                onChange={(v) => updatePreferences({ allergyRisks: v })}
                allOptionLabel="None"
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.questionRow}>
            <Ionicons name="alert-circle-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Specific Concerns</Text>
          </View>
          <Text style={styles.helperText}>Anything else Vinster must avoid (e.g. raw fish, very spicy food, soft food only). Treated as a hard rule.</Text>
          <TextInput
            style={styles.concernsInput}
            value={concernsDraft}
            onChangeText={setConcernsDraft}
            placeholder="Type any specific concerns…"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.softDivider}>
          <Text style={styles.softHeading}>Soft Preferences</Text>
          <Text style={styles.softSubheading}>Vinster will lean toward these but not enforce them strictly.</Text>
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setRegionalOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="globe-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Regional Preferences</Text>
          </TouchableOpacity>
          {!regionalOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.regionalPreferences ?? []).length > 0
                ? (preferences?.regionalPreferences ?? []).join(', ')
                : 'None selected'}
            </Text>
          )}
          {regionalOpen && (
            <View style={styles.pickerWrap}>
              <Text style={styles.helperText}>Pick up to 5 cuisines you enjoy.</Text>
              <ChipPicker
                options={REGIONAL_CUISINES}
                selected={preferences?.regionalPreferences ?? []}
                onChange={(v) => updatePreferences({ regionalPreferences: v })}
                max={5}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <TouchableOpacity onPress={() => toggle(setNutritionalOpen)} activeOpacity={0.7} style={styles.questionRow}>
            <Ionicons name="leaf-outline" size={16} color="rgba(255,255,255,0.45)" />
            <Text style={styles.question}>Nutritional Preferences</Text>
          </TouchableOpacity>
          {!nutritionalOpen && (
            <Text style={styles.selectionSummary}>
              {(preferences?.nutritionalPreferences ?? []).length > 0
                ? (preferences?.nutritionalPreferences ?? []).join(', ')
                : 'None selected'}
            </Text>
          )}
          {nutritionalOpen && (
            <View style={styles.pickerWrap}>
              <ChipPicker
                options={NUTRITIONAL_OPTIONS}
                selected={preferences?.nutritionalPreferences ?? []}
                onChange={(v) => updatePreferences({ nutritionalPreferences: v })}
              />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Recipe Profile</Text>
        </TouchableOpacity>
        {saved && <Text style={styles.savedMessage}>Your profile has been saved</Text>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.md },
  backRow: { paddingTop: 70, paddingBottom: spacing.md },
  back: { fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.textMuted },
  profileIntro: { marginBottom: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  profileHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 42, color: colors.text, letterSpacing: 1.5, marginBottom: spacing.sm, textAlign: 'center' },
  profileBody: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 18, color: colors.textMuted, lineHeight: 26, textAlign: 'center' },
  section: { marginBottom: spacing.md },
  questionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  question: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 20, color: colors.text },
  selectionSummary: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.40)', marginBottom: spacing.sm },
  pickerWrap: { marginTop: spacing.sm },
  saveButton: { borderWidth: 1, borderColor: colors.gold, borderRadius: 14, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.lg },
  saveButtonText: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 16, color: colors.gold },
  savedMessage: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 14, color: colors.gold, textAlign: 'center', marginBottom: spacing.lg },
  helperText: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm, lineHeight: 18 },
  concernsInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, padding: spacing.md, fontSize: 16, fontFamily: 'CormorantGaramond_400Regular', color: colors.text, backgroundColor: colors.surface, minHeight: 80, textAlignVertical: 'top' },
  softDivider: { paddingVertical: spacing.md, marginTop: spacing.sm, marginBottom: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  softHeading: { fontFamily: 'CormorantGaramond_600SemiBold', fontSize: 18, color: colors.gold, letterSpacing: 1, textTransform: 'uppercase' },
  softSubheading: { fontFamily: 'CormorantGaramond_400Regular_Italic', fontSize: 13, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
});
